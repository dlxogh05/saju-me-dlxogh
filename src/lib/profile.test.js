import { describe, expect, it } from 'vitest'
import {
  formatReadingLabel,
  genderLabel,
  joinBirth,
  onlyDigits,
  splitBirth,
  timeLabel,
  validateProfile,
} from './profile.js'

describe('onlyDigits', () => {
  it('strips non-digits and caps length', () => {
    expect(onlyDigits('20a2b', 4)).toBe('202')
    expect(onlyDigits('202512', 4)).toBe('2025')
  })
})

describe('joinBirth / splitBirth', () => {
  it('joins only complete yyyy-mm-dd parts', () => {
    expect(joinBirth('2005', '12', '21')).toBe('2005-12-21')
    expect(joinBirth('2005', '1', '21')).toBe('')
  })

  it('splits a stored birth date', () => {
    expect(splitBirth('2005-12-21')).toEqual({
      year: '2005',
      month: '12',
      day: '21',
    })
  })
})

describe('validateProfile', () => {
  const valid = {
    name: '임서현',
    birth: '2007-05-09',
    birth_time: '14:01',
    gender: 'female',
    calendar: '양력',
  }

  it('returns empty when all required fields are present', () => {
    expect(validateProfile(valid)).toBe('')
  })

  it('allows unknown birth time', () => {
    expect(validateProfile({ ...valid, birth_time: '' })).toBe('')
  })

  it('rejects missing name or birth', () => {
    expect(validateProfile({ ...valid, name: '  ' })).not.toBe('')
    expect(validateProfile({ ...valid, birth: '2007-5-9' })).not.toBe('')
  })

  it('rejects a malformed time when one is provided', () => {
    expect(validateProfile({ ...valid, birth_time: '9:1' })).not.toBe('')
  })
})

describe('labels', () => {
  it('maps gender to Korean', () => {
    expect(genderLabel('male')).toBe('남성')
    expect(genderLabel('female')).toBe('여성')
  })

  it('formats reading timestamps in Seoul time', () => {
    expect(formatReadingLabel('2026-08-12T12:16:20.690Z')).toBe(
      '8월 12일 21:16',
    )
  })

  it('maps unknown time to 시간 모름', () => {
    expect(timeLabel('14:01')).toBe('14:01')
    expect(timeLabel('')).toBe('시간 모름')
    expect(timeLabel(null)).toBe('시간 모름')
  })
})
