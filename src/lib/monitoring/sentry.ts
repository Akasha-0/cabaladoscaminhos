/**
 * monitoring/sentry — Sentry error tracking (Wave 11)
 * ============================================================================
 * Thin fetch-based wrapper around Sentry's Envelope API. Zero runtime deps.
 *
 * Como funciona:
 *   1. Em dev ou sem SENTRY_DSN, todas as funções viram no-op (logger local).
 *   2. Em prod com SENTRY_DSN, monta um envelope Sentry e envia via fetch
 *      para {DSN}/envelope/?sentry_key=...&sentry_version=7.
 *
 * Por que fetch nativo (e não @sentry/nextjs):
 *   - Restrição do Wave 11: NÃO adicionar deps.
 *   - Sentry Envelope API é simples e estável.
 *   - Sem source-maps upload automatico — vamos injetar release/config via
 *     env (SENTRY_RELEASE, SENTRY_ORG, SENTRY_PROJECT) + script CLI opcional.
 *
 * PII filtering (LGPD):
 *   - Strip de chaves conhecidas (email, password, token, authorization,
 *     cookie, cpf, cnpj, phone, jwt, secret).
 *   - beforeSend hook permite adicionar campos customizados a filtrar.
 *
 * Integração com logger:
 *   - `captureException(error, context)` enriquece LogContext.
 *   - `withSentry(handler)` wrap em rotas /api para auto-capture de 500s.
 *
 * Refs:
 *   - https://develop.sentry.dev/sdk/envelopes/
 *   - docs/MONITORING-WAVE11.md
 * ============================================================================
 */

import { logger } from "../logging";
import { ErrorCode } from "../error-handling";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SentryContext {
  /** Tags — strings curtas indexaveis (ambiente, release, route). */
  tags?: Record<string, string>;
  /** Extra — payload maior, nao indexado. */
  extra?: Record<string, unknown>;
  /** User — nunca inclui email/password — só id/handle. */
  user?: { id?: string; username?: string };
  /** Nivel padrao do evento. */
  level?: "debug" | "info" | "warning" | "error" | "fatal";
}

export interface SentryBreadcrumb {
  type?: "default" | "http" | "navigation" | "ui" | "user";
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
  level?: "debug" | "info" | "warning" | "error";
}

interface SentryEvent {
  event_id: string;
  timestamp: number;
  platform: "javascript" | "node";
  level: SentryContext["level"];
  logger?: string;
  transaction?: string;
  server_name?: string;
  release?: string;
  environment?: string;
  tags: Record<string, string>;
  extra: Record<string, unknown>;
  user?: SentryContext["user"];
  breadcrumbs: { values: SentryBreadcrumb[] };
  exception?: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: { frames: Array<{ filename: string; function: string; lineno?: number; colno?: number }> };
    }>;
  };
  message?: { formatted: string };
}

// ---------------------------------------------------------------------------
// PII filtering
// ---------------------------------------------------------------------------

const PII_KEYS = new Set([
  "email",
  "password",
  "pass",
  "pwd",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "cookie",
  "set-cookie",
  "session",
  "cpf",
  "cnpj",
  "phone",
  "telefone",
  "jwt",
  "secret",
  "api_key",
  "apikey",
  "private_key",
  "credit_card",
  "card_number",
  "cvv",
  "ssn",
  "birthdate",
  "data_nascimento",
]);

const REDACTED = "[REDACTED]";

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 5) return REDACTED; // anti-circular
  if (value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redactValue(v, depth + 1));
  if (typeof value !== "object") return value;

  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (PII_KEYS.has(k.toLowerCase())) {
      result[k] = REDACTED;
    } else {
      result[k] = redactValue(v, depth + 1);
    }
  }
  return result;
}

function redactContext(ctx: SentryContext | undefined): SentryContext | undefined {
  if (!ctx) return ctx;
  return {
    ...ctx,
    tags: ctx.tags ? (redactValue(ctx.tags) as Record<string, string>) : undefined,
    extra: ctx.extra ? (redactValue(ctx.extra) as Record<string, unknown>) : undefined,
    // user e' intencionalmente ja' higienizado pelo caller — so' id/username
    user: ctx.user,
  };
}

// ---------------------------------------------------------------------------
// DSN parsing
// ---------------------------------------------------------------------------

interface DsnParts {
  protocol: string;
  publicKey: string;
  host: string;
  projectId: string;
}

function parseDsn(dsn: string): DsnParts | null {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace(/^\//, "");
    if (!publicKey || !projectId) return null;
    return {
      protocol: url.protocol,
      publicKey,
      host: url.host,
      projectId,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

interface SentryConfig {
  enabled: boolean;
  dsn: DsnParts | null;
  environment: string;
  release: string | undefined;
  serverName: string | undefined;
  /** Sample rate (0..1). Default 1.0 em prod, 0.0 em dev. */
  sampleRate: number;
  /** Hook para transformar evento antes de enviar (PII extra, etc). */
  beforeSend?: (event: SentryEvent) => SentryEvent | null;
}

let config: SentryConfig = {
  enabled: false,
  dsn: null,
  environment: process.env.NODE_ENV || "development",
  release: process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_APP_VERSION,
  serverName: process.env.SENTRY_SERVER_NAME || process.env.HOSTNAME,
  sampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0.0,
};

export function initSentry(options?: { beforeSend?: SentryConfig["beforeSend"] }): void {
  const dsnString = process.env.SENTRY_DSN;
  if (!dsnString) {
    config = { ...config, enabled: false };
    return;
  }
  const dsn = parseDsn(dsnString);
  if (!dsn) {
    logger.warn("[sentry] SENTRY_DSN invalido, Sentry desabilitado", { dsnString });
    config = { ...config, enabled: false };
    return;
  }
  config = {
    ...config,
    enabled: true,
    dsn,
    beforeSend: options?.beforeSend,
  };
  logger.info("[sentry] inicializado", {
    environment: config.environment,
    release: config.release,
  });
}

export function isSentryEnabled(): boolean {
  return config.enabled;
}

// ---------------------------------------------------------------------------
// Event construction
// ---------------------------------------------------------------------------

function uuid(): string {
  // RFC4122 v4 sem dependencia de crypto.randomUUID (compat SSR/Edge)
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function stackFromError(error: Error): SentryEvent["exception"] {
  const stack = error.stack ?? "";
  const frames = stack
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("at ") || line.startsWith("at\t"))
    .slice(0, 50)
    .map((line) => {
      // Formato "at funcName (file:line:col)" ou "at file:line:col"
      const match = line.match(/at\s+(?:(.+?)\s+\()?(.*?):(\d+):(\d+)\)?$/);
      if (!match) return { filename: line, function: "?" };
      return {
        function: match[1] || "?",
        filename: match[2] || "?",
        lineno: parseInt(match[3] || "0", 10),
        colno: parseInt(match[4] || "0", 10),
      };
    });

  return {
    values: [
      {
        type: error.name || "Error",
        value: error.message || String(error),
        stacktrace: frames.length > 0 ? { frames } : undefined,
      },
    ],
  };
}

function buildEvent(
  payload: {
    message?: string;
    error?: Error;
    context?: SentryContext;
    breadcrumbs?: SentryBreadcrumb[];
    platform: SentryEvent["platform"];
  },
): SentryEvent {
  const event: SentryEvent = {
    event_id: uuid(),
    timestamp: Date.now() / 1000,
    platform: payload.platform,
    level: payload.context?.level ?? (payload.error ? "error" : "info"),
    logger: "akasha-portal",
    server_name: config.serverName,
    release: config.release,
    environment: config.environment,
    tags: payload.context?.tags ?? {},
    extra: payload.context?.extra ?? {},
    user: payload.context?.user,
    breadcrumbs: { values: payload.breadcrumbs ?? [] },
  };

  if (payload.error) {
    event.exception = stackFromError(payload.error);
  } else if (payload.message) {
    event.message = { formatted: payload.message };
  }

  return event;
}

// ---------------------------------------------------------------------------
// Transport (fetch → Sentry envelope)
// ---------------------------------------------------------------------------

const breadcrumbsBuffer: SentryBreadcrumb[] = [];
const BREADCRUMB_MAX = 50;

async function sendEvent(event: SentryEvent): Promise<void> {
  if (!config.enabled || !config.dsn) return;

  // Sample rate
  if (Math.random() > config.sampleRate) return;

  // beforeSend hook
  let finalEvent = event;
  if (config.beforeSend) {
    try {
      const transformed = config.beforeSend(event);
      if (transformed === null) return; // dropped
      finalEvent = transformed;
    } catch (err) {
      logger.warn("[sentry] beforeSend hook falhou", { err: String(err) });
    }
  }

  const { protocol, host, publicKey, projectId } = config.dsn;
  const url = `${protocol}//${host}/api/${projectId}/store/?sentry_key=${encodeURIComponent(publicKey)}&sentry_version=7`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalEvent),
      keepalive: true,
    });
    if (!response.ok) {
      logger.warn("[sentry] envio falhou", { status: response.status });
    }
  } catch (err) {
    logger.warn("[sentry] erro de rede ao enviar", { err: String(err) });
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function captureException(error: Error | unknown, context?: SentryContext): void {
  const err = error instanceof Error ? error : new Error(String(error));
  const safeContext = redactContext(context);

  // Sempre log local primeiro
  logger.error(err.message, err, {
    sentryTags: safeContext?.tags,
    sentryExtra: safeContext?.extra,
  });

  if (!config.enabled) return;
  const event = buildEvent({
    error: err,
    context: safeContext,
    breadcrumbs: [...breadcrumbsBuffer],
    platform: typeof window === "undefined" ? "node" : "javascript",
  });
  // fire-and-forget
  void sendEvent(event);
}

export function captureMessage(
  message: string,
  level: SentryContext["level"] = "info",
  context?: SentryContext,
): void {
  const safeContext = redactContext(context);
  logger.info(`[sentry:message] ${message}`, safeContext?.extra);

  if (!config.enabled) return;
  const event = buildEvent({
    message,
    context: { ...safeContext, level },
    breadcrumbs: [...breadcrumbsBuffer],
    platform: typeof window === "undefined" ? "node" : "javascript",
  });
  void sendEvent(event);
}

export function addBreadcrumb(crumb: SentryBreadcrumb): void {
  const stamped: SentryBreadcrumb = {
    timestamp: Date.now() / 1000,
    level: "info",
    type: "default",
    ...crumb,
  };
  breadcrumbsBuffer.push(stamped);
  if (breadcrumbsBuffer.length > BREADCRUMB_MAX) {
    breadcrumbsBuffer.shift();
  }
}

export function clearBreadcrumbs(): void {
  breadcrumbsBuffer.length = 0;
}

/**
 * Set user context (id/username apenas — PII stripped).
 * Chame apos login; chame setUser(null) em logout.
 */
export function setUser(user: { id: string; username?: string } | null): void {
  if (!config.enabled) return;
  if (user === null) {
    void sendEvent({
      ...buildEvent({ message: "user cleared", platform: "javascript" }),
      tags: {},
      extra: {},
      breadcrumbs: { values: [] },
    });
    return;
  }
  // envia um "fake" event com user attached para indexar
  const event = buildEvent({
    message: `user: ${user.username ?? user.id}`,
    context: { user, level: "info" },
    platform: typeof window === "undefined" ? "node" : "javascript",
  });
  void sendEvent(event);
}

/**
 * Wrap um handler Next.js para auto-capture de exceptions nao tratadas.
 * Erros sao logados via logger e enviados ao Sentry; resposta e' 500.
 */
export function withSentry<T extends (...args: never[]) => Promise<Response>>(
  handler: T,
  options?: { routeName?: string },
): T {
  return (async (...args: never[]) => {
    try {
      return await handler(...args);
    } catch (err) {
      captureException(err, {
        tags: {
          route: options?.routeName ?? "unknown",
          environment: config.environment,
        },
      });
      // Re-throw para NextErrorBoundary lidar (ou retornar 500 generico)
      if (err instanceof Error) throw err;
      throw new Error(String(err));
    }
  }) as T;
}

// ---------------------------------------------------------------------------
// Error code mapping (integra com ErrorCode ja' existente no projeto)
// ---------------------------------------------------------------------------

export function captureAppError(
  error: Error & { code?: ErrorCode },
  context?: SentryContext,
): void {
  captureException(error, {
    ...context,
    tags: {
      ...context?.tags,
      errorCode: error.code ? String(error.code) : "unknown",
    },
  });
}

// ---------------------------------------------------------------------------
// Re-exports de tipos uteis
// ---------------------------------------------------------------------------

export type { SentryEvent };