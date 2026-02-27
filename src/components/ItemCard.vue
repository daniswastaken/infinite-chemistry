<script setup lang="ts">
import {useDrop} from "vue3-dnd";
import {ItemTypes} from "@/components/ItemTypes";
import type {DragItem} from "@/components/interfaces";
import {useBoxesStore} from "@/stores/useBoxesStore";
import axios from "axios";
import {useResourcesStore} from "@/stores/useResourcesStore";
import {storeToRefs} from "pinia";
import {twMerge} from "tailwind-merge";
import {getElementIcon} from "@/utils/elements";

const props = defineProps<{
  title: string;
  emoji?: string;
  symbol?: string;
  icon?: string;
  id?: string;
  size: 'small' | 'large';
}>()

const store = useBoxesStore()
const {removeBox, addBox} = store
const {resources} = storeToRefs(useResourcesStore())
const {addResource} =useResourcesStore()

const [, drop] = useDrop(() => ({
  accept: ItemTypes.BOX,
  async drop(item: DragItem, monitor) {
    if (item.id !== props.id) {
      const droppedId = item?.id;
      const secondTitle = store.boxes[droppedId]?.title ?? item?.title
      if(droppedId){
        removeBox(droppedId);
      }
      if(props.id){
        store.boxes[props.id].loading = true
        const response = await axios.post('http://127.0.0.1:3000/', {
          first: store.boxes[props.id].title,
          second: secondTitle
        })

        const resultAnswer = response.data.result !== '' ? response.data.result : store.boxes[props.id].title
        const resultEmoji = response.data.emoji !== '' ? response.data.emoji : store.boxes[props.id].emoji

        addBox({
          title: resultAnswer,
          emoji: resultEmoji,
          left: store.boxes[props.id].left,
          top: store.boxes[props.id].top
        })
        if(!resources.value.find((resource: { title: string; }) => resource.title === resultAnswer)){
          addResource({
            title: resultAnswer,
            emoji: resultEmoji
          })
        }
        removeBox(props.id);
      }
    }
  },
}))

</script>
<template>
   <div :ref="drop"
        :class="twMerge(props.size === 'large' ? 'text-[18px] space-x-2 py-1 px-3' : 'text-[15px] space-x-1.5 px-2 py-1.5','border-[#c9c9c9] bg-white shadow-sm hover:bg-gradient-to-b hover:from-white hover:to-[#e0f2fe] hover:border-[#999] hover:shadow-md cursor-pointer transition-all duration-200 inline-flex items-center font-medium border rounded-[5px] select-none whitespace-nowrap')">
      <span v-if="emoji">
          {{ emoji }}
      </span>
      <img v-else-if="symbol" :src="getElementIcon(symbol)" class="w-6 h-6 flex-shrink-0 pointer-events-none" :alt="symbol" draggable="false" @contextmenu.prevent />
      <span>
        {{ title }}
      </span>
  </div>

</template>

<style scoped>

</style>