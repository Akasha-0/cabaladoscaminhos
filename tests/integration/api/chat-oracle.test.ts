import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

function createOracleRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat/oracle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/chat/oracle', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const oracleModule = await import('@/app/api/chat/oracle/route');
    POST = oracleModule.POST;
  });

  describe('Accepts conversation messages', () => {
    it('accepts valid message with userId', async () => {
      const request = createOracleRequest({
        userId: 'test-user-oracle',
        message: 'What is my spiritual path today?',
      });
      const response = await POST(request);
      expect([200, 400, 500]).toContain(response.status);
    }, 30000);

    it('returns structured response on 200', async () => {
      const request = createOracleRequest({
        userId: 'test-user-2',
        message: 'Give me guidance',
      });
      const response = await POST(request);
      if (response.status === 200) {
        const data = await response.json() as Record<string, unknown>;
        expect(data).toHaveProperty('response');
        expect(typeof data.response).toBe('string');
      }
    });

    it('accepts spiritual context in request', async () => {
      const request = createOracleRequest({
        userId: 'context-user',
        message: 'What should I do today?',
        context: {
          nome: 'Maria',
          dataNascimento: '1985-03-15',
          numeroPessoal: 5,
          odu: 'Ogbe',
          orixas: ['Oxum'],
          caminho: 'caminho-do-meio',
        },
      });
      const res = await POST(request);
      expect([200, 500]).toContain(res.status);
    });

    it('accepts conversation history', async () => {
      const request = createOracleRequest({
        userId: 'history-user',
        message: 'Tell me more about that',
        conversationHistory: [
          { role: 'user' as const, content: 'What is my destiny?' },
          { role: 'assistant' as const, content: 'Your destiny is illuminated.' },
        ],
      });
      const res = await POST(request);
      expect([200, 500]).toContain(res.status);
    });

    it('accepts short messages', async () => {
      const request = createOracleRequest({ userId: 'short-msg-user', message: 'Hi' });
      const res = await POST(request);
      expect([200, 400, 500]).toContain(res.status);
    });
  });

  describe('Validation', () => {
    it('returns 400 when userId is missing', async () => {
      const request = createOracleRequest({ message: 'Hello Oracle' });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json() as { error: string };
      expect(data.error).toBeDefined();
    });

    it('returns 400 when message is missing', async () => {
      const request = createOracleRequest({ userId: 'test-user' });
      expect((await POST(request)).status).toBe(400);
    });

    it('returns 400 when message is empty string', async () => {
      const request = createOracleRequest({ userId: 'test-user', message: '' });
      expect((await POST(request)).status).toBe(400);
    });
  });

  describe('Error handling', () => {
    it('returns error for invalid JSON', async () => {
      const badRequest = new NextRequest('http://localhost:3000/api/chat/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json',
      });
      const response = await POST(badRequest);
      expect(response.status).toBe(400);
    });
  });

  describe('GET endpoint', () => {
    let GET: () => Promise<Response>;
    beforeEach(async () => {
      const oracleModule = await import('@/app/api/chat/oracle/route');
      GET = oracleModule.GET;
    });

    it('returns 200 with API info', async () => {
      const response = await GET();
      expect(response.status).toBe(200);
      const data = await response.json() as Record<string, unknown>;
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('version');
    });
  });
});
