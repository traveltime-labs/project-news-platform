/**
 * 本地開發用 Express API 伺服器
 * 模擬 Vercel Serverless Functions，掛載在 port 5158（Vite proxy 目標）
 * 啟動方式：npm run api
 */
import 'dotenv/config'
import express from 'express'
import type { Request, Response } from 'express'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// API handlers
import newsHandler from './api/news/index.js'
import bookmarksHandler from './api/bookmarks/index.js'
import settingsHandler from './api/settings/index.js'
import translateHandler from './api/translate/index.js'
import articleHandler from './api/article/index.js'

// bookmarks/[newsId].ts 含方括號無法直接靜態 import，改用動態 import
const { default: bookmarkDeleteHandler } = await import('./api/bookmarks/[newsId].js')

const app = express()
app.use(express.json())

// 將 Express req/res 轉換成類似 VercelRequest/VercelResponse 的介面
// 同時把 route params 合併進 query，讓 Vercel handler 能以 req.query.xxx 取 path 參數
function adapt(handler: (req: VercelRequest, res: VercelResponse) => unknown) {
  return async (req: Request, res: Response) => {
    const patchedReq = Object.assign(req, {
      query: { ...req.query, ...req.params },
    })
    await handler(patchedReq as unknown as VercelRequest, res as unknown as VercelResponse)
  }
}

app.all('/api/news', adapt(newsHandler))
app.all('/api/bookmarks', adapt(bookmarksHandler))
app.delete('/api/bookmarks/:newsId', adapt(bookmarkDeleteHandler))
app.all('/api/settings', adapt(settingsHandler))
app.all('/api/translate', adapt(translateHandler))
app.all('/api/article', adapt(articleHandler))

const PORT = 5158
app.listen(PORT, () => {
  console.log(`[api-server] Local API running at http://localhost:${PORT}`)
  console.log(`[api-server] Routes: /api/news, /api/bookmarks, /api/settings, /api/translate, /api/article`)
})
