import { formatReadingLabel, normalizeBirthTime } from './profile.js'

export function readingSubjectFromSource(source) {
  return {
    subject_name: String(source?.name ?? '').trim(),
    subject_birth: source?.birth ?? '',
    subject_birth_time: normalizeBirthTime(source?.time ?? source?.birth_time),
    subject_gender: source?.gender ?? '',
    subject_calendar: source?.calendar ?? '',
  }
}

export function displayNameFromReading(reading) {
  return String(reading?.subject_name ?? '').trim()
}

export function readingKindLabel(kind) {
  if (kind === 'wealth') return '재물'
  if (kind === 'love') return '연애'
  return ''
}

export function readingListLabel(reading) {
  const date = formatReadingLabel(reading?.created_at)
  const name = displayNameFromReading(reading)
  const kind = readingKindLabel(reading?.kind)
  return [name, kind, date].filter(Boolean).join(' · ')
}

export function sourceFromReading(reading) {
  const birth = String(reading?.subject_birth ?? '').slice(0, 10)
  return {
    name: displayNameFromReading(reading),
    birth,
    time: normalizeBirthTime(reading?.subject_birth_time),
    gender: reading?.subject_gender,
    calendar: reading?.subject_calendar,
  }
}

export const READING_SELECT =
  'id, result, created_at, share_id, kind, subject_name, subject_birth, subject_birth_time, subject_gender, subject_calendar'

export const READING_KICKERS = {
  basic: '기본 차트 해석',
  wealth: '재물 기질',
  love: '관계 기질',
}
