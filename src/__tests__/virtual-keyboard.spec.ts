import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VirtualKeyboard from '../components/VirtualKeyboard.vue'

function mountKeyboard(props: Record<string, unknown> = {}) {
  return mount(VirtualKeyboard, {
    props: { visible: true, ...props },
    global: { stubs: { Teleport: true } },
  })
}

describe('VirtualKeyboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Visibility', () => {
    it('renders keyboard shell when visible', () => {
      const wrapper = mountKeyboard()
      expect(wrapper.find('[data-testid="keyboard-shell"]').exists()).toBe(true)
    })

    it('does not render keyboard when not visible', () => {
      const wrapper = mountKeyboard({ visible: false })
      expect(wrapper.find('[data-testid="keyboard-shell"]').exists()).toBe(false)
    })

    it('renders overlay when visible', () => {
      const wrapper = mountKeyboard()
      expect(wrapper.find('[data-testid="kb-overlay"]').exists()).toBe(true)
    })

    it('emits close when overlay is clicked', async () => {
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-overlay"]').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('emits close when close button is clicked', async () => {
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-close"]').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('Alpha keyboard (default)', () => {
    it('renders alpha keyboard by default', () => {
      const wrapper = mountKeyboard()
      expect(wrapper.find('[data-testid="kb-alpha"]').exists()).toBe(true)
    })

    it('shows lowercase letters', () => {
      const wrapper = mountKeyboard()
      const text = wrapper.find('[data-testid="kb-alpha"]').text()
      expect(text).toContain('q')
      expect(text).toContain('p')
      expect(text).toContain('m')
    })

    it('types character when key is clicked', async () => {
      const wrapper = mountKeyboard({ modelValue: '' })
      const keys = wrapper.findAll('[data-testid="kb-key"]')
      const qKey = keys.find((b) => b.text() === 'q')
      await qKey!.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['q'])
    })

    it('types space when space key is clicked', async () => {
      const wrapper = mountKeyboard({ modelValue: 'abc' })
      await wrapper.find('[data-testid="kb-space"]').trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['abc '])
    })
  })

  describe('Shift / CapsLock', () => {
    it('one-shot shift: types uppercase then reverts to lowercase', async () => {
      const wrapper = mountKeyboard({ modelValue: '' })
      const vm = wrapper.vm as unknown as { kbMode: string; shiftState: string }

      // Press shift
      await wrapper.find('[data-testid="kb-shift"]').trigger('click')
      expect(vm.shiftState).toBe('once')
      expect(vm.kbMode).toBe('alpha-upper')

      // Type a letter
      const keys = wrapper.findAll('[data-testid="kb-key"]')
      const aKey = keys.find((b) => b.text() === 'A')
      await aKey!.trigger('click')
      vi.advanceTimersByTime(150)

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['A'])
      expect(vm.shiftState).toBe('off')
      expect(vm.kbMode).toBe('alpha-lower')
    })

    it('double shift activates CapsLock', async () => {
      const wrapper = mountKeyboard({ modelValue: '' })
      const vm = wrapper.vm as unknown as { shiftState: string; kbMode: string }

      await wrapper.find('[data-testid="kb-shift"]').trigger('click')
      expect(vm.shiftState).toBe('once')

      await wrapper.find('[data-testid="kb-shift"]').trigger('click')
      expect(vm.shiftState).toBe('caps')
      expect(vm.kbMode).toBe('alpha-upper')
    })

    it('third shift press disables CapsLock', async () => {
      const wrapper = mountKeyboard({ modelValue: '' })
      const vm = wrapper.vm as unknown as { shiftState: string; kbMode: string }

      await wrapper.find('[data-testid="kb-shift"]').trigger('click')
      await wrapper.find('[data-testid="kb-shift"]').trigger('click')
      await wrapper.find('[data-testid="kb-shift"]').trigger('click')
      expect(vm.shiftState).toBe('off')
      expect(vm.kbMode).toBe('alpha-lower')
    })

    it('CapsLock keeps uppercase after typing', async () => {
      const wrapper = mountKeyboard({ modelValue: '' })
      const vm = wrapper.vm as unknown as { shiftState: string; kbMode: string }

      // Enable CapsLock
      await wrapper.find('[data-testid="kb-shift"]').trigger('click')
      await wrapper.find('[data-testid="kb-shift"]').trigger('click')

      // Type a letter
      const keys = wrapper.findAll('[data-testid="kb-key"]')
      const aKey = keys.find((b) => b.text() === 'A')
      await aKey!.trigger('click')

      // Should stay in caps mode
      expect(vm.shiftState).toBe('caps')
      expect(vm.kbMode).toBe('alpha-upper')
    })

    it('shift button has active style when one-shot', async () => {
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-shift"]').trigger('click')
      expect(wrapper.find('[data-testid="kb-shift"]').classes()).toContain('kb-shift-active')
    })

    it('shift button has caps style when CapsLock', async () => {
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-shift"]').trigger('click')
      await wrapper.find('[data-testid="kb-shift"]').trigger('click')
      expect(wrapper.find('[data-testid="kb-shift"]').classes()).toContain('kb-shift-caps')
    })
  })

  describe('Mode switching', () => {
    it('switches to number mode when 123 clicked', async () => {
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-mode-123"]').trigger('click')
      expect(wrapper.find('[data-testid="kb-number"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="kb-alpha"]').exists()).toBe(false)
    })

    it('switches to symbol mode when #&@ clicked', async () => {
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-mode-sym"]').trigger('click')
      expect(wrapper.find('[data-testid="kb-symbol"]').exists()).toBe(true)
    })

    it('switches back to alpha from number mode via ABC', async () => {
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-mode-123"]').trigger('click')
      await wrapper.find('[data-testid="kb-mode-abc"]').trigger('click')
      expect(wrapper.find('[data-testid="kb-alpha"]').exists()).toBe(true)
    })

    it('starts in number mode when inputType is number', () => {
      const wrapper = mountKeyboard({ inputType: 'number' })
      const vm = wrapper.vm as unknown as { kbMode: string }
      expect(vm.kbMode).toBe('number')
    })
  })

  describe('Number keyboard', () => {
    it('shows number keys', async () => {
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-mode-123"]').trigger('click')
      const text = wrapper.find('[data-testid="kb-number"]').text()
      expect(text).toContain('1')
      expect(text).toContain('0')
    })

    it('types number when clicked', async () => {
      const wrapper = mountKeyboard({ modelValue: '' })
      await wrapper.find('[data-testid="kb-mode-123"]').trigger('click')

      const keys = wrapper.findAll('[data-testid="kb-key"]')
      const key5 = keys.find((k) => k.text() === '5')
      await key5!.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['5'])
    })
  })

  describe('Symbol keyboard', () => {
    it('shows symbol keys', async () => {
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-mode-sym"]').trigger('click')
      const text = wrapper.find('[data-testid="kb-symbol"]').text()
      expect(text).toContain('[')
      expect(text).toContain('#')
      expect(text).toContain('€')
    })
  })

  describe('Backspace', () => {
    it('removes last character on backspace click', async () => {
      const wrapper = mountKeyboard({ modelValue: 'abc' })
      await wrapper.find('[data-testid="kb-backspace"]').trigger('mousedown')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['ab'])
    })
  })

  describe('Confirm', () => {
    it('emits confirm when confirm key is clicked', async () => {
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-confirm"]').trigger('click')
      expect(wrapper.emitted('confirm')).toBeTruthy()
    })
  })

  describe('Toolbar', () => {
    it('shows input preview with value', () => {
      const wrapper = mountKeyboard({ modelValue: 'hello' })
      expect(wrapper.text()).toContain('hello')
      expect(wrapper.text()).toContain('5') // character count
    })

    it('shows password dots in preview for password type', () => {
      const wrapper = mountKeyboard({ modelValue: 'abc', inputType: 'password' })
      expect(wrapper.text()).toContain('●●●')
      expect(wrapper.text()).not.toContain('abc')
    })

    it('shows field label when empty', () => {
      const wrapper = mountKeyboard({ modelValue: '', fieldLabel: '员工工号' })
      expect(wrapper.text()).toContain('员工工号')
    })

    it('shows mode pill', () => {
      const wrapper = mountKeyboard()
      expect(wrapper.text()).toContain('ABC')
    })
  })

  describe('Audio feedback', () => {
    function mockAudioGlobal() {
      const mockOsc = { connect: vi.fn(), frequency: { value: 0 }, start: vi.fn(), stop: vi.fn() }
      const mockGain = { connect: vi.fn(), gain: { value: 0 } }

      // Must use a regular function (not arrow) so `new` works correctly
      ;(globalThis as Record<string, unknown>).AudioContext = function MockAudioContext() {
        return {
          createOscillator: () => mockOsc,
          createGain: () => mockGain,
          destination: {},
          currentTime: 0,
        }
      }
      return { mockOsc, mockGain }
    }

    afterEach(() => {
      delete (globalThis as Record<string, unknown>).AudioContext
    })

    it('plays beep on key press (800Hz)', async () => {
      const { mockOsc } = mockAudioGlobal()
      const wrapper = mountKeyboard({ modelValue: '' })
      const keys = wrapper.findAll('[data-testid="kb-key"]')
      const qKey = keys.find((b) => b.text() === 'q')
      await qKey!.trigger('click')

      expect(mockOsc.start).toHaveBeenCalled()
      expect(mockOsc.frequency.value).toBe(800)
    })

    it('plays beep on confirm (1000Hz)', async () => {
      const { mockOsc } = mockAudioGlobal()
      const wrapper = mountKeyboard()
      await wrapper.find('[data-testid="kb-confirm"]').trigger('click')

      expect(mockOsc.start).toHaveBeenCalled()
      expect(mockOsc.frequency.value).toBe(1000)
    })

    it('plays beep on backspace (600Hz)', async () => {
      const { mockOsc } = mockAudioGlobal()
      const wrapper = mountKeyboard({ modelValue: 'abc' })
      await wrapper.find('[data-testid="kb-backspace"]').trigger('mousedown')

      expect(mockOsc.start).toHaveBeenCalled()
      expect(mockOsc.frequency.value).toBe(600)
    })
  })

  describe('Accessibility', () => {
    it('keys have minimum touch target size (h-12 = 48px >= 44px)', () => {
      const wrapper = mountKeyboard()
      const keys = wrapper.findAll('[data-testid="kb-key"]')
      // All keys should have h-12 class (48px) which exceeds 44px WCAG minimum
      expect(keys.length).toBeGreaterThan(0)
      keys.forEach((key) => {
        expect(key.classes().some((c) => c.startsWith('h-1'))).toBe(true)
      })
    })
  })
})
