import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginPage from '../modules/login/LoginPage.vue'

// Mock vue-router
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

// Mock bridge
const loginMock = vi.fn()
vi.mock('@/composables/useBridge', () => ({
  useBridge: () => ({
    auth: { login: loginMock },
  }),
}))

function mountPage() {
  return mount(LoginPage, {
    global: {
      plugins: [createPinia()],
      stubs: {
        StatusBulb: { template: '<div data-testid="status-bulb" />' },
        Teleport: true,
      },
    },
  })
}

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    pushMock.mockReset()
    loginMock.mockReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Tab switching', () => {
    it('defaults to password mode', () => {
      const wrapper = mountPage()
      expect(wrapper.find('[data-testid="mode-password"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="mode-card"]').exists()).toBe(false)
    })

    it('switches to card mode when tab-card is clicked', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-card"]').trigger('click')
      expect(wrapper.find('[data-testid="mode-card"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="mode-password"]').exists()).toBe(false)
    })

    it('switches back to password mode from card mode', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-card"]').trigger('click')
      await wrapper.find('[data-testid="tab-password"]').trigger('click')
      expect(wrapper.find('[data-testid="mode-password"]').exists()).toBe(true)
    })

    it('active tab has correct styles', () => {
      const wrapper = mountPage()
      const passwordTab = wrapper.find('[data-testid="tab-password"]')
      expect(passwordTab.classes()).toContain('bg-white')
      expect(passwordTab.classes()).toContain('text-blue-600')
    })

    it('clears password and error when switching to card mode', async () => {
      const wrapper = mountPage()
      const vm = wrapper.vm as unknown as { password: string; error: string }

      vm.password = 'test123'
      vm.error = 'some error'
      await wrapper.vm.$nextTick()

      await wrapper.find('[data-testid="tab-card"]').trigger('click')
      expect(vm.password).toBe('')
      expect(vm.error).toBe('')
    })
  })

  describe('Password login form', () => {
    it('renders staff ID and password inputs', () => {
      const wrapper = mountPage()
      expect(wrapper.find('[data-testid="input-staff-id"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="input-password"]').exists()).toBe(true)
    })

    it('login button is disabled when fields are empty', () => {
      const wrapper = mountPage()
      const btn = wrapper.find('[data-testid="btn-login"]')
      expect((btn.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('login button is enabled when both fields are filled', async () => {
      const wrapper = mountPage()
      const vm = wrapper.vm as unknown as { staffId: string; password: string }

      vm.staffId = 'EMP001'
      vm.password = '123456'
      await wrapper.vm.$nextTick()

      const btn = wrapper.find('[data-testid="btn-login"]')
      expect((btn.element as HTMLButtonElement).disabled).toBe(false)
    })

    it('shows success popup on successful login', async () => {
      loginMock.mockResolvedValue({ success: true, token: 'test-token' })
      const wrapper = mountPage()
      const vm = wrapper.vm as unknown as { staffId: string; password: string; showSuccess: boolean }

      vm.staffId = 'EMP001'
      vm.password = '123456'
      await wrapper.vm.$nextTick()

      await wrapper.find('[data-testid="btn-login"]').trigger('click')

      // Wait for async login
      await vi.waitFor(() => {
        expect(vm.showSuccess).toBe(true)
      })
    })

    it('navigates to dashboard after successful login', async () => {
      loginMock.mockResolvedValue({ success: true, token: 'test-token' })
      const wrapper = mountPage()
      const vm = wrapper.vm as unknown as { staffId: string; password: string }

      vm.staffId = 'EMP001'
      vm.password = '123456'
      await wrapper.vm.$nextTick()

      await wrapper.find('[data-testid="btn-login"]').trigger('click')
      await vi.waitFor(() => expect(loginMock).toHaveBeenCalled())

      vi.advanceTimersByTime(2000)
      expect(pushMock).toHaveBeenCalledWith('/dashboard')
    })

    it('shows error on failed login', async () => {
      loginMock.mockResolvedValue({ success: false })
      const wrapper = mountPage()
      const vm = wrapper.vm as unknown as { staffId: string; password: string; error: string }

      vm.staffId = 'EMP001'
      vm.password = 'wrong'
      await wrapper.vm.$nextTick()

      await wrapper.find('[data-testid="btn-login"]').trigger('click')

      await vi.waitFor(() => {
        expect(vm.error).toBe('密码错误，请重试')
      })
    })

    it('shows error on login exception', async () => {
      loginMock.mockRejectedValue(new Error('Network error'))
      const wrapper = mountPage()
      const vm = wrapper.vm as unknown as { staffId: string; password: string; error: string }

      vm.staffId = 'EMP001'
      vm.password = '123456'
      await wrapper.vm.$nextTick()

      await wrapper.find('[data-testid="btn-login"]').trigger('click')

      await vi.waitFor(() => {
        expect(vm.error).toBe('登录失败，请稍后重试')
      })
    })

    it('toggles password visibility', async () => {
      const wrapper = mountPage()
      const input = wrapper.find('[data-testid="input-password"]')
      expect(input.attributes('type')).toBe('password')

      await wrapper.find('[data-testid="toggle-password"]').trigger('click')
      expect(input.attributes('type')).toBe('text')

      await wrapper.find('[data-testid="toggle-password"]').trigger('click')
      expect(input.attributes('type')).toBe('password')
    })

    it('shows clear button when staff ID has value', async () => {
      const wrapper = mountPage()
      expect(wrapper.find('[data-testid="clear-staff-id"]').exists()).toBe(false)

      const vm = wrapper.vm as unknown as { staffId: string }
      vm.staffId = 'EMP001'
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="clear-staff-id"]').exists()).toBe(true)
    })

    it('clears staff ID when clear button is clicked', async () => {
      const wrapper = mountPage()
      const vm = wrapper.vm as unknown as { staffId: string }
      vm.staffId = 'EMP001'
      await wrapper.vm.$nextTick()

      await wrapper.find('[data-testid="clear-staff-id"]').trigger('click')
      expect(vm.staffId).toBe('')
    })

    it('shows status hints', async () => {
      const wrapper = mountPage()
      expect(wrapper.text()).toContain('工号未填写')
      expect(wrapper.text()).toContain('密码未填写')

      const vm = wrapper.vm as unknown as { staffId: string; password: string }
      vm.staffId = 'EMP001'
      vm.password = 'abc'
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('工号已填写')
      expect(wrapper.text()).toContain('已输入 3 位')
    })
  })

  describe('Card login', () => {
    it('renders NFC zone in card mode', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-card"]').trigger('click')
      expect(wrapper.find('[data-testid="nfc-zone"]').exists()).toBe(true)
    })

    it('shows waiting status by default', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-card"]').trigger('click')
      expect(wrapper.text()).toContain('请将员工卡靠近感应区')
    })

    it('transitions to reading state on click', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-card"]').trigger('click')

      await wrapper.find('[data-testid="nfc-zone"]').trigger('click')
      const vm = wrapper.vm as unknown as { cardStatus: string }
      expect(vm.cardStatus).toBe('reading')
    })

    it('shows card number input', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-card"]').trigger('click')
      expect(wrapper.find('[data-testid="input-card-number"]').exists()).toBe(true)
    })
  })

  describe('Session timeout', () => {
    it('shows timeout overlay after 5 minutes idle', async () => {
      const wrapper = mountPage()
      const vm = wrapper.vm as unknown as { showTimeout: boolean }

      expect(vm.showTimeout).toBe(false)
      vi.advanceTimersByTime(5 * 60 * 1000)
      expect(vm.showTimeout).toBe(true)
    })

    it('resets form on timeout dismiss', async () => {
      const wrapper = mountPage()
      const vm = wrapper.vm as unknown as {
        staffId: string
        password: string
        showTimeout: boolean
      }

      vm.staffId = 'EMP001'
      vm.password = 'test'
      vm.showTimeout = true
      await wrapper.vm.$nextTick()

      // Call dismissTimeout directly since Teleport is stubbed
      ;(wrapper.vm as unknown as { dismissTimeout: () => void }).dismissTimeout()
      await wrapper.vm.$nextTick()

      expect(vm.staffId).toBe('')
      expect(vm.password).toBe('')
      expect(vm.showTimeout).toBe(false)
    })
  })

  describe('Component structure', () => {
    it('renders StatusBulb component', () => {
      const wrapper = mountPage()
      expect(wrapper.find('[data-testid="status-bulb"]').exists()).toBe(true)
    })

    it('renders welcome heading', () => {
      const wrapper = mountPage()
      expect(wrapper.text()).toContain('员工身份验证')
    })

    it('renders footer', () => {
      const wrapper = mountPage()
      expect(wrapper.text()).toContain('IT 服务台')
      expect(wrapper.text()).toContain('© 2025')
    })
  })
})
