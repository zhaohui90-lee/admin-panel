import { describe, it, expect, vi, beforeEach } from 'vitest'
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
      stubs: { VirtualKeyboard: true },
    },
  })
}

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    pushMock.mockReset()
    loginMock.mockReset()
  })

  describe('Tab switching', () => {
    it('defaults to card mode', () => {
      const wrapper = mountPage()
      expect(wrapper.find('[data-testid="mode-card"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="mode-password"]').exists()).toBe(false)
    })

    it('switches to password mode on tab click', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-password"]').trigger('click')
      expect(wrapper.find('[data-testid="mode-password"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="mode-card"]').exists()).toBe(false)
    })

    it('switches back to card mode', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-password"]').trigger('click')
      await wrapper.find('[data-testid="tab-card"]').trigger('click')
      expect(wrapper.find('[data-testid="mode-card"]').exists()).toBe(true)
    })

    it('highlights active tab', async () => {
      const wrapper = mountPage()
      const cardTab = wrapper.find('[data-testid="tab-card"]')
      expect(cardTab.classes()).toContain('text-accent')

      await wrapper.find('[data-testid="tab-password"]').trigger('click')
      const passTab = wrapper.find('[data-testid="tab-password"]')
      expect(passTab.classes()).toContain('text-accent')
    })
  })

  describe('Login flow', () => {
    it('shows error when submitting empty password', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-password"]').trigger('click')
      await wrapper.find('[data-testid="btn-login"]').trigger('click')
      expect(wrapper.text()).toContain('请输入密码')
    })

    it('navigates to dashboard on successful login', async () => {
      loginMock.mockResolvedValue({ success: true, token: 'test-token' })
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-password"]').trigger('click')

      // Simulate password input by directly setting component state
      const vm = wrapper.vm as unknown as { password: string }
      vm.password = 'admin'
      await wrapper.find('[data-testid="btn-login"]').trigger('click')

      // Wait for async login
      await vi.waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('shows error on failed login', async () => {
      loginMock.mockResolvedValue({ success: false })
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-password"]').trigger('click')

      const vm = wrapper.vm as unknown as { password: string }
      vm.password = 'wrong'
      await wrapper.find('[data-testid="btn-login"]').trigger('click')

      await vi.waitFor(() => {
        expect(wrapper.text()).toContain('密码错误')
      })
    })
  })
})
