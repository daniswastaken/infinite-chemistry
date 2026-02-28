const sounds = {
  fusion: new URL('../assets/music/fusion.mp3', import.meta.url).href,
  failed: new URL('../assets/music/failed.mp3', import.meta.url).href,
  delete: new URL('../assets/music/delete.mp3', import.meta.url).href,
  put: new URL('../assets/music/put.mp3', import.meta.url).href,
  success: new URL('../assets/music/success.mp3', import.meta.url).href
}

export type SoundType = keyof typeof sounds

// Pool of audio objects for each sound type to allow overlapping sounds without lag
const poolSize = 5
const audioPool: Record<SoundType, HTMLAudioElement[]> = {
  fusion: [],
  failed: [],
  delete: [],
  put: [],
  success: []
}

// Pre-fill the pool
Object.keys(sounds).forEach((key) => {
  const type = key as SoundType
  for (let i = 0; i < poolSize; i++) {
    const audio = new Audio(sounds[type])
    audio.volume = 0.8 // Set volume to 80%
    audio.load() // Pre-load the asset
    audioPool[type].push(audio)
  }
})

let poolIndex: Record<SoundType, number> = {
  fusion: 0,
  failed: 0,
  delete: 0,
  put: 0,
  success: 0
}

export const playSound = (type: SoundType, volume?: number) => {
  const pool = audioPool[type]
  const index = poolIndex[type]
  const audio = pool[index]

  // Set volume for this specific play, defaulting to 0.8 if not provided
  audio.volume = volume !== undefined ? volume : 0.8

  // Reset and play
  audio.currentTime = 0
  audio.play().catch((err) => {
    console.debug('Audio play blocked or failed:', err)
  })

  // Move to next object in pool
  poolIndex[type] = (index + 1) % poolSize
}
