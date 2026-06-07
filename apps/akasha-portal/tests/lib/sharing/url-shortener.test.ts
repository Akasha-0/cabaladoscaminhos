import { describe, it, expect } from 'vitest'
import { shortenUrl, expandUrl, getUrlStats, deleteShortenedUrl } from '@/lib/sharing/url-shortener'

// ============================================================
// URL Shortener Tests
// ============================================================
describe('shortenUrl', () => {
  it('returns ShortenedUrl with required fields', () => {
    const result = shortenUrl('https://example.com/path')
    expect(result).toHaveProperty('code')
    expect(result).toHaveProperty('url')
    expect(result).toHaveProperty('originalUrl')
    expect(result).toHaveProperty('createdAt')
    expect(result).toHaveProperty('accessCount')
  })

  it('code is 8 URL-safe base64 characters', () => {
    const result = shortenUrl('https://example.com')
    expect(result.code).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(result.code.length).toBe(8)
  })

  it('accessCount starts at 0', () => {
    const result = shortenUrl('https://example.com/count')
    expect(result.accessCount).toBe(0)
  })
})

describe('expandUrl', () => {
  it('returns ShortenedUrl for valid code', () => {
    const short = shortenUrl('https://example.com/expand')
    const expanded = expandUrl(short.code)
    expect(expanded).not.toBeNull()
    expect(expanded!.originalUrl).toBe('https://example.com/expand')
  })

  it('returns null for unknown code', () => {
    expect(expandUrl('UNKNOWNCODE12345')).toBeNull()
  })
})

describe('getUrlStats', () => {
  it('returns null for unknown code', () => {
    expect(getUrlStats('notfound')).toBeNull()
  })

  it('returns accessCount for known code', () => {
    const short = shortenUrl('https://example.com/stats')
    const stats = getUrlStats(short.code)
    expect(stats).not.toBeNull()
    expect(stats!.accessCount).toBeDefined()
  })
})

describe('deleteShortenedUrl', () => {
  it('deletes a known code', () => {
    const short = shortenUrl('https://example.com/delete')
    expect(deleteShortenedUrl(short.code)).toBe(true)
    expect(expandUrl(short.code)).toBeNull()
  })

  it('returns false for unknown code', () => {
    expect(deleteShortenedUrl('notfound12345')).toBe(false)
  })
})
