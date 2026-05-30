import { describe, it, expect } from 'vitest'
import { ALL_EVALS } from '@/lib/quality/runner'

// ============================================================
// Eval Registry Tests
// ============================================================
describe('ALL_EVALS registry', () => {
  it('has architecture evals', () => {
    expect(ALL_EVALS).toHaveProperty('architecture')
    expect(Array.isArray(ALL_EVALS.architecture)).toBe(true)
    expect(ALL_EVALS.architecture.length).toBeGreaterThan(0)
  })

  it('has qa_testing evals', () => {
    expect(ALL_EVALS).toHaveProperty('qa_testing')
    expect(Array.isArray(ALL_EVALS.qa_testing)).toBe(true)
    expect(ALL_EVALS.qa_testing.length).toBeGreaterThan(0)
  })

  it('has documentation evals', () => {
    expect(ALL_EVALS).toHaveProperty('documentation')
    expect(Array.isArray(ALL_EVALS.documentation)).toBe(true)
    expect(ALL_EVALS.documentation.length).toBeGreaterThan(0)
  })

  it('has spiritual_correlations evals', () => {
    expect(ALL_EVALS).toHaveProperty('spiritual_correlations')
    expect(Array.isArray(ALL_EVALS.spiritual_correlations)).toBe(true)
  })

  it('has ai_integration evals', () => {
    expect(ALL_EVALS).toHaveProperty('ai_integration')
    expect(Array.isArray(ALL_EVALS.ai_integration)).toBe(true)
  })

  it('has performance evals', () => {
    expect(ALL_EVALS).toHaveProperty('performance')
    expect(Array.isArray(ALL_EVALS.performance)).toBe(true)
  })

  it('has ui_design evals', () => {
    expect(ALL_EVALS).toHaveProperty('ui_design')
    expect(Array.isArray(ALL_EVALS.ui_design)).toBe(true)
  })

  it('has ux_design evals', () => {
    expect(ALL_EVALS).toHaveProperty('ux_design')
    expect(Array.isArray(ALL_EVALS.ux_design)).toBe(true)
  })

  it('each eval has required fields (id, name, run)', () => {
    for (const [category, evals] of Object.entries(ALL_EVALS)) {
      for (const evalDef of evals) {
        expect(evalDef).toHaveProperty('id')
        expect(evalDef).toHaveProperty('name')
        expect(evalDef).toHaveProperty('run')
        expect(typeof evalDef.run).toBe('function')
      }
    }
  })

  it('each eval id is unique within category', () => {
    for (const [category, evals] of Object.entries(ALL_EVALS)) {
      const ids = evals.map((e: { id: string }) => e.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    }
  })

  it('evals return expected shape when called', async () => {
    const architectureEvals = ALL_EVALS.architecture
    for (const evalDef of architectureEvals.slice(0, 3)) {
      const result = await evalDef.run()
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('score')
      expect(typeof result.status).toBe('string')
      expect(typeof result.score).toBe('number')
    }
  })
})
