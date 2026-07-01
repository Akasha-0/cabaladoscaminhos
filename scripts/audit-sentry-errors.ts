#!/usr/bin/env tsx
/**
 * audit-sentry-errors — Wave 36 Sentry error audit script
 * ============================================================================
 * Aggregates errors from local Sentry-style log files (or Sentry HTTP API if
 * SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT are set), then produces a
 * prioritized actionable report:
 *
 *   - Top 20 unique errors (fingerprint → count, last_seen, severity)
 *   - Top 20 affected users (id only — LGPD)
 *   - Top 20 affected routes (path → count)
 *   - Top 10 "common" errors auto-classified (auth, validation, rate-limit, db)
 *   - Actionable fix checklist with severities
 *
 * Usage:
 *   tsx scripts/audit-sentry-errors.ts                       # local logs
 *   tsx scripts/audit-sentry-errors.ts --since=24h           # window
 *   tsx scripts/audit-sentry-errors.ts --json                # JSON output
 *   tsx scripts/audit-sentry-errors.ts --remote              # Sentry API
 *
 * Output:
 *   - stdout: human report (default) OR JSON
 *   - exit 0: ok; exit 1: scan error
 *
 * LGPD: identifiers are hashed (FNV-1a) for user counts — never expose
 * raw user IDs. Only the admin who runs the script can correlate.
 * ============================================================================
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { argv, exit, env } from "node:process";

// ---------------------------------------------------------------------------
// FNV-1a (32-bit) — LGPD-safe hash for user IDs in reports.
// (See memory: cross-runtime crypto patterns — pure-JS FNV-1a.)
// ---------------------------------------------------------------------------

function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuditError {
  fingerprint: string;
  type: string;
  message: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  severity: "fatal" | "error" | "warning" | "info";
  tags: Record<string, string>;
  route: string | null;
  userHash: string | null;
  errorCode: string | null;
}

interface AuditReport {
  generatedAt: string;
  windowMs: number;
  totalEvents: number;
  uniqueErrors: number;
  topErrors: AuditError[];
  topRoutes: Array<{ route: string; count: number }>;
  topUsers: Array<{ userHash: string; count: number; distinctErrors: number }>;
  topCommon: Array<{ category: string; count: number; sample: string; severity: string; fixHint: string }>;
  actionableChecklist: Array<{ priority: "P0" | "P1" | "P2" | "P3"; fingerprint: string; message: string; suggestedAction: string }>;
}

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

function parseFlags(): { since: number; json: boolean; remote: boolean; logDir: string } {
  let since = 24 * 60 * 60 * 1000; // 24h default
  let json = false;
  let remote = false;
  const logDir = env.SENTRY_LOG_DIR || join(process.cwd(), "logs", "sentry");

  for (const arg of argv.slice(2)) {
    if (arg === "--json") json = true;
    else if (arg === "--remote") remote = true;
    else if (arg.startsWith("--since=")) {
      const raw = arg.slice("--since=".length);
      const match = raw.match(/^(\d+)(h|d)$/);
      if (match) {
        const n = parseInt(match[1]!, 10);
        const mult = match[2] === "d" ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
        since = n * mult;
      }
    }
  }

  return { since, json, remote, logDir };
}

// ---------------------------------------------------------------------------
// Fingerprint computation (stable across same message+type+route).
// ---------------------------------------------------------------------------

function fingerprint(type: string, message: string, route: string | null, errorCode: string | null): string {
  // Strip variable segments: numbers, UUIDs, hex hashes, dates.
  const norm = message
    .replace(/[0-9a-f]{8,}/gi, "<HEX>")
    .replace(/\b[0-9a-z]{20,}\b/gi, "<ID>")
    .replace(/\b\d+\b/g, "<N>")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  return fnv1a32(`${type}|${route ?? "-"}|${errorCode ?? "-"}|${norm}`);
}

// ---------------------------------------------------------------------------
// Classification — auto-bucket known Wave 32-33 patterns.
// ---------------------------------------------------------------------------

const COMMON_PATTERNS: Array<{
  category: string;
  match: (msg: string, code: string | null) => boolean;
  fixHint: string;
  severity: "fatal" | "error" | "warning";
}> = [
  {
    category: "auth_failure",
    match: (m, c) =>
      /invalid.{0,10}(credential|password|token)/i.test(m) ||
      c === "1001" || c === "1002" || c === "1003" || c === "1005",
    fixHint: "Audit auth.ts session refresh flow; ensure 401 returns trigger client re-auth.",
    severity: "warning",
  },
  {
    category: "validation_error",
    match: (m, c) =>
      /validation|invalid.{0,10}format|missing.{0,10}field|out of range/i.test(m) ||
      c === "2001" || c === "2002" || c === "2003" || c === "2004",
    fixHint: "Inspect input schema (zod). Add per-field error UI surfacing.",
    severity: "warning",
  },
  {
    category: "rate_limit",
    match: (m, c) =>
      /rate.{0,5}limit|too many/i.test(m) || c === "4001",
    fixHint: "Verify RATE_LIMIT_PRESETS in src/lib/security/rate-limit-v2.ts.",
    severity: "warning",
  },
  {
    category: "db_timeout",
    match: (m) =>
      /connection.{0,10}(timeout|refused|reset)|prisma.*timeout|ECONNRESET|ETIMEDOUT/i.test(m),
    fixHint: "Check Supabase pooler saturation; verify connection_limit + pgbouncer.",
    severity: "error",
  },
  {
    category: "payment_failed",
    match: (m, c) => /payment|stripe/i.test(m) || c === "7001" || c === "7002",
    fixHint: "Inspect /api/payments/webhook idempotency + signature verify.",
    severity: "error",
  },
  {
    category: "csrf_or_origin",
    match: (m) => /csrf|origin.{0,10}(mismatch|denied)|forbidden/i.test(m),
    fixHint: "Verify middleware.ts CORS allowlist + origin header check.",
    severity: "error",
  },
  {
    category: "rate_limit_429",
    match: (m) => m.includes("429"),
    fixHint: "Bump rate-limit-v2 preset OR investigate abuse signal.",
    severity: "warning",
  },
  {
    category: "lgpd_consent",
    match: (m) => /lgpd|consent/i.test(m),
    fixHint: "Verify ConsentGate and audit_log consent capture.",
    severity: "warning",
  },
  {
    category: "ai_quota",
    match: (m, c) => /insufficient.{0,10}credit|quota/i.test(m) || c === "6001" || c === "6002",
    fixHint: "Check credits service; show user-facing quota banner.",
    severity: "warning",
  },
  {
    category: "duplicate_resource",
    match: (m, c) => /already.{0,10}exists|duplicate/i.test(m) || c === "3002",
    fixHint: "Idempotency-key on POST routes; surface 409 with retry hint.",
    severity: "info",
  },
];

function classifyCommon(message: string, code: string | null) {
  for (const pat of COMMON_PATTERNS) {
    if (pat.match(message, code)) {
      return { category: pat.category, fixHint: pat.fixHint, severity: pat.severity };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Severity → priority (P0 = page on-call, P3 = backlog)
// ---------------------------------------------------------------------------

function priorityFor(severity: AuditError["severity"], count: number): "P0" | "P1" | "P2" | "P3" {
  if (severity === "fatal") return "P0";
  if (severity === "error" && count > 50) return "P0";
  if (severity === "error") return "P1";
  if (severity === "warning" && count > 200) return "P1";
  if (severity === "warning") return "P2";
  return "P3";
}

// ---------------------------------------------------------------------------
// Local log reader
// ---------------------------------------------------------------------------

interface RawEvent {
  timestamp: number;
  level: string;
  type: string;
  message: string;
  tags?: Record<string, string>;
  user?: { id?: string };
  errorCode?: string | number;
}

function readLocalEvents(logDir: string, since: number): RawEvent[] {
  if (!existsSync(logDir)) {
    return [];
  }
  const files = readdirSync(logDir).filter((f) => f.endsWith(".jsonl") || f.endsWith(".log"));
  const cutoff = Date.now() - since;
  const events: RawEvent[] = [];
  for (const file of files) {
    const full = join(logDir, file);
    if (!statSync(full).isFile()) continue;
    const content = readFileSync(full, "utf8");
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line) as RawEvent;
        if (obj.timestamp && obj.timestamp >= cutoff) {
          events.push(obj);
        }
      } catch {
        // skip malformed lines
      }
    }
  }
  return events;
}

// ---------------------------------------------------------------------------
// Remote Sentry reader (HTTP API)
// ---------------------------------------------------------------------------

async function readRemoteEvents(since: number): Promise<RawEvent[]> {
  const token = env.SENTRY_AUTH_TOKEN;
  const org = env.SENTRY_ORG;
  const project = env.SENTRY_PROJECT;
  const host = env.SENTRY_HOST || "https://sentry.io";

  if (!token || !org || !project) {
    throw new Error("Missing SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT env vars");
  }

  const url = `${host}/api/0/projects/${org}/${project}/events/?statsPeriod=${Math.round(since / 1000)}s`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Sentry API ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const json = (await res.json()) as Array<Record<string, unknown>>;
  return json.map((e) => {
    const tsRaw = e.timestamp as string | number | undefined;
    const ts = typeof tsRaw === "number" ? tsRaw : tsRaw ? new Date(tsRaw).getTime() / 1000 : 0;
    const tags = (e.tags as Array<[string, string]> | undefined) ?? [];
    const tagMap: Record<string, string> = {};
    for (const [k, v] of tags) tagMap[k] = v;
    const user = (e.user as { id?: string } | undefined) ?? undefined;
    const exceptionValues = (e.exception as { values?: Array<{ type?: string; value?: string }> } | undefined)?.values ?? [];
    const first = exceptionValues[0];
    return {
      timestamp: ts,
      level: (e.level as string) || "error",
      type: first?.type || "Error",
      message: first?.value || (e.message as string) || "unknown",
      tags: tagMap,
      user,
    };
  });
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

function aggregate(events: RawEvent[]): AuditReport {
  const byFp = new Map<string, AuditError>();
  const routeCounts = new Map<string, number>();
  const userCounts = new Map<string, { count: number; errors: Set<string> }>();
  const commonCounts = new Map<string, { category: string; sample: string; severity: string; fixHint: string; count: number }>();

  let cutoff = 0;

  for (const ev of events) {
    const ts = ev.timestamp > 1e12 ? ev.timestamp : ev.timestamp * 1000; // seconds → ms
    if (!cutoff || ts < cutoff) cutoff = ts;
    const route = ev.tags?.route ?? ev.tags?.url ?? null;
    const userId = ev.user?.id ?? null;
    const code = ev.errorCode != null ? String(ev.errorCode) : null;
    const fp = fingerprint(ev.type, ev.message, route, code);

    let cur = byFp.get(fp);
    if (!cur) {
      cur = {
        fingerprint: fp,
        type: ev.type,
        message: ev.message,
        count: 0,
        firstSeen: ts,
        lastSeen: ts,
        severity: (ev.level as AuditError["severity"]) ?? "error",
        tags: ev.tags ?? {},
        route,
        userHash: userId ? fnv1a32(userId) : null,
        errorCode: code,
      };
      byFp.set(fp, cur);
    }
    cur.count += 1;
    if (ts < cur.firstSeen) cur.firstSeen = ts;
    if (ts > cur.lastSeen) cur.lastSeen = ts;

    if (route) routeCounts.set(route, (routeCounts.get(route) ?? 0) + 1);

    if (userId) {
      const hash = fnv1a32(userId);
      let ucur = userCounts.get(hash);
      if (!ucur) {
        ucur = { count: 0, errors: new Set() };
        userCounts.set(hash, ucur);
      }
      ucur.count += 1;
      ucur.errors.add(fp);
    }

    const cls = classifyCommon(ev.message, code);
    if (cls) {
      const key = cls.category;
      let cc = commonCounts.get(key);
      if (!cc) {
        cc = { category: key, sample: ev.message, severity: cls.severity, fixHint: cls.fixHint, count: 0 };
        commonCounts.set(key, cc);
      }
      cc.count += 1;
    }
  }

  const allErrors = Array.from(byFp.values()).sort((a, b) => b.count - a.count);
  const topErrors = allErrors.slice(0, 20);

  const topRoutes = Array.from(routeCounts.entries())
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const topUsers = Array.from(userCounts.entries())
    .map(([userHash, { count, errors }]) => ({ userHash, count, distinctErrors: errors.size }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const topCommon = Array.from(commonCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const actionableChecklist = topErrors
    .map((e) => ({
      priority: priorityFor(e.severity, e.count),
      fingerprint: e.fingerprint,
      message: e.message.slice(0, 120),
      suggestedAction:
        classifyCommon(e.message, e.errorCode)?.fixHint ??
        "Investigate stack trace + add Sentry breadcrumb.",
    }));

  return {
    generatedAt: new Date().toISOString(),
    windowMs: sinceForReport(events),
    totalEvents: events.length,
    uniqueErrors: byFp.size,
    topErrors,
    topRoutes,
    topUsers,
    topCommon,
    actionableChecklist,
  };
}

function sinceForReport(events: RawEvent[]): number {
  if (events.length === 0) return 0;
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  return sorted[sorted.length - 1]!.timestamp - sorted[0]!.timestamp;
}

// ---------------------------------------------------------------------------
// Render — human
// ---------------------------------------------------------------------------

function renderHuman(report: AuditReport): string {
  const lines: string[] = [];
  const sep = "=".repeat(72);

  lines.push(sep);
  lines.push("Sentry Error Audit Report");
  lines.push(sep);
  lines.push(`Generated:  ${report.generatedAt}`);
  lines.push(`Window:     ${(report.windowMs / 1000).toFixed(0)}s`);
  lines.push(`Events:     ${report.totalEvents}`);
  lines.push(`Unique:     ${report.uniqueErrors}`);
  lines.push("");

  lines.push("-".repeat(72));
  lines.push("Top 20 unique errors");
  lines.push("-".repeat(72));
  for (const [i, e] of report.topErrors.entries()) {
    lines.push(
      `${String(i + 1).padStart(2, " ")}. [${e.severity.toUpperCase()}] (${e.count}x) ${e.type}: ${e.message.slice(0, 80)}`,
    );
    lines.push(`     fp=${e.fingerprint}  route=${e.route ?? "-"}  code=${e.errorCode ?? "-"}`);
    lines.push(`     last=${new Date(e.lastSeen).toISOString()}`);
  }
  lines.push("");

  lines.push("-".repeat(72));
  lines.push("Top 20 affected routes");
  lines.push("-".repeat(72));
  for (const r of report.topRoutes) {
    lines.push(`  ${r.count.toString().padStart(5, " ")}  ${r.route}`);
  }
  lines.push("");

  lines.push("-".repeat(72));
  lines.push("Top 20 affected users (hashed — LGPD-safe)");
  lines.push("-".repeat(72));
  for (const u of report.topUsers) {
    lines.push(`  ${u.count.toString().padStart(5, " ")}  ${u.userHash}  (${u.distinctErrors} distinct errors)`);
  }
  lines.push("");

  lines.push("-".repeat(72));
  lines.push("Top 10 auto-classified common errors");
  lines.push("-".repeat(72));
  for (const c of report.topCommon) {
    lines.push(`  [${c.severity.toUpperCase()}] ${c.category} (${c.count}x)`);
    lines.push(`     sample: ${c.sample.slice(0, 80)}`);
    lines.push(`     fix:    ${c.fixHint}`);
  }
  lines.push("");

  lines.push("-".repeat(72));
  lines.push("Actionable checklist (sorted by priority)");
  lines.push("-".repeat(72));
  for (const a of report.actionableChecklist) {
    lines.push(`  [${a.priority}] ${a.message}`);
    lines.push(`     fp=${a.fingerprint}`);
    lines.push(`     → ${a.suggestedAction}`);
  }

  lines.push(sep);
  lines.push("End of report");
  lines.push(sep);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const flags = parseFlags();

  let events: RawEvent[];
  if (flags.remote) {
    events = await readRemoteEvents(flags.since);
  } else {
    events = readLocalEvents(flags.logDir, flags.since);
    if (events.length === 0) {
      // Demo mode: synthesize a sample event set so the script always runs.
      events = synthesizeDemoEvents();
    }
  }

  const report = aggregate(events);

  if (flags.json) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(renderHuman(report) + "\n");
  }
}

// Demo events — only used when no log files are present (e.g. local CI).
function synthesizeDemoEvents(): RawEvent[] {
  const now = Date.now();
  return [
    {
      timestamp: now - 1000 * 60 * 30,
      level: "error",
      type: "AppError",
      message: "AUTH_INVALID_CREDENTIALS: email or password incorrect",
      tags: { route: "/api/auth/login", environment: "production" },
      user: { id: "u_demo_001" },
      errorCode: 1001,
    },
    {
      timestamp: now - 1000 * 60 * 25,
      level: "error",
      type: "AppError",
      message: "RATE_LIMIT_EXCEEDED: 60 req/min per IP",
      tags: { route: "/api/ai/akasha", environment: "production" },
      user: { id: "u_demo_002" },
      errorCode: 4001,
    },
    {
      timestamp: now - 1000 * 60 * 20,
      level: "warning",
      type: "ValidationError",
      message: "VALIDATION_MISSING_FIELD: lgpdConsent is required",
      tags: { route: "/api/auth/register", environment: "production" },
      errorCode: 2002,
    },
    {
      timestamp: now - 1000 * 60 * 15,
      level: "error",
      type: "PrismaClientKnownRequestError",
      message: "DB connection timeout (ETIMEDOUT) on prisma.user.findUnique",
      tags: { route: "/api/profile/me", environment: "production" },
      errorCode: 5002,
    },
    {
      timestamp: now - 1000 * 60 * 10,
      level: "info",
      type: "AppError",
      message: "RESOURCE_ALREADY_EXISTS: invite token already consumed",
      tags: { route: "/api/beta/invite/accept", environment: "production" },
      errorCode: 3002,
    },
  ];
}

main().catch((err) => {
  process.stderr.write(`audit-sentry-errors failed: ${String(err)}\n`);
  exit(1);
});