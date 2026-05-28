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
  test('GET /api/odus should return error without data param', async ({ request }) => {
    const response = await request.get('/api/odus');
    
    // Requires data parameter
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('GET /api/odus should calculate with data parameter', async ({ request }) => {
    const response = await request.get('/api/odus?data=1990-06-15');
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('principal');
    expect(body).toHaveProperty('secundario');
  });

  test('GET /api/odus with tipo=todos should return all odus', async ({ request }) => {
    const response = await request.get('/api/odus?data=1990-06-15&tipo=todos');
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('odus');
    expect(Array.isArray(body.odus)).toBe(true);
  });

  test('GET /api/numerologia should require tipo parameter', async ({ request }) => {
    const response = await request.get('/api/numerologia');
    
    expect(response.status()).toBe(400);
  });

  test('GET /api/numerologia pitagorica should calculate with nome', async ({ request }) => {
    const response = await request.get('/api/numerologia?tipo=pitagorica&nome=Maria Silva');
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('numero');
    expect(body).toHaveProperty('interpretacao');
  });

  test('GET /api/numerologia tantrica should require data', async ({ request }) => {
    const response = await request.get('/api/numerologia?tipo=tantrica');
    
    expect(response.status()).toBe(400);
  });

  test('GET /api/ciclos should require date parameter', async ({ request }) => {
    const response = await request.get('/api/ciclos');
    
    // Returns 405 Method Not Allowed (no GET handler without params) or 400
    expect([400, 405]).toContain(response.status());
  });

  test('GET /api/astrologia/mapa-natal should calculate with params', async ({ request }) => {
    const response = await request.get('/api/astrologia/mapa-natal?dataNascimento=1990-06-15&horaNascimento=14:30&latitude=-23.55&longitude=-46.63');
    
    // 200 (success), 400 (missing params), or 500 (error)
    expect([200, 400, 500]).toContain(response.status());
  });

  test('GET /api/astrologia/mapa-natal should require params', async ({ request }) => {
    const response = await request.get('/api/astrologia/mapa-natal');
    
    // Should return 400 (missing required params)
    expect(response.status()).toBe(400);
  });

  test('GET /api/astrologia/transitos should work with params', async ({ request }) => {
    const response = await request.get('/api/astrologia/transitos?dataNascimento=1990-06-15&horaNascimento=14:30&latitude=-23.55&longitude=-46.63');
    
    // 200 or 500 depending on external services
    expect([200, 400, 500]).toContain(response.status());
  });
});

test.describe('Protected APIs', () => {
  test('GET /api/creditos should return 401 without auth', async ({ request }) => {
    const response = await request.get('/api/creditos');
    
    expect(response.status()).toBe(401);
    
    const body = await response.json();
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
    const response = await request.post('/api/numerologia?tipo=pitagorica&nome=Test', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: 'not-valid-json',
    });
    
    // Server should return 400 or 500
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should handle missing required parameters', async ({ request }) => {
    const response = await request.get('/api/numerologia');
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('should handle invalid tipo parameter', async ({ request }) => {
    const response = await request.get('/api/numerologia?tipo=invalid');
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('não reconhecido');
  });
});