<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDragLayer } from 'vue3-dnd'
import { ItemTypes } from '@/components/ItemTypes'
import ItemCard from '@/components/ItemCard.vue'
import { twMerge } from 'tailwind-merge'
import { useBoxesStore } from '@/stores/useBoxesStore'
import { useAchievementStore } from '@/stores/useAchievementStore'

const store = useBoxesStore()
const achievementStore = useAchievementStore()

const collect = useDragLayer((monitor) => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
}))

const isDragging = computed(() => collect.value.isDragging)
const item = computed(() => collect.value.item)
const currentOffset = computed(() => collect.value.currentOffset)
const isBox = computed(() => collect.value.itemType === ItemTypes.BOX)

const layerStyle = computed(() => {
  if (!currentOffset.value) return { display: 'none' }
  const { x, y } = currentOffset.value
  return {
    transform: `translate(${x}px, ${y}px)`
  }
})

const animationOffset = ref('0s')
watch(
  [() => store.successStartTime, () => item.value?.id],
  () => {
    if (store.successBoxId && store.successBoxId === item.value?.id && store.successStartTime) {
      const elapsed = (Date.now() - store.successStartTime) / 1000
      animationOffset.value = `-${elapsed}s`
    }
  },
  { immediate: true }
)

let animationFrameId: number | null = null
let lastTimeMs = 0
let lastPosX = 0
let lastPosY = 0
let slowDurationMs = 0

// Orbital tracking
let cumulativeAngle = 0
let lastReferenceAngle = 0
let activeOrbitBoxId: string | null = null

// Atomic Dance tracking
let dragDistance = 0

// Forbidden Magnetism tracking
let magnetismDurationMs = 0

watch(isDragging, (dragging) => {
  if (dragging) {
    lastTimeMs = 0
    lastPosX = 0
    lastPosY = 0
    slowDurationMs = 0
    cumulativeAngle = 0
    lastReferenceAngle = 0
    activeOrbitBoxId = null
    dragDistance = 0
    magnetismDurationMs = 0

    const loop = (time: number) => {
      if (!isDragging.value) return

      const offset = currentOffset.value
      if (offset) {
        if (lastTimeMs === 0) {
          lastTimeMs = time
          lastPosX = offset.x
          lastPosY = offset.y
        } else {
          const dtMs = time - lastTimeMs

          if (dtMs >= 16) {
            // run ~60fps
            // Viscosity and Atomic Dance logic
            const dist = Math.hypot(offset.x - lastPosX, offset.y - lastPosY)

            dragDistance += dist
            if (dragDistance >= 10000) {
              achievementStore.recordAtomicDance(dragDistance)
            }

            const speed = (dist / dtMs) * 1000

            if (speed < 30) {
              slowDurationMs += dtMs
              if (slowDurationMs >= 5000) {
                achievementStore.unlock('viscosity')
                slowDurationMs = 0
              }
            } else {
              slowDurationMs = 0
            }

            // Orbital logic
            // Find the closest box on the canvas (generous radius so spinning works naturally)
            let closestBoxId = null
            let minDistance = 500 // large enough to allow realistic orbiting

            const boxesVal = store.boxes
            for (const boxId in boxesVal) {
              if (boxId === item.value?.id) continue
              const b = (boxesVal as any)[boxId]

              // approx center of target box
              const targetX = b.left + 60
              const targetY = b.top + 22
              // approx center of dragging box
              const dragPointX = offset.x + 60
              const dragPointY = offset.y + 22

              const d = Math.hypot(dragPointX - targetX, dragPointY - targetY)
              if (d < minDistance) {
                minDistance = d
                closestBoxId = boxId
              }
            }

            if (closestBoxId) {
              const b = (boxesVal as any)[closestBoxId]

              // Forbidden Magnetism logic
              const itemBox = (store.boxes as any)[item.value?.id || ''] || item.value
              const isIdentical =
                itemBox &&
                b &&
                ((itemBox.atomicId && b.atomicId && itemBox.atomicId === b.atomicId) ||
                  (itemBox.symbol && b.symbol && itemBox.symbol === b.symbol) ||
                  (itemBox.formula && b.formula && itemBox.formula === b.formula) ||
                  (itemBox.title && b.title && itemBox.title === b.title))

              if (minDistance < 80 && isIdentical) {
                magnetismDurationMs += dtMs
                if (magnetismDurationMs >= 10000) {
                  achievementStore.recordForbiddenMagnetism(magnetismDurationMs)
                }
              } else {
                magnetismDurationMs = 0
              }

              const targetX = b.left + 60
              const targetY = b.top + 22
              const currentAngle = Math.atan2(offset.y + 22 - targetY, offset.x + 60 - targetX)

              if (activeOrbitBoxId === closestBoxId) {
                // Determine shortest angular distance and accumulate
                let angleDiff = currentAngle - lastReferenceAngle
                // Normalize to [-PI, PI]
                if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI
                else if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI

                cumulativeAngle += angleDiff
              } else {
                // Switch tracked box — carry over angle, just reset reference
                activeOrbitBoxId = closestBoxId
                cumulativeAngle = 0
              }

              lastReferenceAngle = currentAngle
              achievementStore.recordOrbital(cumulativeAngle)
            } else {
              activeOrbitBoxId = null
              cumulativeAngle = 0
            }

            lastPosX = offset.x
            lastPosY = offset.y
            lastTimeMs = time
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    animationFrameId = requestAnimationFrame(loop)
  } else {
    // End of drag
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    animationFrameId = null
    slowDurationMs = 0
    cumulativeAngle = 0
    activeOrbitBoxId = null
    dragDistance = 0
    magnetismDurationMs = 0
  }
})
</script>

<template>
  <div
    v-if="isDragging && isBox && currentOffset"
    class="fixed top-0 left-0 z-[9999] pointer-events-none"
    :style="layerStyle"
  >
    <div
      v-if="store.successBoxId === item?.id"
      class="sunburst-effect"
      :style="{ animationDelay: animationOffset }"
    ></div>

    <div :class="twMerge('relative scale-[1.03] opacity-95')">
      <ItemCard
        size="small"
        :title="item.title"
        :formula="item.formula"
        :emoji="item.emoji"
        :symbol="item.symbol"
        :icon="item.icon"
        :atomicId="item.atomicId"
        :components="item.components"
      />
    </div>
  </div>
</template>

<style scoped>
.sunburst-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 125px;
  height: 125px;
  margin-top: -62.5px;
  margin-left: -62.5px;
  pointer-events: none;
  z-index: -1;
  background: repeating-conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(186, 230, 253, 0.5) 2deg,
    rgba(186, 230, 253, 0.5) 33deg,
    transparent 35deg,
    transparent 60deg
  );
  animation: sunburst-anim 3s linear forwards;
  border-radius: 50%;
  -webkit-mask-image: radial-gradient(circle, black 0%, transparent 70%);
  mask-image: radial-gradient(circle, black 0%, transparent 70%);
}

:global(.dark) .sunburst-effect {
  background: repeating-conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 255, 255, 0.3) 2deg,
    rgba(255, 255, 255, 0.3) 33deg,
    transparent 35deg,
    transparent 60deg
  );
}

@keyframes sunburst-anim {
  0% {
    transform: scale(0.2) rotate(0deg);
    opacity: 0;
  }
  10% {
    transform: scale(1) rotate(18deg);
    opacity: 1;
  }
  86.6% {
    transform: scale(1) rotate(156deg);
    opacity: 1;
  }
  100% {
    transform: scale(0.2) rotate(180deg);
    opacity: 0;
  }
}
</style>
