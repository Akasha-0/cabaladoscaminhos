import { describe, it, expect } from 'vitest'
import {
  getData,
  getPorTipo,
  getPorChakra,
  getPorSefira,
  getPorNivel,
  getPorFrequencia,
  getResonanciaMaisAlta,
  getResonanciaMaisComplexa,
  getResonanciaPorElemento,
} from '@/lib/resonance/resonance-data'

// ============================================================
// Resonance Data Tests
// ============================================================
describe('getData', () => {
  it('returns a non-empty array', () => {
    expect(getData().length).toBeGreaterThan(0)
  })

  it('each entry has required fields', () => {
    for (const entry of getData()) {
      expect(entry).toHaveProperty('id')
      expect(entry).toHaveProperty('nome')
      expect(entry).toHaveProperty('tipo')
      expect(entry).toHaveProperty('frequencias')
      expect(entry).toHaveProperty('chakra')
    }
  })

  it('tipo is one of the valid types', () => {
    const validTypes = ['armonica', 'planetaria', 'numerica', 'cabalistica']
    for (const entry of getData()) {
      expect(validTypes).toContain(entry.tipo)
    }
  })
})

describe('getPorTipo', () => {
  it('returns entries of specified type', () => {
    const planetaria = getPorTipo('planetaria')
    for (const entry of planetaria) {
      expect(entry.tipo).toBe('planetaria')
    }
  })

  it('returns empty for unknown type', () => {
    const unknown = getPorTipo('unknown' as any)
    expect(unknown.length).toBe(0)
  })
})

describe('getPorChakra', () => {
  it('returns entries involving specified chakra', () => {
    const chakra3 = getPorChakra(3)
    for (const entry of chakra3) {
      expect(entry.chakra).toContain(3)
    }
  })

  it('returns empty for chakra with no entries', () => {
    const unknown = getPorChakra(99)
    expect(unknown.length).toBe(0)
  })
})

describe('getPorSefira', () => {
  it('returns entries with specified sefira', () => {
    const sefirot = getPorSefira('Kether')
    for (const entry of sefirot) {
      expect(entry.sefirot).toContain('Kether')
    }
  })
})

describe('getPorNivel', () => {
  it('returns entries of specified level', () => {
    const nivel1 = getPorNivel(1)
    for (const entry of nivel1) {
      expect(entry.nivel).toBe(1)
    }
  })
})

describe('getPorFrequencia', () => {
  it('returns entries with specified frequency', () => {
    const freq396 = getPorFrequencia(396)
    for (const entry of freq396) {
      expect(entry.frequencias).toContain(396)
    }
  })
})

describe('getResonanciaMaisAlta', () => {
  it('returns a PadraoResonancia', () => {
    const alta = getResonanciaMaisAlta()
    expect(alta).toHaveProperty('id')
    expect(alta).toHaveProperty('nome')
    expect(typeof alta.nivel).toBe('number')
  })
})

describe('getResonanciaMaisComplexa', () => {
  it('returns a PadraoResonancia', () => {
    const complexa = getResonanciaMaisComplexa()
    expect(complexa).toHaveProperty('id')
    expect(Array.isArray(complexa.frequencias)).toBe(true)
  })
})

describe('getResonanciaPorElemento', () => {
  it('returns entries of specified element', () => {
    const fogo = getResonanciaPorElemento('Fogo')
    for (const entry of fogo) {
      expect(entry.elemento).toBe('Fogo')
    }
  })

  it('returns empty for unknown element', () => {
    const unknown = getResonanciaPorElemento('Unknown')
    expect(unknown.length).toBe(0)
  })
})
