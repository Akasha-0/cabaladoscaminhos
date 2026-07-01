/**
 * patches/patch-audit — Wave 36 patch audit log + chain verification
 * ============================================================================
 * Append-only audit log of every patch lifecycle event (apply, rollback,
 * verify, forward-fix). Backed by JSONL file for easy grep + replay.
 *
 * Chain integrity:
 *   - Each entry carries `prevHash` (FNV-1a of previous entry's full JSON).
 *   - Tampering with any entry breaks the chain → `verifyChain()` flags it.
 *
 * Why JSONL:
 *   - Append-only-friendly (just `echo >> audit.log`).
 *   - Greppable for forensic queries.
 *   - No migration; deployable today.
 *
 * LGPD Art. 37 (registro de operações) + Art. 46 (segurança técnica):
 *   - Actor id is the admin user id (not email).
 *   - Reason text is admin-controlled; never auto-fills user PII.
 * ============================================================================
 */

import { appendFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fnv1a32 } from "./hash";

export type PatchAuditEvent =
  | "REGISTERED"
  | "APPLIED"
  | "VERIFIED"
  | "ROLLED_BACK"
  | "FORWARD_FIX"
  | "VERIFICATION_FAILED"
  | "DEPLOY_FAILED"
  | "CHAIN_VERIFIED";

export interface PatchAuditEntry {
  id: string;
  patchId: string;
  event: PatchAuditEvent;
  actor: string | null;
  timestamp: string;
  detail: string;
  prevHash: string;
  hash: string;
}

const AUDIT_DIR = process.env.PATCH_AUDIT_DIR ?? join(process.cwd(), "data", "patches");
const AUDIT_FILE = join(AUDIT_DIR, "audit.jsonl");

function ensureDir(): void {
  if (!existsSync(AUDIT_DIR)) mkdirSync(AUDIT_DIR, { recursive: true });
}

function lastHash(): string {
  if (!existsSync(AUDIT_FILE)) return "00000000";
  const lines = readFileSync(AUDIT_FILE, "utf8").split("\n").filter(Boolean);
  if (lines.length === 0) return "00000000";
  try {
    const last = JSON.parse(lines[lines.length - 1]!) as PatchAuditEntry;
    return last.hash;
  } catch {
    return "00000000";
  }
}

function genId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface LogEventInput {
  patchId: string;
  event: PatchAuditEvent;
  actor?: string;
  detail?: string;
}

export function logPatchEvent(input: LogEventInput): PatchAuditEntry {
  ensureDir();
  const prev = lastHash();
  const entry: PatchAuditEntry = {
    id: genId(),
    patchId: input.patchId,
    event: input.event,
    actor: input.actor ?? null,
    timestamp: new Date().toISOString(),
    detail: input.detail ?? "",
    prevHash: prev,
    hash: "PENDING",
  };
  entry.hash = fnv1a32(JSON.stringify({ ...entry, hash: "PENDING" }));
  appendFileSync(AUDIT_FILE, JSON.stringify(entry) + "\n");
  return entry;
}

export function readAuditLog(filter?: { patchId?: string; event?: PatchAuditEvent }): PatchAuditEntry[] {
  if (!existsSync(AUDIT_FILE)) return [];
  const lines = readFileSync(AUDIT_FILE, "utf8").split("\n").filter(Boolean);
  const out: PatchAuditEntry[] = [];
  for (const line of lines) {
    try {
      const e = JSON.parse(line) as PatchAuditEntry;
      if (filter?.patchId && e.patchId !== filter.patchId) continue;
      if (filter?.event && e.event !== filter.event) continue;
      out.push(e);
    } catch {
      // skip malformed lines
    }
  }
  return out;
}

/**
 * Replay the audit chain forward: each entry's prevHash must equal the
 * previous entry's hash. Returns the list of broken entry ids (empty = clean).
 */
export function verifyChain(): string[] {
  const entries = readAuditLog();
  const broken: string[] = [];
  let prev = "00000000";
  for (const entry of entries) {
    if (entry.prevHash !== prev) {
      broken.push(entry.id);
    }
    const recomputed = fnv1a32(JSON.stringify({ ...entry, hash: "PENDING" }));
    if (recomputed !== entry.hash) {
      broken.push(entry.id);
    }
    prev = entry.hash;
  }
  return broken;
}

/**
 * Summary counts per event type — useful for the admin bugs dashboard.
 */
export function auditSummary(): Record<PatchAuditEvent, number> {
  const entries = readAuditLog();
  const out: Record<PatchAuditEvent, number> = {
    REGISTERED: 0,
    APPLIED: 0,
    VERIFIED: 0,
    ROLLED_BACK: 0,
    FORWARD_FIX: 0,
    VERIFICATION_FAILED: 0,
    DEPLOY_FAILED: 0,
    CHAIN_VERIFIED: 0,
  };
  for (const e of entries) out[e.event] += 1;
  return out;
}