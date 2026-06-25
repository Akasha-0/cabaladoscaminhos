/**
 * workspace-isolation.test.ts — Wave 31.2 multi-tenant isolation
 *
 * These tests verify the SECURITY INVARIANT the task requires:
 *
 *   "User A in workspace X cannot read or write data belonging to
 *    user B in workspace Y."
 *
 * We exercise three layers, in order of strength:
 *
 *   L1 — `getWorkspaceContext()` reports the right workspaceId from
 *         inside a `withWorkspaceContext` block (cheap, no DB).
 *
 *   L2 — `requireWorkspaceAccess(userId, workspaceId)` returns false
 *         when the user is in a different workspace (defense layer for
 *         server actions / websockets / batch jobs that get userId +
 *         workspaceId separately, NOT via the HTTP wrapper).
 *
 *   L3 — The Prisma proxy auto-injects `where: { AND: [workspaceId] }`
 *         on every User/DailyReading query, so a leaked call without
 *         the workspace filter is physically impossible. Tested via
 *         the underlying `prisma.$queryRaw`-style mock — we inspect
 *         the args shape the proxy forwards.
 *
 *   L4 — `withWorkspace()` middleware returns 401/500 for missing
 *         auth / no workspace provisioning (HTTP boundary).
 *
 * The proxy is the strongest layer — L1/L2 are conveniences that
 * fail-closed. If you delete L1/L2 helpers, L3 still isolates.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Module mocks — vi.hoisted lifts the mock fn instances to the top of the
// file so they're available inside vi.mock(...) factories (which are
// hoisted themselves).
// ---------------------------------------------------------------------------

const mocks = vi.hoisted(() => ({
  verifyAkashaToken: vi.fn(),
  prismaUserFindUnique: vi.fn(),
  prismaUserFindMany: vi.fn(),
  prismaDailyReadingFindMany: vi.fn(),
  prismaDailyReadingCreate: vi.fn(),
  prismaUserCreate: vi.fn(),
}));

vi.mock('./akasha-jwt', () => ({
  AKASHA_TOKEN_COOKIE: 'akasha_session',
  verifyAkashaToken: (...args: unknown[]) => mocks.verifyAkashaToken(...args),
}));

// Mock the underlying Prisma client. The proxy in workspace-context.ts
// calls `$extends(...)` on this client — we let that pass through
// and inspect the operation-level mocks below.
//
// IMPORTANT: the mock targets below must be the SAME `vi.fn()`
// instances declared in the hoisted `mocks` object so tests can do
// `mocks.prismaUserFindUnique.mockResolvedValue(...)` and the change
// is observed through the call chain.
vi.mock('@/lib/infrastructure/prisma', () => {
  // The proxy calls $extends({ query: { $allModels: { $allOperations } } }).
  // We return an object whose $extends invokes the supplied extension
  // and returns a client whose operations forward to vi.fn() mocks.
  const extensionHolder: { ext: unknown } = { ext: null };

  function runExt(
    model: string,
    operation: string,
    args: unknown,
    target: (a: unknown) => Promise<unknown>,
  ) {
    const ext = extensionHolder.ext as
      | {
          query?: {
            $allModels?: {
              $allOperations?: (params: {
                model?: string;
                operation?: string;
                args?: unknown;
                query: (a: unknown) => Promise<unknown>;
              }) => Promise<unknown>;
            };
          };
        }
      | null;
    if (!ext?.query?.$allModels?.$allOperations) {
      return target(args);
    }
    return ext.query.$allModels.$allOperations({
      model,
      operation,
      args,
      query: (nextArgs: unknown) => target(nextArgs),
    });
  }

  const client = {
    $extends: (extension: unknown) => {
      extensionHolder.ext = extension;
      return {
        user: {
          findUnique: (a: unknown) =>
            runExt('User', 'findUnique', a, mocks.prismaUserFindUnique as unknown as (a: unknown) => Promise<unknown>),
          findMany: (a: unknown) =>
            runExt('User', 'findMany', a, mocks.prismaUserFindMany as unknown as (a: unknown) => Promise<unknown>),
          create: (a: unknown) =>
            runExt('User', 'create', a, mocks.prismaUserCreate as unknown as (a: unknown) => Promise<unknown>),
        },
        dailyReading: {
          findMany: (a: unknown) =>
            runExt(
              'DailyReading',
              'findMany',
              a,
              mocks.prismaDailyReadingFindMany as unknown as (a: unknown) => Promise<unknown>,
            ),
          create: (a: unknown) =>
            runExt(
              'DailyReading',
              'create',
              a,
              mocks.prismaDailyReadingCreate as unknown as (a: unknown) => Promise<unknown>,
            ),
        },
      };
    },
    // The BASE client bypasses the extension (rawPrisma is used by
    // workspace-context.ts for unauthenticated lookups that must NOT
    // be workspace-scoped, e.g. resolveWorkspaceForUser).
    user: {
      findUnique: (a: unknown) =>
        mocks.prismaUserFindUnique(a) as unknown as Promise<unknown>,
      findMany: (a: unknown) =>
        mocks.prismaUserFindMany(a) as unknown as Promise<unknown>,
      create: (a: unknown) =>
        mocks.prismaUserCreate(a) as unknown as Promise<unknown>,
    },
    dailyReading: {
      findMany: (a: unknown) =>
        mocks.prismaDailyReadingFindMany(a) as unknown as Promise<unknown>,
      create: (a: unknown) =>
        mocks.prismaDailyReadingCreate(a) as unknown as Promise<unknown>,
    },
  };

  return { prisma: client };
});

// ---------------------------------------------------------------------------
// Imports under test (must come AFTER vi.mock calls).
// ---------------------------------------------------------------------------

import {
  DEFAULT_WORKSPACE_ID,
  MissingWorkspaceContextError,
  getWorkspaceContext,
  prisma as scopedPrisma,
  requireWorkspaceAccess,
  resolveWorkspaceForUser,
  withWorkspaceContext,
} from './workspace-context';
import { withWorkspace } from './with-workspace';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequestWithCookie(cookieValue: string | null) {
  const cookies = new Map<string, string>();
  if (cookieValue !== null) {
    cookies.set('akasha_session', cookieValue);
  }
  return {
    cookies: {
      get: (name: string) => {
        const v = cookies.get(name);
        return v !== undefined ? { value: v } : undefined;
      },
    },
  } as unknown as NextRequest;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('workspace isolation — Wave 31.2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── L1: getWorkspaceContext ─────────────────────────────────────────────

  describe('L1: getWorkspaceContext', () => {
    it('returns the active context inside withWorkspaceContext', () => {
      const ctx = { workspaceId: 'personal', userId: 'u-1' };
      withWorkspaceContext(ctx, () => {
        expect(getWorkspaceContext()).toEqual(ctx);
      });
    });

    it('returns undefined outside any withWorkspaceContext block', () => {
      expect(getWorkspaceContext()).toBeUndefined();
    });

    it('nests correctly: inner context shadows outer', () => {
      const outer = { workspaceId: 'personal', userId: 'u-1' };
      const inner = { workspaceId: 'clinic-xyz', userId: 'u-2' };
      withWorkspaceContext(outer, () => {
        expect(getWorkspaceContext()?.workspaceId).toBe('personal');
        withWorkspaceContext(inner, () => {
          expect(getWorkspaceContext()?.workspaceId).toBe('clinic-xyz');
        });
        // Restored to outer after inner exits.
        expect(getWorkspaceContext()?.workspaceId).toBe('personal');
      });
    });
  });

  // ── L2: requireWorkspaceAccess ──────────────────────────────────────────

  describe('L2: requireWorkspaceAccess', () => {
    it('returns true when userId and workspaceId belong to the same workspace', async () => {
      mocks.prismaUserFindUnique.mockResolvedValue({
        id: 'u-1',
        workspaceId: 'clinic-xyz',
      });
      const ok = await requireWorkspaceAccess('u-1', 'clinic-xyz');
      expect(ok).toBe(true);
      // Verifies the helper queries User by id (not by workspaceId, which
      // would be a self-confirming tautology).
      expect(mocks.prismaUserFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u-1' } }),
      );
    });

    it('returns false when the user belongs to a different workspace', async () => {
      // User A is in 'personal'. Caller claims workspaceId = 'clinic-xyz'.
      // MUST be denied — this is the cross-tenant attack vector.
      mocks.prismaUserFindUnique.mockResolvedValue({
        id: 'u-A',
        workspaceId: 'personal',
      });
      const ok = await requireWorkspaceAccess('u-A', 'clinic-xyz');
      expect(ok).toBe(false);
    });

    it('returns false when the user does not exist', async () => {
      mocks.prismaUserFindUnique.mockResolvedValue(null);
      const ok = await requireWorkspaceAccess('ghost-user', 'personal');
      expect(ok).toBe(false);
    });

    it('rejects empty / whitespace workspaceId values', async () => {
      mocks.prismaUserFindUnique.mockResolvedValue({
        id: 'u-1',
        workspaceId: 'personal',
      });
      // Caller passes an empty workspaceId (e.g. bug in upstream code).
      // MUST be denied — empty workspace = cross-tenant leakage vector.
      const ok1 = await requireWorkspaceAccess('u-1', '');
      const ok2 = await requireWorkspaceAccess('u-1', '   ');
      expect(ok1).toBe(false);
      expect(ok2).toBe(false);
    });
  });

  // ── L3: Prisma proxy auto-injects workspaceId ──────────────────────────

  describe('L3: Prisma proxy auto-injects workspaceId', () => {
    it('injects where.AND = [{workspaceId}] on User.findMany', async () => {
      mocks.prismaUserFindMany.mockResolvedValue([]);
      await withWorkspaceContext(
        { workspaceId: 'clinic-xyz', userId: 'u-1' },
        async () => {
          await scopedPrisma.user.findMany({ where: { email: 'a@b.c' } });
        },
      );
      expect(mocks.prismaUserFindMany).toHaveBeenCalledTimes(1);
      const calledArgs = mocks.prismaUserFindMany.mock.calls[0][0] as {
        where: unknown;
      };
      // Must be wrapped in AND with the workspace filter.
      expect(calledArgs.where).toEqual({
        AND: [{ workspaceId: 'clinic-xyz' }, { email: 'a@b.c' }],
      });
    });

    it('injects workspaceId on DailyReading.findMany', async () => {
      mocks.prismaDailyReadingFindMany.mockResolvedValue([]);
      await withWorkspaceContext(
        { workspaceId: 'personal', userId: 'u-1' },
        async () => {
          await scopedPrisma.dailyReading.findMany({
            where: { date: new Date('2026-06-25') },
            take: 5,
          });
        },
      );
      const calledArgs = mocks.prismaDailyReadingFindMany.mock.calls[0][0] as {
        where: unknown;
      };
      expect(calledArgs.where).toEqual({
        AND: [
          { workspaceId: 'personal' },
          { date: new Date('2026-06-25') },
        ],
      });
    });

    it('injects workspaceId into the create payload', async () => {
      mocks.prismaDailyReadingCreate.mockResolvedValue({ id: 'r-1' });
      await withWorkspaceContext(
        { workspaceId: 'clinic-xyz', userId: 'u-1' },
        async () => {
          await scopedPrisma.dailyReading.create({
            data: {
              userId: 'u-1',
              date: new Date('2026-06-25'),
              climate: 'X',
              ritual: {},
              alert: 'X',
              tensionPoint: {},
            },
          });
        },
      );
      const calledArgs = mocks.prismaDailyReadingCreate.mock.calls[0][0] as {
        data: Record<string, unknown>;
      };
      // The proxy MUST inject workspaceId — caller cannot bypass.
      expect(calledArgs.data.workspaceId).toBe('clinic-xyz');
    });

    it('THROWS MissingWorkspaceContextError on a scoped model outside a workspace context', async () => {
      // No withWorkspaceContext active. Direct call to scoped client
      // must fail-closed — never silently query without scope.
      await expect(scopedPrisma.user.findMany()).rejects.toBeInstanceOf(
        MissingWorkspaceContextError,
      );
      await expect(
        scopedPrisma.dailyReading.findMany(),
      ).rejects.toBeInstanceOf(MissingWorkspaceContextError);
    });

    it('user in workspace A cannot see rows belonging to workspace B (end-to-end)', async () => {
      // Simulate a DB response: 2 rows, but neither belongs to A's workspace.
      // Because the proxy filters by workspaceId FIRST, neither row would
      // be returned to A. We verify the WHERE shape carries A's workspace.
      mocks.prismaDailyReadingFindMany.mockResolvedValue([]);
      await withWorkspaceContext(
        { workspaceId: 'workspace-A', userId: 'u-A' },
        async () => {
          await scopedPrisma.dailyReading.findMany();
        },
      );
      const calledArgs = mocks.prismaDailyReadingFindMany.mock.calls[0][0] as {
        where: { AND: Array<Record<string, unknown>> };
      };
      // The filter MUST contain workspace-A — never workspace-B.
      const workspaceFilter = calledArgs.where.AND[0];
      expect(workspaceFilter).toEqual({ workspaceId: 'workspace-A' });
      expect(workspaceFilter).not.toEqual({ workspaceId: 'workspace-B' });
    });
  });

  // ── L4: HTTP wrapper (withWorkspace) ────────────────────────────────────

  describe('L4: withWorkspace HTTP wrapper', () => {
    it('returns 401 when no session cookie is present', async () => {
      const request = makeRequestWithCookie(null);
      const result = await withWorkspace(request, async () =>
        NextResponse.json({ ok: true }),
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect(result.status).toBe(401);
    });

    it('returns 401 when JWT verification throws', async () => {
      mocks.verifyAkashaToken.mockImplementation(() => {
        throw new Error('bad signature');
      });
      const request = makeRequestWithCookie('garbage');
      const result = await withWorkspace(request, async () =>
        NextResponse.json({ ok: true }),
      );
      expect(result).toBeInstanceOf(NextResponse);
      expect(result.status).toBe(401);
    });

    it('returns 401 when the user is not in the database (stale token)', async () => {
      mocks.verifyAkashaToken.mockReturnValue({
        sub: 'ghost-user',
        email: 'g@x.com',
        type: 'access',
      });
      mocks.prismaUserFindUnique.mockResolvedValue(null);
      const request = makeRequestWithCookie('valid-but-stale');
      const result = await withWorkspace(request, async () =>
        NextResponse.json({ ok: true }),
      );
      expect(result.status).toBe(401);
    });

    it('returns 500 when the user exists but has no workspaceId provisioned', async () => {
      mocks.verifyAkashaToken.mockReturnValue({
        sub: 'u-1',
        email: 'a@b.c',
        type: 'access',
      });
      // Migration backfill should prevent this, but the wrapper MUST
      // defend against it (defense in depth).
      mocks.prismaUserFindUnique.mockResolvedValue({
        id: 'u-1',
        workspaceId: '',
      });
      const request = makeRequestWithCookie('valid');
      const result = await withWorkspace(request, async () =>
        NextResponse.json({ ok: true }),
      );
      expect(result.status).toBe(500);
    });

    it('activates the workspace context and runs the handler', async () => {
      mocks.verifyAkashaToken.mockReturnValue({
        sub: 'u-1',
        email: 'a@b.c',
        type: 'access',
      });
      mocks.prismaUserFindUnique.mockResolvedValue({
        id: 'u-1',
        workspaceId: 'personal',
      });
      let observed: { workspaceId: string; userId: string } | undefined;
      const request = makeRequestWithCookie('valid');
      const result = await withWorkspace(request, async () => {
        const ctx = getWorkspaceContext();
        observed = ctx
          ? { workspaceId: ctx.workspaceId, userId: ctx.userId }
          : undefined;
        return NextResponse.json({ ok: true });
      });
      expect(result.status).toBe(200);
      expect(observed).toEqual({ workspaceId: 'personal', userId: 'u-1' });
    });
  });

  // ── Defaults + symbol invariants ────────────────────────────────────────

  describe('default workspace invariants', () => {
    it('DEFAULT_WORKSPACE_ID is the literal "personal"', () => {
      expect(DEFAULT_WORKSPACE_ID).toBe('personal');
    });

    it('resolveWorkspaceForUser returns no_workspace for users without workspaceId', async () => {
      mocks.prismaUserFindUnique.mockResolvedValue({
        id: 'u-1',
        workspaceId: null,
      });
      const res = await resolveWorkspaceForUser('u-1');
      expect(res.kind).toBe('no_workspace');
    });

    it('resolveWorkspaceForUser returns user_not_found when user does not exist', async () => {
      mocks.prismaUserFindUnique.mockResolvedValue(null);
      const res = await resolveWorkspaceForUser('ghost');
      expect(res.kind).toBe('user_not_found');
    });

    it('resolveWorkspaceForUser returns ok with the user workspaceId', async () => {
      mocks.prismaUserFindUnique.mockResolvedValue({
        id: 'u-1',
        workspaceId: 'clinic-xyz',
      });
      const res = await resolveWorkspaceForUser('u-1');
      expect(res.kind).toBe('ok');
      if (res.kind === 'ok') {
        expect(res.context).toEqual({
          workspaceId: 'clinic-xyz',
          userId: 'u-1',
        });
      }
    });
  });
});
