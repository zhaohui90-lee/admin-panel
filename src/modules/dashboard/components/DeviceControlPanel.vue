<script setup lang="ts">
import { ref } from 'vue'
import { useDeviceStore } from '@/stores/device'
import { useMaintenanceStore } from '@/stores/maintenance'
import { useToast } from '@/composables/useToast'
import { BridgeError } from '@/bridge'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const device = useDeviceStore()
const maintenance = useMaintenanceStore()
const toast = useToast()

// --- 统一弹窗确认 ---
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogLoading = ref(false)
let pendingAction: (() => Promise<void>) | null = null

function openDialog(title: string, message: string, action: () => Promise<void>) {
  dialogTitle.value = title
  dialogMessage.value = message
  pendingAction = action
  dialogVisible.value = true
}

async function handleConfirm() {
  if (!pendingAction) return
  dialogLoading.value = true
  maintenance.isCriticalActionProcessing = true
  try {
    await pendingAction()
    toast.success('操作成功')
  } catch (e) {
    if (e instanceof BridgeError) toast.bridgeError(e)
    else toast.error('操作失败，请重试')
  } finally {
    dialogLoading.value = false
    dialogVisible.value = false
    pendingAction = null
    maintenance.isCriticalActionProcessing = false
  }
}

function handleCancel() {
  dialogVisible.value = false
  pendingAction = null
}

// --- 4 个操作 ---
const actions = [
  {
    key: 'restartApp',
    label: '重启客户端',
    icon: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
    title: '重启客户端',
    message: '确认重启自助机客户端程序？',
    action: () => device.restartApp(),
  },
  {
    key: 'quitApp',
    label: '关闭客户端',
    icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>',
    color: '#f87171',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
    title: '关闭客户端',
    message: '确认关闭自助机客户端程序？',
    action: () => device.quitApp(),
  },
  {
    key: 'shutdownOS',
    label: '关闭终端',
    icon: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.3)',
    title: '关闭终端',
    message: '此操作将完全关闭自助机终端设备，需要人工到场重新开机。',
    action: () => device.shutdownOS(),
  },
  {
    key: 'rebootOS',
    label: '重启终端',
    icon: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.3)',
    title: '重启终端',
    message: '此操作将重启自助机终端设备，重启期间服务不可用。',
    action: () => device.rebootOS(),
  },
]
</script>

<template>
  <section
    class="rounded-2xl border"
    style="background: rgba(30,41,59,0.6); border-color: rgba(255,255,255,0.06);"
    data-testid="device-control-panel"
  >
    <!-- 标题栏 -->
    <div
      class="flex items-center border-b px-5 py-4 lg:px-6"
      style="border-color: rgba(255,255,255,0.06);"
    >
      <h2 class="flex items-center gap-2.5 text-sm font-bold text-white">
        <span class="h-4 w-1 rounded-sm" style="background: #2563eb;" />
        设备控制
      </h2>
    </div>

    <div class="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4 lg:gap-4 lg:p-5">
      <button
        v-for="act in actions"
        :key="act.key"
        class="flex h-14 w-full flex-col items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:brightness-125"
        :style="{
          background: act.bg,
          color: act.color,
          border: `1px solid ${act.border}`,
        }"
        :data-testid="`btn-${act.key}`"
        @click="openDialog(act.title, act.message, act.action)"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" v-html="act.icon" />
        {{ act.label }}
      </button>
    </div>
  </section>

  <ConfirmDialog
    :visible="dialogVisible"
    :title="dialogTitle"
    :message="dialogMessage"
    :loading="dialogLoading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>
