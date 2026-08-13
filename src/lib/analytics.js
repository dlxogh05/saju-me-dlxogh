export const GA_MEASUREMENT_ID = 'G-YV53XY7ENB'
export const LOGIN_PENDING_KEY = 'saju-ga-login-pending'

export function trackEvent(name, params) {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  if (params) {
    window.gtag('event', name, params)
    return
  }
  window.gtag('event', name)
}

export function markLoginPending(source) {
  try {
    sessionStorage.setItem(
      LOGIN_PENDING_KEY,
      JSON.stringify({ source: source || 'sidebar' }),
    )
  } catch {
    /* ignore quota / private mode */
  }
}

export function consumeLoginPending() {
  try {
    const raw = sessionStorage.getItem(LOGIN_PENDING_KEY)
    if (!raw) return null
    sessionStorage.removeItem(LOGIN_PENDING_KEY)
    const parsed = JSON.parse(raw)
    return parsed?.source ? parsed : { source: 'sidebar' }
  } catch {
    return null
  }
}
