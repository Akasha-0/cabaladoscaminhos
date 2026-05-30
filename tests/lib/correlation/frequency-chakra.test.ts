import { describe, it, expect } from 'vitest';
import {
  getFrequencyChakra,
  getFrequenciesByChakra,
  getMantramByFrequency,
  getDivineNameByFrequency,
  getPoliedroByFrequency,
  getDirectionByFrequency,
  FREQUENCY_CHAKRA_MAP,
  SOLFEGGIO_FREQUENCIES,
} from '@/lib/correlation/frequency-chakra';

describe('FrequencyChakra Correlation', () => {
  describe('getFrequencyChakra', () => {
    it('should return mapping for 396 Hz (Muladhara)', () => {
      const result = getFrequencyChakra(396);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('1º Básico');
      expect(result?.chakra_numero).toBe(1);
      expect(result?.poliedro_platao).toBe('Ponto / Cubo de Base');
      expect(result?.mantram_som_semente).toBe('LAM');
      expect(result?.nome_divino_cabala).toBe('ADONAI HA-ARETZ');
      expect(result?.direcao_elemental).toBe('Norte');
      expect(result?.elemento_regente).toBe('Terra');
    });

    it('should return mapping for 417 Hz (Svadhisthana)', () => {
      const result = getFrequencyChakra(417);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('2º Sacro');
      expect(result?.chakra_numero).toBe(2);
      expect(result?.poliedro_platao).toBe('Cubo / Hexaedro');
      expect(result?.mantram_som_semente).toBe('VAM');
      expect(result?.nome_divino_cabala).toBe('ELOHIM GIBOR');
      expect(result?.direcao_elemental).toBe('Oeste');
      expect(result?.elemento_regente).toBe('Água');
    });

    it('should return mapping for 528 Hz (Manipura)', () => {
      const result = getFrequencyChakra(528);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('3º Plexo Solar');
      expect(result?.chakra_numero).toBe(3);
      expect(result?.poliedro_platao).toBe('Tetraedro');
      expect(result?.mantram_som_semente).toBe('RAM');
      expect(result?.nome_divino_cabala).toBe('SHADDAI EL CHAI');
      expect(result?.direcao_elemental).toBe('Oeste');
      expect(result?.elemento_regente).toBe('Fogo');
    });

    it('should return mapping for 639 Hz (Anahata)', () => {
      const result = getFrequencyChakra(639);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('4º Cardíaco');
      expect(result?.chakra_numero).toBe(4);
      expect(result?.poliedro_platao).toBe('Octaedro');
      expect(result?.mantram_som_semente).toBe('YAM');
      expect(result?.nome_divino_cabala).toBe('YHVH ELOAH VA-DAATH');
      expect(result?.direcao_elemental).toBe('Sul');
      expect(result?.elemento_regente).toBe('Ar / Água');
    });

    it('should return mapping for 741 Hz (Vishuddha)', () => {
      const result = getFrequencyChakra(741);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('5º Laríngeo');
      expect(result?.chakra_numero).toBe(5);
      expect(result?.poliedro_platao).toBe('Dodecaedro');
      expect(result?.mantram_som_semente).toBe('HAM');
      expect(result?.nome_divino_cabala).toBe('ELOHIM SABAOTH');
      expect(result?.direcao_elemental).toBe('Leste');
      expect(result?.elemento_regente).toBe('Ar');
    });

    it('should return mapping for 852 Hz (Ajna)', () => {
      const result = getFrequencyChakra(852);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('6º Frontal');
      expect(result?.chakra_numero).toBe(6);
      expect(result?.poliedro_platao).toBe('Icosaedro');
      expect(result?.mantram_som_semente).toBe('OM');
      expect(result?.nome_divino_cabala).toBe('YAH');
      expect(result?.direcao_elemental).toBe('Leste');
      expect(result?.elemento_regente).toBe('Éter / Ar');
    });

    it('should return mapping for 963 Hz (Sahasrara)', () => {
      const result = getFrequencyChakra(963);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('7º Coronário');
      expect(result?.chakra_numero).toBe(7);
      expect(result?.poliedro_platao).toBe('Esfera (Unidade Total)');
      expect(result?.mantram_som_semente).toBe('AUM / SILÊNCIO');
      expect(result?.nome_divino_cabala).toBe('EHEIEH');
      expect(result?.direcao_elemental).toBe('Centro / Zênite');
      expect(result?.elemento_regente).toBe('Éter (Quintessência)');
    });

    it('should return null for non-Solfeggio frequencies', () => {
      expect(getFrequencyChakra(440)).toBeNull();
      expect(getFrequencyChakra(100)).toBeNull();
      expect(getFrequencyChakra(1000)).toBeNull();
    });

    it('should have dinamica field for each frequency', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const result = getFrequencyChakra(freq);
        expect(result?.dinamica).toBeDefined();
        expect(result?.dinamica.length).toBeGreaterThan(0);
      });
    });
  });

  describe('FREQUENCY_CHAKRA_MAP', () => {
    it('should have exactly 7 entries', () => {
      expect(Object.keys(FREQUENCY_CHAKRA_MAP).length).toBe(7);
    });

    it('should contain all Solfeggio frequencies', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        expect(FREQUENCY_CHAKRA_MAP[freq]).toBeDefined();
      });
    });

    it('should have frequencies in ascending order by chakra number', () => {
      const entries = Object.entries(FREQUENCY_CHAKRA_MAP);
      for (let i = 0; i < entries.length - 1; i++) {
        expect(entries[i][1].chakra_numero).toBeLessThan(entries[i + 1][1].chakra_numero);
      }
    });
  });

  describe('getFrequenciesByChakra', () => {
    it('should return frequencies for chakra 1 (Root)', () => {
      const result = getFrequenciesByChakra(1);
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(396);
    });

    it('should return frequencies for chakra 7 (Crown)', () => {
      const result = getFrequenciesByChakra(7);
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(963);
    });

    it('should return empty array for invalid chakra number', () => {
      expect(getFrequenciesByChakra(0)).toHaveLength(0);
      expect(getFrequenciesByChakra(8)).toHaveLength(0);
    });
  });

  describe('getMantramByFrequency', () => {
    it('should return correct mantras for all frequencies', () => {
      expect(getMantramByFrequency(396)).toBe('LAM');
      expect(getMantramByFrequency(417)).toBe('VAM');
      expect(getMantramByFrequency(528)).toBe('RAM');
      expect(getMantramByFrequency(639)).toBe('YAM');
      expect(getMantramByFrequency(741)).toBe('HAM');
      expect(getMantramByFrequency(852)).toBe('OM');
      expect(getMantramByFrequency(963)).toBe('AUM / SILÊNCIO');
    });

    it('should return null for invalid frequencies', () => {
      expect(getMantramByFrequency(500)).toBeNull();
    });
  });

  describe('getDivineNameByFrequency', () => {
    it('should return correct divine names for all frequencies', () => {
      expect(getDivineNameByFrequency(396)).toBe('ADONAI HA-ARETZ');
      expect(getDivineNameByFrequency(417)).toBe('ELOHIM GIBOR');
      expect(getDivineNameByFrequency(528)).toBe('SHADDAI EL CHAI');
      expect(getDivineNameByFrequency(639)).toBe('YHVH ELOAH VA-DAATH');
      expect(getDivineNameByFrequency(741)).toBe('ELOHIM SABAOTH');
      expect(getDivineNameByFrequency(852)).toBe('YAH');
      expect(getDivineNameByFrequency(963)).toBe('EHEIEH');
    });

    it('should return null for invalid frequencies', () => {
      expect(getDivineNameByFrequency(300)).toBeNull();
    });
  });

  describe('getPoliedroByFrequency', () => {
    it('should return correct Platonic solids for all frequencies', () => {
      expect(getPoliedroByFrequency(396)).toBe('Ponto / Cubo de Base');
      expect(getPoliedroByFrequency(417)).toBe('Cubo / Hexaedro');
      expect(getPoliedroByFrequency(528)).toBe('Tetraedro');
      expect(getPoliedroByFrequency(639)).toBe('Octaedro');
      expect(getPoliedroByFrequency(741)).toBe('Dodecaedro');
      expect(getPoliedroByFrequency(852)).toBe('Icosaedro');
      expect(getPoliedroByFrequency(963)).toBe('Esfera (Unidade Total)');
    });

    it('should return null for invalid frequencies', () => {
      expect(getPoliedroByFrequency(200)).toBeNull();
    });
  });

  describe('getDirectionByFrequency', () => {
    it('should return correct directions for all frequencies', () => {
      expect(getDirectionByFrequency(396)).toBe('Norte');
      expect(getDirectionByFrequency(417)).toBe('Oeste');
      expect(getDirectionByFrequency(528)).toBe('Oeste');
      expect(getDirectionByFrequency(639)).toBe('Sul');
      expect(getDirectionByFrequency(741)).toBe('Leste');
      expect(getDirectionByFrequency(852)).toBe('Leste');
      expect(getDirectionByFrequency(963)).toBe('Centro / Zênite');
    });

    it('should return null for invalid frequencies', () => {
      expect(getDirectionByFrequency(444)).toBeNull();
    });
  });
});