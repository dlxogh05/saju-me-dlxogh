const PREFIX = 'saju-circle-mine:'

export function readCircleMine(hostId) {
  try {
    const raw = localStorage.getItem(`${PREFIX}${hostId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.epithet) return null
    return parsed
  } catch {
    return null
  }
}

export function writeCircleMine(hostId, entry) {
  try {
    localStorage.setItem(`${PREFIX}${hostId}`, JSON.stringify(entry))
  } catch {
    /* ignore quota / private mode */
  }
}
