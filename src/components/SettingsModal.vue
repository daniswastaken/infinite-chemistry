<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  isMobile: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const activeTab = ref('Pengaturan')

const tabs = computed(() => {
  const all = [{ id: 'Pengaturan', label: 'Pengaturan' }]
  if (!props.isMobile) {
    all.push({ id: 'Info', label: 'Info' })
  }
  return all
})

// Reset to first tab when opening
import { watch } from 'vue'
watch(() => props.isOpen, (val) => {
  if (val) activeTab.value = 'Pengaturan'
})

const shortcuts = [
  { keys: ['Tab'], description: 'Search' },
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Klik Kanan'], description: 'Hapus elemen' },
]
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center" @mousedown.self="$emit('close')">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/10 backdrop-blur-[2px]" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-[8px] border border-[#c8c8c8] shadow-[0_8px_30px_rgb(0,0,0,0.1)] w-[380px] max-w-[calc(100vw-32px)] flex flex-col overflow-hidden">
        
        <!-- Header / Tabs -->
        <div class="flex items-end px-2 pt-2 gap-1 border-b border-[#c8c8c8]">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex-1 flex items-center justify-center gap-1.5 px-3 pt-1.5 pb-1 font-medium text-[13px] rounded-t-md border border-[#c8c8c8] transition-colors whitespace-nowrap outline-none"
            :class="activeTab === tab.id
              ? 'bg-white text-black z-10 border-b-white -mb-[1px]'
              : 'bg-[#fafafa] text-black hover:bg-[#f4f4f4] active:bg-[#f4f4f4] border-b-transparent'"
          >
            {{ tab.label }}
          </button>
          <button
            @click="$emit('close')"
            class="ml-auto mb-1 p-1.5 rounded-md hover:bg-[#f4f4f4] active:bg-[#ebebeb] transition-colors text-[#aaa] hover:text-black cursor-pointer outline-none"
            title="Tutup"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-4 grid">
          
          <!-- Pengaturan Tab Stack -->
          <div 
            class="[grid-area:1/1] transition-opacity duration-200"
            :class="activeTab === 'Pengaturan' ? 'opacity-100' : 'opacity-0 pointer-events-none'"
          >
            <!-- Content wrapper to ensure centering for placeholder -->
            <div class="flex flex-col gap-3 min-h-[200px] justify-center">
              <p class="text-[13px] text-[#aaa] text-center">Pengaturan akan segera hadir.</p>
            </div>
          </div>

          <!-- Info Tab Stack (Desktop Only) -->
          <div 
            v-if="!isMobile"
            class="[grid-area:1/1] transition-opacity duration-200"
            :class="activeTab === 'Info' ? 'opacity-100' : 'opacity-0 pointer-events-none'"
          >
            <div class="flex flex-col gap-1">
              <p class="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6b66fa] mb-2">Shortcut Keyboard</p>
              <div
                v-for="shortcut in shortcuts"
                :key="shortcut.description"
                class="flex items-center justify-between py-1.5 border-b border-[#f0f0f0] last:border-b-0"
              >
                <span class="text-[13px] text-slate-600">{{ shortcut.description }}</span>
                <div class="flex items-center gap-1">
                  <template v-for="(key, idx) in shortcut.keys" :key="key">
                    <span v-if="idx > 0" class="text-[11px] text-[#bbb]">{{ (shortcut as any).separator || ' + ' }}</span>
                    <kbd class="px-2 py-0.5 text-[11px] font-medium bg-[#f4f4f4] border border-[#d8d8d8] rounded-[4px] text-slate-700 shadow-[0_1px_0_#c8c8c8] font-mono">
                      {{ key }}
                    </kbd>
                  </template>
                </div>
              </div>
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
</style>
