import type { Page, Route } from '@playwright/test'

// ─── Mock payloads ────────────────────────────────────────────────────────────

export const TODAY_KEY = new Date().toISOString().substring(0, 10)

export const MOCK_DAILY_PROGRESS = {
  date: TODAY_KEY,
  items: [
    {
      type: 'habit',
      habitId: 'h1',
      name: '晨跑',
      icon: '🏃',
      color: '#3B82F6',
      checkType: 'boolean',
      unit: null,
      targetValue: null,
      currentStreak: 5,
      status: 'pending',
      value: null,
      mood: null,
      note: null,
    },
    {
      type: 'habit',
      habitId: 'h2',
      name: '冥想',
      icon: '🧘',
      color: '#10B981',
      checkType: 'boolean',
      unit: null,
      targetValue: null,
      currentStreak: 3,
      status: 'completed',
      value: null,
      mood: null,
      note: null,
    },
    {
      type: 'task',
      taskId: 't1',
      name: '準備週報',
      icon: '📝',
      color: '#F59E0B',
      checkType: 'boolean',
      status: 'pending',
    },
  ],
  totalCount: 3,
  completedCount: 1,
  progressPercent: 33,
}

export const MOCK_HABITS = [
  {
    id: 'h1',
    name: '晨跑',
    color: '#3B82F6',
    icon: '🏃',
    checkType: 'boolean',
    unit: null,
    targetValue: null,
    repeatType: 'daily',
    repeatInterval: null,
    repeatDays: null,
    repeatOnType: null,
    repeatOnDates: null,
    repeatWeekOfMonth: null,
    repeatDayOfWeek: null,
    repeatMonth: null,
    repeatUseWeekday: false,
    endType: 'never',
    endDate: null,
    endCount: null,
    executedCount: 10,
    currentStreak: 5,
    bestStreak: 14,
    startDate: '2025-01-01',
    reminderTime: null,
    sortOrder: 0,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'h2',
    name: '冥想',
    color: '#10B981',
    icon: '🧘',
    checkType: 'boolean',
    unit: null,
    targetValue: null,
    repeatType: 'daily',
    repeatInterval: null,
    repeatDays: null,
    repeatOnType: null,
    repeatOnDates: null,
    repeatWeekOfMonth: null,
    repeatDayOfWeek: null,
    repeatMonth: null,
    repeatUseWeekday: false,
    endType: 'never',
    endDate: null,
    endCount: null,
    executedCount: 8,
    currentStreak: 3,
    bestStreak: 10,
    startDate: '2025-01-01',
    reminderTime: null,
    sortOrder: 1,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

export const MOCK_QUOTE = {
  id: 1,
  content: 'The secret of getting ahead is getting started.',
  author: 'Mark Twain',
  translation: '成功的秘訣就是開始行動。',
}

export const MOCK_STATS_SUMMARY = {
  totalCheckins: 42,
  completedDays: 30,
  perfectDays: 10,
  bestStreak: 14,
  currentStreak: 7,
}

export const MOCK_HEATMAP: Array<{ date: string; count: number }> = [
  { date: TODAY_KEY, count: 3 },
]

export const MOCK_COMPLETION_RATES = [
  {
    id: 'h1',
    name: '晨跑',
    icon: '🏃',
    color: '#3B82F6',
    completionRate: 85,
    completed: 17,
    scheduled: 20,
  },
  {
    id: 'h2',
    name: '冥想',
    icon: '🧘',
    color: '#10B981',
    completionRate: 60,
    completed: 12,
    scheduled: 20,
  },
]

export const MOCK_TASKS = [
  {
    id: 't1',
    name: '準備週報',
    color: '#F59E0B',
    icon: '📝',
    date: TODAY_KEY,
    status: 'pending',
    reminderTime: null,
    note: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

// ─── Route handlers ────────────────────────────────────────────────────────────

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
}

/**
 * Intercepts all /api/* requests and returns mock data.
 * Call this in test.beforeEach after setting up auth storage.
 *
 * NOTE: page.route() uses LIFO order — last registered = first matched.
 * Register specific sub-routes BEFORE the base route.
 */
export async function mockAllApis(page: Page) {
  // Auth
  await page.route(/\/api\/auth\/login/, route =>
    json(route, { accessToken: 'mock-token', tokenType: 'Bearer', expiresIn: 3600 }),
  )
  await page.route(/\/api\/auth\/logout/, route => json(route, {}))

  // Quotes
  await page.route(/\/api\/quotes\/today/, route => json(route, MOCK_QUOTE))

  // Daily (single date)
  await page.route(/\/api\/daily\?date=/, route =>
    json(route, MOCK_DAILY_PROGRESS),
  )
  // Daily range
  await page.route(/\/api\/daily\/range/, route =>
    json(route, [MOCK_DAILY_PROGRESS]),
  )

  // Habits – specific sub-routes first
  await page.route(/\/api\/habits\/[^/]+\/records\?/, route => json(route, []))
  await page.route(/\/api\/habits\/[^/]+\/records/, route =>
    json(route, {
      id: 'r1', habitId: 'h1', date: TODAY_KEY,
      status: 'completed', value: null, mood: null, note: null,
      currentStreak: 6, bestStreak: 14, createdAt: new Date().toISOString(),
    }),
  )
  await page.route(/\/api\/habits\/reorder/, route => json(route, {}))
  await page.route(/\/api\/habits\/[^/]+$/, route => {
    if (route.request().method() === 'GET') return json(route, MOCK_HABITS[0])
    if (route.request().method() === 'DELETE') return json(route, {})
    if (route.request().method() === 'PUT') return json(route, MOCK_HABITS[0])
    return route.continue()
  })
  // Base habits list – registered last so it's matched after all sub-routes
  await page.route(/\/api\/habits(\?.*)?$/, route => {
    if (route.request().method() === 'GET') return json(route, MOCK_HABITS)
    if (route.request().method() === 'POST') return json(route, MOCK_HABITS[0])
    return route.continue()
  })

  // Tasks – specific routes first
  await page.route(/\/api\/tasks\/[^/]+\/status/, route => json(route, { ...MOCK_TASKS[0], status: 'completed' }))
  await page.route(/\/api\/tasks\/[^/]+$/, route => json(route, MOCK_TASKS[0]))
  await page.route(/\/api\/tasks\?date=/, route => json(route, MOCK_TASKS))
  await page.route(/\/api\/tasks(\?.*)?$/, route => {
    if (route.request().method() === 'POST') return json(route, MOCK_TASKS[0])
    return route.continue()
  })

  // Statistics
  await page.route(/\/api\/statistics\/summary/, route =>
    json(route, MOCK_STATS_SUMMARY),
  )
  await page.route(/\/api\/statistics\/heatmap/, route =>
    json(route, MOCK_HEATMAP),
  )
  await page.route(/\/api\/statistics\/completion/, route =>
    json(route, MOCK_COMPLETION_RATES),
  )
}

/**
 * Sets up a fake auth token in localStorage so the router guard passes.
 */
export async function setAuthToken(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'mock-test-token')
  })
}

/**
 * Wait for Vue Router to complete its initial navigation so that the
 * page component is mounted and onMounted hooks (API calls) have fired.
 * Call this after page.goto() in beforeEach.
 */
export async function waitForRouterReady(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('#app') as any
    const app = el?.__vue_app__
    if (!app) return false
    const router = app.config?.globalProperties?.$router
    if (!router) return false
    // currentRoute path is valid (not the default empty '' state)
    return router.currentRoute.value.matched.length > 0
  }, undefined, { timeout: 15_000 })
}
