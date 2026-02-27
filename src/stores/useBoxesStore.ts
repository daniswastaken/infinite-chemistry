import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface BoxStoreEntry {
  top: number
  left: number
  title: string
  emoji?: string
  symbol?: string
  icon?: string
  loading?: boolean
}

export const useBoxesStore = defineStore('counter', () => {
  const boxes = reactive<{
    [key: string]: BoxStoreEntry
  }>({
    a: { top: 200, left: 400, title: 'Hidrogen', symbol: 'H' }
  })

  const selectedIds = ref<string[]>([])
  const history = ref<string[]>([])

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
  }

  function addBox(box: BoxStoreEntry, shouldSaveHistory = true) {
    if (shouldSaveHistory) saveHistory()
    const randomId = Math.random().toString(36).substr(2, 5)
    boxes[randomId] = box
  }

  function removeBox(id: string, shouldSaveHistory = true) {
    if (shouldSaveHistory) saveHistory()
    delete boxes[id]
    // Also remove from selected if present
    selectedIds.value = selectedIds.value.filter((sid) => sid !== id)
  }

  function clearBoxes() {
    // Broom action: Wipe everything and clear history to free memory
    for (const key in boxes) {
      delete boxes[key]
    }
    selectedIds.value = []
    history.value = []
  }

  function updateBoxPosition(id: string, left: number, top: number) {
    if (boxes[id]) {
      saveHistory()
      boxes[id].left = left
      boxes[id].top = top
    }
  }

  function moveBox(
    id: string | null,
    left: number,
    top: number,
    title?: string,
    emoji?: string,
    symbol?: string,
    icon?: string
  ) {
    if (id) {
      updateBoxPosition(id, left, top)
    } else if (title) {
      addBox({ top, left, title, emoji, symbol, icon })
    }
  }

  function setSelectedIds(ids: string[]) {
    selectedIds.value = ids
  }

  function clearSelection() {
    selectedIds.value = []
  }

  function removeSelected() {
    if (selectedIds.value.length === 0) return
    saveHistory()
    selectedIds.value.forEach((id) => {
      delete boxes[id]
    })
    selectedIds.value = []
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
    saveHistory
  }
})
