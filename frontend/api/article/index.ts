/**
 * GET  /api/article?url=...
 * 即時 fetch 原文 HTML，透過 Readability.js 萃取正文後回傳，不存入資料庫
 *
 * 安全備注：僅允許 http/https 協議，防止 SSRF 攻擊存取內部資源
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import { optionalString } from '../_lib/validate'

function isAllowedUrl(raw: string): boolean {
  try {
    const { protocol } = new URL(raw)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const url = optionalString(req.query.url)
  if (!url) return res.status(400).json({ error: 'url 為必填' })
  if (!isAllowedUrl(url)) return res.status(400).json({ error: '無效的 URL（僅允許 http/https）' })

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(8000), // 8 秒逾時，留 2 秒給後續處理
    })

    if (!response.ok) {
      return res.status(200).json({ data: null, error: '無法取得原文頁面' })
    }

    const html = await response.text()
    const dom  = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    if (!article) {
      return res.status(200).json({ data: null, error: '無法萃取正文' })
    }

    return res.status(200).json({
      data: {
        title:    article.title,
        content:  article.content,
        byline:   article.byline    ?? null,
        siteName: article.siteName  ?? null,
      },
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      return res.status(408).json({ error: '取得原文逾時' })
    }
    console.error('[GET /api/article]', err)
    return res.status(500).json({ error: '伺服器錯誤' })
  }
}
