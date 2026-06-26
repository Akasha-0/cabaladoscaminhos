import { describe, it, expect, beforeEach } from 'vitest';
import {
  counter,
  gauge,
  histogram,
  getMetricsText,
  getMetricsContentType,
  resetMetrics,
  startDefaultMetrics,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  llmCallsTotal,
  subsystemUp,
} from '../src/metrics.js';

describe('@akasha/observability/metrics', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('declares a counter and increments it', async () => {
    const c = counter('akasha_test_counter_total', 'test counter', ['route']);
    c.inc({ route: '/foo' });
    c.inc({ route: '/foo' });
    c.inc({ route: '/bar' });
    const text = await getMetricsText();
    expect(text).toContain('akasha_test_counter_total');
    expect(text).toMatch(/akasha_test_counter_total\{[^}]*route="\/foo"[^}]*\} 2/);
    expect(text).toMatch(/akasha_test_counter_total\{[^}]*route="\/bar"[^}]*\} 1/);
  });

  it('declares a gauge that reflects set values', async () => {
    const g = gauge('akasha_test_gauge', 'test gauge', ['k']);
    g.set({ k: 'a' }, 7);
    g.set({ k: 'b' }, 0);
    const text = await getMetricsText();
    expect(text).toMatch(/akasha_test_gauge\{[^}]*k="a"[^}]*\} 7/);
    expect(text).toMatch(/akasha_test_gauge\{[^}]*k="b"[^}]*\} 0/);
  });

  it('declares a histogram with custom buckets and observes timings', async () => {
    const h = histogram(
      'akasha_test_latency_seconds',
      'test latency',
      [0.01, 0.1, 1],
      ['route']
    );
    h.observe({ route: '/x' }, 0.005);
    h.observe({ route: '/x' }, 0.5);
    h.observe({ route: '/x' }, 5);
    const text = await getMetricsText();
    expect(text).toContain('akasha_test_latency_seconds_bucket');
    expect(text).toContain('le="0.01"');
    expect(text).toContain('le="0.1"');
    expect(text).toContain('le="+Inf"');
    expect(text).toMatch(/akasha_test_latency_seconds_count\{[^}]*route="\/x"[^}]*\}/);
  });

  it('returns the same instance for repeated declarations (singleton registry)', () => {
    const a = counter('akasha_singleton_counter_total', 'singleton');
    const b = counter('akasha_singleton_counter_total', 'singleton');
    expect(a).toBe(b);
  });

  it('exposes a Prometheus-compatible content type', () => {
    const ct = getMetricsContentType();
    expect(ct).toContain('text/plain');
  });

  it('startDefaultMetrics is idempotent and registers nodejs metrics', async () => {
    const reg = startDefaultMetrics();
    const reg2 = startDefaultMetrics();
    expect(reg).toBe(reg2);
    const text = await getMetricsText();
    expect(text).toMatch(/nodejs_eventloop_lag|process_/);
  });

  it('exports pre-declared akasha HTTP/LLM metrics helpers', () => {
    expect(httpRequestsTotal).toBeDefined();
    expect(httpRequestDurationSeconds).toBeDefined();
    expect(llmCallsTotal).toBeDefined();
    expect(subsystemUp).toBeDefined();
  });

  it('counter.inc and histogram.startTimer are callable with labels', () => {
    httpRequestsTotal.inc({ method: 'GET', route: '/api/test', status: '200' });
    const end = httpRequestDurationSeconds.startTimer({ method: 'GET', route: '/api/test' });
    end({ status: '200' });
    // If we got here without throwing, the test passes
    expect(true).toBe(true);
  });
});