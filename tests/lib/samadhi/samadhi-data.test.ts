import { describe, it, expect } from 'vitest'
import { getData, getLevelById } from '@/lib/samadhi/samadhi-data'

// ============================================================
// Samadhi Data Tests
// ============================================================
describe('getData', () => {
  it('returns SamadhiData with required fields', () => {
    const data = getData()
    expect(data).toHaveProperty('name')
    expect(data).toHaveProperty('description')
    expect(data).toHaveProperty('levels')
    expect(Array.isArray(data.levels)).toBe(true)
  })

  it('has at least 1 level', () => {
    expect(getData().levels.length).toBeGreaterThan(0)
  })
})

describe('getLevelById', () => {
  it('returns a SamadhiLevel', () => {
    const level = getLevelById('savikalpa')
    expect(level).toBeDefined()
    expect(level).toHaveProperty('id')
    expect(level).toHaveProperty('name')
    expect(level).toHaveProperty('stage')
  })

  it('returns undefined for unknown id', () => {
    expect(getLevelById('unknown')).toBeUndefined()
  })

  it('has characteristics array', () => {
    const level = getLevelById('savikalpa')
    expect(Array.isArray(level!.characteristics)).toBe(true)
  })

  it('stage is a number', () => {
    const level = getLevelById('savikalpa')
    expect(typeof level!.stage).toBe('number')
  })

  it('has Portuguese and English names', () => {
    const level = getLevelById('savikalpa')
    expect(typeof level!.namePt).toBe('string')
    expect(typeof level!.nameEn).toBe('string')
  })
})
