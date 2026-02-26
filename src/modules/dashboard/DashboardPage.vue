<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDeviceStore } from '@/stores/device'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useToast } from '@/composables/useToast'
import { useKeyboardScroll } from '@/composables/useKeyboardScroll'
import { BridgeError } from '@/bridge'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'
import TouchButton from '@/components/TouchButton.vue'
import TouchInput from '@/components/TouchInput.vue'
import DeviceInfoBanner from './components/DeviceInfoBanner.vue'
import TransactionCard from './components/TransactionCard.vue'
import NetworkCard from './components/NetworkCard.vue'
import SystemResourceCard from './components/SystemResourceCard.vue'
import HardwareCheckPanel from './components/HardwareCheckPanel.vue'

const device = useDeviceStore()
const maintenance = useMaintenanceStore()
const toast = useToast()

// --- Lifecycle: init data + polling ---
onMounted(async () => {
  await device.fetchConfig()
  device.startPolling(5000)
  maintenance.startFluctuation()
})

onUnmounted(() => {
  device.stopPolling()
  maintenance.stopFluctuation()
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
const urlSectionRef = ref<HTMLElement | null>(null)

useKeyboardScroll(urlSectionRef, showKeyboard)

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
      <!-- ── Device Info Banner ────────────────────────── -->
      <DeviceInfoBanner />

      <!-- ── Monitor Cards (3-col grid) ─────────────────── -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5" data-testid="monitor-cards">
        <TransactionCard />
        <NetworkCard />
        <SystemResourceCard />
      </div>

      <!-- ── Hardware Check Panel ──────────────────────── -->
      <HardwareCheckPanel />

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
        ref="urlSectionRef"
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
      <VirtualKeyboard
        v-model="serverUrlInput"
        :visible="showKeyboard"
        input-type="ip"
        field-label="服务地址"
        @close="cancelEditUrl"
        @confirm="saveServerUrl"
      />
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
