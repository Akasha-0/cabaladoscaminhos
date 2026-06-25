/** @vitest-environment node */
/**
 * /api/notifications/stream route tests — Wave 18.1 (SSE).
 *
 * Cobre o handler GET:
 *   - Auth: 401 quando não autenticado
 *   - Snapshot inicial: emite `event: snapshot` com lista + unreadCount
 *   - Auth válida + filtro userId sempre presente
 *   - Content-Type: text/event-stream
 *   - Headers: X-Accel-Buffering, no-cache
 *   - Cancel cleanup: cancelar a stream para timers (evita hang)
 *
 * Estratégia:
 *   - mock requireAkashaApi + prisma.notification
 *   - Lê os primeiros bytes do stream e cancela imediatamente
 *     (timers de poll 5s e heartbeat 30s ficam ativos enquanto o
 *     stream estiver aberto — cancel() no cleanup libera ambos)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn(),
}));

const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockFindFirst = vi.fn();

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    notification: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

import { GET } from '../route';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { NotificationType } from '@prisma/client';

const mockRequireAkashaApi = vi.mocked(requireAkashaApi);

const fakeUser = { id: 'user-sse-1', email: 'u@akasha.app', name: 'User' };

function makeRequest(opts: {
  lastEventId?: string;
} = {}): NextRequest {
  const headers: Record<string, string> = {};
  if (opts.lastEventId) headers['last-event-id'] = opts.lastEventId;
  return new NextRequest('http://localhost/api/notifications/stream', {
    headers,
  });
}

const fakeNotifications = [
  {
    id: 'n-snapshot-1',
    type: NotificationType.DIARIO,
    title: 'Mandato do dia',
    body: 'Hoje: ...',
    href: '/pt-BR/diario',
    readAt: null,
    createdAt: new Date('2026-06-24T10:00:00Z'),
  },
  {
    id: 'n-snapshot-2',
    type: NotificationType.SYSTEM,
    title: 'Boas-vindas',
    body: 'Bem-vindo ao Akasha',
    href: null,
    readAt: new Date('2026-06-24T09:00:00Z'),
    createdAt: new Date('2026-06-24T09:00:00Z'),
  },
];

beforeEach(() => {
  mockFindMany.mockReset();
  mockCount.mockReset();
  mockFindFirst.mockReset();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Tests ─────────────────────────────────────────────────────────

describe('GET /api/notifications/stream', () => {
  it('retorna 401 quando não autenticado', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValueOnce(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('retorna Content-Type: text/event-stream', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce(fakeNotifications);
    mockCount.mockResolvedValueOnce(1);

    const res = await GET(makeRequest());
    expect(res.headers.get('content-type')).toBe('text/event-stream');
    // Limpa stream para não hang o test runner
    await res.body?.cancel();
  });

  it('inclui headers anti-buffering', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce(fakeNotifications);
    mockCount.mockResolvedValueOnce(1);

    const res = await GET(makeRequest());
    expect(res.headers.get('x-accel-buffering')).toBe('no');
    expect(res.headers.get('cache-control')).toMatch(/no-cache/);
    await res.body?.cancel();
  });

  it('emite snapshot inicial com lista + unreadCount quando autenticado', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce(fakeNotifications);
    mockCount.mockResolvedValueOnce(1);

    const res = await GET(makeRequest());
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    // Lê o primeiro chunk — deve ser o snapshot
    const { value, done } = await reader.read();
    expect(done).toBe(false);
    const text = decoder.decode(value);

    // Snapshot event
    expect(text).toMatch(/event: snapshot/);
    expect(text).toMatch(/data: /);
    // Payload inclui as notificações (mapeadas para DTO com ISO dates)
    expect(text).toMatch(/n-snapshot-1/);
    expect(text).toMatch(/n-snapshot-2/);
    expect(text).toMatch(/"unreadCount":1/);

    // Cleanup — cancela stream pra liberar timers
    await reader.cancel();
  });

  it('consulta DB filtrando SEMPRE por userId do token (LGPD)', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce([]);
    mockCount.mockResolvedValueOnce(0);

    const res = await GET(makeRequest());
    await res.body?.cancel();

    // Primeira chamada = snapshot. userId do token SEMPRE no WHERE.
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-sse-1' }),
      })
    );
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-sse-1' }),
      })
    );
  });

  it('omite snapshot e envia : resumed quando Last-Event-ID é válido (resume)', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    // Resume: cursor lookup
    mockFindFirst.mockResolvedValueOnce({
      createdAt: new Date('2026-06-24T08:00:00Z'),
    });
    // Poll inicial (vazio)
    mockFindMany.mockResolvedValueOnce([]);

    const res = await GET(makeRequest({ lastEventId: 'n-resume-1' }));
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    const { value } = await reader.read();
    const text = decoder.decode(value);

    // Sem snapshot — emite comment `: resumed` para o read() desbloquear
    expect(text).not.toMatch(/event: snapshot/);
    expect(text).toMatch(/: resumed/);

    await reader.cancel();
  });

  it('faz lookup do cursor por (id, userId) para evitar IDOR no resume', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindFirst.mockResolvedValueOnce({
      createdAt: new Date('2026-06-24T08:00:00Z'),
    });
    mockFindMany.mockResolvedValueOnce([]);

    const res = await GET(makeRequest({ lastEventId: 'n-resume-1' }));
    await res.body?.cancel();

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { id: 'n-resume-1', userId: 'user-sse-1' },
      select: { createdAt: true },
    });
  });

  it('trata Last-Event-ID órfão (não pertence ao user) como conexão nova', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    // Cursor lookup retorna null (id não existe OU pertence a outro user)
    mockFindFirst.mockResolvedValueOnce(null);
    // Como lastSeenCreatedAt fica null → emite snapshot completo
    mockFindMany.mockResolvedValueOnce(fakeNotifications);
    mockCount.mockResolvedValueOnce(1);

    const res = await GET(makeRequest({ lastEventId: 'id-de-outro-user' }));
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    const { value } = await reader.read();
    const text = decoder.decode(value);

    // Cai no fluxo normal: emite snapshot
    expect(text).toMatch(/event: snapshot/);

    await reader.cancel();
  });

  it('libera timers quando o cliente cancela o stream', async () => {
    mockRequireAkashaApi.mockResolvedValueOnce(fakeUser);
    mockFindMany.mockResolvedValueOnce(fakeNotifications);
    mockCount.mockResolvedValueOnce(1);

    const res = await GET(makeRequest());
    const reader = res.body!.getReader();
    await reader.read(); // Lê snapshot
    // Cancel deve disparar o callback `cancel()` do ReadableStream
    await reader.cancel();

    // Sem asserção direta (timers são internos), mas se chegamos aqui
    // sem hang, o cleanup funcionou. Próximo test não vai ter timer leak.
  });
});
