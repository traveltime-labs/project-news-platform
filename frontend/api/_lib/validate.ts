/**
 * 請求參數驗證工具
 */

export function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} 為必填字串`)
  }
  return value.trim()
}

export function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined
}

export function optionalInt(value: unknown, defaultVal: number): number {
  const n = parseInt(value as string, 10)
  return isNaN(n) ? defaultVal : n
}
