<script setup lang="ts">
import Container from './Container.vue'

import { DndProvider } from 'vue3-dnd'
import { TouchBackend } from 'react-dnd-touch-backend'

// TouchBackend with enableMouseEvents = true uses mousedown/mousemove/mouseup
// instead of the HTML5 Drag API. This permanently eliminates the native browser
// ghost image without needing getEmptyImage() or any connector hacks.
const backendOptions = {
  enableMouseEvents: true,
  get scrollAngleRanges() {
    // Only apply horizontal scroll checking on mobile, and only if touching the tray
    if (window.innerWidth <= 768) {
      const lastTarget = (window as any)._lastTouchTarget;
      if (lastTarget && lastTarget.closest('.mobile-sidebar')) {
        return [
          // Allow horizontal scrolling (angles close to 0/180/360 degrees)
          { start: 330, end: 360 },
          { start: 0, end: 30 },
          { start: 150, end: 210 }
        ];
      }
    }
    // Return undefined meaning no angles are restricted (omnidirectional dragging on canvas)
    return undefined;
  }
}

// Global listener to track where the touch started
if (typeof window !== 'undefined') {
  window.addEventListener('touchstart', (e) => {
    (window as any)._lastTouchTarget = e.target;
  }, { passive: true, capture: true });
}
</script>

<template>
  <div class="h-full">
    <DndProvider :backend="TouchBackend" :options="backendOptions">
      <Container />
    </DndProvider>
  </div>
</template>
