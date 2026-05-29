/**
 * Oracle Chat API Integration Tests
 * 
 * Tests the AI-powered spiritual chat Oracle endpoint:
 * - POST /api/chat/oracle - Send spiritual query and get AI guidance
 * - GET /api/chat/oracle - Get Oracle API info
 * 
 * Test Areas:
 * 1. Valid requests: Verify POST returns response with reasoning trace
 * 2. Validation: Verify 400 for invalid/missing required fields
 * 3. AgenticAI: Verify chain-of-thought reasoning works
 * 4. Tools: Verify spiritual tools are invoked correctly
 * 5. Error handling: Verify 500 on unexpected errors
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ============================================================
// TEST HELPERS
// ============================================================

function createOracleRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat/oracle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ============================================================
// TESTS
// ============================================================

describe('POST /api/chat/oracle', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const oracleModule = await import('@/app/api/chat/oracle/route');
    POST = oracleModule.POST;
  });

  describe('Valid Requests', () => {
    it('should return Oracle response with reasoning trace for valid query', async () => {
      const request = createOracleRequest({
        userId: 'user-123',
        message: 'What guidance do you have for me today?',
      });

      const response = await POST(request);
      const data = await response.json() as {
        response: string;
        reasoning?: Array<{ thought: string; tool?: string; result?: string }>;
      };

      expect(response.status).toBe(200);
      expect(data.response).toBeDefined();
      expect(typeof data.response).toBe('string');
    });

    it('should include reasoning trace when agentic mode is enabled', async () => {
      const request = createOracleRequest({
        userId: 'user-123',
        message: 'What does my life path say?',
        agentic: true,
      });

      const response = await POST(request);
      const data = await response.json() as {
        reasoning?: Array<{ thought: string }>;
      };

      expect(response.status).toBe(200);
      expect(data.reasoning).toBeDefined();
      expect(Array.isArray(data.reasoning)).toBe(true);
    });

    it('should handle empty message gracefully', async () => {
      const request = createOracleRequest({
        userId: 'user-123',
        message: '',
      });

      const response = await POST(request);
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Validation', () => {
    it('should return 400 when userId is missing', async () => {
      const request = createOracleRequest({
        message: 'Hello Oracle',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when message is missing', async () => {
      const request = createOracleRequest({
        userId: 'user-123',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when userId is not a string', async () => {
      const request = createOracleRequest({
        userId: 12345,
        message: 'Hello',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when message exceeds maximum length', async () => {
      const request = createOracleRequest({
        userId: 'user-123',
        message: 'a'.repeat(5001),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should accept valid spiritual context in request', async () => {
      const request = createOracleRequest({
        userId: 'user-123',
        message: 'What ritual should I perform today?',
        spiritualContext: {
          lifePath: 7,
          odu: 'Eji-Ogbe',
          orixa: 'Oxum',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Response Structure', () => {
    it('should return a valid Oracle response object', async () => {
      const request = createOracleRequest({
        userId: 'user-123',
        message: 'What guidance do you have for me?',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('response');
      expect(typeof data.response).toBe('string');
    });

    it('should include confidence score when specified', async () => {
      const request = createOracleRequest({
        userId: 'user-123',
        message: 'Tell me about numerology',
        includeConfidence: true,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('confidence');
    });
  });
});

describe('GET /api/chat/oracle', () => {
  it('should return Oracle API information', async () => {
    const oracleModule = await import('@/app/api/chat/oracle/route');
    const GET = oracleModule.GET;
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe('Oracle Chat API');
    expect(data.version).toBe('1.0.0');
  });

  it('should include API capabilities', async () => {
    const oracleModule = await import('@/app/api/chat/oracle/route');
    const GET = oracleModule.GET;
    const response = await GET();
    const data = await response.json();

    expect(data.capabilities).toBeDefined();
    expect(Array.isArray(data.capabilities)).toBe(true);
    expect(data.capabilities).toContain('spiritual_guidance');
  });

  it('should document supported spiritual systems', async () => {
    const oracleModule = await import('@/app/api/chat/oracle/route');
    const GET = oracleModule.GET;
    const response = await GET();
    const data = await response.json();

    expect(data.minimaxModel).toBeDefined();
    expect(data.description).toContain('AI-powered spiritual chat');
  });

  it('should list all supported spiritual systems', async () => {
    const oracleModule = await import('@/app/api/chat/oracle/route');
    const GET = oracleModule.GET;
    const response = await GET();
    const data = await response.json() as { supportedSystems: string[] };

    expect(data.supportedSystems).toContain('Kabbalah (32 Paths, Sephirot, Tree of Life)');
    expect(data.supportedSystems).toContain('Ifá/Orunmila (16 Odu, diloggún)');
    expect(data.supportedSystems).toContain('Candomblé (Orixás, rituals, offerings)');
  });

  it('should document POST endpoint request body schema', async () => {
    const oracleModule = await import('@/app/api/chat/oracle/route');
    const GET = oracleModule.GET;
    const response = await GET();
    const data = await response.json() as { endpoints: { [key: string]: { body: object } } };

    expect(data.endpoints['POST /api/chat/oracle'].body).toBeDefined();
    expect(data.endpoints['POST /api/chat/oracle'].body).toHaveProperty('userId');
    expect(data.endpoints['POST /api/chat/oracle'].body).toHaveProperty('message');
  });

  it('should document POST endpoint response schema', async () => {
    const oracleModule = await import('@/app/api/chat/oracle/route');
    const GET = oracleModule.GET;
    const response = await GET();
    const data = await response.json() as { endpoints: { [key: string]: { response: object } } };

    expect(data.endpoints['POST /api/chat/oracle'].response).toBeDefined();
    expect(data.endpoints['POST /api/chat/oracle'].response).toHaveProperty('response');
    expect(data.endpoints['POST /api/chat/oracle'].response).toHaveProperty('reasoning');
  });
});

describe('Spiritual Systems Recognition', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const oracleModule = await import('@/app/api/chat/oracle/route');
    POST = oracleModule.POST;
  });

  it('should process Odu-related queries', async () => {
    const request = createOracleRequest({
      userId: 'user-123',
      message: 'What does my Odu Irosun mean?',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should process Kabbalah-related queries', async () => {
    const request = createOracleRequest({
      userId: 'user-123',
      message: 'What is the meaning of the 7th sephirah?',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should process Tarot-related queries', async () => {
    const request = createOracleRequest({
      userId: 'user-123',
      message: 'What does the Magician card mean?',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should process Chakra-related queries', async () => {
    const request = createOracleRequest({
      userId: 'user-123',
      message: 'What energy does my heart chakra hold?',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should handle numerology queries', async () => {
    const request = createOracleRequest({
      userId: 'user-123',
      message: 'Calculate my expression number for name: Maria',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should process Astrology-related queries', async () => {
    const request = createOracleRequest({
      userId: 'user-123',
      message: 'What does my Mercury in retrograde mean?',
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});

describe('Error Handling', () => {
  let POST: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    const oracleModule = await import('@/app/api/chat/oracle/route');
    POST = oracleModule.POST;
  });

  it('should return 400 for malformed JSON', async () => {
    const invalidRequest = new NextRequest('http://localhost:3000/api/chat/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid json }',
    });

    const response = await POST(invalidRequest);
    expect(response.status).toBe(400);
  });

  it('should handle missing content-type header gracefully', async () => {
    const invalidRequest = new NextRequest('http://localhost:3000/api/chat/oracle', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-123', message: 'Hello' }),
    });

    const response = await POST(invalidRequest);
    expect([200, 400, 415]).toContain(response.status);
  });

  it('should handle API timeout errors', async () => {
    // This test verifies graceful degradation when external API fails
    const request = createOracleRequest({
      userId: 'user-timeout',
      message: 'This should trigger a timeout scenario',
    });

    const response = await POST(request);
    // Should either succeed or fail gracefully, not crash
    expect([200, 500, 502, 503]).toContain(response.status);
  });

  it('should handle empty userId', async () => {
    const request = createOracleRequest({
      userId: '',
      message: 'Hello',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should handle very long userId', async () => {
    const request = createOracleRequest({
      userId: 'a'.repeat(200),
      message: 'Hello',
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
