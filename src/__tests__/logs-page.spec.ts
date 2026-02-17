import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LogsPage from '../modules/logs/LogsPage.vue'
import { useAuthStore } from '../stores/auth'
import type { LogPage, LogQuery } from '../bridge'

// Mock data
function makeMockLogs(count: number, level?: string): LogPage {
  const items = Array.from({ length: count }, (_, i) => ({
    id: `log-${i}`,
    timestamp: Date.now() - i * 30000,
    level: (level ?? ['info', 'warn', 'error'][i % 3]) as 'info' | 'warn' | 'error',
    source: 'transaction',
    message: `测试日志消息 ${i}`,
  }))
  return { items, total: count > 20 ? 40 : count, page: 1, pageSize: 20 }
}

const getLogsMock = vi.fn<(token: string, query: LogQuery) => Promise<LogPage>>()
  .mockResolvedValue(makeMockLogs(5))

vi.mock('@/composables/useBridge', () => ({
  useBridge: () => ({
    logs: { getLogs: getLogsMock },
  }),
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}))

function mountPage() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.login('test-token')

  return mount(LogsPage, {
    global: { plugins: [pinia] },
  })
}

describe('LogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getLogsMock.mockResolvedValue(makeMockLogs(5))
  })

  describe('Initial load', () => {
    it('fetches logs on mount', async () => {
      mountPage()
      await flushPromises()

      expect(getLogsMock).toHaveBeenCalledWith('test-token', {
        level: undefined,
        keyword: undefined,
        page: 1,
        pageSize: 20,
      })
    })

    it('renders log items', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const items = wrapper.findAll('[data-testid="log-item"]')
      expect(items).toHaveLength(5)
      expect(wrapper.text()).toContain('测试日志消息 0')
    })

    it('shows total count', async () => {
      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.text()).toContain('共 5 条记录')
    })
  })

  describe('Level filter', () => {
    it('filters by info level', async () => {
      const wrapper = mountPage()
      await flushPromises()

      getLogsMock.mockResolvedValue(makeMockLogs(3, 'info'))

      await wrapper.find('[data-testid="filter-info"]').trigger('click')
      await flushPromises()

      expect(getLogsMock).toHaveBeenLastCalledWith('test-token', expect.objectContaining({
        level: 'info',
        page: 1,
      }))
    })

    it('filters by warn level', async () => {
      const wrapper = mountPage()
      await flushPromises()

      getLogsMock.mockResolvedValue(makeMockLogs(2, 'warn'))

      await wrapper.find('[data-testid="filter-warn"]').trigger('click')
      await flushPromises()

      expect(getLogsMock).toHaveBeenLastCalledWith('test-token', expect.objectContaining({
        level: 'warn',
      }))
    })

    it('filters by error level', async () => {
      const wrapper = mountPage()
      await flushPromises()

      getLogsMock.mockResolvedValue(makeMockLogs(1, 'error'))

      await wrapper.find('[data-testid="filter-error"]').trigger('click')
      await flushPromises()

      expect(getLogsMock).toHaveBeenLastCalledWith('test-token', expect.objectContaining({
        level: 'error',
      }))
    })
  })

  describe('Keyword search', () => {
    it('searches by keyword on input', async () => {
      const wrapper = mountPage()
      await flushPromises()

      getLogsMock.mockResolvedValue(makeMockLogs(1))

      const input = wrapper.find('[data-testid="keyword-input"]')
      await input.setValue('交易')
      await flushPromises()

      expect(getLogsMock).toHaveBeenLastCalledWith('test-token', expect.objectContaining({
        keyword: '交易',
        page: 1,
      }))
    })
  })

  describe('Pagination', () => {
    it('shows pagination when total > pageSize', async () => {
      getLogsMock.mockResolvedValue({
        items: makeMockLogs(20).items,
        total: 40,
        page: 1,
        pageSize: 20,
      })

      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('1 / 2')
    })

    it('hides pagination when all items fit one page', async () => {
      getLogsMock.mockResolvedValue(makeMockLogs(5))

      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.find('[data-testid="pagination"]').exists()).toBe(false)
    })

    it('navigates to next page', async () => {
      getLogsMock.mockResolvedValue({
        items: makeMockLogs(20).items,
        total: 40,
        page: 1,
        pageSize: 20,
      })

      const wrapper = mountPage()
      await flushPromises()

      getLogsMock.mockResolvedValue({
        items: makeMockLogs(20).items,
        total: 40,
        page: 2,
        pageSize: 20,
      })

      const nextBtn = wrapper.findAll('[data-testid="pagination"] button').find((b) => b.text() === '下一页')
      expect(nextBtn).toBeDefined()
      await nextBtn!.trigger('click')
      await flushPromises()

      expect(getLogsMock).toHaveBeenLastCalledWith('test-token', expect.objectContaining({
        page: 2,
      }))
    })
  })

  describe('Empty state', () => {
    it('shows empty message when no logs', async () => {
      getLogsMock.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 })

      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.text()).toContain('暂无日志记录')
    })
  })
})
