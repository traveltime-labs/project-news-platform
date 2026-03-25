"""
Telegram 通知主程式
執行方式：python notify.py
由 GitHub Actions notify.yml 在爬蟲結束 30 分鐘後觸發（UTC 00:30 / 12:30）。

流程：
  1. 讀取 News 工作表，取出所有 isSent = FALSE 的新聞
  2. 依類別分組並格式化成快報訊息
  3. 發送至 Telegram（超過 4000 字元自動截斷）
  4. 批量將這批新聞的 isSent 更新為 TRUE
"""
import gspread
from storage.sheets import get_sheet
from utils.telegram import safe_send, FRONTEND_URL
from datetime import datetime, timezone, timedelta

CATEGORY_EMOJI = {
    'tech':    '🔬 科技',
    'world':   '🌍 世界局勢',
    'finance': '💹 財經',
    'ufo':     '🛸 外星人',
    'taiwan':  '🇹🇼 台灣',
}


def format_digest(news_by_category: dict) -> str:
    tw_time = datetime.now(timezone(timedelta(hours=8))).strftime('%Y/%m/%d %H:%M')
    lines = [f'📰 新聞快報｜{tw_time}', '']

    for category, emoji_label in CATEGORY_EMOJI.items():
        items = news_by_category.get(category, [])
        if not items:
            continue
        lines.append(emoji_label)
        for item in items[:5]:  # 每類別最多 5 則
            title = item.get('titleZh') or item.get('title', '')
            source = item.get('source', '')
            lines.append(f'• {title} — {source}')
        lines.append('')

    lines.append(f'👉 查看全部：{FRONTEND_URL}')
    return '\n'.join(lines)


def main():
    print('=== Telegram 通知開始執行 ===')
    worksheet = get_sheet('News')
    all_rows  = worksheet.get_all_values()

    if len(all_rows) <= 1:
        print('沒有新聞資料')
        return

    header = all_rows[0]
    # 欄位索引
    col = {name: idx for idx, name in enumerate(header)}

    # 找出未發送的新聞（行資料 + 行號）
    unsent_rows = []
    for i, row in enumerate(all_rows[1:], start=2):
        is_sent = row[col['isSent']].upper() if col.get('isSent') is not None else 'FALSE'
        if is_sent != 'TRUE':
            unsent_rows.append((i, row))

    if not unsent_rows:
        print('沒有新的新聞需要發送')
        return

    print(f'找到 {len(unsent_rows)} 則未發送新聞')

    # 依類別分組
    news_by_category: dict[str, list] = {}
    for _, row in unsent_rows:
        item = {name: (row[idx] if idx < len(row) else '') for name, idx in col.items()}
        cat = item.get('category', 'tech')
        news_by_category.setdefault(cat, []).append(item)

    # 格式化並發送
    message = format_digest(news_by_category)
    safe_send(message)
    print('Telegram 快報已發送')

    # 批量更新 isSent = TRUE
    sent_col_letter = _col_to_letter(col['isSent'] + 1)
    cells_to_update = [
        gspread.Cell(row_num, col['isSent'] + 1, 'TRUE')
        for row_num, _ in unsent_rows
    ]
    if cells_to_update:
        worksheet.update_cells(cells_to_update)
        print(f'已更新 {len(cells_to_update)} 則新聞的 isSent 為 TRUE')

    print(f'=== 完成：發送 {len(unsent_rows)} 則新聞快報 ===')


def _col_to_letter(n: int) -> str:
    """將欄位編號（1-based）轉換為 A1 notation 字母（A, B, ... Z, AA, ...）"""
    result = ''
    while n > 0:
        n, remainder = divmod(n - 1, 26)
        result = chr(65 + remainder) + result
    return result


if __name__ == '__main__':
    main()
