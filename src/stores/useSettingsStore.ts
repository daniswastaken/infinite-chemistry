import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Difficulty = 'alkemis' | 'sepuh' | 'pemula'

export const useSettingsStore = defineStore('settings', () => {
  const difficulty = ref<Difficulty>('pemula')

  const timeLimit = computed(() => {
    if (difficulty.value === 'alkemis') return 15
    if (difficulty.value === 'sepuh') return 30
    return 60 // pemula
  })

  const hasClue = computed(() => difficulty.value === 'pemula')

  function setDifficulty(d: Difficulty) {
    difficulty.value = d
  }

  return {
    difficulty,
    timeLimit,
    hasClue,
    setDifficulty
  }
})
