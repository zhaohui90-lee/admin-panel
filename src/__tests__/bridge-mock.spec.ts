import { describe, it, expect } from 'vitest'
import { createMockBridge } from '../bridge/mock'

describe('Mock Bridge', () => {
  const bridge = createMockBridge()

  describe('auth.login', () => {
    it('returns success with token for non-empty password', async () => {
      const result = await bridge.auth.login('any-password')
      expect(result.success).toBe(true)
      expect(result.token).toBeTruthy()
    })

    it('returns failure for empty password', async () => {
      const result = await bridge.auth.login('')
      expect(result.success).toBe(false)
      expect(result.token).toBeUndefined()
    })
  })

  describe('system.getSystemInfo', () => {
    it('returns system info with expected shape', async () => {
      const info = await bridge.system.getSystemInfo('fake-token')
      expect(info.cpu.model).toBeTruthy()
      expect(info.cpu.usage).toBeGreaterThanOrEqual(0)
      expect(info.memory.total).toBeGreaterThan(0)
      expect(info.memory.used).toBeGreaterThan(0)
      expect(info.disk.total).toBeGreaterThan(0)
      expect(info.network.ip).toBeTruthy()
      expect(info.network.latency).toBeGreaterThan(0)
      expect(info.os.platform).toBeTruthy()
    })
  })

  describe('system.getConfig', () => {
    it('returns app config', async () => {
      const config = await bridge.system.getConfig('fake-token')
      expect(config.serverUrl).toBeTruthy()
      expect(config.deviceId).toBeTruthy()
      expect(config.version).toBeTruthy()
    })
  })

  describe('power', () => {
    it('restartApp resolves without error', async () => {
      await expect(bridge.power.restartApp('fake-token')).resolves.toBeUndefined()
    })

    it('quitApp resolves without error', async () => {
      await expect(bridge.power.quitApp('fake-token')).resolves.toBeUndefined()
    })

    it('rebootOS resolves without error', async () => {
      await expect(bridge.power.rebootOS('fake-token')).resolves.toBeUndefined()
    })

    it('shutdownOS resolves without error', async () => {
      await expect(bridge.power.shutdownOS('fake-token')).resolves.toBeUndefined()
    })
  })

  describe('business', () => {
    it('reloadPage resolves without error', async () => {
      await expect(bridge.business.reloadPage('fake-token')).resolves.toBeUndefined()
    })
  })

  describe('hardware', () => {
    it('getDevices returns device list', async () => {
      const devices = await bridge.hardware.getDevices('fake-token')
      expect(devices.length).toBeGreaterThan(0)
      expect(devices[0]).toHaveProperty('id')
      expect(devices[0]).toHaveProperty('name')
      expect(devices[0]).toHaveProperty('connected')
    })

    it('connectDevice resolves without error', async () => {
      await expect(bridge.hardware.connectDevice('fake-token', 'printer')).resolves.toBeUndefined()
    })

    it('disconnectDevice resolves without error', async () => {
      await expect(bridge.hardware.disconnectDevice('fake-token', 'printer')).resolves.toBeUndefined()
    })

    it('testDevice returns result with output', async () => {
      const result = await bridge.hardware.testDevice('fake-token', 'printer', 'status')
      expect(result.success).toBe(true)
      expect(result.output).toBeTruthy()
      expect(result.timestamp).toBeGreaterThan(0)
    })
  })
})
