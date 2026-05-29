import { describe, it, expect } from 'vitest';

describe('GET /api/correlation/analyze', () => {
 it.skip('should analyze day portal', async () => {
    const res = await fetch('http://localhost:3000/api/correlation/analyze?type=day');
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('dayPortal');
    expect(json.data).toHaveProperty('lunarPhase');
    expect(json.data).toHaveProperty('orixa');
  });

it.skip('should analyze week cycle', async () => {
    const res = await fetch('http://localhost:3000/api/correlation/analyze?type=week');
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBe(7);
  });

 it.skip('should analyze lunar phase', async () => {
    const res = await fetch('http://localhost:3000/api/correlation/analyze?type=lunar');
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('currentPhase');
  });

 it.skip('should analyze ritual guidance', async () => {
    const res = await fetch('http://localhost:3000/api/correlation/analyze?type=ritual');
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('rituals');
  });

 it.skip('should analyze odu correlations', async () => {
    const res = await fetch('http://localhost:3000/api/correlation/analyze?type=odu');
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('oduTarot');
  });
});
