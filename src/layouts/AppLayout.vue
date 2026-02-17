<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(false)

interface NavItem {
  label: string
  icon: string
  to: string
}

const navItems: NavItem[] = [
  {
    label: '运行状态',
    icon: 'activity',
    to: '/dashboard',
  },
  {
    label: '系统设置',
    icon: 'settings',
    to: '/settings',
  },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

function navigateTo(to: string) {
  router.push(to)
  sidebarOpen.value = false
}

function handleLogout() {
  auth.logout()
  router.push('/login')
  sidebarOpen.value = false
}
</script>

<template>
  <div class="flex h-screen bg-deep">
    <!-- Mobile overlay -->
    <Transition name="overlay">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <nav
      class="fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 -translate-x-full flex-col border-r border-border bg-[rgba(10,16,30,0.97)] backdrop-blur-xl transition-transform duration-300 lg:relative lg:z-10 lg:w-60 lg:translate-x-0 xl:w-64"
      :class="{ 'translate-x-0': sidebarOpen }"
    >
      <!-- Brand -->
      <div class="flex items-center gap-3 px-5 pt-6 pb-7 lg:px-4 lg:pt-5 lg:pb-6 xl:px-5">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--color-accent),#00b884)] shadow-[0_0_16px_var(--color-accent-glow)]">
          <svg class="h-4.5 w-4.5 text-deep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <span class="text-sm font-semibold tracking-wide text-text-primary lg:text-[15px]">管理控制台</span>
      </div>

      <!-- Nav label -->
      <div class="mb-2 px-7 font-mono text-[10px] tracking-[2px] text-text-muted uppercase lg:px-6 xl:px-7">主菜单</div>

      <!-- Nav items -->
      <div class="flex flex-col gap-1 px-3 lg:px-2 xl:px-3">
        <button
          v-for="item in navItems"
          :key="item.to"
          class="relative flex items-center gap-3 rounded-[10px] px-4 py-2.5 text-[13.5px] font-medium transition-all duration-200"
          :class="isActive(item.to)
            ? 'bg-accent-dim text-accent'
            : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'"
          @click="navigateTo(item.to)"
        >
          <!-- Active indicator -->
          <div v-if="isActive(item.to)" class="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-sm bg-accent" />

          <!-- Activity icon -->
          <svg v-if="item.icon === 'activity'" class="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>

          <!-- Settings icon -->
          <svg v-if="item.icon === 'settings'" class="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>

          {{ item.label }}
        </button>
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Divider -->
      <div class="mx-5 mb-3 h-px bg-border lg:mx-4 xl:mx-5" />

      <!-- Logout -->
      <div class="px-3 pb-5 lg:px-2 lg:pb-4 xl:px-3 xl:pb-5">
        <button
          class="flex w-full items-center gap-3 rounded-[10px] px-4 py-2.5 text-[13.5px] text-danger transition-all duration-200 hover:bg-danger-dim"
          @click="handleLogout"
        >
          <svg class="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          退出登录
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="relative flex flex-1 flex-col overflow-hidden">
      <!-- Mobile top bar -->
      <header class="flex h-14 shrink-0 items-center border-b border-border bg-[rgba(10,16,30,0.8)] px-4 backdrop-blur-lg lg:hidden">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary"
          @click="sidebarOpen = true"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span class="ml-3 text-sm font-semibold text-text-primary">管理控制台</span>
      </header>

      <!-- Content area -->
      <div class="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <!-- Ambient glow -->
        <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_800px_600px_at_70%_20%,rgba(0,229,160,0.025),transparent),radial-gradient(ellipse_600px_400px_at_20%_80%,rgba(59,130,246,0.02),transparent)]" />
        <div class="relative z-10">
          <router-view />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
