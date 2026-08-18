export function shouldKeepCircleForm({ isHost, hasMine }) {
  return Boolean(isHost) || !hasMine
}

export function shouldRecordAsMine(isHost) {
  return !isHost
}
