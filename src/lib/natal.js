import { normalizeBirthTime } from './profile.js'

function natalBirth(source) {
  return String(source?.birth ?? source?.subject_birth ?? '').slice(0, 10)
}

function natalTime(source) {
  return normalizeBirthTime(source?.time ?? source?.birth_time ?? source?.subject_birth_time)
}

function natalCalendar(source) {
  return String(source?.calendar ?? source?.subject_calendar ?? '')
}

export function natalKey(source) {
  return `${natalCalendar(source)}|${natalBirth(source)}|${natalTime(source)}`
}

export function sameNatalChart(left, right) {
  if (!natalBirth(left) || !natalBirth(right)) return false
  return natalKey(left) === natalKey(right)
}

export function isOwnChart(profile, source) {
  return Boolean(profile) && sameNatalChart(profile, source)
}

export function pickDefaultReading(readings, profile) {
  if (!profile || !Array.isArray(readings)) return null
  return (
    readings.find(
      (row) =>
        (row.kind === 'basic' || !row.kind) && sameNatalChart(profile, row),
    ) ?? null
  )
}

export function findReusableReading(readings, source, kind) {
  if (!Array.isArray(readings)) return null
  return (
    readings.find(
      (row) => row.kind === kind && sameNatalChart(row, source),
    ) ?? null
  )
}
