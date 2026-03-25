import { apiFetch } from './api'
import type { LoginInput, TokenResponse } from '@/types'

export const authService = {
  async login(input: LoginInput): Promise<TokenResponse> {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async logout(): Promise<void> {
    await apiFetch('/api/auth/logout', { method: 'POST' })
  },
}
