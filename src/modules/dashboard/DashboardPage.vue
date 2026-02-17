<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDeviceStore } from '@/stores/device'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'

const device = useDeviceStore()
const toast = useToast()

// --- Lifecycle: init data + polling ---
onMounted(async () => {
  await device.fetchConfig()
  device.startPolling(5000)
})

onUnmounted(() => {
  device.stopPolling()
})

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
  serverUrlInput.value = device.config?.serverUrl ?? ''
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
    await device.updateServerUrl(serverUrlInput.value)
    serverUrlEditing.value = false
    showKeyboard.value = false
    toast.success('服务地址已更新')
  } finally {
    serverUrlSaving.value = false
  }
}

// --- Power actions (via confirm dialog) ---
function onReloadPage() {
  openConfirm('刷新业务页面', '确认重新加载业务页面？', () => device.reloadPage())
}
function onRestartApp() {
  openConfirm('重启客户端', '确认重启自助机客户端程序？', () => device.restartApp())
}
function onRebootOS() {
  openConfirm('重启自助机', '确认重启自助机？设备将重新启动。', () => device.rebootOS())
}
function onQuitApp() {
  openConfirm('关闭客户端', '确认关闭自助机客户端程序？', () => device.quitApp())
}
function onShutdownOS() {
  openConfirm('关闭自助机', '确认关闭自助机？设备将完全断电。', () => device.shutdownOS())
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-4 sm:space-y-5 lg:space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-lg font-semibold tracking-wide text-text-primary sm:text-xl lg:text-[22px]">
          设备详情：<span class="font-mono font-medium text-accent">{{ device.config?.deviceId ?? 'SZ-SH-082' }}</span>
        </h1>
        <div class="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-text-muted sm:mt-1.5 sm:text-[11.5px]">
          <span class="inline-block h-1 w-1 rounded-full bg-text-muted" />
          最后同步 2026-02-12 14:30:05
        </div>
      </div>
      <div class="flex items-center gap-1.75 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 sm:px-4 sm:py-1.75 sm:text-[12.5px]">
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 sm:h-1.75 sm:w-1.75" />
        运行中
      </div>
    </div>

    <!-- Status Cards Grid -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
      <!-- 今日交易数 -->
      <div class="rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:p-5">
        <div class="mb-2 flex items-center justify-between text-xs text-text-muted sm:text-sm">
          <span>今日交易数</span>
          <span class="text-text-muted/60">(笔)</span>
        </div>
        <div class="text-2xl font-bold text-text-primary sm:text-[28px]">1,284</div>
      </div>

      <!-- 网络延迟 -->
      <div class="rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:p-5">
        <div class="mb-2 flex items-center justify-between text-xs text-text-muted sm:text-sm">
          <span>网络延迟</span>
          <span class="text-text-muted/60">(Ping)</span>
        </div>
        <div class="text-2xl font-bold sm:text-[28px]" :class="device.networkLatency < 50 ? 'text-emerald-500' : device.networkLatency < 100 ? 'text-warning' : 'text-danger'">
          {{ device.networkLatency }}ms
        </div>
      </div>

      <!-- CPU -->
      <div class="rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:col-span-2 sm:p-5 lg:col-span-1">
        <div class="mb-2 flex items-center justify-between text-xs text-text-muted sm:text-sm">
          <span>系统 CPU</span>
          <span class="text-text-muted/60">内存 {{ device.memoryPercent }}%</span>
        </div>
        <div class="text-2xl font-bold text-text-primary sm:text-[28px]">{{ device.cpuUsage }}%</div>
      </div>
    </div>

    <!-- Hardware Status List -->
    <section class="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
      <h2 class="mb-4 flex items-center gap-2.5 text-sm font-semibold text-text-primary sm:mb-5 sm:text-[15px]">
        <span class="inline-block h-4 w-[3px] rounded-sm bg-accent/60" />
        硬件自检状态
      </h2>

      <div class="divide-y divide-border">
        <div
          v-for="hw in device.hardwareList"
          :key="hw.name"
          class="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-0 sm:py-4"
        >
          <!-- Status dot + Name -->
          <div class="flex items-center gap-3 sm:w-36 lg:w-40">
            <span
              class="h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3"
              :class="{
                'bg-emerald-500': hw.status === 'online',
                'bg-warning': hw.status === 'warning',
                'bg-danger': hw.status === 'error',
              }"
            />
            <span class="text-sm text-text-primary">{{ hw.name }}</span>
          </div>

          <!-- Detail / Progress -->
          <div class="flex-1 pl-5.5 sm:mx-4 sm:pl-0 lg:mx-5">
            <template v-if="hw.progress !== undefined">
              <div class="mb-1 text-xs text-text-muted">{{ hw.detail }}</div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 sm:h-2">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="{
                    'bg-emerald-500': hw.status === 'online',
                    'bg-warning': hw.status === 'warning',
                    'bg-danger': hw.status === 'error',
                  }"
                  :style="{ width: hw.progress + '%' }"
                />
              </div>
            </template>
            <template v-else>
              <span
                class="text-xs sm:text-sm"
                :class="hw.status === 'error' ? 'text-danger' : 'text-text-muted'"
              >
                {{ hw.detail }}
              </span>
            </template>
          </div>

          <!-- Status label -->
          <div class="pl-5.5 sm:w-20 sm:pl-0 sm:text-right lg:w-24">
            <span
              class="text-xs font-medium sm:text-sm"
              :class="{
                'text-emerald-600': hw.status === 'online',
                'text-warning': hw.status === 'warning',
                'text-danger': hw.status === 'error',
              }"
            >
              {{ hw.statusLabel }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Action Buttons -->
    <section class="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
      <h2 class="mb-4 flex items-center gap-2.5 text-sm font-semibold text-text-primary sm:mb-5 sm:text-[15px]">
        <span class="inline-block h-4 w-[3px] rounded-sm bg-accent/60" />
        设备控制
      </h2>

      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
        <button
          class="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface py-3 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-gray-100 hover:text-text-primary sm:py-3.5 sm:text-[13px]"
          @click="onReloadPage"
        >
          <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          刷新页面
        </button>
        <button
          class="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 py-3 text-xs font-medium text-amber-700 transition-all duration-200 hover:bg-amber-100 sm:py-3.5 sm:text-[13px]"
          @click="onRestartApp"
        >
          <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          重启客户端
        </button>
        <button
          class="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 py-3 text-xs font-medium text-amber-700 transition-all duration-200 hover:bg-amber-100 sm:py-3.5 sm:text-[13px]"
          @click="onRebootOS"
        >
          <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          重启自助机
        </button>
        <button
          class="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-3 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-100 sm:py-3.5 sm:text-[13px]"
          @click="onQuitApp"
        >
          <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
          关闭客户端
        </button>
        <button
          class="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-3 text-xs font-medium text-red-600 transition-all duration-200 hover:bg-red-100 sm:col-span-1 sm:py-3.5 sm:text-[13px]"
          @click="onShutdownOS"
        >
          <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          关闭自助机
        </button>
      </div>
    </section>

    <!-- Server URL Config -->
    <section class="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
      <h2 class="mb-4 flex items-center gap-2.5 text-sm font-semibold text-text-primary sm:mb-5 sm:text-[15px]">
        <span class="inline-block h-4 w-[3px] rounded-sm bg-accent/60" />
        服务地址
      </h2>

      <template v-if="!serverUrlEditing">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <code class="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-xs text-text-secondary sm:px-4 sm:py-3 sm:text-sm">
            {{ device.config?.serverUrl ?? '加载中...' }}
          </code>
          <button
            class="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 sm:px-5 sm:py-3"
            @click="startEditUrl"
          >
            修改
          </button>
        </div>
      </template>

      <template v-else>
        <div class="mb-3 flex min-h-11 items-center rounded-lg border border-accent bg-surface px-3 py-2.5 text-sm break-all shadow-[0_0_0_3px_var(--color-accent-dim)] sm:min-h-12 sm:px-4 sm:py-3">
          <span v-if="serverUrlInput" class="font-mono text-text-primary">{{ serverUrlInput }}</span>
          <span v-else class="text-text-muted">请输入服务地址</span>
          <span class="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent sm:h-5"></span>
        </div>
        <div class="mb-4 flex gap-2 sm:gap-3">
          <button
            class="flex-1 rounded-lg border border-border bg-surface py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-gray-100 sm:py-3"
            @click="cancelEditUrl"
          >
            取消
          </button>
          <button
            class="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 sm:py-3"
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
