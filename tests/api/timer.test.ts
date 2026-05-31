import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Timer API Endpoint Tests
 * 
 * Testa o endpoint de timer da API.
 */

describe('GET /api/timer', () => {
  let GET: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const timerModule = await import('@/app/api/timer/route');
    GET = timerModule.GET;
  });

  it('deve exportar GET function', () => {
    expect(typeof GET).toBe('function');
  });

  it('GET deve ser uma função assíncrona que retorna objeto com timers', async () => {
    const req = new NextRequest('http://localhost:3000/api/timer');
    const response = await GET(req);
    const body = await response.clone().json();
    console.log('DEBUG:', response.status, JSON.stringify(body));
    // Skip status check temporarily to see actual response
    expect(response).toBeInstanceOf(Response);
    if (response.status === 200) {
      expect(body).toHaveProperty('timers');
      expect(Array.isArray(body.timers)).toBe(true);
    } else {
      console.log('ERROR_DETAILS:', body);
      expect(response.status).toBe(200); // fail with actual status
    }
  });
});

describe('POST /api/timer', () => {
  let POST: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const timerModule = await import('@/app/api/timer/route');
    POST = timerModule.POST;
  });

  it('deve exportar POST function', () => {
    expect(typeof POST).toBe('function');
  });

  it('POST deve criar novo timer com dados válidos', async () => {
    const req = new NextRequest('http://localhost:3000/api/timer', {
      method: 'POST',
      body: JSON.stringify({ label: 'Meditation', durationSeconds: 60 }),
    });
    
    const response = await POST(req);
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.label).toBe('Meditation');
    expect(data.durationSeconds).toBe(60);
    expect(data.status).toBe('running');
  });

  it('POST deve retornar erro 400 para durationSeconds inválido', async () => {
    const req = new NextRequest('http://localhost:3000/api/timer', {
      method: 'POST',
      body: JSON.stringify({ label: 'Test', durationSeconds: -1 }),
    });
    
    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('POST deve retornar erro 400 sem durationSeconds', async () => {
    const req = new NextRequest('http://localhost:3000/api/timer', {
      method: 'POST',
      body: JSON.stringify({ label: 'Test' }),
    });
    
    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});