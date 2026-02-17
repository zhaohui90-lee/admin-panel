import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/login/LoginPage.vue'),
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/modules/dashboard/DashboardPage.vue'),
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('@/modules/logs/LogsPage.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/modules/settings/SettingsPage.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/modules/reports/ReportsPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.name !== 'login' && !auth.isLoggedIn) {
    return { name: 'login' }
  }
  if (to.name === 'login' && auth.isLoggedIn) {
    return { name: 'dashboard' }
  }
})

export default router
