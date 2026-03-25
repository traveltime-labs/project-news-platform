from dataclasses import dataclass, field
from typing import Optional
import hashlib


@dataclass
class NewsItem:
    source: str
    title: str
    url: str
    summary: str
    category: str
    published_at: str           # ISO 8601
    url_hash: str = field(default='', init=False)
    title_zh: Optional[str] = None
    summary_zh: Optional[str] = None
    is_sent: bool = False

    def __post_init__(self):
        self.url_hash = hashlib.md5(self.url.encode()).hexdigest()


class BaseCrawler:
    source_name: str = ''
    category: str = ''

    def fetch(self) -> list[NewsItem]:
        raise NotImplementedError

    def safe_fetch(self) -> list[NewsItem]:
        """包一層 try/except，失敗回傳空列表讓心跳檢測處理"""
        try:
            return self.fetch()
        except Exception as e:
            print(f'[{self.source_name}] 抓取失敗：{e}')
            return []
