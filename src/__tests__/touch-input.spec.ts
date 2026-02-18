import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TouchInput from '../components/TouchInput.vue'

function mountInput(props: Record<string, unknown> = {}) {
  return mount(TouchInput, { props })
}

describe('TouchInput', () => {
  it('renders an input element', () => {
    const wrapper = mountInput()
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('applies placeholder text', () => {
    const wrapper = mountInput({ placeholder: '请输入' })
    expect(wrapper.find('input').attributes('placeholder')).toBe('请输入')
  })

  it('defaults to text type', () => {
    const wrapper = mountInput()
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('supports password type', () => {
    const wrapper = mountInput({ type: 'password' })
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('updates modelValue on input', async () => {
    const wrapper = mountInput({ modelValue: '' })
    await wrapper.find('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('shows clear button when value is present', async () => {
    const wrapper = mountInput({ modelValue: 'abc' })
    expect(wrapper.find('.touch-input-clear').exists()).toBe(true)
  })

  it('hides clear button when value is empty', () => {
    const wrapper = mountInput({ modelValue: '' })
    expect(wrapper.find('.touch-input-clear').exists()).toBe(false)
  })

  it('clears value on clear button click', async () => {
    const wrapper = mountInput({ modelValue: 'abc' })
    await wrapper.find('.touch-input-clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
  })

  it('hides clear button when disabled', () => {
    const wrapper = mountInput({ modelValue: 'abc', disabled: true })
    expect(wrapper.find('.touch-input-clear').exists()).toBe(false)
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mountInput({ disabled: true })
    expect(wrapper.find('input').element.disabled).toBe(true)
  })
})
