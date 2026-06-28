// ============================================================================
// HOOKS — useAkashaStream (Wave 26 — Akasha IA Streaming)
// ===========================================================================
// Testa o consumer de SSE: tokens incrementais, abort, double-submit guard,
// error → retry.
// ===========================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import { useAkashaStream } from '@/hooks/use-akasha-stream';

// ─── Helpers ────────────────────────────────────────────────────────────────

interface SseEvent {
  event: string;
  data: unknown;
}

function makeSseBody(events: SseEvent[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const text = events
    .map(
      (e) =>
        `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`,
    )
    .join('');
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

function mockFetchStream(events: SseEvent[]) {
  global.fetch = vi.fn(async () => {
    return new Response(makeSseBody(events), {
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
    });
  }) as unknown as typeof fetch;
}

function mockFetchJsonError(status: number, body: unknown) {
  global.fetch = vi.fn(async () => {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useAkashaStream — happy path', () => {
  it('monta estado inicial idle', () => {
    const { result } = renderHook(() => useAkashaStream());
    expect(result.current.status).toBe('idle');
    expect(result.current.content).toBe('');
    expect(result.current.sources).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
  });

  it('consome tokens incrementais + done', async () => {
    mockFetchStream([
      { event: 'sources', data: { sources: [{ id: 'a', title: 'T', slug: 't', similarity: 0.9 }] } },
      { event: 'meta', data: { model: 'gpt-4o', rag_degraded: false } },
      { event: 'token', data: { content: 'Olá ' } },
      { event: 'token', data: { content: 'mundo' } },
      { event: 'done', data: { ok: true } },
    ]);

    const { result } = renderHook(() => useAkashaStream());

    act(() => {
      result.current.send({ message: 'oi' });
    });

    await waitFor(() => expect(result.current.status).toBe('done'));

    expect(result.current.content).toBe('Olá mundo');
    expect(result.current.sources).toHaveLength(1);
    expect(result.current.meta?.model).toBe('gpt-4o');
    expect(result.current.error).toBeNull();
    expect(result.current.isStreaming).toBe(false);
  });
});

describe('useAkashaStream — error handling', () => {
  it('marca error quando servidor retorna 4xx', async () => {
    mockFetchJsonError(429, {
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisições' },
    });

    const { result } = renderHook(() => useAkashaStream());

    act(() => {
      result.current.send({ message: 'oi' });
    });

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.error?.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(result.current.error?.status).toBe(429);
  });

  it('marca error quando evento `error` chega no meio do stream', async () => {
    mockFetchStream([
      { event: 'token', data: { content: 'parcial' } },
      { event: 'error', data: { message: 'CIRCUIT_OPEN' } },
    ]);

    const { result } = renderHook(() => useAkashaStream());

    act(() => {
      result.current.send({ message: 'oi' });
    });

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.content).toBe('parcial');
    expect(result.current.error?.message).toContain('CIRCUIT_OPEN');
  });
});

describe('useAkashaStream — guard de double-submit', () => {
  it('segunda chamada send() durante stream é no-op', async () => {
    let callCount = 0;
    global.fetch = vi.fn(async () => {
      callCount++;
      return new Response(makeSseBody([{ event: 'token', data: { content: 'ok' } }]), {
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
      });
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useAkashaStream());

    act(() => {
      result.current.send({ message: 'primeira' });
      result.current.send({ message: 'segunda' }); // deve ser no-op
      result.current.send({ message: 'terceira' }); // deve ser no-op
    });

    await waitFor(() => expect(result.current.status).toBe('done'));

    expect(callCount).toBe(1); // só UMA request saiu
  });
});

describe('useAkashaStream — abort', () => {
  it('reset() volta estado pra idle', async () => {
    mockFetchStream([
      { event: 'token', data: { content: 'algo' } },
      { event: 'done', data: { ok: true } },
    ]);

    const { result } = renderHook(() => useAkashaStream());

    act(() => {
      result.current.send({ message: 'oi' });
    });

    await waitFor(() => expect(result.current.status).toBe('done'));

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.content).toBe('');
  });
});