import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  LOGIN_PENDING_KEY,
  consumeLoginPending,
  markLoginPending,
  trackEvent,
} from './analytics.js'

function mockSessionStorage() {
  const store = new Map()
  globalThis.sessionStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value))
    },
    removeItem: (key) => {
      store.delete(key)
    },
  }
  return store
}

describe('trackEvent', () => {
  afterEach(() => {
    delete globalThis.window
  })

  it('does nothing when gtag is missing', () => {
    globalThis.window = {}
    expect(() => trackEvent('login', { method: 'google' })).not.toThrow()
  })

  it('forwards the event name and params to gtag', () => {
    const gtag = vi.fn()
    globalThis.window = { gtag }
    trackEvent('login', { method: 'google', source: 'sidebar' })
    expect(gtag).toHaveBeenCalledWith('event', 'login', {
      method: 'google',
      source: 'sidebar',
    })
  })

  it('forwards events without params', () => {
    const gtag = vi.fn()
    globalThis.window = { gtag }
    trackEvent('new_reading')
    expect(gtag).toHaveBeenCalledWith('event', 'new_reading')
  })
})

describe('login pending flag', () => {
  afterEach(() => {
    delete globalThis.sessionStorage
  })

  it('stores the login source and consumes it once', () => {
    mockSessionStorage()
    markLoginPending('result_lock')
    expect(JSON.parse(sessionStorage.getItem(LOGIN_PENDING_KEY))).toEqual({
      source: 'result_lock',
    })
    expect(consumeLoginPending()).toEqual({ source: 'result_lock' })
    expect(consumeLoginPending()).toBe(null)
  })

  it('falls back to sidebar when no source is given', () => {
    mockSessionStorage()
    markLoginPending()
    expect(consumeLoginPending()).toEqual({ source: 'sidebar' })
  })
})
