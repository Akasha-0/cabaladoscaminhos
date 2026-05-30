import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Dashboard Widgets API Endpoint Tests
 * 
 * Testa o endpoint de widgets do dashboard.
 */

// Import the route module to verify structure
const routeModule = require('@/app/api/dashboard/widgets/route');

describe('GET /api/dashboard/widgets', () => {
  it('deve exportar GET function', () => {
    expect(typeof routeModule.GET).toBe('function');
  });

  it('GET deve ser uma função assíncrona', async () => {
    const req = new NextRequest('http://localhost:3000/api/dashboard/widgets');
    const response = await routeModule.GET(req);
    
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.widgets).toBeDefined();
    expect(Array.isArray(data.widgets)).toBe(true);
  });

  it('GET deve retornar objeto com widgets array', async () => {
    const req = new NextRequest('http://localhost:3000/api/dashboard/widgets?widget=stats');
    const response = await routeModule.GET(req);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    // Verify structure based on route implementation
    expect(data).toHaveProperty('widgets');
    expect(data).toHaveProperty('timestamp');
  });

  it('GET deve aceitar parâmetro widget opcional', async () => {
    const validWidgets = ['stats', 'activity', 'affirmation', 'rituals'];
    
    for (const widget of validWidgets) {
      const req = new NextRequest(`http://localhost:3000/api/dashboard/widgets?widget=${widget}`);
      const response = await routeModule.GET(req);
      expect(response.status).toBe(200);
    }
  });

  it('GET deve retornar erro 400 para widget inválido', async () => {
    const req = new NextRequest('http://localhost:3000/api/dashboard/widgets?widget=invalid');
    const response = await routeModule.GET(req);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toContain('Widget inválido');
  });
});