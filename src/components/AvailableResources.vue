<script setup lang="ts">
import Resource from '@/components/Resource.vue'
import { useResourcesStore } from '@/stores/useResourcesStore'
import { useBoxesStore } from '@/stores/useBoxesStore'
import { storeToRefs } from 'pinia'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { playSound } from '@/utils/audio'
import { elements, getElementIonicForm } from '@/utils/elements'
import { useAchievementStore } from '@/stores/useAchievementStore'

const achievementStore = useAchievementStore()
const resourcesStore = useResourcesStore()
const { resources, searchTerm } = storeToRefs(resourcesStore)
const { clearSearch } = resourcesStore

const boxesStore = useBoxesStore()
const { showFormulas } = storeToRefs(boxesStore)

const activeTab = ref('Elemen')

const normalizeFormula = (text: string) => {
  if (!text) return ''
  // Map subscripts back to regular numbers
  const subscripts: Record<string, string> = {
    '₀': '0',
    '₁': '1',
    '₂': '2',
    '₃': '3',
    '₄': '4',
    '₅': '5',
    '₆': '6',
    '₇': '7',
    '₈': '8',
    '₉': '9'
  }
  return text
    .split('')
    .map((char) => subscripts[char] || char)
    .join('')
    .toLowerCase()
}

const filteredResources = computed(() => {
  return resources.value.filter((resource) => {
    // Filter by type matching the active tab
    if (resource.type !== activeTab.value) return false

    const query = searchTerm.value.toLowerCase()

    // If formula mode is ON, search primarily by formula/symbol
    if (showFormulas.value) {
      const normalizedResFormula = normalizeFormula(resource.formula || '')
      const normalizedResSymbol = (resource.symbol || '').toLowerCase()

      const formulaMatch = normalizedResFormula.includes(query)
      const symbolMatch = normalizedResSymbol.includes(query)
      return formulaMatch || symbolMatch
    }

    // Regular search by Indonesian title
    const nameMatch = resource.title.toLowerCase().includes(query)

    // Also search by ionic name if in Atomic Mode and it's a single element
    let ionicMatch = false
    if (boxesStore.isAtomicModeActive && resource.symbol && !resource.atomicId) {
      const element = elements.find((e) => e.symbol === resource.symbol)
      if (element) {
        const ionic = getElementIonicForm(element)
        if (ionic && ionic.name.toLowerCase().includes(query)) {
          ionicMatch = true
        }
      }
    }

    return nameMatch || ionicMatch
  })
})

watch(searchTerm, (newVal) => {
  if (newVal.trim()) {
    achievementStore.recordSearch()
  }
})

const searchInput = ref<HTMLInputElement | null>(null)

defineExpose({
  focusSearch: () => {
    searchInput.value?.focus()
  }
})

const chunkedResources = computed(() => {
  const isMobile = window.innerWidth <= 768
  const numRows = isMobile ? 3 : 1 // On mobile use 3 rows, desktop use 1 (standard wrap)

  if (!isMobile) {
    return [filteredResources.value]
  }

  const rows: (typeof filteredResources.value)[] = Array.from({ length: numRows }, () => [])
  filteredResources.value.forEach((res, index) => {
    rows[index % numRows].push(res)
  })
  return rows
})

// scroll_lover achievement: detect full scroll passes between edges
const resourceListRef = ref<HTMLElement | null>(null)
let lastEdge: 'start' | 'end' | null = null

const handleScroll = (e: Event) => {
  const el = e.currentTarget as HTMLElement
  const isMobile = window.innerWidth <= 768

  // Desktop: vertical scroll. Mobile: horizontal scroll.
  const scrollPos = isMobile ? el.scrollLeft : el.scrollTop
  const scrollMax = isMobile ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight

  if (scrollMax <= 20) return // not enough content to count

  const EDGE_THRESHOLD = 10 // px from edge counts as "at edge"
  const atStart = scrollPos <= EDGE_THRESHOLD
  const atEnd = scrollPos >= scrollMax - EDGE_THRESHOLD

  if (atStart && lastEdge !== 'start') {
    lastEdge = 'start'
    achievementStore.recordScrollerPass()
  } else if (atEnd && lastEdge !== 'end') {
    lastEdge = 'end'
    achievementStore.recordScrollerPass()
  }
}

onMounted(() => {
  resourceListRef.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  resourceListRef.value?.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <!-- Resource List Container with Fade -->
  <div class="mobile-resources-wrapper flex-1 overflow-hidden relative flex flex-col">
    <!-- Resource List -->
    <div
      ref="resourceListRef"
      class="mobile-resource-list flex-1 overflow-y-auto px-2 pt-0 pb-24 md:pt-2 md:pb-20 content-start custom-scroller"
    >
      <template v-if="chunkedResources.length === 1">
        <!-- Desktop: Standard wrap -->
        <div class="flex gap-[6px] flex-wrap content-start">
          <Resource
            v-for="resource in chunkedResources[0]"
            :key="resource.title"
            :title="resource.title"
            :formula="resource.formula"
            :emoji="resource.emoji"
            :symbol="resource.symbol"
            :icon="resource.icon"
            :components="resource.components"
            :atomicId="resource.atomicId"
          ></Resource>
        </div>
      </template>
      <template v-else>
        <!-- Mobile: 3 explicit horizontal rows -->
        <div class="flex flex-col gap-[6px]">
          <div
            v-for="(row, idx) in chunkedResources"
            :key="idx"
            class="flex gap-[6px] w-max pr-[48px]"
          >
            <Resource
              v-for="resource in row"
              :key="resource.title"
              :title="resource.title"
              :formula="resource.formula"
              :emoji="resource.emoji"
              :symbol="resource.symbol"
              :icon="resource.icon"
              :components="resource.components"
              :atomicId="resource.atomicId"
            ></Resource>
          </div>
        </div>
      </template>
    </div>

    <!-- Fade Overlay: Vertical for desktop, Horizontal for mobile -->
    <div
      class="mobile-fade-overlay absolute bottom-0 left-0 right-0 h-32 md:bg-gradient-to-t bg-gradient-to-l from-white dark:from-neutral-900 via-white/50 dark:via-neutral-900/50 to-transparent pointer-events-none z-[5]"
    ></div>
  </div>

  <!-- Search Bar and Tabs Container -->
  <div
    class="mobile-tabs-search mt-auto sticky bottom-0 z-10 w-full flex-shrink-0 bg-white dark:bg-neutral-900 md:border-t-0"
  >
    <!-- Tabs -->
    <div
      class="flex items-end px-2 pt-2 gap-1 w-full scroller-hide border-b border-[#c8c8c8] dark:border-neutral-800"
    >
      <button
        @click="
          (e) => {
            activeTab = 'Elemen'
            playSound('click', 0.3, 1.0)
            achievementStore.recordElementTabOpen()
            ;(e.currentTarget as HTMLElement).blur()
          }
        "
        class="flex-1 flex items-center justify-center gap-1.5 px-3 pt-1.5 pb-1 font-medium rounded-t-md border-t border-x border-[#c8c8c8] dark:border-neutral-800 transition-colors whitespace-nowrap outline-none outline-0"
        :class="
          activeTab === 'Elemen'
            ? 'bg-white dark:bg-neutral-900 text-black dark:text-neutral-100 z-10 border-b border-b-white dark:border-b-neutral-900 -mb-[1px]'
            : 'bg-[#fafafa] dark:bg-black/20 text-black dark:text-neutral-400 md:hover:bg-[#f4f4f4] dark:md:hover:bg-black/40 active:bg-[#f4f4f4] dark:active:bg-black/40 border-b-transparent'
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path
            d="M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88ZM137,164.22a8,8,0,0,0-4.74,4.74L112,223.85,91.78,169A8,8,0,0,0,87,164.22L32.15,144,87,123.78A8,8,0,0,0,91.78,119L112,64.15,132.22,119a8,8,0,0,0,4.74,4.74L191.85,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"
          ></path>
        </svg>
        Elemen
      </button>

      <button
        @click="
          (e) => {
            activeTab = 'Ion'
            playSound('click', 0.3, 1.0)
            achievementStore.recordTabSwitch()
            ;(e.currentTarget as HTMLElement).blur()
          }
        "
        class="flex-1 flex items-center justify-center gap-1.5 px-3 pt-1.5 pb-1 font-medium rounded-t-md border-t border-x border-[#c8c8c8] dark:border-neutral-800 transition-colors whitespace-nowrap outline-none outline-0"
        :class="
          activeTab === 'Ion'
            ? 'bg-white dark:bg-neutral-900 text-black dark:text-neutral-100 z-10 border-b border-b-white dark:border-b-neutral-900 -mb-[1px]'
            : 'bg-[#fafafa] dark:bg-black/20 text-black dark:text-neutral-400 md:hover:bg-[#f4f4f4] dark:md:hover:bg-black/40 active:bg-[#f4f4f4] dark:active:bg-black/40 border-b-transparent'
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path
            d="M205.66,61.66l-144,144a8,8,0,0,1-11.32-11.32l144-144a8,8,0,0,1,11.32,11.32ZM64,112a8,8,0,0,0,16,0V80h32a8,8,0,0,0,0-16H80V32a8,8,0,0,0-16,0V64H32a8,8,0,0,0,0,16H64Zm160,64H144a8,8,0,0,0,0,16h80a8,8,0,0,0,0-16Z"
          ></path>
        </svg>
        Ion
      </button>

      <button
        @click="
          (e) => {
            activeTab = 'Kovalen'
            playSound('click', 0.3, 1.0)
            achievementStore.recordTabSwitch()
            ;(e.currentTarget as HTMLElement).blur()
          }
        "
        class="flex-1 flex items-center justify-center gap-1.5 px-3 pt-1.5 pb-1 font-medium rounded-t-md border-t border-x border-[#c8c8c8] dark:border-neutral-800 transition-colors whitespace-nowrap outline-none outline-0"
        :class="
          activeTab === 'Kovalen'
            ? 'bg-white dark:bg-neutral-900 text-black dark:text-neutral-100 z-10 border-b border-b-white dark:border-b-neutral-900 -mb-[1px]'
            : 'bg-[#fafafa] dark:bg-black/20 text-black dark:text-neutral-400 md:hover:bg-[#f4f4f4] dark:md:hover:bg-black/40 active:bg-[#f4f4f4] dark:active:bg-black/40 border-b-transparent'
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <path
            d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"
          />
          <path
            d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"
          />
        </svg>
        Kovalen
      </button>
    </div>

    <!-- Search Input -->
    <div class="relative w-full">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          class="w-5 h-5 text-[#b0b0b0]"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <input
        ref="searchInput"
        v-model="searchTerm"
        type="text"
        @keydown.tab.prevent="
          () => {
            if (searchTerm) {
              clearSearch()
              playSound('click', 0.3, 1.0)
            }
          }
        "
        class="block w-full py-3 md:py-3 pl-10 md:pl-10 pr-10 text-[15px] md:text-[16px] text-neutral-500 bg-white dark:bg-neutral-900 focus:outline-none transition placeholder-neutral-400 dark:placeholder-neutral-500"
        :placeholder="`Search (${filteredResources.length}) items...`"
      />
      <button
        v-if="searchTerm"
        @click="
          (e) => {
            clearSearch()
            playSound('click', 0.3, 1.0)
            ;(e.currentTarget as HTMLElement).blur()
          }
        "
        class="absolute inset-y-0 right-0 flex items-center px-3 group cursor-pointer h-full"
        title="Clear search"
      >
        <img
          src="@/assets/icons/clear.svg"
          class="w-4 h-4 opacity-40 dark:opacity-60 dark:invert md:group-hover:opacity-100 transition-opacity"
          alt="Clear"
        />
      </button>
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
