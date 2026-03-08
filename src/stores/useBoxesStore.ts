import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { playSound } from '@/utils/audio'

export interface BoxStoreEntry {
  top: number
  left: number
  title: string
  emoji?: string
  symbol?: string
  icon?: string
  loading?: boolean
  formula?: string
  isNew?: boolean
  max_covalent_slots?: number
  current_occupied_slots?: number
  components?: Record<string, number>
  zIndex?: number
  atomicId?: string
  createdAt?: number
}

export const useBoxesStore = defineStore('counter', () => {
  const boxes = reactive<{
    [key: string]: BoxStoreEntry
  }>({})

  const selectedIds = ref<string[]>([])
  const history = ref<string[]>([])
  const showFormulas = ref(false)
  const isAtomicModeActive = ref(false)
  const rejectedBoxId = ref<string | null>(null)
  const successBoxId = ref<string | null>(null)
  const successStartTime = ref<number>(0)
  const highestZIndex = ref(1)

  const debugError = ref<string | null>(null)
  function showDebugError(message: string) {
    debugError.value = message
    setTimeout(() => {
      if (debugError.value === message) debugError.value = null
    }, 3000)
  }

  function bringToFront(id: string) {
    if (boxes[id]) {
      highestZIndex.value++
      boxes[id].zIndex = highestZIndex.value
    }
  }

  function toggleFormulas() {
    showFormulas.value = !showFormulas.value
  }
  function toggleAtomicMode() {
    isAtomicModeActive.value = !isAtomicModeActive.value
  }
  function triggerRejectAnimation(id: string) {
    rejectedBoxId.value = id
    setTimeout(() => {
      if (rejectedBoxId.value === id) rejectedBoxId.value = null
    }, 500) // 500ms shake animation duration
  }

  function triggerSuccessAnimation(id: string) {
    successBoxId.value = id
    successStartTime.value = Date.now()
    setTimeout(() => {
      if (successBoxId.value === id) {
        successBoxId.value = null
        successStartTime.value = 0
      }
    }, 3200) // 3.2s duration to safely allow 3s CSS animation to finish
  }

  function saveHistory() {
    // Snapshot of current boxes
    history.value.push(JSON.stringify(boxes))
    // Limit history to 50 steps
    if (history.value.length > 50) history.value.shift()
  }

  function undo() {
    if (history.value.length === 0) return
    const lastState = JSON.parse(history.value.pop()!)

    // Clear current boxes
    for (const key in boxes) {
      delete boxes[key]
    }
    // Restore previous state
    Object.assign(boxes, lastState)
    selectedIds.value = []
    playSound('put', 0.3)
  }

  function addBox(box: BoxStoreEntry, shouldSaveHistory = true) {
    if (shouldSaveHistory) saveHistory()
    highestZIndex.value++
    box.zIndex = highestZIndex.value
    box.createdAt = Date.now()
    const randomId = Math.random().toString(36).substr(2, 5)
    boxes[randomId] = box
    return randomId
  }

  function removeBox(id: string, shouldSaveHistory = true, silent = false) {
    if (shouldSaveHistory) saveHistory()
    delete boxes[id]
    // Also remove from selected if present
    selectedIds.value = selectedIds.value.filter((sid) => sid !== id)
    if (!silent) playSound('delete')
  }

  function clearBoxes() {
    // Broom action: Wipe everything and clear history to free memory
    for (const key in boxes) {
      delete boxes[key]
    }
    selectedIds.value = []
    history.value = []
    playSound('delete')
  }

  function updateBoxPosition(id: string, left: number, top: number) {
    if (boxes[id]) {
      saveHistory()
      boxes[id].left = left
      boxes[id].top = top
      bringToFront(id)
    }
  }

  function moveBox(
    id: string | null,
    left: number,
    top: number,
    title?: string,
    emoji?: string,
    symbol?: string,
    icon?: string,
    formula?: string,
    components?: Record<string, number>,
    atomicId?: string
  ) {
    if (id) {
      updateBoxPosition(id, left, top)
    } else if (title) {
      addBox({ top, left, title, emoji, symbol, icon, formula, components, atomicId })
    }
  }

  function setSelectedIds(ids: string[]) {
    selectedIds.value = ids
  }

  function clearSelection() {
    selectedIds.value = []
  }

  function removeSelected(silent = false) {
    if (selectedIds.value.length === 0) return
    saveHistory()
    selectedIds.value.forEach((id) => {
      delete boxes[id]
    })
    selectedIds.value = []
    if (!silent) playSound('delete')
  }

  return {
    boxes,
    selectedIds,
    removeBox,
    addBox,
    clearBoxes,
    setSelectedIds,
    clearSelection,
    removeSelected,
    undo,
    moveBox,
    saveHistory,
    showFormulas,
    isAtomicModeActive,
    toggleFormulas,
    toggleAtomicMode,
    rejectedBoxId,
    triggerRejectAnimation,
    successBoxId,
    successStartTime,
    triggerSuccessAnimation,
    bringToFront,
    debugError,
    showDebugError
  }
})
