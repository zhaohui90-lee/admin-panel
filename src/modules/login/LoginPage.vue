<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBridge } from '@/composables/useBridge'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'

const router = useRouter()
const auth = useAuthStore()
const bridge = useBridge()

const password = ref('')
const error = ref('')
const loading = ref(false)

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
  <div class="flex h-screen items-center justify-center overflow-hidden bg-deep p-4">
    <!-- Ambient background -->
    <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_600px_400px_at_20%_50%,rgba(0,229,160,0.04),transparent),radial-gradient(ellipse_500px_500px_at_80%_30%,rgba(59,130,246,0.03),transparent)]" />

    <div class="relative z-10 flex w-full max-w-[960px] animate-[fadeIn_0.8s_ease_both] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_0_80px_rgba(0,229,160,0.03),0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-[40px]">
      <!-- Left Brand Panel -->
      <div class="relative flex w-[380px] shrink-0 flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#0a1628_0%,#0d1f3c_50%,#071222_100%)] p-10">
        <!-- Right border glow -->
        <div class="pointer-events-none absolute top-0 right-0 h-full w-px bg-[linear-gradient(to_bottom,transparent,var(--color-border-hover),transparent)]" />
        <!-- Decorative circle -->
        <div class="pointer-events-none absolute -right-20 -bottom-20 h-[300px] w-[300px] rounded-full border border-accent/[0.06]" />

        <!-- Brand -->
        <div>
          <div class="mb-2 flex items-center gap-3.5">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-accent),#00b884)] shadow-[0_0_20px_var(--color-accent-glow)]">
              <svg class="h-6 w-6 text-deep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <h2 class="bg-[linear-gradient(135deg,#fff_0%,#a0c4ff_100%)] bg-clip-text text-[22px] font-bold tracking-wide text-transparent">智慧医疗控制中心</h2>
          </div>
          <p class="ml-[58px] font-mono text-[11px] tracking-[3px] text-text-muted uppercase">Kiosk Admin Panel</p>
        </div>

        <!-- Features -->
        <div class="relative z-10 flex flex-col gap-4">
          <div class="flex items-center gap-3 rounded-[10px] border border-accent/[0.06] bg-accent/[0.04] px-4 py-3">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-dim">
              <svg class="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span class="text-[12.5px] text-text-secondary">端到端数据加密传输</span>
          </div>
          <div class="flex items-center gap-3 rounded-[10px] border border-accent/[0.06] bg-accent/[0.04] px-4 py-3">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-dim">
              <svg class="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <span class="text-[12.5px] text-text-secondary">实时设备状态监控</span>
          </div>
          <div class="flex items-center gap-3 rounded-[10px] border border-accent/[0.06] bg-accent/[0.04] px-4 py-3">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-dim">
              <svg class="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span class="text-[12.5px] text-text-secondary">符合医疗信息安全标准</span>
          </div>
        </div>

        <!-- Terminal badge -->
        <div class="relative z-10 flex items-center gap-2.5 rounded-[10px] border border-white/[0.04] bg-black/30 px-4 py-3 font-mono text-[11.5px] text-text-secondary">
          <span class="relative h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_8px_var(--color-accent-glow)]">
            <span class="absolute -inset-[3px] animate-ping rounded-full border border-accent" />
          </span>
          <span>终端 SZ-SH-082&nbsp;|&nbsp;系统在线</span>
        </div>
      </div>

      <!-- Right Auth Panel -->
      <div class="flex flex-1 flex-col bg-[linear-gradient(180deg,rgba(13,21,38,0.3)_0%,rgba(6,11,24,0.5)_100%)] px-10 py-10">
        <h3 class="mb-8 text-lg font-semibold text-text-primary">管理员登录</h3>

        <div class="flex flex-1 flex-col justify-center">
          <!-- Password display -->
          <div class="mb-2">
            <label class="mb-2 block text-xs font-medium tracking-wide text-text-secondary">管理密码</label>
            <div
              class="flex min-h-[52px] items-center rounded-[10px] border px-4 py-3 text-base transition-all duration-200"
              :class="error ? 'border-danger shadow-[0_0_0_3px_var(--color-danger-dim)]' : 'border-white/[0.06] bg-black/30 focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--color-accent-dim)]'"
            >
              <span v-if="password" class="tracking-[6px] text-text-primary">{{ '●'.repeat(password.length) }}</span>
              <span v-else class="text-text-muted">请输入管理密码</span>
            </div>
            <p v-if="error" class="mt-2 text-xs text-danger">{{ error }}</p>
          </div>

          <!-- Login button -->
          <button
            class="mt-4 flex h-[52px] w-full items-center justify-center rounded-[10px] bg-[linear-gradient(135deg,var(--color-accent),#00b884)] text-sm font-semibold tracking-wide text-deep transition-all duration-200 hover:shadow-[0_4px_20px_var(--color-accent-glow)] hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 disabled:opacity-50"
            :disabled="loading"
            @click="handleLogin"
          >
            {{ loading ? '验证中...' : '确认登录' }}
          </button>
        </div>

        <!-- Footer -->
        <div class="mt-auto pt-4 text-center font-mono text-[10.5px] tracking-wide text-text-muted">
          &copy; 2026 智慧医疗信息技术有限公司 · V2.4.0
        </div>
      </div>
    </div>

    <!-- Virtual Keyboard -->
    <div class="fixed bottom-6 left-1/2 z-20 -translate-x-1/2">
      <VirtualKeyboard v-model="password" />
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
