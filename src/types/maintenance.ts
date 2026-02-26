// ============================================================
// 运维仪表盘数据模型
// 对应 docs/issue/06-dashboard-zh.md 规格定义
// ============================================================

/** 终端运行状态 */
export type RunStatus = 'running' | 'warning' | 'error' | 'offline'

/** 终端基础信息 */
export interface TerminalInfo {
  deviceId: string // 'KSK-001'
  location: string // '门诊大厅 A 区'
  runStatus: RunStatus
  lastSyncTime: string // ISO 时间字符串
  uptime: number // 运行秒数
}

/** 连接状态 */
export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected'

/** 通知条目 */
export interface NotificationItem {
  id: number
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  duration?: number // ms，不设则默认 4000
}

/** 交易数据 */
export interface TransactionStats {
  todayTotal: number // 今日总交易笔数
  todayAmount: number // 今日总金额（元）
  successRate: number // 成功率 0-100
  avgResponseMs: number // 平均响应时长 ms
  hourlyTrend: number[] // 24 小时逐时笔数
}

/** 网络状态 */
export interface NetworkStatus {
  latency: number // ms
  packetLoss: number // % 0-100
  bandwidth: number // Mbps
  dnsOk: boolean
  gatewayOk: boolean
}

/** 系统资源 */
export interface SystemResource {
  cpuUsage: number // % 0-100
  memUsed: number // MB
  memTotal: number // MB
  diskUsed: number // GB
  diskTotal: number // GB
  temperature: number // CPU 温度 °C
}

/** 硬件自检状态 */
export type HardwareStatus = 'ok' | 'warning' | 'error' | 'checking' | 'disabled'

/** 硬件自检条目 */
export interface HardwareItem {
  id: string
  name: string
  icon: string // SVG path 或 emoji
  status: HardwareStatus
  detail: string // 状态描述，如 '读写正常' | '纸张剩余 30%'
  lastCheck: string // ISO 时间字符串
}

/** 服务地址 */
export interface ServiceEndpoint {
  id: string
  label: string // '业务后端' | 'HIS 系统' | '支付网关' 等
  url: string
  pingMs: number | null // null 表示未连通
  editable: boolean
}
