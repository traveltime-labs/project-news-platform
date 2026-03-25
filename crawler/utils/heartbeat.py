"""
心跳檢測：若單一來源連續三次抓取結果為空，自動發送 Telegram 異常告警。
失敗次數儲存於 Google Sheets Settings 工作表的 fail_count 欄位，
跨 GitHub Actions 執行週期持久保存。
"""
from typing import Callable
from storage.sheets import get_sheet

FAIL_THRESHOLD = 3  # 連續失敗超過此次數才發送告警


def check(source_name: str, item_count: int, notify_fn: Callable[[str], None]) -> None:
    """
    item_count = 0 時累計失敗次數；
    達到 FAIL_THRESHOLD 時呼叫 notify_fn 發送告警；
    成功或告警後重置計數。
    失敗次數寫回 Settings 工作表，跨執行持久保存。
    """
    sheet = get_sheet('Settings')
    records = sheet.get_all_records()

    for i, row in enumerate(records):
        if row.get('name') != source_name:
            continue

        fail_count = int(row.get('fail_count') or 0)

        if item_count == 0:
            fail_count += 1
            if fail_count >= FAIL_THRESHOLD:
                notify_fn(
                    f'⚠️ [{source_name}] 連續 {fail_count} 次抓取結果為空，請確認來源狀態。'
                )
                fail_count = 0  # 告警後重置，避免重複告警
        else:
            fail_count = 0  # 成功後重置

        # 更新 fail_count 欄位（列索引從 2 開始，因為第 1 列是 header）
        header = sheet.row_values(1)
        col_idx = header.index('fail_count') + 1
        sheet.update_cell(i + 2, col_idx, fail_count)
        break

