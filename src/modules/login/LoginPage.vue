<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBridge } from '@/composables/useBridge'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'

const router = useRouter()
const auth = useAuthStore()
const bridge = useBridge()

type LoginMode = 'card' | 'password'
const activeMode = ref<LoginMode>('card')

const password = ref('')
const error = ref('')
const loading = ref(false)

function switchMode(mode: LoginMode) {
  activeMode.value = mode
  error.value = ''
  password.value = ''
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
</script>

<template>
  <div class="flex min-h-screen items-center justify-center overflow-auto bg-deep p-3 sm:p-6">

    <div class="flex w-full max-w-[960px] animate-[fadeIn_0.8s_ease_both] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.1),0_8px_30px_rgba(0,0,0,0.08)] md:flex-row">

      <!-- Brand Panel: top on mobile, left on md+ -->
      <div class="relative flex shrink-0 flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#1e40af_0%,#2563eb_100%)] p-6 sm:p-8 md:w-[320px] md:p-10 lg:w-[380px]">
        <!-- Decorative circle -->
        <div class="pointer-events-none absolute -right-20 -bottom-20 hidden h-75 w-75 rounded-full border border-white/10 md:block" />

        <!-- Brand -->
        <div>
          <div class="mb-1 flex items-center gap-3 md:mb-2 md:gap-3.5">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm md:h-11 md:w-11 md:rounded-xl">
              <svg class="h-5 w-5 text-white md:h-6 md:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <h2 class="text-lg font-bold tracking-wide text-white md:text-[22px]">智慧医疗控制中心</h2>
          </div>
          <p class="ml-12 font-mono text-[10px] tracking-[3px] text-blue-200 uppercase md:ml-14.5 md:text-[11px]">Kiosk Admin Panel</p>
        </div>

        <!-- Terminal badge -->
        <div class="relative z-10 mt-4 flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 font-mono text-[10.5px] text-blue-100 backdrop-blur-sm md:mt-0 md:gap-2.5 md:rounded-[10px] md:px-4 md:py-3 md:text-[11.5px]">
          <span class="relative h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] md:h-1.75 md:w-1.75">
            <span class="absolute -inset-0.75 animate-ping rounded-full border border-emerald-400" />
          </span>
          <span>终端 SZ-SH-082&nbsp;|&nbsp;系统在线</span>
        </div>
      </div>

      <!-- Auth Panel -->
      <div class="flex flex-1 flex-col p-6 sm:p-8 md:px-10 md:py-10">
        <!-- Tab Bar -->
        <div class="mb-5 flex border-b border-border md:mb-6">
          <button
            class="relative px-4 pb-2.5 text-sm font-semibold transition-colors duration-200 md:px-5 md:pb-3"
            :class="activeMode === 'card' ? 'text-accent' : 'text-text-muted hover:text-text-secondary'"
            data-testid="tab-card"
            @click="switchMode('card')"
          >
            工牌感应
            <span v-if="activeMode === 'card'" class="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-accent" />
          </button>
          <button
            class="relative px-4 pb-2.5 text-sm font-semibold transition-colors duration-200 md:px-5 md:pb-3"
            :class="activeMode === 'password' ? 'text-accent' : 'text-text-muted hover:text-text-secondary'"
            data-testid="tab-password"
            @click="switchMode('password')"
          >
            账号密码
            <span v-if="activeMode === 'password'" class="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-accent" />
          </button>
        </div>

        <!-- IC Card Reader Mode -->
        <div v-if="activeMode === 'card'" class="flex flex-1 flex-col items-center justify-center py-8 text-center md:py-0" data-testid="mode-card">
          <div class="rfid-ring relative mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-dim md:mb-6 md:h-20 md:w-20">
            <svg class="h-8 w-8 text-accent md:h-10 md:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <span class="rfid-pulse absolute inset-0 rounded-full border-2 border-accent/40" />
          </div>
          <h3 class="mb-2 text-base font-semibold text-text-primary">请刷员工卡</h3>
          <p class="text-[13px] text-text-muted">请将工牌靠近感应区，系统将自动登录</p>
        </div>

        <!-- Password Mode -->
        <div v-if="activeMode === 'password'" class="flex flex-1 flex-col justify-center" data-testid="mode-password">
          <div class="mb-2">
            <label class="mb-2 block text-xs font-medium tracking-wide text-text-secondary">管理密码</label>
            <div
              class="flex min-h-12 items-center rounded-[10px] border px-4 py-3 text-base transition-all duration-200 md:min-h-13"
              :class="error ? 'border-danger shadow-[0_0_0_3px_var(--color-danger-dim)]' : 'border-border bg-surface focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--color-accent-dim)]'"
            >
              <span v-if="password" class="tracking-[6px] text-text-primary">{{ '\u25CF'.repeat(password.length) }}</span>
              <span v-else class="text-text-muted">请输入管理密码</span>
            </div>
            <p v-if="error" class="mt-2 text-xs text-danger">{{ error }}</p>
          </div>

          <button
            class="mt-4 flex h-12 w-full items-center justify-center rounded-[10px] bg-accent text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-[0_4px_20px_var(--color-accent-glow)] hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 disabled:opacity-50 md:h-13"
            :disabled="loading"
            data-testid="btn-login"
            @click="handleLogin"
          >
            {{ loading ? '验证中...' : '确认登录' }}
          </button>
        </div>

        <!-- Footer -->
        <div class="mt-auto pt-3 text-center font-mono text-[10px] tracking-wide text-text-muted md:pt-4 md:text-[10.5px]">
          &copy; 2026 智慧医疗信息技术有限公司 · V2.4.0
        </div>
      </div>
    </div>

    <!-- Virtual Keyboard (only in password mode) -->
    <div v-if="activeMode === 'password'" class="fixed bottom-3 left-1/2 z-20 w-full max-w-2xl -translate-x-1/2 px-3 sm:bottom-6 sm:px-0">
      <VirtualKeyboard v-model="password" />
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes rfidPulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0; }
}

.rfid-pulse {
  animation: rfidPulse 1.5s ease-out infinite;
}
</style>
