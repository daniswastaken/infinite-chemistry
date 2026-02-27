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
import {storeToRefs} from "pinia";
import {mixElements} from "@/utils/chemistryEngine";

const store = useBoxesStore()
const { boxes, selectedIds } = storeToRefs(store)
const { setSelectedIds, clearSelection, clearBoxes, removeSelected } = store

const resourcesStore = useResourcesStore()
const { resources } = storeToRefs(resourcesStore)
const { addResource } = resourcesStore

// Collision detection helper
function getOverlappingBox(left: number, top: number, excludeId?: string) {
  const boxWidth = 120
  const boxHeight = 45
  
  const dragRect = {
    left,
    top,
    right: left + boxWidth,
    bottom: top + boxHeight
  }

  for (const id in boxes.value) {
    if (id === excludeId) continue
    const box = (boxes.value as any)[id]
    
    const targetRect = {
      left: box.left,
      top: box.top,
      right: box.left + boxWidth,
      bottom: box.top + boxHeight
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
  for (const id in boxesVal) {
    const box = (boxesVal as any)[id]
    // Basic rectangle intersection
    const boxWidth = 120
    const boxHeight = 45
    
    const boxRect = {
      left: box.left,
      top: box.top,
      right: box.left + boxWidth,
      bottom: box.top + boxHeight
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
  }
}

onMounted(() => {
  if ((window as any).particlesJS) {
    (window as any).particlesJS.load('particles-js', '/particles.js/particles.json');
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
        const symbolA = overlapping.symbol
        const symbolB = store.boxes[item.id!]?.symbol ?? item.symbol

        if (symbolA && symbolB) {
          const result = mixElements(symbolA, symbolB)
          
          if (result) {
            store.saveHistory()
            if (item.id) store.removeBox(item.id, false)
            store.removeBox(overlapping.id, false)

            store.addBox({
              title: result.name,
              symbol: undefined,
              icon: result.icon,
              formula: result.formula,
              left: overlapping.left,
              top: overlapping.top
            }, false)

            if (!resources.value.find((r) => r.title === result.name)) {
              addResource({
                title: result.name,
                icon: result.icon,
                formula: result.formula,
                type: 'Kovalen'
              })
            }
            return
          }
        }
      }

      if (item.id) {
        store.moveBox(item.id, left, top)
      } else {
        store.moveBox(null, left, top, item.title, item.emoji, item.symbol, item.icon)
      }
    }
    return undefined
  },
}))
</script>

<template>
  <div 
    ref="containerElement" 
    class="w-full h-full relative outline-none"
    tabindex="0"
    @mousedown="startSelection"
    @mousemove="updateSelection"
    @mouseup="finishSelection"
    @mouseleave="finishSelection"
  >
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
    <div class="fixed top-[15px] left-[15px] z-[2] pointer-events-none">
      <img src="@/assets/icons/infinite-chemistry-logo.svg" class="w-[150px]" alt="Infinite Chemistry Logo" />
    </div>

      <button 
        @click="store.toggleFormulas" 
        :style="{ right: `${sidebarWidth + 60}px` }" 
        class="fixed bottom-4 z-[10] p-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer" 
        :title="store.showFormulas ? 'Tampilkan Nama' : 'Tampilkan Rumus'"
      >
        <img 
          src="@/assets/icons/show-elements.svg" 
          class="w-6 h-6 grayscale hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100" 
          alt="Show Elements" 
        />
      </button>

      <button @click="handleClearClick" :style="{ right: `${sidebarWidth + 16}px` }" class="fixed bottom-4 z-[10] p-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer" title="Bersihkan Kanvas">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-500 group-hover:text-gray-700">
          <path d="m16 22-1-4"/>
          <path d="M19 14a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1"/>
          <path d="M19 14H5l-1.973 6.767A1 1 0 0 0 4 22h16a1 1 0 0 0 .973-1.233z"/>
          <path d="m8 22 1-4"/>
        </svg>
      </button>

    <!-- Confirmation Modal -->
    <Transition name="fade">
      <div v-if="isConfirming" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm" @click.self="isConfirming = false">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all border border-gray-100 animate-in fade-in zoom-in duration-200">
          <div class="flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 mb-2 font-outfit">Bersihkan Kanvas?</h3>
            <p class="text-gray-500 mb-8">Apakah Anda yakin ingin menghapus semua elemen dari kanvas? Tindakan ini tidak dapat dibatalkan.</p>
            
            <div class="flex gap-3 w-full">
              <button 
                @click="isConfirming = false"
                class="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button 
                @click="confirmClear"
                class="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div :style="{ width: `${sidebarWidth}px` }" class="fixed right-0 top-0 bottom-0 bg-white border-l border-[#c8c8c8] flex flex-col z-[10]">
      <div
          class="absolute left-0 top-0 bottom-0 w-[5px] cursor-col-resize hover:bg-[#f0f0f0] transition-colors z-[11]"
          @mousedown="startResize"
      ></div>
      <AvailableResources></AvailableResources>
    </div>

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
</style>
