import type { IBridge } from './types'

/**
 * kiosk-shell 通过 preload.ts 注入的原生 API（不可变契约）
 * 对应 ARCHITECTURE.md 中的 Host Protocol
 */
interface AdminAPI {
  login(password: string): Promise<{ success: boolean; data?: { token: string }; message?: string }>
  exitApp(token: string): Promise<{ success: boolean; message?: string }>
  restartApp(token: string): Promise<{ success: boolean; message?: string }>
  systemRestart(token: string): Promise<{ success: boolean; message?: string }>
  systemShutdown(token: string): Promise<{ success: boolean; message?: string }>
  getConfig(token: string): Promise<{ success: boolean; data?: { serverUrl: string; deviceId: string; version: string }; message?: string }>
  getSystemInfo(token: string): Promise<{ success: boolean; data?: { cpu: { model: string; usage: number }; memory: { total: number; used: number }; disk: { total: number; used: number }; network: { ip: string; latency: number }; os: { platform: string; version: string; uptime: number } }; message?: string }>
  reloadBusiness(token: string): Promise<{ success: boolean; message?: string }>
}

declare global {
  interface Window {
    adminAPI?: AdminAPI
  }
}

function unwrap<T>(result: { success: boolean; data?: T; message?: string }): T {
  if (!result.success) {
    throw new Error(result.message ?? '操作失败')
  }
  return result.data as T
}

function unwrapVoid(result: { success: boolean; message?: string }): void {
  if (!result.success) {
    throw new Error(result.message ?? '操作失败')
  }
}

export function createElectronBridge(): IBridge {
  const api = window.adminAPI
  if (!api) {
    throw new Error('adminAPI not found on window, check preload script')
  }

  return {
    auth: {
      async login(password: string) {
        const result = await api.login(password)
        if (!result.success) {
          return { success: false }
        }
        return { success: true, token: result.data?.token }
      },
    },

    system: {
      async getSystemInfo(token: string) {
        return unwrap(await api.getSystemInfo(token))
      },
      async getConfig(token: string) {
        return unwrap(await api.getConfig(token))
      },
    },

    power: {
      async restartApp(token: string) {
        unwrapVoid(await api.restartApp(token))
      },
      async quitApp(token: string) {
        unwrapVoid(await api.exitApp(token))
      },
      async rebootOS(token: string) {
        unwrapVoid(await api.systemRestart(token))
      },
      async shutdownOS(token: string) {
        unwrapVoid(await api.systemShutdown(token))
      },
    },

    business: {
      async reloadPage(token: string) {
        unwrapVoid(await api.reloadBusiness(token))
      },
    },
  }
}
