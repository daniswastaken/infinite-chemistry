<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import { getElementIcon, getElementIonicForm, elements } from "@/utils/elements";
import { formatIonCharge } from "@/utils/chemistryEngine";
import { useBoxesStore } from "@/stores/useBoxesStore";
import { computed, ref, watch } from "vue";

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
  isRejected?: boolean;
  isSuccess?: boolean;
  atomicId?: string;
  components?: Record<string, number>;
}>()

const store = useBoxesStore()

const animationOffset = ref('0s')
watch(() => props.isSuccess, (val) => {
  if (val && store.successStartTime) {
    const elapsed = (Date.now() - store.successStartTime) / 1000
    animationOffset.value = `-${elapsed}s`
  }
}, { immediate: true })
const displayTitle = computed(() => {
  // Only transform if it's explicitly a single element (has symbol, no multi-components, no polyId)
  const isSingleElement = props.symbol && !props.atomicId && (!props.components || Object.keys(props.components).length <= 1);
  
  if (store.isAtomicModeActive && isSingleElement) {
    const element = elements.find(e => e.symbol === props.symbol)
    if (element) {
      const ionic = getElementIonicForm(element)
      if (ionic) return ionic.name
    }
  }
  return props.title
})

const displayFormula = computed(() => {
  const isSingleElement = props.symbol && !props.atomicId && (!props.components || Object.keys(props.components).length <= 1);

  if (store.isAtomicModeActive && isSingleElement) {
    const element = elements.find(e => e.symbol === props.symbol)
    if (element) {
      const ionic = getElementIonicForm(element)
      if (ionic) return ionic.symbol + formatIonCharge(ionic.charge)
    }
  }
  return props.formula || props.symbol || props.title
})

</script>
<template>
  <div v-if="props.isSuccess" class="sunburst-effect" :style="{ animationDelay: animationOffset }"></div>
  <div
        :id="props.id"
        :class="twMerge(
          props.size === 'large' ? 'text-[18px] space-x-2 py-1 px-3' : 'text-[15px] space-x-1.5 px-2 py-1.5',
          'cursor-pointer transition-all duration-100 inline-flex items-center font-medium border rounded-[5px] select-none whitespace-nowrap',
          'border-[#c9c9c9] dark:border-neutral-700 bg-white dark:bg-[#313131] shadow-sm hover:bg-gradient-to-b hover:from-white hover:to-[#e0f2fe] dark:hover:from-[#313131] dark:hover:to-neutral-700 hover:border-[#999] dark:hover:border-neutral-500 hover:shadow-md text-neutral-800 dark:text-neutral-100',
          (props.selected || props.isHovered) && 'bg-gradient-to-b from-white to-[#e0f2fe] dark:from-[#313131] dark:to-neutral-700 border-[#999] dark:border-neutral-500 shadow-md',
          props.isHovered && 'scale-[1.03]',
          props.isRejected && 'border-red-500 dark:border-red-500 !bg-red-50 dark:!bg-red-900/30 shadow-md animate-shake'
        )">
      <span v-if="emoji">
          {{ emoji }}
      </span>
      <img v-else-if="symbol" :src="getElementIcon(symbol)" class="w-6 h-6 flex-shrink-0 pointer-events-none" :alt="symbol" draggable="false" @contextmenu.prevent />
      <img v-else-if="icon" :src="icon" class="h-[18px] w-auto flex-shrink-0 pointer-events-none dark:invert dark:opacity-[0.871]" :alt="title" draggable="false" @contextmenu.prevent />
      <span>
        {{ store.showFormulas ? displayFormula : displayTitle }}
      </span>
  </div>

</template>

<style scoped>
.animate-shake {
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-3px, 0, 0); }
  20%, 80% { transform: translate3d(5px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
  40%, 60% { transform: translate3d(5px, 0, 0); }
}

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
  /* Optional: Mask to fade out the edges and make it a cleaner circle */
  -webkit-mask-image: radial-gradient(circle, black 0%, transparent 70%);
  mask-image: radial-gradient(circle, black 0%, transparent 70%);
}

:global(.dark) .sunburst-effect {
  background: repeating-conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 255, 255, 0.2) 2deg,
    rgba(255, 255, 255, 0.2) 33deg,
    transparent 35deg,
    transparent 60deg
  );
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