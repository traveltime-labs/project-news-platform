<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNewsStore } from '@/stores/news'
import { useBookmarksStore } from '@/stores/bookmarks'
import NewsCard from '@/components/NewsCard.vue'

const newsStore = useNewsStore()
const bookmarksStore = useBookmarksStore()

onMounted(async () => {
  await Promise.all([
    newsStore.loadNews(true),
    bookmarksStore.loadBookmarks(),
  ])
})

const bookmarkedNews = computed(() =>
  newsStore.items.filter((n) => bookmarksStore.isBookmarked(n.id)),
)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">我的收藏</h1>
      <p class="mt-1 text-sm text-muted-foreground">已收藏 {{ bookmarkedNews.length }} 則新聞</p>
    </div>

    <!-- Loading -->
    <div
      v-if="newsStore.isLoading && newsStore.items.length === 0"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div class="flex gap-2">
          <div class="h-4 w-16 animate-pulse rounded-full bg-muted" />
          <div class="h-4 w-12 animate-pulse rounded-full bg-muted" />
        </div>
        <div class="h-4 w-full animate-pulse rounded bg-muted" />
        <div class="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
    </div>

    <!-- Bookmarked News Grid -->
    <div
      v-else-if="bookmarkedNews.length > 0"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <NewsCard
        v-for="item in bookmarkedNews"
        :key="item.id"
        :news="item"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-16 text-center"
    >
      <span class="text-4xl">🔖</span>
      <p class="mt-3 font-medium">還沒有收藏</p>
      <p class="mt-1 text-sm text-muted-foreground">在新聞牆點擊愛心即可收藏新聞</p>
      <RouterLink
        to="/"
        class="mt-4 rounded-md border border-border px-4 py-1.5 text-sm hover:bg-muted"
      >
        前往新聞牆
      </RouterLink>
    </div>
  </div>
</template>
