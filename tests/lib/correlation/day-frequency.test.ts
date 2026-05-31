import { describe, it, expect } from 'vitest';
import {
  getDayFrequency,
  getFrequencyDay,
  getAllDayFrequencies,
  getAllDays,
  getDaysByFrequency,
  getFrequencyName,
  getElementByDay,
  getChakraByDay,
  getChakraNumberByDay,
  getDaySpiritualMeaning,
  getHealingProperties,
  getColorByDay,
  getOrixaByDay,
  getPlanetByDay,
  getDayPractices,
  getAllFrequencies,
  getDayByFrequency,
  DAY_FREQUENCY_MAP,
} from '@/lib/correlation/day-frequency';

describe('DayFrequency Correlation', () => {
  describe('getDayFrequency', () => {
    it('should return frequency data for Domingo', () => {
      const result = getDayFrequency('Domingo');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Domingo');
      expect(result?.frequencia).toBe(528);
    });

    it('should return frequency data for Segunda-feira', () => {
      const result = getDayFrequency('Segunda-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.frequencia).toBe(396);
    });

    it('should return frequency data for Terça-feira', () => {
      const result = getDayFrequency('Terça-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Terça-feira');
      expect(result?.frequencia).toBe(417);
    });

    it('should return frequency data for Quarta-feira', () => {
      const result = getDayFrequency('Quarta-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.frequencia).toBe(528);
    });

    it('should return frequency data for Quinta-feira', () => {
      const result = getDayFrequency('Quinta-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quinta-feira');
      expect(result?.frequencia).toBe(639);
    });

    it('should return frequency data for Sexta-feira', () => {
      const result = getDayFrequency('Sexta-feira');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.frequencia).toBe(741);
    });

    it('should return frequency data for Sábado', () => {
      const result = getDayFrequency('Sábado');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sábado');
      expect(result?.frequencia).toBe(852);
    });

    it('should return undefined for invalid day', () => {
      const result = getDayFrequency('DiaInválido');
      expect(result).toBeUndefined();
    });
  });

  describe('getFrequencyDay', () => {
    it('should return frequency for Domingo', () => {
      const result = getFrequencyDay('Domingo');
      expect(result).toBe(528);
    });

    it('should return frequency for Segunda-feira', () => {
      const result = getFrequencyDay('Segunda-feira');
      expect(result).toBe(396);
    });

    it('should return frequency for Terça-feira', () => {
      const result = getFrequencyDay('Terça-feira');
      expect(result).toBe(417);
    });

    it('should return frequency for Quarta-feira', () => {
      const result = getFrequencyDay('Quarta-feira');
      expect(result).toBe(528);
    });

    it('should return frequency for Quinta-feira', () => {
      const result = getFrequencyDay('Quinta-feira');
      expect(result).toBe(639);
    });

    it('should return frequency for Sexta-feira', () => {
      const result = getFrequencyDay('Sexta-feira');
      expect(result).toBe(741);
    });

    it('should return frequency for Sábado', () => {
      const result = getFrequencyDay('Sábado');
      expect(result).toBe(852);
    });

    it('should return undefined for invalid day', () => {
      const result = getFrequencyDay('DiaInválido');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllDayFrequencies', () => {
    it('should return all day-frequency mappings', () => {
      const result = getAllDayFrequencies();
      expect(result).toHaveLength(7);
    });

    it('should return objects with required properties', () => {
      const result = getAllDayFrequencies();
      const first = result[0];
      expect(first).toHaveProperty('dia');
      expect(first).toHaveProperty('frequencia');
      expect(first).toHaveProperty('elemento');
      expect(first).toHaveProperty('significado_espiritual');
    });

    it('should contain all days of the week', () => {
      const result = getAllDayFrequencies();
      const days = result.map((d) => d.dia);
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });
  });

  describe('getAllDays', () => {
    it('should return array of day names', () => {
      const result = getAllDays();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all days of the week', () => {
      const result = getAllDays();
      expect(result).toContain('Domingo');
      expect(result).toContain('Segunda-feira');
      expect(result).toContain('Terça-feira');
      expect(result).toContain('Quarta-feira');
      expect(result).toContain('Quinta-feira');
      expect(result).toContain('Sexta-feira');
      expect(result).toContain('Sábado');
    });
  });

  describe('getDaysByFrequency', () => {
    it('should return days for 528 Hz frequency', () => {
      const result = getDaysByFrequency(528);
      expect(result).toContain('Domingo');
      expect(result).toContain('Quarta-feira');
    });

    it('should return days for 396 Hz frequency', () => {
      const result = getDaysByFrequency(396);
      expect(result).toContain('Segunda-feira');
    });

    it('should return days for 417 Hz frequency', () => {
      const result = getDaysByFrequency(417);
      expect(result).toContain('Terça-feira');
    });

    it('should return days for 639 Hz frequency', () => {
      const result = getDaysByFrequency(639);
      expect(result).toContain('Quinta-feira');
    });

    it('should return days for 741 Hz frequency', () => {
      const result = getDaysByFrequency(741);
      expect(result).toContain('Sexta-feira');
    });

    it('should return days for 852 Hz frequency', () => {
      const result = getDaysByFrequency(852);
      expect(result).toContain('Sábado');
    });

    it('should return empty array for unknown frequency', () => {
      const result = getDaysByFrequency(100);
      expect(result).toEqual([]);
    });
  });

  describe('DAY_FREQUENCY_MAP', () => {
    it('should have all seven days', () => {
      expect(Object.keys(DAY_FREQUENCY_MAP)).toHaveLength(7);
    });

    it('should contain valid frequency values', () => {
      Object.values(DAY_FREQUENCY_MAP).forEach((day) => {
        expect(typeof day.frequencia).toBe('number');
        expect(day.frequencia).toBeGreaterThan(0);
      });
    });

    it('should contain valid day indices', () => {
      Object.values(DAY_FREQUENCY_MAP).forEach((day) => {
        expect(typeof day.indice).toBe('number');
        expect(day.indice).toBeGreaterThanOrEqual(0);
        expect(day.indice).toBeLessThanOrEqual(6);
      });
    });

    it('should contain valid elements', () => {
      Object.values(DAY_FREQUENCY_MAP).forEach((day) => {
        expect(['fogo', 'água', 'ar', 'terra']).toContain(day.elemento);
      });
    });

    it('should contain valid spiritual meanings', () => {
      Object.values(DAY_FREQUENCY_MAP).forEach((day) => {
        expect(typeof day.significado_espiritual).toBe('string');
        expect(day.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('should contain valid healing properties', () => {
      Object.values(DAY_FREQUENCY_MAP).forEach((day) => {
        expect(day.propriedades).toBeDefined();
        expect(day.propriedades.forta).toBeDefined();
        expect(Array.isArray(day.propriedades.palavras_chave)).toBe(true);
        expect(Array.isArray(day.propriedades.aplicacoes_cura)).toBe(true);
      });
    });
  });

  describe('getFrequencyName', () => {
    it('should return frequency name for valid days', () => {
      expect(getFrequencyName('Domingo')).toBe('Frequência do Amor');
      expect(getFrequencyName('Segunda-feira')).toBe('Frequência da Libertação');
      expect(getFrequencyName('Terça-feira')).toBe('Frequência da Mudança');
      expect(getFrequencyName('Quarta-feira')).toBe('Frequência da Integridade');
      expect(getFrequencyName('Quinta-feira')).toBe('Frequência da Harmonia');
      expect(getFrequencyName('Sexta-feira')).toBe('Frequência da Purificação');
      expect(getFrequencyName('Sábado')).toBe('Frequência da Espiritualidade');
    });

    it('should return undefined for invalid day', () => {
      expect(getFrequencyName('DiaInválido')).toBeUndefined();
    });
  });

  describe('getElementByDay', () => {
    it('should return element for valid days', () => {
      expect(getElementByDay('Domingo')).toBe('fogo');
      expect(getElementByDay('Segunda-feira')).toBe('água');
      expect(getElementByDay('Terça-feira')).toBe('fogo');
      expect(getElementByDay('Quarta-feira')).toBe('ar');
      expect(getElementByDay('Quinta-feira')).toBe('água');
      expect(getElementByDay('Sexta-feira')).toBe('terra');
      expect(getElementByDay('Sábado')).toBe('terra');
    });

    it('should return undefined for invalid day', () => {
      expect(getElementByDay('DiaInválido')).toBeUndefined();
    });
  });

  describe('getChakraByDay', () => {
    it('should return chakra for valid days', () => {
      expect(getChakraByDay('Domingo')).toBeDefined();
      expect(getChakraByDay('Segunda-feira')).toBeDefined();
      expect(getChakraByDay('Terça-feira')).toBeDefined();
    });

    it('should return undefined for invalid day', () => {
      expect(getChakraByDay('DiaInválido')).toBeUndefined();
    });
  });

  describe('getChakraNumberByDay', () => {
    it('should return chakra number for valid days', () => {
      expect(getChakraNumberByDay('Domingo')).toBe(3);
      expect(getChakraNumberByDay('Segunda-feira')).toBe(6);
      expect(getChakraNumberByDay('Terça-feira')).toBe(2);
      expect(getChakraNumberByDay('Quarta-feira')).toBe(4);
      expect(getChakraNumberByDay('Quinta-feira')).toBe(5);
      expect(getChakraNumberByDay('Sexta-feira')).toBe(5);
      expect(getChakraNumberByDay('Sábado')).toBe(7);
    });

    it('should return undefined for invalid day', () => {
      expect(getChakraNumberByDay('DiaInválido')).toBeUndefined();
    });
  });

  describe('getDaySpiritualMeaning', () => {
    it('should return spiritual meaning for valid days', () => {
      const result = getDaySpiritualMeaning('Domingo');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid day', () => {
      expect(getDaySpiritualMeaning('DiaInválido')).toBeUndefined();
    });
  });

  describe('getHealingProperties', () => {
    it('should return healing properties for valid days', () => {
      const result = getHealingProperties('Domingo');
      expect(result).toBeDefined();
      expect(result!.forta).toBeDefined();
      expect(Array.isArray(result!.palavras_chave)).toBe(true);
      expect(Array.isArray(result!.aplicacoes_cura)).toBe(true);
    });

    it('should return undefined for invalid day', () => {
      expect(getHealingProperties('DiaInválido')).toBeUndefined();
    });
  });

  describe('getColorByDay', () => {
    it('should return color for valid days', () => {
      expect(getColorByDay('Domingo')).toBe('Dourado / Amarelo');
      expect(getColorByDay('Segunda-feira')).toBe('Prata / Branco');
      expect(getColorByDay('Terça-feira')).toBe('Vermelho / Laranja');
    });

    it('should return undefined for invalid day', () => {
      expect(getColorByDay('DiaInválido')).toBeUndefined();
    });
  });

  describe('getOrixaByDay', () => {
    it('should return orixá for valid days', () => {
      expect(getOrixaByDay('Domingo')).toBe('Oxum');
      expect(getOrixaByDay('Segunda-feira')).toBe('Iemanjá');
      expect(getOrixaByDay('Terça-feira')).toBe('Ogum');
      expect(getOrixaByDay('Quarta-feira')).toBe('Oxumaré');
      expect(getOrixaByDay('Quinta-feira')).toBe('Oxalá');
      expect(getOrixaByDay('Sexta-feira')).toBe('Iansã');
      expect(getOrixaByDay('Sábado')).toBe('Nanã');
    });

    it('should return undefined for invalid day', () => {
      expect(getOrixaByDay('DiaInválido')).toBeUndefined();
    });
  });

  describe('getPlanetByDay', () => {
    it('should return planet for valid days', () => {
      expect(getPlanetByDay('Domingo')).toBe('Sol');
      expect(getPlanetByDay('Segunda-feira')).toBe('Lua');
      expect(getPlanetByDay('Terça-feira')).toBe('Marte');
      expect(getPlanetByDay('Quarta-feira')).toBe('Mercúrio');
      expect(getPlanetByDay('Quinta-feira')).toBe('Júpiter');
      expect(getPlanetByDay('Sexta-feira')).toBe('Vênus');
      expect(getPlanetByDay('Sábado')).toBe('Saturno');
    });

    it('should return undefined for invalid day', () => {
      expect(getPlanetByDay('DiaInválido')).toBeUndefined();
    });
  });

  describe('getDayPractices', () => {
    it('should return healing practices for valid days', () => {
      const result = getDayPractices('Domingo');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid day', () => {
      expect(getDayPractices('DiaInválido')).toBeUndefined();
    });
  });

  describe('getAllFrequencies', () => {
    it('should return array of unique frequencies', () => {
      const result = getAllFrequencies();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return sorted frequencies', () => {
      const result = getAllFrequencies();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      }
    });

    it('should contain all unique frequencies from the map', () => {
      const result = getAllFrequencies();
      const expected = new Set(Object.values(DAY_FREQUENCY_MAP).map((d) => d.frequencia));
      expect(result.length).toBe(expected.size);
    });
  });

  describe('getDayByFrequency', () => {
    it('should return day for 528 Hz frequency', () => {
      const result = getDayByFrequency(528);
      expect(result).toBeDefined();
    });

    it('should return day for 396 Hz frequency', () => {
      const result = getDayByFrequency(396);
      expect(result).toBe('Segunda-feira');
    });

    it('should return day for 417 Hz frequency', () => {
      const result = getDayByFrequency(417);
      expect(result).toBe('Terça-feira');
    });

    it('should return day for 639 Hz frequency', () => {
      const result = getDayByFrequency(639);
      expect(result).toBe('Quinta-feira');
    });

    it('should return day for 741 Hz frequency', () => {
      const result = getDayByFrequency(741);
      expect(result).toBe('Sexta-feira');
    });

    it('should return day for 852 Hz frequency', () => {
      const result = getDayByFrequency(852);
      expect(result).toBe('Sábado');
    });

    it('should return undefined for unknown frequency', () => {
      const result = getDayByFrequency(100);
      expect(result).toBeUndefined();
    });
  });

  describe('spiritual consistency', () => {
    it('should have consistent element-day relationships', () => {
      const fireDays = ['Domingo', 'Terça-feira'];
      const waterDays = ['Segunda-feira', 'Quinta-feira'];
      const earthDays = ['Sexta-feira', 'Sábado'];
      const airDays = ['Quarta-feira'];

      fireDays.forEach((day) => {
        expect(getElementByDay(day)).toBe('fogo');
      });
      waterDays.forEach((day) => {
        expect(getElementByDay(day)).toBe('água');
      });
      earthDays.forEach((day) => {
        expect(getElementByDay(day)).toBe('terra');
      });
      airDays.forEach((day) => {
        expect(getElementByDay(day)).toBe('ar');
      });
    });

    it('should have valid Solfeggio frequencies', () => {
      const validFrequencies = [396, 417, 528, 639, 741, 852];
      Object.values(DAY_FREQUENCY_MAP).forEach((day) => {
        expect(validFrequencies).toContain(day.frequencia);
      });
    });

    it('should have consistent planet-day relationships with day-planet module', () => {
      const planetDayMap: Record<string, string> = {
        'Domingo': 'Sol',
        'Segunda-feira': 'Lua',
        'Terça-feira': 'Marte',
        'Quarta-feira': 'Mercúrio',
        'Quinta-feira': 'Júpiter',
        'Sexta-feira': 'Vênus',
        'Sábado': 'Saturno',
      };

      Object.entries(planetDayMap).forEach(([day, expectedPlanet]) => {
        expect(getPlanetByDay(day)).toBe(expectedPlanet);
      });
    });
  });
});