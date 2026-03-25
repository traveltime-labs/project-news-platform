/**
 * DELETE /api/bookmarks/:newsId — 移除收藏
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { removeBookmark } from '../_lib/sheets'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') return res.status(405).end()

  const newsId = req.query.newsId as string
  if (!newsId) return res.status(400).json({ error: 'newsId 為必填' })

  try {
    const removed = await removeBookmark(newsId)
    if (!removed) {
      return res.status(404).json({ error: '找不到此收藏' })
    }
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/bookmarks/:newsId]', err)
    const detail = err instanceof Error ? err.message : String(err)
    return res.status(500).json({
      error: '伺服器錯誤',
      ...(process.env.NODE_ENV !== 'production' ? { detail } : {}),
    })
  }
}
