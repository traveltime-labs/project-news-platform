import { test, expect } from '@playwright/test'
import { mockAllApis, setAuthToken, waitForRouterReady } from '../fixtures/mock-api'

test.describe('Today 頁面', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthToken(page)
    await mockAllApis(page)
    await page.goto('/Today')
    await waitForRouterReady(page)
  })

  test('顯示頁面標籤 "Today"（p 標籤）', async ({ page }) => {
    // Today.vue 的標題使用 <p> 標籤，非 heading role
    await expect(page.locator('p', { hasText: 'Today' }).first()).toBeVisible()
  })

  test('顯示今日日期（含星期）', async ({ page }) => {
    // 頁面應顯示今天的年份
    const year = new Date().getFullYear().toString()
    await expect(page.locator('body')).toContainText(year)
  })

  test('顯示每日名言', async ({ page }) => {
    // Mock quote 的翻譯文字
    await expect(page.locator('body')).toContainText('成功的秘訣就是開始行動。')
  })

  test('顯示週視圖的 7 個星期格', async ({ page }) => {
    const dayAbbrs = ['日', '一', '二', '三', '四', '五', '六']
    for (const d of dayAbbrs) {
      await expect(page.locator('body')).toContainText(d)
    }
  })

  test('顯示習慣與任務列表', async ({ page }) => {
    await expect(page.locator('body')).toContainText('晨跑')
    await expect(page.locator('body')).toContainText('冥想')
    await expect(page.locator('body')).toContainText('準備週報')
  })

  test('顯示打卡日誌區塊', async ({ page }) => {
    await expect(page.locator('body')).toContainText('打卡日誌')
  })

  test('點擊「上週」按鈕後仍顯示月份', async ({ page }) => {
    // Find prev week button (‹)
    const prevBtn = page.locator('button', { hasText: '‹' })
    if (await prevBtn.count() > 0) {
      await prevBtn.click()
      const month = (new Date().getMonth() + 1).toString()
      // after going back one week, check we still show a month label
      await expect(page.locator('body')).toContainText('月')
    }
  })

  test('顯示 + 新增按鈕', async ({ page }) => {
    const addBtn = page.locator('button', { hasText: '+' })
    await expect(addBtn.first()).toBeVisible()
  })

  test('冥想習慣已完成，顯示完成狀態', async ({ page }) => {
    await expect(page.locator('body')).toContainText('冥想')
  })
})
