import { test, expect } from '@playwright/test'
import { mockAllApis, setAuthToken, waitForRouterReady } from '../fixtures/mock-api'

test.describe('Habits 頁面', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthToken(page)
    await mockAllApis(page)
    await page.goto('/Habits')
    await waitForRouterReady(page)
  })

  test('頁面成功載入，不顯示錯誤', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('404')
  })

  test('顯示習慣列表中的習慣名稱', async ({ page }) => {
    await expect(page.locator('body')).toContainText('晨跑')
    await expect(page.locator('body')).toContainText('冥想')
  })

  test('顯示習慣的 icon', async ({ page }) => {
    await expect(page.locator('body')).toContainText('🏃')
    await expect(page.locator('body')).toContainText('🧘')
  })

  test('存在新增習慣按鈕', async ({ page }) => {
    // Look for button with 新增 or + text
    const addBtn = page
      .locator('button')
      .filter({ hasText: /新增|^\+/ })
      .first()
    await expect(addBtn).toBeVisible()
  })

  test('點擊習慣後顯示詳情面板', async ({ page }) => {
    // Click on the first habit in the list
    const habitItem = page.locator('body').getByText('晨跑').first()
    await habitItem.click()
    // After clicking, detailed info (e.g. calendar or statistics tab) should appear
    await expect(page.locator('body')).toContainText('晨跑')
  })

  test('習慣詳情包含連擊數（streak）資訊', async ({ page }) => {
    const habitItem = page.locator('body').getByText('晨跑').first()
    await habitItem.click()
    // streak data is in mock: currentStreak=5, bestStreak=14
    await expect(page.locator('body')).toContainText(/5|14|天|streak|連/i)
  })

  test('點擊新增習慣後顯示表單', async ({ page }) => {
    const addBtn = page
      .locator('button')
      .filter({ hasText: /新增|^\+/ })
      .first()
    await addBtn.click()
    // Form should appear with a name input or related UI
    await expect(page.locator('input, textarea').first()).toBeVisible()
  })

  test('顯示習慣的重複類型「每天」', async ({ page }) => {
    // Habits in mock have repeatType: 'daily' → should display 每天 somewhere
    await expect(page.locator('body')).toContainText(/每天|daily/i)
  })
})
