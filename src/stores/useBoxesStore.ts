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

  function addBox(box: BoxStoreEntry) {
    const randomId = Math.random().toString(36).substr(2, 5)
    boxes[randomId] = box
  }

  function removeBox(id: string) {
    delete boxes[id]
  }

  function clearBoxes() {
    for (const key in boxes) {
      delete boxes[key]
    }
  }

  return { boxes, removeBox, addBox, clearBoxes }
})
