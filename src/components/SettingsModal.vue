<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSettingsStore } from '@/stores/useSettingsStore'
import type { Difficulty } from '@/stores/useSettingsStore'
import { useAchievementStore } from '@/stores/useAchievementStore'

const props = defineProps<{
  isOpen: boolean
  isMobile: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const activeTab = ref('Pengaturan')
const achievementStore = useAchievementStore()

const tabs = computed(() => {
  const all = [
    { id: 'Pengaturan', label: 'Pengaturan' },
    { id: 'Achievement', label: 'Achievement' }
  ]
  if (!props.isMobile) {
    all.push({ id: 'Info', label: 'Info' })
  }
  return all
})

// Reset to first tab when opening
watch(() => props.isOpen, (val) => {
  if (val) activeTab.value = 'Pengaturan'
})

const settingsStore = useSettingsStore()

const difficultyOptions: { id: Difficulty; label: string; time: string; clue: boolean }[] = [
  { id: 'alkemis', label: 'Alkemis', time: '15 detik', clue: false },
  { id: 'sepuh',   label: 'Sepuh',   time: '30 detik', clue: false },
  { id: 'pemula',  label: 'Pemula',  time: '60 detik', clue: true },
]

const shortcuts = [
  { keys: ['Tab'], description: 'Cari Elemen' },
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Klik Kanan'], description: 'Hapus elemen' },
  { keys: ['Esc'], description: 'Buka Pengaturan' },
  { keys: ['1'], description: 'Mode Tantangan' },
  { keys: ['2'], description: 'Mode Atomik' },
  { keys: ['3'], description: 'Tampilkan Rumus' },
  { keys: ['4'], description: 'Hapus Semua' },
]

const sortedAchievements = computed(() => {
  return [...achievementStore.achievements].sort((a, b) => {
    // Unlocked first
    if (a.unlocked && !b.unlocked) return -1
    if (!a.unlocked && b.unlocked) return 1
    
    // Within unlocked, sort by unlock time (oldest first, newest at bottom of unlocked group)
    if (a.unlocked && b.unlocked) {
      return (a.unlockedAt || 0) - (b.unlockedAt || 0)
    }
    
    // Within locked, keep original definition order
    return 0
  })
})
</script>

<template>
  <Transition name="modal-fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-[2px]" 
      @mousedown.self="$emit('close')"
    >
      <!-- Modal -->
      <div 
        class="relative bg-white dark:bg-[#262626] rounded-[8px] border border-[#c8c8c8] dark:border-neutral-700 shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col overflow-hidden transition-all duration-300 max-w-[calc(100vw-32px)] text-[#262626] dark:text-neutral-100"
        :class="activeTab === 'Achievement' ? 'w-[550px]' : 'w-[380px]'"
      >
        
        <!-- Header / Tabs -->
        <div class="flex items-end px-2 pt-2 gap-1 border-b border-[#c8c8c8] dark:border-neutral-700">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-1 flex items-center justify-center gap-1.5 px-3 pt-1.5 pb-1 font-medium text-[13px] rounded-t-md border border-[#c8c8c8] dark:border-neutral-700 transition-colors whitespace-nowrap outline-none cursor-pointer"
            :class="activeTab === tab.id
              ? 'bg-white dark:bg-[#262626] text-black dark:text-neutral-100 z-10 border-b-white dark:border-b-[#262626] -mb-[1px]'
              : 'bg-[#fafafa] dark:bg-[#262626] text-black dark:text-neutral-300 hover:bg-[#f4f4f4] dark:hover:bg-neutral-700 active:bg-[#f4f4f4] dark:active:bg-neutral-700 border-b-transparent'"
          >
            {{ tab.label }}
          </button>
          <button
            @click="$emit('close')"
            class="ml-auto mb-1 p-1.5 rounded-md hover:bg-[#f4f4f4] dark:hover:bg-neutral-700 active:bg-[#ebebeb] dark:active:bg-neutral-600 transition-colors text-[#aaa] dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer outline-none"
            title="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-4 overflow-hidden relative min-h-[300px]">
          
          <!-- Pengaturan Tab Stack -->
          <div 
            class="transition-all duration-300 transform absolute inset-4"
            :class="activeTab === 'Pengaturan' ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 -translate-x-4 scale-95 pointer-events-none z-0'"
          >
            <div class="flex flex-col gap-4 h-full">
              <!-- Dark Mode Toggle -->
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6b66fa] dark:text-[#8b86fa] mb-3">Tampilan</p>
                <button 
                  @click="settingsStore.toggleDarkMode()"
                  class="w-full flex items-center justify-between px-4 py-2.5 rounded-[6px] border text-left transition-all cursor-pointer outline-none bg-white dark:bg-[#262626] border-[#d8d8d8] dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-[#6b66fa] dark:hover:border-[#8b86fa] hover:bg-[#f4f4fa] dark:hover:bg-neutral-700"
                >
                  <span class="font-semibold text-[13px]">Dark Mode</span>
                  <div 
                    class="w-10 h-5 rounded-full relative transition-colors"
                    :class="settingsStore.isDarkMode ? 'bg-[#6b66fa] dark:bg-[#8b86fa]' : 'bg-[#e0e0e0] dark:bg-neutral-600'"
                  >
                    <div 
                      class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"
                      :class="settingsStore.isDarkMode ? 'translate-x-[22px]' : 'translate-x-[2px]'"
                    ></div>
                  </div>
                </button>
              </div>

              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6b66fa] dark:text-[#8b86fa] mb-3">Mode Tantangan</p>
                <div class="flex flex-col gap-2">
                  <button
                    v-for="opt in difficultyOptions"
                    :key="opt.id"
                    @click="settingsStore.setDifficulty(opt.id)"
                    class="flex items-center justify-between px-4 py-2.5 rounded-[6px] border text-left transition-all cursor-pointer outline-none"
                    :class="settingsStore.difficulty === opt.id
                      ? 'bg-[#6b66fa] dark:bg-[#8b86fa] border-[#6b66fa] dark:border-[#8b86fa] text-white shadow-sm'
                      : 'bg-white dark:bg-[#262626] border-[#d8d8d8] dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-[#6b66fa] dark:hover:border-[#8b86fa] hover:bg-[#f4f4fa] dark:hover:bg-neutral-700'"
                  >
                    <span class="font-semibold text-[13px]">{{ opt.label }}</span>
                    <div class="flex items-center gap-2 text-[12px] opacity-80">
                      <span>⏱ {{ opt.time }}</span>
                      <span v-if="opt.clue" class="px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold tracking-wide" :class="settingsStore.difficulty === opt.id ? 'bg-white/20 text-white' : 'bg-[#eef] dark:bg-[#8b86fa]/20 text-[#6b66fa] dark:text-[#8b86fa]'">+ CLUE</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Achievement Tab Stack -->
          <div 
            class="transition-all duration-300 transform absolute inset-4 overflow-y-auto pr-3 custom-scrollbar achievement-scroll-mask"
            :class="activeTab === 'Achievement' ? 'opacity-100 translate-y-0 scale-100 z-10' : 'opacity-0 translate-y-4 scale-95 pointer-events-none z-0'"
          >
            <div class="grid grid-cols-1 gap-2 py-4">
              <p class="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6b66fa] dark:text-[#8b86fa] mb-1">Daftar Achievement</p>
              <div
                v-for="ach in sortedAchievements"
                :key="ach.id"
                class="flex items-center gap-3 p-2.5 rounded-[6px] border transition-all"
                :class="ach.unlocked 
                  ? 'bg-white dark:bg-[#262626] border-[#6b66fa]/30 dark:border-neutral-700 shadow-sm' 
                  : 'bg-[#fafafa] dark:bg-[#262626] border-[#eee] dark:border-neutral-700 grayscale opacity-60'"
              >
                <div 
                  class="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors"
                  :class="ach.unlocked ? 'bg-yellow-200 dark:bg-amber-400' : 'bg-gray-200 dark:bg-neutral-700'"
                >
                  <img src="@/assets/icons/achievement.svg" alt="Achievement" class="w-6 h-6" />
                </div>
                <div class="flex flex-col">
                  <div class="text-[13px] font-bold" :class="ach.unlocked ? 'text-[#262626] dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'">
                    {{ ach.unlocked ? ach.title : '???' }}
                  </div>
                  <div class="text-[11px] leading-tight" :class="ach.unlocked ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-400 dark:text-neutral-500'">
                    {{ ach.unlocked ? ach.description : 'Selesaikan misi rahasia untuk membuka achievement ini.' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Info Tab Stack -->
          <div 
            v-if="!isMobile"
            class="transition-all duration-300 transform absolute inset-4 flex flex-col"
            :class="activeTab === 'Info' ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-4 scale-95 pointer-events-none z-0'"
          >
            <p class="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6b66fa] dark:text-[#8b86fa] mb-3 mt-1 flex-shrink-0">Shortcut Keyboard</p>
            <div class="flex-1 overflow-y-auto pr-4 custom-scrollbar achievement-scroll-mask">
              <div
                v-for="shortcut in shortcuts"
                :key="shortcut.description"
                class="flex items-center justify-between py-3 border-b border-[#f0f0f0] dark:border-neutral-700 last:border-b-0"
              >
                <span class="text-[13px] text-neutral-600 dark:text-neutral-300">{{ shortcut.description }}</span>
                <div class="flex items-center gap-1">
                  <template v-for="(key, idx) in shortcut.keys" :key="key">
                    <span v-if="idx > 0" class="text-[11px] text-[#bbb] dark:text-neutral-500">{{ (shortcut as any).separator || ' + ' }}</span>
                    <kbd class="px-2 py-0.5 text-[11px] font-medium bg-[#f4f4f4] dark:bg-[#262626] border border-[#d8d8d8] dark:border-neutral-600 rounded-[4px] text-neutral-700 dark:text-neutral-200 shadow-[0_1px_0_#c8c8c8] dark:shadow-[0_1px_0_#475569] font-mono">
                      {{ key }}
                    </kbd>
                  </template>
                </div>
              </div>
              <!-- Bottom padding to avoid mask cutting off the last item -->
              <div class="h-6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active {
  transition: all 0.2s ease-out;
}
.modal-fade-leave-active {
  transition: all 0.15s ease-in;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(4px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e2e2;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d0d0d0;
}

.achievement-scroll-mask {
  mask-image: linear-gradient(to bottom, transparent, black 25px, black calc(100% - 25px), transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 25px, black calc(100% - 25px), transparent);
}
</style>
