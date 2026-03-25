import { test } from '@playwright/test'

test('debug with router ready', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'mock-test-token')
  })

  await page.goto('http://localhost:5173/Habits')
  await page.waitForLoadState('networkidle')
  
  // Wait for router to be ready
  const routeInfo = await page.evaluate(async () => {
    const el = document.querySelector('#app') as any
    const app = el?.__vue_app__
    if (!app) return { error: 'no app' }
    const router = app.config.globalProperties.$router
    if (!router) return { error: 'no router' }
    
    // Wait for router to finish initial navigation
    await router.isReady()
    
    return {
      currentPath: router.currentRoute.value.path,
      matched: router.currentRoute.value.matched.map((m: any) => ({ path: m.path, name: m.name })),
    }
  })
  
  console.log('Route info after isReady:', JSON.stringify(routeInfo))
  console.log('Page URL:', page.url())
  
  // Check sections
  const sec = await page.locator('section, main > div > *').count()
  console.log('Content elements:', sec)
  
  const body = await page.locator('body').textContent()
  console.log('Has "My Habits":', body?.includes('My Habits'))
  console.log('Has Skeleton class:', (await page.locator('[class*="animate-pulse"]').count()) > 0)
})
