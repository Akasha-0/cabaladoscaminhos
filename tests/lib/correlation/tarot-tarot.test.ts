/**
 * Tests for Tarot-Tarot Spiritual Correlation Module
 * Validates the mapping between pairs of Tarot Major Arcana cards
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getCorrelacoesDaCarta,
  getCorrelacoesPorTipo,
  getAllTarotTarots,
  getNumeroCarta,
  getNomeCarta,
  hasCorrelacao,
  getDescricaoCorrelacao,
  getTipoCorrelacao,
  TAROT_TAROT_MAP,
  TODOS_ARCANOS_NUMEROS,
  TODOS_ARCANOS_NOMES,
} from '@/lib/correlation/tarot-tarot';

describe('TarotTarot Correlation Module', () => {
  describe('getTarotTarot', () => {
    it('should return mapping for O Louco-O Mago (sequencial)', () => {
      const mapping = getTarotTarot('O Louco', 'O Mago');
      expect(mapping).toBeDefined();
      expect(mapping?.carta_origem).toBe('O Louco');
      expect(mapping?.numero_origem).toBe(0);
      expect(mapping?.carta_destino).toBe('O Mago');
      expect(mapping?.numero_destino).toBe(1);
      expect(mapping?.tipo_correlacao).toBe('sequencial');
      expect(mapping?.descricao_correlacao).toBeTruthy();
    });

    it('should return mapping for A Imperatriz-O Imperador', () => {
      const mapping = getTarotTarot('A Imperatriz', 'O Imperador');
      expect(mapping).toBeDefined();
      expect(mapping?.carta_origem).toBe('A Imperatriz');
      expect(mapping?.carta_destino).toBe('O Imperador');
      expect(mapping?.tipo_correlacao).toBe('sequencial');
    });

    it('should return mapping for A Lua-O Sol (contrastante)', () => {
      const mapping = getTarotTarot('A Lua', 'O Sol');
      expect(mapping).toBeDefined();
      expect(mapping?.carta_origem).toBe('A Lua');
      expect(mapping?.carta_destino).toBe('O Sol');
      expect(mapping?.tipo_correlacao).toBe('contrastante');
    });

    it('should return mapping for O Hierofante-O Eremita (complementar)', () => {
      const mapping = getTarotTarot('O Hierofante', 'O Eremita');
      expect(mapping).toBeDefined();
      expect(mapping?.carta_origem).toBe('O Hierofante');
      expect(mapping?.carta_destino).toBe('O Eremita');
      expect(mapping?.tipo_correlacao).toBe('complementar');
    });

    it('should return mapping for A Torre-O Mundo (kármico)', () => {
      const mapping = getTarotTarot('A Torre', 'O Mundo');
      expect(mapping).toBeDefined();
      expect(mapping?.tipo_correlacao).toBe('kármico');
    });

    it('should return mapping for O Mago-O Louco (harmônico)', () => {
      const mapping = getTarotTarot('O Mago', 'O Louco');
      expect(mapping).toBeDefined();
      expect(mapping?.tipo_correlacao).toBe('harmônico');
    });

    it('should handle lowercase input', () => {
      const mapping = getTarotTarot('o louco', 'o mago');
      expect(mapping).toBeDefined();
      expect(mapping?.carta_origem).toBe('O Louco');
    });

    it('should handle lowercase alternative', () => {
      const mapping = getTarotTarot('LOUCO', 'MAGO');
      expect(mapping).toBeDefined();
      expect(mapping?.carta_origem).toBe('O Louco');
    });

    it('should return null for unknown card pair', () => {
      const mapping = getTarotTarot('UnknownCard1', 'UnknownCard2');
      expect(mapping).toBeNull();
    });

    it('should return null for empty input', () => {
      const mapping = getTarotTarot('', '');
      expect(mapping).toBeNull();
    });

    it('should return null for single card only', () => {
      const mapping = getTarotTarot('O Louco', '');
      expect(mapping).toBeNull();
    });
  });

  describe('getCorrelacoesDaCarta', () => {
    it('should return all correlations for O Louco', () => {
      const correlacoes = getCorrelacoesDaCarta('O Louco');
      expect(correlacoes).toBeDefined();
      expect(correlacoes.length).toBeGreaterThan(0);
      expect(correlacoes.some((c) => c.carta_origem === 'O Louco' || c.carta_destino === 'O Louco')).toBe(true);
    });

    it('should return all correlations for A Morte', () => {
      const correlacoes = getCorrelacoesDaCarta('A Morte');
      expect(correlacoes).toBeDefined();
      expect(correlacoes.length).toBeGreaterThan(0);
    });

    it('should return all correlations for O Diabo', () => {
      const correlacoes = getCorrelacoesDaCarta('O Diabo');
      expect(correlacoes).toBeDefined();
      expect(correlacoes.length).toBeGreaterThan(0);
    });

    it('should handle lowercase input', () => {
      const correlacoes = getCorrelacoesDaCarta('o sol');
      expect(correlacoes).toBeDefined();
    });

    it('should return empty array for unknown card', () => {
      const correlacoes = getCorrelacoesDaCarta('UnknownCard');
      expect(correlacoes).toBeDefined();
      expect(Array.isArray(correlacoes)).toBe(true);
    });
  });

  describe('getCorrelacoesPorTipo', () => {
    it('should return all sequencial correlations', () => {
      const correlacoes = getCorrelacoesPorTipo('sequencial');
      expect(correlacoes).toBeDefined();
      expect(correlacoes.length).toBeGreaterThan(0);
      correlacoes.forEach((c) => {
        expect(c.tipo_correlacao).toBe('sequencial');
      });
    });

    it('should return all contrastante correlations', () => {
      const correlacoes = getCorrelacoesPorTipo('contrastante');
      expect(correlacoes).toBeDefined();
      expect(correlacoes.length).toBeGreaterThan(0);
      correlacoes.forEach((c) => {
        expect(c.tipo_correlacao).toBe('contrastante');
      });
    });

    it('should return all complementar correlations', () => {
      const correlacoes = getCorrelacoesPorTipo('complementar');
      expect(correlacoes).toBeDefined();
      expect(correlacoes.length).toBeGreaterThan(0);
      correlacoes.forEach((c) => {
        expect(c.tipo_correlacao).toBe('complementar');
      });
    });

    it('should return all kármico correlations', () => {
      const correlacoes = getCorrelacoesPorTipo('kármico');
      expect(correlacoes).toBeDefined();
      expect(correlacoes.length).toBeGreaterThan(0);
      correlacoes.forEach((c) => {
        expect(c.tipo_correlacao).toBe('kármico');
      });
    });

    it('should return all harmônico correlations', () => {
      const correlacoes = getCorrelacoesPorTipo('harmônico');
      expect(correlacoes).toBeDefined();
      expect(correlacoes.length).toBeGreaterThan(0);
      correlacoes.forEach((c) => {
        expect(c.tipo_correlacao).toBe('harmônico');
      });
    });

    it('should return empty array for unknown type', () => {
      const correlacoes = getCorrelacoesPorTipo('desconhecido');
      expect(correlacoes).toBeDefined();
      expect(correlacoes.length).toBe(0);
    });
  });

  describe('getAllTarotTarots', () => {
    it('should return all correlations', () => {
      const todos = getAllTarotTarots();
      expect(todos).toBeDefined();
      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBeGreaterThan(0);
    });

    it('should return array with all required fields', () => {
      const todos = getAllTarotTarots();
      todos.forEach((mapping) => {
        expect(mapping).toHaveProperty('carta_origem');
        expect(mapping).toHaveProperty('numero_origem');
        expect(mapping).toHaveProperty('carta_destino');
        expect(mapping).toHaveProperty('numero_destino');
        expect(mapping).toHaveProperty('tipo_correlacao');
        expect(mapping).toHaveProperty('descricao_correlacao');
      });
    });

    it('should return mappings sorted by origin card number', () => {
      const todos = getAllTarotTarots();
      for (let i = 1; i < todos.length; i++) {
        expect(todos[i].numero_origem).toBeDefined();
      }
    });
  });

  describe('getNumeroCarta', () => {
    it('should return 0 for O Louco', () => {
      expect(getNumeroCarta('O Louco')).toBe(0);
    });

    it('should return 1 for O Mago', () => {
      expect(getNumeroCarta('O Mago')).toBe(1);
    });

    it('should return 3 for A Imperatriz', () => {
      expect(getNumeroCarta('A Imperatriz')).toBe(3);
    });

    it('should return 13 for A Morte', () => {
      expect(getNumeroCarta('A Morte')).toBe(13);
    });

    it('should return 21 for O Mundo', () => {
      expect(getNumeroCarta('O Mundo')).toBe(21);
    });

    it('should handle lowercase input', () => {
      expect(getNumeroCarta('o sol')).toBe(19);
    });

    it('should return null for unknown card', () => {
      expect(getNumeroCarta('UnknownCard')).toBeNull();
    });
  });

  describe('getNomeCarta', () => {
    it('should return "O Louco" for 0', () => {
      expect(getNomeCarta(0)).toBe('O Louco');
    });

    it('should return "O Mago" for 1', () => {
      expect(getNomeCarta(1)).toBe('O Mago');
    });

    it('should return "A Imperatriz" for 3', () => {
      expect(getNomeCarta(3)).toBe('A Imperatriz');
    });

    it('should return "A Morte" for 13', () => {
      expect(getNomeCarta(13)).toBe('A Morte');
    });

    it('should return "O Mundo" for 21', () => {
      expect(getNomeCarta(21)).toBe('O Mundo');
    });

    it('should return null for out of range number', () => {
      expect(getNomeCarta(22)).toBeNull();
    });

    it('should return null for negative number', () => {
      expect(getNomeCarta(-1)).toBeNull();
    });
  });

  describe('hasCorrelacao', () => {
    it('should return true for known correlation', () => {
      expect(hasCorrelacao('O Louco', 'O Mago')).toBe(true);
    });

    it('should return true for reverse known correlation', () => {
      expect(hasCorrelacao('O Mago', 'O Louco')).toBe(true);
    });

    it('should return false for unknown pair', () => {
      expect(hasCorrelacao('O Louco', 'O Mundo')).toBe(false);
    });

    it('should return false for empty input', () => {
      expect(hasCorrelacao('', '')).toBe(false);
    });

    it('should return false for unknown cards', () => {
      expect(hasCorrelacao('Unknown1', 'Unknown2')).toBe(false);
    });
  });

  describe('getDescricaoCorrelacao', () => {
    it('should return description for O Louco-O Mago', () => {
      const desc = getDescricaoCorrelacao('O Louco', 'O Mago');
      expect(desc).toBeTruthy();
      expect(typeof desc).toBe('string');
    });

    it('should return null for unknown pair', () => {
      const desc = getDescricaoCorrelacao('Unknown', 'Cards');
      expect(desc).toBeNull();
    });

    it('should return non-empty string for valid pairs', () => {
      const todos = getAllTarotTarots();
      todos.forEach((mapping) => {
        const desc = getDescricaoCorrelacao(mapping.carta_origem, mapping.carta_destino);
        expect(desc).toBeTruthy();
        expect(desc?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getTipoCorrelacao', () => {
    it('should return sequencial for O Mago-A Imperatriz', () => {
      expect(getTipoCorrelacao('O Mago', 'A Imperatriz')).toBe('sequencial');
    });

    it('should return contrastante for A Lua-O Sol', () => {
      expect(getTipoCorrelacao('A Lua', 'O Sol')).toBe('contrastante');
    });

    it('should return complementar for Os Enamorados-O Carro', () => {
      expect(getTipoCorrelacao('Os Enamorados', 'O Carro')).toBe('complementar');
    });

    it('should return kármico for A Morte-O Julgamento', () => {
      expect(getTipoCorrelacao('A Morte', 'O Julgamento')).toBe('kármico');
    });

    it('should return harmônico for O Mago-O Louco', () => {
      expect(getTipoCorrelacao('O Mago', 'O Louco')).toBe('harmônico');
    });

    it('should return null for unknown pair', () => {
      expect(getTipoCorrelacao('Unknown', 'Pair')).toBeNull();
    });
  });

  describe('TAROT_TAROT_MAP', () => {
    it('should be frozen', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAP)).toBe(true);
    });

    it('should contain all required correlation types', () => {
      const tipos = new Set(Object.values(TAROT_TAROT_MAP).map((m) => m.tipo_correlacao));
      expect(tipos.has('sequencial')).toBe(true);
      expect(tipos.has('contrastante')).toBe(true);
      expect(tipos.has('complementar')).toBe(true);
      expect(tipos.has('kármico')).toBe(true);
      expect(tipos.has('harmônico')).toBe(true);
    });

    it('should have valid card numbers (0-21)', () => {
      Object.values(TAROT_TAROT_MAP).forEach((mapping) => {
        expect(mapping.numero_origem).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_origem).toBeLessThanOrEqual(21);
        expect(mapping.numero_destino).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_destino).toBeLessThanOrEqual(21);
      });
    });
  });

  describe('TODOS_ARCANOS_NUMEROS', () => {
    it('should have 22 elements (0-21)', () => {
      expect(TODOS_ARCANOS_NUMEROS).toBeDefined();
      expect(TODOS_ARCANOS_NUMEROS.length).toBe(22);
    });

    it('should contain numbers from 0 to 21', () => {
      expect(TODOS_ARCANOS_NUMEROS[0]).toBe(0);
      expect(TODOS_ARCANOS_NUMEROS[21]).toBe(21);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(TODOS_ARCANOS_NUMEROS)).toBe(true);
    });
  });

  describe('TODOS_ARCANOS_NOMES', () => {
    it('should have 22 elements', () => {
      expect(TODOS_ARCANOS_NOMES).toBeDefined();
      expect(TODOS_ARCANOS_NOMES.length).toBe(22);
    });

    it('should contain all Major Arcana names', () => {
      expect(TODOS_ARCANOS_NOMES).toContain('O Louco');
      expect(TODOS_ARCANOS_NOMES).toContain('O Mago');
      expect(TODOS_ARCANOS_NOMES).toContain('A Imperatriz');
      expect(TODOS_ARCANOS_NOMES).toContain('O Mundo');
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(TODOS_ARCANOS_NOMES)).toBe(true);
    });
  });

  describe('Default export', () => {
    it('should export all required functions and constants', async () => {
      const module = await import('@/lib/correlation/tarot-tarot');
      expect(module.default).toBeDefined();
      expect(typeof module.default.getTarotTarot).toBe('function');
      expect(typeof module.default.getCorrelacoesDaCarta).toBe('function');
      expect(typeof module.default.getCorrelacoesPorTipo).toBe('function');
      expect(typeof module.default.getAllTarotTarots).toBe('function');
      expect(typeof module.default.getNumeroCarta).toBe('function');
      expect(typeof module.default.getNomeCarta).toBe('function');
      expect(typeof module.default.hasCorrelacao).toBe('function');
      expect(typeof module.default.getDescricaoCorrelacao).toBe('function');
      expect(typeof module.default.getTipoCorrelacao).toBe('function');
    });
  });
});