<script setup lang="ts">
import { useDrag } from 'vue3-dnd'
import { ItemTypes } from './ItemTypes'
import { toRefs } from '@vueuse/core'
import ItemCard from "@/components/ItemCard.vue";
import { playSound } from '@/utils/audio'

const props = defineProps<{
  emoji?: string
  symbol?: string
  icon?: string
  title: string
  formula?: string
  components?: Record<string, number>
  atomicId?: string
}>()

const [collect, drag] = useDrag(() => ({
  type: ItemTypes.BOX,
  item: () => {
    playSound('put', 0.5)
    return { title: props.title, emoji: props.emoji, symbol: props.symbol, icon: props.icon, formula: props.formula, components: props.components, atomicId: props.atomicId }
  },
  collect: monitor => ({
    isDragging: monitor.isDragging(),
  }),
}))
const { isDragging } = toRefs(collect)
</script>

<template>
  <div
      class="inline-block flex-shrink-0 cursor-grab"
      :ref="drag"
      role="Box"
      data-testid="box"
  >
    <ItemCard :title="title" :formula="formula" :emoji="emoji" :symbol="symbol" :icon="icon" :atomicId="atomicId" :components="components" size="small"></ItemCard>
  </div>
</template>

<style scoped>

</style>