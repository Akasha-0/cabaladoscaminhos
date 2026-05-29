/**
 * Lenormand Mesa Real Tests
 */

import { describe, it, expect } from 'vitest';
import {
  LENORMAND_CARDS,
  getCardByNumero,
  getCardByNome,
  getCardsByTipo,
  CASAS_TEMATICAS,
} from '@/lib/lenormand/data';
import {
  MESA_REAL_SPREADS,
  realizarLeitura,
  shuffle,
  drawCards,
  getOrientation,
  analisarTema,
  detectarPadrinhos,
  tecnicaCartaEspelho,
  gerarConvergencias,
} from '@/lib/lenormand/mesa-real';

describe('Lenormand Card Data', () => {
  it('should have exactly 36 cards', () => {
    expect(LENORMAND_CARDS).toHaveLength(36);
  });

  it('should have all cards numbered 1-36', () => {
    const numbers = LENORMAND_CARDS.map(c => c.numero).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
  });

  it('should have all required fields for each card', () => {
    for (const card of LENORMAND_CARDS) {
      expect(card.numero).toBeDefined();
      expect(card.numero).toBeGreaterThan(0);
      expect(card.numero).toBeLessThanOrEqual(36);
      expect(card.nome).toBeDefined();
      expect(typeof card.nome).toBe('string');
      expect(card.nome.length).toBeGreaterThan(0);
      expect(card.significadoCentral).toBeDefined();
      expect(card.areaVida).toBeDefined();
      expect(card.cartaTematica).toBeDefined();
      expect(card.comoInterpretar).toBeDefined();
      expect(card.tipo).toBeDefined();
      expect(['favoravel', 'desafio', 'neutro', 'alerta']).toContain(card.tipo);
    }
  });

  it('should have correct card 1 - O Cavaleiro', () => {
    const cavaleiro = LENORMAND_CARDS[0];
    expect(cavaleiro.numero).toBe(1);
    expect(cavaleiro.nome).toBe('O Cavaleiro');
    expect(cavaleiro.tipo).toBe('favoravel');
    expect(cavaleiro.significadoCentral).toContain('Início');
  });

  it('should have correct card 24 - O Coração', () => {
    const coracao = getCardByNumero(24);
    expect(coracao).toBeDefined();
    expect(coracao?.nome).toBe('O Coração');
    expect(coracao?.tipo).toBe('favoravel');
  });

  it('should have correct card 34 - Os Peixes', () => {
    const peixes = getCardByNumero(34);
    expect(peixes).toBeDefined();
    expect(peixes?.nome).toBe('Os Peixes');
    expect(peixes?.tipo).toBe('favoravel');
    expect(peixes?.significadoCentral).toContain('Dinheiro');
  });

  it('should have correct card 36 - A Cruz', () => {
    const cruz = getCardByNumero(36);
    expect(cruz).toBeDefined();
    expect(cruz?.nome).toBe('A Cruz');
    expect(cruz?.tipo).toBe('desafio');
  });

  it('should have all alert cards (Cobra and Raposa)', () => {
    const alerts = getCardsByTipo('alerta');
    expect(alerts.length).toBeGreaterThanOrEqual(2);
    const numeros = alerts.map(c => c.numero).sort((a, b) => a - b);
    expect(numeros).toContain(7);
    expect(numeros).toContain(14);
  });

  it('should have correct challenge cards', () => {
    const desafios = getCardsByTipo('desafio');
    const numeros = desafios.map(c => c.numero).sort((a, b) => a - b);
    expect(numeros).toContain(6);
    expect(numeros).toContain(8);
    expect(numeros).toContain(10);
    expect(numeros).toContain(11);
    expect(numeros).toContain(21);
    expect(numeros).toContain(23);
    expect(numeros).toContain(36);
  });

  it('should have correct favorable cards', () => {
    const favoraveis = getCardsByTipo('favoravel');
    const numeros = favoraveis.map(c => c.numero).sort((a, b) => a - b);
    expect(numeros).toContain(1);
    expect(numeros).toContain(3);
    expect(numeros).toContain(9);
    expect(numeros).toContain(13);
    expect(numeros).toContain(16);
    expect(numeros).toContain(17);
    expect(numeros).toContain(18);
    expect(numeros).toContain(24);
    expect(numeros).toContain(30);
    expect(numeros).toContain(31);
    expect(numeros).toContain(33);
    expect(numeros).toContain(34);
  });
});

describe('Card Lookup Functions', () => {
  it('getCardByNumero should return correct card', () => {
    const card = getCardByNumero(15);
    expect(card).toBeDefined();
    expect(card?.nome).toBe('O Urso');
  });

  it('getCardByNumero should return undefined for invalid number', () => {
    expect(getCardByNumero(0)).toBeUndefined();
    expect(getCardByNumero(37)).toBeUndefined();
  });

  it('getCardByNome should be case-insensitive', () => {
    const card1 = getCardByNome('O Sol');
    const card2 = getCardByNome('o sol');
    expect(card1?.numero).toBe(31);
    expect(card2?.numero).toBe(31);
  });

  it('getCardsByTipo should filter correctly', () => {
    const desafios = getCardsByTipo('desafio');
    const allDesafio = desafios.every(c => c.tipo === 'desafio');
    expect(allDesafio).toBe(true);
    expect(desafios.length).toBeGreaterThan(0);
  });
});

describe('Thematic Houses', () => {
  it('should have correct dinheiro houses (34, 15)', () => {
    expect(CASAS_TEMATICAS.DINHEIRO).toContain(34);
    expect(CASAS_TEMATICAS.DINHEIRO).toContain(15);
  });

  it('should have correct amor houses (24, 25)', () => {
    expect(CASAS_TEMATICAS.AMOR).toContain(24);
    expect(CASAS_TEMATICAS.AMOR).toContain(25);
  });

  it('should have correct trabalho houses (35, 14)', () => {
    expect(CASAS_TEMATICAS.TRABALHO).toContain(35);
    expect(CASAS_TEMATICAS.TRABALHO).toContain(14);
  });

  it('should have correct saude houses (5, 8)', () => {
    expect(CASAS_TEMATICAS.SAUDE).toContain(5);
    expect(CASAS_TEMATICAS.SAUDE).toContain(8);
  });
});

describe('Mesa Real Spreads', () => {
  it('should have 8x4+4 spread', () => {
    const spread = MESA_REAL_SPREADS['8x4+4'];
    expect(spread).toBeDefined();
    expect(spread.format).toBe('8x4+4');
    expect(spread.rows).toBe(4);
    expect(spread.cols).toBe(8);
    expect(spread.destinyCards).toBe(4);
    expect(spread.totalCards).toBe(36);
    expect(spread.casaLabels).toHaveLength(36);
  });

  it('should have 9x4 spread', () => {
    const spread = MESA_REAL_SPREADS['9x4'];
    expect(spread).toBeDefined();
    expect(spread.format).toBe('9x4');
    expect(spread.rows).toBe(4);
    expect(spread.cols).toBe(9);
    expect(spread.destinyCards).toBe(0);
    expect(spread.totalCards).toBe(36);
    expect(spread.casaLabels).toHaveLength(36);
  });

  it('should have correct casa labels for 8x4+4', () => {
    const spread = MESA_REAL_SPREADS['8x4+4'];
    expect(spread.casaLabels[0]).toBe('Cavaleiro');
    expect(spread.casaLabels[23]).toBe('Coração');
    expect(spread.casaLabels[32]).toBe('Coroa');
  });

  it('should have correct casa labels for 9x4', () => {
    const spread = MESA_REAL_SPREADS['9x4'];
    expect(spread.casaLabels[0]).toBe('Cavaleiro');
    expect(spread.casaLabels[8]).toBe('Flores');
    expect(spread.casaLabels[35]).toBe('Cruz');
  });
});

describe('Utility Functions', () => {
  it('shuffle should not modify original array', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];
    shuffle(original);
    expect(original).toEqual(originalCopy);
  });

  it('shuffle should return array of same length', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffle(arr);
    expect(shuffled).toHaveLength(arr.length);
  });

  it('drawCards should return correct count', () => {
    const cards = drawCards(10);
    expect(cards).toHaveLength(10);
  });

  it('drawCards should return valid card indices (0-35)', () => {
    const cards = drawCards(36);
    for (const idx of cards) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThanOrEqual(35);
    }
  });

  it('drawCards should not have duplicates', () => {
    const cards = drawCards(36);
    const unique = new Set(cards);
    expect(unique.size).toBe(36);
  });

  it('getOrientation should return valid values', () => {
    for (let i = 0; i < 10; i++) {
      const orientation = getOrientation(i, 12345);
      expect(['upright', 'reversed']).toContain(orientation);
    }
  });

  it('getOrientation should be deterministic with same seed', () => {
    const o1 = getOrientation(5, 99999);
    const o2 = getOrientation(5, 99999);
    expect(o1).toBe(o2);
  });
});

describe('realizarLeitura', () => {
  describe('8x4+4 format', () => {
    it('should return 32 main cards plus 4 destiny cards', () => {
      const reading = realizarLeitura({ format: '8x4+4' });
      expect(reading.cards).toHaveLength(32);
      expect(reading.destinyCards).toHaveLength(4);
    });

    it('should have correct spread info', () => {
      const reading = realizarLeitura({ format: '8x4+4' });
      expect(reading.spreadInfo.rows).toBe(4);
      expect(reading.spreadInfo.cols).toBe(8);
      expect(reading.spreadInfo.hasDestinyCards).toBe(true);
    });

    it('should use provided card indices', () => {
      const specificCards = [0, 5, 10, 15, 20, 25, 30, 33];
      const reading = realizarLeitura({
        format: '8x4+4',
        cardIndices: specificCards,
      });
      expect(reading.cards[0].cardIndex).toBe(0);
      expect(reading.cards[1].cardIndex).toBe(5);
    });

    it('should have valid theme analysis', () => {
      const reading = realizarLeitura({ format: '8x4+4' });
      expect(reading.themes).toBeDefined();
      expect(reading.themes.dinheiro).toBeDefined();
      expect(reading.themes.amor).toBeDefined();
      expect(reading.themes.trabalho).toBeDefined();
      expect(reading.themes.saude).toBeDefined();
    });

    it('should calculate card type counts correctly', () => {
      const reading = realizarLeitura({ format: '8x4+4' });
      const total = reading.analysis.totalFavoravel +
        reading.analysis.totalDesafio +
        reading.analysis.totalNeutro +
        reading.analysis.totalAlerta;
      expect(total).toBe(36);
    });
  });

  describe('9x4 format', () => {
    it('should return 36 cards with no destiny cards', () => {
      const reading = realizarLeitura({ format: '9x4' });
      expect(reading.cards).toHaveLength(36);
      expect(reading.destinyCards).toBeUndefined();
    });

    it('should have correct spread info', () => {
      const reading = realizarLeitura({ format: '9x4' });
      expect(reading.spreadInfo.rows).toBe(4);
      expect(reading.spreadInfo.cols).toBe(9);
      expect(reading.spreadInfo.hasDestinyCards).toBe(false);
    });

    it('should calculate card type counts correctly', () => {
      const reading = realizarLeitura({ format: '9x4' });
      const total = reading.analysis.totalFavoravel +
        reading.analysis.totalDesafio +
        reading.analysis.totalNeutro +
        reading.analysis.totalAlerta;
      expect(total).toBe(36);
    });
  });

  describe('Card properties', () => {
    it('should have valid card data in reading', () => {
      const reading = realizarLeitura({ format: '8x4+4' });
      for (const card of reading.cards) {
        expect(card.position).toBeGreaterThan(0);
        expect(card.house).toBeGreaterThan(0);
        expect(card.house).toBeLessThanOrEqual(32);
        expect(card.cardIndex).toBeGreaterThanOrEqual(0);
        expect(card.cardIndex).toBeLessThan(36);
        expect(card.cardName).toBeDefined();
        expect(['upright', 'reversed']).toContain(card.orientation);
        expect(card.tipo).toBeDefined();
      }
    });

    it('should have valid destiny card data', () => {
      const reading = realizarLeitura({ format: '8x4+4' });
      for (const card of reading.destinyCards ?? []) {
        expect(card.position).toBeGreaterThanOrEqual(33);
        expect(card.position).toBeLessThanOrEqual(36);
        expect(card.cardName).toBeDefined();
        expect(card.significado).toContain('Destino');
      }
    });
  });
});

describe('Interpretation Functions', () => {
  describe('detectarPadrinhos', () => {
    it('should identify Cigano (house 28)', () => {
      const cards = [{
        position: 1,
        house: 28,
        cardIndex: 0,
        cardName: 'O Cavaleiro',
        orientation: 'upright' as const,
        significado: 'Teste',
        tipo: 'favoravel' as const,
      }];
      const padrinhos = detectarPadrinhos(cards, '8x4+4');
      expect(padrinhos.some(p => p.tipo === 'Consulente Masculino')).toBe(true);
    });

    it('should identify Cigana (house 29)', () => {
      const cards = [{
        position: 1,
        house: 29,
        cardIndex: 1,
        cardName: 'O Trevo',
        orientation: 'upright' as const,
        significado: 'Teste',
        tipo: 'neutro' as const,
      }];
      const padrinhos = detectarPadrinhos(cards, '9x4');
      expect(padrinhos.some(p => p.tipo === 'Consulente Feminino')).toBe(true);
    });
  });

  describe('tecnicaCartaEspelho', () => {
    it('should detect mirror when card matches house', () => {
      const mirror = tecnicaCartaEspelho(1, 0);
      expect(mirror).toBeDefined();
      expect(mirror).toContain('CARTA ESPELHO');
    });

    it('should return null when card does not match house', () => {
      const mirror = tecnicaCartaEspelho(1, 5);
      expect(mirror).toBeNull();
    });
  });

  describe('gerarConvergencias', () => {
    it('should generate convergence for multiple favorable cards', () => {
      const cards = Array(5).fill(null).map((_, i) => ({
        position: i + 1,
        house: i + 1,
        cardIndex: i,
        cardName: `Card ${i}`,
        orientation: 'upright' as const,
        significado: 'Teste',
        tipo: 'favoravel' as const,
      }));
      const convergencias = gerarConvergencias(cards);
      expect(convergencias.length).toBeGreaterThan(0);
      expect(convergencias.some(c => c.includes('favoráveis'))).toBe(true);
    });

    it('should generate alert convergence', () => {
      const cards = [
        { position: 1, house: 7, cardIndex: 6, cardName: 'A Cobra', orientation: 'upright' as const, significado: 'Teste', tipo: 'alerta' as const },
        { position: 2, house: 14, cardIndex: 13, cardName: 'A Raposa', orientation: 'upright' as const, significado: 'Teste', tipo: 'alerta' as const },
      ];
      const convergencias = gerarConvergencias(cards);
      expect(convergencias.some(c => c.includes('ALERTA'))).toBe(true);
    });
  });
});

describe('Reading Reproducibility', () => {
  it('should produce same result with same seed', () => {
    const seed = 12345;
    const reading1 = realizarLeitura({ format: '8x4+4', seed });
    const reading2 = realizarLeitura({ format: '8x4+4', seed });

    expect(reading1.cards.map(c => c.cardIndex)).toEqual(
      reading2.cards.map(c => c.cardIndex)
    );
  });

  it('should produce different results with different seeds', () => {
    const reading1 = realizarLeitura({ format: '8x4+4', seed: 11111 });
    const reading2 = realizarLeitura({ format: '8x4+4', seed: 22222 });

    const indices1 = reading1.cards.map(c => c.cardIndex).join(',');
    const indices2 = reading2.cards.map(c => c.cardIndex).join(',');

    expect(indices1).not.toBe(indices2);
  });
});
