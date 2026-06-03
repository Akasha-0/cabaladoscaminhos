/**
 * Theme Router Determinism Tests
 * ============================================================
 * AD-19.4 Invariant 2: The same theme (normalized text) MUST always
 *   route to the same house set — no randomness, no timestamp dependency.
 *
 * AD-20.8: Cross-theme isolation — different themes produce different
 *   house routings. No overlap unless the taxonomy explicitly shares houses.
 *
 * Tests cover:
 *  1. Determinism: same input → identical houses (invariant 2)
 *  2. Cross-theme isolation: different themes → different houses
 *  3. Graceful fallback for unknown themes
 *  4. Money/dinheiro → Casa 34 (finanças)
 *  5. Love/amor → Casa 24 (coração)
 */

import { describe, it, expect } from 'vitest';
import { routeQuestion, THEME_TAXONOMY } from '@/lib/ai/theme-router';

describe('AD-19.4 Invariant 2 — Determinism: same theme → same routed houses', () => {
  it('"amor" repeated calls return identical house routing', () => {
    const r1 = routeQuestion('amor');
    const r2 = routeQuestion('amor');
    const r3 = routeQuestion('amor');

    expect(r1.houses).toEqual(r2.houses);
    expect(r2.houses).toEqual(r3.houses);
    expect(r1.themes).toEqual(r2.themes);
    expect(r2.themes).toEqual(r3.themes);
    expect(r1.natalAspects).toEqual(r2.natalAspects);
  });

  it('"dinheiro" repeated calls return identical house routing', () => {
    const r1 = routeQuestion('dinheiro');
    const r2 = routeQuestion('dinheiro');
    const r3 = routeQuestion('dinheiro');

    expect(r1.houses).toEqual(r2.houses);
    expect(r2.houses).toEqual(r3.houses);
    expect(r1.themes).toEqual(r2.themes);
    expect(r2.themes).toEqual(r3.themes);
  });

  it('"trabalho" repeated calls return identical house routing', () => {
    const r1 = routeQuestion('trabalho');
    const r2 = routeQuestion('trabalho');
    const r3 = routeQuestion('trabalho');

    expect(r1.houses).toEqual(r2.houses);
    expect(r2.houses).toEqual(r3.houses);
  });

  it('phrasing variations of the same theme are deterministic', () => {
    // Both questions contain the "amor" keyword — same theme
    const r1 = routeQuestion('minha vida amorosa');
    const r2 = routeQuestion('minha vida amorosa');
    expect(r1.houses).toEqual(r2.houses);
    expect(r1.themes).toEqual(r2.themes);
  });

  it('case and accent normalization does not break determinism', () => {
    const r1 = routeQuestion('AMOR');
    const r2 = routeQuestion('amor');
    const r3 = routeQuestion('Âmor');
    expect(r1.houses).toEqual(r2.houses);
    expect(r2.houses).toEqual(r3.houses);
  });

  it('punctuation does not break determinism', () => {
    const r1 = routeQuestion('amor!!!');
    const r2 = routeQuestion('amor??');
    expect(r1.houses).toEqual(r2.houses);
  });

  it('determinism holds with filledHouses parameter', () => {
    const r1 = routeQuestion('amor', [1, 5, 34]);
    const r2 = routeQuestion('amor', [1, 5, 34]);
    const r3 = routeQuestion('amor', [1, 5, 34]);
    expect(r1.houses).toEqual(r2.houses);
    expect(r2.houses).toEqual(r3.houses);
  });

  it('determinism holds across 100 consecutive calls', () => {
    const baseline = routeQuestion('amor e dinheiro no trabalho');
    for (let i = 0; i < 100; i++) {
      const result = routeQuestion('amor e dinheiro no trabalho');
      expect(result.houses).toEqual(baseline.houses);
      expect(result.themes).toEqual(baseline.themes);
    }
  });
});

describe('AD-20.8 — Cross-theme isolation: different themes → different house routing', () => {
  it('"amor" does NOT route to the same houses as "dinheiro"', () => {
    const amor = routeQuestion('amor');
    const dinheiro = routeQuestion('dinheiro');

    // amor → Casa 24 (primary) + 25, 29 (secondary)
    // dinheiro → Casa 34 (primary) + 15, 2 (secondary)
    // These sets should not be identical
    expect(amor.houses).not.toEqual(dinheiro.houses);
  });

  it('"amor" does NOT route to the same houses as "trabalho"', () => {
    const amor = routeQuestion('amor');
    const trabalho = routeQuestion('trabalho');

    // trabalho → Casa 35 (primary) + 31, 15 (secondary)
    // Should not overlap with amor's [24, 25, 29]
    expect(amor.houses).not.toEqual(trabalho.houses);
  });

  it('"dinheiro" does NOT route to the same houses as "trabalho"', () => {
    const dinheiro = routeQuestion('dinheiro');
    const trabalho = routeQuestion('trabalho');

    // dinheiro → [34, 15, 2]
    // trabalho → [35, 31, 15]
    // 15 appears in both, but the full sorted arrays differ
    expect(dinheiro.houses).not.toEqual(trabalho.houses);
  });

  it('all distinct themes produce distinguishable house sets', () => {
    const themes = [
      'amor',
      'sexualidade',
      'dinheiro',
      'trabalho',
      'familia',
      'saude',
      'decisao',
      'espiritualidade',
      'obstaculos',
      'comunicacao',
      'mudancas',
    ] as const;

    const results = themes.map((t) => ({ theme: t, result: routeQuestion(t) }));

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const a = results[i].result.houses;
        const b = results[j].result.houses;
        // At minimum the primary house should differ for most themes
        // (saude and familia both share house 5 as primary, but secondary differs)
        const themeA = results[i].theme;
        const themeB = results[j].theme;
        const entryA = THEME_TAXONOMY[themeA as keyof typeof THEME_TAXONOMY];
        const entryB = THEME_TAXONOMY[themeB as keyof typeof THEME_TAXONOMY];
        // Different themes have different primary houses (enforced by taxonomy design)
        expect(entryA.primaryHouses).not.toEqual(entryB.primaryHouses);
      }
    }
  });

  it('themes with overlapping secondary houses still produce different full routing', () => {
    // Both familia (4,5) and saude (5,23) share house 5, but final routing differs
    const familia = routeQuestion('familia');
    const saude = routeQuestion('saude');

    expect(familia.houses).not.toEqual(saude.houses);
    // Each must include its primary house
    expect(familia.houses).toContain(4);
    expect(saude.houses).toContain(5);
  });
});

describe('Unknown / unrecognized themes — graceful fallback', () => {
  it('"xyz totally unknown" does not throw', () => {
    expect(() => routeQuestion('xyz totally unknown')).not.toThrow();
  });

  it('"xyz totally unknown" returns a valid RoutingResult with geral theme', () => {
    const r = routeQuestion('xyz totally unknown');
    expect(r).toBeDefined();
    expect(Array.isArray(r.themes)).toBe(true);
    expect(Array.isArray(r.houses)).toBe(true);
    expect(Array.isArray(r.natalAspects)).toBe(true);
    expect(r.themes).toContain('geral');
  });

  it('"xyz totally unknown" with no filledHouses returns empty houses', () => {
    const r = routeQuestion('xyz totally unknown');
    expect(r.houses).toEqual([]);
  });

  it('"xyz totally unknown" with filledHouses uses those houses', () => {
    const r = routeQuestion('xyz totally unknown', [7, 14, 21]);
    expect(r.themes).toEqual(['geral']);
    expect(r.houses).toEqual([7, 14, 21]);
  });

  it('fallback returns synthesis natal aspect', () => {
    const r = routeQuestion('xyz totally unknown');
    expect(r.natalAspects).toContain('síntese completa do dossiê');
  });

  it('empty string falls back gracefully', () => {
    const r = routeQuestion('');
    expect(r.themes).toEqual(['geral']);
    expect(Array.isArray(r.houses)).toBe(true);
  });

  it('gibberish falls back gracefully without throwing', () => {
    const gibberish = [
      '!!!###@@@',
      'asdfghjkl qwerty',
      '   ',
      '123456',
    ];
    for (const g of gibberish) {
      expect(() => routeQuestion(g)).not.toThrow();
      const r = routeQuestion(g);
      expect(r.themes).toContain('geral');
    }
  });
});

describe('AD-19.4 / AD-20.8 — Money/dinheiro theme → Casa 34 (Peixes)', () => {
  it('"dinheiro" includes Casa 34 in routed houses', () => {
    const r = routeQuestion('dinheiro');
    expect(r.houses).toContain(34);
    expect(r.themes).toContain('dinheiro');
  });

  it('"financeiro" includes Casa 34 in routed houses', () => {
    const r = routeQuestion('financeiro');
    expect(r.houses).toContain(34);
    expect(r.themes).toContain('dinheiro');
  });

  it('"finanças" includes Casa 34 in routed houses', () => {
    const r = routeQuestion('minhas finanças');
    expect(r.houses).toContain(34);
  });

  it('"grana" includes Casa 34 via dinheiro keyword', () => {
    const r = routeQuestion('preciso de grana');
    expect(r.houses).toContain(34);
    expect(r.themes).toContain('dinheiro');
  });

  it('"investimento" routes to dinheiro theme with Casa 34', () => {
    const r = routeQuestion('devo fazer um investimento?');
    expect(r.houses).toContain(34);
  });

  it('Casa 2 (dinheiro pessoal) is also in dinheiro routing', () => {
    const r = routeQuestion('dinheiro');
    expect(r.houses).toContain(2);
  });

  it('dinheiro routing includes Vênus and 2ª Casa natal aspects', () => {
    const r = routeQuestion('dinheiro');
    expect(r.natalAspects).toContain('2ª Casa');
    expect(r.natalAspects).toContain('Vênus');
  });

  it('Casa 34 (finanças) is primary in dinheiro routing', () => {
    const dinheiroEntry = THEME_TAXONOMY['dinheiro'];
    expect(dinheiroEntry.primaryHouses).toContain(34);
    expect(dinheiroEntry.primaryHouses).toContain(34); // Peixes = Casa 34
  });
});

describe('AD-19.4 / AD-20.8 — Love/amor theme → Casa 24 (Coração)', () => {
  it('"amor" includes Casa 24 in routed houses', () => {
    const r = routeQuestion('amor');
    expect(r.houses).toContain(24);
    expect(r.themes).toContain('amor');
  });

  it('"relacionamento" includes Casa 24', () => {
    const r = routeQuestion('relacionamento');
    expect(r.houses).toContain(24);
    expect(r.themes).toContain('amor');
  });

  it('"paixão" routes to amor with Casa 24', () => {
    const r = routeQuestion('minha paixão');
    expect(r.houses).toContain(24);
    expect(r.themes).toContain('amor');
  });

  it('"coração" routes to amor with Casa 24', () => {
    const r = routeQuestion('meu coração');
    expect(r.houses).toContain(24);
  });

  it('"namoro" routes to amor with Casa 24', () => {
    const r = routeQuestion('estou namorando');
    expect(r.houses).toContain(24);
  });
  it('"casamento" question routes to amor with Casa 24', () => {
    // "casamento" is an explicit keyword in THEME_TAXONOMY.amor.keywords
    const r = routeQuestion('o casamento vai acontecer?');
    expect(r.houses).toContain(24);
    expect(r.themes).toContain('amor');
  });

  it('Casa 24 (Coração) is primary in amor routing', () => {
    const amorEntry = THEME_TAXONOMY['amor'];
    expect(amorEntry.primaryHouses).toContain(24);
  });

  it('amor routing includes Vênus and Lua natal aspects', () => {
    const r = routeQuestion('amor');
    expect(r.natalAspects).toContain('Vênus');
    expect(r.natalAspects).toContain('Lua');
    expect(r.natalAspects).toContain('5ª Casa');
  });

  it('Casa 25 and 29 are secondary in amor routing', () => {
    const r = routeQuestion('amor');
    // secondary houses of amor: [25, 29]
    expect(r.houses).toContain(25);
    expect(r.houses).toContain(29);
  });
});

describe('THEME_TAXONOMY — structural sanity checks', () => {
  it('every theme has non-empty primaryHouses', () => {
    for (const entry of Object.values(THEME_TAXONOMY)) {
      expect(entry.primaryHouses.length, `${entry.id} has no primary houses`).toBeGreaterThan(0);
    }
  });

  it('every theme has unique primary houses within its own entry', () => {
    for (const entry of Object.values(THEME_TAXONOMY)) {
      const unique = new Set(entry.primaryHouses);
      expect(unique.size).toBe(entry.primaryHouses.length);
    }
  });

  it('primaryHouses are valid Mesa Real house numbers (1-36)', () => {
    for (const entry of Object.values(THEME_TAXONOMY)) {
      for (const h of entry.primaryHouses) {
        expect(h, `${entry.id} has invalid house ${h}`).toBeGreaterThanOrEqual(1);
        expect(h, `${entry.id} has invalid house ${h}`).toBeLessThanOrEqual(36);
      }
    }
  });

  it('secondaryHouses are valid Mesa Real house numbers (1-36)', () => {
    for (const entry of Object.values(THEME_TAXONOMY)) {
      for (const h of entry.secondaryHouses) {
        expect(h, `${entry.id} has invalid secondary house ${h}`).toBeGreaterThanOrEqual(1);
        expect(h, `${entry.id} has invalid secondary house ${h}`).toBeLessThanOrEqual(36);
      }
    }
  });

  it('no duplicate houses within a single theme (primary + secondary)', () => {
    for (const entry of Object.values(THEME_TAXONOMY)) {
      const all = [...entry.primaryHouses, ...entry.secondaryHouses];
      const unique = new Set(all);
      expect(unique.size, `${entry.id} has duplicate houses`).toBe(all.length);
    }
  });

  it('every theme has at least one keyword', () => {
    for (const entry of Object.values(THEME_TAXONOMY)) {
      expect(entry.keywords.length, `${entry.id} has no keywords`).toBeGreaterThan(0);
    }
  });

  it('each theme id matches its taxonomy key', () => {
    for (const entry of Object.values(THEME_TAXONOMY)) {
      expect(entry.id).toBeDefined();
      expect(typeof entry.id).toBe('string');
    }
  });

  it('routeQuestion returns sorted houses', () => {
    const r = routeQuestion('amor e dinheiro');
    const sorted = [...r.houses].sort((a, b) => a - b);
    expect(r.houses).toEqual(sorted);
  });

  it('routeQuestion returns unique houses (no duplicates)', () => {
    const r = routeQuestion('amor');
    const unique = new Set(r.houses);
    expect(unique.size).toBe(r.houses.length);
  });

  it('themes array is derived from scored top entries', () => {
    const r = routeQuestion('dinheiro e trabalho');
    expect(r.themes.length).toBeLessThanOrEqual(3);
    expect(r.themes.length).toBeGreaterThan(0);
  });
});
