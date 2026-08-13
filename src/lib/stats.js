export function formatReadingsCount(count) {
  const n = Number(count)
  if (!Number.isFinite(n) || n < 1) return ''
  return `지금까지 ${n.toLocaleString('ko-KR')}개의 사주가 펼쳐졌습니다.`
}

export async function fetchReadingsCount(client) {
  const { data, error } = await client.rpc('get_readings_count')
  if (error) return null
  const count = Number(data)
  if (!Number.isFinite(count) || count < 1) return null
  return count
}
