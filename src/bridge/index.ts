import type { IBridge } from './types'
import { createMockBridge } from './mock'
import { createElectronBridge } from './electron'

let bridge: IBridge | null = null

export function getBridge(): IBridge {
  if (!bridge) {
    bridge = window.adminAPI ? createElectronBridge() : createMockBridge()
  }
  return bridge
}

export type { IBridge, LoginResult, SystemInfo, AppConfig, HardwareDeviceInfo, HardwareTestResult, LogLevel, LogEntry, LogQuery, LogPage } from './types'
