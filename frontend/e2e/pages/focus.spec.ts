import { test, expect } from '@playwright/test'
import { mockAllApis, setAuthToken, waitForRouterReady } from '../fixtures/mock-api'

test.describe('Focus 頁面', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthToken(page)
    await mockAllApis(page)
    await page.goto('/Focus')
    await waitForRouterReady(page)
  })

  test('顯示頁面標題 "Focus Timer"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Focus Timer' })).toBeVisible()
  })

  test('初始顯示 25:00 計時', async ({ page }) => {
    await expect(page.locator('body')).toContainText('25:00')
  })

  test('初始顯示「專注中」文字', async ({ page }) => {
    await expect(page.locator('body')).toContainText('專注中')
  })

  test('初始顯示 0 個完成番茄', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/今日完成\s*0\s*個番茄/)
  })

  test('存在「開始」按鈕', async ({ page }) => {
    const startBtn = page.locator('button', { hasText: /開始|▶/ })
    await expect(startBtn.first()).toBeVisible()
  })

  test('點擊「休息」Tab 後切換為 05:00', async ({ page }) => {
    const breakTab = page.locator('button', { hasText: '休息' }).first()
    await breakTab.click()
    await expect(page.locator('body')).toContainText('05:00')
    await expect(page.locator('body')).toContainText('休息中')
  })

  test('點擊「開始」後顯示「暫停」按鈕', async ({ page }) => {
    const startBtn = page.locator('button', { hasText: /▶|開始/ }).first()
    await startBtn.click()
    await expect(page.locator('button', { hasText: /暫停|⏸/ }).first()).toBeVisible()
  })

  test('點擊「重置」後回到 25:00', async ({ page }) => {
    const startBtn = page.locator('button', { hasText: /▶|開始/ }).first()
    await startBtn.click()
    // Wait a moment for timer to tick
    await page.waitForTimeout(1500)
    const resetBtn = page.locator('button', { hasText: /重置|↺/ }).first()
    await resetBtn.click()
    await expect(page.locator('body')).toContainText('25:00')
  })

  test('任務輸入框可輸入文字', async ({ page }) => {
    const input = page.locator('input[placeholder*="任務"]').first()
    await input.fill('撰寫測試報告')
    await expect(input).toHaveValue('撰寫測試報告')
  })

  test('顯示番茄工作法說明', async ({ page }) => {
    await expect(page.locator('body')).toContainText('番茄')
  })

  test('存在「專注」和「休息」模式 Tab', async ({ page }) => {
    await expect(page.locator('button', { hasText: /🍅|專注/ }).first()).toBeVisible()
    await expect(page.locator('button', { hasText: /☕|休息/ }).first()).toBeVisible()
  })
})
