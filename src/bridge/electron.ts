import type { KioskBridge } from './types'

declare global {
  interface Window {
    electronAPI?: KioskBridge
  }
}

export function createElectronBridge(): KioskBridge {
  const api = window.electronAPI
  if (!api) {
    throw new Error('electronAPI not found on window, check preload script')
  }
  return api
}
