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
  selected?: boolean;
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
      const secondEmoji = store.boxes[droppedId]?.emoji ?? item?.emoji

      if(props.id){
        const targetBox = store.boxes[props.id];
        const firstTitle = targetBox.title;
        const firstEmoji = targetBox.emoji;
        const left = targetBox.left;
        const top = targetBox.top;

        // Save state before starting the mix operation
        store.saveHistory();

        // Visual feedback: remove the dropped item immediately
        if(droppedId){
          store.removeBox(droppedId, false);
        }

        targetBox.loading = true
        const response = await axios.post('http://127.0.0.1:3000/', {
          first: firstTitle,
          second: secondTitle
        })

        const resultAnswer = response.data.result !== '' ? response.data.result : firstTitle
        const resultEmoji = response.data.emoji !== '' ? response.data.emoji : firstEmoji

        // Add resultant box WITHOUT saving history
        store.addBox({
          title: resultAnswer,
          emoji: resultEmoji,
          left: left,
          top: top
        }, false)

        if(!resources.value.find((resource: { title: string; }) => resource.title === resultAnswer)){
          addResource({
            title: resultAnswer,
            emoji: resultEmoji
          })
        }
        
        // Remove original target box WITHOUT saving history
        store.removeBox(props.id, false);
      }
    }
  },
}))

</script>
<template>
   <div :ref="drop"
        :class="twMerge(
          props.size === 'large' ? 'text-[18px] space-x-2 py-1 px-3' : 'text-[15px] space-x-1.5 px-2 py-1.5',
          'border-[#c9c9c9] bg-white shadow-sm hover:bg-gradient-to-b hover:from-white hover:to-[#e0f2fe] hover:border-[#999] hover:shadow-md cursor-pointer transition-all duration-200 inline-flex items-center font-medium border rounded-[5px] select-none whitespace-nowrap',
          props.selected && 'bg-gradient-to-b from-white to-[#e0f2fe] border-[#999] shadow-md'
        )">      <span v-if="emoji">
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