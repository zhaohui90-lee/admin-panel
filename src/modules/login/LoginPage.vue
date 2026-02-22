<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBridge } from '@/composables/useBridge'
import { useVirtualKeyboard } from '@/composables/useVirtualKeyboard'
import StatusBulb from '@/components/StatusBulb.vue'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'

const router = useRouter()
const auth = useAuthStore()
const bridge = useBridge()

// ── Tab ──
type LoginTab = 'password' | 'card'
const activeTab = ref<LoginTab>('password')

const tabs = [
  {
    id: 'password' as const,
    label: '密码登录',
    icon: 'lock',
  },
  {
    id: 'card' as const,
    label: '员工卡登录',
    icon: 'card',
  },
]

// ── Virtual Keyboard ──
type LoginField = 'staffId' | 'password' | 'cardNumber'
const kb = useVirtualKeyboard<LoginField>({
  staffId: { type: 'text', label: '员工工号' },
  password: { type: 'password', label: '登录密码' },
  cardNumber: { type: 'text', label: '卡号' },
})

// ── Form (proxied to keyboard values) ──
const staffId = computed({
  get: () => kb.values.value.staffId,
  set: (v: string) => {
    kb.values.value.staffId = v
  },
})
const password = computed({
  get: () => kb.values.value.password,
  set: (v: string) => {
    kb.values.value.password = v
  },
})
const showPwd = ref(false)
const isLoading = ref(false)
const error = ref('')
const shakeError = ref(false)
const showSuccess = ref(false)

const canLogin = computed(() => staffId.value.trim() !== '' && password.value !== '')

function triggerShake() {
  shakeError.value = false
  nextTick(() => {
    shakeError.value = true
    setTimeout(() => (shakeError.value = false), 400)
  })
}

async function handleLogin() {
  if (!canLogin.value || isLoading.value) return

  isLoading.value = true
  error.value = ''

  try {
    const result = await bridge.auth.login(password.value)
    if (result.success && result.token) {
      auth.login(result.token)
      showSuccess.value = true
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } else {
      error.value = '密码错误，请重试'
      triggerShake()
    }
  } catch {
    error.value = '登录失败，请稍后重试'
    triggerShake()
  } finally {
    isLoading.value = false
  }
}

function switchTab(tab: LoginTab) {
  activeTab.value = tab
  kb.closeKeyboard()
  if (tab === 'card') {
    password.value = ''
    error.value = ''
  }
}

function onKeyboardConfirm() {
  if (kb.activeField.value === 'staffId') {
    // Staff ID confirmed → jump to password
    kb.openKeyboard('password')
  } else if (kb.activeField.value === 'password') {
    // Password confirmed → trigger login
    kb.closeKeyboard()
    handleLogin()
  } else if (kb.activeField.value === 'cardNumber') {
    kb.closeKeyboard()
  }
}

// ── NFC Card ──
type CardStatus = 'waiting' | 'reading' | 'success' | 'error'
const cardStatus = ref<CardStatus>('waiting')

function simulateCard() {
  if (cardStatus.value !== 'waiting') return
  cardStatus.value = 'reading'

  setTimeout(() => {
    const isSuccess = Math.random() > 0.3
    cardStatus.value = isSuccess ? 'success' : 'error'

    if (isSuccess) {
      staffId.value = 'EMP20240108'
      showSuccess.value = true
      // Simulate bridge login
      bridge.auth.login('card-auth').then((result) => {
        if (result.success && result.token) {
          auth.login(result.token)
          setTimeout(() => router.push('/dashboard'), 2000)
        }
      })
    } else {
      setTimeout(() => {
        cardStatus.value = 'waiting'
      }, 3000)
    }
  }, 1800)
}

const cardStatusText: Record<CardStatus, string> = {
  waiting: '请将员工卡靠近感应区',
  reading: '正在读取卡片信息...',
  success: '读卡成功，正在验证...',
  error: '读卡失败，请重试',
}

// ── Session timeout ──
let idleTimer: ReturnType<typeof setTimeout>
const showTimeout = ref(false)

function resetIdleTimer() {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(
    () => {
      showTimeout.value = true
    },
    5 * 60 * 1000,
  ) // 5 minutes
}

function dismissTimeout() {
  showTimeout.value = false
  staffId.value = ''
  password.value = ''
  error.value = ''
  resetIdleTimer()
}

onMounted(() => {
  resetIdleTimer()
  document.addEventListener('touchstart', resetIdleTimer, { passive: true })
  document.addEventListener('click', resetIdleTimer)
})

onUnmounted(() => {
  clearTimeout(idleTimer)
  document.removeEventListener('touchstart', resetIdleTimer)
  document.removeEventListener('click', resetIdleTimer)
})

// Expose for tests
defineExpose({ staffId, password, error, showSuccess, activeTab, cardStatus, showTimeout, kb })
</script>

<template>
  <div class="login-page min-h-screen flex flex-col">
    <!-- ══════════════ Status Bar ══════════════ -->
    <StatusBulb />

    <!-- ══════════════ Main Content ══════════════ -->
    <main class="login-bg flex-1 flex items-start justify-center px-4 py-10">
      <div class="w-full max-w-md login-slide-up">
        <!-- Login Card -->
        <div class="login-card rounded-3xl overflow-hidden">
          <!-- Top accent bar -->
          <div class="card-accent h-1.5 w-full"></div>

          <div class="px-8 pt-8 pb-10">
            <!-- Welcome -->
            <div class="text-center mb-7">
              <div
                class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 mb-3"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#3b82f6" opacity=".9" />
                  <path
                    d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
                    stroke="#3b82f6"
                    stroke-width="2"
                    stroke-linecap="round"
                    opacity=".6"
                  />
                </svg>
              </div>
              <h1 class="text-lg md:text-xl font-bold text-gray-800 tracking-tight">
                员工身份验证
              </h1>
              <p class="text-xs md:text-sm text-gray-400 mt-1">请选择登录方式</p>
            </div>

            <!-- Tabs -->
            <div class="flex rounded-xl bg-gray-100 p-1 gap-1 mb-7">
              <button
                v-for="t in tabs"
                :key="t.id"
                :data-testid="`tab-${t.id}`"
                class="tab-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm md:text-base font-medium transition-all duration-200"
                :class="
                  activeTab === t.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                "
                @click="switchTab(t.id)"
              >
                <!-- Lock icon -->
                <svg
                  v-if="t.icon === 'lock'"
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <!-- Card icon -->
                <svg
                  v-if="t.icon === 'card'"
                  class="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                {{ t.label }}
              </button>
            </div>

            <!-- ══════════════ Password Login ══════════════ -->
            <div v-if="activeTab === 'password'" data-testid="mode-password">
              <!-- Staff ID -->
              <div class="mb-4">
                <label
                  class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"
                  >员工工号</label
                >
                <div class="relative">
                  <div
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <div
                    data-testid="input-staff-id"
                    class="kiosk-input w-full pl-10 pr-10 py-4 rounded-xl text-xs md:text-sm font-medium cursor-pointer select-none min-h-13 flex items-center"
                    :class="kb.activeField.value === 'staffId' ? 'kiosk-input-focus' : ''"
                    @click="kb.openKeyboard('staffId')"
                  >
                    <span v-if="staffId" class="text-gray-800">{{ staffId }}</span>
                    <span v-else class="text-slate-400">请输入员工工号</span>
                  </div>
                  <button
                    v-if="staffId"
                    data-testid="clear-staff-id"
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                    @click="staffId = ''"
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Password -->
              <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                  <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest"
                    >登录密码</label
                  >
                  <button class="text-xs text-blue-500 hover:text-blue-700 font-medium">
                    忘记密码？
                  </button>
                </div>
                <div class="relative">
                  <div
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <div
                    data-testid="input-password"
                    class="kiosk-input w-full pl-10 pr-10 py-4 rounded-xl text-sm font-medium cursor-pointer select-none min-h-13 flex items-center"
                    :class="kb.activeField.value === 'password' ? 'kiosk-input-focus' : ''"
                    @click="kb.openKeyboard('password')"
                  >
                    <span v-if="password" class="text-gray-800 font-mono tracking-wider">
                      {{ showPwd ? password : '●'.repeat(password.length) }}
                    </span>
                    <span v-else class="text-slate-400">请输入登录密码</span>
                  </div>
                  <button
                    data-testid="toggle-password"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    @click="showPwd = !showPwd"
                  >
                    <!-- Eye open -->
                    <svg
                      v-if="!showPwd"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <!-- Eye closed -->
                    <svg
                      v-else
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    >
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Status hints -->
              <div class="flex justify-between mb-4 -mt-4 px-1">
                <span class="text-[11px] text-gray-400">
                  {{ staffId ? '工号已填写' : '工号未填写' }}
                </span>
                <span class="text-[11px] text-gray-400">
                  {{ password ? `已输入 ${password.length} 位` : '密码未填写' }}
                </span>
              </div>

              <!-- Error -->
              <div
                v-if="error"
                data-testid="error-msg"
                class="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5"
                :class="{ 'login-shake': shakeError }"
              >
                <svg
                  class="w-4 h-4 text-red-500 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span class="text-sm text-red-600 font-medium">{{ error }}</span>
              </div>

              <!-- Login Button -->
              <button
                data-testid="btn-login"
                :disabled="!canLogin || isLoading"
                class="btn-login w-full py-4 rounded-xl text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2.5"
                @click="handleLogin"
              >
                <svg v-if="isLoading" class="login-spinner w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" stroke-width="3" />
                  <path
                    d="M12 2a10 10 0 019.78 12"
                    stroke="white"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                </svg>
                <span>{{ isLoading ? '验证中...' : '立即登录' }}</span>
                <svg
                  v-if="!isLoading"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <!-- ══════════════ Card Login ══════════════ -->
            <div v-if="activeTab === 'card'" data-testid="mode-card">
              <div
                data-testid="nfc-zone"
                class="nfc-zone rounded-2xl p-10 flex flex-col items-center gap-5 cursor-pointer select-none mb-5"
                :class="{
                  'border-green-300!': cardStatus === 'success',
                  'border-red-300!': cardStatus === 'error',
                }"
                @click="simulateCard"
              >
                <!-- Waiting state -->
                <div
                  v-if="cardStatus === 'waiting'"
                  class="relative flex items-center justify-center"
                >
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="absolute w-20 h-20 rounded-full border-2 border-blue-300 nfc-ring"
                  ></div>
                  <div
                    class="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center z-10"
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3b82f6"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    >
                      <path d="M6 9a6 6 0 0012 0M6 15a6 6 0 0012 0M3 12h18M12 3v18" />
                      <rect x="8" y="8" width="8" height="8" rx="2" fill="#3b82f6" opacity=".12" />
                    </svg>
                  </div>
                </div>

                <!-- Reading state -->
                <div
                  v-if="cardStatus === 'reading'"
                  class="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center"
                >
                  <svg class="login-spinner w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#dbeafe" stroke-width="3" />
                    <path
                      d="M12 2a10 10 0 019.78 12"
                      stroke="#3b82f6"
                      stroke-width="3"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>

                <!-- Success state -->
                <div
                  v-if="cardStatus === 'success'"
                  class="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center"
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#dcfce7" />
                    <path
                      d="M7 13l3 3 7-7"
                      stroke="#22c55e"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>

                <!-- Error state -->
                <div
                  v-if="cardStatus === 'error'"
                  class="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center"
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#fee2e2" />
                    <line
                      x1="15"
                      y1="9"
                      x2="9"
                      y2="15"
                      stroke="#ef4444"
                      stroke-width="2.5"
                      stroke-linecap="round"
                    />
                    <line
                      x1="9"
                      y1="9"
                      x2="15"
                      y2="15"
                      stroke="#ef4444"
                      stroke-width="2.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>

                <div class="text-center">
                  <p
                    class="font-semibold text-sm"
                    :class="{
                      'text-blue-600': cardStatus === 'waiting',
                      'text-blue-700': cardStatus === 'reading',
                      'text-green-600': cardStatus === 'success',
                      'text-red-500': cardStatus === 'error',
                    }"
                  >
                    {{ cardStatusText[cardStatus] }}
                  </p>
                  <p v-if="cardStatus === 'waiting'" class="text-xs text-gray-400 mt-1">
                    点击区域模拟刷卡
                  </p>
                </div>
              </div>

              <!-- Divider -->
              <div class="flex items-center gap-3 mb-4">
                <div class="flex-1 h-px bg-gray-200"></div>
                <span class="text-xs text-gray-400">或手动输入卡号</span>
                <div class="flex-1 h-px bg-gray-200"></div>
              </div>

              <!-- Card number input -->
              <div class="relative">
                <div
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div
                  data-testid="input-card-number"
                  class="kiosk-input w-full pl-10 pr-4 py-4 rounded-xl text-sm font-mono cursor-pointer select-none min-h-13 flex items-center"
                  :class="kb.activeField.value === 'cardNumber' ? 'kiosk-input-focus' : ''"
                  @click="kb.openKeyboard('cardNumber')"
                >
                  <span v-if="kb.values.value.cardNumber" class="text-gray-800">{{
                    kb.values.value.cardNumber
                  }}</span>
                  <span v-else class="text-slate-400">EMP-202401-001</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center mt-5">
          <p class="text-xs text-gray-400">
            IT 服务台 <span class="text-blue-500 font-medium">ext. 8888</span>
          </p>
          <p class="text-[10px] text-gray-300 mt-1">© 2025 医院信息中心 · v2.4.1</p>
        </div>
      </div>
    </main>

    <!-- ══════════════ Success Popup ══════════════ -->
    <Teleport to="body">
      <div
        v-if="showSuccess"
        data-testid="success-popup"
        class="fixed inset-0 z-200 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <div class="bg-white rounded-3xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl popup-in">
          <div
            class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#dcfce7" />
              <path
                d="M7 13l3 3 7-7"
                stroke="#22c55e"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-1.5">登录成功</h2>
          <p class="text-gray-500 text-sm mb-1">
            欢迎，<span class="text-blue-600 font-bold">{{ staffId || 'Employee' }}</span>
          </p>
          <p class="text-gray-400 text-xs mb-5">正在跳转至工作台...</p>
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-green-400 rounded-full login-load-bar"></div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════ Virtual Keyboard ══════════════ -->
    <VirtualKeyboard
      v-model="kb.currentValue.value"
      :visible="kb.keyboardVisible.value"
      :input-type="kb.currentInputType.value"
      :field-label="kb.currentFieldLabel.value"
      @close="kb.closeKeyboard()"
      @confirm="onKeyboardConfirm"
    />

    <!-- ══════════════ Session Timeout Overlay ══════════════ -->
    <Teleport to="body">
      <div
        v-if="showTimeout"
        data-testid="timeout-overlay"
        class="fixed inset-0 z-300 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <div class="bg-white rounded-3xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl popup-in">
          <div
            class="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4"
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              stroke-width="2"
              stroke-linecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-1.5">会话超时</h2>
          <p class="text-gray-500 text-sm mb-5">系统检测到您已超时，请重新登录</p>
          <button
            data-testid="timeout-confirm"
            class="btn-login w-full py-3.5 rounded-xl text-white font-bold text-sm"
            @click="dismissTimeout"
          >
            确认
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ── Background ── */
.login-bg {
  background-color: #eef2f7;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.045) 1px, transparent 1px);
  background-size: 36px 36px;
}

/* ── Login Card ── */
.login-card {
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(220, 228, 240, 0.9);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 20px 60px -10px rgba(13, 27, 62, 0.12);
}

.card-accent {
  background: linear-gradient(90deg, #2563eb, #38bdf8, #2563eb);
  background-size: 200%;
  animation: gradShift 4s ease infinite;
}

@keyframes gradShift {
  0%,
  100% {
    background-position: 0%;
  }
  50% {
    background-position: 100%;
  }
}

/* ── Inputs ── */
.kiosk-input {
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  transition:
    border-color 0.18s,
    box-shadow 0.18s,
    background 0.18s;
}

.kiosk-input:focus,
.kiosk-input-focus {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.13);
}

.kiosk-input::placeholder {
  color: #94a3b8;
}

/* ── Login Button ── */
.btn-login {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transition: all 0.2s;
}

.btn-login:not(:disabled):hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  box-shadow: 0 8px 25px -5px rgba(37, 99, 235, 0.45);
  transform: translateY(-1px);
}

.btn-login:not(:disabled):active {
  transform: translateY(0);
  box-shadow: none;
}

.btn-login:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── NFC ── */
@keyframes nfc-ring {
  0% {
    transform: scale(0.85);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}

.nfc-ring {
  animation: nfc-ring 2.2s ease-out infinite;
}

.nfc-ring:nth-child(2) {
  animation-delay: 0.6s;
}

.nfc-ring:nth-child(3) {
  animation-delay: 1.2s;
}

@keyframes nfc-breathe {
  0%,
  100% {
    border-color: #93c5fd;
    background: linear-gradient(135deg, #eff6ff, #f0f9ff);
  }
  50% {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #dbeafe, #e0f2fe);
  }
}

.nfc-zone {
  border: 2.5px dashed #93c5fd;
  animation: nfc-breathe 3s ease-in-out infinite;
}

/* ── Animations ── */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-spinner {
  animation: spin 0.75s linear infinite;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}

.login-shake {
  animation: shake 0.38s ease;
}

@keyframes fadeScaleIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.popup-in {
  animation: fadeScaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes loadBar {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.login-load-bar {
  animation: loadBar 2s linear forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-slide-up {
  animation: slideUp 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) both;
}

/* ── Tab ── */
.tab-btn {
  transition:
    color 0.18s,
    background 0.18s;
}
</style>
