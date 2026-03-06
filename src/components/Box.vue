<script lang="ts" setup>
import {useDrag} from 'vue3-dnd'
import {ItemTypes} from './ItemTypes'
import {toRefs} from '@vueuse/core'
import { playSound } from '@/utils/audio'
import {useBoxesStore} from "@/stores/useBoxesStore";
import {useAchievementStore} from "@/stores/useAchievementStore";

const store = useBoxesStore()
const achievementStore = useAchievementStore()

const props = defineProps<{
  id: any
  left: number
  top: number
  title?: string
  emoji?: string
  symbol?: string
  icon?: string
  formula?: string
  components?: Record<string, number>
  atomicId?: string
  hideSourceOnDrag?: boolean
  loading?: boolean
  selected?: boolean
  zIndex?: number
}>()

// No getEmptyImage/dragPreview needed — TouchBackend doesn't use the HTML5
// drag API so there is no native ghost to suppress.
const [collect, drag] = useDrag(() => ({
  type: ItemTypes.BOX,
  item: () => {
    store.bringToFront(props.id)
    playSound('put', 0.5)
    
    // Track drag starts for achievements
    achievementStore.recordDragStart(props.left, props.top, window.innerWidth, window.innerHeight)
    achievementStore.recordDragStartY(props.top, window.innerHeight)
    
    return {
      id: props.id, 
      left: props.left, 
      top: props.top, 
      title: props.title, 
      emoji: props.emoji, 
      symbol: props.symbol, 
      icon: props.icon, 
      formula: props.formula,
      components: props.components,
      atomicId: props.atomicId
    }
  },
  collect: monitor => ({
    isDragging: monitor.isDragging(),
  }),
}))
const {isDragging} = toRefs(collect)
</script>

<template>
  <div
      :ref="drag"
      :id="props.id"
      class="absolute cursor-grab"
      :style="{ left: `${left}px`, top: `${top}px`, opacity: isDragging ? 0 : 1, zIndex: zIndex || 1 }"
      role="Box"
      data-testid="box"
  >
    <div v-if="loading">
      <div
          class="border-[#c9c9c9] dark:border-neutral-700 bg-white dark:bg-[#313131] shadow-sm hover:bg-gradient-to-b hover:from-white hover:to-[#e0f2fe] dark:hover:from-[#313131] dark:hover:to-neutral-700 hover:border-[#999] dark:hover:border-neutral-500 hover:shadow-md cursor-pointer transition-all duration-200 inline-flex items-center text-[15px] space-x-1.5 px-2 py-1.5 font-medium border rounded-[5px] select-none whitespace-nowrap text-neutral-800 dark:text-neutral-100">
        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>
          Loading
        </span>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>

<style scoped>

</style>
