const SHARE_PATH_RE = /^\/result\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i

export function resultSharePath(shareId) {
  return `/result/${shareId}`
}

export function resultShareUrl(origin, shareId) {
  return `${origin}${resultSharePath(shareId)}`
}

export function parseShareIdFromPath(pathname) {
  const match = String(pathname ?? '').match(SHARE_PATH_RE)
  return match ? match[1] : null
}

export function teaserText(text) {
  const value = String(text ?? '')
  if (value.length <= 1) return value
  return value.slice(0, Math.ceil(value.length * 0.5))
}

export const PENDING_RESULT_KEY = 'saju-pending-result'

export function readPendingResult() {
  try {
    const raw = sessionStorage.getItem(PENDING_RESULT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.reply) return null
    return {
      reply: String(parsed.reply),
      resultName: String(parsed.resultName ?? ''),
    }
  } catch {
    return null
  }
}

export function writePendingResult(reply, resultName) {
  sessionStorage.setItem(
    PENDING_RESULT_KEY,
    JSON.stringify({ reply, resultName: resultName ?? '' }),
  )
}

export function clearPendingResult() {
  sessionStorage.removeItem(PENDING_RESULT_KEY)
}
