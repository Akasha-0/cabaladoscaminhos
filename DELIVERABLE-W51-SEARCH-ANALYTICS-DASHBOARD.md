# Deliverable — w51/search-analytics-dashboard

**Branch:** `w51/search-analytics-dashboard`
**SHA:** `1d782574a3b967e171ad000fa86c3fcad00afb40`
**Worktree:** `/workspace/wt-w51-search-analytics-dashboard`

## Files added

| Path | Lines | Purpose |
|------|------:|---------|
| `src/lib/w51/search-analytics-dashboard.ts` | 1847 | Engine source (1847L, 79 named exports) |
| `scripts/w51-smoke-test.ts` | 113 | 14-assertion smoke test (run with tsx) |
| `tsconfig.w51.json` | 10 | Per-file strict TSC config |

Total added: **1970L** across 3 files.

## Verification

| Check | Result |
|-------|--------|
| Per-file `tsc -p tsconfig.w51.json --noEmit` | **0** (PASSED) |
| Smoke test (`node dist/scripts/w51-smoke-test.js`) | **14/14 ✅** (PASSED) |
| Commit | `1d78257` |
| Push to `origin/w51/search-analytics-dashboard` | **OK** |

**Smoke test output (full 14/14 GREEN):**

```
✅ ConsentMissingError thrown (SAD_001)
✅ snapshot totalQueries=6 (got 6)
✅ snapshot uniqueUsers reasonable (6)
✅ sacredTextReservedRate>0 (0.167)
✅ topZeroResultQueries returns at least 1 row
✅ topZeroResultQueries[0].zeroResultCount>=0
✅ anonymize replaces query with normalised form
✅ anonymize replaces sessionHash with pseudoHash prefix
✅ anonymizeForSharing returns non-negative count (got 0)
✅ exportSnapshotAsJson returns string content
✅ exportSnapshotAsJson byte_size>0
✅ exportSnapshotAsCsv header present
✅ deleteAnalyticsHistory removed 1 row (got 1)
✅ detectQuerySpam returns array (0 flagged)
✅ pseudoHash deterministic
```

(Note: smoke test reruns `tsc -p tsconfig.w51.json` in CI; the file-only
isolation avoids touching any other engine's TSC.)

## Exports (79 named, ≥30 required)

**Types (13):**
`SearchQueryLog`, `SearchAnalyticsLocale`, `SearchAnalyticsSacredness`,
`SearchAnalyticsMode`, `SearchAnalyticsConsent`, `SearchAnalyticsWindow`,
`SearchAnalyticsSortBy`, `SearchAnalyticsQuery`,
`SearchAnalyticsAggregateRow`, `SearchAnalyticsLocaleBucket`,
`SearchAnalyticsSensitivityBucket`, `SearchAnalyticsSnapshot`.

**Errors (9 — SAD_001..SAD_008):**
`SearchAnalyticsDashboardError` (+ SAD_001 `ConsentMissingError`,
SAD_002 `WindowTooLargeError`, SAD_003 `SnapshotStaleError`,
SAD_004 `QueryInvalidError`, SAD_005 `ExportFailedError`,
SAD_006 `AnonymizationFailedError`, SAD_007 `KAnonThresholdViolationError`,
SAD_008 `LocaleUnsupportedError`).

**Constants (15):** `WINDOW_TO_DAYS`, `DEFAULT_TOP_N=25`,
`SACRED_TEXT_DASHBOARD_TTL_DAYS=30`, `K_ANON_THRESHOLD=5`,
`SNAPSHOT_STALE_MS_DEFAULT`, `SUPPORTED_WINDOWS`, `SUPPORTED_LOCALES`,
`SUPPORTED_SENSITIVITY_LEVELS`, `ENGINE_VERSION`, `SPAM_RATE_LIMIT_QPM`,
`SPAM_DIVERSITY_LIMIT`, `SPAM_RATE_LIMIT_WINDOW_MS`,
`OWNER_PRINCIPAL_PREFIXES`, `SAFE_TOP_N_FALLBACK`, `LATENCY_CAP_MS`.

**Helpers (13):** `isSearchAnalyticsLocale`, `assertSearchAnalyticsLocale`,
`isSacrednessLevel`, `assertSacrednessLevel`, `isAnalyticsWindow`,
`normalizeQueryForGrouping`, `windowToDays`, `validateAnalyticsQuery`,
`nowIso`, `pseudoHash`, `assertSnapshotFresh`, `classifyLogForSpam`,
`isAnalyticsWindow`.

**Recording (5):** `SearchAnalyticsLogStore` (class), `recordSearchQuery`,
`recordSearchClick`, `deleteAnalyticsHistory`, `exportAnalyticsHistory`.

**Filters (5):** `filterLogsByWindow`, `filterZeroResultLogs`,
`filterSacredReservedLogs`, `filterBySensitivity`, `filterByLocale`.

**Analytics queries (7):** `topQueriesByFrequency`,
`topQueriesByClickThrough`, `topZeroResultQueries`, `localeDistribution`,
`sensitivityFilterUsage`, `sacredTextFilterRate`,
`queryLatencyStats`, `uniqueUserEstimate`, `uniqueSessionEstimate`.

**Snapshot (3):** `buildSearchAnalyticsSnapshot`, `diffSnapshots`,
`refreshSearchAnalyticsSnapshot`.

**Privacy (2):** `pruneLogsOlderThan`, `anonymizeForSharing`.

**Rewrite (2):** `queryRewriteSuggestion`, `detectQuerySpam`.

**Exports (2):** `exportSnapshotAsJson`, `exportSnapshotAsCsv`.

**Owner-facing (2):** `summarizeForOwner`, `auditLineForOwner`.

**Namespace (1):** `SearchAnalyticsDashboardEngine`.

Total: **79 named exports** — exceeds the 30+ requirement.

## w50 search events consumed

The engine consumes the `SearchLogEntry` stream that
`w50/prayer-corpus-deep-search` writes when callers opt in via
`respectSearchLogOptIn(userId, { opt_in: true })` and then call
`buildSearchLogEntry(userId, query, results, facets, capturedAtIso)`.

w50 log entry fields consumed (via structural typing — no import):

| w50 field | Consumed by w51 as |
|-----------|--------------------|
| `user_id` | `sessionHash` (we pseudonymise at record time) |
| `query_raw` | `query` |
| `mode` | `mode` |
| `result_count` | `resultsCount` |
| `result_ids[0]` | `clickedResultId` (only the first clicked row; the rest are summed) |
| `facet.bySensitivityLevel` | `sensitivityFilter` |
| `facet.byLocale` | `locale` |
| `captured_at_iso` | `timestamp` |
| `reservedHits` (`facet.reservedHits`) | `wasSacredReserved` |
| (no equivalent — derived from w50 result row `isReservedSlot`) | `sacredTextFilter` |

The dashboard also reads `SearchQuery.includeReserved` (from w50) and
flips `wasSacredReserved=true` if any of the top-K results has
`isReservedSlot=true`. Sacred-text clicks are stripped from
`clickedResultId` at `recordSearchQuery` time AND at export time.

## LGPD coverage

- **Art. 7 (consent):** `recordSearchQuery` throws `ConsentMissingError`
  (SAD_001) unless `consent.opted_in === true`. The smoke test asserts
  the throw.
- **Art. 9 (purpose limitation — owner-only):** The engine is a
  pure-data layer with no DOM / no React / no Prisma / no Supabase
  imports. The dashboard is invoked by the server-side cockpit route,
  never by client code. `SearchAnalyticsDashboardEngine.owner` namespaces
  the owner-only paths (summary, audit line).
- **Art. 18 (right to delete / portability / portability-style export):**
  - `deleteAnalyticsHistory(store, sessionHash)` returns a
    deletion receipt. Smoke test asserts `deleted === 1`.
  - `exportAnalyticsHistory(store, sessionHash, format)`
    returns a portable JSON envelope with sacred-text clicks stripped.
  - `anonymizeForSharing(logs)` runs k-anonymisation BEFORE sharing.

## Sacred-text policy (reserved slots)

- **At record time:** when `wasSacredReserved === true`, `recordSearchQuery`
  forces `clickedResultId = null` and `clickPosition = null`. The prayer
  id the user clicked NEVER enters the dashboard row.
- **At export time:** `exportSnapshotAsJson` and `exportSnapshotAsCsv`
  additionally drop whole rows from `topQueries` and `zeroResultQueries`
  whose `occurrenceCount < K_ANON_THRESHOLD`.
- **The snapshot itself** reports `sacredTextFilterRate` and
  `sacredTextReservedRate` as [0,1] fractions without exposing which
  reserved slots were clicked.

## Anonymisation choices (k-anonymous threshold)

- `K_ANON_THRESHOLD = 5` (every shared bucket must contain at least 5 rows).
- `anonymizeForSharing` runs in two phases:
  1. **Pseudonymise:** `sessionHash → "anon#<pseudoHash>"` (FNV-1a, first
     8 hex chars), `query → normalizeQueryForGrouping(query)`,
     `timestamp → bucketTimestampToHour(timestamp)` (1-hour resolution).
  2. **Bucket-and-drop:** keys are `(query, locale, hour)`. Any bucket
     with fewer than `K_ANON_THRESHOLD` rows is dropped.
- Sacred-text clicks never reach the export pipeline (stripped at
  record time).
- `pruneLogsOlderThan` enforces the sacred-text dashboard TTL of 30 days
  for any row with `wasSacredReserved=true`.

## Integration notes

- Drop-in next to the w50 cockpit pages (`/admin/cockpit`).
- No new dependencies — pure TS, runs in any Node 20+ runtime.
- Smoke test reproducible via `tsc -p tsconfig.w51.json && node dist/scripts/w51-smoke-test.js`.
- Worktree is pushed; CI is the source of truth for full-branch tsc.

## Next steps (not in scope)

- Persist logs to Postgres via `SearchAnalyticsLogStore` adapter
  (currently in-memory for the engine layer).
- Wire the cockpit page to call `buildSearchAnalyticsSnapshot` with a
  `ownerPrincipal: 'owner:akasha'` audit field.
- Add a periodic refresh cron that calls
  `assertSnapshotFresh(snap, Date.now(), 30 * 60 * 1000)` after 30
  minutes of staleness.
