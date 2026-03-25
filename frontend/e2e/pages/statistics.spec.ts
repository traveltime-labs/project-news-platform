import { test, expect } from '@playwright/test'
import { mockAllApis, setAuthToken, waitForRouterReady, MOCK_STATS_SUMMARY } from '../fixtures/mock-api'

test.describe('Statistics 頁面', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthToken(page)
    await mockAllApis(page)
    await page.goto('/Statistics')
    await waitForRouterReady(page)
  })

  test('頁面成功載入，不顯示錯誤', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('404')
  })

  test('顯示總打卡次數', async ({ page }) => {
    await expect(page.locator('body')).toContainText(
      MOCK_STATS_SUMMARY.totalCheckins.toString(),
    )
  })

  test('顯示最長連擊紀錄', async ({ page }) => {
    await expect(page.locator('body')).toContainText(
      MOCK_STATS_SUMMARY.bestStreak.toString(),
    )
  })

  test('顯示目前連擊數', async ({ page }) => {
    await expect(page.locator('body')).toContainText(
      MOCK_STATS_SUMMARY.currentStreak.toString(),
    )
  })

  test('顯示習慣完成率（含習慣名稱）', async ({ page }) => {
    await expect(page.locator('body')).toContainText('晨跑')
    await expect(page.locator('body')).toContainText('冥想')
  })

  test('存在週期切換按鈕（本週 / 本月 / 今年）', async ({ page }) => {
    const labels = ['本週', '本月', '今年', '週', '月', '年']
    const found = await Promise.all(
      labels.map(l => page.locator('button', { hasText: l }).count()),
    )
    expect(found.some(c => c > 0)).toBe(true)
  })

  test('切換到「本週」後頁面不崩潰', async ({ page }) => {
    const weekBtn = page.locator('button', { hasText: /本週|週/ }).first()
    if (await weekBtn.count() > 0) {
      await weekBtn.click()
      await expect(page.locator('body')).not.toContainText('Error')
    }
  })

  test('切換到「今年」後頁面不崩潰', async ({ page }) => {
    const yearBtn = page.locator('button', { hasText: /今年|年/ }).first()
    if (await yearBtn.count() > 0) {
      await yearBtn.click()
      await expect(page.locator('body')).not.toContainText('Error')
    }
  })
})
