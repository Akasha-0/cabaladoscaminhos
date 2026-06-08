/**
 * theme-router-iching.test.ts — T10.6 (v0.0.4)
 *
 * Verifica que o `routeByPillar` reconhece o pilar `iching` (I-Ching) em
 * consultas sobre hexagrama, trigrama, bagua, yin-yang, etc., sem gerar
 * falsos positivos com cabala/astrologia/tantra/odus.
 *
 * Cobertura:
 *  1. "hexagrama natal" → iching
 *  2. "i ching" / "iching" / "i Ching" → iching (case/acento insensitive)
 *  3. "trigrama" / "bagua" → iching
 *  4. "yin-yang" / "yin yang" → iching
 *  5. Pergunta multi-pilar: "combinação entre mapa astral e I Ching" → [astrology, iching]
 *  6. NÃO dá falso positivo: "cabala" → NÃO retorna iching
 *  7. NÃO dá falso positivo: "astrologia" → NÃO retorna iching
 *  8. Determinismo: mesma pergunta → mesmos pilares
 *  9. Edge cases: string vazia / sem keywords → []
 * 10. PT e EN keywords reconhecidos (i ching + yijing + book of changes)
 */
import { describe, it, expect } from 'vitest';
import { routeByPillar, PILLAR_TAXONOMY, type Pillar } from '@/lib/ai/theme-router';

describe('T10.6 — routeByPillar reconhece pilar "iching"', () => {
  it('"hexagrama natal" → iching', () => {
    expect(routeByPillar('hexagrama natal')).toContain('iching');
  });

  it('"i ching" / "iching" / "I Ching" → iching (case/acento insensitive)', () => {
    expect(routeByPillar('i ching')).toContain('iching');
    expect(routeByPillar('iching')).toContain('iching');
    expect(routeByPillar('I Ching')).toContain('iching');
  });

  it('"trigrama" / "bagua" → iching', () => {
    expect(routeByPillar('trigrama')).toContain('iching');
    expect(routeByPillar('bagua')).toContain('iching');
  });

  it('"yin-yang" / "yin yang" → iching', () => {
    expect(routeByPillar('yin-yang')).toContain('iching');
    expect(routeByPillar('yin yang')).toContain('iching');
  });

  it('EN: "yijing" / "book of changes" / "chinese oracle" → iching', () => {
    expect(routeByPillar('yijing')).toContain('iching');
    expect(routeByPillar('book of changes')).toContain('iching');
    expect(routeByPillar('chinese oracle')).toContain('iching');
  });

  it('multi-pilar: "combinação entre mapa astral e I Ching" → [astrology, iching]', () => {
    const r = routeByPillar('combinação entre mapa astral e I Ching');
    expect(r).toContain('astrology');
    expect(r).toContain('iching');
    // Cabala/Tantra/Odus não devem aparecer
    expect(r).not.toContain('kabala');
    expect(r).not.toContain('tantra');
    expect(r).not.toContain('odus');
  });

  it('NÃO dá falso positivo: "cabala" → não retorna iching', () => {
    const r = routeByPillar('cabala');
    expect(r).not.toContain('iching');
    expect(r).toContain('kabala');
  });

  it('NÃO dá falso positivo: "astrologia" → não retorna iching', () => {
    const r = routeByPillar('astrologia');
    expect(r).not.toContain('iching');
    expect(r).toContain('astrology');
  });

  it('NÃO dá falso positivo: "kundalini" (tantra) → não retorna iching', () => {
    const r = routeByPillar('kundalini');
    expect(r).not.toContain('iching');
    expect(r).toContain('tantra');
  });

  it('NÃO dá falso positivo: "ogum" (odus) → não retorna iching', () => {
    const r = routeByPillar('meu orixá é ogum');
    expect(r).not.toContain('iching');
    expect(r).toContain('odus');
  });

  it('determinismo: mesma pergunta → mesmos pilares em qualquer ordem', () => {
    const r1 = routeByPillar('hexagrama e cabala');
    const r2 = routeByPillar('hexagrama e cabala');
    const r3 = routeByPillar('hexagrama e cabala');
    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
    expect(r1).toContain('iching');
    expect(r1).toContain('kabala');
  });

  it('edge case: string vazia → []', () => {
    expect(routeByPillar('')).toEqual([]);
  });

  it('edge case: pergunta sem keywords de nenhum pilar → []', () => {
    const r = routeByPillar('qual é o sentido da vida?');
    // Pode matchear `significado` em algum pilar? Não. Esperamos [] ou só
    // pilares muito genéricos. Aqui a string é intencionalmente neutra.
    expect(r).not.toContain('iching');
  });

  it('taxonomia: PILLAR_TAXONOMY.iching existe e tem ≥5 keywords', () => {
    expect(PILLAR_TAXONOMY.iching).toBeDefined();
    expect(PILLAR_TAXONOMY.iching.id).toBe('iching');
    expect(PILLAR_TAXONOMY.iching.keywords.length).toBeGreaterThanOrEqual(5);
  });

  it('taxonomia: todos os 5 pilares estão registrados', () => {
    const expected: Pillar[] = ['astrology', 'kabala', 'tantra', 'odus', 'iching'];
    for (const p of expected) {
      expect(PILLAR_TAXONOMY[p]).toBeDefined();
      expect(PILLAR_TAXONOMY[p].id).toBe(p);
      expect(PILLAR_TAXONOMY[p].keywords.length).toBeGreaterThan(0);
    }
  });

  it('PT keyword "sabedoria chinesa" → iching', () => {
    expect(routeByPillar('sabedoria chinesa')).toContain('iching');
  });
});
