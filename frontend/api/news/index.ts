/**
 * GET /api/news
 * 支援參數：q (搜尋關鍵字), category, limit, offset
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAllNews, type NewsCategory } from '../_lib/sheets'
import { optionalString, optionalInt } from '../_lib/validate'

const VALID_CATEGORIES = new Set<string>(['tech', 'world', 'finance', 'ufo', 'taiwan'])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const q        = optionalString(req.query.q)
  const catRaw   = optionalString(req.query.category)
  const limit    = optionalInt(req.query.limit, 20)
  const offset   = optionalInt(req.query.offset, 0)

  const category = catRaw && VALID_CATEGORIES.has(catRaw)
    ? (catRaw as NewsCategory)
    : undefined

  try {
    let items = await getAllNews()

    // 類別篩選
    if (category) {
      items = items.filter((n) => n.category === category)
    }

    // 全文搜尋：比對 title / summary / titleZh / summaryZh
    if (q) {
      const lower = q.toLowerCase()
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(lower) ||
          n.summary.toLowerCase().includes(lower) ||
          (n.titleZh?.toLowerCase().includes(lower) ?? false) ||
          (n.summaryZh?.toLowerCase().includes(lower) ?? false),
      )
    }

    // 依時間倒序
    items.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )

    const total = items.length
    const data  = items.slice(offset, offset + limit).map(({ _rowIndex: _, ...n }) => n)

    return res.status(200).json({ data, total })
  } catch (err) {
    console.error('[GET /api/news]', err)
    return res.status(500).json({ error: '伺服器錯誤' })
  }
}
