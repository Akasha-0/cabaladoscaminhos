import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/auth/operator-session', () => ({
  requireOperator: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    client: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/ai/llm-router', () => ({
  streamCompletion: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';
import { streamCompletion } from '@/lib/ai/llm-router';

const OPERATOR_MOCK = {
  id: 'op-1',
  email: 'op@test.com',
  name: 'Operator Name',
};

const CLIENT_MOCK = {
  id: 'client-123',
  fullName: 'Gabriel Letteriello Verão Neves',
  birthDate: new Date('1995-10-12T12:00:00.000Z'),
  birthTime: '14:30',
  birthCity: 'Campo Grande',
  birthState: 'MS',
  birthCountry: 'Brasil',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireOperator).mockResolvedValue(OPERATOR_MOCK as any);
});

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/operator/interpret-aspect', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-dev-operator-id': 'op-1',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/operator/interpret-aspect', () => {
  it('returns 401 when operator is not authenticated', async () => {
    vi.mocked(requireOperator).mockResolvedValueOnce(
      new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { status: 401 }) as any
    );

    const req = makePostRequest({
      clientId: 'client-123',
      aspectType: 'astrology',
      aspectKey: 'sun',
      aspectName: 'Sol em Escorpião',
      aspectValue: 'escorpio',
    });

    const { POST } = await import('@/app/api/operator/interpret-aspect/route');
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('returns 400 when required parameters are missing', async () => {
    const req = makePostRequest({
      clientId: 'client-123',
      // Missing aspectName and other fields
    });

    const { POST } = await import('@/app/api/operator/interpret-aspect/route');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Parâmetros inválidos');
  });

  it('returns 404 when client is not found', async () => {
    vi.mocked(prisma.client.findUnique).mockResolvedValueOnce(null);

    const req = makePostRequest({
      clientId: 'non-existent',
      aspectType: 'astrology',
      aspectKey: 'sun',
      aspectName: 'Sol em Escorpião',
      aspectValue: 'escorpio',
    });

    const { POST } = await import('@/app/api/operator/interpret-aspect/route');
    const res = await POST(req);

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain('Consulente não encontrado');
  });

  it('streams místico-tecnológico aspect interpretation successfully (SSE)', async () => {
    vi.mocked(prisma.client.findUnique).mockResolvedValueOnce(CLIENT_MOCK as any);

    // Mock streamCompletion to return chunks
    async function* mockStreamGenerator() {
      yield { content: 'Você possui uma profunda intuição.', done: false };
      yield { content: '\n*Conselho de Akasha: Siga seu instinto.*', done: false };
      yield { content: '', done: true };
    }
    vi.mocked(streamCompletion).mockReturnValueOnce(mockStreamGenerator() as any);

    const req = makePostRequest({
      clientId: 'client-123',
      aspectType: 'astrology',
      aspectKey: 'sun',
      aspectName: 'Sol em Escorpião',
      aspectValue: 'escorpio',
    });

    const { POST } = await import('@/app/api/operator/interpret-aspect/route');
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let resultText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resultText += decoder.decode(value);
    }

    const lines = resultText.split('\n').filter(Boolean);
    expect(lines.length).toBe(3);

    // First line data
    expect(lines[0]).toContain('data: {"content":"Você possui uma profunda intuição.","done":false}');
    // Second line data
    expect(lines[1]).toContain('data: {"content":"\\n*Conselho de Akasha: Siga seu instinto.*","done":false}');
    // Final line data
    expect(lines[2]).toContain('data: {"content":"","done":true}');
  });
});
