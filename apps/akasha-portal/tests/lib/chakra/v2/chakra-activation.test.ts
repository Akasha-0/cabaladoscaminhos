import { describe, it, expect } from 'vitest'
import {
  getDefaultActivationState,
  activate,
  _ACTIVATION_SEQUENCE,
  _ACTIVATION_MESSAGES,
  type ChakraActivationOrder,
} from '@/lib/chakra/v2/chakra-activation'

// ============================================================
// Activation State Tests
// ============================================================
describe('getDefaultActivationState', () => {
  it('returns all chakras at level 0', () => {
    const state = getDefaultActivationState()
    expect(state.root).toBe(0)
    expect(state.sacral).toBe(0)
    expect(state.solarPlexus).toBe(0)
    expect(state.heart).toBe(0)
    expect(state.throat).toBe(0)
    expect(state.thirdEye).toBe(0)
    expect(state.crown).toBe(0)
  })

  it('returns an object with all 7 chakra keys', () => {
    const state = getDefaultActivationState()
    expect(Object.keys(state).length).toBe(7)
  })
})

// ============================================================
// Activation Function Tests
// ============================================================
describe('activate', () => {
  it('activates root chakra', () => {
    const state = activate(getDefaultActivationState(), 'root', 100)
    expect(state.root).toBe(100)
  })

  it('activates specific chakra without affecting others', () => {
    const initial = { ...getDefaultActivationState(), sacral: 50 }
    const state = activate(initial, 'heart', 75)
    expect(state.heart).toBe(75)
    expect(state.sacral).toBe(50)
    expect(state.root).toBe(0)
  })

  it('clamps value to max 100', () => {
    const state = activate(getDefaultActivationState(), 'root', 200)
    expect(state.root).toBe(100)
  })

  it('clamps value to min 0', () => {
    const state = activate(getDefaultActivationState(), 'root', -50)
    expect(state.root).toBe(0)
  })

  it('uses default level 100', () => {
    const state = activate(getDefaultActivationState(), 'root')
    expect(state.root).toBe(100)
  })

  it('accepts partial state', () => {
    const partial = { sacral: 50 }
    const state = activate(partial, 'root', 75)
    expect(state.root).toBe(75)
    expect(state.sacral).toBe(50)
  })
})

// ============================================================
// Sequence and Messages Tests
// ============================================================
describe('_ACTIVATION_SEQUENCE', () => {
  it('has 7 chakras in correct order', () => {
    expect(_ACTIVATION_SEQUENCE).toEqual([
      'root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown',
    ])
  })

  it('starts with root', () => {
    expect(_ACTIVATION_SEQUENCE[0]).toBe('root')
  })

  it('ends with crown', () => {
    expect(_ACTIVATION_SEQUENCE[6]).toBe('crown')
  })
})

describe('_ACTIVATION_MESSAGES', () => {
  it('has messages for all 7 chakras', () => {
    for (const chakra of _ACTIVATION_SEQUENCE) {
      expect(_ACTIVATION_MESSAGES).toHaveProperty(chakra)
      expect(_ACTIVATION_MESSAGES[chakra as ChakraActivationOrder].length).toBeGreaterThan(0)
    }
  })

  it('root message mentions Muladhara', () => {
    expect(_ACTIVATION_MESSAGES.root).toContain('Muladhara')
  })

  it('crown message mentions Sahasrara', () => {
    expect(_ACTIVATION_MESSAGES.crown).toContain('Sahasrara')
  })

  it('each message ends with a period', () => {
    for (const chakra of _ACTIVATION_SEQUENCE) {
      expect(_ACTIVATION_MESSAGES[chakra as ChakraActivationOrder]).toMatch(/\.$/)
    }
  })
})
