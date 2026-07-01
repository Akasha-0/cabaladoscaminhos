/**
 * errors/recovery — Wave 36 client-side error recovery strategy
 * ============================================================================
 * Maps HTTP error classes to retry + UX strategies:
 *
 *   5xx   → retry with exponential backoff (3 tries max), then "reportar" CTA
 *   404   → friendly fallback page (already exists at /not-found)
 *   403   → re-auth prompt → redirect to /login?from=<current-route>
 *   429   → exponential backoff + user-facing "aguarde Xs" toast
 *   0/Err → offline mode detection + reconnect banner
 *
 * Pure / framework-free: importable from server components, client components,
 * and route handlers. The `retryFetch` helper is the only side-effecting util.
 *
 * LGPD: recovery strategies never log request bodies — only status + URL.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecoveryClass = "5xx" | "404" | "403" | "429" | "network" | "unknown";

export interface RecoveryStrategy {
  class: RecoveryClass;
  /** Max retry attempts (0 = no retry). */
  maxRetries: number;
  /** Initial backoff in ms; doubles per attempt. */
  backoffMs: number;
  /** User-facing label (pt-BR). */
  userMessage: string;
  /** Recovery action the UI should offer. */
  action: "retry" | "fallback" | "reauth" | "backoff" | "offline" | "report";
  /** Optional redirect target for reauth/fallback flows. */
  redirectTo?: string;
}

const STRATEGIES: Record<RecoveryClass, RecoveryStrategy> = {
  "5xx": {
    class: "5xx",
    maxRetries: 3,
    backoffMs: 500,
    userMessage: "O servidor teve um problema. Tentando novamente…",
    action: "retry",
  },
  "404": {
    class: "404",
    maxRetries: 0,
    backoffMs: 0,
    userMessage: "Página não encontrada.",
    action: "fallback",
    redirectTo: "/not-found",
  },
  "403": {
    class: "403",
    maxRetries: 0,
    backoffMs: 0,
    userMessage: "Sua sessão expirou. Faça login novamente.",
    action: "reauth",
    redirectTo: "/login",
  },
  "429": {
    class: "429",
    maxRetries: 5,
    backoffMs: 1000,
    userMessage: "Muitas requisições em pouco tempo. Aguarde alguns segundos.",
    action: "backoff",
  },
  network: {
    class: "network",
    maxRetries: 2,
    backoffMs: 1500,
    userMessage: "Você parece estar offline. Reconectando…",
    action: "offline",
  },
  unknown: {
    class: "unknown",
    maxRetries: 1,
    backoffMs: 1000,
    userMessage: "Algo deu errado. Tente novamente.",
    action: "retry",
  },
};

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

export function classify(status: number | null): RecoveryClass {
  if (status === null) return "network";
  if (status === 404) return "404";
  if (status === 403) return "403";
  if (status === 429) return "429";
  if (status >= 500 && status < 600) return "5xx";
  return "unknown";
}

export function getStrategy(cls: RecoveryClass): RecoveryStrategy {
  return STRATEGIES[cls];
}

// ---------------------------------------------------------------------------
// Browser online/offline detection (SSR-safe)
// ---------------------------------------------------------------------------

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true; // SSR: assume online
  return navigator.onLine !== false;
}

export function onConnectivityChange(cb: (online: boolean) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const on = () => cb(true);
  const off = () => cb(false);
  window.addEventListener("online", on);
  window.addEventListener("offline", off);
  return () => {
    window.removeEventListener("online", on);
    window.removeEventListener("offline", off);
  };
}

// ---------------------------------------------------------------------------
// Retry helper — exponential backoff with jitter
// ---------------------------------------------------------------------------

export interface RetryOptions {
  maxRetries?: number;
  baseBackoffMs?: number;
  /** Optional abort signal — cancels retry loop. */
  signal?: AbortSignal;
  /** Decide whether to retry given a Response. Default: only 5xx + 429. */
  shouldRetry?: (res: Response) => boolean;
}

export async function retryFetch(
  url: string,
  init: RequestInit = {},
  opts: RetryOptions = {},
): Promise<Response> {
  const maxRetries = opts.maxRetries ?? STRATEGIES["5xx"].maxRetries;
  const base = opts.baseBackoffMs ?? STRATEGIES["5xx"].backoffMs;
  const shouldRetry = opts.shouldRetry ?? ((res) => res.status >= 500 || res.status === 429);

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const res = await fetch(url, { ...init, signal: opts.signal });
      if (res.ok || !shouldRetry(res) || attempt === maxRetries) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
      if (attempt === maxRetries) throw err;
    }
    // Exponential backoff + jitter (0..0.5x base).
    const exp = base * 2 ** attempt;
    const jitter = Math.random() * base * 0.5;
    const wait = Math.min(exp + jitter, 10_000);
    await new Promise((r) => setTimeout(r, wait));
  }
  throw lastErr instanceof Error ? lastErr : new Error("retryFetch exhausted");
}

// ---------------------------------------------------------------------------
// Recovery plan — combined classifier + retry wrapper
// ---------------------------------------------------------------------------

export interface RecoveryPlan {
  strategy: RecoveryStrategy;
  /** Convenience: should we retry? */
  retryable: boolean;
  /** Convenience: where to redirect (reauth/fallback). */
  redirectTo: string | null;
  /** Hint for UI toast severity. */
  toastSeverity: "info" | "warning" | "error";
}

export function planFor(status: number | null): RecoveryPlan {
  const cls = classify(status);
  const strat = STRATEGIES[cls];
  return {
    strategy: strat,
    retryable: strat.maxRetries > 0,
    redirectTo: strat.redirectTo ?? null,
    toastSeverity: cls === "network" ? "warning" : cls === "5xx" ? "error" : "info",
  };
}

// ---------------------------------------------------------------------------
// Retry-with-plan — single-call convenience for route handlers / clients
// ---------------------------------------------------------------------------

export async function fetchWithRecovery(
  url: string,
  init: RequestInit = {},
  opts: RetryOptions = {},
): Promise<{ ok: boolean; status: number; res: Response | null; error: string | null; plan: RecoveryPlan }> {
  try {
    const res = await retryFetch(url, init, opts);
    return {
      ok: res.ok,
      status: res.status,
      res,
      error: res.ok ? null : `HTTP ${res.status}`,
      plan: planFor(res.status),
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      res: null,
      error: err instanceof Error ? err.message : String(err),
      plan: planFor(null),
    };
  }
}