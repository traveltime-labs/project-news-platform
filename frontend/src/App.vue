<script lang="ts" setup>
import AppLayout from '@/components/AppLayout.vue'
import AppToast from '@/components/AppToast.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const showLayout = computed(() => !(route.meta.hideLayout === true))
</script>

<template>
  <AppLayout v-if="showLayout">
    <router-view />
  </AppLayout>

  <router-view v-else />

  <AppToast />
</template>