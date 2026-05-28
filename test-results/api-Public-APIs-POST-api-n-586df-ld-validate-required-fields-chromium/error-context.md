# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> Public APIs >> POST /api/numerologia should validate required fields
- Location: e2e/api.spec.ts:41:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 405
```

# Test source

```ts
  1   | import { test, expect } from './setup';
  2   | 
  3   | /**
  4   |  * E2E Tests: API Flow
  5   |  * 
  6   |  * Tests API endpoints via HTTP requests:
  7   |  * - Public APIs (no auth)
  8   |  * - Protected APIs (require auth)
  9   |  * - Error handling
  10  |  */
  11  | 
  12  | test.describe('Public APIs', () => {
  13  |   test('GET /api/odus should return list of odus', async ({ request }) => {
  14  |     const response = await request.get('/api/odus');
  15  |     
  16  |     expect(response.status()).toBe(200);
  17  |     
  18  |     const body = await response.json();
  19  |     expect(Array.isArray(body)).toBe(true);
  20  |     
  21  |     if (body.length > 0) {
  22  |       expect(body[0]).toHaveProperty('numero');
  23  |       expect(body[0]).toHaveProperty('nome');
  24  |     }
  25  |   });
  26  | 
  27  |   test('POST /api/numerologia should calculate numerology', async ({ request }) => {
  28  |     const response = await request.post('/api/numerologia', {
  29  |       data: {
  30  |         nome: 'Maria Silva',
  31  |         dataNascimento: '1990-06-15',
  32  |       },
  33  |     });
  34  |     
  35  |     expect(response.status()).toBe(200);
  36  |     
  37  |     const body = await response.json();
  38  |     expect(body).toHaveProperty('numeroCabalistico');
  39  |   });
  40  | 
  41  |   test('POST /api/numerologia should validate required fields', async ({ request }) => {
  42  |     const response = await request.post('/api/numerologia', {
  43  |       data: {
  44  |         nome: 'Test',
  45  |         // missing dataNascimento
  46  |       },
  47  |     });
  48  |     
> 49  |     expect(response.status()).toBe(400);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  50  |   });
  51  | 
  52  |   test('POST /api/ciclos should calculate cycles', async ({ request }) => {
  53  |     const response = await request.post('/api/ciclos', {
  54  |       data: {
  55  |         dataNascimento: '1990-06-15',
  56  |       },
  57  |     });
  58  |     
  59  |     // Should return 200 or 400 depending on implementation
  60  |     expect([200, 400]).toContain(response.status());
  61  |   });
  62  | 
  63  |   test('POST /api/astrologia/mapa-natal should validate input', async ({ request }) => {
  64  |     const response = await request.post('/api/astrologia/mapa-natal', {
  65  |       data: {
  66  |         dataNascimento: '1990-06-15',
  67  |         horaNascimento: '14:30',
  68  |         localNascimento: 'São Paulo, SP',
  69  |       },
  70  |     });
  71  |     
  72  |     // Should return 200 (success) or 500 (service unavailable)
  73  |     expect([200, 500]).toContain(response.status());
  74  |   });
  75  | });
  76  | 
  77  | test.describe('Protected APIs', () => {
  78  |   test('GET /api/creditos should return 401 without auth', async ({ request }) => {
  79  |     const response = await request.get('/api/creditos');
  80  |     
  81  |     expect(response.status()).toBe(401);
  82  |     
  83  |     const body = await response.json();
  84  |     expect(body).toHaveProperty('success', false);
  85  |     expect(body).toHaveProperty('error');
  86  |   });
  87  | 
  88  |   test('POST /api/creditos/debitar should return 401 without auth', async ({ request }) => {
  89  |     const response = await request.post('/api/creditos/debitar', {
  90  |       data: {
  91  |         quantidade: 1,
  92  |         operacao: 'test',
  93  |       },
  94  |     });
  95  |     
  96  |     expect(response.status()).toBe(401);
  97  |   });
  98  | 
  99  |   test('GET /api/chat/historico should return 401 without auth', async ({ request }) => {
  100 |     const response = await request.get('/api/chat/historico');
  101 |     
  102 |     expect(response.status()).toBe(401);
  103 |   });
  104 | 
  105 |   test('GET /api/insights/diario should return 401 without auth', async ({ request }) => {
  106 |     const response = await request.get('/api/insights/diario');
  107 |     
  108 |     expect(response.status()).toBe(401);
  109 |   });
  110 | 
  111 |   test('POST /api/payments/checkout should return 401 without auth', async ({ request }) => {
  112 |     const response = await request.post('/api/payments/checkout', {
  113 |       data: {
  114 |         userId: 'test',
  115 |         planoId: 'Iniciante',
  116 |       },
  117 |     });
  118 |     
  119 |     expect(response.status()).toBe(401);
  120 |   });
  121 | });
  122 | 
  123 | test.describe('API Error Handling', () => {
  124 |   test('should return JSON error for invalid JSON', async ({ request }) => {
  125 |     const response = await request.post('/api/numerologia', {
  126 |       headers: {
  127 |         'Content-Type': 'application/json',
  128 |       },
  129 |       data: 'not-valid-json',
  130 |     });
  131 |     
  132 |     // Server should return 400 or 500
  133 |     expect(response.status()).toBeGreaterThanOrEqual(400);
  134 |   });
  135 | 
  136 |   test('should handle missing Content-Type', async ({ request }) => {
  137 |     const response = await request.post('/api/numerologia', {
  138 |       // No Content-Type header
  139 |       data: {},
  140 |     });
  141 |     
  142 |     // Should handle gracefully
  143 |     expect(response.status()).toBeGreaterThanOrEqual(200);
  144 |   });
  145 | 
  146 |   test('should return proper CORS headers', async ({ request }) => {
  147 |     const response = await request.get('/api/odus');
  148 |     
  149 |     // Check headers exist
```