import { describe, it, expect } from 'vitest'
import { BridgeError, ErrorCodes } from '../bridge/types'

describe('BridgeError', () => {
  it('creates error with code, message, and detail', () => {
    const err = new BridgeError('E02', '设备阻塞', '卡道阻塞')
    expect(err.code).toBe('E02')
    expect(err.message).toBe('设备阻塞')
    expect(err.detail).toBe('卡道阻塞')
    expect(err.name).toBe('BridgeError')
  })

  it('is an instance of Error', () => {
    const err = new BridgeError('E01', '认证失败')
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(BridgeError)
  })

  it('works without detail parameter', () => {
    const err = new BridgeError('E03', '网络超时')
    expect(err.code).toBe('E03')
    expect(err.message).toBe('网络超时')
    expect(err.detail).toBeUndefined()
  })

  it('can be caught with instanceof check', () => {
    try {
      throw new BridgeError('E05', '命令失败')
    } catch (e) {
      expect(e instanceof BridgeError).toBe(true)
      if (e instanceof BridgeError) {
        expect(e.code).toBe('E05')
      }
    }
  })
})

describe('ErrorCodes', () => {
  it('has all expected error codes', () => {
    expect(ErrorCodes.AUTH_FAILED).toBe('E01')
    expect(ErrorCodes.DEVICE_BLOCKED).toBe('E02')
    expect(ErrorCodes.NET_TIMEOUT).toBe('E03')
    expect(ErrorCodes.BRIDGE_UNAVAILABLE).toBe('E04')
    expect(ErrorCodes.COMMAND_FAILED).toBe('E05')
    expect(ErrorCodes.CONFIG_INVALID).toBe('E06')
  })
})
