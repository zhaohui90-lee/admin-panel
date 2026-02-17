import type { IBridge, SystemInfo, AppConfig } from './types'

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
  }
}
