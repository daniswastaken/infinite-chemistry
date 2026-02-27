import { ref } from 'vue'
import { defineStore } from 'pinia'
import { elementMap } from '@/utils/elements'

export interface ResourceStoreEntry {
  title: string
  emoji?: string
  symbol?: string
  icon?: string
}

export const useResourcesStore = defineStore('resources', () => {
  const initialResources: ResourceStoreEntry[] = Object.entries(elementMap).map(
    ([symbol, title]) => ({
      title,
      symbol
    })
  )

  const resources = ref<ResourceStoreEntry[]>(initialResources)
  function addResource(box: ResourceStoreEntry) {
    resources.value.push(box)
  }

  return { resources, addResource }
})
