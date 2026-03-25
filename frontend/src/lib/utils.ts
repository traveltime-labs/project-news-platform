import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 全站統一時間顯示格式：YYYY/MM/DD HH:mm:ss
 * 接受 ISO 8601 字串、Date 物件或 YYYY-MM-DD 日期字串
 */
export function formatDateTime(input: string | Date | null | undefined): string {
  if (!input) return ''
  const d = input instanceof Date ? input : new Date(
    // 純日期字串（YYYY-MM-DD）補上時區避免解析為 UTC 導致日期偏移
    typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)
      ? input + 'T00:00:00'
      : input,
  )
  if (isNaN(d.getTime())) return String(input)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * 僅顯示日期部分：YYYY/MM/DD
 */
export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return ''
  const full = formatDateTime(input)
  return full ? full.substring(0, 10) : ''
}


