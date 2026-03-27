<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { useSidebar } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
  <button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    type="button"
    :class="cn('inline-flex h-7 w-7 items-center justify-center rounded-[6px] border border-white/12 text-white/70 transition-all duration-150 hover:bg-white/5 hover:text-white', props.class)"
    @click="toggleSidebar"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="rgba(255,255,255,0.55)" stroke-width="1.3" />
      <line x1="5.5" y1="1.5" x2="5.5" y2="14.5" stroke="rgba(255,255,255,0.55)" stroke-width="1.3" />
    </svg>
    <span class="sr-only">Toggle Sidebar</span>
  </button>
</template>
