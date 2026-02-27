import { ref } from 'vue'
import { defineStore } from 'pinia'
import { elements } from '@/utils/elements'

export interface ResourceStoreEntry {
  title: string
  emoji?: string
  symbol?: string
  icon?: string
  atomicNumber?: number
}

export const useResourcesStore = defineStore('resources', () => {
  const initialResources: ResourceStoreEntry[] = elements.map((el) => ({
    title: el.name,
    symbol: el.symbol,
    atomicNumber: el.atomicNumber
  }))

  const resources = ref<ResourceStoreEntry[]>(initialResources)
  function addResource(box: ResourceStoreEntry) {
    resources.value.push(box)
    // Optional: Sort after adding
    resources.value.sort((a, b) => {
      if (a.atomicNumber && b.atomicNumber) return a.atomicNumber - b.atomicNumber
      if (a.atomicNumber) return -1
      if (b.atomicNumber) return 1
      return a.title.localeCompare(b.title)
    })
  }

  return { resources, addResource }
})
