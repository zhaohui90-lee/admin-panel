import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with no token and logged out', () => {
    const auth = useAuthStore()
    expect(auth.token).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
  })

  it('login stores token and sets isLoggedIn', () => {
    const auth = useAuthStore()
    auth.login('my-secret-token')
    expect(auth.token).toBe('my-secret-token')
    expect(auth.isLoggedIn).toBe(true)
  })

  it('logout clears token and sets isLoggedIn to false', () => {
    const auth = useAuthStore()
    auth.login('my-secret-token')
    auth.logout()
    expect(auth.token).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
  })

  it('isLoggedIn is computed from token', () => {
    const auth = useAuthStore()
    expect(auth.isLoggedIn).toBe(false)
    auth.login('token-1')
    expect(auth.isLoggedIn).toBe(true)
    auth.login('token-2')
    expect(auth.isLoggedIn).toBe(true)
    auth.logout()
    expect(auth.isLoggedIn).toBe(false)
  })
})
