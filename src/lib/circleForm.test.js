import { describe, expect, it } from 'vitest'
import { shouldKeepCircleForm, shouldRecordAsMine } from './circleForm.js'

describe('shouldKeepCircleForm', () => {
  it('keeps the form open for the host so they can add more people', () => {
    expect(shouldKeepCircleForm({ isHost: true, hasMine: true })).toBe(true)
    expect(shouldKeepCircleForm({ isHost: true, hasMine: false })).toBe(true)
  })

  it('hides the form after a guest has already stood in line', () => {
    expect(shouldKeepCircleForm({ isHost: false, hasMine: true })).toBe(false)
    expect(shouldKeepCircleForm({ isHost: false, hasMine: false })).toBe(true)
  })
})

describe('shouldRecordAsMine', () => {
  it('records the guest entry as mine, not the host adding a friend', () => {
    expect(shouldRecordAsMine(false)).toBe(true)
    expect(shouldRecordAsMine(true)).toBe(false)
  })
})
