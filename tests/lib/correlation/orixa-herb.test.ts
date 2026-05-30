/**
 * Orixá-Herb Spiritual Correlation Tests
 * Tests for the Fitoenergética (herbal spiritual correlation) system
 */

import { describe, it, expect } from 'vitest'
import {
  ORIXÁ_HERB_MAPPINGS,
  getOrixaHerbMapping,
  getOrixaMainHerbs,
  getOrixaContraHerbs,
  getOrixaFitoPractices,
  getHerbOrixas,
  getRitualCombinations,
  getAllHerbs,
  getHerbsByCategory,
  isHerbSafeForOrixa,
  OrixaName,
  HerbCategory
} from '@/lib/correlation/orixa-herb'

describe('Orixá-Herb Correlation (Fitoenergética)', () => {
  describe('ORIXÁ_HERB_MAPPINGS', () => {
    it('should have mappings for 9 major Orixás', () => {
      expect(ORIXÁ_HERB_MAPPINGS.length).toBe(9)
    })

    it('should have Oxalá mapping with herbs', () => {
      const oxala = ORIXÁ_HERB_MAPPINGS.find(m => m.orixa === 'Oxalá')
      expect(oxala).toBeDefined()
      expect(oxala!.erivas.length).toBeGreaterThan(0)
      expect(oxala!.erivas_principais.length).toBe(5)
    })

    it('should have Iemanjá mapping with herbs', () => {
      const iejama = ORIXÁ_HERB_MAPPINGS.find(m => m.orixa === 'Iemanjá')
      expect(iejama).toBeDefined()
      expect(iejama!.erivas.length).toBeGreaterThan(0)
    })

    it('should have Ogum mapping with herbs', () => {
      const ogum = ORIXÁ_HERB_MAPPINGS.find(m => m.orixa === 'Ogum')
      expect(ogum).toBeDefined()
      expect(ogum!.erivas_principais).toContain('Arruda')
    })

    it('should have Oxum mapping with herbs', () => {
      const oxum = ORIXÁ_HERB_MAPPINGS.find(m => m.orixa === 'Oxum')
      expect(oxum).toBeDefined()
      expect(oxum!.erivas_principais).toContain('Manjericão roxo')
    })

    it('should have Xangô mapping with herbs', () => {
      const xango = ORIXÁ_HERB_MAPPINGS.find(m => m.orixa === 'Xangô')
      expect(xango).toBeDefined()
      expect(xango!.erivas_principais).toContain('Cravo-da-índia')
    })

    it('should have Iansã mapping with herbs', () => {
      const iansa = ORIXÁ_HERB_MAPPINGS.find(m => m.orixa === 'Iansã')
      expect(iansa).toBeDefined()
      expect(iansa!.erivas_principais).toContain('Pimenta')
    })

    it('should have Oxóssi mapping with herbs', () => {
      const oxossi = ORIXÁ_HERB_MAPPINGS.find(m => m.orixa === 'Oxóssi')
      expect(oxossi).toBeDefined()
      expect(oxossi!.erivas_principais).toContain('Alecrim')
    })

    it('should have Omolu mapping with herbs', () => {
      const omolu = ORIXÁ_HERB_MAPPINGS.find(m => m.orixa === 'Omolu')
      expect(omolu).toBeDefined()
      expect(omolu!.erivas_principais).toContain('Guiné')
    })

    it('should have Nanã mapping with herbs', () => {
      const nana = ORIXÁ_HERB_MAPPINGS.find(m => m.orixa === 'Nanã')
      expect(nana).toBeDefined()
      expect(nana!.erivas_principais).toContain('Assignô')
    })

    it('should have all required fields for each mapping', () => {
      ORIXÁ_HERB_MAPPINGS.forEach(m => {
        expect(m.orixa).toBeDefined()
        expect(m.orixa_descricao).toBeDefined()
        expect(m.energia_primaria).toBeDefined()
        expect(m.erivas_principais).toBeDefined()
        expect(m.erivas_contraindicadas).toBeDefined()
        expect(m.praticas_fitoenergeticas).toBeDefined()
        expect(m.combinacoes_rituais).toBeDefined()
      })
    })

    it('should have proper herb properties structure', () => {
      ORIXÁ_HERB_MAPPINGS.forEach(m => {
        m.erivas.forEach(herb => {
          expect(herb.nome).toBeDefined()
          expect(herb.categoria).toBeDefined()
          expect(herb.aplicacao).toBeDefined()
          expect(herb.tempo_preparo).toBeDefined()
          expect(herb.significado_ritual).toBeDefined()
        })
      })
    })
  })

  describe('getOrixaHerbMapping', () => {
    it('should return mapping for Oxalá', () => {
      const mapping = getOrixaHerbMapping('Oxalá')
      expect(mapping).toBeDefined()
      expect(mapping?.orixa).toBe('Oxalá')
    })

    it('should return mapping for Iemanjá', () => {
      const mapping = getOrixaHerbMapping('Iemanjá')
      expect(mapping).toBeDefined()
      expect(mapping?.orixa).toBe('Iemanjá')
    })

    it('should return mapping for Ogum', () => {
      const mapping = getOrixaHerbMapping('Ogum')
      expect(mapping).toBeDefined()
      expect(mapping?.orixa).toBe('Ogum')
    })

    it('should handle case-insensitive search', () => {
      const mapping1 = getOrixaHerbMapping('OXALÁ')
      const mapping2 = getOrixaHerbMapping('oxalá')
      expect(mapping1).toEqual(mapping2)
    })

    it('should handle accented characters', () => {
      const mapping = getOrixaHerbMapping('Iansã')
      expect(mapping).toBeDefined()
    })

    it('should return null for unknown Orixá', () => {
      const mapping = getOrixaHerbMapping('Desconhecido')
      expect(mapping).toBeNull()
    })
  })

  describe('getOrixaMainHerbs', () => {
    it('should return 5 main herbs for Oxalá', () => {
      const herbs = getOrixaMainHerbs('Oxalá')
      expect(herbs.length).toBe(5)
      expect(herbs).toContain('Alface')
    })

    it('should return main herbs for Iemanjá', () => {
      const herbs = getOrixaMainHerbs('Iemanjá')
      expect(herbs.length).toBeGreaterThan(0)
      expect(herbs).toContain('Manjericão')
    })

    it('should return main herbs for Ogum', () => {
      const herbs = getOrixaMainHerbs('Ogum')
      expect(herbs.length).toBe(5)
      expect(herbs).toContain('Arruda')
    })

    it('should return empty array for unknown Orixá', () => {
      const herbs = getOrixaMainHerbs('Desconhecido')
      expect(herbs).toEqual([])
    })
  })

  describe('getOrixaContraHerbs', () => {
    it('should return contraindications for Oxalá', () => {
      const herbs = getOrixaContraHerbs('Oxalá')
      expect(herbs.length).toBeGreaterThan(0)
      expect(herbs).toContain('Pimenta')
    })

    it('should return contraindications for Iemanjá', () => {
      const herbs = getOrixaContraHerbs('Iemanjá')
      expect(herbs.length).toBeGreaterThan(0)
    })

    it('should return contraindications for Ogum', () => {
      const herbs = getOrixaContraHerbs('Ogum')
      expect(herbs.length).toBeGreaterThan(0)
      expect(herbs).toContain('Manjericão dulce')
    })

    it('should return empty array for unknown Orixá', () => {
      const herbs = getOrixaContraHerbs('Desconhecido')
      expect(herbs).toEqual([])
    })
  })

  describe('getOrixaFitoPractices', () => {
    it('should return practices for Oxalá', () => {
      const practices = getOrixaFitoPractices('Oxalá')
      expect(practices.length).toBeGreaterThan(0)
      expect(practices[0].toLowerCase()).toContain('alface')
    })

    it('should return practices for Iemanjá', () => {
      const practices = getOrixaFitoPractices('Iemanjá')
      expect(practices.length).toBeGreaterThan(0)
    })

    it('should return empty array for unknown Orixá', () => {
      const practices = getOrixaFitoPractices('Desconhecido')
      expect(practices).toEqual([])
    })
  })

  describe('getHerbOrixas', () => {
    it('should return Orixás associated with Manjericão', () => {
      const orixas = getHerbOrixas('Manjericão')
      expect(orixas.length).toBeGreaterThan(0)
      expect(orixas).toContain('Iemanjá')
      expect(orixas).toContain('Oxum')
    })

    it('should return Orixás associated with Arruda', () => {
      const orixas = getHerbOrixas('Arruda')
      expect(orixas.length).toBeGreaterThan(0)
      expect(orixas).toContain('Ogum')
      expect(orixas).toContain('Iansã')
    })

    it('should return Orixás associated with Alecrim', () => {
      const orixas = getHerbOrixas('Alecrim')
      expect(orixas.length).toBeGreaterThan(0)
      expect(orixas).toContain('Ogum')
      expect(orixas).toContain('Oxóssi')
    })
    it('should return empty array for unknown herb', () => {
      const orixas = getHerbOrixas('Erva Desconhecida')
      expect(orixas).toEqual([])
    })
  })

  describe('getRitualCombinations', () => {
    it('should return combinations for Oxalá + Iemanjá', () => {
      const combinations = getRitualCombinations('Oxalá', 'Iemanjá')
      expect(combinations.length).toBeGreaterThan(0)
      expect(combinations[0]).toContain('Alface')
    })

    it('should return combinations for Oxalá + Oxum', () => {
      const combinations = getRitualCombinations('Oxalá', 'Oxum')
      expect(combinations.length).toBeGreaterThan(0)
    })

    it('should return empty array for no matching combinations', () => {
      const combinations = getRitualCombinations('Oxalá', 'Desconhecido')
      expect(combinations).toEqual([])
    })
  })

  describe('getAllHerbs', () => {
    it('should return all herbs organized by Orixá', () => {
      const all = getAllHerbs()
      expect(all.length).toBe(9) // 9 Orixás mapped
      all.forEach(item => {
        expect(item.orixa).toBeDefined()
        expect(item.erivas.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getHerbsByCategory', () => {
    it('should return herbs by purificacao category', () => {
      const herbs = getHerbsByCategory('purificacao')
      expect(herbs.length).toBeGreaterThan(0)
      herbs.forEach(item => {
        expect(item.erivas.some(e => e.categoria === 'purificacao')).toBe(true)
      })
    })

    it('should return herbs by harmonizacao category', () => {
      const herbs = getHerbsByCategory('harmonizacao')
      expect(herbs.length).toBeGreaterThan(0)
      herbs.forEach(item => {
        expect(item.erivas.some(e => e.categoria === 'harmonizacao')).toBe(true)
      })
    })

    it('should return herbs by protecao category', () => {
      const herbs = getHerbsByCategory('protecao')
      expect(herbs.length).toBeGreaterThan(0)
    })

    it('should return herbs by expansao category', () => {
      const herbs = getHerbsByCategory('expansao')
      expect(herbs.length).toBeGreaterThan(0)
    })

    it('should return herbs by cura category', () => {
      const herbs = getHerbsByCategory('cura')
      expect(herbs.length).toBeGreaterThan(0)
    })

    it('should return herbs by ancestral category', () => {
      const herbs = getHerbsByCategory('ancestral')
      expect(herbs.length).toBeGreaterThan(0)
    })

    it('should return herbs by sagrada category', () => {
      const herbs = getHerbsByCategory('sagrada')
      expect(herbs.length).toBeGreaterThan(0)
    })
  })

  describe('isHerbSafeForOrixa', () => {
    it('should return safe for Manjericão with Oxalá', () => {
      const result = isHerbSafeForOrixa('Manjericão', 'Oxalá')
      expect(result.safe).toBe(true)
    })

    it('should return not safe for Pimenta with Oxalá', () => {
      const result = isHerbSafeForOrixa('Pimenta', 'Oxalá')
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('contraindicada')
    })

    it('should return not safe for Arruda with Oxum', () => {
      const result = isHerbSafeForOrixa('Arruda', 'Oxum')
      expect(result.safe).toBe(false)
    })

    it('should return safe for Arruda with Ogum', () => {
      const result = isHerbSafeForOrixa('Arruda', 'Ogum')
      expect(result.safe).toBe(true)
    })

    it('should return not safe for unknown Orixá', () => {
      const result = isHerbSafeForOrixa('Manjericão', 'Desconhecido')
      expect(result.safe).toBe(false)
      expect(result.reason).toBe('Orixá não encontrado')
    })
  })

  describe('Spiritual Correlations (Cross-Tradition)', () => {
    it('should correlate Ogum herbs with protection element', () => {
      const ogum = getOrixaHerbMapping('Ogum')
      expect(ogum?.energia_primaria).toBe('Proteção e conquista')
    })

    it('should correlate Oxum herbs with love element', () => {
      const oxum = getOrixaHerbMapping('Oxum')
      expect(oxum?.energia_primaria).toBe('Amor e prosperidade')
    })

    it('should correlate Xangô herbs with fire element', () => {
      const xango = getOrixaHerbMapping('Xangô')
      expect(xango?.energia_primaria).toBe('Justiça e transformação')
    })

    it('should have Omolu herbs related to healing', () => {
      const omolu = getOrixaHerbMapping('Omolu')
      const hasCuraHerbs = omolu!.erivas.some(e => e.categoria === 'cura')
      expect(hasCuraHerbs).toBe(true)
    })

    it('should have Nanã herbs related to ancestry', () => {
      const nana = getOrixaHerbMapping('Nanã')
      const hasAncestralHerbs = nana!.erivas.some(e => e.categoria === 'ancestral')
      expect(hasAncestralHerbs).toBe(true)
    })

    it('should have combinations between Orixás', () => {
      ORIXÁ_HERB_MAPPINGS.forEach(m => {
        expect(m.combinacoes_rituais.length).toBe(3) // 3 combinations each
      })
    })
  })
})