/**
 * POST /api/translate  body: { newsId: string }
 * 按需翻譯；已有翻譯直接回傳快取，不重複呼叫 OpenAI
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAllNews } from '../_lib/sheets'
// import { translateNewsItem } from '../_lib/openai'
import { requireString } from '../_lib/validate'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  let newsId: string
  try {
    newsId = requireString(req.body?.newsId, 'newsId')
  } catch (err) {
    return res.status(400).json({ error: (err as Error).message })
  }

  try {
    const allNews = await getAllNews()
    const target  = allNews.find((n) => n.id === newsId)

    if (!target) {
      return res.status(404).json({ error: '找不到此新聞' })
    }

    // 快取：已有翻譯則直接回傳
    if (target.titleZh && target.summaryZh) {
      return res.status(200).json({
        newsId,
        titleZh:   target.titleZh,
        summaryZh: target.summaryZh,
      })
    }

    // OpenAI 翻譯暫時停用：不再呼叫外部 API
    return res.status(503).json({
      error: '翻譯功能目前暫停',
      detail: 'OpenAI 相關功能已先註解停用',
    })
  } catch (err) {
    console.error('[POST /api/translate]', err)
    return res.status(500).json({ error: '翻譯失敗，請稍後再試' })
  }
}
