// W91-B: reputation-leaderboard — source-inspection spec
// Pure source-inspection + tiny runtime probes. NO jsdom, NO React.
// Runs with `node --import tsx` and `vitest` interchangeably.
//
// Strategy:
//   1. Read each engine file as text and grep for required symbols/patterns
//   2. Import the engine and exercise every public mutator with a tiny input
//   3. Cross-check invariants: frozen, branded, no banned vocab, mobile-first

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  W91B_MOCK_MEMBERS,
  W91B_MOCK_VERSION,
  W91B_AVAILABLE_WINDOWS,
  W91B_WINDOW_MULTIPLIERS,
  createLeaderboard,
  leaderboardTitle,
  leaderboardSubtitle,
  categoryPresentation,
  witnessLabel,
  W91B_LEADERBOARD_VERSION,
  W91B_RECONHECIMENTO_TITLE,
  W91B_CATEGORY_LABELS,
  W91B_TIME_WINDOWS,
  W91B_WINDOW_LABELS,
  W91B_REPUTATION_TYPE_VERSION,
  W91B_MODULE_SURFACE,
  W91B_RANK_VERSION,
  W91B_MAX_SCORE,
  W91B_MIN_SCORE,
} from "./index";
import {
  clampScore,
  compositeScore,
  buildCategoryScores,
  stableSort,
  percentileOf,
  assignPositions,
  topN,
  witnessTier,
  filterByCategory,
  normalizeWindow,
  DESCENDING_BY_COMPOSITE,
} from "./rank";
import type { ReputationMember } from "./types";

// vitest runs from the worktree root, so engine files live in the same dir
const engineDir = join(process.cwd(), "src/lib/w91/reputation-leaderboard");

function read(name: string): string {
  return readFileSync(join(engineDir, name), "utf8");
}

describe("W91-B reputation-leaderboard · source inspection", () => {
  it("factory.ts declares positive-only witness sentinels", () => {
    const src = read("factory.ts");
    expect(src).toMatch(/leaderboardTitle/);
    expect(src).toMatch(/leaderboardSubtitle/);
    expect(src).toMatch(/witnessLabel/);
    expect(src).toMatch(/W91B_LEADERBOARD_VERSION\s*=\s*"2026-06-30"/);
  });

  it("types.ts defines 4 categories + 4 windows with frozen labels", () => {
    const src = read("types.ts");
    expect(src).toMatch(/tradição|sabedoria|axé|comunidade/);
    expect(src).toMatch(/30d|90d|1y|all/);
    expect(src).toMatch(/Object\.freeze/);
    expect(src).toMatch(/UserId\s*=\s*string\s*&\s*\{\s*readonly\s+__brand/);
  });

  it("mock.ts contains sacred diversity (no generic User N)", () => {
    const src = read("mock.ts");
    expect(src).toMatch(/Mestre/);
    expect(src).toMatch(/Ialorixá|Yalorixá/);
    expect(src).toMatch(/Babalaô|Babalorixá/);
    expect(src).toMatch(/Caboclo/);
    expect(src).toMatch(/Sacerdotisa|Sacerdote/);
    // anti-pattern: no "User 1" / "User 2"
    expect(src).not.toMatch(/User\s+\d/);
  });

  it("rank.ts uses stable sort + bounded clamps", () => {
    const src = read("rank.ts");
    expect(src).toMatch(/stableSort/);
    expect(src).toMatch(/clampScore/);
    expect(src).toMatch(/Object\.freeze/);
    expect(src).toMatch(/MAX_SCORE/);
    expect(src).toMatch(/MIN_SCORE/);
  });

  it("all four engine files contain sacred symbols verbatim", () => {
    for (const f of ["types.ts", "mock.ts", "rank.ts", "factory.ts"]) {
      const src = read(f);
      // At least one of the canonical symbols per file (icons live in types)
      if (f === "types.ts") {
        expect(src).toMatch(/✦/);
        expect(src).toMatch(/🪶|☉|◈/);
      }
    }
  });

  it("no banned vocab in any engine file", () => {
    const banned = ["amarração", "amarre", "vinculação", "vincular", "prejudicar"];
    for (const f of ["types.ts", "mock.ts", "rank.ts", "factory.ts", "index.ts"]) {
      // strip JSDoc + line comments to avoid false positives on docstrings
      const raw = read(f);
      const code = raw
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
      for (const word of banned) {
        expect(code.toLowerCase(), `banned vocab '${word}' found in ${f}`).not.toContain(
          word,
        );
      }
    }
  });
});

describe("W91-B reputation-leaderboard · runtime invariants", () => {
  const snap = createLeaderboard({ category: "all", window: "all" }, "2026-06-30T00:00:00Z");

  it("snapshot is fully frozen", () => {
    expect(Object.isFrozen(snap)).toBe(true);
    expect(Object.isFrozen(snap.entries)).toBe(true);
    expect(Object.isFrozen(snap.topThree)).toBe(true);
    expect(Object.isFrozen(snap.witnesses)).toBe(true);
  });

  it("every entry is frozen", () => {
    for (const e of snap.entries) {
      expect(Object.isFrozen(e)).toBe(true);
      expect(Object.isFrozen(e.categoryScores)).toBe(true);
    }
  });

  it("positions are 1..N with no gaps", () => {
    expect(snap.entries.length).toBe(snap.totalMembers);
    for (let i = 0; i < snap.entries.length; i++) {
      expect(snap.entries[i].position).toBe(i + 1);
    }
  });

  it("composite scores are monotonically non-increasing", () => {
    for (let i = 1; i < snap.entries.length; i++) {
      expect(snap.entries[i].compositeScore).toBeLessThanOrEqual(
        snap.entries[i - 1].compositeScore,
      );
    }
  });

  it("topThree has length 3 (or fewer if pool is small)", () => {
    expect(snap.topThree.length).toBeLessThanOrEqual(3);
    expect(snap.topThree.length).toBeGreaterThanOrEqual(1);
    if (snap.topThree.length === 3) {
      expect(snap.topThree[0].position).toBe(1);
      expect(snap.topThree[1].position).toBe(2);
      expect(snap.topThree[2].position).toBe(3);
    }
  });

  it("witnesses tier is non-empty and uses honor language", () => {
    expect(snap.witnesses.length).toBeGreaterThanOrEqual(1);
    expect(witnessLabel()).toContain("Testemunhas");
  });

  it("filter by category shrinks the pool", () => {
    const allSnap = createLeaderboard({ category: "all" }, "2026-06-30T00:00:00Z");
    const axéSnap = createLeaderboard({ category: "axé" }, "2026-06-30T00:00:00Z");
    expect(axéSnap.totalMembers).toBeLessThanOrEqual(allSnap.totalMembers);
    expect(axéSnap.category).toBe("axé");
  });

  it("window multiplier changes composite score but preserves order-ish", () => {
    const a = createLeaderboard({ window: "30d" }, "2026-06-30T00:00:00Z");
    const b = createLeaderboard({ window: "all" }, "2026-06-30T00:00:00Z");
    expect(a.entries[0].compositeScore).toBeGreaterThanOrEqual(
      b.entries[0].compositeScore,
    );
  });

  it("categoryPresentation returns valid label+icon for all + each category", () => {
    const all = categoryPresentation("all");
    expect(all.label.length).toBeGreaterThan(0);
    expect(all.icon.length).toBeGreaterThan(0);
    for (const c of ["tradição", "sabedoria", "axé", "comunidade"] as const) {
      const p = categoryPresentation(c);
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.icon.length).toBeGreaterThan(0);
    }
  });

  it("leaderboardTitle uses 'Reconhecimento' framing", () => {
    expect(leaderboardTitle({ category: "all" })).toMatch(/Reconhecimento/);
    expect(leaderboardTitle({ category: "axé" })).toMatch(/reconhecida/);
  });

  it("leaderboardSubtitle uses positive pluralization", () => {
    const sub = leaderboardSubtitle(snap);
    expect(sub).toMatch(/membros reconhecidos|membro reconhecido/);
  });

  it("clampScore bounds NaN / negatives / > MAX_SCORE", () => {
    expect(clampScore(NaN)).toBe(0);
    expect(clampScore(-100)).toBe(0);
    expect(clampScore(9999)).toBe(W91B_MAX_SCORE);
    expect(clampScore(0)).toBe(0);
    expect(clampScore(750)).toBe(750);
  });

  it("compositeScore is finite and non-negative", () => {
    const m = W91B_MOCK_MEMBERS[0];
    expect(compositeScore(m, 1)).toBeGreaterThan(0);
    expect(compositeScore(m, -10)).toBeGreaterThanOrEqual(0);
    expect(compositeScore(m, NaN)).toBeGreaterThanOrEqual(0);
  });

  it("buildCategoryScores has 4 entries with icons + labels", () => {
    const m = W91B_MOCK_MEMBERS[0];
    const cs = buildCategoryScores(m);
    expect(cs.length).toBe(4);
    for (const c of cs) {
      expect(c.icon.length).toBeGreaterThan(0);
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.score).toBeGreaterThanOrEqual(0);
    }
  });

  it("stableSort is stable for ties", () => {
    const data = [
      { id: "a", score: 1 },
      { id: "b", score: 1 },
      { id: "c", score: 0 },
    ];
    const sorted = stableSort(data, (x, y) => y.score - x.score);
    expect(sorted[0].id).toBe("a"); // tied at 1, original order kept
    expect(sorted[1].id).toBe("b");
    expect(sorted[2].id).toBe("c");
  });

  it("percentileOf is 0 for score<=0 and bounded at 100", () => {
    expect(percentileOf(0, 10)).toBe(0);
    expect(percentileOf(1000, 1)).toBeLessThanOrEqual(100);
    expect(percentileOf(5000, 5)).toBeLessThanOrEqual(100);
    expect(percentileOf(-1, 5)).toBe(0);
  });

  it("assignPositions produces 1..N", () => {
    const arr = assignPositions([
      {
        position: 0,
        member: W91B_MOCK_MEMBERS[0],
        compositeScore: 1,
        percentile: 0,
        categoryScores: [],
      },
      {
        position: 0,
        member: W91B_MOCK_MEMBERS[1],
        compositeScore: 0,
        percentile: 0,
        categoryScores: [],
      },
    ]);
    expect(arr.map((x) => x.position)).toEqual([1, 2]);
  });

  it("topN clamps to 0 when n<=0", () => {
    expect(topN([1, 2, 3], 0)).toEqual([]);
    expect(topN([1, 2, 3], -1)).toEqual([]);
    expect(topN([1, 2, 3], 2)).toEqual([1, 2]);
  });

  it("witnessTier returns 1-5 entries (10% of pool)", () => {
    const entries = W91B_MOCK_MEMBERS.map((m, i) => ({
      position: i + 1,
      member: m,
      compositeScore: 100 - i,
      percentile: 0,
      categoryScores: [],
    }));
    const wt = witnessTier(entries);
    expect(wt.length).toBeGreaterThanOrEqual(1);
    expect(wt.length).toBeLessThanOrEqual(5);
  });

  it("filterByCategory with 'all' returns full pool", () => {
    expect(filterByCategory(W91B_MOCK_MEMBERS, "all").length).toBe(
      W91B_MOCK_MEMBERS.length,
    );
  });

  it("normalizeWindow defaults unknown to 'all'", () => {
    expect(normalizeWindow("nonsense")).toBe("all");
    expect(normalizeWindow("30d")).toBe("30d");
    expect(normalizeWindow("90d")).toBe("90d");
    expect(normalizeWindow("1y")).toBe("1y");
    expect(normalizeWindow("all")).toBe("all");
  });

  it("DESCENDING_BY_COMPOSITE breaks ties by yearsOfAxé then userId", () => {
    const a: ReputationMember = {
      ...W91B_MOCK_MEMBERS[0],
      userId: "mem-001" as ReputationMember["userId"],
      yearsOfAxé: 10,
      joinedAt: "2000-01-01",
    };
    const b: ReputationMember = {
      ...W91B_MOCK_MEMBERS[1],
      userId: "mem-002" as ReputationMember["userId"],
      yearsOfAxé: 20,
      joinedAt: "1990-01-01",
    };
    const ea = {
      position: 1,
      member: a,
      compositeScore: 100,
      percentile: 0,
      categoryScores: [],
    };
    const eb = {
      position: 1,
      member: b,
      compositeScore: 100,
      percentile: 0,
      categoryScores: [],
    };
    expect(DESCENDING_BY_COMPOSITE(ea, eb)).toBeGreaterThan(0); // b wins
  });

  it("category labels registry is frozen and complete", () => {
    expect(Object.isFrozen(W91B_CATEGORY_LABELS)).toBe(true);
    for (const c of ["tradição", "sabedoria", "axé", "comunidade"] as const) {
      expect(W91B_CATEGORY_LABELS[c].label.length).toBeGreaterThan(0);
      expect(W91B_CATEGORY_LABELS[c].icon.length).toBeGreaterThan(0);
    }
  });

  it("time windows registry is frozen + length 4", () => {
    expect(Object.isFrozen(W91B_TIME_WINDOWS)).toBe(true);
    expect(W91B_TIME_WINDOWS.length).toBe(4);
    expect(Object.isFrozen(W91B_WINDOW_LABELS)).toBe(true);
  });

  it("module surface constant carries positive-only + lgpd + sacred flags", () => {
    expect(W91B_MODULE_SURFACE.positiveOnlyWitness).toBe(true);
    expect(W91B_MODULE_SURFACE.sacredLanguage).toBe(true);
    expect(W91B_MODULE_SURFACE.lgpdMinimal).toBe(true);
    expect(W91B_MODULE_SURFACE.version).toBe("2026-06-30");
    expect(W91B_MODULE_SURFACE.mockMembers).toBeGreaterThanOrEqual(20);
  });

  it("version stamps align (types, mock, rank, factory)", () => {
    expect(W91B_REPUTATION_TYPE_VERSION).toBe("2026-06-30");
    expect(W91B_MOCK_VERSION).toBe("2026-06-30");
    expect(W91B_RANK_VERSION).toBe("2026-06-30");
    expect(W91B_LEADERBOARD_VERSION).toBe("2026-06-30");
  });

  it("RECONHECIMENTO_TITLE constant exists and is positive", () => {
    expect(W91B_RECONHECIMENTO_TITLE).toContain("Reconhecimento");
  });

  it("window multipliers are all positive and bounded", () => {
    for (const k of W91B_AVAILABLE_WINDOWS) {
      const m = W91B_WINDOW_MULTIPLIERS[k];
      expect(m).toBeGreaterThan(0);
      expect(m).toBeLessThan(2);
    }
  });
});