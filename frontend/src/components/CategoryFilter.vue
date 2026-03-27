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
      class="rounded-[20px] border px-[14px] py-[5px] text-xs transition-all duration-150"
      :class="
        newsStore.activeCategory === cat.value
          ? 'border-[rgba(108,99,255,0.4)] bg-[rgba(108,99,255,0.2)] font-medium text-[#a09aff]'
          : 'border-white/12 bg-transparent text-white/40 hover:bg-white/5 hover:text-white/65'
      "
      @click="newsStore.setCategory(cat.value)"
    >
      {{ cat.label }}
    </button>
  </div>
</template>
