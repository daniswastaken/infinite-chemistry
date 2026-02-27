<script lang="ts" setup>
import {useDrop} from 'vue3-dnd'
import type {XYCoord} from 'vue3-dnd'
import {ItemTypes} from './ItemTypes'
import Box from './Box.vue'
import type {DragItem} from './interfaces'
import {reactive, ref} from 'vue'
import ItemCard from "@/components/ItemCard.vue";
import AvailableResources from "@/components/AvailableResources.vue";
import {useBoxesStore} from "@/stores/useBoxesStore";
import {storeToRefs} from "pinia";

const store = useBoxesStore()
const { boxes } = store
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

const [, drop] = useDrop(() => ({
  accept: ItemTypes.BOX,
  drop(item: DragItem, monitor) {
    if (item.id && item.left !== null && item.top !== null) {
      const delta = monitor.getDifferenceFromInitialOffset() as XYCoord
      if(delta && delta.x && delta.y){
        const left = Math.round((item.left) + delta.x)
        const top = Math.round((item.top) + delta.y )
        moveBox(item.id, left, top)
      }
    } else {
      const delta = monitor.getClientOffset() as XYCoord
      // current mouse position relative to drop
      if(containerElement.value){
        const containerCoords = containerElement.value.getBoundingClientRect()
        if(delta && delta.x && delta.y){
          // Adjust offset to target center of item card. Standard Infinite Craft sizing.
          const left = Math.round(delta.x - containerCoords.left - 40)
          const top = Math.round(delta.y - containerCoords.top - 20)
          moveBox(null, left, top, item.title, item.emoji, item.symbol, item.icon)
        }
      }
    }
    return undefined
  },
}))
</script>

<template>
  <div ref="containerElement" class="w-full h-full relative">

    <div :ref="drop" class="container">
      <Box
          v-for="(value, key) in boxes"
          :id="String(key)"
          :key="String(key)"
          :left="value.left"
          :top="value.top"
          :loading="value.loading"
      >
        <ItemCard size="large" :id="String(key)" :title="value.title" :emoji="value.emoji" :symbol="value.symbol" :icon="value.icon"/>
      </Box>
    </div>

    <!-- Background branding like Infinite Craft -->
    <div class="pointer-events-none fixed top-[25px] left-[25px] z-[2]">
      <img src="@/assets/icons/infinite-chemistry-logo.svg" class="w-[150px]" alt="Infinite Chemistry Logo" />
    </div>

    <div class="fixed right-0 top-0 bottom-0 w-[305px] bg-white border-l border-[#e2e2e2] flex flex-col z-[10]">
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
</style>
