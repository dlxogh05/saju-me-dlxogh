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

export function validateProfile({
  name,
  birth,
  birth_time,
  gender,
  calendar,
}) {
  if (!String(name ?? '').trim()) {
    return '이름과 생년월일, 태어난 시간을 모두 입력해 주세요.'
  }
  if (!BIRTH_RE.test(birth)) {
    return '이름과 생년월일, 태어난 시간을 모두 입력해 주세요.'
  }
  if (!TIME_RE.test(birth_time)) {
    return '이름과 생년월일, 태어난 시간을 모두 입력해 주세요.'
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
