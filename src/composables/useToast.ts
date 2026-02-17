import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

const DEFAULT_DURATION = 2500

export function useToast() {
  function add(message: string, type: ToastType = 'success', duration = DEFAULT_DURATION) {
    const id = nextId++
    toasts.value.push({ id, message, type })
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
    add(message, 'error', duration)
  }

  function warning(message: string, duration?: number) {
    add(message, 'warning', duration)
  }

  return { toasts, add, remove, success, error, warning }
}
