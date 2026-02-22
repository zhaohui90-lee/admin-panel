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
  <div class="flex h-screen overflow-hidden bg-black">

    <!-- ═══════════════════════════════════════════════
         LEFT: Status Panel — Kiosk only (lg+)
         ═══════════════════════════════════════════════ -->
    <aside
      class="hidden lg:flex w-[38%] flex-col justify-between px-10 py-16 text-white z-10"
      style="background: var(--color-panel-dark); box-shadow: 10px 0 30px rgba(0,0,0,0.2);"
    >
      <!-- Brand -->
      <div>
        <h1 class="text-[2.25rem] font-bold leading-snug tracking-wider">
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
      <div
        class="border-t pt-5 font-mono text-sm leading-loose"
        style="border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.4);"
      >
        DEVICE ID: KIOSK-MZ-082<br>
        IP ADDR: 192.168.10.105<br>
        VERSION: v2.4.0 (Stable)
      </div>
    </aside>

    <!-- ═══════════════════════════════════════════════
         RIGHT: Interaction Area
         ═══════════════════════════════════════════════ -->
    <main class="flex flex-1 flex-col" style="background: var(--color-surface);">

      <!-- Mobile status bar (hidden on lg) -->
      <div
        class="flex items-center gap-3 px-6 py-4 text-white lg:hidden"
        style="background: var(--color-panel-dark);"
      >
        <div
          class="h-2.5 w-2.5 rounded-full animate-pulse"
          style="background: var(--color-success);"
        />
        <span class="font-mono text-sm" style="opacity: 0.8;">KIOSK-MZ-082 · 系统正常</span>
      </div>

      <!-- View Area (flex-1 centered) — click background to dismiss keyboard -->
      <div class="flex flex-1 flex-col items-center justify-center px-8 py-6" @click="onBackgroundClick">
        <Transition name="view-fade" mode="out-in">

          <!-- Card mode -->
          <div
            v-if="activeMode === 'card'"
            key="card"
            class="flex flex-col items-center text-center"
            data-testid="mode-card"
          >
            <div class="hero-icon animate-pulse-soft mb-8 lg:mb-10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke-width="2" />
                <line x1="7" y1="15" x2="7.01" y2="15" stroke-width="3" />
                <path d="M11 15h4" />
              </svg>
            </div>
            <h2 class="mb-4 text-4xl font-extrabold lg:text-5xl" style="color: var(--color-text-primary);">
              请刷员工卡
            </h2>
            <p class="text-lg lg:text-2xl" style="color: var(--color-text-secondary);">
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
            <h2 class="mb-8 text-3xl font-extrabold lg:text-4xl" style="color: var(--color-text-primary);">
              密码登录
            </h2>

            <!-- Password display — click to show keyboard -->
            <div
              ref="passwordAreaRef"
              class="password-display mb-4"
              :class="{ 'password-display--error': error }"
              @click.stop="onPasswordAreaClick"
            >
              <span
                v-if="password"
                class="font-bold tracking-[8px] text-2xl lg:text-3xl"
                style="color: var(--color-text-primary);"
              >
                {{ '●'.repeat(password.length) }}
              </span>
              <span v-else class="text-xl lg:text-2xl" style="color: var(--color-text-muted);">
                请输入管理密码
              </span>
            </div>

            <p v-if="error" class="mb-5 text-base font-medium" style="color: var(--color-danger);">
              {{ error }}
            </p>

            <button
              class="login-confirm-btn"
              :disabled="loading"
              data-testid="btn-login"
              @click="handleLogin"
            >
              {{ loading ? '验证中...' : '确认登录' }}
            </button>

            <p class="mt-6 text-center text-sm lg:text-base" style="color: var(--color-text-muted);">
              如忘记密码，请刷卡或联系信息科
            </p>
          </div>

        </Transition>
      </div>

      <!-- Bottom Navigation -->
      <div class="px-8 pb-8 lg:px-16 lg:pb-12">
        <button
          class="nav-btn w-full"
          :class="{ 'nav-btn--active': navBtn.active }"
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

<style scoped>
/* Hero icon circle */
.hero-icon {
  width: 160px;
  height: 160px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.15);
}

@media (min-width: 1024px) {
  .hero-icon {
    width: 220px;
    height: 220px;
  }
}

.hero-icon svg {
  width: 42%;
  height: 42%;
}

/* Password display */
.password-display {
  width: 100%;
  height: var(--touch-input-height);
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  background: white;
  border: 2px solid var(--color-border);
  border-radius: var(--touch-radius-md);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.password-display--error {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 6px var(--color-danger-dim);
}

/* Login button */
.login-confirm-btn {
  width: 100%;
  height: var(--touch-btn-height);
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--touch-radius-md);
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
  transition: transform 0.1s, opacity 0.1s;
}

@media (min-width: 1024px) {
  .login-confirm-btn {
    font-size: 1.5rem;
  }
}

.login-confirm-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.login-confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Bottom nav buttons */
.nav-btn {
  height: var(--touch-btn-height);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: 2px solid var(--color-border);
  background: white;
  border-radius: var(--touch-radius-md);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 4px 0 var(--color-border);
}

@media (min-width: 1024px) {
  .nav-btn {
    font-size: 1.375rem;
  }
}

.nav-btn:active:not(.nav-btn--active) {
  transform: translateY(4px);
  box-shadow: none;
  background: var(--color-deep);
}

.nav-btn--active {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
  box-shadow: 0 4px 0 var(--color-accent-dark);
}

.nav-btn--active:active {
  transform: translateY(4px);
  box-shadow: none;
  background: var(--color-accent-dark);
}

/* View transition */
.view-fade-enter-active {
  animation: fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.view-fade-leave-active {
  opacity: 0;
  transition: opacity 0.15s ease;
}
</style>
