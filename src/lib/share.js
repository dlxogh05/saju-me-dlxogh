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

export const LOCKED_SECTION_HOOKS = ['치명적인 약점', '특이점', '지금 당장 할 것']

const LOCK_START_HEADINGS = new Set(['약점', '치명적인 약점'])

function headingLine(line) {
  return String(line)
    .replace(/^#{1,6}\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/[:：.。]\s*$/, '')
    .trim()
}

export function guestTeaser(text) {
  const value = String(text ?? '')
  if (!value) {
    return { preview: '', lockedTitles: [] }
  }

  const lines = value.split('\n')
  const lockIndex = lines.findIndex((line) =>
    LOCK_START_HEADINGS.has(headingLine(line)),
  )

  if (lockIndex > 0) {
    return {
      preview: lines.slice(0, lockIndex).join('\n').trimEnd(),
      lockedTitles: LOCKED_SECTION_HOOKS,
    }
  }

  if (value.length <= 1) {
    return { preview: value, lockedTitles: [] }
  }

  return {
    preview: value.slice(0, Math.ceil(value.length * 0.5)),
    lockedTitles: LOCKED_SECTION_HOOKS,
  }
}

export function teaserText(text) {
  return guestTeaser(text).preview
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
