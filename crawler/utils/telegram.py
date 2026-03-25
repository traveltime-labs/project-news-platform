import requests
import os

_TELEGRAM_API = 'https://api.telegram.org/bot{token}/{method}'

MAX_LENGTH = 4000  # 保留 96 字元緩衝（Telegram 上限 4096）
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://your-vercel-app.vercel.app')


def send_message(text: str, parse_mode: str = 'HTML') -> None:
    """發送純文字訊息至 Telegram（告警 & 快報共用）"""
    token   = os.environ['TELEGRAM_BOT_TOKEN']
    chat_id = os.environ['TELEGRAM_CHAT_ID']

    url = _TELEGRAM_API.format(token=token, method='sendMessage')
    resp = requests.post(
        url,
        json={'chat_id': chat_id, 'text': text, 'parse_mode': parse_mode},
        timeout=10,
    )
    resp.raise_for_status()


def safe_send(text: str) -> None:
    """超過長度上限時自動截斷並補提示，再發送"""
    if len(text) <= MAX_LENGTH:
        send_message(text)
        return

    truncated = text[:MAX_LENGTH]
    last_newline = truncated.rfind('\n')
    if last_newline > 0:
        truncated = truncated[:last_newline]
    truncated += f'\n\n（訊息過長，已截斷）\n👉 查看全部：{FRONTEND_URL}'
    send_message(truncated)
