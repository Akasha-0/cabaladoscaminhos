import { describe, it, expect } from 'vitest'
import { performPractice } from '@/lib/consciousness/consciousness-practice'

// ============================================================
// Consciousness Practice Tests
// ============================================================
describe('performPractice', () => {
  it('returns ConsciousnessPracticeResult with required fields', async () => {
    const result = await performPractice({
      userId: 'user1',
      practiceType: 'meditation',
      duration: 300,
      timestamp: Date.now(),
    })
    expect(result).toHaveProperty('practiceId')
    expect(result).toHaveProperty('completed')
    expect(result).toHaveProperty('awarenessLevel')
    expect(result).toHaveProperty('consciousnessExpansion')
    expect(result).toHaveProperty('insights')
  })

  it('has completed=true', async () => {
    const result = await performPractice({
      userId: 'user1',
      practiceType: 'meditation',
      duration: 300,
      timestamp: Date.now(),
    })
    expect(result.completed).toBe(true)
  })

  it('awarenessLevel is between 0 and 100', async () => {
    const result = await performPractice({
      userId: 'user1',
      practiceType: 'meditation',
      duration: 60,
      timestamp: Date.now(),
    })
    expect(result.awarenessLevel).toBeGreaterThanOrEqual(0)
    expect(result.awarenessLevel).toBeLessThanOrEqual(100)
  })

  it('consciousnessExpansion is between 0 and 1 for meditation', async () => {
    const result = await performPractice({
      userId: 'user1',
      practiceType: 'meditation',
      duration: 300,
      timestamp: Date.now(),
    })
    expect(result.consciousnessExpansion).toBeGreaterThanOrEqual(0)
    expect(result.consciousnessExpansion).toBeLessThanOrEqual(1)
    // Meditation: 0.7-0.9 range
    expect(result.consciousnessExpansion).toBeGreaterThanOrEqual(0.7)
  })

  it('consciousnessExpansion is between 0 and 1 for breathwork', async () => {
    const result = await performPractice({
      userId: 'user1',
      practiceType: 'breathwork',
      duration: 300,
      timestamp: Date.now(),
    })
    // Breathwork: 0.5-0.8 range
    expect(result.consciousnessExpansion).toBeGreaterThanOrEqual(0.5)
  })

  it('insights is an array', async () => {
    const result = await performPractice({
      userId: 'user1',
      practiceType: 'meditation',
      duration: 300,
      timestamp: Date.now(),
    })
    expect(Array.isArray(result.insights)).toBe(true)
  })

  it('insights has 1-3 items', async () => {
    const result = await performPractice({
      userId: 'user1',
      practiceType: 'meditation',
      duration: 300,
      timestamp: Date.now(),
    })
    expect(result.insights.length).toBeGreaterThanOrEqual(1)
    expect(result.insights.length).toBeLessThanOrEqual(3)
  })

  it('practiceId contains userId', async () => {
    const result = await performPractice({
      userId: 'user123',
      practiceType: 'meditation',
      duration: 300,
      timestamp: Date.now(),
    })
    expect(result.practiceId).toContain('user123')
  })
})
