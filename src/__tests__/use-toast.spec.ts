import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToast } from '../composables/useToast'
import { BridgeError } from '../bridge/types'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Clear any lingering toasts from previous tests
    const { toasts } = useToast()
    toasts.value = []
  })

  it('adds a success toast', () => {
    const { success, toasts } = useToast()
    success('Done!')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].message).toBe('Done!')
    expect(toasts.value[0].type).toBe('success')
  })

  it('adds an error toast', () => {
    const { error, toasts } = useToast()
    error('Failed!')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].type).toBe('error')
  })

  it('adds a warning toast', () => {
    const { warning, toasts } = useToast()
    warning('Watch out!')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].type).toBe('warning')
  })

  it('auto-removes toast after duration', () => {
    const { success, toasts } = useToast()
    success('Temp', 1000)
    expect(toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(1000)
    expect(toasts.value).toHaveLength(0)
  })

  it('supports multiple toasts', () => {
    const { success, error, toasts } = useToast()
    success('A')
    error('B')
    expect(toasts.value).toHaveLength(2)
  })

  it('manually removes a toast by id', () => {
    const { success, toasts, remove } = useToast()
    success('Will be removed', 0) // duration 0 = no auto-remove
    expect(toasts.value).toHaveLength(1)
    const id = toasts.value[0].id
    remove(id)
    expect(toasts.value).toHaveLength(0)
  })

  it('assigns unique ids to each toast', () => {
    const { success, toasts } = useToast()
    success('A', 0)
    success('B', 0)
    const ids = toasts.value.map((t) => t.id)
    expect(new Set(ids).size).toBe(2)
  })

  describe('bridgeError (Phase 16)', () => {
    it('creates error toast from BridgeError with code', () => {
      const { bridgeError, toasts } = useToast()
      const err = new BridgeError('E02', '设备阻塞')
      bridgeError(err, 0)
      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].type).toBe('error')
      expect(toasts.value[0].message).toBe('设备阻塞')
      expect(toasts.value[0].code).toBe('E02')
    })

    it('error toast has code field as undefined by default', () => {
      const { error, toasts } = useToast()
      error('普通错误', 0)
      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].code).toBeUndefined()
    })

    it('bridgeError auto-removes after duration', () => {
      const { bridgeError, toasts } = useToast()
      const err = new BridgeError('E03', '超时')
      bridgeError(err, 1000)
      expect(toasts.value).toHaveLength(1)
      vi.advanceTimersByTime(1000)
      expect(toasts.value).toHaveLength(0)
    })
  })
})
