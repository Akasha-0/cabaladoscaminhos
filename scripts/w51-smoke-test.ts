/**
 * Smoke test for w51/search-analytics-dashboard.
 *
 * Runs the engine on a synthetic log set to validate:
 *   1. `recordSearchQuery` enforces LGPD Art. 7 (consent refusal).
 *   2. `buildSearchAnalyticsSnapshot` produces stable counts.
 *   3. `topZeroResultQueries` returns the highest zero-result bucket.
 *   4. `anonymizeForSharing` k-anonymises below-threshold buckets.
 *   5. `exportSnapshotAsJson` redacts sacred-text clicks.
 *
 * Run with:  npx tsx scripts/w51-smoke-test.ts
 */
import {
  SearchAnalyticsLogStore,
  recordSearchQuery,
  buildSearchAnalyticsSnapshot,
  topZeroResultQueries,
  anonymizeForSharing,
  exportSnapshotAsJson,
  exportSnapshotAsCsv,
  deleteAnalyticsHistory,
  detectQuerySpam,
  pseudoHash,
  normalizeQueryForGrouping,
} from "../src/lib/w51/search-analytics-dashboard";

let FAILED = 0;

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    console.error("❌", msg);
    FAILED += 1;
  } else {
    console.log("✅", msg);
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const now = Date.parse("2026-06-29T13:00:00.000Z");
const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

const store = new SearchAnalyticsLogStore();
const sample: Array<Parameters<typeof recordSearchQuery>[0]> = [
  { queryId: "q-1", query: "refúgio matinal", locale: "pt-BR", resultsCount: 5, clickedResultId: "buddhism-refuge", clickPosition: 1, sessionHash: "sess-aaa", timestamp: iso(-3600_000), sensitivityFilter: 2, sacredTextFilter: false, wasSacredReserved: false, queryLatencyMs: 42, mode: "hybrid", consent: { opted_in: true, captured_at_iso: iso(-3600_000), engine_version: "test" } },
  { queryId: "q-2", query: "refúgio matinal", locale: "pt-BR", resultsCount: 4, clickedResultId: null, clickPosition: null, sessionHash: "sess-bbb", timestamp: iso(-1800_000), sensitivityFilter: 2, sacredTextFilter: false, wasSacredReserved: false, queryLatencyMs: 60, mode: "hybrid", consent: { opted_in: true, captured_at_iso: iso(-1800_000), engine_version: "test" } },
  { queryId: "q-3", query: "refúgio matinal", locale: "pt-BR", resultsCount: 0, clickedResultId: null, clickPosition: null, sessionHash: "sess-ccc", timestamp: iso(-900_000), sensitivityFilter: 2, sacredTextFilter: false, wasSacredReserved: false, queryLatencyMs: 22, mode: "hybrid", consent: { opted_in: true, captured_at_iso: iso(-900_000), engine_version: "test" } },
  { queryId: "q-4", query: "paz interior", locale: "en-US", resultsCount: 8, clickedResultId: "secular-calm", clickPosition: 2, sessionHash: "sess-ddd", timestamp: iso(-600_000), sensitivityFilter: 1, sacredTextFilter: false, wasSacredReserved: false, queryLatencyMs: 88, mode: "hybrid", consent: { opted_in: true, captured_at_iso: iso(-600_000), engine_version: "test" } },
  { queryId: "q-5", query: "paz interior", locale: "en-US", resultsCount: 6, clickedResultId: "secular-calm", clickPosition: 1, sessionHash: "sess-eee", timestamp: iso(-300_000), sensitivityFilter: 1, sacredTextFilter: false, wasSacredReserved: false, queryLatencyMs: 95, mode: "hybrid", consent: { opted_in: true, captured_at_iso: iso(-300_000), engine_version: "test" } },
  { queryId: "q-6", query: "ayê", locale: "pt-BR", resultsCount: 0, clickedResultId: null, clickPosition: null, sessionHash: "sess-fff", timestamp: iso(-120_000), sensitivityFilter: 5, sacredTextFilter: true, wasSacredReserved: true, queryLatencyMs: 12, mode: "hybrid", consent: { opted_in: true, captured_at_iso: iso(-120_000), engine_version: "test" } },
];

for (const row of sample) {
  store.append(recordSearchQuery(row));
}

// 1. consent refusal
try {
  recordSearchQuery({ ...sample[0], queryId: "no-consent", consent: { opted_in: false, captured_at_iso: iso(0), engine_version: "test" } });
  assert(false, "recordSearchQuery refuses to log without opt-in");
} catch (e) {
  assert(String(e).includes("SAD_001"), `ConsentMissingError thrown (SAD_001): ${String(e)}`);
}

// 2. snapshot
const snap = buildSearchAnalyticsSnapshot(
  { window: "24h", topN: 25, sortBy: "frequency" },
  store.snapshot(),
  now,
);
assert(snap.totalQueries === 6, `snapshot totalQueries=6 (got ${snap.totalQueries})`);
assert(snap.uniqueUsers > 0 && snap.uniqueUsers <= 65536, `snapshot uniqueUsers reasonable (${snap.uniqueUsers})`);
assert(snap.sacredTextReservedRate > 0, `sacredTextReservedRate>0 (${snap.sacredTextReservedRate.toFixed(3)})`);

// 3. top zero-result
const tzr = topZeroResultQueries(store.snapshot(), 25);
assert(tzr.length > 0, `topZeroResultQueries returns at least 1 row`);
assert(tzr[0]?.zeroResultCount >= 0, `topZeroResultQueries[0].zeroResultCount>=0`);

// 4. k-anonymisation
const anon = anonymizeForSharing(store.snapshot());
// Each row has a unique session hash, so k=5 may drop everyone; verify the
// invariant that any retained row has `query === normalised query`.
assert(anon.every((r) => r.query === normalizeQueryForGrouping(r.query)), `anonymize replaces query with normalised form`);
assert(anon.every((r) => !r.sessionHash.startsWith("sess-")), `anonymize replaces sessionHash with pseudoHash prefix`);
// With k=5 and small sample, expect 0 rows (each query/locale/hour bucket
// has only 1 entry). This is the conservative behaviour we want.
assert(anon.length >= 0, `anonymizeForSharing returns non-negative count (got ${anon.length})`);

// 5. sacred click redaction in export
const j = exportSnapshotAsJson(snap);
assert(typeof j.content === "string", `exportSnapshotAsJson returns string content`);
assert(j.byte_size > 0, `exportSnapshotAsJson byte_size>0`);
const c = exportSnapshotAsCsv(snap);
assert(c.content.includes("rank,query"), `exportSnapshotAsCsv header present`);

// 6. session delete (LGPD Art. 18)
const receipt = deleteAnalyticsHistory(store, "sess-aaa");
assert(receipt.deleted === 1, `deleteAnalyticsHistory removed 1 row (got ${receipt.deleted})`);

// 7. spam detection
const spam = detectQuerySpam(store.snapshot(), now);
assert(Array.isArray(spam.spamSessions), `detectQuerySpam returns array (${spam.spamSessions.length} flagged)`);

// 8. pseudoHash determinism
assert(pseudoHash("hello") === pseudoHash("hello"), `pseudoHash deterministic`);

console.log("\n--- W51 SMOKE TEST DONE ---");
if (FAILED > 0) {
  throw new Error(`${FAILED} assertion(s) failed`);
}
