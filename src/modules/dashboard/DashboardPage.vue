<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDeviceStore } from '@/stores/device'
import { useToast } from '@/composables/useToast'
import { BridgeError } from '@/bridge'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'
import TouchButton from '@/components/TouchButton.vue'
import TouchInput from '@/components/TouchInput.vue'

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
  } catch (e) {
    if (e instanceof BridgeError) {
      toast.bridgeError(e)
    } else {
      toast.error('操作失败，请重试')
    }
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

// --- Power actions ---
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
  <div>
    <div class="mx-auto max-w-5xl space-y-5 lg:space-y-6">
      <!-- ── Page Header ───────────────────────────────── -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            class="text-xl font-bold tracking-wide lg:text-2xl"
            style="color: var(--color-text-primary)"
          >
            设备详情：
            <span class="font-mono font-medium" style="color: var(--color-accent)">
              {{ device.config?.deviceId ?? 'SZ-SH-082' }}
            </span>
          </h1>
          <p class="mt-1 font-mono text-xs lg:text-sm" style="color: var(--color-text-muted)">
            最后同步 2026-02-12 14:30:05
          </p>
        </div>
        <div
          class="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 lg:px-5 lg:py-2.5 lg:text-base"
        >
          <span class="h-2 w-2 rounded-full bg-emerald-500 lg:h-2.5 lg:w-2.5" />
          运行中
        </div>
      </div>

      <!-- ── Status Cards ──────────────────────────────── -->
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        data-testid="status-cards"
      >
        <!-- 今日交易数 -->
        <div
          class="flex min-h-[120px] flex-col justify-between rounded-2xl border p-6 shadow-sm lg:min-h-[140px] lg:p-8"
          style="background: var(--color-card); border-color: var(--color-border)"
          data-testid="card-transactions"
        >
          <div
            class="flex items-center justify-between text-sm lg:text-base"
            style="color: var(--color-text-muted)"
          >
            <span>今日交易数</span>
            <span class="opacity-60">(笔)</span>
          </div>
          <div class="text-4xl font-bold lg:text-5xl" style="color: var(--color-text-primary)">
            1,284
          </div>
        </div>

        <!-- 网络延迟 -->
        <div
          class="flex min-h-[120px] flex-col justify-between rounded-2xl border p-6 shadow-sm lg:min-h-[140px] lg:p-8"
          style="background: var(--color-card); border-color: var(--color-border)"
          data-testid="card-latency"
        >
          <div
            class="flex items-center justify-between text-sm lg:text-base"
            style="color: var(--color-text-muted)"
          >
            <span>网络延迟</span>
            <span class="opacity-60">(Ping)</span>
          </div>
          <div
            class="text-4xl font-bold lg:text-5xl"
            :style="{
              color:
                device.networkLatency < 50
                  ? 'var(--color-success)'
                  : device.networkLatency < 100
                    ? 'var(--color-warning)'
                    : 'var(--color-danger)',
            }"
            data-testid="latency-value"
          >
            {{ device.networkLatency }}ms
          </div>
        </div>

        <!-- 系统 CPU -->
        <div
          class="flex min-h-[120px] flex-col justify-between rounded-2xl border p-6 shadow-sm sm:col-span-2 lg:col-span-1 lg:min-h-[140px] lg:p-8"
          style="background: var(--color-card); border-color: var(--color-border)"
          data-testid="card-cpu"
        >
          <div
            class="flex items-center justify-between text-sm lg:text-base"
            style="color: var(--color-text-muted)"
          >
            <span>系统 CPU</span>
            <span class="opacity-60">内存 {{ device.memoryPercent }}%</span>
          </div>
          <div class="text-4xl font-bold lg:text-5xl" style="color: var(--color-text-primary)">
            {{ device.cpuUsage }}%
          </div>
        </div>
      </div>

      <!-- ── Hardware Status List ──────────────────────── -->
      <section
        class="rounded-2xl border shadow-sm"
        style="background: var(--color-card); border-color: var(--color-border)"
        data-testid="hw-list"
      >
        <div class="border-b px-6 py-5 lg:px-8 lg:py-6" style="border-color: var(--color-border)">
          <h2
            class="flex items-center gap-3 text-base font-bold lg:text-lg"
            style="color: var(--color-text-primary)"
          >
            <span
              class="h-5 w-1 rounded-sm"
              style="background: var(--color-accent); opacity: 0.7"
            />
            硬件自检状态
          </h2>
        </div>

        <div class="divide-y" style="border-color: var(--color-border)">
          <div
            v-for="hw in device.hardwareList"
            :key="hw.name"
            class="flex min-h-[64px] flex-col justify-center gap-2 px-6 py-4 lg:min-h-[72px] lg:flex-row lg:items-center lg:gap-0 lg:px-8"
            data-testid="hw-item"
          >
            <!-- Status indicator + Name -->
            <div class="flex items-center gap-4 lg:w-44">
              <!-- Glow dot -->
              <span
                class="h-4 w-4 shrink-0 rounded-full"
                :class="{
                  'bg-success': hw.status === 'online',
                  'bg-warning': hw.status === 'warning',
                  'bg-danger': hw.status === 'error',
                }"
                :style="{
                  boxShadow:
                    hw.status === 'online'
                      ? '0 0 8px rgba(34,197,94,0.6)'
                      : hw.status === 'warning'
                        ? '0 0 8px rgba(245,158,11,0.6)'
                        : '0 0 8px rgba(239,68,68,0.6)',
                }"
              />
              <span
                class="text-base font-medium lg:text-lg"
                style="color: var(--color-text-primary)"
                >{{ hw.name }}</span
              >
            </div>

            <!-- Detail / Progress -->
            <div class="flex-1 pl-8 lg:mx-6 lg:pl-0">
              <template v-if="hw.progress !== undefined">
                <div class="mb-2 text-sm lg:text-base" style="color: var(--color-text-muted)">
                  {{ hw.detail }}
                </div>
                <div
                  class="h-3 w-full overflow-hidden rounded-full lg:h-4"
                  style="background: #e2e8f0"
                >
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="{
                      'bg-success': hw.status === 'online',
                      'bg-warning': hw.status === 'warning',
                      'bg-danger': hw.status === 'error',
                    }"
                    :style="{ width: hw.progress + '%' }"
                  />
                </div>
              </template>
              <template v-else>
                <span
                  v-if="hw.errorCode"
                  class="mr-2 inline-block rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-red-700"
                  data-testid="hw-error-code"
                >{{ hw.errorCode }}</span>
                <span
                  class="text-sm lg:text-base"
                  :style="{
                    color:
                      hw.status === 'error' ? 'var(--color-danger)' : 'var(--color-text-muted)',
                  }"
                >
                  {{ hw.detail }}
                </span>
              </template>
            </div>

            <!-- Status label -->
            <div class="pl-8 lg:w-24 lg:pl-0 lg:text-right">
              <span
                class="text-sm font-semibold lg:text-base"
                :class="{
                  'text-success': hw.status === 'online',
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

      <!-- ── Action Buttons ────────────────────────────── -->
      <section
        class="rounded-2xl border shadow-sm"
        style="background: var(--color-card); border-color: var(--color-border)"
      >
        <div class="border-b px-6 py-5 lg:px-8 lg:py-6" style="border-color: var(--color-border)">
          <h2
            class="flex items-center gap-3 text-base font-bold lg:text-lg"
            style="color: var(--color-text-primary)"
          >
            <span
              class="h-5 w-1 rounded-sm"
              style="background: var(--color-accent); opacity: 0.7"
            />
            设备控制
          </h2>
        </div>

        <div
          class="grid grid-cols-2 gap-4 p-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5 lg:p-8"
          data-testid="action-buttons"
        >
          <TouchButton data-testid="btn-reload-page" @click="onReloadPage">
            <svg
              class="h-5 w-5 lg:h-6 lg:w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            刷新页面
          </TouchButton>

          <TouchButton variant="warning" data-testid="btn-restart-app" @click="onRestartApp">
            <svg
              class="h-5 w-5 lg:h-6 lg:w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            重启客户端
          </TouchButton>

          <TouchButton variant="warning" data-testid="btn-reboot-os" @click="onRebootOS">
            <svg
              class="h-5 w-5 lg:h-6 lg:w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            重启自助机
          </TouchButton>

          <TouchButton variant="danger" data-testid="btn-quit-app" @click="onQuitApp">
            <svg
              class="h-5 w-5 lg:h-6 lg:w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
            关闭客户端
          </TouchButton>

          <!-- col-span-2 on mobile so last item isn't lonely -->
          <div class="col-span-2 sm:col-span-1">
            <TouchButton variant="danger" data-testid="btn-shutdown-os" @click="onShutdownOS">
              <svg
                class="h-5 w-5 lg:h-6 lg:w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
              关闭自助机
            </TouchButton>
          </div>
        </div>
      </section>

      <!-- ── Server URL Config ─────────────────────────── -->
      <section
        class="rounded-2xl border shadow-sm"
        style="background: var(--color-card); border-color: var(--color-border)"
      >
        <div class="border-b px-6 py-5 lg:px-8 lg:py-6" style="border-color: var(--color-border)">
          <h2
            class="flex items-center gap-3 text-base font-bold lg:text-lg"
            style="color: var(--color-text-primary)"
          >
            <span
              class="h-5 w-1 rounded-sm"
              style="background: var(--color-accent); opacity: 0.7"
            />
            服务地址
          </h2>
        </div>

        <div class="p-6 lg:p-8">
          <!-- Display mode -->
          <template v-if="!serverUrlEditing">
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
              data-testid="url-display"
            >
              <code
                class="flex-1 rounded-xl border px-4 py-3 font-mono text-sm lg:py-4 lg:text-base"
                style="
                  background: var(--color-deep);
                  border-color: var(--color-border);
                  color: var(--color-text-secondary);
                "
              >
                {{ device.config?.serverUrl ?? '加载中...' }}
              </code>
              <div class="shrink-0 sm:w-32">
                <TouchButton variant="primary" data-testid="btn-edit-url" @click="startEditUrl">
                  修改
                </TouchButton>
              </div>
            </div>
          </template>

          <!-- Edit mode -->
          <template v-else>
            <div class="space-y-4" data-testid="url-edit-mode">
              <TouchInput v-model="serverUrlInput" placeholder="请输入服务地址" />
              <div class="grid grid-cols-2 gap-4">
                <TouchButton @click="cancelEditUrl">取消</TouchButton>
                <TouchButton
                  variant="primary"
                  :loading="serverUrlSaving"
                  :disabled="!serverUrlInput"
                  @click="saveServerUrl"
                >
                  保存
                </TouchButton>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- Virtual Keyboard -->
      <div v-if="showKeyboard" class="flex justify-center pb-4">
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
  </div>
</template>
