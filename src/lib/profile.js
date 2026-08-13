const BIRTH_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/

export function onlyDigits(value, max) {
  return String(value).replace(/\D/g, '').slice(0, max)
}

export function joinBirth(year, month, day) {
  if (year.length !== 4 || month.length !== 2 || day.length !== 2) return ''
  return `${year}-${month}-${day}`
}

export function splitBirth(birth) {
  const [year = '', month = '', day = ''] = String(birth ?? '').split('-')
  return { year, month, day }
}

export function isKnownTime(value) {
  return TIME_RE.test(String(value ?? '').trim())
}

export function normalizeBirthTime(value) {
  const time = String(value ?? '').trim()
  return TIME_RE.test(time) ? time : ''
}

export function timeLabel(value) {
  return isKnownTime(value) ? String(value).trim() : '시간 모름'
}

export function validateProfile({
  name,
  birth,
  birth_time,
  gender,
  calendar,
}) {
  if (!String(name ?? '').trim() || !BIRTH_RE.test(birth)) {
    return '이름과 생년월일을 입력해 주세요.'
  }
  const time = String(birth_time ?? '').trim()
  if (time && !TIME_RE.test(time)) {
    return '태어난 시간을 올바르게 입력하거나, 시간 모름을 선택해 주세요.'
  }
  if (gender !== 'male' && gender !== 'female') {
    return '성별을 선택해 주세요.'
  }
  if (calendar !== '양력' && calendar !== '음력') {
    return '달력을 선택해 주세요.'
  }
  return ''
}

export function genderLabel(gender) {
  return gender === 'female' ? '여성' : '남성'
}

export function formatReadingLabel(createdAt) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(createdAt))
}
