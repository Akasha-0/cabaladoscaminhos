/**
 * Tests — POC skeleton do `@akasha/core-humandesign`
 *
 * Valida:
 *  - calculateBodyGraph retorna shape válido (BodyGraph)
 *  - Version é 'v0-poc' (POC marker)
 *  - Campos não-populados são vazios (POC stub)
 *  - Determinismo: 2 calls com mesmo `agora` → mesmo output
 *  - Input inválido → throws
 *
 * Para produção (Wave 16.2+), substitua por testes de:
 *  - Gate activation via sweph
 *  - Channel detection (36 canônicos)
 *  - Type detection (5 + 2 canônicos)
 *  - Authority detection (7 variantes)
 *  - Profile detection (12 canônicos)
 */

import { describe, expect, it } from 'vitest'
import { calculateBodyGraph } from './calculator'
import type { BirthData } from './types'

// ============================================================================
// §1 — Fixture: Einstein (1879-03-14, 11:30 AM, Ulm, Germany)
// ============================================================================

const EINSTEIN_BIRTH: BirthData = {
  date: '1879-03-14',
  time: '11:30',
  lat: 48.4011, // Ulm
  lng: 9.9876,  // Ulm
  tz: 1,        // CET (Ulm in 1879)
}

// ============================================================================
// §2 — Tests
// ============================================================================

describe('calculateBodyGraph (POC stub)', () => {
  it('returns a valid BodyGraph shape for a known birth', () => {
    const result = calculateBodyGraph(EINSTEIN_BIRTH)

    expect(result).toBeDefined()
    expect(result.version).toBe('v0-poc')
    expect(result.calculatedAt).toBeInstanceOf(Date)
  })

  it('returns a Generator type placeholder (POC)', () => {
    const result = calculateBodyGraph(EINSTEIN_BIRTH)
    expect(result.type).toBe('Generator')
    expect(result.strategy).toBe('To Respond')
  })

  it('returns empty definedCenters / activeChannels / gateActivations (POC stub)', () => {
    const result = calculateBodyGraph(EINSTEIN_BIRTH)
    expect(result.definedCenters).toEqual([])
    expect(result.activeChannels).toEqual([])
    expect(result.gateActivations).toEqual([])
  })

  it('returns null authority (inconclusivo no POC)', () => {
    const result = calculateBodyGraph(EINSTEIN_BIRTH)
    expect(result.authority).toBeNull()
  })

  it('is deterministic: same input + same agora → same output', () => {
    const agora = new Date('2026-06-24T12:00:00Z')
    const r1 = calculateBodyGraph(EINSTEIN_BIRTH, agora)
    const r2 = calculateBodyGraph(EINSTEIN_BIRTH, agora)

    expect(r1).toEqual(r2)
    expect(r1.calculatedAt.getTime()).toBe(r2.calculatedAt.getTime())
  })

  it('uses injected agora (not Date.now())', () => {
    const fixed = new Date('2025-01-01T00:00:00Z')
    const result = calculateBodyGraph(EINSTEIN_BIRTH, fixed)
    expect(result.calculatedAt.getTime()).toBe(fixed.getTime())
  })

  it('throws on invalid date format', () => {
    const bad: BirthData = { ...EINSTEIN_BIRTH, date: '14-03-1879' } // wrong format
    expect(() => calculateBodyGraph(bad)).toThrow(/invalid BirthData/)
  })

  it('throws on invalid time format', () => {
    const bad: BirthData = { ...EINSTEIN_BIRTH, time: '1130' } // missing ':'
    expect(() => calculateBodyGraph(bad)).toThrow(/invalid BirthData/)
  })

  it('throws on out-of-range latitude', () => {
    const bad: BirthData = { ...EINSTEIN_BIRTH, lat: 91 } // > 90
    expect(() => calculateBodyGraph(bad)).toThrow(/invalid BirthData/)
  })

  it('throws on out-of-range longitude', () => {
    const bad: BirthData = { ...EINSTEIN_BIRTH, lng: 181 } // > 180
    expect(() => calculateBodyGraph(bad)).toThrow(/invalid BirthData/)
  })

  it('throws on NaN coords', () => {
    const bad: BirthData = { ...EINSTEIN_BIRTH, lat: NaN }
    expect(() => calculateBodyGraph(bad)).toThrow(/invalid BirthData/)
  })
})
