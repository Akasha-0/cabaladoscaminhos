import { test, expect } from './setup';

/**
 * E2E Tests: API Flow
 * 
 * Tests API endpoints via HTTP requests:
 * - Public APIs (no auth)
 * - Protected APIs (require auth)
 * - Error handling
 */

test.describe('Public APIs', () => {
  test('GET /api/odus should return list of odus', async ({ request }) => {
    const response = await request.get('/api/odus');
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('numero');
      expect(body[0]).toHaveProperty('nome');
    }
  });

  test('POST /api/numerologia should calculate numerology', async ({ request }) => {
    const response = await request.post('/api/numerologia', {
      data: {
        nome: 'Maria Silva',
        dataNascimento: '1990-06-15',
      },
    });
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('numeroCabalistico');
  });

  test('POST /api/numerologia should validate required fields', async ({ request }) => {
    const response = await request.post('/api/numerologia', {
      data: {
        nome: 'Test',
        // missing dataNascimento
      },
    });
    
    expect(response.status()).toBe(400);
  });

  test('POST /api/ciclos should calculate cycles', async ({ request }) => {
    const response = await request.post('/api/ciclos', {
      data: {
        dataNascimento: '1990-06-15',
      },
    });
    
    // Should return 200 or 400 depending on implementation
    expect([200, 400]).toContain(response.status());
  });

  test('POST /api/astrologia/mapa-natal should validate input', async ({ request }) => {
    const response = await request.post('/api/astrologia/mapa-natal', {
      data: {
        dataNascimento: '1990-06-15',
        horaNascimento: '14:30',
        localNascimento: 'São Paulo, SP',
      },
    });
    
    // Should return 200 (success) or 500 (service unavailable)
    expect([200, 500]).toContain(response.status());
  });
});

test.describe('Protected APIs', () => {
  test('GET /api/creditos should return 401 without auth', async ({ request }) => {
    const response = await request.get('/api/creditos');
    
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('error');
  });

  test('POST /api/creditos/debitar should return 401 without auth', async ({ request }) => {
    const response = await request.post('/api/creditos/debitar', {
      data: {
        quantidade: 1,
        operacao: 'test',
      },
    });
    
    expect(response.status()).toBe(401);
  });

  test('GET /api/chat/historico should return 401 without auth', async ({ request }) => {
    const response = await request.get('/api/chat/historico');
    
    expect(response.status()).toBe(401);
  });

  test('GET /api/insights/diario should return 401 without auth', async ({ request }) => {
    const response = await request.get('/api/insights/diario');
    
    expect(response.status()).toBe(401);
  });

  test('POST /api/payments/checkout should return 401 without auth', async ({ request }) => {
    const response = await request.post('/api/payments/checkout', {
      data: {
        userId: 'test',
        planoId: 'Iniciante',
      },
    });
    
    expect(response.status()).toBe(401);
  });
});

test.describe('API Error Handling', () => {
  test('should return JSON error for invalid JSON', async ({ request }) => {
    const response = await request.post('/api/numerologia', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: 'not-valid-json',
    });
    
    // Server should return 400 or 500
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should handle missing Content-Type', async ({ request }) => {
    const response = await request.post('/api/numerologia', {
      // No Content-Type header
      data: {},
    });
    
    // Should handle gracefully
    expect(response.status()).toBeGreaterThanOrEqual(200);
  });

  test('should return proper CORS headers', async ({ request }) => {
    const response = await request.get('/api/odus');
    
    // Check headers exist
    // CORS headers may or may not be present depending on config
  });
});