/**
 * RAG do Mapa — F-247 test coverage
 *
 * ragForPilares + ragForUserMaps são usados pelo Mentor IA para injetar
 * contexto curado no system prompt. Determinísticos (sem random).
 *
 * Cobertura: 0% → ~50% (com este test file).
 */

import { describe, it, expect } from 'vitest';
import { ragForPilares, ragForUserMaps } from './rag-mapa';
import type { PilaresDados } from './significados-curados';

const PILARES_COMPLETOS: PilaresDados = {
  cabala: { life_path: 11, birthday: 7, expression: 5, ano_pessoal: 4 },
  astrologia: {
    sol_signo: 'Escorpião',
    asc_signo: 'Leão',
    lua_signo: 'Peixes',
    lua_fase: 'cheia',
    trinity: { sombra: 0.3, dom: 0.6, graca: 0.1 },
    trinity_dominante: 'dom',
    lilith_signo: 'Escorpião',
    casa_8_signo: 'Aquário',
  },
  tantrica: {
    corpo_predominante: 4,
    trigemeo: 'astral',
    temperamento_atual: 'colerico',
  },
  odu: {
    odu_principal: 'Ogbe',
    odu_secundario: 'Oyeku',
    fonte: 'Ifá',
  },
  iching: {
    hexagrama_natal: 51,
    hexagrama_dia: 11,
    level: 'gift',
  },
};

describe('ragForPilares (F-247)', () => {
  it('retorna string não-vazia com Pilares completos', () => {
    const rag = ragForPilares(PILARES_COMPLETOS);
    expect(typeof rag).toBe('string');
    expect(rag.length).toBeGreaterThan(100);
  });

  it('inclui DIRETRIZES ÉTICAS (R-022)', () => {
    const rag = ragForPilares(PILARES_COMPLETOS);
    expect(rag).toContain('DIRETRIZES ÉTICAS');
    expect(rag).toContain('CVV');
  });

  it('inclui Pilar 4 (Odu) ethics — requer terreiro', () => {
    const rag = ragForPilares(PILARES_COMPLETOS);
    expect(rag).toMatch(/Pilar 4.*Odu.*terreiro|requer.*terreiro/);
  });

  it('inclui nomes dos 5 Pilares', () => {
    const rag = ragForPilares(PILARES_COMPLETOS);
    expect(rag).toContain('Cabala');
    expect(rag).toContain('Astrologia');
    expect(rag).toContain('Tântrica');
    expect(rag).toContain('Odu');
    expect(rag).toContain('I Ching');
  });

  it('determinístico: mesmo input = mesmo output', () => {
    const rag1 = ragForPilares(PILARES_COMPLETOS);
    const rag2 = ragForPilares(PILARES_COMPLETOS);
    expect(rag1).toBe(rag2);
  });

  it('cabe em ~5k tokens (não estoura a janela do LLM)', () => {
    const rag = ragForPilares(PILARES_COMPLETOS);
    // ~4 chars per token, 5k tokens = ~20k chars
    // (RAG is verbose by design — includes 5 Pilares × 9 areas translations)
    expect(rag.length).toBeLessThan(25000);
  });
});

describe('ragForUserMaps (F-247)', () => {
  it('retorna string para maps válidos', () => {
    const maps = {
      kabala: { lifePath: 11, expression: 5, birthday: 7, personalCycles: { personalYear: 4 } },
      astrology: { ascendant: 'Leão', sun: { sign: 'Leão' } },
    };
    const rag = ragForUserMaps(maps as any);
    expect(typeof rag).toBe('string');
  });

  it('retorna string para maps null (graceful fallback)', () => {
    const rag = ragForUserMaps(null);
    expect(typeof rag).toBe('string');
  });

  it('retorna string para maps undefined (graceful fallback)', () => {
    const rag = ragForUserMaps(undefined);
    expect(typeof rag).toBe('string');
  });

  it('inclui DIRETRIZES ÉTICAS mesmo com maps vazios', () => {
    const rag = ragForUserMaps({} as any);
    expect(rag).toContain('DIRETRIZES ÉTICAS');
  });

  it('nunca throws com maps malformados', () => {
    expect(() => ragForUserMaps({} as any)).not.toThrow();
    expect(() => ragForUserMaps(null as any)).not.toThrow();
    expect(() => ragForUserMaps(undefined as any)).not.toThrow();
  });
});
