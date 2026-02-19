import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDeviceStore } from '../stores/device'

// Mock the bridge module
vi.mock('../bridge', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../bridge')>()
  const mockBridge = {
    auth: {
      login: vi.fn(),
    },
    system: {
      getSystemInfo: vi.fn().mockResolvedValue({
        cpu: { model: 'Mock CPU', usage: 25 },
        memory: { total: 8 * 1024 ** 3, used: 4 * 1024 ** 3 },
        disk: { total: 256 * 1024 ** 3, used: 100 * 1024 ** 3 },
        network: { ip: '10.0.0.1', latency: 30 },
        os: { platform: 'linux', version: 'Ubuntu 22.04', uptime: 86400 },
      }),
      getConfig: vi.fn().mockResolvedValue({
        serverUrl: 'http://localhost:3000',
        deviceId: 'TEST-001',
        version: '1.0.0',
      }),
    },
    power: {
      restartApp: vi.fn().mockResolvedValue(undefined),
      quitApp: vi.fn().mockResolvedValue(undefined),
      rebootOS: vi.fn().mockResolvedValue(undefined),
      shutdownOS: vi.fn().mockResolvedValue(undefined),
    },
    business: {
      reloadPage: vi.fn().mockResolvedValue(undefined),
    },
  }

  return {
    ...actual,
    getBridge: () => mockBridge,
    __mockBridge: mockBridge,
  }
})

// We need to import after mocking
import { getBridge } from '../bridge'
import { useAuthStore } from '../stores/auth'

const mockBridge = (getBridge as any)()

describe('Device Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.clearAllMocks()

    // Pre-authenticate
    const auth = useAuthStore()
    auth.login('test-token')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('has null systemInfo and config', () => {
      const device = useDeviceStore()
      expect(device.systemInfo).toBeNull()
      expect(device.config).toBeNull()
    })

    it('has default hardware list with 4 devices', () => {
      const device = useDeviceStore()
      expect(device.hardwareList).toHaveLength(4)
      expect(device.hardwareList[0].name).toBe('凭条打印机')
    })

    it('computed values default to 0 when no systemInfo', () => {
      const device = useDeviceStore()
      expect(device.cpuUsage).toBe(0)
      expect(device.memoryPercent).toBe(0)
      expect(device.networkLatency).toBe(0)
    })
  })

  describe('fetchConfig', () => {
    it('fetches and stores config from bridge', async () => {
      const device = useDeviceStore()
      await device.fetchConfig()
      expect(device.config).toEqual({
        serverUrl: 'http://localhost:3000',
        deviceId: 'TEST-001',
        version: '1.0.0',
      })
      expect(mockBridge.system.getConfig).toHaveBeenCalledWith('test-token')
    })
  })

  describe('fetchSystemInfo', () => {
    it('fetches and stores systemInfo from bridge', async () => {
      const device = useDeviceStore()
      await device.fetchSystemInfo()
      expect(device.systemInfo).not.toBeNull()
      expect(device.cpuUsage).toBe(25)
      expect(device.memoryPercent).toBe(50)
      expect(device.networkLatency).toBe(30)
    })

    it('does not call bridge if no token', async () => {
      const auth = useAuthStore()
      auth.logout()
      const device = useDeviceStore()
      await device.fetchSystemInfo()
      expect(mockBridge.system.getSystemInfo).not.toHaveBeenCalled()
    })
  })

  describe('polling', () => {
    it('startPolling calls fetchSystemInfo immediately and on interval', async () => {
      const device = useDeviceStore()
      device.startPolling(1000)

      // Wait for the initial fetch
      await vi.advanceTimersByTimeAsync(0)
      expect(mockBridge.system.getSystemInfo).toHaveBeenCalledTimes(1)

      // Advance one interval
      await vi.advanceTimersByTimeAsync(1000)
      expect(mockBridge.system.getSystemInfo).toHaveBeenCalledTimes(2)

      device.stopPolling()
    })

    it('stopPolling clears the interval', async () => {
      const device = useDeviceStore()
      device.startPolling(1000)
      await vi.advanceTimersByTimeAsync(0)
      expect(mockBridge.system.getSystemInfo).toHaveBeenCalledTimes(1)

      device.stopPolling()
      await vi.advanceTimersByTimeAsync(5000)
      // Should still be 1 — no more calls after stop
      expect(mockBridge.system.getSystemInfo).toHaveBeenCalledTimes(1)
    })
  })

  describe('power actions', () => {
    it('restartApp delegates to bridge', async () => {
      const device = useDeviceStore()
      await device.restartApp()
      expect(mockBridge.power.restartApp).toHaveBeenCalledWith('test-token')
    })

    it('quitApp delegates to bridge', async () => {
      const device = useDeviceStore()
      await device.quitApp()
      expect(mockBridge.power.quitApp).toHaveBeenCalledWith('test-token')
    })

    it('rebootOS delegates to bridge', async () => {
      const device = useDeviceStore()
      await device.rebootOS()
      expect(mockBridge.power.rebootOS).toHaveBeenCalledWith('test-token')
    })

    it('shutdownOS delegates to bridge', async () => {
      const device = useDeviceStore()
      await device.shutdownOS()
      expect(mockBridge.power.shutdownOS).toHaveBeenCalledWith('test-token')
    })

    it('reloadPage delegates to bridge', async () => {
      const device = useDeviceStore()
      await device.reloadPage()
      expect(mockBridge.business.reloadPage).toHaveBeenCalledWith('test-token')
    })
  })

  describe('updateServerUrl', () => {
    it('updates config serverUrl', async () => {
      const device = useDeviceStore()
      await device.fetchConfig()
      await device.updateServerUrl('http://new-server:8080')
      expect(device.config?.serverUrl).toBe('http://new-server:8080')
    })

    it('does nothing if config is null', async () => {
      const device = useDeviceStore()
      await device.updateServerUrl('http://new-server:8080')
      expect(device.config).toBeNull()
    })
  })

  describe('error tracking (Phase 16)', () => {
    it('has null lastError initially', () => {
      const device = useDeviceStore()
      expect(device.lastError).toBeNull()
    })

    it('sets lastError when fetchSystemInfo fails', async () => {
      mockBridge.system.getSystemInfo.mockRejectedValueOnce(new Error('network error'))
      const device = useDeviceStore()
      await device.fetchSystemInfo()
      expect(device.lastError).not.toBeNull()
      expect(device.lastError?.code).toBe('E04') // BRIDGE_UNAVAILABLE
    })

    it('clears lastError on successful fetchSystemInfo', async () => {
      const device = useDeviceStore()
      // First: fail
      mockBridge.system.getSystemInfo.mockRejectedValueOnce(new Error('fail'))
      await device.fetchSystemInfo()
      expect(device.lastError).not.toBeNull()
      // Second: succeed
      await device.fetchSystemInfo()
      expect(device.lastError).toBeNull()
    })

    it('hardware list has errorCode on error-status device', () => {
      const device = useDeviceStore()
      const errorDevice = device.hardwareList.find(d => d.status === 'error')
      expect(errorDevice).toBeDefined()
      expect(errorDevice!.errorCode).toBe('E02')
    })

    it('hardware list has no errorCode on online-status devices', () => {
      const device = useDeviceStore()
      const onlineDevices = device.hardwareList.filter(d => d.status === 'online')
      for (const d of onlineDevices) {
        expect(d.errorCode).toBeUndefined()
      }
    })
  })
})
