<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNewsStore } from '@/stores/news'
import { useBookmarksStore } from '@/stores/bookmarks'
import NewsCard from '@/components/NewsCard.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import SearchBar from '@/components/SearchBar.vue'
import ArticleModal from '@/components/ArticleModal.vue'
import type { NewsItem } from '@/types'

const newsStore = useNewsStore()
const bookmarksStore = useBookmarksStore()
const selectedNews = ref<NewsItem | null>(null)

onMounted(async () => {
  await Promise.all([newsStore.loadNews(true), bookmarksStore.loadBookmarks()])
})
</script>

<template>
  <div class="space-y-5">
    <!-- Page Title -->
    <div>
      <h1 class="text-[20px] font-medium text-white/90">新聞牆</h1>
      <p class="mt-1 text-xs text-white/30">全球科技、財經、世界局勢即時追蹤</p>
    </div>

    <!-- Category Filter -->
    <CategoryFilter />

    <!-- Search Bar -->
    <SearchBar />

    <!-- Error State -->
    <div v-if="newsStore.hasError" class="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
      <p class="text-sm text-destructive">載入失敗，請稍後重試</p>
      <button
        class="mt-3 rounded-md border border-border px-4 py-1.5 text-sm hover:bg-muted"
        @click="newsStore.loadNews(true)"
      >
        重新載入
      </button>
    </div>

    <!-- Skeleton Loading -->
    <div v-else-if="newsStore.isLoading && newsStore.items.length === 0" class="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="i in 6"
        :key="i"
        class="flex flex-col gap-3 rounded-[12px] border border-white/8 bg-white/[0.04] p-[13px]"
      >
        <div class="flex gap-2">
          <div class="h-3 w-16 animate-pulse rounded-full bg-white/10" />
          <div class="h-3 w-12 animate-pulse rounded-full bg-white/10" />
        </div>
        <div class="space-y-1.5">
          <div class="h-3.5 w-full animate-pulse rounded bg-white/10" />
          <div class="h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
        </div>
        <div class="space-y-1.5">
          <div class="h-2.5 w-full animate-pulse rounded bg-white/10" />
          <div class="h-2.5 w-full animate-pulse rounded bg-white/10" />
          <div class="h-2.5 w-1/2 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </div>

    <!-- News Grid -->
    <template v-else>
      <div
        v-if="newsStore.items.length > 0"
        class="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3"
      >
        <NewsCard
          v-for="item in newsStore.items"
          :key="item.id"
          :news="item"
          @read="selectedNews = $event"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 p-16 text-center"
      >
        <span class="text-4xl">📰</span>
        <p class="mt-3 text-sm text-white/45">
          {{ newsStore.searchQuery ? '找不到相關新聞' : '此分類目前沒有新聞' }}
        </p>
      </div>

      <!-- Load More -->
      <div v-if="newsStore.hasMore()" class="flex justify-center pt-2">
        <button
          :disabled="newsStore.isLoading"
          class="rounded-md border border-white/12 px-6 py-2 text-sm font-medium text-white/75 transition-all duration-150 hover:bg-white/5 disabled:opacity-50"
          @click="newsStore.loadNews(false)"
        >
          <span v-if="newsStore.isLoading" class="flex items-center gap-2">
            <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            載入中…
          </span>
          <span v-else>載入更多</span>
        </button>
      </div>

      <!-- Total count -->
      <p v-if="newsStore.items.length > 0" class="text-center text-xs text-white/28">
        顯示 {{ newsStore.items.length }} / {{ newsStore.total }} 則新聞
      </p>
    </template>
  </div>

  <!-- Article Full-Text Modal -->
  <ArticleModal :news="selectedNews" @close="selectedNews = null" />
</template>
