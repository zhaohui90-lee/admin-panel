import type { IBridge, SystemInfo, AppConfig, HardwareDeviceInfo, HardwareTestResult, LogEntry, LogLevel, LogQuery, LogPage } from './types'

const MOCK_TOKEN = 'mock-token-' + Math.random().toString(36).slice(2)

function delay(ms = 500) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

// Generate mock log data
const MOCK_LOG_SOURCES = ['transaction', 'system', 'hardware', 'network', 'auth']
const MOCK_LOG_MESSAGES: Record<LogLevel, string[]> = {
  info: [
    '交易完成：挂号缴费 ¥35.00',
    '用户刷卡登录成功',
    '系统定时健康检查通过',
    '业务页面加载完成 (320ms)',
    '打印任务完成：挂号凭条',
    '医保卡读取成功：卡号 ***8821',
    '网络连接恢复正常',
    '配置同步完成',
  ],
  warn: [
    '打印纸剩余不足 40%，建议补充',
    '网络延迟升高：89ms',
    'CPU 使用率较高：78%',
    '磁盘空间不足 20%',
    '设备响应缓慢，超时 3 次重试成功',
  ],
  error: [
    '发卡模块通信超时 (Error: E02)',
    '交易失败：医保接口返回 503',
    '打印机纸道堵塞',
    '人脸识别服务连接断开',
    '数据库写入失败：磁盘空间不足',
  ],
}

function generateMockLogs(count: number): LogEntry[] {
  const now = Date.now()
  const logs: LogEntry[] = []
  for (let i = 0; i < count; i++) {
    const levels: LogLevel[] = ['info', 'info', 'info', 'info', 'warn', 'warn', 'error']
    const level = levels[Math.floor(Math.random() * levels.length)]
    const messages = MOCK_LOG_MESSAGES[level]
    logs.push({
      id: `log-${i}`,
      timestamp: now - i * 30000 - Math.floor(Math.random() * 10000),
      level,
      source: MOCK_LOG_SOURCES[Math.floor(Math.random() * MOCK_LOG_SOURCES.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
    })
  }
  return logs.sort((a, b) => b.timestamp - a.timestamp)
}

const MOCK_LOGS = generateMockLogs(80)

export function createMockBridge(): IBridge {
  return {
    auth: {
      async login(password: string) {
        await delay(300)
        if (!password) {
          return { success: false }
        }
        return { success: true, token: MOCK_TOKEN }
      },
    },

    system: {
      async getSystemInfo(_token: string): Promise<SystemInfo> {
        await delay(200)
        return {
          cpu: { model: 'Intel Core i5-8250U', usage: 12 + Math.random() * 10 },
          memory: { total: 8 * 1024 ** 3, used: 3.2 * 1024 ** 3 },
          disk: { total: 256 * 1024 ** 3, used: 89 * 1024 ** 3 },
          network: { ip: '192.168.1.82', latency: 20 + Math.random() * 15 },
          os: { platform: 'linux', version: 'Ubuntu 22.04', uptime: 86400 * 3 },
        }
      },

      async getConfig(_token: string): Promise<AppConfig> {
        await delay(200)
        return {
          serverUrl: 'http://localhost:8080',
          deviceId: 'SZ-SH-082',
          version: '2.4.0',
        }
      },
    },

    power: {
      async restartApp(_token: string) {
        await delay(1000)
        console.log('[mock] restartApp')
      },
      async quitApp(_token: string) {
        await delay(1000)
        console.log('[mock] quitApp')
      },
      async rebootOS(_token: string) {
        await delay(1000)
        console.log('[mock] rebootOS')
      },
      async shutdownOS(_token: string) {
        await delay(1000)
        console.log('[mock] shutdownOS')
      },
    },

    business: {
      async reloadPage(_token: string) {
        await delay(500)
        console.log('[mock] reloadPage')
      },
    },

    logs: {
      async getLogs(_token: string, query: LogQuery): Promise<LogPage> {
        await delay(300)
        let filtered = [...MOCK_LOGS]
        if (query.level) {
          filtered = filtered.filter((l) => l.level === query.level)
        }
        if (query.keyword) {
          const kw = query.keyword.toLowerCase()
          filtered = filtered.filter(
            (l) => l.message.toLowerCase().includes(kw) || l.source.toLowerCase().includes(kw),
          )
        }
        const start = (query.page - 1) * query.pageSize
        return {
          items: filtered.slice(start, start + query.pageSize),
          total: filtered.length,
          page: query.page,
          pageSize: query.pageSize,
        }
      },
    },

    hardware: {
      async getDevices(_token: string): Promise<HardwareDeviceInfo[]> {
        await delay(200)
        return [
          { id: 'printer', name: '凭条打印机', connected: true },
          { id: 'card-reader', name: '医保卡读卡器', connected: true },
          { id: 'card-dispenser', name: '发卡模块', connected: false },
          { id: 'camera', name: '人脸识别相机', connected: true },
        ]
      },

      async connectDevice(_token: string, deviceId: string): Promise<void> {
        await delay(500)
        console.log(`[mock] connectDevice: ${deviceId}`)
      },

      async disconnectDevice(_token: string, deviceId: string): Promise<void> {
        await delay(300)
        console.log(`[mock] disconnectDevice: ${deviceId}`)
      },

      async testDevice(_token: string, deviceId: string, command: string): Promise<HardwareTestResult> {
        await delay(800)
        console.log(`[mock] testDevice: ${deviceId} -> ${command}`)
        const responses: Record<string, string> = {
          status: `[${deviceId}] 设备状态: 正常\n固件版本: v3.2.1\n运行时间: 72h`,
          reset: `[${deviceId}] 设备已重置\n自检通过: OK`,
          test: `[${deviceId}] 执行自检...\n通信测试: PASS\n功能测试: PASS\n响应时间: 12ms`,
        }
        const output = responses[command] ?? `[${deviceId}] 执行命令: ${command}\n返回: OK`
        return { success: true, output, timestamp: Date.now() }
      },
    },
  }
}
