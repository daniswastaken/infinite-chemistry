<script lang="ts" setup>
import {useDrag} from 'vue3-dnd'
import {ItemTypes} from './ItemTypes'
import {toRefs} from '@vueuse/core'

const props = defineProps<{
  id: any
  left: number
  top: number
  hideSourceOnDrag?: boolean
  loading?: boolean
}>()

const [collect, drag] = useDrag(() => ({
  type: ItemTypes.BOX,
  item: {id: props.id, left: props.left, top: props.top},
  collect: monitor => ({
    isDragging: monitor.isDragging(),
  }),
}))
const {isDragging} = toRefs(collect)
</script>

<template>
  <div v-if="isDragging && hideSourceOnDrag" :ref="drag"/>
  <div
      v-else
      :ref="drag"
      class="absolute"
      :style="{ left: `${left}px`, top: `${top}px` }"
      role="Box"
      data-testid="box"
  >
    <div v-if="loading">
      <div
          class="border-[#c9c9c9] bg-white shadow-sm hover:bg-gradient-to-b hover:from-white hover:to-[#e0f2fe] hover:border-[#999] hover:shadow-md cursor-pointer transition-all duration-200 inline-flex items-center text-[18px] space-x-2 py-1 px-3 font-medium border rounded-[5px] select-none">
        <svg class="animate-spin -ml-1 mr-2 h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
