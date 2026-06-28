"use client";

/**
 * ============================================================================
 * WebVitalsReporter — Mounts Core Web Vitals tracking (Wave 18)
 * ============================================================================
 * Renders nothing. On mount, starts `PerformanceObserver`-based tracking
 * for LCP / CLS / INP / FCP / TTFB and forwards each as a `web_vital`
 * PostHog event.
 *
 * Design:
 *   - Renders nothing (no DOM, no JSX).
 *   - Mounted once in `app/layout.tsx` next to PostHogProvider.
 *   - Dev mode: console.debug each metric for fast inspection.
 *   - Prod: silent — PostHog carries the signal.
 *
 * Why not just wire into PostHogProvider?
 *   - Keeps web-vitals concerns separate from analytics bootstrap.
 *   - Allows future onVital() subscribers (Sentry, custom logger) without
 *     touching PostHog code.
 * ============================================================================
 */

import { useEffect } from "react";
import { startWebVitals, onVital, type VitalReport } from "@/lib/monitoring/web-vitals";

export function WebVitalsReporter() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stop = startWebVitals();

    let devOff: (() => void) | null = null;
    if (process.env.NODE_ENV !== "production") {
      devOff = onVital((r: VitalReport) => {
        // eslint-disable-next-line no-console
        console.debug(
          `[web-vital] ${r.metric}=${r.value}ms (${r.rating}) @ ${r.route}`,
        );
      });
    }

    return () => {
      stop();
      devOff?.();
    };
  }, []);

  return null;
}

export default WebVitalsReporter;