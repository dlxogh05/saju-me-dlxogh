import { describe, expect, it } from 'vitest'
import { comparePair } from './circlePair.js'

const host = {
  birth: '1992-10-24',
  time: '05:30',
  calendar: '양력',
}

const guest = {
  birth: '2005-12-21',
  time: '14:01',
  calendar: '양력',
}

describe('comparePair', () => {
  it('returns a stable ranking line and synergy copy', () => {
    const first = comparePair(host, guest)
    const second = comparePair(host, guest)
    expect(first).toEqual(second)
    expect(first.rank.epithet.length).toBeGreaterThan(3)
    expect(first.rank.line.length).toBeGreaterThan(6)
    expect(first.love.title.length).toBeGreaterThan(3)
    expect(first.wealth.title.length).toBeGreaterThan(3)
    expect(first.score).toBeGreaterThanOrEqual(0)
    expect(first.score).toBeLessThanOrEqual(100)
  })

  it('does not mark a same-day different-hour guest as the host', () => {
    const pair = comparePair(host, {
      birth: '1992-10-24',
      time: '21:00',
      calendar: '양력',
    })
    expect(pair.isSelf).toBe(false)
    expect(pair.rank.epithet).toBeTruthy()
  })

  it('treats missing hour vs known hour as a different pair', () => {
    const withTime = comparePair(host, guest)
    const withoutTime = comparePair(host, {
      ...guest,
      time: '',
    })
    expect(withTime.rank.epithet).not.toBe(withoutTime.rank.epithet)
  })

  it('flags the host natal chart as self', () => {
    expect(comparePair(host, host).isSelf).toBe(true)
  })
})
