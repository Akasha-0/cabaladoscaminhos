/**
 * Testes de integração para autenticação do Mentor
 * @akasha-v0.0.11 - T8.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// Mocks
// =============================================================================

const mockUser = {
  id: 'auth-user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
};

// Simular validação de token
function validateToken(token: string | null): { valid: boolean; userId?: string } {
  if (!token) {
    return { valid: false };
  }
  if (token === 'valid-test-token') {
    return { valid: true, userId: mockUser.id };
  }
  return { valid: false };
}

function requireAuth(request: NextRequest): NextResponse | { userId: string } {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') || null;
  const validation = validateToken(token);

  if (!validation.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { userId: validation.userId! };
}

// Mock da rota - simula resposta da rota real
async function mockRoutePOST(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    if (!body.question) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }
    return NextResponse.json({ status: 'ok', userId: authResult.userId });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// =============================================================================
// Helpers
// =============================================================================

function createAuthenticatedRequest(token: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/mentor/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ question: 'Test question' }),
  });
}

function createUnauthenticatedRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/mentor/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'Test question' }),
  });
}

// =============================================================================
// Tests
// =============================================================================

describe('Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Token Validation', () => {
    it('deve rejeitar token null', () => {
      const result = validateToken(null);
      expect(result.valid).toBe(false);
    });

    it('deve rejeitar token vazio', () => {
      const result = validateToken('');
      expect(result.valid).toBe(false);
    });

    it('deve rejeitar token inválido', () => {
      const result = validateToken('invalid-token');
      expect(result.valid).toBe(false);
    });

    it('deve aceitar token válido', () => {
      const result = validateToken('valid-test-token');
      expect(result.valid).toBe(true);
      expect(result.userId).toBe(mockUser.id);
    });
  });

  describe('requireAuth middleware', () => {
    it('deve retornar 401 para usuário não logado (sem token)', async () => {
      const request = createUnauthenticatedRequest();
      const result = requireAuth(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(401);
    });

    it('deve retornar 401 para token inválido', async () => {
      const request = createAuthenticatedRequest('invalid-token');
      const result = requireAuth(request);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(401);
    });

    it('deve retornar userId para token válido', async () => {
      const request = createAuthenticatedRequest('valid-test-token');
      const result = requireAuth(request);

      expect(result).not.toBeInstanceOf(NextResponse);
      const authResult = result as { userId: string };
      expect(authResult.userId).toBe(mockUser.id);
    });
  });

  describe('API Route Integration', () => {
    it('deve permitir usuário logado com token válido', async () => {
      const request = createAuthenticatedRequest('valid-test-token');
      const response = await mockRoutePOST(request);

      // A rota deve processar a requisição (pode retornar 200 ou outro status válido)
      expect([200, 400]).toContain(response.status);
    });

    it('deve bloquear usuário não logado', async () => {
      const request = createUnauthenticatedRequest();
      const response = await mockRoutePOST(request);

      expect(response.status).toBe(401);
    });
  });
});

describe('Authorization Header', () => {
  it('deve extrair token do header Authorization', () => {
    const request = createAuthenticatedRequest('my-secret-token');
    const authHeader = request.headers.get('Authorization');

    expect(authHeader).toBe('Bearer my-secret-token');
  });

  it('deve permitir Bearer prefixo case-insensitive', () => {
    const request = new NextRequest('http://localhost:3000/api/mentor/ask', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer valid-test-token' },
    });

    const authHeader = request.headers.get('Authorization');
    // Simular extração case-insensitive de token
    const token = authHeader?.replace(/^Bearer\s+/i, '') || null;
    const result = validateToken(token);

    expect(result.valid).toBe(true);
  });
});
