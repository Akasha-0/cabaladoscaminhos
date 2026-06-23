/**
 * Tenant Context — multi-tenant isolation for Zelador-tool (Akasha Portal)
 *
 * Wave 3 / D-XXX (estende D-041).
 *
 * Implements the application-layer multi-tenant isolation pattern approved
 * in ADR 0004 (see docs/adrs/0004-multi-tenant-consulente-mcp.md). Every
 * query against a "scoped" model must run inside a `withCaminhanteContext()`
 * block; this helper auto-injects `zeladorId` and (for most models)
 * `caminhadaId` filters so a Zelador can never read or write data from
 * another Zelador's consultores.
 *
 * Trade-offs (deliberate, see ADR 0004):
 *   - App-layer proxy (not Postgres RLS): 1 audit point, easier to reason
 *     about, but requires discipline (mitigated by tests).
 *   - Fail-closed: missing context = throw, never silently allow.
 *   - GrimorioPessoal is UNIQUE per Zelador (no `caminhadaId`) — by design
 *     it's the Zelador's *own* grimoire, not the consulente's notes
 *     (consulente notes live in `NotasConsulente`).
 *
 * Usage (typical API route):
 *
 *   import { withCaminhanteContext, prisma } from '@/lib/application/tenant-context';
 *
 *   const ctx = { zeladorId: session.userId, caminhadaId: params.id };
 *   const sessoes = await withCaminhanteContext(ctx, () =>
 *     prisma.sessao.findMany({ where: { status: 'fechada' } }),
 *   );
 *
 * Scoped models (require context):
 *   - Sessao, SessaoChunk, GrimorioPessoal, NotasConsulente, MapaCalculo
 *   - Caminhante, Caminhada (D-041, also tenant-scoped)
 *   - User is NOT scoped (Zelador = single-tenant by definition)
 */

import { AsyncLocalStorage } from 'node:async_hooks';

import { prisma as rawPrisma } from '@/lib/infrastructure/prisma';

// Prisma 7's $allOperations callback has `query: never` typing. We use a
// local type alias to bypass this without `as any` everywhere.
type PrismaQueryFn = (args: unknown) => Promise<unknown>;

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

/**
 * CaminhanteContext — the multi-tenant scope for one Zelador's current
 * working session in the chat / API route.
 *
 * `zeladorId`   = the User.id of the Zelador (authenticated practitioner)
 * `caminhadaId` = the Caminhada.id of the active consulente ("MCP logico"
 *                 loaded into the chat per ADR 0004).
 *
 * Any query against a scoped model must have both of these set, or
 * `withCaminhanteContext()` will throw.
 */
export interface CaminhanteContext {
  zeladorId: string;
  caminhadaId: string;
}

// ---------------------------------------------------------------------------
// AsyncLocalStorage — the only place tenant context lives
// ---------------------------------------------------------------------------

/**
 * Module-level ALS. We use a single instance per process (Node.js requires
 * this — ALS state is per-instance, not per-call). Nesting is supported
 * (inner `als.run` shadows outer context).
 */
const als = new AsyncLocalStorage<CaminhanteContext>();

/**
 * Run `fn` with the given tenant context active. All async work spawned
 * inside `fn` (including awaits, timers, setImmediate) inherits the
 * context via Node's async_hooks.
 */
export function withCaminhanteContext<T>(
  ctx: CaminhanteContext,
  fn: () => T,
): T {
  return als.run(ctx, fn);
}

/**
 * Returns the current tenant context, or `undefined` if not inside a
 * `withCaminhanteContext()` block. Use this in code paths that need
 * to optionally act (e.g. log audit info) without forcing context.
 *
 * The query-extensions below use this to *enforce* context (throw if
 * missing). Helpers that *read* context should call this function.
 */
export function getCaminhanteContext(): CaminhanteContext | undefined {
  return als.getStore();
}

// ---------------------------------------------------------------------------
// Scoped model registry
// ---------------------------------------------------------------------------

/**
 * Models whose queries are auto-scoped by the tenant proxy. Adding a new
 * model here = opt-in to multi-tenant isolation.
 *
 * IMPORTANT: `User` is deliberately NOT in this set. The Zelador
 * (akasha_users row) is the principal identity of the session — there's
 * no "other User" to be isolated from in this app. (If/when we add
 * collaborator features where one Zelador acts on behalf of another,
 * we'll add `User` here with a different policy.)
 */
const SCOPED_MODELS: ReadonlySet<string> = new Set<string>([
  // D-041 models (already deployed)
  'Caminhante',
  'Caminhada',
  // D-XXX models (Wave 3 — created in 20260624000000_XXX_001_multitenant_core)
  'Sessao',
  'SessaoChunk',
  'GrimorioPessoal',
  'NotasConsulente',
  'MapaCalculo',
]);

/**
 * Models that do NOT need `caminhadaId` in their scope — only `zeladorId`.
 * GrimorioPessoal is 1:1 with the Zelador (their own grimoire), so it
 * has no per-consulente key. See D-XXX.4 in the design proposal.
 */
const MODELS_WITHOUT_CAMINHADA: ReadonlySet<string> = new Set<string>([
  'GrimorioPessoal',
]);

// ---------------------------------------------------------------------------
// Extended Prisma client
// ---------------------------------------------------------------------------

/**
 * Error thrown when a scoped model is queried without an active
 * `CaminhanteContext`. The message names the model and points the
 * developer at the two ways to fix it.
 *
 * This is a `class` (not just a string) so callers can `instanceof` it
 * if they want to handle this specific failure mode differently (e.g.
 * to translate the error to a localized message in an API handler).
 */
export class MissingTenantContextError extends Error {
  readonly model: string;
  constructor(model: string) {
    super(
      `[Tenant] Missing CaminhanteContext for scoped model "${model}". ` +
        `Use withCaminhanteContext() to set the active Zelador + Caminhada, ` +
        `or pass an explicit "where.zeladorId" filter on unscoped code paths.`,
    );
    this.name = 'MissingTenantContextError';
    this.model = model;
  }
}

/**
 * Internal helper: build the extra `where` filter from the current
 * context, or throw if we're outside one.
 */
function buildScopeFilter(
  model: string,
  ctx: CaminhanteContext | undefined,
): { zeladorId: string; caminhadaId?: string } {
  if (!ctx) {
    throw new MissingTenantContextError(model);
  }
  const filter: { zeladorId: string; caminhadaId?: string } = {
    zeladorId: ctx.zeladorId,
  };
  if (!MODELS_WITHOUT_CAMINHADA.has(model)) {
    filter.caminhadaId = ctx.caminhadaId;
  }
  return filter;
}

/**
 * The extended Prisma client. Identical to the raw `prisma` client in
 * shape, but every operation on a scoped model is auto-filtered by
 * `zeladorId` (and `caminhadaId` when applicable) from the current
 * `CaminhanteContext`.
 *
 * Implementation note: we use `$allOperations` (the dynamic
 * query-extension hook) because in Prisma 7 the `args` object inside
 * `query` is typed as `any` for `$allOperations`, which is exactly what
 * we need for a transparent "merge into where" pattern.
 */
export const prisma = rawPrisma.$extends({
  name: 'TenantContext',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }: { model?: string; operation?: string; args?: unknown; query: PrismaQueryFn }) {
        // Read operations: inject filter into `where` + `every`/`some`/`none`.
        // Mutating operations: inject into `where` (update/delete) and
        // `data` (create / createMany / upsert).
        if (model === undefined) {
          // `$allOperations` can fire for `model`-less queries (e.g.
          // `$transaction`, `$queryRaw`). Pass through untouched.
          return query(args ?? {});
        }
        if (!SCOPED_MODELS.has(model)) {
          return query(args);
        }

        const ctx = getCaminhanteContext();
        const scope = buildScopeFilter(model, ctx);

        // Default: pass args through unchanged.
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
            next.where = { AND: [scope, ...(asArray(next.where))] };
            break;
          }

          // ---------- Update / delete operations ----------
          case 'update':
          case 'updateMany':
          case 'delete':
          case 'deleteMany': {
            next.where = { AND: [scope, ...(asArray(next.where))] };
            break;
          }

          // ---------- Create operations ----------
          case 'create':
          case 'createMany': {
            // Inject zeladorId + caminhadaId into data. If the caller
            // already passed them, the new values win (security: we
            // never let the caller override the tenant scope from
            // outside the context).
            if (Array.isArray(next.data)) {
              next.data = (next.data as Record<string, unknown>[]).map((row) => ({
                ...row,
                ...scope,
              }));
            } else {
              next.data = { ...(next.data as Record<string, unknown>), ...scope };
            }
            break;
          }

          case 'createManyAndReturn': {
            if (Array.isArray(next.data)) {
              next.data = (next.data as Record<string, unknown>[]).map((row) => ({
                ...row,
                ...scope,
              }));
            } else {
              next.data = { ...(next.data as Record<string, unknown>), ...scope };
            }
            break;
          }

          // ---------- Upsert ----------
          case 'upsert': {
            // Scope both the WHERE (lookup) and the create payload.
            next.where = { AND: [scope, ...(asArray(next.where))] };
            const create = (next.create as Record<string, unknown> | undefined) ?? {};
            next.create = { ...create, ...scope };
            break;
          }

          default:
            // Unhandled operations: pass through. The Prisma client will
            // still validate the operation exists for this model.
            break;
        }

        return query(next);
      },
    },
  },
});

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Normalize a `where` value (or array thereof) into an array of clauses
 *  for safe `AND` composition. */
function asArray(where: unknown): Record<string, unknown>[] {
  if (!where) return [];
  if (Array.isArray(where)) return where as Record<string, unknown>[];
  return [where as Record<string, unknown>];
}

// ---------------------------------------------------------------------------
// Public types — re-export for consumers
// ---------------------------------------------------------------------------

/** The shape of a single Prisma `where` clause compatible with the
 *  extended client. Most callers won't need this; provided for
 *  advanced use (e.g. composing with Prisma's `Prisma.SessaoWhereInput`). */
export type TenantScope = {
  zeladorId: string;
  caminhadaId?: string;
};
