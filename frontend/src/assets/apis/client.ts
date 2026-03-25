import { getAuthSession } from '@/lib/auth'

export class ApiError extends Error {
  status: number

  constructor(
    status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * 基礎 fetch wrapper
 * - 自動帶入 Content-Type: application/json
 * - 自動帶入 Authorization: Bearer <email>（從 localStorage 讀取登入 session）
 * - 統一處理非 2xx 時拋出 ApiError
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const session = getAuthSession()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (session?.email) {
    headers['Authorization'] = `Bearer ${session.email}`
  }

  const res = await fetch(path, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({ ok: false, message: '回應格式錯誤' }))

  if (!res.ok) {
    throw new ApiError(res.status, (data as { message?: string }).message ?? `HTTP ${res.status}`)
  }

  return data as T
}
