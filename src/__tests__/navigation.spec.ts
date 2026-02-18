import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../layouts/AppLayout.vue'

// Minimal stub pages
const StubPage = { template: '<div data-testid="stub-page">stub</div>' }
const LoginPage = { template: '<div data-testid="login-page">login</div>' }

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/login',
        name: 'login',
        component: LoginPage,
      },
      {
        path: '/',
        component: AppLayout,
        children: [
          { path: '', redirect: '/dashboard' },
          { path: 'dashboard', name: 'dashboard', component: StubPage },
          { path: 'logs', name: 'logs', component: StubPage },
          { path: 'settings', name: 'settings', component: StubPage },
          { path: 'reports', name: 'reports', component: StubPage },
        ],
      },
    ],
  })
}

function addGuard(router: ReturnType<typeof createTestRouter>) {
  router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.name !== 'login' && !auth.isLoggedIn) {
      return { name: 'login' }
    }
    if (to.name === 'login' && auth.isLoggedIn) {
      return { name: 'dashboard' }
    }
  })
}

describe('Navigation', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  describe('Sidebar nav items', () => {
    it('renders all 4 nav items', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      router.push('/dashboard')
      await router.isReady()

      const wrapper = mount(AppLayout, {
        global: { plugins: [pinia, router] },
      })

      const navButtons = wrapper.findAll('nav button')
      // 4 nav items + 1 logout button = 5 buttons in nav
      const navLabels = navButtons.map((b) => b.text())
      expect(navLabels).toContain('运行状态')
      expect(navLabels).toContain('交易日志')
      expect(navLabels).toContain('系统设置')
      expect(navLabels).toContain('故障申报')
      expect(navLabels).toContain('退出登录')
    })

    it('highlights active nav item for /dashboard', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      router.push('/dashboard')
      await router.isReady()

      const wrapper = mount(AppLayout, {
        global: { plugins: [pinia, router] },
      })

      const navButtons = wrapper.findAll('nav button')
      const dashboardBtn = navButtons.find((b) => b.text() === '运行状态')!
      expect(dashboardBtn.classes()).toContain('bg-sidebar-active')
      expect(dashboardBtn.classes()).toContain('text-white')
    })

    it('highlights active nav item for /logs', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      router.push('/logs')
      await router.isReady()

      const wrapper = mount(AppLayout, {
        global: { plugins: [pinia, router] },
      })

      const navButtons = wrapper.findAll('nav button')
      const logsBtn = navButtons.find((b) => b.text() === '交易日志')!
      expect(logsBtn.classes()).toContain('bg-sidebar-active')
    })

    it('non-active items have sidebar-text styling', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      router.push('/dashboard')
      await router.isReady()

      const wrapper = mount(AppLayout, {
        global: { plugins: [pinia, router] },
      })

      const navButtons = wrapper.findAll('nav button')
      const settingsBtn = navButtons.find((b) => b.text() === '系统设置')!
      expect(settingsBtn.classes()).toContain('text-sidebar-text')
    })
  })

  describe('Mobile bottom tab bar', () => {
    it('renders all 5 nav items in bottom tab bar', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      router.push('/dashboard')
      await router.isReady()

      const wrapper = mount(AppLayout, {
        global: { plugins: [pinia, router] },
      })

      const bottomBar = wrapper.find('[data-testid="bottom-tab-bar"]')
      expect(bottomBar.exists()).toBe(true)

      const tabs = bottomBar.findAll('button')
      const labels = tabs.map((t) => t.text())
      expect(labels).toContain('运行状态')
      expect(labels).toContain('交易日志')
      expect(labels).toContain('系统设置')
      expect(labels).toContain('硬件调试')
      expect(labels).toContain('故障申报')
    })

    it('active bottom tab has text-accent class', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      router.push('/dashboard')
      await router.isReady()

      const wrapper = mount(AppLayout, {
        global: { plugins: [pinia, router] },
      })

      const activeTab = wrapper.find('[data-testid="bottom-tab-dashboard"]')
      expect(activeTab.classes()).toContain('text-accent')
    })

    it('inactive bottom tabs have text-sidebar-text class', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      router.push('/dashboard')
      await router.isReady()

      const wrapper = mount(AppLayout, {
        global: { plugins: [pinia, router] },
      })

      const logsTab = wrapper.find('[data-testid="bottom-tab-logs"]')
      expect(logsTab.classes()).toContain('text-sidebar-text')
      expect(logsTab.classes()).not.toContain('text-accent')
    })

    it('active bottom tab updates on route change', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      router.push('/dashboard')
      await router.isReady()

      const wrapper = mount(AppLayout, {
        global: { plugins: [pinia, router] },
      })

      // Switch to logs route
      await router.push('/logs')
      await wrapper.vm.$nextTick()

      const logsTab = wrapper.find('[data-testid="bottom-tab-logs"]')
      expect(logsTab.classes()).toContain('text-accent')

      const dashboardTab = wrapper.find('[data-testid="bottom-tab-dashboard"]')
      expect(dashboardTab.classes()).not.toContain('text-accent')
    })
  })

  describe('Route guard', () => {
    it('redirects to /login when not authenticated', async () => {
      const router = createTestRouter()
      addGuard(router)

      router.push('/dashboard')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('allows access to /dashboard when authenticated', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      router.push('/dashboard')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('redirects authenticated user from /login to /dashboard', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      router.push('/login')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard')
    })

    it('protects all child routes', async () => {
      const router = createTestRouter()
      addGuard(router)

      for (const path of ['/logs', '/settings', '/reports']) {
        router.push(path)
        await router.isReady()
        expect(router.currentRoute.value.name).toBe('login')
      }
    })

    it('allows authenticated access to all child routes', async () => {
      const router = createTestRouter()
      addGuard(router)
      const auth = useAuthStore()
      auth.login('test-token')

      for (const route of ['logs', 'settings', 'reports'] as const) {
        await router.push(`/${route}`)
        expect(router.currentRoute.value.name).toBe(route)
      }
    })
  })
})
