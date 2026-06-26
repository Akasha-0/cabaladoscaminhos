/**
 * Prometheus metrics — Wave 31.4 Observability MVP
 *
 * Wraps `prom-client` with sane defaults and Akasha-flavored helpers.
 * - Pre-registered: process_cpu, process_resident_memory, nodejs_eventloop_lag
 * - Helper to declare counter/gauge/histogram with default labels
 *   (service + env) so multi-tenant scrape targets are aggregated cleanly.
 * - Singleton registry — calling `counter()` twice returns the same instance.
 *
 * IMPORTANT: prom-client uses a module-level global Registry by default.
 * We intentionally keep that for simplicity in the MVP. If we later want
 * per-tenant or per-test isolation, swap the registry passed to constructors.
 */

import {
  Registry,
  Counter as PCounter,
  Gauge as PGauge,
  Histogram as PHistogram,
  collectDefaultMetrics,
} from 'prom-client';

const SERVICE_NAME = process.env['SERVICE_NAME'] ?? 'akasha';
const ENV_NAME = process.env['NODE_ENV'] ?? 'development';
const labels: ReadonlyArray<string> = ['service', 'env'];

export const registry: Registry = new Registry();
registry.setDefaultLabels({ service: SERVICE_NAME, env: ENV_NAME });

let defaultMetricsStarted = false;
/** Returned by `collectDefaultMetrics` — typed as `unknown` because
 *  prom-client's public type for the collector handle was removed in v15. */
let defaultCollector: unknown;

export function startDefaultMetrics(): unknown {
  if (!defaultMetricsStarted) {
    defaultCollector = collectDefaultMetrics({
      register: registry,
      prefix: '',
    });
    defaultMetricsStarted = true;
  }
  return defaultCollector;
}

// Auto-start at import time — mirrors prom-client's usual behaviour.
startDefaultMetrics();

/**
 * Create or fetch a Counter. Repeated calls with the same `name` return
 * the same instance (registry dedup).
 */
export function counter(
  name: string,
  help: string,
  labelNames: ReadonlyArray<string> = []
): PCounter<string> {
  const fullLabels = Array.from(new Set([...labels, ...labelNames]));
  const existing = registry.getSingleMetric(name) as PCounter<string> | undefined;
  if (existing) return existing;
  return new PCounter<string>({ name, help, labelNames: fullLabels, registers: [registry] });
}

/**
 * Create or fetch a Gauge.
 */
export function gauge(
  name: string,
  help: string,
  labelNames: ReadonlyArray<string> = []
): PGauge<string> {
  const fullLabels = Array.from(new Set([...labels, ...labelNames]));
  const existing = registry.getSingleMetric(name) as PGauge<string> | undefined;
  if (existing) return existing;
  return new PGauge<string>({ name, help, labelNames: fullLabels, registers: [registry] });
}

/**
 * Create or fetch a Histogram.
 */
export function histogram(
  name: string,
  help: string,
  buckets: ReadonlyArray<number> = [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  labelNames: ReadonlyArray<string> = []
): PHistogram<string> {
  const fullLabels = Array.from(new Set([...labels, ...labelNames]));
  const existing = registry.getSingleMetric(name) as PHistogram<string> | undefined;
  if (existing) return existing;
  return new PHistogram<string>({
    name,
    help,
    buckets: [...buckets],
    labelNames: fullLabels,
    registers: [registry],
  });
}

/**
 * Render the metrics registry in Prometheus text format.
 */
export async function getMetricsText(): Promise<string> {
  return registry.metrics();
}

/** Content-Type for the metrics endpoint. */
export function getMetricsContentType(): string {
  return registry.contentType;
}

/**
 * Wipe the registry. Intended for tests — production code should never
 * call this. Note: it does NOT unload the default-Node collectors; restart
 * the process if you really need a clean slate.
 */
export function resetMetrics(): void {
  registry.resetMetrics();
}

// ─────────────────────────────────────────────────────────────────────
// Akasha-flavoured pre-declared metrics
// ─────────────────────────────────────────────────────────────────────

/** Total HTTP requests, labelled by method/route/status. */
export const httpRequestsTotal = counter(
  'akasha_http_requests_total',
  'Total HTTP requests handled by Akasha',
  ['method', 'route', 'status']
);

/** HTTP request latency in seconds, labelled by method/route/status. */
export const httpRequestDurationSeconds = histogram(
  'akasha_http_request_duration_seconds',
  'HTTP request latency in seconds',
  [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  ['method', 'route', 'status']
);

/** Total LLM calls, labelled by provider/model/result. */
export const llmCallsTotal = counter(
  'akasha_llm_calls_total',
  'Total LLM provider calls',
  ['provider', 'model', 'result']
);

/** LLM call duration in seconds. */
export const llmCallDurationSeconds = histogram(
  'akasha_llm_call_duration_seconds',
  'LLM call duration in seconds',
  [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  ['provider', 'model']
);

/** 0 or 1 per subsystem — drives the health endpoint's Prometheus mirror. */
export const subsystemUp = gauge(
  'akasha_subsystem_up',
  'Subsystem health (1=up, 0=down)',
  ['subsystem']
);