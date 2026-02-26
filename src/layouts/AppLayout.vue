<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import SideNav from '@/components/SideNav.vue'
import MobileDrawer from '@/components/MobileDrawer.vue'

const route = useRoute()
const drawerOpen = ref(false)

interface NavItem {
  label: string
  to: string
}

const navItems: NavItem[] = [
  { label: '运行状态', to: '/dashboard' },
  { label: '系统设置', to: '/settings' },
  { label: '硬件调试', to: '/hardware' },
  { label: '故障申报', to: '/reports' },
]

const currentPageTitle = computed(
  () => navItems.find((item) => route.path === item.to || route.path.startsWith(item.to + '/'))?.label ?? '运维中心',
)
</script>

<template>
  <div class="industrial-grid-bg flex h-screen" style="background: var(--color-deep);">

    <!-- ═══════════════════════════════════════════════
         DESKTOP SIDEBAR (lg+, width 220px)
         ═══════════════════════════════════════════════ -->
    <div class="hidden lg:flex">
      <SideNav />
    </div>

    <!-- ═══════════════════════════════════════════════
         MAIN CONTENT AREA
         ═══════════════════════════════════════════════ -->
    <main class="relative z-10 flex flex-1 flex-col overflow-hidden">

      <!-- Mobile top bar (< lg): 汉堡菜单 + 标题 -->
      <header
        class="flex h-14 shrink-0 items-center gap-3 border-b px-4 lg:hidden"
        style="background: #0f1729; border-color: rgba(255,255,255,0.06);"
      >
        <!-- 汉堡菜单按钮 -->
        <button
          class="flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-150"
          style="color: #cbd5e1;"
          data-testid="hamburger-btn"
          @click="drawerOpen = true"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <!-- Logo 小图标 -->
        <div
          class="flex h-7 w-7 items-center justify-center rounded-lg"
          style="background: linear-gradient(135deg, #2563eb, #1d4ed8);"
        >
          <svg class="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z" />
          </svg>
        </div>

        <!-- 页面标题 -->
        <span class="text-sm font-semibold text-white">
          {{ currentPageTitle }}
        </span>
      </header>

      <!-- Page content -->
      <div class="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <router-view v-slot="{ Component, route: currentRoute }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="currentRoute.path" />
          </Transition>
        </router-view>
      </div>

    </main>

    <!-- ═══════════════════════════════════════════════
         MOBILE DRAWER (< lg)
         ═══════════════════════════════════════════════ -->
    <MobileDrawer :open="drawerOpen" @close="drawerOpen = false" />

  </div>
</template>

<style scoped>
/* Page fade-transform transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
