<script setup lang="ts">
import { useNewsStore } from '@/stores/news'
import type { NewsCategory } from '@/types'

const newsStore = useNewsStore()

const categories: Array<{ value: NewsCategory | null; label: string }> = [
  { value: null, label: '全部' },
  { value: 'tech', label: '科技' },
  { value: 'world', label: '世界局勢' },
  { value: 'finance', label: '財經' },
  { value: 'ufo', label: '外星人' },
  { value: 'taiwan', label: '台灣' },
]
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="cat in categories"
      :key="String(cat.value)"
      class="rounded-full border px-3 py-1 text-sm font-medium transition-colors"
      :class="
        newsStore.activeCategory === cat.value
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-primary'
      "
      @click="newsStore.setCategory(cat.value)"
    >
      {{ cat.label }}
    </button>
  </div>
</template>
