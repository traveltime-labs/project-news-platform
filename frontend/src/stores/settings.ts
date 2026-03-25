import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchSettings, updateSettings } from '@/api/sheets'
import type { NewsSettings } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<NewsSettings | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)

  async function load() {
    isLoading.value = true
    try {
      const res = await fetchSettings()
      settings.value = res.data
    } finally {
      isLoading.value = false
    }
  }

  async function save(newSettings: NewsSettings): Promise<void> {
    isSaving.value = true
    try {
      await updateSettings(newSettings)
      settings.value = newSettings
    } finally {
      isSaving.value = false
    }
  }

  return { settings, isLoading, isSaving, load, save }
})
