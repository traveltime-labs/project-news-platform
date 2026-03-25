import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isLoading = ref(false)

  function initAuth() {}

  async function login(_input: { username: string; password: string }) {
    throw new Error('Auth not implemented')
  }

  async function logout() {}

  return { isLoading, initAuth, login, logout }
})

