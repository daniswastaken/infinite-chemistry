<script setup lang="ts">
import Resource from "@/components/Resource.vue";
import {useResourcesStore} from "@/stores/useResourcesStore";
import {storeToRefs} from "pinia";
import {computed, ref} from "vue";
const store = useResourcesStore()
const {resources} = storeToRefs(store)
const searchTerm = ref('')
const activeTab = ref('Elemen')

const filteredResources = computed(() => {
  return resources.value.filter((resource) => {
    // Filter by type matching the active tab
    if (resource.type !== activeTab.value) return false
    
    return resource.title.toLowerCase().includes(searchTerm.value.toLowerCase())
  })
})
</script>

<template>
  <!-- Resource List Container with Fade -->
  <div class="flex-1 overflow-hidden relative flex flex-col">

    <!-- Resource List -->
    <div class="flex-1 overflow-y-auto px-2 py-2 pb-4 flex gap-[6px] flex-wrap content-start custom-scroller">
      <Resource v-for="resource in filteredResources" :key="resource.title" :title="resource.title" :formula="resource.formula" :emoji="resource.emoji" :symbol="resource.symbol" :icon="resource.icon"></Resource>
    </div>

    <!-- Fade Overlay -->
    <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/90 via-white/50 to-transparent pointer-events-none z-[5]"></div>
  </div>

  <!-- Search Bar and Tabs Container -->
  <div class="mt-auto sticky bottom-0 z-10 w-full flex-shrink-0 bg-white">
    
    <!-- Tabs -->
    <div class="flex items-end px-2 pt-2 gap-1 w-full scroller-hide border-b border-[#c8c8c8]">
      <button 
        @click="activeTab = 'Elemen'" 
        class="flex-1 flex items-center justify-center gap-1.5 px-3 pt-1.5 pb-1 font-medium rounded-t-md border border-[#c8c8c8] transition-colors whitespace-nowrap outline-none"
        :class="activeTab === 'Elemen' ? 'bg-white text-black z-10 border-b-white -mb-[1px]' : 'bg-[#fafafa] text-black hover:bg-[#f4f4f4] border-b-transparent'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88ZM137,164.22a8,8,0,0,0-4.74,4.74L112,223.85,91.78,169A8,8,0,0,0,87,164.22L32.15,144,87,123.78A8,8,0,0,0,91.78,119L112,64.15,132.22,119a8,8,0,0,0,4.74,4.74L191.85,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"></path></svg>
        Elemen
      </button>

      <button 
        @click="activeTab = 'Ion'" 
        class="flex-1 flex items-center justify-center gap-1.5 px-3 pt-1.5 pb-1 font-medium rounded-t-md border border-[#c8c8c8] transition-colors whitespace-nowrap outline-none"
        :class="activeTab === 'Ion' ? 'bg-white text-black z-10 border-b-white -mb-[1px]' : 'bg-[#fafafa] text-black hover:bg-[#f4f4f4] border-b-transparent'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,61.66l-144,144a8,8,0,0,1-11.32-11.32l144-144a8,8,0,0,1,11.32,11.32ZM64,112a8,8,0,0,0,16,0V80h32a8,8,0,0,0,0-16H80V32a8,8,0,0,0-16,0V64H32a8,8,0,0,0,0,16H64Zm160,64H144a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Z"></path></svg>
        Ion
      </button>

      <button 
        @click="activeTab = 'Kovalen'" 
        class="flex-1 flex items-center justify-center gap-1.5 px-3 pt-1.5 pb-1 font-medium rounded-t-md border border-[#c8c8c8] transition-colors whitespace-nowrap outline-none"
        :class="activeTab === 'Kovalen' ? 'bg-white text-black z-10 border-b-white -mb-[1px]' : 'bg-[#fafafa] text-black hover:bg-[#f4f4f4] border-b-transparent'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>
        Kovalen
      </button>

    </div>

    <!-- Search Input -->
    <div class="relative w-full">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg class="w-5 h-5 text-[#b0b0b0]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <input v-model="searchTerm" type="text" class="block w-full py-3 pl-10 text-[16px] text-[#b0b0b0] bg-white focus:outline-none transition placeholder-[#b0b0b0]" :placeholder="`Search (${filteredResources.length}) items...`">
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar for tabs */
.scroller-hide::-webkit-scrollbar {
  display: none;
}
.scroller-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

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