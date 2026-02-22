<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBridge } from '@/composables/useBridge'
import { useKeyboardScroll } from '@/composables/useKeyboardScroll'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'
import StatusBulb from '@/components/StatusBulb.vue'

const router = useRouter()
const auth = useAuthStore()
const bridge = useBridge()

type LoginMode = 'card' | 'password'
const activeMode = ref<LoginMode>('card')

const password = ref('')
const error = ref('')
const loading = ref(false)
const showKeyboard = ref(false)
const passwordAreaRef = ref<HTMLElement | null>(null)

useKeyboardScroll(passwordAreaRef, showKeyboard)

function switchMode(mode: LoginMode) {
  activeMode.value = mode
  error.value = ''
  password.value = ''
  showKeyboard.value = mode === 'password'
}

function onPasswordAreaClick() {
  showKeyboard.value = true
}

function onBackgroundClick() {
  showKeyboard.value = false
}

async function handleLogin() {
  if (!password.value) {
    error.value = '请输入密码'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const result = await bridge.auth.login(password.value)
    if (result.success && result.token) {
      auth.login(result.token)
      router.push('/dashboard')
    } else {
      error.value = '密码错误'
      password.value = ''
    }
  } catch {
    error.value = '验证失败，请重试'
  } finally {
    loading.value = false
  }
}

// Bottom nav: card ↔ password toggle
type NavBtn = { mode: LoginMode; label: string; testid: string; active: boolean }

const navBtn = computed<NavBtn>(() => {
  if (activeMode.value === 'password') {
    return { mode: 'card', label: '返回刷卡', testid: 'tab-card', active: true }
  }
  return { mode: 'password', label: '密码登录', testid: 'tab-password', active: false }
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-950">

    <!-- ═══════════════════════════════════════════════
         LEFT: Status Panel — Kiosk only (lg+)
         ═══════════════════════════════════════════════ -->
    <aside
      class="hidden lg:flex w-[38%] flex-col justify-between px-10 py-16 text-white z-10 bg-slate-900 shadow-[10px_0_30px_rgba(0,0,0,0.2)]"
    >
      <!-- Brand -->
      <div>
        <h1 class="text-4xl font-bold leading-snug tracking-wider">
          省人民医院<br>设备管理中心
        </h1>
        <p class="mt-3 text-base tracking-[3px] opacity-60">Self-Service Kiosk Manager</p>
      </div>

      <!-- Status Monitor -->
      <div class="flex flex-col items-center gap-4">
        <StatusBulb status="online" size="lg" label="系统正常" />
        <p class="text-sm opacity-60">Network Online</p>
      </div>

      <!-- Device Metadata -->
      <div class="border-t border-white/10 pt-5 font-mono text-sm leading-loose text-white/40">
        DEVICE ID: KIOSK-MZ-082<br>
        IP ADDR: 192.168.10.105<br>
        VERSION: v2.4.0 (Stable)
      </div>
    </aside>

    <!-- ═══════════════════════════════════════════════
         RIGHT: Interaction Area
         ═══════════════════════════════════════════════ -->
    <main class="flex flex-1 flex-col bg-slate-50">

      <!-- Mobile status bar (hidden on lg) -->
      <div class="flex items-center gap-3 px-6 py-4 text-white lg:hidden bg-slate-900">
        <div class="h-2.5 w-2.5 rounded-full animate-pulse bg-green-500" />
        <span class="font-mono text-sm opacity-80">KIOSK-MZ-082 · 系统正常</span>
      </div>

      <!-- View Area (flex-1 centered) — click background to dismiss keyboard -->
      <div class="flex flex-1 flex-col items-center justify-center px-8 py-6" @click="onBackgroundClick">
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          mode="out-in"
        >

          <!-- Card mode -->
          <div
            v-if="activeMode === 'card'"
            key="card"
            class="flex flex-col items-center text-center"
            data-testid="mode-card"
          >
            <!-- Hero Icon -->
            <div class="mb-8 lg:mb-10 flex h-40 w-40 items-center justify-center rounded-full bg-white text-blue-600 shadow-xl shadow-blue-600/15 animate-pulse-soft lg:h-[220px] lg:w-[220px]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="h-[42%] w-[42%]">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke-width="2" />
                <line x1="7" y1="15" x2="7.01" y2="15" stroke-width="3" />
                <path d="M11 15h4" />
              </svg>
            </div>
            
            <h2 class="mb-4 text-4xl font-extrabold text-slate-800 lg:text-5xl">
              请刷员工卡
            </h2>
            <p class="text-lg text-slate-500 lg:text-2xl">
              将工牌靠近屏幕下方感应区
            </p>
          </div>

          <!-- Password mode -->
          <div
            v-else
            key="password"
            class="w-full max-w-md"
            data-testid="mode-password"
          >
            <h2 class="mb-8 text-3xl font-extrabold text-slate-800 lg:text-4xl">
              密码登录
            </h2>

            <!-- Password display — click to show keyboard -->
            <div
              ref="passwordAreaRef"
              data-testid="password-display"
              class="mb-4 flex h-14 w-full items-center rounded-2xl border-2 bg-white px-6 transition-all duration-200 lg:h-[70px]"
              :class="error ? 'border-red-500 shadow-[0_0_0_6px_rgba(239,68,68,0.08)]' : 'border-slate-200'"
              @click.stop="onPasswordAreaClick"
            >
              <span
                v-if="password"
                class="text-2xl font-bold tracking-[8px] text-slate-800 lg:text-3xl"
              >
                {{ '●'.repeat(password.length) }}
              </span>
              <span v-else class="text-xl text-slate-400 lg:text-2xl">
                请输入管理密码
              </span>
            </div>

            <p v-if="error" class="mb-5 text-base font-medium text-red-500">
              {{ error }}
            </p>

            <button
              class="h-14 w-full rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/30 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 lg:h-[90px] lg:text-2xl"
              :disabled="loading"
              data-testid="btn-login"
              @click="handleLogin"
            >
              {{ loading ? '验证中...' : '确认登录' }}
            </button>

            <p class="mt-6 text-center text-sm text-slate-400 lg:text-base">
              如忘记密码，请刷卡或联系信息科
            </p>
          </div>

        </Transition>
      </div>

      <!-- Bottom Navigation -->
      <div class="px-8 pb-8 lg:px-16 lg:pb-12">
        <button
          class="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 text-base font-semibold shadow-[0_4px_0_var(--color-border)] transition-all active:translate-y-1 active:shadow-none lg:h-[90px] lg:text-[1.375rem]"
          :class="navBtn.active 
            ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_0_#1e40af] active:bg-blue-700' 
            : 'bg-white text-slate-800 border-slate-200 shadow-[0_4px_0_#e2e8f0] active:bg-slate-50'"
          :data-testid="navBtn.testid"
          @click="switchMode(navBtn.mode)"
        >
          {{ navBtn.label }}
        </button>
      </div>

    </main>

    <!-- Virtual keyboard (password mode + keyboard visible) -->
    <div
      v-if="activeMode === 'password' && showKeyboard"
      class="fixed bottom-0 left-0 right-0 z-20 px-3 pb-3 sm:px-6 sm:pb-4 lg:left-[38%]"
      @click.stop
    >
      <VirtualKeyboard v-model="password" />
    </div>

  </div>
</template>
