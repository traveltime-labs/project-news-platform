import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchNews } from '@/api/sheets'
import { translateNews } from '@/api/translate'
import type { NewsItem, NewsCategory } from '@/types'

const LIMIT = 20

export const useNewsStore = defineStore('news', () => {
  const items = ref<NewsItem[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const hasError = ref(false)
  const activeCategory = ref<NewsCategory | null>(null)
  const searchQuery = ref('')
  const offset = ref(0)

  const hasMore = () => offset.value < total.value

  async function loadNews(reset = false) {
    if (reset) {
      offset.value = 0
      items.value = []
    }
    isLoading.value = true
    hasError.value = false
    try {
      const res = await fetchNews({
        category: activeCategory.value ?? undefined,
        q: searchQuery.value || undefined,
        limit: LIMIT,
        offset: offset.value,
      })
      items.value = reset ? res.data : [...items.value, ...res.data]
      total.value = res.total
      offset.value += LIMIT
    } catch {
      hasError.value = true
    } finally {
      isLoading.value = false
    }
  }

  function setCategory(category: NewsCategory | null) {
    activeCategory.value = category
    loadNews(true)
  }

  function setSearchQuery(q: string) {
    searchQuery.value = q
    loadNews(true)
  }

  // 翻譯成功後直接更新 store，不需重新 fetch
  function applyTranslation(newsId: string, titleZh: string, summaryZh: string) {
    const item = items.value.find((n) => n.id === newsId)
    if (item) {
      item.titleZh = titleZh
      item.summaryZh = summaryZh
    }
  }

  async function translate(newsId: string) {
    const res = await translateNews(newsId)
    applyTranslation(res.newsId, res.titleZh, res.summaryZh)
    return res
  }

  return {
    items,
    total,
    isLoading,
    hasError,
    activeCategory,
    searchQuery,
    hasMore,
    loadNews,
    setCategory,
    setSearchQuery,
    applyTranslation,
    translate,
  }
})
