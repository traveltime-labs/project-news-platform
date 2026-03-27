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
  <div class="space-y-5">
    <div>
      <h1 class="text-[20px] font-medium text-white/90">我的收藏</h1>
      <p class="mt-1 text-xs text-white/30">已收藏 {{ bookmarkedNews.length }} 則新聞</p>
    </div>

    <!-- Loading -->
    <div
      v-if="newsStore.isLoading && newsStore.items.length === 0"
      class="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="flex flex-col gap-3 rounded-[12px] border border-white/8 bg-white/[0.04] p-[13px]"
      >
        <div class="flex gap-2">
          <div class="h-3 w-16 animate-pulse rounded-full bg-white/10" />
          <div class="h-3 w-12 animate-pulse rounded-full bg-white/10" />
        </div>
        <div class="h-3.5 w-full animate-pulse rounded bg-white/10" />
        <div class="h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
      </div>
    </div>

    <!-- Bookmarked News Grid -->
    <div
      v-else-if="bookmarkedNews.length > 0"
      class="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3"
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
      class="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-white/22 p-16 text-center"
    >
      <svg class="h-12 w-12 text-[#8b85ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <p class="mt-3 font-medium text-white/88">還沒有收藏</p>
      <p class="mt-1 text-sm text-white/40">在新聞牆點擊愛心即可收藏新聞</p>
      <RouterLink
        to="/"
        class="mt-4 rounded-[6px] border border-[rgba(108,99,255,0.3)] bg-[rgba(108,99,255,0.1)] px-4 py-1.5 text-sm text-[#8b85ff] transition-all duration-150 hover:bg-[rgba(108,99,255,0.18)]"
      >
        前往新聞牆
      </RouterLink>
    </div>
  </div>
</template>
