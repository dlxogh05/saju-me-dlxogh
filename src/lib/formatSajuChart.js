import {
  calculateFourPillars,
  getEarthlyBranchElement,
  getHeavenlyStemElement,
} from 'manseryeok'

const ELEMENT_ORDER = ['목', '화', '토', '금', '수']
const PILLAR_KEYS = ['year', 'month', 'day', 'hour']

function parseBirth(birth) {
  const [year, month, day] = String(birth ?? '').split('-').map(Number)
  if (!year || !month || !day) {
    throw new RangeError('생년월일이 올바르지 않습니다.')
  }
  return { year, month, day }
}

function parseTime(time) {
  const raw = String(time ?? '').trim()
  if (!raw) return { known: false, hour: 12, minute: 0 }
  const match = raw.match(/^(\d{2}):(\d{2})$/)
  if (!match) {
    throw new RangeError('태어난 시간이 올바르지 않습니다.')
  }
  return {
    known: true,
    hour: Number(match[1]),
    minute: Number(match[2]),
  }
}

function tenGodLabel(value) {
  return value === '일간' ? '일주' : value
}

function elementCounts(pillars, keys) {
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }
  for (const key of keys) {
    counts[getHeavenlyStemElement(pillars[key].heavenlyStem)] += 1
    counts[getEarthlyBranchElement(pillars[key].earthlyBranch)] += 1
  }
  return ELEMENT_ORDER.map((el) => `${el}${counts[el]}`).join(' ')
}

export function readSajuChart({ birth, time, calendar }) {
  const { year, month, day } = parseBirth(birth)
  const clock = parseTime(time)
  const result = calculateFourPillars({
    year,
    month,
    day,
    hour: clock.hour,
    minute: clock.minute,
    isLunar: calendar === '음력',
  })
  const keys = clock.known ? PILLAR_KEYS : ['year', 'month', 'day']
  return { result, clock, keys }
}

export function formatSajuChart({ birth, time, calendar }) {
  const { result, clock, keys } = readSajuChart({ birth, time, calendar })
  const hourLine = clock.known
    ? `시주 ${result.hourString}`
    : '시주 없음 (시간 모름)'

  const voidLine =
    result.voidBranches?.length > 0
      ? `공망: ${result.voidBranches.join(' ')}`
      : ''

  return [
    `년주 ${result.yearString}, 월주 ${result.monthString}, 일주 ${result.dayString}, ${hourLine}`,
    `오행 분포: ${elementCounts(result, keys)}`,
    `십신(천간): ${keys.map((key) => tenGodLabel(result.tenGods[key].stem)).join(' | ')}`,
    `십신(지지): ${keys.map((key) => result.tenGods[key].branch).join(' | ')}`,
    voidLine,
  ]
    .filter(Boolean)
    .join('\n')
}
