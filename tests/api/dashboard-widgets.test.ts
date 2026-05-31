import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Dashboard Widgets API Endpoint Tests
 * 
 * Testa o endpoint de widgets do dashboard.
 */

describe('GET /api/dashboard/widgets', () => {
  let GET: (req: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const widgetsModule = await import('@/app/api/dashboard/widgets/route');
    GET = widgetsModule.GET;
  });

  it('deve exportar GET function', () => {
    expect(typeof GET).toBe('function');
  });

  it('GET deve ser uma função assíncrona que retorna objetos com widgets', async () => {
    const req = new NextRequest('http://localhost:3000/api/dashboard/widgets');
    const response = await GET(req);
    
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.widgets).toBeDefined();
    expect(Array.isArray(data.widgets)).toBe(true);
  });

  it('GET deve retornar objeto com widgets e timestamp', async () => {
    const req = new NextRequest('http://localhost:3000/api/dashboard/widgets?type=quick-stats');
    const response = await GET(req);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data).toHaveProperty('widgets');
    expect(data).toHaveProperty('timestamp');
  });

  it('GET deve aceitar parâmetro type opcional', async () => {
    const validTypes = ['quick-stats', 'recent-activity', 'daily-affirmation', 'upcoming-rituals'];
    
    for (const type of validTypes) {
      const req = new NextRequest(`http://localhost:3000/api/dashboard/widgets?type=${type}`);
      const response = await GET(req);
      expect(response.status).toBe(200);
    }
  });

  it('GET deve retornar erro 400 para widget type inválido', async () => {
    const req = new NextRequest('http://localhost:3000/api/dashboard/widgets?type=invalid');
    const response = await GET(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
});