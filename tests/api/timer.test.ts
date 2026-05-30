import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Timer API Endpoint Tests
 * 
 * Testa o endpoint de timer da API.
 */

// Import the route module to verify structure
const routeModule = require('@/app/api/timer/route');

describe('GET /api/timer', () => {
  it('deve exportar GET function', () => {
    expect(typeof routeModule.GET).toBe('function');
  });

  it('GET deve ser uma função assíncrona', async () => {
    const req = new NextRequest('http://localhost:3000/api/timer');
    const response = await routeModule.GET(req);
    
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET com id específico deve retornar 404 para timer inexistente', async () => {
    const req = new NextRequest('http://localhost:3000/api/timer?id=nonexistent-id-123');
    const response = await routeModule.GET(req);
    
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Timer not found');
  });
});

describe('POST /api/timer', () => {
  it('deve exportar POST function', () => {
    expect(typeof routeModule.POST).toBe('function');
  });

  it('POST deve criar novo timer com dados válidos', async () => {
    const req = new NextRequest('http://localhost:3000/api/timer', {
      method: 'POST',
      body: JSON.stringify({ label: 'Meditation', durationSeconds: 60 }),
    });
    
    const response = await routeModule.POST(req);
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
    
    const response = await routeModule.POST(req);
    expect(response.status).toBe(400);
  });

  it('POST deve retornar erro 400 sem durationSeconds', async () => {
    const req = new NextRequest('http://localhost:3000/api/timer', {
      method: 'POST',
      body: JSON.stringify({ label: 'Test' }),
    });
    
    const response = await routeModule.POST(req);
    expect(response.status).toBe(400);
  });
});