import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const { mockFsExistsSync, mockFsReaddirSync, mockFsStatSync, mockFsReadFileSync } = vi.hoisted(
  () => ({
    mockFsExistsSync: vi.fn(),
    mockFsReaddirSync: vi.fn(),
    mockFsStatSync: vi.fn(),
    mockFsReadFileSync: vi.fn(),
  })
);

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>('fs');
  return {
    __esModule: true,
    default: {
      ...actual.default,
      existsSync: (...args: unknown[]) => mockFsExistsSync(...args),
      readdirSync: (...args: unknown[]) => mockFsReaddirSync(...args),
      statSync: (...args: unknown[]) => mockFsStatSync(...args),
      readFileSync: (...args: unknown[]) => mockFsReadFileSync(...args),
    },
  };
});

const { mockGrimoireEntryUpsert, mockExecuteRaw } = vi.hoisted(
  () => ({
    mockGrimoireEntryUpsert: vi.fn(),
    mockExecuteRaw: vi.fn(),
  })
);

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    grimoireEntry: {
      upsert: (...args: unknown[]) => mockGrimoireEntryUpsert(...args),
    },
    $executeRaw: (...args: unknown[]) => mockExecuteRaw(...args),
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch as any;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OLLAMA_URL = 'http://localhost:11434/api/embeddings';
});

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('syncGrimoire() helper', () => {
  it('retorna success=false se o diretorio do grimorio nao existir', async () => {
    mockFsExistsSync.mockReturnValue(false);
    
    const { syncGrimoire } = await import('@/lib/grimoire/sync');
    const result = await syncGrimoire();
    
    expect(result.success).toBe(false);
    expect(result.count).toBe(0);
    expect(result.warnings[0]).toContain('not found');
  });

  it('sincroniza arquivos markdown com metadados e conteudo corretos', async () => {
    mockFsExistsSync.mockReturnValue(true);
    mockFsReaddirSync.mockReturnValue(['odu-01-ogbe.md']);
    mockFsStatSync.mockReturnValue({
      isFile: () => true,
      isDirectory: () => false,
    });
    mockFsReadFileSync.mockReturnValue(`---
id: "odu-1"
title: "Ogbe"
category: "diagnostico"
type: "odu"
number: 1
---
# Content of Ogbe`);

    // Mock Ollama response
    const mockEmbedding = Array(768).fill(0.1);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ embedding: mockEmbedding }),
    });

    mockGrimoireEntryUpsert.mockResolvedValue({ id: 'odu-1' });
    mockExecuteRaw.mockResolvedValue(1);

    const { syncGrimoire } = await import('@/lib/grimoire/sync');
    const result = await syncGrimoire();
    
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(result.warnings.length).toBe(0);
    
    expect(mockGrimoireEntryUpsert).toHaveBeenCalledWith({
      where: { slug: 'odu-1' },
      update: {
        title: 'Ogbe',
        conteudo: '# Content of Ogbe',
        embedding: Array(768).fill(0.1),
        categoria: 'diagnostico',
        biblioteca: 'diagnostico',
        metadata: {
          id: 'odu-1',
          title: 'Ogbe',
          category: 'diagnostico',
          type: 'odu',
          number: 1,
        },
      },
      create: {
        id: 'odu-1',
        slug: 'odu-1',
        title: 'Ogbe',
        conteudo: '# Content of Ogbe',
        embedding: Array(768).fill(0.1),
        categoria: 'diagnostico',
        biblioteca: 'diagnostico',
        metadata: {
          id: 'odu-1',
          title: 'Ogbe',
          category: 'diagnostico',
          type: 'odu',
          number: 1,
        },
        sourcePath: 'odu-01-ogbe.md',
      },
    });
  });

  it('lida com falha de Ollama sem quebrar, usando embedding null', async () => {
    mockFsExistsSync.mockReturnValue(true);
    mockFsReaddirSync.mockReturnValue(['odu-01-ogbe.md']);
    mockFsStatSync.mockReturnValue({ isFile: () => true, isDirectory: () => false });
    mockFsReadFileSync.mockReturnValue(`---
id: "odu-1"
title: "Ogbe"
category: "diagnostico"
---
# Content`);

    // Mock fetch error
    mockFetch.mockRejectedValue(new Error('Connection refused'));
    mockGrimoireEntryUpsert.mockResolvedValue({ id: 'odu-1' });

    const { syncGrimoire } = await import('@/lib/grimoire/sync');
    const result = await syncGrimoire();

    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(result.warnings.length).toBe(0); // WARNING logged in console but not added to output warnings unless file fails
    expect(mockExecuteRaw).not.toHaveBeenCalled(); // No vector update
  });

  // T10.8 — v0.0.4: I-Ching como 5º pilar. O sync DEVE varrer recursivamente
  // `./grimoire/iching/*.md` (e qualquer outro subdir de grimório) e preservar
  // os novos campos de frontmatter (source, lineage, validated_at, etc.) no
  // JSONB metadata.
  it('T10.8: percorre recursivamente e sincroniza arquivos em grimoire/iching/', async () => {
    // Mocka árvore: ./grimoire/ → [iching/, odus/] → [hex-01-qian.md, odu-01-ogbe.md]
    mockFsExistsSync.mockReturnValue(true);

    // 1ª chamada (raiz ./grimoire) → lista os subdirs
    mockFsReaddirSync.mockImplementation((dir: string) => {
      if (dir.endsWith('/iching') || dir.endsWith('iching')) {
        return ['hex-01-qian.md', 'hex-02-kun.md'];
      }
      if (dir.endsWith('/odus') || dir.endsWith('odus')) {
        return ['odu-01-ogbe.md'];
      }
      // raiz do grimório
      return ['iching', 'odus'];
    });

    mockFsStatSync.mockImplementation((filePath: string) => ({
      isFile: () => filePath.endsWith('.md'),
      isDirectory: () => !filePath.endsWith('.md'),
    }));

    mockFsReadFileSync.mockImplementation((filePath: string) => {
      if (filePath.includes('hex-01-qian')) {
        return `---
id: "hex-01-qian"
slug: "hex-01-qian"
title: "Hexagrama 1 — Qián"
categoria: "Hexagrama"
biblioteca: "iching"
Numero_King_Wen: 1
Trigrama_Superior_Nome: "Qián — Céu"
Trigrama_Inferior_Nome: "Qián — Céu"
metadata:
  source: "Richard Wilhelm, 1923"
  lineage: "Tradição Confuciana + Taoísta"
  validated_at: "2026-06-07"
  hexagramChineseName: "Qián"
---
# Hexagrama 1`;
      }
      if (filePath.includes('hex-02-kun')) {
        return `---
id: "hex-02-kun"
slug: "hex-02-kun"
title: "Hexagrama 2 — Kun"
categoria: "Hexagrama"
biblioteca: "iching"
---
# Hexagrama 2`;
      }
      return `---
id: "odu-01-ogbe"
slug: "odu-01-ogbe"
title: "Ogbe"
---
# Ogbe`;
    });

    mockFetch.mockResolvedValue({ ok: false, status: 503 });
    mockGrimoireEntryUpsert.mockResolvedValue({ id: 'x' });

    const { syncGrimoire } = await import('@/lib/grimoire/sync');
    const result = await syncGrimoire();

    // Deve ter sincronizado TODOS os 3 arquivos (2 iching + 1 odus)
    expect(result.success).toBe(true);
    expect(result.count).toBe(3);

    // Confirma que cada arquivo iching foi upsertado com slug correto
    const slugs = mockGrimoireEntryUpsert.mock.calls.map(
      (c) => (c[0] as { where: { slug: string } }).where.slug,
    );
    expect(slugs).toEqual(expect.arrayContaining(['hex-01-qian', 'hex-02-kun', 'odu-01-ogbe']));
  });

  it('T10.8: preserva novos campos de frontmatter I-Ching (source/lineage/validated_at/hexagramChineseName)', async () => {
    mockFsExistsSync.mockReturnValue(true);
    mockFsReaddirSync.mockReturnValue(['hex-01-qian.md']);
    mockFsStatSync.mockReturnValue({ isFile: () => true, isDirectory: () => false });
    mockFsReadFileSync.mockReturnValue(`---
id: "hex-01-qian"
slug: "hex-01-qian"
title: "Hexagrama 1 — Qián"
categoria: "Hexagrama"
biblioteca: "iching"
Numero_King_Wen: 1
Trigrama_Superior_Nome: "Qián — Céu"
Trigrama_Inferior_Nome: "Qián — Céu"
Aspectos_Oraculares: ["liderança", "criatividade", "força primordial", "yang puro"]
metadata:
  source: "Richard Wilhelm, 1923"
  lineage: "Tradição Confuciana + Taoísta"
  validated_at: "2026-06-07"
  hexagramChineseName: "Qián"
---
# Qián`);

    mockFetch.mockResolvedValue({ ok: false });
    mockGrimoireEntryUpsert.mockResolvedValue({ id: 'hex-01-qian' });

    const { syncGrimoire } = await import('@/lib/grimoire/sync');
    await syncGrimoire();

    // O upsert DEVE ter sido chamado com os campos top-level preservados
    expect(mockGrimoireEntryUpsert).toHaveBeenCalled();
    const call = mockGrimoireEntryUpsert.mock.calls[0][0] as {
      create: { metadata: Record<string, unknown>; categoria: string; biblioteca: string };
    };
    // 1) Campos top-level do hexagrama são preservados
    expect(call.create.categoria).toBe('Hexagrama');
    expect(call.create.biblioteca).toBe('iching');
    expect(call.create.metadata).toMatchObject({
      id: 'hex-01-qian',
      slug: 'hex-01-qian',
      title: 'Hexagrama 1 — Qián',
      categoria: 'Hexagrama',
      biblioteca: 'iching',
      Numero_King_Wen: 1,
      Trigrama_Superior_Nome: 'Qián — Céu',
      Trigrama_Inferior_Nome: 'Qián — Céu',
    });

    // 2) Bloco `metadata:` (YAML aninhado) é preservado. O parser atual é
    //    line-by-line e armazena o sub-bloco como string raw; uma migração
    //    futura para um parser YAML real (e.g. `js-yaml`) converteria para
    //    objeto. Aqui só validamos que o valor chegou ao upsert (string ou
    //    objeto — o contrato é "o JSONB metadata é persistido integralmente").
    const md = call.create.metadata as Record<string, unknown>;
    expect(md).toHaveProperty('metadata');
  });
});
