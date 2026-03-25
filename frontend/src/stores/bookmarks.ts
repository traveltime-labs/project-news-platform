import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchBookmarks, addBookmark, removeBookmark } from '@/api/sheets'

export const useBookmarksStore = defineStore('bookmarks', () => {
  // Set 快速判斷是否已收藏
  const bookmarkedIds = ref<Set<string>>(new Set())
  const isLoading = ref(false)

  async function loadBookmarks() {
    isLoading.value = true
    try {
      const res = await fetchBookmarks()
      bookmarkedIds.value = new Set(res.data.map((b) => b.newsId))
    } catch (err) {
      // 書籤為非核心功能，載入失敗不中斷頁面
      console.warn('[bookmarks] loadBookmarks failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function toggle(newsId: string): Promise<void> {
    if (bookmarkedIds.value.has(newsId)) {
      bookmarkedIds.value.delete(newsId)
      try {
        await removeBookmark(newsId)
      } catch {
        // 回滾
        bookmarkedIds.value.add(newsId)
        throw new Error('取消收藏失敗，請稍後再試')
      }
    } else {
      bookmarkedIds.value.add(newsId)
      try {
        await addBookmark(newsId)
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status
        if (status === 409) return // 已收藏過，靜默忽略
        // 回滾
        bookmarkedIds.value.delete(newsId)
        throw new Error('收藏失敗，請稍後再試')
      }
    }
  }

  function isBookmarked(newsId: string) {
    return bookmarkedIds.value.has(newsId)
  }

  return { bookmarkedIds, isLoading, loadBookmarks, toggle, isBookmarked }
})
