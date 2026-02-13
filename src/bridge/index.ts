import type { KioskBridge } from './types'
import { createMockBridge } from './mock'
import { createElectronBridge } from './electron'

let bridge: KioskBridge | null = null

export function getBridge(): KioskBridge {
  if (!bridge) {
    bridge = window.electronAPI ? createElectronBridge() : createMockBridge()
  }
  return bridge
}

export type { KioskBridge }
