/**
 * Lenormand Mesa Real Tests
 */
import { describe, it, expect } from 'vitest';
import { LENORMAND_CARDS, getCardByNumero, getCardsByTipo, CASAS_TEMATICAS } from '@/lib/lenormand/data';
import { MESA_REAL_SPREADS, realizarLeitura, shuffle, drawCards, getOrientation, detectarPadrinhos, tecnicaCartaEspelho, gerarConvergencias } from '@/lib/lenormand/mesa-real';

describe('Card Data', () => {
  it('36 cards', () => { expect(LENORMAND_CARDS).toHaveLength(36); });
  it('O Cavaleiro', () => { expect(LENORMAND_CARDS[0].nome).toBe('O Cavaleiro'); expect(LENORMAND_CARDS[0].tipo).toBe('favoravel'); });
  it('Os Peixes', () => { expect(getCardByNumero(34)?.nome).toBe('Os Peixes'); });
  it('alert cards', () => { expect(getCardsByTipo('alerta').map(c => c.numero)).toContain(7); expect(getCardsByTipo('alerta').map(c => c.numero)).toContain(14); });
  it('favorable cards', () => { expect(getCardsByTipo('favoravel').map(c => c.numero)).toContain(1); expect(getCardsByTipo('favoravel').map(c => c.numero)).toContain(31); });
});

describe('Thematic Houses', () => {
  it('dinheiro', () => { expect(CASAS_TEMATICAS.DINHEIRO).toContain(34); expect(CASAS_TEMATICAS.DINHEIRO).toContain(15); });
  it('amor', () => { expect(CASAS_TEMATICAS.AMOR).toContain(24); });
  it('trabalho', () => { expect(CASAS_TEMATICAS.TRABALHO).toContain(35); });
  it('saude', () => { expect(CASAS_TEMATICAS.SAUDE).toContain(5); });
});

describe('Spreads', () => {
  it('8x4+4', () => { const s = MESA_REAL_SPREADS['8x4+4']; expect(s.format).toBe('8x4+4'); expect(s.rows).toBe(4); expect(s.cols).toBe(8); expect(s.destinyCards).toBe(4); });
  it('9x4', () => { const s = MESA_REAL_SPREADS['9x4']; expect(s.cols).toBe(9); expect(s.destinyCards).toBe(0); });
});

describe('Utils', () => {
  it('shuffle', () => { expect(shuffle([1, 2, 3])).toHaveLength(3); });
  it('drawCards', () => { expect(drawCards(10)).toHaveLength(10); });
  it('getOrientation', () => { expect(['upright', 'reversed']).toContain(getOrientation(0, 12345)); });
});

describe('realizarLeitura', () => {
  it('8x4+4', () => { const r = realizarLeitura({ format: '8x4+4' }); expect(r.cards).toHaveLength(32); expect(r.destinyCards).toHaveLength(4); expect(r.spreadInfo.hasDestinyCards).toBe(true); });
  it('9x4', () => { const r = realizarLeitura({ format: '9x4' }); expect(r.cards).toHaveLength(36); expect(r.destinyCards).toBeUndefined(); });
  it('cardIndices', () => { const r = realizarLeitura({ format: '8x4+4', cardIndices: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35] }); expect(r.cards[0].cardIndex).toBe(0); });
});

describe('Interpretation', () => {
  it('detectarPadrinhos', () => { const cards = [{ position: 1, house: 28, cardIndex: 0, cardName: 'Test', orientation: 'upright' as const, significado: 'Test', tipo: 'neutro' as const }]; expect(detectarPadrinhos(cards, '8x4+4').some(p => p.tipo === 'Consulente Masculino')).toBe(true); });
  it('tecnicaCartaEspelho', () => { expect(tecnicaCartaEspelho(1, 0)).toContain('CARTA ESPELHO'); expect(tecnicaCartaEspelho(1, 5)).toBeNull(); });
  it('gerarConvergencias', () => { const cards = [{ position: 1, cardIndex: 6, cardName: 'A Cobra', tipo: 'alerta' as const }]; expect(gerarConvergencias(cards).some(c => c.includes('ALERTA'))).toBe(true); });
});

describe('Reproducibility', () => {
  it('same seed', () => { const r1 = realizarLeitura({ format: '8x4+4', seed: 12345 }); const r2 = realizarLeitura({ format: '8x4+4', seed: 12345 }); expect(r1.cards.map(c => c.cardIndex)).toEqual(r2.cards.map(c => c.cardIndex)); });
});
