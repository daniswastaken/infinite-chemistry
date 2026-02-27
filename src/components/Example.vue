<script setup lang="ts">
import Container from './Container.vue'

import { DndProvider } from 'vue3-dnd'
import { TouchBackend } from 'react-dnd-touch-backend'

// TouchBackend with enableMouseEvents = true uses mousedown/mousemove/mouseup
// instead of the HTML5 Drag API. This permanently eliminates the native browser
// ghost image without needing getEmptyImage() or any connector hacks.
const backendOptions = {
  enableMouseEvents: true,
}
</script>

<template>
  <div class="h-full">
    <DndProvider :backend="TouchBackend" :options="backendOptions">
      <Container />
    </DndProvider>
  </div>
</template>
