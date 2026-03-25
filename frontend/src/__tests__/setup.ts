import { vi } from 'vitest'

// ── Mock echarts（jsdom 不支援 Canvas/WebGL）──────────────────────────────
const mockChartInstance = {
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
}

vi.mock('echarts', () => ({
  init: vi.fn(() => mockChartInstance),
}))

// ── Mock ResizeObserver（jsdom 未內建）──────────────────────────────────────
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
