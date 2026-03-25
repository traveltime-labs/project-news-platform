# React/Vue Bits

## 相關連結
- [ReactBits](https://www.reactbits.dev/backgrounds/hyperspeed)
- [VueBits](https://vue-bits.dev/get-started/index)
- [Inspira UI](https://inspira-ui.com/docs/en/components/backgrounds/video-text)


## Vue Bits
使用官方推薦的 CLI 工具 (jsrepo)
這是最現代化的做法，它會像 npx shadcn-ui add 一樣，幫你把組件下載到指定的資料夾。

### 安裝 jsrepo 工具

安裝 jsrepo 工具
```
npm install jsrepo -g
```

專案中初始化
```
npx jsrepo init https://vue-bits.dev/ui
```

安裝特定組件（以 SplitText 文字動畫為例）
```
npx jsrepo add https://vue-bits.dev/ui/TextAnimations/SplitText
```


依賴底層動畫庫
*** 必裝：動畫引擎與樣式工具 ***
```
npm install motion/vue lucide-vue-next clsx tailwind-merge
```
- motion/vue：這是 Vue 版的 Framer Motion，幾乎所有 Vue Bits 的動畫都靠它。
- lucide-vue-next：大多數組件使用的圖標庫。
- clsx & tailwind-merge：這是為了處理 Tailwind 類名的合併（跟 shadcn-vue 共用）。

## React

