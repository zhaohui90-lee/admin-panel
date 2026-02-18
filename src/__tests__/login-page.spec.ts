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
      stubs: { VirtualKeyboard: true, StatusBulb: true },
    },
  })
}

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    pushMock.mockReset()
    loginMock.mockReset()
  })

  describe('Bottom nav switching', () => {
    it('defaults to card mode', () => {
      const wrapper = mountPage()
      expect(wrapper.find('[data-testid="mode-card"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="mode-password"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="mode-scan"]').exists()).toBe(false)
    })

    it('shows scan and password nav buttons in card mode', () => {
      const wrapper = mountPage()
      expect(wrapper.find('[data-testid="tab-scan"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="tab-password"]').exists()).toBe(true)
      // tab-card doesn't exist when already in card mode
      expect(wrapper.find('[data-testid="tab-card"]').exists()).toBe(false)
    })

    it('switches to password mode on tab click', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-password"]').trigger('click')
      expect(wrapper.find('[data-testid="mode-password"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="mode-card"]').exists()).toBe(false)
    })

    it('switches to scan mode on tab click', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-scan"]').trigger('click')
      expect(wrapper.find('[data-testid="mode-scan"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="mode-card"]').exists()).toBe(false)
    })

    it('switches back to card mode from password mode', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-password"]').trigger('click')
      await wrapper.find('[data-testid="tab-card"]').trigger('click')
      expect(wrapper.find('[data-testid="mode-card"]').exists()).toBe(true)
    })

    it('switches back to card mode from scan mode', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-scan"]').trigger('click')
      await wrapper.find('[data-testid="tab-card"]').trigger('click')
      expect(wrapper.find('[data-testid="mode-card"]').exists()).toBe(true)
    })

    it('tab-card is active (nav-btn--active) when returning from password mode', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-password"]').trigger('click')
      const cardBtn = wrapper.find('[data-testid="tab-card"]')
      expect(cardBtn.classes()).toContain('nav-btn--active')
    })

    it('tab-card is active (nav-btn--active) when returning from scan mode', async () => {
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-scan"]').trigger('click')
      const cardBtn = wrapper.find('[data-testid="tab-card"]')
      expect(cardBtn.classes()).toContain('nav-btn--active')
    })

    it('non-active nav buttons do not have nav-btn--active class', () => {
      const wrapper = mountPage()
      // In card mode, both nav buttons (scan + password) are inactive
      expect(wrapper.find('[data-testid="tab-scan"]').classes()).not.toContain('nav-btn--active')
      expect(wrapper.find('[data-testid="tab-password"]').classes()).not.toContain('nav-btn--active')
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

      const vm = wrapper.vm as unknown as { password: string }
      vm.password = 'admin'
      await wrapper.find('[data-testid="btn-login"]').trigger('click')

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

    it('clears password and error when switching mode', async () => {
      loginMock.mockResolvedValue({ success: false })
      const wrapper = mountPage()
      await wrapper.find('[data-testid="tab-password"]').trigger('click')

      const vm = wrapper.vm as unknown as { password: string; error: string }
      vm.password = 'wrong'
      await wrapper.find('[data-testid="btn-login"]').trigger('click')

      await vi.waitFor(() => expect(wrapper.text()).toContain('密码错误'))

      // Switch back to card mode
      await wrapper.find('[data-testid="tab-card"]').trigger('click')
      expect(vm.password).toBe('')
      expect(vm.error).toBe('')
    })
  })
})
