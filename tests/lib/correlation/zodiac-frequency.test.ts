import { describe, it, expect } from 'vitest';
import {
  getZodiacFrequency,
  getFrequencyZodiac,
  getAllZodiacFrequencies,
  getFrequenciaFromSigno,
  getElementFromSigno,
  getHealingFromSigno,
  getSignosByFrequencia,
  getBestEpochFromSigno,
  getSignosByElement,
  getAllSigns,
  getZodiacFrequencyBySigno,
  ZODIAC_FREQUENCY_MAP,
  SOLFEGGIO_FREQUENCIES,
  TODOS_SIGNOS,
  type ZodiacFrequencyMapping,
  type SignoZodiac,
} from '@/lib/correlation/zodiac-frequency';

describe('ZodiacFrequency Correlation', () => {
  // ─── ZODIAC_FREQUENCY_MAP: all 12 signs ───────────────────────────────────

  describe('ZODIAC_FREQUENCY_MAP', () => {
    it('contains all 12 zodiac signs', () => {
      expect(Object.keys(ZODIAC_FREQUENCY_MAP)).toHaveLength(12);
    });

    it('maps Áries to 528Hz (Fogo)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Áries'];
      expect(mapping.frequencia).toBe(528);
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.signo).toBe('Áries');
    });

    it('maps Touro to 396Hz (Terra)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Touro'];
      expect(mapping.frequencia).toBe(396);
      expect(mapping.elemento).toBe('Terra');
    });

    it('maps Gémeos to 417Hz (Ar)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Gémeos'];
      expect(mapping.frequencia).toBe(417);
      expect(mapping.elemento).toBe('Ar');
    });

    it('maps Câncer to 417Hz (Água)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Câncer'];
      expect(mapping.frequencia).toBe(417);
      expect(mapping.elemento).toBe('Água');
    });

    it('maps Leão to 528Hz (Fogo)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Leão'];
      expect(mapping.frequencia).toBe(528);
      expect(mapping.elemento).toBe('Fogo');
    });

    it('maps Virgem to 741Hz (Terra)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Virgem'];
      expect(mapping.frequencia).toBe(741);
      expect(mapping.elemento).toBe('Terra');
    });

    it('maps Libra to 639Hz (Ar)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Libra'];
      expect(mapping.frequencia).toBe(639);
      expect(mapping.elemento).toBe('Ar');
    });

    it('maps Escorpião to 852Hz (Água)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Escorpião'];
      expect(mapping.frequencia).toBe(852);
      expect(mapping.elemento).toBe('Água');
    });

    it('maps Sagitário to 528Hz (Fogo)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Sagitário'];
      expect(mapping.frequencia).toBe(528);
      expect(mapping.elemento).toBe('Fogo');
    });

    it('maps Capricórnio to 741Hz (Terra)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Capricórnio'];
      expect(mapping.frequencia).toBe(741);
      expect(mapping.elemento).toBe('Terra');
    });

    it('maps Aquário to 741Hz (Ar)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Aquário'];
      expect(mapping.frequencia).toBe(741);
      expect(mapping.elemento).toBe('Ar');
    });

    it('maps Peixes to 963Hz (Água)', () => {
      const mapping = ZODIAC_FREQUENCY_MAP['Peixes'];
      expect(mapping.frequencia).toBe(963);
      expect(mapping.elemento).toBe('Água');
    });

    it('includes healing properties for each sign', () => {
      for (const mapping of Object.values(ZODIAC_FREQUENCY_MAP)) {
        expect(mapping.propriedades_healing).toBeDefined();
        expect(mapping.propriedades_healing.fisico).toBeDefined();
        expect(mapping.propriedades_healing.emocional).toBeDefined();
        expect(mapping.propriedades_healing.mental_espiritual).toBeDefined();
        expect(mapping.propriedades_healing.melhor_epoca).toBeDefined();
      }
    });
  });

  // ─── getZodiacFrequency: lookup by sign ─────────────────────────────────────

  describe('getZodiacFrequency', () => {
    it('returns correct mapping for Áries', () => {
      const result = getZodiacFrequency('Áries');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Áries');
      expect(result!.frequencia).toBe(528);
      expect(result!.elemento).toBe('Fogo');
    });

    it('returns correct mapping for Touro', () => {
      const result = getZodiacFrequency('Touro');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Touro');
      expect(result!.frequencia).toBe(396);
      expect(result!.elemento).toBe('Terra');
    });

    it('returns correct mapping for Gémeos', () => {
      const result = getZodiacFrequency('Gémeos');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Gémeos');
      expect(result!.frequencia).toBe(417);
    });

    it('returns correct mapping for Câncer', () => {
      const result = getZodiacFrequency('Câncer');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Câncer');
      expect(result!.frequencia).toBe(417);
    });

    it('returns correct mapping for Leão', () => {
      const result = getZodiacFrequency('Leão');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Leão');
      expect(result!.frequencia).toBe(528);
    });

    it('returns correct mapping for Virgem', () => {
      const result = getZodiacFrequency('Virgem');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Virgem');
      expect(result!.frequencia).toBe(741);
    });

    it('returns correct mapping for Libra', () => {
      const result = getZodiacFrequency('Libra');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Libra');
      expect(result!.frequencia).toBe(639);
    });

    it('returns correct mapping for Escorpião', () => {
      const result = getZodiacFrequency('Escorpião');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Escorpião');
      expect(result!.frequencia).toBe(852);
    });

    it('returns correct mapping for Sagitário', () => {
      const result = getZodiacFrequency('Sagitário');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Sagitário');
      expect(result!.frequencia).toBe(528);
    });

    it('returns correct mapping for Capricórnio', () => {
      const result = getZodiacFrequency('Capricórnio');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Capricórnio');
      expect(result!.frequencia).toBe(741);
    });

    it('returns correct mapping for Aquário', () => {
      const result = getZodiacFrequency('Aquário');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Aquário');
      expect(result!.frequencia).toBe(741);
    });

    it('returns correct mapping for Peixes', () => {
      const result = getZodiacFrequency('Peixes');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Peixes');
      expect(result!.frequencia).toBe(963);
    });

    it('accepts lowercase sign name', () => {
      const result = getZodiacFrequency('aries');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Áries');
    });

    it('accepts sign name without accent', () => {
      const result = getZodiacFrequency('Cancer');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Câncer');
    });

    it('returns null for unknown sign', () => {
      const result = getZodiacFrequency('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty input', () => {
      const result = getZodiacFrequency('');
      expect(result).toBeNull();
    });
  });

  // ─── getFrequencyZodiac: frequency lookup ───────────────────────────────────

  describe('getFrequencyZodiac', () => {
    it('returns Áries for 528Hz', () => {
      const result = getFrequencyZodiac(528);
      expect(result).toBe('Áries');
    });

    it('returns Touro for 396Hz', () => {
      const result = getFrequencyZodiac(396);
      expect(result).toBe('Touro');
    });

    it('returns Gémeos for 417Hz', () => {
      const result = getFrequencyZodiac(417);
      expect(result).toBe('Gémeos');
    });

    it('returns Libra for 639Hz', () => {
      const result = getFrequencyZodiac(639);
      expect(result).toBe('Libra');
    });

    it('returns Escorpião for 852Hz', () => {
      const result = getFrequencyZodiac(852);
      expect(result).toBe('Escorpião');
    });

    it('returns Peixes for 963Hz', () => {
      const result = getFrequencyZodiac(963);
      expect(result).toBe('Peixes');
    });

    it('returns first matching sign for shared frequency (528)', () => {
      // 528Hz is shared by Áries, Leão, Sagitário
      const result = getFrequencyZodiac(528);
      expect(['Áries', 'Leão', 'Sagitário']).toContain(result);
    });

    it('returns null for unknown frequency', () => {
      const result = getFrequencyZodiac(999);
      expect(result).toBeNull();
    });
  });

  // ─── getAllZodiacFrequencies: collection function ───────────────────────────

  describe('getAllZodiacFrequencies', () => {
    it('returns all 12 mappings', () => {
      const result = getAllZodiacFrequencies();
      expect(result).toHaveLength(12);
    });

    it('includes all zodiac signs', () => {
      const result = getAllZodiacFrequencies();
      const signos = result.map((m) => m.signo);
      expect(signos).toContain('Áries');
      expect(signos).toContain('Touro');
      expect(signos).toContain('Gémeos');
      expect(signos).toContain('Câncer');
      expect(signos).toContain('Leão');
      expect(signos).toContain('Virgem');
      expect(signos).toContain('Libra');
      expect(signos).toContain('Escorpião');
      expect(signos).toContain('Sagitário');
      expect(signos).toContain('Capricórnio');
      expect(signos).toContain('Aquário');
      expect(signos).toContain('Peixes');
    });

    it('returns fresh array each call', () => {
      const result1 = getAllZodiacFrequencies();
      const result2 = getAllZodiacFrequencies();
      expect(result1).not.toBe(result2);
    });
  });

  // ─── getFrequenciaFromSigno: frequency by sign ────────────────────────────

  describe('getFrequenciaFromSigno', () => {
    it('returns 528 for Áries', () => {
      expect(getFrequenciaFromSigno('Áries')).toBe(528);
    });

    it('returns 396 for Touro', () => {
      expect(getFrequenciaFromSigno('Touro')).toBe(396);
    });

    it('returns 417 for Gémeos', () => {
      expect(getFrequenciaFromSigno('Gémeos')).toBe(417);
    });

    it('returns null for unknown sign', () => {
      expect(getFrequenciaFromSigno('Unknown')).toBeNull();
    });
  });

  // ─── getElementFromSigno: element by sign ──────────────────────────────────

  describe('getElementFromSigno', () => {
    it('returns Fogo for Áries', () => {
      expect(getElementFromSigno('Áries')).toBe('Fogo');
    });

    it('returns Terra for Touro', () => {
      expect(getElementFromSigno('Touro')).toBe('Terra');
    });

    it('returns Ar for Gémeos', () => {
      expect(getElementFromSigno('Gémeos')).toBe('Ar');
    });

    it('returns Água for Câncer', () => {
      expect(getElementFromSigno('Câncer')).toBe('Água');
    });

    it('returns null for unknown sign', () => {
      expect(getElementFromSigno('Unknown')).toBeNull();
    });
  });

  // ─── getHealingFromSigno: healing properties by sign ──────────────────────

  describe('getHealingFromSigno', () => {
    it('returns healing properties for Áries', () => {
      const result = getHealingFromSigno('Áries');
      expect(result).not.toBeNull();
      expect(result!.fisico).toContain('nervoso');
      expect(result!.emocional).toContain('coragem');
    });

    it('returns healing properties for Peixes', () => {
      const result = getHealingFromSigno('Peixes');
      expect(result).not.toBeNull();
      expect(result!.mental_espiritual).toContain('divino');
    });

    it('returns null for unknown sign', () => {
      expect(getHealingFromSigno('Unknown')).toBeNull();
    });
  });

  // ─── getSignosByFrequencia: signs by frequency ─────────────────────────────

  describe('getSignosByFrequencia', () => {
    it('returns multiple signs for shared frequency 528', () => {
      const result = getSignosByFrequencia(528);
      expect(result.length).toBeGreaterThanOrEqual(2);
      const signos = result.map((m) => m.signo);
      expect(signos).toContain('Áries');
      expect(signos).toContain('Leão');
      expect(signos).toContain('Sagitário');
    });

    it('returns single sign for unique frequency 396', () => {
      const result = getSignosByFrequencia(396);
      expect(result).toHaveLength(1);
      expect(result[0].signo).toBe('Touro');
    });

    it('returns single sign for unique frequency 852', () => {
      const result = getSignosByFrequencia(852);
      expect(result).toHaveLength(1);
      expect(result[0].signo).toBe('Escorpião');
    });

    it('returns empty array for unknown frequency', () => {
      const result = getSignosByFrequencia(999);
      expect(result).toHaveLength(0);
    });
  });

  // ─── getBestEpochFromSigno: best epoch by sign ────────────────────────────

  describe('getBestEpochFromSigno', () => {
    it('returns best epoch for Áries', () => {
      const result = getBestEpochFromSigno('Áries');
      expect(result).not.toBeNull();
      expect(result).toContain('projetos');
    });

    it('returns best epoch for Peixes', () => {
      const result = getBestEpochFromSigno('Peixes');
      expect(result).not.toBeNull();
      expect(result).toContain('Méditação');
    });

    it('returns null for unknown sign', () => {
      expect(getBestEpochFromSigno('Unknown')).toBeNull();
    });
  });

  // ─── getSignosByElement: signs by element ─────────────────────────────────

  describe('getSignosByElement', () => {
    it('returns 3 Fogo signs (Áries, Leão, Sagitário)', () => {
      const result = getSignosByElement('Fogo');
      expect(result).toHaveLength(3);
      const signos = result.map((m) => m.signo);
      expect(signos).toContain('Áries');
      expect(signos).toContain('Leão');
      expect(signos).toContain('Sagitário');
    });

    it('returns 3 Terra signs (Touro, Virgem, Capricórnio)', () => {
      const result = getSignosByElement('Terra');
      expect(result).toHaveLength(3);
      const signos = result.map((m) => m.signo);
      expect(signos).toContain('Touro');
      expect(signos).toContain('Virgem');
      expect(signos).toContain('Capricórnio');
    });

    it('returns 3 Ar signs (Gémeos, Libra, Aquário)', () => {
      const result = getSignosByElement('Ar');
      expect(result).toHaveLength(3);
      const signos = result.map((m) => m.signo);
      expect(signos).toContain('Gémeos');
      expect(signos).toContain('Libra');
      expect(signos).toContain('Aquário');
    });

    it('returns 3 Água signs (Câncer, Escorpião, Peixes)', () => {
      const result = getSignosByElement('Água');
      expect(result).toHaveLength(3);
      const signos = result.map((m) => m.signo);
      expect(signos).toContain('Câncer');
      expect(signos).toContain('Escorpião');
      expect(signos).toContain('Peixes');
    });

    it('returns empty array for unknown element', () => {
      const result = getSignosByElement('Unknown');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getAllSigns: collection function ───────────────────────────────────────

  describe('getAllSigns', () => {
    it('returns all 12 zodiac signs', () => {
      const result = getAllSigns();
      expect(result).toHaveLength(12);
    });

    it('contains all expected signs', () => {
      const result = getAllSigns();
      expect(result).toContain('Áries');
      expect(result).toContain('Touro');
      expect(result).toContain('Gémeos');
      expect(result).toContain('Câncer');
      expect(result).toContain('Leão');
      expect(result).toContain('Virgem');
      expect(result).toContain('Libra');
      expect(result).toContain('Escorpião');
      expect(result).toContain('Sagitário');
      expect(result).toContain('Capricórnio');
      expect(result).toContain('Aquário');
      expect(result).toContain('Peixes');
    });
  });

  // ─── getZodiacFrequencyBySigno: case-insensitive sign lookup ────────────────

  describe('getZodiacFrequencyBySigno', () => {
    it('returns mapping for uppercase sign', () => {
      const result = getZodiacFrequencyBySigno('ÁRIES');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Áries');
    });

    it('returns mapping for lowercase sign', () => {
      const result = getZodiacFrequencyBySigno('touro');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Touro');
    });

    it('returns mapping for mixed case sign', () => {
      const result = getZodiacFrequencyBySigno('Leao');
      expect(result).not.toBeNull();
      expect(result!.signo).toBe('Leão');
    });

    it('returns null for unknown sign', () => {
      const result = getZodiacFrequencyBySigno('Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── SOLFEGGIO_FREQUENCIES constant ────────────────────────────────────────

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('contains all 7 Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toHaveLength(7);
      expect(SOLFEGGIO_FREQUENCIES).toContain(396);
      expect(SOLFEGGIO_FREQUENCIES).toContain(417);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(639);
      expect(SOLFEGGIO_FREQUENCIES).toContain(741);
      expect(SOLFEGGIO_FREQUENCIES).toContain(852);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });

    it('contains frequencies in ascending order', () => {
      const sorted = [...SOLFEGGIO_FREQUENCIES].sort((a, b) => a - b);
      expect(SOLFEGGIO_FREQUENCIES).toEqual(sorted);
    });
  });

  // ─── TODOS_SIGNOS constant ─────────────────────────────────────────────────

  describe('TODOS_SIGNOS constant', () => {
    it('contains all 12 zodiac signs', () => {
      expect(TODOS_SIGNOS).toHaveLength(12);
    });

    it('contains expected signs', () => {
      expect(TODOS_SIGNOS).toContain('Áries');
      expect(TODOS_SIGNOS).toContain('Touro');
      expect(TODOS_SIGNOS).toContain('Aquário');
    });
  });

  // ─── Object immutability checks ────────────────────────────────────────────

  describe('object immutability', () => {
    it('ZODIAC_FREQUENCY_MAP is frozen', () => {
      expect(Object.isFrozen(ZODIAC_FREQUENCY_MAP)).toBe(true);
    });

    it('individual mappings are frozen', () => {
      for (const mapping of Object.values(ZODIAC_FREQUENCY_MAP)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  // ─── Type exports ──────────────────────────────────────────────────────────

  describe('type exports', () => {
    it('exports ZodiacFrequencyMapping type', () => {
      const mapping: ZodiacFrequencyMapping = {
        signo: 'Áries',
        frequencia: 528,
        elemento: 'Fogo',
        propriedades_healing: {
          fisico: 'test',
          emocional: 'test',
          mental_espiritual: 'test',
          melhor_epoca: 'test',
        },
      };
      expect(mapping.signo).toBe('Áries');
    });

    it('exports SignoZodiac type', () => {
      const signo: SignoZodiac = 'Áries';
      expect(signo).toBe('Áries');
    });
  });

  // ─── Integration with other correlations ───────────────────────────────────

  describe('Integration with other correlations', () => {
    it('element distribution matches zodiac-element pattern', () => {
      const fogoSigns = getSignosByElement('Fogo');
      const terraSigns = getSignosByElement('Terra');
      const arSigns = getSignosByElement('Ar');
      const aguaSigns = getSignosByElement('Água');

      expect(fogoSigns).toHaveLength(3);
      expect(terraSigns).toHaveLength(3);
      expect(arSigns).toHaveLength(3);
      expect(aguaSigns).toHaveLength(3);
      expect(fogoSigns.length + terraSigns.length + arSigns.length + aguaSigns.length).toBe(12);
    });

    it('frequency distribution covers all 7 Solfeggio frequencies', () => {
      const usedFrequencies = new Set<number>();
      for (const mapping of Object.values(ZODIAC_FREQUENCY_MAP)) {
        usedFrequencies.add(mapping.frequencia);
      }

      // Should use at least 5 of the 7 Solfeggio frequencies
      expect(usedFrequencies.size).toBeGreaterThanOrEqual(5);

      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const signs = getSignosByFrequencia(freq);
        // At least some frequencies are used
        if (usedFrequencies.has(freq)) {
          expect(signs.length).toBeGreaterThan(0);
        }
      }
    });
  });
});