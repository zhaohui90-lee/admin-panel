import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TouchButton from '../components/TouchButton.vue'

function mountBtn(props: Record<string, unknown> = {}, slotContent = '按钮') {
  return mount(TouchButton, {
    props,
    slots: { default: slotContent },
  })
}

describe('TouchButton', () => {
  it('renders slot content', () => {
    const wrapper = mountBtn()
    expect(wrapper.text()).toContain('按钮')
  })

  it('applies outline variant by default', () => {
    const wrapper = mountBtn()
    expect(wrapper.find('.touch-btn--outline').exists()).toBe(true)
  })

  it('applies primary variant', () => {
    const wrapper = mountBtn({ variant: 'primary' })
    expect(wrapper.find('.touch-btn--primary').exists()).toBe(true)
  })

  it('applies danger variant', () => {
    const wrapper = mountBtn({ variant: 'danger' })
    expect(wrapper.find('.touch-btn--danger').exists()).toBe(true)
  })

  it('emits click event', async () => {
    const wrapper = mountBtn()
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mountBtn({ disabled: true })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('shows loading spinner and hides slot content when loading', () => {
    const wrapper = mountBtn({ loading: true })
    expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
    expect(wrapper.text()).toContain('执行中...')
    expect(wrapper.text()).not.toContain('按钮')
  })

  it('is disabled when loading', () => {
    const wrapper = mountBtn({ loading: true })
    expect(wrapper.find('button').element.disabled).toBe(true)
  })
})
