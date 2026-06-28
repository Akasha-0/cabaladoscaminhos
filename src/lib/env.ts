/**
 * src/lib/env.ts — Centralized environment variable validation (Wave 27)
 * ============================================================================
 * Source of truth for ALL process.env.* reads in the Cabala dos Caminhos
 * codebase. Uses Zod to:
 *   1. Validate types at process startup (server-side only)
 *   2. Fail fast with a readable error if a required var is missing
 *   3. Provide typed access via `env` (no more `process.env.X` scattered)
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   const url = env.NEXT_PUBLIC_SUPABASE_URL;       // typed, validated
 *   if (env.isProduction) { ... }
 *
 * Conventions (mirrors .env.example):
 *   - NEXT_PUBLIC_*  → exposed to client (anon-safe)
 *   - server-only    → must never appear in client bundle
 *
 * IMPORTANT — this module is imported from server contexts only.
 * Do NOT import from React components that ship to the client unless you
 * only read NEXT_PUBLIC_* keys (those are safe by construction).
 *
 * Strategy:
 *   - In Production:    throws on missing required vars (fail-closed)
 *   - In Preview:       same as Production (Vercel preview = prod-like)
 *   - In Development:   logs warnings, returns object with `.missing: string[]`
 *                       so `next dev` can still start with a partial .env.local
 *   - In Test:          never throws — Vitest sets required vars per-test
 * ============================================================================
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Empty-string-tolerant string: Vercel preview deployments sometimes deliver
 * empty env vars when the value was removed in the dashboard. Treat `""` the
 * same as `undefined` for optional fields.
 */
const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

/** Coerces string → integer with sane default. Returns NaN-safe value. */
const intFromString = (defaultValue: number) =>
  z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return defaultValue;
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : defaultValue;
    });

/** Coerces string → float with sane default. */
const floatFromString = (defaultValue: number) =>
  z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return defaultValue;
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : defaultValue;
    });

/** Boolean from "true"/"1"/"false"/"0"/"" string. */
const boolFromString = z
  .string()
  .optional()
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    return v === "true" || v === "1";
  });

const boolFromStringWithDefault = (defaultValue: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return defaultValue;
      return v === "true" || v === "1";
    });

/** URL validator — accepts empty/undefined, validates format when set. */
const urlOrUndefined = z
  .string()
  .optional()
  .refine(
    (v) => v === undefined || v === "" || /^https?:\/\//.test(v),
    "Must be http(s) URL",
  )
  .transform((v) => (v === "" || v === undefined ? undefined : v));

// ---------------------------------------------------------------------------
// Schema — Server-only (NEVER expose in client bundle)
// ---------------------------------------------------------------------------

const serverSchema = z.object({
  // ---- 1. Database ----------------------------------------------------------
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // ---- 2. Supabase (server-only) -------------------------------------------
  SUPABASE_SERVICE_ROLE_KEY: optionalString,

  // ---- 3. Cache / Rate-limit -----------------------------------------------
  REDIS_URL: optionalString,

  // ---- 4. AI providers ------------------------------------------------------
  OPENAI_API_KEY: optionalString,
  OPENAI_MODEL: optionalString.transform((v) => v ?? "gpt-4o"),
  OPENAI_EMBEDDING_MODEL: optionalString.transform((v) => v ?? "text-embedding-3-small"),

  OPENAI_MAX_RETRIES: intFromString(3),
  OPENAI_INITIAL_DELAY_MS: intFromString(500),
  OPENAI_MAX_DELAY_MS: intFromString(8000),
  OPENAI_RETRY_MULTIPLIER: floatFromString(2),
  OPENAI_CIRCUIT_THRESHOLD: intFromString(5),
  OPENAI_CIRCUIT_TIMEOUT_MS: intFromString(30000),
  OPENAI_TEMPERATURE: floatFromString(0.7),
  OPENAI_MAX_TOKENS: intFromString(2000),
  OPENAI_FALLBACK_MODEL: optionalString.transform((v) => v ?? "gpt-4o-mini"),

  // MiniMax (Anthropic-compatible interface recommended)
  ANTHROPIC_BASE_URL: optionalString,
  ANTHROPIC_AUTH_TOKEN: optionalString,
  ANTHROPIC_MODEL: optionalString.transform((v) => v ?? "MiniMax-M3"),

  // MiniMax (OpenAI-compatible, legacy)
  MINIMAX_API_TOKEN: optionalString,
  MINIMAX_BASE_URL: optionalString,

  // Generic LLM provider selector
  LLM_PROVIDER: optionalString,

  // ---- 5. Web Push (VAPID) -------------------------------------------------
  VAPID_PRIVATE_KEY: optionalString,
  VAPID_SUBJECT: optionalString.transform((v) => v ?? "mailto:admin@akasha.app"),

  // ---- 5b. Cron auth --------------------------------------------------------
  CRON_SECRET: optionalString,

  // ---- 6. Email (Resend) ----------------------------------------------------
  RESEND_API_KEY: optionalString,
  NOTIFICATION_EMAIL_FROM: optionalString,
  NEWSLETTER_FROM_NAME: optionalString,
  NEWSLETTER_FROM_EMAIL: optionalString,
  NEWSLETTER_REPLY_TO: optionalString,

  // ---- 7. Observabilidade ---------------------------------------------------
  POSTHOG_PROJECT_API_KEY: optionalString,
  POSTHOG_DISABLED: boolFromStringWithDefault(false),
  POSTHOG_SAMPLE_RATE: floatFromString(1.0),

  SENTRY_DSN: optionalString,
  SENTRY_RELEASE: optionalString,
  SENTRY_SERVER_NAME: optionalString,
  SENTRY_SAMPLE_RATE: floatFromString(1.0),
  SENTRY_AUTH_TOKEN: optionalString,
  SENTRY_ORG: optionalString,
  SENTRY_PROJECT: optionalString,

  // PM feedback webhook (feature requests → internal channel)
  PM_FEEDBACK_WEBHOOK_URL: optionalString,

  // ---- 8. App config (server-only) -----------------------------------------
  APP_URL: optionalString,

  // ---- 9. CORS --------------------------------------------------------------
  ALLOWED_ORIGINS: optionalString,

  // ---- 10. Admin ------------------------------------------------------------
  ADMIN_EMAILS: optionalString,
  ADMIN_NEWSLETTER_SECRET: optionalString,

  // ---- Audit (LGPD) ---------------------------------------------------------
  AUDIT_IP_SALT: optionalString,

  // ---- Health endpoint ------------------------------------------------------
  HEALTH_REQUIRE_ALL: boolFromStringWithDefault(false),

  // ---- Misc -----------------------------------------------------------------
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// ---------------------------------------------------------------------------
// Schema — Client-safe (NEXT_PUBLIC_* only)
// ---------------------------------------------------------------------------

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: urlOrUndefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  NEXT_PUBLIC_APP_URL: optionalString,
  NEXT_PUBLIC_BASE_URL: optionalString,
  NEXT_PUBLIC_APP_VERSION: optionalString,
  NEXT_PUBLIC_SITE_URL: optionalString,
  NEXT_PUBLIC_IMAGE_CDN: optionalString,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_HOST: optionalString.transform((v) => v ?? "https://us.i.posthog.com"),
  NEXT_PUBLIC_WEB_VITALS: boolFromStringWithDefault(true),
});

// ---------------------------------------------------------------------------
// Combine
// ---------------------------------------------------------------------------

const fullSchema = serverSchema.merge(clientSchema);

export type Env = z.infer<typeof fullSchema>;

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

interface LoadResult {
  ok: boolean;
  env?: Env;
  missing: string[];
  invalid: Array<{ key: string; reason: string }>;
  /** Skipped validation (e.g. in test runner). */
  skipped: boolean;
}

function loadEnv(): LoadResult {
  // Test environments — Vitest sets vars per-test; we don't want to crash suite.
  if (process.env.NODE_ENV === "test" || process.env.SKIP_ENV_VALIDATION === "true") {
    return {
      ok: true,
      env: fullSchema.parse({
        // provide required-key placeholders so .parse() doesn't throw
        DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://test:test@localhost:5432/test",
      }),
      missing: [],
      invalid: [],
      skipped: true,
    };
  }

  const result = fullSchema.safeParse(process.env);

  if (result.success) {
    return { ok: true, env: result.data, missing: [], invalid: [], skipped: false };
  }

  // Distinguish "missing" vs "invalid" so error message is actionable.
  const flat = result.error.flatten();
  const missing: string[] = [];
  const invalid: Array<{ key: string; reason: string }> = [];

  for (const [key, messages] of Object.entries(flat.fieldErrors)) {
    if (!messages || messages.length === 0) continue;
    if (messages.some((m) => /required/i.test(m))) {
      missing.push(key);
    } else {
      invalid.push({ key, reason: messages.join("; ") });
    }
  }

  return { ok: false, missing, invalid, skipped: false };
}

const loadResult = loadEnv();

// ---------------------------------------------------------------------------
// Startup behavior
// ---------------------------------------------------------------------------

const isProduction = loadResult.env?.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

if (!loadResult.ok) {
  const lines: string[] = [];
  lines.push("❌ [env] validation failed");
  if (loadResult.missing.length > 0) {
    lines.push(`  Missing (${loadResult.missing.length}):`);
    for (const key of loadResult.missing) lines.push(`    - ${key}`);
  }
  if (loadResult.invalid.length > 0) {
    lines.push(`  Invalid (${loadResult.invalid.length}):`);
    for (const { key, reason } of loadResult.invalid) lines.push(`    - ${key}: ${reason}`);
  }
  lines.push("  → See .env.example for the full list of supported vars.");
  lines.push("  → In Vercel: Project → Settings → Environment Variables.");
  lines.push("  → For local dev: copy .env.example to .env.local and fill values.");

  const msg = lines.join("\n");

  if (isProduction || isTest) {
    // Fail-fast in prod-like contexts.
     
    console.error(msg);
    throw new Error("Invalid environment configuration — see logs above.");
  } else {
    // Development: warn loudly but allow next dev to start with partial env.
     
    console.warn(msg);
  }
} else if (!loadResult.skipped) {
   
  console.log(`✅ [env] validated (${loadResult.env?.NODE_ENV})`);
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

/**
 * Validated, typed environment.
 *
 * In production, this is guaranteed to satisfy the schema (or throw at startup).
 * In development, missing keys are allowed but logged — `env.DATABASE_URL` may
 * be undefined; consumers should handle that case explicitly.
 */
export const env: Env = loadResult.env ?? (process.env as unknown as Env);

/** True when running in Vercel production environment. */
export const isProductionEnv = isProduction;

/** True when running in Vercel preview environment. */
export const isPreviewEnv = process.env.VERCEL_ENV === "preview";

/** True when running on Vercel (any environment). */
export const isVercel = Boolean(process.env.VERCEL);

/** Git SHA of current deployment (if available). */
export const deploySha =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.SENTRY_RELEASE ?? "local";

/**
 * List of keys missing from process.env at startup. Useful for diagnostic
 * surfaces (e.g. /api/health in dev) — never expose in production responses.
 */
export const missingEnvKeys: readonly string[] = Object.freeze(loadResult.missing);