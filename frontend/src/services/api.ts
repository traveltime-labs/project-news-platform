import type { ApiResponse } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function getToken(): string | null {
  return localStorage.getItem('accessToken')
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const code = (body as ApiResponse<unknown>)?.success === false
      ? (body as { success: false; error: { code: string; message: string } }).error.code
      : `HTTP_${res.status}`
    const msg = (body as ApiResponse<unknown>)?.success === false
      ? (body as { success: false; error: { code: string; message: string } }).error.message
      : `HTTP ${res.status}`
    throw new ApiError(res.status, code, msg)
  }

  // If the backend wraps in { success, data }, unwrap it
  if (body && typeof body === 'object' && 'success' in body && body.success === true) {
    return (body as { success: true; data: T }).data
  }

  return body as T
}
