const AUTH_STORAGE_KEY = 'vehicle-manager-auth-session'

export interface AuthSession {
  email: string
  name?: string
  picture?: string
  loginAt: string
}

interface ApiAuthResponse {
  ok?: boolean
  success?: boolean
  email?: string
  name?: string
  picture?: string
  message?: string
}

// 允許 emails 白名單（前端輔助提示用，實際驗證由後端 GAS 執行）
function getAllowedEmails(): string[] {
  const raw = import.meta.env.VITE_ALLOWED_EMAILS ?? ''

  return raw
    .split(',')
    .map((item: string) => item.trim().toLowerCase())
    .filter(Boolean)
}

function isAllowedEmail(email: string): boolean {
  const allowedEmails = getAllowedEmails()
  if (allowedEmails.length === 0) return true
  return allowedEmails.includes(email.toLowerCase())
}

/**
 * 透過 /api/auth 驗證 Google credential
 * Vercel Function 會負責轉發至 GAS 並處理 CORS
 * 開發環境（vercel dev）與正式部署都使用相同路徑，不需要判斷 DEV
 */
export async function verifyGoogleCredentialWithGas(credential: string): Promise<AuthSession> {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })

  const data = await response.json().catch(() => ({ message: '回應格式錯誤。' })) as ApiAuthResponse
  const isSuccess = data.ok === true || data.success === true

  if (!response.ok || !isSuccess) {
    throw new Error(data.message || '驗證失敗。')
  }

  if (!data.email) {
    throw new Error('驗證伺服器沒有回傳 email。')
  }

  if (!isAllowedEmail(data.email)) {
    throw new Error('此帳號未被允許登入。')
  }

  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
    loginAt: new Date().toISOString(),
  }
}

// 將 AuthSession 儲存在 localStorage 中，以便後續頁面載入時能夠保持登入狀態
export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

// 從 localStorage 中取得 AuthSession，如果解析失敗或不存在則返回 null
export function getAuthSession(): AuthSession | null {
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSession
  }
  catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function isLoggedIn(): boolean {
  return getAuthSession() !== null
}

// 清除 AuthSession，登出使用者
export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}
