// ─── Web Audio API Sound System ──────────────────────────────────────────────
//
// Uses the Web Audio API instead of HTMLAudioElement. The critical difference:
//   HTMLAudioElement.play() needs a trusted user gesture EVERY call on mobile.
//   AudioContext only needs to be unlocked ONCE (on the first user interaction),
//   and after that, bufferSource.start() works from ANY context — setTimeout,
//   DnD callbacks, requestAnimationFrame, etc.
//
// This solves the issue where vue3-dnd's TouchBackend intercepts all touch
// events before our DOM handlers fire, breaking the trusted gesture chain.

const soundUrls = {
  fusion: new URL('../assets/music/fusion.mp3', import.meta.url).href,
  failed: new URL('../assets/music/failed.mp3', import.meta.url).href,
  delete: new URL('../assets/music/delete.mp3', import.meta.url).href,
  put: new URL('../assets/music/put.mp3', import.meta.url).href,
  success: new URL('../assets/music/success.mp3', import.meta.url).href
}

export type SoundType = keyof typeof soundUrls

// ─── AudioContext & Buffer Cache ─────────────────────────────────────────────

let audioCtx: AudioContext | null = null
const bufferCache: Partial<Record<SoundType, AudioBuffer>> = {}
let isUnlocked = false

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioCtx
}

// Resume the AudioContext on the very first user interaction.
// After this single unlock, all future .start() calls work without gestures.
function unlockAudioContext() {
  if (isUnlocked) return

  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  isUnlocked = true

  // Remove listeners after first unlock
  document.removeEventListener('touchstart', unlockAudioContext, true)
  document.removeEventListener('touchend', unlockAudioContext, true)
  document.removeEventListener('mousedown', unlockAudioContext, true)
  document.removeEventListener('click', unlockAudioContext, true)
}

// Attach unlock listeners as early as possible (capture phase)
if (typeof document !== 'undefined') {
  document.addEventListener('touchstart', unlockAudioContext, { capture: true, passive: true })
  document.addEventListener('touchend', unlockAudioContext, { capture: true, passive: true })
  document.addEventListener('mousedown', unlockAudioContext, { capture: true, passive: true })
  document.addEventListener('click', unlockAudioContext, { capture: true, passive: true })
}

// ─── Preload all audio buffers ───────────────────────────────────────────────

async function loadBuffer(type: SoundType): Promise<AudioBuffer | null> {
  try {
    const ctx = getAudioContext()
    const response = await fetch(soundUrls[type])
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    bufferCache[type] = audioBuffer
    return audioBuffer
  } catch (err) {
    console.debug(`Failed to load sound "${type}":`, err)
    return null
  }
}

// Kick off loading all sounds immediately
const loadPromises: Partial<Record<SoundType, Promise<AudioBuffer | null>>> = {}
;(Object.keys(soundUrls) as SoundType[]).forEach((type) => {
  loadPromises[type] = loadBuffer(type)
})

// ─── Play Sound ──────────────────────────────────────────────────────────────

export const playSound = (type: SoundType, volume?: number) => {
  const ctx = getAudioContext()

  // If context is still suspended (no user interaction yet), try resuming
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  const buffer = bufferCache[type]
  if (!buffer) {
    // Buffer hasn't loaded yet — wait for it, then play
    loadPromises[type]?.then((buf) => {
      if (buf) playSingleBuffer(ctx, buf, volume)
    })
    return
  }

  const isMobile = typeof window !== 'undefined' && 'ontouchstart' in window

  let effectiveVolume = volume !== undefined ? volume : 1.0
  if (isMobile) {
    effectiveVolume = type === 'failed' ? 1.0 : 0.8
  }

  // SPECIAL CASE: The failed.mp3 is extremely quiet on mobile speakers.
  // Stack 3 playbacks with tiny stagger to make it audible.
  if (isMobile && type === 'failed') {
    const stackSize = 3
    for (let i = 0; i < stackSize; i++) {
      setTimeout(() => {
        playSingleBuffer(ctx, buffer, effectiveVolume)
      }, i * 2)
    }
    return
  }

  playSingleBuffer(ctx, buffer, effectiveVolume)
}

function playSingleBuffer(ctx: AudioContext, buffer: AudioBuffer, volume?: number) {
  const source = ctx.createBufferSource()
  source.buffer = buffer

  // Apply volume via a GainNode
  const gainNode = ctx.createGain()
  gainNode.gain.value = volume !== undefined ? volume : 1.0
  source.connect(gainNode)
  gainNode.connect(ctx.destination)

  source.start(0)
}
