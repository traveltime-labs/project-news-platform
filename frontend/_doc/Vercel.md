# Local 開發
Vercel 有提供 CLI 工具，一個指令就能同時跑前端和後端：
bash# 安裝 Vercel CLI
npm i -g vercel

# 本地開發，取代 npm run dev
vercel dev
vercel dev 會同時啟動：

前端 http://localhost:3000（Vue）
後端 http://localhost:3000/api/auth（Functions）

同一個 port，同一個網域，前端直接打 /api/auth 就好，完全不需要 proxy 設定。

前端呼叫方式
```ts
// 開發和正式環境完全一樣，不用判斷 DEV
const response = await fetch('/api/auth', {
  method: 'POST',
  body: JSON.stringify({ credential })
})
```








