import { describe, it, expect } from 'vitest';
import {
  getEclipseMeditation,
  getEclipseMeditationTypes,
  getEclipseMeditationByVisibility,
} from '@/lib/guidance/eclipse-meditation';

describe('eclipse-meditation', () => {
  describe('getEclipseMeditation', () => {
    it('returns meditation with type solar', () => {
      const meditation = getEclipseMeditation('solar');
      expect(meditation.type).toBe('solar');
    });

    it('returns meditation with type lunar', () => {
      const meditation = getEclipseMeditation('lunar');
      expect(meditation.type).toBe('lunar');
    });

    it('throws Error for invalid type', () => {
      expect(() => getEclipseMeditation('invalid' as any)).toThrow();
    });
  });

  describe('getEclipseMeditationTypes', () => {
    it("returns ['solar', 'lunar']", () => {
      const types = getEclipseMeditationTypes();
      expect(types).toEqual(['solar', 'lunar']);
    });
  });

  describe('getEclipseMeditationByVisibility', () => {
    it('returns solar_anular meditation for solar anular', () => {
      const meditation = getEclipseMeditationByVisibility('solar', 'anular');
      expect(meditation.name).toBe('Eclipse Solar Anular — O Anel de Fogo');
      expect(meditation.type).toBe('solar');
    });

    it('returns solar_parcial meditation for solar parcial', () => {
      const meditation = getEclipseMeditationByVisibility('solar', 'parcial');
      expect(meditation.name).toBe('Eclipse Solar Parcial — A Sombra Revelada');
      expect(meditation.type).toBe('solar');
    });

    it('returns lunar_total meditation for lunar total', () => {
      const meditation = getEclipseMeditationByVisibility('lunar', 'total');
      expect(meditation.name).toBe('Eclipse Lunar Total — A Grande Revelação');
      expect(meditation.type).toBe('lunar');
    });

    it('returns lunar_penumbra meditation for lunar penumbral', () => {
      const meditation = getEclipseMeditationByVisibility('lunar', 'penumbral');
      expect(meditation.name).toBe('Eclipse Penumbral — A Sombra Suave');
      expect(meditation.type).toBe('lunar');
    });

    it('defaults to solar meditation when no visibility provided', () => {
      const meditation = getEclipseMeditationByVisibility('solar');
      expect(meditation.name).toBe('Eclipse Solar — Renascimento');
      expect(meditation.type).toBe('solar');
    });

    it('defaults to lunar meditation when no visibility provided', () => {
      const meditation = getEclipseMeditationByVisibility('lunar');
      expect(meditation.name).toBe('Eclipse Lunar — Revelação das Profundezas');
      expect(meditation.type).toBe('lunar');
    });
  });

  describe('EclipseMeditation structure', () => {
    const requiredFields = [
      'name',
      'type',
      'element',
      'mantra',
      'visualization',
      'breathPattern',
      'duration',
      'phases',
      'affirmation',
      'focus',
      'guidance',
    ];

    it('all returned meditations have required fields', () => {
      const solar = getEclipseMeditation('solar');
      const lunar = getEclipseMeditation('lunar');
      const solarAnular = getEclipseMeditationByVisibility('solar', 'anular');
      const solarParcial = getEclipseMeditationByVisibility('solar', 'parcial');
      const lunarTotal = getEclipseMeditationByVisibility('lunar', 'total');
      const lunarPenumbra = getEclipseMeditationByVisibility('lunar', 'penumbral');

      [solar, lunar, solarAnular, solarParcial, lunarTotal, lunarPenumbra].forEach((meditation) => {
        requiredFields.forEach((field) => {
          expect(meditation).toHaveProperty(field);
        });
      });
    });

    it('phases is array of MeditationPhase objects', () => {
      const meditation = getEclipseMeditation('solar');
      expect(Array.isArray(meditation.phases)).toBe(true);
      expect(meditation.phases.length).toBeGreaterThan(0);

      const phase = meditation.phases[0];
      expect(phase).toHaveProperty('name');
      expect(phase).toHaveProperty('duration');
      expect(phase).toHaveProperty('description');
      expect(phase).toHaveProperty('breath');
    });

    it('focus is array of strings', () => {
      const meditation = getEclipseMeditation('solar');
      expect(Array.isArray(meditation.focus)).toBe(true);
      expect(meditation.focus.length).toBeGreaterThan(0);
      expect(typeof meditation.focus[0]).toBe('string');
    });
  });
});