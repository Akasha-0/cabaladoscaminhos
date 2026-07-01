/**
 * patches/rollback-strategy — Wave 36 one-click rollback
 * ============================================================================
 * Implements a one-click revert for any patch registered in patch-registry.
 * Two strategies:
 *
 *   1. GIT_REVERT (default, fast):
 *        git revert <patch-commit-sha> --no-edit
 *        push revert branch → registry marks patch ROLLED_BACK.
 *      Safe for production: Vercel/Netlify auto-deploy on push.
 *
 *   2. FORWARD_FIX (when git revert would conflict with subsequent fixes):
 *        create a NEW hotfix entry that supersedes the original.
 *        The original stays ROLLED_BACK but the audit chain remains intact.
 *
 * Why two strategies:
 *   - GIT_REVERT is the default because it's atomic and traceable.
 *   - FORWARD_FIX is the escape hatch when 5+ hotfixes stack on the same file.
 *
 * LGPD: rollback metadata includes actor id + reason text (LGPD-safe: no PII).
 * ============================================================================
 */

import { execSync } from "node:child_process";
import { rollbackPatch, getPatch, registerPatch, listPatches } from "./patch-registry";

export type RollbackStrategy = "GIT_REVERT" | "FORWARD_FIX";

export interface RollbackRequest {
  /** Patch registry id (e.g. "patch-20260701123045-abc1"). */
  patchId: string;
  /** Admin user id performing the rollback. */
  by: string;
  /** Why we're rolling back (audit text). */
  reason: string;
  /** Default GIT_REVERT; switch to FORWARD_FIX if revert conflicts. */
  strategy?: RollbackStrategy;
  /** Branch name for the revert commit (default: "hotfix/revert-<patchId>"). */
  branch?: string;
  /** New wave label, only for FORWARD_FIX. */
  wave?: string;
}

export interface RollbackResult {
  ok: boolean;
  strategy: RollbackStrategy;
  revertCommit: string | null;
  forwardFixPatchId: string | null;
  detail: string;
}

function safeExec(cmd: string): { ok: boolean; stdout: string; stderr: string } {
  try {
    const stdout = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { ok: true, stdout, stderr: "" };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return { ok: false, stdout: e.stdout ?? "", stderr: e.stderr ?? e.message ?? String(err) };
  }
}

// ---------------------------------------------------------------------------
// GIT_REVERT — atomic, traceable, preferred.
// ---------------------------------------------------------------------------

function gitRevert(patchId: string, by: string, reason: string, branch: string): RollbackResult {
  const patch = getPatch(patchId);
  if (!patch) return { ok: false, strategy: "GIT_REVERT", revertCommit: null, forwardFixPatchId: null, detail: "patch not found" };
  if (!patch.commitSha) {
    return { ok: false, strategy: "GIT_REVERT", revertCommit: null, forwardFixPatchId: null, detail: "patch has no commitSha — cannot revert" };
  }
  if (patch.status === "ROLLED_BACK") {
    return { ok: true, strategy: "GIT_REVERT", revertCommit: null, forwardFixPatchId: null, detail: "already rolled back" };
  }

  // Verify we're on a safe base (default: main).
  const curBranch = safeExec("git rev-parse --abbrev-ref HEAD");
  if (!curBranch.ok) {
    return { ok: false, strategy: "GIT_REVERT", revertCommit: null, forwardFixPatchId: null, detail: "git unavailable" };
  }

  const checkout = safeExec(`git checkout -B ${branch}`);
  if (!checkout.ok) {
    return { ok: false, strategy: "GIT_REVERT", revertCommit: null, forwardFixPatchId: null, detail: `checkout ${branch} failed` };
  }

  const revert = safeExec(`git revert --no-edit ${patch.commitSha}`);
  if (!revert.ok) {
    // Conflict — abort and tell caller to fall back to FORWARD_FIX.
    safeExec("git revert --abort");
    return {
      ok: false,
      strategy: "GIT_REVERT",
      revertCommit: null,
      forwardFixPatchId: null,
      detail: `revert conflict: ${revert.stderr.slice(0, 200)}`,
    };
  }

  const shaR = safeExec("git rev-parse HEAD");
  const sha = shaR.ok ? shaR.stdout.trim() : null;

  // Best-effort push.
  safeExec(`git push -u origin ${branch}`);

  // Mark original as rolled back.
  rollbackPatch(patchId, by, reason);

  return {
    ok: true,
    strategy: "GIT_REVERT",
    revertCommit: sha,
    forwardFixPatchId: null,
    detail: `reverted ${patchId} on ${branch} @ ${sha}`,
  };
}

// ---------------------------------------------------------------------------
// FORWARD_FIX — supersede via a new patch when revert would conflict.
// ---------------------------------------------------------------------------

function forwardFix(
  patchId: string,
  by: string,
  reason: string,
  wave: string,
): RollbackResult {
  const patch = getPatch(patchId);
  if (!patch) return { ok: false, strategy: "FORWARD_FIX", revertCommit: null, forwardFixPatchId: null, detail: "patch not found" };

  // Mark original ROLLED_BACK first (audit chain preserves history).
  rollbackPatch(patchId, by, reason);

  const newEntry = registerPatch({
    version: `${patch.version}-revert`,
    title: `[REVERT] ${patch.title}`,
    description: `Forward-fix superseding ${patchId}. Reason: ${reason}`,
    severity: patch.severity,
    references: [patchId, ...patch.references],
    files: [], // forward-fix file changes supplied by caller; this stub creates a marker entry
    wave: wave ?? patch.wave,
    notes: [`forward-fix for ${patchId}`, `actor: ${by}`],
    appliedBy: by,
  });

  return {
    ok: true,
    strategy: "FORWARD_FIX",
    revertCommit: null,
    forwardFixPatchId: newEntry.id,
    detail: `superseded ${patchId} with ${newEntry.id}`,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function rollback(req: RollbackRequest): RollbackResult {
  const strategy: RollbackStrategy = req.strategy ?? "GIT_REVERT";
  const branch = req.branch ?? `hotfix/revert-${req.patchId}`;

  if (strategy === "GIT_REVERT") {
    const r = gitRevert(req.patchId, req.by, req.reason, branch);
    if (r.ok || r.detail.startsWith("already rolled back") || r.detail === "patch not found") {
      return r;
    }
    // Conflict → fall through to FORWARD_FIX automatically.
    return forwardFix(req.patchId, req.by, `${req.reason} (auto: ${r.detail})`, req.wave);
  }

  return forwardFix(req.patchId, req.by, req.reason, req.wave);
}

/**
 * Rollback the most recent APPLIED patch on a given wave — convenience for
 * "last hotfix broke prod" scenario.
 */
export function rollbackLatest(wave: string, by: string, reason: string): RollbackResult {
  const recent = listPatches({ wave, status: "APPLIED" });
  if (recent.length === 0) {
    return { ok: false, strategy: "GIT_REVERT", revertCommit: null, forwardFixPatchId: null, detail: `no applied patches in ${wave}` };
  }
  return rollback({ patchId: recent[0]!.id, by, reason });
}