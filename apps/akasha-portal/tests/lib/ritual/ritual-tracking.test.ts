import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorage
const mockStorage: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockStorage[key] = value },
  removeItem: (key: string) => { delete mockStorage[key] },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
})

import { trackRitual } from '@/lib/ritual/ritual-tracking'

const RITUAL_TRACK_KEY = 'ritual:tracked'

beforeEach(() => {
  delete mockStorage[RITUAL_TRACK_KEY]
})

// ============================================================
// Ritual Tracking Tests
// ============================================================
describe('trackRitual', () => {
  it('returns a RitualTrackEntry with required fields', () => {
    const entry = trackRitual('ebos-de-protecao')
    expect(entry).toHaveProperty('id')
    expect(entry).toHaveProperty('date')
    expect(entry).toHaveProperty('ritualId')
    expect(entry).toHaveProperty('completedAt')
  })

  it('stores the ritual id', () => {
    const entry = trackRitual('ofenda-de-oxum')
    expect(entry.ritualId).toBe('ofenda-de-oxum')
  })

  it('stores entry in localStorage', () => {
    trackRitual('ritual1')
    const stored = mockStorage[RITUAL_TRACK_KEY]
    const parsed = JSON.parse(stored)
    expect(parsed.length).toBe(1)
  })

  it('appends entries to storage', () => {
    trackRitual('ritual1')
    trackRitual('ritual2')
    const stored = JSON.parse(mockStorage[RITUAL_TRACK_KEY])
    expect(stored.length).toBe(2)
  })

  it('date is ISO format (YYYY-MM-DD)', () => {
    const entry = trackRitual('ritual1')
    expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('completedAt is ISO timestamp', () => {
    const entry = trackRitual('ritual1')
    expect(entry.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('generates unique ids', () => {
    const e1 = trackRitual('r')
    const e2 = trackRitual('r')
    expect(e1.id).not.toBe(e2.id)
  })
})
