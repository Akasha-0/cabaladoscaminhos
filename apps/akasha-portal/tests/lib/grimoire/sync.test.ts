import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockFsExistsSync = vi.fn();
const mockFsReaddirSync = vi.fn();
const mockFsStatSync = vi.fn();
const mockFsReadFileSync = vi.fn();

vi.mock('fs', () => ({
  default: {
    existsSync: (...args: any[]) => mockFsExistsSync(...args),
    readdirSync: (...args: any[]) => mockFsReaddirSync(...args),
    statSync: (...args: any[]) => mockFsStatSync(...args),
    readFileSync: (...args: any[]) => mockFsReadFileSync(...args),
  },
}));

const mockGrimoireEntryUpsert = vi.fn();
const mockExecuteRaw = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    grimoireEntry: {
      upsert: (...args: any[]) => mockGrimoireEntryUpsert(...args),
    },
    $executeRaw: (...args: any[]) => mockExecuteRaw(...args),
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
        categoria: 'diagnostico',
        biblioteca: 'diagnostico',
        metadata: {
          id: 'odu-1',
          title: 'Ogbe',
          category: 'diagnostico',
          type: 'odu',
          number: 1,
        },
        conteudo: '# Content of Ogbe',
        sourcePath: expect.stringContaining('odu-01-ogbe.md'),
      },
      create: {
        id: 'odu-1',
        slug: 'odu-1',
        categoria: 'diagnostico',
        biblioteca: 'diagnostico',
        metadata: {
          id: 'odu-1',
          title: 'Ogbe',
          category: 'diagnostico',
          type: 'odu',
          number: 1,
        },
        conteudo: '# Content of Ogbe',
        sourcePath: expect.stringContaining('odu-01-ogbe.md'),
      },
    });

    expect(mockExecuteRaw).toHaveBeenCalled();
  });

  it('lida com falha de Ollama sem quebrar, usando embedding null', async () => {
    mockFsExistsSync.mockReturnValue(true);
    mockFsReaddirSync.mockReturnValue(['odu-01-ogbe.md']);
    mockFsStatSync.mockReturnValue({ isDirectory: () => false });
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
});
