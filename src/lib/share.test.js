import { describe, expect, it } from 'vitest'
import {
  guestTeaser,
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

  it('locks from 약점 so the spicy sections stay behind the gate', () => {
    const reading = [
      '성격',
      '차분하다.',
      '기질과 재능',
      '끝까지 간다.',
      '약점',
      '스스로를 몰아붙인다.',
      '돋보이는 특징',
      '원칙이 분명하다.',
    ].join('\n')

    expect(guestTeaser(reading)).toEqual({
      preview: '성격\n차분하다.\n기질과 재능\n끝까지 간다.',
      lockedTitles: ['치명적인 약점', '특이점', '지금 당장 할 것'],
    })
  })
})
