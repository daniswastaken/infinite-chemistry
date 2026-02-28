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
}>()

const [collect, drag] = useDrag(() => ({
  type: ItemTypes.BOX,
  item: { title: props.title, emoji: props.emoji, symbol: props.symbol, icon: props.icon, formula: props.formula, components: props.components },
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
      @mousedown="playSound('put', 0.8)"
  >
    <ItemCard :title="title" :formula="formula" :emoji="emoji" :symbol="symbol" :icon="icon" size="small"></ItemCard>
  </div>
</template>

<style scoped>

</style>