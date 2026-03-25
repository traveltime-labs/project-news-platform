/**
 * GET  /api/bookmarks  — 取得所有收藏
 * POST /api/bookmarks  — 新增收藏  body: { newsId: string }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAllBookmarks, addBookmark, bookmarkExists } from '../_lib/sheets'
import { requireString } from '../_lib/validate'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const rows = await getAllBookmarks()
      return res.status(200).json({ data: rows })
    } catch (err) {
      console.error('[GET /api/bookmarks]', err)
      const detail = err instanceof Error ? err.message : String(err)
      return res.status(500).json({
        error: '伺服器錯誤',
        ...(process.env.NODE_ENV !== 'production' ? { detail } : {}),
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const newsId = requireString(req.body?.newsId, 'newsId')

      const exists = await bookmarkExists(newsId)
      if (exists) {
        return res.status(409).json({ error: '已收藏過此新聞' })
      }

      const savedAt = await addBookmark(newsId)
      return res.status(200).json({ success: true, savedAt })
    } catch (err) {
      if (err instanceof Error && err.message.includes('必填')) {
        return res.status(400).json({ error: err.message })
      }
      console.error('[POST /api/bookmarks]', err)
      const detail = err instanceof Error ? err.message : String(err)
      return res.status(500).json({
        error: '伺服器錯誤',
        ...(process.env.NODE_ENV !== 'production' ? { detail } : {}),
      })
    }
  }

  return res.status(405).end()
}
