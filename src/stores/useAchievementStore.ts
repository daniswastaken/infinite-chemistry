import { defineStore } from 'pinia'
import { ref } from 'vue'
import { playSound } from '@/utils/audio'

export interface Achievement {
  id: string
  title: string
  unlocked: boolean
}

const STORAGE_KEY = 'ic_achievements'

const ACHIEVEMENTS_DEFINITION: { id: string; title: string }[] = [
  { id: 'dev_debug', title: 'Developer atau Hacker?' },
  { id: 'first_drop', title: 'Pena Sang Alkemis' },
  { id: 'messy_canvas', title: 'Berantakan, ya.' },
  { id: 'big_element_100', title: 'Dedikasi Tinggi' },
  { id: 'big_element_1000', title: 'How Did We Get Here?' },
  { id: 'win_pemula_first', title: 'Eh, aku murid teladan?' },
  { id: 'win_sepuh_first', title: 'Ajarin dong~' },
  { id: 'win_alkemis_first', title: 'Rhinedottir?' },
  { id: 'win_pemula_25', title: '"Iya, pertahankan ya!"' },
  { id: 'win_sepuh_25', title: '"Sombong ya~"' },
  { id: 'win_alkemis_25', title: 'Atau Naberius?' },
  { id: 'win_streak_5', title: 'I Understand It Now' },
  { id: 'close_call', title: 'Huft, hampir saja' },
  { id: 'fail_pemula_first', title: '"Apaan sih ini?"' },
  { id: 'gabut', title: 'Gabut, ya?' }
]

function loadUnlockedFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return new Set<string>(parsed)
    }
  } catch (_) {
    /* ignore */
  }
  return new Set()
}

function saveUnlockedToStorage(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch (_) {
    /* ignore */
  }
}

export const useAchievementStore = defineStore('achievements', () => {
  // Load persisted unlock state
  const unlockedIds = new Set<string>(loadUnlockedFromStorage())

  const achievements = ref<Achievement[]>(
    ACHIEVEMENTS_DEFINITION.map((def) => ({
      ...def,
      unlocked: unlockedIds.has(def.id)
    }))
  )

  // Toast queue - one at a time
  const pendingToast = ref<Achievement | null>(null)
  let toastTimeout: number | null = null

  // Per-difficulty win counts
  const winCounts = ref<Record<string, number>>({
    pemula: 0,
    sepuh: 0,
    alkemis: 0
  })

  // Consecutive win streak
  const winStreak = ref(0)

  // Button press timestamps for "Gabut" detection
  const buttonPressTimestamps = ref<number[]>([])

  function isUnlocked(id: string): boolean {
    return unlockedIds.has(id)
  }

  function unlock(id: string) {
    if (isUnlocked(id)) return
    const achievement = achievements.value.find((a) => a.id === id)
    if (!achievement) return

    achievement.unlocked = true
    unlockedIds.add(id)
    saveUnlockedToStorage(unlockedIds)

    showToast(achievement)
  }

  function showToast(achievement: Achievement) {
    if (toastTimeout !== null) {
      clearTimeout(toastTimeout)
    }
    pendingToast.value = achievement
    playSound('achievement')
    toastTimeout = window.setTimeout(() => {
      pendingToast.value = null
      toastTimeout = null
    }, 4000)
  }

  // Called by RRE store on win
  function onChallengeWin(difficulty: string, timeLeft: number) {
    // Increment counts
    winCounts.value[difficulty] = (winCounts.value[difficulty] || 0) + 1
    winStreak.value++

    // First win achievements
    if (difficulty === 'pemula') unlock('win_pemula_first')
    if (difficulty === 'sepuh') unlock('win_sepuh_first')
    if (difficulty === 'alkemis') unlock('win_alkemis_first')

    // 25 win achievements
    if (difficulty === 'pemula' && winCounts.value.pemula >= 25) unlock('win_pemula_25')
    if (difficulty === 'sepuh' && winCounts.value.sepuh >= 25) unlock('win_sepuh_25')
    if (difficulty === 'alkemis' && winCounts.value.alkemis >= 25) unlock('win_alkemis_25')

    // Win streak achievement
    if (winStreak.value >= 5) unlock('win_streak_5')

    // Close call achievement (≤1.9 seconds remaining)
    if (timeLeft <= 1.9) unlock('close_call')
  }

  // Called by RRE store on lose
  function onChallengeLose(difficulty: string) {
    // Reset win streak on any loss
    winStreak.value = 0

    if (difficulty === 'pemula') unlock('fail_pemula_first')
  }

  // Called when a button (atomic mode / formula toggle) is pressed
  function recordButtonPress() {
    const now = Date.now()
    buttonPressTimestamps.value.push(now)
    // Prune timestamps older than 10 seconds
    buttonPressTimestamps.value = buttonPressTimestamps.value.filter((ts) => now - ts <= 10000)
    if (buttonPressTimestamps.value.length >= 10) {
      unlock('gabut')
    }
  }

  return {
    achievements,
    pendingToast,
    unlock,
    isUnlocked,
    onChallengeWin,
    onChallengeLose,
    recordButtonPress
  }
})
