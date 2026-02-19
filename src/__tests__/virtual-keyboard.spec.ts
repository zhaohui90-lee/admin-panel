import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VirtualKeyboard from '../components/VirtualKeyboard.vue'

function mountKeyboard(props: Record<string, unknown> = {}) {
  return mount(VirtualKeyboard, { props })
}

describe('VirtualKeyboard', () => {
  describe('Default (text) mode', () => {
    it('renders QWERTY layout by default', () => {
      const wrapper = mountKeyboard()
      expect(wrapper.find('[data-testid="qwerty"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="numpad"]').exists()).toBe(false)
    })

    it('shows letter keys', () => {
      const wrapper = mountKeyboard()
      const text = wrapper.find('[data-testid="qwerty"]').text()
      expect(text).toContain('q')
      expect(text).toContain('p')
    })

    it('types characters when keys are clicked', async () => {
      const wrapper = mountKeyboard({ modelValue: '' })
      const buttons = wrapper.findAll('[data-testid="qwerty"] button')
      // Find a letter key (first row, first key = 'q')
      const qKey = buttons.find(b => b.text() === 'q')
      await qKey!.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['q'])
    })
  })

  describe('Number (numpad) mode', () => {
    it('renders numpad layout when inputType is number', () => {
      const wrapper = mountKeyboard({ inputType: 'number' })
      expect(wrapper.find('[data-testid="numpad"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="qwerty"]').exists()).toBe(false)
    })

    it('shows 3x4 grid of number keys plus dot and backspace', () => {
      const wrapper = mountKeyboard({ inputType: 'number' })
      const keys = wrapper.findAll('[data-testid="numpad-key"]')
      expect(keys).toHaveLength(12) // 3x4 grid
      const keyTexts = keys.map(k => k.text())
      expect(keyTexts).toContain('1')
      expect(keyTexts).toContain('0')
      expect(keyTexts).toContain('.')
      expect(keyTexts).toContain('⌫')
    })

    it('types number when numpad key clicked', async () => {
      const wrapper = mountKeyboard({ inputType: 'number', modelValue: '' })
      const keys = wrapper.findAll('[data-testid="numpad-key"]')
      const key5 = keys.find(k => k.text() === '5')
      await key5!.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['5'])
    })

    it('backspace key (⌫) removes last character', async () => {
      const wrapper = mountKeyboard({ inputType: 'number', modelValue: '123' })
      const keys = wrapper.findAll('[data-testid="numpad-key"]')
      const bsKey = keys.find(k => k.text() === '⌫')
      await bsKey!.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['12'])
    })
  })

  describe('IP mode', () => {
    it('renders numpad layout when inputType is ip', () => {
      const wrapper = mountKeyboard({ inputType: 'ip' })
      expect(wrapper.find('[data-testid="numpad"]').exists()).toBe(true)
    })

    it('has dot and colon keys for IP:port input', () => {
      const wrapper = mountKeyboard({ inputType: 'ip' })
      const keys = wrapper.findAll('[data-testid="numpad-key"]')
      const keyTexts = keys.map(k => k.text())
      expect(keyTexts).toContain('.')
      expect(keyTexts).toContain(':')
    })

    it('does not have ⌫ in grid keys (backspace is in bottom row)', () => {
      const wrapper = mountKeyboard({ inputType: 'ip' })
      const keys = wrapper.findAll('[data-testid="numpad-key"]')
      const keyTexts = keys.map(k => k.text())
      expect(keyTexts).not.toContain('⌫')
    })

    it('has separate backspace button in bottom row', () => {
      const wrapper = mountKeyboard({ inputType: 'ip' })
      expect(wrapper.find('[data-testid="numpad-backspace"]').exists()).toBe(true)
    })
  })

  describe('Switching between numpad and QWERTY', () => {
    it('ABC button switches from numpad to QWERTY', async () => {
      const wrapper = mountKeyboard({ inputType: 'ip' })
      expect(wrapper.find('[data-testid="numpad"]').exists()).toBe(true)

      await wrapper.find('[data-testid="numpad-switch-abc"]').trigger('click')
      expect(wrapper.find('[data-testid="qwerty"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="numpad"]').exists()).toBe(false)
    })

    it('数字 button switches back from QWERTY to numpad', async () => {
      const wrapper = mountKeyboard({ inputType: 'ip' })

      // Switch to QWERTY
      await wrapper.find('[data-testid="numpad-switch-abc"]').trigger('click')
      expect(wrapper.find('[data-testid="qwerty"]').exists()).toBe(true)

      // Switch back to numpad
      await wrapper.find('[data-testid="switch-numpad"]').trigger('click')
      expect(wrapper.find('[data-testid="numpad"]').exists()).toBe(true)
    })
  })

  describe('Clear functionality', () => {
    it('clear button empties the model', async () => {
      const wrapper = mountKeyboard({ modelValue: 'hello' })
      const clearBtn = wrapper.findAll('button').find(b => b.text() === '清空')
      await clearBtn!.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    })

    it('numpad clear button empties the model', async () => {
      const wrapper = mountKeyboard({ inputType: 'number', modelValue: '123' })
      const clearBtn = wrapper.findAll('button').find(b => b.text() === '清空')
      await clearBtn!.trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    })
  })
})
