<script setup lang="ts">
import { ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useNewsStore } from '@/stores/news'

const newsStore = useNewsStore()
const inputValue = ref('')

const debouncedSearch = useDebounceFn((q: string) => {
  newsStore.setSearchQuery(q)
}, 300)

function onInput(e: Event) {
  const q = (e.target as HTMLInputElement).value
  inputValue.value = q
  if (q === '') {
    newsStore.setSearchQuery('')
  } else {
    debouncedSearch(q)
  }
}

function clearSearch() {
  inputValue.value = ''
  newsStore.setSearchQuery('')
}
</script>

<template>
  <div class="relative">
    <svg
      class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35" />
    </svg>
    <input
      type="text"
      :value="inputValue"
      placeholder="搜尋新聞標題或摘要…"
      class="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-black"
      @input="onInput"
    />
    <button
      v-if="inputValue"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      aria-label="清除搜尋"
      @click="clearSearch"
    >
      <svg
        class="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
