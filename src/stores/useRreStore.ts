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
  let timerInterval: number | null = null

  function startGame() {
    if (isActive.value) return

    // Clear any previous state
    showSuccessPopup.value = false
    showFailPopup.value = false

    // Generate new random target
    targetCompound.value = generateRandomTarget()
    if (!targetCompound.value) return // Failsafe

    // Initialize timer
    isActive.value = true
    const settingsStore = useSettingsStore()
    const initialTime = settingsStore.timeLimit
    timeLeft.value = initialTime

    // Set broken_cycle flag in localStorage (detected on next page load)
    localStorage.setItem('ic_rre_was_active', 'true')

    // Store start time for delta calculation
    const startTime = Date.now()
    let panicModeStarted = false

    // Using 100ms interval for <0.1s achievement support, but calculating based on real time delta
    timerInterval = window.setInterval(() => {
      const elapsedMs = Date.now() - startTime
      const newTime = Math.max(0, initialTime - elapsedMs / 1000)

      // Update the reactive ref with formatting
      timeLeft.value = Number(newTime.toFixed(1))

      // Panic mode: starts when time < 5 seconds
      const achievementStore = useAchievementStore()
      if (!panicModeStarted && timeLeft.value <= 5) {
        panicModeStarted = true
        achievementStore.startRrePanicMode()
      }

      if (timeLeft.value <= 0) {
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
    stopGame()
    const settingsStore = useSettingsStore()
    const achievementStore = useAchievementStore()
    achievementStore.onChallengeLose(settingsStore.difficulty)
    achievementStore.onChallengeLoseExtended(settingsStore.difficulty)
    achievementStore.stopRrePanicMode()
    achievementStore.checkIceAge(0)
    // Clear broken_cycle flag (game ended normally)
    localStorage.removeItem('ic_rre_was_active')

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
    achievementStore.onChallengeWinExtended(
      settingsStore.difficulty,
      timeLeft.value,
      settingsStore.timeLimit
    )
    achievementStore.stopRrePanicMode()
    // Clear broken_cycle flag (game ended normally)
    localStorage.removeItem('ic_rre_was_active')

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
    if (!isActive.value || !targetCompound.value) return

    // Compare formula string directly as they should match identically if composed from the exact same rules
    if (newCompound.formula === targetCompound.value.formula) {
      winGame()
    }
  }

  function toggleGame() {
    const achievementStore = useAchievementStore()
    achievementStore.recordChallengeModeClick()

    if (isActive.value) {
      stopGame()
      achievementStore.recordRreTargetChange()
      targetCompound.value = null
      // Clear broken_cycle flag (game was stopped manually)
      localStorage.removeItem('ic_rre_was_active')
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
    toggleGame
  }
})
