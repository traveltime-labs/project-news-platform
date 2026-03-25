// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────
export interface LoginInput {
  username: string
  password: string
}
export interface TokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response wrapper
// ─────────────────────────────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true
  data: T
}
export interface ApiError {
  success: false
  error: { code: string; message: string }
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─────────────────────────────────────────────────────────────────────────────
// News Platform
// ─────────────────────────────────────────────────────────────────────────────
export type NewsCategory = 'tech' | 'world' | 'finance' | 'ufo' | 'taiwan'

export interface NewsItem {
  id: string            // url_hash，作為唯一識別
  publishedAt: string   // ISO 8601
  source: string        // 來源名稱，e.g. "TechCrunch"
  title: string         // 原文標題
  url: string           // 原文連結
  summary: string       // 原文摘要
  category: NewsCategory
  titleZh: string | null   // 翻譯後標題，null 表示尚未翻譯
  summaryZh: string | null // 翻譯後摘要，null 表示尚未翻譯
  isSent: boolean          // 是否已透過 Telegram 推送
}

export interface BookmarkItem {
  newsId: string        // 對應 NewsItem.id
  savedAt: string       // ISO 8601
}

export interface SourceSetting {
  name: string          // 來源名稱
  enabled: boolean      // 是否啟用爬蟲
  url: string           // 來源網址
  category?: NewsCategory
}

export interface NewsSettings {
  sources: SourceSetting[]
  notifyEnabled: boolean
  notifyTimes: string[] // e.g. ["08:00", "20:00"]
}

// 閱讀全文
export interface ArticleContent {
  title: string
  content: string          // 萃取後的正文 HTML
  byline: string | null
  siteName: string | null
}

export interface FetchArticleResponse {
  data: ArticleContent | null  // null 表示萃取失敗（付費牆等）
  error?: string
}

// API params / responses
export interface FetchNewsParams {
  category?: NewsCategory
  q?: string               // 搜尋關鍵字
  limit?: number
  offset?: number
}

export interface FetchNewsResponse {
  data: NewsItem[]
  total: number
}

export interface FetchBookmarksResponse {
  data: BookmarkItem[]
}

export interface AddBookmarkResponse {
  success: boolean
  savedAt: string
}

export interface RemoveBookmarkResponse {
  success: boolean
}

export interface FetchSettingsResponse {
  data: NewsSettings
}

export interface UpdateSettingsResponse {
  success: boolean
}

export interface TranslateResponse {
  newsId: string
  titleZh: string
  summaryZh: string
}
