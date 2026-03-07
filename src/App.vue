<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import { useAchievementStore } from '@/stores/useAchievementStore'
import { useSettingsStore } from '@/stores/useSettingsStore'

const DEBUG_SEQUENCE = 'dwstkn'
let keyBuffer = ''

const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if (e.key.length === 1) {
    keyBuffer += e.key
    if (keyBuffer.length > DEBUG_SEQUENCE.length) {
      keyBuffer = keyBuffer.slice(keyBuffer.length - DEBUG_SEQUENCE.length)
    }
    if (keyBuffer === DEBUG_SEQUENCE) {
      // 1. Enable Debug Mode in window
      ;(window as any).__DEBUG_MODE__ = true

      // 2. Clear all storage
      localStorage.clear()
      sessionStorage.clear()

      // 3. Clear all cookies
      const cookies = document.cookie.split(';')
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
      }

      console.warn('Debug mode activated. Storage & Cookies cleared.')

      // 4. Unlock achievement
      const achievementStore = useAchievementStore()
      achievementStore.unlock('dev_debug')
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown)

  // Initialize dark mode
  const settingsStore = useSettingsStore()
  if (settingsStore.isDarkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>

<template>
  <div
    class="h-[100dvh] w-screen overflow-hidden bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 select-none"
    @contextmenu.prevent
  >
    <RouterView />

    <!-- Preload SVG assets directly in DOM to eliminate the first-render pop-in delay -->
    <div
      style="
        position: absolute;
        width: 0;
        height: 0;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
      "
      aria-hidden="true"
    >
      <img src="@/assets/icons/covalent.svg" alt="" />
      <img src="@/assets/icons/ionic.svg" alt="" />
      <img src="@/assets/icons/achievement.svg" alt="" />
    </div>
  </div>
</template>

<style scoped></style>
