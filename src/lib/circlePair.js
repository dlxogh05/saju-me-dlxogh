import { getEarthlyBranchElement, getHeavenlyStemElement } from 'manseryeok'
import { readSajuChart } from './formatSajuChart.js'
import { sameNatalChart } from './natal.js'

const ELEMENTS = ['목', '화', '토', '금', '수']

const DAY_COPY = {
  peer: {
    score: 82,
    rank: {
      epithet: '같은 속도로 걷는 사람',
      line: '호흡이 비슷해서, 말보다 먼저 속도가 맞는다.',
    },
    love: {
      title: '비슷한 온도로 데워지는 사이',
      line: '먼저 다가가면 둘 다 같은 속도로 뜨거워질 수 있다.',
    },
    wealth: {
      title: '같은 속도로 모으는 자리',
      line: '버는 리듬이 비슷해서, 함께 모을 때 속도가 난다.',
    },
  },
  feeds_host: {
    score: 90,
    rank: {
      epithet: '빈칸을 메우는 사람',
      line: '호스트가 비운 자리를, 이 사람이 자연스럽게 채운다.',
    },
    love: {
      title: '숨을 고르게 해 주는 사이',
      line: '상대가 곁에 있으면 말이 줄고, 긴장이 풀리기 쉽다.',
    },
    wealth: {
      title: '돈이 모이는 자리',
      line: '호스트의 흐름에 상대의 실리가 붙으면 새는 구멍이 줄어든다.',
    },
  },
  feeds_guest: {
    score: 74,
    rank: {
      epithet: '내가 흘려 보내는 사람',
      line: '호스트가 먼저 내줘야, 이 사람의 자리가 열린다.',
    },
    love: {
      title: '내가 먼저 온기를 내는 사이',
      line: '기다리는 쪽과 먼저 건네는 쪽이 분명하다.',
    },
    wealth: {
      title: '내가 벌고 상대가 흘리는 자리',
      line: '호스트가 벌이를 열고, 상대는 그 흐름을 밖으로 밀어낸다.',
    },
  },
  controls_host: {
    score: 58,
    rank: {
      epithet: '서로 다른 시계',
      line: '속도가 어긋나서, 맞춰 걷기 전에 한 번 더 보게 된다.',
    },
    love: {
      title: '거리를 존중해야 오래가는 사이',
      line: '급하게 결론을 내면 오해가 먼저 온다.',
    },
    wealth: {
      title: '새는 자리를 함께 봐야 하는 사이',
      line: '한 쪽이 조이면 다른 쪽이 빠져나가기 쉬운 흐름이다.',
    },
  },
  controls_guest: {
    score: 66,
    rank: {
      epithet: '실리를 나누는 사람',
      line: '호스트가 방향을 잡고, 이 사람은 손에 잡히는 걸 고른다.',
    },
    love: {
      title: '밀고 당기기가 리듬인 사이',
      line: '한 쪽이 선을 그으면, 다른 쪽이 그 선을 시험한다.',
    },
    wealth: {
      title: '각자 벌고 같이 지키는 사이',
      line: '버는 자리는 달라도, 지키는 규칙은 맞춰야 한다.',
    },
  },
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

function elementRelation(hostEl, guestEl) {
  if (!hostEl || !guestEl) return 'peer'
  if (hostEl === guestEl) return 'peer'
  if (generates(guestEl, hostEl)) return 'feeds_host'
  if (generates(hostEl, guestEl)) return 'feeds_guest'
  if (controls(guestEl, hostEl)) return 'controls_host'
  if (controls(hostEl, guestEl)) return 'controls_guest'
  return 'peer'
}

function chartAxes(source) {
  const { result, clock } = readSajuChart({
    birth: source.birth,
    time: source.time ?? source.birth_time,
    calendar: source.calendar,
  })
  const dayStem = result.day.heavenlyStem
  const hourStem = clock.known ? result.hour.heavenlyStem : ''
  return {
    hourKnown: clock.known,
    dayElement: getHeavenlyStemElement(dayStem),
    hourElement: hourStem
      ? getHeavenlyStemElement(hourStem)
      : clock.known
        ? getEarthlyBranchElement(result.hour.earthlyBranch)
        : '',
  }
}

function hourMode(host, guest, hourRelation) {
  if (!host.hourKnown && !guest.hourKnown) return 'both-missing'
  if (host.hourKnown !== guest.hourKnown) return 'one-missing'
  if (hourRelation === 'peer') return 'same-breath'
  return 'other-breath'
}

function applyHourFlavor(copy, mode) {
  if (mode === 'one-missing') {
    return {
      ...copy,
      score: Math.max(0, copy.score - 6),
      rank: {
        epithet: '시침이 한쪽만 있는 사이',
        line: '한 사람은 시간이 있고, 한 사람은 날짜만으로 서 있다.',
      },
    }
  }
  if (mode === 'other-breath' && copy.rank.epithet === '같은 속도로 걷는 사람') {
    return {
      ...copy,
      score: Math.max(0, copy.score - 4),
      rank: {
        epithet: '같은 날을 다른 호흡으로',
        line: '날짜는 겹치는데, 하루를 쓰는 속도가 다르다.',
      },
    }
  }
  if (mode === 'same-breath') {
    return {
      ...copy,
      score: Math.min(100, copy.score + 4),
    }
  }
  return copy
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

  const host = chartAxes(hostSource)
  const guest = chartAxes(guestSource)
  const relation = elementRelation(host.dayElement, guest.dayElement)
  const hourRelation = elementRelation(host.hourElement, guest.hourElement)
  const mode = hourMode(host, guest, hourRelation)
  const copy = applyHourFlavor(DAY_COPY[relation], mode)

  return {
    isSelf: false,
    relation,
    score: copy.score,
    rank: copy.rank,
    love: copy.love,
    wealth: copy.wealth,
  }
}

export function sortCircle(entries) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return String(a.name).localeCompare(String(b.name), 'ko')
  })
}
