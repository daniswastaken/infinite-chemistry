import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateRandomTarget } from '@/utils/rreLogic'
import { playSound } from '@/utils/audio'
import type { BondAttemptResult } from '@/utils/chemistryEngine'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useAchievementStore } from '@/stores/useAchievementStore'

type TargetCompound = NonNullable<BondAttemptResult['newCompound']>

export const useRreStore = defineStore('rre', () => {
  const isActive = ref(false)
  const targetCompound = ref<TargetCompound | null>(null)
  const timeLeft = ref(30)
  const showSuccessPopup = ref(false)
  const showFailPopup = ref(false)
  const gameStartTime = ref<number | null>(null)
  let lastFailedAt = 0
  let lastFailedTargetFormula = ''
  let timerInterval: number | null = null
  let rreInitialTime = 0
  let lastRreInteractionTime = 0
  let iceAgeTriggeredThisRound = false

  function recordInteraction() {
    lastRreInteractionTime = Date.now()
  }

  function startGame() {
    if (isActive.value) return
    if (timerInterval) clearInterval(timerInterval)

    // Clear any previous state
    showSuccessPopup.value = false
    showFailPopup.value = false

    const achievementStore = useAchievementStore()
    achievementStore.resetPanicModeDragCount()

    // Generate new random target
    targetCompound.value = generateRandomTarget()
    if (!targetCompound.value) return // Failsafe

    // Initialize timer
    isActive.value = true
    const settingsStore = useSettingsStore()
    const initialTime = settingsStore.timeLimit
    timeLeft.value = initialTime
    rreInitialTime = initialTime
    lastRreInteractionTime = Date.now()
    iceAgeTriggeredThisRound = false

    // Store start time for delta calculation
    const startTime = Date.now()
    gameStartTime.value = startTime

    // Using 100ms interval for updates
    timerInterval = window.setInterval(() => {
      const elapsedMs = Date.now() - startTime
      const rawTime = initialTime - elapsedMs / 1000

      // Update the reactive ref with formatting (1 decimal place)
      // Clamped to 0 for stable display
      timeLeft.value = Number(Math.max(0, rawTime).toFixed(1))

      // Ice Age check: 30 consecutive seconds without interaction
      if (!iceAgeTriggeredThisRound && Date.now() - lastRreInteractionTime >= 30000) {
        useAchievementStore().checkIceAge(rreInitialTime, 30)
        iceAgeTriggeredThisRound = true
      }

      if (rawTime <= 0) {
        timeLeft.value = 0
        loseGame()
      }
    }, 100)

    playSound('click', 0.5, 1.0)
  }

  function stopGame() {
    isActive.value = false
    if (timerInterval !== null) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function loseGame() {
    lastFailedAt = Date.now()
    lastFailedTargetFormula = targetCompound.value?.formula || ''

    const settingsStore = useSettingsStore()
    const achievementStore = useAchievementStore()

    stopGame()

    achievementStore.onChallengeLose(settingsStore.difficulty)
    achievementStore.resetPanicModeDragCount()

    showFailPopup.value = true
    if (!achievementStore.pendingToast) {
      playSound('failed', 0.8)
    }

    setTimeout(() => {
      showFailPopup.value = false
      targetCompound.value = null
    }, 3000)
  }

  function winGame() {
    stopGame()
    const settingsStore = useSettingsStore()
    const achievementStore = useAchievementStore()
    achievementStore.onChallengeWin(settingsStore.difficulty, timeLeft.value)
    achievementStore.resetPanicModeDragCount()

    const durationSec = gameStartTime.value ? (Date.now() - gameStartTime.value) / 1000 : 999
    achievementStore.recordRreWin(settingsStore.difficulty, durationSec, settingsStore.timeLimit)

    if (durationSec < 1.0) {
      achievementStore.unlock('flash_point')
    }

    showSuccessPopup.value = true
    if (!achievementStore.pendingToast) {
      playSound('success', 0.8)
    }

    setTimeout(() => {
      showSuccessPopup.value = false
      targetCompound.value = null
    }, 3000)
  }

  function checkWinCondition(newCompound: TargetCompound) {
    // If active, normal win check
    if (isActive.value && targetCompound.value) {
      if (newCompound.formula === targetCompound.value.formula) {
        winGame()
      }
      return
    }

    // If inactive, check for Fortune Teller (Late completion within 1s)
    if (!isActive.value && lastFailedAt > 0) {
      const now = Date.now()
      if (now - lastFailedAt < 1000 && newCompound.formula === lastFailedTargetFormula) {
        const achievementStore = useAchievementStore()
        achievementStore.unlock('fortune_teller')
        // Clear failsafe to prevent double trigger
        lastFailedAt = 0
      }
    }
  }

  function toggleGame() {
    const achievementStore = useAchievementStore()
    achievementStore.recordChallengeModeClick()

    if (isActive.value) {
      // Achievement: Ilmuwan yang Ragu (switching/stopping target)
      achievementStore.recordRreTargetSwitch()
      stopGame()
      targetCompound.value = null
      playSound('click', 0.5, 1.0)
    } else {
      startGame()
    }
  }

  return {
    isActive,
    targetCompound,
    timeLeft,
    showSuccessPopup,
    showFailPopup,
    startGame,
    stopGame,
    checkWinCondition,
    toggleGame,
    recordInteraction
  }
})
