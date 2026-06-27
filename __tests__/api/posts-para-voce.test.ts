// ============================================================================
// API ROUTES — POSTS — Filtro "Para voce" (recommendation engine)
// ============================================================================
// Cobre o caso `?filter=para-voce` em GET /api/posts:
//   - viewer autenticado com tradições seguidas → scoring aplicado
//   - viewer autenticado sem tradições → fallback (todos os posts, score 0)
//   - viewer NAO autenticado → fallback pro feed global (`filter=all`)
//   - post em grupo seguido → boost (+5)
//   - post curtido por alguem que o viewer segue → boost (+3)
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================================
// Mock setup (Prisma + viewer)
// ============================================================================

const prismaMock = {
  post: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  groupMember: {
    findMany: vi.fn(),
  },
  follow: {
    findMany: vi.fn(),
  },
  like: {
    findMany: vi.fn(),
  },
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

// Import dinâmico DEPOIS dos mocks
const { GET: listPosts } = await import('@/app/api/posts/route');

// ============================================================================
// HELPERS
// ============================================================================

function makeRequest(url: string, viewerId?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (viewerId) headers['x-dev-user-id'] = viewerId;
  return new NextRequest(new Request(url, { method: 'GET', headers }));
}

function makePost(overrides: {
  id: string;
  tradition?: string | null;
  topic?: string | null;
  groupId?: string | null;
  createdAt?: Date;
}) {
  return {
    id: overrides.id,
    authorId: 'author-x',
    content: `Post ${overrides.id}`,
    type: 'TEXT',
    tradition: overrides.tradition ?? null,
    topic: overrides.topic ?? null,
    mediaUrls: [],
    references: null,
    groupId: overrides.groupId ?? null,
    group: overrides.groupId ? { id: overrides.groupId, slug: `g-${overrides.groupId}` } : null,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    likes: [],
    comments: [],
    deletedAt: null,
    createdAt: overrides.createdAt ?? new Date('2026-06-01T00:00:00Z'),
    updatedAt: overrides.createdAt ?? new Date('2026-06-01T00:00:00Z'),
  };
}

const VIEWER_ID = 'viewer-1';

// ============================================================================
// 1) VIEWER AUTENTICADO, SEM TRADIÇÕES SEGUIDAS
// ============================================================================

describe('GET /api/posts?filter=para-voce — viewer sem tradições', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ id: VIEWER_ID, email: null, displayName: 'V' });
    // Nenhum grupo seguido, nenhum follow → só posts com score 0
    prismaMock.groupMember.findMany.mockResolvedValue([]);
    prismaMock.follow.findMany.mockResolvedValue([]);
    prismaMock.like.findMany.mockResolvedValue([]);
  });

  it('retorna 200 com posts do pool (todos com score 0, ordem cronológica)', async () => {
    const posts = [
      makePost({ id: 'p1', createdAt: new Date('2026-06-03T00:00:00Z') }),
      makePost({ id: 'p2', tradition: 'cabala', createdAt: new Date('2026-06-02T00:00:00Z') }),
      makePost({ id: 'p3', createdAt: new Date('2026-06-01T00:00:00Z') }),
    ];
    prismaMock.post.findMany.mockResolvedValue(posts);

    const req = makeRequest('http://localhost/api/posts?filter=para-voce', VIEWER_ID);
    const res = await listPosts(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.posts).toHaveLength(3);
    // Sem tradição seguida → todos com mesmo score (0) → ordem cronológica desc
    expect(body.data.posts.map((p: { id: string }) => p.id)).toEqual(['p1', 'p2', 'p3']);
    // Hook de recommendation engine foi chamado (groupMember + follow)
    expect(prismaMock.groupMember.findMany).toHaveBeenCalled();
    expect(prismaMock.follow.findMany).toHaveBeenCalled();
  });
});

// ============================================================================
// 2) VIEWER AUTENTICADO, COM TRADIÇÕES (via grupos seguidos)
// ============================================================================

describe('GET /api/posts?filter=para-voce — viewer com tradições seguidas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ id: VIEWER_ID, email: null, displayName: 'V' });
    // Viewer segue grupo "cabala" (group.id = "g-cabala", tradition = "cabala")
    prismaMock.groupMember.findMany.mockResolvedValue([
      { group: { id: 'g-cabala', tradition: 'cabala' } },
    ]);
    prismaMock.follow.findMany.mockResolvedValue([]);
    prismaMock.like.findMany.mockResolvedValue([]);
  });

  it('prioriza posts com tradição matching (cabala vem primeiro)', async () => {
    const posts = [
      makePost({ id: 'p-ifa', tradition: 'ifa', createdAt: new Date('2026-06-05T00:00:00Z') }),
      makePost({ id: 'p-cabala-1', tradition: 'cabala', createdAt: new Date('2026-06-04T00:00:00Z') }),
      makePost({ id: 'p-cabala-2', tradition: 'cabala', createdAt: new Date('2026-06-03T00:00:00Z') }),
      makePost({ id: 'p-tantra', tradition: 'tantra', createdAt: new Date('2026-06-06T00:00:00Z') }),
    ];
    prismaMock.post.findMany.mockResolvedValue(posts);

    const req = makeRequest('http://localhost/api/posts?filter=para-voce', VIEWER_ID);
    const res = await listPosts(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    const ids = body.data.posts.map((p: { id: string }) => p.id);
    // Posts cabala (score +10) vêm antes dos outros (score 0)
    expect(ids.indexOf('p-cabala-1')).toBeLessThan(ids.indexOf('p-ifa'));
    expect(ids.indexOf('p-cabala-2')).toBeLessThan(ids.indexOf('p-ifa'));
    expect(ids.indexOf('p-cabala-1')).toBeLessThan(ids.indexOf('p-tantra'));
  });
});

// ============================================================================
// 3) VIEWER NÃO AUTENTICADO → FALLBACK PRO FEED GLOBAL
// ============================================================================

describe('GET /api/posts?filter=para-voce — viewer anônimo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue(null); // sem auth
  });

  it('cai no feed global (mesma query de getFeed padrão)', async () => {
    const posts = [makePost({ id: 'p-anon-1', tradition: 'xamanismo' })];
    prismaMock.post.findMany.mockResolvedValue(posts);
    prismaMock.post.count.mockResolvedValue(1);

    const req = makeRequest('http://localhost/api/posts?filter=para-voce'); // sem header
    const res = await listPosts(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.posts).toHaveLength(1);
    expect(body.data.posts[0].id).toBe('p-anon-1');

    // Sem viewer, NÃO consulta o recommendation engine (groupMember/follow/like)
    expect(prismaMock.groupMember.findMany).not.toHaveBeenCalled();
    expect(prismaMock.follow.findMany).not.toHaveBeenCalled();
  });
});

// ============================================================================
// 4) POST EM GRUPO QUE O VIEWER SEGUE → +5
// ============================================================================

describe('GET /api/posts?filter=para-voce — boost de grupo seguido', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ id: VIEWER_ID, email: null, displayName: 'V' });
    // Viewer segue "g-cabala" mas NÃO é tradição de interesse no scoring aqui
    // (testamos o caso onde groupId bate mesmo sem tradição)
    prismaMock.groupMember.findMany.mockResolvedValue([
      { group: { id: 'g-cabala', tradition: 'cabala' } },
    ]);
    prismaMock.follow.findMany.mockResolvedValue([]);
    prismaMock.like.findMany.mockResolvedValue([]);
  });

  it('post em grupo que viewer segue sobe no ranking', async () => {
    const posts = [
      makePost({ id: 'p-sem-grupo', createdAt: new Date('2026-06-10T00:00:00Z') }),
      makePost({ id: 'p-em-grupo', groupId: 'g-cabala', createdAt: new Date('2026-06-01T00:00:00Z') }),
    ];
    prismaMock.post.findMany.mockResolvedValue(posts);

    const req = makeRequest('http://localhost/api/posts?filter=para-voce', VIEWER_ID);
    const res = await listPosts(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    const ids = body.data.posts.map((p: { id: string }) => p.id);
    // p-em-grupo tem score +5 (group match), p-sem-grupo tem 0 → grupo vem primeiro
    expect(ids[0]).toBe('p-em-grupo');
    expect(ids[1]).toBe('p-sem-grupo');
  });
});

// ============================================================================
// 5) SCORE COMBINADO — tradição + grupo seguido + like de seguido
// ============================================================================

describe('GET /api/posts?filter=para-voce — score combinado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ id: VIEWER_ID, email: null, displayName: 'V' });
    // Viewer segue grupo cabala (g-cabala)
    prismaMock.groupMember.findMany.mockResolvedValue([
      { group: { id: 'g-cabala', tradition: 'cabala' } },
    ]);
    // Viewer segue "author-y"
    prismaMock.follow.findMany.mockResolvedValue([{ followedId: 'author-y' }]);
    // "author-y" curtiu o post "p-combo"
    prismaMock.like.findMany.mockResolvedValue([{ postId: 'p-combo' }]);
  });

  it('combina pesos corretamente (10 + 5 + 3 = 18 > 10 > 5 > 0)', async () => {
    const posts = [
      // score 0: nada bate
      makePost({ id: 'p-zero', tradition: 'tantra', createdAt: new Date('2026-07-01T00:00:00Z') }),
      // score 5: só em grupo seguido (groupId match, mas tradição não)
      makePost({ id: 'p-grupo', groupId: 'g-cabala', tradition: 'tantra', createdAt: new Date('2026-07-01T00:00:00Z') }),
      // score 10: tradição matching (sem grupo match)
      makePost({ id: 'p-trad', tradition: 'cabala', createdAt: new Date('2026-07-01T00:00:00Z') }),
      // score 18: tradição (10) + grupo (5) + like de seguido (3)
      makePost({ id: 'p-combo', tradition: 'cabala', groupId: 'g-cabala', createdAt: new Date('2026-07-01T00:00:00Z') }),
    ];
    prismaMock.post.findMany.mockResolvedValue(posts);

    const req = makeRequest('http://localhost/api/posts?filter=para-voce', VIEWER_ID);
    const res = await listPosts(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    const ids = body.data.posts.map((p: { id: string }) => p.id);
    expect(ids).toEqual(['p-combo', 'p-trad', 'p-grupo', 'p-zero']);
  });

  it('respeita o limit (top N)', async () => {
    // 5 posts, todos com score 0 → ordem cronológica desc
    const posts = [
      makePost({ id: 'p-a', createdAt: new Date('2026-06-05T00:00:00Z') }),
      makePost({ id: 'p-b', createdAt: new Date('2026-06-04T00:00:00Z') }),
      makePost({ id: 'p-c', createdAt: new Date('2026-06-03T00:00:00Z') }),
      makePost({ id: 'p-d', createdAt: new Date('2026-06-02T00:00:00Z') }),
      makePost({ id: 'p-e', createdAt: new Date('2026-06-01T00:00:00Z') }),
    ];
    prismaMock.post.findMany.mockResolvedValue(posts);

    const req = makeRequest('http://localhost/api/posts?filter=para-voce&limit=3', VIEWER_ID);
    const res = await listPosts(req);
    const body = await res.json();
    expect(body.data.posts).toHaveLength(3);
    expect(body.data.posts.map((p: { id: string }) => p.id)).toEqual(['p-a', 'p-b', 'p-c']);
  });
});