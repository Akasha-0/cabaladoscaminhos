/**
 * patches/index — public surface of the patch system (Wave 36)
 * ============================================================================
 *   registerPatch / rollbackPatch / listPatches / getPatch / verifyAuditChain
 *     → patch-registry.ts
 *   deployHotfix + HotfixPlan + HotfixResult
 *     → hotfix-deploy.ts
 *   rollback + rollbackLatest + RollbackRequest/Result
 *     → rollback-strategy.ts
 *   logPatchEvent / readAuditLog / verifyChain / auditSummary
 *     → patch-audit.ts
 *
 * Usage:
 *   import { registerPatch, deployHotfix, rollback } from '@/lib/patches';
 *
 * LGPD: see each module header for compliance notes.
 * ============================================================================
 */

export {
  registerPatch,
  rollbackPatch,
  listPatches,
  getPatch,
  verifyAuditChain,
  sha256OfFile,
  type PatchEntry,
  type PatchFile,
  type PatchStatus,
  type PatchSeverity,
  type RegisterPatchInput,
} from "./patch-registry";

export { deployHotfix, type HotfixPlan, type HotfixResult } from "./hotfix-deploy";

export {
  rollback,
  rollbackLatest,
  type RollbackStrategy,
  type RollbackRequest,
  type RollbackResult,
} from "./rollback-strategy";

export {
  logPatchEvent,
  readAuditLog,
  verifyChain,
  auditSummary,
  type PatchAuditEvent,
  type PatchAuditEntry,
  type LogEventInput,
} from "./patch-audit";

export { fnv1a32, sha256 } from "./hash";