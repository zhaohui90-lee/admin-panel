import { ref } from 'vue'
import { BridgeError } from '@/bridge'

export type ToastType = 'success' | 'error' | 'warning'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
  code?: string
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

const DEFAULT_DURATION = 2500
const ERROR_DURATION = 4000

export function useToast() {
  function add(message: string, type: ToastType = 'success', duration = DEFAULT_DURATION, code?: string) {
    const id = nextId++
    toasts.value.push({ id, message, type, code })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }

  function remove(id: number) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  function success(message: string, duration?: number) {
    add(message, 'success', duration)
  }

  function error(message: string, duration?: number) {
    add(message, 'error', duration ?? ERROR_DURATION)
  }

  function warning(message: string, duration?: number) {
    add(message, 'warning', duration)
  }

  /** Display a BridgeError with its error code badge */
  function bridgeError(err: BridgeError, duration?: number) {
    add(err.message, 'error', duration ?? ERROR_DURATION, err.code)
  }

  return { toasts, add, remove, success, error, warning, bridgeError }
}
