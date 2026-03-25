<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { RouterLink, useRoute } from 'vue-router'
import { Newspaper, Bookmark, Settings } from 'lucide-vue-next'

const route = useRoute()
const navItems = [
  { title: '新聞牆',   url: '/',           icon: Newspaper },
  { title: '收藏',     url: '/bookmarks',  icon: Bookmark },
  { title: '控制面板', url: '/settings',   icon: Settings },
]
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <main class="m-4 w-full pb-24 md:pb-4">
      <SidebarTrigger class="hidden md:flex" />
      <div class="py-4">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-border bg-background md:hidden">
      <RouterLink
        v-for="item in navItems"
        :key="item.title"
        :to="item.url"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-muted-foreground transition-colors"
        :class="route.path.toLowerCase() === item.url.toLowerCase() ? 'text-foreground' : 'hover:text-foreground'"
      >
        <div
          class="flex h-7 w-7 items-center justify-center rounded-xl transition-colors"
          :class="route.path.toLowerCase() === item.url.toLowerCase() ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : ''"
        >
          <component :is="item.icon" class="h-[17px] w-[17px]" />
        </div>
        <span class="text-[9px] font-medium leading-none">{{ item.title }}</span>
      </RouterLink>
    </nav>
  </SidebarProvider>
</template>

