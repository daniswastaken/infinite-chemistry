<script setup lang="ts">
import Resource from "@/components/Resource.vue";
import {useResourcesStore} from "@/stores/useResourcesStore";
import {storeToRefs} from "pinia";
import {computed, ref} from "vue";
const store = useResourcesStore()
const {resources} = storeToRefs(store)
const searchTerm = ref('')

const filteredResources = computed(() => {
  return resources.value.filter((resource) => {
    return resource.title.toLowerCase().includes(searchTerm.value.toLowerCase())
  })
})
</script>

<template>
  <!-- Instructional Text -->
  <div class="px-4 py-3 text-center border-b border-[#e2e2e2] text-sm text-gray-500">
    ← Drag elements to craft
  </div>

  <!-- Resource List -->
  <div class="flex-1 overflow-y-auto px-2 py-2 pb-8 flex gap-[6px] flex-wrap content-start">
    <Resource v-for="resource in filteredResources" :key="resource.title" :title="resource.title"  :emoji="resource.emoji" :symbol="resource.symbol" :icon="resource.icon"></Resource>
  </div>

  <!-- Search Bar at Bottom -->
  <div class="px-4 py-3 border-t border-[#e2e2e2] bg-white mt-auto sticky bottom-0 z-10 w-full flex-shrink-0">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg class="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
      </div>
      <input v-model="searchTerm" type="text" class="block w-full p-2 pl-9 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none transition" placeholder="Search items...">
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar to look sleeker */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>