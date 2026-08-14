import { describe, expect, it } from 'vitest'
import {
  displayNameFromReading,
  readingListLabel,
  readingSubjectFromSource,
} from './readingSubject.js'

describe('readingSubjectFromSource', () => {
  it('copies birth fields onto reading snapshot columns', () => {
    expect(
      readingSubjectFromSource({
        name: ' 민수 ',
        birth: '1990-01-02',
        time: '08:30',
        gender: 'male',
        calendar: '양력',
      }),
    ).toEqual({
      subject_name: '민수',
      subject_birth: '1990-01-02',
      subject_birth_time: '08:30',
      subject_gender: 'male',
      subject_calendar: '양력',
    })
  })

  it('normalizes unknown time to empty string', () => {
    expect(
      readingSubjectFromSource({
        name: '지연',
        birth: '1991-03-04',
        birth_time: '모름',
        gender: 'female',
        calendar: '음력',
      }).subject_birth_time,
    ).toBe('')
  })
})

describe('displayNameFromReading', () => {
  it('uses the snapshot name, not a later profile name', () => {
    expect(
      displayNameFromReading({
        subject_name: '친구',
        result: '성격',
      }),
    ).toBe('친구')
    expect(displayNameFromReading({ result: '성격' })).toBe('')
  })
})

describe('readingListLabel', () => {
  it('prefixes the snapshot name onto the timestamp', () => {
    expect(
      readingListLabel({
        subject_name: '민수',
        created_at: '2026-08-12T12:16:20.690Z',
      }),
    ).toBe('민수 · 8월 12일 21:16')
  })

  it('falls back to the timestamp when the snapshot name is missing', () => {
    expect(
      readingListLabel({ created_at: '2026-08-12T12:16:20.690Z' }),
    ).toBe('8월 12일 21:16')
  })

  it('adds 재물 or 연애 when the reading kind is not basic', () => {
    expect(
      readingListLabel({
        subject_name: '민수',
        kind: 'wealth',
        created_at: '2026-08-12T12:16:20.690Z',
      }),
    ).toBe('민수 · 재물 · 8월 12일 21:16')
  })
})
