import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'

// https://vite.dev/config/
// 注意：本地開發請使用 `vercel dev` 而非 `npm run dev`
// vercel dev 會同時啟動前端與 api/ 下的 Serverless Functions，
// 讓前端直接呼叫 /api/... 而不需要 proxy 設定。
export default defineConfig({
  plugins: [
    tailwindcss(),
    VueRouter(),
    Vue(),
    AutoImport({
      resolvers: [IconsResolver()],
    }),
    Icons({
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
