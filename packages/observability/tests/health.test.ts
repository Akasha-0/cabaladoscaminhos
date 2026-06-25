import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkSubsystem,
  checkAllSubsystems,
  makeDbProbe,
  makeRedisProbe,
  makeHttpProbe,
  makeCustomProbe,
  type SubsystemProbe,
} from '../src/health.js';
import { resetMetrics } from '../src/metrics.js';

describe('@akasha/observability/health', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('reports up when probe resolves with ok=true', async () => {
    const probe: SubsystemProbe = {
      name: 'mock',
      check: async () => ({ ok: true, detail: 'hello' }),
    };
    const r = await checkSubsystem(probe);
    expect(r.status).toBe('up');
    expect(r.detail).toBe('hello');
    expect(r.error).toBeUndefined();
    expect(r.latencyMs).toBeGreaterThanOrEqual(0);
    expect(r.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('reports down when probe resolves with ok=false', async () => {
    const probe: SubsystemProbe = {
      name: 'broken',
      check: async () => ({ ok: false, error: 'connection refused' }),
    };
    const r = await checkSubsystem(probe);
    expect(r.status).toBe('down');
    expect(r.error).toBe('connection refused');
  });

  it('captures thrown errors as down (never throws upward)', async () => {
    const probe: SubsystemProbe = {
      name: 'throws',
      check: async () => {
        throw new Error('boom');
      },
    };
    const r = await checkSubsystem(probe);
    expect(r.status).toBe('down');
    expect(r.error).toContain('boom');
  });

  it('enforces per-probe timeout', async () => {
    const probe: SubsystemProbe = {
      name: 'slow',
      timeoutMs: 50,
      check: () => new Promise(() => {}), // never resolves
    };
    const r = await checkSubsystem(probe);
    expect(r.status).toBe('down');
    expect(r.error).toMatch(/exceeded 50ms/);
  });

  it('aggregates multiple probes to overall status', async () => {
    const probes: SubsystemProbe[] = [
      { name: 'a', check: async () => ({ ok: true }) },
      { name: 'b', check: async () => ({ ok: false }) },
      { name: 'c', check: async () => ({ ok: true }) },
    ];
    const agg = await checkAllSubsystems(probes);
    expect(agg.status).toBe('degraded');
    expect(agg.subsystems).toHaveLength(3);
    expect(agg.subsystems.find((s) => s.name === 'b')?.status).toBe('down');
  });

  it('aggregates all-up to ok, all-down to down', async () => {
    const okAll = await checkAllSubsystems([
      { name: 'x', check: async () => ({ ok: true }) },
      { name: 'y', check: async () => ({ ok: true }) },
    ]);
    expect(okAll.status).toBe('ok');

    const downAll = await checkAllSubsystems([
      { name: 'x', check: async () => ({ ok: false }) },
      { name: 'y', check: async () => ({ ok: false }) },
    ]);
    expect(downAll.status).toBe('down');
  });

  it('runs probes concurrently (total latency ~= max, not sum)', async () => {
    const delay = (ms: number) =>
      new Promise<void>((res) => setTimeout(res, ms));
    const probes: SubsystemProbe[] = [
      { name: 'a', check: async () => { await delay(50); return { ok: true }; } },
      { name: 'b', check: async () => { await delay(50); return { ok: true }; } },
      { name: 'c', check: async () => { await delay(50); return { ok: true }; } },
    ];
    const t0 = Date.now();
    await checkAllSubsystems(probes);
    const elapsed = Date.now() - t0;
    // Sequential would be >=150ms; concurrent should be <120ms (with margin).
    expect(elapsed).toBeLessThan(120);
  });

  it('makeDbProbe wraps a runner and reports ok on success', async () => {
    const run = vi.fn().mockResolvedValue(1);
    const r = await checkSubsystem(makeDbProbe({ run }));
    expect(r.status).toBe('up');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('makeDbProbe catches runner errors as down', async () => {
    const run = vi.fn().mockRejectedValue(new Error('prisma timeout'));
    const r = await checkSubsystem(makeDbProbe({ run }));
    expect(r.status).toBe('down');
    expect(r.error).toContain('prisma timeout');
  });

  it('makeRedisProbe accepts a PING-style client', async () => {
    const ping = vi.fn().mockResolvedValue('PONG');
    const r = await checkSubsystem(makeRedisProbe({ ping }));
    expect(r.status).toBe('up');
    expect(r.detail).toBe('PONG');
  });

  it('makeRedisProbe handles PING returning non-PONG (down)', async () => {
    const ping = vi.fn().mockResolvedValue('NOPE');
    const r = await checkSubsystem(makeRedisProbe({ ping }));
    expect(r.status).toBe('down');
  });

  it('makeCustomProbe is a thin alias for arbitrary async checks', async () => {
    const r = await checkSubsystem(
      makeCustomProbe({
        name: 'mentor',
        run: async () => ({ ok: true, detail: 'provider=mock' }),
      })
    );
    expect(r.status).toBe('up');
    expect(r.detail).toBe('provider=mock');
  });

  it('makeHttpProbe pings a URL and reports based on status', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({ status: 200 });
    try {
      const r = await checkSubsystem(
        makeHttpProbe({ name: 'openai', url: 'https://api.openai.com/v1/models' })
      );
      expect(r.status).toBe('up');
      expect(r.detail).toBe('HTTP 200');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('makeHttpProbe reports down on fetch error', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network down'));
    try {
      const r = await checkSubsystem(
        makeHttpProbe({ name: 'openai', url: 'https://api.openai.com/' })
      );
      expect(r.status).toBe('down');
      expect(r.error).toContain('network down');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});