import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useKeyboardScroll } from '../composables/useKeyboardScroll'

// useKeyboardScroll uses watch internally — we need a Vue app scope
import { effectScope } from 'vue'

describe('useKeyboardScroll', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls scrollIntoView on target when visible becomes true', async () => {
    const scope = effectScope()

    const mockEl = {
      scrollIntoView: vi.fn(),
    } as unknown as HTMLElement

    const targetRef = ref<HTMLElement | null>(mockEl)
    const visible = ref(false)

    scope.run(() => {
      useKeyboardScroll(targetRef, visible)
    })

    visible.value = true
    await nextTick()

    // The composable uses setTimeout(100ms)
    vi.advanceTimersByTime(100)
    expect(mockEl.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })

    scope.stop()
  })

  it('does not call scrollIntoView when visible becomes false', async () => {
    const scope = effectScope()

    const mockEl = {
      scrollIntoView: vi.fn(),
    } as unknown as HTMLElement

    const targetRef = ref<HTMLElement | null>(mockEl)
    const visible = ref(true)

    scope.run(() => {
      useKeyboardScroll(targetRef, visible)
    })

    visible.value = false
    await nextTick()

    vi.advanceTimersByTime(200)
    expect(mockEl.scrollIntoView).not.toHaveBeenCalled()

    scope.stop()
  })

  it('does nothing when targetRef is null', async () => {
    const scope = effectScope()

    const targetRef = ref<HTMLElement | null>(null)
    const visible = ref(false)

    scope.run(() => {
      useKeyboardScroll(targetRef, visible)
    })

    visible.value = true
    await nextTick()

    vi.advanceTimersByTime(200)
    // No error thrown — graceful no-op

    scope.stop()
  })
})
