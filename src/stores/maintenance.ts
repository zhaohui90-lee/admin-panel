import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  TerminalInfo,
  ConnectionState,
  NotificationItem,
  TransactionStats,
  NetworkStatus,
  SystemResource,
  HardwareItem,
  ServiceEndpoint,
} from '@/types/maintenance'

// ── 工具函数 ────────────────────────────────────────

/** 在 [min, max] 范围内对 base 值做随机波动，结果 clamp 到 [floor, ceil] */
function fluctuate(
  base: number,
  min: number,
  max: number,
  floor = 0,
  ceil = Infinity,
): number {
  const delta = min + Math.random() * (max - min)
  return Math.max(floor, Math.min(ceil, Math.round((base + delta) * 100) / 100))
}

/** 生成 24 小时逐时交易趋势 mock 数据 */
function generateHourlyTrend(): number[] {
  // 模拟医院交易高峰：8-11点、14-16点
  const pattern = [
    2, 1, 0, 0, 1, 3, 12, 35, 78, 95, 88, 72,
    45, 55, 68, 62, 40, 25, 15, 8, 5, 3, 2, 1,
  ]
  return pattern.map((v) => v + Math.floor(Math.random() * 10))
}

// ── Store ────────────────────────────────────────────

export const useMaintenanceStore = defineStore('maintenance', () => {
  // --- 全局运维状态 ---
  const isCriticalActionProcessing = ref(false)
  const connectionState = ref<ConnectionState>('connected')
  const notifications = ref<NotificationItem[]>([])
  let notificationIdCounter = 0

  // --- 终端信息 ---
  const terminalInfo = ref<TerminalInfo>({
    deviceId: 'KSK-001',
    location: '门诊大厅 A 区',
    runStatus: 'running',
    lastSyncTime: new Date().toISOString(),
    uptime: 3 * 86400 + 7 * 3600 + 42 * 60, // 3天7小时42分
  })

  // --- 交易数据 ---
  const transactionStats = ref<TransactionStats>({
    todayTotal: 1284,
    todayAmount: 128450.0,
    successRate: 97.8,
    avgResponseMs: 85,
    hourlyTrend: generateHourlyTrend(),
  })

  // --- 网络状态 ---
  const networkStatus = ref<NetworkStatus>({
    latency: 32,
    packetLoss: 0.2,
    bandwidth: 95.5,
    dnsOk: true,
    gatewayOk: true,
  })

  // --- 系统资源 ---
  const systemResource = ref<SystemResource>({
    cpuUsage: 42,
    memUsed: 3840,
    memTotal: 8192,
    diskUsed: 45.2,
    diskTotal: 128,
    temperature: 52,
  })

  // --- 硬件自检 ---
  const hardwareItems = ref<HardwareItem[]>([
    { id: 'id-reader', name: '身份证读卡器', icon: 'id-card', status: 'ok', detail: '读写正常', lastCheck: new Date().toISOString() },
    { id: 'med-reader', name: '医保卡读卡器', icon: 'med-card', status: 'ok', detail: '设备通信正常', lastCheck: new Date().toISOString() },
    { id: 'bank-reader', name: '银行卡读卡器', icon: 'bank-card', status: 'ok', detail: '读写正常', lastCheck: new Date().toISOString() },
    { id: 'receipt-printer', name: '凭条打印机', icon: 'printer', status: 'warning', detail: '纸张剩余 30%', lastCheck: new Date().toISOString() },
    { id: 'report-printer', name: '报告打印机', icon: 'printer-report', status: 'ok', detail: '就绪', lastCheck: new Date().toISOString() },
    { id: 'card-dispenser', name: '发卡模块', icon: 'card-dispenser', status: 'error', detail: '检测到卡道阻塞', lastCheck: new Date().toISOString() },
    { id: 'scanner', name: '扫码器', icon: 'scanner', status: 'ok', detail: '就绪', lastCheck: new Date().toISOString() },
    { id: 'face-camera', name: '人脸识别相机', icon: 'camera', status: 'ok', detail: '环境光照良好', lastCheck: new Date().toISOString() },
  ])

  // --- 服务地址 ---
  const serviceEndpoints = ref<ServiceEndpoint[]>([
    { id: 'backend', label: '业务后端', url: 'https://api.hospital.local:8443', pingMs: 12, editable: true },
    { id: 'his', label: 'HIS 系统', url: 'https://his.hospital.local:9090', pingMs: 28, editable: true },
    { id: 'payment', label: '支付网关', url: 'https://pay.hospital.local:443', pingMs: 45, editable: true },
    { id: 'auth', label: '认证服务', url: 'https://auth.hospital.local:8080', pingMs: 8, editable: false },
  ])

  // --- 计算属性 ---
  const uptimeFormatted = computed(() => {
    const t = terminalInfo.value.uptime
    const days = Math.floor(t / 86400)
    const hours = Math.floor((t % 86400) / 3600)
    const minutes = Math.floor((t % 3600) / 60)
    return `${days} 天 ${hours} 时 ${minutes} 分`
  })

  const memoryPercent = computed(() =>
    Math.round((systemResource.value.memUsed / systemResource.value.memTotal) * 100),
  )

  const diskPercent = computed(() =>
    Math.round((systemResource.value.diskUsed / systemResource.value.diskTotal) * 100),
  )

  // --- 通知管理 ---
  function pushNotification(type: NotificationItem['type'], message: string, duration = 4000) {
    const id = ++notificationIdCounter
    notifications.value.push({ id, type, message, duration })
    if (duration > 0) {
      setTimeout(() => removeNotification(id), duration)
    }
  }

  function removeNotification(id: number) {
    const idx = notifications.value.findIndex((n) => n.id === id)
    if (idx !== -1) notifications.value.splice(idx, 1)
  }

  // --- 3 秒 Mock 数据波动 ---
  let fluctuationTimer: ReturnType<typeof setInterval> | null = null

  function tickFluctuation() {
    // 终端 uptime 每 3 秒 +3
    terminalInfo.value.uptime += 3

    // 交易数据波动
    const tx = transactionStats.value
    tx.todayTotal = fluctuate(tx.todayTotal, 0, 3, 0)
    tx.todayAmount = fluctuate(tx.todayAmount, 0, 250, 0)
    tx.successRate = fluctuate(tx.successRate, -0.3, 0.3, 90, 100)
    tx.avgResponseMs = fluctuate(tx.avgResponseMs, -10, 10, 20, 500)

    // 网络波动
    const net = networkStatus.value
    net.latency = fluctuate(net.latency, -8, 8, 5, 300)
    net.packetLoss = fluctuate(net.packetLoss, -0.2, 0.2, 0, 15)
    net.bandwidth = fluctuate(net.bandwidth, -2, 2, 50, 100)

    // 系统资源波动
    const sys = systemResource.value
    sys.cpuUsage = fluctuate(sys.cpuUsage, -5, 5, 5, 98)
    sys.memUsed = fluctuate(sys.memUsed, -100, 100, 1024, sys.memTotal - 256)
    sys.temperature = fluctuate(sys.temperature, -2, 2, 30, 95)

    // 服务端点 ping 波动
    for (const ep of serviceEndpoints.value) {
      if (ep.pingMs !== null) {
        ep.pingMs = fluctuate(ep.pingMs, -5, 5, 1, 200)
      }
    }
  }

  function startFluctuation() {
    stopFluctuation()
    fluctuationTimer = setInterval(tickFluctuation, 3000)
  }

  function stopFluctuation() {
    if (fluctuationTimer) {
      clearInterval(fluctuationTimer)
      fluctuationTimer = null
    }
  }

  // --- 手动同步 ---
  const isSyncing = ref(false)

  async function manualSync() {
    isSyncing.value = true
    await new Promise((resolve) => setTimeout(resolve, 2000))
    terminalInfo.value.lastSyncTime = new Date().toISOString()
    isSyncing.value = false
  }

  // --- 硬件自检 ---
  async function checkAllHardware() {
    for (const hw of hardwareItems.value) {
      if (hw.status === 'disabled') continue
      hw.status = 'checking'
      hw.detail = '正在检测...'
      // 模拟异步自检 300-800ms
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500))
      // 随机结果，大部分正常
      const roll = Math.random()
      if (roll < 0.7) {
        hw.status = 'ok'
        hw.detail = '读写正常'
      } else if (roll < 0.9) {
        hw.status = 'warning'
        hw.detail = '信号偏弱'
      } else {
        hw.status = 'error'
        hw.detail = '设备无响应'
      }
      hw.lastCheck = new Date().toISOString()
    }
  }

  async function checkSingleHardware(id: string) {
    const hw = hardwareItems.value.find((h) => h.id === id)
    if (!hw) return
    hw.status = 'checking'
    hw.detail = '正在检测...'
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))
    const roll = Math.random()
    if (roll < 0.75) {
      hw.status = 'ok'
      hw.detail = '读写正常'
    } else if (roll < 0.9) {
      hw.status = 'warning'
      hw.detail = '信号偏弱'
    } else {
      hw.status = 'error'
      hw.detail = '设备无响应'
    }
    hw.lastCheck = new Date().toISOString()
  }

  return {
    // 全局状态
    isCriticalActionProcessing,
    connectionState,
    notifications,
    // 终端信息
    terminalInfo,
    // 监控数据
    transactionStats,
    networkStatus,
    systemResource,
    hardwareItems,
    serviceEndpoints,
    // 计算属性
    uptimeFormatted,
    memoryPercent,
    diskPercent,
    // 通知
    pushNotification,
    removeNotification,
    // 波动模拟
    startFluctuation,
    stopFluctuation,
    // 同步
    isSyncing,
    manualSync,
    // 硬件
    checkAllHardware,
    checkSingleHardware,
  }
})
