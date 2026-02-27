<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import {getElementIcon} from "@/utils/elements";
import {useBoxesStore} from "@/stores/useBoxesStore";

const props = defineProps<{
  title: string;
  formula?: string;
  emoji?: string;
  symbol?: string;
  icon?: string;
  id?: string;
  size: 'small' | 'large';
  selected?: boolean;
  isHovered?: boolean;
}>()

const store = useBoxesStore()

</script>
<template>
   <div
        :class="twMerge(
          props.size === 'large' ? 'text-[18px] space-x-2 py-1 px-3' : 'text-[15px] space-x-1.5 px-2 py-1.5',
          'border-[#c9c9c9] bg-white shadow-sm hover:bg-gradient-to-b hover:from-white hover:to-[#e0f2fe] hover:border-[#999] hover:shadow-md cursor-pointer transition-all duration-200 inline-flex items-center font-medium border rounded-[5px] select-none whitespace-nowrap',
          (props.selected || props.isHovered) && 'bg-gradient-to-b from-white to-[#e0f2fe] border-[#999] shadow-md'
        )">
      <span v-if="emoji">
          {{ emoji }}
      </span>
      <img v-else-if="symbol" :src="getElementIcon(symbol)" class="w-6 h-6 flex-shrink-0 pointer-events-none" :alt="symbol" draggable="false" @contextmenu.prevent />
      <img v-else-if="icon" :src="icon" class="h-[18px] w-auto flex-shrink-0 pointer-events-none" :alt="title" draggable="false" @contextmenu.prevent />
      <span>
        {{ store.showFormulas ? (props.formula || props.symbol || props.title) : props.title }}
      </span>
  </div>

</template>

<style scoped>

</style>