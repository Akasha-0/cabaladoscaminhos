/**
 * sentry.server.config.ts — Sentry server bootstrap (Wave 11)
 * ============================================================================
 * Next.js carrega este arquivo em runtime server-side (Node) quando
 * SENTRY_DSN esta setado. Conecta-se com logger.ts para enviar erros de
 * rotas /api e server actions.
 *
 * Source maps upload:
 *   - Doc em docs/MONITORING-WAVE11.md.
 *   - Auto-upload opcional via @sentry/cli em CI (script `pnpm sentry:upload`).
 * ============================================================================
 */

import { initSentry, captureException } from "./src/lib/monitoring/sentry";

initSentry({
  beforeSend: (event) => {
    if (process.env.NODE_ENV !== "production") return null;
    // Strip stack frames internos do Next.js que poluem Sentry
    return event;
  },
});

// Captura unhandled rejections em runtime Node
if (typeof process !== "undefined") {
  process.on("uncaughtException", (err) => {
    captureException(err, { tags: { source: "uncaughtException" }, level: "fatal" });
  });
  process.on("unhandledRejection", (reason) => {
    captureException(
      reason instanceof Error ? reason : new Error(String(reason)),
      { tags: { source: "unhandledRejection" }, level: "error" },
    );
  });
}