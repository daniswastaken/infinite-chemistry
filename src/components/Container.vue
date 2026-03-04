<script lang="ts" setup>
import {useDrop} from 'vue3-dnd'
import type {XYCoord} from 'vue3-dnd'
import {ItemTypes} from './ItemTypes'
import Box from './Box.vue'
import type {DragItem} from './interfaces'
import {reactive, ref, onMounted, computed, onUnmounted} from 'vue'
import ItemCard from "@/components/ItemCard.vue";
import AvailableResources from "@/components/AvailableResources.vue";
import CustomDragLayer from "@/components/CustomDragLayer.vue";
import {useBoxesStore} from "@/stores/useBoxesStore";
import {useResourcesStore} from "@/stores/useResourcesStore";
import {useRreStore} from "@/stores/useRreStore";
import {storeToRefs} from "pinia";
import {attemptBond, attemptAtomicBond} from "@/utils/chemistryEngine";
import {playSound} from "@/utils/audio";

const store = useBoxesStore()
const { boxes, selectedIds } = storeToRefs(store)
const { setSelectedIds, clearSelection, clearBoxes, removeSelected } = store

const rreStore = useRreStore()

const resourcesStore = useResourcesStore()
const { resources, searchTerm } = storeToRefs(resourcesStore)
const { addResource, clearSearch } = resourcesStore

// Collision detection helper
function getOverlappingBox(left: number, top: number, excludeId?: string) {
  // Use actual DOM measurements if available, otherwise fallback
  const fallbackWidth = 120
  const fallbackHeight = 45
  
  // Try to find the dragging element to get its actual size
  // Note: For sidebar items, item.id is null, so we use fallbacks
  const dragEl = excludeId ? document.getElementById(excludeId) : null
  const dWidth = dragEl?.offsetWidth || fallbackWidth
  const dHeight = dragEl?.offsetHeight || fallbackHeight

  const dragRect = {
    left,
    top,
    right: left + dWidth,
    bottom: top + dHeight
  }

  for (const id in boxes.value) {
    if (id === excludeId) continue
    const box = (boxes.value as any)[id]
    
    // Get actual target dimensions
    const targetEl = document.getElementById(id)
    const tWidth = targetEl?.offsetWidth || fallbackWidth
    const tHeight = targetEl?.offsetHeight || fallbackHeight

    const targetRect = {
      left: box.left,
      top: box.top,
      right: box.left + tWidth,
      bottom: box.top + tHeight
    }

    // Check for overlap
    const isOverlapping = !(
      dragRect.left > targetRect.right ||
      dragRect.right < targetRect.left ||
      dragRect.top > targetRect.bottom ||
      dragRect.bottom < targetRect.top
    )

    if (isOverlapping) return { id, ...box }
  }
  return null
}

const isConfirming = ref(false)
const isSelecting = ref(false)
const overlappingId = ref<string | null>(null)
const selectionStart = ref({ x: 0, y: 0 })
const selectionEnd = ref({ x: 0, y: 0 })

const selectionRect = computed(() => {
  if (!isSelecting.value) return null
  const x = Math.min(selectionStart.value.x, selectionEnd.value.x)
  const y = Math.min(selectionStart.value.y, selectionEnd.value.y)
  const width = Math.abs(selectionStart.value.x - selectionEnd.value.x)
  const height = Math.abs(selectionStart.value.y - selectionEnd.value.y)
  return { x, y, width, height }
})

const startSelection = (e: MouseEvent) => {
  // Only left click
  if (e.button !== 0) return

  const target = e.target as HTMLElement
  // Don't start if clicking on a box or a button/sidebar item
  if (target.closest('[role="Box"]') || target.closest('button') || target.closest('input')) return
  
  // Also check if we're clicking inside the sidebar area
  const containerCoords = containerElement.value?.getBoundingClientRect()
  if (!containerCoords) return
  
  // If clicking on the right side where sidebar is, ignore
  if (e.clientX > window.innerWidth - sidebarWidth.value) return

  // Blur any active inputs so keyboard shortcuts work
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  
  // Focus the container so it definitely hears the keyboard
  (e.currentTarget as HTMLElement).focus()

  isSelecting.value = true
  selectionStart.value = { 
    x: e.clientX - containerCoords.left, 
    y: e.clientY - containerCoords.top 
  }
  selectionEnd.value = { ...selectionStart.value }
  
  if (!e.shiftKey) {
    clearSelection()
  }
}

const updateSelection = (e: MouseEvent) => {
  if (!isSelecting.value || !containerElement.value) return
  
  const containerCoords = containerElement.value.getBoundingClientRect()
  selectionEnd.value = { 
    x: e.clientX - containerCoords.left, 
    y: e.clientY - containerCoords.top 
  }
  
  const rect = selectionRect.value
  if (!rect) return
  
  const selected: string[] = []
  const boxesVal = boxes.value
  const fallbackWidth = 120
  const fallbackHeight = 45

  for (const id in boxesVal) {
    const box = (boxesVal as any)[id]
    
    // Get actual dimensions for marquee accuracy
    const el = document.getElementById(id)
    const w = el?.offsetWidth || fallbackWidth
    const h = el?.offsetHeight || fallbackHeight
    
    const boxRect = {
      left: box.left,
      top: box.top,
      right: box.left + w,
      bottom: box.top + h
    }
    
    const marqueeRect = {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    }
    
    if (!(marqueeRect.left > boxRect.right || 
          marqueeRect.right < boxRect.left || 
          marqueeRect.top > boxRect.bottom || 
          marqueeRect.bottom < boxRect.top)) {
      selected.push(id)
    }
  }
  setSelectedIds(selected)
}

const finishSelection = () => {
  isSelecting.value = false
}

const handleClearClick = () => {
  if (Object.keys(boxes.value).length > 0) {
    isConfirming.value = true
  }
}

const confirmClear = () => {
  clearBoxes()
  isConfirming.value = false
}

const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth <= 768
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
  })
})

const sidebarWidth = ref(350)
const isResizing = ref(false)

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  e.preventDefault()
  e.stopPropagation() // Prevent selection from starting
  window.addEventListener('mousemove', doResize)
  window.addEventListener('mouseup', stopResize)
}

const doResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const newWidth = window.innerWidth - e.clientX
  if (newWidth >= 300 && newWidth <= 600) {
    sidebarWidth.value = newWidth
  }
}

const stopResize = () => {
  isResizing.value = false
  window.removeEventListener('mousemove', doResize)
  window.removeEventListener('mouseup', stopResize)
}

const containerElement = ref<HTMLElement | null>(null)

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

  if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    store.undo()
    return
  }

  if (e.key === 'Backspace' || e.key === 'Delete') {
    e.preventDefault()
    removeSelected()
    return
  }

  if (e.key === 'Tab') {
    e.preventDefault()
    if (searchTerm.value) {
      clearSearch()
      playSound('click', 0.3, 1.0)
    }
  }
}

onMounted(() => {
  if ((window as any).particlesJS) {
    (window as any).particlesJS.load('particles-js', `${import.meta.env.BASE_URL}particles.js/particles.json`);
  }
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const [collect, drop] = useDrop(() => ({
  accept: ItemTypes.BOX,
  hover(item: DragItem, monitor) {
    const offset = monitor.getSourceClientOffset() as XYCoord
    if (offset && containerElement.value) {
      const containerCoords = containerElement.value.getBoundingClientRect()
      const left = Math.round(offset.x - containerCoords.left)
      const top = Math.round(offset.y - containerCoords.top)

      const overlapping = getOverlappingBox(left, top, item.id)
      overlappingId.value = overlapping?.id || null
    } else {
      overlappingId.value = null
    }
  },
  drop(item: DragItem, monitor) {
    overlappingId.value = null
    const offset = monitor.getSourceClientOffset() as XYCoord
    if (offset && containerElement.value) {
      const containerCoords = containerElement.value.getBoundingClientRect()
      const left = Math.round(offset.x - containerCoords.left)
      const top = Math.round(offset.y - containerCoords.top)

      // Collision Bonding Logic
      const overlapping = getOverlappingBox(left, top, item.id)
      
      if (overlapping) {
        const targetAtomicId = overlapping.atomicId ?? null
        const targetSym = overlapping.symbol ?? null
        const targetComps = overlapping.components ?? (targetSym ? { [targetSym]: 1 } : {})

        const itemBox = item.id ? store.boxes[item.id] : null
        const itemAtomicId = itemBox?.atomicId ?? item.atomicId ?? null
        const itemSym = itemBox?.symbol ?? item.symbol ?? null
        const itemComps = item.components ?? itemBox?.components ?? (itemSym ? { [itemSym]: 1 } : {})

        const eitherIsAtomic = !!targetAtomicId || !!itemAtomicId

        if (eitherIsAtomic) {
          // ── Atomic bonding path ──
          const result = attemptAtomicBond(
            targetAtomicId,
            targetSym,
            itemAtomicId,
            itemSym
          )

          if (result.success && result.newCompound) {
            store.saveHistory()
            if (item.id) store.removeBox(item.id, false, true)
            store.removeBox(overlapping.id, false, true)

            const newId = store.addBox({
              title: result.newCompound.name,
              symbol: undefined,
              icon: result.newCompound.icon,
              formula: result.newCompound.formula,
              components: result.newCompound.components,
              current_occupied_slots: result.newCompound.current_occupied_slots,
              left: overlapping.left,
              top: overlapping.top,
              atomicId: result.newCompound.atomicId,
              isNew: true
            }, false)

            const isNewDiscovery = !resources.value.find((r) => r.formula === result.newCompound!.formula)
            if (isNewDiscovery) {
              addResource({
                title: result.newCompound!.name,
                icon: result.newCompound!.icon,
                formula: result.newCompound!.formula,
                components: result.newCompound!.components,
                atomicId: result.newCompound!.atomicId,
                type: 'Ion'
              })
              store.triggerSuccessAnimation(newId)
            }
            rreStore.checkWinCondition(result.newCompound!)
            playSound('fusion')
            return
          } else if (!result.success && store.isAtomicModeActive) {
            // FALLBACK: If ionic bonding failed but we are in Experiment Mode,
            // try standard bonding logic to allow for atomic evolution (e.g., SO3 + O -> SO4)
            const fallbackResult = attemptBond(targetComps, itemComps, true)
            
            if (fallbackResult.success && fallbackResult.newCompound) {
              store.saveHistory()
              if (item.id) store.removeBox(item.id, false, true)
              store.removeBox(overlapping.id, false, true)

              const newId = store.addBox({
                title: fallbackResult.newCompound.name,
                symbol: undefined,
                icon: fallbackResult.newCompound.icon,
                formula: fallbackResult.newCompound.formula,
                components: fallbackResult.newCompound.components,
                current_occupied_slots: fallbackResult.newCompound.current_occupied_slots,
                left: overlapping.left,
                top: overlapping.top,
                atomicId: fallbackResult.newCompound.atomicId,
                isNew: true
              }, false)

              const isNewDiscovery = !resources.value.find((r) => r.formula === fallbackResult.newCompound!.formula)
              if (isNewDiscovery) {
                addResource({
                  title: fallbackResult.newCompound!.name,
                  icon: fallbackResult.newCompound!.icon,
                  formula: fallbackResult.newCompound!.formula,
                  components: fallbackResult.newCompound!.components,
                  atomicId: fallbackResult.newCompound!.atomicId,
                  type: 'Ion'
                })
                store.triggerSuccessAnimation(newId)
              }
              rreStore.checkWinCondition(fallbackResult.newCompound!)
              playSound('fusion')
              return
            }
            
            store.triggerRejectAnimation(overlapping.id)
            playSound('failed')
          } else if (!result.success) {
            store.triggerRejectAnimation(overlapping.id)
            playSound('failed')
          }

        } else if (Object.keys(targetComps).length > 0 && Object.keys(itemComps).length > 0) {
          // ── Standard element bonding path ──
          const result = attemptBond(targetComps, itemComps, store.isAtomicModeActive)

          if (result.success && result.newCompound) {
            store.saveHistory()
            if (item.id) store.removeBox(item.id, false, true)
            store.removeBox(overlapping.id, false, true)

            const newId = store.addBox({
              title: result.newCompound.name,
              symbol: undefined,
              icon: result.newCompound.icon,
              formula: result.newCompound.formula,
              components: result.newCompound.components,
              current_occupied_slots: result.newCompound.current_occupied_slots,
              left: overlapping.left,
              top: overlapping.top,
              atomicId: result.newCompound.atomicId,
              isNew: true
            }, false)

            const isNewDiscovery = !resources.value.find((r) => r.formula === result.newCompound!.formula)

            if (isNewDiscovery && result.newCompound!.bondType !== 'pre-bond-cluster') {
              addResource({
                title: result.newCompound!.name,
                icon: result.newCompound!.icon,
                formula: result.newCompound!.formula,
                components: result.newCompound!.components,
                atomicId: result.newCompound!.atomicId,
                type: (result.newCompound!.bondType === 'ionic' || result.newCompound!.bondType === 'ionic-atomic') ? 'Ion' : 'Kovalen'
              })
              store.triggerSuccessAnimation(newId)
            }
            rreStore.checkWinCondition(result.newCompound!)
            playSound('fusion')
            return
          } else if (!result.success) {
            store.triggerRejectAnimation(overlapping.id)
            playSound('failed')
          }
        }
      } // end if (overlapping)

      if (item.id) {
        store.moveBox(item.id, left, top)
      } else {
        store.moveBox(null, left, top, item.title, item.emoji, item.symbol, item.icon, item.formula, item.components, item.atomicId)
      }
    }
    return undefined
  },
}))

// Ghost entries used to animate a box deletion above the sidebar z-index
interface GhostEntry {
  id: string
  fixedLeft: number
  fixedTop: number
  title: string
  formula?: string
  emoji?: string
  symbol?: string
  icon?: string
  animating: boolean
}
const deletingBoxGhosts = ref<GhostEntry[]>([])

const ANIM_DURATION_MS = 150

function removeBoxWithAnimation(id: string, dropPosition?: { x: number, y: number }) {
  const box = (store.boxes as any)[id]
  if (!box) return

  // Get the real DOM element of the box to find its screen position
  const el = document.getElementById(id)
  let fixedLeft = box.left
  let fixedTop = box.top

  // If we have an explicit drop position from the monitor, use that.
  // Otherwise fall back to the element's current DOM position.
  if (dropPosition) {
    fixedLeft = dropPosition.x
    fixedTop = dropPosition.y
  } else if (el) {
    const rect = el.getBoundingClientRect()
    fixedLeft = rect.left
    fixedTop = rect.top
  } else if (containerElement.value) {
    // Fallback: offset by canvas container's position
    const containerRect = containerElement.value.getBoundingClientRect()
    fixedLeft = containerRect.left + box.left
    fixedTop = containerRect.top + box.top
  }

  // Push a ghost entry to render in the Teleport overlay
  const ghost: GhostEntry = {
    id,
    fixedLeft,
    fixedTop,
    title: box.title,
    formula: box.formula,
    emoji: box.emoji,
    symbol: box.symbol,
    icon: box.icon,
    animating: false
  }
  deletingBoxGhosts.value.push(ghost)

  // Immediately remove the real box (it vanishes from canvas)
  store.removeBox(id, true, true) // shouldSaveHistory=true, silent=true (no sound yet)
  playSound('delete')

  // On next frame, set animating=true to trigger the CSS transition.
  // Double rAF: first rAF = Vue renders ghost in DOM (scale:1),
  // second rAF = browser paints it, THEN we flip to scale:0 so the transition fires.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const g = deletingBoxGhosts.value.find(g => g.id === id)
      if (g) g.animating = true
    })
  })

  // Remove ghost after animation plays out
  setTimeout(() => {
    deletingBoxGhosts.value = deletingBoxGhosts.value.filter(g => g.id !== id)
  }, ANIM_DURATION_MS + 50)
}

const [collectSidebar, dropSidebar] = useDrop(() => ({
  accept: ItemTypes.BOX,
  drop(item: DragItem, monitor) {
    if (item.id) {
      // getSourceClientOffset gives the top-left of the dragged element at the drop point
      const sourceOffset = monitor.getSourceClientOffset()
      const dropPosition = sourceOffset ? { x: sourceOffset.x, y: sourceOffset.y } : undefined
      removeBoxWithAnimation(item.id, dropPosition)
    }
    return undefined
  },
  collect: (monitor) => ({
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop() && monitor.getItem()?.id // Only show feedback if it's a canvas item
  })
}))
</script>

<template>
  <div 
    ref="containerElement" 
    class="mobile-root w-full h-full relative outline-none"
    tabindex="0"
    @mousedown="startSelection"
    @mousemove="updateSelection"
    @mouseup="finishSelection"
    @mouseleave="finishSelection"
  >
    <!-- Atomic Mode Glow Overlay (Screen edges) -->
    <div 
      class="absolute inset-0 pointer-events-none transition-opacity duration-700 z-[5] overflow-hidden"
      :class="store.isAtomicModeActive ? 'opacity-100' : 'opacity-0'"
      :style="{ 
        right: !isMobile ? `${sidebarWidth}px` : '0',
        bottom: isMobile ? '35dvh' : '0'
      }"
    >
      <div class="absolute inset-0 shadow-[inset_0_0_80px_rgba(59,130,246,0.35)] animate-glow-pulse"></div>
      <div class="absolute inset-0 border-[3px] border-blue-400/10 blur-[1px]"></div>
    </div>

    <!-- Canvas Area -->
    <div class="mobile-canvas-area">
      <div id="particles-js" class="absolute inset-0 z-0 pointer-events-none"></div>
      <CustomDragLayer />

      <div :ref="drop" class="container">
        <TransitionGroup name="box-list">
          <Box
              v-for="(value, key) in boxes"
              @contextmenu.prevent="store.removeBox(String(key))"
              :id="String(key)"
              :key="String(key)"
              :left="value.left"
              :top="value.top"
              :loading="value.loading"
              :title="value.title"
              :formula="value.formula"
              :emoji="value.emoji"
              :symbol="value.symbol"
              :icon="value.icon"
              :selected="selectedIds.includes(String(key))"
              :zIndex="value.zIndex"
              :components="value.components"
              :atomicId="value.atomicId"
              :class="{ 'is-new': value.isNew }"
          >
            <ItemCard 
              size="small" 
              :id="String(key)" 
              :title="value.title" 
              :formula="value.formula"
              :emoji="value.emoji" 
              :symbol="value.symbol" 
              :icon="value.icon"
              :selected="selectedIds.includes(String(key))"
              :isHovered="overlappingId === String(key)"
              :isRejected="store.rejectedBoxId === String(key)"
              :isSuccess="store.successBoxId === String(key)"
              :atomicId="value.atomicId"
              :components="value.components"
            />
          </Box>
        </TransitionGroup>
        
        <!-- Selection Rectangle -->
        <div 
          v-if="isSelecting && selectionRect" 
          class="absolute border border-blue-500 bg-blue-500/10 pointer-events-none z-[50] rounded-sm"
          :style="{
            left: `${selectionRect.x}px`,
            top: `${selectionRect.y}px`,
            width: `${selectionRect.width}px`,
            height: `${selectionRect.height}px`
          }"
        ></div>
      </div>

      <!-- Background branding like Infinite Craft -->
      <div class="mobile-logo absolute top-[15px] left-[15px] z-0 pointer-events-none opacity-80">
        <img src="@/assets/icons/infinite-chemistry-logo.svg" class="w-[150px]" alt="Infinite Chemistry Logo" />
      </div>

      <!-- RRE Target Info Overlay -->
      <Transition name="fade" mode="out-in">
        <!-- Target Active -->
        <div v-if="rreStore.isActive && rreStore.targetCompound" :key="'target'" class="absolute top-[15px] right-[15px] z-[50] pointer-events-none">
          <div class="bg-white rounded-[5px] shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-[#c8c8c8] px-5 py-4 min-w-[210px] flex flex-col items-center gap-2" :style="{ marginRight: `${sidebarWidth}px` }">
            <div class="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6b66fa]">Mode Tantangan</div>
            <div class="text-[34px] leading-none font-black text-[#1d2331] font-outfit" v-html="rreStore.targetCompound.formula"></div>
            <div class="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-[5px] text-[13px] font-semibold transition-colors" :class="rreStore.timeLeft <= 10 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#f4f4fa] text-[#6b66fa] border border-[#e5e5f5]'">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ rreStore.timeLeft }} detik
            </div>
          </div>
        </div>

        <!-- Success Notification -->
        <div v-else-if="rreStore.showSuccessPopup" :key="'success'" class="absolute top-[15px] right-[15px] z-[50] pointer-events-none">
          <div class="bg-white rounded-[5px] shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-green-200 p-4 min-w-[210px] flex flex-col items-center gap-2 justify-center" :style="{ marginRight: `${sidebarWidth}px`, minHeight: '136px' }">
            <div class="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500 border border-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 class="text-[13px] font-bold text-slate-800 uppercase tracking-widest mt-1">Berhasil!</h3>
          </div>
        </div>

        <!-- Fail Notification -->
        <div v-else-if="rreStore.showFailPopup" :key="'fail'" class="absolute top-[15px] right-[15px] z-[50] pointer-events-none">
          <div class="bg-white rounded-[5px] shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-red-200 p-4 min-w-[210px] flex flex-col items-center gap-2 justify-center" :style="{ marginRight: `${sidebarWidth}px`, minHeight: '136px' }">
            <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <h3 class="text-[13px] font-bold text-slate-800 uppercase tracking-widest mt-1">Waktu Habis</h3>
          </div>
        </div>
      </Transition>

      <!-- Controls Row (inside canvas, floats at bottom-right on mobile) -->
      <div class="mobile-controls-row">
      <button 
        @click="(e) => { rreStore.toggleGame(); (e.currentTarget as HTMLElement).blur() }"
        class="desktop-control-btn p-2 md:hover:bg-gray-100 active:bg-gray-100 rounded-lg transition-colors group cursor-pointer" 
        :style="{ right: `${sidebarWidth + 148}px` }" 
        :title="rreStore.isActive ? 'Berhenti Tantangan' : 'Mode Tantangan'"
      >
        <img 
          src="@/assets/icons/rre.svg" 
          class="w-6 h-6 transition-all" 
          :class="rreStore.isActive ? 'opacity-100' : 'grayscale opacity-70 md:group-hover:grayscale-0 md:group-hover:opacity-100'"
          alt="RRE Mode" 
        />
      </button>

      <button 
        @click="(e) => { store.toggleAtomicMode(); playSound('click', 0.3, 1.0); (e.currentTarget as HTMLElement).blur() }"
        class="desktop-control-btn p-2 md:hover:bg-gray-100 active:bg-gray-100 rounded-lg transition-colors group cursor-pointer" 
        :style="{ right: `${sidebarWidth + 104}px` }" 
        :title="store.isAtomicModeActive ? 'Mode Atomik (Aktif)' : 'Mode Atomik'"
      >
        <img 
          src="@/assets/icons/flask.svg" 
          class="w-6 h-6 transition-all" 
          :class="store.isAtomicModeActive ? 'opacity-100' : 'grayscale opacity-70 md:group-hover:grayscale-0 md:group-hover:opacity-100'"
          alt="Experiment" 
        />
      </button>

      <button 
        @click="(e) => { store.toggleFormulas(); playSound('click', 0.3, 1.0); (e.currentTarget as HTMLElement).blur() }" 
        class="desktop-control-btn p-2 md:hover:bg-gray-100 active:bg-gray-100 rounded-lg transition-colors group cursor-pointer" 
        :style="{ right: `${sidebarWidth + 60}px` }" 
        :title="store.showFormulas ? 'Tampilkan Nama' : 'Tampilkan Rumus'"
      >
        <img 
          src="@/assets/icons/show-elements.svg" 
          class="w-6 h-6 grayscale md:hover:grayscale-0 transition-all opacity-70 md:group-hover:opacity-100" 
          alt="Show Elements" 
        />
      </button>

      <button 
        @click="(e) => { handleClearClick(); playSound('click', 0.3, 1.0); (e.currentTarget as HTMLElement).blur() }" 
        class="desktop-control-btn p-2 md:hover:bg-gray-100 active:bg-gray-100 rounded-lg transition-colors group cursor-pointer" 
        :style="{ right: `${sidebarWidth + 16}px` }" 
        title="Bersihkan Kanvas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 opacity-70 md:group-hover:opacity-100 transition-all">
          <path d="m16 22-1-4"/>
          <path d="M19 14a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1"/>
          <path d="M19 14H5l-1.973 6.767A1 1 0 0 0 4 22h16a1 1 0 0 0 .973-1.233z"/>
          <path d="m8 22 1-4"/>
        </svg>
      </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Transition name="fade">
      <div v-if="isConfirming" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-md" @click.self="isConfirming = false">
        <div class="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 max-w-[340px] w-full mx-4 transform transition-all border border-[#c9c9c9] animate-in fade-in zoom-in duration-300">
          <div class="flex flex-col items-center text-center">
            <div class="w-14 h-14 bg-red-50/50 rounded-full flex items-center justify-center mb-5 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </div>
            
            <h3 class="text-lg font-bold text-slate-800 mb-2 font-outfit uppercase tracking-wide">Bersihkan Kanvas?</h3>
            <p class="text-[15px] text-slate-500 mb-6 leading-relaxed">Apakah Anda yakin ingin menghapus semua elemen dari kanvas?</p>
            
            <div class="flex gap-2.5 w-full">
              <button 
                @click="isConfirming = false; playSound('click', 0.3, 1.2)"
                class="flex-1 px-4 py-2.5 rounded-[5px] bg-white border border-[#c9c9c9] text-slate-600 font-medium hover:bg-slate-50 active:bg-slate-100 transition-all text-sm"
              >
                Batal
              </button>
              <button 
                @click="confirmClear()"
                class="flex-1 px-4 py-2.5 rounded-[5px] bg-red-500 text-white font-semibold hover:bg-red-600 active:bg-red-700 shadow-sm active:scale-95 transition-all text-sm"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>



    <!-- Sidebar (desktop) / Bottom Tray (mobile) -->
    <div 
      :ref="dropSidebar" 
      :style="{ width: `${sidebarWidth}px` }" 
      class="mobile-sidebar fixed right-0 top-0 bottom-0 bg-white border-l border-[#c8c8c8] flex flex-col z-[10] transition-colors duration-200"
      :class="{ 'bg-red-50/50': collectSidebar.isOver && collectSidebar.canDrop }"
    >
      <div
          class="mobile-resize-handle absolute left-0 top-0 bottom-0 w-[5px] cursor-col-resize hover:bg-[#f0f0f0] transition-colors z-[11]"
          @mousedown="startResize"
      ></div>
      <AvailableResources></AvailableResources>
    </div>

    <!-- Delete animation ghosts: Teleported to <body> so they render above the sidebar z-index -->
    <Teleport to="body">
      <div
        v-for="ghost in deletingBoxGhosts"
        :key="ghost.id"
        class="ghost-delete pointer-events-none"
        :class="{ 'ghost-delete--out': ghost.animating }"
        :style="{ left: `${ghost.fixedLeft}px`, top: `${ghost.fixedTop}px` }"
      >
        <ItemCard
          size="small"
          :title="ghost.title"
          :formula="ghost.formula"
          :emoji="ghost.emoji"
          :symbol="ghost.symbol"
          :icon="ghost.icon"
        />
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.box-list-enter-active.is-new {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.box-list-enter-from.is-new {
  opacity: 0;
  transform: scale(0.5);
}

.box-list-leave-active {
  transition: all 0.15s cubic-bezier(0.3, 0, 1, 1);
}

.box-list-leave-to {
  opacity: 0;
  transform: scale(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ghost element rendered via Teleport above all other z-layers for delete animation */
.ghost-delete {
  position: fixed;
  z-index: 9999;
  transition: all 0.15s cubic-bezier(0.3, 0, 1, 1);
  transform: scale(1);
  opacity: 1;
}

.ghost-delete--out {
  transform: scale(0);
  opacity: 0;
}

@keyframes glow-pulse {
  0%, 100% { 
    opacity: 1; 
    box-shadow: inset 0 0 60px rgba(59, 130, 246, 0.3);
  }
  50% { 
    opacity: 0.8; 
    box-shadow: inset 0 0 100px rgba(59, 130, 246, 0.45);
  }
}

.animate-glow-pulse {
  animation: glow-pulse 3s ease-in-out infinite;
}
</style>
