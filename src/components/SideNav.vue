<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

interface NavItem {
  label: string
  icon: 'waveform' | 'gear' | 'circuit' | 'warning'
  to: string
}

const navItems: NavItem[] = [
  { label: '运行状态', icon: 'waveform', to: '/dashboard' },
  { label: '系统设置', icon: 'gear', to: '/settings' },
  { label: '硬件调试', icon: 'circuit', to: '/hardware' },
  { label: '故障申报', icon: 'warning', to: '/reports' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}

const emit = defineEmits<{
  navigate: [to: string]
}>()

function navigateTo(to: string) {
  router.push(to)
  emit('navigate', to)
}

function handleLock() {
  auth.logout()
  router.push('/login')
}

function handleReturnBusiness() {
  // 预留：退出运维模式，回到患者自助交互主程序
  // 通过 bridge IPC 通知外壳切换到业务模式
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav
    class="flex w-[220px] shrink-0 flex-col"
    style="background: #0f1729; border-right: 1px solid rgba(255,255,255,0.06);"
    data-testid="sidebar"
  >
    <!-- ── Brand: Logo + 运维中心 ──────────────── -->
    <div class="flex items-center gap-3 px-5 pb-2 pt-6">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style="background: linear-gradient(135deg, #2563eb, #1d4ed8);"
      >
        <!-- 医疗十字 Logo 占位 -->
        <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z" />
        </svg>
      </div>
      <div class="flex flex-col">
        <span class="text-sm font-bold tracking-wide text-white">运维中心</span>
        <span class="font-mono text-[10px] tracking-wider" style="color: #64748b;">Maintenance Console</span>
      </div>
    </div>

    <!-- ── 分隔线 ─────────────────────────────── -->
    <div class="mx-5 my-4 h-px" style="background: rgba(255,255,255,0.06);" />

    <!-- ── 导航项 ─────────────────────────────── -->
    <div class="flex flex-col gap-1 px-3">
      <button
        v-for="item in navItems"
        :key="item.to"
        class="relative flex h-16 items-center gap-3.5 rounded-xl px-4 text-sm font-semibold transition-all duration-200"
        :class="isActive(item.to)
          ? 'text-white'
          : 'hover:text-white'"
        :style="isActive(item.to)
          ? 'background: linear-gradient(90deg, rgba(37,99,235,0.2), rgba(37,99,235,0.08)); color: #60a5fa;'
          : 'color: #94a3b8;'"
        @click="navigateTo(item.to)"
      >
        <!-- 左侧 4px 激活指示条 -->
        <div
          v-if="isActive(item.to)"
          class="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r"
          style="background: #2563eb;"
        />

        <!-- Icon 20x20 -->
        <!-- 波形 — 运行状态 -->
        <svg v-if="item.icon === 'waveform'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <!-- 齿轮 — 系统设置 -->
        <svg v-if="item.icon === 'gear'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <!-- 电路板 — 硬件调试 -->
        <svg v-if="item.icon === 'circuit'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
        </svg>
        <!-- 警告三角 — 故障申报 -->
        <svg v-if="item.icon === 'warning'" class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>

        {{ item.label }}
      </button>
    </div>

    <!-- ── Spacer ─────────────────────────────── -->
    <div class="flex-1" />

    <!-- ── 分隔线 ─────────────────────────────── -->
    <div class="mx-5 mb-3 h-px" style="background: rgba(255,255,255,0.06);" />

    <!-- ── 操作员信息区 ───────────────────────── -->
    <div class="px-4 pb-3">
      <div class="flex items-center gap-3 rounded-xl px-3 py-2.5">
        <!-- 头像占位 -->
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style="background: linear-gradient(135deg, #334155, #475569);"
        >
          A
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-white">管理员</span>
          <span class="font-mono text-[10px]" style="color: #64748b;">Admin</span>
        </div>
      </div>
    </div>

    <!-- ── 底部按钮区 ─────────────────────────── -->
    <div class="flex gap-2 px-4 pb-5">
      <!-- 锁定/注销 -->
      <button
        class="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:brightness-125"
        style="background: rgba(255,255,255,0.05); color: #94a3b8;"
        @click="handleLock"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        锁定
      </button>
      <!-- 返回业务 -->
      <button
        class="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:brightness-125"
        style="background: rgba(37,99,235,0.12); color: #60a5fa;"
        @click="handleReturnBusiness"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        返回业务
      </button>
    </div>
  </nav>
</template>
