import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBulb from '../components/StatusBulb.vue'

function mountBulb(props: Record<string, unknown> = { status: 'online' }) {
  return mount(StatusBulb, { props })
}

describe('StatusBulb', () => {
  it('renders with online status', () => {
    const wrapper = mountBulb({ status: 'online' })
    expect(wrapper.find('.bulb').exists()).toBe(true)
    expect(wrapper.find('[role="status"]').attributes('aria-label')).toBe('online')
  })

  it('renders with warning status', () => {
    const wrapper = mountBulb({ status: 'warning' })
    expect(wrapper.find('[role="status"]').attributes('aria-label')).toBe('warning')
  })

  it('renders with error status', () => {
    const wrapper = mountBulb({ status: 'error' })
    expect(wrapper.find('[role="status"]').attributes('aria-label')).toBe('error')
  })

  it('shows ripple animation only for online status', () => {
    const online = mountBulb({ status: 'online' })
    expect(online.find('.bulb-ripple').exists()).toBe(true)

    const warning = mountBulb({ status: 'warning' })
    expect(warning.find('.bulb-ripple').exists()).toBe(false)

    const error = mountBulb({ status: 'error' })
    expect(error.find('.bulb-ripple').exists()).toBe(false)
  })

  it('applies md size by default', () => {
    const wrapper = mountBulb({ status: 'online' })
    expect(wrapper.find('.bulb--md').exists()).toBe(true)
  })

  it('applies sm size', () => {
    const wrapper = mountBulb({ status: 'online', size: 'sm' })
    expect(wrapper.find('.bulb--sm').exists()).toBe(true)
  })

  it('applies lg size', () => {
    const wrapper = mountBulb({ status: 'online', size: 'lg' })
    expect(wrapper.find('.bulb--lg').exists()).toBe(true)
  })

  it('renders label text when provided', () => {
    const wrapper = mountBulb({ status: 'online', label: '系统正常' })
    expect(wrapper.find('.bulb-label').text()).toBe('系统正常')
  })

  it('hides label when not provided', () => {
    const wrapper = mountBulb({ status: 'online' })
    expect(wrapper.find('.bulb-label').exists()).toBe(false)
  })

  it('uses label as aria-label when provided', () => {
    const wrapper = mountBulb({ status: 'online', label: '系统正常' })
    expect(wrapper.find('[role="status"]').attributes('aria-label')).toBe('系统正常')
  })
})
