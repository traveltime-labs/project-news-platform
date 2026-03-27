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
    class="flex h-6 w-6 items-center justify-center rounded-full transition-all duration-150 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50"
    :aria-label="bookmarked ? '取消收藏' : '加入收藏'"
    @click.prevent="emit('toggle')"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      class="h-[13px] w-[13px] transition-colors duration-150"
      :class="bookmarked ? 'fill-[#f26b8a] stroke-[#f26b8a]' : 'fill-none stroke-white/30 hover:stroke-white/55'"
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
