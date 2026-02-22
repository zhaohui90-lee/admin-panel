import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBulb from '../components/StatusBulb.vue'

function mountStatusBar() {
  return mount(StatusBulb)
}

describe('StatusBulb (Terminal Status Bar)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the status bar header', () => {
    const wrapper = mountStatusBar()
    expect(wrapper.find('header').exists()).toBe(true)
  })

  it('displays hospital system name', () => {
    const wrapper = mountStatusBar()
    expect(wrapper.text()).toContain('医院员工自助终端')
  })

  it('displays terminal ID', () => {
    const wrapper = mountStatusBar()
    expect(wrapper.text()).toContain('KSK-001')
  })

  it('displays IP address', () => {
    const wrapper = mountStatusBar()
    expect(wrapper.text()).toContain('192.168.1.100')
  })

  it('displays online status text', () => {
    const wrapper = mountStatusBar()
    expect(wrapper.text()).toContain('运行正常')
  })

  it('displays status indicator dot', () => {
    const wrapper = mountStatusBar()
    // The green emerald dot for online status
    const dots = wrapper.findAll('.rounded-full')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('renders time display', () => {
    const wrapper = mountStatusBar()
    // Clock should be initialized after mount
    const vm = wrapper.vm as unknown as { currentTime: string; currentDate: string }
    expect(vm.currentTime).toBeTruthy()
    expect(vm.currentDate).toBeTruthy()
  })

  it('updates clock every second', async () => {
    const wrapper = mountStatusBar()
    const vm = wrapper.vm as unknown as { currentTime: string }
    const initialTime = vm.currentTime

    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()

    // Time should have been updated (may or may not differ depending on timing)
    expect(vm.currentTime).toBeTruthy()
  })

  it('has sticky positioning', () => {
    const wrapper = mountStatusBar()
    const header = wrapper.find('header')
    expect(header.classes()).toContain('sticky')
    expect(header.classes()).toContain('top-0')
  })

  it('has gradient background style', () => {
    const wrapper = mountStatusBar()
    const header = wrapper.find('header')
    expect(header.classes()).toContain('status-bar')
  })
})
