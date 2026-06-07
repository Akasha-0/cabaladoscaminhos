import { describe, it, expect } from 'vitest'
import { getData } from '@/lib/wisdom/wisdom-data'

// ============================================================
// Wisdom Data Tests
// ============================================================
describe('getData', () => {
  it('returns an array', () => {
    expect(Array.isArray(getData())).toBe(true)
  })

  it('returns non-empty array', () => {
    expect(getData().length).toBeGreaterThan(0)
  })

  it('each item has required fields', () => {
    const items = getData()
    for (const item of items) {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('description')
      expect(item).toHaveProperty('source')
      expect(item).toHaveProperty('category')
      expect(item).toHaveProperty('keywords')
      expect(item).toHaveProperty('teaching')
      expect(item).toHaveProperty('application')
    }
  })

  it('id is a non-empty string', () => {
    for (const item of getData()) {
      expect(typeof item.id).toBe('string')
      expect(item.id.length).toBeGreaterThan(0)
    }
  })

  it('name is a non-empty string', () => {
    for (const item of getData()) {
      expect(typeof item.name).toBe('string')
      expect(item.name.length).toBeGreaterThan(0)
    }
  })

  it('category is one of the allowed values', () => {
    const validCategories = ['cabala', 'tarot', 'orixa', 'numerologia', 'geometria-sagrada', 'filosofia']
    for (const item of getData()) {
      expect(validCategories).toContain(item.category)
    }
  })

  it('keywords is an array of strings', () => {
    for (const item of getData()) {
      expect(Array.isArray(item.keywords)).toBe(true)
      for (const kw of item.keywords) {
        expect(typeof kw).toBe('string')
      }
    }
  })

  it('each item has teaching and application', () => {
    for (const item of getData()) {
      expect(typeof item.teaching).toBe('string')
      expect(item.teaching.length).toBeGreaterThan(0)
      expect(typeof item.application).toBe('string')
      expect(item.application.length).toBeGreaterThan(0)
    }
  })

  it('has at least 10 items', () => {
    expect(getData().length).toBeGreaterThanOrEqual(10)
  })

  it('all ids are unique', () => {
    const ids = getData().map((i) => i.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })
})
