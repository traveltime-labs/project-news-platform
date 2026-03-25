<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import type { NewsSettings, NewsCategory } from '@/types'

const settingsStore = useSettingsStore()
const { show } = useToast()

// 本地可編輯副本
const form = ref<NewsSettings | null>(null)

const categoryOptions: Array<{ value: NewsCategory; label: string }> = [
  { value: 'tech', label: '科技' },
  { value: 'world', label: '世界局勢' },
  { value: 'finance', label: '財經' },
  { value: 'ufo', label: '外星人' },
  { value: 'taiwan', label: '台灣' },
]

onMounted(async () => {
  await settingsStore.load()
  if (settingsStore.settings) {
    form.value = JSON.parse(JSON.stringify(settingsStore.settings))
  }
})

watch(
  () => settingsStore.settings,
  (val) => {
    if (val && !form.value) {
      form.value = JSON.parse(JSON.stringify(val))
    }
  },
)

async function handleSave() {
  if (!form.value) return
  try {
    await settingsStore.save(form.value)
    show('設定已儲存', 'success')
  } catch {
    show('儲存失敗，請稍後再試', 'error')
  }
}

function addNotifyTime() {
  form.value?.notifyTimes.push('12:00')
}

function removeNotifyTime(index: number) {
  form.value?.notifyTimes.splice(index, 1)
}

function addSource() {
  form.value?.sources.push({
    name: '',
    url: '',
    category: 'tech',
    enabled: true,
  })
}

function removeSource(index: number) {
  form.value?.sources.splice(index, 1)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Page Title -->
    <div>
      <h1 class="text-2xl font-bold tracking-tight">控制面板</h1>
      <p class="mt-1 text-sm text-muted-foreground">管理新聞來源與 Telegram 通知排程</p>
    </div>

    <!-- Loading -->
    <div v-if="settingsStore.isLoading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-12 w-full animate-pulse rounded-lg bg-muted" />
    </div>

    <template v-else-if="form">
      <!-- Sources Section -->
      <section class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-semibold text-gray-900">新聞來源</h2>
          <button
            class="rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            @click="addSource"
          >
            新增來源
          </button>
        </div>

        <div class="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div
            v-for="(source, idx) in form.sources"
            :key="`${source.name}-${idx}`"
            class="space-y-3 px-4 py-3 transition-colors hover:bg-gray-50"
          >
            <div class="grid gap-2 md:grid-cols-[1.2fr_2fr_120px]">
              <input
                v-model="source.name"
                type="text"
                placeholder="來源名稱（例如：國際科技）"
                class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              />
              <input
                v-model="source.url"
                type="url"
                placeholder="RSS 網址"
                class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              />
              <select
                v-model="source.category"
                class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                <option
                  v-for="opt in categoryOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="flex items-center justify-between gap-3">
              <button
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none"
                :class="source.enabled ? 'bg-primary' : 'bg-muted'"
                :aria-checked="source.enabled"
                role="switch"
                @click="source.enabled = !source.enabled"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform"
                  :class="source.enabled ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>

              <button
                class="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                @click="removeSource(idx)"
              >
                刪除
              </button>
            </div>
          </div>

          <div
            v-if="form.sources.length === 0"
            class="px-4 py-8 text-center text-sm text-gray-500"
          >
            目前沒有來源，請先新增至少一個 RSS 來源。
          </div>
        </div>
      </section>

      <!-- Notification Section -->
      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">Telegram 通知</h2>
          <!-- Master Toggle -->
          <button
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none"
            :class="form.notifyEnabled ? 'bg-primary' : 'bg-muted'"
            role="switch"
            :aria-checked="form.notifyEnabled"
            @click="form.notifyEnabled = !form.notifyEnabled"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform"
              :class="form.notifyEnabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <div
          class="rounded-xl border border-gray-200 bg-white shadow-sm p-4 space-y-4"
          :class="!form.notifyEnabled && 'opacity-50 pointer-events-none'"
        >
          <p class="text-sm font-medium text-gray-900">每日推播時間</p>
          <div class="space-y-2">
            <div
              v-for="(_, idx) in form.notifyTimes"
              :key="idx"
              class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 transition-colors hover:bg-gray-100"
            >
              <!-- Clock icon -->
              <svg class="h-4 w-4 shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span class="text-xs font-medium text-gray-500 w-8">時段 {{ idx + 1 }}</span>
              <input
                v-model="form.notifyTimes[idx]"
                type="time"
                class="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              />
              <button
                class="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title="移除此時段"
                @click="removeNotifyTime(idx)"
              >
                <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- 新增時段 -->
            <button
              class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              @click="addNotifyTime"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              新增時段
            </button>
          </div>
        </div>
      </section>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          :disabled="settingsStore.isSaving"
          class="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          @click="handleSave"
        >
          <span v-if="settingsStore.isSaving" class="flex items-center gap-2">
            <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            儲存中…
          </span>
          <span v-else>儲存設定</span>
        </button>
      </div>
    </template>
  </div>
</template>
