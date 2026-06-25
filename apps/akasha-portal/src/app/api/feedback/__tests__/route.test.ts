/**
 * @akasha/portal — POST /api/feedback tests (Wave 13.5)
 *
 * Cobertura:
 *   (a) Auth: sem cookie akasha_session → 401 Unauthorized.
 *   (b) Zod validation: body inválido → 400 invalid_body.
 *   (c) Happy path: POST com rating 'up' → 201 Created (upsert create).
 *   (d) Re-voto (mesma messageId): upsert atualiza → 200 OK com updated:true.
 *   (e) Comment opcional vazio → não vira null? undefined? não quebra.
 *   (f) LGPD: userId vem SEMPRE do auth, nunca do body (IDOR fix).
 *   (g) Rating 'down' também é aceito.
 *   (h) messageId > 128 chars → 400 (Zod max).
 *
 * Estratégia: mockar `requireAkashaApi` e `prisma.feedbackEntry.upsert`.
 * Não tocamos em DB real.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ─── Mocks de auth e prisma ────────────────────────────────────────────────

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

const upsertMock = vi.fn();
vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    feedbackEntry: {
      upsert: (...args: unknown[]) => upsertMock(...args),
    },
  },
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

function makeRequest(
  body: Record<string, unknown>,
  opts: { auth?: boolean; cookieToken?: string } = {}
): NextRequest {
  const { auth = true, cookieToken = 'valid-jwt' } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth) {
    headers['cookie'] = `akasha_session=${cookieToken}`;
  }
  return new NextRequest('http://localhost/api/feedback', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

/**
 * Mocka requireAkashaApi para retornar um user fixo OU um NextResponse 401.
 * IMPORTANTE: o handler faz `instanceof NextResponse` para detectar o
 * erro, então precisamos devolver o TIPO exato.
 */
function mockAuth(authenticated: boolean) {
  if (authenticated) {
    vi.mocked(requireAkashaApi).mockResolvedValue({
      id: 'user-test-123',
      email: 'test@example.com',
      name: 'Test User',
    });
  } else {
    vi.mocked(requireAkashaApi).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
  }
}

beforeEach(() => {
  upsertMock.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ─── Testes ────────────────────────────────────────────────────────────────

describe('POST /api/feedback — Wave 13.5', () => {
  it('(a) sem auth → 401 Unauthorized', async () => {
    mockAuth(false);
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(makeRequest({ messageId: 'm1', rating: 'up' }, { auth: false }));
    expect(res.status).toBe(401);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('(b) body sem rating → 400 invalid_body', async () => {
    mockAuth(true);
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(
      makeRequest({ messageId: 'm1' }) // sem rating
    );
    expect(res.status).toBe(400);
    const payload = (await res.json()) as { error: string };
    expect(payload.error).toBe('invalid_body');
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('(b2) rating inválido (não "up"/"down") → 400', async () => {
    mockAuth(true);
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(
      makeRequest({ messageId: 'm1', rating: 'maybe' })
    );
    expect(res.status).toBe(400);
  });

  it('(b3) messageId vazio → 400', async () => {
    mockAuth(true);
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(makeRequest({ messageId: '', rating: 'up' }));
    expect(res.status).toBe(400);
  });

  it('(b4) messageId > 128 chars → 400', async () => {
    mockAuth(true);
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(
      makeRequest({ messageId: 'x'.repeat(129), rating: 'up' })
    );
    expect(res.status).toBe(400);
  });

  it('(b5) comment > 500 chars → 400', async () => {
    mockAuth(true);
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(
      makeRequest({
        messageId: 'm1',
        rating: 'up',
        comment: 'a'.repeat(501),
      })
    );
    expect(res.status).toBe(400);
  });

  it('(c) happy path rating=up → 201 Created com entry novo', async () => {
    mockAuth(true);
    const now = new Date();
    upsertMock.mockResolvedValueOnce({
      id: 'entry-abc',
      rating: 'up',
      comment: null,
      createdAt: now,
      updatedAt: now,
    });
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(makeRequest({ messageId: 'm1', rating: 'up' }));
    expect(res.status).toBe(201);
    const payload = (await res.json()) as {
      ok: boolean;
      id: string;
      rating: string;
      updated: boolean;
    };
    expect(payload.ok).toBe(true);
    expect(payload.id).toBe('entry-abc');
    expect(payload.rating).toBe('up');
    expect(payload.updated).toBe(false);

    // Verifica que upsert foi chamado com userId do JWT (não do body)
    expect(upsertMock).toHaveBeenCalledTimes(1);
    const args = upsertMock.mock.calls[0]?.[0] as {
      where: { userId_messageId: { userId: string; messageId: string } };
      create: { userId: string; messageId: string; rating: string; comment: string | null };
    };
    expect(args.where.userId_messageId.userId).toBe('user-test-123'); // do JWT
    expect(args.where.userId_messageId.messageId).toBe('m1');
    expect(args.create.rating).toBe('up');
    expect(args.create.comment).toBeNull();
  });

  it('(d) re-voto (mesmo messageId) → atualiza → 200 com updated:true', async () => {
    mockAuth(true);
    // entry criada há 5 segundos = claramente antiga
    const oldDate = new Date(Date.now() - 5000);
    upsertMock.mockResolvedValueOnce({
      id: 'entry-abc',
      rating: 'down', // mudou de up para down
      comment: null,
      createdAt: oldDate,
      updatedAt: new Date(),
    });
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(makeRequest({ messageId: 'm1', rating: 'down' }));
    expect(res.status).toBe(200);
    const payload = (await res.json()) as { updated: boolean; rating: string };
    expect(payload.updated).toBe(true);
    expect(payload.rating).toBe('down');
  });

  it('(e) comment opcional vazio → comment null (não string vazia)', async () => {
    mockAuth(true);
    const now = new Date();
    upsertMock.mockResolvedValueOnce({
      id: 'entry-abc',
      rating: 'up',
      comment: null,
      createdAt: now,
      updatedAt: now,
    });
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(
      makeRequest({ messageId: 'm1', rating: 'up', comment: '' })
    );
    expect(res.status).toBe(201);
    const args = upsertMock.mock.calls[0]?.[0] as {
      create: { comment: string | null };
    };
    expect(args.create.comment).toBeNull();
  });

  it('(e2) comment com whitespace só → comment null', async () => {
    mockAuth(true);
    const now = new Date();
    upsertMock.mockResolvedValueOnce({
      id: 'entry-abc',
      rating: 'up',
      comment: null,
      createdAt: now,
      updatedAt: now,
    });
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(
      makeRequest({ messageId: 'm1', rating: 'up', comment: '   ' })
    );
    expect(res.status).toBe(201);
    const args = upsertMock.mock.calls[0]?.[0] as {
      create: { comment: string | null };
    };
    expect(args.create.comment).toBeNull();
  });

  it('(e3) comment válido → persistido', async () => {
    mockAuth(true);
    const now = new Date();
    upsertMock.mockResolvedValueOnce({
      id: 'entry-abc',
      rating: 'up',
      comment: 'Adorei!',
      createdAt: now,
      updatedAt: now,
    });
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(
      makeRequest({ messageId: 'm1', rating: 'up', comment: 'Adorei!' })
    );
    expect(res.status).toBe(201);
    const args = upsertMock.mock.calls[0]?.[0] as {
      create: { comment: string };
    };
    expect(args.create.comment).toBe('Adorei!');
  });

  it('(f) LGPD: userId do body é IGNORADO — sempre do JWT', async () => {
    mockAuth(true);
    const now = new Date();
    upsertMock.mockResolvedValueOnce({
      id: 'entry-abc',
      rating: 'up',
      comment: null,
      createdAt: now,
      updatedAt: now,
    });
    const { POST } = await import('@/app/api/feedback/route');
    // Tenta IDOR: userId malicioso no body
    await POST(
      makeRequest({
        messageId: 'm1',
        rating: 'up',
        userId: 'OTHER-USER-999',
      })
    );
    const args = upsertMock.mock.calls[0]?.[0] as {
      where: { userId_messageId: { userId: string } };
    };
    // Confirmado: o userId do body foi IGNORADO — só o do JWT conta
    expect(args.where.userId_messageId.userId).toBe('user-test-123');
    expect(args.where.userId_messageId.userId).not.toBe('OTHER-USER-999');
  });

  it('(g) rating=down também aceito', async () => {
    mockAuth(true);
    const now = new Date();
    upsertMock.mockResolvedValueOnce({
      id: 'entry-abc',
      rating: 'down',
      comment: null,
      createdAt: now,
      updatedAt: now,
    });
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(makeRequest({ messageId: 'm1', rating: 'down' }));
    expect(res.status).toBe(201);
    const args = upsertMock.mock.calls[0]?.[0] as {
      create: { rating: string };
    };
    expect(args.create.rating).toBe('down');
  });

  it('(i) erro de DB → 500 db_error', async () => {
    mockAuth(true);
    upsertMock.mockRejectedValueOnce(new Error('connection timeout'));
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(makeRequest({ messageId: 'm1', rating: 'up' }));
    expect(res.status).toBe(500);
    const payload = (await res.json()) as { error: string; details?: string };
    expect(payload.error).toBe('db_error');
    expect(payload.details).toContain('connection timeout');
  });

  it('(j) body não-JSON → 400', async () => {
    mockAuth(true);
    const req = new NextRequest('http://localhost/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: 'akasha_session=valid',
      },
      body: 'not json at all',
    });
    const { POST } = await import('@/app/api/feedback/route');
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
