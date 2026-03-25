<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NewsItem, ArticleContent } from '@/types'
import { fetchArticle } from '@/api/article'

const props = defineProps<{
  news: NewsItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

const article = ref<ArticleContent | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const fontSize = ref(18)

watch(
  () => props.news,
  async (news) => {
    if (!news) {
      article.value = null
      error.value = null
      return
    }
    article.value = null
    error.value = null
    isLoading.value = true
    try {
      const res = await fetchArticle(news.url)
      if (res.data) {
        article.value = res.data
      } else {
        error.value = res.error ?? '無法萃取正文'
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 408) {
        error.value = '載入逾時'
      } else {
        error.value = '發生錯誤'
      }
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true },
)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="news"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-8 backdrop-blur-sm"
      @click.self="emit('close')"
      @keydown="onKeydown"
    >
      <div
        class="relative w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <!-- Modal Header -->
        <div class="sticky top-0 z-10 flex items-start gap-3 rounded-t-xl border-b border-border bg-card px-5 py-4">
          <h2 class="flex-1 text-base font-semibold leading-snug text-foreground">
            {{ article?.title ?? news.title }}
          </h2>
          <div class="flex shrink-0 items-center gap-2">
            <!-- 字體縮小 -->
            <button
              class="rounded border border-border px-2 py-0.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              title="縮小字體"
              @click="fontSize = Math.max(14, fontSize - 2)"
            >
              A-
            </button>
            <!-- 字體放大 -->
            <button
              class="rounded border border-border px-2 py-0.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              title="放大字體"
              @click="fontSize = Math.min(24, fontSize + 2)"
            >
              A+
            </button>
            <!-- 原文連結 -->
            <a
              :href="news.url"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded border border-border px-2 py-0.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              原文連結
            </a>
            <!-- 關閉 -->
            <button
              class="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="關閉"
              @click="emit('close')"
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
        </div>

        <!-- Content Area -->
        <div class="min-h-75 px-5 pb-8 pt-5">
          <!-- Loading -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 py-16">
            <span class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p class="text-sm text-muted-foreground">正在載入全文…</p>
          </div>

          <!-- Error / Fallback -->
          <div
            v-else-if="error"
            class="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center"
          >
            <span class="text-3xl">📄</span>
            <p class="font-medium text-foreground">無法取得全文</p>
            <p class="text-sm text-muted-foreground">
              {{ error === '載入逾時' ? '載入逾時，請稍後再試' : '可能原因：付費牆或動態網頁限制' }}
            </p>
            <a
              :href="news.url"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-2 inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              前往原文閱讀 →
            </a>
          </div>

          <!-- Article Content -->
          <div
            v-else-if="article"
            class="reader-content"
            :style="{ fontSize: `${fontSize}px` }"
            v-html="article.content"
          />
        </div>

        <!-- Meta info (byline / siteName) -->
        <div
          v-if="article && (article.byline || article.siteName)"
          class="border-t border-border px-5 py-3 text-xs text-muted-foreground"
        >
          <span v-if="article.byline">{{ article.byline }}</span>
          <span v-if="article.byline && article.siteName"> · </span>
          <span v-if="article.siteName">{{ article.siteName }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
