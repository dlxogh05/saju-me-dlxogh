import { describe, expect, it } from 'vitest'
import { formatSajuChart } from './formatSajuChart.js'

describe('formatSajuChart', () => {
  it('uses manseryeok pillars for a documented solar birth', () => {
    const chart = formatSajuChart({
      birth: '1992-10-24',
      time: '05:30',
      calendar: '양력',
    })

    expect(chart).toContain('년주 임신')
    expect(chart).toContain('월주 경술')
    expect(chart).toContain('일주 계유')
    expect(chart).toContain('시주 을묘')
    expect(chart).toMatch(/오행 분포:/)
    expect(chart).toMatch(/십신\(천간\):/)
    expect(chart).not.toContain('년주 기묘')
  })

  it('omits the hour pillar when birth time is unknown', () => {
    const chart = formatSajuChart({
      birth: '1992-10-24',
      time: '',
      calendar: '양력',
    })

    expect(chart).toContain('시주 없음 (시간 모름)')
    expect(chart).not.toContain('시주 을묘')
  })

  it('treats 음력 as a lunar input', () => {
    const solar = formatSajuChart({
      birth: '1992-10-24',
      time: '05:30',
      calendar: '양력',
    })
    const lunar = formatSajuChart({
      birth: '1992-09-29',
      time: '05:30',
      calendar: '음력',
    })

    expect(lunar).toBe(solar)
  })
})
