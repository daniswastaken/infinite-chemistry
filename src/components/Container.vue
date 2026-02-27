<script lang="ts" setup>
import {useDrop} from 'vue3-dnd'
import type {XYCoord} from 'vue3-dnd'
import {ItemTypes} from './ItemTypes'
import Box from './Box.vue'
import type {DragItem} from './interfaces'
import {reactive, ref, onMounted} from 'vue'
import ItemCard from "@/components/ItemCard.vue";
import AvailableResources from "@/components/AvailableResources.vue";
import CustomDragLayer from "@/components/CustomDragLayer.vue";
import {useBoxesStore} from "@/stores/useBoxesStore";
import {storeToRefs} from "pinia";

const store = useBoxesStore()
const { boxes } = store

const isConfirming = ref(false)

const handleClearClick = () => {
  if (Object.keys(boxes).length > 0) {
    isConfirming.value = true
  }
}

const confirmClear = () => {
  store.clearBoxes()
  isConfirming.value = false
}

const sidebarWidth = ref(350)
const isResizing = ref(false)

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  e.preventDefault()
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

const moveBox = (id: string | null, left: number, top: number, title?: string, emoji?: string, symbol?: string, icon?: string) => {
  if (id) {
    Object.assign(boxes[id], {left, top})
  } else if (title) {
    const key = Math.random().toString(36).substring(7);
    boxes[key] = {top, left, title, emoji, symbol, icon}
    console.log(boxes)

  }
}

const containerElement = ref<HTMLElement | null>(null)

onMounted(() => {
  if ((window as any).particlesJS) {
    (window as any).particlesJS.load('particles-js', '/particles.js/particles.json');
  }
})
const [, drop] = useDrop(() => ({
  accept: ItemTypes.BOX,
  drop(item: DragItem, monitor) {
    const offset = monitor.getSourceClientOffset() as XYCoord
    if (offset && containerElement.value) {
      const containerCoords = containerElement.value.getBoundingClientRect()
      const left = Math.round(offset.x - containerCoords.left)
      const top = Math.round(offset.y - containerCoords.top)

      if (item.id) {
        moveBox(item.id, left, top)
      } else {
        moveBox(null, left, top, item.title, item.emoji, item.symbol, item.icon)
      }
    }
    return undefined
  },
}))
</script>

<template>
  <div ref="containerElement" class="w-full h-full relative">
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
            :emoji="value.emoji"
            :symbol="value.symbol"
            :icon="value.icon"
        >
          <ItemCard size="small" :id="String(key)" :title="value.title" :emoji="value.emoji" :symbol="value.symbol" :icon="value.icon"/>
        </Box>
      </TransitionGroup>
    </div>

    <!-- Background branding like Infinite Craft -->
    <div class="fixed top-[15px] left-[15px] z-[2] pointer-events-none">
      <img src="@/assets/icons/infinite-chemistry-logo.svg" class="w-[150px]" alt="Infinite Chemistry Logo" />
    </div>

      <button @click="handleClearClick" :style="{ right: `${sidebarWidth + 16}px` }" class="fixed bottom-4 z-[10] p-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer" title="Clear Canvas">
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
