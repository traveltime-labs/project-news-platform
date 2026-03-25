<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

const typeClasses: Record<string, string> = {
  success: 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  error: 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  info: 'border-border bg-background text-foreground',
}
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex max-w-xs items-start gap-2 rounded-lg border p-3 text-sm shadow-lg"
          :class="typeClasses[toast.type]"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button
            class="shrink-0 opacity-60 hover:opacity-100"
            @click="dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
