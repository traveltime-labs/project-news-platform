<script setup lang="ts">
defineProps<{
  bookmarked: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    :disabled="loading"
    class="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-rose-950"
    :aria-label="bookmarked ? '取消收藏' : '加入收藏'"
    @click.prevent="emit('toggle')"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class="h-4 w-4 transition-colors"
      :class="bookmarked ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-muted-foreground hover:stroke-rose-400'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  </button>
</template>
