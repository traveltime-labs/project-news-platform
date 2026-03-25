import gspread
from google.oauth2.service_account import Credentials
import os

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']


def get_client() -> gspread.Client:
    creds = Credentials.from_service_account_info(
        {
            'type': 'service_account',
            'client_email': os.environ['GOOGLE_SERVICE_ACCOUNT_EMAIL'],
            'private_key': os.environ['GOOGLE_PRIVATE_KEY'].replace('\\n', '\n'),
            'token_uri': 'https://oauth2.googleapis.com/token',
        },
        scopes=SCOPES,
    )
    return gspread.authorize(creds)


def get_sheet(sheet_name: str) -> gspread.Worksheet:
    client = get_client()
    spreadsheet = client.open_by_key(os.environ['GOOGLE_SHEET_ID'])
    return spreadsheet.worksheet(sheet_name)


def get_sources() -> list[dict]:
    """
    從 Settings 工作表取得啟用中的來源清單。
    每一列代表一個來源，格式：
      name | feed_url | category | enabled | fail_count | notify_enabled | notify_times
    """
    sheet = get_sheet('Settings')
    records = sheet.get_all_records()
    return [r for r in records if str(r.get('enabled', '')).upper() == 'TRUE']


def get_existing_hashes() -> set[str]:
    """取得所有已存在的 url_hash，用於去重"""
    sheet = get_sheet('News')
    records = sheet.get_all_records()
    return {str(row.get('url_hash', '')) for row in records if row.get('url_hash')}


def batch_write(items: list[dict]) -> None:
    """
    整批寫入 News 工作表（append_rows），避免逐筆 API 呼叫觸發 429。
    各欄位順序需與 News 工作表 header 一致：
      publishedAt | source | title | url | url_hash | summary | category | titleZh | summaryZh | isSent
    """
    if not items:
        return

    sheet = get_sheet('News')
    rows = [
        [
            item.get('published_at', ''),
            item.get('source', ''),
            item.get('title', ''),
            item.get('url', ''),
            item.get('url_hash', ''),
            item.get('summary', ''),
            item.get('category', ''),
            '',        # titleZh（待翻譯）
            '',        # summaryZh（待翻譯）
            'FALSE',   # isSent
        ]
        for item in items
    ]
    sheet.append_rows(rows, value_input_option='RAW')
