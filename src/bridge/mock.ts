import type { IBridge, SystemInfo, AppConfig, HardwareDeviceInfo, HardwareTestResult } from './types'

const MOCK_TOKEN = 'mock-token-' + Math.random().toString(36).slice(2)

function delay(ms = 500) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

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
