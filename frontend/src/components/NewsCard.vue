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
  ufo: 'bg-[rgba(108,99,255,0.18)] text-[#a09aff] border border-[rgba(108,99,255,0.3)]',
  tech: 'bg-[rgba(55,138,221,0.18)] text-[#85b7eb] border border-[rgba(55,138,221,0.3)]',
  taiwan: 'bg-[rgba(29,158,117,0.18)] text-[#5dcaa5] border border-[rgba(29,158,117,0.3)]',
  finance: 'bg-[rgba(186,117,23,0.2)] text-[#ef9f27] border border-[rgba(186,117,23,0.35)]',
  world: 'bg-[rgba(216,90,48,0.18)] text-[#f0997b] border border-[rgba(216,90,48,0.3)]',
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
    class="flex h-full flex-col rounded-[12px] border border-white/8 bg-white/[0.04] p-[13px] transition-all duration-150 hover:border-white/15"
  >
    <!-- Header row: source + category + time + bookmark -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 flex-wrap items-center gap-1.5">
        <span class="max-w-[110px] truncate text-[10px] text-white/38">{{ news.source }}</span>
        <span
          class="rounded-[8px] px-[6px] py-[1px] text-[10px]"
          :class="categoryColors[news.category]"
        >
          {{ categoryLabels[news.category] }}
        </span>
      </div>
      <div class="flex shrink-0 items-center gap-1.5">
        <time class="text-[10px] text-white/22">{{ formatDate(news.publishedAt) }}</time>
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
      class="mb-[7px] line-clamp-2 text-[12px] font-medium leading-[1.5] text-white/88 transition-colors duration-150 hover:text-[#a09aff]"
    >
      {{ displayTitle() }}
    </a>

    <!-- Summary -->
    <p class="line-clamp-4 flex-1 text-[11px] leading-[1.55] text-white/38">
      {{ displaySummary() }}
    </p>

    <!-- Footer: translate button + read full article -->
    <div class="mt-[9px] flex items-center justify-between border-t border-white/7 pt-[9px]">
      <TranslateButton
        :news-id="news.id"
        :is-translating="isTranslating"
        :has-translation="!!news.titleZh"
        :show-translated="showTranslated"
        @translate="handleTranslate"
        @toggle="showTranslated = !showTranslated"
      />
      <button
        class="text-[11px] font-medium text-[#8b85ff] transition-colors duration-150 hover:text-[#a09aff]"
        @click="emit('read', news)"
      >
        閱讀全文 →
      </button>
    </div>
  </article>
</template>
