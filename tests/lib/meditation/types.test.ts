import { describe, it, expect } from 'vitest'
import { getTypes, getCategories } from '@/lib/meditation/types'

describe('getTypes', () => {
  it('returns an array of MeditationTypeDefinition', () => {
    const types = getTypes()
    expect(Array.isArray(types)).toBe(true)
    expect(types.length).toBe(5)
  })

  it('each type has category, label, description', () => {
    for (const type of getTypes()) {
      expect(type).toHaveProperty('category')
      expect(type).toHaveProperty('label')
      expect(type).toHaveProperty('description')
    }
  })

  it('categories are all valid MeditationCategory values', () => {
    const valid = ['cura', 'sono', 'foco', 'energia', 'sagrado']
    for (const type of getTypes()) {
      expect(valid).toContain(type.category)
    }
  })
})

describe('getCategories', () => {
  it('returns array of category strings', () => {
    const cats = getCategories()
    expect(Array.isArray(cats)).toBe(true)
    for (const cat of cats) {
      expect(typeof cat).toBe('string')
    }
  })
})
