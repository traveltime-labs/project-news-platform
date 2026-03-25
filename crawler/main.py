"""
爬蟲主程式
執行方式：python main.py
由 GitHub Actions crawler.yml 每天 UTC 00:00 / 12:00 觸發。
爬蟲來源從 Google Sheets Settings 工作表動態讀取。
"""
from crawlers.rss import RssCrawler
from storage.sheets import get_sources, get_existing_hashes, batch_write
from utils.dedup import filter_new_items
from utils.heartbeat import check as heartbeat_check
from utils.telegram import send_message
from dataclasses import asdict
from dotenv import load_dotenv
load_dotenv()

def build_crawler(source: dict) -> RssCrawler:
    """從 Settings 工作表的一列資料建立對應的爬蟲"""
    feed_url = source['feed_url']
    is_google_news = 'news.google.com' in feed_url

    return RssCrawler(
        source_name=source['name'],
        feed_url=feed_url,
        category=source['category'],
        is_google_news=is_google_news,
    )


def main():
    print('=== 新聞爬蟲開始執行 ===')

    # 從 Settings 動態讀取啟用的來源
    sources = get_sources()
    if not sources:
        print('Settings 工作表中沒有啟用的來源，結束執行')
        return

    print(f'載入 {len(sources)} 個啟用來源')
    existing_hashes = get_existing_hashes()
    all_new_items = []

    for source in sources:
        crawler = build_crawler(source)
        print(f'[{crawler.source_name}] 開始抓取...')
        items = crawler.safe_fetch()
        print(f'[{crawler.source_name}] 抓取 {len(items)} 則')

        # 心跳檢測
        heartbeat_check(
            source_name=crawler.source_name,
            item_count=len(items),
            notify_fn=send_message,
        )

        # 去重
        new_items = filter_new_items(items, existing_hashes)
        print(f'[{crawler.source_name}] 新增 {len(new_items)} 則（去重後）')
        all_new_items.extend(new_items)

        # 更新本次已知的 hash，避免同批次內重複
        existing_hashes.update(item.url_hash for item in new_items)

    # 整批寫入 Google Sheets
    batch_write([asdict(item) for item in all_new_items])
    print(f'\n=== 完成：新增 {len(all_new_items)} 則新聞 ===')


if __name__ == '__main__':
    main()

