import { test, expect } from '@playwright/test'
import { mockAllApis, setAuthToken, waitForRouterReady } from '../fixtures/mock-api'

test.describe('Calendar 頁面', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthToken(page)
    await mockAllApis(page)
    await page.goto('/Calendar')
    await waitForRouterReady(page)
  })

  test('頁面成功載入，不顯示錯誤', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('Error')
    await expect(page.locator('body')).not.toContainText('404')
  })

  test('顯示年份標籤', async ({ page }) => {
    const year = new Date().getFullYear().toString()
    await expect(page.locator('body')).toContainText(year)
  })

  test('週視圖顯示 7 個星期縮寫', async ({ page }) => {
    const dayAbbrs = ['日', '一', '二', '三', '四', '五', '六']
    for (const d of dayAbbrs) {
      await expect(page.locator('body')).toContainText(d)
    }
  })

  test('存在「今天」按鈕', async ({ page }) => {
    const todayBtn = page.locator('button', { hasText: '今天' })
    await expect(todayBtn).toBeVisible()
  })

  test('存在週/月視圖切換按鈕', async ({ page }) => {
    const weekBtn = page.locator('button', { hasText: '週' })
    const monthBtn = page.locator('button', { hasText: '月' })
    await expect(weekBtn.or(monthBtn).first()).toBeVisible()
  })

  test('切換到月視圖後仍顯示月份', async ({ page }) => {
    const monthBtn = page.locator('button', { hasText: '月' })
    if (await monthBtn.count() > 0) {
      await monthBtn.click()
    }
    const currentMonth = (new Date().getMonth() + 1).toString()
    await expect(page.locator('body')).toContainText(`${currentMonth} 月`)
  })

  test('點擊下一期按鈕後頁面不崩潰', async ({ page }) => {
    const nextBtn = page.locator('button', { hasText: '›' })
    if (await nextBtn.count() > 0) {
      await nextBtn.click()
      await expect(page.locator('body')).toContainText('月')
    }
  })

  test('點擊「今天」後顯示本月', async ({ page }) => {
    // First go to next period
    const nextBtn = page.locator('button', { hasText: '›' })
    if (await nextBtn.count() > 0) {
      await nextBtn.click()
    }
    // Come back to today
    const todayBtn = page.locator('button', { hasText: '今天' })
    await todayBtn.click()
    const year = new Date().getFullYear().toString()
    await expect(page.locator('body')).toContainText(year)
  })
})
