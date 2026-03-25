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
    class="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
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
    class="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    @click.prevent="emit('toggle')"
  >
    {{ showTranslated ? '看原文' : '看譯文' }}
  </button>
</template>
