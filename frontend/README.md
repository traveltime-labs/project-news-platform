# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Reminder Cron（Telegram 通知）

完整設定文件：`_doc/Telegram-Vercel-Cron-設定指南.md`

此專案已加入每日提醒排程：

- Vercel Cron 路徑：`/api/cron/reminders`
- 排程時間：`0 1 * * *`（UTC，等於台灣時間每天早上 09:00）

### 必要環境變數

- `GAS_API_URL`：GAS Web App URL
- `REMINDER_EMAIL`：供 Cron 讀取 reminders 資料的 email（需符合 GAS 白名單）
- `TELEGRAM_BOT_TOKEN`：Telegram Bot Token
- `TELEGRAM_CHAT_ID`：單一 chat id（或改用 `TELEGRAM_CHAT_IDS` 逗號分隔多個）
- `CRON_SECRET`：建議設定，用於驗證 Vercel Cron 請求

### 手動觸發

- 前端提醒頁「發送批量提醒」按鈕會呼叫 `POST /api/reminders/dispatch`
- 可用於手動測試 Telegram 發送流程
