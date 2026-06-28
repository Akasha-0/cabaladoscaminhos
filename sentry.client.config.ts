/**
 * sentry.client.config.ts — Sentry client bootstrap (Wave 11)
 * ============================================================================
 * Next.js carrega este arquivo automaticamente quando SENTRY_DSN esta setado
 * (vide docs/MONITORING-WAVE11.md). Em dev ou sem DSN, e' um no-op.
 *
 * Por que fetch-nativo e nao @sentry/nextjs:
 *   - Wave 11: zero deps novas.
 *   - Inicializacao client-side: capture de uncaught errors + console.error.
 *
 * Source maps:
 *   - Configurados via SENTRY_RELEASE env (matching `vercel.json` build id).
 *   - Upload CLI: `npx @sentry/cli releases new $SENTRY_RELEASE &&
 *                  npx @sentry/cli releases files $SENTRY_RELEASE upload-sourcemaps .next`
 *   - Documentado em docs/MONITORING-WAVE11.md.
 * ============================================================================
 */

import { initSentry, captureException } from "./src/lib/monitoring/sentry";

initSentry({
  // Hook beforeSend: drop eventos em dev local; em prod passa direto.
  beforeSend: (event) => {
    if (process.env.NODE_ENV !== "production") return null;
    return event;
  },
});

// Em browser: captura uncaught errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    captureException(event.error ?? new Error(event.message), {
      tags: { source: "window.error" },
      extra: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    captureException(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { tags: { source: "unhandledrejection" } },
    );
  });
}