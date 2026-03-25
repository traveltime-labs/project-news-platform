/**
 * 翻譯 API 封裝
 * 透過 Vercel Serverless Function 呼叫 OpenAI GPT-4o-mini
 */
import type { TranslateResponse } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function translateNews(newsId: string): Promise<TranslateResponse> {
  const res = await fetch(`${BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newsId }),
  })

  if (!res.ok) throw new Error(`translateNews failed: ${res.status}`)
  return res.json()
}
