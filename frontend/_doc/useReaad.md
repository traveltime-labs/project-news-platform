# 操作說明

## 目錄

- [前置準備](#前置準備)
- [後端啟動（Vercel Serverless Functions）](#後端啟動vercel-serverless-functions)
- [前端啟動](#前端啟動)
- [爬蟲（手動執行）](#爬蟲手動執行)
- [正式部署](#正式部署)
- [Google Sheets 結構](#google-sheets-結構)

---

## 前置準備

### 需要的帳號 / 服務

| 服務 | 用途 |
|------|------|
| Google Cloud — Service Account | 讀寫 Google Sheets |
| Google Sheets | 資料庫（News / Bookmarks / Settings） |
| OpenAI API | 新聞翻譯（GPT-4o-mini） |
| Vercel | 前端 + Serverless Functions 部署 |
| Telegram Bot（可選） | 新聞快報推送 |

### 取得 Google Service Account 金鑰

1. 前往 [Google Cloud Console](https://console.cloud.google.com/) → IAM → 服務帳戶 → 建立服務帳戶
2. 建立 JSON 金鑰，下載後取出 `client_email` 與 `private_key`
3. 前往 Google Sheets → 將試算表共用給該服務帳戶 email（編輯者權限）

---

## 後端啟動（Vercel Serverless Functions）

後端為 `frontend/api/` 下的 Serverless Functions，本地與正式環境都透過 **Vercel CLI** 執行。

### 第一次設定

```bash
# 1. 安裝 Vercel CLI（全域，只需一次）
npm i -g vercel

# 2. 進入前端目錄
cd frontend

# 3. 綁定 Vercel 專案（只需一次，依提示登入並選擇專案）
vercel link
```

### 建立本地環境變數

在 `frontend/` 建立 `.env.local`（此檔案不會被 git 追蹤）：

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GOOGLE_SHEET_ID=your_google_sheet_id
OPENAI_API_KEY=sk-...
```

> 參考 `.env.example` 的欄位說明。

### 啟動本地後端

```bash
cd frontend
vercel dev
```

`vercel dev` 會同時啟動：
- 前端 Vite（`http://localhost:3000`）
- `api/` 下所有 Serverless Functions（掛載在 `/api/*`）

> ⚠️ 不要用 `npm run dev`，那樣只會跑前端，`/api/*` 會回 404。

---

## 前端啟動

本地開發使用 `vercel dev`（同上），前端與後端會一起啟動，無需分開執行。

若只想啟動純前端（不需要 API）：

```bash
cd frontend
npm run dev
```

---

## 爬蟲（手動執行）

爬蟲沒有長駐 Server，是腳本式執行。正式環境由 GitHub Actions 每日自動觸發，本地可手動測試。

### 第一次設定

```bash
cd crawler

# 建立 Python 虛擬環境
python -m venv .venv

# 啟動虛擬環境
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# 安裝套件
pip install -r requirements.txt
```

### 設定環境變數（Windows PowerShell）

```powershell
$env:GOOGLE_SERVICE_ACCOUNT_EMAIL = "your-sa@project.iam.gserviceaccount.com"
$env:GOOGLE_PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----`n...`n-----END RSA PRIVATE KEY-----"
$env:GOOGLE_SHEET_ID = "your_sheet_id"
$env:TELEGRAM_BOT_TOKEN = "your_bot_token"   # 可選
$env:TELEGRAM_CHAT_ID = "your_chat_id"       # 可選
```

### 執行爬蟲

```bash
# 抓取新聞並寫入 Google Sheets
python main.py

# 發送 Telegram 快報（需設定 Telegram 環境變數）
python notify.py
```

> 爬蟲來源清單由 Google Sheets 的 **Settings** 工作表管理（`enabled = TRUE` 的列才會抓取），不需修改程式碼就能新增 / 停用來源。

---

## 正式部署

### Vercel（前端 + 後端 API）

1. 將 `frontend/` 推送到 GitHub
2. 在 Vercel Dashboard 建立新專案，選擇該 repo
3. 在 Vercel → Settings → Environment Variables 新增：
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`
   - `OPENAI_API_KEY`
4. 部署後，Serverless Functions 與前端同域，`/api/*` 自動對應

### GitHub Actions（爬蟲自動排程）

在 GitHub repo → Settings → Secrets and variables → Actions 新增：

| Secret | 說明 |
|--------|------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service Account email |
| `GOOGLE_PRIVATE_KEY` | Private key（含 `\n` 換行） |
| `GOOGLE_SHEET_ID` | Google Sheets ID |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token |
| `TELEGRAM_CHAT_ID` | 接收通知的 Chat ID |

排程工作流程：
- `crawler.yml` — 每天 UTC 00:00 / 12:00（台灣 08:00 / 20:00）抓取新聞
- `notify.yml` — 每天 UTC 00:30 / 12:30（爬蟲結束後 30 分鐘）發送 Telegram 快報

---

## Google Sheets 結構

試算表需包含以下三個工作表（名稱需完全一致）：

### `News`

| 欄位 | 說明 |
|------|------|
| `publishedAt` | 發布時間（ISO 8601） |
| `source` | 來源名稱 |
| `title` | 原文標題 |
| `url` | 原文連結 |
| `url_hash` | URL MD5（去重用） |
| `summary` | 原文摘要 |
| `category` | 分類（tech / world / finance / ufo / taiwan） |
| `titleZh` | 翻譯標題（空白表示尚未翻譯） |
| `summaryZh` | 翻譯摘要 |
| `isSent` | 是否已推送 Telegram（TRUE / FALSE） |

### `Bookmarks`

| 欄位 | 說明 |
|------|------|
| `newsId` | 對應 News 的 `url_hash` |
| `savedAt` | 收藏時間（ISO 8601） |

### `Settings`

每列代表一個來源，同時儲存全域通知設定：

| 欄位 | 說明 | 範例 |
|------|------|------|
| `name` | 來源顯示名稱 | 國際科技 |
| `feed_url` | RSS 網址 | `https://news.google.com/rss/...` |
| `category` | 分類 | `tech` |
| `enabled` | 是否啟用 | `TRUE` / `FALSE` |
| `fail_count` | 連續失敗次數（心跳用，勿手動修改） | `0` |
| `notify_enabled` | 是否啟用 Telegram 推送 | `TRUE` |
| `notify_times` | 推送時間（逗號分隔） | `08:00,20:00` |


---

## local 啟動方式

1. 開前端（Vue 3）
bashcd news-radar/frontend
npm install
npm run dev
瀏覽器開 http://localhost:5173 就可以看到畫面。

2. 開 Vercel Serverless Function（API）
Vercel 有提供本地開發工具：
bashnpm install -g vercel
cd news-radar
vercel dev
這樣 /api/news、/api/translate 等 endpoint 就會在本地跑起來，前端的請求會打到本地的 Serverless Function，不是線上環境。
環境變數要建一個 .env.local：
envGOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...
GOOGLE_SHEET_ID=your_sheet_id
OPENAI_API_KEY=sk-...

3. 模擬爬蟲
不需要 GitHub Actions，直接在本地手動跑：
bashcd news-radar/crawler

# 確認在 venv 裡
source venv/bin/activate

# 第一次先初始化 Sheets
python setup_sheets.py

# 然後直接跑爬蟲
python main.py
設定環境變數的方式有兩種：
方式一：建 .env 檔 + 用 python-dotenv 讀取
```
bashpip install python-dotenv
```
在 crawler/ 建 .env：
```
envGOOGLE_SERVICE_ACCOUNT_EMAIL=xxx
GOOGLE_PRIVATE_KEY=xxx
GOOGLE_SHEET_ID=xxx
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
```
在 main.py 最上面加一行：
```
pythonfrom dotenv import load_dotenv
load_dotenv()
```
方式二：直接在終端機設定（臨時用）
```
bashexport GOOGLE_SHEET_ID=your_sheet_id
export GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx
python main.py
```

---

## 整體本地開發流程
```
terminal 1：cd crawler && python main.py   ← 手動觸發爬蟲
terminal 2：vercel dev                      ← API server
terminal 3：cd frontend && npm run dev      ← 前端
三個 terminal 同時跑，就跟正式環境幾乎一樣了。
建議先從爬蟲開始測，確認資料寫進 Sheets 後，再啟動前端看畫面。要繼續設定 Google Cloud Service Account 嗎？