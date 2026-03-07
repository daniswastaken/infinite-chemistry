<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAchievementStore } from '@/stores/useAchievementStore'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const achievementStore = useAchievementStore()
const canClose = ref(false)
let warmHearthTimeout: number | null = null

const handleClose = () => {
  if (canClose.value) {
    emit('close')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen && canClose.value) {
    emit('close')
  }
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // Achievement: Obrolan di Tepi Perapian
      achievementStore.unlock('credits_seen')

      // Achievement: Perapian yang Hangat
      warmHearthTimeout = window.setTimeout(() => {
        achievementStore.unlock('warm_hearth')
      }, 30000)

      // Reset states
      canClose.value = false

      // 5. 0.5s delay -> Click to close enabled (1.1 + 0.5 = 1.6)
      setTimeout(() => {
        canClose.value = true
      }, 1600)
    } else {
      if (warmHearthTimeout) {
        clearTimeout(warmHearthTimeout)
        warmHearthTimeout = null
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const team = ['Essam Fitrah', 'Handaru Daniswara', 'Rangga Kurniawan']

const extendedTeam = [...team, ...team, ...team, ...team]
</script>

<template>
  <Transition name="fade-blur">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 dark:bg-black/80 text-black dark:text-white backdrop-blur-xl transition-all duration-300 select-none"
      style="-webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px)"
      :class="canClose ? 'cursor-pointer' : 'cursor-wait'"
      @click="handleClose"
      @contextmenu.prevent
    >
      <div
        class="flex flex-col items-center text-center p-8 max-w-lg w-full font-outfit"
        @click.stop
      >
        <div
          class="animate-fade-in-up mb-8"
          style="animation-delay: 500ms; animation-fill-mode: both"
        >
          <img
            src="@/assets/icons/infinite-chemistry-logo.svg"
            class="w-[200px] md:w-[280px] dark:invert mx-auto opacity-90"
            alt="Infinite Chemistry Logo"
          />
        </div>

        <div
          class="animate-fade-in-up mb-2 font-bold"
          style="animation-delay: 800ms; animation-fill-mode: both"
        >
          <h2
            class="text-[13px] sm:text-lg md:text-xl tracking-widest uppercase text-[#6b66fa] dark:text-[#8b86fa] whitespace-nowrap"
          >
            Made with love, by amazing people!
          </h2>
        </div>

        <div
          class="flex items-center justify-center w-[100vw] relative h-[160px] overflow-hidden mask-edges my-8 md:my-12 mt-6 md:mt-9 animate-fade-in-up"
          style="animation-delay: 1100ms; animation-fill-mode: both"
        >
          <div
            class="flex animate-marquee whitespace-nowrap w-max text-3xl md:text-4xl lg:text-5xl font-extrabold font-outfit tracking-wide items-center py-8"
          >
            <!-- Group 1 -->
            <div class="flex items-center">
              <span
                v-for="(member, index) in extendedTeam"
                :key="'g1-' + index"
                class="flex items-center mx-6"
              >
                <span
                  class="bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-500 dark:from-neutral-100 dark:to-neutral-400 pb-2"
                >
                  {{ member }}
                </span>
                <span class="text-[#6b66fa]/50 ml-12">&bull;</span>
              </span>
            </div>
            <!-- Group 2 (Duplicate for seamless loop) -->
            <div class="flex items-center">
              <span
                v-for="(member, index) in extendedTeam"
                :key="'g2-' + index"
                class="flex items-center mx-6"
              >
                <span
                  class="bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-500 dark:from-neutral-100 dark:to-neutral-400 pb-2"
                >
                  {{ member }}
                </span>
                <span class="text-[#6b66fa]/50 ml-12">&bull;</span>
              </span>
            </div>
          </div>
        </div>

        <div
          class="text-sm text-neutral-500 dark:text-neutral-500 font-medium animate-fade-in uppercase tracking-widest cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          style="animation-delay: 1600ms; animation-fill-mode: both"
          :class="!canClose ? 'pointer-events-none' : ''"
          @click="handleClose"
        >
          Klik untuk menutup
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Marquee Styles */
.mask-edges {
  mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
}

.animate-marquee {
  animation: marquee 50s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.fade-blur-enter-active {
  transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fade-blur-leave-active {
  transition: all 0.4s cubic-bezier(0.8, 0.2, 1, 0.2);
}
.fade-blur-enter-from,
.fade-blur-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}
.fade-blur-enter-to,
.fade-blur-leave-from {
  opacity: 1;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
