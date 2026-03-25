<script setup lang="ts">
import { ref } from 'vue'
import type { NewsItem } from '@/types'
import TranslateButton from '@/components/TranslateButton.vue'
import HeartButton from '@/components/HeartButton.vue'
import { useNewsStore } from '@/stores/news'
import { useBookmarksStore } from '@/stores/bookmarks'
import { useToast } from '@/composables/useToast'

const props = defineProps<{ news: NewsItem }>()
const emit = defineEmits<{
  read: [news: NewsItem]
}>()

const newsStore = useNewsStore()
const bookmarksStore = useBookmarksStore()
const { show } = useToast()

const isTranslating = ref(false)
const showTranslated = ref(!!props.news.titleZh)
const isTogglingBookmark = ref(false)

const categoryLabels: Record<string, string> = {
  tech: '科技',
  world: '世界局勢',
  finance: '財經',
  ufo: '外星人',
  taiwan: '台灣',
}

const categoryColors: Record<string, string> = {
  tech: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  world: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  finance: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  ufo: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  taiwan: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleTranslate(newsId: string) {
  isTranslating.value = true
  try {
    await newsStore.translate(newsId)
    showTranslated.value = true
  } catch {
    show('翻譯失敗，請稍後再試', 'error')
  } finally {
    isTranslating.value = false
  }
}

async function handleBookmarkToggle() {
  isTogglingBookmark.value = true
  try {
    await bookmarksStore.toggle(props.news.id)
  } catch (err: unknown) {
    show((err as Error).message ?? '操作失敗', 'error')
  } finally {
    isTogglingBookmark.value = false
  }
}

const displayTitle = () =>
  showTranslated.value && props.news.titleZh ? props.news.titleZh : props.news.title

const displaySummary = () =>
  showTranslated.value && props.news.summaryZh ? props.news.summaryZh : props.news.summary
</script>

<template>
  <article
    class="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
  >
    <!-- Header row: source + category + time + bookmark -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-xs font-semibold text-muted-foreground">{{ news.source }}</span>
        <span
          class="rounded-full px-2 py-0.5 text-[10px] font-medium"
          :class="categoryColors[news.category]"
        >
          {{ categoryLabels[news.category] }}
        </span>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <time class="text-xs text-muted-foreground">{{ formatDate(news.publishedAt) }}</time>
        <HeartButton
          :bookmarked="bookmarksStore.isBookmarked(news.id)"
          :loading="isTogglingBookmark"
          @toggle="handleBookmarkToggle"
        />
      </div>
    </div>

    <!-- Title -->
    <a
      :href="news.url"
      target="_blank"
      rel="noopener noreferrer"
      class="line-clamp-2 font-semibold leading-snug text-foreground transition-colors hover:text-primary"
    >
      {{ displayTitle() }}
    </a>

    <!-- Summary -->
    <p class="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
      {{ displaySummary() }}
    </p>

    <!-- Footer: translate button + read full article -->
    <div class="mt-auto flex items-center justify-between pt-1">
      <TranslateButton
        :news-id="news.id"
        :is-translating="isTranslating"
        :has-translation="!!news.titleZh"
        :show-translated="showTranslated"
        @translate="handleTranslate"
        @toggle="showTranslated = !showTranslated"
      />
      <button
        class="text-xs font-medium text-primary hover:underline"
        @click="emit('read', news)"
      >
        閱讀全文 →
      </button>
    </div>
  </article>
</template>
