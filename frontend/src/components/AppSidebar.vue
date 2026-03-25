<script setup lang="ts">
import { Newspaper, Bookmark, Settings } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const items = [
  { title: '新聞牆',   url: '/',           icon: Newspaper },
  { title: '收藏',     url: '/bookmarks',  icon: Bookmark },
  { title: '控制面板', url: '/settings',   icon: Settings },
]
</script>
<template>
  <Sidebar>
     <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>News Tracker</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton as-child>
                <RouterLink :to="item.url">
                  <component :is="item.icon" />
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
