/**
 * Health checks — Wave 31.4 Observability MVP
 *
 * `checkSubsystem(name, probe)` runs a probe under a timeout and returns a
 * normalized `SubsystemStatus`. Designed so any subsystem (Prisma, Redis,
 * upstream HTTP, custom async check) plugs in with the same shape.
 *
 * `checkAllSubsystems(probes)` runs probes concurrently and aggregates.
 * Aggregation rule:
 *   - all up      → "ok"
 *   - some down   → "degraded"
 *   - all down    → "down"
 *
 * Also exposes factory helpers:
 *   - makeDbProbe({ run })        — Prisma-style `$queryRaw\`SELECT 1\``
 *   - makeRedisProbe({ ping })    — ioredis-style `await client.ping()`
 *   - makeHttpProbe({ url, ... }) — fetch-based HTTP HEAD
 *   - makeCustomProbe({ name, run })
 */

import { subsystemUp } from './metrics.js';

export type SubsystemStatusKind = 'up' | 'down';

export interface SubsystemStatus {
  name: string;
  status: SubsystemStatusKind;
  latencyMs: number;
  checkedAt: string; // ISO-8601
  detail?: string;
  error?: string;
}

export interface SubsystemProbe {
  name: string;
  /** Per-probe timeout in ms. Defaults to 1500ms. */
  timeoutMs?: number;
  check: () => Promise<{ ok: boolean; detail?: string; error?: string }>;
}

export interface SubsystemAggregate {
  status: 'ok' | 'degraded' | 'down';
  checkedAt: string;
  durationMs: number;
  subsystems: SubsystemStatus[];
}

const DEFAULT_TIMEOUT_MS = 1500;

/**
 * Race a probe against a per-probe timeout. Any thrown error is captured as
 * `down` (never propagates to the caller).
 */
export async function checkSubsystem(probe: SubsystemProbe): Promise<SubsystemStatus> {
  const timeoutMs = probe.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();

  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<{ ok: false; error: string }>((resolve) => {
    timer = setTimeout(
      () => resolve({ ok: false, error: `probe exceeded ${timeoutMs}ms` }),
      timeoutMs
    );
  });

  try {
    const result = await Promise.race([probe.check(), timeout]);
    if (timer) clearTimeout(timer);
    const latencyMs = Date.now() - startedAt;
    const status: SubsystemStatusKind = result.ok ? 'up' : 'down';
    // Normalize to SubsystemStatus. `timeout` returns a `{ok:false,error}` shape.
    const detail = 'detail' in result ? result.detail : undefined;
    const error = 'error' in result ? result.error : undefined;
    const r: SubsystemStatus = {
      name: probe.name,
      status,
      latencyMs,
      checkedAt,
      detail,
      error,
    };
    // Mirror to prom gauge (best-effort; never throw out of checkSubsystem)
    try {
      subsystemUp.set({ subsystem: probe.name }, status === 'up' ? 1 : 0);
    } catch {
      /* metric failure should not break the probe result */
    }
    return r;
  } catch (err) {
    if (timer) clearTimeout(timer);
    const latencyMs = Date.now() - startedAt;
    const msg = err instanceof Error ? err.message : String(err);
    return {
      name: probe.name,
      status: 'down',
      latencyMs,
      checkedAt,
      error: msg,
    };
  }
}

/**
 * Run all probes concurrently and aggregate. Returns `SubsystemAggregate`
 * which the /api/akasha/health route JSON-stringifies verbatim.
 */
export async function checkAllSubsystems(
  probes: ReadonlyArray<SubsystemProbe>
): Promise<SubsystemAggregate> {
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();
  const subsystems = await Promise.all(probes.map(checkSubsystem));
  const ups = subsystems.filter((s) => s.status === 'up').length;
  const total = subsystems.length;
  let status: 'ok' | 'degraded' | 'down';
  if (total === 0) status = 'ok';
  else if (ups === total) status = 'ok';
  else if (ups === 0) status = 'down';
  else status = 'degraded';
  return {
    status,
    checkedAt,
    durationMs: Date.now() - startedAt,
    subsystems,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Probe factories — keep consumers (akasha-portal) concise.
// ─────────────────────────────────────────────────────────────────────

/**
 * Wrap a Prisma-style `runner` (e.g. `db.$queryRaw\`SELECT 1\``) into a probe.
 */
export function makeDbProbe(opts: {
  name?: string;
  timeoutMs?: number;
  run: () => Promise<unknown>;
}): SubsystemProbe {
  return {
    name: opts.name ?? 'database',
    timeoutMs: opts.timeoutMs,
    async check() {
      try {
        await opts.run();
        return { ok: true, detail: 'SELECT 1 ok' };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
}

/**
 * Wrap an ioredis-style client (`client.ping()` returns "PONG").
 */
export function makeRedisProbe(opts: {
  name?: string;
  timeoutMs?: number;
  ping: () => Promise<unknown>;
}): SubsystemProbe {
  return {
    name: opts.name ?? 'redis',
    timeoutMs: opts.timeoutMs,
    async check() {
      try {
        const reply = await opts.ping();
        const detail = typeof reply === 'string' ? reply : JSON.stringify(reply);
        const ok = typeof reply === 'string' ? reply.toUpperCase() === 'PONG' : reply !== null && reply !== undefined;
        return { ok, detail };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
}

/**
 * Wrap an upstream HTTP service. Uses global `fetch` (Node 18+).
 * `validate` defaults to checking 2xx status.
 */
export function makeHttpProbe(opts: {
  name: string;
  url: string;
  method?: 'GET' | 'HEAD';
  timeoutMs?: number;
  headers?: Record<string, string>;
  validate?: (status: number) => boolean;
}): SubsystemProbe {
  return {
    name: opts.name,
    timeoutMs: opts.timeoutMs,
    async check() {
      try {
        const res = await fetch(opts.url, {
          method: opts.method ?? 'GET',
          headers: opts.headers,
        });
        const ok = opts.validate ? opts.validate(res.status) : res.status >= 200 && res.status < 300;
        return {
          ok,
          detail: `HTTP ${res.status}`,
          ...(ok ? {} : { error: `non-2xx status ${res.status}` }),
        };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
}

/**
 * Wrap an arbitrary async function. Use for LLM/Mentor/upstream RPCs that
 * don't fit the SQL/Redis/HTTP templates above.
 */
export function makeCustomProbe(opts: {
  name: string;
  timeoutMs?: number;
  run: () => Promise<{ ok: boolean; detail?: string; error?: string }>;
}): SubsystemProbe {
  return {
    name: opts.name,
    timeoutMs: opts.timeoutMs,
    check: opts.run,
  };
}