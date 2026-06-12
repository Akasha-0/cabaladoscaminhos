/**
 * odu-glossary-lookup.test.ts — F-219
 *
 * Verifica que `getOduByName` resolve nomes canônicos ODUS_IFA com
 * parentético (ex.: 'Ogbe (Oxé)' emitido por @akasha/core-odus
 * calculateBirthOdu). Sem o fix, a section retornada por
 * `buildOduGlossary` é null e o system prompt da IA fica sem verdade-base
 * do Odu (alucinação).
 *
 * Fonte canônica: apps/akasha-portal/src/lib/domain/odu-data.ts (16 Odus,
 * tradição nagô-yorubá — Ilé-Ifé, ODU_DATABASE).
 */
import { describe, it, expect } from 'vitest';
import { getOduByName } from '@/lib/domain/odu-data';

describe('F-219 — getOduByName com nomes parentetizados', () => {
  it('resolve "Ogbe (Oxé)" — formato emitido por calculateBirthOdu', () => {
    const odu = getOduByName('Ogbe (Oxé)');
    expect(odu).toBeDefined();
    expect(odu?.name).toBe('Ogbe');
    expect(odu?.number).toBe(1);
    expect(odu?.element).toBe('fire');
  });

  it('resolve nome simples "Ogbe" (lookup direto)', () => {
    const odu = getOduByName('Ogbe');
    expect(odu).toBeDefined();
    expect(odu?.number).toBe(1);
  });

  it('resolve case-insensitive "ogbe (oxé)"', () => {
    const odu = getOduByName('ogbe (oxé)');
    expect(odu).toBeDefined();
    expect(odu?.number).toBe(1);
  });

  it('resolve nome com whitespace "  Ogbe (Oxé)  "', () => {
    const odu = getOduByName('  Ogbe (Oxé)  ');
    expect(odu).toBeDefined();
    expect(odu?.number).toBe(1);
  });

  it('retorna undefined para Odu inexistente', () => {
    // Nome totalmente fora do banco → undefined
    expect(getOduByName('INEXISTENTE')).toBeUndefined();
    // Prefixo desconhecido + parentético → strip não acha nada → undefined
    expect(getOduByName('ZZZ (Foo)')).toBeUndefined();
  });

  it('strip parentético confia no prefixo: "Ogbe (Alias)" → Ogbe', () => {
    // Comportamento documentado: o parentético é alias/variação ortográfica.
    // Strip preserva o prefixo canônico. Não validamos o conteúdo do parêntese
    // (ODUS_IFA e ODU_DATABASE podem divergir — Pilar 4 ethics invariant).
    expect(getOduByName('Ogbe (Invalido)')).toBeDefined();
    expect(getOduByName('Ogbe (Invalido)')?.number).toBe(1);
  });

  it('retorna Odu com essencia não-vazia (truth-base para IA)', () => {
    const odu = getOduByName('Ogbe (Oxé)');
    expect(odu?.essencia.length).toBeGreaterThan(50);
    expect(odu?.preceitos.length).toBeGreaterThan(0);
    expect(odu?.quizilas.length).toBeGreaterThan(0);
  });
});
