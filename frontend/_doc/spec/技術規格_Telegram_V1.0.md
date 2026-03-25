# Telegram 通知模組技術規格
## Tech Spec V1.0

---

## 1. 檔案位置

```
crawler/
├── notify.py              # 通知入口，由 GitHub Actions 獨立觸發
└── utils/
    └── telegram.py        # Telegram Bot 封裝
```

---

## 2. Telegram Bot 封裝（utils/telegram.py）

```python
import requests
import os

TELEGRAM_API = 'https://api.telegram.org/bot{token}/{method}'

def send_message(text: str, parse_mode: str = 'HTML'):
    """發送純文字訊息（告警用）"""
    token   = os.environ['TELEGRAM_BOT_TOKEN']
    chat_id = os.environ['TELEGRAM_CHAT_ID']

    url = TELEGRAM_API.format(token=token, method='sendMessage')
    resp = requests.post(url, json={
        'chat_id':    chat_id,
        'text':       text,
        'parse_mode': parse_mode,
    }, timeout=10)
    resp.raise_for_status()
```

---

## 3. 通知主程式（notify.py）

### 3-1. 功能說明

從 Google Sheets `News` 工作表撈取所有 `is_sent = FALSE` 的新聞，格式化後發送至 Telegram，發送完成後將這批新聞的 `is_sent` 欄位更新為 `TRUE`。

### 3-2. 訊息格式

Telegram 單則訊息上限 4096 字元，每次快報以**彙整摘要**方式發送，避免超限：

```
📰 新聞快報｜2025/03/24 20:00

🔬 科技
• OpenAI releases new model — TechCrunch
• Apple announces Vision Pro 2 — The Verge

🌍 世界局勢
• Fed holds rates steady — Reuters

💹 財經
• Taiwan stocks rise on tech rally — Yahoo Finance

🛸 外星人
• Pentagon releases new UAP footage — Reddit r/UFOs

🇹🇼 台灣
• 台積電法說會今日登場 — 自由時報

👉 查看全部：https://your-vercel-app.vercel.app
```

### 3-3. 實作

```python
from storage.sheets import get_sheet
from utils.telegram import send_message
from datetime import datetime, timezone, timedelta

CATEGORY_EMOJI = {
    'tech':    '🔬 科技',
    'world':   '🌍 世界局勢',
    'finance': '💹 財經',
    'ufo':     '🛸 外星人',
    'taiwan':  '🇹🇼 台灣',
}

FRONTEND_URL = 'https://your-vercel-app.vercel.app'


def format_digest(news_by_category: dict) -> str:
    """將新聞依類別格式化為單一訊息"""
    tw_time = datetime.now(timezone(timedelta(hours=8))).strftime('%Y/%m/%d %H:%M')
    lines = [f'📰 新聞快報｜{tw_time}', '']

    for category, emoji_label in CATEGORY_EMOJI.items():
        items = news_by_category.get(category, [])
        if not items:
            continue
        lines.append(emoji_label)
        for item in items[:5]:  # 每類別最多 5 則
            lines.append(f'• {item["title"]} — {item["source"]}')
        lines.append('')

    lines.append(f'👉 查看全部：{FRONTEND_URL}')
    return '\n'.join(lines)


def main():
    sheet = get_sheet('News')
    rows  = sheet.get_all_records()

    # 找出未發送的新聞
    unsent = [r for r in rows if str(r.get('is_sent', '')).upper() != 'TRUE']

    if not unsent:
        print('沒有新的新聞需要發送')
        return

    # 依類別分組
    news_by_category: dict[str, list] = {}
    for item in unsent:
        cat = item.get('category', 'tech')
        news_by_category.setdefault(cat, []).append(item)

    # 格式化並發送
    message = format_digest(news_by_category)
    send_message(message)

    # 更新 is_sent = TRUE
    # 取得整張表的 row 物件，比對 url_hash 後更新
    sheet_rows   = sheet.get_all_values()
    header       = sheet_rows[0]
    hash_col_idx = header.index('url_hash')
    sent_col_idx = header.index('is_sent')
    sent_hashes  = {item['url_hash'] for item in unsent}

    worksheet = get_sheet('News')
    all_rows  = worksheet.get_all_values()

    # 批量更新：收集所有需要更新的 cell
    cells_to_update = []
    for i, row in enumerate(all_rows[1:], start=2):  # 從第 2 列開始（跳過 header）
        if row[hash_col_idx] in sent_hashes:
            cells_to_update.append(
                gspread.Cell(i, sent_col_idx + 1, 'TRUE')
            )

    if cells_to_update:
        worksheet.update_cells(cells_to_update)

    print(f'完成：發送 {len(unsent)} 則新聞快報')


if __name__ == '__main__':
    main()
```

---

## 4. 訊息長度保護

```python
MAX_LENGTH = 4000  # 保留 96 字元緩衝

def safe_send(text: str):
    """超過長度上限時自動截斷並補提示"""
    if len(text) <= MAX_LENGTH:
        send_message(text)
        return

    truncated = text[:MAX_LENGTH]
    last_newline = truncated.rfind('\n')
    truncated = truncated[:last_newline]
    truncated += f'\n\n（訊息過長，已截斷）\n👉 查看全部：{FRONTEND_URL}'
    send_message(truncated)
```

---

## 5. 錯誤處理

| 情境 | 處理方式 |
|------|---------|
| Telegram API 回傳錯誤 | `raise_for_status()` 拋出，GitHub Actions 標記執行失敗，可在 Actions 頁面查看 log |
| Google Sheets 讀取失敗 | 同上，拋出例外讓 Actions 記錄 |
| 沒有未發送新聞 | 靜默結束，印出提示訊息即可 |
| 訊息超過 4096 字元 | `safe_send()` 自動截斷 |

---

## 6. 告警訊息格式（心跳檢測）

爬蟲模組的 `heartbeat.py` 呼叫 `send_message()` 時使用以下格式：

```
⚠️ [The Verge] 連續 3 次抓取結果為空，請確認來源狀態。
```
