/**
 * GET /api/settings  — 取得控制面板設定
 * PUT /api/settings  — 更新控制面板設定  body: SettingsData
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSettings, updateSettings, type SettingsData } from '../_lib/sheets'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const data = await getSettings()
      return res.status(200).json({ data })
    } catch (err) {
      console.error('[GET /api/settings]', err)
      return res.status(500).json({ error: '伺服器錯誤' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = req.body as Partial<SettingsData>
      if (
        !Array.isArray(body?.sources) ||
        typeof body?.notifyEnabled !== 'boolean' ||
        !Array.isArray(body?.notifyTimes)
      ) {
        return res.status(400).json({ error: '請求格式錯誤' })
      }
      await updateSettings(body as SettingsData)
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('[PUT /api/settings]', err)
      return res.status(500).json({ error: '伺服器錯誤' })
    }
  }

  return res.status(405).end()
}
