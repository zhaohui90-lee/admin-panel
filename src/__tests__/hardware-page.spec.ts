import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HardwarePage from '../modules/hardware/HardwarePage.vue'
import { useAuthStore } from '../stores/auth'

// Mock bridge
const mockDevices = [
  { id: 'printer', name: '凭条打印机', connected: true },
  { id: 'card-reader', name: '医保卡读卡器', connected: false },
]

const getDevicesMock = vi.fn().mockResolvedValue(mockDevices)
const connectDeviceMock = vi.fn().mockResolvedValue(undefined)
const disconnectDeviceMock = vi.fn().mockResolvedValue(undefined)
const testDeviceMock = vi.fn().mockResolvedValue({
  success: true,
  output: '[printer] 设备状态: 正常',
  timestamp: Date.now(),
})

vi.mock('@/composables/useBridge', () => ({
  useBridge: () => ({
    hardware: {
      getDevices: getDevicesMock,
      connectDevice: connectDeviceMock,
      disconnectDevice: disconnectDeviceMock,
      testDevice: testDeviceMock,
    },
  }),
}))

// Mock toast
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/hardware' }),
}))

function mountPage() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.login('test-token')

  return mount(HardwarePage, {
    global: {
      plugins: [pinia],
      stubs: { VirtualKeyboard: true },
    },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findBtn(wrapper: any, text: string) {
  const btn = wrapper.findAll('button').find((b: any) => b.text() === text)
  if (!btn) throw new Error(`Button "${text}" not found`)
  return btn
}

describe('HardwarePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock to return fresh copies
    getDevicesMock.mockResolvedValue(
      mockDevices.map((d) => ({ ...d })),
    )
  })

  describe('Device list', () => {
    it('renders device list after loading', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const items = wrapper.findAll('[data-testid="device-item"]')
      expect(items).toHaveLength(2)
      expect(wrapper.text()).toContain('凭条打印机')
      expect(wrapper.text()).toContain('医保卡读卡器')
    })

    it('shows connected/disconnected status', async () => {
      const wrapper = mountPage()
      await flushPromises()

      expect(wrapper.text()).toContain('已连接')
      expect(wrapper.text()).toContain('未连接')
    })

    it('calls getDevices with token on mount', async () => {
      mountPage()
      await flushPromises()

      expect(getDevicesMock).toHaveBeenCalledWith('test-token')
    })
  })

  describe('Connect/Disconnect', () => {
    it('calls disconnectDevice for connected device', async () => {
      const wrapper = mountPage()
      await flushPromises()

      // First device is connected — its button says "断开"
      const items = wrapper.findAll('[data-testid="device-item"]')
      await findBtn(items[0], '断开').trigger('click')
      await flushPromises()

      expect(disconnectDeviceMock).toHaveBeenCalledWith('test-token', 'printer')
    })

    it('calls connectDevice for disconnected device', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const items = wrapper.findAll('[data-testid="device-item"]')
      await findBtn(items[1], '连接').trigger('click')
      await flushPromises()

      expect(connectDeviceMock).toHaveBeenCalledWith('test-token', 'card-reader')
    })
  })

  describe('Command terminal', () => {
    it('shows terminal after clicking 调试 button', async () => {
      const wrapper = mountPage()
      await flushPromises()

      // Click "调试" on the connected device
      const items = wrapper.findAll('[data-testid="device-item"]')
      await findBtn(items[0], '调试').trigger('click')

      expect(wrapper.text()).toContain('调试终端')
      expect(wrapper.text()).toContain('凭条打印机')
    })

    it('disables 调试 button for disconnected devices', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const items = wrapper.findAll('[data-testid="device-item"]')
      expect(findBtn(items[1], '调试').attributes('disabled')).toBeDefined()
    })

    it('sends quick command and displays result', async () => {
      const wrapper = mountPage()
      await flushPromises()

      // Select device
      const items = wrapper.findAll('[data-testid="device-item"]')
      await findBtn(items[0], '调试').trigger('click')

      // Click quick command "status"
      await findBtn(wrapper, 'status').trigger('click')
      await flushPromises()

      expect(testDeviceMock).toHaveBeenCalledWith('test-token', 'printer', 'status')
      const terminal = wrapper.find('[data-testid="terminal-output"]')
      expect(terminal.text()).toContain('status')
      expect(terminal.text()).toContain('设备状态: 正常')
    })

    it('clears logs when clear button clicked', async () => {
      const wrapper = mountPage()
      await flushPromises()

      // Select device + send command
      const items = wrapper.findAll('[data-testid="device-item"]')
      await findBtn(items[0], '调试').trigger('click')
      await findBtn(wrapper, 'status').trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="terminal-output"]').text()).toContain('设备状态')

      // Clear
      await findBtn(wrapper, '清空日志').trigger('click')
      expect(wrapper.find('[data-testid="terminal-output"]').text()).toContain('等待命令输入')
    })
  })

  describe('Terminal auto-scroll (Phase 14)', () => {
    async function openTerminalAndSendCommand(wrapper: ReturnType<typeof mountPage>) {
      const items = wrapper.findAll('[data-testid="device-item"]')
      await findBtn(items[0], '调试').trigger('click')
      await findBtn(wrapper, 'status').trigger('click')
      await flushPromises()
    }

    it('terminal output has tracking-wide class for readability', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const items = wrapper.findAll('[data-testid="device-item"]')
      await findBtn(items[0], '调试').trigger('click')

      const terminal = wrapper.find('[data-testid="terminal-output"]')
      expect(terminal.classes()).toContain('tracking-wide')
    })

    it('terminal output has lg:text-sm class for kiosk readability', async () => {
      const wrapper = mountPage()
      await flushPromises()

      const items = wrapper.findAll('[data-testid="device-item"]')
      await findBtn(items[0], '调试').trigger('click')

      const terminal = wrapper.find('[data-testid="terminal-output"]')
      expect(terminal.attributes('class')).toContain('lg:text-sm')
    })

    it('displays timestamp for each log entry', async () => {
      const wrapper = mountPage()
      await flushPromises()

      await openTerminalAndSendCommand(wrapper)

      const timestamps = wrapper.findAll('[data-testid="log-timestamp"]')
      expect(timestamps.length).toBeGreaterThanOrEqual(1)
    })

    it('does not show scroll-to-bottom button when at bottom', async () => {
      const wrapper = mountPage()
      await flushPromises()

      await openTerminalAndSendCommand(wrapper)

      expect(wrapper.find('[data-testid="scroll-to-bottom"]').exists()).toBe(false)
    })

    it('shows scroll-to-bottom button when user scrolls up', async () => {
      const wrapper = mountPage()
      await flushPromises()

      await openTerminalAndSendCommand(wrapper)

      // Simulate user scrolling up by manipulating the terminal element
      const terminal = wrapper.find('[data-testid="terminal-output"]')
      // Mock scroll properties — in jsdom, scrollHeight/clientHeight are 0,
      // so we simulate via defineProperty
      const el = terminal.element
      Object.defineProperty(el, 'scrollHeight', { value: 500, writable: true })
      Object.defineProperty(el, 'clientHeight', { value: 200, writable: true })
      Object.defineProperty(el, 'scrollTop', { value: 100, writable: true })

      await terminal.trigger('scroll')
      await flushPromises()

      expect(wrapper.find('[data-testid="scroll-to-bottom"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="scroll-to-bottom"]').text()).toContain('新消息')
    })

    it('hides scroll-to-bottom button after clicking it', async () => {
      const wrapper = mountPage()
      await flushPromises()

      await openTerminalAndSendCommand(wrapper)

      // Simulate user scrolled up
      const terminal = wrapper.find('[data-testid="terminal-output"]')
      const el = terminal.element
      Object.defineProperty(el, 'scrollHeight', { value: 500, writable: true })
      Object.defineProperty(el, 'clientHeight', { value: 200, writable: true })
      Object.defineProperty(el, 'scrollTop', { value: 100, writable: true })

      await terminal.trigger('scroll')
      await flushPromises()

      expect(wrapper.find('[data-testid="scroll-to-bottom"]').exists()).toBe(true)

      // Click the scroll-to-bottom button
      await wrapper.find('[data-testid="scroll-to-bottom"]').trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="scroll-to-bottom"]').exists()).toBe(false)
    })
  })
})
