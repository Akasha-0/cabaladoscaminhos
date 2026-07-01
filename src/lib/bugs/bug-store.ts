/**
 * bugs/bug-store — Wave 36 bug tracking store (JSON-file-backed)
 * ============================================================================
 * Bug entities for the hotfix loop. Persisted as JSONL under
 * `data/bugs/bugs.jsonl` so the wave doesn't need a Prisma migration. The
 * schema is intentionally a superset of FeedbackSubmission's BUG type — when
 * Wave 37+ adds a Bug model to schema.prisma, the store migrates to Prisma
 * by re-reading the file once at startup.
 *
 * Status / severity mapping (matches Sentry/PagerDuty conventions):
 *
 *   status:    NEW → INVESTIGATING → IN_PROGRESS → FIXED → CLOSED
 *   severity:  P0 (page on-call) | P1 (this wave) | P2 (next wave) | P3 (backlog)
 *
 * LGPD: user references are admin user ids only (never email). Affected-user
 * counts use the same hashed approach as audit-sentry-errors.ts.
 * ============================================================================
 */

import { appendFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fnv1a32 } from "../patches/hash";

export type BugStatus = "NEW" | "INVESTIGATING" | "IN_PROGRESS" | "FIXED" | "CLOSED";
export type BugSeverity = "P0" | "P1" | "P2" | "P3";
export type BugReproducibility = "ALWAYS" | "INTERMITTENT" | "ONCE" | "UNKNOWN";

export interface BugEntry {
  id: string;
  title: string;
  description: string;
  status: BugStatus;
  severity: BugSeverity;
  /** Affected user count (hashed list maintained separately). */
  affectedUserCount: number;
  /** Distinct user hashes affected (FNV-1a; LGPD-safe). */
  affectedUsers: string[];
  /** Affected screens (URL paths or feature names). */
  affectedScreens: string[];
  /** Reproducibility. */
  reproducibility: BugReproducibility;
  /** Linked Sentry fingerprint (or null). */
  sentryFingerprint: string | null;
  /** Linked patch id (from patch-registry). */
  patchId: string | null;
  /** Wave that introduced the bug (e.g. "W35"). */
  introducedIn: string | null;
  /** Wave that fixed the bug. */
  fixedIn: string | null;
  /** Version string at fix time. */
  fixVersion: string | null;
  /** First reported by (admin user id, or null if anonymous). */
  reportedBy: string | null;
  /** Assigned to (admin user id). */
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

const BUG_DIR = process.env.BUG_STORE_DIR ?? join(process.cwd(), "data", "bugs");
const BUG_FILE = join(BUG_DIR, "bugs.jsonl");

function ensureDir(): void {
  if (!existsSync(BUG_DIR)) mkdirSync(BUG_DIR, { recursive: true });
}

function readAll(): BugEntry[] {
  if (!existsSync(BUG_FILE)) return [];
  const lines = readFileSync(BUG_FILE, "utf8").split("\n").filter(Boolean);
  const out: BugEntry[] = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line) as BugEntry);
    } catch {
      // skip malformed
    }
  }
  return out;
}

function append(bug: BugEntry): void {
  ensureDir();
  appendFileSync(BUG_FILE, JSON.stringify(bug) + "\n");
}

function genId(): string {
  return `bug-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function hashUserId(id: string): string {
  return fnv1a32(id);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CreateBugInput {
  title: string;
  description: string;
  severity: BugSeverity;
  sentryFingerprint?: string;
  introducedIn?: string;
  affectedScreens?: string[];
  reproducibility?: BugReproducibility;
  reportedBy?: string;
}

export function createBug(input: CreateBugInput): BugEntry {
  const now = new Date().toISOString();
  const bug: BugEntry = {
    id: genId(),
    title: input.title,
    description: input.description,
    status: "NEW",
    severity: input.severity,
    affectedUserCount: 0,
    affectedUsers: [],
    affectedScreens: input.affectedScreens ?? [],
    reproducibility: input.reproducibility ?? "UNKNOWN",
    sentryFingerprint: input.sentryFingerprint ?? null,
    patchId: null,
    introducedIn: input.introducedIn ?? null,
    fixedIn: null,
    fixVersion: null,
    reportedBy: input.reportedBy ?? null,
    assignedTo: null,
    createdAt: now,
    updatedAt: now,
    closedAt: null,
  };
  append(bug);
  return bug;
}

export function listBugs(filter?: {
  status?: BugStatus;
  severity?: BugSeverity;
  assignedTo?: string;
}): BugEntry[] {
  let out = readAll();
  if (filter?.status) out = out.filter((b) => b.status === filter.status);
  if (filter?.severity) out = out.filter((b) => b.severity === filter.severity);
  if (filter?.assignedTo) out = out.filter((b) => b.assignedTo === filter.assignedTo);
  return out.sort((a, b) => {
    // P0 first, then by createdAt desc.
    const sevOrder = { P0: 0, P1: 1, P2: 2, P3: 3 } as const;
    const sa = sevOrder[a.severity];
    const sb = sevOrder[b.severity];
    if (sa !== sb) return sa - sb;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function getBug(id: string): BugEntry | null {
  return readAll().find((b) => b.id === id) ?? null;
}

export function updateBug(
  id: string,
  patch: Partial<Pick<BugEntry, "status" | "severity" | "assignedTo" | "fixedIn" | "fixVersion" | "patchId" | "reproducibility">>,
): BugEntry | null {
  const all = readAll();
  const idx = all.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  const cur = all[idx]!;
  const next: BugEntry = {
    ...cur,
    ...patch,
    updatedAt: new Date().toISOString(),
    closedAt: patch.status === "CLOSED" ? new Date().toISOString() : cur.closedAt,
  };
  all[idx] = next;
  // Rewrite whole file (small N expected — bugs are rare).
  ensureDir();
  // Atomic-ish via temp file.
  const tmp = `${BUG_FILE}.tmp`;
  const fs = require("node:fs") as typeof import("node:fs");
  fs.writeFileSync(tmp, all.map((b) => JSON.stringify(b)).join("\n") + "\n");
  fs.renameSync(tmp, BUG_FILE);
  return next;
}

export function recordAffectedUser(bugId: string, userId: string): BugEntry | null {
  const all = readAll();
  const idx = all.findIndex((b) => b.id === bugId);
  if (idx < 0) return null;
  const cur = all[idx]!;
  const hash = hashUserId(userId);
  if (cur.affectedUsers.includes(hash)) return cur;
  const next: BugEntry = {
    ...cur,
    affectedUsers: [...cur.affectedUsers, hash],
    affectedUserCount: cur.affectedUsers.length + 1,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = next;
  const fs = require("node:fs") as typeof import("node:fs");
  const tmp = `${BUG_FILE}.tmp`;
  fs.writeFileSync(tmp, all.map((b) => JSON.stringify(b)).join("\n") + "\n");
  fs.renameSync(tmp, BUG_FILE);
  return next;
}

export interface BugSummary {
  total: number;
  byStatus: Record<BugStatus, number>;
  bySeverity: Record<BugSeverity, number>;
  openCount: number;
  fixedLast7d: number;
  medianTimeToFixHours: number | null;
}

export function bugSummary(): BugSummary {
  const all = readAll();
  const byStatus: Record<BugStatus, number> = {
    NEW: 0, INVESTIGATING: 0, IN_PROGRESS: 0, FIXED: 0, CLOSED: 0,
  };
  const bySeverity: Record<BugSeverity, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  let openCount = 0;
  let fixedLast7d = 0;
  const fixTimes: number[] = [];
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const b of all) {
    byStatus[b.status] += 1;
    bySeverity[b.severity] += 1;
    if (b.status !== "CLOSED" && b.status !== "FIXED") openCount += 1;
    if ((b.status === "FIXED" || b.status === "CLOSED") && b.closedAt) {
      if (new Date(b.closedAt).getTime() >= sevenDaysAgo) fixedLast7d += 1;
      fixTimes.push(new Date(b.closedAt).getTime() - new Date(b.createdAt).getTime());
    }
  }

  let medianTimeToFixHours: number | null = null;
  if (fixTimes.length > 0) {
    fixTimes.sort((a, b) => a - b);
    const mid = Math.floor(fixTimes.length / 2);
    medianTimeToFixHours = Math.round((fixTimes[mid]! / (60 * 60 * 1000)) * 10) / 10;
  }

  return {
    total: all.length,
    byStatus,
    bySeverity,
    openCount,
    fixedLast7d,
    medianTimeToFixHours,
  };
}