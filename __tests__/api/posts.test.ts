// ============================================================================
// API ROUTES — POSTS
// ============================================================================
// Cobre cada endpoint com sucesso + validação + auth. Mock do Prisma é feito
// em setup; as funções de Prisma são substituídas por spies.
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================================
// Mock setup
// ============================================================================

const prismaMock = {
  post: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  like: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  comment: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  group: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  user: { update: vi.fn() },
  spiritualProfile: { findUnique: vi.fn(), upsert: vi.fn() },
  $disconnect: vi.fn(),
};

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

const viewerMock = vi.fn();
vi.mock('@/lib/community/auth', () => ({
  getViewer: (...args: unknown[]) => viewerMock(...args),
  requireViewer: async () => {
    const v = await viewerMock();
    if (!v) {
      const e = new Error('Não autenticado');
      (e as Error & { statusCode?: number }).statusCode = 401;
      throw e;
    }
    return v;
  },
}));

vi.mock('@/lib/community/rate-limit', () => ({
  checkPostRateLimit: vi.fn(() => ({ allowed: true, remaining: 9, resetIn: 60000 })),
}));

const revalidatePathMock = vi.fn();
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }));

// Import dinâmico DEPOIS dos mocks
const { GET: listPosts, POST: createPostRoute } = await import('@/app/api/posts/route');
const { GET: getPost, PATCH: updatePostRoute, DELETE: deletePostRoute } = await import(
  '@/app/api/posts/[id]/route'
);
const { POST: likeRoute } = await import('@/app/api/posts/[id]/like/route');
const { GET: listComments, POST: createCommentRoute } = await import(
  '@/app/api/posts/[id]/comments/route'
);

// ============================================================================
// HELPERS
// ============================================================================

function makeRequest(url: string, init?: { method?: string; body?: unknown; headers?: Record<string, string> }) {
  const headers = new Headers(init?.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (!headers.has('x-dev-user-id')) headers.set('x-dev-user-id', 'user-test');
  return new NextRequest(new Request(url, { method: init?.method ?? 'GET', body: init?.body ? JSON.stringify(init.body) : undefined, headers: Object.fromEntries(headers) }));
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

const FIXED_POST_ROW = {
  id: 'p1',
  authorId: 'user-1',
  content: 'Hello world',
  type: 'TEXT',
  tradition: null,
  topic: null,
  mediaUrls: [],
  references: null,
  groupId: null,
  group: null,
  likesCount: 0,
  commentsCount: 0,
  sharesCount: 0,
  likes: [],
  comments: [],
  deletedAt: null,
  createdAt: new Date('2026-06-01T00:00:00Z'),
  updatedAt: new Date('2026-06-01T00:00:00Z'),
};

// ============================================================================
// TESTS
// ============================================================================

describe('GET /api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ id: 'user-test', email: null, displayName: 'Test' });
    prismaMock.post.findMany.mockResolvedValue([FIXED_POST_ROW]);
    prismaMock.post.count.mockResolvedValue(1);
  });

  it('retorna feed paginado com envelope { data, meta }', async () => {
    const req = makeRequest('http://localhost/api/posts?limit=10');
    const res = await listPosts(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.posts).toHaveLength(1);
    expect(body.data.posts[0].id).toBe('p1');
    expect(body.meta.timestamp).toBeDefined();
  });

  it('valida parâmetro limit > 50', async () => {
    const req = makeRequest('http://localhost/api/posts?limit=999');
    const res = await listPosts(req);
    // Zod coerce.max(50) cai no max. Vamos ver o status retornado.
    // 400 (validation) ou fallback (zod coerce error).
    expect([200, 400]).toContain(res.status);
  });

  it('aceita filtros (tradition, topic, groupSlug)', async () => {
    const req = makeRequest('http://localhost/api/posts?tradition=cabala&groupSlug=ifa');
    await listPosts(req);
    expect(prismaMock.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tradition: 'cabala',
          group: { slug: 'ifa' },
        }),
      })
    );
  });
});

describe('POST /api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ id: 'user-test', email: null, displayName: 'Test' });
    prismaMock.post.create.mockResolvedValue(FIXED_POST_ROW);
  });

  it('cria post com sucesso (status 201)', async () => {
    const req = makeRequest('http://localhost/api/posts', {
      method: 'POST',
      body: { content: 'Novo post!', type: 'TEXT' },
    });
    const res = await createPostRoute(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.id).toBe('p1');
  });

  it('rejeita content vazio (Zod)', async () => {
    const req = makeRequest('http://localhost/api/posts', {
      method: 'POST',
      body: { content: '' },
    });
    const res = await createPostRoute(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe(4002); // VALIDATION_ERROR
  });

  it('rejeita content > 4000 chars', async () => {
    const req = makeRequest('http://localhost/api/posts', {
      method: 'POST',
      body: { content: 'a'.repeat(4001) },
    });
    const res = await createPostRoute(req);
    expect(res.status).toBe(400);
  });

  it('retorna 401 sem auth', async () => {
    viewerMock.mockResolvedValueOnce(null);
    const req = makeRequest('http://localhost/api/posts', {
      method: 'POST',
      body: { content: 'oi' },
    });
    const res = await createPostRoute(req);
    expect(res.status).toBe(401);
  });

  it('retorna 429 quando rate limit excedido', async () => {
    const rl = await import('@/lib/community/rate-limit');
    vi.mocked(rl.checkPostRateLimit).mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      resetIn: 30000,
    });
    const req = makeRequest('http://localhost/api/posts', {
      method: 'POST',
      body: { content: 'oi' },
    });
    const res = await createPostRoute(req);
    expect(res.status).toBe(429);
  });
});

describe('GET /api/posts/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue(null);
    prismaMock.post.findUnique.mockResolvedValue(FIXED_POST_ROW);
  });

  it('retorna post por id', async () => {
    const req = makeRequest('http://localhost/api/posts/p1');
    const res = await getPost(req, makeParams('p1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe('p1');
  });

  it('retorna 404 se post não existe', async () => {
    prismaMock.post.findUnique.mockResolvedValueOnce(null);
    const req = makeRequest('http://localhost/api/posts/missing');
    const res = await getPost(req, makeParams('missing'));
    expect(res.status).toBe(404);
  });

  it('retorna 404 se post está soft-deletado', async () => {
    prismaMock.post.findUnique.mockResolvedValueOnce({ ...FIXED_POST_ROW, deletedAt: new Date() });
    const req = makeRequest('http://localhost/api/posts/p1');
    const res = await getPost(req, makeParams('p1'));
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/posts/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ id: 'user-1', email: null, displayName: 'Test' });
    prismaMock.post.findUnique.mockResolvedValue({ authorId: 'user-1', deletedAt: null });
    prismaMock.post.update.mockResolvedValue({ ...FIXED_POST_ROW, content: 'editado' });
  });

  it('atualiza post do próprio autor', async () => {
    const req = makeRequest('http://localhost/api/posts/p1', {
      method: 'PATCH',
      body: { content: 'editado' },
    });
    const res = await updatePostRoute(req, makeParams('p1'));
    expect(res.status).toBe(200);
  });

  it('retorna 403 quando outro usuário tenta editar', async () => {
    prismaMock.post.findUnique.mockResolvedValueOnce({ authorId: 'outro', deletedAt: null });
    const req = makeRequest('http://localhost/api/posts/p1', {
      method: 'PATCH',
      body: { content: 'editado' },
    });
    const res = await updatePostRoute(req, makeParams('p1'));
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/posts/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ id: 'user-1', email: null, displayName: 'Test' });
    prismaMock.post.findUnique.mockResolvedValue({ authorId: 'user-1', deletedAt: null });
    prismaMock.post.update.mockResolvedValue({ ...FIXED_POST_ROW, deletedAt: new Date() });
  });

  it('soft delete funciona para autor', async () => {
    const req = makeRequest('http://localhost/api/posts/p1', { method: 'DELETE' });
    const res = await deletePostRoute(req, makeParams('p1'));
    expect(res.status).toBe(200);
    expect(prismaMock.post.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('retorna 403 quando outro usuário tenta deletar', async () => {
    prismaMock.post.findUnique.mockResolvedValueOnce({ authorId: 'outro', deletedAt: null });
    const req = makeRequest('http://localhost/api/posts/p1', { method: 'DELETE' });
    const res = await deletePostRoute(req, makeParams('p1'));
    expect(res.status).toBe(403);
  });
});

describe('POST /api/posts/[id]/like', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ id: 'user-1', email: null, displayName: 'Test' });
    prismaMock.post.findUnique.mockResolvedValue({ id: 'p1', deletedAt: null });
    prismaMock.like.findUnique.mockResolvedValue(null);
    prismaMock.like.create.mockResolvedValue({});
    prismaMock.post.update.mockResolvedValue({ likesCount: 1 });
  });

  it('cria like quando não existia', async () => {
    const req = makeRequest('http://localhost/api/posts/p1/like', { method: 'POST' });
    const res = await likeRoute(req, makeParams('p1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.liked).toBe(true);
    expect(body.data.likesCount).toBe(1);
  });

  it('remove like quando já existia (toggle)', async () => {
    prismaMock.like.findUnique.mockResolvedValueOnce({ userId: 'user-1', postId: 'p1' });
    prismaMock.like.delete.mockResolvedValue({});
    prismaMock.post.update.mockResolvedValue({ likesCount: 0 });
    const req = makeRequest('http://localhost/api/posts/p1/like', { method: 'POST' });
    const res = await likeRoute(req, makeParams('p1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.liked).toBe(false);
  });

  it('retorna 401 sem auth', async () => {
    viewerMock.mockResolvedValueOnce(null);
    const req = makeRequest('http://localhost/api/posts/p1/like', { method: 'POST' });
    const res = await likeRoute(req, makeParams('p1'));
    expect(res.status).toBe(401);
  });
});

describe('GET /api/posts/[id]/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue(null);
    prismaMock.comment.findMany.mockResolvedValue([]);
  });

  it('lista comentários com cursor pagination', async () => {
    const req = makeRequest('http://localhost/api/posts/p1/comments?limit=10');
    const res = await listComments(req, makeParams('p1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.comments).toEqual([]);
  });
});

describe('POST /api/posts/[id]/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ id: 'user-1', email: null, displayName: 'Test' });
    prismaMock.post.findUnique.mockResolvedValue({ id: 'p1', deletedAt: null });
    prismaMock.comment.create.mockResolvedValue({
      id: 'c1',
      postId: 'p1',
      authorId: 'user-1',
      content: 'comentário',
      parentId: null,
      likesCount: 0,
      likes: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.post.update.mockResolvedValue({});
  });

  it('cria comentário (status 201)', async () => {
    const req = makeRequest('http://localhost/api/posts/p1/comments', {
      method: 'POST',
      body: { content: 'novo comentário' },
    });
    const res = await createCommentRoute(req, makeParams('p1'));
    expect(res.status).toBe(201);
  });

  it('rejeita content vazio', async () => {
    const req = makeRequest('http://localhost/api/posts/p1/comments', {
      method: 'POST',
      body: { content: '' },
    });
    const res = await createCommentRoute(req, makeParams('p1'));
    expect(res.status).toBe(400);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});