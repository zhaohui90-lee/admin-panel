<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useBridge } from '@/composables/useBridge'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useKeyboardScroll } from '@/composables/useKeyboardScroll'
import { BridgeError } from '@/bridge'
import VirtualKeyboard from '@/components/VirtualKeyboard.vue'
import type { HardwareDeviceInfo, HardwareTestResult } from '@/bridge'

const bridge = useBridge()
const auth = useAuthStore()
const toast = useToast()

// --- Device list ---
const devices = ref<HardwareDeviceInfo[]>([])
const loadingDevices = ref(false)

async function fetchDevices() {
  loadingDevices.value = true
  try {
    devices.value = await bridge.hardware.getDevices(auth.token!)
  } catch (e) {
    if (e instanceof BridgeError) {
      toast.bridgeError(e)
    } else {
      toast.error('获取设备列表失败')
    }
  } finally {
    loadingDevices.value = false
  }
}

onMounted(fetchDevices)

// --- Selected device ---
const selectedDeviceId = ref<string | null>(null)
const selectedDevice = computed(() =>
  devices.value.find((d) => d.id === selectedDeviceId.value) ?? null,
)

function selectDevice(id: string) {
  selectedDeviceId.value = id
}

// --- Connect / Disconnect ---
const connectingId = ref<string | null>(null)

async function toggleConnection(device: HardwareDeviceInfo) {
  connectingId.value = device.id
  try {
    if (device.connected) {
      await bridge.hardware.disconnectDevice(auth.token!, device.id)
      device.connected = false
      toast.success(`${device.name} 已断开`)
    } else {
      await bridge.hardware.connectDevice(auth.token!, device.id)
      device.connected = true
      toast.success(`${device.name} 已连接`)
    }
  } catch (e) {
    if (e instanceof BridgeError) {
      toast.bridgeError(e)
    } else {
      toast.error('操作失败')
    }
  } finally {
    connectingId.value = null
  }
}

// --- Command + Terminal ---
interface LogEntry {
  type: 'command' | 'result' | 'error'
  text: string
  timestamp: number
}

const commandInput = ref('')
const showKeyboard = ref(false)
const commandSectionRef = ref<HTMLElement | null>(null)

useKeyboardScroll(commandSectionRef, showKeyboard)
const sendingCommand = ref(false)
const terminalLogs = ref<LogEntry[]>([])

// --- Terminal auto-scroll ---
const terminalRef = ref<HTMLElement | null>(null)
const userScrolledUp = ref(false)
const SCROLL_THRESHOLD = 30 // px from bottom to consider "at bottom"

function onTerminalScroll() {
  if (!terminalRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = terminalRef.value
  userScrolledUp.value = scrollHeight - scrollTop - clientHeight > SCROLL_THRESHOLD
}

function scrollToBottom() {
  if (terminalRef.value) {
    terminalRef.value.scrollTop = terminalRef.value.scrollHeight
  }
  userScrolledUp.value = false
}

watch(terminalLogs, () => {
  if (!userScrolledUp.value) {
    nextTick(scrollToBottom)
  }
}, { deep: true })

const quickCommands = ['status', 'test', 'reset']

async function sendCommand(cmd?: string) {
  const command = cmd ?? commandInput.value.trim()
  if (!command || !selectedDeviceId.value) return

  const device = selectedDevice.value
  terminalLogs.value.push({
    type: 'command',
    text: `> ${device?.name ?? selectedDeviceId.value} :: ${command}`,
    timestamp: Date.now(),
  })

  sendingCommand.value = true
  commandInput.value = ''

  try {
    const result: HardwareTestResult = await bridge.hardware.testDevice(
      auth.token!,
      selectedDeviceId.value,
      command,
    )
    terminalLogs.value.push({
      type: result.success ? 'result' : 'error',
      text: result.output,
      timestamp: result.timestamp,
    })
  } catch (e) {
    const errorText = e instanceof BridgeError
      ? `[${e.code}] ${e.message}`
      : '命令执行失败：通信超时'
    terminalLogs.value.push({
      type: 'error',
      text: errorText,
      timestamp: Date.now(),
    })
  } finally {
    sendingCommand.value = false
  }
}

function clearLogs() {
  terminalLogs.value = []
}

function toggleKeyboard() {
  showKeyboard.value = !showKeyboard.value
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-4 sm:space-y-5 lg:space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-lg font-semibold text-text-primary sm:text-xl lg:text-[22px]">硬件调试</h1>
      <p class="mt-1 text-sm text-text-muted">连接设备并发送调试命令</p>
    </div>

    <!-- Device List -->
    <section class="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
      <h2 class="mb-4 flex items-center gap-2.5 text-sm font-semibold text-text-primary sm:mb-5 sm:text-[15px]">
        <span class="inline-block h-4 w-0.75 rounded-sm bg-accent/60" />
        设备列表
      </h2>

      <div v-if="loadingDevices" class="py-8 text-center text-sm text-text-muted">加载中...</div>

      <div v-else class="divide-y divide-border">
        <div
          v-for="device in devices"
          :key="device.id"
          class="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4 sm:py-4"
          data-testid="device-item"
        >
          <!-- Status + Name -->
          <div class="flex items-center gap-3 sm:w-44">
            <span
              class="h-2.5 w-2.5 shrink-0 rounded-full"
              :class="device.connected ? 'bg-emerald-500' : 'bg-gray-300'"
            />
            <span class="text-sm font-medium text-text-primary">{{ device.name }}</span>
          </div>

          <!-- Status text -->
          <div class="flex-1 pl-5.5 sm:pl-0">
            <span class="text-xs sm:text-sm" :class="device.connected ? 'text-emerald-600' : 'text-text-muted'">
              {{ device.connected ? '已连接' : '未连接' }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pl-5.5 sm:pl-0">
            <button
              class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-[13px]"
              :class="device.connected
                ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'"
              :disabled="connectingId === device.id"
              @click="toggleConnection(device)"
            >
              {{ connectingId === device.id ? '处理中...' : device.connected ? '断开' : '连接' }}
            </button>
            <button
              class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-gray-100 sm:px-4 sm:text-[13px]"
              :disabled="!device.connected"
              :class="{ 'opacity-40 cursor-not-allowed': !device.connected }"
              @click="selectDevice(device.id)"
            >
              调试
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Command Terminal (only when device selected) -->
    <section v-if="selectedDevice" class="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
      <div class="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="flex items-center gap-2.5 text-sm font-semibold text-text-primary sm:text-[15px]">
          <span class="inline-block h-4 w-0.75 rounded-sm bg-accent/60" />
          调试终端 — {{ selectedDevice.name }}
        </h2>
        <div class="flex gap-2">
          <button
            class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition-all hover:bg-gray-100 hover:text-text-secondary"
            @click="clearLogs"
          >
            清空日志
          </button>
          <button
            class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted transition-all hover:bg-gray-100 hover:text-text-secondary"
            @click="selectedDeviceId = null"
          >
            关闭终端
          </button>
        </div>
      </div>

      <!-- Quick commands -->
      <div class="mb-3 flex flex-wrap gap-2">
        <button
          v-for="cmd in quickCommands"
          :key="cmd"
          class="rounded-md border border-border bg-surface px-3 py-1 font-mono text-xs text-text-secondary transition-all hover:bg-gray-100 hover:text-text-primary"
          :disabled="sendingCommand"
          @click="sendCommand(cmd)"
        >
          {{ cmd }}
        </button>
      </div>

      <!-- Terminal output -->
      <div class="relative mb-3">
        <div
          ref="terminalRef"
          class="h-56 overflow-y-auto rounded-lg border border-gray-200 bg-slate-900 p-3 font-mono text-xs leading-relaxed tracking-wide sm:h-72 sm:p-4 sm:text-[13px] lg:text-sm"
          data-testid="terminal-output"
          @scroll="onTerminalScroll"
        >
          <div v-if="terminalLogs.length === 0" class="text-slate-500">
            等待命令输入... 可点击上方快捷命令或在下方输入自定义命令
          </div>
          <div v-for="(log, i) in terminalLogs" :key="i" class="mb-2 last:mb-0">
            <span class="mr-2 text-slate-400" data-testid="log-timestamp">{{ new Date(log.timestamp).toLocaleTimeString() }}</span>
            <span
              class="whitespace-pre-wrap"
              :class="{
                'text-blue-400': log.type === 'command',
                'text-emerald-400': log.type === 'result',
                'text-red-400': log.type === 'error',
              }"
            >{{ log.text }}</span>
          </div>
          <div v-if="sendingCommand" class="text-yellow-400 animate-pulse">执行中...</div>
        </div>
        <!-- Scroll-to-bottom hint -->
        <button
          v-if="userScrolledUp && terminalLogs.length > 0"
          class="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-accent/90 px-3 py-1 text-xs font-medium text-white shadow-md transition-all hover:bg-accent"
          data-testid="scroll-to-bottom"
          @click="scrollToBottom"
        >
          ↓ 新消息
        </button>
      </div>

      <!-- Command input -->
      <div ref="commandSectionRef" class="flex gap-2">
        <div
          class="flex min-h-10 flex-1 items-center rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-all focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--color-accent-dim)] sm:min-h-11 sm:px-4"
          @click="showKeyboard = true"
        >
          <span v-if="commandInput" class="font-mono text-text-primary">{{ commandInput }}</span>
          <span v-else class="text-text-muted">输入调试命令...</span>
        </div>
        <button
          class="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          :disabled="sendingCommand || !commandInput.trim()"
          @click="sendCommand()"
        >
          发送
        </button>
        <button
          class="shrink-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted transition-all hover:bg-gray-100"
          @click="toggleKeyboard"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="6" y1="8" x2="6.01" y2="8" />
            <line x1="10" y1="8" x2="10.01" y2="8" />
            <line x1="14" y1="8" x2="14.01" y2="8" />
            <line x1="18" y1="8" x2="18.01" y2="8" />
            <line x1="8" y1="12" x2="8.01" y2="12" />
            <line x1="12" y1="12" x2="12.01" y2="12" />
            <line x1="16" y1="12" x2="16.01" y2="12" />
            <line x1="7" y1="16" x2="17" y2="16" />
          </svg>
        </button>
      </div>
    </section>

    <!-- Virtual Keyboard -->
    <div v-if="showKeyboard && selectedDevice" class="mx-auto max-w-2xl lg:max-w-3xl">
      <VirtualKeyboard v-model="commandInput" />
    </div>
  </div>
</template>
