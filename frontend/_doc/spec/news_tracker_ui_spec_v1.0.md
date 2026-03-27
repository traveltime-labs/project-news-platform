# News Tracker UI 改版規格文件

## 概覽

維持現有暗色系，全面精緻化。品牌主色為紫色 `#6C63FF`，統一三個頁面的視覺語言。

---

## 色彩系統

| 用途 | 色值 |
|------|------|
| 主背景 | `#0f0f1a` |
| 側欄背景 | `#14142a` |
| 卡片背景 | `rgba(255, 255, 255, 0.04)` |
| 卡片邊框 | `1px solid rgba(255, 255, 255, 0.08)` |
| 品牌主色 | `#6C63FF` |
| 品牌色（hover/accent 文字） | `#a09aff` |
| 品牌色 active 背景 | `rgba(108, 99, 255, 0.18)` |
| 主要文字 | `rgba(255, 255, 255, 0.9)` |
| 次要文字 | `rgba(255, 255, 255, 0.4)` |
| 提示文字 | `rgba(255, 255, 255, 0.22)` |
| 分隔線 | `rgba(255, 255, 255, 0.07)` |

### 分類標籤配色

| 分類 | 背景 | 文字 | 邊框 |
|------|------|------|------|
| 外星人 / UAP | `rgba(108, 99, 255, 0.18)` | `#a09aff` | `rgba(108, 99, 255, 0.3)` |
| 科技 | `rgba(55, 138, 221, 0.18)` | `#85b7eb` | `rgba(55, 138, 221, 0.3)` |
| 台灣 | `rgba(29, 158, 117, 0.18)` | `#5dcaa5` | `rgba(29, 158, 117, 0.3)` |
| 財經 | `rgba(186, 117, 23, 0.2)` | `#ef9f27` | `rgba(186, 117, 23, 0.35)` |
| 世界局勢 | `rgba(216, 90, 48, 0.18)` | `#f0997b` | `rgba(216, 90, 48, 0.3)` |
| 健康 | `rgba(255, 255, 255, 0.06)` | `rgba(255, 255, 255, 0.28)` | 無 |

---

## 一、左側導覽列

### 結構
```
[ Logo 區域 ]
[ 導覽選單 ]
```

### Logo 區域
- 背景：`#14142a`
- 下邊框：`0.5px solid rgba(255, 255, 255, 0.08)`
- padding：`14px 16px`
- 內容：品牌 icon（`#6C63FF` 底色，22×22px，border-radius `6px`）+ "News Tracker" 文字

### 導覽選單項目
- padding：`9px 12px`
- border-radius：`8px`
- 字體大小：`13px`

**Active 狀態（方案 A — 純背景色塊，無線條）**
- background：`rgba(108, 99, 255, 0.18)`
- 文字色：`#c5c0ff`
- font-weight：`500`
- 無任何左側線條或 border

**非 Active 狀態**
- background：透明
- 文字色：`rgba(255, 255, 255, 0.35)`

**Hover 狀態**
- background：`rgba(255, 255, 255, 0.05)`

### Sidebar Toggle 按鈕
- 位置：主內容區頂部 topbar 最左側（非 sidebar 內部）
- 大小：`28×28px`
- border-radius：`6px`
- 邊框：`1px solid rgba(255, 255, 255, 0.12)`
- Icon：Panel layout icon（SVG）
  ```svg
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="1.5" width="13" height="13" rx="2"
      stroke="rgba(255,255,255,0.55)" stroke-width="1.3"/>
    <line x1="5.5" y1="1.5" x2="5.5" y2="14.5"
      stroke="rgba(255,255,255,0.55)" stroke-width="1.3"/>
  </svg>
  ```
- 收合後按鈕仍保留在同一位置，點擊可重新展開 sidebar

---

## 二、新聞牆頁面

### 頁面頂部 Topbar
- padding：`12px 20px`
- 下邊框：`0.5px solid rgba(255, 255, 255, 0.06)`
- 內容：sidebar toggle 按鈕（靠左）

### 頁面標題區
- 大標題：`20px`，font-weight `500`，色 `rgba(255,255,255,0.9)`
- 副標題：`12px`，色 `rgba(255,255,255,0.3)`

### 分類篩選 Pills

**選中狀態**
- background：`rgba(108, 99, 255, 0.2)`
- 文字：`#a09aff`，font-weight `500`
- 邊框：`1px solid rgba(108, 99, 255, 0.4)`
- border-radius：`20px`
- padding：`5px 14px`

**未選中狀態**
- background：透明
- 文字：`rgba(255, 255, 255, 0.4)`
- 邊框：`1px solid rgba(255, 255, 255, 0.12)`

### 搜尋欄
- background：`rgba(255, 255, 255, 0.05)`
- 邊框：`1px solid rgba(255, 255, 255, 0.1)`
- border-radius：`8px`
- padding：`8px 14px`
- 左側搜尋 icon：色 `rgba(255,255,255,0.3)`，大小 `13×13px`
- placeholder 文字色：`rgba(255, 255, 255, 0.25)`

### 新聞卡片

**排版**
- Grid：`repeat(3, minmax(0, 1fr))`，gap `10px`
- 每張卡片使用 `display: flex; flex-direction: column`，確保同排高度一致
- 卡片內容區（標題+摘要）`flex: 1`，底部 footer 固定在底部

**卡片樣式**
- background：`rgba(255, 255, 255, 0.04)`
- 邊框：`1px solid rgba(255, 255, 255, 0.08)`
- border-radius：`12px`
- padding：`13px`

**卡片內資訊層級（上→下）**

1. **頂部列**（來源 + 分類標籤 + 日期）
   - 來源名稱：`10px`，色 `rgba(255,255,255,0.38)`
   - 分類標籤：`10px`，圓角 `8px`，padding `1px 6px`（依分類配色）
   - 日期：`10px`，色 `rgba(255,255,255,0.22)`，靠右

2. **標題**
   - `12px`，font-weight `500`，色 `rgba(255,255,255,0.88)`
   - line-height：`1.5`
   - margin-bottom：`7px`

3. **摘要**
   - `11px`，色 `rgba(255,255,255,0.38)`
   - line-height：`1.55`

4. **底部 Footer**（分隔線上方）
   - 上邊框：`0.5px solid rgba(255,255,255,0.07)`
   - padding-top：`9px`，margin-top：`9px`
   - 左側「翻譯」：`10px`，色 `rgba(255,255,255,0.22)`（低視覺權重）
   - 右側「閱讀全文 →」：`11px`，色 `#8b85ff`，font-weight `500`（主要 CTA）

---

## 三、控制面板頁面

### RSS 來源區塊標題列
- 文字：`12px`，色 `rgba(255,255,255,0.45)`，font-weight `500`，letter-spacing `0.06em`
- 右側「+ 新增來源」按鈕：
  - `11px`，色 `#8b85ff`
  - padding：`4px 12px`，border-radius：`6px`
  - 邊框：`1px solid rgba(108,99,255,0.3)`
  - background：`rgba(108,99,255,0.1)`

### RSS 來源卡片

**關閉狀態**
- background：`rgba(255, 255, 255, 0.04)`
- 邊框：`1px solid rgba(255, 255, 255, 0.08)`
- border-radius：`10px`
- padding：`11px 14px`
- 來源名稱：`13px`，色 `rgba(255,255,255,0.38)`
- URL 摘要（折疊）：`10px`，色 `rgba(255,255,255,0.18)`，格式為 `domain · 點擊展開編輯`

**開啟狀態**
- background：`rgba(108, 99, 255, 0.07)`
- 邊框：`1px solid rgba(108, 99, 255, 0.25)`
- 來源名稱：`13px`，色 `rgba(255,255,255,0.9)`
- URL 展開區塊：
  - background：`rgba(0, 0, 0, 0.3)`，border-radius `6px`，padding `7px 10px`
  - label "RSS URL"：`10px`，色 `rgba(255,255,255,0.28)`
  - URL 文字：`11px`，色 `rgba(255,255,255,0.5)`，`word-break: break-all`

**卡片內部排版（左→右）**
```
[ 來源名稱 ] [ 分類標籤 ]          [ 垃圾桶 icon ] [ Toggle ]
```
- Toggle 在最右側
- 垃圾桶 icon 在 Toggle 左側，色 `rgba(255,255,255,0.18)`，hover 變 `rgba(255,100,100,0.5)`

**Toggle 開關樣式**
- 尺寸：`34×18px`，border-radius `9px`
- 開啟：background `#6C63FF`，白色圓點靠右（`right: 2px`）
- 關閉：background `rgba(255,255,255,0.1)`，淡色圓點靠左（`left: 2px`）
- 圓點大小：`14×14px`，border-radius `50%`

---

## 四、收藏頁面（空狀態）

- 空狀態容器：虛線邊框，border-radius `12px`
- 插圖 icon 與整體配色一致（品牌紫色調）
- 說明文字色：`rgba(255,255,255,0.4)`
- CTA 按鈕「前往新聞牆」：與「+ 新增來源」同樣的 outline 按鈕樣式

---

## 五、通用規範

| 項目 | 規格 |
|------|------|
| 字體 | 系統預設 sans-serif |
| 主要標題 | `20px`，weight `500` |
| 區塊標題 | `12px`，weight `500`，letter-spacing `0.06em` |
| 內文 | `12–13px`，weight `400` |
| 小標 / meta | `10–11px`，weight `400` |
| 過渡動效 | `transition: all 150ms ease` |
| 卡片 border-radius | `12px` |
| 按鈕 border-radius | `6–8px` |
| Pill border-radius | `20px` |
