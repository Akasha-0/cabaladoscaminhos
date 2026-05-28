/**
 * Integration Tests Setup
 * 
 * Configurações para testes de integração com mocking de rotas.
 * Usa mock de handlers para testar comportamento sem servidor.
 */

import { beforeAll, afterAll, vi } from 'vitest';

// ============================================
// Environment Setup
// ============================================

beforeAll(() => {
  // Configurar variáveis de ambiente para testes
  process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-bytes-long';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
});

afterAll(() => {
  // Limpar mocks após testes
  vi.clearAllMocks();
});

// ============================================
// Test Constants
// ============================================

export const TEST_USER = {
  id: 'test-user-cuid-123',
  email: 'test@example.com',
  password: 'valid-password',
  passwordHash: '$2a$10$mockhashpasswordhashpassword',
  nomeCompleto: 'Test User',
};

export const TEST_TOKEN_PAYLOAD = {
  userId: TEST_USER.id,
  email: TEST_USER.email,
};

// ============================================
// Route Path Constants
// ============================================

export const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/astrologia/mapa-natal',
  '/api/astrologia/transitos',
  '/api/numerologia',
  '/api/odus',
  '/api/ciclos',
];

export const PROTECTED_ROUTES = [
  '/api/chat/historico',
  '/api/chat/mensagem',
  '/api/creditos',
  '/api/creditos/adicionar',
  '/api/creditos/debitar',
  '/api/payments/checkout',
  '/api/payments/portal',
  '/api/insights/diario',
  '/api/webhooks/stripe',
];

// ============================================
// Helper Functions
// ============================================

export function createMockRequest(
  pathname: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  } = {}
) {
  const { method = 'GET', body, headers = {}, cookies = {} } = options;

  const cookieString = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');

  return {
    method,
    url: `http://localhost:3000${pathname}`,
    nextUrl: {
      pathname,
      searchParams: new URLSearchParams(),
    },
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
      ...(cookieString ? { cookie: cookieString } : {}),
    }),
    body: body ? JSON.stringify(body) : null,
    cookies: cookies,
  } as unknown;
}

export function getTestToken() {
  // This will be called in tests to generate a valid JWT
  return import('@/lib/auth-jwt').then(({ signToken }) =>
    signToken(TEST_TOKEN_PAYLOAD)
  );
}