<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import type { NewsSettings, NewsCategory } from '@/types'

const settingsStore = useSettingsStore()
const { show } = useToast()
const expandedSourceIndex = ref<number | null>(null)

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
  if (form.value) {
    expandedSourceIndex.value = form.value.sources.length - 1
  }
}

function removeSource(index: number) {
  form.value?.sources.splice(index, 1)
  if (expandedSourceIndex.value === index) {
    expandedSourceIndex.value = null
    return
  }
  if ((expandedSourceIndex.value ?? -1) > index) {
    expandedSourceIndex.value = (expandedSourceIndex.value ?? 0) - 1
  }
}

function toggleSourceExpand(index: number) {
  expandedSourceIndex.value = expandedSourceIndex.value === index ? null : index
}

function sourceDomain(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return '未設定網址'
  }
}

function categoryLabel(category?: NewsCategory) {
  return categoryOptions.find((opt) => opt.value === category)?.label ?? '健康'
}

const categoryColors: Record<string, string> = {
  ufo: 'bg-[rgba(108,99,255,0.18)] text-[#a09aff] border border-[rgba(108,99,255,0.3)]',
  tech: 'bg-[rgba(55,138,221,0.18)] text-[#85b7eb] border border-[rgba(55,138,221,0.3)]',
  taiwan: 'bg-[rgba(29,158,117,0.18)] text-[#5dcaa5] border border-[rgba(29,158,117,0.3)]',
  finance: 'bg-[rgba(186,117,23,0.2)] text-[#ef9f27] border border-[rgba(186,117,23,0.35)]',
  world: 'bg-[rgba(216,90,48,0.18)] text-[#f0997b] border border-[rgba(216,90,48,0.3)]',
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Title -->
    <div>
      <h1 class="text-[20px] font-medium text-white/90">控制面板</h1>
      <p class="mt-1 text-xs text-white/30">管理新聞來源與 Telegram 通知排程</p>
    </div>

    <!-- Loading -->
    <div v-if="settingsStore.isLoading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-12 w-full animate-pulse rounded-lg bg-white/8" />
    </div>

    <template v-else-if="form">
      <!-- Sources Section -->
      <section class="space-y-2.5">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-[12px] font-medium tracking-[0.06em] text-white/45">RSS 來源</h2>
          <button
            class="rounded-[6px] border border-[rgba(108,99,255,0.3)] bg-[rgba(108,99,255,0.1)] px-3 py-1 text-[11px] text-[#8b85ff] transition-all duration-150 hover:bg-[rgba(108,99,255,0.18)]"
            @click="addSource"
          >
            + 新增來源
          </button>
        </div>

        <div class="space-y-2.5">
          <article
            v-for="(source, idx) in form.sources"
            :key="`${source.name}-${idx}`"
            class="rounded-[10px] border p-[11px] transition-all duration-150"
            :class="expandedSourceIndex === idx ? 'border-[rgba(108,99,255,0.25)] bg-[rgba(108,99,255,0.07)]' : 'border-white/8 bg-white/[0.04]'"
            @click="toggleSourceExpand(idx)"
          >
            <div class="flex items-center gap-2">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-[13px]" :class="expandedSourceIndex === idx ? 'text-white/90' : 'text-white/38'">
                    {{ source.name || '未命名來源' }}
                  </p>
                  <span
                    class="rounded-[8px] px-[6px] py-[1px] text-[10px]"
                    :class="categoryColors[source.category ?? ''] ?? 'bg-white/6 text-white/28'"
                  >
                    {{ categoryLabel(source.category) }}
                  </span>
                </div>
                <p class="mt-1 truncate text-[10px] text-white/18">
                  {{ sourceDomain(source.url) }} · 點擊展開編輯
                </p>
              </div>

              <button
                class="flex h-7 w-7 items-center justify-center rounded-md text-white/18 transition-colors duration-150 hover:bg-[rgba(255,100,100,0.12)] hover:text-[rgba(255,100,100,0.5)]"
                title="刪除來源"
                @click.stop="removeSource(idx)"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
              </button>

              <button
                class="relative h-[18px] w-[34px] rounded-[9px] transition-colors duration-150"
                :class="source.enabled ? 'bg-[#6c63ff]' : 'bg-white/10'"
                role="switch"
                :aria-checked="source.enabled"
                @click.stop="source.enabled = !source.enabled"
              >
                <span
                  class="absolute top-[2px] h-[14px] w-[14px] rounded-full transition-all duration-150"
                  :class="source.enabled ? 'right-[2px] bg-white' : 'left-[2px] bg-white/65'"
                />
              </button>
            </div>

            <div v-if="expandedSourceIndex === idx" class="mt-3 space-y-2" @click.stop>
              <div class="grid gap-2 md:grid-cols-[1.1fr_130px]">
                <input
                  v-model="source.name"
                  type="text"
                  placeholder="來源名稱"
                  class="rounded-md border border-white/12 bg-black/20 px-3 py-2 text-[12px] text-white/85 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[rgba(108,99,255,0.45)]"
                />
                <select
                  v-model="source.category"
                  class="rounded-md border border-white/12 bg-black/20 px-3 py-2 text-[12px] text-white/75 focus:outline-none focus:ring-2 focus:ring-[rgba(108,99,255,0.45)]"
                >
                  <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
              <div class="rounded-[6px] bg-black/30 px-[10px] py-[7px]">
                <p class="mb-1 text-[10px] text-white/28">RSS URL</p>
                <input
                  v-model="source.url"
                  type="url"
                  placeholder="https://example.com/rss.xml"
                  class="w-full bg-transparent text-[11px] text-white/50 focus:outline-none"
                />
              </div>
            </div>
          </article>

          <div
            v-if="form.sources.length === 0"
            class="rounded-[10px] border border-dashed border-white/20 px-4 py-8 text-center text-sm text-white/38"
          >
            目前沒有來源，請先新增至少一個 RSS 來源。
          </div>
        </div>
      </section>

      <!-- Notification Section -->
      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-[12px] font-medium tracking-[0.06em] text-white/45">TELEGRAM 通知</h2>
          <!-- Master Toggle -->
          <button
            class="relative h-[18px] w-[34px] rounded-[9px] transition-colors duration-150"
            :class="form.notifyEnabled ? 'bg-[#6c63ff]' : 'bg-white/10'"
            role="switch"
            :aria-checked="form.notifyEnabled"
            @click="form.notifyEnabled = !form.notifyEnabled"
          >
            <span
              class="absolute top-[2px] h-[14px] w-[14px] rounded-full transition-all duration-150"
              :class="form.notifyEnabled ? 'right-[2px] bg-white' : 'left-[2px] bg-white/65'"
            />
          </button>
        </div>

        <div
          class="space-y-4 rounded-xl border border-white/8 bg-white/[0.04] p-4"
          :class="!form.notifyEnabled && 'opacity-50 pointer-events-none'"
        >
          <p class="text-[12px] font-medium text-white/75">每日推播時間</p>
          <div class="space-y-2">
            <div
              v-for="(_, idx) in form.notifyTimes"
              :key="idx"
              class="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-2.5 transition-colors"
            >
              <!-- Clock icon -->
              <svg class="h-4 w-4 shrink-0 text-[#8b85ff]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span class="w-8 text-xs font-medium text-white/45">時段 {{ idx + 1 }}</span>
              <input
                v-model="form.notifyTimes[idx]"
                type="time"
                class="flex-1 rounded-md border border-white/12 bg-black/20 px-3 py-1.5 text-sm text-white/88 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(108,99,255,0.45)]"
              />
              <button
                class="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-[rgba(255,100,100,0.12)] hover:text-[rgba(255,100,100,0.55)]"
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
              class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-2.5 text-sm font-medium text-white/45 transition-colors hover:border-[rgba(108,99,255,0.3)] hover:bg-[rgba(108,99,255,0.1)] hover:text-[#a09aff]"
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
          class="rounded-[8px] border border-[rgba(108,99,255,0.35)] bg-[#6c63ff] px-6 py-2 text-sm font-medium text-white transition-all duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
