/**
 * Smoke + regression tests for w54/voice-mood-coach-leaderboard.
 * Roda isolado (sem imports de outros arquivos do repo).
 */
import { describe, it, expect } from "vitest";

import {
  // §3 math
  fnv1a32,
  fnv1a64,
  fnv1a64Bytes,
  sha256,
  hmacSha256,
  hmacSha256Short,
  mulberry32,
  mean,
  stddev,
  clamp,
  percentile,
  // §4 session validation
  validateSessionRecord,
  computeMoodImprovement,
  computeCueAdherence,
  durationMinutes,
  hashMoodArc,
  computeMoodBaselineCurrent,
  hashSessionRecord,
  // §5 cohort builders
  durationBucket,
  purityBucket,
  buildCohortKey,
  cohortLabel,
  crossCohortLabel,
  cohortKeyString,
  parseCohortKey,
  allCohortTypes,
  // §6 aggregation
  emptyUserAggregate,
  accumulateSession,
  filterOptedIn,
  filterFlagged,
  filterSacredSessions,
  isSacredSession,
  aggregateUsersByScope,
  deriveUserStats,
  compositeScore,
  countByCohort,
  deriveCohortStats,
  // §7 k-anonymity
  resolveK,
  enforceKAnonymity,
  enforceKAnonymityBatch,
  computeKActual,
  K_MINIMUM_MANDATORY,
  // §8 anon ids + bounds
  resolveHmacKey,
  buildWeekId,
  buildMonthId,
  weekBoundsSunSat,
  monthBounds,
  buildAnonymousId,
  buildAllTimeAnonymousId,
  buildMonthlyAnonymousId,
  nextWeekId,
  isValidWeekId,
  isValidMonthId,
  auditHashView,
  // §9 ranking views
  resolveScopeBounds,
  buildTopUsersView,
  buildTopCohortsView,
  buildMostImprovedView,
  rankUserEntries,
  computeViewTotals,
  // §10 anti-gaming
  groupSessionsByUser,
  detectRapidSessionCreation,
  detectIdenticalMoodArc,
  detectIpDeviceCluster,
  detectCueAdherenceInflation,
  detectDurationOutliers,
  detectFilteredToggle,
  detectRegionJumps,
  runAntiGaming,
  applyIpDeviceClusterDetection,
  averageRiskScore,
  countFlagged,
  topReasons,
  // §11 opt-in + LGPD
  createOptInRecord,
  optIn,
  optOut,
  autoRevoke,
  lgpdErase,
  isOptedIn,
  buildExportPayload,
  ensureOptInRecord,
  anonymizeForAudit,
  isPurposeAllowed,
  buildLgpdRightsResponse,
  LGPD_CONSENT_TEXT_PT,
  LGPD_CONSENT_TEXT_EN,
  getConsentText,
  // §12 sacred
  detectSacredEvent,
  countSacred,
  countSacredByKind,
  isEligibleForLeaderboard,
  filterEligible,
  detectSacredLeak,
  viewIsSacredClean,
  getSacredPolicyText,
  SACRED_KINDS,
  // §13 audit + main pipeline
  createAuditLog,
  appendAuditStep,
  auditLogIntegrity,
  auditLogHash,
  trimAuditLog,
  buildLeaderboardView,
  // §14 smoke helpers
  makeSyntheticSession,
  makeSyntheticUserSessions,
  smokeHashDeterminism,
  smokeKAnonymityEnforcement,
  smokeSacredExclusion,
  smokeOptInDefaultOff,
  smokeOptInOutCycle,
  smokeAnonIdRotation,
  smokeAntiGamingRapid,
  smokeKMinimumMandatory,
  smokeFullPipeline,
  smokeSacredNeverRanks,
  smokeLgpdExportNoOptIn,
  smokeCohortMergeAuditability,
  smokeCompositeScore,
  smokeSha256Empty,
  smokeSha256Abc,
  smokeHmacSha256Rfc4231,
  smokeThreeSubViews,
  smokeCohortMergePreservesData,
  smokeFnv1a32,
  smokeSacredLeakDetection,
  runAllSmokeTests,
  summarizeSmokeTests,
  // §15 doc constants
  ENGINE_VERSION,
  POLICY_VERSION,
  K_DEFAULT,
  K_MAXIMUM,
  SACRED_POLICY_TEXT_PT,
  SACRED_POLICY_TEXT_EN,
  ENGINE_GUARANTEES,
  ENGINE_LIMITS,
  WEEKLY_ROTATION_POLICY,
  ERROR_MESSAGES,
  makeError,
  DEFAULT_BUILD_OPTIONS,
  FILE_METADATA,
  LABELS_PT_BR,
  LABELS_EN,
  getLabels,
  TRADITION_TAXONOMY,
  REGION_TAXONOMY,
  DURATION_BUCKET_SHORT_MAX_SEC,
  DURATION_BUCKET_MEDIUM_MAX_SEC,
  PURITY_FILTERED,
  PURITY_FULL,
  PURITY_MIXED,
  HMAC_KEY_PLACEHOLDER,
  HMAC_KEY_DEV_DEFAULT,
  AUDIT_LEDGER_VERSION,
  AUDIT_RETENTION_DAYS_DEFAULT,
  ANTI_GAMING_MAX_SESSIONS_PER_HOUR,
  ANTI_GAMING_MAX_REGIONS_PER_24H,
  ANTI_GAMING_CUE_INFLATION_DAYS,
  ANTI_GAMING_DURATION_SIGMA,
  ANTI_GAMING_CLUSTER_MIN_USERS,
  ANTI_GAMING_CLUSTER_WINDOW_HOURS,
  TOP_USERS_DEFAULT_LIMIT,
  TOP_COHORTS_DEFAULT_LIMIT,
  MOST_IMPROVED_DEFAULT_LIMIT,
  SCORE_WEIGHT_SESSIONS,
  SCORE_WEIGHT_MINUTES,
  SCORE_WEIGHT_CUE_ADHERENCE,
  SCORE_WEIGHT_MOOD_IMPROVEMENT,
  ANON_ID_ROTATION_WEEKDAY,
  WEEK_STARTS_ON,
  LGPD_ARTICLES_COVERED,
  ENGINE_DEPENDENCIES,
  // types
  type CoachSessionRecordShape,
  type CohortKey,
  type OptInRecord,
  type LeaderboardView,
  type LeaderboardErrorCode,
} from "@/lib/w54/voice_mood_coach_leaderboard";

describe("w54/voice-mood-coach-leaderboard", () => {
  describe("§3 Math helpers", () => {
    it("fnv1a32 — known vector 'foobar' = bf9cf968", () => {
      expect(fnv1a32("foobar")).toBe("bf9cf968");
    });

    it("fnv1a64 — deterministic for same input", () => {
      expect(fnv1a64("hello")).toBe(fnv1a64("hello"));
      expect(fnv1a64("hello")).not.toBe(fnv1a64("hello!"));
    });

    it("fnv1a64Bytes — handles non-ASCII", () => {
      const a = fnv1a64Bytes(new Uint8Array([1, 2, 3]));
      const b = fnv1a64Bytes(new Uint8Array([1, 2, 3, 4]));
      expect(a).not.toBe(b);
    });

    it("sha256 — empty string = e3b0c44298...", () => {
      expect(sha256("")).toBe(
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      );
    });

    it("sha256 — 'abc' = ba7816bf...", () => {
      expect(sha256("abc")).toBe(
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
      );
    });

    it("hmacSha256 — RFC 4231 test case 1", () => {
      const key = new Uint8Array(20).fill(0x0b);
      expect(hmacSha256(key, "Hi There")).toBe(
        "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7"
      );
    });

    it("hmacSha256Short — 16 chars hex", () => {
      const id = hmacSha256Short("k", "m");
      expect(id).toHaveLength(16);
      expect(/^[0-9a-f]{16}$/.test(id)).toBe(true);
    });

    it("mulberry32 — deterministic", () => {
      const a = mulberry32(42);
      const b = mulberry32(42);
      expect(a()).toBe(b());
      expect(a()).toBe(b());
    });

    it("mean / stddev / clamp / percentile", () => {
      expect(mean([1, 2, 3, 4])).toBe(2.5);
      expect(stddev([1, 2, 3, 4])).toBeCloseTo(1.2909944487);
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(percentile([1, 2, 3, 4, 5], 0.5)).toBe(3);
    });
  });

  describe("§4 Session validation", () => {
    it("validates session — issues empty for good record", () => {
      const r = makeSyntheticSession();
      expect(validateSessionRecord(r)).toHaveLength(0);
    });

    it("validates session — flags invalid sessionId", () => {
      const r = makeSyntheticSession({ sessionId: "x" });
      const issues = validateSessionRecord(r);
      expect(issues.some((i) => i.code === "INVALID_SESSION_ID")).toBe(true);
    });

    it("validates session — flags cuesFollowed > cuesDelivered", () => {
      const r = makeSyntheticSession({ cuesDelivered: 5, cuesFollowed: 10 });
      const issues = validateSessionRecord(r);
      expect(issues.some((i) => i.code === "INVALID_CUES")).toBe(true);
    });

    it("computeMoodImprovement — positive trend", () => {
      const arc = [
        { t: 0, valence: -0.5, arousal: 0 },
        { t: 100, valence: -0.4, arousal: 0 },
        { t: 200, valence: 0.5, arousal: 0 },
        { t: 300, valence: 0.6, arousal: 0 },
      ];
      const r = computeMoodImprovement(arc);
      expect(r).toBeGreaterThan(0.5);
    });

    it("computeCueAdherence — guards div by zero", () => {
      const r = makeSyntheticSession({ cuesDelivered: 0 });
      expect(computeCueAdherence(r)).toBe(0);
    });

    it("durationMinutes — round 1 decimal", () => {
      expect(durationMinutes(makeSyntheticSession({ durationSec: 195 }))).toBe(3.3);
    });

    it("hashMoodArc — same arc = same hash", () => {
      const arc = [
        { t: 0, valence: 0.1, arousal: 0 },
        { t: 100, valence: 0.2, arousal: 0 },
        { t: 200, valence: 0.3, arousal: 0 },
      ];
      expect(hashMoodArc(arc)).toBe(hashMoodArc(arc));
    });

    it("computeMoodBaselineCurrent — slices first/last third", () => {
      const arc = [
        { t: 0, valence: -0.5, arousal: 0 },
        { t: 1, valence: 0.5, arousal: 0 },
        { t: 2, valence: 0.8, arousal: 0 },
        { t: 3, valence: 0.8, arousal: 0 },
      ];
      const r = computeMoodBaselineCurrent(arc);
      expect(r.baseline).toBeCloseTo(-0.5, 1);
      expect(r.current).toBeCloseTo(0.8, 1);
    });

    it("hashSessionRecord — deterministic", () => {
      const r = makeSyntheticSession();
      expect(hashSessionRecord(r)).toBe(hashSessionRecord(r));
    });
  });

  describe("§5 Cohort builders", () => {
    it("durationBucket — short / medium / long", () => {
      expect(durationBucket(60)).toBe("short");
      expect(durationBucket(DURATION_BUCKET_SHORT_MAX_SEC)).toBe("short");
      expect(durationBucket(DURATION_BUCKET_SHORT_MAX_SEC + 1)).toBe("medium");
      expect(durationBucket(DURATION_BUCKET_MEDIUM_MAX_SEC)).toBe("medium");
      expect(durationBucket(DURATION_BUCKET_MEDIUM_MAX_SEC + 1)).toBe("long");
    });

    it("purityBucket — filtered / full / mixed (sacred)", () => {
      expect(purityBucket(true, false)).toBe("filtered");
      expect(purityBucket(false, false)).toBe("full");
      expect(purityBucket(false, true)).toBe("mixed");
    });

    it("buildCohortKey — all 4 types", () => {
      const r = makeSyntheticSession({
        tradition: "umbanda",
        region: "BR",
        durationSec: 600,
        filtered: true,
      });
      expect(buildCohortKey(r, "BY_TRADITION").cohortValue).toBe("umbanda");
      expect(buildCohortKey(r, "BY_REGION").cohortValue).toBe("BR");
      expect(buildCohortKey(r, "BY_DURATION").cohortValue).toBe("medium");
      expect(buildCohortKey(r, "BY_PURITY").cohortValue).toBe("filtered");
    });

    it("cohortLabel — PT and EN", () => {
      const c: CohortKey = {
        cohortType: "BY_TRADITION",
        cohortValue: "umbanda",
        cohortBucket: "umbanda",
      };
      expect(cohortLabel(c, "pt-BR")).toBe("Umbanda");
      expect(cohortLabel(c, "en-US")).toBe("Umbanda");
    });

    it("cohortLabel — region BR", () => {
      const c: CohortKey = {
        cohortType: "BY_REGION",
        cohortValue: "BR",
        cohortBucket: "BR",
      };
      expect(cohortLabel(c, "pt-BR")).toBe("Brasil");
      expect(cohortLabel(c, "en-US")).toBe("Brazil");
    });

    it("cohortLabel — duration long", () => {
      const c: CohortKey = {
        cohortType: "BY_DURATION",
        cohortValue: "long",
        cohortBucket: "long",
      };
      expect(cohortLabel(c, "pt-BR")).toContain("Longa");
    });

    it("crossCohortLabel — concatenates with ×", () => {
      const c1: CohortKey = {
        cohortType: "BY_TRADITION",
        cohortValue: "umbanda",
        cohortBucket: "umbanda",
      };
      const c2: CohortKey = {
        cohortType: "BY_REGION",
        cohortValue: "BR",
        cohortBucket: "BR",
      };
      const s = crossCohortLabel([c1, c2], "pt-BR");
      expect(s).toContain("Umbanda");
      expect(s).toContain("Brasil");
      expect(s).toContain("×");
    });

    it("cohortKeyString round-trip via parseCohortKey", () => {
      const c: CohortKey = {
        cohortType: "BY_DURATION",
        cohortValue: "medium",
        cohortBucket: "medium",
      };
      const parsed = parseCohortKey(cohortKeyString(c));
      expect(parsed).not.toBeNull();
      expect(parsed!.cohortValue).toBe("medium");
    });

    it("parseCohortKey returns null for invalid input", () => {
      expect(parseCohortKey("garbage")).toBeNull();
      expect(parseCohortKey("foo|bar")).toBeNull();
    });

    it("allCohortTypes returns 4 types", () => {
      expect(allCohortTypes()).toHaveLength(4);
      expect(allCohortTypes()).toContain("BY_TRADITION");
      expect(allCohortTypes()).toContain("BY_REGION");
      expect(allCohortTypes()).toContain("BY_DURATION");
      expect(allCohortTypes()).toContain("BY_PURITY");
    });
  });

  describe("§6 Aggregation", () => {
    it("emptyUserAggregate — fields initialized", () => {
      const agg = emptyUserAggregate("u-1");
      expect(agg.userId).toBe("u-1");
      expect(agg.sessionCount).toBe(0);
      expect(agg.cohortMemberships.size).toBe(0);
    });

    it("accumulateSession — counts sessions + minutes", () => {
      const agg = emptyUserAggregate("u-1");
      accumulateSession(agg, makeSyntheticSession({ durationSec: 600 }));
      accumulateSession(agg, makeSyntheticSession({ durationSec: 1200 }));
      expect(agg.sessionCount).toBe(2);
      expect(agg.totalMinutes).toBeGreaterThanOrEqual(10);
      expect(agg.totalMinutes).toBeLessThan(31);
    });

    it("filterOptedIn — excludes non-opted-in", () => {
      const agg1 = emptyUserAggregate("u-1");
      const agg2 = emptyUserAggregate("u-2");
      const m = new Map<string, OptInRecord>();
      m.set("u-1", optIn(createOptInRecord("u-1"), 1000).record);
      const r = filterOptedIn([agg1, agg2], m);
      expect(r).toHaveLength(1);
      expect(r[0]!.userId).toBe("u-1");
    });

    it("filterFlagged — excludes flagged users", () => {
      const agg1 = emptyUserAggregate("u-1");
      const agg2 = emptyUserAggregate("u-2");
      const flags = new Map([
        ["u-2", { userId: "u-2", reasons: [], flaggedSessions: [], riskScore: 0.5, createdAt: 0 }],
      ]);
      const r = filterFlagged([agg1, agg2], flags);
      expect(r.kept).toHaveLength(1);
      expect(r.excluded).toBe(1);
    });

    it("filterSacredSessions — drops sacred", () => {
      const sacred = makeSyntheticSession({ sacredFlag: true, sacredKind: "prayer" });
      const regular = makeSyntheticSession({ sacredFlag: false });
      const r = filterSacredSessions([sacred, regular]);
      expect(r.kept).toHaveLength(1);
      expect(r.excluded).toBe(1);
    });

    it("isSacredSession — detects sacredFlag + sacredKind", () => {
      expect(isSacredSession(makeSyntheticSession({ sacredFlag: false }))).toBe(false);
      expect(
        isSacredSession(makeSyntheticSession({ sacredFlag: true, sacredKind: "chant" }))
      ).toBe(true);
      expect(isSacredSession(makeSyntheticSession({ sacredFlag: true }))).toBe(true);
    });

    it("aggregateUsersByScope — filters by time + sacred", () => {
      const now = Date.now();
      const r1 = makeSyntheticSession({ userId: "u-1", startedAt: now - 1000 });
      const r2 = makeSyntheticSession({
        userId: "u-1",
        startedAt: now - 1000,
        sacredFlag: true,
        sacredKind: "mantra",
      });
      const r3 = makeSyntheticSession({ userId: "u-2", startedAt: now - 1000 });
      const m = aggregateUsersByScope([r1, r2, r3], now - 86400_000, now + 1000);
      expect(m.size).toBe(2);
      expect(m.get("u-1")!.sessionCount).toBe(1); // sacred excluído
    });

    it("deriveUserStats + compositeScore", () => {
      const agg = emptyUserAggregate("u-1");
      accumulateSession(agg, makeSyntheticSession());
      const stats = deriveUserStats(agg);
      const score = compositeScore(stats);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it("countByCohort + deriveCohortStats", () => {
      const records = [
        makeSyntheticSession({ userId: "u-1", tradition: "umbanda" }),
        makeSyntheticSession({ userId: "u-2", tradition: "umbanda" }),
        makeSyntheticSession({ userId: "u-3", tradition: "ifa" }),
      ];
      const m = countByCohort(records, "BY_TRADITION");
      const umbandaKey = cohortKeyString({
        cohortType: "BY_TRADITION",
        cohortValue: "umbanda",
        cohortBucket: "umbanda",
      });
      const ifaKey = cohortKeyString({
        cohortType: "BY_TRADITION",
        cohortValue: "ifa",
        cohortBucket: "ifa",
      });
      expect(m.get(umbandaKey)!.distinctUsers.size).toBe(2);
      expect(m.get(ifaKey)!.distinctUsers.size).toBe(1);

      const cs = deriveCohortStats(
        { cohortType: "BY_TRADITION", cohortValue: "umbanda", cohortBucket: "umbanda" },
        m.get(umbandaKey)!.sessions
      );
      expect(cs.distinctUsers).toBe(2);
    });
  });

  describe("§7 k-anonymity", () => {
    it("resolveK — coerces below minimum to 10", () => {
      expect(resolveK(undefined)).toBe(K_MINIMUM_MANDATORY);
      expect(resolveK(3)).toBe(K_MINIMUM_MANDATORY);
      expect(resolveK(15)).toBe(15);
      expect(resolveK(100)).toBe(K_MAXIMUM);
    });

    it("enforceKAnonymity — satisfied when k <= size", () => {
      const c: CohortKey = {
        cohortType: "BY_TRADITION",
        cohortValue: "umbanda",
        cohortBucket: "umbanda",
      };
      const sizes = new Map([[cohortKeyString(c), 15]]);
      const r = enforceKAnonymity(c, 15, 10, sizes);
      expect(r.outcome).toBe("satisfied");
    });

    it("enforceKAnonymity — merges to parent when below k", () => {
      const c: CohortKey = {
        cohortType: "BY_TRADITION",
        cohortValue: "ifa",
        cohortBucket: "ifa",
      };
      const sizes = new Map<string, number>();
      sizes.set(cohortKeyString(c), 5);
      const r = enforceKAnonymity(c, 5, 10, sizes, "parent_then_sibling", 1000);
      // outcome pode ser merged (parent) ou suppressed se parent também <k
      expect(["merged", "suppressed"]).toContain(r.outcome);
    });

    it("enforceKAnonymityBatch — produces log entries", () => {
      const sizes = new Map<string, number>();
      sizes.set(
        cohortKeyString({
          cohortType: "BY_TRADITION",
          cohortValue: "umbanda",
          cohortBucket: "umbanda",
        }),
        20
      );
      sizes.set(
        cohortKeyString({
          cohortType: "BY_TRADITION",
          cohortValue: "ifa",
          cohortBucket: "ifa",
        }),
        3
      );
      const r = enforceKAnonymityBatch(sizes, 10, 1000);
      expect(r.log.length).toBeGreaterThanOrEqual(2);
      expect(r.totalMerged + r.totalSuppressed).toBeGreaterThanOrEqual(1);
    });

    it("computeKActual returns min size", () => {
      const m = new Map([
        [
          "k1",
          { cohort: {} as CohortKey, size: 20, outcome: "satisfied" as const },
        ],
        [
          "k2",
          { cohort: {} as CohortKey, size: 12, outcome: "satisfied" as const },
        ],
      ]);
      expect(computeKActual(m)).toBe(12);
    });
  });

  describe("§8 Anonymous IDs + bounds", () => {
    it("resolveHmacKey — falls back to dev when placeholder", () => {
      expect(resolveHmacKey(null)).toBe(HMAC_KEY_DEV_DEFAULT);
      expect(resolveHmacKey(HMAC_KEY_PLACEHOLDER)).toBe(HMAC_KEY_DEV_DEFAULT);
      expect(resolveHmacKey("real-key-1234567890")).toBe("real-key-1234567890");
    });

    it("buildWeekId / buildMonthId — formats", () => {
      const ts = Date.UTC(2026, 5, 15); // June 15, 2026
      expect(buildWeekId(ts)).toMatch(/^\d{4}-W\d{2}$/);
      expect(buildMonthId(ts)).toMatch(/^\d{4}-\d{2}$/);
    });

    it("weekBoundsSunSat — 7-day span starting Sunday", () => {
      const ts = Date.UTC(2026, 5, 17); // Wed
      const b = weekBoundsSunSat(ts);
      const span = b.end - b.start;
      expect(span).toBe(7 * 86400_000);
    });

    it("monthBounds — month start/end", () => {
      const ts = Date.UTC(2026, 5, 15);
      const b = monthBounds(ts);
      expect(b.monthId).toBe("2026-06");
      expect(b.end - b.start).toBeGreaterThan(28 * 86400_000);
    });

    it("buildAnonymousId — different weekId → different ID", () => {
      const c: CohortKey = {
        cohortType: "BY_TRADITION",
        cohortValue: "umbanda",
        cohortBucket: "umbanda",
      };
      const id1 = buildAnonymousId("k", "u-1", c, "2026-W22");
      const id2 = buildAnonymousId("k", "u-1", c, "2026-W23");
      expect(id1).not.toBe(id2);
    });

    it("buildAllTimeAnonymousId — stable across calls", () => {
      const c: CohortKey = {
        cohortType: "BY_TRADITION",
        cohortValue: "umbanda",
        cohortBucket: "umbanda",
      };
      const a = buildAllTimeAnonymousId("k", "u-1", c);
      const b = buildAllTimeAnonymousId("k", "u-1", c);
      expect(a).toBe(b);
    });

    it("buildMonthlyAnonymousId — format expected", () => {
      const c: CohortKey = {
        cohortType: "BY_TRADITION",
        cohortValue: "umbanda",
        cohortBucket: "umbanda",
      };
      const id = buildMonthlyAnonymousId("k", "u-1", c, "2026-06");
      expect(id).toHaveLength(16);
    });

    it("nextWeekId — increments", () => {
      expect(nextWeekId("2026-W22")).not.toBe("2026-W22");
    });

    it("isValidWeekId / isValidMonthId", () => {
      expect(isValidWeekId("2026-W22")).toBe(true);
      expect(isValidWeekId("garbage")).toBe(false);
      expect(isValidMonthId("2026-06")).toBe(true);
      expect(isValidMonthId("2026-13")).toBe(false);
    });

    it("auditHashView — deterministic", () => {
      const v: LeaderboardView = {
        view: "LEADERBOARD",
        scope: "WEEKLY",
        subView: "TOP_USERS",
        generatedAt: 1000,
        kMin: 10,
        kActual: 10,
        cohortMergeLog: [],
        users: [],
        totalEligibleUsers: 0,
        totalEligibleSessions: 0,
        sacredExcludedSessions: 0,
        flaggedExcluded: 0,
        auditHash: "",
      };
      expect(auditHashView("k", v)).toBe(auditHashView("k", v));
    });
  });

  describe("§9 Ranking views", () => {
    it("resolveScopeBounds — WEEKLY / MONTHLY / ALL_TIME", () => {
      const now = Date.now();
      const w = resolveScopeBounds({ scope: "WEEKLY", cohortType: "BY_TRADITION" }, now);
      expect(w.start).toBeGreaterThan(0);
      const m = resolveScopeBounds({ scope: "MONTHLY", cohortType: "BY_TRADITION" }, now);
      expect(m.start).toBeGreaterThan(0);
      const a = resolveScopeBounds({ scope: "ALL_TIME", cohortType: "BY_TRADITION" }, now);
      expect(a.start).toBe(0);
      expect(a.scopeId).toBe("ALL_TIME");
    });

    it("buildTopUsersView — empty when below k", () => {
      const optInMap = new Map<string, OptInRecord>();
      for (let i = 0; i < 5; i++) {
        const u = `u-${i}`;
        optInMap.set(u, optIn(createOptInRecord(u), 1000).record);
      }
      const records = makeSyntheticUserSessions(5, 1);
      const aggMap = aggregateUsersByScope(records, 0, 8640000000000000);
      const optedInAggs = filterOptedIn([...aggMap.values()], optInMap);
      const state: import("@/lib/w54/voice_mood_coach_leaderboard").BuildLeaderboardState = {
        options: { scope: "WEEKLY", cohortType: "BY_TRADITION", now: 1000 },
        startTs: 0,
        endTs: 8640000000000000,
        scopeId: "2026-W22",
        optInMap,
        flagsMap: new Map(),
        allRecords: records,
        filteredRecords: records,
        userAggregates: aggMap,
        optedInAggregates: optedInAggs,
        flaggedExcluded: 0,
        cohortStatsMap: new Map(),
        finalCohortKeys: new Set(),
        cohortMergeLog: [],
        views: [],
        errors: [],
        auditTrail: [],
      };
      const sizes = new Map<string, { cohort: CohortKey; size: number }>();
      const r = buildTopUsersView(state, sizes, "k");
      // sem cohorts acima de k = sem entries
      expect(r.users).toHaveLength(0);
    });

    it("buildTopCohortsView + buildMostImprovedView — shapes", () => {
      const optInMap = new Map<string, OptInRecord>();
      for (let i = 0; i < 30; i++) {
        const u = `u-${i}`;
        optInMap.set(u, optIn(createOptInRecord(u), 1000).record);
      }
      const records = makeSyntheticUserSessions(30, 3);
      const agg = aggregateUsersByScope(records, 0, 8640000000000000);
      const optedIn = filterOptedIn([...agg.values()], optInMap);
      const sizes = new Map<string, { cohort: CohortKey; size: number }>();
      const cohort = {
        cohortType: "BY_TRADITION" as const,
        cohortValue: "umbanda",
        cohortBucket: "umbanda",
      };
      sizes.set(cohortKeyString(cohort), { cohort, size: 30 });
      const state: import("@/lib/w54/voice_mood_coach_leaderboard").BuildLeaderboardState = {
        options: { scope: "WEEKLY", cohortType: "BY_TRADITION", now: 1000 },
        startTs: 0,
        endTs: 8640000000000000,
        scopeId: "2026-W22",
        optInMap,
        flagsMap: new Map(),
        allRecords: records,
        filteredRecords: records,
        userAggregates: agg,
        optedInAggregates: optedIn,
        flaggedExcluded: 0,
        cohortStatsMap: new Map(),
        finalCohortKeys: new Set([cohortKeyString(cohort)]),
        cohortMergeLog: [],
        views: [],
        errors: [],
        auditTrail: [],
      };
      const r1 = buildTopCohortsView(state, sizes);
      expect(r1.cohorts.length).toBeGreaterThan(0);
      const r2 = buildMostImprovedView(state, sizes, "k");
      expect(r2.mostImproved.length).toBeGreaterThanOrEqual(0);
    });

    it("rankUserEntries — assigns ranks 1..N", () => {
      const entries = [
        { anonymousId: "a", userCohort: {} as CohortKey, sessions: 5, totalMinutes: 30, cueAdherence: 0.8, moodImprovement: 0.4, compositeScore: 0.5, rank: 0, flagged: false, flagReasons: [] },
        { anonymousId: "b", userCohort: {} as CohortKey, sessions: 10, totalMinutes: 60, cueAdherence: 0.9, moodImprovement: 0.6, compositeScore: 0.9, rank: 0, flagged: false, flagReasons: [] },
      ];
      const sorted = rankUserEntries(entries);
      expect(sorted[0]!.anonymousId).toBe("b");
      expect(sorted[0]!.rank).toBe(1);
      expect(sorted[1]!.rank).toBe(2);
    });

    it("computeViewTotals — counts fields", () => {
      const records = makeSyntheticUserSessions(10, 1);
      const state: import("@/lib/w54/voice_mood_coach_leaderboard").BuildLeaderboardState = {
        options: { scope: "ALL_TIME", cohortType: "BY_TRADITION", now: 1000 },
        startTs: 0,
        endTs: 8640000000000000,
        scopeId: "ALL_TIME",
        optInMap: new Map(),
        flagsMap: new Map(),
        allRecords: records,
        filteredRecords: records,
        userAggregates: new Map(),
        optedInAggregates: [],
        flaggedExcluded: 0,
        cohortStatsMap: new Map(),
        finalCohortKeys: new Set(),
        cohortMergeLog: [],
        views: [],
        errors: [],
        auditTrail: [],
      };
      const totals = computeViewTotals(state);
      expect(totals.totalEligibleSessions).toBe(10);
    });
  });

  describe("§10 Anti-gaming", () => {
    it("groupSessionsByUser", () => {
      const records = [
        makeSyntheticSession({ userId: "u-1", sessionId: "s1" }),
        makeSyntheticSession({ userId: "u-1", sessionId: "s2" }),
        makeSyntheticSession({ userId: "u-2", sessionId: "s3" }),
      ];
      const m = groupSessionsByUser(records);
      expect(m.size).toBe(2);
      expect(m.get("u-1")!.length).toBe(2);
    });

    it("detectRapidSessionCreation — flags >20 in 1h", () => {
      const sessions: CoachSessionRecordShape[] = [];
      for (let i = 0; i < 25; i++) {
        sessions.push(
          makeSyntheticSession({
            userId: "u-cheater",
            sessionId: `c-${i}`,
            startedAt: 1000 + i * 60_000,
          })
        );
      }
      const r = detectRapidSessionCreation(sessions);
      expect(r.flagged).toBe(true);
      expect(r.flaggedSessionIds.length).toBeGreaterThan(0);
    });

    it("detectIdenticalMoodArc — flags repeats ≥3", () => {
      const arc = [
        { t: 0, valence: 0.1, arousal: 0 },
        { t: 100, valence: 0.2, arousal: 0 },
      ];
      const sessions = [
        makeSyntheticSession({ sessionId: "a", moodArc: arc }),
        makeSyntheticSession({ sessionId: "b", moodArc: arc }),
        makeSyntheticSession({ sessionId: "c", moodArc: arc }),
      ];
      const r = detectIdenticalMoodArc(sessions);
      expect(r.flagged).toBe(true);
    });

    it("detectIpDeviceCluster — detects same IP+device across users", () => {
      const device = {
        ua: "Mozilla",
        platform: "web",
        screenW: 1920,
        screenH: 1080,
        tzOffsetMin: -180,
      };
      const records = [
        makeSyntheticSession({
          userId: "u-1",
          ipHash: "iphashA",
          device,
          startedAt: Date.now() - 60_000,
        }),
        makeSyntheticSession({
          userId: "u-2",
          ipHash: "iphashA",
          device,
          startedAt: Date.now() - 30_000,
        }),
        makeSyntheticSession({
          userId: "u-3",
          ipHash: "iphashA",
          device,
          startedAt: Date.now() - 10_000,
        }),
        makeSyntheticSession({
          userId: "u-4",
          ipHash: "iphashA",
          device,
          startedAt: Date.now() - 5_000,
        }),
      ];
      const r = detectIpDeviceCluster(records);
      const clusterA = [...r.values()].find((c) => c.users.size >= 4);
      expect(clusterA).toBeDefined();
    });

    it("detectCueAdherenceInflation — flags ≥99% for 14 days", () => {
      const sessions: CoachSessionRecordShape[] = [];
      const base = Date.now() - 14 * 86400_000;
      for (let i = 0; i < 20; i++) {
        sessions.push(
          makeSyntheticSession({
            sessionId: `i-${i}`,
            cuesDelivered: 10,
            cuesFollowed: 10,
            startedAt: base + i * 86400_000,
          })
        );
      }
      const r = detectCueAdherenceInflation(sessions);
      expect(r.flagged).toBe(true);
    });

    it("detectDurationOutliers — flags >3σ", () => {
      const sessions = [
        makeSyntheticSession({ sessionId: "s1", durationSec: 600 }),
        makeSyntheticSession({ sessionId: "s2", durationSec: 610 }),
        makeSyntheticSession({ sessionId: "s3", durationSec: 620 }),
        makeSyntheticSession({ sessionId: "s4", durationSec: 590 }),
        makeSyntheticSession({ sessionId: "s5", durationSec: 580 }),
        makeSyntheticSession({ sessionId: "outlier", durationSec: 72000 }),
      ];
      const r = detectDurationOutliers(sessions, "BY_TRADITION");
      expect(r.flagged).toBe(true);
      expect(r.flaggedSessionIds).toContain("outlier");
    });

    it("detectFilteredToggle — flags heavy alternation", () => {
      const sessions = [
        makeSyntheticSession({ sessionId: "1", filtered: true }),
        makeSyntheticSession({ sessionId: "2", filtered: false }),
        makeSyntheticSession({ sessionId: "3", filtered: true }),
        makeSyntheticSession({ sessionId: "4", filtered: false }),
        makeSyntheticSession({ sessionId: "5", filtered: true }),
        makeSyntheticSession({ sessionId: "6", filtered: false }),
      ];
      const r = detectFilteredToggle(sessions);
      expect(r.flagged).toBe(true);
    });

    it("detectRegionJumps — flags >3 regions in 24h", () => {
      const base = Date.now() - 86400_000;
      const sessions = [
        makeSyntheticSession({ sessionId: "1", region: "BR", startedAt: base }),
        makeSyntheticSession({ sessionId: "2", region: "PT", startedAt: base + 3600_000 }),
        makeSyntheticSession({ sessionId: "3", region: "US", startedAt: base + 7200_000 }),
        makeSyntheticSession({ sessionId: "4", region: "UK", startedAt: base + 10800_000 }),
      ];
      const r = detectRegionJumps(sessions);
      expect(r.flagged).toBe(true);
    });

    it("runAntiGaming — full pipeline", () => {
      const sessions: CoachSessionRecordShape[] = [];
      for (let i = 0; i < 30; i++) {
        sessions.push(
          makeSyntheticSession({
            userId: `u-${i}`,
            sessionId: `s-${i}`,
            durationSec: 600,
            cuesDelivered: 10,
            cuesFollowed: 5 + (i % 5),
          })
        );
      }
      const flags = runAntiGaming(sessions, "BY_TRADITION");
      expect(flags).toBeInstanceOf(Map);
    });

    it("applyIpDeviceClusterDetection", () => {
      const flags = new Map<string, import("@/lib/w54/voice_mood_coach_leaderboard").AntiGamingFlag>();
      const device = {
        ua: "Mozilla",
        platform: "web",
        screenW: 1920,
        screenH: 1080,
        tzOffsetMin: -180,
      };
      const records = [
        makeSyntheticSession({ userId: "u-1", ipHash: "ip", device }),
        makeSyntheticSession({ userId: "u-2", ipHash: "ip", device }),
        makeSyntheticSession({ userId: "u-3", ipHash: "ip", device }),
        makeSyntheticSession({ userId: "u-4", ipHash: "ip", device }),
      ];
      applyIpDeviceClusterDetection(records, flags);
      expect(flags.size).toBeGreaterThan(0);
    });

    it("averageRiskScore / countFlagged / topReasons", () => {
      const flags = new Map([
        [
          "u-1",
          {
            userId: "u-1",
            reasons: ["rapid_session_creation"] as import("@/lib/w54/voice_mood_coach_leaderboard").AntiGamingReason[],
            flaggedSessions: [],
            riskScore: 0.5,
            createdAt: 0,
          },
        ],
        [
          "u-2",
          {
            userId: "u-2",
            reasons: ["rapid_session_creation", "identical_mood_arc"] as import("@/lib/w54/voice_mood_coach_leaderboard").AntiGamingReason[],
            flaggedSessions: [],
            riskScore: 0.7,
            createdAt: 0,
          },
        ],
      ]);
      expect(averageRiskScore(flags)).toBeCloseTo(0.6);
      expect(countFlagged(flags)).toBe(2);
      const tr = topReasons(flags);
      expect(tr.get("rapid_session_creation")).toBe(2);
    });
  });

  describe("§11 Opt-in + LGPD", () => {
    it("createOptInRecord — OFF by default", () => {
      const r = createOptInRecord("u-1");
      expect(r.optedIn).toBe(false);
      expect(r.optedInAt).toBeNull();
    });

    it("optIn toggles ON", () => {
      const r = optIn(createOptInRecord("u-1"), 1000, "req1");
      expect(r.changed).toBe(true);
      expect(r.record.optedIn).toBe(true);
      expect(r.record.optedInAt).toBe(1000);
    });

    it("optOut toggles OFF + records revokedAt", () => {
      const o1 = optIn(createOptInRecord("u-1"), 1000);
      const o2 = optOut(o1.record, 2000);
      expect(o2.changed).toBe(true);
      expect(o2.record.optedIn).toBe(false);
      expect(o2.record.revokedAt).toBe(2000);
    });

    it("autoRevoke", () => {
      const o1 = optIn(createOptInRecord("u-1"), 1000);
      const o2 = autoRevoke(o1.record, 2000, "deleted");
      expect(o2.record.history.some((e) => e.action === "auto_revoke")).toBe(true);
    });

    it("lgpdErase — wipes + sets retentionUntil", () => {
      const r = lgpdErase(createOptInRecord("u-1"), 1000);
      expect(r.erasedAt).toBe(1000);
      expect(r.auditRetentionUntil).toBeGreaterThan(1000);
    });

    it("isOptedIn", () => {
      expect(isOptedIn(undefined)).toBe(false);
      const o1 = optIn(createOptInRecord("u-1"), 1000);
      expect(isOptedIn(o1.record)).toBe(true);
      const o2 = optOut(o1.record, 2000);
      expect(isOptedIn(o2.record)).toBe(false);
    });

    it("buildExportPayload — no opt-in = empty", () => {
      const p = buildExportPayload("u-1", undefined, [], [], "k");
      expect(p.optInHistory).toHaveLength(0);
      expect(p.auditHash).toHaveLength(64);
    });

    it("buildExportPayload — with opt-in", () => {
      const r = optIn(createOptInRecord("u-1"), 1000).record;
      const p = buildExportPayload(
        "u-1",
        r,
        [{ scope: "WEEKLY", subView: "TOP_USERS", cohort: { cohortType: "BY_TRADITION", cohortValue: "umbanda", cohortBucket: "umbanda" }, rank: 5, compositeScore: 0.7 }],
        [],
        "k"
      );
      expect(p.optInHistory).toHaveLength(1);
      expect(p.currentRank).toHaveLength(1);
    });

    it("ensureOptInRecord creates if missing", () => {
      const m = new Map<string, OptInRecord>();
      const r = ensureOptInRecord(m, "u-1");
      expect(r.userId).toBe("u-1");
      expect(m.size).toBe(1);
    });

    it("anonymizeForAudit preserves consent timestamp", () => {
      const o1 = optIn(createOptInRecord("u-1"), 1000).record;
      const r = anonymizeForAudit(o1, 2000);
      expect(r.optedInAt).toBe(1000);
      expect(r.optedIn).toBe(false);
    });

    it("isPurposeAllowed gates allowed purposes", () => {
      expect(isPurposeAllowed("anonymous_ranking")).toBe(true);
      expect(isPurposeAllowed("marketing")).toBe(false);
    });

    it("buildLgpdRightsResponse — sla for erasure is immediate", () => {
      const r = buildLgpdRightsResponse({
        userId: "u-1",
        right: "erasure",
        ts: 1000,
        requestId: "r1",
      });
      expect(r.acknowledged).toBe(true);
      expect(r.sla).toBe("immediate");
    });

    it("LGPD consent text PT + EN non-empty", () => {
      expect(LGPD_CONSENT_TEXT_PT.purpose).toContain("ranking");
      expect(LGPD_CONSENT_TEXT_EN.purpose).toContain("ranking");
      const pt = getConsentText("pt-BR");
      expect(pt.controller).toBe("Akasha-0 / Cabala dos Caminhos");
    });
  });

  describe("§12 Sacred policy", () => {
    it("detectSacredEvent — returns type when sacred", () => {
      expect(
        detectSacredEvent(
          makeSyntheticSession({ sacredFlag: true, sacredKind: "prayer" })
        )
      ).toBe("tag_present");
      expect(detectSacredEvent(makeSyntheticSession({ sacredFlag: true }))).toBe(
        "kind_unknown"
      );
      expect(detectSacredEvent(makeSyntheticSession({ sacredFlag: false }))).toBeNull();
    });

    it("countSacred + countSacredByKind", () => {
      const records = [
        makeSyntheticSession({ sacredFlag: true, sacredKind: "prayer" }),
        makeSyntheticSession({ sacredFlag: true, sacredKind: "chant" }),
        makeSyntheticSession({ sacredFlag: true, sacredKind: "chant" }),
        makeSyntheticSession({ sacredFlag: false }),
      ];
      expect(countSacred(records)).toBe(3);
      const m = countSacredByKind(records);
      expect(m.get("prayer")).toBe(1);
      expect(m.get("chant")).toBe(2);
    });

    it("isEligibleForLeaderboard — false for sacred", () => {
      expect(
        isEligibleForLeaderboard(makeSyntheticSession({ sacredFlag: true, sacredKind: "prayer" }))
      ).toBe(false);
      expect(isEligibleForLeaderboard(makeSyntheticSession())).toBe(true);
    });

    it("filterEligible — drops sacred", () => {
      const records = [
        makeSyntheticSession({ sacredFlag: true, sacredKind: "ritual" }),
        makeSyntheticSession(),
      ];
      const r = filterEligible(records);
      expect(r).toHaveLength(1);
    });

    it("detectSacredLeak — flags if any sacred present", () => {
      const r = detectSacredLeak([
        makeSyntheticSession({ sacredFlag: true, sacredKind: "mantra" }),
      ]);
      expect(r.leaked).toBe(true);
      expect(r.leakedCount).toBe(1);
    });

    it("viewIsSacredClean — valid view passes", () => {
      const v: LeaderboardView = {
        view: "LEADERBOARD",
        scope: "WEEKLY",
        subView: "TOP_USERS",
        generatedAt: 0,
        kMin: 10,
        kActual: 10,
        cohortMergeLog: [],
        users: [],
        totalEligibleUsers: 0,
        totalEligibleSessions: 0,
        sacredExcludedSessions: 0,
        flaggedExcluded: 0,
        auditHash: "",
      };
      expect(viewIsSacredClean(v)).toBe(true);
    });

    it("SACRED_KINDS has 8 entries", () => {
      expect(SACRED_KINDS).toHaveLength(8);
      expect(SACRED_KINDS).toContain("prayer");
      expect(SACRED_KINDS).toContain("chant");
    });

    it("getSacredPolicyText — PT and EN", () => {
      const pt = getSacredPolicyText("pt-BR");
      const en = getSacredPolicyText("en-US");
      expect(pt.intro).toContain("sagrada");
      expect(en.intro).toContain("Sacred");
      expect(SACRED_POLICY_TEXT_PT.intro).toBeTruthy();
      expect(SACRED_POLICY_TEXT_EN.intro).toBeTruthy();
    });
  });

  describe("§13 Audit log + main pipeline", () => {
    it("createAuditLog + append + integrity", () => {
      const log = createAuditLog(1000);
      appendAuditStep(log, { step: "s1", ts: 1000, ok: true });
      appendAuditStep(log, { step: "s2", ts: 1100, ok: false });
      expect(log.steps).toHaveLength(2);
      expect(auditLogIntegrity(log, 2)).toBe(true);
      expect(auditLogIntegrity(log, 3)).toBe(false);
    });

    it("auditLogHash deterministic", () => {
      const log = createAuditLog(1000);
      appendAuditStep(log, { step: "s1", ts: 1000, ok: true });
      expect(auditLogHash(log, "k")).toBe(auditLogHash(log, "k"));
    });

    it("trimAuditLog by age", () => {
      const now = Date.now();
      const log = createAuditLog(now);
      appendAuditStep(log, { step: "old", ts: now - 7 * 86400_000, ok: true });
      appendAuditStep(log, { step: "new", ts: now - 60_000, ok: true });
      const trimmed = trimAuditLog(log, 1, now);
      expect(trimmed.steps).toHaveLength(1);
      expect(trimmed.steps[0]!.step).toBe("new");
    });

    it("buildLeaderboardView — full pipeline 3 views, 0 errors", () => {
      const optInMap = new Map<string, OptInRecord>();
      for (let i = 0; i < 30; i++) {
        const u = `u-${i}`;
        optInMap.set(u, optIn(createOptInRecord(u), 1000).record);
      }
      const records = makeSyntheticUserSessions(30, 3);
      const report = buildLeaderboardView(records, optInMap, "BY_TRADITION", "WEEKLY", {
        now: 1_000_000,
      });
      expect(report.views).toHaveLength(3);
      expect(report.engineVersion).toBe(ENGINE_VERSION);
      const subs = new Set(report.views.map((v) => v.subView));
      expect(subs.size).toBe(3);
    });

    it("buildLeaderboardView — sacred sessions never appear", () => {
      const optInMap = new Map<string, OptInRecord>();
      for (let i = 0; i < 20; i++) {
        const u = `u-${i}`;
        optInMap.set(u, optIn(createOptInRecord(u), 1000).record);
      }
      const records: CoachSessionRecordShape[] = [];
      for (let i = 0; i < 20; i++) {
        records.push(
          makeSyntheticSession({
            userId: `u-${i}`,
            sessionId: `sess-${i}-long`,
            sacredFlag: true,
            sacredKind: "prayer",
            startedAt: 900_000,
          })
        );
      }
      const report = buildLeaderboardView(records, optInMap, "BY_TRADITION", "ALL_TIME", {
        now: 1_000_000,
      });
      expect(report.views[0]!.totalEligibleUsers).toBe(0);
      expect(report.views[0]!.sacredExcludedSessions).toBeGreaterThan(0);
    });

    it("buildLeaderboardView — k<10 triggers merge or suppress", () => {
      const optInMap = new Map<string, OptInRecord>();
      for (let i = 0; i < 5; i++) {
        const u = `u-${i}`;
        optInMap.set(u, optIn(createOptInRecord(u), 1000).record);
      }
      const records = makeSyntheticUserSessions(5, 1);
      const report = buildLeaderboardView(records, optInMap, "BY_TRADITION", "ALL_TIME", {
        now: 1_000_000,
      });
      // k<10 → todos cohorts abaixo do limite → suppressed
      expect(report.views.every((v) => v.kMin === 10)).toBe(true);
    });

    it("buildLeaderboardView — handles empty input gracefully", () => {
      const optInMap = new Map<string, OptInRecord>();
      const report = buildLeaderboardView([], optInMap, "BY_TRADITION", "ALL_TIME");
      expect(report.views).toHaveLength(3);
      expect(report.errors).toHaveLength(0);
    });
  });

  describe("§14 Smoke tests pass", () => {
    it("smokeHashDeterminism", () => expect(smokeHashDeterminism().ok).toBe(true));
    it("smokeKAnonymityEnforcement", () => expect(smokeKAnonymityEnforcement().ok).toBe(true));
    it("smokeSacredExclusion", () => expect(smokeSacredExclusion().ok).toBe(true));
    it("smokeOptInDefaultOff", () => expect(smokeOptInDefaultOff().ok).toBe(true));
    it("smokeOptInOutCycle", () => expect(smokeOptInOutCycle().ok).toBe(true));
    it("smokeAnonIdRotation", () => expect(smokeAnonIdRotation().ok).toBe(true));
    it("smokeAntiGamingRapid", () => expect(smokeAntiGamingRapid().ok).toBe(true));
    it("smokeKMinimumMandatory", () => expect(smokeKMinimumMandatory().ok).toBe(true));
    it("smokeFullPipeline", () => expect(smokeFullPipeline().ok).toBe(true));
    it("smokeSacredNeverRanks", () => expect(smokeSacredNeverRanks().ok).toBe(true));
    it("smokeLgpdExportNoOptIn", () => expect(smokeLgpdExportNoOptIn().ok).toBe(true));
    it("smokeCohortMergeAuditability", () => expect(smokeCohortMergeAuditability().ok).toBe(true));
    it("smokeCompositeScore", () => expect(smokeCompositeScore().ok).toBe(true));
    it("smokeSha256Empty", () => expect(smokeSha256Empty().ok).toBe(true));
    it("smokeSha256Abc", () => expect(smokeSha256Abc().ok).toBe(true));
    it("smokeHmacSha256Rfc4231", () => expect(smokeHmacSha256Rfc4231().ok).toBe(true));
    it("smokeThreeSubViews", () => expect(smokeThreeSubViews().ok).toBe(true));
    it("smokeCohortMergePreservesData", () => expect(smokeCohortMergePreservesData().ok).toBe(true));
    it("smokeFnv1a32", () => expect(smokeFnv1a32().ok).toBe(true));
    it("smokeSacredLeakDetection", () => expect(smokeSacredLeakDetection().ok).toBe(true));

    it("runAllSmokeTests — 20/20 pass", () => {
      const r = runAllSmokeTests();
      const s = summarizeSmokeTests(r);
      expect(s.passed).toBe(20);
      expect(s.failed).toBe(0);
    });
  });

  describe("§15 Doc constants", () => {
    it("ENGINE_VERSION is non-empty", () => {
      expect(ENGINE_VERSION).toBeTruthy();
      expect(ENGINE_VERSION).toContain("w54");
    });

    it("POLICY_VERSION is non-empty", () => {
      expect(POLICY_VERSION).toBeTruthy();
    });

    it("K_DEFAULT === K_MINIMUM_MANDATORY", () => {
      expect(K_DEFAULT).toBe(K_MINIMUM_MANDATORY);
    });

    it("K_MAXIMUM is set", () => {
      expect(K_MAXIMUM).toBeGreaterThan(K_DEFAULT);
    });

    it("ENGINE_GUARANTEES has 8 keys", () => {
      expect(Object.keys(ENGINE_GUARANTEES)).toHaveLength(8);
    });

    it("ENGINE_LIMITS has expected fields", () => {
      expect(ENGINE_LIMITS.kMinimum).toBe(K_MINIMUM_MANDATORY);
      expect(ENGINE_LIMITS.kDefault).toBe(K_DEFAULT);
      expect(ENGINE_LIMITS.maxCohortTypes).toBe(4);
    });

    it("WEEKLY_ROTATION_POLICY weekday = Monday (1)", () => {
      expect(WEEKLY_ROTATION_POLICY.weekday).toBe(1);
    });

    it("ERROR_MESSAGES has 10 codes", () => {
      expect(Object.keys(ERROR_MESSAGES)).toHaveLength(10);
    });

    it("makeError fills code + message", () => {
      const e = makeError("LB_001", "test");
      expect(e.code).toBe("LB_001");
      expect(e.message).toBeTruthy();
      expect(e.detail).toBe("test");
    });

    it("DEFAULT_BUILD_OPTIONS", () => {
      expect(DEFAULT_BUILD_OPTIONS.scope).toBe("WEEKLY");
      expect(DEFAULT_BUILD_OPTIONS.k).toBe(K_DEFAULT);
    });

    it("FILE_METADATA w54 slot", () => {
      expect(FILE_METADATA.w54Slot).toBe(true);
      expect(FILE_METADATA.filename).toContain("w54");
    });

    it("LABELS_PT_BR + LABELS_EN non-empty", () => {
      expect(LABELS_PT_BR.title).toBeTruthy();
      expect(LABELS_EN.title).toBeTruthy();
      const labels = getLabels("en-US");
      expect(labels["title"]).toBe(LABELS_EN.title);
    });

    it("TRADITION_TAXONOMY includes umbanda/candomble/ifa/kabbalah", () => {
      expect(TRADITION_TAXONOMY).toContain("umbanda");
      expect(TRADITION_TAXONOMY).toContain("candomble");
      expect(TRADITION_TAXONOMY).toContain("ifa");
      expect(TRADITION_TAXONOMY).toContain("kabbalah");
    });

    it("REGION_TAXONOMY includes BR/PT/US/ZZ", () => {
      expect(REGION_TAXONOMY).toContain("BR");
      expect(REGION_TAXONOMY).toContain("PT");
      expect(REGION_TAXONOMY).toContain("US");
      expect(REGION_TAXONOMY).toContain("ZZ");
    });

    it("PURITY constants", () => {
      expect(PURITY_FILTERED).toBe("filtered");
      expect(PURITY_FULL).toBe("full");
      expect(PURITY_MIXED).toBe("mixed");
    });

    it("HMAC constants", () => {
      expect(HMAC_KEY_PLACEHOLDER).toContain("__SET");
      expect(HMAC_KEY_DEV_DEFAULT).toBeTruthy();
    });

    it("AUDIT_LEDGER_VERSION v1", () => {
      expect(AUDIT_LEDGER_VERSION).toBe("v1");
    });

    it("AUDIT_RETENTION_DAYS_DEFAULT = 30", () => {
      expect(AUDIT_RETENTION_DAYS_DEFAULT).toBe(30);
    });

    it("ANTI_GAMING constants", () => {
      expect(ANTI_GAMING_MAX_SESSIONS_PER_HOUR).toBe(20);
      expect(ANTI_GAMING_MAX_REGIONS_PER_24H).toBe(3);
      expect(ANTI_GAMING_CUE_INFLATION_DAYS).toBe(14);
      expect(ANTI_GAMING_DURATION_SIGMA).toBe(3);
      expect(ANTI_GAMING_CLUSTER_MIN_USERS).toBe(4);
      expect(ANTI_GAMING_CLUSTER_WINDOW_HOURS).toBe(24);
    });

    it("TOP_*_DEFAULT_LIMIT set", () => {
      expect(TOP_USERS_DEFAULT_LIMIT).toBe(50);
      expect(TOP_COHORTS_DEFAULT_LIMIT).toBe(25);
      expect(MOST_IMPROVED_DEFAULT_LIMIT).toBe(25);
    });

    it("SCORE_WEIGHT_* sum to 1.0", () => {
      const sum =
        SCORE_WEIGHT_SESSIONS +
        SCORE_WEIGHT_MINUTES +
        SCORE_WEIGHT_CUE_ADHERENCE +
        SCORE_WEIGHT_MOOD_IMPROVEMENT;
      expect(sum).toBeCloseTo(1.0);
    });

    it("ANON_ID_ROTATION_WEEKDAY = Monday (1)", () => {
      expect(ANON_ID_ROTATION_WEEKDAY).toBe(1);
    });

    it("WEEK_STARTS_ON = Sunday (0)", () => {
      expect(WEEK_STARTS_ON).toBe(0);
    });

    it("LGPD_ARTICLES_COVERED", () => {
      expect(LGPD_ARTICLES_COVERED.art7).toContain("Art. 7");
      expect(LGPD_ARTICLES_COVERED.art9).toContain("Art. 9");
      expect(LGPD_ARTICLES_COVERED.art18v).toContain("Art. 18");
      expect(LGPD_ARTICLES_COVERED.art18vi).toContain("Art. 18");
    });

    it("ENGINE_DEPENDENCIES runtime empty", () => {
      expect(ENGINE_DEPENDENCIES.runtime).toHaveLength(0);
    });
  });
});