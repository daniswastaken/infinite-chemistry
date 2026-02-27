<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
</script>

<template>
  <div class="h-screen w-screen overflow-hidden bg-white select-none" @contextmenu.prevent>
    <RouterView/>
  </div>
</template>

<style scoped>

</style>
