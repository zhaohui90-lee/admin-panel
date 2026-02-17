<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useBridge } from '@/composables/useBridge'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'
import type { AppConfig, SystemInfo } from '@/bridge'

const bridge = useBridge()
const auth = useAuthStore()
const toast = useToast()

// --- System Info (polling) ---
const systemInfo = ref<SystemInfo | null>(null)
const config = ref<AppConfig | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

async function fetchSystemInfo() {
  try {
    systemInfo.value = await bridge.system.getSystemInfo(auth.token!)
  } catch {
    // silent
  }
}

onMounted(async () => {
  try {
    config.value = await bridge.system.getConfig(auth.token!)
  } catch {
    // ignore
  }
  await fetchSystemInfo()
  pollTimer = setInterval(fetchSystemInfo, 5000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const cpuUsage = computed(() => systemInfo.value ? Math.round(systemInfo.value.cpu.usage) : 0)
const memoryPercent = computed(() => {
  if (!systemInfo.value) return 0
  return Math.round((systemInfo.value.memory.used / systemInfo.value.memory.total) * 100)
})
const networkLatency = computed(() => systemInfo.value ? Math.round(systemInfo.value.network.latency) : 0)

// --- Hardware mock data ---
interface HardwareDevice {
  name: string
  status: 'online' | 'warning' | 'error'
  detail: string
  statusLabel: string
  progress?: number
}

const hardwareList = ref<HardwareDevice[]>([
  { name: '凭条打印机', status: 'warning', detail: '打印纸剩余：35%', statusLabel: '建议补充', progress: 35 },
  { name: '医保卡读卡器', status: 'online', detail: '设备通信正常', statusLabel: '就绪' },
  { name: '发卡模块', status: 'error', detail: '检测到卡道阻塞 (Error: E02)', statusLabel: '故障' },
  { name: '人脸识别相机', status: 'online', detail: '环境光照良好', statusLabel: '就绪' },
])

// --- Confirm dialog ---
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
    toast.success('操作成功')
  } catch {
    toast.error('操作失败，请重试')
  } finally {
    confirmLoading.value = false
    confirmVisible.value = false
    confirmAction = null
  }
}

function handleCancel() {
  confirmVisible.value = false
  confirmAction = null
}

// --- Server URL editing ---
const serverUrlInput = ref('')
const serverUrlEditing = ref(false)
const serverUrlSaving = ref(false)
const showKeyboard = ref(false)

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
  serverUrlSaving.value = true
  try {
    if (config.value) {
      config.value = { ...config.value, serverUrl: serverUrlInput.value }
    }
    serverUrlEditing.value = false
    showKeyboard.value = false
    toast.success('服务地址已更新')
  } finally {
    serverUrlSaving.value = false
  }
}

// --- Power actions ---
function restartApp() {
  openConfirm('重启客户端', '确认重启自助机客户端程序？', () => bridge.power.restartApp(auth.token!))
}
function quitApp() {
  openConfirm('关闭客户端', '确认关闭自助机客户端程序？', () => bridge.power.quitApp(auth.token!))
}
function rebootMachine() {
  openConfirm('重启自助机', '确认重启自助机？设备将重新启动。', () => bridge.power.rebootOS(auth.token!))
}
function shutdownMachine() {
  openConfirm('关闭自助机', '确认关闭自助机？设备将完全断电。', () => bridge.power.shutdownOS(auth.token!))
}
function reloadPage() {
  openConfirm('刷新业务页面', '确认重新加载业务页面？', () => bridge.business.reloadPage(auth.token!))
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-4 sm:space-y-5 lg:space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-lg font-semibold tracking-wide text-text-primary sm:text-xl lg:text-[22px]">
          设备详情：<span class="font-mono font-medium text-accent">{{ config?.deviceId ?? 'SZ-SH-082' }}</span>
        </h1>
        <div class="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-text-muted sm:mt-1.5 sm:text-[11.5px]">
          <span class="inline-block h-1 w-1 rounded-full bg-text-muted" />
          最后同步 2026-02-12 14:30:05
        </div>
      </div>
      <div class="flex items-center gap-1.75 self-start rounded-full border border-accent/15 bg-accent-dim px-3 py-1.5 text-xs font-medium text-accent sm:px-4 sm:py-1.75 sm:text-[12.5px]">
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent-glow)] sm:h-1.75 sm:w-1.75" />
        运行中
      </div>
    </div>

    <!-- Status Cards Grid -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
      <!-- 今日交易数 -->
      <div class="rounded-xl border border-border bg-card p-4 backdrop-blur-sm transition-all duration-200 hover:border-border-hover sm:p-5">
        <div class="mb-2 flex items-center justify-between text-xs text-text-muted sm:text-sm">
          <span>今日交易数</span>
          <span class="text-text-muted/60">(笔)</span>
        </div>
        <div class="text-2xl font-bold text-text-primary sm:text-[28px]">1,284</div>
      </div>

      <!-- 网络延迟 -->
      <div class="rounded-xl border border-border bg-card p-4 backdrop-blur-sm transition-all duration-200 hover:border-border-hover sm:p-5">
        <div class="mb-2 flex items-center justify-between text-xs text-text-muted sm:text-sm">
          <span>网络延迟</span>
          <span class="text-text-muted/60">(Ping)</span>
        </div>
        <div class="text-2xl font-bold sm:text-[28px]" :class="networkLatency < 50 ? 'text-accent' : networkLatency < 100 ? 'text-warning' : 'text-danger'">
          {{ networkLatency }}ms
        </div>
      </div>

      <!-- CPU -->
      <div class="rounded-xl border border-border bg-card p-4 backdrop-blur-sm transition-all duration-200 hover:border-border-hover sm:col-span-2 sm:p-5 lg:col-span-1">
        <div class="mb-2 flex items-center justify-between text-xs text-text-muted sm:text-sm">
          <span>系统 CPU</span>
          <span class="text-text-muted/60">内存 {{ memoryPercent }}%</span>
        </div>
        <div class="text-2xl font-bold text-text-primary sm:text-[28px]">{{ cpuUsage }}%</div>
      </div>
    </div>

    <!-- Hardware Status List -->
    <section class="rounded-xl border border-border bg-card p-4 backdrop-blur-sm sm:p-5 lg:p-6">
      <h2 class="mb-4 flex items-center gap-2.5 text-sm font-semibold text-text-primary sm:mb-5 sm:text-[15px]">
        <span class="inline-block h-4 w-[3px] rounded-sm bg-accent" />
        硬件自检状态
      </h2>

      <div class="divide-y divide-white/[0.04]">
        <div
          v-for="device in hardwareList"
          :key="device.name"
          class="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-0 sm:py-4"
        >
          <!-- Status dot + Name -->
          <div class="flex items-center gap-3 sm:w-36 lg:w-40">
            <span
              class="h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3"
              :class="{
                'bg-accent shadow-[0_0_8px_var(--color-accent)]': device.status === 'online',
                'bg-warning shadow-[0_0_8px_var(--color-warning)]': device.status === 'warning',
                'bg-danger shadow-[0_0_8px_var(--color-danger)]': device.status === 'error',
              }"
            />
            <span class="text-sm text-text-primary">{{ device.name }}</span>
          </div>

          <!-- Detail / Progress -->
          <div class="flex-1 pl-5.5 sm:mx-4 sm:pl-0 lg:mx-5">
            <template v-if="device.progress !== undefined">
              <div class="mb-1 text-xs text-text-muted">{{ device.detail }}</div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] sm:h-2">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="{
                    'bg-accent': device.status === 'online',
                    'bg-warning': device.status === 'warning',
                    'bg-danger': device.status === 'error',
                  }"
                  :style="{ width: device.progress + '%' }"
                />
              </div>
            </template>
            <template v-else>
              <span
                class="text-xs sm:text-sm"
                :class="device.status === 'error' ? 'text-danger' : 'text-text-muted'"
              >
                {{ device.detail }}
              </span>
            </template>
          </div>

          <!-- Status label -->
          <div class="pl-5.5 sm:w-20 sm:pl-0 sm:text-right lg:w-24">
            <span
              class="text-xs font-medium sm:text-sm"
              :class="{
                'text-accent': device.status === 'online',
                'text-warning': device.status === 'warning',
                'text-danger': device.status === 'error',
              }"
            >
              {{ device.statusLabel }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Action Buttons -->
    <section class="rounded-xl border border-border bg-card p-4 backdrop-blur-sm sm:p-5 lg:p-6">
      <h2 class="mb-4 flex items-center gap-2.5 text-sm font-semibold text-text-primary sm:mb-5 sm:text-[15px]">
        <span class="inline-block h-4 w-[3px] rounded-sm bg-accent" />
        设备控制
      </h2>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        <button
          class="flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] py-3 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-white/[0.07] hover:text-text-primary sm:py-3.5 sm:text-[13px]"
          @click="reloadPage"
        >
          <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          刷新页面
        </button>
        <button
          class="flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] py-3 text-xs font-medium text-warning transition-all duration-200 hover:bg-warning-dim hover:border-warning/20 sm:py-3.5 sm:text-[13px]"
          @click="restartApp"
        >
          <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          重启客户端
        </button>
        <button
          class="flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] py-3 text-xs font-medium text-warning transition-all duration-200 hover:bg-warning-dim hover:border-warning/20 sm:py-3.5 sm:text-[13px]"
          @click="rebootMachine"
        >
          <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          重启自助机
        </button>
        <button
          class="flex items-center justify-center gap-2 rounded-lg border border-danger/15 bg-danger-dim py-3 text-xs font-medium text-danger transition-all duration-200 hover:bg-danger/[0.18] sm:py-3.5 sm:text-[13px]"
          @click="quitApp"
        >
          <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
          关闭客户端
        </button>
        <button
          class="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-danger/15 bg-danger-dim py-3 text-xs font-medium text-danger transition-all duration-200 hover:bg-danger/[0.18] sm:col-span-1 sm:py-3.5 sm:text-[13px]"
          @click="shutdownMachine"
        >
          <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          关闭自助机
        </button>
      </div>
    </section>

    <!-- Server URL Config -->
    <section class="rounded-xl border border-border bg-card p-4 backdrop-blur-sm sm:p-5 lg:p-6">
      <h2 class="mb-4 flex items-center gap-2.5 text-sm font-semibold text-text-primary sm:mb-5 sm:text-[15px]">
        <span class="inline-block h-4 w-[3px] rounded-sm bg-accent" />
        服务地址
      </h2>

      <template v-if="!serverUrlEditing">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <code class="flex-1 rounded-lg border border-white/6 bg-black/30 px-3 py-2.5 font-mono text-xs text-text-secondary sm:px-4 sm:py-3 sm:text-sm">
            {{ config?.serverUrl ?? '加载中...' }}
          </code>
          <button
            class="shrink-0 rounded-lg bg-accent-dim px-4 py-2.5 text-sm font-medium text-accent transition-all duration-200 hover:bg-accent/20 sm:px-5 sm:py-3"
            @click="startEditUrl"
          >
            修改
          </button>
        </div>
      </template>

      <template v-else>
        <div class="mb-3 flex min-h-11 items-center rounded-lg border border-accent bg-black/30 px-3 py-2.5 text-sm break-all shadow-[0_0_0_3px_var(--color-accent-dim)] sm:min-h-12 sm:px-4 sm:py-3">
          <span v-if="serverUrlInput" class="font-mono text-text-primary">{{ serverUrlInput }}</span>
          <span v-else class="text-text-muted">请输入服务地址</span>
          <span class="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent sm:h-5"></span>
        </div>
        <div class="mb-4 flex gap-2 sm:gap-3">
          <button
            class="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-white/[0.07] sm:py-3"
            @click="cancelEditUrl"
          >
            取消
          </button>
          <button
            class="flex-1 rounded-lg bg-[linear-gradient(135deg,var(--color-accent),#00b884)] py-2.5 text-sm font-semibold text-deep transition-all duration-200 hover:shadow-[0_4px_16px_var(--color-accent-glow)] disabled:opacity-50 sm:py-3"
            :disabled="serverUrlSaving || !serverUrlInput"
            @click="saveServerUrl"
          >
            {{ serverUrlSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </template>
    </section>

    <!-- Virtual Keyboard -->
    <div v-if="showKeyboard" class="flex justify-center">
      <VirtualKeyboard v-model="serverUrlInput" />
    </div>
  </div>

  <!-- Confirm Dialog -->
  <ConfirmDialog
    :visible="confirmVisible"
    :title="confirmTitle"
    :message="confirmMessage"
    :loading="confirmLoading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>
