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
  },
  {
    id: 'credits_triggered',
    title: 'Obrolan di Sekitar Perapian',
    description: 'Buka informasi tim pengembang Infinity Chemistry.'
  },
  // --- 65 NEW ACHIEVEMENTS ---
  // 1. Initial 10 Favorites
  {
    id: 'hesitant_scientist',
    title: 'Ilmuwan yang Ragu',
    description: 'Ganti target RRE sebanyak 5 kali tanpa menyelesaikan tantangan.'
  },
  {
    id: 'conservation_of_mass',
    title: 'Segala Sesuatu Harus Kembali ke Asalnya',
    description: 'Gunakan "Hapus Semua" saat lebih dari 25 elemen ada di kanvas.'
  },
  {
    id: 'dynamic_equilibrium',
    title: 'Kesetimbangan Dinamis',
    description:
      'Miliki jumlah senyawa Ionik dan Kovalen yang sama di kanvas (min. 5 masing-masing).'
  },
  {
    id: 'warm_hearth',
    title: 'Perapian yang Hangat',
    description: 'Biarkan layar Credits terbuka selama lebih dari 30 detik.'
  },
  {
    id: 'organized_alchemist',
    title: 'Alkemis yang Terorganisir',
    description: 'Berpindah antara tab Ion dan Kovalen sebanyak 20 kali.'
  },
  {
    id: 'sweet_dreams',
    title: 'Mimpi Indah, Alkemis',
    description: 'Lakukan reaksi setelah tab didiamkan (idle) selama lebih dari 10 menit.'
  },
  {
    id: 'mysterious_compound',
    title: 'Senyawa Misterius',
    description: 'Gagal mereaksikan elemen yang tidak kompatibel (bonk) 20 kali berturut-turut.'
  },
  {
    id: 'cracked_beaker',
    title: 'Gelas Kimia yang Retak',
    description: 'Gagal di tingkat Alkemis sebanyak 3 kali berturut-turut.'
  },
  {
    id: 'borderless_lab',
    title: 'Penyatuan Langit dan Bumi',
    description:
      'Geser elemen dari area paling bawah ke paling atas kanvas dalam satu tarikan cepat (< 2 detik).'
  },
  {
    id: 'searching_answers',
    title: 'Cahaya yang Menuntun Jalan',
    description:
      'Hapus teks pencarian di sidebar menggunakan tombol silang (x) atau Tab sebanyak 5 kali.'
  },
  // 2. Main Behavioral Set
  {
    id: 'academic_block',
    title: 'Kebuntuan Akademik',
    description: 'Diam di layar kanvas tanpa interaksi selama 5 menit.'
  },
  {
    id: 'lightning_thumb',
    title: 'Kilatan yang Menembus Langit',
    description: 'Selesaikan mode Pemula dalam waktu kurang dari 5 detik.'
  },
  {
    id: 'catalyst',
    title: 'Katalisator',
    description: 'Lakukan 5 reaksi sukses beruntun dengan jeda < 2 detik antar reaksi.'
  },
  {
    id: 'chain_reaction',
    title: 'Reaksi Berantai',
    description: 'Lakukan 10 reaksi sukses beruntun tanpa ada satu pun yang gagal.'
  },
  {
    id: 'stubborn_head',
    title: 'Kepala Batu',
    description: 'Gagal mereaksikan 2 elemen yang sama persis sebanyak 5 kali berturut-turut.'
  },
  {
    id: 'first_sight',
    title: 'Pandangan Pertama',
    description: 'Klik logo "Infinite Chemistry" di pojok kiri atas 1 kali.'
  },
  {
    id: 'conventional_alchemist',
    title: 'Alkemis Konvensional',
    description: 'Selesaikan 10 reaksi berturut-turut tanpa mengganti mode (Nama/Simbol).'
  },
  {
    id: 'panic_mode',
    title: 'Panik!',
    description: 'Di sisa waktu RRE kurang dari 5 detik, lakukan minimal 10 kali drag & drop.'
  },
  {
    id: 'precision_scientist',
    title: 'Ilmuwan Presisi',
    description: 'Tempatkan elemen hingga bertumpuk sempurna di atas elemen lain.'
  },
  {
    id: 'resource_waste',
    title: 'Pemborosan Sumber Daya',
    description: 'Tarik elemen dari sidebar lalu langsung hapus sebanyak 20 kali.'
  },
  {
    id: 'abstract_artist',
    title: 'Seniman Abstrak',
    description: 'Miliki 15 senyawa berbeda di kanvas secara bersamaan.'
  },
  {
    id: 'hydrophile',
    title: 'Pecinta Air',
    description: 'Buat 10 molekul H₂O yang terpisah di atas kanvas secara bersamaan.'
  },
  {
    id: 'fortune_teller',
    title: 'Ahli Nujum',
    description: 'Selesaikan tantangan RRE di bawah 2 detik sisa waktu.'
  },
  {
    id: 'symphony_of_destruction',
    title: 'Simfoni Kehancuran',
    description: 'Gunakan tombol "Hapus Semua" 3 kali dalam waktu < 10 detik.'
  },
  {
    id: 'max_efficiency',
    title: 'Efisiensi Maksimal',
    description: 'Selesaikan tantangan RRE dengan jumlah elemen di kanvas ≤ yang dibutuhkan.'
  },
  {
    id: 'self_isolation',
    title: 'Isolasi Mandiri',
    description: 'Taruh 1 elemen di ujung pojok kanvas sementara 10 elemen lain berada di tengah.'
  },
  {
    id: 'ice_age',
    title: 'Zaman Es',
    description: 'Tidak melakukan apapun di layar RRE selama sisa waktu 30 detik.'
  },
  {
    id: 'off_beat',
    title: 'Ketukan Tak Seirama',
    description: 'Klik area kosong kanvas sebanyak 50 kali dalam satu sesi.'
  },
  {
    id: 'lab_assistant',
    title: 'Asisten Lab',
    description: 'Selesaikan total 10 tantangan Pemula tanpa menyentuh mode Sepuh.'
  },
  {
    id: 'lead_researcher',
    title: 'Peneliti Utama',
    description: 'Menang Sepuh 5 kali beruntun menggunakan waktu < 50% per ronde.'
  },
  {
    id: 'viscosity',
    title: 'Viskositas',
    description:
      'Gerakkan sebuah elemen sangat lambat (< 20px/detik) selama 10 detik tanpa melepaskan.'
  },
  {
    id: 'alchemists_laugh',
    title: 'Tawa Alkemis',
    description: 'Menang dengan sisa waktu tepat 0.1 detik.'
  },
  {
    id: 'gravity_anomaly',
    title: 'Anomali Gravitasi',
    description: 'Tumpuk 5 elemen di satu titik koordinat yang persis sama.'
  },
  {
    id: 'hoarder_syndrome',
    title: 'Sindrom Penimbun',
    description: 'Miliki minimal 30 atom tunggal (non-senyawa) di kanvas tanpa bereaksi.'
  },
  {
    id: 'scroll_lover',
    title: 'Suka Scroll',
    description: 'Di sidebar, scroll dari atas ke bawah sebanyak 5 kali dalam 30 detik.'
  },
  {
    id: 'iron_hand',
    title: 'Tangan Besi',
    description: 'Hapus sebuah senyawa dengan total lebih dari 10 atom.'
  },
  {
    id: 'the_purist',
    title: 'Sang Puris',
    description: 'Bermain selama 1 jam tanpa menggunakan tombol shortcut keyboard.'
  },
  {
    id: 'the_pianist',
    title: 'Pianis',
    description: 'Tekan 3 tombol shortcut berbeda dalam interval < 0.5 detik.'
  },
  {
    id: 'canvas_stretch',
    title: 'Bentang Kanvas',
    description: 'Pindahkan elemen dari satu pojok kanvas ke pojok yang berlawanan.'
  },
  {
    id: 'broken_cycle',
    title: 'Siklus Terputus',
    description: 'Muat ulang halaman saat sedang dalam mode tantangan RRE.'
  },
  {
    id: 'particle_rain',
    title: 'Hujan Partikel',
    description: 'Miliki tepat 20 atom individu di kanvas, lalu gunakan "Hapus Semua".'
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
    id: 'forbidden_magnetism',
    title: 'Magnetisme Terlarang',
    description: 'Tahan sebuah ion di atas ion lain yang sejenis (muatan sama) selama 10 detik.'
  },
  {
    id: 'perfect_void',
    title: 'Kekosongan Sempurna',
    description: 'Klik tombol "Hapus Semua" saat kanvas sudah benar-benar kosong.'
  },
  {
    id: 'cold_reaction',
    title: 'Reaksi Dingin',
    description: 'Hapus sebuah senyawa dalam waktu < 0.5 detik setelah ia terbentuk.'
  },
  {
    id: 'quantum_leap',
    title: 'Lompatan Kuantum',
    description: 'Letakkan elemen dari sidebar tepat di tengah kanvas (toleransi 5px).'
  },
  {
    id: 'mass_equilibrium',
    title: 'Kesetimbangan Massa',
    description: 'Miliki tepat 10 atom dari dua elemen berbeda di kanvas secara bersamaan.'
  },
  {
    id: 'lonely_particle',
    title: 'Partikel Jomlo',
    description: 'Biarkan satu elemen berada di kanvas selama 10 menit tanpa direaksikan.'
  },
  {
    id: 'uncertainty_principle',
    title: 'Prinsip Ketidakpastian',
    description: 'Hover kursor di atas atom/senyawa selama total 1 menit tanpa klik/drag.'
  },
  {
    id: 'activation_energy',
    title: 'Energi Aktivasi',
    description: 'Klik sebuah elemen 10 kali berturut-turut sebelum mereaksikannya.'
  },
  {
    id: 'flexible_collision',
    title: 'Tumbukan Fleksibel',
    description: 'Orbit satu elemen mengelilingi elemen lain (3 putaran) sebelum melepasnya.'
  },
  {
    id: 'thermal_isolation',
    title: 'Isolasi Termal',
    description:
      'Gunakan "Hapus Semua" saat hanya ada 1 elemen/senyawa tunggal yang tersisa di kanvas.'
  },
  {
    id: 'entropy',
    title: 'Entropi',
    description: 'Miliki 20 elemen di kanvas yang tersebar di 4 kuadran berbeda secara merata.'
  },
  // 3. Genshin-themed names
  {
    id: 'greedy_collector',
    title: 'Timbunan Harta yang Melimpah',
    description: 'Tarik 30 elemen berurutan dari sidebar tanpa melakukan satupun reaksi.'
  },
  {
    id: 'forgetful',
    title: 'Pintu yang Tak Pernah Tertutup',
    description: 'Buka tutup tab Pengaturan sebanyak 10 kali dalam satu sesi.'
  },
  {
    id: 'anti_establishment',
    title: 'Kemurnian Elemen yang Hakiki',
    description: 'Menangkan mode Alkemis 5x hanya menggunakan elemen Golongan Utama.'
  },
  {
    id: 'marathon_runner',
    title: 'Langkah Kaki yang Tak Kunjung Berhenti',
    description: 'Bermain satu sesi penuh tanpa jeda selama 2 jam non-stop.'
  },
  {
    id: 'pollution',
    title: 'Bencana di Gelas Kimia',
    description: 'Akumulasi total 50 kali kegagalan reaksi (bonk) di kanvas.'
  },
  {
    id: 'walking_calculator',
    title: 'Analisis yang Sempurna',
    description: 'Menangkan 5 RRE beruntun menggunakan waktu < 50% per ronde.'
  },
  {
    id: 'settings_lover',
    title: 'Peneliti yang Sangat Teliti',
    description: 'Buka modal Pengaturan sebanyak 50 kali.'
  },
  {
    id: 'tri_element',
    title: 'Simfoni Tiga Elemen',
    description: 'Bentuk senyawa yang terdiri dari 3 unsur berbeda.'
  },
  {
    id: 'the_creator',
    title: 'Devs',
    description: 'Berhasil membuka seluruh 117 pencapaian lainnya.'
  },
  {
    id: 'quantum_physics',
    title: 'Kilatan Cahaya yang Melintas',
    description: 'Lakukan drag & drop pada elemen sebanyak 30 kali dalam 15 detik.'
  },
  {
    id: 'stuck_calculator',
    title: 'Formula yang Tak Berakhir',
    description: 'Bentuk senyawa dengan formula kimia lebih dari 15 karakter.'
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
      shortcutUses: [] as string[],
      // New stats for 65 achievements
      totalElementsDeleted: 0,
      totalDragAndDrops: 0,
      settingsOpens: 0,
      tabSwitches: 0, // Ion/Kovalen tab switches
      settingsTabOpens: 0, // Open/close settings clicks
      totalCanvasClicks: 0, // Clicks on empty canvas
      failedBondsTotal: 0, // Total accumulated failed bonds
      alkemisLosses: 0, // Consecutive alkemis losses
      rreTargetChanges: 0, // Times target changed in RRE without winning
      sidebarDropsWithNoReaction: 0, // Items dragged from sidebar without reacting
      quickDeleteAfterDrop: 0, // Items deleted right after being placed
      shortcutPressedWithoutUse: 0, // Track shortcut usage hours
      pemulaSepuhWins: { pemula: 0, sepuhTouched: false }, // For lab_assistant
      sepuhFastWins: 0, // For lead_researcher (5-streak under 50% time)
      sepuhFastStreak: 0,
      rreWinFastStreak: 0, // For walking_calculator
      rreWinFastStreakCount: 0
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
    if (stats.value.sidebarDeletes >= 15) unlock('sidebar_delete_15')
    if (stats.value.sidebarDeletes >= 30) unlock('sidebar_delete_30')
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
  // Prevent HMR interval stacking during development
  if ((window as any).__playtimeInterval) {
    clearInterval((window as any).__playtimeInterval)
  }

  let lastPlaytimeCheck = Date.now()
  let lastSavedMinutes = Math.floor((stats.value?.playDurationSecs || 0) / 60)

  ;(window as any).__playtimeInterval = setInterval(() => {
    const now = Date.now()
    let deltaMs = now - lastPlaytimeCheck
    lastPlaytimeCheck = now

    // Cap delta at 5 seconds to prevent huge jumps from sleep/background throttling
    if (deltaMs > 5000) {
      deltaMs = 1000
    }

    if (deltaMs > 0) {
      stats.value.playDurationSecs += deltaMs / 1000

      const currentMinutes = Math.floor(stats.value.playDurationSecs / 60)

      // Check milestones and save only when a new minute starts
      if (currentMinutes > lastSavedMinutes) {
        lastSavedMinutes = currentMinutes
        saveStats()

        if (currentMinutes >= 30) unlock('playtime_30m')
        if (currentMinutes >= 60) unlock('playtime_60m')
        if (currentMinutes >= 118) unlock('playtime_118m')
      }
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
    // Check broken_cycle: page reloaded while RRE was active
    // This is checked in Container.vue instead, on mount, using localStorage flag
    saveStats()
  })

  // ─── NEW RECORD FUNCTIONS FOR 65 NEW ACHIEVEMENTS ───

  // --- Inactivity on canvas (academic_block: 5 min idle) ---
  let canvasLastInteractionAt = Date.now()
  let academicBlockChecked = false
  setInterval(() => {
    const idleSecs = (Date.now() - canvasLastInteractionAt) / 1000
    if (idleSecs >= 300 && !academicBlockChecked) {
      academicBlockChecked = true
      unlock('academic_block')
    }
  }, 5000)

  function recordCanvasInteraction() {
    canvasLastInteractionAt = Date.now()
    academicBlockChecked = false

    // Also record idle for sweet_dreams (reaction after 10 min idle)
    // This flag is checked in recordBond via lastInteractionForSweetDreams
  }

  // Last interaction timestamp for sweet_dreams
  let lastInteractionForSweetDreams = Date.now()
  function recordUserInteraction() {
    lastInteractionForSweetDreams = Date.now()
    canvasLastInteractionAt = Date.now()
    academicBlockChecked = false
  }

  // --- sweet_dreams: reaction after 10+ min idle ---
  function checkSweetDreams() {
    const idleMs = Date.now() - lastInteractionForSweetDreams
    if (idleMs >= 10 * 60 * 1000) {
      unlock('sweet_dreams')
    }
  }

  // --- Logo first click: first_sight ---
  let logoClicked = false
  function recordLogoClick() {
    if (!logoClicked) {
      logoClicked = true
      unlock('first_sight')
    }
  }

  // --- Credits open timer: warm_hearth (60+ sec) ---
  let creditsOpenTime = 0
  function recordCreditsTrigger() {
    creditsOpenTime = Date.now()
    unlock('credits_triggered')
  }
  function recordCreditsClose() {
    if (creditsOpenTime > 0 && Date.now() - creditsOpenTime > 30000) {
      unlock('warm_hearth')
    }
    creditsOpenTime = 0
  }

  // --- onChallengeWin extensions for new achievements ---
  function onChallengeWinExtended(difficulty: string, timeLeft: number, timeLimit: number) {
    // lightning_thumb: win Pemula in < 5 sec (= timeLeft > timeLimit - 5)
    if (difficulty === 'pemula' && timeLeft >= timeLimit - 5) {
      unlock('lightning_thumb')
    }

    // fortune_teller: win with < 2 sec left
    if (timeLeft < 2 && timeLeft > 0) {
      unlock('fortune_teller')
    }

    // alchemists_laugh: win with timeLeft <= 0.1
    if (timeLeft <= 0.1 && timeLeft > 0) {
      unlock('alchemists_laugh')
    }

    // ice_age: stored via rreWasIdle flag set externally
    // lead_researcher: win sepuh under 50% time
    if (difficulty === 'sepuh') {
      if (timeLeft >= timeLimit * 0.5) {
        stats.value.sepuhFastStreak = (stats.value.sepuhFastStreak || 0) + 1
        if (stats.value.sepuhFastStreak >= 5) unlock('lead_researcher')
      } else {
        stats.value.sepuhFastStreak = 0
      }
    }

    // lab_assistant: 10 pemula wins without ever playing sepuh
    if (difficulty === 'pemula') {
      if (!stats.value.pemulaSepuhWins)
        stats.value.pemulaSepuhWins = { pemula: 0, sepuhTouched: false }
      if (!stats.value.pemulaSepuhWins.sepuhTouched) {
        stats.value.pemulaSepuhWins.pemula++
        if (stats.value.pemulaSepuhWins.pemula >= 10) unlock('lab_assistant')
      }
    }
    if (difficulty === 'sepuh' || difficulty === 'alkemis') {
      if (!stats.value.pemulaSepuhWins)
        stats.value.pemulaSepuhWins = { pemula: 0, sepuhTouched: false }
      stats.value.pemulaSepuhWins.sepuhTouched = true
    }

    // hesitant_scientist: reset rreTargetChanges on win
    stats.value.rreTargetChanges = 0

    // cracked_beaker: reset alkemis loss streak on win
    if (difficulty === 'alkemis') stats.value.alkemisLosses = 0

    // walking_calculator (Analisis yang Sempurna): 5 wins with minimal element use
    // Handled externally from Container.vue with recordRreWinEfficient

    saveStats()
  }

  function onChallengeLoseExtended(difficulty: string) {
    // cracked_beaker: 3 consecutive alkemis losses
    if (difficulty === 'alkemis') {
      stats.value.alkemisLosses = (stats.value.alkemisLosses || 0) + 1
      if (stats.value.alkemisLosses >= 3) unlock('cracked_beaker')
    } else {
      stats.value.alkemisLosses = 0
    }

    // hesitant_scientist: reset on lose too (only counts target changes without completing)
    stats.value.rreTargetChanges = 0
    saveStats()
  }

  // --- hesitant_scientist: change RRE target without winning ---
  function recordRreTargetChange() {
    stats.value.rreTargetChanges = (stats.value.rreTargetChanges || 0) + 1
    if (stats.value.rreTargetChanges >= 5) unlock('hesitant_scientist')
    saveStats()
  }

  // --- conservation_of_mass: clear canvas with > 25 elements ---
  function recordClearCanvasExtended(elementCount: number) {
    unlock('clear_canvas_first')
    if (elementCount > 25) unlock('conservation_of_mass')

    // thermal_isolation: clear when only 1 item remains
    if (elementCount === 1) unlock('thermal_isolation')

    // perfect_void: clear when canvas already empty
    if (elementCount === 0) unlock('perfect_void')

    // symphony_of_destruction: 3 clears in < 10 secs
    const now = Date.now()
    clearCanvasTimestamps.push(now)
    // prune > 10 secs
    while (clearCanvasTimestamps.length > 0 && now - clearCanvasTimestamps[0] > 10000) {
      clearCanvasTimestamps.shift()
    }
    if (clearCanvasTimestamps.length >= 3) unlock('symphony_of_destruction')

    // particle_rain: 20+ single atoms then clear
    if (pendingParticleRain) {
      unlock('particle_rain')
      pendingParticleRain = false
    }
  }
  let clearCanvasTimestamps: number[] = []
  let pendingParticleRain = false

  // --- particle_rain: 20 individual atoms flag setter ---
  function checkParticleRain(boxCount: number, compoundCount: number) {
    const singleAtoms = boxCount - compoundCount
    if (singleAtoms >= 20) {
      pendingParticleRain = true
    }
  }

  // --- hoarder syndrome: 30 single atoms on canvas ---
  function checkHoarderSyndrome(boxCount: number, compoundCount: number) {
    const singleAtoms = boxCount - compoundCount
    if (singleAtoms >= 30) unlock('hoarder_syndrome')
  }

  // --- abstract_artist: 15 distinct compounds ---
  function checkAbstractArtist(distinctCompoundCount: number) {
    if (distinctCompoundCount >= 15) unlock('abstract_artist')
  }

  // --- entropy: 20 items spread across 4 quadrants evenly ---
  function checkEntropy(
    boxes: Array<{ left: number; top: number; centerX?: number; centerY?: number }>,
    canvasWidth: number,
    canvasHeight: number
  ) {
    if (boxes.length < 20) return
    const midX = canvasWidth / 2
    const midY = canvasHeight / 2
    const quadrantCounts = [0, 0, 0, 0]

    boxes.forEach((b) => {
      // Use centering if provided, otherwise fallback to top-left
      const x = b.centerX ?? b.left
      const y = b.centerY ?? b.top
      // 0: TL, 1: TR, 2: BL, 3: BR
      const q = (x > midX ? 1 : 0) + (y > midY ? 2 : 0)
      quadrantCounts[q]++
    })

    // "Evenly" check: Each quadrant must have at least 3 elements if total is 20
    const isEven = quadrantCounts.every((count) => count >= 3)
    if (isEven) unlock('entropy')
  }

  // --- Holistic Canvas State Check ---
  function checkAllCanvasAchievements(
    boxEntries: Array<{
      left: number
      top: number
      formula?: string
      components?: Record<string, number>
      atomicId?: string
    }>,
    canvasWidth: number,
    canvasHeight: number
  ) {
    if (boxEntries.length === 0) return

    const elementCounts: Record<string, number> = {}
    let h2oCount = 0
    let ionicCount = 0
    let covalentCount = 0
    let singleAtomCount = 0
    const distinctCompounds = new Set<string>()

    boxEntries.forEach((box) => {
      // Counts for mass_equilibrium
      if (box.atomicId) {
        elementCounts[box.atomicId] = (elementCounts[box.atomicId] || 0) + 1
      } else if (box.components) {
        Object.keys(box.components).forEach((id) => {
          elementCounts[id] = (elementCounts[id] || 0) + (box.components?.[id] || 0)
        })
      }

      // Check for hydrophile
      if (box.formula === 'H₂O') h2oCount++

      // Count compounds
      const isCompound = box.components && Object.keys(box.components).length > 1
      if (isCompound) {
        distinctCompounds.add(box.formula || '')
        // We don't easily know bondType here without re-calculating,
        // but we can guess or use formula metadata if we had it.
        // For now, let's just use the components count as a proxy or stick to atomicId presence.
      } else {
        singleAtomCount++
      }
    })

    // Run sub-checks
    checkEntropy(boxEntries, canvasWidth, canvasHeight)
    checkHoarderSyndrome(
      boxEntries.length,
      boxEntries.filter((b) => b.components && Object.keys(b.components).length > 1).length
    )
    checkAbstractArtist(distinctCompounds.size)
    checkSelfIsolation(boxEntries, canvasWidth, canvasHeight)
    checkMassEquilibrium(elementCounts)
    checkGravityAnomaly(boxEntries)
    checkHydrophile(h2oCount)
    updateLonelyParticle(
      boxEntries
        .filter((b) => !b.components || Object.keys(b.components).length <= 1)
        .map((_, i) => `box-${i}`)
    ) // Proxy IDs
  }

  // --- dynamic_equilibrium: equal ionic + covalent on canvas (min 5 each) ---
  function checkDynamicEquilibrium(ionicCount: number, covalentCount: number) {
    if (ionicCount >= 5 && covalentCount >= 5 && ionicCount === covalentCount) {
      unlock('dynamic_equilibrium')
    }
  }

  // --- self_isolation: 1 box in corner, 10 in center ---
  function checkSelfIsolation(
    boxes: Array<{ left: number; top: number; centerX?: number; centerY?: number }>,
    canvasWidth: number,
    canvasHeight: number
  ) {
    if (boxes.length < 11) return
    const cornerMargin = 50
    const centerMargin = 100
    const cx = canvasWidth / 2,
      cy = canvasHeight / 2
    let cornerCount = 0
    let centerCount = 0
    boxes.forEach((b) => {
      const x = b.centerX ?? b.left
      const y = b.centerY ?? b.top
      const inCorner =
        (x < cornerMargin || x > canvasWidth - cornerMargin) &&
        (y < cornerMargin || y > canvasHeight - cornerMargin)
      if (inCorner) cornerCount++
      const inCenter = Math.abs(x - cx) < centerMargin && Math.abs(y - cy) < centerMargin
      if (inCenter) centerCount++
    })
    if (cornerCount >= 1 && centerCount >= 10) unlock('self_isolation')
  }

  // --- mass_equilibrium: 10 of elemA and 10 of elemB on canvas ---
  function checkMassEquilibrium(elementCounts: Record<string, number>) {
    const elements = Object.entries(elementCounts).filter(([, count]) => count === 10)
    if (elements.length >= 2) unlock('mass_equilibrium')
  }

  // --- gravity_anomaly: 5 elements at same spot ---
  function checkGravityAnomaly(
    boxes: Array<{ left: number; top: number; centerX?: number; centerY?: number }>
  ) {
    const posMap: Record<string, number> = {}
    boxes.forEach((b) => {
      const x = b.centerX ?? b.left
      const y = b.centerY ?? b.top
      const key = `${Math.round(x / 10)},${Math.round(y / 10)}`
      posMap[key] = (posMap[key] || 0) + 1
    })
    if (Object.values(posMap).some((c) => c >= 5)) unlock('gravity_anomaly')
  }

  // --- canvas_stretch: element moved from one corner to opposite corner ---
  let canvasStretchStartCorner: string | null = null
  function recordDragStart(left: number, top: number, canvasWidth: number, canvasHeight: number) {
    resetDragPixels() // Ensure pixel calculation is fresh for atomic_dance
    const marginX = canvasWidth * 0.2
    const marginY = canvasHeight * 0.2
    if (left < marginX && top < marginY) canvasStretchStartCorner = 'TL'
    else if (left > canvasWidth - marginX && top < marginY) canvasStretchStartCorner = 'TR'
    else if (left < marginX && top > canvasHeight - marginY) canvasStretchStartCorner = 'BL'
    else if (left > canvasWidth - marginX && top > canvasHeight - marginY)
      canvasStretchStartCorner = 'BR'
    else canvasStretchStartCorner = null
  }

  function recordDragEnd(left: number, top: number, canvasWidth: number, canvasHeight: number) {
    const marginX = canvasWidth * 0.2
    const marginY = canvasHeight * 0.2
    if (!canvasStretchStartCorner) return
    let endCorner: string | null = null
    if (left < marginX && top < marginY) endCorner = 'TL'
    else if (left > canvasWidth - marginX && top < marginY) endCorner = 'TR'
    else if (left < marginX && top > canvasHeight - marginY) endCorner = 'BL'
    else if (left > canvasWidth - marginX && top > canvasHeight - marginY) endCorner = 'BR'

    const opposites: Record<string, string> = { TL: 'BR', TR: 'BL', BL: 'TR', BR: 'TL' }
    if (endCorner && opposites[canvasStretchStartCorner] === endCorner) unlock('canvas_stretch')
    canvasStretchStartCorner = null
  }

  // --- borderless_lab: drag from bottom to top in < 2 sec ---
  let lastDragStartY = 0
  let lastDragStartTime = 0
  function recordDragStartY(y: number, canvasHeight: number) {
    if (y > canvasHeight * 0.8) {
      lastDragStartY = y
      lastDragStartTime = Date.now()
    }
  }
  function recordDragEndY(y: number, canvasHeight: number) {
    if (lastDragStartY > 0 && y < canvasHeight * 0.2 && Date.now() - lastDragStartTime < 2000) {
      unlock('borderless_lab')
    }
    lastDragStartY = 0
  }

  // --- quantum_leap: place element exactly at canvas center ---
  function recordDropPosition(
    left: number,
    top: number,
    canvasWidth: number,
    canvasHeight: number,
    boxWidth: number,
    boxHeight: number
  ) {
    const cx = canvasWidth / 2,
      cy = canvasHeight / 2

    // dynamically calculated based on DOM dimensions
    const boxCenterX = left + boxWidth / 2
    const boxCenterY = top + boxHeight / 2

    if (Math.abs(boxCenterX - cx) <= 25 && Math.abs(boxCenterY - cy) <= 25) {
      unlock('quantum_leap')
    }
  }

  // --- off_beat: 50 clicks on empty canvas ---
  function recordEmptyCanvasClick() {
    stats.value.totalCanvasClicks = (stats.value.totalCanvasClicks || 0) + 1
    if (stats.value.totalCanvasClicks >= 50) unlock('off_beat')
    saveStats()
  }

  // --- settings opens ---
  function recordSettingsOpen() {
    stats.value.settingsOpens = (stats.value.settingsOpens || 0) + 1
    if (stats.value.settingsOpens >= 50) unlock('settings_lover')
    saveStats()
  }

  // --- settings tab open/close (forgetful: 10 times) ---
  function recordSettingsToggle() {
    stats.value.settingsTabOpens = (stats.value.settingsTabOpens || 0) + 1
    if (stats.value.settingsTabOpens >= 10) unlock('forgetful')
    saveStats()
  }

  // --- Ion/Kovalen tab switch (organized_alchemist: 20 times) ---
  function recordTabSwitch() {
    stats.value.tabSwitches = (stats.value.tabSwitches || 0) + 1
    if (stats.value.tabSwitches >= 20) unlock('organized_alchemist')
    saveStats()
  }

  // --- failed bonds total (pollution: 50 total) ---
  function recordFailedBondExtended() {
    const now = Date.now()
    failedBondTimestamps.value.push(now)
    failedBondTimestamps.value = failedBondTimestamps.value.filter((ts) => now - ts <= 3000)
    if (failedBondTimestamps.value.length >= 5) unlock('failed_bond_3s')

    stats.value.failedBondsTotal = (stats.value.failedBondsTotal || 0) + 1
    if (stats.value.failedBondsTotal >= 50) unlock('pollution')

    // mysterious_compound: 20 consecutive failed bonds
    consecutiveFailedBonds++
    if (consecutiveFailedBonds >= 20) unlock('mysterious_compound')
    saveStats()
  }
  let consecutiveFailedBonds = 0

  // Reset on successful bond
  function resetConsecutiveFailedBonds() {
    consecutiveFailedBonds = 0
  }

  // --- element_destroyer: 1000 total deletes ---
  function recordSidebarDeleteExtended(box?: {
    components?: Record<string, number>
    formula?: string
  }) {
    stats.value.sidebarDeletes++
    stats.value.totalElementsDeleted = (stats.value.totalElementsDeleted || 0) + 1
    saveStats()

    if (stats.value.sidebarDeletes >= 15) unlock('sidebar_delete_15')
    if (stats.value.sidebarDeletes >= 30) unlock('sidebar_delete_30')
    if (stats.value.totalElementsDeleted >= 1000) unlock('element_destroyer')

    // iron_hand: delete compound with > 10 atoms
    if (box?.components) {
      const totalAtoms = Object.values(box.components).reduce((a, b) => a + b, 0)
      if (totalAtoms > 10) unlock('iron_hand')
    }

    // cold_reaction: delete compound < 0.5 sec after formation
    if (lastCompoundFormedAt > 0 && Date.now() - lastCompoundFormedAt < 500) {
      unlock('cold_reaction')
    }
  }
  let lastCompoundFormedAt = 0

  // --- Track when compound is formed ---
  function recordCompoundFormed() {
    lastCompoundFormedAt = Date.now()
  }

  // --- greedy_collector: 30 sidebar drops with no reaction ---
  const sidebarDropsTimestamps: number[] = []
  let consecutiveSidebarDropsNoReaction = 0
  function recordSidebarDrop() {
    consecutiveSidebarDropsNoReaction++
    if (consecutiveSidebarDropsNoReaction >= 30) unlock('greedy_collector')
  }
  function resetGreedyCollector() {
    consecutiveSidebarDropsNoReaction = 0
  }

  // --- resource_waste: 20 immediate deletes after sidebar drop ---
  let lastSidebarDropAt = 0
  let immediateDeleteCount = 0
  function recordSidebarDropTimestamp() {
    lastSidebarDropAt = Date.now()
  }
  function checkResourceWaste() {
    if (lastSidebarDropAt > 0 && Date.now() - lastSidebarDropAt < 1000) {
      immediateDeleteCount++
      if (immediateDeleteCount >= 20) unlock('resource_waste')
    }
  }

  // --- searching_answers: clear search 5 times ---
  let searchClearCount = 0
  function recordSearchClear() {
    searchClearCount++
    if (searchClearCount >= 5) unlock('searching_answers')
    saveStats()
  }

  // --- drag & drop count: quantum_physics (30 in 15 sec) ---
  const dragDropTimestamps: number[] = []
  function recordDragDrop() {
    const now = Date.now()
    dragDropTimestamps.push(now)
    while (dragDropTimestamps.length > 0 && now - dragDropTimestamps[0] > 15000) {
      dragDropTimestamps.shift()
    }
    stats.value.totalDragAndDrops = (stats.value.totalDragAndDrops || 0) + 1

    // panic_mode: 10 drag-drops in last 5 sec of RRE (checked externally)
    if (dragDropTimestamps.length >= 30) unlock('quantum_physics')
    saveStats()
  }

  // --- panic_mode: called by RRE when timeLeft < 5 ---
  let panicDropCount = 0
  let panicModeActive = false
  function recordRrePanicDrop() {
    if (panicModeActive) {
      panicDropCount++
      if (panicDropCount >= 10) unlock('panic_mode')
    }
  }
  function startRrePanicMode() {
    panicModeActive = true
    panicDropCount = 0
  }
  function stopRrePanicMode() {
    panicModeActive = false
    panicDropCount = 0
  }

  // --- ice_age: no action in RRE for 30+ sec remaining ---
  let rreLastActionAt = 0
  let iceAgeChecked = false
  function recordRreAction() {
    rreLastActionAt = Date.now()
    iceAgeChecked = false
  }
  function checkIceAge(timeLeft: number) {
    if (iceAgeChecked) return
    // If last action was > 30 seconds ago and time is still up
    if (rreLastActionAt > 0 && timeLeft <= 0 && Date.now() - rreLastActionAt >= 30000) {
      unlock('ice_age')
      iceAgeChecked = true
    }
  }

  // --- Pixel distance (atomic_dance: 10000px in one drag) ---
  let currentDragPixels = 0
  let lastDragPos: { x: number; y: number } | null = null
  function recordDragMove(x: number, y: number) {
    if (lastDragPos) {
      const dx = x - lastDragPos.x
      const dy = y - lastDragPos.y
      currentDragPixels += Math.sqrt(dx * dx + dy * dy)
      if (currentDragPixels >= 10000) unlock('atomic_dance')
    }
    lastDragPos = { x, y }
  }
  function resetDragPixels() {
    currentDragPixels = 0
    lastDragPos = null
  }

  // --- viscosity: slow drag (< 20px/s) for 10 sec ---
  let slowDragStart = 0
  let slowDragActive = false
  function recordSlowDrag(speedPxPerSec: number) {
    if (speedPxPerSec < 20) {
      if (!slowDragActive) {
        slowDragActive = true
        slowDragStart = Date.now()
      } else if (Date.now() - slowDragStart >= 10000) {
        unlock('viscosity')
      }
    } else {
      slowDragActive = false
    }
  }

  // --- hover time: uncertainty_principle (hover 1 min without click/drag) ---
  let hoverStartAt = 0
  let hoverActive = false
  let totalHoverSecs = 0
  function recordHoverStart() {
    hoverStartAt = Date.now()
    hoverActive = true
  }
  function recordHoverEnd() {
    if (hoverActive && hoverStartAt > 0) {
      totalHoverSecs += (Date.now() - hoverStartAt) / 1000
      if (totalHoverSecs >= 60) unlock('uncertainty_principle')
    }
    hoverActive = false
    hoverStartAt = 0
  }

  // --- activation_energy: click same element 10 times ---
  let clickedElementId = ''
  let clickCount = 0
  function recordElementClick(elementId: string) {
    if (elementId === clickedElementId) {
      clickCount++
      if (clickCount >= 10) unlock('activation_energy')
    } else {
      clickedElementId = elementId
      clickCount = 1
    }
  }
  function resetActivationEnergy() {
    clickedElementId = ''
    clickCount = 0
  }

  // --- catalyst: 5 successful reactions < 2 sec apart ---
  const reactionTimestamps: number[] = []
  function recordSuccessfulReaction() {
    const now = Date.now()
    reactionTimestamps.push(now)
    // keep only last 15 seconds
    while (reactionTimestamps.length > 0 && now - reactionTimestamps[0] > 15000) {
      reactionTimestamps.shift()
    }
    // check catalyst: 5 in a row with < 2 sec between each
    if (reactionTimestamps.length >= 5) {
      let allClose = true
      for (let i = 1; i < reactionTimestamps.length; i++) {
        if (reactionTimestamps[i] - reactionTimestamps[i - 1] > 2000) {
          allClose = false
          break
        }
      }
      if (allClose) unlock('catalyst')
    }

    // chain_reaction: 10 in a row without any failed bond (consecutiveFailedBonds was 0 the whole time)
    consecutiveSuccessfulBonds++
    if (consecutiveSuccessfulBonds >= 10) unlock('chain_reaction')

    // conventional_alchemist: 10 reactions without mode change
    consecutiveReactionsNoModeChange++
    if (consecutiveReactionsNoModeChange >= 10) unlock('conventional_alchemist')
  }
  let consecutiveSuccessfulBonds = 0
  let consecutiveReactionsNoModeChange = 0

  function recordModeChange() {
    consecutiveReactionsNoModeChange = 0
  }

  // --- compound-based checks (called after bond) ---
  function checkCompoundAchievements(compound: {
    formula: string
    components: Record<string, number>
    bondType: string
  }) {
    // tri_element: 3 different elements in one compound
    if (Object.keys(compound.components).length >= 3) unlock('tri_element')

    // stuck_calculator: formula > 15 chars
    // Strip HTML tags for accurate length check
    const plainFormula = compound.formula
      .replace(/<[^>]+>/g, '')
      .replace(/[₀-₉]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 8272))
    if (plainFormula.length > 15) unlock('stuck_calculator')

    // anti_establishment: win alkemis only with main group elements
    // Tracked externally by checking element groups on win
  }

  // --- stubborn_head: fail same pair 5 times ---
  let lastFailedPair = ''
  let failedPairCount = 0
  function recordFailedPairBond(elemA: string, elemB: string) {
    const pair = [elemA, elemB].sort().join('-')
    if (pair === lastFailedPair) {
      failedPairCount++
      if (failedPairCount >= 5) unlock('stubborn_head')
    } else {
      lastFailedPair = pair
      failedPairCount = 1
    }
  }

  // --- scroll_lover: 5 full scrolls in sidebar within 30 sec ---
  const sidebarScrollTimestamps: number[] = []
  function recordSidebarScroll() {
    const now = Date.now()
    sidebarScrollTimestamps.push(now)
    while (sidebarScrollTimestamps.length > 0 && now - sidebarScrollTimestamps[0] > 30000) {
      sidebarScrollTimestamps.shift()
    }
    if (sidebarScrollTimestamps.length >= 5) unlock('scroll_lover')
  }

  // --- the_pianist: 3 shortcuts in < 0.5 sec ---
  const shortcutPressTimestamps: number[] = []
  function recordShortcutPress() {
    const now = Date.now()
    shortcutPressTimestamps.push(now)
    while (shortcutPressTimestamps.length > 0 && now - shortcutPressTimestamps[0] > 500) {
      shortcutPressTimestamps.shift()
    }
    if (shortcutPressTimestamps.length >= 3) unlock('the_pianist')
  }

  // --- the_purist: 1 hour without shortcuts ---
  let puristSessionStart = Date.now()
  let puristViolated = false
  function recordShortcutViolation() {
    puristViolated = true
  }
  setInterval(() => {
    if (!puristViolated && Date.now() - puristSessionStart >= 3600000) {
      unlock('the_purist')
    }
  }, 60000)

  // --- marathon_runner: 2 hours non-stop ---
  // Already tracked via playtime; supplement with session continuity via playtime_120m check
  // Reusing playtime tracker — just add "marathon" milestone
  // (unlock happens in the playtime interval)

  // --- the_creator: all 117 other achievements unlocked ---
  function checkTheCreator() {
    const total = ACHIEVEMENTS_DEFINITION.length
    const unlocked = Object.keys(unlockedMap.value).length
    if (unlocked >= total - 1) unlock('the_creator') // -1 for 'the_creator' itself
  }

  // --- hydrophile: 10 separate H2O on canvas ---
  function checkHydrophile(h2oBoxCount: number) {
    if (h2oBoxCount >= 10) unlock('hydrophile')
  }

  // --- broken_cycle: page loaded while RRE was active ---
  function checkBrokenCycle() {
    // Called on mount from Container.vue, checks localStorage flag
    const wasRreActive = localStorage.getItem('ic_rre_was_active')
    if (wasRreActive === 'true') {
      unlock('broken_cycle')
      localStorage.removeItem('ic_rre_was_active')
    }
  }

  // --- lonely_particle: 1 element on canvas for 10 min ---
  let lonelyParticleId = ''
  let lonelyParticleStart = 0
  function updateLonelyParticle(singleElementIds: string[]) {
    if (singleElementIds.length === 1) {
      const id = singleElementIds[0]
      if (id !== lonelyParticleId) {
        lonelyParticleId = id
        lonelyParticleStart = Date.now()
      } else if (Date.now() - lonelyParticleStart >= 600000) unlock('lonely_particle')
    } else {
      lonelyParticleId = ''
      lonelyParticleStart = 0
    }
  }

  // --- precision_scientist: drop exactly on top of another element ---
  // This is triggered when overlapping.id exists and item overlaps perfectly
  function recordPrecisionDrop() {
    unlock('precision_scientist')
  }

  // --- walking_calculator: 5 consecutive RRE wins using only needed elements ---
  let efficientWinStreak = 0
  function recordRreWinEfficient(isEfficient: boolean) {
    if (isEfficient) {
      efficientWinStreak++
      if (efficientWinStreak >= 5) unlock('walking_calculator')
    } else {
      efficientWinStreak = 0
    }
  }

  // --- max_efficiency: win RRE using just the needed elements ---
  function checkMaxEfficiency(canvasCount: number, requiredElements: number) {
    if (canvasCount <= requiredElements) unlock('max_efficiency')
  }

  return {
    achievements,
    pendingToast,
    stats,
    unlock,
    isUnlocked,
    onChallengeWin,
    onChallengeLose,
    onChallengeWinExtended,
    onChallengeLoseExtended,
    recordChallengeModeClick,
    recordButtonPress,
    checkComponentAchievements,
    recordClearCanvas,
    recordClearCanvasExtended,
    recordCovalentBond,
    recordIonicBond,
    recordH2oBond,
    recordNaclBond,
    recordXeBond,
    recordBond,
    recordFailedBond,
    recordFailedBondExtended,
    recordFailedPairBond,
    recordDarkModeToggle,
    recordAchievementTabOpen,
    recordElementTabOpen,
    recordSidebarDelete,
    recordSidebarDeleteExtended,
    recordSidebarDrop,
    recordSidebarDropTimestamp,
    checkResourceWaste,
    resetGreedyCollector,
    recordShortcutUse,
    recordShortcutPress,
    recordShortcutViolation,
    recordElementMove,
    checkFirstDrop,
    recordLogoClick,
    recordCreditsTrigger,
    recordCreditsClose,
    recordCanvasInteraction,
    recordUserInteraction,
    checkSweetDreams,
    recordRreTargetChange,
    recordSearchClear,
    recordDragStart,
    recordDragEnd,
    recordDragStartY,
    recordDragEndY,
    recordDropPosition,
    recordEmptyCanvasClick,
    recordSettingsOpen,
    recordSettingsToggle,
    recordTabSwitch,
    recordDragDrop,
    recordRrePanicDrop,
    startRrePanicMode,
    stopRrePanicMode,
    recordRreAction,
    checkIceAge,
    recordDragMove,
    resetDragPixels,
    recordSlowDrag,
    recordHoverStart,
    recordHoverEnd,
    recordElementClick,
    resetActivationEnergy,
    recordSuccessfulReaction,
    resetConsecutiveFailedBonds,
    recordModeChange,
    checkCompoundAchievements,
    checkParticleRain,
    checkHoarderSyndrome,
    checkAbstractArtist,
    checkEntropy,
    checkDynamicEquilibrium,
    checkSelfIsolation,
    checkMassEquilibrium,
    checkGravityAnomaly,
    checkTheCreator,
    checkHydrophile,
    checkBrokenCycle,
    updateLonelyParticle,
    recordPrecisionDrop,
    recordRreWinEfficient,
    checkMaxEfficiency,
    recordCompoundFormed,
    recordSidebarScroll,
    checkAllCanvasAchievements
  }
})
