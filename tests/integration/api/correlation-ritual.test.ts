import { beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest';
import { server } from '../../mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GET /api/correlation/ritual', () => {
  it('should generate today ritual plan', async () => {
    const res = await fetch('http://localhost:3000/api/correlation/ritual');
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('title');
    expect(json.data).toHaveProperty('day');
    expect(json.data).toHaveProperty('lunarPhase');
    expect(json.data).toHaveProperty('focus');
    expect(json.data).toHaveProperty('elements');
    expect(json.data).toHaveProperty('steps');
    expect(json.data).toHaveProperty('affirmations');
  });

  it('should generate weekly ritual schedule', async () => {
    const res = await fetch('http://localhost:3000/api/correlation/ritual?type=week');
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBe(7);
  });

 it.skip('should include correlation elements in plan', async () => {
    const res = await fetch('http://localhost:3000/api/correlation/ritual');
    const json = await res.json();
    const plan = json.data;
    expect(Array.isArray(plan.elements?.colors)).toBe(true);
    expect(Array.isArray(plan.elements?.herbs)).toBe(true);
    expect(Array.isArray(plan.elements?.incenses)).toBe(true);
    expect(Array.isArray(plan.orixas)).toBe(true);
    expect(Array.isArray(plan.sephirot)).toBe(true);
    expect(Array.isArray(plan.arcanos)).toBe(true);
  });
});
