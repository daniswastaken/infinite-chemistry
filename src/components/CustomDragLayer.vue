<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDragLayer } from 'vue3-dnd'
import { ItemTypes } from '@/components/ItemTypes'
import ItemCard from '@/components/ItemCard.vue'
import { twMerge } from 'tailwind-merge'
import { useBoxesStore } from '@/stores/useBoxesStore'

const store = useBoxesStore()

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

const animationOffset = ref('0s')
watch([() => store.successStartTime, () => item.value?.id], () => {
  if (store.successBoxId && store.successBoxId === item.value?.id && store.successStartTime) {
    const elapsed = (Date.now() - store.successStartTime) / 1000
    animationOffset.value = `-${elapsed}s`
  }
}, { immediate: true })
</script>

<template>
  <div
    v-if="isDragging && isBox && currentOffset"
    class="fixed top-0 left-0 z-[9999] pointer-events-none"
    :style="layerStyle"
  >
    <div v-if="store.successBoxId === item?.id" class="sunburst-effect" :style="{ animationDelay: animationOffset }"></div>
    
    <div :class="twMerge('relative scale-[1.03] opacity-95')">
      <ItemCard 
        size="small"
        :title="item.title"
        :formula="item.formula"
        :emoji="item.emoji"
        :symbol="item.symbol"
        :icon="item.icon"
        :atomicId="item.atomicId"
        :components="item.components"
      />
    </div>
  </div>
</template>

<style scoped>
.sunburst-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 125px;
  height: 125px;
  margin-top: -62.5px;
  margin-left: -62.5px;
  pointer-events: none;
  z-index: -1;
  background: repeating-conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(186, 230, 253, 0.5) 2deg,
    rgba(186, 230, 253, 0.5) 33deg,
    transparent 35deg,
    transparent 60deg
  );
  animation: sunburst-anim 3s linear forwards;
  border-radius: 50%;
  -webkit-mask-image: radial-gradient(circle, black 0%, transparent 70%);
  mask-image: radial-gradient(circle, black 0%, transparent 70%);
}

@keyframes sunburst-anim {
  0% {
    transform: scale(0.2) rotate(0deg);
    opacity: 0;
  }
  10% {
    transform: scale(1) rotate(18deg);
    opacity: 1;
  }
  86.6% {
    transform: scale(1) rotate(156deg);
    opacity: 1;
  }
  100% {
    transform: scale(0.2) rotate(180deg);
    opacity: 0;
  }
}
</style>
