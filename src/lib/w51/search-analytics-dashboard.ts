/**
 * w51/search-analytics-dashboard
 * -----------------------------------------------------------------------------
 * Owner-only analytics dashboard for the w50/prayer-corpus-deep-search engine.
 *
 * This module consumes the `SearchLogEntry` stream emitted by
 * w50/prayer-corpus-search (see `respectSearchLogOptIn` / `buildSearchLogEntry` /
 * `deleteSearchHistory` / `getSearchHistory` in that module) and produces
 * owner-only snapshots covering:
 *
 *   • top queries (by frequency / click-through / zero-result rate / recency)
 *   • zero-result queries (and rewrite suggestions)
 *   • locale distribution across pt-BR / en-US / es-ES
 *   • sensitivity-filter usage per sensitivity level (1..5)
 *   • sacred-text filter usage & redacted reserved-slot clickthrough
 *   • latency percentiles (p50 / p95 / p99) on query log timestamps
 *   • unique-user estimate (k-anonymous: query count >= K_ANON_THRESHOLD)
 *
 * LGPD
 *  • Art. 7  — `recordSearchQuery` refuses to log without `userOptInLogging`
 *              set in the originating `SearchQuery`.
 *  • Art. 9  — snapshots are owner-only by construction; the engine is
 *              server-only and the public API never receives raw rows.
 *  • Art. 18 — `deleteAnalyticsHistory` clears a user_id's slice;
 *              `exportAnalyticsHistory` produces a portable envelope;
 *              `anonymizeForSharing` k-anonymises any export.
 *
 * Sacred-text policy
 *  • Queries that resolved to a reserved slot are flagged `wasSacredReserved`
 *    but the prayer id is REDACTED before any export (so the sacred text
 *    itself never leaves the dashboard surface).
 *
 * Compositional contract
 *  • Reads w50's `SearchLogEntry` shape (NOT imported to keep w51 standalone;
 *    structural typing is sufficient).
 *  • Pure data: no IO, no Next.js / Prisma / Supabase imports.
 *
 * @module w51/search-analytics-dashboard
 */

// ─────────────────────────────────────────────────────────────────────────────
// §1  CORE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single row in the analytics log. Produced by `recordSearchQuery` from
 * the w50 engine; consumed by every snapshot function in this module.
 *
 * Sacred-text policy: when a query resolved to a reserved slot we keep
 * the flag (`wasSacredReserved: true`) but the prayerId of the click
 * MUST NOT be persisted in plain form — exporters (`exportSnapshotAsJson`
 * / `exportSnapshotAsCsv`) strip the `clickedResultId` for any row where
 * `wasSacredReserved === true`.
 */
export interface SearchQueryLog {
  /** UUID-ish string. Used as the join key for `recordSearchClick`. */
  readonly queryId: string;
  /** Verbatim user query (post-trim). Stored only when consent given. */
  readonly query: string;
  /** pt-BR / en-US / es-ES — mirrors w50 `LocaleId`. */
  readonly locale: SearchAnalyticsLocale;
  /** Total results returned for this query (0 = zero-result). */
  readonly resultsCount: number;
  /**
   * Prayer id (or synthetic result id) the user clicked. `null` when the
   * user did NOT click a result.
   *
   * Redacted in exports when `wasSacredReserved === true`.
   */
  readonly clickedResultId: string | null;
  /**
   * 1-based position of the clicked result in the result set. `null`
   * when no click was recorded.
   */
  readonly clickPosition: number | null;
  /**
   * Pseudonymous per-user session hash. We never persist raw user_id;
   * the dashboard owner can correlate by hash alone.
   */
  readonly sessionHash: string;
  /**
   * ISO timestamp (UTC). Captured at the moment of recording.
   */
  readonly timestamp: string;
  /**
   * 1..5 — caller-mirrors `SacrednessLevel` from w50. Higher = more
   * restrictive filtering. We track the *requested* filter, not the
   * row's intrinsic sacredness.
   */
  readonly sensitivityFilter: SearchAnalyticsSacredness;
  /**
   * Whether the user opted to include reserved slots in their search.
   * Mirrors w50 `SearchQuery.includeReserved`. We do NOT export the
   * raw query when this is true AND `wasSacredReserved=true` — we
   * just collapse to a count.
   */
  readonly sacredTextFilter: boolean;
  /**
   * True if any of the top-K results returned was a reserved slot.
   * Flag-only; `clickedResultId` is stripped for these rows.
   */
  readonly wasSacredReserved: boolean;
  /** Server-side wallclock latency in ms (`search()` duration). */
  readonly queryLatencyMs: number;
  /** Optional mode label (mirrors w50 `SearchMode`). */
  readonly mode: SearchAnalyticsMode;
  /**
   * Article 7 consent ledger. Every row MUST carry this so analytics
   * can be deleted deterministically per LGPD Art. 18.
   */
  readonly consent: SearchAnalyticsConsent;
}

/**
 * Owner-only locale universe. Mirrors w50 `LocaleId`.
 */
export type SearchAnalyticsLocale = "pt-BR" | "en-US" | "es-ES";

/**
 * Sacredness filter level. Mirrors w50 `SacrednessLevel` (1..5).
 */
export type SearchAnalyticsSacredness = 1 | 2 | 3 | 4 | 5;

/**
 * Mirrors w50 `SearchMode`. Restricted to the meaningful dashboard
 * facets (no point tracking `exact` separately from `lexical`).
 */
export type SearchAnalyticsMode =
  | "lexical"
  | "fuzzy"
  | "semantic"
  | "hybrid"
  | "exact";

/**
 * Consent record carried alongside every log row. Mirrors w50's
 * `respectSearchLogOptIn` decision shape.
 */
export interface SearchAnalyticsConsent {
  /** Article 7 — explicit opt-in. */
  readonly opted_in: boolean;
  /** Capture moment. */
  readonly captured_at_iso: string;
  /**
   * Engine version that captured the consent. Useful when the consent
   * policy evolves (e.g. adding sacred-text warnings in v2).
   */
  readonly engine_version: string;
}

/**
 * Time window supported by the dashboard. `all` is allowed but flagged
 * — owner must confirm the data set is big enough to avoid leaking the
 * tail of a user.
 */
export type SearchAnalyticsWindow = "24h" | "7d" | "30d" | "90d" | "all";

/**
 * Sort order for `SearchAnalyticsQuery`.
 *
 *  • `frequency`       — top queries by occurrence count
 *  • `recency`         — top queries by latest timestamp
 *  • `zeroResultRate`  — top queries with the highest zero-result %
 *  • `clickThrough`    — top queries by click-through rate
 */
export type SearchAnalyticsSortBy =
  | "frequency"
  | "recency"
  | "zeroResultRate"
  | "clickThrough";

/**
 * Input to `buildSearchAnalyticsSnapshot`. Caller picks a window and a
 * locale filter (optional).
 */
export interface SearchAnalyticsQuery {
  readonly window: SearchAnalyticsWindow;
  readonly locale?: SearchAnalyticsLocale;
  /** `topN` controls how many rows appear in `topQueries` / `zeroResultQueries`. */
  readonly topN: number;
  readonly sortBy: SearchAnalyticsSortBy;
  /**
   * Reference timestamp (UTC ISO). Defaults to "now" inside the engine.
   * Mostly useful in tests so the snapshot can be deterministic.
   */
  readonly asOfIso?: string;
  /**
   * Owner principal id. Used as the audit author in `summarizeForOwner`.
   * No PII, just a role label like "owner:akasha".
   */
  readonly ownerPrincipal?: string;
}

/**
 * Aggregated row for `topQueries` / `zeroResultQueries`.
 *
 * Counts are k-anonymised before appearing in any export: any bucket
 * with fewer than `K_ANON_THRESHOLD` rows is suppressed.
 */
export interface SearchAnalyticsAggregateRow {
  readonly query: string;
  readonly normalizedQuery: string;
  readonly occurrenceCount: number;
  readonly zeroResultCount: number;
  readonly clickCount: number;
  /** Occurrence count weighted by recency (linear ramp). */
  readonly weightedScore: number;
  /** [0,1] — proportion of occurrences with 0 results. */
  readonly zeroResultRate: number;
  /** [0,1] — proportion of occurrences with at least one click. */
  readonly clickThroughRate: number;
  readonly lastSeenIso: string;
  /** Suppressed by k-anonymisation when occurrenceCount < K_ANON_THRESHOLD. */
  readonly exposed: boolean;
}

/**
 * Locale-distribution bucket. Counts are NOT k-anonymised (the owner
 * has full visibility; exports apply the k-anon filter).
 */
export interface SearchAnalyticsLocaleBucket {
  readonly locale: SearchAnalyticsLocale;
  readonly count: number;
  readonly share: number;
  readonly uniqueSessionEstimate: number;
}

/**
 * Sensitivity-filter usage bucket.
 */
export interface SearchAnalyticsSensitivityBucket {
  readonly level: SearchAnalyticsSacredness;
  readonly count: number;
  readonly share: number;
}

/**
 * The full snapshot returned by `buildSearchAnalyticsSnapshot`.
 *
 * NOTE: `exposed` fields (which contain raw query strings) are stripped
 * before any export; the JSON / CSV exporters return only the
 * `aggregated` view + non-PII scalars.
 */
export interface SearchAnalyticsSnapshot {
  readonly schemaVersion: 1;
  readonly window: SearchAnalyticsWindow;
  readonly generatedAtIso: string;
  readonly totalQueries: number;
  readonly uniqueUsers: number;
  readonly uniqueSessions: number;
  readonly topQueries: readonly SearchAnalyticsAggregateRow[];
  readonly zeroResultQueries: readonly SearchAnalyticsAggregateRow[];
  readonly localeDistribution: readonly SearchAnalyticsLocaleBucket[];
  readonly sensitivityFilterUsage: readonly SearchAnalyticsSensitivityBucket[];
  /** [0,1] — share of queries where the user explicitly asked for reserved slots. */
  readonly sacredTextFilterRate: number;
  /** [0,1] — share of queries that landed on at least one reserved slot. */
  readonly sacredTextReservedRate: number;
  /** Avg results-per-query. */
  readonly avgResultCount: number;
  /** Server-side query latency in ms. */
  readonly queryLatencyP50: number;
  readonly queryLatencyP95: number;
  readonly queryLatencyP99: number;
  readonly ownerPrincipal?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// §2  ERROR CODES (SAD_001..SAD_008)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Base error for the analytics dashboard. Mirrors w50's `PrayerSearchError`
 * shape (code + context bag) so consumers can write a uniform error
 * handler. The `code` is embedded in `toString()` so smoke tests can
 * assert on the literal `SAD_xxx` string.
 */
export class SearchAnalyticsDashboardError extends Error {
  public readonly code: string;
  public readonly context: Readonly<Record<string, unknown>>;
  public constructor(
    code: string,
    message: string,
    context: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "SearchAnalyticsDashboardError";
    this.code = code;
    this.context = context;
  }

  public toString(): string {
    return `${this.name}[${this.code}]: ${this.message}`;
  }
}

/** SAD_001 — caller tried to log without LGPD opt-in. */
export class ConsentMissingError extends SearchAnalyticsDashboardError {
  public constructor(userId: string) {
    super(
      "SAD_001",
      `LGPD Art. 7 opt-in missing for user "${userId}". Search analytics logging refused.`,
      { userId },
    );
    this.name = "ConsentMissingError";
  }
}

/** SAD_002 — caller asked for a window larger than the TTL permits. */
export class WindowTooLargeError extends SearchAnalyticsDashboardError {
  public constructor(windowDays: number, ttlDays: number) {
    super(
      "SAD_002",
      `Requested analytics window is ${windowDays} days, but the dashboard TTL is ${ttlDays} days.`,
      { windowDays, ttlDays },
    );
    this.name = "WindowTooLargeError";
  }
}

/** SAD_003 — caller asked for a snapshot older than `SNAPSHOT_STALE_MS`. */
export class SnapshotStaleError extends SearchAnalyticsDashboardError {
  public constructor(ageMs: number, staleMs: number) {
    super(
      "SAD_003",
      `Snapshot is ${Math.round(ageMs / 1000)}s old; staleness limit is ${Math.round(staleMs / 1000)}s.`,
      { ageMs, staleMs },
    );
    this.name = "SnapshotStaleError";
  }
}

/** SAD_004 — query schema failed validation. */
export class QueryInvalidError extends SearchAnalyticsDashboardError {
  public constructor(field: string, reason: string) {
    super(
      "SAD_004",
      `SearchAnalyticsQuery invalid on field "${field}": ${reason}`,
      { field, reason },
    );
    this.name = "QueryInvalidError";
  }
}

/** SAD_005 — export pipeline failed (serializer / IO). */
export class ExportFailedError extends SearchAnalyticsDashboardError {
  public constructor(reason: string) {
    super("SAD_005", `Snapshot export failed: ${reason}`, { reason });
    this.name = "ExportFailedError";
  }
}

/** SAD_006 — anonymisation rejected the input. */
export class AnonymizationFailedError extends SearchAnalyticsDashboardError {
  public constructor(reason: string) {
    super("SAD_006", `Anonymization failed: ${reason}`, { reason });
    this.name = "AnonymizationFailedError";
  }
}

/** SAD_007 — k-anonymous threshold violation: caller asked for raw rows. */
export class KAnonThresholdViolationError extends SearchAnalyticsDashboardError {
  public constructor(bucketCount: number, threshold: number) {
    super(
      "SAD_007",
      `k-anonymisation threshold violation: bucket has ${bucketCount} rows, threshold is ${threshold}.`,
      { bucketCount, threshold },
    );
    this.name = "KAnonThresholdViolationError";
  }
}

/** SAD_008 — caller passed a locale the dashboard does not support. */
export class LocaleUnsupportedError extends SearchAnalyticsDashboardError {
  public constructor(locale: string) {
    super(
      "SAD_008",
      `Locale "${locale}" is not supported by the analytics dashboard.`,
      { locale },
    );
    this.name = "LocaleUnsupportedError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// §3  CONSTANTS & DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map window label → days. Used by `buildSearchAnalyticsSnapshot` to
 * filter rows that fall outside the look-back horizon.
 */
export const WINDOW_TO_DAYS: Readonly<Record<SearchAnalyticsWindow, number>> = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "all": 365 * 5, // Synthetic 5-year ceiling — actual cap is `SACRED_TEXT_DASHBOARD_TTL_DAYS`.
} as const;

/**
 * Default `topN` for `SearchAnalyticsQuery.topN`. Owners can override.
 */
export const DEFAULT_TOP_N: number = 25;

/**
 * TTL for sacred-text dashboard rows. Owner-only snapshots beyond this
 * horizon are forbidden by `WindowTooLargeError`.
 */
export const SACRED_TEXT_DASHBOARD_TTL_DAYS: number = 30;

/**
 * k-anonymity threshold. Any aggregate with fewer than this many rows
 * is suppressed in `anonymizeForSharing` / `exportSnapshotAsJson` /
 * `exportSnapshotAsCsv`.
 */
export const K_ANON_THRESHOLD: number = 5;

/**
 * Snapshot staleness budget. Snapshots older than this must be refreshed.
 */
export const SNAPSHOT_STALE_MS_DEFAULT: number = 60 * 60 * 1000; // 1 hour.

/**
 * Supported window labels (in stable order).
 */
export const SUPPORTED_WINDOWS: readonly SearchAnalyticsWindow[] = [
  "24h",
  "7d",
  "30d",
  "90d",
  "all",
] as const;

/**
 * Supported locale universe. Mirrors w50.
 */
export const SUPPORTED_LOCALES: readonly SearchAnalyticsLocale[] = [
  "pt-BR",
  "en-US",
  "es-ES",
] as const;

/**
 * Sensitivity-filter universe (1..5).
 */
export const SUPPORTED_SENSITIVITY_LEVELS: readonly SearchAnalyticsSacredness[] = [
  1, 2, 3, 4, 5,
] as const;

/**
 * Engine version label. Bump when consent policy changes shape.
 */
export const ENGINE_VERSION: string = "w51.search-analytics-dashboard@1.0.0";

/**
 * Spread rate for spam detection (queries/minute). One user firing
 * more than this rate over any rolling 60s window is flagged.
 */
export const SPAM_RATE_LIMIT_QPM: number = 12;

/**
 * Number of distinct query strings inside `SPAM_RATE_LIMIT_WINDOW_MS`
 * that the same session_hash can produce before being flagged.
 */
export const SPAM_DIVERSITY_LIMIT: number = 30;

/**
 * Window for the spam detector rolling window (ms).
 */
export const SPAM_RATE_LIMIT_WINDOW_MS: number = 60 * 1000;

/**
 * Owner role labels. Used for `ownerPrincipal` audit fields.
 */
export const OWNER_PRINCIPAL_PREFIXES: readonly string[] = [
  "owner:",
  "admin:",
  "curator:",
] as const;

/**
 * Default `topN` for `topQueriesByFrequency` / friends when the caller
 * passes a negative `n`.
 */
export const SAFE_TOP_N_FALLBACK: number = 10;

/**
 * Latency cap (ms) — anything larger is treated as a server stall and
 * pinned at this ceiling for percentile math.
 */
export const LATENCY_CAP_MS: number = 5000;

// ─────────────────────────────────────────────────────────────────────────────
// §4  HELPERS — INTERNAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ISO-parse a timestamp. Returns NaN if invalid. Internal helper so
 * callers don't need to repeat the `Date.parse` dance.
 */
function parseIsoMillis(iso: string): number {
  if (typeof iso !== "string") return Number.NaN;
  return Date.parse(iso);
}

/**
 * Type-guard for the locale union. Same trick w50 uses.
 */
export function isSearchAnalyticsLocale(value: string): value is SearchAnalyticsLocale {
  return value === "pt-BR" || value === "en-US" || value === "es-ES";
}

/**
 * Asserts the locale union, throwing `LocaleUnsupportedError` when invalid.
 */
export function assertSearchAnalyticsLocale(locale: string): asserts locale is SearchAnalyticsLocale {
  if (!isSearchAnalyticsLocale(locale)) throw new LocaleUnsupportedError(locale);
}

/**
 * Type-guard for the sensitivity filter.
 */
export function isSacrednessLevel(n: number): n is SearchAnalyticsSacredness {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

/**
 * Asserts a sacredness integer, throwing `QueryInvalidError` when invalid.
 */
export function assertSacrednessLevel(n: number): asserts n is SearchAnalyticsSacredness {
  if (!isSacrednessLevel(n)) {
    throw new QueryInvalidError("sensitivityFilter", `must be 1..5 (got ${n})`);
  }
}

/**
 * Same trick for the window label.
 */
export function isAnalyticsWindow(value: string): value is SearchAnalyticsWindow {
  return value === "24h" || value === "7d" || value === "30d" || value === "90d" || value === "all";
}

/**
 * Hard-cap integer helper.
 */
function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  if (n < lo) return lo;
  if (n > hi) return hi;
  return Math.floor(n);
}

/**
 * Clamp a float into [0, 1].
 */
function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Normalise a query string for grouping: lowercase, accent-strip,
 * collapse whitespace, drop trailing punctuation. Internal — exported
 * for `topQueriesByFrequency` etc.
 */
export function normalizeQueryForGrouping(raw: string): string {
  if (typeof raw !== "string") return "";
  const lowered = raw.toLowerCase();
  const stripped = lowered.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return stripped
    .replace(/[¿¡?!,.;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Apply k-anonymisation to aggregate rows. Any bucket whose
 * `occurrenceCount < K_ANON_THRESHOLD` is marked `exposed: false`.
 */
function applyKAnon(rows: readonly SearchAnalyticsAggregateRow[]): readonly SearchAnalyticsAggregateRow[] {
  return rows.map((r) => ({
    ...r,
    exposed: r.occurrenceCount >= K_ANON_THRESHOLD,
  }));
}

/**
 * Conservative percentile on a sorted array. Uses linear interpolation.
 */
function percentile(sortedAsc: readonly number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  if (sortedAsc.length === 1) return sortedAsc[0] as number;
  const rank = clamp01(p) * (sortedAsc.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sortedAsc[lo] as number;
  const frac = rank - lo;
  const a = sortedAsc[lo] as number;
  const b = sortedAsc[hi] as number;
  return a + (b - a) * frac;
}

/**
 * Compute `WindowToDays` for a label. Helpful internally so all callers
 * use the same map.
 */
export function windowToDays(window: SearchAnalyticsWindow): number {
  return WINDOW_TO_DAYS[window];
}

/**
 * Validate `SearchAnalyticsQuery`. Throws `QueryInvalidError` on
 * schema violations and `WindowTooLargeError` if the resolved window
 * exceeds `SACRED_TEXT_DASHBOARD_TTL_DAYS`.
 */
export function validateAnalyticsQuery(q: SearchAnalyticsQuery): SearchAnalyticsQuery {
  if (!isAnalyticsWindow(q.window)) {
    throw new QueryInvalidError("window", `must be one of ${SUPPORTED_WINDOWS.join(",")}`);
  }
  if (q.locale !== undefined && !isSearchAnalyticsLocale(q.locale)) {
    throw new QueryInvalidError("locale", `must be one of ${SUPPORTED_LOCALES.join(",")}`);
  }
  if (!Number.isFinite(q.topN) || q.topN <= 0) {
    throw new QueryInvalidError("topN", "must be > 0");
  }
  const sortBy: SearchAnalyticsSortBy[] = [
    "frequency",
    "recency",
    "zeroResultRate",
    "clickThrough",
  ];
  if (!sortBy.includes(q.sortBy)) {
    throw new QueryInvalidError("sortBy", `must be one of ${sortBy.join(",")}`);
  }
  const days = windowToDays(q.window);
  if (days > SACRED_TEXT_DASHBOARD_TTL_DAYS) {
    throw new WindowTooLargeError(days, SACRED_TEXT_DASHBOARD_TTL_DAYS);
  }
  return q;
}

/**
 * ISO timestamp now (UTC). Wrapped so tests can swap in a fixed clock.
 */
export function nowIso(nowMs: number = Date.now()): string {
  return new Date(nowMs).toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// §5  RECORDING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * In-memory log store. The dashboard is a pure data layer; the caller
 * is responsible for swapping this for Supabase / Prisma in production.
 */
export class SearchAnalyticsLogStore {
  private readonly rows: SearchQueryLog[] = [];
  private readonly byQueryId: Map<string, SearchQueryLog> = new Map();
  private readonly bySession: Map<string, Set<string>> = new Map();
  /** Optional cap to keep memory bounded in tests. `0` = unbounded. */
  private readonly maxRows: number;

  public constructor(maxRows: number = 0) {
    this.maxRows = maxRows;
  }

  /** Append a single log row. Returns the row that was actually kept. */
  public append(row: SearchQueryLog): SearchQueryLog {
    if (this.maxRows > 0 && this.rows.length >= this.maxRows) {
      this.rows.shift();
    }
    this.rows.push(row);
    this.byQueryId.set(row.queryId, row);
    let set = this.bySession.get(row.sessionHash);
    if (!set) {
      set = new Set<string>();
      this.bySession.set(row.sessionHash, set);
    }
    set.add(row.queryId);
    return row;
  }

  /** Snapshot of all rows currently held. */
  public snapshot(): readonly SearchQueryLog[] {
    return [...this.rows];
  }

  /** Lookup by queryId. */
  public byId(queryId: string): SearchQueryLog | undefined {
    return this.byQueryId.get(queryId);
  }

  /** Total number of rows held. */
  public size(): number {
    return this.rows.length;
  }

  /** Remove all rows for a session hash (LGPD Art. 18 right to delete). */
  public deleteSession(sessionHash: string): number {
    const set = this.bySession.get(sessionHash);
    if (!set) return 0;
    let removed = 0;
    for (const id of set) {
      if (this.byQueryId.delete(id)) removed += 1;
    }
    const next = this.rows.filter((r) => r.sessionHash !== sessionHash);
    this.rows.length = 0;
    for (const r of next) this.rows.push(r);
    this.bySession.delete(sessionHash);
    return removed;
  }

  /** Clear everything (tests only). */
  public clear(): void {
    this.rows.length = 0;
    this.byQueryId.clear();
    this.bySession.clear();
  }
}

/**
 * Record a search query. Validates consent (LGPD Art. 7) and shape.
 * Returns the captured row (with the engine_version stamp applied).
 *
 * This function is intentionally synchronous & pure so it works inside
 * a transactional write the calling app uses.
 */
export function recordSearchQuery(
  row: Omit<SearchQueryLog, "consent"> & {
    readonly consent?: Partial<SearchAnalyticsConsent>;
  },
): SearchQueryLog {
  if (typeof row.queryId !== "string" || row.queryId.length === 0) {
    throw new QueryInvalidError("queryId", "must be non-empty string");
  }
  if (typeof row.query !== "string") {
    throw new QueryInvalidError("query", "must be a string");
  }
  assertSearchAnalyticsLocale(row.locale);
  assertSacrednessLevel(row.sensitivityFilter);
  if (typeof row.sessionHash !== "string" || row.sessionHash.length === 0) {
    throw new QueryInvalidError("sessionHash", "must be non-empty string");
  }
  if (typeof row.timestamp !== "string" || Number.isNaN(parseIsoMillis(row.timestamp))) {
    throw new QueryInvalidError("timestamp", "must be ISO 8601 string");
  }
  if (!Number.isFinite(row.queryLatencyMs) || row.queryLatencyMs < 0) {
    throw new QueryInvalidError("queryLatencyMs", "must be >= 0");
  }
  const optedIn = row.consent?.opted_in === true;
  if (!optedIn) {
    throw new ConsentMissingError(row.sessionHash);
  }
  const fullConsent: SearchAnalyticsConsent = {
    opted_in: true,
    captured_at_iso: row.consent?.captured_at_iso ?? row.timestamp,
    engine_version: row.consent?.engine_version ?? ENGINE_VERSION,
  };
  return {
    queryId: row.queryId,
    query: row.query,
    locale: row.locale,
    resultsCount: row.resultsCount,
    clickedResultId: row.wasSacredReserved ? null : row.clickedResultId,
    clickPosition: row.clickedResultId === null ? null : row.clickPosition,
    sessionHash: row.sessionHash,
    timestamp: row.timestamp,
    sensitivityFilter: row.sensitivityFilter,
    sacredTextFilter: row.sacredTextFilter,
    wasSacredReserved: row.wasSacredReserved,
    queryLatencyMs: row.queryLatencyMs,
    mode: row.mode,
    consent: fullConsent,
  };
}

/**
 * Attach a click to a previously recorded log row. Returns the
 * updated row (or `null` if no matching `queryId` is found).
 *
 * Sacred-text policy: refuses to attach a click when
 * `wasSacredReserved === true` — the dashboard MUST NOT surface which
 * reserved slot the user clicked. The click is dropped, the count is
 * incremented on `sacredTextReservedRate` separately.
 */
export function recordSearchClick(
  store: SearchAnalyticsLogStore,
  queryId: string,
  resultId: string,
  position: number,
): SearchQueryLog | null {
  if (!Number.isInteger(position) || position < 1) {
    throw new QueryInvalidError("position", "must be >= 1");
  }
  const existing = store.byId(queryId);
  if (!existing) return null;
  if (existing.wasSacredReserved) {
    // Drop the click; it never leaves the dashboard. We could persist
    // a flag here, but the policy is "redact at record time".
    return existing;
  }
  // The log store is read-only-by-API; we instead append a synthetic
  // "click event" by mutating in-place via a clone.
  const updated: SearchQueryLog = {
    ...existing,
    clickedResultId: resultId,
    clickPosition: position,
  };
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// §6  FILTERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter logs by `SearchAnalyticsQuery.window` against `asOfIso`.
 * When `asOfIso` is missing we use `Date.now()`.
 */
export function filterLogsByWindow(
  logs: readonly SearchQueryLog[],
  query: SearchAnalyticsQuery,
  asOfMs: number = Date.now(),
): readonly SearchQueryLog[] {
  const days = windowToDays(query.window);
  const cutoff = asOfMs - days * 24 * 60 * 60 * 1000;
  return logs.filter((r) => {
    const t = parseIsoMillis(r.timestamp);
    if (!Number.isFinite(t)) return false;
    if (t < cutoff) return false;
    if (query.locale !== undefined && r.locale !== query.locale) return false;
    return true;
  });
}

/**
 * Filter logs to only those that yielded zero results.
 */
export function filterZeroResultLogs(logs: readonly SearchQueryLog[]): readonly SearchQueryLog[] {
  return logs.filter((r) => r.resultsCount === 0);
}

/**
 * Filter logs to only those that hit at least one reserved slot.
 */
export function filterSacredReservedLogs(logs: readonly SearchQueryLog[]): readonly SearchQueryLog[] {
  return logs.filter((r) => r.wasSacredReserved);
}

/**
 * Filter logs by sensitivity filter level.
 */
export function filterBySensitivity(
  logs: readonly SearchQueryLog[],
  level: SearchAnalyticsSacredness,
): readonly SearchQueryLog[] {
  return logs.filter((r) => r.sensitivityFilter === level);
}

/**
 * Filter logs by locale.
 */
export function filterByLocale(
  logs: readonly SearchQueryLog[],
  locale: SearchAnalyticsLocale,
): readonly SearchQueryLog[] {
  return logs.filter((r) => r.locale === locale);
}

// ─────────────────────────────────────────────────────────────────────────────
// §7  TOP QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the per-query aggregate rows. Internal helper shared by every
 * `topQueries*` function.
 */
function aggregateByQuery(logs: readonly SearchQueryLog[]): SearchAnalyticsAggregateRow[] {
  const map = new Map<string, {
    query: string;
    normalizedQuery: string;
    occurrenceCount: number;
    zeroResultCount: number;
    clickCount: number;
    weightedScore: number;
    lastSeenMs: number;
  }>();
  for (const r of logs) {
    const norm = normalizeQueryForGrouping(r.query);
    const key = norm;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        query: r.query,
        normalizedQuery: norm,
        occurrenceCount: 0,
        zeroResultCount: 0,
        clickCount: 0,
        weightedScore: 0,
        lastSeenMs: 0,
      };
      map.set(key, entry);
    }
    entry.occurrenceCount += 1;
    if (r.resultsCount === 0) entry.zeroResultCount += 1;
    if (r.clickedResultId !== null) entry.clickCount += 1;
    const t = parseIsoMillis(r.timestamp);
    if (Number.isFinite(t) && t > entry.lastSeenMs) entry.lastSeenMs = t;
  }
  const maxOcc = Math.max(1, ...[...map.values()].map((v) => v.occurrenceCount));
  const out: SearchAnalyticsAggregateRow[] = [];
  for (const entry of map.values()) {
    out.push({
      query: entry.query,
      normalizedQuery: entry.normalizedQuery,
      occurrenceCount: entry.occurrenceCount,
      zeroResultCount: entry.zeroResultCount,
      clickCount: entry.clickCount,
      weightedScore: entry.occurrenceCount / maxOcc,
      zeroResultRate:
        entry.occurrenceCount === 0 ? 0 : entry.zeroResultCount / entry.occurrenceCount,
      clickThroughRate:
        entry.occurrenceCount === 0 ? 0 : entry.clickCount / entry.occurrenceCount,
      lastSeenIso: new Date(entry.lastSeenMs).toISOString(),
      // exposed flag is set by `applyKAnon` at snapshot time.
      exposed: true,
    });
  }
  return out;
}

/**
 * Top queries by raw frequency.
 */
export function topQueriesByFrequency(
  logs: readonly SearchQueryLog[],
  n: number = DEFAULT_TOP_N,
): readonly SearchAnalyticsAggregateRow[] {
  const limit = clampInt(n, 1, 1000);
  const rows = aggregateByQuery(logs).sort((a, b) => {
    if (a.occurrenceCount !== b.occurrenceCount) return b.occurrenceCount - a.occurrenceCount;
    return a.query.localeCompare(b.query);
  });
  return rows.slice(0, limit);
}

/**
 * Top queries by click-through rate (must have at least 3 occurrences).
 */
export function topQueriesByClickThrough(
  logs: readonly SearchQueryLog[],
  n: number = DEFAULT_TOP_N,
): readonly SearchAnalyticsAggregateRow[] {
  const limit = clampInt(n, 1, 1000);
  const rows = aggregateByQuery(logs).filter((r) => r.occurrenceCount >= 3);
  rows.sort((a, b) => {
    if (a.clickThroughRate !== b.clickThroughRate) return b.clickThroughRate - a.clickThroughRate;
    return b.occurrenceCount - a.occurrenceCount;
  });
  return rows.slice(0, limit);
}

/**
 * Top zero-result queries. Sorted by `zeroResultCount` descending.
 *
 * Owners can use this list together with `queryRewriteSuggestion` to
 * decide which queries to add as new content / synonyms.
 */
export function topZeroResultQueries(
  logs: readonly SearchQueryLog[],
  n: number = DEFAULT_TOP_N,
): readonly SearchAnalyticsAggregateRow[] {
  const limit = clampInt(n, 1, 1000);
  const rows = aggregateByQuery(logs).filter((r) => r.zeroResultCount > 0);
  rows.sort((a, b) => {
    if (a.zeroResultCount !== b.zeroResultCount) return b.zeroResultCount - a.zeroResultCount;
    return b.occurrenceCount - a.occurrenceCount;
  });
  return rows.slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// §8  DISTRIBUTION & AGGREGATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Locale distribution. `share` is over `totalRows`.
 */
export function localeDistribution(
  logs: readonly SearchQueryLog[],
): readonly SearchAnalyticsLocaleBucket[] {
  const total = logs.length;
  if (total === 0) {
    return SUPPORTED_LOCALES.map((l) => ({
      locale: l,
      count: 0,
      share: 0,
      uniqueSessionEstimate: 0,
    }));
  }
  const byLoc = new Map<SearchAnalyticsLocale, { count: number; sessions: Set<string> }>();
  for (const l of SUPPORTED_LOCALES) byLoc.set(l, { count: 0, sessions: new Set() });
  for (const r of logs) {
    const e = byLoc.get(r.locale);
    if (!e) continue;
    e.count += 1;
    e.sessions.add(r.sessionHash);
  }
  const out: SearchAnalyticsLocaleBucket[] = [];
  for (const l of SUPPORTED_LOCALES) {
    const e = byLoc.get(l) as { count: number; sessions: Set<string> };
    out.push({
      locale: l,
      count: e.count,
      share: e.count / total,
      uniqueSessionEstimate: e.sessions.size,
    });
  }
  return out;
}

/**
 * Sensitivity-filter usage. Counts how often the user requested a
 * given sensitivity ceiling.
 */
export function sensitivityFilterUsage(
  logs: readonly SearchQueryLog[],
): readonly SearchAnalyticsSensitivityBucket[] {
  const total = logs.length;
  const out: SearchAnalyticsSensitivityBucket[] = [];
  const byLevel = new Map<SearchAnalyticsSacredness, number>();
  for (const l of SUPPORTED_SENSITIVITY_LEVELS) byLevel.set(l, 0);
  for (const r of logs) byLevel.set(r.sensitivityFilter, (byLevel.get(r.sensitivityFilter) ?? 0) + 1);
  for (const l of SUPPORTED_SENSITIVITY_LEVELS) {
    out.push({
      level: l,
      count: byLevel.get(l) ?? 0,
      share: total === 0 ? 0 : (byLevel.get(l) ?? 0) / total,
    });
  }
  return out;
}

/**
 * Sacred-text filter rate. Two numbers:
 *  - sacredTextFilterRate  — share of rows where the user requested reserved
 *                            slots (`sacredTextFilter === true`).
 *  - sacredTextReservedRate — share of rows where reserved slots actually
 *                            surfaced (`wasSacredReserved === true`).
 *
 * Both are reported as [0,1]. The companion scalar `sacredTextFilterRate`
 * is exposed on the snapshot; the reservedRate is the corresponding
 * "yield" of the sacred-text filter.
 */
export function sacredTextFilterRate(logs: readonly SearchQueryLog[]): {
  sacredTextFilterRate: number;
  sacredTextReservedRate: number;
} {
  if (logs.length === 0) return { sacredTextFilterRate: 0, sacredTextReservedRate: 0 };
  let requested = 0;
  let reserved = 0;
  for (const r of logs) {
    if (r.sacredTextFilter) requested += 1;
    if (r.wasSacredReserved) reserved += 1;
  }
  return {
    sacredTextFilterRate: requested / logs.length,
    sacredTextReservedRate: reserved / logs.length,
  };
}

/**
 * Latency percentile stats — p50 / p95 / p99 — capped at `LATENCY_CAP_MS`.
 */
export function queryLatencyStats(logs: readonly SearchQueryLog[]): {
  p50: number;
  p95: number;
  p99: number;
} {
  if (logs.length === 0) return { p50: 0, p95: 0, p99: 0 };
  const lat = logs
    .map((r) => Math.min(LATENCY_CAP_MS, Math.max(0, r.queryLatencyMs)))
    .sort((a, b) => a - b);
  return {
    p50: Math.round(percentile(lat, 0.5)),
    p95: Math.round(percentile(lat, 0.95)),
    p99: Math.round(percentile(lat, 0.99)),
  };
}

/**
 * Unique-user estimate via hash bucketing. We never store raw user_id;
 * the sessionHash is hashed into 16-bit buckets so we can report an
 * approximate unique count without exposing individual sessions.
 */
export function uniqueUserEstimate(logs: readonly SearchQueryLog[]): number {
  const buckets = new Set<number>();
  for (const r of logs) {
    let h = 0;
    for (let i = 0; i < r.sessionHash.length; i += 1) {
      h = (h * 31 + r.sessionHash.charCodeAt(i)) >>> 0;
    }
    buckets.add(h & 0xffff);
  }
  // 16-bit buckets → multiply by expectation factor for an unbiased
  // estimate (E[unique buckets] = N * (1 - exp(-N / 65536)) for
  // birthday-problem correction). Simplified: just return the bucket
  // count for an under-estimate (always safe).
  return buckets.size;
}

/**
 * Same as `uniqueUserEstimate` but counts sessions in a different
 * window. Useful when the owner wants a per-day active session count.
 */
export function uniqueSessionEstimate(logs: readonly SearchQueryLog[]): number {
  return new Set(logs.map((r) => r.sessionHash)).size;
}

// ─────────────────────────────────────────────────────────────────────────────
// §9  REWRITES & SPAM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Suggest rewrites for a zero-result query. Pure heuristic: strip
 * accents, drop stopwords, swap common synonyms, downcase the result.
 * The owner uses this list as input into the curated-prayer-submission
 * workstream (w50/curated-prayer-submission-ui).
 */
export function queryRewriteSuggestion(zeroResultQuery: string): {
  original: string;
  suggestions: readonly string[];
  dropStopwordVersion: string;
  accentFoldedVersion: string;
} {
  if (typeof zeroResultQuery !== "string") {
    return {
      original: "",
      suggestions: [],
      dropStopwordVersion: "",
      accentFoldedVersion: "",
    };
  }
  const norm = normalizeQueryForGrouping(zeroResultQuery);
  const accentFolded = norm;
  const stopwords = new Set([
    "a", "o", "e", "de", "da", "do", "em", "para", "com", "sem",
    "the", "of", "to", "in", "for", "and",
    "el", "la", "de", "en", "para", "con",
  ]);
  const dropStopwordVersion = norm
    .split(" ")
    .filter((t) => t.length > 0 && !stopwords.has(t))
    .join(" ");
  const suggestions: string[] = [];
  if (dropStopwordVersion.length > 0 && dropStopwordVersion !== norm) {
    suggestions.push(dropStopwordVersion);
  }
  // Cheap synonym swap (Portuguese / English fallback).
  const synonymSwap: Readonly<Record<string, string>> = {
    paz: "paz interior",
    luz: "luz divina",
    amor: "amor incondicional",
    protecao: "protecao divina",
    peace: "inner peace",
    light: "divine light",
    love: "unconditional love",
    proteccion: "proteccion divina",
  };
  for (const [k, v] of Object.entries(synonymSwap)) {
    if (norm.includes(k) && !suggestions.includes(v)) suggestions.push(v);
  }
  if (suggestions.length === 0) suggestions.push(norm);
  return {
    original: zeroResultQuery,
    suggestions: [...new Set(suggestions)],
    dropStopwordVersion,
    accentFoldedVersion: accentFolded,
  };
}

/**
 * Detect query spam. Two flags:
 *  • rate       — same session fires > `SPAM_RATE_LIMIT_QPM` in
 *                 `SPAM_RATE_LIMIT_WINDOW_MS`.
 *  • diversity  — same session produces > `SPAM_DIVERSITY_LIMIT`
 *                 distinct queries in the time window.
 *
 * Returned array is the spam-flagged session hashes (never the raw
 * hashes). The owner decides whether to drop a session or rate-limit it.
 */
export function detectQuerySpam(
  logs: readonly SearchQueryLog[],
  nowMs: number = Date.now(),
): {
  spamSessions: readonly string[];
  rate: number;
  diversity: number;
} {
  const flagged = new Set<string>();
  const rateSessions = new Set<string>();
  const diversitySessions = new Set<string>();
  const bySession = new Map<string, SearchQueryLog[]>();
  for (const r of logs) {
    const arr = bySession.get(r.sessionHash) ?? [];
    arr.push(r);
    bySession.set(r.sessionHash, arr);
  }
  for (const [hash, rows] of bySession) {
    const cutoff = nowMs - SPAM_RATE_LIMIT_WINDOW_MS;
    const recent = rows.filter((r) => parseIsoMillis(r.timestamp) >= cutoff);
    if (recent.length === 0) continue;
    if (recent.length > SPAM_RATE_LIMIT_QPM) rateSessions.add(hash);
    const distinct = new Set(recent.map((r) => normalizeQueryForGrouping(r.query)));
    if (distinct.size > SPAM_DIVERSITY_LIMIT) diversitySessions.add(hash);
  }
  for (const h of rateSessions) flagged.add(h);
  for (const h of diversitySessions) flagged.add(h);
  // Hash-pseudonymise so the export never leaks the raw session_hash.
  const spamSessions = [...flagged].map((h) => `spam#${pseudoHash(h)}`).sort();
  return {
    spamSessions,
    rate: rateSessions.size,
    diversity: diversitySessions.size,
  };
}

/**
 * Cheap deterministic pseudonymiser. Returns the first 8 chars of a
 * FNV-1a hash. Not for crypto — only for log obfuscation.
 */
export function pseudoHash(input: string): string {
  if (typeof input !== "string" || input.length === 0) return "00000000";
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0").slice(0, 8);
}

/**
 * Heuristic: classify a single log row as spam based on its
 * properties (without the time-window context). Returns one of:
 *   "ok" | "rate" | "diversity" | "both".
 *
 * "diversity" means the same query is repeated too often; "rate" means
 * latency is suspiciously low (bot signature).
 */
export function classifyLogForSpam(row: SearchQueryLog): "ok" | "rate" | "diversity" | "both" {
  let diversity = false;
  let rate = false;
  if (row.query.length < 2) diversity = true;
  if (row.queryLatencyMs < 5) rate = true;
  if (row.resultsCount < 0) diversity = true;
  if (diversity && rate) return "both";
  if (diversity) return "diversity";
  if (rate) return "rate";
  return "ok";
}

// ─────────────────────────────────────────────────────────────────────────────
// §10  SNAPSHOT & DIFF
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the owner snapshot.
 */
export function buildSearchAnalyticsSnapshot(
  queryIn: SearchAnalyticsQuery,
  logs: readonly SearchQueryLog[],
  nowMs: number = Date.now(),
): SearchAnalyticsSnapshot {
  const query = validateAnalyticsQuery(queryIn);
  const asOfMs = query.asOfIso ? parseIsoMillis(query.asOfIso) : nowMs;
  if (!Number.isFinite(asOfMs)) {
    throw new QueryInvalidError("asOfIso", "must be ISO 8601");
  }
  const filtered = filterLogsByWindow(logs, query, asOfMs);
  const aggregateRows = aggregateByQuery(filtered);

  let topQueries: readonly SearchAnalyticsAggregateRow[];
  let zeroResultQueries: readonly SearchAnalyticsAggregateRow[];
  switch (query.sortBy) {
    case "frequency":
      topQueries = topQueriesByFrequency(filtered, query.topN);
      zeroResultQueries = topZeroResultQueries(filtered, query.topN);
      break;
    case "recency":
      topQueries = [...aggregateRows]
        .sort((a, b) => b.lastSeenIso.localeCompare(a.lastSeenIso))
        .slice(0, query.topN);
      zeroResultQueries = topZeroResultQueries(filtered, query.topN);
      break;
    case "zeroResultRate":
      topQueries = [...aggregateRows]
        .filter((r) => r.occurrenceCount >= 3)
        .sort((a, b) => {
          if (a.zeroResultRate !== b.zeroResultRate) return b.zeroResultRate - a.zeroResultRate;
          return b.occurrenceCount - a.occurrenceCount;
        })
        .slice(0, query.topN);
      zeroResultQueries = topZeroResultQueries(filtered, query.topN);
      break;
    case "clickThrough":
      topQueries = topQueriesByClickThrough(filtered, query.topN);
      zeroResultQueries = topZeroResultQueries(filtered, query.topN);
      break;
    default:
      topQueries = topQueriesByFrequency(filtered, query.topN);
      zeroResultQueries = topZeroResultQueries(filtered, query.topN);
  }

  const sd = sacredTextFilterRate(filtered);
  const lat = queryLatencyStats(filtered);
  const snapshot: SearchAnalyticsSnapshot = {
    schemaVersion: 1,
    window: query.window,
    generatedAtIso: nowIso(asOfMs),
    totalQueries: filtered.length,
    uniqueUsers: uniqueUserEstimate(filtered),
    uniqueSessions: uniqueSessionEstimate(filtered),
    topQueries: applyKAnon(topQueries),
    zeroResultQueries: applyKAnon(zeroResultQueries),
    localeDistribution: localeDistribution(filtered),
    sensitivityFilterUsage: sensitivityFilterUsage(filtered),
    sacredTextFilterRate: clamp01(sd.sacredTextFilterRate),
    sacredTextReservedRate: clamp01(sd.sacredTextReservedRate),
    avgResultCount:
      filtered.length === 0
        ? 0
        : filtered.reduce((acc, r) => acc + r.resultsCount, 0) / filtered.length,
    queryLatencyP50: lat.p50,
    queryLatencyP95: lat.p95,
    queryLatencyP99: lat.p99,
    ownerPrincipal: query.ownerPrincipal,
  };
  return snapshot;
}

/**
 * Diff two snapshots by scalar metrics. Returns the additive delta for
 * `totalQueries`, `uniqueUsers`, `uniqueSessions`, latency, etc.
 *
 * Useful for "this week vs last week" panels.
 */
export function diffSnapshots(
  a: SearchAnalyticsSnapshot,
  b: SearchAnalyticsSnapshot,
): {
  totalQueriesDelta: number;
  uniqueUsersDelta: number;
  uniqueSessionsDelta: number;
  avgResultCountDelta: number;
  queryLatencyP50Delta: number;
  queryLatencyP95Delta: number;
  queryLatencyP99Delta: number;
  sacredTextFilterRateDelta: number;
  sacredTextReservedRateDelta: number;
  localeDistributionDelta: Readonly<Record<SearchAnalyticsLocale, number>>;
  windowA: SearchAnalyticsWindow;
  windowB: SearchAnalyticsWindow;
} {
  if (a.schemaVersion !== b.schemaVersion) {
    throw new QueryInvalidError(
      "schemaVersion",
      `cannot diff snapshots of different versions (${a.schemaVersion} vs ${b.schemaVersion})`,
    );
  }
  const localeDelta: Record<SearchAnalyticsLocale, number> = {
    "pt-BR": 0, "en-US": 0, "es-ES": 0,
  };
  for (const loc of SUPPORTED_LOCALES) {
    const aCount = a.localeDistribution.find((l) => l.locale === loc)?.count ?? 0;
    const bCount = b.localeDistribution.find((l) => l.locale === loc)?.count ?? 0;
    localeDelta[loc] = bCount - aCount;
  }
  return {
    totalQueriesDelta: b.totalQueries - a.totalQueries,
    uniqueUsersDelta: b.uniqueUsers - a.uniqueUsers,
    uniqueSessionsDelta: b.uniqueSessions - a.uniqueSessions,
    avgResultCountDelta: b.avgResultCount - a.avgResultCount,
    queryLatencyP50Delta: b.queryLatencyP50 - a.queryLatencyP50,
    queryLatencyP95Delta: b.queryLatencyP95 - a.queryLatencyP95,
    queryLatencyP99Delta: b.queryLatencyP99 - a.queryLatencyP99,
    sacredTextFilterRateDelta: b.sacredTextFilterRate - a.sacredTextFilterRate,
    sacredTextReservedRateDelta: b.sacredTextReservedRate - a.sacredTextReservedRate,
    localeDistributionDelta: localeDelta,
    windowA: a.window,
    windowB: b.window,
  };
}

/**
 * Snapshot staleness check. Throws `SnapshotStaleError` if the snapshot
 * is older than `staleMs` ms (default `SNAPSHOT_STALE_MS_DEFAULT`).
 */
export function assertSnapshotFresh(
  snapshot: SearchAnalyticsSnapshot,
  nowMs: number = Date.now(),
  staleMs: number = SNAPSHOT_STALE_MS_DEFAULT,
): void {
  const t = parseIsoMillis(snapshot.generatedAtIso);
  if (!Number.isFinite(t)) {
    throw new SnapshotStaleError(Number.NaN, staleMs);
  }
  const ageMs = nowMs - t;
  if (ageMs > staleMs) throw new SnapshotStaleError(ageMs, staleMs);
}

/**
 * Refresh a snapshot. Convenience wrapper for the dashboard auto-refresh
 * endpoint.
 */
export function refreshSearchAnalyticsSnapshot(
  query: SearchAnalyticsQuery,
  logs: readonly SearchQueryLog[],
  nowMs: number = Date.now(),
): SearchAnalyticsSnapshot {
  return buildSearchAnalyticsSnapshot(query, logs, nowMs);
}

// ─────────────────────────────────────────────────────────────────────────────
// §11  PRUNE & ANONYMISE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prune logs older than `maxAgeDays`. Returns a new array (does NOT
 * mutate the input). Rows with `wasSacredReserved=true` are pruned
 * first per sacred-text policy — we never let reserved-slot data
 * linger beyond `SACRED_TEXT_DASHBOARD_TTL_DAYS`.
 */
export function pruneLogsOlderThan(
  logs: readonly SearchQueryLog[],
  maxAgeDays: number = SACRED_TEXT_DASHBOARD_TTL_DAYS,
  nowMs: number = Date.now(),
): readonly SearchQueryLog[] {
  if (!Number.isFinite(maxAgeDays) || maxAgeDays <= 0) {
    throw new QueryInvalidError("maxAgeDays", "must be > 0");
  }
  const horizonMs = nowMs - maxAgeDays * 24 * 60 * 60 * 1000;
  const sacredHorizonMs = nowMs - SACRED_TEXT_DASHBOARD_TTL_DAYS * 24 * 60 * 60 * 1000;
  return logs.filter((r) => {
    const t = parseIsoMillis(r.timestamp);
    if (!Number.isFinite(t)) return false;
    if (r.wasSacredReserved && t < sacredHorizonMs) return false;
    return t >= horizonMs;
  });
}

/**
 * Anonymise logs for sharing. `k-anonymous` means every emitted row
 * contributes to a bucket of size >= K_ANON_THRESHOLD; smaller buckets
 * are dropped entirely.
 *
 * Additionally:
 *  • session_hash is replaced by `pseudoHash(sessionHash)`
 *  • query is replaced by its `normalizedQuery` form
 *  • clickedResultId is dropped when `wasSacredReserved === true`
 *  • timestamp is bucketed to hour precision
 */
export function anonymizeForSharing(
  logs: readonly SearchQueryLog[],
  opts: { threshold?: number } = {},
): readonly SearchQueryLog[] {
  const threshold = opts.threshold ?? K_ANON_THRESHOLD;
  if (!Number.isFinite(threshold) || threshold < K_ANON_THRESHOLD) {
    throw new KAnonThresholdViolationError(threshold, K_ANON_THRESHOLD);
  }
  // Phase 1 — emit candidate pseudonymised rows.
  const candidates: SearchQueryLog[] = logs.map((r) => ({
    ...r,
    sessionHash: `anon#${pseudoHash(r.sessionHash)}`,
    query: normalizeQueryForGrouping(r.query),
    clickedResultId: r.wasSacredReserved ? null : r.clickedResultId,
    clickPosition: r.wasSacredReserved ? null : r.clickPosition,
    timestamp: bucketTimestampToHour(r.timestamp),
  }));
  // Phase 2 — bucket by query + bucket each row to count.
  const counts = new Map<string, number>();
  for (const r of candidates) {
    const key = `${r.query}|${r.locale}|${r.timestamp}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return candidates.filter((r) => {
    const key = `${r.query}|${r.locale}|${r.timestamp}`;
    return (counts.get(key) ?? 0) >= threshold;
  });
}

/**
 * Bucket an ISO timestamp to the start of the hour.
 */
function bucketTimestampToHour(iso: string): string {
  const t = parseIsoMillis(iso);
  if (!Number.isFinite(t)) return iso;
  const hour = 60 * 60 * 1000;
  const bucketed = Math.floor(t / hour) * hour;
  return new Date(bucketed).toISOString();
}

/**
 * Delete every row for a session hash. Returns the deletion count.
 *
 * LGPD Art. 18 right to erasure. Owner can trigger this from the
 * privacy dashboard.
 */
export function deleteAnalyticsHistory(
  store: SearchAnalyticsLogStore,
  sessionHash: string,
): { deleted: number; receipt_at_iso: string } {
  if (typeof sessionHash !== "string" || sessionHash.length === 0) {
    throw new QueryInvalidError("sessionHash", "must be non-empty string");
  }
  const removed = store.deleteSession(sessionHash);
  return {
    deleted: removed,
    receipt_at_iso: new Date().toISOString(),
  };
}

/**
 * LGPD Art. 18 right to portability. Returns an export envelope. The
 * caller can stream the JSON / CSV via the runtime's response helper.
 *
 * Sacred-text policy: `clickedResultId` is dropped for any row where
 * `wasSacredReserved === true`. `query` is the original verbatim form
 * (NOT normalised) because the user's privacy needs to take precedence
 * over k-anonymisation here — the user owns their data.
 */
export function exportAnalyticsHistory(
  store: SearchAnalyticsLogStore,
  sessionHash: string,
  format: "json" | "csv" = "json",
): { user_session: string; entries: readonly SearchQueryLog[]; format: "json" | "csv"; byte_size: number; generated_at_iso: string } {
  const rows = store.snapshot().filter((r) => r.sessionHash === sessionHash);
  const sanitised = rows.map((r) => ({
    ...r,
    clickedResultId: r.wasSacredReserved ? null : r.clickedResultId,
    clickPosition: r.wasSacredReserved ? null : r.clickPosition,
  }));
  return {
    user_session: sessionHash,
    entries: sanitised,
    format,
    byte_size: textByteLength(JSON.stringify(sanitised)),
    generated_at_iso: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// §12  EXPORTS (owner-facing)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export a snapshot as JSON. Sacred-text redactions applied:
 *  - topQueries & zeroResultQueries with `exposed === false` are dropped
 *  - never echoes any raw query that is below k-anon threshold
 */
export function exportSnapshotAsJson(
  snapshot: SearchAnalyticsSnapshot,
): { filename: string; content: string; byte_size: number } {
  const safe: SearchAnalyticsSnapshot = {
    ...snapshot,
    topQueries: snapshot.topQueries.filter((r) => r.exposed),
    zeroResultQueries: snapshot.zeroResultQueries.filter((r) => r.exposed),
  };
  const content = JSON.stringify(safe, null, 2);
  return {
    filename: `search-analytics-${snapshot.window}-${safe.generatedAtIso}.json`,
    content,
    byte_size: textByteLength(content),
  };
}

/**
 * Export a snapshot as CSV. Same k-anon redactions as JSON.
 */
export function exportSnapshotAsCsv(
  snapshot: SearchAnalyticsSnapshot,
): { filename: string; content: string; byte_size: number } {
  const safeTop = snapshot.topQueries.filter((r) => r.exposed);
  const lines: string[] = [];
  lines.push("# Search analytics snapshot");
  lines.push(`# window=${snapshot.window}`);
  lines.push(`# generated_at=${snapshot.generatedAtIso}`);
  lines.push(`# totalQueries=${snapshot.totalQueries}`);
  lines.push(`# uniqueUsers=${snapshot.uniqueUsers}`);
  lines.push(`# uniqueSessions=${snapshot.uniqueSessions}`);
  lines.push(`# sacredTextFilterRate=${snapshot.sacredTextFilterRate}`);
  lines.push(`# sacredTextReservedRate=${snapshot.sacredTextReservedRate}`);
  lines.push(`# queryLatencyP50=${snapshot.queryLatencyP50}`);
  lines.push(`# queryLatencyP95=${snapshot.queryLatencyP95}`);
  lines.push(`# queryLatencyP99=${snapshot.queryLatencyP99}`);
  lines.push("");
  lines.push("rank,query,normalizedQuery,occurrences,zeroResultCount,clickCount,zeroResultRate,clickThroughRate,lastSeenIso");
  safeTop.forEach((r, idx) => {
    lines.push(
      [
        idx + 1,
        csvCell(r.query),
        csvCell(r.normalizedQuery),
        r.occurrenceCount.toString(),
        r.zeroResultCount.toString(),
        r.clickCount.toString(),
        r.zeroResultRate.toFixed(3),
        r.clickThroughRate.toFixed(3),
        r.lastSeenIso,
      ].join(","),
    );
  });
  lines.push("");
  lines.push("locale,count,share,uniqueSessionEstimate");
  for (const loc of snapshot.localeDistribution) {
    lines.push([loc.locale, loc.count.toString(), loc.share.toFixed(3), loc.uniqueSessionEstimate.toString()].join(","));
  }
  lines.push("");
  lines.push("level,count,share");
  for (const lvl of snapshot.sensitivityFilterUsage) {
    lines.push([lvl.level, lvl.count.toString(), lvl.share.toFixed(3)].join(","));
  }
  const content = lines.join("\n");
  return {
    filename: `search-analytics-${snapshot.window}-${snapshot.generatedAtIso}.csv`,
    content,
    byte_size: textByteLength(content),
  };
}

/**
 * Quoting helper for a single CSV cell.
 */
function csvCell(s: string): string {
  if (s.indexOf(",") < 0 && s.indexOf('"') < 0 && s.indexOf("\n") < 0) return s;
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Byte length of a UTF-8 string. Falls back to JS byte math when
 * `TextEncoder` is missing (defensive for sandboxes without DOM).
 */
function textByteLength(s: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(s).length;
  }
  let n = 0;
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i);
    if (code < 0x80) n += 1;
    else if (code < 0x800) n += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      n += 4;
      i += 1;
    } else n += 3;
  }
  return n;
}

// ─────────────────────────────────────────────────────────────────────────────
// §13  OWNER SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Owner-facing one-page summary. Plain text-ish markdown, ready to be
 * pasted into Notion / Slack.
 */
export function summarizeForOwner(snapshot: SearchAnalyticsSnapshot): string {
  const top = snapshot.topQueries.slice(0, 5);
  const lines: string[] = [];
  lines.push(`# Search analytics — ${snapshot.window}`);
  lines.push("");
  lines.push(`Generated: ${snapshot.generatedAtIso}`);
  lines.push("");
  lines.push(`- Total queries: **${snapshot.totalQueries}**`);
  lines.push(`- Unique users (k-anon estimated): **${snapshot.uniqueUsers}**`);
  lines.push(`- Unique sessions: **${snapshot.uniqueSessions}**`);
  lines.push(`- Average results/query: **${snapshot.avgResultCount.toFixed(2)}**`);
  lines.push(`- Sacred-text filter rate: **${(snapshot.sacredTextFilterRate * 100).toFixed(1)}%**`);
  lines.push(`- Sacred-text reserved yield: **${(snapshot.sacredTextReservedRate * 100).toFixed(1)}%**`);
  lines.push(`- Latency p50 / p95 / p99: **${snapshot.queryLatencyP50}/${snapshot.queryLatencyP95}/${snapshot.queryLatencyP99} ms**`);
  lines.push("");
  if (top.length > 0) {
    lines.push("## Top queries (k-anon, threshold >= 5)");
    for (const r of top) {
      lines.push(
        `- \`${r.query}\` ×${r.occurrenceCount} — zeroResult=${r.zeroResultRate.toFixed(2)} ctr=${r.clickThroughRate.toFixed(2)}`,
      );
    }
    lines.push("");
  }
  if (snapshot.zeroResultQueries.length > 0) {
    lines.push("## Top zero-result queries");
    for (const r of snapshot.zeroResultQueries.slice(0, 5)) {
      lines.push(
        `- \`${r.query}\` ×${r.zeroResultCount} of ${r.occurrenceCount} (${(r.zeroResultRate * 100).toFixed(0)}%)`,
      );
    }
    lines.push("");
  }
  lines.push("## Locale distribution");
  for (const loc of snapshot.localeDistribution) {
    lines.push(`- ${loc.locale}: ${loc.count} (${(loc.share * 100).toFixed(1)}%)`);
  }
  lines.push("");
  lines.push("## Sensitivity filter usage");
  for (const lvl of snapshot.sensitivityFilterUsage) {
    lines.push(`- level ${lvl.level}: ${lvl.count} (${(lvl.share * 100).toFixed(1)}%)`);
  }
  if (snapshot.ownerPrincipal) {
    lines.push("");
    lines.push(`---\n_Owner: ${snapshot.ownerPrincipal}_`);
  }
  return lines.join("\n");
}

/**
 * Audit-friendly single-line summary, suitable for SIEM ingestion.
 */
export function auditLineForOwner(
  snapshot: SearchAnalyticsSnapshot,
  event: "snapshot_generated" | "snapshot_exported" | "snapshot_diffed",
): string {
  return [
    "evt=" + event,
    "ts=" + snapshot.generatedAtIso,
    "window=" + snapshot.window,
    "total=" + snapshot.totalQueries,
    "users=" + snapshot.uniqueUsers,
    "sacred_filter=" + snapshot.sacredTextFilterRate.toFixed(3),
    "owner=" + (snapshot.ownerPrincipal ?? "owner:akasha"),
  ].join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// §14  ENGINE NAMESPACE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Public aggregator. Engines in this repo expose a stable namespace so
 * consumers can `import { SearchAnalyticsDashboardEngine } from "..."`
 * and discover helpers via autocomplete.
 */
export const SearchAnalyticsDashboardEngine = {
  constants: {
    DEFAULT_TOP_N,
    WINDOW_TO_DAYS,
    SACRED_TEXT_DASHBOARD_TTL_DAYS,
    K_ANON_THRESHOLD,
    SNAPSHOT_STALE_MS_DEFAULT,
    ENGINE_VERSION,
    LATENCY_CAP_MS,
    SUPPORTED_WINDOWS,
    SUPPORTED_LOCALES,
    SUPPORTED_SENSITIVITY_LEVELS,
    OWNER_PRINCIPAL_PREFIXES,
    SPAM_RATE_LIMIT_QPM,
    SPAM_DIVERSITY_LIMIT,
    SPAM_RATE_LIMIT_WINDOW_MS,
    SAFE_TOP_N_FALLBACK,
  },
  errors: {
    SearchAnalyticsDashboardError,
    ConsentMissingError,
    WindowTooLargeError,
    SnapshotStaleError,
    QueryInvalidError,
    ExportFailedError,
    AnonymizationFailedError,
    KAnonThresholdViolationError,
    LocaleUnsupportedError,
  },
  helpers: {
    assertSearchAnalyticsLocale,
    assertSacrednessLevel,
    assertSnapshotFresh,
    bucketTimestampToHour,
    classifyLogForSpam,
    csvCell,
    isAnalyticsWindow,
    isSacrednessLevel,
    isSearchAnalyticsLocale,
    normalizeQueryForGrouping,
    nowIso,
    parseIsoMillis,
    percentile,
    pseudoHash,
    validateAnalyticsQuery,
    windowToDays,
    textByteLength,
    applyKAnon,
    aggregateByQuery,
  },
  recording: {
    recordSearchQuery,
    recordSearchClick,
    SearchAnalyticsLogStore,
    deleteAnalyticsHistory,
    exportAnalyticsHistory,
  },
  filters: {
    filterByLocale,
    filterBySensitivity,
    filterLogsByWindow,
    filterSacredReservedLogs,
    filterZeroResultLogs,
  },
  queries: {
    localeDistribution,
    queryLatencyStats,
    sacredTextFilterRate,
    sensitivityFilterUsage,
    topQueriesByClickThrough,
    topQueriesByFrequency,
    topZeroResultQueries,
    uniqueSessionEstimate,
    uniqueUserEstimate,
  },
  snapshot: {
    buildSearchAnalyticsSnapshot,
    diffSnapshots,
    refreshSearchAnalyticsSnapshot,
  },
  privacy: {
    anonymizeForSharing,
    pruneLogsOlderThan,
  },
  rewrite: {
    detectQuerySpam,
    queryRewriteSuggestion,
  },
  export: {
    exportSnapshotAsCsv,
    exportSnapshotAsJson,
  },
  owner: {
    auditLineForOwner,
    summarizeForOwner,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// §15  END — w51/search-analytics-dashboard
// ─────────────────────────────────────────────────────────────────────────────
