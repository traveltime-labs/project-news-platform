import os
from pathlib import Path

import gspread
from google.oauth2.service_account import Credentials

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
REQUIRED_ENV = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_SHEET_ID',
]

SOURCES = [
    {
        'name': '國際科技',
        'feed_url': 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en',
        'category': 'tech',
    },
    {
        'name': '國際財經',
        'feed_url': 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en',
        'category': 'finance',
    },
    {
        'name': '世界局勢',
        'feed_url': 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en',
        'category': 'world',
    },
    {
        'name': '台灣新聞',
        'feed_url': 'https://news.google.com/rss/headlines/section/geo/Taiwan?hl=zh-TW&gl=TW&ceid=TW:zh-Hant',
        'category': 'taiwan',
    },
    {
        'name': 'UFO新聞',
        'feed_url': 'https://news.google.com/rss/search?q=UFO+UAP&hl=en-US&gl=US&ceid=US:en',
        'category': 'ufo',
    },
    {
        'name': 'Reddit UFOs',
        'feed_url': 'https://www.reddit.com/r/UFOs/top/.rss?sort=top&t=day&limit=20',
        'category': 'ufo',
    },
    {
        'name': 'NASA',
        'feed_url': 'https://www.nasa.gov/news-release/feed/',
        'category': 'ufo',
    },
]


def load_env_files() -> None:
    """
    載入 crawler/.env 與 crawler/.env.local（若存在）。
    不覆蓋已存在的系統環境變數。
    """
    base_dir = Path(__file__).resolve().parent
    for name in ('.env', '.env.local'):
        env_path = base_dir / name
        if not env_path.exists():
            continue

        for raw_line in env_path.read_text(encoding='utf-8').splitlines():
            line = raw_line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue

            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


def require_env(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        raise RuntimeError(
            f'缺少環境變數: {key}。請在 crawler/.env 設定後再執行。'
        )
    return value


def get_client() -> gspread.Client:
    load_env_files()

    missing = [k for k in REQUIRED_ENV if not os.environ.get(k)]
    if missing:
        raise RuntimeError(
            '缺少必要環境變數: ' + ', '.join(missing) + '\n'
            + '請在 crawler/.env 或 crawler/.env.local 設定後重試。'
        )

    creds = Credentials.from_service_account_info(
        {
            'type': 'service_account',
            'client_email': require_env('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
            'private_key': require_env('GOOGLE_PRIVATE_KEY').replace('\\n', '\n'),
            'token_uri': 'https://oauth2.googleapis.com/token',
        },
        scopes=SCOPES,
    )
    return gspread.authorize(creds)


def ensure_sheet(spreadsheet: gspread.Spreadsheet, title: str, rows: int, cols: int):
    existing = [ws.title for ws in spreadsheet.worksheets()]
    if title not in existing:
        spreadsheet.add_worksheet(title=title, rows=rows, cols=cols)
        print(f'建立 {title} 工作表')
    return spreadsheet.worksheet(title)


def setup() -> None:
    client = get_client()
    spreadsheet = client.open_by_key(os.environ['GOOGLE_SHEET_ID'])

    news = ensure_sheet(spreadsheet, 'News', rows=1000, cols=10)
    if not news.row_values(1):
        news.append_row([
            'publishedAt',
            'source',
            'title',
            'url',
            'url_hash',
            'summary',
            'category',
            'titleZh',
            'summaryZh',
            'isSent',
        ])
        print('News 欄位建立完成')

    bookmarks = ensure_sheet(spreadsheet, 'Bookmarks', rows=1000, cols=2)
    if not bookmarks.row_values(1):
        bookmarks.append_row(['newsId', 'savedAt'])
        print('Bookmarks 欄位建立完成')

    settings = ensure_sheet(spreadsheet, 'Settings', rows=200, cols=7)
    if not settings.row_values(1):
        settings.append_row([
            'name',
            'feed_url',
            'category',
            'enabled',
            'fail_count',
            'notify_enabled',
            'notify_times',
        ])
        rows = [
            [s['name'], s['feed_url'], s['category'], 'TRUE', 0, 'TRUE', '08:00,20:00']
            for s in SOURCES
        ]
        settings.append_rows(rows)
        print(f'Settings 寫入 {len(rows)} 筆預設來源')

    print('\n初始化完成')


if __name__ == '__main__':
    setup()
