<script setup lang="ts">
import { Newspaper, Bookmark, Settings } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const route = useRoute()

const items = [
  { title: '新聞牆',   url: '/',           icon: Newspaper },
  { title: '收藏',     url: '/bookmarks',  icon: Bookmark },
  { title: '控制面板', url: '/settings',   icon: Settings },
]
</script>
<template>
  <Sidebar class="border-r border-white/8 bg-[#14142a]">
    <SidebarHeader class="border-b border-white/8 px-4 py-[14px]">
      <div class="flex items-center gap-2.5">
        <div class="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-[#6c63ff]">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3.5h10M3 8h10M3 12.5h6" stroke="rgba(255,255,255,0.92)" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>
        <p class="text-[13px] font-medium tracking-[0.02em] text-white/90">News Tracker</p>
      </div>
    </SidebarHeader>
    <SidebarContent class="px-3 py-3">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu class="gap-1">
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton
                as-child
                :is-active="route.path.toLowerCase() === item.url.toLowerCase()"
                class="h-auto rounded-[8px] px-3 py-[9px] text-[13px] text-white/35 hover:bg-white/5 hover:text-white/80 data-[active=true]:bg-[rgba(108,99,255,0.18)] data-[active=true]:font-medium data-[active=true]:text-[#c5c0ff]"
              >
                <RouterLink :to="item.url">
                  <component :is="item.icon" class="h-4 w-4" />
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
