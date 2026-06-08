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
  getProgress,
} from '@/lib/awakening/v2/awakening-tracking'

const STORAGE_KEY = 'awakening_progress'

beforeEach(() => {
  mockStorage[STORAGE_KEY] = '{}'
})

// ============================================================
// Awakening Progress Tests
// ============================================================
describe('trackProgress', () => {
  it('stores progress in localStorage', () => {
    trackProgress('user1', 'awak', 3)
    const stored = mockStorage[STORAGE_KEY]
    expect(stored).toBeDefined()
    const parsed = JSON.parse(stored)
    expect(parsed.user1).toBeDefined()
  })

  it('stores correct track data', () => {
    trackProgress('user1', 'awak', 5)
    const stored = JSON.parse(mockStorage[STORAGE_KEY])
    expect(stored.user1.awak.currentStep).toBe(5)
    expect(stored.user1.awak.track).toBe('awak')
  })

  it('calculates totalSteps for awak', () => {
    trackProgress('user1', 'awak', 1)
    const stored = JSON.parse(mockStorage[STORAGE_KEY])
    expect(stored.user1.awak.totalSteps).toBe(12)
  })

  it('calculates totalSteps for vib', () => {
    trackProgress('user1', 'vib', 1)
    const stored = JSON.parse(mockStorage[STORAGE_KEY])
    expect(stored.user1.vib.totalSteps).toBe(9)
  })

  it('calculates totalSteps for transm', () => {
    trackProgress('user1', 'transm', 1)
    const stored = JSON.parse(mockStorage[STORAGE_KEY])
    expect(stored.user1.transm.totalSteps).toBe(7)
  })

  it('calculates totalSteps for asc', () => {
    trackProgress('user1', 'asc', 1)
    const stored = JSON.parse(mockStorage[STORAGE_KEY])
    expect(stored.user1.asc.totalSteps).toBe(5)
  })
})

describe('getProgress', () => {
  beforeEach(() => {
    mockStorage[STORAGE_KEY] = JSON.stringify({
      user1: {
        awak: { userId: 'user1', track: 'awak', currentStep: 7, totalSteps: 12, lastUpdated: Date.now() },
      },
    })
  })

  it('returns progress for known user and track', () => {
    const progress = getProgress('user1', 'awak')
    expect(progress).not.toBeNull()
    expect(progress!.currentStep).toBe(7)
    expect(progress!.track).toBe('awak')
  })

  it('returns null for unknown user', () => {
    expect(getProgress('unknown', 'awak')).toBeNull()
  })

  it('returns null for unknown track', () => {
    expect(getProgress('user1', 'vib')).toBeNull()
  })

  it('handles empty storage', () => {
    mockStorage[STORAGE_KEY] = '{}'
    expect(getProgress('user1', 'awak')).toBeNull()
  })
})
