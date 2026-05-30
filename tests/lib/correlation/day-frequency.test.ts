import { describe, it, expect } from 'vitest';
import {
  getDayFrequency,
  getFrequencyDay,
  getAllDayFrequencies,
  getFrequenciaFromDia,
  getElementFromDia,
  getHealingFromDia,
  getDaysByFrequencia,
  getBestEpochFromDia,
  getDaysByElement,
  getPlanetFromDia,
  getAllDays,
  getDayFrequencyByName,
  DAY_FREQUENCY_MAP,
  SOLFEGGIO_FREQUENCIES_DAY,
  TODOS_DIAS,
  type DayFrequencyMapping,
  type DiaSemana,
} from '@/lib/correlation/day-frequency';

describe('DayFrequency Correlation', () => {
  // ─── DAY_FREQUENCY_MAP: all 7 days ─────────────────────────────────────────

  describe('DAY_FREQUENCY_MAP', () => {
    it('contains all 7 days of the week', () => {
      expect(Object.keys(DAY_FREQUENCY_MAP)).toHaveLength(7);
    });

    it('maps Domingo to 528Hz (Fogo, Sol)', () => {
      const mapping = DAY_FREQUENCY_MAP['Domingo'];
      expect(mapping.frequencia).toBe(528);
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.planeta).toBe('Sol');
      expect(mapping.dia).toBe('Domingo');
    });

    it('maps Segunda-feira to 417Hz (Água, Lua)', () => {
      const mapping = DAY_FREQUENCY_MAP['Segunda-feira'];
      expect(mapping.frequencia).toBe(417);
      expect(mapping.elemento).toBe('Água');
      expect(mapping.planeta).toBe('Lua');
    });

    it('maps Terça-feira to 741Hz (Fogo, Marte)', () => {
      const mapping = DAY_FREQUENCY_MAP['Terça-feira'];
      expect(mapping.frequencia).toBe(741);
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.planeta).toBe('Marte');
    });

    it('maps Quarta-feira to 852Hz (Ar, Mercúrio)', () => {
      const mapping = DAY_FREQUENCY_MAP['Quarta-feira'];
      expect(mapping.frequencia).toBe(852);
      expect(mapping.elemento).toBe('Ar');
      expect(mapping.planeta).toBe('Mercúrio');
    });

    it('maps Quinta-feira to 528Hz (Fogo, Júpiter)', () => {
      const mapping = DAY_FREQUENCY_MAP['Quinta-feira'];
      expect(mapping.frequencia).toBe(528);
      expect(mapping.elemento).toBe('Fogo');
      expect(mapping.planeta).toBe('Júpiter');
    });

    it('maps Sexta-feira to 396Hz (Terra, Vênus)', () => {
      const mapping = DAY_FREQUENCY_MAP['Sexta-feira'];
      expect(mapping.frequencia).toBe(396);
      expect(mapping.elemento).toBe('Terra');
      expect(mapping.planeta).toBe('Vênus');
    });

    it('maps Sábado to 639Hz (Água, Saturno)', () => {
      const mapping = DAY_FREQUENCY_MAP['Sábado'];
      expect(mapping.frequencia).toBe(639);
      expect(mapping.elemento).toBe('Água');
      expect(mapping.planeta).toBe('Saturno');
    });

    it('includes healing properties for each day', () => {
      for (const mapping of Object.values(DAY_FREQUENCY_MAP)) {
        expect(mapping.propriedades_healing).toBeDefined();
        expect(mapping.propriedades_healing.fisico).toBeDefined();
        expect(mapping.propriedades_healing.emocional).toBeDefined();
        expect(mapping.propriedades_healing.mental_espiritual).toBeDefined();
        expect(mapping.propriedades_healing.melhor_epoca).toBeDefined();
      }
    });

    it('contains all required Solfeggio frequencies', () => {
      const frequencies = Object.values(DAY_FREQUENCY_MAP).map((m) => m.frequencia);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(639);
    });
  });

  // ─── getDayFrequency: lookup by day ───────────────────────────────────────

  describe('getDayFrequency', () => {
    it('returns correct mapping for Domingo', () => {
      const result = getDayFrequency('Domingo');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Domingo');
      expect(result!.frequencia).toBe(528);
      expect(result!.elemento).toBe('Fogo');
      expect(result!.planeta).toBe('Sol');
    });

    it('returns correct mapping for Segunda-feira', () => {
      const result = getDayFrequency('Segunda-feira');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Segunda-feira');
      expect(result!.frequencia).toBe(417);
      expect(result!.elemento).toBe('Água');
      expect(result!.planeta).toBe('Lua');
    });

    it('returns correct mapping for Terça-feira', () => {
      const result = getDayFrequency('Terça-feira');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Terça-feira');
      expect(result!.frequencia).toBe(741);
    });

    it('returns correct mapping for Quarta-feira', () => {
      const result = getDayFrequency('Quarta-feira');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Quarta-feira');
      expect(result!.frequencia).toBe(852);
    });

    it('returns correct mapping for Quinta-feira', () => {
      const result = getDayFrequency('Quinta-feira');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Quinta-feira');
      expect(result!.frequencia).toBe(528);
    });

    it('returns correct mapping for Sexta-feira', () => {
      const result = getDayFrequency('Sexta-feira');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Sexta-feira');
      expect(result!.frequencia).toBe(396);
    });

    it('returns correct mapping for Sábado', () => {
      const result = getDayFrequency('Sábado');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Sábado');
      expect(result!.frequencia).toBe(639);
    });

    it('accepts lowercase day name', () => {
      const result = getDayFrequency('domingo');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Domingo');
    });

    it('accepts day name without hyphen', () => {
      const result = getDayFrequency('segunda');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Segunda-feira');
    });

    it('accepts abbreviated day names', () => {
      expect(getDayFrequency('dom')?.dia).toBe('Domingo');
      expect(getDayFrequency('seg')?.dia).toBe('Segunda-feira');
      expect(getDayFrequency('ter')?.dia).toBe('Terça-feira');
      expect(getDayFrequency('qua')?.dia).toBe('Quarta-feira');
      expect(getDayFrequency('qui')?.dia).toBe('Quinta-feira');
      expect(getDayFrequency('sex')?.dia).toBe('Sexta-feira');
      expect(getDayFrequency('sab')?.dia).toBe('Sábado');
    });

    it('accepts English day names', () => {
      expect(getDayFrequency('sunday')?.dia).toBe('Domingo');
      expect(getDayFrequency('monday')?.dia).toBe('Segunda-feira');
      expect(getDayFrequency('tuesday')?.dia).toBe('Terça-feira');
      expect(getDayFrequency('wednesday')?.dia).toBe('Quarta-feira');
      expect(getDayFrequency('thursday')?.dia).toBe('Quinta-feira');
      expect(getDayFrequency('friday')?.dia).toBe('Sexta-feira');
      expect(getDayFrequency('saturday')?.dia).toBe('Sábado');
    });

    it('returns null for unknown day', () => {
      const result = getDayFrequency('Unknown');
      expect(result).toBeNull();
    });

    it('returns null for empty input', () => {
      const result = getDayFrequency('');
      expect(result).toBeNull();
    });

    it('returns null for null input', () => {
      const result = getDayFrequency(null as unknown as string);
      expect(result).toBeNull();
    });
  });

  // ─── getFrequencyDay: frequency lookup ─────────────────────────────────────

  describe('getFrequencyDay', () => {
    it('returns Domingo for 528Hz', () => {
      const result = getFrequencyDay(528);
      expect(result).toBe('Domingo');
    });

    it('returns Segunda-feira for 417Hz', () => {
      const result = getFrequencyDay(417);
      expect(result).toBe('Segunda-feira');
    });

    it('returns Terça-feira for 741Hz', () => {
      const result = getFrequencyDay(741);
      expect(result).toBe('Terça-feira');
    });

    it('returns Quarta-feira for 852Hz', () => {
      const result = getFrequencyDay(852);
      expect(result).toBe('Quarta-feira');
    });

    it('returns Sexta-feira for 396Hz', () => {
      const result = getFrequencyDay(396);
      expect(result).toBe('Sexta-feira');
    });

    it('returns Sábado for 639Hz', () => {
      const result = getFrequencyDay(639);
      expect(result).toBe('Sábado');
    });

    it('returns first matching day for shared frequency (528)', () => {
      // 528Hz is shared by Domingo and Quinta-feira
      const result = getFrequencyDay(528);
      expect(['Domingo', 'Quinta-feira']).toContain(result);
    });

    it('returns null for unknown frequency', () => {
      const result = getFrequencyDay(999);
      expect(result).toBeNull();
    });
  });

  // ─── getAllDayFrequencies: collection function ───────────────────────────────

  describe('getAllDayFrequencies', () => {
    it('returns all 7 mappings', () => {
      const result = getAllDayFrequencies();
      expect(result).toHaveLength(7);
    });

    it('includes all days', () => {
      const result = getAllDayFrequencies();
      const dias = result.map((m) => m.dia);
      expect(dias).toContain('Domingo');
      expect(dias).toContain('Segunda-feira');
      expect(dias).toContain('Terça-feira');
      expect(dias).toContain('Quarta-feira');
      expect(dias).toContain('Quinta-feira');
      expect(dias).toContain('Sexta-feira');
      expect(dias).toContain('Sábado');
    });

    it('returns fresh array each call', () => {
      const result1 = getAllDayFrequencies();
      const result2 = getAllDayFrequencies();
      expect(result1).not.toBe(result2);
    });
  });

  // ─── getFrequenciaFromDia: frequency by day ────────────────────────────────

  describe('getFrequenciaFromDia', () => {
    it('returns 528 for Domingo', () => {
      expect(getFrequenciaFromDia('Domingo')).toBe(528);
    });

    it('returns 417 for Segunda-feira', () => {
      expect(getFrequenciaFromDia('Segunda-feira')).toBe(417);
    });

    it('returns 741 for Terça-feira', () => {
      expect(getFrequenciaFromDia('Terça-feira')).toBe(741);
    });

    it('returns 852 for Quarta-feira', () => {
      expect(getFrequenciaFromDia('Quarta-feira')).toBe(852);
    });

    it('returns 528 for Quinta-feira', () => {
      expect(getFrequenciaFromDia('Quinta-feira')).toBe(528);
    });

    it('returns 396 for Sexta-feira', () => {
      expect(getFrequenciaFromDia('Sexta-feira')).toBe(396);
    });

    it('returns 639 for Sábado', () => {
      expect(getFrequenciaFromDia('Sábado')).toBe(639);
    });

    it('returns null for unknown day', () => {
      expect(getFrequenciaFromDia('Unknown')).toBeNull();
    });
  });

  // ─── getElementFromDia: element by day ─────────────────────────────────────

  describe('getElementFromDia', () => {
    it('returns Fogo for Domingo', () => {
      expect(getElementFromDia('Domingo')).toBe('Fogo');
    });

    it('returns Água for Segunda-feira', () => {
      expect(getElementFromDia('Segunda-feira')).toBe('Água');
    });

    it('returns Fogo for Terça-feira', () => {
      expect(getElementFromDia('Terça-feira')).toBe('Fogo');
    });

    it('returns Ar for Quarta-feira', () => {
      expect(getElementFromDia('Quarta-feira')).toBe('Ar');
    });

    it('returns Fogo for Quinta-feira', () => {
      expect(getElementFromDia('Quinta-feira')).toBe('Fogo');
    });

    it('returns Terra for Sexta-feira', () => {
      expect(getElementFromDia('Sexta-feira')).toBe('Terra');
    });

    it('returns Água for Sábado', () => {
      expect(getElementFromDia('Sábado')).toBe('Água');
    });

    it('returns null for unknown day', () => {
      expect(getElementFromDia('Unknown')).toBeNull();
    });
  });

  // ─── getHealingFromDia: healing properties by day ─────────────────────────

  describe('getHealingFromDia', () => {
    it('returns healing properties for Domingo', () => {
      const result = getHealingFromDia('Domingo');
      expect(result).not.toBeNull();
      expect(result!.fisico).toContain('vitalidade');
      expect(result!.emocional).toContain('alegria');
      expect(result!.mental_espiritual).toContain('propósito');
    });

    it('returns healing properties for Segunda-feira', () => {
      const result = getHealingFromDia('Segunda-feira');
      expect(result).not.toBeNull();
      expect(result!.fisico).toContain('sono');
      expect(result!.emocional).toContain('traumas');
    });

    it('returns null for unknown day', () => {
      expect(getHealingFromDia('Unknown')).toBeNull();
    });
  });

  // ─── getDaysByFrequencia: days by frequency ────────────────────────────────

  describe('getDaysByFrequencia', () => {
    it('returns Domingo and Quinta-feira for 528Hz', () => {
      const result = getDaysByFrequencia(528);
      expect(result).toHaveLength(2);
      const dias = result.map((m) => m.dia);
      expect(dias).toContain('Domingo');
      expect(dias).toContain('Quinta-feira');
    });

    it('returns only Segunda-feira for 417Hz', () => {
      const result = getDaysByFrequencia(417);
      expect(result).toHaveLength(1);
      expect(result[0].dia).toBe('Segunda-feira');
    });

    it('returns empty array for unknown frequency', () => {
      const result = getDaysByFrequencia(999);
      expect(result).toHaveLength(0);
    });
  });

  // ─── getBestEpochFromDia: best epoch by day ────────────────────────────────

  describe('getBestEpochFromDia', () => {
    it('returns best epoch for Domingo', () => {
      const result = getBestEpochFromDia('Domingo');
      expect(result).not.toBeNull();
      expect(result!.toLowerCase()).toContain('recarga');
    });

    it('returns best epoch for Segunda-feira', () => {
      const result = getBestEpochFromDia('Segunda-feira');
      expect(result).not.toBeNull();
      expect(result!.toLowerCase()).toContain('introspec');
    });

    it('returns null for unknown day', () => {
      expect(getBestEpochFromDia('Unknown')).toBeNull();
    });
  });

  // ─── getDaysByElement: days by element ─────────────────────────────────────

  describe('getDaysByElement', () => {
    it('returns 3 days for Fogo element', () => {
      const result = getDaysByElement('Fogo');
      expect(result).toHaveLength(3);
      const dias = result.map((m) => m.dia);
      expect(dias).toContain('Domingo');
      expect(dias).toContain('Terça-feira');
      expect(dias).toContain('Quinta-feira');
    });

    it('returns 2 days for Água element', () => {
      const result = getDaysByElement('Água');
      expect(result).toHaveLength(2);
      const dias = result.map((m) => m.dia);
      expect(dias).toContain('Segunda-feira');
      expect(dias).toContain('Sábado');
    });

    it('returns 1 day for Ar element', () => {
      const result = getDaysByElement('Ar');
      expect(result).toHaveLength(1);
      expect(result[0].dia).toBe('Quarta-feira');
    });

    it('returns 1 day for Terra element', () => {
      const result = getDaysByElement('Terra');
      expect(result).toHaveLength(1);
      expect(result[0].dia).toBe('Sexta-feira');
    });

    it('returns empty array for unknown element', () => {
      const result = getDaysByElement('Unknown');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getPlanetFromDia: planet by day ───────────────────────────────────────

  describe('getPlanetFromDia', () => {
    it('returns Sol for Domingo', () => {
      expect(getPlanetFromDia('Domingo')).toBe('Sol');
    });

    it('returns Lua for Segunda-feira', () => {
      expect(getPlanetFromDia('Segunda-feira')).toBe('Lua');
    });

    it('returns Marte for Terça-feira', () => {
      expect(getPlanetFromDia('Terça-feira')).toBe('Marte');
    });

    it('returns Mercúrio for Quarta-feira', () => {
      expect(getPlanetFromDia('Quarta-feira')).toBe('Mercúrio');
    });

    it('returns Júpiter for Quinta-feira', () => {
      expect(getPlanetFromDia('Quinta-feira')).toBe('Júpiter');
    });

    it('returns Vênus for Sexta-feira', () => {
      expect(getPlanetFromDia('Sexta-feira')).toBe('Vênus');
    });

    it('returns Saturno for Sábado', () => {
      expect(getPlanetFromDia('Sábado')).toBe('Saturno');
    });

    it('returns null for unknown day', () => {
      expect(getPlanetFromDia('Unknown')).toBeNull();
    });
  });

  // ─── getAllDays: all days collection ──────────────────────────────────────

  describe('getAllDays', () => {
    it('returns all 7 days', () => {
      const result = getAllDays();
      expect(result).toHaveLength(7);
    });

    it('contains all Portuguese day names', () => {
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

  // ─── getDayFrequencyByName: alias function ─────────────────────────────────

  describe('getDayFrequencyByName', () => {
    it('returns correct mapping for day name', () => {
      const result = getDayFrequencyByName('Domingo');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Domingo');
    });

    it('accepts lowercase input', () => {
      const result = getDayFrequencyByName('domingo');
      expect(result).not.toBeNull();
      expect(result!.dia).toBe('Domingo');
    });
  });

  // ─── Constants ─────────────────────────────────────────────────────────────

  describe('Constants', () => {
    it('TODOS_DIAS contains all 7 days', () => {
      expect(TODOS_DIAS).toHaveLength(7);
    });

    it('SOLFEGGIO_FREQUENCIES_DAY contains expected frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES_DAY).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES_DAY).toContain(417);
      expect(SOLFEGGIO_FREQUENCIES_DAY).toContain(741);
      expect(SOLFEGGIO_FREQUENCIES_DAY).toContain(852);
      expect(SOLFEGGIO_FREQUENCIES_DAY).toContain(396);
      expect(SOLFEGGIO_FREQUENCIES_DAY).toContain(639);
    });
  });

  // ─── Type exports ─────────────────────────────────────────────────────────

  describe('Type exports', () => {
    it('exports DayFrequencyMapping type', () => {
      const mapping: DayFrequencyMapping = {
        dia: 'Domingo',
        frequencia: 528,
        elemento: 'Fogo',
        planeta: 'Sol',
        propriedades_healing: {
          fisico: 'test',
          emocional: 'test',
          mental_espiritual: 'test',
          melhor_epoca: 'test',
        },
      };
      expect(mapping.dia).toBe('Domingo');
    });

    it('exports DiaSemana type', () => {
      const dia: DiaSemana = 'Domingo';
      expect(dia).toBe('Domingo');
    });
  });

  // ─── Default export ───────────────────────────────────────────────────────

  describe('Default export', () => {
    it('exports getDayFrequency function', async () => {
      const defaultExport = await import('@/lib/correlation/day-frequency').then((m) => m.default);
      expect(typeof defaultExport.getDayFrequency).toBe('function');
    });

    it('default export returns correct mapping', async () => {
      const dayFreq = (await import('@/lib/correlation/day-frequency')).default;
      const result = dayFreq.getDayFrequency('Domingo');
      expect(result).not.toBeNull();
      expect(result!.frequencia).toBe(528);
    });
  });
});