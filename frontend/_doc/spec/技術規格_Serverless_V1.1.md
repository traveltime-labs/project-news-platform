# Vercel Serverless Function 技術規格
## Tech Spec V1.1（新增閱讀全文功能）

---

## 1. 專案結構

```
api/
├── news/
│   └── index.ts          # GET  /api/news
├── bookmarks/
│   ├── index.ts          # GET / POST /api/bookmarks
│   └── [newsId].ts       # DELETE /api/bookmarks/:newsId
├── settings/
│   └── index.ts          # GET / PUT /api/settings
├── translate/
│   └── index.ts          # POST /api/translate
├── article/
│   └── index.ts          # GET /api/article（新增）
└── _lib/
    ├── sheets.ts          # Google Sheets 操作封裝
    ├── openai.ts          # OpenAI 呼叫封裝
    └── validate.ts        # 請求參數驗證工具
```

---

## 2. 環境變數

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...
GOOGLE_SHEET_ID=your_sheet_id
OPENAI_API_KEY=sk-...
```

---

## 3. 共用函式庫（_lib/）

### 3-1. sheets.ts（同 V1.0）

```typescript
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const SHEET_NAMES = {
  NEWS: 'News',
  BOOKMARKS: 'Bookmarks',
  SETTINGS: 'Settings',
} as const

async function getDoc() {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
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
```

### 3-2. openai.ts（同 V1.0）

```typescript
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function translateNewsItem(title: string, summary: string) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1000,
    messages: [
      {
        role: 'system',
        content: `你是一位專業翻譯，請將以下英文新聞內容翻譯為台灣繁體中文。
規則：
- 財經專有名詞使用台灣慣用語（e.g. Federal Reserve → 聯準會）
- 科技產品名稱保留英文原名
- 回傳純 JSON，不加任何說明文字`,
      },
      {
        role: 'user',
        content: JSON.stringify({ title, summary }),
      },
    ],
  })

  const raw = response.choices[0].message.content ?? ''
  const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
  return {
    titleZh: parsed.title as string,
    summaryZh: parsed.summary as string,
  }
}
```

### 3-3. validate.ts（同 V1.0）

```typescript
export function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} 為必填字串`)
  }
  return value.trim()
}

export function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined
}

export function optionalInt(value: unknown, defaultVal: number): number {
  const n = parseInt(value as string, 10)
  return isNaN(n) ? defaultVal : n
}
```

---

## 4. Endpoint 規格

### 4-1. GET /api/article（新增）

**功能：** fetch 原文 HTML，透過 Readability.js 萃取正文後回傳，不存入資料庫。

**Query 參數：**

| 參數 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `url` | string | ✅ | 原文網址（需 encodeURIComponent） |

**實作：**

```typescript
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const url = optionalString(req.query.url)
  if (!url) return res.status(400).json({ error: 'url 為必填' })

  try {
    // fetch 原文 HTML
    const response = await fetch(url, {
      headers: {
        // 模擬瀏覽器，減少被擋的機率
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(8000),  // 8 秒逾時，留 2 秒給後續處理
    })

    if (!response.ok) {
      return res.status(200).json({ data: null, error: '無法取得原文頁面' })
    }

    const html = await response.text()

    // 用 JSDOM 解析 HTML，再交給 Readability.js 萃取
    const dom = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    if (!article) {
      // 萃取失敗（付費牆、動態頁面等）
      return res.status(200).json({ data: null, error: '無法萃取正文' })
    }

    return res.status(200).json({
      data: {
        title:    article.title,
        content:  article.content,   // 已清理的正文 HTML
        byline:   article.byline ?? null,
        siteName: article.siteName ?? null,
      }
    })

  } catch (err: any) {
    if (err.name === 'TimeoutError') {
      return res.status(408).json({ error: '取得原文逾時' })
    }
    return res.status(500).json({ error: '伺服器錯誤' })
  }
}
```

**回應範例（成功）：**

```json
{
  "data": {
    "title": "OpenAI releases new model",
    "content": "<div><p>OpenAI announced...</p></div>",
    "byline": "John Doe",
    "siteName": "TechCrunch"
  }
}
```

**回應範例（萃取失敗）：**

```json
{
  "data": null,
  "error": "無法萃取正文"
}
```

---

### 4-2. GET /api/news（同 V1.0）

支援 `q`、`category`、`limit`、`offset` 參數，搜尋邏輯比對 `title`、`summary`、`titleZh`、`summaryZh` 四個欄位。

---

### 4-3. GET /api/bookmarks（同 V1.0）

### 4-4. POST /api/bookmarks（同 V1.0）

### 4-5. DELETE /api/bookmarks/[newsId]（同 V1.0）

### 4-6. GET /api/settings（同 V1.0）

### 4-7. PUT /api/settings（同 V1.0）

### 4-8. POST /api/translate（同 V1.0）

已有翻譯的新聞直接回傳快取，不重複呼叫 OpenAI。

---

## 5. 錯誤處理總覽

| HTTP 狀態碼 | 情境 |
|------------|------|
| 200 + data: null | 全文萃取失敗（付費牆、動態頁面） |
| 400 | 參數驗證失敗 |
| 404 | 找不到資源 |
| 405 | 不支援的 HTTP Method |
| 408 | fetch 原文逾時 |
| 409 | 資源衝突（重複收藏） |
| 500 | 伺服器或第三方 API 錯誤 |

---

## 6. 相依套件

```json
{
  "dependencies": {
    "google-spreadsheet": "^4.x",
    "google-auth-library": "^9.x",
    "openai": "^4.x",
    "@mozilla/readability": "^0.5.x",
    "jsdom": "^24.x"
  }
}
```

> `jsdom` 是 Readability.js 在 Node.js 環境中解析 HTML 的必要依賴，瀏覽器環境下不需要。
