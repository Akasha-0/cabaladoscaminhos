/**
 * @akasha/core — Interpretation Engine tests
 *
 * Cobre as 2 funções públicas do motor de interpretação:
 *   - interpretarVida(numero): VidaInterpretation completa (shadow/gift/siddhi)
 *   - interpretarVidaArea(numero, area, nivel): AreaInterpretation de uma área
 *
 * Validação principal:
 *   - Master numbers (11, 22, 33) são marcados isMaster=true
 *   - Números fora do catálogo VIDA_CONTENT caem no buildFallback
 *   - interpretarVidaArea devolve um AreaInterpretation válido para área coberta
 */
import type { VidaInterpretation, AreaInterpretation } from '@akasha/types';
import { describe, it, expect } from 'vitest';
import {
  interpretarVida,
  interpretarVidaArea,
  MASTER_NUMBERS,
  VIDA_CONTENT,
} from './interpretation-engine';

// ─── Testes: interpretarVida ───────────────────────────────────────────────

describe('interpretarVida', () => {
  it('retorna VidaInterpretation com 3 níveis + mandato + arquetipo para número coberto', () => {
    const vida = interpretarVida(7);

    expect(vida.numero).toBe(7);
    expect(vida.isMaster).toBe(false);
    expect(vida.levels).toBeDefined();
    expect(vida.levels.shadow).toBeDefined();
    expect(vida.levels.gift).toBeDefined();
    expect(vida.levels.siddhi).toBeDefined();

    // Mandato e arquétipo devem ser strings não-vazias
    expect(typeof vida.mandato).toBe('string');
    expect(vida.mandato.length).toBeGreaterThan(0);
    expect(typeof vida.arquetipoAkasha).toBe('string');
    expect(vida.arquetipoAkasha.length).toBeGreaterThan(0);

    // Cada nível deve ser uma AreaInterpretation com codigo e dado coerentes
    const shadow: AreaInterpretation = vida.levels.shadow;
    expect(shadow.nivel).toBe('shadow');
    expect(shadow.codigo).toBe('vida-7-shadow');
    expect(shadow.dado).toBe('Seu Número de Vida é 7.');
    expect(shadow.area).toBe('proposito');
  });

  it('marca isMaster=true para os 3 master numbers canônicos (11, 22, 33)', () => {
    const m11 = interpretarVida(11);
    const m22 = interpretarVida(22);
    const m33 = interpretarVida(33);

    expect(m11.isMaster).toBe(true);
    expect(m11.levels.gift.codigo).toBe('vida-11-gift');
    expect(m11.levels.gift.dado).toContain('(Master 11)');

    expect(m22.isMaster).toBe(true);
    expect(m22.levels.siddhi.dado).toContain('(Master 22)');

    expect(m33.isMaster).toBe(true);
    expect(m33.levels.shadow.dado).toContain('(Master 33)');
  });

  it('edge case: número fora do catálogo cai no buildFallback (mandato genérico, isMaster=false)', () => {
    const vida: VidaInterpretation = interpretarVida(42);

    expect(vida.numero).toBe(42);
    expect(vida.isMaster).toBe(false);
    // Mandato genérico do fallback
    expect(vida.mandato).toContain('Seu Número de Vida é 42');
    expect(vida.arquetipoAkasha).toBe('Número 42');
    // Os 3 níveis ainda existem e são AreaInterpretation válidas
    expect(vida.levels.shadow.codigo).toBe('vida-42-shadow');
    expect(vida.levels.gift.codigo).toBe('vida-42-gift');
    expect(vida.levels.siddhi.codigo).toBe('vida-42-siddhi');
  });
});

// ─── Testes: interpretarVidaArea ───────────────────────────────────────────

describe('interpretarVidaArea', () => {
  it('devolve AreaInterpretation coerente com a área solicitada (default nível=gift)', () => {
    const interp = interpretarVidaArea(7, 'carreira');

    expect(interp).not.toBeNull();
    expect(interp!.area).toBe('proposito'); // AreaInterpretation.area sempre 'proposito' no motor
    expect(interp!.nivel).toBe('gift');
    expect(interp!.codigo).toBe('vida-7-gift');
    expect(interp!.aplicacao.carreira).toBeDefined();
    expect(interp!.aplicacao.carreira!.length).toBeGreaterThan(0);
  });

  it('respeita o parâmetro nivel explícito (shadow/siddhi)', () => {
    const shadow = interpretarVidaArea(11, 'carreira', 'shadow');
    const siddhi = interpretarVidaArea(11, 'carreira', 'siddhi');

    expect(shadow!.nivel).toBe('shadow');
    expect(shadow!.codigo).toBe('vida-11-shadow');
    expect(siddhi!.nivel).toBe('siddhi');
    expect(siddhi!.codigo).toBe('vida-11-siddhi');
  });

  it('edge case: para número fora do catálogo, ainda devolve AreaInterpretation válida', () => {
    const interp = interpretarVidaArea(99, 'saude');

    expect(interp).not.toBeNull();
    expect(interp!.nivel).toBe('gift');
    expect(interp!.codigo).toBe('vida-99-gift');
    // O fallback sempre popula aplicacao.proposito
    expect(interp!.aplicacao.proposito).toBeDefined();
  });
});

describe('MASTER_NUMBERS', () => {
  it('contém exatamente os três master numbers canônicos da numerologia (11, 22, 33)', () => {
    expect(MASTER_NUMBERS.size).toBe(3);
    expect(MASTER_NUMBERS.has(11)).toBe(true);
    expect(MASTER_NUMBERS.has(22)).toBe(true);
    expect(MASTER_NUMBERS.has(33)).toBe(true);
  });

  it('não inclui números de caminho de vida comuns (1-9)', () => {
    for (let n = 1; n <= 9; n++) {
      expect(MASTER_NUMBERS.has(n)).toBe(false);
    }
  });

  it('edge case: master numbers fora do conjunto canônico (ex: 44) não estão presentes', () => {
    expect(MASTER_NUMBERS.has(44)).toBe(false);
    expect(MASTER_NUMBERS.has(13)).toBe(false);
  });
});

describe('VIDA_CONTENT', () => {
  const EXPECTED_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33] as const;
  const EXPECTED_LEVELS = ['shadow', 'gift', 'siddhi'] as const;

  it('cobre todos os 12 números canônicos: 1-9, 11, 22, 33', () => {
    for (const n of EXPECTED_NUMBERS) {
      expect(VIDA_CONTENT[n]).toBeDefined();
    }
    // Exatamente estes e mais nenhum
    const keys = Object.keys(VIDA_CONTENT)
      .map(Number)
      .sort((a, b) => a - b);
    expect(keys).toEqual([...EXPECTED_NUMBERS].sort((a, b) => a - b));
  });

  it('cada entrada tem arquetipoAkasha e mandato (metadados do Pilar)', () => {
    for (const n of EXPECTED_NUMBERS) {
      const c = VIDA_CONTENT[n];
      expect(typeof c.arquetipoAkasha).toBe('string');
      expect(c.arquetipoAkasha.length).toBeGreaterThan(0);
      expect(typeof c.mandato).toBe('string');
      expect(c.mandato.length).toBeGreaterThan(0);
    }
  });

  it('cada entrada tem os 3 níveis (shadow/gift/siddhi) com todos os campos obrigatórios', () => {
    for (const n of EXPECTED_NUMBERS) {
      const c = VIDA_CONTENT[n];
      for (const nivel of EXPECTED_LEVELS) {
        const l = c.levels[nivel];
        expect(l, `número ${n} nível ${nivel} ausente`).toBeDefined();
        expect(typeof l.tituloPool).toBe('string');
        expect(l.tituloPool.length).toBeGreaterThan(0);
        expect(typeof l.significado).toBe('string');
        expect(l.significado.length).toBeGreaterThan(0);
        expect(typeof l.padrao).toBe('string');
        expect(l.padrao.length).toBeGreaterThan(0);
        expect(typeof l.afirmacao).toBe('string');
        expect(l.afirmacao.length).toBeGreaterThan(0);
        expect(typeof l.aplicacao).toBe('object');
      }
    }
  });

  it('cada nível cobre a área "proposito" na aplicacao (camada obrigatória)', () => {
    for (const n of EXPECTED_NUMBERS) {
      for (const nivel of EXPECTED_LEVELS) {
        const aplicacao = VIDA_CONTENT[n].levels[nivel].aplicacao;
        expect(
          aplicacao.proposito,
          `número ${n} nível ${nivel} sem aplicacao.proposito`
        ).toBeDefined();
        expect(typeof aplicacao.proposito).toBe('string');
        expect((aplicacao.proposito as string).length).toBeGreaterThan(0);
      }
    }
  });

  it('edge case: números fora do catálogo canônico (ex: 0, 10, 99) não estão em VIDA_CONTENT', () => {
    expect(VIDA_CONTENT[0]).toBeUndefined();
    expect(VIDA_CONTENT[10]).toBeUndefined();
    expect(VIDA_CONTENT[99]).toBeUndefined();
    expect(VIDA_CONTENT[13]).toBeUndefined();
  });
});
