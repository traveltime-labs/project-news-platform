import re
import feedparser
import requests
from datetime import datetime, timezone
from .base import BaseCrawler, NewsItem


def resolve_google_news_url(google_url: str) -> str:
    """
    解析 Google News 跳轉連結，取得原文網址。
    失敗時回傳原本的 Google 跳轉網址（仍可正常開啟）。
    """
    try:
        resp = requests.get(
            google_url,
            allow_redirects=True,
            timeout=5,
            headers={'User-Agent': 'Mozilla/5.0'},
        )
        return resp.url
    except Exception:
        return google_url


class RssCrawler(BaseCrawler):
    def __init__(
        self,
        source_name: str,
        feed_url: str,
        category: str,
        is_google_news: bool = False,
    ):
        self.source_name = source_name
        self.feed_url = feed_url
        self.category = category
        self.is_google_news = is_google_news  # 是否需要解析 Google News 跳轉連結

    def fetch(self) -> list[NewsItem]:
        feed = feedparser.parse(self.feed_url)
        items = []

        for entry in feed.entries[:20]:  # 每次最多取 20 則
            url = entry.get('link', '')
            if not url:
                continue

            # Google News 跳轉連結解析
            if self.is_google_news and url:
                url = resolve_google_news_url(url)

            # 發布時間
            raw_time = entry.get('published', '')
            if raw_time:
                try:
                    import email.utils
                    published_at = datetime(
                        *email.utils.parsedate(raw_time)[:6],
                        tzinfo=timezone.utc,
                    ).isoformat()
                except Exception:
                    published_at = datetime.now(timezone.utc).isoformat()
            else:
                published_at = datetime.now(timezone.utc).isoformat()

            # 摘要：移除 HTML 標籤並截斷
            summary = entry.get('summary', '')
            if summary:
                summary = re.sub(r'<[^>]+>', '', summary).strip()
                summary = summary[:500]

            # Google News RSS 的 entry.source.title 為原始媒體名
            source = self.source_name
            if self.is_google_news:
                entry_source = getattr(entry, 'source', None)
                if entry_source and entry_source.get('title'):
                    source = entry_source['title']

            items.append(NewsItem(
                source=source,
                title=entry.get('title', '').strip(),
                url=url,
                summary=summary,
                category=self.category,
                published_at=published_at,
            ))

        return items

