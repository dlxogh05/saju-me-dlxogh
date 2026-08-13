export const GUEST_ONBOARD_KEY = 'saju-me-guest-onboarded'

export function readStoredGuest() {
  try {
    const raw = sessionStorage.getItem(GUEST_ONBOARD_KEY)
    if (!raw || raw === '1') return null
    const saved = JSON.parse(raw)
    if (!saved?.name || !saved?.birth) return null
    return saved
  } catch {
    return null
  }
}

export function writeStoredGuest(payload) {
  try {
    sessionStorage.setItem(GUEST_ONBOARD_KEY, JSON.stringify(payload))
  } catch {
    /* ignore quota / private mode */
  }
}

export function hasGuestOnboarded() {
  try {
    return Boolean(sessionStorage.getItem(GUEST_ONBOARD_KEY))
  } catch {
    return false
  }
}
