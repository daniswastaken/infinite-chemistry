<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
import { onMounted, onUnmounted } from 'vue'

const DEBUG_SEQUENCE = 'dwstkn'
let keyBuffer = ''

const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if (e.key.length === 1) {
    keyBuffer += e.key
    if (keyBuffer.length > DEBUG_SEQUENCE.length) {
      keyBuffer = keyBuffer.slice(keyBuffer.length - DEBUG_SEQUENCE.length)
    }
    if (keyBuffer === DEBUG_SEQUENCE) {
      (window as any).__DEBUG_MODE__ = true
      localStorage.clear()
      sessionStorage.clear()
      console.warn("Debug mode activated. Storage cleared.")
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>

<template>
  <div class="h-[100dvh] w-screen overflow-hidden bg-white select-none" @contextmenu.prevent>
    <RouterView/>
    
    <!-- Preload SVG assets directly in DOM to eliminate the first-render pop-in delay -->
    <div style="position: absolute; width: 0; height: 0; overflow: hidden; opacity: 0; pointer-events: none;" aria-hidden="true">
      <img src="@/assets/icons/covalent.svg" alt="" />
      <img src="@/assets/icons/ionic.svg" alt="" />
    </div>
  </div>
</template>

<style scoped>

</style>
