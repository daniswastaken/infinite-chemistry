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
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Selesaikan mode tantangan pada waktu 12 PM – 2 AM.'
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Selesaikan mode tantangan pada waktu 5 AM – 7 AM.'
  },
  {
    id: 'kok_susah_ya',
    title: '“Kok susah , ya?”',
    description: 'Dalam 8 detik, tekan tombol mode tantangan setidaknya 10 kali.'
  },
  {
    id: 'win_streak_10',
    title: 'Kemenangan Ada di Tangan',
    description: 'Menangkan mode tantangan 10 kali berturut-turut.'
  },
  {
    id: 'win_streak_25',
    title: 'Alkemis',
    description: 'Menangkan mode tantangan 25 kali berturut-turut.'
  },
  {
    id: 'win_8_in_3m',
    title: 'Membara',
    description: 'Menangkan setidaknya 8 mode tantangan dalam waktu 3 menit.'
  },
  {
    id: 'clear_canvas_first',
    title: 'Antara Ada dan Tiada',
    description: 'Gunakan Hapus Semua untuk pertama kalinya.'
  },
  {
    id: 'covalent_10',
    title: 'Pemandu Kovalen',
    description: 'Bentuk setidaknya 10 ikatan kovalen baru.'
  },
  {
    id: 'ionic_10',
    title: 'Pemandu Ion',
    description: 'Bentuk setidaknya 10 ikatan ion/poliatomik baru.'
  },
  {
    id: 'total_games_25',
    title: 'Lilin Menyala di Tengah Angin',
    description: 'Total menang/kalah mode tantangan mencapai 25.'
  },
  {
    id: 'close_call_01',
    title: 'Berserah Pada Takdir',
    description: 'Menangkan tantangan dengan sisa waktu kurang dari 0.1 detik.'
  },
  {
    id: 'lose_streak_5',
    title: 'Melalui Kabut',
    description: 'Kalah mode tantangan 5 kali berturut-turut.'
  },
  {
    id: 'failed_bond_3s',
    title: 'Tepi Kabut',
    description: 'Gagal mereaksikan elemen 5 kali dalam waktu 3 detik.'
  },
  {
    id: 'lose_streak_10',
    title: 'Ikatan Yang Terputus',
    description: 'Kalah mode tantangan 10 kali berturut-turut.'
  },
  {
    id: 'covalent_25',
    title: 'Seni Kovalen',
    description: 'Bentuk setidaknya 25 ikatan kovalen baru.'
  },
  {
    id: 'ionic_25',
    title: 'Seni Ion',
    description: 'Bentuk setidaknya 25 ikatan ion/poliatomik baru.'
  },
  {
    id: 'dark_mode_first',
    title: 'Senandung Bulan Hampa',
    description: 'Gunakan mode gelap untuk pertama kalinya.'
  },
  {
    id: 'dark_mode_gabut',
    title: 'Cahaya Bulan Siang',
    description: 'Tekan tombol mode gelap 10 kali dalam 5 detik.'
  },
  {
    id: 'sidebar_delete_5',
    title: 'Bermimpi Melalui Kanvas',
    description: 'Hapus elemen dari kanvas sebanyak 5 kali.'
  },
  {
    id: 'total_games_50',
    title: 'Menang dan Kalah',
    description: 'Total menang/kalah mode tantangan mencapai 50.'
  },
  {
    id: 'covalent_50',
    title: 'Penstabil Kovalen',
    description: 'Bentuk setidaknya 50 ikatan kovalen baru.'
  },
  {
    id: 'ionic_50',
    title: 'Penstabil Ion',
    description: 'Bentuk setidaknya 50 ikatan ion/poliatomik baru.'
  },
  {
    id: 'h2o_5',
    title: 'Mata Air Segala Penjuru',
    description: 'Bentuk senyawa H2O sebanyak 5 kali.'
  },
  {
    id: 'h2o_10',
    title: 'Sejernih Embun Pagi',
    description: 'Bentuk senyawa H2O sebanyak 10 kali.'
  },
  {
    id: 'h2o_25',
    title: 'Intinya, air',
    description: 'Bentuk senyawa H2O sebanyak 25 kali.'
  },
  {
    id: 'xe_bond_first',
    title: 'Anekdot',
    description: 'Buat ikatan dengan Xenon (Xe) untuk pertama kalinya.'
  },
  {
    id: 'all_shortcuts',
    title: 'Intermeso',
    description: 'Gunakan semua shortcut yang tersedia setidaknya sekali.'
  },
  {
    id: 'dark_mode_8',
    title: 'Pelita Siang dan Malam',
    description: 'Matikan dan hidupkan mode gelap sebanyak 8 kali.'
  },
  {
    id: 'achievement_tab_10',
    title: 'Perjalanan Alkemis',
    description: 'Buka tab Achievement di Pengaturan setidaknya 10 kali.'
  },
  {
    id: 'sidebar_delete_10',
    title: 'Maha Mahakarya',
    description: 'Hapus elemen dari kanvas sebanyak 10 kali.'
  },
  {
    id: 'element_tab_10',
    title: 'Ini dan Itu',
    description: 'Buka tab Elemen di sidebar setidaknya 10 kali.'
  },
  {
    id: 'playtime_30m',
    title: 'Penderitaan Fana',
    description: 'Mencapai total waktu bermain 30 menit.'
  },
  {
    id: 'playtime_60m',
    title: 'Spesialis Elemen',
    description: 'Mencapai total waktu bermain 60 menit.'
  },
  {
    id: 'playtime_118m',
    title: 'Di Balik Tirai Sihir',
    description: 'Mencapai total waktu bermain 118 menit.'
  },
  {
    id: 'nacl_first',
    title: 'Dapur Kimia',
    description: 'Bentuk senyawa NaCl untuk pertama kalinya.'
  },
  {
    id: 'return_1w',
    title: 'Pertemuan Dunia Lain',
    description: 'Bermain kembali setelah 1 minggu tidak aktif.'
  },
  {
    id: 'same_element_move_8',
    title: 'Elemen Delapan Bangsa',
    description:
      'Pindahkan boks elemen yang sama sebanyak 8 kali tanpa melepaskannya ke elemen lain.'
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
  const STATS_KEY = 'ic_achievement_stats'

  function loadStatsFromStorage() {
    try {
      const raw = localStorage.getItem(STATS_KEY)
      if (raw) return JSON.parse(raw)
    } catch (_) {}
    return {
      winCounts: { pemula: 0, sepuh: 0, alkemis: 0 } as Record<string, number>,
      totalWins: 0,
      totalLosses: 0,
      winStreak: 0,
      loseStreak: 0,
      covalentBonds: 0,
      ionicBonds: 0,
      h2oBonds: 0,
      darkToggleCount: 0,
      achievementTabOpens: 0,
      elementTabOpens: 0,
      sidebarDeletes: 0,
      playDurationSecs: 0,
      lastPlayedAt: 0,
      shortcutUses: [] as string[]
    }
  }

  function saveStatsToStorage(statsObj: any) {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(statsObj))
    } catch (_) {}
  }

  // Load persisted unlock state
  const unlockedMap = ref<Record<string, number>>(loadUnlockedFromStorage())
  const stats = ref(loadStatsFromStorage())

  // Save stats whenever it changes
  function saveStats() {
    saveStatsToStorage(stats.value)
  }

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

  const winTimestamps = ref<number[]>([])
  const failedBondTimestamps = ref<number[]>([])
  const darkModeTimestamps = ref<number[]>([])
  const gabutChallengeTimestamps = ref<number[]>([])

  // Button press timestamps for \"Gabut\" detection
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
    const now = Date.now()
    stats.value.winCounts[difficulty] = (stats.value.winCounts[difficulty] || 0) + 1
    stats.value.totalWins++
    stats.value.winStreak++
    stats.value.loseStreak = 0
    saveStats()

    // First win achievements
    if (difficulty === 'pemula') unlock('win_pemula_first')
    if (difficulty === 'sepuh') unlock('win_sepuh_first')
    if (difficulty === 'alkemis') unlock('win_alkemis_first')

    // 25 win achievements
    if (difficulty === 'pemula' && stats.value.winCounts.pemula >= 25) unlock('win_pemula_25')
    if (difficulty === 'sepuh' && stats.value.winCounts.sepuh >= 25) unlock('win_sepuh_25')
    if (difficulty === 'alkemis' && stats.value.winCounts.alkemis >= 25) unlock('win_alkemis_25')

    // Win streak achievements
    if (stats.value.winStreak >= 5) unlock('win_streak_5')
    if (stats.value.winStreak >= 10) unlock('win_streak_10')
    if (stats.value.winStreak >= 25) unlock('win_streak_25')

    // Close call achievement
    if (timeLeft <= 1.9) unlock('close_call')
    if (timeLeft < 0.1) unlock('close_call_01')

    // Total games
    const totalGames = stats.value.totalWins + stats.value.totalLosses
    if (totalGames >= 25) unlock('total_games_25')
    if (totalGames >= 50) unlock('total_games_50')

    // Time of day checks
    const h = new Date().getHours()
    if (h >= 0 && h < 2) unlock('night_owl')
    if (h >= 5 && h < 7) unlock('early_bird')

    // Win 8 times in 3 minutes
    winTimestamps.value.push(now)
    winTimestamps.value = winTimestamps.value.filter((ts) => now - ts <= 180000)
    if (winTimestamps.value.length >= 8) unlock('win_8_in_3m')
  }

  // Called by RRE store on lose
  function onChallengeLose(difficulty: string) {
    stats.value.totalLosses++
    stats.value.winStreak = 0
    stats.value.loseStreak++
    saveStats()

    if (difficulty === 'pemula') unlock('fail_pemula_first')

    if (stats.value.loseStreak >= 5) unlock('lose_streak_5')
    if (stats.value.loseStreak >= 10) unlock('lose_streak_10')

    const totalGames = stats.value.totalWins + stats.value.totalLosses
    if (totalGames >= 25) unlock('total_games_25')
    if (totalGames >= 50) unlock('total_games_50')
  }

  function recordChallengeModeClick() {
    const now = Date.now()
    gabutChallengeTimestamps.value.push(now)
    gabutChallengeTimestamps.value = gabutChallengeTimestamps.value.filter((ts) => now - ts <= 8000)
    if (gabutChallengeTimestamps.value.length >= 10) {
      unlock('kok_susah_ya')
    }
  }

  // Called when a button (atomic mode / formula toggle) is pressed
  function recordButtonPress() {
    const now = Date.now()
    buttonPressTimestamps.value.push(now)
    // Prune timestamps older than 5 seconds
    buttonPressTimestamps.value = buttonPressTimestamps.value.filter((ts) => now - ts <= 5000)
    if (buttonPressTimestamps.value.length >= 10) {
      unlock('gabut')
    }
  }

  // Called when a compound is formed to check for large component counts
  function checkComponentAchievements(components: Record<string, number>) {
    for (const [comp, count] of Object.entries(components)) {
      if (count >= 1000) {
        unlock('big_element_1000')
      } else if (count >= 100) {
        unlock('big_element_100')
      }
      if (comp === 'Xe') {
        unlock('xe_bond_first')
      }
    }
  }

  function recordClearCanvas() {
    unlock('clear_canvas_first')
  }

  function recordCovalentBond() {
    stats.value.covalentBonds++
    saveStats()
    if (stats.value.covalentBonds >= 10) unlock('covalent_10')
    if (stats.value.covalentBonds >= 25) unlock('covalent_25')
    if (stats.value.covalentBonds >= 50) unlock('covalent_50')
  }

  function recordIonicBond() {
    stats.value.ionicBonds++
    saveStats()
    if (stats.value.ionicBonds >= 10) unlock('ionic_10')
    if (stats.value.ionicBonds >= 25) unlock('ionic_25')
    if (stats.value.ionicBonds >= 50) unlock('ionic_50')
  }

  function recordH2oBond() {
    stats.value.h2oBonds++
    saveStats()
    if (stats.value.h2oBonds >= 5) unlock('h2o_5')
    if (stats.value.h2oBonds >= 10) unlock('h2o_10')
    if (stats.value.h2oBonds >= 25) unlock('h2o_25')
  }

  function recordNaclBond() {
    unlock('nacl_first')
  }

  function recordXeBond() {
    unlock('xe_bond_first')
  }

  function recordBond(compound: any) {
    if (compound.bondType === 'covalent') {
      recordCovalentBond()
    } else if (compound.bondType === 'ionic' || compound.bondType === 'ionic-atomic') {
      recordIonicBond()
    }

    // Specific compound checks
    const formula = compound.formula
    if (formula === 'H₂O' || formula === 'H2O') {
      recordH2oBond()
    }
    if (formula === 'NaCl') {
      recordNaclBond()
    }
  }

  function recordFailedBond() {
    const now = Date.now()
    failedBondTimestamps.value.push(now)
    failedBondTimestamps.value = failedBondTimestamps.value.filter((ts) => now - ts <= 3000)
    if (failedBondTimestamps.value.length >= 5) unlock('failed_bond_3s')
  }

  function recordDarkModeToggle() {
    unlock('dark_mode_first')
    stats.value.darkToggleCount++
    saveStats()
    if (stats.value.darkToggleCount >= 8) unlock('dark_mode_8')

    const now = Date.now()
    darkModeTimestamps.value.push(now)
    darkModeTimestamps.value = darkModeTimestamps.value.filter((ts) => now - ts <= 5000)
    if (darkModeTimestamps.value.length >= 10) unlock('dark_mode_gabut')
  }

  function recordAchievementTabOpen() {
    stats.value.achievementTabOpens++
    saveStats()
    if (stats.value.achievementTabOpens >= 10) unlock('achievement_tab_10')
  }

  function recordElementTabOpen() {
    stats.value.elementTabOpens++
    saveStats()
    if (stats.value.elementTabOpens >= 10) unlock('element_tab_10')
  }

  function recordSidebarDelete() {
    stats.value.sidebarDeletes++
    saveStats()
    if (stats.value.sidebarDeletes >= 5) unlock('sidebar_delete_5')
    if (stats.value.sidebarDeletes >= 10) unlock('sidebar_delete_10')
  }

  function recordShortcutUse(shortcut: string) {
    if (!stats.value.shortcutUses.includes(shortcut)) {
      stats.value.shortcutUses.push(shortcut)
      saveStats()
      if (stats.value.shortcutUses.length >= 5) {
        unlock('all_shortcuts')
      }
    }
  }

  // To track same element moving around
  let lastMovedElementId = ''
  let sameElementMoves = 0

  function recordElementMove(elementId: string) {
    if (elementId === lastMovedElementId) {
      sameElementMoves++
      if (sameElementMoves >= 8) {
        unlock('same_element_move_8')
      }
    } else {
      lastMovedElementId = elementId
      sameElementMoves = 1
    }
  }

  // Time tracking
  let lastPlaytimeCheck = Date.now()
  setInterval(() => {
    const now = Date.now()
    const deltaMs = now - lastPlaytimeCheck
    lastPlaytimeCheck = now

    // Accumulate duration in seconds (handle as float to be precise, then check milestones)
    stats.value.playDurationSecs += deltaMs / 1000

    // Check milestones and save every ~60s
    if (Math.floor(stats.value.playDurationSecs) % 60 === 0 && deltaMs > 0) {
      saveStats()
      const totalMins = Math.floor(stats.value.playDurationSecs / 60)
      if (totalMins >= 30) unlock('playtime_30m')
      if (totalMins >= 60) unlock('playtime_60m')
      if (totalMins >= 118) unlock('playtime_118m')
    }
  }, 1000)

  // Inactivity tracking check
  function checkFirstDrop() {
    unlock('first_drop')
    const now = Date.now()
    if (stats.value.lastPlayedAt > 0) {
      const oneWeek = 7 * 24 * 60 * 60 * 1000
      if (now - stats.value.lastPlayedAt >= oneWeek) {
        unlock('return_1w')
      }
    }
    stats.value.lastPlayedAt = now
    saveStats()
  }

  // Before unload to save latest duration
  window.addEventListener('beforeunload', () => {
    stats.value.lastPlayedAt = Date.now()
    saveStats()
  })

  return {
    achievements,
    pendingToast,
    stats,
    unlock,
    isUnlocked,
    onChallengeWin,
    onChallengeLose,
    recordChallengeModeClick,
    recordButtonPress,
    checkComponentAchievements,
    recordClearCanvas,
    recordCovalentBond,
    recordIonicBond,
    recordH2oBond,
    recordNaclBond,
    recordXeBond,
    recordBond,
    recordFailedBond,
    recordDarkModeToggle,
    recordAchievementTabOpen,
    recordElementTabOpen,
    recordSidebarDelete,
    recordShortcutUse,
    recordElementMove,
    checkFirstDrop
  }
})
