<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useSlots } from 'vue'

// 讓父組件可以透過 v-model:open 控制開關
const props = defineProps<{
  open?: boolean
}>()

const emit = defineEmits(['update:open'])
const slots = useSlots()
</script>

<template>
  <Dialog :open="open" @update:open="val => emit('update:open', val)">
    
    <DialogTrigger v-if="slots.trigger" as-child>
      <slot name="trigger"></slot>
    </DialogTrigger>

    <DialogContent class="sm:max-w-lg text-foreground">
      <DialogHeader>
        <DialogTitle class="text-lg font-semibold text-foreground pr-12">
          <slot name="title">提示</slot>
        </DialogTitle>
        <DialogDescription class="text-muted-foreground">
          <slot name="description"></slot>
        </DialogDescription>
      </DialogHeader>

      <div class="py-4 text-foreground">
        <slot name="content"></slot>
      </div>

      <DialogFooter v-if="slots.footer" class="gap-2 border-t pt-4">
        <slot name="footer"></slot>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>