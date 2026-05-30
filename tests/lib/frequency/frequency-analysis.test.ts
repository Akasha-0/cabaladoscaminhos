import { describe, it, expect } from 'vitest';
import { analyze, type AnaliseFrequencia, type ResultadoAnalise } from '@/lib/frequency/frequency-analysis';
import type { FrequenciaSolfeggio } from '@/lib/frequencias/dados';

// Helper to create test frequencies
function createFrequencia(partial: Partial<FrequenciaSolfeggio> & { id: string; hz: number }): FrequenciaSolfeggio {
  return {
    nota: 'A4',
    nome: 'Test',
    cor: '#ffffff',
    chakra: null,
    elemento: null,
    sefirot: null,
    beneficios: [],
    aplicacoes: [],
    mantra: 'Om',
    descricao: 'Test frequency',
    ...partial,
  };
}

describe('frequency-analysis', () => {
  describe('analyze', () => {
    it('returns empty result for empty array', () => {
      const result = analyze([]);

      expect(result.data).toEqual([]);
      expect(result.totalFrequencias).toBe(0);
      expect(result.faixaHz).toEqual({ min: 0, max: 0 });
      expect(result.porCategoria).toEqual({});
    });

    it('returns empty result for null/undefined input', () => {
      const resultNull = analyze(null as unknown as FrequenciaSolfeggio[]);
      const resultUndefined = analyze(undefined as unknown as FrequenciaSolfeggio[]);

      expect(resultNull.data).toEqual([]);
      expect(resultUndefined.data).toEqual([]);
    });

    it('classifies fundamental solfeggio frequencies correctly', () => {
      const fundamentalFreqs = [
        createFrequencia({ id: '174', hz: 174 }),
        createFrequencia({ id: '285', hz: 285 }),
        createFrequencia({ id: '396', hz: 396 }),
        createFrequencia({ id: '417', hz: 417 }),
        createFrequencia({ id: '528', hz: 528 }),
        createFrequencia({ id: '639', hz: 639 }),
        createFrequencia({ id: '741', hz: 741 }),
        createFrequencia({ id: '852', hz: 852 }),
        createFrequencia({ id: '963', hz: 963 }),
      ];

      const result = analyze(fundamentalFreqs);

      expect(result.totalFrequencias).toBe(9);
      expect(result.data.every(item => item.categoria === 'fundamental')).toBe(true);
      expect(result.porCategoria.fundamental).toBe(9);
    });

    it('classifies ampliado frequencies (396-963 hz but not in fundamental list)', () => {
      const ampliadaFreqs = [
        createFrequencia({ id: 'custom1', hz: 400 }),
        createFrequencia({ id: 'custom2', hz: 500 }),
        createFrequencia({ id: 'custom3', hz: 700 }),
        createFrequencia({ id: 'custom4', hz: 850 }),
      ];

      const result = analyze(ampliadaFreqs);

      expect(result.totalFrequencias).toBe(4);
      expect(result.data.every(item => item.categoria === 'ampliada')).toBe(true);
      expect(result.porCategoria.ampliada).toBe(4);
    });

    it('classifies extendida frequencies (outside 396-963 range)', () => {
      const extendidaFreqs = [
        createFrequencia({ id: 'low1', hz: 100 }),
        createFrequencia({ id: 'low2', hz: 200 }),
        createFrequencia({ id: 'high1', hz: 1000 }),
        createFrequencia({ id: 'high2', hz: 2000 }),
      ];

      const result = analyze(extendidaFreqs);

      expect(result.totalFrequencias).toBe(4);
      expect(result.data.every(item => item.categoria === 'extendida')).toBe(true);
      expect(result.porCategoria.extendida).toBe(4);
    });

    it('mixes categories correctly in a single call', () => {
      const mixedFreqs = [
        createFrequencia({ id: '174', hz: 174 }),       // fundamental
        createFrequencia({ id: 'custom', hz: 500 }),      // ampliada
        createFrequencia({ id: 'low', hz: 100 }),         // extendida
        createFrequencia({ id: '528', hz: 528 }),         // fundamental
      ];

      const result = analyze(mixedFreqs);

      expect(result.totalFrequencias).toBe(4);
      expect(result.porCategoria).toEqual({
        fundamental: 2,
        ampliada: 1,
        extendida: 1,
      });
    });

    it('calculates correct position for each frequency', () => {
      const freqs = [
        createFrequencia({ id: '1', hz: 100 }),
        createFrequencia({ id: '2', hz: 200 }),
        createFrequencia({ id: '3', hz: 300 }),
      ];

      const result = analyze(freqs);

      expect(result.data[0].posicao).toBe(1);
      expect(result.data[1].posicao).toBe(2);
      expect(result.data[2].posicao).toBe(3);
    });

    it('sets total to array length for each item', () => {
      const freqs = [
        createFrequencia({ id: '1', hz: 100 }),
        createFrequencia({ id: '2', hz: 200 }),
      ];

      const result = analyze(freqs);

      expect(result.data[0].total).toBe(2);
      expect(result.data[1].total).toBe(2);
    });

    it('rounds hz values correctly', () => {
      const freqs = [
        createFrequencia({ id: '1', hz: 174.4 }),
        createFrequencia({ id: '2', hz: 174.6 }),
        createFrequencia({ id: '3', hz: 174.5 }),
      ];

      const result = analyze(freqs);

      expect(result.data[0].hzArredondado).toBe(174);
      expect(result.data[1].hzArredondado).toBe(175);
      expect(result.data[2].hzArredondado).toBe(175);
    });

    it('calculates hz range correctly', () => {
      const freqs = [
        createFrequencia({ id: '1', hz: 500 }),
        createFrequencia({ id: '2', hz: 200 }),
        createFrequencia({ id: '3', hz: 800 }),
      ];

      const result = analyze(freqs);

      expect(result.faixaHz.min).toBe(200);
      expect(result.faixaHz.max).toBe(800);
    });

    it('returns original frequency data in result', () => {
      const freq = createFrequencia({
        id: 'test',
        hz: 528,
        nota: 'C5',
        nome: 'DNA Repair',
      });

      const result = analyze([freq]);

      expect(result.data[0].frequencia.id).toBe('test');
      expect(result.data[0].frequencia.hz).toBe(528);
      expect(result.data[0].frequencia.nota).toBe('C5');
      expect(result.data[0].frequencia.nome).toBe('DNA Repair');
    });

    it('handles single frequency', () => {
      const freqs = [createFrequencia({ id: '528', hz: 528 })];

      const result = analyze(freqs);

      expect(result.data.length).toBe(1);
      expect(result.totalFrequencias).toBe(1);
      expect(result.faixaHz.min).toBe(528);
      expect(result.faixaHz.max).toBe(528);
    });

    it('handles boundary values for categories', () => {
      const boundaryFreqs = [
        createFrequencia({ id: 'below', hz: 395.9 }),     // extendida (just below 396)
        createFrequencia({ id: '396', hz: 396 }),          // fundamental (id '396' is in list)
        createFrequencia({ id: '963', hz: 963 }),          // fundamental (id '963' is in list)
        createFrequencia({ id: 'above', hz: 963.1 }),      // extendida (just above 963)
      ];
      const result = analyze(boundaryFreqs);
      // 395.9 is below 396, so extendida
      expect(result.data[0].categoria).toBe('extendida');
      // 396 and 963 are in fundamental list, so fundamental
      expect(result.data[1].categoria).toBe('fundamental');
      expect(result.data[2].categoria).toBe('fundamental');
      // 963.1 is above 963, so extendida
      expect(result.data[3].categoria).toBe('extendida');
    });
  });

  describe('AnaliseFrequencia interface', () => {
    it('contains all required fields', () => {
      const freqs = [createFrequencia({ id: '528', hz: 528 })];

      const result = analyze(freqs);
      const item = result.data[0];

      // Verify all interface fields exist
      expect(item).toHaveProperty('frequencia');
      expect(item).toHaveProperty('posicao');
      expect(item).toHaveProperty('total');
      expect(item).toHaveProperty('categoria');
      expect(item).toHaveProperty('hzArredondado');
      expect(item).toHaveProperty('oitava');
    });
  });

  describe('ResultadoAnalise interface', () => {
    it('contains all required fields', () => {
      const result = analyze([]);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('totalFrequencias');
      expect(result).toHaveProperty('faixaHz');
      expect(result).toHaveProperty('porCategoria');
    });

    it('faixaHz has min and max properties', () => {
      const result = analyze([]);

      expect(result.faixaHz).toHaveProperty('min');
      expect(result.faixaHz).toHaveProperty('max');
    });
  });
});
