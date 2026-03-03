import { ref } from 'vue'
import { defineStore } from 'pinia'
import { elements } from '@/utils/elements'
import { atomicIons } from '@/utils/atomicIons'
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
  atomicId?: string
}

export const useResourcesStore = defineStore('resources', () => {
  const initialElements: ResourceStoreEntry[] = elements.map((el) => ({
    title: el.name,
    symbol: el.symbol,
    atomicNumber: el.atomicNumber,
    type: 'Elemen'
  }))

  const resources = ref<ResourceStoreEntry[]>([...initialElements])
  const searchTerm = ref('')

  function addResource(box: ResourceStoreEntry) {
    resources.value.push(box)
  }

  function clearSearch() {
    searchTerm.value = ''
  }

  return { resources, addResource, searchTerm, clearSearch }
})
