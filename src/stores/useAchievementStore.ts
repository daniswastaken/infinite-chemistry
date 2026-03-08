import { defineStore } from 'pinia'
import { ref } from 'vue'
import { playSound } from '@/utils/audio'
import { useRreStore } from '@/stores/useRreStore'

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
    title: '“Kok susah, ya?”',
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
    id: 'sidebar_delete_15',
    title: 'Bermimpi Melalui Kanvas',
    description: 'Hapus elemen dari kanvas sebanyak 15 kali.'
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
    description: 'Bentuk senyawa H₂O sebanyak 5 kali.'
  },
  {
    id: 'h2o_10',
    title: 'Sejernih Embun Pagi',
    description: 'Bentuk senyawa H₂O sebanyak 10 kali.'
  },
  {
    id: 'h2o_25',
    title: 'Intinya, air',
    description: 'Bentuk senyawa H₂O sebanyak 25 kali.'
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
    id: 'sidebar_delete_30',
    title: 'Maha Mahakarya',
    description: 'Hapus elemen dari kanvas sebanyak 30 kali.'
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
    title: 'Aliran Elemental',
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
  },
  {
    id: 'hesitant_scientist',
    title: 'Ilmuwan yang Ragu',
    description: 'Ganti target Mode Tantangan sebanyak 20 kali tanpa menyelesaikan tantangan.'
  },
  {
    id: 'credits_seen',
    title: 'Obrolan di Tepi Perapian',
    description: 'Buka layar kredit untuk pertama kalinya.'
  },
  {
    id: 'searching_answers',
    title: 'Mencari Jawaban',
    description: 'Lakukan 10 pencarian di sidebar dalam waktu < 30 detik.'
  },
  {
    id: 'mysterious_compound',
    title: 'Senyawa Misterius',
    description: 'Reaksikan elemen yang tidak kompatibel 20 kali berturut-turut.'
  },
  {
    id: 'cracked_beaker',
    title: 'Gelas Kimia yang Retak',
    description: "Gagal di tingkat 'Alkemis' sebanyak 3 kali berturut-turut."
  },
  {
    id: 'dynamic_equilibrium',
    title: 'Terang dan Gelap, Senja dan Subuh',
    description: 'Miliki jumlah senyawa Ionik dan Kovalen yang sama di kanvas.'
  },
  {
    id: 'warm_hearth',
    title: 'Perapian yang Hangat',
    description: 'Biarkan layar kredit terbuka selama lebih dari 30 detik.'
  },
  {
    id: 'organized_alchemist',
    title: 'Alkemis yang Terorganisir',
    description: 'Berpindah antara tab Ion dan Kovalen sebanyak 20 kali.'
  },
  {
    id: 'sweet_dreams',
    title: 'Mimpi Indah, Alkemis',
    description: 'Lakukan reaksi setelah idle selama lebih dari 10 menit.'
  },
  {
    id: 'academic_block',
    title: 'Kebuntuan Akademik',
    description: 'Diam di layar kanvas tanpa interaksi selama 5 menit.'
  },
  {
    id: 'greedy_collector',
    title: 'Timbunan Harta yang Melimpah',
    description: 'Tarik 30 elemen berurutan dari sidebar tanpa melakukan satupun reaksi.'
  },
  {
    id: 'lightning_thumb',
    title: 'Secepat Kilat',
    description: "Selesaikan mode 'Pemula' dalam waktu kurang dari 5 detik."
  },
  {
    id: 'catalyst',
    title: 'Katalisator',
    description: 'Lakukan 5 reaksi sukses beruntun dengan cepat.'
  },
  {
    id: 'chain_reaction',
    title: 'Reaksi Berantai',
    description: 'Lakukan 10 reaksi sukses beruntun tanpa ada satu pun yang gagal.'
  },
  {
    id: 'stubborn_head',
    title: 'Ribuan Tempaan',
    description: 'Gagal mereaksikan 2 elemen yang sama persis sebanyak 10 kali berturut-turut.'
  },
  {
    id: 'first_sight',
    title: 'Pandangan Pertama',
    description: 'Klik logo "Infinite Chemistry" di pojok kiri atas 1 kali.'
  },
  {
    id: 'conventional_alchemist',
    title: 'Alkemis Konvensional',
    description: 'Selesaikan 10 reaksi berturut-turut tanpa mengganti mode.'
  },
  {
    id: 'forgetful',
    title: 'Pintu yang Tak Pernah Tertutup',
    description: 'Buka tutup tab Pengaturan sebanyak 10 kali dalam satu sesi.'
  },
  {
    id: 'panic_mode',
    title: 'Panik!',
    description:
      'Di sisa waktu Mode Tantangan kurang dari 5 detik, lakukan minimal 10 kali drag & drop.'
  },
  {
    id: 'precision_scientist',
    title: 'Ilmuwan Presisi',
    description: 'Drag elemen hingga overlap sempurna dengan elemen lain.'
  },
  {
    id: 'anti_establishment',
    title: 'Kemurnian Elemen yang Hakiki',
    description:
      "Menangkan Mode Tantangan tingkat 'Alkemis' 5x hanya menggunakan elemen Golongan Utama."
  },
  {
    id: 'abstract_artist',
    title: 'Seniman Abstrak',
    description: 'Miliki 15 senyawa berbeda di kanvas secara bersamaan.'
  },
  {
    id: 'hydrophile',
    title: 'Seribu Mata Air Mengalir',
    description: 'Ada 10 elemen box H₂O di atas kanvas secara bersamaan.'
  },
  {
    id: 'fortune_teller',
    title: 'Bintang Berpihak',
    description: 'Terlambat 1 detik dalam menyelesaikan Mode Tantangan.'
  },
  {
    id: 'symphony_of_destruction',
    title: 'Simfoni Kehancuran',
    description: "Gunakan tombol 'Hapus Semua' 3 kali dalam waktu 10 detik."
  },
  {
    id: 'marathon_runner',
    title: 'Langkah yang Tak Kunjung Berhenti',
    description: 'Bermain satu sesi penuh tanpa jeda selama 2 jam non-stop.'
  },
  {
    id: 'self_isolation',
    title: 'Isolasi Mandiri',
    description: 'Taruh 1 elemen di ujung pojok layar sementara yang lain di tengah.'
  },
  {
    id: 'ice_age',
    title: 'Zaman Es',
    description: 'Tidak melakukan apapun ketika di dalam Mode Tantangan selama 30 detik.'
  },
  {
    id: 'off_beat',
    title: 'Ketukan Tak Seirama',
    description: 'Klik kanvas kosong sebanyak 50 kali.'
  },
  {
    id: 'lab_assistant',
    title: 'Asisten Lab',
    description: "Selesaikan total 10 tantangan 'Pemula' tanpa menyentuh mode 'Sepuh'."
  },
  {
    id: 'lead_researcher',
    title: 'Peneliti Utama',
    description:
      "Menang Mode Tantangan tingkat 'Sepuh' 5x beruntun menggunakan setengah waktu per ronde."
  },
  {
    id: 'viscosity',
    title: 'Viskositas',
    description: 'Gerakkan sebuah elemen dengan sangat lambat selama 5 detik.'
  },
  {
    id: 'pollution',
    title: 'Bencana di Gelas Kimia',
    description: 'Gagal mereaksikan elemen sebanyak 50 kali.'
  },
  {
    id: 'alchemists_laugh',
    title: 'Tawa Alkemis',
    description: 'Menang Mode Tantangan di sisa waktu tepat 0.01 detik.'
  },
  {
    id: 'gravity_anomaly',
    title: 'Anomali Gravitasi',
    description: 'Tumpuk 5 elemen di satu titik koordinat yang persis sama.'
  },
  {
    id: 'perfect_analysis',
    title: 'Analisis yang Sempurna',
    description: 'Menangkan 5 Mode Tantangan beruntun dengan efisiensi 100%.'
  },
  {
    id: 'scroll_lover',
    title: 'Gulungan Lembaran',
    description: 'Scroll sidebar dari ujung ke ujung sebanyak 5 kali dalam waktu singkat.'
  },
  {
    id: 'one_final_experiment',
    title: 'Satu Eksperimen Terakhir',
    description: 'Hapus sebuah senyawa yang memiliki total lebih dari 10 atom.'
  },
  {
    id: 'the_purist',
    title: 'Sang Puris',
    description: 'Bermain selama 30 menit tanpa menggunakan tombol shortcut keyboard sama sekali.'
  },
  {
    id: 'the_pianist',
    title: 'Pianis',
    description: 'Tekan 4 tombol kontrol secara berurutan dalam waktu singkat.'
  },
  {
    id: 'settings_lover',
    title: 'Peneliti yang Sangat Teliti',
    description: 'Buka menu Pengaturan sebanyak 50 kali.'
  },
  {
    id: 'tri_element',
    title: 'Simfoni Tiga Elemen',
    description: 'Bentuk sebuah senyawa yang terdiri dari 3 unsur berbeda.'
  },
  {
    id: 'broken_cycle',
    title: 'Siklus Terputus',
    description: 'Muat ulang halaman game di tengah-tengah Mode Tantangan.'
  },
  {
    id: 'particle_rain',
    title: 'Hujan Partikel',
    description: 'Miliki tepat 20 elemen (10 di mobile) di kanvas, lalu gunakan tombol Hapus Semua.'
  },
  {
    id: 'lonely_particle',
    title: 'Reuni yang Panjang',
    description: 'Biarkan satu elemen berada di kanvas selama 8 menit tanpa direaksikan.'
  },
  {
    id: 'uncertainty_principle',
    title: 'Prinsip Ketidakpastian',
    description: 'Hover kursor di atas boks elemen selama 1 menit.'
  },
  {
    id: 'activation_energy',
    title: '"Tok, Tok, Tok"',
    description: 'Klik sebuah elemen 10 kali berturut-turut.'
  },
  {
    id: 'orbital',
    title: 'Orbital',
    description: 'Orbit satu elemen mengelilingi elemen lain.'
  },
  {
    id: 'thermal_isolation',
    title: 'Isolasi Termal',
    description: "Gunakan tombol 'Hapus Semua' saat hanya ada 1 elemen tersisa di kanvas."
  },
  {
    id: 'entropy',
    title: 'Entropi',
    description:
      'Miliki 20 elemen di kanvas yang sepenuhnya tersebar di 4 kuadran berbeda secara merata.'
  },
  {
    id: 'element_destroyer',
    title: 'Penghancur Elemen',
    description: 'Hapus total 1000 elemen dari kanvas secara akumulatif.'
  },
  {
    id: 'atomic_dance',
    title: 'Tarian Atom',
    description: 'Geser sebuah elemen sejauh total 10.000 pixel tanpa melepaskannya.'
  },
  {
    id: 'quantum_physics',
    title: 'Kilatan Cahaya yang Melintas',
    description: 'Lakukan drag & drop elemen sebanyak 30 kali dalam 10 detik.'
  },
  {
    id: 'forbidden_magnetism',
    title: 'Magnetisme Terlarang',
    description: 'Tahan sebuah elemen di atas elemen lain yang sejenis selama 10 detik.'
  },
  {
    id: 'perfect_void',
    title: 'Kekosongan Sempurna',
    description: "Klik tombol 'Hapus Semua' saat kanvas sudah benar-benar kosong."
  },
  {
    id: 'cold_reaction',
    title: 'Reaksi Dingin',
    description: 'Segera hapus sebuah senyawa setelah ia terbentuk.'
  },
  {
    id: 'stuck_calculator',
    title: 'Formula yang Tak Berakhir',
    description: 'Bentuk senyawa dengan panjang formula kimia lebih dari 25 karakter.'
  },
  // --- BATCH 6 ---
  {
    id: 'the_wanderer',
    title: 'Sang Pengembara',
    description: 'Membawa sebuah elemen mengunjungi keempat sudut kanvas tanpa melepaskannya.'
  },
  {
    id: 'hidden_illusion',
    title: 'Ilusi yang Tersembunyi',
    description: 'Menggunakan pencarian di sidebar hingga tidak ada hasil sebanyak 5 kali.'
  },
  {
    id: 'twin_stars_dance',
    title: 'Tarian Dua Bintang',
    description: 'Lakukan orbit 25 kali pada sebuah elemen.'
  },
  {
    id: 'fate_turning_point',
    title: 'Titik Balik Takdir',
    description: 'Tekan tombol Undo sebanyak 10 kali dalam waktu 10 detik.'
  },
  {
    id: 'flash_point',
    title: 'Titik Nyala',
    description: 'Selesaikan Mode Tantangan kurang dari 1 detik sejak ronde dimulai.'
  },
  // --- BATCH 7 ---
  {
    id: 'elemental_diversity',
    title: 'Gema Pesona Dunia',
    description: 'Miliki setidaknya 10 jenis unsur yang berbeda di atas kanvas secara bersamaan.'
  },
  {
    id: 'relic_of_the_past',
    title: 'Relik Masa Lalu',
    description: 'Reaksikan elemen yang sudah ada di kanvas selama lebih dari 5 menit.'
  },
  {
    id: 'shimmering_mirage',
    title: 'Fatamorgana Berkilau',
    description: 'Klik sebuah senyawa yang sedang bersinar sebelum ia menghilang.'
  },
  {
    id: 'celestial_order',
    title: 'Tatanan Prinsip Langit',
    description: 'Susun 5 elemen dalam garis horizontal yang sempurna.'
  }
]

function loadUnlockedFromStorage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
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
    const defaults = {
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
      shortcutUses: [] as string[],
      rreTargetSwitches: 0,
      consecutiveBonks: 0,
      consecutiveAlchemistFails: 0,
      tabSwitches: 0,
      lastInteractionTime: Date.now(),
      searchTimestamps: [] as number[],
      greedyCollectorCount: 0,
      catalystStreak: 0,
      lastSuccessTimestamp: 0,
      chainReactionStreak: 0,
      lastFailedPair: '',
      stubbornHeadCount: 0,
      conventionalAlchemistStreak: 0,
      mainGroupOnlyWins: 0,
      clearAllTimestamps: [] as number[],
      sessionContinuousSecs: 0,
      emptyCanvasClicks: 0,
      pemulaOnlyWins: 0,
      sepuhSpeedWinStreak: 0,
      totalBonks: 0,
      perfectRreStreak: 0,
      failedBondsInCurrentRre: 0,
      settingsOpenedCount: 0,
      sessionTimeNoShortcuts: 0,
      scrollLoverTimestamps: [] as number[],
      totalDeletedElements: 0,
      quantumDropTimestamps: [] as number[],
      hiddenIllusionCount: 0,
      undoTimestamps: [] as number[]
    }
    try {
      const raw = localStorage.getItem(STATS_KEY)
      if (raw) {
        return { ...defaults, ...JSON.parse(raw) }
      }
    } catch (_) {}
    return defaults
  }

  function saveStatsToStorage(statsObj: any) {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(statsObj))
    } catch (_) {}
  }

  const unlockedMap = ref<Record<string, number>>(loadUnlockedFromStorage())
  const stats = ref(loadStatsFromStorage())

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

  const pendingToast = ref<Achievement | null>(null)
  let toastTimeout: number | null = null

  const winTimestamps = ref<number[]>([])
  const failedBondTimestamps = ref<number[]>([])
  const darkModeTimestamps = ref<number[]>([])
  const gabutChallengeTimestamps = ref<number[]>([])
  const buttonPressTimestamps = ref<number[]>([])

  const settingsOpenCount = ref(0)
  const panicModeDragCount = ref(0)
  const lastSessionInteraction = ref(Date.now())
  const usedNonMainGroup = ref(false)
  let academicBlockTimeout: number | null = null

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

  function onChallengeWin(difficulty: string, timeLeft: number) {
    const now = Date.now()
    stats.value.winCounts[difficulty] = (stats.value.winCounts[difficulty] || 0) + 1
    stats.value.totalWins++
    stats.value.winStreak++
    stats.value.loseStreak = 0
    saveStats()

    if (difficulty === 'pemula') {
      unlock('win_pemula_first')
      stats.value.pemulaOnlyWins++
      if (stats.value.pemulaOnlyWins >= 10) unlock('lab_assistant')
    }
    if (difficulty === 'sepuh') {
      unlock('win_sepuh_first')
      stats.value.pemulaOnlyWins = 0
    }
    if (difficulty === 'alkemis') unlock('win_alkemis_first')

    if (difficulty === 'pemula' && stats.value.winCounts.pemula >= 25) unlock('win_pemula_25')
    if (difficulty === 'sepuh' && stats.value.winCounts.sepuh >= 25) unlock('win_sepuh_25')
    if (difficulty === 'alkemis' && stats.value.winCounts.alkemis >= 25) unlock('win_alkemis_25')

    if (stats.value.winStreak >= 5) unlock('win_streak_5')
    if (stats.value.winStreak >= 10) unlock('win_streak_10')
    if (stats.value.winStreak >= 25) unlock('win_streak_25')

    if (timeLeft <= 1.9) unlock('close_call')
    if (timeLeft < 0.1) unlock('close_call_01')
    if (Math.abs(timeLeft - 0.01) < 0.005) unlock('alchemists_laugh') // Exact ~0.01 calculation
    if (timeLeft <= 0 && timeLeft >= -1.0) unlock('fortune_teller')

    if (difficulty === 'alkemis' && !usedNonMainGroup.value) {
      stats.value.mainGroupOnlyWins++
      if (stats.value.mainGroupOnlyWins >= 5) unlock('anti_establishment')
    }
    usedNonMainGroup.value = false

    const totalGames = stats.value.totalWins + stats.value.totalLosses
    if (totalGames >= 25) unlock('total_games_25')
    if (totalGames >= 50) unlock('total_games_50')

    const h = new Date().getHours()
    if (h >= 0 && h < 2) unlock('night_owl')
    if (h >= 5 && h < 7) unlock('early_bird')

    if (winTimestamps.value.length >= 8) unlock('win_8_in_3m')
    stats.value.rreTargetSwitches = 0
    saveStats()
  }

  function recordRreWin(difficulty: string, durationSec: number, totalTimeSec: number = 60) {
    if (difficulty === 'pemula' && durationSec <= 5) {
      unlock('lightning_thumb')
    }
    if (difficulty === 'sepuh' && durationSec <= totalTimeSec * 0.5) {
      stats.value.sepuhSpeedWinStreak++
      if (stats.value.sepuhSpeedWinStreak >= 5) {
        unlock('lead_researcher')
      }
    } else if (difficulty === 'sepuh') {
      stats.value.sepuhSpeedWinStreak = 0
    }

    // perfect_analysis: 5 RRE wins in a row with 0 failed bonds
    if (stats.value.failedBondsInCurrentRre === 0) {
      stats.value.perfectRreStreak++
      if (stats.value.perfectRreStreak >= 5) unlock('perfect_analysis')
    } else {
      stats.value.perfectRreStreak = 0
    }
    // Reset round tracking
    stats.value.failedBondsInCurrentRre = 0

    saveStats()
  }

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

    if (difficulty === 'sepuh') {
      stats.value.pemulaOnlyWins = 0
      stats.value.sepuhSpeedWinStreak = 0
    }

    if (difficulty === 'alkemis') {
      stats.value.consecutiveAlchemistFails++
      if (stats.value.consecutiveAlchemistFails >= 3) unlock('cracked_beaker')
    } else {
      stats.value.consecutiveAlchemistFails = 0
    }
    saveStats()
  }

  function recordChallengeModeClick() {
    const now = Date.now()
    gabutChallengeTimestamps.value.push(now)
    gabutChallengeTimestamps.value = gabutChallengeTimestamps.value.filter((ts) => now - ts <= 8000)
    if (gabutChallengeTimestamps.value.length >= 10) {
      unlock('kok_susah_ya')
    }
  }

  function recordButtonPress() {
    const now = Date.now()
    buttonPressTimestamps.value.push(now)
    buttonPressTimestamps.value = buttonPressTimestamps.value.filter((ts) => now - ts <= 5000)
    if (buttonPressTimestamps.value.length >= 10) {
      unlock('gabut')
    }
  }

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

  function recordLogoClick() {
    unlock('first_sight')
  }

  function recordModeToggle() {
    stats.value.conventionalAlchemistStreak = 0
    saveStats()
  }

  function recordSettingsToggle(isOpen: boolean) {
    if (isOpen) {
      settingsOpenCount.value++
      if (settingsOpenCount.value >= 10) {
        unlock('forgetful')
      }
      stats.value.settingsOpenedCount++
      saveStats()
      if (stats.value.settingsOpenedCount >= 50) {
        unlock('settings_lover')
      }
    }
  }

  function recordSidebarAdd() {
    stats.value.greedyCollectorCount++
    if (stats.value.greedyCollectorCount >= 30) {
      unlock('greedy_collector')
    }
  }

  function recordSidebarDelete(box?: any) {
    stats.value.sidebarDeletes++
    saveStats()
    if (stats.value.sidebarDeletes >= 15) unlock('sidebar_delete_15')
    if (stats.value.sidebarDeletes >= 30) unlock('sidebar_delete_30')

    if (box?.createdAt && Object.keys(box.components || {}).length > 1) {
      recordColdReaction(box.createdAt)
    }

    // one_final_experiment: deleting a compound with > 10 total atoms
    if (box?.components) {
      const totalAtoms = Object.values(box.components as Record<string, number>).reduce(
        (sum, count) => sum + count,
        0
      )
      if (totalAtoms > 10) unlock('one_final_experiment')
    }

    stats.value.totalDeletedElements++
    if (stats.value.totalDeletedElements >= 1000) {
      unlock('element_destroyer')
    }
  }

  function recordClearCanvas(boxCount: number = 0, isMobile: boolean = false) {
    unlock('clear_canvas_first')
    const now = Date.now()
    stats.value.clearAllTimestamps.push(now)
    stats.value.clearAllTimestamps = stats.value.clearAllTimestamps.filter(
      (ts: number) => now - ts < 10000
    )
    if (stats.value.clearAllTimestamps.length >= 3) {
      unlock('symphony_of_destruction')
    }

    // particle_rain: must have exactly 20 boxes (10 on mobile) before clearing
    const requiredCount = isMobile ? 10 : 20
    if (boxCount === requiredCount) {
      unlock('particle_rain')
    }

    stats.value.totalDeletedElements += boxCount
    if (stats.value.totalDeletedElements >= 1000) {
      unlock('element_destroyer')
    }

    saveStats()
  }

  function recordPrecisionDrag(deltaX: number, deltaY: number) {
    if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) {
      unlock('precision_scientist')
    }
  }

  function checkCanvasCounts(boxes: any[]) {
    const uniqueFormulas = new Set(boxes.filter((b) => b.formula).map((b) => b.formula))
    if (uniqueFormulas.size >= 15) unlock('abstract_artist')

    const h2oCount = boxes.filter((b) => b.formula === 'H₂O' || b.formula === 'H2O').length
    if (h2oCount >= 10) unlock('hydrophile')

    // celestial_order: 5 boxes with top coordinates within 10px of each other
    if (boxes.length >= 5) {
      const sorted = [...boxes].sort((a, b) => a.top - b.top)
      for (let i = 0; i <= sorted.length - 5; i++) {
        const w = sorted.slice(i, i + 5)
        if (Math.max(...w.map((b) => b.top)) - Math.min(...w.map((b) => b.top)) <= 10) {
          unlock('celestial_order')
          break
        }
      }
    }

    // elemental_diversity: 10 unique element symbols on canvas right now
    const uniqueSymbols = new Set<string>()
    boxes.forEach((box) => {
      if (box.symbol) uniqueSymbols.add(box.symbol)
      if (box.components) {
        Object.keys(box.components).forEach((sym) => uniqueSymbols.add(sym))
      }
    })
    if (uniqueSymbols.size >= 10) unlock('elemental_diversity')
  }

  function recordRreElementUse(groupNumber: number | string) {
    const mainGroups = [1, 2, 13, 14, 15, 16, 17, 18]
    if (typeof groupNumber !== 'number' || !mainGroups.includes(groupNumber)) {
      usedNonMainGroup.value = true
    }
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

  function recordBond(compound: any, sourceBoxCreatedAt?: number) {
    if (compound.bondType === 'covalent') {
      recordCovalentBond()
    } else if (compound.bondType === 'ionic' || compound.bondType === 'ionic-atomic') {
      recordIonicBond()
    }

    const formula = compound.formula
    recordStuckCalculator(compound)

    if (formula === 'H₂O' || formula === 'H2O') {
      recordH2oBond()
    }
    if (formula === 'NaCl') {
      recordNaclBond()
    }

    const now = Date.now()
    const idleTime = now - stats.value.lastInteractionTime
    if (idleTime > 10 * 60 * 1000) {
      unlock('sweet_dreams')
    }
    recordInteraction()

    stats.value.consecutiveBonks = 0
    stats.value.greedyCollectorCount = 0

    if (stats.value.lastSuccessTimestamp && now - stats.value.lastSuccessTimestamp < 2000) {
      stats.value.catalystStreak++
      if (stats.value.catalystStreak >= 5) unlock('catalyst')
    } else {
      stats.value.catalystStreak = 1
    }
    stats.value.lastSuccessTimestamp = now

    stats.value.chainReactionStreak++
    if (stats.value.chainReactionStreak >= 10) unlock('chain_reaction')

    stats.value.conventionalAlchemistStreak++
    if (stats.value.conventionalAlchemistStreak >= 10) unlock('conventional_alchemist')

    // tri_element: compound made from 3 or more distinct elements
    if (compound.components && Object.keys(compound.components).length >= 3) {
      unlock('tri_element')
    }

    // relic_of_the_past: one of the reacting boxes was on canvas for 5+ minutes
    if (sourceBoxCreatedAt && now - sourceBoxCreatedAt >= 5 * 60 * 1000) {
      unlock('relic_of_the_past')
    }

    saveStats()
  }

  function recordFailedBond() {
    const now = Date.now()
    failedBondTimestamps.value.push(now)
    failedBondTimestamps.value = failedBondTimestamps.value.filter((ts) => now - ts <= 3000)
    if (failedBondTimestamps.value.length >= 5) unlock('failed_bond_3s')

    stats.value.consecutiveBonks++
    if (stats.value.consecutiveBonks >= 20) unlock('mysterious_compound')

    stats.value.totalBonks++
    if (stats.value.totalBonks >= 50) unlock('pollution')

    // Track failed bonds within current RRE round for perfect_analysis
    stats.value.failedBondsInCurrentRre++
    // Reset perfect streak since there was a failed bond
    stats.value.perfectRreStreak = 0

    stats.value.chainReactionStreak = 0
    stats.value.greedyCollectorCount = 0

    recordInteraction()
    saveStats()
  }

  function recordFailedPair(id1: string, id2: string) {
    const pair = [id1, id2].sort().join('-')
    if (pair === stats.value.lastFailedPair) {
      stats.value.stubbornHeadCount++
      if (stats.value.stubbornHeadCount >= 10) {
        unlock('stubborn_head')
      }
    } else {
      stats.value.lastFailedPair = pair
      stats.value.stubbornHeadCount = 1
    }
    saveStats()
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

  function recordShortcutUse(shortcut: string) {
    if (!stats.value.shortcutUses.includes(shortcut)) {
      stats.value.shortcutUses.push(shortcut)
      saveStats()
      if (stats.value.shortcutUses.length >= 5) {
        unlock('all_shortcuts')
      }
    }
    // the_purist: reset no-shortcut timer
    stats.value.sessionTimeNoShortcuts = 0
    saveStats()
  }

  function recordRreTargetSwitch() {
    stats.value.rreTargetSwitches++
    if (stats.value.rreTargetSwitches >= 20) {
      unlock('hesitant_scientist')
    }
    saveStats()
  }

  function recordTabSwitch() {
    stats.value.tabSwitches++
    if (stats.value.tabSwitches >= 20) {
      unlock('organized_alchemist')
    }
    saveStats()
  }

  function recordSearch() {
    const now = Date.now()
    stats.value.searchTimestamps.push(now)
    stats.value.searchTimestamps = stats.value.searchTimestamps.filter(
      (ts: number) => now - ts <= 30000
    )
    if (stats.value.searchTimestamps.length >= 10) {
      unlock('searching_answers')
    }
    saveStats()
  }

  function recordHiddenIllusion() {
    stats.value.hiddenIllusionCount++
    if (stats.value.hiddenIllusionCount >= 5) {
      unlock('hidden_illusion')
    }
    saveStats()
  }

  function recordUndo() {
    const now = Date.now()
    stats.value.undoTimestamps.push(now)
    stats.value.undoTimestamps = stats.value.undoTimestamps.filter(
      (ts: number) => now - ts <= 10000
    )
    if (stats.value.undoTimestamps.length >= 10) {
      unlock('fate_turning_point')
    }
    saveStats()
  }

  function recordInteraction() {
    const now = Date.now()
    stats.value.lastInteractionTime = now
    lastSessionInteraction.value = now

    // Notify RRE Store so it knows an interaction occurred (prevents 'Zaman Es' from triggering incorrectly)
    useRreStore().recordInteraction()

    if (academicBlockTimeout) clearTimeout(academicBlockTimeout)
    academicBlockTimeout = window.setTimeout(
      () => {
        unlock('academic_block')
      },
      5 * 60 * 1000
    )
  }

  function resetPanicModeDragCount() {
    panicModeDragCount.value = 0
  }

  function recordDrag(isRreActive: boolean, rreTimeLeft: number) {
    if (isRreActive && rreTimeLeft <= 5) {
      panicModeDragCount.value++
      if (panicModeDragCount.value >= 10) {
        unlock('panic_mode')
      }
    }
    recordInteraction()
  }

  function checkDynamicEquilibrium(boxes: any[]) {
    let ionicCount = 0
    let covalentCount = 0

    boxes.forEach((box) => {
      if (box.type === 'Ion' || box.type === 'Ion-Poliatomik') ionicCount++
      if (box.type === 'Kovalen') covalentCount++
    })

    if (ionicCount >= 5 && ionicCount === covalentCount) {
      unlock('dynamic_equilibrium')
    }
  }

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

  if ((window as any).__playtimeInterval) {
    clearInterval((window as any).__playtimeInterval)
  }

  let lastPlaytimeCheck = Date.now()
  let lastSavedMinutes = Math.floor((stats.value?.playDurationSecs || 0) / 60)

  ;(window as any).__playtimeInterval = setInterval(() => {
    const now = Date.now()
    let deltaMs = now - lastPlaytimeCheck
    lastPlaytimeCheck = now

    if (deltaMs > 0) {
      stats.value.playDurationSecs += deltaMs / 1000

      if (now - lastSessionInteraction.value < 5 * 60 * 1000) {
        stats.value.sessionContinuousSecs += deltaMs / 1000
        if (stats.value.sessionContinuousSecs >= 2 * 60 * 60) {
          unlock('marathon_runner')
        }
      } else {
        stats.value.sessionContinuousSecs = 0
      }

      const currentMinutes = Math.floor(stats.value.playDurationSecs / 60)

      if (currentMinutes > lastSavedMinutes) {
        lastSavedMinutes = currentMinutes
        saveStats()

        if (currentMinutes >= 30) unlock('playtime_30m')
        if (currentMinutes >= 60) unlock('playtime_60m')
        if (currentMinutes >= 118) unlock('playtime_118m')
      }

      // the_purist: accumulate no-shortcut time if user is active
      if (now - lastSessionInteraction.value < 5 * 60 * 1000) {
        stats.value.sessionTimeNoShortcuts += deltaMs / 1000
        if (stats.value.sessionTimeNoShortcuts >= 30 * 60) {
          unlock('the_purist')
        }
      }
    }
  }, 1000)

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

  window.addEventListener('beforeunload', () => {
    stats.value.lastPlayedAt = Date.now()
    saveStats()
  })

  // broken_cycle: check if user refreshed during an RRE challenge
  if (localStorage.getItem('ic_in_rre') === 'true') {
    unlock('broken_cycle')
    localStorage.removeItem('ic_in_rre')
  }

  function recordEmptyCanvasClick() {
    stats.value.emptyCanvasClicks++
    saveStats()
    if (stats.value.emptyCanvasClicks >= 50) {
      unlock('off_beat')
    }
  }

  function checkIceAge(initialTime: number, rreDurationSecs: number) {
    if (initialTime >= 30 && rreDurationSecs >= 30) {
      unlock('ice_age')
    }
  }

  function resetPemulaOnlyStreak() {
    if (stats.value.pemulaOnlyWins > 0) {
      stats.value.pemulaOnlyWins = 0
      saveStats()
    }
  }

  // gravity_anomaly: check if 5+ boxes are stacked within 5px of each other
  function checkGravityAnomaly(boxes: any[]) {
    for (let i = 0; i < boxes.length; i++) {
      let clusterCount = 1
      for (let j = 0; j < boxes.length; j++) {
        if (i === j) continue
        const dist = Math.hypot(boxes[i].left - boxes[j].left, boxes[i].top - boxes[j].top)
        if (dist <= 5) clusterCount++
      }
      if (clusterCount >= 5) {
        unlock('gravity_anomaly')
        return
      }
    }
  }

  // scroll_lover: track full scroll passes (reaching an edge) within an 8 second window
  const scrollLoverPassTimestamps = ref<number[]>([])
  function recordScrollerPass() {
    const now = Date.now()
    scrollLoverPassTimestamps.value.push(now)
    scrollLoverPassTimestamps.value = scrollLoverPassTimestamps.value.filter(
      (ts) => now - ts <= 8000
    )
    if (scrollLoverPassTimestamps.value.length >= 5) {
      unlock('scroll_lover')
    }
  }

  // the_pianist: track sequential button presses [1, 2, 3, 4] within 0.5s
  // IDs: 'challenge'=1, 'atomic_mode'=2, 'formula_info'=3, 'clear_canvas'=4
  const pianoSequence = ['challenge', 'atomic_mode', 'formula_info', 'clear_canvas']
  const pianistBuffer = ref<{ key: string; ts: number }[]>([])
  function recordPianistPress(key: string) {
    const now = Date.now()
    pianistBuffer.value.push({ key, ts: now })
    // Keep only the last 4 presses within 0.5s
    pianistBuffer.value = pianistBuffer.value.filter((e) => now - e.ts <= 500).slice(-4)
    if (pianistBuffer.value.length === 4) {
      const keys = pianistBuffer.value.map((e) => e.key)
      const span = pianistBuffer.value[3].ts - pianistBuffer.value[0].ts
      if (JSON.stringify(keys) === JSON.stringify(pianoSequence) && span < 500) {
        unlock('the_pianist')
        pianistBuffer.value = []
      }
    }
  }

  // recordRreSideEffect: called when RRE starts/stops to manage broken_cycle localStorage flag
  function recordRreSideEffect(isStarting: boolean) {
    if (isStarting) {
      localStorage.setItem('ic_in_rre', 'true')
    } else {
      localStorage.removeItem('ic_in_rre')
    }
  }

  function checkIsolasiMandiri(
    boxes: any[],
    viewportWidth: number,
    viewportHeight: number,
    sidebarWidth: number,
    isMobile: boolean
  ) {
    if (boxes.length < 2) return
    const tolerance = isMobile ? 40 : 60
    const minSeparation = isMobile ? 200 : 300

    // Desktop: Sidebar on right
    // Mobile: Sidebar on bottom (approx 35dvh)
    const rightBound = !isMobile ? viewportWidth - sidebarWidth : viewportWidth
    const bottomBound = isMobile ? viewportHeight * 0.65 : viewportHeight

    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i]
      const bx = box.left
      const by = box.top

      // Corner check - account for element width/height (approx 120x45)
      // Left edge: bx < tolerance
      // Right edge: bx is near the sidebar footprint (rightBound - width - tolerance)
      const widthOffset = isMobile ? 160 : 180
      const heightOffset = isMobile ? 85 : 105

      const atXEdge = bx <= tolerance || (bx >= rightBound - widthOffset && bx <= rightBound)
      const atYEdge = by <= tolerance || (by >= bottomBound - heightOffset && by <= bottomBound)

      if (atXEdge && atYEdge) {
        // Now determine if it's SPECIFICALLY in a corner area
        const isNearLeft = bx <= tolerance
        const isNearRight = bx >= rightBound - widthOffset
        const isNearTop = by <= tolerance
        const isNearBottom = by >= bottomBound - heightOffset

        const isCorner = (isNearLeft || isNearRight) && (isNearTop || isNearBottom)

        if (isCorner) {
          const othersAreCentral = boxes.every((b, idx) => {
            if (idx === i) return true
            const distToBox = Math.hypot(b.left - bx, b.top - by)
            return distToBox > minSeparation
          })
          if (othersAreCentral) {
            unlock('self_isolation')
            return
          }
        }
      }
    }
  }

  // new batch 3 methods
  function recordBoxHover(durationMs: number) {
    if (durationMs >= 60000) {
      unlock('uncertainty_principle')
    }
  }

  function recordBoxActivateClick(clickCount: number) {
    // the click count is managed on the box itself, if it reaches 10 and is involved in a reaction, it triggers the achievement.
    // This is just a hook if we need it here, but typically we trigger unlock('activation_energy') from Container.vue.
  }

  // entropy: 20 boxes evenly distributed in 4 quadrants (5 each)
  function checkEntropy(boxes: any[], viewportWidth: number, viewportHeight: number) {
    if (boxes.length !== 20) return

    const midX = viewportWidth / 2
    const midY = viewportHeight / 2
    const quadrants = [0, 0, 0, 0]

    for (const box of boxes) {
      const cx = box.left + 60 // approx center
      const cy = box.top + 22
      if (cx < midX && cy < midY) quadrants[0]++
      else if (cx >= midX && cy < midY) quadrants[1]++
      else if (cx < midX && cy >= midY) quadrants[2]++
      else quadrants[3]++
    }

    if (quadrants.every((q) => q === 5)) {
      unlock('entropy')
    }
  }

  // orbital: track cumulative angle of element A around element B
  function recordOrbital(cumulativeAngle: number) {
    // 3 full rotations = 3 * 2 * PI = 6 * PI radians (~18.84)
    if (Math.abs(cumulativeAngle) >= 6 * Math.PI) {
      unlock('orbital')
    }
    // 25 full rotations = 50 * PI radians
    if (Math.abs(cumulativeAngle) >= 50 * Math.PI) {
      unlock('twin_stars_dance')
    }
  }

  // Batch 5 Tracking Functions
  function recordStuckCalculator(compound: any) {
    const nameLen = compound?.name?.length || 0
    const formulaLen = compound?.formula?.length || 0
    if (nameLen > 25 || formulaLen > 25) {
      unlock('stuck_calculator')
    }
  }

  function recordQuantumDrop() {
    const now = Date.now()
    stats.value.quantumDropTimestamps.push(now)
    stats.value.quantumDropTimestamps = stats.value.quantumDropTimestamps.filter(
      (ts: number) => now - ts <= 10000
    )
    if (stats.value.quantumDropTimestamps.length >= 30) {
      unlock('quantum_physics')
    }
    saveStats()
  }

  function recordColdReaction(createdAt: number) {
    if (Date.now() - createdAt < 500) {
      unlock('cold_reaction')
    }
  }

  function recordPerfectVoid(isCanvasEmpty: boolean) {
    if (isCanvasEmpty) {
      unlock('perfect_void')
    }
  }

  function recordAtomicDance(dragDistance: number) {
    if (dragDistance >= 10000) {
      unlock('atomic_dance')
    }
  }

  function recordForbiddenMagnetism(overlapDuration: number) {
    if (overlapDuration >= 10000) {
      unlock('forbidden_magnetism')
    }
  }

  function recordShimmeringMirage() {
    unlock('shimmering_mirage')
  }

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
    recordRreTargetSwitch,
    recordTabSwitch,
    recordSearch,
    recordInteraction,
    recordLogoClick,
    recordSettingsToggle,
    recordSidebarAdd,
    recordModeToggle,
    recordFailedPair,
    recordRreWin,
    recordDrag,
    checkDynamicEquilibrium,
    recordElementMove,
    checkFirstDrop,
    recordPrecisionDrag,
    checkCanvasCounts,
    recordRreElementUse,
    resetPanicModeDragCount,
    recordEmptyCanvasClick,
    checkIceAge,
    resetPemulaOnlyStreak,
    checkIsolasiMandiri,
    checkGravityAnomaly,
    recordScrollerPass,
    recordPianistPress,
    recordRreSideEffect,
    recordBoxHover,
    recordBoxActivateClick,
    checkEntropy,
    recordOrbital,
    recordStuckCalculator,
    recordQuantumDrop,
    recordColdReaction,
    recordPerfectVoid,
    recordAtomicDance,
    recordForbiddenMagnetism,
    recordHiddenIllusion,
    recordUndo,
    recordShimmeringMirage
  }
})
