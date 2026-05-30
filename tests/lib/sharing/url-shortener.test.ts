import { describe, it, expect, vi } from 'vitest'

// Stub global setInterval for tests
vi.stubGlobal('setInterval', (fn: Function, _ms: number) => {
  return setTimeout(fn, 0) as unknown as ReturnType<typeof setInterval>
})
vi.stubGlobal('clearInterval', (id: unknown) => clearTimeout(id as ReturnType<typeof setTimeout>))

import {
  shortenUrl,
  expandUrl,
  getUrlStats,
  deleteShortenedUrl,
} from '@/lib/sharing/url-shortener'

// ============================================================
// URL Shortener Tests
// ============================================================
describe('shortenUrl', () => {
  it('returns ShortenedUrl with required fields', () => {
    const result = shortenUrl('https://example.com/readings/123')
    expect(result).toHaveProperty('code')
    expect(result).toHaveProperty('originalUrl')
    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('createdAt')
    expect(result).toHaveProperty('accessCount')
  })

  it('uses base64url characters in code', () => {
    const result = shortenUrl('https://example.com')
    expect(result.code).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(result.code.length).toBe(8)
  })

  it('reuses existing code for same URL', () => {
    const url = 'https://example.com/reading/456'
    const r1 = shortenUrl(url)
    const r2 = shortenUrl(url)
    expect(r1.code).toBe(r2.code)
  })

  it('returns the original URL', () => {
    const url = 'https://example.com/path'
    const result = shortenUrl(url)
    expect(result.originalUrl).toBe(url)
  })
})

describe('expandUrl', () => {
  it('returns ShortenedUrl for valid code', () => {
    const short = shortenUrl('https://example.com/reading/789')
    const expanded = expandUrl(short.code)
    expect(expanded).not.toBeNull()
    expect(expanded!.originalUrl).toBe('https://example.com/reading/789')
  })

  it('returns null for unknown code', () => {
    expect(expandUrl('UNKNOWNCODE')).toBeNull()
  })

  it('increments access count', () => {
    const short = shortenUrl('https://example.com/access-test')
    expandUrl(short.code)
    const stats = getUrlStats(short.code)
    expect(stats!.accessCount).toBeGreaterThan(0)
  })
})

describe('getUrlStats', () => {
  it('returns null for unknown code', () => {
    expect(getUrlStats('nonexistent')).toBeNull()
  })

  it('returns accessCount and createdAt', () => {
    const short = shortenUrl('https://example.com/stats')
    const stats = getUrlStats(short.code)
    expect(stats).not.toBeNull()
    expect(typeof stats!.accessCount).toBe('number')
    expect(typeof stats!.createdAt).toBe('number')
  })
})

describe('deleteShortenedUrl', () => {
  it('returns true when deleting existing URL', () => {
    const short = shortenUrl('https://example.com/delete')
    expect(deleteShortenedUrl(short.code)).toBe(true)
  })

  it('returns false when URL no longer exists', () => {
    const short = shortenUrl('https://example.com/delete2')
    deleteShortenedUrl(short.code)
    expect(deleteShortenedUrl(short.code)).toBe(false)
  })

  it('expandUrl returns null after deletion', () => {
    const short = shortenUrl('https://example.com/expand-delete')
    deleteShortenedUrl(short.code)
    expect(expandUrl(short.code)).toBeNull()
  })
})
