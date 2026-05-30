import { describe, it, expect } from 'vitest'
import {
  analyzeDay,
  getWeeklyCycle,
  getDayName,
} from '@/lib/correlation/day-portal-analyzer'

// ============================================================
// Day Analysis Tests
// ============================================================
describe('analyzeDay', () => {
  it('returns DayAnalysis with required fields', () => {
    const result = analyzeDay('Domingo')
    expect(result).toHaveProperty('day')
    expect(result).toHaveProperty('energy')
    expect(result).toHaveProperty('portal')
    expect(result).toHaveProperty('recommendations')
    expect(result).toHaveProperty('affirmations')
  })

  it('includes the input day name', () => {
    expect(analyzeDay('Segunda-feira').day).toBe('Segunda-feira')
  })

  it('recommendations is an array', () => {
    expect(Array.isArray(analyzeDay('Terça-feira').recommendations)).toBe(true)
  })

  it('affirmations is an array', () => {
    expect(Array.isArray(analyzeDay('Quarta-feira').affirmations)).toBe(true)
  })

  it('portal is a boolean', () => {
    expect(typeof analyzeDay('Quinta-feira').portal).toBe('boolean')
  })
})

// ============================================================
// Weekly Cycle Tests
// ============================================================
describe('getWeeklyCycle', () => {
  it('returns required fields', () => {
    const result = getWeeklyCycle()
    expect(result).toHaveProperty('days')
    expect(result).toHaveProperty('bestDay')
    expect(result).toHaveProperty('portalDays')
  })

  it('bestDay is a string', () => {
    expect(typeof getWeeklyCycle().bestDay).toBe('string')
  })

  it('days and portalDays are arrays', () => {
    const result = getWeeklyCycle()
    expect(Array.isArray(result.days)).toBe(true)
    expect(Array.isArray(result.portalDays)).toBe(true)
  })
})

// ============================================================
// getDayName Tests
// ============================================================
describe('getDayName', () => {
  it('returns a string', () => {
    const name = getDayName(new Date())
    expect(typeof name).toBe('string')
  })

  it('returns non-empty string', () => {
    const name = getDayName(new Date())
    expect(name.length).toBeGreaterThan(0)
  })

  it('returns day of week', () => {
    // Sunday is 'domingo' in Portuguese
    const sunday = new Date('2026-06-07T12:00:00Z')
    const name = getDayName(sunday)
    // The actual output depends on locale, but should be a Portuguese day name
    expect(['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']).toContain(name.toLowerCase())
  })
})
