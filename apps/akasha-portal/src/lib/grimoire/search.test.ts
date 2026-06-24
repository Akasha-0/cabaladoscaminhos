import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchGrimoireHybrid } from './search';
import type { KnowledgeEntry } from './search';

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
    grimoireEntry: {
      findMany: vi.fn(),
    },
  },
}));

const SAMPLE_ENTRY = (id: string, overrides: Partial<KnowledgeEntry> = {}): KnowledgeEntry => ({
  id,
  slug: `slug-${id}`,
  title: `Title ${id}`,
  content: `Content for ${id}`,
  categoria: 'wisdom',
  metadata: {},
  embedding: [0.1, 0.2, 0.3],
  ...overrides,
});

describe('searchGrimoireHybrid', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    delete process.env.OLLAMA_URL;
    delete process.env.OLLAMA_EMBEDDING_MODEL;
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    delete process.env.OLLAMA_URL;
    delete process.env.OLLAMA_EMBEDDING_MODEL;
  });

  const prismaMock = () => import('@/lib/infrastructure/prisma').then(({ prisma }) => prisma);

  // ─── JSONB tag filter ───────────────────────────────────────────────────────

  describe('JSONB tag filter', () => {
    it('applies JSONB containment filter from query.tags', async () => {
      const rows: KnowledgeEntry[] = [SAMPLE_ENTRY('1'), SAMPLE_ENTRY('2')];
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(rows);

      const result = await searchGrimoireHybrid(
        { text: 'test', tags: { elemento: 'terra', fonte: 'ifá' }, limit: 10 },
        undefined
      );

      expect(prisma.$queryRaw).toHaveBeenCalledOnce();
      expect(result.entries).toHaveLength(2);
      expect(result.context.library).toBe('all');
    });

    it('uses filters.tags when query.tags is absent', async () => {
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([]);

      await searchGrimoireHybrid(
        { text: 'test', library: 'akasha' },
        { tags: { elemento: 'agua' } }
      );

      expect(prisma.$queryRaw).toHaveBeenCalledOnce();
    });

    it('returns context.library from query.library', async () => {
      const rows: KnowledgeEntry[] = [SAMPLE_ENTRY('1')];
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(rows);

      const result = await searchGrimoireHybrid({ text: 'peace', library: 'cabala' });

      expect(result.context.library).toBe('cabala');
    });
  });

  // ─── elemento fallback ──────────────────────────────────────────────────────

  describe('elemento fallback', () => {
    it('queries elemento-only when composite JSONB returns 0 rows', async () => {
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([]);
      vi.mocked(prisma.grimoireEntry.findMany).mockResolvedValueOnce([
        SAMPLE_ENTRY('fallback-1'),
        SAMPLE_ENTRY('fallback-2'),
      ] as never);

      const result = await searchGrimoireHybrid(
        { text: 'terra', tags: { elemento: 'terra' } }
      );

      expect(prisma.grimoireEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { metadata: { path: ['elemento'], equals: 'terra' } },
          take: 10,
        })
      );
      expect(result.entries).toHaveLength(2);
    });

    it('does NOT call findMany when composite JSONB returns rows', async () => {
      const rows: KnowledgeEntry[] = [SAMPLE_ENTRY('composite-match')];
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(rows);

      const result = await searchGrimoireHybrid(
        { text: 'fire', tags: { elemento: 'fogo' } }
      );

      expect(prisma.grimoireEntry.findMany).not.toHaveBeenCalled();
      expect(result.entries).toHaveLength(1);
    });

    it('returns empty when both composite and elemento fallback return 0', async () => {
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([]);
      vi.mocked(prisma.grimoireEntry.findMany).mockResolvedValueOnce([]);

      const result = await searchGrimoireHybrid(
        { text: 'unknown', tags: { elemento: 'none' } }
      );

      expect(result.entries).toHaveLength(0);
      expect(result.context.entries).toHaveLength(0);
    });
  });

  // ─── Ollama semantic re-ranking ───────────────────────────────────────────

  describe('Ollama semantic re-ranking', () => {
    it('skips semantic re-ranking when OLLAMA_URL is not set', async () => {
      const rows: KnowledgeEntry[] = [SAMPLE_ENTRY('1', { embedding: [0.1, 0.2] })];
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(rows);

      const result = await searchGrimoireHybrid({ text: 'wisdom' });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.entries).toHaveLength(1);
    });

    it('skips semantic re-ranking when text is empty', async () => {
      const rows: KnowledgeEntry[] = [SAMPLE_ENTRY('1')];
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(rows);

      await searchGrimoireHybrid({ text: '', library: 'all' });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('re-ranks by cosine similarity when Ollama returns embedding', async () => {
      // low-sim [1,0]: dot=1.0 cos=1.0 (perfect match to query [1,0])
      // high-sim [0.9,0.1]: dot=0.9, cos≈0.995 → ranks second
      const rows: KnowledgeEntry[] = [
        SAMPLE_ENTRY('high-sim', { embedding: [1.0, 0.0] }),
        SAMPLE_ENTRY('low-sim', { embedding: [0.9, 0.1] }),
      ];
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(rows);

      process.env.OLLAMA_URL = 'http://localhost:11434';
      process.env.OLLAMA_EMBEDDING_MODEL = 'nomic-embed-text';

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        redirected: false,
        type: 'basic',
        url: 'http://localhost:11434',
        body: null,
        bodyUsed: false,
        json: () => Promise.resolve({ embedding: [1.0, 0.0] }),
      } as unknown as Response);

      const result = await searchGrimoireHybrid({ text: 'test query' });

      expect(global.fetch).toHaveBeenCalledOnce();
      expect(result.entries[0].id).toBe('low-sim');   // cos=1.0 > high-sim ≈0.995
      expect(result.entries[1].id).toBe('high-sim');
    });

    it('falls through to JSONB results when Ollama fetch throws', async () => {
      const rows: KnowledgeEntry[] = [SAMPLE_ENTRY('db-result')];
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(rows);

      process.env.OLLAMA_URL = 'http://localhost:11434';
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Ollama offline'));

      const result = await searchGrimoireHybrid({ text: 'test' });

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].id).toBe('db-result');
    });

    it('falls through to JSONB results when Ollama returns non-ok', async () => {
      const rows: KnowledgeEntry[] = [SAMPLE_ENTRY('db-result')];
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(rows);

      process.env.OLLAMA_URL = 'http://localhost:11434';
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        redirected: false,
        type: 'basic',
        url: 'http://localhost:11434',
        body: null,
        bodyUsed: false,
      } as unknown as Response);

      const result = await searchGrimoireHybrid({ text: 'test' });

      expect(result.entries).toHaveLength(1);
    });

    it('filters out rows with mismatched embedding length during re-ranking', async () => {
      const rows: KnowledgeEntry[] = [
        SAMPLE_ENTRY('correct-dim', { embedding: [0.9, 0.1] }),
        SAMPLE_ENTRY('wrong-dim', { embedding: [0.1] }),
      ];
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(rows);

      process.env.OLLAMA_URL = 'http://localhost:11434';
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        redirected: false,
        type: 'basic',
        url: 'http://localhost:11434',
        body: null,
        bodyUsed: false,
        json: () => Promise.resolve({ embedding: [1.0, 0.0] }),
      } as unknown as Response);

      const result = await searchGrimoireHybrid({ text: 'test' });

      // wrong-dim (1-element embedding) filtered out; only correct-dim remains
      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].id).toBe('correct-dim');
    });
  });

  // ─── Error handling ────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('returns empty entries on $queryRaw throw', async () => {
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('DB connection failed'));

      const result = await searchGrimoireHybrid({ text: 'test' });

      expect(result.entries).toHaveLength(0);
      expect(result.context.entries).toHaveLength(0);
      expect(result.context.library).toBe('all');
    });

    it('returns empty entries when findMany fallback throws', async () => {
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([]);
      vi.mocked(prisma.grimoireEntry.findMany).mockRejectedValueOnce(
        new Error('Prisma findMany error')
      );

      const result = await searchGrimoireHybrid(
        { text: 'test', tags: { elemento: 'terra' } }
      );

      expect(result.entries).toHaveLength(0);
    });
  });

  // ─── limit parameter ────────────────────────────────────────────────────────

  describe('limit parameter', () => {
    it('accepts custom limit in query', async () => {
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([]);

      await searchGrimoireHybrid({ text: 'test', limit: 5 });

      expect(prisma.$queryRaw).toHaveBeenCalledOnce();
    });

    it('calls $queryRaw without limit (uses DB default) when limit absent', async () => {
      const prisma = await prismaMock();
            vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([]);

      await searchGrimoireHybrid({ text: 'test' });

      expect(prisma.$queryRaw).toHaveBeenCalledOnce();
    });
  });
});
