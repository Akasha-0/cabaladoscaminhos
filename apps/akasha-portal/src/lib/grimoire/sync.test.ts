import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncGrimoire } from './sync';

// Create mock functions
const mockExistsSync = vi.fn();
const mockReaddirSync = vi.fn();
const mockReadFileSync = vi.fn();
const mockStatSync = vi.fn();
const mockResolve = vi.fn();
const mockRelative = vi.fn();
const mockJoin = vi.fn();
const mockMatter = vi.fn();

// Mock fs module with default export
vi.mock('fs', () => ({
  default: {
    existsSync: (...args: unknown[]) => mockExistsSync(...args),
    readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
    readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
    statSync: (...args: unknown[]) => mockStatSync(...args),
  },
  existsSync: (...args: unknown[]) => mockExistsSync(...args),
  readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
  readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
  statSync: (...args: unknown[]) => mockStatSync(...args),
}));

// Mock path module with default export
vi.mock('path', () => ({
  default: {
    resolve: (...args: unknown[]) => mockResolve(...args),
    relative: (...args: unknown[]) => mockRelative(...args),
    join: (...args: unknown[]) => mockJoin(...args),
  },
  resolve: (...args: unknown[]) => mockResolve(...args),
  relative: (...args: unknown[]) => mockRelative(...args),
  join: (...args: unknown[]) => mockJoin(...args),
}));

// Mock gray-matter with default export
vi.mock('gray-matter', () => ({
  default: (...args: unknown[]) => mockMatter(...args),
}));

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    grimoireEntry: {
      upsert: vi.fn(),
    },
  },
}));

describe('syncGrimoire', () => {
  const mockUpsert = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    mockResolve.mockImplementation((...args: string[]) => args.join('/'));
    mockRelative.mockImplementation((_from: string, to: string) => to);
    mockJoin.mockImplementation((...args: string[]) => args.join('/'));
    
    const { prisma } = await import('@/lib/infrastructure/prisma');
    vi.mocked(prisma.grimoireEntry.upsert).mockImplementation(mockUpsert);
    
    // Reset global fetch mock
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  describe('when grimoire directory does not exist', () => {
    it('should return success false with directory not found warning', async () => {
      mockExistsSync.mockReturnValue(false);

      const result = await syncGrimoire();

      expect(result.success).toBe(false);
      expect(result.count).toBe(0);
      expect(result.warnings.some(w => w.includes('Directory') && w.includes('not found'))).toBe(true);
    });
  });

  describe('when grimoire directory exists', () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
    });

    it('should sync markdown files successfully', async () => {
      mockReaddirSync.mockReturnValue(['test-note.md'] as unknown as import('fs').Dirent[]);
      mockStatSync.mockReturnValue({ isDirectory: () => false } as import('fs').Stats);
      mockReadFileSync.mockReturnValue('---\ntitle: Test Note\nslug: test-note\ncategory: wisdom\n---\n\nThis is test content.' as unknown as Buffer);
      mockMatter.mockReturnValue({
        data: { title: 'Test Note', slug: 'test-note', category: 'wisdom' },
        content: 'This is test content.',
      });

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        redirected: false,
        type: 'basic',
        url: 'http://localhost:11434/api/embeddings',
        body: null,
        bodyUsed: false,
        json: () => Promise.resolve({ embedding: [0.1, 0.2, 0.3] }),
      } as unknown as Response);

      const result = await syncGrimoire();

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
      expect(mockUpsert).toHaveBeenCalledTimes(1);
    });

    it('should handle Ollama offline gracefully', async () => {
      mockReaddirSync.mockReturnValue(['offline-test.md'] as unknown as import('fs').Dirent[]);
      mockStatSync.mockReturnValue({ isDirectory: () => false } as import('fs').Stats);
      mockReadFileSync.mockReturnValue('---\ntitle: Offline Test\n---\n\nContent without embedding.' as unknown as Buffer);
      mockMatter.mockReturnValue({
        data: { title: 'Offline Test' },
        content: 'Content without embedding.',
      });

      // Mock Ollama failure
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const result = await syncGrimoire();

      // When Ollama is offline, embedding is null but file still syncs
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should handle directory recursion', async () => {
      // First call returns a dir and a file, second call returns the file inside dir
      mockReaddirSync
        .mockReturnValueOnce(['subdir', 'root-note.md'] as unknown as import('fs').Dirent[])
        .mockReturnValueOnce(['nested-note.md'] as unknown as import('fs').Dirent[]);
      
      mockStatSync
        .mockReturnValueOnce({ isDirectory: () => true } as import('fs').Stats)
        .mockReturnValueOnce({ isDirectory: () => false } as import('fs').Stats)
        .mockReturnValueOnce({ isDirectory: () => false } as import('fs').Stats);

      mockReadFileSync
        .mockReturnValueOnce('---\ntitle: Root\n---\n\nRoot content' as unknown as Buffer)
        .mockReturnValueOnce('---\ntitle: Nested\n---\n\nNested content' as unknown as Buffer);

      mockMatter
        .mockReturnValueOnce({
          data: { title: 'Root' },
          content: 'Root content',
        })
        .mockReturnValueOnce({
          data: { title: 'Nested' },
          content: 'Nested content',
        });

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        redirected: false,
        type: 'basic',
        url: 'http://localhost:11434/api/embeddings',
        body: null,
        bodyUsed: false,
        json: () => Promise.resolve({ embedding: [0.1] }),
      } as unknown as Response);

      const result = await syncGrimoire();

      expect(result.count).toBe(2);
      expect(mockUpsert).toHaveBeenCalledTimes(2);
    });
  });
});
