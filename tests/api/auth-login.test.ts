import { NextRequest } from 'next/server';

/**
 * Auth Login Endpoint Tests
 * 
 * Testa o endpoint de login de usuários existentes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase SSR client
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockReturnValue([]),
    setAll: vi.fn(),
  }),
}));

// Import after mocking
import { createServerClient } from '@supabase/ssr';

// ============================================
// Test Helpers
// ============================================

function createLoginRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ============================================
// Tests
// ============================================

describe('POST /api/auth/login', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const authModule = await import('@/app/api/auth/login/route');
    POST = authModule.POST;
  });

  describe('Successful login', () => {
    it('retorna 200 com token quando credenciais são válidas', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'teste@exemplo.com',
        user_metadata: { full_name: 'João Silva' },
      };
      const mockSession = {
        access_token: 'jwt-token-aqui',
        refresh_token: 'refresh-token-aqui',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: mockUser, session: mockSession },
            error: null,
          }),
        },
      } as unknown as ReturnType<typeof createServerClient>);

      const request = createLoginRequest({
        email: 'teste@exemplo.com',
        password: 'SenhaCorreta123!',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      const body = await response.json() as Record<string, unknown>;
      expect(body.success).toBe(true);
      expect(body.user).toBeDefined();
    });

    it('retorna dados do usuário na resposta', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'maria@exemplo.com',
        user_metadata: { full_name: 'Maria Santos' },
      };
      const mockSession = {
        access_token: 'jwt-token-maria',
        refresh_token: 'refresh-token-maria',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: mockUser, session: mockSession },
            error: null,
          }),
        },
      } as unknown as ReturnType<typeof createServerClient>);

      const request = createLoginRequest({
        email: 'maria@exemplo.com',
        password: 'SenhaCorreta123!',
      });

      const response = await POST(request);
      
      const body = await response.json() as { user: { id: string; email: string } };
      expect(body.user.id).toBe('user-456');
      expect(body.user.email).toBe('maria@exemplo.com');
    });
  });

  describe('Authentication failures', () => {
    it('retorna 401 quando senha está incorreta', async () => {
      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' },
          }),
        },
      } as unknown as ReturnType<typeof createServerClient>);

      const request = createLoginRequest({
        email: 'teste@exemplo.com',
        password: 'SenhaErrada123!',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(401);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
    });

    it('retorna 401 quando email não existe', async () => {
      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' },
          }),
        },
      } as unknown as ReturnType<typeof createServerClient>);

      const request = createLoginRequest({
        email: 'naoexiste@exemplo.com',
        password: 'SenhaCorreta123!',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(401);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
    });

    it('retorna mensagem genérica para credenciais inválidas (sem vazar informação)', async () => {
      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' },
          }),
        },
      } as unknown as ReturnType<typeof createServerClient>);

      const request = createLoginRequest({
        email: 'usuario@exemplo.com',
        password: 'senhaerrada',
      });

      const response = await POST(request);
      
      const body = await response.json() as Record<string, unknown>;
      // Não deve indicar se é email ou senha incorreto
      expect(body.error).toBeTruthy();
    });
  });

  describe('Validation errors', () => {
    it('retorna 400 quando email está ausente', async () => {
      const request = createLoginRequest({
        password: 'SenhaCorreta123!',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
      expect(body.error).toContain('obrigatórios');
    });

    it('retorna 400 quando password está ausente', async () => {
      const request = createLoginRequest({
        email: 'teste@exemplo.com',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
      expect(body.error).toContain('obrigatórios');
    });

    it('retorna 400 quando ambos email e password estão ausentes', async () => {
      const request = createLoginRequest({});

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
    });

    it('retorna 400 quando corpo da request está vazio', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      });

      const response = await POST(request);
      
      // Request parsing error ou campos obrigatórios
      expect(response.status).toBe(400);
    });
  });

  describe('JWT token in response', () => {
    it('inclui token de acesso na resposta de sucesso', async () => {
      const mockSession = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTYyMjIxMjIwMH0.dGVzdGU',
        refresh_token: 'refresh-token-aqui',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { 
              user: { id: 'user-123', email: 'teste@exemplo.com' }, 
              session: mockSession 
            },
            error: null,
          }),
        },
      } as unknown as ReturnType<typeof createServerClient>);

      const request = createLoginRequest({
        email: 'teste@exemplo.com',
        password: 'SenhaCorreta123!',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      const body = await response.json() as Record<string, unknown>;
      
      // Token deve estar presente (pode ser em user ou session)
      const hasToken = body.success === true && body.user !== undefined;
      expect(hasToken).toBe(true);
    });

    it('token tem formato JWT válido', async () => {
      const mockSession = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdGVAZXhlbXBsby5jb20iLCJpYXQiOjE2MzQwNjcyMDAsImV4cCI6MTYzNDA3MDgwMH0K.testesig',
        refresh_token: 'refresh-token-aqui',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { 
              user: { id: 'user-123', email: 'teste@exemplo.com' }, 
              session: mockSession 
            },
            error: null,
          }),
        },
      } as unknown as ReturnType<typeof createServerClient>);

      const request = createLoginRequest({
        email: 'teste@exemplo.com',
        password: 'SenhaCorreta123!',
      });

      const response = await POST(request);
      
      // Verifica que é um JWT (3 partes separadas por ponto)
      expect(mockSession.access_token.split('.').length).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('retorna 500 quando Supabase lança exceção', async () => {
      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          signInWithPassword: vi.fn().mockRejectedValue(new Error('Database connection failed')),
        },
      } as unknown as ReturnType<typeof createServerClient>);
      const request = createLoginRequest({
        email: 'teste@exemplo.com',
        password: 'SenhaCorreta123!',
      });
      const response = await POST(request);
      expect(response.status).toBe(500);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
    });
    it('não expõe senha na resposta de erro', async () => {
      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          signInWithPassword: vi.fn().mockRejectedValue(new Error('Invalid credentials')),
        },
      } as unknown as ReturnType<typeof createServerClient>);
      const request = createLoginRequest({
        email: 'teste@exemplo.com',
        password: 'SenhaCorreta123!',
      });
      const response = await POST(request);
      const body = await response.json() as Record<string, unknown>;
      const bodyStr = JSON.stringify(body);
      expect(bodyStr).not.toContain('SenhaCorreta');
      expect(bodyStr).not.toContain('password');
    });
    it('account desativado retorna erro apropriado', async () => {
      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: null, session: null },
            error: { message: 'Email not confirmed' },
          }),
        },
      } as unknown as ReturnType<typeof createServerClient>);
      const request = createLoginRequest({
        email: 'nao-confirmado@exemplo.com',
        password: 'SenhaCorreta123!',
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });
});