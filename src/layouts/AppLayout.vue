<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-deep">
    <!-- Sidebar -->
    <nav class="z-10 flex w-[260px] shrink-0 flex-col border-r border-border bg-[rgba(10,16,30,0.95)] p-7 px-4 backdrop-blur-[20px]">
      <!-- Brand -->
      <div class="mb-9 flex items-center gap-3 px-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--color-accent),#00b884)] shadow-[0_0_16px_var(--color-accent-glow)]">
          <svg class="h-[18px] w-[18px] text-deep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <span class="text-[15px] font-semibold tracking-wide text-text-primary">管理控制台</span>
      </div>

      <!-- Nav label -->
      <div class="mb-2.5 px-4 font-mono text-[10px] tracking-[2px] text-text-muted uppercase">主菜单</div>

      <!-- Nav items -->
      <div
        class="relative flex cursor-default items-center gap-3 rounded-[10px] bg-accent-dim px-4 py-[11px] text-[13.5px] font-medium text-accent"
      >
        <div class="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-sm bg-accent" />
        <svg class="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        设备控制
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Divider -->
      <div class="mx-4 mb-3 h-px bg-border" />

      <!-- Logout -->
      <button
        class="flex items-center gap-3 rounded-[10px] px-4 py-[11px] text-[13.5px] text-danger transition-all duration-200 hover:bg-danger-dim"
        @click="handleLogout"
      >
        <svg class="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        退出登录
      </button>
    </nav>

    <!-- Main Content -->
    <main class="relative flex-1 overflow-auto p-8">
      <!-- Ambient glow -->
      <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_800px_600px_at_70%_20%,rgba(0,229,160,0.025),transparent),radial-gradient(ellipse_600px_400px_at_20%_80%,rgba(59,130,246,0.02),transparent)]" />
      <div class="relative z-10">
        <router-view />
      </div>
    </main>
  </div>
</template>
