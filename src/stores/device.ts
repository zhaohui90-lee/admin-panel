import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getBridge } from '@/bridge'
import { useAuthStore } from './auth'
import type { SystemInfo, AppConfig } from '@/bridge'

export interface HardwareDevice {
  name: string
  status: 'online' | 'warning' | 'error'
  detail: string
  statusLabel: string
  progress?: number
}

export const useDeviceStore = defineStore('device', () => {
  const bridge = getBridge()
  const auth = useAuthStore()

  // --- System Info ---
  const systemInfo = ref<SystemInfo | null>(null)
  const config = ref<AppConfig | null>(null)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  const cpuUsage = computed(() =>
    systemInfo.value ? Math.round(systemInfo.value.cpu.usage) : 0,
  )

  const memoryPercent = computed(() => {
    if (!systemInfo.value) return 0
    return Math.round((systemInfo.value.memory.used / systemInfo.value.memory.total) * 100)
  })

  const networkLatency = computed(() =>
    systemInfo.value ? Math.round(systemInfo.value.network.latency) : 0,
  )

  // --- Hardware list (mock for now, future: from bridge) ---
  const hardwareList = ref<HardwareDevice[]>([
    { name: '凭条打印机', status: 'warning', detail: '打印纸剩余：35%', statusLabel: '建议补充', progress: 35 },
    { name: '医保卡读卡器', status: 'online', detail: '设备通信正常', statusLabel: '就绪' },
    { name: '发卡模块', status: 'error', detail: '检测到卡道阻塞 (Error: E02)', statusLabel: '故障' },
    { name: '人脸识别相机', status: 'online', detail: '环境光照良好', statusLabel: '就绪' },
  ])

  // --- Polling ---
  async function fetchSystemInfo() {
    if (!auth.token) return
    try {
      systemInfo.value = await bridge.system.getSystemInfo(auth.token)
    } catch {
      // silent — will retry on next poll
    }
  }

  async function fetchConfig() {
    if (!auth.token) return
    try {
      config.value = await bridge.system.getConfig(auth.token)
    } catch {
      // silent
    }
  }

  function startPolling(intervalMs = 5000) {
    stopPolling()
    fetchSystemInfo()
    pollTimer = setInterval(fetchSystemInfo, intervalMs)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  // --- Actions (delegated to bridge, require token) ---
  async function restartApp() {
    await bridge.power.restartApp(auth.token!)
  }

  async function quitApp() {
    await bridge.power.quitApp(auth.token!)
  }

  async function rebootOS() {
    await bridge.power.rebootOS(auth.token!)
  }

  async function shutdownOS() {
    await bridge.power.shutdownOS(auth.token!)
  }

  async function reloadPage() {
    await bridge.business.reloadPage(auth.token!)
  }

  async function updateServerUrl(url: string) {
    if (config.value) {
      config.value = { ...config.value, serverUrl: url }
    }
  }

  return {
    systemInfo,
    config,
    cpuUsage,
    memoryPercent,
    networkLatency,
    hardwareList,
    fetchSystemInfo,
    fetchConfig,
    startPolling,
    stopPolling,
    restartApp,
    quitApp,
    rebootOS,
    shutdownOS,
    reloadPage,
    updateServerUrl,
  }
})
