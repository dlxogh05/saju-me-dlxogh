import { describe, expect, it } from 'vitest'
import { comparePair, formatRankPlace, sortCircle } from './circlePair.js'

const host = {
  name: '이태호',
  birth: '2005-12-21',
  time: '14:01',
  calendar: '양력',
}

function guest(birth, time = '') {
  return { birth, time, calendar: '양력' }
}

describe('comparePair', () => {
  it('returns a stable ranking line and synergy copy', () => {
    const first = comparePair(host, guest('2005-06-03'))
    const second = comparePair(host, guest('2005-06-03'))
    expect(first).toEqual(second)
    expect(first.rank.epithet.length).toBeGreaterThan(3)
    expect(first.rank.line.length).toBeGreaterThan(6)
    expect(first.love.title.length).toBeGreaterThan(3)
    expect(first.wealth.title.length).toBeGreaterThan(3)
    expect(first.score).toBeGreaterThanOrEqual(0)
    expect(first.score).toBeLessThanOrEqual(100)
  })

  it('does not mark a same-day different-hour guest as the host', () => {
    const pair = comparePair(host, guest('2005-12-21', '09:00'))
    expect(pair.isSelf).toBe(false)
    expect(pair.rank.epithet).toBe('같은 날, 다른 템포')
  })

  it('gives consecutive days different scores and epithets', () => {
    const jun3 = comparePair(host, guest('2005-06-03'))
    const jun4 = comparePair(host, guest('2005-06-04'))
    expect(jun3.score).toBe(69)
    expect(jun4.score).toBe(62)
    expect(jun3.relation).toBe('겁재')
    expect(jun4.relation).toBe('비견')
    expect(jun3.rank.epithet).toBe('빈칸을 채우는 라이벌')
    expect(jun4.rank.epithet).toBe('같은 결이 겹치는 사람')
  })

  it('raises the June 3 guest when the hour feeds the host', () => {
    const pair = comparePair(host, guest('2005-06-03', '08:00'))
    expect(pair.score).toBe(80)
    expect(pair.rank.epithet).toBe('시간까지 채워 주는 라이벌')
  })

  it('treats missing hour vs known hour as a different pair', () => {
    const withTime = comparePair(host, guest('2005-06-03', '08:00'))
    const withoutTime = comparePair(host, guest('2005-06-03'))
    expect(withTime.score).not.toBe(withoutTime.score)
    expect(withTime.rank.epithet).not.toBe(withoutTime.rank.epithet)
  })

  it('uses golden epithets around the December 21 host', () => {
    expect(comparePair(host, guest('2005-08-01')).rank.epithet).toBe(
      '빈칸을 채우는 사람',
    )
    expect(comparePair(host, guest('2005-08-01')).score).toBe(91)
    expect(comparePair(host, guest('2005-06-24')).rank.epithet).toBe(
      '기질은 같고 계절은 다른 사람',
    )
    expect(comparePair(host, guest('2005-12-22')).rank.epithet).toBe(
      '같은 결이 겹치는, 페이스를 깨는 사람',
    )
    expect(comparePair(host, guest('2005-12-20')).rank.epithet).toBe(
      '부딪히는 라이벌',
    )
  })

  it('keeps the same score as a tie but different relations', () => {
    const left = comparePair(host, guest('2005-02-14'))
    const right = comparePair(host, guest('2005-12-28'))
    expect(left.score).toBe(83)
    expect(right.score).toBe(83)
    expect(left.rank.epithet).toBe('빈칸을 채우는 비슷한 사람')
    expect(right.rank.epithet).toBe('잘 맞으면서 숨 쉬게 해 주는 사람')
  })

  it('flags the host natal chart as self', () => {
    expect(comparePair(host, host).isSelf).toBe(true)
    expect(comparePair(host, host).score).toBe(0)
  })
})

describe('sortCircle', () => {
  it('assigns the same place to equal scores', () => {
    const ranked = sortCircle([
      { name: '병술', score: 83, epithet: '잘 맞으면서 숨 쉬게 해 주는 사람' },
      { name: '기사', score: 83, epithet: '빈칸을 채우는 비슷한 사람' },
      { name: '기미', score: 62, epithet: '같은 결이 겹치는 사람' },
    ])
    expect(ranked.map((row) => row.name)).toEqual(['기사', '병술', '기미'])
    expect(ranked[0].place).toBe(1)
    expect(ranked[1].place).toBe(1)
    expect(ranked[0].tied).toBe(true)
    expect(ranked[1].tied).toBe(true)
    expect(ranked[2].place).toBe(3)
    expect(ranked[2].tied).toBe(false)
  })
})

describe('formatRankPlace', () => {
  it('labels a tie as the same rank', () => {
    expect(formatRankPlace(1, true)).toBe('1위 동점')
    expect(formatRankPlace(3, false)).toBe('3')
  })
})
