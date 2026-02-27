<script setup lang="ts">
import { computed } from 'vue'
import { useDragLayer } from 'vue3-dnd'
import { ItemTypes } from '@/components/ItemTypes'
import { getElementIcon } from '@/utils/elements'
import { twMerge } from 'tailwind-merge'

const collect = useDragLayer((monitor) => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging(),
}))

const isDragging = computed(() => collect.value.isDragging)
const item = computed(() => collect.value.item)
const currentOffset = computed(() => collect.value.currentOffset)
const isBox = computed(() => collect.value.itemType === ItemTypes.BOX)

const layerStyle = computed(() => {
  if (!currentOffset.value) return { display: 'none' }
  const { x, y } = currentOffset.value
  return {
    transform: `translate(${x}px, ${y}px)`,
  }
})
</script>

<template>
  <div
    v-if="isDragging && isBox && currentOffset"
    class="fixed top-0 left-0 z-[9999] pointer-events-none"
    :style="layerStyle"
  >
    <!-- Mirror of the small ItemCard appearance -->
    <div
      :class="twMerge('text-[15px] space-x-1.5 px-2 py-1.5', 'border-[#c9c9c9] bg-white shadow-sm inline-flex items-center font-medium border rounded-[5px] select-none opacity-95 whitespace-nowrap')"
    >
      <span v-if="item?.emoji">{{ item.emoji }}</span>
      <img
        v-else-if="item?.symbol"
        :src="getElementIcon(item.symbol)"
        class="w-6 h-6 flex-shrink-0 pointer-events-none"
        :alt="item.symbol"
        draggable="false"
        @contextmenu.prevent
      />
      <span>{{ item?.title }}</span>
    </div>
  </div>
</template>
