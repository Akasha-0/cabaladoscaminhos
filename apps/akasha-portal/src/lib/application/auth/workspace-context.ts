/**
 * workspace-context.ts — multi-tenant workspace isolation (Wave 31.2)
 *
 * WORKSPACE vs ZELADOR — two scopes, complementary (NOT competing):
 *
 *   zeladorId  (Wave 3, D-XXX — tenant-context.ts) — narrower scope: a
 *              single Zelador's consultores. Each Zelador is the
 *              principal of his own MCP ("MCP logico" per ADR 0004).
 *              Granularity: per Zelador + per consulente (caminhada).
 *
 *   workspaceId (Wave 31.2 — THIS MODULE) — broader scope: a logical
 *              "tenant" that may group MULTIPLE Zeladores + users.
 *              Examples: "personal" (default for solo users),
 *              "wellness-clinic-xyz" (multi-Zelador organization with
 *              shared consultores). Granularity: per tenant.
 *
 * Hierarchy: workspaceId ⊃ zeladorId ⊃ caminhadaId. A Zelador belongs
 * to exactly one workspace; a workspace can have N Zeladores.
 *
 * COMPARISON TO `tenant-context.ts`:
 *   - `withCaminhanteContext()` injects {zeladorId, caminhadaId} into
 *     Prisma queries for Zelador-tool models (Sessao, SessaoChunk, ...).
 *   - `withWorkspaceContext()` injects {workspaceId} into Prisma queries
 *     for user-facing models (User, DailyReading, ...).
 *
 *   Both helpers coexist: a request that hits both "/api/me/daily" (uses
 *   workspaceId) AND "/api/sessoes" (uses zeladorId) can wrap its body
 *   in `withWorkspaceContext` outer + `withCaminhanteContext` inner.
 *   AsyncLocalStorage scopes nest correctly.
 *
 * JWT STATUS (Wave 31.2 MVP):
 *   JWT payload does NOT yet carry `workspaceId` claim. For MVP, the
 *   `withWorkspace` middleware (with-workspace.ts) extracts userId from
 *   the JWT, then queries the DB to resolve workspaceId (1 extra read
 *   per request). Wave 31.2.1 (proposed) will add `workspaceId` to the
 *   JWT payload and skip the DB lookup on hot paths.
 *
 * Trade-offs (deliberate):
 *   - App-layer proxy (not Postgres RLS): 1 audit point, easy to reason.
 *   - Fail-closed: missing context = throw, never silently allow.
 *   - Default workspace is `'personal'` for all existing rows (backfill).
 *     Multi-tenant orgs (clinics, schools) are explicit opt-in (Phase 2).
 *   - `User` IS scoped (unlike `tenant-context.ts` where User is NOT
 *     scoped). Reason: a workspace can have multiple users, and a user
 *     in workspace A must not see users in workspace B.
 */

import { AsyncLocalStorage } from 'node:async_hooks';

import { prisma as rawPrisma } from '@/lib/infrastructure/prisma';

// ============================================================================
// Types
// ============================================================================

/**
 * The default workspace for single-Zelador / personal users. All
 * existing rows are backfilled to this workspaceId in migration
 * `WAVE-31-2-multitenant-workspace-id`.
 */
export const DEFAULT_WORKSPACE_ID = 'personal';

/**
 * WorkspaceContext — the multi-tenant scope for the active request.
 *
 * `workspaceId` = the tenant boundary. Users in workspace X cannot see
 *                 data of workspace Y, period.
 * `userId`      = the authenticated user (cached so we don't re-query
 *                 on every DB read inside the request).
 */
export interface WorkspaceContext {
  workspaceId: string;
  userId: string;
}

/**
 * Resolution result of `resolveWorkspaceForUser`. Three outcomes:
 *   - `ok`             — user exists, workspaceId resolved (either from
 *                        JWT claim or from DB).
 *   - `user_not_found` — JWT sub doesn't match any user (stale token,
 *                        user deleted between issue and verify). 401.
 *   - `no_workspace`   — user exists but has NULL/empty workspaceId.
 *                        Should NEVER happen post-migration (backfill
 *                        fills it) but handled defensively. 500.
 */
export type WorkspaceResolution =
  | { kind: 'ok'; context: WorkspaceContext }
  | { kind: 'user_not_found' }
  | { kind: 'no_workspace' };

// ============================================================================
// AsyncLocalStorage — the only place workspace context lives
// ============================================================================

/**
 * Module-level ALS. Single instance per process (Node requires this —
 * ALS state is per-instance, not per-call). Nesting is supported:
 * inner `als.run` shadows outer context (matches `tenant-context.ts`
 * pattern, so both helpers compose without interference).
 */
const als = new AsyncLocalStorage<WorkspaceContext>();

/**
 * Run `fn` with the given workspace context active. All async work
 * spawned inside `fn` (awaits, timers, setImmediate) inherits the
 * context via Node's async_hooks.
 */
export function withWorkspaceContext<T>(
  ctx: WorkspaceContext,
  fn: () => T,
): T {
  return als.run(ctx, fn);
}

/**
 * Returns the current workspace context, or `undefined` if not inside
 * a `withWorkspaceContext()` block. Use this in code paths that need
 * to optionally act (e.g. log audit info) without forcing context.
 *
 * The query-extensions below use this to ENFORCE context (throw if
 * missing). Helpers that READ context should call this function.
 */
export function getWorkspaceContext(): WorkspaceContext | undefined {
  return als.getStore();
}

// ============================================================================
// Error types
// ============================================================================

/**
 * Error thrown when a workspace-scoped model is queried without an
 * active `WorkspaceContext`. The message names the model and points
 * the developer at the two ways to fix it.
 */
export class MissingWorkspaceContextError extends Error {
  readonly model: string;
  constructor(model: string) {
    super(
      `[Workspace] Missing WorkspaceContext for scoped model "${model}". ` +
        `Use withWorkspaceContext() to set the active workspace + user, ` +
        `or wrap the call in withWorkspace() (with-workspace.ts) at the ` +
        `route entry, or pass an explicit "where.workspaceId" filter on ` +
        `unscoped code paths (admin scripts, crons).`,
    );
    this.name = 'MissingWorkspaceContextError';
    this.model = model;
  }
}

// ============================================================================
// Scoped model registry
// ============================================================================

/**
 * Models whose queries are auto-scoped by the workspace proxy.
 * Adding a new model here = opt-in to workspace isolation.
 *
 * Wave 31.2 MVP scope (per task):
 *   - User        — owns all data; isolation boundary.
 *   - DailyReading — "Reading" in the task (was Mandato do Dia).
 *
 * EXPLICITLY OUT OF SCOPE (Wave 31.2.1+):
 *   - Discovery   — not yet a persistent model in schema.prisma. Lives
 *                   in branch wave-20.2-discovery (not merged). When
 *                   merged, add here. Documented in WAVE-31.2.1 ADR-DRAFT.
 *   - Mandala     — computed on-the-fly (no persistent model). Per
 *                   prisma/AGENTS.md "Mandala + Mandato são recomputados
 *                   on-the-fly". Workspace isolation for computed values
 *                   is enforced at the API boundary (request handler
 *                   validates user.workspaceId matches DailyReading.userId
 *                   in the same workspace) — see with-workspace.ts.
 *   - Synthesis   — same as Mandala (computed, not persisted).
 */
const SCOPED_MODELS: ReadonlySet<string> = new Set<string>([
  'User',
  'DailyReading',
]);

// ============================================================================
// Workspace resolution (DB lookup)
// ============================================================================

/**
 * Resolve the workspace context for an authenticated user. Called by
 * `withWorkspace()` (with-workspace.ts) at route entry.
 *
 * MVP behavior:
 *   1. If the JWT carries a `workspaceId` claim AND it matches the
 *      user's workspace in DB → use the claim (no extra query needed).
 *   2. Otherwise → query DB for the user's workspaceId (1 read).
 *
 * Phase 2 (Wave 31.2.1): trust JWT claim unconditionally. The DB lookup
 * is the fallback for the MVP transition period.
 */
export async function resolveWorkspaceForUser(
  userId: string,
  jwtWorkspaceIdClaim?: string,
): Promise<WorkspaceResolution> {
  const user = await rawPrisma.user.findUnique({
    where: { id: userId },
    select: { id: true, workspaceId: true },
  });
  if (!user) {
    return { kind: 'user_not_found' };
  }
  if (!user.workspaceId || user.workspaceId.trim() === '') {
    return { kind: 'no_workspace' };
  }
  // If JWT has a claim and it disagrees with DB, prefer DB (defense in
  // depth — a stolen token can't claim a different workspace).
  return {
    kind: 'ok',
    context: { userId: user.id, workspaceId: user.workspaceId },
  };
}

// ============================================================================
// Extended Prisma client
// ============================================================================

type PrismaQueryFn = (args: unknown) => Promise<unknown>;

/**
 * The extended Prisma client. Identical to the raw `prisma` client in
 * shape, but every operation on a workspace-scoped model is
 * auto-filtered by `workspaceId` from the current `WorkspaceContext`.
 *
 * Implementation note: we use `$allOperations` (the dynamic
 * query-extension hook) because in Prisma 7 the `args` object inside
 * `query` is typed as `any` for `$allOperations`, which is exactly
 * what we need for a transparent "merge into where" pattern.
 */
export const prisma = rawPrisma.$extends({
  name: 'WorkspaceContext',
  query: {
    $allModels: {
      async $allOperations({
        model,
        operation,
        args,
        query,
      }: {
        model?: string;
        operation?: string;
        args?: unknown;
        query: PrismaQueryFn;
      }) {
        if (model === undefined) {
          // `$allOperations` can fire for `model`-less queries (e.g.
          // `$transaction`, `$queryRaw`). Pass through untouched.
          return query(args ?? {});
        }
        if (!SCOPED_MODELS.has(model)) {
          return query(args);
        }

        const ctx = getWorkspaceContext();
        if (!ctx) {
          throw new MissingWorkspaceContextError(model);
        }
        const scope: { workspaceId: string } = { workspaceId: ctx.workspaceId };

        const next = (args ?? {}) as Record<string, unknown>;

        switch (operation) {
          // ---------- Read operations ----------
          case 'findUnique':
          case 'findUniqueOrThrow':
          case 'findFirst':
          case 'findFirstOrThrow':
          case 'findMany':
          case 'count':
          case 'aggregate':
          case 'groupBy': {
            next.where = { AND: [scope, ...asArray(next.where)] };
            break;
          }

          // ---------- Update / delete operations ----------
          case 'update':
          case 'updateMany':
          case 'delete':
          case 'deleteMany': {
            next.where = { AND: [scope, ...asArray(next.where)] };
            break;
          }

          // ---------- Create operations ----------
          case 'create':
          case 'createMany':
          case 'createManyAndReturn': {
            if (Array.isArray(next.data)) {
              next.data = (next.data as Record<string, unknown>[]).map((row) => ({
                ...row,
                ...scope,
              }));
            } else {
              next.data = {
                ...(next.data as Record<string, unknown>),
                ...scope,
              };
            }
            break;
          }

          // ---------- Upsert ----------
          case 'upsert': {
            // Scope both the WHERE (lookup) and the create payload.
            next.where = { AND: [scope, ...asArray(next.where)] };
            const create =
              (next.create as Record<string, unknown> | undefined) ?? {};
            next.create = { ...create, ...scope };
            break;
          }

          default:
            // Unhandled operations: pass through. Prisma client will
            // still validate the operation exists for this model.
            break;
        }

        return query(next);
      },
    },
  },
});

// ============================================================================
// Internal helpers
// ============================================================================

/** Normalize a `where` value (or array thereof) into an array of clauses
 *  for safe `AND` composition. */
function asArray(where: unknown): Record<string, unknown>[] {
  if (!where) return [];
  if (Array.isArray(where)) return where as Record<string, unknown>[];
  return [where as Record<string, unknown>];
}

// ============================================================================
// Public types — re-export for consumers
// ============================================================================

/** The shape of a single Prisma `where` clause compatible with the
 *  extended client. Most callers won't need this; provided for
 *  advanced use (e.g. composing with Prisma's `Prisma.UserWhereInput`). */
export type WorkspaceScope = {
  workspaceId: string;
};
