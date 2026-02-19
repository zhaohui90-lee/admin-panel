import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../stores/auth'
import DashboardPage from '../modules/dashboard/DashboardPage.vue'

// Mock the bridge so device store doesn't make real calls
vi.mock('../bridge', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../bridge')>()
  return {
    ...actual,
    getBridge: () => ({
      system: {
        getSystemInfo: vi.fn().mockResolvedValue({
          cpu: { model: 'Test CPU', usage: 42 },
          memory: { total: 8 * 1024 ** 3, used: 2 * 1024 ** 3 },
          disk: { total: 256 * 1024 ** 3, used: 100 * 1024 ** 3 },
          network: { ip: '10.0.0.1', latency: 18 },
          os: { platform: 'linux', version: 'Ubuntu 22.04', uptime: 86400 },
        }),
        getConfig: vi.fn().mockResolvedValue({
          serverUrl: 'http://hospital-server:8080',
          deviceId: 'KIOSK-MZ-082',
          version: '2.4.0',
        }),
      },
      power: {
        restartApp:  vi.fn().mockResolvedValue(undefined),
        quitApp:     vi.fn().mockResolvedValue(undefined),
        rebootOS:    vi.fn().mockResolvedValue(undefined),
        shutdownOS:  vi.fn().mockResolvedValue(undefined),
      },
      business: {
        reloadPage: vi.fn().mockResolvedValue(undefined),
      },
    }),
  }
})

// Mock toast to avoid side effects
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }),
}))

function mountPage() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.login('test-token')

  return mount(DashboardPage, {
    global: {
      plugins: [pinia],
      stubs: {
        VirtualKeyboard: true,
        // ConfirmDialog uses Teleport – stub to keep tests simple
        ConfirmDialog: {
          props: ['visible', 'title', 'message', 'loading', 'confirmText'],
          emits: ['confirm', 'cancel'],
          template: `
            <div v-if="visible" data-testid="confirm-dialog">
              <div data-testid="confirm-title">{{ title }}</div>
              <div data-testid="confirm-message">{{ message }}</div>
              <button data-testid="confirm-ok" @click="$emit('confirm')">确认</button>
              <button data-testid="confirm-cancel" @click="$emit('cancel')">取消</button>
            </div>
          `,
        },
      },
    },
  })
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Status cards', () => {
    it('renders three status cards', async () => {
      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.find('[data-testid="card-transactions"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="card-latency"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="card-cpu"]').exists()).toBe(true)
    })

    it('shows network latency from device store', async () => {
      const wrapper = mountPage()
      await flushPromises()

      // networkLatency = 18 from mock
      expect(wrapper.find('[data-testid="latency-value"]').text()).toContain('18ms')
    })

    it('shows CPU usage from device store', async () => {
      const wrapper = mountPage()
      await flushPromises()

      // cpuUsage = 42 from mock
      expect(wrapper.find('[data-testid="card-cpu"]').text()).toContain('42%')
    })

    it('shows today transactions card', async () => {
      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.find('[data-testid="card-transactions"]').text()).toContain('1,284')
    })
  })

  describe('Hardware list', () => {
    it('renders 4 hardware items', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const items = wrapper.findAll('[data-testid="hw-item"]')
      expect(items).toHaveLength(4)
    })

    it('shows hardware device names', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const list = wrapper.find('[data-testid="hw-list"]')
      expect(list.text()).toContain('凭条打印机')
      expect(list.text()).toContain('医保卡读卡器')
      expect(list.text()).toContain('发卡模块')
      expect(list.text()).toContain('人脸识别相机')
    })

    it('shows status labels for each device', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const list = wrapper.find('[data-testid="hw-list"]')
      expect(list.text()).toContain('建议补充') // warning
      expect(list.text()).toContain('就绪')      // online
      expect(list.text()).toContain('故障')      // error
    })
  })

  describe('Action buttons', () => {
    it('renders 5 action buttons', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const section = wrapper.find('[data-testid="action-buttons"]')
      const buttons = section.findAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(5)
    })

    it('all 5 action button data-testids exist', async () => {
      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.find('[data-testid="btn-reload-page"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="btn-restart-app"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="btn-reboot-os"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="btn-quit-app"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="btn-shutdown-os"]').exists()).toBe(true)
    })

    it('clicking reload page button opens confirm dialog', async () => {
      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(false)
      await wrapper.find('[data-testid="btn-reload-page"]').trigger('click')

      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="confirm-title"]').text()).toContain('刷新业务页面')
    })

    it('clicking restart app button shows correct confirm title', async () => {
      const wrapper = mountPage()
      await flushPromises()

      await wrapper.find('[data-testid="btn-restart-app"]').trigger('click')
      expect(wrapper.find('[data-testid="confirm-title"]').text()).toContain('重启客户端')
    })

    it('clicking shutdown OS button shows correct confirm title', async () => {
      const wrapper = mountPage()
      await flushPromises()

      await wrapper.find('[data-testid="btn-shutdown-os"]').trigger('click')
      expect(wrapper.find('[data-testid="confirm-title"]').text()).toContain('关闭自助机')
    })

    it('clicking confirm cancel closes the dialog', async () => {
      const wrapper = mountPage()
      await flushPromises()

      await wrapper.find('[data-testid="btn-reload-page"]').trigger('click')
      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true)

      await wrapper.find('[data-testid="confirm-cancel"]').trigger('click')
      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(false)
    })
  })

  describe('Server URL', () => {
    it('displays server URL from config after mount', async () => {
      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.find('[data-testid="url-display"]').text()).toContain('hospital-server:8080')
    })

    it('shows device ID in page header', async () => {
      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.text()).toContain('KIOSK-MZ-082')
    })

    it('clicking 修改 enters edit mode', async () => {
      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.find('[data-testid="url-edit-mode"]').exists()).toBe(false)
      await wrapper.find('[data-testid="btn-edit-url"]').trigger('click')

      expect(wrapper.find('[data-testid="url-edit-mode"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="url-display"]').exists()).toBe(false)
    })

    it('cancelling edit returns to display mode', async () => {
      const wrapper = mountPage()
      await flushPromises()

      await wrapper.find('[data-testid="btn-edit-url"]').trigger('click')
      expect(wrapper.find('[data-testid="url-edit-mode"]').exists()).toBe(true)

      // Find and click 取消 button in edit section
      const editSection = wrapper.find('[data-testid="url-edit-mode"]')
      const cancelBtn = editSection.findAll('button').find(b => b.text().includes('取消'))
      await cancelBtn!.trigger('click')

      expect(wrapper.find('[data-testid="url-display"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="url-edit-mode"]').exists()).toBe(false)
    })
  })

  describe('Hardware error codes (Phase 16)', () => {
    it('shows structured error code badge for error-status device', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const errorBadge = wrapper.find('[data-testid="hw-error-code"]')
      expect(errorBadge.exists()).toBe(true)
      expect(errorBadge.text()).toBe('E02')
    })

    it('does not show error code badge for non-error devices', async () => {
      const wrapper = mountPage()
      await flushPromises()

      // Only 1 device has error status with errorCode
      const errorBadges = wrapper.findAll('[data-testid="hw-error-code"]')
      expect(errorBadges).toHaveLength(1)
    })
  })
})
