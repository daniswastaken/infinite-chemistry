import { ref } from 'vue'
import { defineStore } from 'pinia'
import { elements } from '@/utils/elements'
import { polyatomics } from '@/utils/polyatomics'
import { formatFormula } from '@/utils/chemistryEngine'

export type ResourceType = 'Elemen' | 'Ion' | 'Kovalen'

export interface ResourceStoreEntry {
  title: string
  emoji?: string
  symbol?: string
  icon?: string
  atomicNumber?: number
  type: ResourceType
  formula?: string
  components?: Record<string, number>
  polyatomicId?: string
}

export const useResourcesStore = defineStore('resources', () => {
  const initialElements: ResourceStoreEntry[] = elements.map((el) => ({
    title: el.name,
    symbol: el.symbol,
    atomicNumber: el.atomicNumber,
    type: 'Elemen'
  }))

  const resources = ref<ResourceStoreEntry[]>([...initialElements])
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
