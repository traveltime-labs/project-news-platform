// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'
// import { dailyService } from '@/services/daily.service'
// import type { DailyProgressDto } from '@/types'

// export const useDailyStore = defineStore('daily', () => {
//   const selectedDate = ref(new Date().toISOString().substring(0, 10))
//   const dailyData = ref<Record<string, DailyProgressDto>>({})
//   const isLoading = ref(false)

//   const currentDailyData = computed(() => dailyData.value[selectedDate.value])

//   function progressPercent(date: string): number {
//     return dailyData.value[date]?.progressPercent ?? 0
//   }

//   function setSelectedDate(date: string) {
//     selectedDate.value = date
//   }

//   async function fetchDaily(date: string): Promise<void> {
//     if (dailyData.value[date]) return
//     isLoading.value = true
//     try {
//       dailyData.value[date] = await dailyService.getDaily(date)
//     } finally {
//       isLoading.value = false
//     }
//   }

//   async function fetchDailyForce(date: string): Promise<void> {
//     isLoading.value = true
//     try {
//       dailyData.value[date] = await dailyService.getDaily(date)
//     } finally {
//       isLoading.value = false
//     }
//   }

//   async function fetchDailyRange(start: string, end: string): Promise<void> {
//     isLoading.value = true
//     try {
//       const list = await dailyService.getRange(start, end)
//       list.forEach(d => { dailyData.value[d.date] = d })
//     } finally {
//       isLoading.value = false
//     }
//   }

//   return {
//     selectedDate, dailyData, isLoading,
//     currentDailyData, progressPercent,
//     setSelectedDate, fetchDaily, fetchDailyForce, fetchDailyRange,
//   }
// })
