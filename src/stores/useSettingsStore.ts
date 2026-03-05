import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Difficulty = 'alkemis' | 'sepuh' | 'pemula'

export const useSettingsStore = defineStore('settings', () => {
  const difficulty = ref<Difficulty>('pemula')

  const isDarkMode = ref(
    localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  const timeLimit = computed(() => {
    if (difficulty.value === 'alkemis') return 15
    if (difficulty.value === 'sepuh') return 30
    return 60 // pemula
  })

  const hasClue = computed(() => difficulty.value === 'pemula')

  function setDifficulty(d: Difficulty) {
    difficulty.value = d
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')

    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return {
    difficulty,
    timeLimit,
    hasClue,
    setDifficulty,
    isDarkMode,
    toggleDarkMode
  }
})
