def filter_new_items(items: list, existing_hashes: set[str]) -> list:
    """過濾掉已存在的新聞（依 url_hash 比對），只回傳新的"""
    return [item for item in items if item.url_hash not in existing_hashes]
