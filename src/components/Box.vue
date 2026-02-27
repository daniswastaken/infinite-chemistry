<script lang="ts" setup>
import {useDrag} from 'vue3-dnd'
import {ItemTypes} from './ItemTypes'
import {toRefs} from '@vueuse/core'

const props = defineProps<{
  id: any
  left: number
  top: number
  title?: string
  emoji?: string
  symbol?: string
  icon?: string
  hideSourceOnDrag?: boolean
  loading?: boolean
  selected?: boolean
}>()

// No getEmptyImage/dragPreview needed — TouchBackend doesn't use the HTML5
// drag API so there is no native ghost to suppress.
const [collect, drag] = useDrag(() => ({
  type: ItemTypes.BOX,
  item: {id: props.id, left: props.left, top: props.top, title: props.title, emoji: props.emoji, symbol: props.symbol, icon: props.icon},
  collect: monitor => ({
    isDragging: monitor.isDragging(),
  }),
}))
const {isDragging} = toRefs(collect)
</script>

<template>
  <div
      :ref="drag"
      class="absolute cursor-grab"
      :style="{ left: `${left}px`, top: `${top}px`, opacity: isDragging ? 0 : 1 }"
      role="Box"
      data-testid="box"
  >
    <div v-if="loading">
      <div
          class="border-[#c9c9c9] bg-white shadow-sm hover:bg-gradient-to-b hover:from-white hover:to-[#e0f2fe] hover:border-[#999] hover:shadow-md cursor-pointer transition-all duration-200 inline-flex items-center text-[15px] space-x-1.5 px-2 py-1.5 font-medium border rounded-[5px] select-none whitespace-nowrap">
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
