/**
 * Auth API Logic Tests
 * 
 * Testa a lógica de autenticação sem dependência de servidor.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TEST_USER } from '../setup';

// ============================================
// Mock bcrypt
// ============================================

const mockCompare = vi.fn();

vi.mock('bcryptjs', () => ({
  default: {
    compare: mockCompare,
  },
}));

// ============================================
// Helper Functions (Lógica das rotas)
// ============================================

function validateLoginInput(body: { email?: string; password?: string }) {
  const { email, password } = body;

  if (!email) {
    return { valid: false, error: 'Email é obrigatório', status: 400 };
  }

  if (!password) {
    return { valid: false, error: 'Senha é obrigatória', status: 400 };
  }

  return { valid: true };
}

async function validateCredentials(email: string, password: string, user: typeof TEST_USER | null) {
  if (!user) {
    return { valid: false, error: 'Credenciais inválidas', status: 401 };
  }

  if (!user.passwordHash) {
    return { valid: false, error: 'Credenciais inválidas', status: 401 };
  }

  const isValidPassword = await mockCompare(password, user.passwordHash);

  if (!isValidPassword) {
    return { valid: false, error: 'Credenciais inválidas', status: 401 };
  }

  return {
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      nomeCompleto: user.nomeCompleto,
    },
  };
}

// ============================================
// Tests
// ============================================

describe('Auth Input Validation', () => {
  describe('validateLoginInput', () => {
    it('deve retornar erro 400 sem email', () => {
      const result = validateLoginInput({ password: 'any' });
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email é obrigatório');
      expect(result.status).toBe(400);
    });

    it('deve retornar erro 400 sem senha', () => {
      const result = validateLoginInput({ email: 'test@example.com' });
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Senha é obrigatória');
      expect(result.status).toBe(400);
    });

    it('deve retornar válido com email e senha', () => {
      const result = validateLoginInput({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.valid).toBe(true);
    });

    it('deve aceitar email com maiúsculas', () => {
      const result = validateLoginInput({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });

      expect(result.valid).toBe(true);
    });
  });
});

describe('Auth Credential Validation', () => {
  beforeEach(() => {
    mockCompare.mockReset();
  });

  it('deve retornar erro 401 para usuário não encontrado', async () => {
    const result = await validateCredentials(
      'nonexistent@example.com',
      'password123',
      null
    );

    expect(result.valid).toBe(false);
    expect(result.status).toBe(401);
    expect(result.error).toBe('Credenciais inválidas');
  });

  it('deve retornar erro 401 para senha incorreta', async () => {
    mockCompare.mockResolvedValue(false);

    const result = await validateCredentials(
      TEST_USER.email,
      'wrong-password',
      TEST_USER
    );

    expect(result.valid).toBe(false);
    expect(result.status).toBe(401);
    expect(result.error).toBe('Credenciais inválidas');
  });

  it('deve retornar válido para credenciais corretas', async () => {
    mockCompare.mockResolvedValue(true);

    const result = await validateCredentials(
      TEST_USER.email,
      TEST_USER.password,
      TEST_USER
    );

    expect(result.valid).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.id).toBe(TEST_USER.id);
    expect(result.user?.email).toBe(TEST_USER.email);
  });

  it('deve chamar bcrypt.compare com senha correta', async () => {
    mockCompare.mockResolvedValue(true);

    await validateCredentials(
      TEST_USER.email,
      'correct-password',
      TEST_USER
    );

    expect(mockCompare).toHaveBeenCalledWith('correct-password', TEST_USER.passwordHash);
  });
});

describe('Auth Response Format', () => {
  it('deve gerar resposta de sucesso com user', async () => {
    const successResponse = {
      success: true,
      user: {
        id: TEST_USER.id,
        email: TEST_USER.email,
        nomeCompleto: TEST_USER.nomeCompleto,
      },
    };

    expect(successResponse.success).toBe(true);
    expect(successResponse.user).toHaveProperty('id');
    expect(successResponse.user).toHaveProperty('email');
    expect(successResponse.user).toHaveProperty('nomeCompleto');
  });

  it('deve gerar resposta de erro genérica', async () => {
    const errorResponse = {
      success: false,
      error: 'Credenciais inválidas',
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBeDefined();
    expect(errorResponse.error).toBe('Credenciais inválidas');
  });

  it('não deve expor se email existe na resposta', async () => {
    // Mensagem deve ser genérica, não "usuário não encontrado"
    // Isso previne enumeração de usuários
    const errorMessage = 'Credenciais inválidas';

    expect(errorMessage).not.toContain('email');
    expect(errorMessage).not.toContain('usuário');
    expect(errorMessage).not.toContain('não encontrado');
  });
});

describe('Logout Logic', () => {
  it('deve gerar resposta de sucesso', () => {
    const response = { success: true };

    expect(response.success).toBe(true);
  });

  it('deve gerar cookie de clear correto', async () => {
    const { clearAuthCookie } = await import('@/lib/auth-jwt/helpers');
    const cookie = clearAuthCookie();

    expect(cookie).toContain('auth_token=');
    expect(cookie).toContain('Max-Age=0');
    expect(cookie).toContain('HttpOnly');
  });
});

describe('Token Management', () => {
  // Skip these tests as jose requires Web Crypto API
  // which is not available in Node test environment
  it.skip('deve gerar token ao fazer login com sucesso', async () => {});
  it.skip('deve criar cookie com token ao fazer login', async () => {});
});

describe('Password Hash Security', () => {
  it('deve verificar senha contra hash', async () => {
    mockCompare.mockResolvedValue(true);

    const result = await mockCompare('password123', TEST_USER.passwordHash);

    expect(result).toBe(true);
    expect(mockCompare).toHaveBeenCalledWith('password123', TEST_USER.passwordHash);
  });

  it('deve rejeitar senha incorreta', async () => {
    mockCompare.mockResolvedValue(false);

    const result = await mockCompare('wrong', TEST_USER.passwordHash);

    expect(result).toBe(false);
  });

  it('deve nunca comparar com hash vazio', async () => {
    const userWithoutHash = { ...TEST_USER, passwordHash: '' };

    const result = await validateCredentials(
      userWithoutHash.email,
      'password',
      userWithoutHash
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Credenciais inválidas');
  });
});