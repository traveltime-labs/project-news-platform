/**
 * Google Sheets 操作封裝
 * News 工作表欄位順序（row 1 為 header）：
 *   publishedAt | source | title | url | url_hash | summary | category | titleZh | summaryZh | isSent
 * Bookmarks 工作表欄位：
 *   newsId | savedAt
 * Settings 工作表欄位（每列為一個來源）：
 *   name | feed_url | category | enabled | fail_count | notify_enabled | notify_times
 */
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const SHEET_NAMES = {
  NEWS: 'News',
  BOOKMARKS: 'Bookmarks',
  SETTINGS: 'Settings',
} as const

async function getDoc(): Promise<GoogleSpreadsheet> {
  const missingEnv = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_SHEET_ID',
  ].filter((key) => !process.env[key])

  if (missingEnv.length > 0) {
    throw new Error(`缺少環境變數: ${missingEnv.join(', ')}`)
  }

  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth)
  await doc.loadInfo()
  return doc
}

export async function getSheet(name: keyof typeof SHEET_NAMES) {
  const doc = await getDoc()
  return doc.sheetsByTitle[SHEET_NAMES[name]]
}

// ── 型別對應 ──────────────────────────────────────────────────────────────────

export type NewsCategory = 'tech' | 'world' | 'finance' | 'ufo' | 'taiwan'

export interface NewsRow {
  id: string           // url_hash
  publishedAt: string
  source: string
  title: string
  url: string
  summary: string
  category: NewsCategory
  titleZh: string | null
  summaryZh: string | null
  isSent: boolean
  /** row index in sheet (1-based, including header), used for updates */
  _rowIndex: number
}

export interface BookmarkRow {
  newsId: string
  savedAt: string
}

export interface SourceRow {
  name: string
  enabled: boolean
  url: string
  category?: NewsCategory
}

export interface SettingsData {
  sources: SourceRow[]
  notifyEnabled: boolean
  notifyTimes: string[]
}

// ── News ──────────────────────────────────────────────────────────────────────

export async function getAllNews(): Promise<NewsRow[]> {
  const sheet = await getSheet('NEWS')
  const rows = await sheet.getRows()
  return rows.map((row, i) => ({
    id: row.get('url_hash') as string,
    publishedAt: row.get('publishedAt') as string,
    source: row.get('source') as string,
    title: row.get('title') as string,
    url: row.get('url') as string,
    summary: row.get('summary') as string,
    category: (row.get('category') as NewsCategory) ?? 'tech',
    titleZh: (row.get('titleZh') as string) || null,
    summaryZh: (row.get('summaryZh') as string) || null,
    isSent: String(row.get('isSent')).toUpperCase() === 'TRUE',
    _rowIndex: i + 2, // +2: row 1 = header, data starts at row 2
  }))
}

export async function updateNewsTranslation(
  newsId: string,
  titleZh: string,
  summaryZh: string,
): Promise<boolean> {
  const sheet = await getSheet('NEWS')
  const rows = await sheet.getRows()
  const target = rows.find((r) => r.get('url_hash') === newsId)
  if (!target) return false
  target.set('titleZh', titleZh)
  target.set('summaryZh', summaryZh)
  await target.save()
  return true
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export async function getAllBookmarks(): Promise<BookmarkRow[]> {
  const sheet = await getSheet('BOOKMARKS')
  const rows = await sheet.getRows()
  return rows.map((row) => ({
    newsId: row.get('newsId') as string,
    savedAt: row.get('savedAt') as string,
  }))
}

export async function addBookmark(newsId: string): Promise<string> {
  const sheet = await getSheet('BOOKMARKS')
  const savedAt = new Date().toISOString()
  await sheet.addRow({ newsId, savedAt })
  return savedAt
}

export async function removeBookmark(newsId: string): Promise<boolean> {
  const sheet = await getSheet('BOOKMARKS')
  const rows = await sheet.getRows()
  const target = rows.find((r) => r.get('newsId') === newsId)
  if (!target) return false
  await target.delete()
  return true
}

export async function bookmarkExists(newsId: string): Promise<boolean> {
  const sheet = await getSheet('BOOKMARKS')
  const rows = await sheet.getRows()
  return rows.some((r) => r.get('newsId') === newsId)
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<SettingsData> {
  const sheet = await getSheet('SETTINGS')
  const rows = await sheet.getRows()

  const sources = rows
    .filter((row) => row.get('name') && row.get('feed_url'))
    .map((row) => ({
      name: row.get('name') as string,
      enabled: String(row.get('enabled')).toUpperCase() === 'TRUE',
      url: row.get('feed_url') as string,  // feed_url → url（前端相容）
      category: ((row.get('category') as string) || 'tech') as NewsCategory,
    }))

  // 全域通知設定取自第一列
  const firstRow = rows[0]
  const notifyEnabled = firstRow
    ? String(firstRow.get('notify_enabled')).toUpperCase() === 'TRUE'
    : false
  const rawTimes = firstRow ? ((firstRow.get('notify_times') as string) ?? '') : ''
  const notifyTimes = rawTimes
    ? rawTimes.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  return { sources, notifyEnabled, notifyTimes }
}

export async function updateSettings(settings: SettingsData): Promise<void> {
  const sheet = await getSheet('SETTINGS')
  const rows = await sheet.getRows()

  // 先記住既有來源的 fail_count，讓來源更新時仍可延續心跳狀態
  const failCountByName = new Map<string, number>()
  for (const row of rows) {
    const name = (row.get('name') as string) || ''
    if (!name) continue
    const failCount = Number(row.get('fail_count') || 0)
    failCountByName.set(name, Number.isFinite(failCount) ? failCount : 0)
  }

  // 重新同步 Settings 工作表：支援新增 / 修改 / 刪除來源
  for (const row of rows) {
    await row.delete()
  }

  const notifyTimes = settings.notifyTimes.map((t) => t.trim()).filter(Boolean).join(',')

  const normalizedSources = settings.sources
    .map((s) => ({
      name: s.name.trim(),
      url: s.url.trim(),
      category: s.category ?? 'tech',
      enabled: !!s.enabled,
    }))
    .filter((s) => s.name && s.url)

  const rowsToInsert = normalizedSources.length > 0
    ? normalizedSources
    : [{ name: '', url: '', category: 'tech' as NewsCategory, enabled: false }]

  await sheet.addRows(
    rowsToInsert.map((source) => ({
      name: source.name,
      feed_url: source.url,
      category: source.category,
      enabled: source.enabled ? 'TRUE' : 'FALSE',
      fail_count: failCountByName.get(source.name) ?? 0,
      notify_enabled: settings.notifyEnabled ? 'TRUE' : 'FALSE',
      notify_times: notifyTimes,
    })),
  )
}

