import { describe, it, expect } from 'vitest'
import {
  calculateBalance,
  alignChakras,
} from '@/lib/chakra/energy-balance'

// ============================================================
// Balance Calculation Tests
// ============================================================
describe('calculateBalance', () => {
  it('returns BalanceResult with all required fields', () => {
    const result = calculateBalance({ root: 5, sacral: 5 })
    expect(result).toHaveProperty('totalEnergy')
    expect(result).toHaveProperty('averageEnergy')
    expect(result).toHaveProperty('alignment')
    expect(result).toHaveProperty('dominantChakra')
    expect(result).toHaveProperty('recommendation')
  })

  it('calculates correct total energy', () => {
    const result = calculateBalance({ root: 10, sacral: 5, solarPlexus: 3 })
    expect(result.totalEnergy).toBe(18)
  })

  it('calculates average of ALL 7 chakras (including defaults)', () => {
    // With root:10 and crown:5, other 5 chakras are 0 by default
    // average = (10 + 0 + 0 + 0 + 0 + 0 + 5) / 7 = 15/7 ≈ 2.14
    const result = calculateBalance({ root: 10, crown: 5 })
    expect(result.averageEnergy).toBeCloseTo(2.14, 1)
  })

  it('calculates correct average when all 7 specified', () => {
    const result = calculateBalance({
      root: 10, sacral: 10, solarPlexus: 10,
      heart: 10, throat: 10, thirdEye: 10, crown: 10,
    })
    expect(result.averageEnergy).toBe(10)
  })

  it('returns balanced when all chakras are similar', () => {
    const result = calculateBalance({
      root: 10, sacral: 10, solarPlexus: 10,
      heart: 10, throat: 10, thirdEye: 10, crown: 10,
    })
    expect(result.alignment).toBe('balanced')
  })

  it('returns grounded when root > crown', () => {
    const result = calculateBalance({
      root: 80, sacral: 20, solarPlexus: 20,
      heart: 20, throat: 20, thirdEye: 20, crown: 20,
    })
    expect(result.alignment).toBe('grounded')
  })

  it('returns elevated when crown > root', () => {
    const result = calculateBalance({
      root: 20, sacral: 20, solarPlexus: 20,
      heart: 20, throat: 20, thirdEye: 20, crown: 80,
    })
    expect(result.alignment).toBe('elevated')
  })

  it('returns disrupted when range is large but root equals crown', () => {
    const result = calculateBalance({
      root: 50, sacral: 80, solarPlexus: 20,
      heart: 20, throat: 80, thirdEye: 20, crown: 50,
    })
    expect(result.alignment).toBe('disrupted')
  })

  it('identifies dominant chakra correctly', () => {
    const result = calculateBalance({
      root: 30, sacral: 50, solarPlexus: 10,
      heart: 10, throat: 10, thirdEye: 10, crown: 10,
    })
    expect(result.dominantChakra).toBe('sacral')
  })

  it('returns non-empty recommendation', () => {
    const result = calculateBalance({ root: 10 })
    expect(result.recommendation.length).toBeGreaterThan(0)
  })

  it('handles empty input with defaults', () => {
    const result = calculateBalance({})
    expect(result.totalEnergy).toBe(0)
    expect(result.averageEnergy).toBe(0)
  })

  it('rounds average energy to 2 decimal places', () => {
    const result = calculateBalance({ root: 10, sacral: 10, solarPlexus: 10 })
    const decimals = result.averageEnergy.toString().split('.')[1]
    expect(decimals?.length || 0).toBeLessThanOrEqual(2)
  })
})

// ============================================================
// Chakra Alignment Tests
// ============================================================
describe('alignChakras', () => {
  it('returns ChakraEnergy with all 7 chakras', () => {
    const aligned = alignChakras({ root: 50, crown: 100 })
    expect(aligned).toHaveProperty('root')
    expect(aligned).toHaveProperty('sacral')
    expect(aligned).toHaveProperty('solarPlexus')
    expect(aligned).toHaveProperty('heart')
    expect(aligned).toHaveProperty('throat')
    expect(aligned).toHaveProperty('thirdEye')
    expect(aligned).toHaveProperty('crown')
  })

  it('all chakras equal the same value (all 7 specified)', () => {
    const aligned = alignChakras({
      root: 40, sacral: 40, solarPlexus: 40,
      heart: 40, throat: 40, thirdEye: 40, crown: 40,
    })
    expect(aligned.root).toBe(40)
    expect(aligned.sacral).toBe(40)
    expect(aligned.crown).toBe(40)
  })

  it('balances to the average regardless of input', () => {
    const aligned = alignChakras({ root: 80, crown: 20 })
    // average = (80 + 0 + 0 + 0 + 0 + 0 + 20) / 7 = 100/7 ≈ 14.29
    expect(aligned.root).toBeCloseTo(14.29, 1)
    expect(aligned.crown).toBeCloseTo(14.29, 1)
  })
})
