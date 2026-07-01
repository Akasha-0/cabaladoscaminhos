/**
 * bugs/index — public surface of bug tracking (Wave 36)
 * ============================================================================
 * Re-exports from bug-store.ts. Pure JSONL backend for fast iteration; will
 * migrate to Prisma model in Wave 37+.
 * ============================================================================
 */

export {
  createBug,
  listBugs,
  getBug,
  updateBug,
  recordAffectedUser,
  bugSummary,
  hashUserId,
  type BugEntry,
  type BugStatus,
  type BugSeverity,
  type BugReproducibility,
  type BugSummary,
  type CreateBugInput,
} from "./bug-store";