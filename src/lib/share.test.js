import { describe, expect, it } from 'vitest'
import {
  parseShareIdFromPath,
  resultSharePath,
  resultShareUrl,
  teaserText,
} from './share.js'

const id = 'd5238b3d-ef9e-4cbf-9e6b-a3a194eab3fc'

describe('share paths', () => {
  it('builds a result path and absolute url', () => {
    expect(resultSharePath(id)).toBe(`/result/${id}`)
    expect(resultShareUrl('https://saju-me-dlxogh.vercel.app', id)).toBe(
      `https://saju-me-dlxogh.vercel.app/result/${id}`,
    )
  })

  it('parses a share id from the pathname', () => {
    expect(parseShareIdFromPath(`/result/${id}`)).toBe(id)
    expect(parseShareIdFromPath(`/result/${id}/`)).toBe(id)
    expect(parseShareIdFromPath('/result/not-a-uuid')).toBe(null)
    expect(parseShareIdFromPath('/')).toBe(null)
  })

  it('keeps the first half of a reading for the guest teaser', () => {
    expect(teaserText('abcdefgh')).toBe('abcd')
    expect(teaserText('abc')).toBe('ab')
  })
})
