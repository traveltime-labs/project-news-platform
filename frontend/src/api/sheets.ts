/**
 * Google Sheets API 封裝
 * 透過 Vercel Serverless Function 中轉，前端不直接存取 Google API
 */
import type {
  FetchNewsParams,
  FetchNewsResponse,
  FetchBookmarksResponse,
  AddBookmarkResponse,
  RemoveBookmarkResponse,
  FetchSettingsResponse,
  UpdateSettingsResponse,
  NewsSettings,
} from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

// ── News ──────────────────────────────────────────────────────────────────────
export async function fetchNews(params: FetchNewsParams = {}): Promise<FetchNewsResponse> {
  const query = new URLSearchParams()
  if (params.category) query.set('category', params.category)
  if (params.q) query.set('q', params.q)
  if (params.limit !== undefined) query.set('limit', String(params.limit))
  if (params.offset !== undefined) query.set('offset', String(params.offset))

  const res = await fetch(`${BASE}/news?${query}`)
  if (!res.ok) throw new Error(`fetchNews failed: ${res.status}`)
  return res.json()
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export async function fetchBookmarks(): Promise<FetchBookmarksResponse> {
  const res = await fetch(`${BASE}/bookmarks`)
  if (!res.ok) throw new Error(`fetchBookmarks failed: ${res.status}`)
  return res.json()
}

export async function addBookmark(newsId: string): Promise<AddBookmarkResponse> {
  const res = await fetch(`${BASE}/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newsId }),
  })
  if (!res.ok) throw new Error(`addBookmark failed: ${res.status}`)
  return res.json()
}

export async function removeBookmark(newsId: string): Promise<RemoveBookmarkResponse> {
  const res = await fetch(`${BASE}/bookmarks/${newsId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`removeBookmark failed: ${res.status}`)
  return res.json()
}

// ── Settings ──────────────────────────────────────────────────────────────────
export async function fetchSettings(): Promise<FetchSettingsResponse> {
  const res = await fetch(`${BASE}/settings`)
  if (!res.ok) throw new Error(`fetchSettings failed: ${res.status}`)
  return res.json()
}

export async function updateSettings(settings: NewsSettings): Promise<UpdateSettingsResponse> {
  const res = await fetch(`${BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
  if (!res.ok) throw new Error(`updateSettings failed: ${res.status}`)
  return res.json()
}
