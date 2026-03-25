<route>
{
  meta: {
    hideLayout: true
  }
}
</route>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { ApiError } from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMessage.value = '請輸入帳號與密碼'
    return
  }

  errorMessage.value = ''

  try {
    await authStore.login({ username: username.value, password: password.value })

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      errorMessage.value = '帳號或密碼錯誤'
    } else {
      errorMessage.value = '登入失敗，請稍後再試'
    }
  }
}
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center bg-slate-950 px-4">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-20 top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div class="absolute -right-12 bottom-4 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl" />
    </div>

    <div class="relative w-full max-w-sm">
      <div class="rounded-2xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur text-white">
        <div class="text-center mb-6">
          <div class="text-4xl mb-2">🎯</div>
          <h1 class="text-2xl font-bold">習慣追蹤系統</h1>
          <p class="text-sm text-slate-400 mt-1">請登入以繼續使用</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">帳號</label>
            <input
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="請輸入帳號"
              class="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">密碼</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="請輸入密碼"
              class="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <p v-if="errorMessage" class="text-sm text-red-400 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 py-2.5 font-semibold text-white transition-colors"
          >
            {{ authStore.isLoading ? '登入中...' : '登入' }}
          </button>
        </form>

        <p class="mt-4 text-center text-xs text-slate-400">
          預設帳號：admin ／ 密碼：admin123
        </p>
      </div>
    </div>
  </div>
</template>

