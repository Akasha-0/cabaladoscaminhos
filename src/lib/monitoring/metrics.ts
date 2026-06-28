/**
 * monitoring/metrics — Custom metrics + Web Vitals (Wave 11)
 * ============================================================================
 * Helpers de metric collection sem dependencia de libs externas:
 *
 *   - counter(name, value=1, tags?):   incrementa contadores.
 *   - gauge(name, value, tags?):       seta valores instantaneos.
 *   - histogram(name, value, tags?):   distribui valores (count, sum, avg, p95).
 *
 * Storage:
 *   - In-memory ring buffer (max 1000 datapoints por metrica).
 *   - Forward para PostHog como evento `metric_<name>` (se habilitado).
 *   - Logs estruturados via logger.
 *
 * Web Vitals (client-side):
 *   - Usa PerformanceObserver nativo (sem `web-vitals` lib).
 *   - Tracks: LCP, FID, INP, CLS, FCP, TTFB.
 *   - Reporta via track() e/ou logger.
 *
 * Refs:
 *   - https://web.dev/vitals/
 *   - docs/MONITORING-WAVE11.md
 * ============================================================================
 */

import { logger } from "../logging";
import { track } from "./posthog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MetricType = "counter" | "gauge" | "histogram";

export interface MetricPoint {
  name: string;
  type: MetricType;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
}

interface MetricSeries {
  name: string;
  type: MetricType;
  count: number;
  sum: number;
  min: number;
  max: number;
  recent: number[]; // ring buffer para percentis
  tags: Record<string, string>;
  lastUpdated: number;
}

const RECENT_MAX = 100;
const SERIES_MAX = 200;

const series = new Map<string, MetricSeries>();
const tagIndex = new Map<string, string>(); // name + tags → key

function seriesKey(name: string, tags?: Record<string, string>): string {
  if (!tags || Object.keys(tags).length === 0) return name;
  const sorted = Object.keys(tags).sort().map((k) => `${k}=${tags[k]}`).join(",");
  return `${name}|${sorted}`;
}

function ensureSeries(name: string, type: MetricType, tags?: Record<string, string>): MetricSeries {
  const key = seriesKey(name, tags);
  let s = series.get(key);
  if (!s) {
    s = {
      name,
      type,
      count: 0,
      sum: 0,
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      recent: [],
      tags: tags ?? {},
      lastUpdated: Date.now(),
    };
    series.set(key, s);
    tagIndex.set(key, name);

    // Eviction
    if (series.size > SERIES_MAX) {
      const firstKey = series.keys().next().value;
      if (firstKey) series.delete(firstKey);
    }
  }
  return s;
}

function recordPoint(p: MetricPoint): void {
  const s = ensureSeries(p.name, p.type, p.tags);
  s.count += 1;
  s.sum += p.value;
  if (p.value < s.min) s.min = p.value;
  if (p.value > s.max) s.max = p.value;
  s.recent.push(p.value);
  if (s.recent.length > RECENT_MAX) s.recent.shift();
  s.lastUpdated = p.timestamp;

  if (process.env.NODE_ENV !== "production") {
    logger.debug(`[metric] ${p.name}`, {
      type: p.type,
      value: p.value,
      ...p.tags,
    });
  }
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export function counter(name: string, value = 1, tags?: Record<string, string>): void {
  recordPoint({ name, type: "counter", value, tags, timestamp: Date.now() });
  track(`metric_${name}`, { type: "counter", value, ...tags });
}

export function gauge(name: string, value: number, tags?: Record<string, string>): void {
  recordPoint({ name, type: "gauge", value, tags, timestamp: Date.now() });
  track(`metric_${name}`, { type: "gauge", value, ...tags });
}

export function histogram(name: string, value: number, tags?: Record<string, string>): void {
  recordPoint({ name, type: "histogram", value, tags, timestamp: Date.now() });
  track(`metric_${name}`, { type: "histogram", value, ...tags });
}

// Convenience: timed function (returns elapsed ms + value)
export async function timed<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const durationMs = Math.round(performance.now() - start);
    histogram(name, durationMs, tags);
  }
}

// ---------------------------------------------------------------------------
// Snapshot (for /api/health + dashboards)
// ---------------------------------------------------------------------------

export interface MetricSnapshot {
  name: string;
  type: MetricType;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50?: number;
  p95?: number;
  tags: Record<string, string>;
  lastUpdated: number;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx];
}

export function snapshot(filter?: { namePrefix?: string }): MetricSnapshot[] {
  const result: MetricSnapshot[] = [];
  for (const s of series.values()) {
    if (filter?.namePrefix && !s.name.startsWith(filter.namePrefix)) continue;
    const snap: MetricSnapshot = {
      name: s.name,
      type: s.type,
      count: s.count,
      sum: s.sum,
      avg: s.count > 0 ? s.sum / s.count : 0,
      min: s.count > 0 ? s.min : 0,
      max: s.count > 0 ? s.max : 0,
      p50: percentile(s.recent, 0.5),
      p95: percentile(s.recent, 0.95),
      tags: s.tags,
      lastUpdated: s.lastUpdated,
    };
    result.push(snap);
  }
  return result;
}

export function resetMetrics(): void {
  series.clear();
  tagIndex.clear();
}

// ---------------------------------------------------------------------------
// Web Vitals (client-side, native PerformanceObserver)
// ---------------------------------------------------------------------------

export interface WebVital {
  name: "LCP" | "FID" | "INP" | "CLS" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  id: string;
}

/**
 * Thresholds oficiais do web.dev (2024).
 * https://web.dev/articles/defining-core-web-vitals-thresholds
 */
const THRESHOLDS: Record<WebVital["name"], [number, number]> = {
  LCP: [2500, 4000],
  FID: [100, 300],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

function rate(name: WebVital["name"], value: number): WebVital["rating"] {
  const [good, poor] = THRESHOLDS[name];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

type VitalListener = (vital: WebVital) => void;
const listeners = new Set<VitalListener>();

export function onWebVital(listener: VitalListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function reportVital(name: WebVital["name"], value: number, id = `${name}-${Date.now()}`): void {
  const rating = rate(name, value);
  const vital: WebVital = { name, value: Math.round(value * 1000) / 1000, rating, id };

  listeners.forEach((l) => {
    try {
      l(vital);
    } catch (err) {
      logger.warn("[web-vitals] listener falhou", { err: String(err) });
    }
  });

  // Auto-report
  gauge(`web_vital_${name.toLowerCase()}`, value, { rating });
  track(`web_vital_${name.toLowerCase()}`, { value, rating });

  if (rating === "poor") {
    logger.warn(`[web-vitals] poor ${name}`, { value, rating });
  }
}

/**
 * Inicializa Web Vitals tracking (client-side).
 * Idempotente — chame uma vez no layout.
 */
export function initWebVitals(): void {
  if (typeof window === "undefined") return;
  if ((window as unknown as { __akasha_vitals__?: boolean }).__akasha_vitals__) return;
  (window as unknown as { __akasha_vitals__?: boolean }).__akasha_vitals__ = true;

  // ── LCP (Largest Contentful Paint) ──
  try {
    let lcpValue = 0;
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) lcpValue = last.startTime;
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    addEventListener("pagehide", () => {
      lcpObserver.disconnect();
      if (lcpValue > 0) reportVital("LCP", lcpValue);
    }, { once: true });
  } catch { /* unsupported */ }

  // ── FID (First Input Delay) — deprecated mas ainda reportado ──
  try {
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as PerformanceEntry & { processingStart?: number };
        if (eventEntry.processingStart) {
          reportVital("FID", eventEntry.processingStart - entry.startTime);
        }
      }
    });
    fidObserver.observe({ type: "first-input", buffered: true });
  } catch { /* unsupported */ }

  // ── INP (Interaction to Next Paint) ──
  try {
    let inpValue = 0;
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as PerformanceEntry & { duration?: number };
        if (eventEntry.duration && eventEntry.duration > inpValue) {
          inpValue = eventEntry.duration;
        }
      }
    });
    inpObserver.observe({ type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
    addEventListener("pagehide", () => {
      inpObserver.disconnect();
      if (inpValue > 0) reportVital("INP", inpValue);
    }, { once: true });
  } catch { /* unsupported */ }

  // ── CLS (Cumulative Layout Shift) ──
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutEntry.hadRecentInput && layoutEntry.value) {
          clsValue += layoutEntry.value;
        }
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
    addEventListener("pagehide", () => {
      clsObserver.disconnect();
      reportVital("CLS", clsValue);
    }, { once: true });
  } catch { /* unsupported */ }

  // ── FCP (First Contentful Paint) ──
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          reportVital("FCP", entry.startTime);
        }
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });
  } catch { /* unsupported */ }

  // ── TTFB (Time to First Byte) ──
  try {
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      if (ttfb > 0) reportVital("TTFB", ttfb);
    }
  } catch { /* unsupported */ }
}

// ---------------------------------------------------------------------------
// Auto-init on import (client only)
// ---------------------------------------------------------------------------

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initWebVitals(), { once: true });
  } else {
    initWebVitals();
  }
}