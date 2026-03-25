/**
 * 全文萃取 API 封裝
 * 透過 Vercel Serverless Function (/api/article) 即時 fetch 原文 HTML，
 * 以 Readability.js 萃取正文後回傳，不存入資料庫。
 */
import type { FetchArticleResponse } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function fetchArticle(url: string): Promise<FetchArticleResponse> {
  const res = await fetch(`${BASE}/article?url=${encodeURIComponent(url)}`)

  if (res.status === 408) {
    throw Object.assign(new Error('取得原文逾時'), { status: 408 })
  }
  if (!res.ok) {
    throw Object.assign(new Error(`fetchArticle failed: ${res.status}`), { status: res.status })
  }

  return res.json()
}
