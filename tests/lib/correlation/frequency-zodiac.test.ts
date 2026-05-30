import { describe, it, expect } from 'vitest';
import {
  getFrequencyZodiac,
  getZodiacFrequency,
  getAllFrequencyZodiacs,
  getFrequencyZodiacElement,
  getFrequencyZodiacHealing,
  getFrequenciesBySigno,
  getFrequencyZodiacBestEpoch,
  getFrequenciesZodiacByElement,
  getAllZodiacSigns,
  getFrequencyZodiacBySigno,
  FREQUENCY_ZODIAC_MAP,
  SOLFEGGIO_FREQUENCIES,
  type FrequencyZodiacMapping,
  type SignoZodiac,
} from '@/lib/correlation/frequency-zodiac';

describe('FrequencyZodiac Correlation', () => {
  // ─── getFrequencyZodiac: lookup function ─────────────────────────────────────
  describe('getFrequencyZodiac', () => {
    it('returns mapping for frequency 396 (Touro)', () => {
      const mapping = getFrequencyZodiac(396);
      expect(mapping).not.toBeNull();
      expect(mapping?.frequencia).toBe(396);
      expect(mapping?.signo).toBe('Touro');
      expect(mapping?.elemento).toBe('Terra');
    });

    it('returns mapping for frequency 417 (Câncer)', () => {
      const mapping = getFrequencyZodiac(417);
      expect(mapping).not.toBeNull();
      expect(mapping?.frequencia).toBe(417);
      expect(mapping?.signo).toBe('Câncer');
      expect(mapping?.elemento).toBe('Água');
    });

    it('returns mapping for frequency 528 (Leão)', () => {
      const mapping = getFrequencyZodiac(528);
      expect(mapping).not.toBeNull();
      expect(mapping?.frequencia).toBe(528);
      expect(mapping?.signo).toBe('Leão');
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('returns mapping for frequency 639 (Libra)', () => {
      const mapping = getFrequencyZodiac(639);
      expect(mapping).not.toBeNull();
      expect(mapping?.frequencia).toBe(639);
      expect(mapping?.signo).toBe('Libra');
      expect(mapping?.elemento).toBe('Ar');
    });

    it('returns mapping for frequency 741 (Aquário)', () => {
      const mapping = getFrequencyZodiac(741);
      expect(mapping).not.toBeNull();
      expect(mapping?.frequencia).toBe(741);
      expect(mapping?.signo).toBe('Aquário');
      expect(mapping?.elemento).toBe('Ar');
    });

    it('returns mapping for frequency 852 (Escorpião)', () => {
      const mapping = getFrequencyZodiac(852);
      expect(mapping).not.toBeNull();
      expect(mapping?.frequencia).toBe(852);
      expect(mapping?.signo).toBe('Escorpião');
      expect(mapping?.elemento).toBe('Água');
    });

    it('returns mapping for frequency 963 (Peixes)', () => {
      const mapping = getFrequencyZodiac(963);
      expect(mapping).not.toBeNull();
      expect(mapping?.frequencia).toBe(963);
      expect(mapping?.signo).toBe('Peixes');
      expect(mapping?.elemento).toBe('Água');
    });

    it('returns null for unknown frequency', () => {
      expect(getFrequencyZodiac(100)).toBeNull();
      expect(getFrequencyZodiac(0)).toBeNull();
      expect(getFrequencyZodiac(-396)).toBeNull();
    });
  });

  // ─── getZodiacFrequency: sign lookup ─────────────────────────────────────────
  describe('getZodiacFrequency', () => {
    it('returns sign for each frequency', () => {
      expect(getZodiacFrequency(396)).toBe('Touro');
      expect(getZodiacFrequency(417)).toBe('Câncer');
      expect(getZodiacFrequency(528)).toBe('Leão');
      expect(getZodiacFrequency(639)).toBe('Libra');
      expect(getZodiacFrequency(741)).toBe('Aquário');
      expect(getZodiacFrequency(852)).toBe('Escorpião');
      expect(getZodiacFrequency(963)).toBe('Peixes');
    });

    it('returns null for unknown frequency', () => {
      expect(getZodiacFrequency(100)).toBeNull();
      expect(getZodiacFrequency(0)).toBeNull();
    });
  });

  // ─── FREQUENCY_ZODIAC_MAP: all 7 frequencies ─────────────────────────────────
  describe('FREQUENCY_ZODIAC_MAP', () => {
    it('contains all 7 Solfeggio frequencies', () => {
      expect(Object.keys(FREQUENCY_ZODIAC_MAP)).toHaveLength(7);
      expect(FREQUENCY_ZODIAC_MAP).toHaveProperty('396');
      expect(FREQUENCY_ZODIAC_MAP).toHaveProperty('417');
      expect(FREQUENCY_ZODIAC_MAP).toHaveProperty('528');
      expect(FREQUENCY_ZODIAC_MAP).toHaveProperty('639');
      expect(FREQUENCY_ZODIAC_MAP).toHaveProperty('741');
      expect(FREQUENCY_ZODIAC_MAP).toHaveProperty('852');
      expect(FREQUENCY_ZODIAC_MAP).toHaveProperty('963');
    });

    it('each mapping has required fields', () => {
      Object.values(FREQUENCY_ZODIAC_MAP).forEach((mapping) => {
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('propriedades_healing');
      });
    });

    it('each mapping has healing properties with required subfields', () => {
      Object.values(FREQUENCY_ZODIAC_MAP).forEach((mapping) => {
        expect(mapping.propriedades_healing).toHaveProperty('fisico');
        expect(mapping.propriedades_healing).toHaveProperty('emocional');
        expect(mapping.propriedades_healing).toHaveProperty('mental_espiritual');
        expect(mapping.propriedades_healing).toHaveProperty('melhor_epoca');
      });
    });

    it('contains unique zodiac signs', () => {
      const signs = Object.values(FREQUENCY_ZODIAC_MAP).map((m) => m.signo);
      const uniqueSigns = new Set(signs);
      expect(uniqueSigns.size).toBe(7);
    });
  });

  // ─── getAllFrequencyZodiacs: collection function ─────────────────────────────
  describe('getAllFrequencyZodiacs', () => {
    it('returns array of all 7 mappings', () => {
      const all = getAllFrequencyZodiacs();
      expect(all).toHaveLength(7);
    });

    it('returns array with correct structure', () => {
      const all = getAllFrequencyZodiacs();
      all.forEach((mapping) => {
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('propriedades_healing');
      });
    });

    it('includes all frequencies', () => {
      const all = getAllFrequencyZodiacs();
      const frequencies = all.map((m) => m.frequencia);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(963);
    });
  });

  // ─── getFrequencyZodiacElement: element lookup ───────────────────────────────
  describe('getFrequencyZodiacElement', () => {
    it('returns element for each frequency', () => {
      expect(getFrequencyZodiacElement(396)).toBe('Terra');
      expect(getFrequencyZodiacElement(417)).toBe('Água');
      expect(getFrequencyZodiacElement(528)).toBe('Fogo');
      expect(getFrequencyZodiacElement(639)).toBe('Ar');
      expect(getFrequencyZodiacElement(741)).toBe('Ar');
      expect(getFrequencyZodiacElement(852)).toBe('Água');
      expect(getFrequencyZodiacElement(963)).toBe('Água');
    });

    it('returns null for unknown frequency', () => {
      expect(getFrequencyZodiacElement(100)).toBeNull();
    });
  });

  // ─── getFrequencyZodiacHealing: healing properties lookup ───────────────────
  describe('getFrequencyZodiacHealing', () => {
    it('returns healing properties for each frequency', () => {
      const healing396 = getFrequencyZodiacHealing(396);
      expect(healing396).not.toBeNull();
      expect(healing396?.fisico).toBeTruthy();
      expect(healing396?.emocional).toBeTruthy();
      expect(healing396?.mental_espiritual).toBeTruthy();
      expect(healing396?.melhor_epoca).toBeTruthy();
    });

    it('returns null for unknown frequency', () => {
      expect(getFrequencyZodiacHealing(100)).toBeNull();
    });

    it('each frequency has non-empty healing strings', () => {
      [396, 417, 528, 639, 741, 852, 963].forEach((freq) => {
        const healing = getFrequencyZodiacHealing(freq);
        expect(healing?.fisico.length).toBeGreaterThan(0);
        expect(healing?.emocional.length).toBeGreaterThan(0);
        expect(healing?.mental_espiritual.length).toBeGreaterThan(0);
        expect(healing?.melhor_epoca.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── getFrequenciesBySigno: signs lookup ─────────────────────────────────────
  describe('getFrequenciesBySigno', () => {
    it('returns frequency mapping for each zodiac sign', () => {
      expect(getFrequenciesBySigno('Touro')).toHaveLength(1);
      expect(getFrequenciesBySigno('Câncer')).toHaveLength(1);
      expect(getFrequenciesBySigno('Leão')).toHaveLength(1);
      expect(getFrequenciesBySigno('Libra')).toHaveLength(1);
      expect(getFrequenciesBySigno('Aquário')).toHaveLength(1);
      expect(getFrequenciesBySigno('Escorpião')).toHaveLength(1);
      expect(getFrequenciesBySigno('Peixes')).toHaveLength(1);
    });

    it('returns empty array for unknown sign', () => {
      expect(getFrequenciesBySigno('Gêmeos')).toHaveLength(0);
      expect(getFrequenciesBySigno('Áries')).toHaveLength(0);
    });
  });

  // ─── getFrequencyZodiacBestEpoch: epoch lookup ──────────────────────────────
  describe('getFrequencyZodiacBestEpoch', () => {
    it('returns best epoch for each frequency', () => {
      expect(getFrequencyZodiacBestEpoch(396)).toBeTruthy();
      expect(getFrequencyZodiacBestEpoch(417)).toBeTruthy();
      expect(getFrequencyZodiacBestEpoch(528)).toBeTruthy();
      expect(getFrequencyZodiacBestEpoch(639)).toBeTruthy();
      expect(getFrequencyZodiacBestEpoch(741)).toBeTruthy();
      expect(getFrequencyZodiacBestEpoch(852)).toBeTruthy();
      expect(getFrequencyZodiacBestEpoch(963)).toBeTruthy();
    });

    it('returns null for unknown frequency', () => {
      expect(getFrequencyZodiacBestEpoch(100)).toBeNull();
    });

    it('best epochs are non-empty strings', () => {
      [396, 417, 528, 639, 741, 852, 963].forEach((freq) => {
        const epoch = getFrequencyZodiacBestEpoch(freq);
        expect(typeof epoch).toBe('string');
        expect(epoch?.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── getFrequenciesZodiacByElement: element filter ───────────────────────────
  describe('getFrequenciesZodiacByElement', () => {
    it('returns frequencies by element', () => {
      const terraFreqs = getFrequenciesZodiacByElement('Terra');
      expect(terraFreqs).toHaveLength(1);
      expect(terraFreqs[0].frequencia).toBe(396);

      const fogoFreqs = getFrequenciesZodiacByElement('Fogo');
      expect(fogoFreqs).toHaveLength(1);
      expect(fogoFreqs[0].frequencia).toBe(528);

      const arFreqs = getFrequenciesZodiacByElement('Ar');
      expect(arFreqs).toHaveLength(2);
      expect(arFreqs.map((f) => f.frequencia)).toContain(639);
      expect(arFreqs.map((f) => f.frequencia)).toContain(741);

      const aguaFreqs = getFrequenciesZodiacByElement('Água');
      expect(aguaFreqs).toHaveLength(3);
      expect(aguaFreqs.map((f) => f.frequencia)).toContain(417);
      expect(aguaFreqs.map((f) => f.frequencia)).toContain(852);
      expect(aguaFreqs.map((f) => f.frequencia)).toContain(963);
    });

    it('returns empty array for unknown element', () => {
      expect(getFrequenciesZodiacByElement('Éter')).toHaveLength(0);
    });

    it('is case-insensitive', () => {
      expect(getFrequenciesZodiacByElement('terra')).toHaveLength(1);
      expect(getFrequenciesZodiacByElement('FOGO')).toHaveLength(1);
      expect(getFrequenciesZodiacByElement('Água')).toHaveLength(3);
    });
  });

  // ─── getAllZodiacSigns: collection function ───────────────────────────────────
  describe('getAllZodiacSigns', () => {
    it('returns array of unique signs', () => {
      const signs = getAllZodiacSigns();
      expect(signs).toHaveLength(7);
    });

    it('contains expected zodiac signs', () => {
      const signs = getAllZodiacSigns();
      expect(signs).toContain('Touro');
      expect(signs).toContain('Câncer');
      expect(signs).toContain('Leão');
      expect(signs).toContain('Libra');
      expect(signs).toContain('Aquário');
      expect(signs).toContain('Escorpião');
      expect(signs).toContain('Peixes');
    });
  });

  // ─── getFrequencyZodiacBySigno: case-insensitive sign lookup ─────────────────
  describe('getFrequencyZodiacBySigno', () => {
    it('finds sign by exact name', () => {
      const mapping = getFrequencyZodiacBySigno('Touro');
      expect(mapping).not.toBeNull();
      expect(mapping?.frequencia).toBe(396);
    });

    it('finds sign case-insensitively', () => {
      const mapping1 = getFrequencyZodiacBySigno('TOURO');
      expect(mapping1?.frequencia).toBe(396);

      const mapping2 = getFrequencyZodiacBySigno('leão');
      expect(mapping2?.frequencia).toBe(528);
    });

    it('finds sign by common variations', () => {
      const mapping1 = getFrequencyZodiacBySigno('touro');
      expect(mapping1?.frequencia).toBe(396);

      const mapping2 = getFrequencyZodiacBySigno('peixes');
      expect(mapping2?.frequencia).toBe(963);
    });

    it('returns null for unknown sign', () => {
      expect(getFrequencyZodiacBySigno('Áries')).toBeNull();
      expect(getFrequencyZodiacBySigno('Virgem')).toBeNull();
    });
  });

  // ─── SOLFEGGIO_FREQUENCIES constant ──────────────────────────────────────────
  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('contains all 7 frequencies in ascending order', () => {
      expect(SOLFEGGIO_FREQUENCIES).toHaveLength(7);
      expect(SOLFEGGIO_FREQUENCIES[0]).toBe(396);
      expect(SOLFEGGIO_FREQUENCIES[6]).toBe(963);
    });

    it('frequencies are in ascending order', () => {
      const sorted = [...SOLFEGGIO_FREQUENCIES].sort((a, b) => a - b);
      expect(SOLFEGGIO_FREQUENCIES).toEqual(sorted);
    });
  });

  // ─── Object immutability checks ─────────────────────────────────────────────
  describe('object immutability', () => {
    it('FREQUENCY_ZODIAC_MAP is frozen', () => {
      expect(Object.isFrozen(FREQUENCY_ZODIAC_MAP)).toBe(true);
    });

    it('individual mappings are frozen', () => {
      Object.values(FREQUENCY_ZODIAC_MAP).forEach((mapping) => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });
  });

  // ─── Type exports ────────────────────────────────────────────────────────────
  describe('type exports', () => {
    it('exports FrequencyZodiacMapping type', () => {
      const mapping: FrequencyZodiacMapping = {
        frequencia: 396,
        signo: 'Touro',
        elemento: 'Terra',
        propriedades_healing: {
          fisico: 'test',
          emocional: 'test',
          mental_espiritual: 'test',
          melhor_epoca: 'test',
        },
      };
      expect(mapping.frequencia).toBe(396);
    });

    it('exports SignoZodiac type', () => {
      const signo: SignoZodiac = 'Leão';
      expect(signo).toBe('Leão');
    });
  });

  // ─── Integration with other correlations ───────────────────────────────────
  describe('Integration with other correlations', () => {
    it('frequencies match SOLFEGGIO_FREQUENCIES from frequency-element', () => {
      const allFreqs = getAllFrequencyZodiacs();
      const freqNumbers = allFreqs.map((m) => m.frequencia);
      expect(freqNumbers).toContain(396);
      expect(freqNumbers).toContain(417);
      expect(freqNumbers).toContain(528);
      expect(freqNumbers).toContain(639);
      expect(freqNumbers).toContain(741);
      expect(freqNumbers).toContain(852);
      expect(freqNumbers).toContain(963);
    });

    it('elements are consistent with frequency-element module', () => {
      expect(getFrequencyZodiacElement(396)).toBe('Terra');
      expect(getFrequencyZodiacElement(417)).toBe('Água');
      expect(getFrequencyZodiacElement(528)).toBe('Fogo');
      expect(getFrequencyZodiacElement(639)).toBe('Ar');
      expect(getFrequencyZodiacElement(741)).toBe('Ar');
      expect(getFrequencyZodiacElement(852)).toBe('Água');
      expect(getFrequencyZodiacElement(963)).toBe('Água');
    });
  });
});