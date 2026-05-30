import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock localStorage
const mockStorage: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => { mockStorage[key] = value },
  removeItem: (key: string) => { delete mockStorage[key] },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) },
})

import {
  trackProgress,
  loadTracking,
  clearTracking,
} from '@/lib/vibration/v2/vibration-tracking'

const STORAGE_KEY = 'vibration_tracking_v2'

beforeEach(() => {
  delete mockStorage[STORAGE_KEY]
})

// ============================================================
// Vibration Tracking Tests
// ============================================================
describe('trackProgress', () => {
  it('returns a VibrationTrackEntry', () => {
    const entry = trackProgress('gratidao')
    expect(entry).toHaveProperty('id')
    expect(entry).toHaveProperty('timestamp')
    expect(entry).toHaveProperty('phase')
    expect(entry.phase).toBe('gratidao')
  })

  it('generates unique ids', () => {
    const e1 = trackProgress('alegria')
    const e2 = trackProgress('alegria')
    expect(e1.id).not.toBe(e2.id)
  })

  it('stores entry in localStorage', () => {
    const entry = trackProgress('paz')
    const stored = loadTracking()
    expect(stored.entries.length).toBe(1)
    expect(stored.entries[0].id).toBe(entry.id)
  })

  it('appends to existing entries', () => {
    trackProgress('fase1')
    trackProgress('fase2')
    const stored = loadTracking()
    expect(stored.entries.length).toBe(2)
  })

  it('accepts optional notes', () => {
    const entry = trackProgress('meditacao', 'Sentiu grande paz interior')
    expect(entry.notes).toBe('Sentiu grande paz interior')
  })
})

describe('loadTracking', () => {
  it('returns empty when no data', () => {
    const stored = loadTracking()
    expect(stored.entries).toEqual([])
    expect(stored.lastUpdated).toBe(0)
  })

  it('loads previously tracked entries', () => {
    trackProgress('tristeza')
    trackProgress('alegria')
    const stored = loadTracking()
    expect(stored.entries.length).toBe(2)
  })
})

describe('clearTracking', () => {
  it('clears all entries', () => {
    trackProgress('fase1')
    trackProgress('fase2')
    clearTracking()
    const stored = loadTracking()
    expect(stored.entries).toEqual([])
  })
})
