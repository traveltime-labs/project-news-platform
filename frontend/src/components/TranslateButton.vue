<script setup lang="ts">
defineProps<{
  newsId: string
  isTranslating: boolean
  hasTranslation: boolean
  showTranslated: boolean
}>()

const emit = defineEmits<{
  translate: [newsId: string]
  toggle: []
}>()
</script>

<template>
  <button
    v-if="!hasTranslation"
    :disabled="isTranslating"
    class="inline-flex items-center gap-1 rounded-md border border-white/10 bg-transparent px-2 py-[3px] text-[10px] text-white/22 transition-all duration-150 hover:bg-white/5 hover:text-white/40 disabled:cursor-not-allowed disabled:opacity-50"
    @click.prevent="emit('translate', newsId)"
  >
    <span
      v-if="isTranslating"
      class="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
    <span v-else>🌐</span>
    {{ isTranslating ? '翻譯中…' : '翻譯' }}
  </button>

  <button
    v-else
    class="inline-flex items-center gap-1 rounded-md border border-white/10 bg-transparent px-2 py-[3px] text-[10px] text-white/22 transition-all duration-150 hover:bg-white/5 hover:text-white/40"
    @click.prevent="emit('toggle')"
  >
    {{ showTranslated ? '看原文' : '看譯文' }}
  </button>
</template>
