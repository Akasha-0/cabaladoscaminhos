/**
 * monitoring/posthog — PostHog analytics (Wave 11)
 * ============================================================================
 * Thin fetch-based wrapper around PostHog's /capture and /decide endpoints.
 * Zero runtime deps — usa fetch nativo.
 *
 * Modos:
 *   - SEM env (dev): no-op silencioso, console.debug em NODE_ENV=development.
 *   - COM env (prod): enfileira eventos e envia em batch via /batch endpoint.
 *
 * Client vs Server:
 *   - Client: window.akasha.posthog (singleton) — identifica distinct_id por
 *     usuario Supabase ou anon-id gerado.
 *   - Server: chamada direta a /capture (sem batch) — eventos de webhook.
 *
 * Refs:
 *   - https://posthog.com/docs/api/capture
 *   - https://posthog.com/docs/api/batch
 *   - docs/MONITORING-WAVE11.md
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PostHogEvent {
  /** Nome do evento (snake_case recomendado). */
  name: string;
  /** Propriedades customizadas. */
  properties?: Record<string, unknown>;
  /** Distinct ID — anon id ou user id. */
  distinctId?: string;
  /** Timestamp (ms epoch). Default: Date.now(). */
  timestamp?: number;
}

export interface PostHogProvider {
  /** Identifica o usuario (chame apos login). */
  identify(distinctId: string, properties?: Record<string, unknown>): void;
  /** Reseta identification (chame em logout). */
  reset(): void;
  /** Captura um evento. */
  capture(event: PostHogEvent): void;
  /** Flush forçado da fila (ex: beforeunload). */
  flush(): Promise<void>;
  /** Indica se PostHog esta' ativo. */
  isEnabled(): boolean;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

interface PostHogConfig {
  apiKey: string;
  host: string;
  enabled: boolean;
  /** Sample rate 0..1 — 1.0 = envia tudo. */
  sampleRate: number;
  /** Disabled override (POSTHOG_DISABLED=true). */
  disabled: boolean;
}

function loadConfig(): PostHogConfig {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.POSTHOG_PROJECT_API_KEY ?? "";
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  const disabled = process.env.POSTHOG_DISABLED === "true";
  const enabled = Boolean(apiKey) && !disabled && process.env.NODE_ENV !== "test";

  return {
    apiKey,
    host: host.replace(/\/$/, ""),
    enabled,
    sampleRate: parseFloat(process.env.POSTHOG_SAMPLE_RATE ?? "1.0"),
    disabled,
  };
}

// ---------------------------------------------------------------------------
// Client provider (browser singleton)
// ---------------------------------------------------------------------------

const QUEUE: Array<{ event: string; properties: Record<string, unknown>; timestamp: string }> = [];
const QUEUE_MAX = 50;
const FLUSH_INTERVAL_MS = 5_000;
const FLUSH_SIZE = 20;

interface WindowWithPosthog {
  akasha?: {
    posthog?: PostHogProvider & {
      _queue: typeof QUEUE;
      _config: PostHogConfig;
      _distinctId: string;
    };
  };
}

function getOrInitClientProvider(): PostHogProvider | null {
  if (typeof window === "undefined") return null;

  const w = window as unknown as WindowWithPosthog;
  if (w.akasha?.posthog) {
    // wrapper exposing only the public API
    return wrap(w.akasha.posthog);
  }

  const config = loadConfig();
  let distinctId = readAnonymousId();
  if (!distinctId) {
    distinctId = `anon_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    writeAnonymousId(distinctId);
  }

  const queue: typeof QUEUE = [];

  // Flush periodico
  let flushing = false;
  const flush = async () => {
    if (flushing || queue.length === 0) return;
    if (!config.enabled) {
      queue.length = 0;
      return;
    }
    flushing = true;
    const batch = queue.splice(0, FLUSH_SIZE);
    try {
      const response = await fetch(`${config.host}/batch/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: config.apiKey,
          batch: batch.map((evt) => ({
            event: evt.event,
            properties: {
              ...evt.properties,
              distinct_id: distinctId,
              $lib: "akasha-portal-fetch",
              $lib_version: "1.0.0",
            },
            timestamp: evt.timestamp,
          })),
        }),
        keepalive: true,
      });
      if (!response.ok) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[posthog] batch falhou", response.status);
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[posthog] batch erro de rede", err);
      }
    } finally {
      flushing = false;
      if (queue.length > 0) void flush();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      void flush();
    });
    setInterval(() => {
      void flush();
    }, FLUSH_INTERVAL_MS);
  }

  const provider: PostHogProvider & {
    _queue: typeof QUEUE;
    _config: PostHogConfig;
    _distinctId: string;
  } = {
    _queue: queue,
    _config: config,
    _distinctId: distinctId,
    isEnabled: () => config.enabled,
    identify: (id, props) => {
      distinctId = id;
      writeUserId(id);
      queue.push({
        event: "$identify",
        properties: {
          $set: { ...(props ?? {}), id },
          $user_id: id,
        },
        timestamp: new Date().toISOString(),
      });
      if (queue.length >= FLUSH_SIZE) void flush();
    },
    reset: () => {
      distinctId = `anon_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
      writeAnonymousId(distinctId);
      clearUserId();
    },
    capture: (evt) => {
      if (!config.enabled) return;
      if (Math.random() > config.sampleRate) return;
      queue.push({
        event: evt.name,
        properties: {
          ...(evt.properties ?? {}),
          distinct_id: evt.distinctId ?? distinctId,
          $current_url: typeof window !== "undefined" ? window.location.href : undefined,
          $pathname: typeof window !== "undefined" ? window.location.pathname : undefined,
          $lib: "akasha-portal-fetch",
          $lib_version: "1.0.0",
        },
        timestamp: new Date(evt.timestamp ?? Date.now()).toISOString(),
      });
      if (process.env.NODE_ENV !== "production") {
        console.debug("[posthog]", evt.name, evt.properties ?? {});
      }
      if (queue.length >= FLUSH_SIZE) void flush();
    },
    flush,
  };

  if (!w.akasha) w.akasha = {};
  w.akasha.posthog = provider;
  return wrap(provider);
}

function wrap(
  inner: PostHogProvider & {
    _queue: typeof QUEUE;
    _config: PostHogConfig;
    _distinctId: string;
  },
): PostHogProvider {
  return {
    isEnabled: () => inner._config.enabled,
    identify: (id, props) => inner.identify(id, props),
    reset: () => inner.reset(),
    capture: (evt) => inner.capture(evt),
    flush: () => inner.flush(),
  };
}

// ---------------------------------------------------------------------------
// Server provider (per-call, no batch)
// ---------------------------------------------------------------------------

async function captureServer(event: PostHogEvent): Promise<void> {
  const config = loadConfig();
  if (!config.enabled) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[posthog:server]", event.name, event.properties ?? {});
    }
    return;
  }
  if (Math.random() > config.sampleRate) return;

  const distinctId = event.distinctId ?? `server_${Date.now().toString(36)}`;
  try {
    const response = await fetch(`${config.host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: config.apiKey,
        event: event.name,
        properties: {
          ...(event.properties ?? {}),
          distinct_id: distinctId,
          $lib: "akasha-portal-fetch-server",
          $lib_version: "1.0.0",
        },
        timestamp: new Date(event.timestamp ?? Date.now()).toISOString(),
      }),
      keepalive: true,
    });
    if (!response.ok && process.env.NODE_ENV !== "production") {
      console.warn("[posthog:server] capture falhou", response.status);
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[posthog:server] erro de rede", err);
    }
  }
}

// ---------------------------------------------------------------------------
// Anonymous id persistence (localStorage + cookies)
// ---------------------------------------------------------------------------

const ANON_KEY = "akasha.posthog.anon_id";
const USER_KEY = "akasha.posthog.user_id";

function readAnonymousId(): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(ANON_KEY);
    }
  } catch { /* sandboxed */ }
  return readCookie(ANON_KEY);
}

function writeAnonymousId(id: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ANON_KEY, id);
      return;
    }
  } catch { /* sandboxed */ }
  writeCookie(ANON_KEY, id, 365);
}

function writeUserId(id: string): void {
  writeCookie(USER_KEY, id, 30);
}

function clearUserId(): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(USER_KEY);
  } catch { /* sandboxed */ }
  writeCookie(USER_KEY, "", -1);
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ?? null;
}

function writeCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getPostHog(): PostHogProvider | null {
  return getOrInitClientProvider();
}

export async function captureServerEvent(event: PostHogEvent): Promise<void> {
  return captureServer(event);
}

/**
 * Helper universal — client usa singleton, server usa capture direto.
 * Retorna void; falhas sao silenciosas (analytics nao deve quebrar UX).
 */
export function track(name: string, properties?: Record<string, unknown>): void {
  const client = getPostHog();
  if (client) {
    client.capture({ name, properties });
    return;
  }
  // Server-side: fire-and-forget
  void captureServer({ name, properties });
}

// ---------------------------------------------------------------------------
// Event catalog (semantic helpers)
// ---------------------------------------------------------------------------

export const events = {
  pageView: (path: string, properties?: Record<string, unknown>) =>
    track("page_view", { path, ...properties }),

  postCreate: (postId: string, properties?: Record<string, unknown>) =>
    track("post_create", { postId, ...properties }),

  like: (targetType: "post" | "comment", targetId: string) =>
    track("like", { targetType, targetId }),

  follow: (targetUserId: string, action: "follow" | "unfollow") =>
    track("follow", { targetUserId, action }),

  search: (query: string, resultCount?: number) =>
    track("search", { query, resultCount }),

  libraryRead: (articleId: string, tradition?: string) =>
    track("library_read", { articleId, tradition }),

  akashicChat: (messageLength: number, tradition?: string) =>
    track("akashic_chat", { messageLength, tradition }),

  // Wave 34 — Blog + SEO funnel
  blogView: (slug: string, properties?: Record<string, unknown>) =>
    track("blog_view", { slug, ...properties }),

  blogScroll: (
    slug: string,
    percent: 50 | 100,
    properties?: Record<string, unknown>,
  ) =>
    track("blog_scroll", { slug, percent, ...properties }),

  blogShare: (
    slug: string,
    platform: string,
    properties?: Record<string, unknown>,
  ) =>
    track("blog_share", { slug, platform, ...properties }),

  landingCtaClick: (
    landing: string,
    ctaLabel: string,
    properties?: Record<string, unknown>,
  ) =>
    track("landing_cta_click", { landing, ctaLabel, ...properties }),

  // Wave 34 — Marketplace intent (from Product JSON-LD pages)
  productIntent: (
    slug: string,
    action: "view" | "checkout_start" | "purchase",
    properties?: Record<string, unknown>,
  ) =>
    track("product_intent", { slug, action, ...properties }),

  // Wave 34 — SEO search (organic traffic source identifier)
  seoLanding: (
    landing: string,
    properties?: Record<string, unknown>,
  ) =>
    track("seo_landing", { landing, ...properties }),
};

// ---------------------------------------------------------------------------
// Status check (para health endpoint)
// ---------------------------------------------------------------------------

export async function checkPostHogHealth(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const config = loadConfig();
  const start = Date.now();
  if (!config.enabled) {
    return { ok: true, latencyMs: 0, error: config.disabled ? "disabled" : "no_api_key" };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${config.host}/_health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { ok: response.ok, latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: String(err) };
  }
}