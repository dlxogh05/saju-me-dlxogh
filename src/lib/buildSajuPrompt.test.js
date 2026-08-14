import { describe, expect, it } from 'vitest'
import { buildSajuPrompt } from './buildSajuPrompt.js'

describe('buildSajuPrompt', () => {
  it('injects the computed chart instead of the old hardcoded 기묘 chart', () => {
    const prompt = buildSajuPrompt({
      name: '테스트',
      birth: '1992-10-24',
      time: '05:30',
      gender: 'male',
      calendar: '양력',
    })

    expect(prompt).toContain('년주 임신')
    expect(prompt).toContain('시주 을묘')
    expect(prompt).not.toContain('년주는 기묘')
    expect(prompt).not.toContain('납음:')
  })

  it('asks a wealth prompt without the basic six headings', () => {
    const prompt = buildSajuPrompt({
      name: '테스트',
      birth: '1992-10-24',
      time: '05:30',
      gender: 'male',
      calendar: '양력',
      kind: 'wealth',
    })

    expect(prompt).toContain('년주 임신')
    expect(prompt).toContain('재물을 대하는 태도')
    expect(prompt).not.toContain('첫 줄은 반드시 "성격"이다')
  })

  it('asks a love prompt without 세운 promises', () => {
    const prompt = buildSajuPrompt({
      name: '테스트',
      birth: '1992-10-24',
      time: '05:30',
      gender: 'female',
      calendar: '양력',
      kind: 'love',
    })

    expect(prompt).toContain('가까워지는 방식')
    expect(prompt).toContain('올해 연애운')
  })
})
