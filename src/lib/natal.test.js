import { describe, expect, it } from 'vitest'
import {
  findReusableReading,
  isOwnChart,
  natalKey,
  pickDefaultReading,
  sameNatalChart,
} from './natal.js'

const me = {
  name: '이태호',
  birth: '2005-12-21',
  birth_time: '14:01',
  calendar: '양력',
}

describe('sameNatalChart', () => {
  it('treats the same date, time, and calendar as one chart', () => {
    expect(
      sameNatalChart(me, {
        birth: '2005-12-21',
        time: '14:01',
        calendar: '양력',
      }),
    ).toBe(true)
  })

  it('treats a different hour as a different chart', () => {
    expect(
      sameNatalChart(me, {
        birth: '2005-12-21',
        time: '09:00',
        calendar: '양력',
      }),
    ).toBe(false)
  })

  it('treats known time and unknown time as different charts', () => {
    expect(
      sameNatalChart(me, {
        birth: '2005-12-21',
        time: '',
        calendar: '양력',
      }),
    ).toBe(false)
  })

  it('treats two unknown times on the same date as the same chart', () => {
    expect(
      sameNatalChart(
        { birth: '2005-12-21', birth_time: '', calendar: '양력' },
        { birth: '2005-12-21', time: '', calendar: '양력' },
      ),
    ).toBe(true)
  })
})

describe('isOwnChart', () => {
  it('ignores the name when matching the logged-in profile', () => {
    expect(
      isOwnChart(me, {
        name: '친구',
        birth: '2005-12-21',
        time: '14:01',
        calendar: '양력',
      }),
    ).toBe(true)
  })
})

describe('natalKey', () => {
  it('does not include the display name', () => {
    expect(natalKey(me)).toBe('양력|2005-12-21|14:01')
  })
})

describe('pickDefaultReading', () => {
  it('opens the newest basic reading for the profile chart', () => {
    const picked = pickDefaultReading(
      [
        {
          id: 'love-new',
          kind: 'love',
          subject_birth: '2005-12-21',
          subject_birth_time: '14:01',
          subject_calendar: '양력',
        },
        {
          id: 'basic-me',
          kind: 'basic',
          subject_birth: '2005-12-21',
          subject_birth_time: '14:01',
          subject_calendar: '양력',
        },
        {
          id: 'basic-friend',
          kind: 'basic',
          subject_birth: '2005-12-21',
          subject_birth_time: '09:00',
          subject_calendar: '양력',
        },
      ],
      me,
    )
    expect(picked?.id).toBe('basic-me')
  })

  it('returns null when the profile has no basic reading', () => {
    expect(
      pickDefaultReading(
        [
          {
            id: 'friend',
            kind: 'basic',
            subject_birth: '1990-01-01',
            subject_birth_time: '08:00',
            subject_calendar: '양력',
          },
        ],
        me,
      ),
    ).toBe(null)
  })
})

describe('findReusableReading', () => {
  it('reuses the same natal chart and kind', () => {
    const row = {
      id: 'kept',
      kind: 'wealth',
      subject_birth: '1991-03-04',
      subject_birth_time: '',
      subject_calendar: '음력',
    }
    expect(
      findReusableReading(
        [row],
        { birth: '1991-03-04', time: '', calendar: '음력' },
        'wealth',
      )?.id,
    ).toBe('kept')
  })
})
