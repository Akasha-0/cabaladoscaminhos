/**
 * @akasha/core-pilar7 — Testes do Espectro (3 estagios)
 *
 * Verifica:
 * - Estagio depende da idade quando Pilar 4 ausente
 * - Pilar 4 faseVida sobrescreve heuristica de idade
 * - Juventude e refinada por idade (21 anos)
 * - Idades invalidas caem para sombra
 * - inferirFaseVida segue os 4 cortes canonicos
 * - isFaseVida type guard funciona
 */
import { describe, it, expect } from 'vitest';
import {
  detectarEstagio,
  inferirFaseVida,
  isFaseVida,
} from '../espectro';
import { getChave } from '../chave';
import type { EstagioTransformacao, FaseVida } from '../types';

describe('Pilar 7 — Espectro (sombra | dom | siddhi)', () => {
  const chaveExemplo = getChave(1);

  it('existem exatamente 3 estagios canonicos', () => {
    const estagios: EstagioTransformacao[] = ['sombra', 'dom', 'siddhi'];
    expect(estagios).toHaveLength(3);
    expect(new Set(estagios).size).toBe(3);
  });

  describe('heuristica por idade (sem Pilar 4)', () => {
    it('infancia (0-12) → sombra', () => {
      expect(detectarEstagio(chaveExemplo, 0)).toBe('sombra');
      expect(detectarEstagio(chaveExemplo, 5)).toBe('sombra');
      expect(detectarEstagio(chaveExemplo, 12)).toBe('sombra');
    });

    it('juventude (13-20) → sombra', () => {
      expect(detectarEstagio(chaveExemplo, 13)).toBe('sombra');
      expect(detectarEstagio(chaveExemplo, 20)).toBe('sombra');
    });

    it('juventude (21-29) → dom', () => {
      expect(detectarEstagio(chaveExemplo, 21)).toBe('dom');
      expect(detectarEstagio(chaveExemplo, 25)).toBe('dom');
      expect(detectarEstagio(chaveExemplo, 29)).toBe('dom');
    });

    it('maturidade (30-59) → dom', () => {
      expect(detectarEstagio(chaveExemplo, 30)).toBe('dom');
      expect(detectarEstagio(chaveExemplo, 45)).toBe('dom');
      expect(detectarEstagio(chaveExemplo, 59)).toBe('dom');
    });

    it('sabedoria (60+) → siddhi', () => {
      expect(detectarEstagio(chaveExemplo, 60)).toBe('siddhi');
      expect(detectarEstagio(chaveExemplo, 75)).toBe('siddhi');
      expect(detectarEstagio(chaveExemplo, 100)).toBe('siddhi');
    });

    it('idades invalidas (NaN, negativo, Infinity) → fallback conservador', () => {
      // NaN → sombra (Number.isFinite false)
      expect(detectarEstagio(chaveExemplo, NaN)).toBe('sombra');
      // Negativo → sombra (Number.isFinite true mas idade < 0)
      expect(detectarEstagio(chaveExemplo, -5)).toBe('sombra');
      // Infinity → Number.isFinite false → sombra (conservador)
      // (escolha deliberada: Infinity nao deve promover a siddhi por bug)
      expect(detectarEstagio(chaveExemplo, Infinity)).toBe('sombra');
      expect(detectarEstagio(chaveExemplo, -Infinity)).toBe('sombra');
    });
  });

  describe('Pilar 4 faseVida sobrescreve idade', () => {
    it('infancia explicita → sombra mesmo se idade alta', () => {
      expect(detectarEstagio(chaveExemplo, 80, 'infancia')).toBe('sombra');
    });

    it('maturidade explicita → dom mesmo se idade baixa', () => {
      expect(detectarEstagio(chaveExemplo, 10, 'maturidade')).toBe('dom');
    });

    it('sabedoria explicita → siddhi mesmo se idade baixa', () => {
      expect(detectarEstagio(chaveExemplo, 25, 'sabedoria')).toBe('siddhi');
    });

    it('juventude explicita → refina por idade (< 21 sombra, >= 21 dom)', () => {
      expect(detectarEstagio(chaveExemplo, 15, 'juventude')).toBe('sombra');
      expect(detectarEstagio(chaveExemplo, 25, 'juventude')).toBe('dom');
    });

    it('faseVida invalida → cai para heuristica por idade', () => {
      expect(detectarEstagio(chaveExemplo, 40, 'invalida' as FaseVida)).toBe('dom');
      expect(detectarEstagio(chaveExemplo, 65, '')).toBe('siddhi');
    });
  });

  describe('inferirFaseVida', () => {
    it('segue os 4 cortes canonicos', () => {
      expect(inferirFaseVida(0)).toBe('infancia');
      expect(inferirFaseVida(12)).toBe('infancia');
      expect(inferirFaseVida(13)).toBe('juventude');
      expect(inferirFaseVida(29)).toBe('juventude');
      expect(inferirFaseVida(30)).toBe('maturidade');
      expect(inferirFaseVida(59)).toBe('maturidade');
      expect(inferirFaseVida(60)).toBe('sabedoria');
      expect(inferirFaseVida(120)).toBe('sabedoria');
    });

    it('idades invalidas → infancia (conservador)', () => {
      expect(inferirFaseVida(NaN)).toBe('infancia');
      expect(inferirFaseVida(-1)).toBe('infancia');
    });
  });

  describe('isFaseVida', () => {
    it('aceita apenas os 4 valores canonicos', () => {
      expect(isFaseVida('infancia')).toBe(true);
      expect(isFaseVida('juventude')).toBe(true);
      expect(isFaseVida('maturidade')).toBe(true);
      expect(isFaseVida('sabedoria')).toBe(true);
    });

    it('rejeita valores fora do whitelist', () => {
      expect(isFaseVida('velhice')).toBe(false);
      expect(isFaseVida('adolescencia')).toBe(false);
      expect(isFaseVida('')).toBe(false);
      expect(isFaseVida(null)).toBe(false);
      expect(isFaseVida(undefined)).toBe(false);
      expect(isFaseVida(42)).toBe(false);
    });
  });

  it('chave null → ainda detecta estagio via idade (graceful)', () => {
    expect(detectarEstagio(null, 30)).toBe('dom');
    expect(detectarEstagio(null, 65)).toBe('siddhi');
    expect(detectarEstagio(null, 5)).toBe('sombra');
  });

  it('determinismo: mesma entrada → mesmo estagio', () => {
    const e1 = detectarEstagio(chaveExemplo, 35, 'maturidade');
    const e2 = detectarEstagio(chaveExemplo, 35, 'maturidade');
    const e3 = detectarEstagio(chaveExemplo, 35, 'maturidade');
    expect(e1).toBe(e2);
    expect(e2).toBe(e3);
  });
});
