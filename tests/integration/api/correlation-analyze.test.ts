import { beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest';
import { server } from '../../mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GET /api/correlation/analyze', () => {
  it('should analyze day portal', async () => {
    const res = await fetch('http://localhost:3000/api/correlation/analyze?type=day');
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('dayPortal');
    expect(json.data).toHaveProperty('lunarPhase');
    expect(json.data).toHaveProperty('orixa');
  });

  it('should analyze week cycle', async () => {
    const res = await fetch('http://localhost:3000/api/correlation/analyze?type=week');
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBe(7);
  });
});
