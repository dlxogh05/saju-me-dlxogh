import { describe, expect, it, vi } from 'vitest'
import { fetchReadingsCount, formatReadingsCount } from './stats.js'

describe('formatReadingsCount', () => {
  it('formats a social-proof line from the total reading count', () => {
    expect(formatReadingsCount(1247)).toBe(
      '지금까지 1,247개의 사주가 펼쳐졌습니다.',
    )
  })

  it('hides the line when there is nothing trustworthy to show', () => {
    expect(formatReadingsCount(0)).toBe('')
    expect(formatReadingsCount(null)).toBe('')
    expect(formatReadingsCount(undefined)).toBe('')
  })
})

describe('fetchReadingsCount', () => {
  it('returns the total from get_readings_count', async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({ data: 3, error: null }),
    }

    await expect(fetchReadingsCount(client)).resolves.toBe(3)
    expect(client.rpc).toHaveBeenCalledWith('get_readings_count')
  })

  it('returns null when the count cannot be shown', async () => {
    const missing = {
      rpc: vi.fn().mockResolvedValue({ data: 0, error: null }),
    }
    const failed = {
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'nope' } }),
    }

    await expect(fetchReadingsCount(missing)).resolves.toBe(null)
    await expect(fetchReadingsCount(failed)).resolves.toBe(null)
  })
})
