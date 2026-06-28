/**
 * monitoring/web-vitals — Core Web Vitals tracker (Wave 18 perf quick wins)
 * ============================================================================
 * Implementa tracking de LCP / CLS / INP / FCP / TTFB usando SOMENTE a
 * `PerformanceObserver` API nativa. ZERO dependências externas — usa o
 * helper `track()` do PostHog (já existente em `@/lib/monitoring/posthog`)
 * para enviar métricas como eventos.
 *
 * Por que NÃO usar `web-vitals` package?
 *   - Pacote adiciona ~3 KB gzipped + ~1 KB de tipos.
 *   - PerformanceObserver cobre tudo que precisamos (LCP/CLS/INP/FCP/TTFB).
 *   - Sem dependência = menos supply chain risk + menos código para manter.
 *
 * Ratings (thresholds Core Web Vitals — Google):
 *   LCP:  good ≤ 2500ms, poor > 4000ms
 *   CLS:  good ≤ 0.10,  poor > 0.25
 *   INP:  good ≤ 200ms, poor > 500ms
 *   FCP:  good ≤ 1800ms, poor > 3000ms
 *   TTFB: good ≤ 800ms,  poor > 1800ms
 *
 * SSR-safe: todas as funções checam `typeof window` antes de tocar APIs.
 *
 * Usage:
 *   useEffect(() => { startWebVitals(); }, []);
 *
 * Event shape (consumido em PostHog como `web_vital` event):
 *   { metric, value, rating, route, ... }
 * ============================================================================
 */

import { track } from "./posthog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VitalMetric = "LCP" | "CLS" | "INP" | "FCP" | "TTFB";
export type VitalRating = "good" | "needs-improvement" | "poor";

export interface VitalReport {
  metric: VitalMetric;
  /** Final value for the metric (units depend on metric — see below). */
  value: number;
  /** Google rating bucket. */
  rating: VitalRating;
  /** Route path the metric was captured on. */
  route: string;
  /** Metric-specific identifier (largest element for LCP, etc). */
  id?: string;
}

export type VitalListener = (report: VitalReport) => void;

// ---------------------------------------------------------------------------
// Module state — singleton across the client app
// ---------------------------------------------------------------------------

const reportedMetrics = new Set<VitalMetric>();
const listeners = new Set<VitalListener>();
let started = false;
let cleanup: (() => void) | null = null;

// ---------------------------------------------------------------------------
// Rating thresholds
// ---------------------------------------------------------------------------

const THRESHOLDS: Record<
  VitalMetric,
  { good: number; poor: number }
> = {
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

export function rateVital(metric: VitalMetric, value: number): VitalRating {
  const t = THRESHOLDS[metric];
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

// ---------------------------------------------------------------------------
// Reporting — dispatches to listeners + PostHog
// ---------------------------------------------------------------------------

function currentRoute(): string {
  if (typeof window === "undefined") return "ssr";
  return window.location.pathname || "unknown";
}

function reportVital(metric: VitalMetric, value: number, id?: string): void {
  // Dedupe — emit final value once per metric per page load.
  if (reportedMetrics.has(metric)) return;
  reportedMetrics.add(metric);

  const report: VitalReport = {
    metric,
    value: roundValue(metric, value),
    rating: rateVital(metric, value),
    route: currentRoute(),
    id,
  };

  // Fan out to listeners (WebVitalsReporter wires it to console in dev).
  for (const listener of listeners) {
    try {
      listener(report);
    } catch {
      /* swallow — never break UX on analytics */
    }
  }

  // Always forward to PostHog (helper is no-op if disabled / no env).
  track("web_vital", {
    metric: report.metric,
    value: report.value,
    rating: report.rating,
    route: report.route,
    ...(report.id ? { id: report.id } : {}),
  });
}

function roundValue(metric: VitalMetric, value: number): number {
  // CLS is unitless decimal — keep 4 sig figs; everything else is ms (int).
  if (metric === "CLS") return Math.round(value * 10000) / 10000;
  return Math.round(value);
}

// ---------------------------------------------------------------------------
// Observers
// ---------------------------------------------------------------------------

/** LCP — observes `largest-contentful-paint` entries. */
function observeLCP(): () => void {
  let lcpValue = 0;
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const last = entries[entries.length - 1] as
      | PerformanceEntry
      | undefined;
    if (!last) return;
    lcpValue = last.startTime;
  });
  observer.observe({ type: "largest-contentful-paint", buffered: true });

  // LCP finalizes when the user scrolls away / hides / navigates.
  const finalize = () => {
    if (lcpValue > 0) reportVital("LCP", lcpValue);
    observer.disconnect();
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finalize();
    });
  }
  window.addEventListener("pagehide", finalize);

  return () => {
    finalize();
    window.removeEventListener("pagehide", finalize);
  };
}

/** CLS — observes `layout-shift` entries, accumulates session window. */
function observeCLS(): () => void {
  let clsValue = 0;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEntry[]) {
      const shift = (entry as PerformanceEntry & { value: number; hadRecentInput?: boolean }).value;
      const hadInput = (entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput;
      // Ignore shifts within 500ms of user input (clicks, taps, etc).
      if (hadInput) continue;
      clsValue += shift;
    }
  });
  observer.observe({ type: "layout-shift", buffered: true });

  const finalize = () => {
    if (clsValue > 0) reportVital("CLS", clsValue);
    observer.disconnect();
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finalize();
    });
  }
  window.addEventListener("pagehide", finalize);

  return () => {
    finalize();
    window.removeEventListener("pagehide", finalize);
  };
}

/** INP — observes `event` entries, keeps worst interaction-to-next-paint. */
function observeINP(): () => void {
  let worst = 0;
  let worstId: string | undefined;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEntry[]) {
      // `processingEnd - startTime` is the event handler duration,
      // the closest available proxy for INP in browsers without
      // the dedicated `interaction-to-next-paint` entry type.
      const e = entry as PerformanceEntry & {
        duration: number;
        startTime: number;
        processingEnd?: number;
        interactionId?: number;
      };
      const dur = e.processingEnd ? e.processingEnd - e.startTime : e.duration;
      if (dur > worst) {
        worst = dur;
        worstId = e.interactionId != null ? String(e.interactionId) : undefined;
      }
    }
  });
  observer.observe({ type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit);

  const finalize = () => {
    if (worst > 0) reportVital("INP", worst, worstId);
    observer.disconnect();
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finalize();
    });
  }
  window.addEventListener("pagehide", finalize);

  return () => {
    finalize();
    window.removeEventListener("pagehide", finalize);
  };
}

/** FCP — first contentful paint from paint timing entries. */
function observeFCP(): () => void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === "first-contentful-paint") {
        reportVital("FCP", entry.startTime);
        observer.disconnect();
        return;
      }
    }
  });
  observer.observe({ type: "paint", buffered: true });

  return () => observer.disconnect();
}

/** TTFB — derived from `navigation` entry (responseStart − requestStart). */
function observeTTFB(): () => void {
  const observer = new PerformanceObserver((list) => {
    const nav = list.getEntries()[0] as
      | (PerformanceEntry & {
          responseStart: number;
          requestStart: number;
        })
      | undefined;
    if (!nav) return;
    const ttfb = nav.responseStart - nav.requestStart;
    if (Number.isFinite(ttfb) && ttfb >= 0) {
      reportVital("TTFB", ttfb);
    }
    observer.disconnect();
  });
  observer.observe({ type: "navigation", buffered: true });

  return () => observer.disconnect();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Subscribe to web vitals. Returns an unsubscribe function.
 *
 * @example
 *   const off = onVital((r) => console.log("[vital]", r));
 *   // later: off();
 */
export function onVital(listener: VitalListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Start all PerformanceObservers. Idempotent — calling twice is a no-op.
 * Returns a cleanup function that disconnects all observers.
 */
export function startWebVitals(): () => void {
  if (typeof window === "undefined") return () => {};
  if (started) return cleanup ?? (() => {});
  started = true;

  // Reset dedupe for the new page-load.
  reportedMetrics.clear();

  const teardowns: Array<() => void> = [];
  try {
    teardowns.push(observeLCP());
    teardowns.push(observeCLS());
    teardowns.push(observeINP());
    teardowns.push(observeFCP());
    teardowns.push(observeTTFB());
  } catch (err) {
    // Some browsers (very old) lack PerformanceObserver. Fail open.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[web-vitals] observer setup failed", err);
    }
  }

  cleanup = () => {
    for (const t of teardowns) {
      try {
        t();
      } catch {
        /* ignore */
      }
    }
    started = false;
    cleanup = null;
  };

  return cleanup;
}

/**
 * Manual report — useful for custom timings (e.g. hydration completion).
 * Bypasses dedupe so callers can fire multiple times.
 */
export function reportCustomVital(
  metric: VitalMetric,
  value: number,
  id?: string,
): void {
  reportedMetrics.delete(metric); // allow re-report
  reportVital(metric, value, id);
}

export const WEB_VITAL_THRESHOLDS = THRESHOLDS;