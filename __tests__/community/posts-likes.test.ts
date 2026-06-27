// ============================================================================
// COMMUNITY POSTS — Testes de toggleLike
// ============================================================================
// Foco em src/lib/community/posts.ts → função toggleLike:
//   - Adiciona like quando não existe
//   - Remove like quando já existe (toggle)
//   - Atualiza contador likesCount corretamente
//
// Mock strategy: Prisma mockado. Sem dependência de API route.
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ============================================================================
// Prisma mock
// ============================================================================

const postFindUnique = vi.fn();
const postUpdate = vi.fn();
const likeFindUnique = vi.fn();
const likeCreate = vi.fn();
const likeDelete = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findUnique: (...args: unknown[]) => postFindUnique(...args),
      update: (...args: unknown[]) => postUpdate(...args),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    like: {
      findUnique: (...args: unknown[]) => likeFindUnique(...args),
      create: (...args: unknown[]) => likeCreate(...args),
      delete: (...args: unknown[]) => likeDelete(...args),
    },
    comment: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    group: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}));

// Import dinâmico DEPOIS dos mocks
const { toggleLike } = await import('@/lib/community/posts');

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================================
// toggleLike — adiciona like
// ============================================================================

describe('toggleLike', () => {
  it('adiciona like quando não existe', async () => {
    // Post existe e não está deletado
    postFindUnique
      .mockResolvedValueOnce({ id: 'p1', deletedAt: null }) // lookup inicial
      .mockResolvedValueOnce({ likesCount: 1 }); // reload final

    // Like NÃO existe ainda
    likeFindUnique.mockResolvedValueOnce(null);

    const result = await toggleLike({ postId: 'p1', userId: 'u1' });

    expect(likeCreate).toHaveBeenCalledWith({
      data: { userId: 'u1', postId: 'p1' },
    });
    expect(likeDelete).not.toHaveBeenCalled();
    expect(postUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: { likesCount: { increment: 1 } },
      })
    );
    expect(result).toEqual({ liked: true, likesCount: 1 });
  });

  // ============================================================================
  // toggleLike — remove like (toggle off)
  // ============================================================================

  it('remove like quando já existe (toggle off)', async () => {
    postFindUnique
      .mockResolvedValueOnce({ id: 'p1', deletedAt: null }) // lookup inicial
      .mockResolvedValueOnce({ likesCount: 0 }); // reload final

    // Like JÁ existe
    likeFindUnique.mockResolvedValueOnce({ userId: 'u1', postId: 'p1' });

    const result = await toggleLike({ postId: 'p1', userId: 'u1' });

    expect(likeDelete).toHaveBeenCalledWith({
      where: { userId_postId: { userId: 'u1', postId: 'p1' } },
    });
    expect(likeCreate).not.toHaveBeenCalled();
    expect(postUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: { likesCount: { decrement: 1 } },
      })
    );
    expect(result).toEqual({ liked: false, likesCount: 0 });
  });

  // ============================================================================
  // toggleLike — likesCount atualiza corretamente após múltiplos toggles
  // ============================================================================

  it('atualiza likesCount corretamente em sequência de toggles', async () => {
    // Toggle 1: u1 adiciona like (count: 0 → 1)
    postFindUnique
      .mockResolvedValueOnce({ id: 'p1', deletedAt: null })
      .mockResolvedValueOnce({ likesCount: 1 });
    likeFindUnique.mockResolvedValueOnce(null);

    const r1 = await toggleLike({ postId: 'p1', userId: 'u1' });
    expect(r1).toEqual({ liked: true, likesCount: 1 });

    // Toggle 2: u1 remove like (count: 1 → 0)
    postFindUnique
      .mockResolvedValueOnce({ id: 'p1', deletedAt: null })
      .mockResolvedValueOnce({ likesCount: 0 });
    likeFindUnique.mockResolvedValueOnce({ userId: 'u1', postId: 'p1' });

    const r2 = await toggleLike({ postId: 'p1', userId: 'u1' });
    expect(r2).toEqual({ liked: false, likesCount: 0 });

    // Toggle 3: u1 adiciona novamente (count: 0 → 1)
    postFindUnique
      .mockResolvedValueOnce({ id: 'p1', deletedAt: null })
      .mockResolvedValueOnce({ likesCount: 1 });
    likeFindUnique.mockResolvedValueOnce(null);

    const r3 = await toggleLike({ postId: 'p1', userId: 'u1' });
    expect(r3).toEqual({ liked: true, likesCount: 1 });

    // 2 creates (toggle 1 e 3) + 1 delete (toggle 2)
    expect(likeCreate).toHaveBeenCalledTimes(2);
    expect(likeDelete).toHaveBeenCalledTimes(1);
  });
});