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
    <main class="flex min-h-svh w-full flex-col pb-20 md:pb-0">
      <header class="sticky top-0 z-20 flex h-[53px] items-center border-b border-white/6 px-5 backdrop-blur-md">
        <SidebarTrigger class="h-7 w-7" />
      </header>
      <div class="px-5 py-4">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-white/10 bg-[#0f0f1a]/95 backdrop-blur md:hidden">
      <RouterLink
        v-for="item in navItems"
        :key="item.title"
        :to="item.url"
        class="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-white/45 transition-colors"
        :class="route.path.toLowerCase() === item.url.toLowerCase() ? 'text-[#c5c0ff]' : 'hover:text-white/80'"
      >
        <div
          class="flex h-7 w-7 items-center justify-center rounded-xl transition-colors"
          :class="route.path.toLowerCase() === item.url.toLowerCase() ? 'bg-[rgba(108,99,255,0.18)] text-[#c5c0ff]' : ''"
        >
          <component :is="item.icon" class="h-[17px] w-[17px]" />
        </div>
        <span class="text-[9px] font-medium leading-none">{{ item.title }}</span>
      </RouterLink>
    </nav>
  </SidebarProvider>
</template>

