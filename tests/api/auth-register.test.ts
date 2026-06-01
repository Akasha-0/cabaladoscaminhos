import { NextRequest } from 'next/server';

/**
 * Auth Register Endpoint Tests
 * 
 * Testa o endpoint de registro de novos usuários.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

// Import after mocking
import { createClient } from '@supabase/supabase-js';

// ============================================
// Test Helpers
// ============================================

function createRegisterRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ============================================
// Tests
// ============================================

describe('POST /api/auth/register', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const authModule = await import('@/app/api/auth/register/route');
    POST = authModule.POST;
  });

  describe('Successful registration', () => {
    it('retorna 200 quando registro é bem-sucedido com dados válidos', async () => {
      const mockUser = { id: 'user-123', email: 'teste@exemplo.com' };
      
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: mockUser },
              error: null,
            }),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        email: 'teste@exemplo.com',
        password: 'SenhaForte123!',
        nomeCompleto: 'João Silva',
        dataNascimento: '1990-01-15',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      const body = await response.json() as Record<string, unknown>;
      expect(body.success).toBe(true);
      expect(body.user).toHaveProperty('id');
      expect(body.user).toHaveProperty('email');
    });

    it('retorna dados corretos do usuário criado', async () => {
      const mockUser = { id: 'user-456', email: 'novo@exemplo.com' };
      
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: mockUser },
              error: null,
            }),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        email: 'novo@exemplo.com',
        password: 'SenhaForte123!',
        nomeCompleto: 'Maria Santos',
        dataNascimento: '1985-06-20',
      });

      const response = await POST(request);
      
      const body = await response.json() as { user: { id: string; email: string } };
      expect(body.user.id).toBe('user-456');
      expect(body.user.email).toBe('novo@exemplo.com');
    });
  });

  describe('Validation errors', () => {
    it('retorna 400 quando email está ausente', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        password: 'SenhaForte123!',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
      expect(body.error).toContain('obrigatórios');
    });

    it('retorna 400 quando password está ausente', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        email: 'teste@exemplo.com',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
      expect(body.error).toContain('obrigatórios');
    });

    it('retorna 400 quando email e password estão ausentes', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: null,
            }),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        nomeCompleto: 'João Silva',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
    });
  });

  describe('Email format validation', () => {
    it('retorna erro quando email tem formato inválido', async () => {
      // Supabase retorna erro para email inválido
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Invalid email format' },
            }),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        email: 'email-invalido-sem-arroba',
        password: 'SenhaForte123!',
      });

      const response = await POST(request);
      
      // O route retorna erro do Supabase com status 400
      expect(response.status).toBe(400);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
    });

    it('retorna erro quando email está vazio', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Email inválido' },
            }),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        email: '',
        password: 'SenhaForte123!',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
    });

    it('retorna erro quando email não tem domínio', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'Invalid email' },
            }),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        email: 'usuario@',
        password: 'SenhaForte123!',
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
    });
  });

  describe('Duplicate email handling', () => {
    it('retorna erro apropriado quando email já está cadastrado', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: null },
              error: { message: 'User already registered' },
            }),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        email: 'ja-cadastrado@exemplo.com',
        password: 'SenhaForte123!',
      });

      const response = await POST(request);
      
      // O route retorna erro do Supabase
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
      expect(body.error && (body.error as string).toLowerCase()).toMatch(/registered|exist/);
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Edge cases', () => {
    it('retorna 500 quando Supabase lança exceção', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockRejectedValue(new Error('Connection failed')),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        email: 'teste@exemplo.com',
        password: 'SenhaForte123!',
      });

      const response = await POST(request);
      
      // Erro interno retorna 500
      expect(response.status).toBe(500);
      const body = await response.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
    });

    it('request sem Content-Type ainda funciona', async () => {
      const mockUser = { id: 'user-789', email: 'teste@exemplo.com' };
      
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockResolvedValue({
              data: { user: mockUser },
              error: null,
            }),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'teste@exemplo.com',
          password: 'SenhaForte123!',
        }),
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
    });

    it('não expõe dados sensíveis na resposta de erro', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          admin: {
            createUser: vi.fn().mockRejectedValue(new Error('Database error with password: super-secret')),
          },
        },
      } as unknown as ReturnType<typeof createClient>);

      const request = createRegisterRequest({
        email: 'teste@exemplo.com',
        password: 'SenhaForte123!',
      });

      const response = await POST(request);
      
      const body = await response.json() as Record<string, unknown>;
      const bodyStr = JSON.stringify(body);
      
      expect(bodyStr).not.toContain('super-secret');
      expect(bodyStr).not.toContain('password');
      expect(bodyStr).not.toContain('SenhaForte');
    });
  });
});
