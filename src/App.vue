<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
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
