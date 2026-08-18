import {
  getEarthlyBranchElement,
  getHeavenlyStemElement,
  getTenGod,
} from 'manseryeok'
import { readSajuChart } from './formatSajuChart.js'
import { sameNatalChart } from './natal.js'

const ELEMENTS = ['목', '화', '토', '금', '수']

const STEM_BASE = {
  정인: 74,
  편인: 71,
  식신: 66,
  비견: 63,
  정재: 58,
  편재: 55,
  상관: 52,
  겁재: 49,
  정관: 45,
  편관: 42,
}

const STEM_LABEL = {
  정인: '숨 쉬게 해 주는 사람',
  편인: '투박하게 채워 주는 사람',
  식신: '내가 이끌어 주는 사람',
  비견: '비슷한 사람',
  정재: '잘 붙는 사람',
  편재: '스쳐 가는 사람',
  상관: '페이스를 깨는 사람',
  겁재: '라이벌',
  정관: '선을 그어 주는 사람',
  편관: '긴장하게 만드는 사람',
}

const STEM_LINE = {
  정인: '곁에 있으면 숨이 고르고 편해진다.',
  편인: '도움은 되는데, 결이 조금 거칠다.',
  식신: '호스트가 먼저 줘야 상대의 자리가 열린다.',
  비견: '속도가 비슷해서, 말보다 먼저 결이 맞는다.',
  정재: '손에 잡히고, 관계가 쉽게 붙는다.',
  편재: '붙었다가 쉽게 흘러가는 사이다.',
  상관: '호스트의 페이스를 자주 뒤집는다.',
  겁재: '비슷한데 부딪히는 사이다.',
  정관: '선을 가져와, 규칙을 맞춰야 오래간다.',
  편관: '곁에 있으면 긴장부터 올라온다.',
}

const STEM_LOVE = {
  정인: {
    title: '숨을 고르게 해 주는 사이',
    line: '상대가 곁에 있으면 말이 줄고, 긴장이 풀리기 쉽다.',
  },
  편인: {
    title: '투박하게 안아 주는 사이',
    line: '온기는 있는데, 방식이 거칠 수 있다.',
  },
  식신: {
    title: '내가 먼저 온기를 내는 사이',
    line: '기다리는 쪽과 먼저 건네는 쪽이 분명하다.',
  },
  비견: {
    title: '비슷한 온도로 데워지는 사이',
    line: '먼저 다가가면 둘 다 같은 속도로 뜨거워질 수 있다.',
  },
  정재: {
    title: '잘 붙는 사이',
    line: '손만 잡아도 관계가 구체가 된다.',
  },
  편재: {
    title: '스쳐 가기 쉬운 사이',
    line: '강렬한데, 붙잡아 두지 않으면 흘러간다.',
  },
  상관: {
    title: '페이스가 엇갈리는 사이',
    line: '한 쪽이 선을 그으면, 다른 쪽이 그 선을 시험한다.',
  },
  겁재: {
    title: '밀고 당기기가 리듬인 사이',
    line: '비슷해서 더 자주 부딪힌다.',
  },
  정관: {
    title: '거리를 존중해야 오래가는 사이',
    line: '급하게 결론을 내면 오해가 먼저 온다.',
  },
  편관: {
    title: '긴장부터 오는 사이',
    line: '설레임과 압박이 같이 온다.',
  },
}

const STEM_WEALTH = {
  정인: {
    title: '빈칸이 메워지는 자리',
    line: '호스트가 비운 흐름을, 이 사람이 자연스럽게 채운다.',
  },
  편인: {
    title: '거칠게라도 채워지는 자리',
    line: '돈의 구멍은 메우지만, 방식이 투박할 수 있다.',
  },
  식신: {
    title: '내가 벌고 상대가 흘리는 자리',
    line: '호스트가 벌이를 열고, 상대는 그 흐름을 밖으로 밀어낸다.',
  },
  비견: {
    title: '같은 속도로 모으는 자리',
    line: '버는 리듬이 비슷해서, 함께 모을 때 속도가 난다.',
  },
  정재: {
    title: '손에 잡히는 자리',
    line: '벌이가 구체가 되고, 지키는 것도 쉽다.',
  },
  편재: {
    title: '들어왔다 나가는 자리',
    line: '기회는 큰데, 붙잡아 두지 않으면 샌다.',
  },
  상관: {
    title: '버는 리듬이 엇갈리는 자리',
    line: '한 쪽이 조이면 다른 쪽이 빠져나가기 쉬운 흐름이다.',
  },
  겁재: {
    title: '같이 벌고 같이 다투는 자리',
    line: '몫을 나누기 전에, 먼저 부딪히는 지점을 봐야 한다.',
  },
  정관: {
    title: '규칙을 맞춰야 모이는 자리',
    line: '선이 있어야 돈이 새지 않는다.',
  },
  편관: {
    title: '조이면 새는 자리',
    line: '한 쪽이 누르면 다른 쪽이 빠져나가기 쉽다.',
  },
}

const CHUNG = {
  자: '오',
  오: '자',
  축: '미',
  미: '축',
  인: '신',
  신: '인',
  묘: '유',
  유: '묘',
  진: '술',
  술: '진',
  사: '해',
  해: '사',
}

const HAP = {
  자: '축',
  축: '자',
  인: '해',
  해: '인',
  묘: '술',
  술: '묘',
  진: '유',
  유: '진',
  사: '신',
  신: '사',
  오: '미',
  미: '오',
}

function nextElement(element) {
  const index = ELEMENTS.indexOf(element)
  if (index < 0) return null
  return ELEMENTS[(index + 1) % ELEMENTS.length]
}

function generates(from, to) {
  return nextElement(from) === to
}

function controls(from, to) {
  return nextElement(nextElement(from)) === to
}

function natalBirth(source) {
  return String(source?.birth ?? '').slice(0, 10)
}

function chartAxes(source) {
  const { result, clock } = readSajuChart({
    birth: source.birth,
    time: source.time ?? source.birth_time,
    calendar: source.calendar,
  })
  const keys = clock.known ? ['year', 'month', 'day', 'hour'] : ['year', 'month', 'day']
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }
  for (const key of keys) {
    counts[getHeavenlyStemElement(result[key].heavenlyStem)] += 1
    counts[getEarthlyBranchElement(result[key].earthlyBranch)] += 1
  }
  return {
    result,
    clock,
    counts,
    voidBranches: result.voidBranches ?? [],
    dayStem: result.day.heavenlyStem,
    dayBranch: result.day.earthlyBranch,
    dayString: result.dayString,
    yearString: result.yearString,
    monthString: result.monthString,
    hourStem: clock.known ? result.hour.heavenlyStem : '',
  }
}

function evaluatePair(hostSource, guestSource) {
  const host = chartAxes(hostSource)
  const guest = chartAxes(guestSource)
  const stemGod = getTenGod(host.dayStem, guest.dayStem)
  const sameBirthday = natalBirth(hostSource) === natalBirth(guestSource)
  const sameDayPillar = guest.dayString === host.dayString && !sameBirthday
  const oneHourMissing = host.clock.known !== guest.clock.known
  const hostDayEl = getHeavenlyStemElement(host.dayStem)
  const guestBranchEl = getEarthlyBranchElement(guest.dayBranch)
  const hourEl = guest.hourStem
    ? getHeavenlyStemElement(guest.hourStem)
    : ''
  const hourFeeds =
    host.clock.known && guest.clock.known && generates(hourEl, hostDayEl)
  const hourSame =
    host.clock.known && guest.clock.known && hourEl === hostDayEl

  let score = STEM_BASE[stemGod] ?? 50
  let fillsLack = false
  let addsExcess = false
  let chung = false
  let hap = false
  let branchControlsHost = false

  if (guest.dayBranch === host.dayBranch) {
    score += 5
  } else {
    if (generates(guestBranchEl, hostDayEl)) score += 9
    else if (guestBranchEl === hostDayEl) score += 3
    else if (generates(hostDayEl, guestBranchEl)) score += 1
    else if (controls(guestBranchEl, hostDayEl)) {
      score -= 7
      branchControlsHost = true
    } else if (controls(hostDayEl, guestBranchEl)) score -= 2

    if (host.counts[guestBranchEl] === 0) {
      score += 11
      fillsLack = true
    } else if (host.counts[guestBranchEl] >= 3) {
      score -= 4
      addsExcess = true
    }

    if (CHUNG[guest.dayBranch] === host.dayBranch) {
      score -= 8
      chung = true
    }
    if (HAP[guest.dayBranch] === host.dayBranch) {
      score += 6
      hap = true
    }
    if (host.voidBranches.includes(guest.dayBranch)) score -= 6
  }

  if (guest.yearString === host.yearString) score += 5
  if (guest.monthString === host.monthString) score += 4
  if (sameBirthday) score += 8

  if (host.clock.known && guest.clock.known) {
    if (hourFeeds) score += 6
    else if (hourSame) score += 2
  } else if (oneHourMissing) {
    score -= 5
  } else {
    score -= 1
  }

  return {
    stemGod,
    score: Math.max(0, Math.min(100, score)),
    sameBirthday,
    sameDayPillar,
    oneHourMissing,
    hourFeeds,
    fillsLack,
    addsExcess,
    chung,
    hap,
    branchControlsHost,
  }
}

function composeEpithet(ctx) {
  if (ctx.sameBirthday) return '같은 날, 다른 템포'
  if (ctx.sameDayPillar) return '기질은 같고 계절은 다른 사람'

  const god = STEM_LABEL[ctx.stemGod]
  let fill = ''
  if (ctx.hourFeeds && ctx.fillsLack) fill = '시간까지 채워 주는'
  else if (ctx.fillsLack) fill = '빈칸을 채우는'
  else if (ctx.addsExcess && !ctx.hap) fill = '같은 결이 겹치는'

  const clash = ctx.chung || ctx.branchControlsHost ? '부딪히는' : ''
  const fit = ctx.hap ? '잘 맞는' : ''

  if (
    fill === '빈칸을 채우는' &&
    (ctx.stemGod === '정인' || ctx.stemGod === '편인') &&
    !clash &&
    !fit
  ) {
    return '빈칸을 채우는 사람'
  }
  if (
    fill === '같은 결이 겹치는' &&
    ctx.stemGod === '비견' &&
    !clash &&
    !fit
  ) {
    return '같은 결이 겹치는 사람'
  }
  if (fill === '시간까지 채워 주는' && ctx.stemGod === '겁재') {
    return '시간까지 채워 주는 라이벌'
  }
  if (fit && ctx.stemGod === '정인' && !clash) {
    return '잘 맞으면서 숨 쉬게 해 주는 사람'
  }
  if (fill === '빈칸을 채우는' && ctx.stemGod === '겁재') {
    return '빈칸을 채우는 라이벌'
  }
  if (fill === '빈칸을 채우는' && ctx.stemGod === '비견') {
    return '빈칸을 채우는 비슷한 사람'
  }
  if (fill === '같은 결이 겹치는' && god.endsWith('사람')) {
    return `같은 결이 겹치는, ${god}`
  }
  if (clash && ctx.stemGod === '겁재' && !fill) {
    return '부딪히는 라이벌'
  }
  if (fill && god.endsWith('사람')) {
    return `${fill}, ${god}`
  }
  const parts = [fill, clash, fit].filter(Boolean)
  if (!parts.length) return god
  return `${parts.join(' ')} ${god}`
}

function composeLine(ctx) {
  if (ctx.sameBirthday) {
    return '날짜는 같은데, 하루를 쓰는 속도가 다르다.'
  }
  if (ctx.sameDayPillar) {
    return '하루의 기질은 같은데, 태어난 계절이 다르다.'
  }
  const bits = []
  if (ctx.hourFeeds && ctx.fillsLack) {
    bits.push('태어난 시간까지 빈칸을 채운다.')
  } else if (ctx.fillsLack) {
    bits.push('없는 기운을 들고 온다.')
  } else if (ctx.addsExcess) {
    bits.push('이미 많은 기운을 더한다.')
  }
  if (ctx.hap) bits.push('서로 맞물리는 자리가 있다.')
  if (ctx.chung || ctx.branchControlsHost) {
    bits.push('부딪히는 지점이 먼저 보인다.')
  }
  if (ctx.oneHourMissing) {
    bits.push('한쪽은 시간이 있고, 한쪽은 날짜만으로 서 있다.')
  }
  bits.push(STEM_LINE[ctx.stemGod])
  return bits.join(' ')
}

export function comparePair(hostSource, guestSource) {
  if (sameNatalChart(hostSource, guestSource)) {
    return {
      isSelf: true,
      relation: 'self',
      score: 0,
      rank: { epithet: '', line: '' },
      love: { title: '', line: '' },
      wealth: { title: '', line: '' },
    }
  }

  const ctx = evaluatePair(hostSource, guestSource)
  return {
    isSelf: false,
    relation: ctx.stemGod,
    score: ctx.score,
    rank: {
      epithet: composeEpithet(ctx),
      line: composeLine(ctx),
    },
    love: STEM_LOVE[ctx.stemGod],
    wealth: STEM_WEALTH[ctx.stemGod],
  }
}

export function sortCircle(entries) {
  const sorted = [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return String(a.name).localeCompare(String(b.name), 'ko')
  })
  const counts = new Map()
  for (const row of sorted) {
    counts.set(row.score, (counts.get(row.score) ?? 0) + 1)
  }
  let place = 0
  let lastScore = null
  let seen = 0
  return sorted.map((row) => {
    seen += 1
    if (lastScore === null || row.score !== lastScore) place = seen
    lastScore = row.score
    return {
      ...row,
      place,
      tied: (counts.get(row.score) ?? 0) > 1,
    }
  })
}

export function formatRankPlace(place, tied) {
  return tied ? `${place}위 동점` : String(place)
}
