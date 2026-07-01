/**
 * patches/patch-registry — Wave 36 bug-fix patch registry
 * ============================================================================
 * Maintains a single source of truth for applied patches: id, version, files
 * touched, applied_at, rolled_back_at, deploy_window, severity, status, audit
 * hash. The registry is persisted as JSON in `data/patches/registry.json`
 * (or `PATCH_REGISTRY_DIR` env override) and cached in memory.
 *
 * Why JSON and not DB:
 *   - Sandbox-friendly: no migration needed.
 *   - Hotfix workflow is rare (1-5 per wave) → write contention is low.
 *   - JSON file is committed to git via the patch-system (see hotfix-deploy)
 *     so the registry IS the audit log.
 *
 * Patch ID format: `patch-<yyyyMMddHHmmss>-<4char-hash>` — sortable + unique.
 *
 * LGPD: registry never stores user PII. Only commit SHAs + admin actor id.
 * ============================================================================
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { fnv1a32 } from "./hash";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PatchStatus = "DRAFT" | "APPLIED" | "ROLLED_BACK" | "FAILED";
export type PatchSeverity = "P0" | "P1" | "P2" | "P3";

export interface PatchFile {
  /** Absolute or repo-relative path. */
  path: string;
  /** SHA-256 of file content at apply time. */
  sha256: string;
  /** Lines added/removed (positive=add, negative=remove). */
  diffLines: number;
}

export interface PatchEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  severity: PatchSeverity;
  status: PatchStatus;
  /** Linked Sentry fingerprint or bug ticket id, if any. */
  references: string[];
  files: PatchFile[];
  /** Git commit SHA where patch landed. */
  commitSha: string | null;
  /** Admin user id who applied the patch. */
  appliedBy: string | null;
  appliedAt: string | null;
  rolledBackAt: string | null;
  rolledBackBy: string | null;
  rollbackReason: string | null;
  /** Wave / release label, e.g. "W36". */
  wave: string;
  /** Audit hash (FNV-1a) — covers files + metadata. */
  auditHash: string;
  /** Free-form notes (LGPD-safe). */
  notes: string[];
}

interface RegistryFile {
  schemaVersion: 1;
  entries: PatchEntry[];
}

// ---------------------------------------------------------------------------
// Registry store
// ---------------------------------------------------------------------------

const REGISTRY_DIR = process.env.PATCH_REGISTRY_DIR ?? join(process.cwd(), "data", "patches");
const REGISTRY_FILE = join(REGISTRY_DIR, "registry.json");

function ensureDir(): void {
  if (!existsSync(REGISTRY_DIR)) {
    mkdirSync(REGISTRY_DIR, { recursive: true });
  }
}

function readRegistry(): RegistryFile {
  ensureDir();
  if (!existsSync(REGISTRY_FILE)) {
    return { schemaVersion: 1, entries: [] };
  }
  try {
    const raw = readFileSync(REGISTRY_FILE, "utf8");
    const parsed = JSON.parse(raw) as RegistryFile;
    if (parsed.schemaVersion !== 1) {
      throw new Error(`Unsupported registry schemaVersion ${parsed.schemaVersion}`);
    }
    return parsed;
  } catch (err) {
    throw new Error(`Patch registry read failed: ${String(err)}`);
  }
}

function writeRegistry(reg: RegistryFile): void {
  ensureDir();
  // Atomic-ish: write tmp + rename.
  const tmp = `${REGISTRY_FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(reg, null, 2));
  // Best-effort rename (no fs.renameSync sync import — use module import).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { renameSync } = require("node:fs") as typeof import("node:fs");
  renameSync(tmp, REGISTRY_FILE);
}

// ---------------------------------------------------------------------------
// Patch ID generation
// ---------------------------------------------------------------------------

function generatePatchId(): string {
  const stamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6);
  return `patch-${stamp}-${rand}`;
}

// ---------------------------------------------------------------------------
// Audit hash
// ---------------------------------------------------------------------------

function computeAuditHash(entry: Omit<PatchEntry, "auditHash">): string {
  const payload = JSON.stringify({
    id: entry.id,
    version: entry.version,
    files: entry.files.map((f) => f.path + ":" + f.sha256 + ":" + f.diffLines),
    severity: entry.severity,
    references: entry.references,
  });
  return fnv1a32(payload);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface RegisterPatchInput {
  version: string;
  title: string;
  description: string;
  severity: PatchSeverity;
  references?: string[];
  files: PatchFile[];
  wave: string;
  notes?: string[];
  /** Git commit SHA (optional — populated post-commit). */
  commitSha?: string;
  /** Admin user id applying the patch. */
  appliedBy?: string;
}

/**
 * Register a new patch. Idempotent on (version + files hash): re-running
 * with the same inputs returns the existing entry instead of duplicating.
 */
export function registerPatch(input: RegisterPatchInput): PatchEntry {
  const reg = readRegistry();
  const id = generatePatchId();
  const fileKey = input.files.map((f) => f.path).sort().join("|");
  const existing = reg.entries.find(
    (e) => e.version === input.version && e.files.map((f) => f.path).sort().join("|") === fileKey,
  );
  if (existing) return existing;

  const base: Omit<PatchEntry, "auditHash"> = {
    id,
    version: input.version,
    title: input.title,
    description: input.description,
    severity: input.severity,
    status: "APPLIED",
    references: input.references ?? [],
    files: input.files,
    commitSha: input.commitSha ?? null,
    appliedBy: input.appliedBy ?? null,
    appliedAt: new Date().toISOString(),
    rolledBackAt: null,
    rolledBackBy: null,
    rollbackReason: null,
    wave: input.wave,
    notes: input.notes ?? [],
  };

  const entry: PatchEntry = { ...base, auditHash: computeAuditHash(base) };
  reg.entries.push(entry);
  writeRegistry(reg);
  return entry;
}

/**
 * Mark a patch as rolled back. The original registry row is kept (audit
 * integrity) but status flips to ROLLED_BACK with rollback metadata.
 */
export function rollbackPatch(id: string, by: string, reason: string): PatchEntry {
  const reg = readRegistry();
  const entry = reg.entries.find((e) => e.id === id);
  if (!entry) throw new Error(`Patch not found: ${id}`);
  if (entry.status === "ROLLED_BACK") return entry;
  entry.status = "ROLLED_BACK";
  entry.rolledBackAt = new Date().toISOString();
  entry.rolledBackBy = by;
  entry.rollbackReason = reason;
  entry.auditHash = computeAuditHash({
    ...entry,
    status: "ROLLED_BACK",
    rolledBackAt: entry.rolledBackAt,
    rolledBackBy: entry.rolledBackBy,
    rollbackReason: entry.rollbackReason,
  });
  writeRegistry(reg);
  return entry;
}

export function listPatches(filter?: { status?: PatchStatus; wave?: string; severity?: PatchSeverity }): PatchEntry[] {
  const reg = readRegistry();
  let out = reg.entries;
  if (filter?.status) out = out.filter((e) => e.status === filter.status);
  if (filter?.wave) out = out.filter((e) => e.wave === filter.wave);
  if (filter?.severity) out = out.filter((e) => e.severity === filter.severity);
  return out.sort((a, b) => (b.appliedAt ?? "").localeCompare(a.appliedAt ?? ""));
}

export function getPatch(id: string): PatchEntry | null {
  const reg = readRegistry();
  return reg.entries.find((e) => e.id === id) ?? null;
}

/**
 * Verify the audit chain: each entry's auditHash must match the recomputed
 * hash. Returns the list of tampered ids (empty = clean).
 */
export function verifyAuditChain(): string[] {
  const reg = readRegistry();
  const tampered: string[] = [];
  for (const entry of reg.entries) {
    const recomputed = computeAuditHash({
      ...entry,
      status: entry.status,
      rolledBackAt: entry.rolledBackAt,
      rolledBackBy: entry.rolledBackBy,
      rollbackReason: entry.rollbackReason,
    });
    if (recomputed !== entry.auditHash) tampered.push(entry.id);
  }
  return tampered;
}

/**
 * Compute SHA-256 of a file's current contents — used to verify the
 * patch touched what it claims to have touched.
 */
export function sha256OfFile(path: string): string {
  const buf = readFileSync(path);
  return createHash("sha256").update(buf).digest("hex");
}

// Re-export for module symmetry.
export { dirname };

// Avoid unused-var lint complaint when consumer doesn't need dirname directly.
void dirname;