<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

interface NavItem {
  label: string
  icon: 'activity' | 'file-text' | 'settings' | 'cpu' | 'alert-triangle'
  to: string
}

const navItems: NavItem[] = [
  { label: '运行状态', icon: 'activity',        to: '/dashboard' },
  { label: '交易日志', icon: 'file-text',       to: '/logs'      },
  { label: '系统设置', icon: 'settings',        to: '/settings'  },
  { label: '硬件调试', icon: 'cpu',             to: '/hardware'  },
  { label: '故障申报', icon: 'alert-triangle',  to: '/reports'   },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

function navigateTo(to: string) {
  router.push(to)
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}

const currentPageTitle = computed(
  () => navItems.find((item) => isActive(item.to))?.label ?? '管理控制台',
)
</script>

<template>
  <div class="flex h-screen" style="background: var(--color-deep);">

    <!-- ═══════════════════════════════════════════════
         KIOSK SIDEBAR (hidden on mobile, lg+)
         ═══════════════════════════════════════════════ -->
    <nav
      class="hidden lg:flex w-64 shrink-0 flex-col border-r"
      style="background: var(--color-sidebar); border-color: var(--color-sidebar-border);"
      data-testid="sidebar"
    >
      <!-- Brand -->
      <div class="flex items-center gap-3 px-5 py-6">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style="background: var(--color-accent);"
        >
          <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <span class="text-base font-semibold tracking-wide text-white">管理控制台</span>
      </div>

      <!-- Section label -->
      <div
        class="mb-2 px-6 font-mono text-[10px] uppercase tracking-[2px]"
        style="color: var(--color-sidebar-text-muted);"
      >
        主菜单
      </div>

      <!-- Nav items — h-16 (64px) for Kiosk touch -->
      <div class="flex flex-col gap-1 px-3">
        <button
          v-for="item in navItems"
          :key="item.to"
          class="relative flex h-16 items-center gap-4 rounded-xl px-5 text-base font-semibold transition-all duration-200"
          :class="isActive(item.to)
            ? 'bg-sidebar-active text-white'
            : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'"
          @click="navigateTo(item.to)"
        >
          <!-- Active left indicator -->
          <div
            v-if="isActive(item.to)"
            class="absolute top-1/2 left-0 h-7 w-1 -translate-y-1/2 rounded-r bg-white"
          />

          <!-- Icon -->
          <svg v-if="item.icon === 'activity'"       class="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <svg v-if="item.icon === 'file-text'"      class="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <svg v-if="item.icon === 'settings'"       class="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <svg v-if="item.icon === 'cpu'"            class="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
          <svg v-if="item.icon === 'alert-triangle'" class="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

          {{ item.label }}
        </button>
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Divider -->
      <div class="mx-5 mb-3 h-px" style="background: var(--color-sidebar-border);" />

      <!-- Logout -->
      <div class="px-3 pb-6">
        <button
          class="flex h-14 w-full items-center gap-4 rounded-xl px-5 text-base font-semibold transition-all duration-200"
          style="color: #f87171;"
          @click="handleLogout"
        >
          <svg class="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          退出登录
        </button>
      </div>
    </nav>

    <!-- ═══════════════════════════════════════════════
         MAIN CONTENT AREA
         ═══════════════════════════════════════════════ -->
    <main class="relative flex flex-1 flex-col overflow-hidden">

      <!-- Mobile top bar (lg:hidden) — no hamburger, just title -->
      <header
        class="flex h-14 shrink-0 items-center gap-3 border-b px-5 lg:hidden"
        style="background: var(--color-card); border-color: var(--color-border);"
      >
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg"
          style="background: var(--color-accent);"
        >
          <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <span class="text-sm font-semibold" style="color: var(--color-text-primary);">
          {{ currentPageTitle }}
        </span>
      </header>

      <!-- Page content -->
      <div class="flex-1 overflow-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
        <router-view v-slot="{ Component, route: currentRoute }">
          <Transition name="page-fade" mode="out-in">
            <component :is="Component" :key="currentRoute.path" />
          </Transition>
        </router-view>
      </div>

    </main>

    <!-- ═══════════════════════════════════════════════
         MOBILE BOTTOM TAB BAR (lg:hidden)
         ═══════════════════════════════════════════════ -->
    <nav
      class="fixed bottom-0 left-0 right-0 grid grid-cols-5 lg:hidden"
      style="background: var(--color-sidebar); border-top: 1px solid var(--color-sidebar-border); height: 64px;"
      data-testid="bottom-tab-bar"
    >
      <button
        v-for="item in navItems"
        :key="item.to"
        class="flex flex-col items-center justify-center gap-1 transition-all duration-200"
        :class="isActive(item.to) ? 'text-accent' : 'text-sidebar-text'"
        :data-testid="`bottom-tab-${item.to.slice(1)}`"
        @click="navigateTo(item.to)"
      >
        <!-- Icon -->
        <svg v-if="item.icon === 'activity'"       class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <svg v-if="item.icon === 'file-text'"      class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <svg v-if="item.icon === 'settings'"       class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <svg v-if="item.icon === 'cpu'"            class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
        <svg v-if="item.icon === 'alert-triangle'" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </button>
    </nav>

  </div>
</template>

<style scoped>
/* Page fade transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.18s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
