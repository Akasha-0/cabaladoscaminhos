/**
 * Tests para o pipeline de consolidação (Wave 31.5).
 *
 * Estratégia: mocks in-memory (sem Prisma, sem DB). Cobre:
 *   1. distillClusters() — clustering heurístico
 *   2. consolidate() — pipeline completo (loader + storage + persistência)
 *   3. Idempotência — rodar 2x no mesmo anchor não duplica
 *   4. Normalização — anchor sempre é 1° do mês UTC
 *   5. Edge cases — sources vazias, < minClusterSize, sem keywords
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  consolidate,
  distillClusters,
  normalizeAnchor,
  firstOfMonth,
  InMemoryStorage,
  emptyLoader,
  computePilarCounts,
  dominantPilar,
  topKeywords,
  tokenize,
  computeKeywordFrequencies,
  type ConsolidationSource,
} from '../src/index.js';

// ─────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────

function makeSource(
  partial: Partial<ConsolidationSource> & { title: string }
): ConsolidationSource {
  return {
    type: partial.type ?? 'sessao_chunk',
    id: partial.id ?? `src-${Math.random().toString(36).slice(2, 8)}`,
    title: partial.title,
    content: partial.content ?? '',
    createdAt: partial.createdAt ?? new Date('2026-05-15T12:00:00Z'),
  };
}

/** 9 sources sobre Cabala com keywords em comum → 1 cluster Cabala. */
function buildCabalaSources(): ConsolidationSource[] {
  const titles = [
    'Cabala e a Árvore da Vida',
    'O caminho da Cabala e os Sefirot',
    'Reflexões sobre Cabala e Tree of Life',
    'Cabala: keter, chokhmah, binah',
    'Da Cabala ao Sefirot: meditação',
    'O pilar Cabala em consultas',
    'Cabala e a sefira daat',
    'Aprendendo Cabala: tree of life',
    'Meditação sobre a Árvore da Cabala',
  ];
  return titles.map((t, i) => makeSource({ title: t, id: `cab-${i}`, type: 'discovery' }));
}

/** 6 sources sobre Astrologia → 1 cluster Astrologia. */
function buildAstrologiaSources(): ConsolidationSource[] {
  const titles = [
    'Astrologia: sol em leão',
    'Astrologia e lua em cancer',
    'Astrologia venus e marte',
    'Mapa astral: sol e lua',
    'Astrologia: jupiter em sagitario',
    'Astrologia e saturno em aquario',
  ];
  return titles.map((t, i) => makeSource({ title: t, id: `ast-${i}`, type: 'discovery' }));
}

/** 3 sources sobre Tantra → 1 cluster Tantra. */
function buildTantraSources(): ConsolidationSource[] {
  const titles = [
    'Tantra e o chakra anahata',
    'Tantra: kundalini e muladhara',
    'Tantra e os chakras',
  ];
  return titles.map((t, i) => makeSource({ title: t, id: `tan-${i}`, type: 'discovery' }));
}

/** 2 sources sobre I Ching (abaixo do minClusterSize=3). */
function buildIchingSources(): ConsolidationSource[] {
  return [
    makeSource({ title: 'I Ching: hexagrama 1', id: 'ich-1' }),
    makeSource({ title: 'I Ching: trigrama qian', id: 'ich-2' }),
  ];
}

// ─────────────────────────────────────────────────────────────────────
// Tests — distillation
// ─────────────────────────────────────────────────────────────────────

describe('@akasha/memory/distillation', () => {
  describe('tokenize', () => {
    it('lowercase + remove accents + remove stopwords', () => {
      const tokens = tokenize('A Árvore da Vida e a Cabala — meditação sobre Keter');
      expect(tokens).toContain('arvore');
      expect(tokens).toContain('vida');
      expect(tokens).toContain('cabala');
      expect(tokens).toContain('meditacao');
      expect(tokens).toContain('keter');
      expect(tokens).not.toContain('a');
      expect(tokens).not.toContain('e');
      expect(tokens).not.toContain('da');
    });

    it('handles empty string', () => {
      expect(tokenize('')).toEqual([]);
    });
  });

  describe('computeKeywordFrequencies', () => {
    it('counts token frequency across texts', () => {
      const freq = computeKeywordFrequencies([
        'cabala cabala',
        'vida vida cabala',
      ]);
      expect(freq.get('cabala')).toBe(3);
      expect(freq.get('vida')).toBe(2);
    });
  });

  describe('topKeywords', () => {
    it('returns top-N sorted by frequency desc, min freq 2', () => {
      // Frequencies pré-tokenizadas (length >= 2 garantido).
      const freq = new Map([
        ['cabala', 5],
        ['vida', 3],
        ['once', 1], // filtered out (freq < 2)
        ['xyz', 1],  // filtered out (freq < 2)
      ]);
      const top = topKeywords(freq, 2);
      expect(top).toEqual(['cabala', 'vida']);
    });

    it('deterministic tiebreak: alphabetical', () => {
      const freq = new Map([
        ['zebra', 3],
        ['abacaxi', 3],
        ['manga', 3],
      ]);
      const top = topKeywords(freq, 3);
      expect(top).toEqual(['abacaxi', 'manga', 'zebra']);
    });
  });

  describe('computePilarCounts', () => {
    it('counts matches per pilar across sources', () => {
      const sources = buildCabalaSources().slice(0, 3);
      const counts = computePilarCounts(sources);
      // Cabala menciona 'cabala', 'tree', 'keter', etc → > 0
      expect(counts.cabala).toBeGreaterThan(0);
      // Outras pilares não são mencionadas nos títulos Cabala-puros
      expect(counts.tantrica).toBe(0);
    });
  });

  describe('dominantPilar', () => {
    it('returns pilar with highest count', () => {
      expect(
        dominantPilar({ cabala: 5, astrologia: 1, tantrica: 0, odus: 0, iching: 0 })
      ).toBe('cabala');
    });

    it('returns null when all counts are 0', () => {
      expect(
        dominantPilar({ cabala: 0, astrologia: 0, tantrica: 0, odus: 0, iching: 0 })
      ).toBeNull();
    });
  });

  describe('distillClusters', () => {
    it('groups sources by pilar + top keywords, returns ≥1 cluster', () => {
      const sources = [
        ...buildCabalaSources(),
        ...buildAstrologiaSources(),
        ...buildTantraSources(),
      ];
      const clusters = distillClusters(sources, { minClusterSize: 3, maxClusters: 5 });
      expect(clusters.length).toBeGreaterThanOrEqual(2);
      // Cada cluster tem theme human-legível
      for (const c of clusters) {
        expect(c.theme).toMatch(/^(Cabala|Astrologia|Tantrica|Odus|I-Ching)/);
      }
    });

    it('returns empty for sources below minClusterSize', () => {
      const sources = buildIchingSources(); // 2 sources
      const clusters = distillClusters(sources, { minClusterSize: 3 });
      expect(clusters).toEqual([]);
    });

    it('returns empty for empty input', () => {
      expect(distillClusters([])).toEqual([]);
    });

    it('caps clusters at maxClusters', () => {
      const sources = [
        ...buildCabalaSources(),
        ...buildAstrologiaSources(),
        ...buildTantraSources(),
      ];
      const clusters = distillClusters(sources, { minClusterSize: 3, maxClusters: 1 });
      expect(clusters.length).toBeLessThanOrEqual(1);
    });

    it('cluster includes pillarCounts and confidence 0..1', () => {
      const sources = buildCabalaSources();
      const clusters = distillClusters(sources, { minClusterSize: 3 });
      expect(clusters.length).toBeGreaterThanOrEqual(1);
      const c = clusters[0]!;
      expect(c.confidence).toBeGreaterThanOrEqual(0);
      expect(c.confidence).toBeLessThanOrEqual(1);
      expect(c.pilarCounts.cabala).toBeGreaterThan(0);
      expect(c.sources.length).toBeGreaterThanOrEqual(3);
    });

    it('is deterministic: same input → same output', () => {
      const sources = buildCabalaSources();
      const a = distillClusters(sources);
      const b = distillClusters(sources);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// Tests — consolidator (pipeline)
// ─────────────────────────────────────────────────────────────────────

describe('@akasha/memory/consolidator', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  it('produces insights persisted in storage', async () => {
    const sources = [...buildCabalaSources(), ...buildAstrologiaSources()];
    const loader = async () => sources;
    const out = await consolidate(
      {
        userId: 'user-1',
        workspaceId: 'personal',
        since: new Date('2026-05-01T00:00:00Z'),
      },
      storage,
      loader
    );
    expect(out.sourcesRead).toBe(sources.length);
    expect(out.clustersCreated).toBeGreaterThanOrEqual(1);
    const stored = await storage.listTop({
      userId: 'user-1',
      workspaceId: 'personal',
      limit: 10,
    });
    expect(stored.length).toBe(out.clustersCreated);
  });

  it('is idempotent: running twice in same anchor replaces, not duplicates', async () => {
    const sources = buildCabalaSources();
    const loader = async () => sources;
    const args = {
      userId: 'user-2',
      workspaceId: 'personal',
      since: new Date('2026-05-01T00:00:00Z'),
    };

    const first = await consolidate(args, storage, loader);
    const second = await consolidate(args, storage, loader);

    expect(second.clustersCreated).toBe(first.clustersCreated);
    const stored = await storage.listTop({
      userId: 'user-2',
      workspaceId: 'personal',
      limit: 100,
    });
    expect(stored.length).toBe(first.clustersCreated); // não duplicou
  });

  it('returns empty output when loader returns no sources', async () => {
    const out = await consolidate(
      {
        userId: 'user-3',
        workspaceId: 'personal',
        since: new Date('2026-05-01T00:00:00Z'),
      },
      storage,
      emptyLoader
    );
    expect(out.sourcesRead).toBe(0);
    expect(out.clustersCreated).toBe(0);
    expect(out.insights).toEqual([]);
  });

  it('normalizes anchorMonth to UTC midnight day 1', () => {
    const raw = new Date('2026-05-15T14:32:18.123Z');
    const norm = normalizeAnchor(raw);
    expect(norm.getUTCDate()).toBe(1);
    expect(norm.getUTCHours()).toBe(0);
    expect(norm.getUTCMinutes()).toBe(0);
    expect(norm.getUTCSeconds()).toBe(0);
    expect(norm.getUTCMilliseconds()).toBe(0);
  });

  it('firstOfMonth returns 1st UTC of the month', () => {
    const d = new Date('2026-07-31T23:59:59Z');
    const f = firstOfMonth(d);
    expect(f.toISOString()).toBe('2026-07-01T00:00:00.000Z');
  });

  it('different anchors create separate insight sets', async () => {
    const sources = buildCabalaSources();
    const loader = async () => sources;
    await consolidate(
      {
        userId: 'user-4',
        workspaceId: 'personal',
        since: new Date('2026-05-01T00:00:00Z'),
        anchorMonth: new Date('2026-05-01T00:00:00Z'),
      },
      storage,
      loader
    );
    await consolidate(
      {
        userId: 'user-4',
        workspaceId: 'personal',
        since: new Date('2026-06-01T00:00:00Z'),
        anchorMonth: new Date('2026-06-01T00:00:00Z'),
      },
      storage,
      loader
    );
    const stored = await storage.listTop({
      userId: 'user-4',
      workspaceId: 'personal',
      limit: 100,
    });
    // 2 anchors × N clusters cada → espera-se 2× clusters
    expect(stored.length).toBeGreaterThanOrEqual(2);
    const anchors = new Set(stored.map((s) => s.anchorMonth.toISOString().slice(0, 7)));
    expect(anchors.size).toBe(2);
  });

  it('respects workspaceId isolation', async () => {
    const sources = buildCabalaSources();
    const loader = async () => sources;
    await consolidate(
      {
        userId: 'user-5',
        workspaceId: 'workspace-a',
        since: new Date('2026-05-01T00:00:00Z'),
      },
      storage,
      loader
    );
    await consolidate(
      {
        userId: 'user-5',
        workspaceId: 'workspace-b',
        since: new Date('2026-05-01T00:00:00Z'),
      },
      storage,
      loader
    );
    const a = await storage.listTop({
      userId: 'user-5',
      workspaceId: 'workspace-a',
      limit: 100,
    });
    const b = await storage.listTop({
      userId: 'user-5',
      workspaceId: 'workspace-b',
      limit: 100,
    });
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
    // Nenhum vazou entre workspaces
    expect(a.every((s) => s.workspaceId === 'workspace-a')).toBe(true);
    expect(b.every((s) => s.workspaceId === 'workspace-b')).toBe(true);
  });

  it('respects minClusterSize override', async () => {
    const sources = buildCabalaSources(); // 9 sources
    const loader = async () => sources;
    const out = await consolidate(
      {
        userId: 'user-6',
        workspaceId: 'personal',
        since: new Date('2026-05-01T00:00:00Z'),
        minClusterSize: 20, // muito alto para 9 sources
      },
      storage,
      loader
    );
    expect(out.clustersCreated).toBe(0);
  });
});
