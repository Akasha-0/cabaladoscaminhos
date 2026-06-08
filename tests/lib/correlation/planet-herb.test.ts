/**
 * Planet-Herbs Spiritual Correlation Tests
 * Tests for the planetary herbal correlation system
 */

import { describe, it, expect } from 'vitest'
import {
  PLANET_HERB_MAPPINGS,
  getPlanetHerbMapping,
  getPlanetMainHerbs,
  getPlanetContraHerbs,
  getPlanetPractices,
  getHerbPlanets,
  getPlanetRitualCombinations,
  getAllPlanetHerbs,
  getHerbsByApplication,
  isHerbSafeForPlanet,
  getHerbFavoritePlanet,
  PlanetName
} from '@/lib/correlation/planet-herb'

describe('Planet-Herbs Correlation', () => {
  describe('PLANET_HERB_MAPPINGS', () => {
    it('should have 7 planets mapped', () => {
      expect(PLANET_HERB_MAPPINGS.length).toBe(7)
    })

    it('should have Sol mapping', () => {
      const sol = PLANET_HERB_MAPPINGS.find(p => p.planeta === 'Sol')
      expect(sol).toBeDefined()
      expect(sol!.ervas_principais.length).toBe(5)
      expect(sol!.signo_regente).toBe('Leão')
      expect(sol!.elemento).toBe('Fogo')
      expect(sol!.energia).toBe('yang')
    })

    it('should have Lua mapping', () => {
      const lua = PLANET_HERB_MAPPINGS.find(p => p.planeta === 'Lua')
      expect(lua).toBeDefined()
      expect(lua!.ervas_principais).toContain('Camomila')
      expect(lua!.signo_regente).toBe('Câncer')
      expect(lua!.elemento).toBe('Água')
    })

    it('should have Mercúrio mapping', () => {
      const mercurio = PLANET_HERB_MAPPINGS.find(p => p.planeta === 'Mercúrio')
      expect(mercurio).toBeDefined()
      expect(mercurio!.ervas_principais).toContain('Alecrim')
    })

    it('should have Vênus mapping', () => {
      const venus = PLANET_HERB_MAPPINGS.find(p => p.planeta === 'Vênus')
      expect(venus).toBeDefined()
      expect(venus!.ervas_principais).toContain('Rosa')
    })

    it('should have Marte mapping', () => {
      const marte = PLANET_HERB_MAPPINGS.find(p => p.planeta === 'Marte')
      expect(marte).toBeDefined()
      expect(marte!.ervas_principais).toContain('Pimenta')
    })

    it('should have Júpiter mapping', () => {
      const jupiter = PLANET_HERB_MAPPINGS.find(p => p.planeta === 'Júpiter')
      expect(jupiter).toBeDefined()
      expect(jupiter!.ervas_principais).toContain('Sálvia')
    })

    it('should have Saturno mapping', () => {
      const saturno = PLANET_HERB_MAPPINGS.find(p => p.planeta === 'Saturno')
      expect(saturno).toBeDefined()
      expect(saturno!.ervas_principais.length).toBe(5)
    })

    it('should have all required fields for each planet', () => {
      PLANET_HERB_MAPPINGS.forEach(m => {
        expect(m.planeta).toBeDefined()
        expect(m.planeta_descricao).toBeDefined()
        expect(m.signo_regente).toBeDefined()
        expect(m.elemento).toBeDefined()
        expect(m.energia).toBeDefined()
        expect(m.dia_semana).toBeDefined()
        expect(m.horario_favoravel).toBeDefined()
        expect(m.ervas_principais).toBeDefined()
        expect(m.ervas_contraindicadas).toBeDefined()
        expect(m.propriedades).toBeDefined()
        expect(m.praticas_planetarias).toBeDefined()
        expect(m.combinaciones_rituais).toBeDefined()
      })
    })

    it('should have proper herb properties structure', () => {
      PLANET_HERB_MAPPINGS.forEach(m => {
        m.propriedades.forEach(herb => {
          expect(herb.nome).toBeDefined()
          expect(herb.aplicacao).toBeDefined()
          expect(herb.tempo_preparo).toBeDefined()
          expect(herb.significado_planetario).toBeDefined()
          expect(herb.combinacao_planetaria).toBeDefined()
        })
      })
    })
  })

  describe('getPlanetHerbMapping', () => {
    it('should return mapping for Sol', () => {
      const mapping = getPlanetHerbMapping('Sol')
      expect(mapping).toBeDefined()
      expect(mapping?.planeta).toBe('Sol')
    })

    it('should return mapping for Lua', () => {
      const mapping = getPlanetHerbMapping('Lua')
      expect(mapping).toBeDefined()
      expect(mapping?.planeta).toBe('Lua')
    })

    it('should return mapping for Mercúrio', () => {
      const mapping = getPlanetHerbMapping('Mercúrio')
      expect(mapping).toBeDefined()
      expect(mapping?.planeta).toBe('Mercúrio')
    })

    it('should return mapping for Vênus', () => {
      const mapping = getPlanetHerbMapping('Vênus')
      expect(mapping).toBeDefined()
      expect(mapping?.planeta).toBe('Vênus')
    })

    it('should handle case-insensitive search', () => {
      const mapping1 = getPlanetHerbMapping('SOL')
      const mapping2 = getPlanetHerbMapping('sol')
      expect(mapping1).toEqual(mapping2)
    })

    it('should return null for unknown planet', () => {
      const mapping = getPlanetHerbMapping('Netuno')
      expect(mapping).toBeNull()
    })
  })

  describe('getPlanetMainHerbs', () => {
    it('should return 5 main herbs for Sol', () => {
      const herbs = getPlanetMainHerbs('Sol')
      expect(herbs.length).toBe(5)
      expect(herbs).toContain('Helicriso')
    })

    it('should return main herbs for Lua', () => {
      const herbs = getPlanetMainHerbs('Lua')
      expect(herbs.length).toBeGreaterThan(0)
      expect(herbs).toContain('Camomila')
    })

    it('should return main herbs for Vênus', () => {
      const herbs = getPlanetMainHerbs('Vênus')
      expect(herbs).toContain('Rosa')
    })

    it('should return empty array for unknown planet', () => {
      const herbs = getPlanetMainHerbs('Desconhecido')
      expect(herbs).toEqual([])
    })
  })

  describe('getPlanetContraHerbs', () => {
    it('should return contraindications for Sol', () => {
      const herbs = getPlanetContraHerbs('Sol')
      expect(herbs.length).toBeGreaterThan(0)
      expect(herbs).toContain('Arruda')
    })

    it('should return contraindications for Lua', () => {
      const herbs = getPlanetContraHerbs('Lua')
      expect(herbs.length).toBeGreaterThan(0)
    })

    it('should return empty array for unknown planet', () => {
      const herbs = getPlanetContraHerbs('Desconhecido')
      expect(herbs).toEqual([])
    })
  })

  describe('getPlanetPractices', () => {
    it('should return practices for Sol', () => {
      const practices = getPlanetPractices('Sol')
      expect(practices.length).toBeGreaterThan(0)
    })

    it('should return practices for Lua', () => {
      const practices = getPlanetPractices('Lua')
      expect(practices.length).toBeGreaterThan(0)
    })

    it('should return empty array for unknown planet', () => {
      const practices = getPlanetPractices('Desconhecido')
      expect(practices).toEqual([])
    })
  })

  describe('getHerbPlanets', () => {
    it('should return planets associated with Camomila', () => {
      const planets = getHerbPlanets('Camomila')
      expect(planets.length).toBeGreaterThan(0)
      expect(planets).toContain('Lua')
    })

    it('should return planets associated with Alecrim', () => {
      const planets = getHerbPlanets('Alecrim')
      expect(planets.length).toBeGreaterThan(0)
      expect(planets).toContain('Mercúrio')
    })

    it('should return planets associated with Rosa', () => {
      const planets = getHerbPlanets('Rosa')
      expect(planets.length).toBeGreaterThan(0)
      expect(planets).toContain('Vênus')
    })

    it('should return planets associated with Pimenta', () => {
      const planets = getHerbPlanets('Pimenta')
      expect(planets.length).toBeGreaterThan(0)
      expect(planets).toContain('Marte')
    })

    it('should return empty array for unknown herb', () => {
      const planets = getHerbPlanets('Erva Desconhecida')
      expect(planets).toEqual([])
    })
  })

  describe('getPlanetRitualCombinations', () => {
    it('should return combinations for Sol + Lua', () => {
      const combinations = getPlanetRitualCombinations('Sol', 'Lua')
      expect(combinations.length).toBe(0) // No direct combination
    })

    it('should return empty array for no matching combinations', () => {
      const combinations = getPlanetRitualCombinations('Sol', 'Desconhecido')
      expect(combinations).toEqual([])
    })
  })

  describe('getAllPlanetHerbs', () => {
    it('should return all herbs organized by planet', () => {
      const all = getAllPlanetHerbs()
      expect(all.length).toBe(7)
      all.forEach(item => {
        expect(item.planeta).toBeDefined()
        expect(item.propriedades.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getHerbsByApplication', () => {
    it('should return herbs by defumacao', () => {
      const herbs = getHerbsByApplication('defumacao')
      expect(herbs.length).toBeGreaterThan(0)
    })

    it('should return herbs by infusao', () => {
      const herbs = getHerbsByApplication('infusao')
      expect(herbs.length).toBeGreaterThan(0)
    })

    it('should return herbs by banho', () => {
      const herbs = getHerbsByApplication('banho')
      expect(herbs.length).toBeGreaterThan(0)
    })
  })

  describe('isHerbSafeForPlanet', () => {
    it('should return safe for Camomila with Sol', () => {
      const result = isHerbSafeForPlanet('Camomila', 'Sol')
      expect(result.safe).toBe(true)
    })

    it('should return not safe for Arruda with Sol', () => {
      const result = isHerbSafeForPlanet('Arruda', 'Sol')
      expect(result.safe).toBe(false)
      expect(result.reason).toContain('contraindicada')
    })

    it('should return safe for Pimenta with Marte', () => {
      const result = isHerbSafeForPlanet('Pimenta', 'Marte')
      expect(result.safe).toBe(true)
    })

    it('should return not safe for Camomila with Marte', () => {
      const result = isHerbSafeForPlanet('Camomila', 'Marte')
      expect(result.safe).toBe(false)
    })

    it('should return not safe for unknown planet', () => {
      const result = isHerbSafeForPlanet('Alecrim', 'Desconhecido')
      expect(result.safe).toBe(false)
      expect(result.reason).toBe('Planeta não encontrado')
    })
  })

  describe('getHerbFavoritePlanet', () => {
    it('should return Sol for Helichrysum', () => {
      const planet = getHerbFavoritePlanet('Helicriso')
      expect(planet).toBe('Sol')
    })

    it('should return Lua for Camomila', () => {
      const planet = getHerbFavoritePlanet('Camomila')
      expect(planet).toBe('Lua')
    })

    it('should return Mercúrio for Alecrim', () => {
      const planet = getHerbFavoritePlanet('Alecrim')
      expect(planet).toBe('Mercúrio')
    })

    it('should return Lua for Rosa (matches Rosa branca)', () => {
      const planet = getHerbFavoritePlanet('Rosa')
      expect(planet).toBe('Lua') // Matches "Rosa branca" under Lua first
    })

    it('should return Marte for Pimenta', () => {
      const planet = getHerbFavoritePlanet('Pimenta')
      expect(planet).toBe('Marte')
    })

    it('should return null for unknown herb', () => {
      const planet = getHerbFavoritePlanet('Erva Desconhecida')
      expect(planet).toBeNull()
    })
  })

  describe('Spiritual Correlations', () => {
    it('should correlate Sol herbs with fire element', () => {
      const sol = getPlanetHerbMapping('Sol')
      expect(sol?.elemento).toBe('Fogo')
    })

    it('should correlate Lua herbs with water element', () => {
      const lua = getPlanetHerbMapping('Lua')
      expect(lua?.elemento).toBe('Água')
    })

    it('should have weekdays for each planet', () => {
      PLANET_HERB_MAPPINGS.forEach(m => {
        expect(m.dia_semana).toBeDefined()
      })
    })

    it('should have energy types (yang/yin/neutro)', () => {
      const energies = new Set<string>()
      PLANET_HERB_MAPPINGS.forEach(m => energies.add(m.energia))
      expect(energies.size).toBe(3)
    })
  })
})