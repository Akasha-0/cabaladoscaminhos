import { describe, it, expect } from 'vitest';
import {
  getFrequencyChakra,
  getChakraFrequency,
  getAllFrequencyChakras,
  getFrequenciesByChakra,
  getMantramByFrequency,
  getDivineNameByFrequency,
  getPoliedroByFrequency,
  getDirectionByFrequency,
  getElementByFrequency,
  getHealingByFrequency,
  getFrequenciesByElement,
  FREQUENCY_CHAKRA_MAP,
  SOLFEGGIO_FREQUENCIES,
  type FrequencyChakra,
} from '@/lib/correlation/frequency-chakra';

describe('FrequencyChakra Correlation', () => {
  describe('getFrequencyChakra', () => {
    it('should return mapping for 396 Hz (Muladhara/Raiz)', () => {
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

    it('should return mapping for 417 Hz (Svadhisthana/Sacro)', () => {
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

    it('should return mapping for 528 Hz (Manipura/Plexo Solar)', () => {
      const result = getFrequencyChakra(528);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('3º Plexo Solar');
      expect(result?.chakra_numero).toBe(3);
      expect(result?.poliedro_platao).toBe('Tetraedro');
      expect(result?.mantram_som_semente).toBe('RAM');
      expect(result?.nome_divino_cabala).toBe('SHADDAI EL CHAI');
      expect(result?.direcao_elemental).toBe('Sul');
      expect(result?.elemento_regente).toBe('Fogo');
    });

    it('should return mapping for 639 Hz (Anahata/Cardíaco)', () => {
      const result = getFrequencyChakra(639);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('4º Cardíaco');
      expect(result?.chakra_numero).toBe(4);
      expect(result?.poliedro_platao).toBe('Octaedro');
      expect(result?.mantram_som_semente).toBe('YAM');
      expect(result?.nome_divino_cabala).toBe('YHVH ELOAH VA-DAATH');
      expect(result?.direcao_elemental).toBe('Leste');
      expect(result?.elemento_regente).toBe('Ar');
    });

    it('should return mapping for 741 Hz (Vishuddha/Laríngeo)', () => {
      const result = getFrequencyChakra(741);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('5º Laríngeo');
      expect(result?.chakra_numero).toBe(5);
      expect(result?.poliedro_platao).toBe('Dodecaedro');
      expect(result?.mantram_som_semente).toBe('HAM');
      expect(result?.nome_divino_cabala).toBe('ELOHIM SABAOTH');
      expect(result?.direcao_elemental).toBe('Sul');
      expect(result?.elemento_regente).toBe('Ar');
    });

    it('should return mapping for 852 Hz (Ajna/Frontal)', () => {
      const result = getFrequencyChakra(852);
      expect(result).not.toBeNull();
      expect(result?.chakra).toBe('6º Frontal');
      expect(result?.chakra_numero).toBe(6);
      expect(result?.poliedro_platao).toBe('Icosaedro');
      expect(result?.mantram_som_semente).toBe('OM');
      expect(result?.nome_divino_cabala).toBe('YAH');
      expect(result?.direcao_elemental).toBe('Norte');
      expect(result?.elemento_regente).toBe('Éter');
    });

    it('should return mapping for 963 Hz (Sahasrara/Coronário)', () => {
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

    it('should have elemento_conexao field for each frequency', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const result = getFrequencyChakra(freq);
        expect(result?.elemento_conexao).toBeDefined();
        expect(result?.elemento_conexao.primario).toBeDefined();
        expect(result?.elemento_conexao.qualidades).toHaveLength(3);
        expect(result?.elemento_conexao.fluxo_energetico).toBeDefined();
      });
    });

    it('should have propriedades_healing field for each frequency', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const result = getFrequencyChakra(freq);
        expect(result?.propriedades_healing).toBeDefined();
        expect(result?.propriedades_healing.fisico).toBeDefined();
        expect(result?.propriedades_healing.emocional).toBeDefined();
        expect(result?.propriedades_healing.mental_espiritual).toBeDefined();
        expect(result?.propriedades_healing.pratica_recomendada).toBeDefined();
      });
    });
  });

  describe('getChakraFrequency', () => {
    it('should return correct frequency for chakra number 1', () => {
      expect(getChakraFrequency(1)).toBe(396);
    });

    it('should return correct frequency for chakra number 7', () => {
      expect(getChakraFrequency(7)).toBe(963);
    });

    it('should return correct frequency for chakra name "1º Básico"', () => {
      expect(getChakraFrequency('1º Básico')).toBe(396);
    });

    it('should return correct frequency for chakra name "Muladhara"', () => {
      expect(getChakraFrequency('Muladhara')).toBe(396);
    });

    it('should return correct frequency for chakra name "Sahasrara"', () => {
      expect(getChakraFrequency('Sahasrara')).toBe(963);
    });

    it('should return correct frequency for chakra name "Ajna"', () => {
      expect(getChakraFrequency('Ajna')).toBe(852);
    });

    it('should return null for invalid chakra', () => {
      expect(getChakraFrequency(0)).toBeNull();
      expect(getChakraFrequency(8)).toBeNull();
      expect(getChakraFrequency('Invalid')).toBeNull();
    });
  });

  describe('getAllFrequencyChakras', () => {
    it('should return all 7 frequency-chakra mappings', () => {
      const result = getAllFrequencyChakras();
      expect(result).toHaveLength(7);
    });

    it('should return mappings sorted by chakra number', () => {
      const result = getAllFrequencyChakras();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].chakra_numero).toBeLessThan(result[i + 1].chakra_numero);
      }
    });

    it('should include all required fields in each mapping', () => {
      const result = getAllFrequencyChakras();
      result.forEach((mapping) => {
        expect(mapping.frequencia).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_numero).toBeDefined();
        expect(mapping.poliedro_platao).toBeDefined();
        expect(mapping.mantram_som_semente).toBeDefined();
        expect(mapping.nome_divino_cabala).toBeDefined();
        expect(mapping.direcao_elemental).toBeDefined();
        expect(mapping.elemento_regente).toBeDefined();
        expect(mapping.elemento_conexao).toBeDefined();
        expect(mapping.dinamica).toBeDefined();
        expect(mapping.propriedades_healing).toBeDefined();
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

    it('should map each frequency to correct chakra number', () => {
      const expected: Record<number, number> = {
        396: 1,
        417: 2,
        528: 3,
        639: 4,
        741: 5,
        852: 6,
        963: 7,
      };
      Object.entries(expected).forEach(([freq, chakraNum]) => {
        expect(FREQUENCY_CHAKRA_MAP[Number(freq)].chakra_numero).toBe(chakraNum);
      });
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
      expect(getDirectionByFrequency(528)).toBe('Sul');
      expect(getDirectionByFrequency(639)).toBe('Leste');
      expect(getDirectionByFrequency(741)).toBe('Sul');
      expect(getDirectionByFrequency(852)).toBe('Norte');
      expect(getDirectionByFrequency(963)).toBe('Centro / Zênite');
    });

    it('should return null for invalid frequencies', () => {
      expect(getDirectionByFrequency(444)).toBeNull();
    });
  });

  describe('getElementByFrequency', () => {
    it('should return element connection for 396 Hz (Terra)', () => {
      const result = getElementByFrequency(396);
      expect(result).not.toBeNull();
      expect(result?.primario).toBe('Terra');
      expect(result?.qualidades).toContain('Frio');
      expect(result?.qualidades).toContain('Seco');
    });

    it('should return element connection for 417 Hz (Água)', () => {
      const result = getElementByFrequency(417);
      expect(result).not.toBeNull();
      expect(result?.primario).toBe('Água');
      expect(result?.qualidades).toContain('Frio');
      expect(result?.qualidades).toContain('Úmido');
    });

    it('should return element connection for 528 Hz (Fogo)', () => {
      const result = getElementByFrequency(528);
      expect(result).not.toBeNull();
      expect(result?.primario).toBe('Fogo');
      expect(result?.qualidades).toContain('Quente');
      expect(result?.qualidades).toContain('Seco');
    });

    it('should return element with secondary for 639 Hz (Ar + Água)', () => {
      const result = getElementByFrequency(639);
      expect(result).not.toBeNull();
      expect(result?.primario).toBe('Ar');
      expect(result?.secundario).toBe('Água');
    });

    it('should return null for invalid frequencies', () => {
      expect(getElementByFrequency(500)).toBeNull();
    });
  });

  describe('getHealingByFrequency', () => {
    it('should return healing properties for 396 Hz', () => {
      const result = getHealingByFrequency(396);
      expect(result).not.toBeNull();
      expect(result?.fisico).toBe('Fortalece ossos, sistema imunológico e órgãos vitais');
      expect(result?.emocional).toContain('medos');
      expect(result?.pratica_recomendada).toContain('Meditação');
    });

    it('should return healing properties for 528 Hz', () => {
      const result = getHealingByFrequency(528);
      expect(result).not.toBeNull();
      expect(result?.fisico).toContain('metabolismo');
      expect(result?.emocional).toContain('amor');
      expect(result?.mental_espiritual).toContain('criatividade');
    });

    it('should return healing properties for 963 Hz (Sahasrara)', () => {
      const result = getHealingByFrequency(963);
      expect(result).not.toBeNull();
      expect(result?.fisico).toContain('DNA');
      expect(result?.mental_espiritual).toContain('Fonte');
    });

    it('should return null for invalid frequencies', () => {
      expect(getHealingByFrequency(500)).toBeNull();
    });
  });

  describe('getFrequenciesByElement', () => {
    it('should return all frequencies for Terra element', () => {
      const result = getFrequenciesByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(
          mapping.elemento_regente.includes('Terra') ||
          mapping.elemento_conexao.primario === 'Terra' ||
          mapping.elemento_conexao.secundario === 'Terra'
        ).toBe(true);
      });
    });

    it('should return all frequencies for Água element', () => {
      const result = getFrequenciesByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(
          mapping.elemento_regente.includes('Água') ||
          mapping.elemento_conexao.primario === 'Água' ||
          mapping.elemento_conexao.secundario === 'Água'
        ).toBe(true);
      });
    });

    it('should return all frequencies for Fogo element', () => {
      const result = getFrequenciesByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(
          mapping.elemento_regente.includes('Fogo') ||
          mapping.elemento_conexao.primario === 'Fogo'
        ).toBe(true);
      });
    });

    it('should return empty array for unknown element', () => {
      const result = getFrequenciesByElement('Desconhecido');
      expect(result).toHaveLength(0);
    });
  });

  describe('Element connections', () => {
    it('should have correct element flow directions', () => {
      expect(getElementByFrequency(396)?.fluxo_energetico).toBe('Descendente e centrípeto');
      expect(getElementByFrequency(417)?.fluxo_energetico).toBe('Ondulante e expansivo');
      expect(getElementByFrequency(528)?.fluxo_energetico).toBe('Ascendente e radiante');
    });

    it('should have exactly 3 elemental qualities per frequency', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const element = getElementByFrequency(freq);
        expect(element?.qualidades).toHaveLength(3);
      });
    });
  });

  describe('Healing properties', () => {
    it('should have non-empty healing descriptions for all frequencies', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const healing = getHealingByFrequency(freq);
        expect(healing?.fisico.length).toBeGreaterThan(10);
        expect(healing?.emocional.length).toBeGreaterThan(10);
        expect(healing?.mental_espiritual.length).toBeGreaterThan(10);
        expect(healing?.pratica_recomendada.length).toBeGreaterThan(5);
      });
    });

    it('should have physical healing focus matching element', () => {
      // Terra frequencies should strengthen
      const terra = getHealingByFrequency(396);
      expect(terra?.fisico).toContain('Fortalece');

      // Água frequencies should hydrate/cleanse
      const agua = getHealingByFrequency(417);
      expect(agua?.fisico).toContain('Hidrata');

      // Fogo frequencies should stimulate
      const fogo = getHealingByFrequency(528);
      expect(fogo?.fisico).toContain('Estimula');
    });
  });

  describe('Chakra correlations', () => {
    it('should maintain chakra number consistency', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const mapping = getFrequencyChakra(freq);
        expect(mapping?.chakra_numero).toBeGreaterThanOrEqual(1);
        expect(mapping?.chakra_numero).toBeLessThanOrEqual(7);
      });
    });

    it('should have ascending chakra numbers with ascending frequencies', () => {
      let lastChakraNum = 0;
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const mapping = getFrequencyChakra(freq);
        expect(mapping?.chakra_numero).toBeGreaterThan(lastChakraNum);
        lastChakraNum = mapping?.chakra_numero ?? 0;
      });
    });
  });

  describe('Type exports', () => {
    it('should export FrequencyChakra interface', () => {
      const mapping: FrequencyChakra = {
        frequencia: 396,
        chakra: '1º Básico',
        chakra_numero: 1,
        poliedro_platao: 'Test',
        mantram_som_semente: 'LAM',
        nome_divino_cabala: 'Test',
        direcao_elemental: 'Norte',
        elemento_regente: 'Terra',
        elemento_conexao: {
          primario: 'Terra',
          qualidades: ['Frio', 'Seco', 'Estável'],
          fluxo_energetico: 'Test',
        },
        dinamica: 'Test',
        propriedades_healing: {
          fisico: 'Test',
          emocional: 'Test',
          mental_espiritual: 'Test',
          pratica_recomendada: 'Test',
        },
      };
      expect(mapping.frequencia).toBe(396);
    });
  });
});