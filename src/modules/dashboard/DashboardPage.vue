<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBridge } from '@/composables/useBridge'
import { useAuthStore } from '@/stores/auth'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'
import type { AppConfig } from '@/bridge'

const bridge = useBridge()
const auth = useAuthStore()

// --- 确认弹窗状态 ---
const confirmVisible = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmLoading = ref(false)
let confirmAction: (() => Promise<void>) | null = null

function openConfirm(title: string, message: string, action: () => Promise<void>) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction = action
  confirmVisible.value = true
}

async function handleConfirm() {
  if (!confirmAction) return
  confirmLoading.value = true
  try {
    await confirmAction()
    toast.value = { message: '操作成功', type: 'success' }
  } catch {
    toast.value = { message: '操作失败，请重试', type: 'error' }
  } finally {
    confirmLoading.value = false
    confirmVisible.value = false
    confirmAction = null
    showToast()
  }
}

function handleCancel() {
  confirmVisible.value = false
  confirmAction = null
}

// --- Toast ---
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const toastVisible = ref(false)

function showToast() {
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 2000)
}

// --- 配置信息 ---
const config = ref<AppConfig | null>(null)
const serverUrlInput = ref('')
const serverUrlEditing = ref(false)
const serverUrlSaving = ref(false)
const showKeyboard = ref(false)

onMounted(async () => {
  try {
    config.value = await bridge.system.getConfig(auth.token!)
  } catch {
    // ignore
  }
})

function startEditUrl() {
  serverUrlInput.value = config.value?.serverUrl ?? ''
  serverUrlEditing.value = true
  showKeyboard.value = true
}

function cancelEditUrl() {
  serverUrlEditing.value = false
  showKeyboard.value = false
}

async function saveServerUrl() {
  // Note: setServerUrl not in IBridge spec yet, for now just update local display
  serverUrlSaving.value = true
  try {
    if (config.value) {
      config.value = { ...config.value, serverUrl: serverUrlInput.value }
    }
    serverUrlEditing.value = false
    showKeyboard.value = false
    toast.value = { message: '服务地址已更新', type: 'success' }
    showToast()
  } finally {
    serverUrlSaving.value = false
  }
}

// --- 操作入口（所有操作传 token）---
function quitApp() {
  openConfirm('关闭客户端', '确认关闭自助机客户端程序？', () => bridge.power.quitApp(auth.token!))
}
function restartApp() {
  openConfirm('重启客户端', '确认重启自助机客户端程序？', () => bridge.power.restartApp(auth.token!))
}
function shutdownMachine() {
  openConfirm('关闭自助机', '确认关闭自助机？设备将完全断电。', () => bridge.power.shutdownOS(auth.token!))
}
function rebootMachine() {
  openConfirm('重启自助机', '确认重启自助机？设备将重新启动。', () => bridge.power.rebootOS(auth.token!))
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-5">
    <!-- Page Header -->
    <div class="mb-2 flex items-start justify-between">
      <div>
        <h1 class="text-[22px] font-semibold tracking-wide text-text-primary">
          设备详情：<span class="font-mono font-medium text-accent">{{ config?.deviceId ?? 'SZ-SH-082' }}</span>
        </h1>
        <div class="mt-1.5 flex items-center gap-1.5 font-mono text-[11.5px] text-text-muted">
          <span class="inline-block h-1 w-1 rounded-full bg-text-muted" />
          最后同步 2026-02-12 14:30:05
        </div>
      </div>
      <div class="flex items-center gap-[7px] rounded-full border border-accent/15 bg-accent-dim px-4 py-[7px] text-[12.5px] font-medium text-accent">
        <span class="inline-block h-[7px] w-[7px] rounded-full bg-accent shadow-[0_0_8px_var(--color-accent-glow)]" />
        运行中
      </div>
    </div>

    <!-- 客户端控制 -->
    <section class="rounded-[14px] border border-border bg-card p-6 backdrop-blur-[12px] transition-all duration-200 hover:border-border-hover hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <h2 class="mb-5 flex items-center gap-2.5 text-[15px] font-semibold text-text-primary">
        <span class="inline-block h-4 w-[3px] rounded-sm bg-accent" />
        客户端控制
      </h2>
      <div class="flex gap-3">
        <button
          class="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.04] py-4 text-[13px] font-medium text-warning transition-all duration-200 hover:bg-warning-dim hover:border-warning/20"
          @click="restartApp"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          重启客户端
        </button>
        <button
          class="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-danger/15 bg-danger-dim py-4 text-[13px] font-medium text-danger transition-all duration-200 hover:bg-danger/[0.18] hover:shadow-[0_4px_16px_rgba(244,63,94,0.15)]"
          @click="quitApp"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
          关闭客户端
        </button>
      </div>
    </section>

    <!-- 自助机控制 -->
    <section class="rounded-[14px] border border-border bg-card p-6 backdrop-blur-[12px] transition-all duration-200 hover:border-border-hover hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <h2 class="mb-5 flex items-center gap-2.5 text-[15px] font-semibold text-text-primary">
        <span class="inline-block h-4 w-[3px] rounded-sm bg-accent" />
        自助机控制
      </h2>
      <div class="flex gap-3">
        <button
          class="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.04] py-4 text-[13px] font-medium text-warning transition-all duration-200 hover:bg-warning-dim hover:border-warning/20"
          @click="rebootMachine"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          重启自助机
        </button>
        <button
          class="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-danger/15 bg-danger-dim py-4 text-[13px] font-medium text-danger transition-all duration-200 hover:bg-danger/[0.18] hover:shadow-[0_4px_16px_rgba(244,63,94,0.15)]"
          @click="shutdownMachine"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          关闭自助机
        </button>
      </div>
    </section>

    <!-- 服务地址配置 -->
    <section class="rounded-[14px] border border-border bg-card p-6 backdrop-blur-[12px] transition-all duration-200 hover:border-border-hover hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <h2 class="mb-5 flex items-center gap-2.5 text-[15px] font-semibold text-text-primary">
        <span class="inline-block h-4 w-[3px] rounded-sm bg-accent" />
        服务地址
      </h2>

      <template v-if="!serverUrlEditing">
        <div class="flex items-center gap-3">
          <code class="flex-1 rounded-[10px] border border-white/[0.06] bg-black/30 px-4 py-3 font-mono text-sm text-text-secondary">
            {{ config?.serverUrl ?? '加载中...' }}
          </code>
          <button
            class="shrink-0 rounded-[10px] bg-accent-dim px-5 py-3 text-sm font-medium text-accent transition-all duration-200 hover:bg-accent/20"
            @click="startEditUrl"
          >
            修改
          </button>
        </div>
      </template>

      <template v-else>
        <div
          class="mb-3 flex min-h-12 items-center rounded-[10px] border border-accent bg-black/30 px-4 py-3 text-sm break-all shadow-[0_0_0_3px_var(--color-accent-dim)]"
        >
          <span v-if="serverUrlInput" class="font-mono text-text-primary">{{ serverUrlInput }}</span>
          <span v-else class="text-text-muted">请输入服务地址</span>
          <span class="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-accent"></span>
        </div>
        <div class="mb-4 flex gap-3">
          <button
            class="flex-1 rounded-[10px] border border-white/[0.08] bg-white/[0.04] py-3 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-white/[0.07]"
            @click="cancelEditUrl"
          >
            取消
          </button>
          <button
            class="flex-1 rounded-[10px] bg-[linear-gradient(135deg,var(--color-accent),#00b884)] py-3 text-sm font-semibold text-deep transition-all duration-200 hover:shadow-[0_4px_16px_var(--color-accent-glow)] disabled:opacity-50"
            :disabled="serverUrlSaving || !serverUrlInput"
            @click="saveServerUrl"
          >
            {{ serverUrlSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </template>
    </section>

    <!-- 虚拟键盘 -->
    <div v-if="showKeyboard" class="flex justify-center">
      <VirtualKeyboard v-model="serverUrlInput" />
    </div>
  </div>

  <!-- 确认弹窗 -->
  <ConfirmDialog
    :visible="confirmVisible"
    :title="confirmTitle"
    :message="confirmMessage"
    :loading="confirmLoading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />

  <!-- Toast -->
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="toastVisible && toast"
        class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl px-6 py-3 text-sm font-medium shadow-lg"
        :class="toast.type === 'success' ? 'bg-accent text-deep' : 'bg-danger text-white'"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
