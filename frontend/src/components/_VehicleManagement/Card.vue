<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { VehicleItem } from '@/assets/apis/vehicles'

const props = defineProps<{
  item: VehicleItem
}>()

const emit = defineEmits<{
  (e: 'edit', item: VehicleItem): void
  (e: 'delete', plate: string): void
}>()
</script>

<template>
  <Card class="w-full max-w-sm overflow-hidden border-t-4" 
        :class="item.vehicleType === 'Car' ? 'border-t-blue-500' : 'border-t-orange-500'">
    <CardHeader class="pb-2">
      <div class="flex justify-between items-start">
        <div>
          <CardTitle class="text-xl font-bold">{{ item.licensePlate }}</CardTitle>
          <p class="text-sm text-muted-foreground">{{ item.brand }} {{ item.modelName }}</p>
        </div>
        <span class="px-2 py-1 text-xs rounded-full bg-slate-100 font-medium">
          {{ item.vehicleType === 'Car' ? '🚗 汽車' : '🛵 機車' }}
        </span>
      </div>
    </CardHeader>

    <CardContent class="text-sm space-y-2">
      <div class="grid grid-cols-2 gap-2 border-b pb-2 mb-2">
        <div>
          <p class="text-gray-400 text-xs">動力/能源</p>
          <p class="font-medium">{{ item.energyType || '-' }}</p>
        </div>
        <div v-if="item.vehicleType === 'Car'">
          <p class="text-gray-400 text-xs">排氣量</p>
          <p class="font-medium">{{ item.displacement || 'N/A' }}</p>
        </div>
        <div v-else>
          <p class="text-gray-400 text-xs">牌色等級</p>
          <p class="font-medium">{{ item.plateColor || '白牌' }}</p>
        </div>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-500 text-xs">目前里程：</span>
        <span class="font-mono text-xs">{{ item.currentMileage?.toLocaleString() }} km</span>
      </div>
    </CardContent>

    <CardFooter class="flex gap-2 pt-0">
      <Button variant="outline" class="flex-1 h-9" @click="emit('edit', item)">
        編輯
      </Button>
      <Button variant="destructive" class="flex-1 h-9" @click="emit('delete', item.licensePlate)">
        刪除
      </Button>
    </CardFooter>
  </Card>
</template>