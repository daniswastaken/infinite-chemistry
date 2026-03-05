import { defineStore } from 'pinia'
import { ref } from 'vue'
import { playSound } from '@/utils/audio'

export interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: number
}

const STORAGE_KEY = 'ic_achievements'

const ACHIEVEMENTS_DEFINITION: { id: string; title: string; description: string }[] = [
  {
    id: 'dev_debug',
    title: 'Developer atau Hacker?',
    description: 'Aktifkan mode debug dengan kode rahasia.'
  },
  {
    id: 'first_drop',
    title: 'Pena Sang Alkemis',
    description: 'Letakkan elemen pertama di kanvas.'
  },
  {
    id: 'messy_canvas',
    title: 'Berantakan, ya.',
    description: 'Miliki setidaknya 25 elemen di kanvas (10 di mobile).'
  },
  {
    id: 'big_element_100',
    title: 'Dedikasi Tinggi',
    description: 'Buat senyawa dengan salah satu komponen mencapai 100x.'
  },
  {
    id: 'big_element_1000',
    title: 'How Did We Get Here?',
    description: 'Buat senyawa dengan salah satu komponen mencapai 1000x.'
  },
  {
    id: 'win_pemula_first',
    title: 'Eh, aku murid teladan?',
    description: 'Selesaikan tantangan tingkat Pemula untuk pertama kalinya.'
  },
  {
    id: 'win_sepuh_first',
    title: 'Ajarin dong~',
    description: 'Selesaikan tantangan tingkat Sepuh untuk pertama kalinya.'
  },
  {
    id: 'win_alkemis_first',
    title: 'Rhinedottir?',
    description: 'Selesaikan tantangan tingkat Alkemis untuk pertama kalinya.'
  },
  {
    id: 'win_pemula_25',
    title: '"Iya, pertahankan ya!"',
    description: 'Selesaikan tantangan tingkat Pemula sebanyak 25 kali.'
  },
  {
    id: 'win_sepuh_25',
    title: '"Sombong ya~"',
    description: 'Selesaikan tantangan tingkat Sepuh sebanyak 25 kali.'
  },
  {
    id: 'win_alkemis_25',
    title: 'Atau Naberius?',
    description: 'Selesaikan tantangan tingkat Alkemis sebanyak 25 kali.'
  },
  {
    id: 'win_streak_5',
    title: 'I Understand It Now',
    description: 'Capai 5 kemenangan beruntun dalam mode tantangan.'
  },
  {
    id: 'close_call',
    title: 'Huft, hampir saja',
    description: 'Selesaikan tantangan dengan waktu kurang dari 2 detik.'
  },
  {
    id: 'fail_pemula_first',
    title: '"Apaan sih ini?"',
    description: 'Gagal dalam tantangan tingkat Pemula untuk pertama kalinya.'
  },
  {
    id: 'gabut',
    title: 'Gabut, ya?',
    description: 'Tekan tombol mode berulang kali dalam waktu singkat.'
  }
]

function loadUnlockedFromStorage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migration: if it's an old array format, convert to object with current timestamp
      if (Array.isArray(parsed)) {
        const obj: Record<string, number> = {}
        parsed.forEach((id) => {
          obj[id] = Date.now()
        })
        return obj
      }
      return parsed
    }
  } catch (_) {
    /* ignore */
  }
  return {}
}

function saveUnlockedToStorage(unlockedMap: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedMap))
  } catch (_) {
    /* ignore */
  }
}

export const useAchievementStore = defineStore('achievements', () => {
  // Load persisted unlock state
  const unlockedMap = ref<Record<string, number>>(loadUnlockedFromStorage())

  const achievements = ref<Achievement[]>(
    ACHIEVEMENTS_DEFINITION.map((def) => ({
      ...def,
      unlocked: !!unlockedMap.value[def.id],
      unlockedAt: unlockedMap.value[def.id]
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
    return !!unlockedMap.value[id]
  }

  function unlock(id: string) {
    if (isUnlocked(id)) return
    const achievement = achievements.value.find((a) => a.id === id)
    if (!achievement) return

    const now = Date.now()
    achievement.unlocked = true
    achievement.unlockedAt = now
    unlockedMap.value[id] = now
    saveUnlockedToStorage(unlockedMap.value)

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
