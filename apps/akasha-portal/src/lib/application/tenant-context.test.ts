/**
 * Multi-tenant isolation helper — regression tests.
 *
 * Covers the 6 invariants from `D-XXX-schema-multitenant-consulente.md`:
 *
 *  1. withCaminhanteContext sets context correctly
 *  2. getCaminhanteContext returns undefined outside a wrapper
 *  3. Mock prisma call within context includes zeladorId filter
 *  4. Mock prisma call without context THROWS the expected error
 *  5. GrimorioPessoal does NOT require caminhadaId in context (D-XXX.4)
 *  6. Nested withCaminhanteContext works (inner wins)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// We mock `@/lib/infrastructure/prisma` BEFORE importing the helper so
// the module-level `rawPrisma.$extends({...})` call in tenant-context.ts
// sees our stub instead of trying to instantiate a real PrismaClient
// (which would require DATABASE_URL + a real connection).
const mockQueryFn = vi.fn(async (args: unknown) => args);

const mockExtendedPrisma = {
  sessao: { findMany: mockQueryFn, findFirst: mockQueryFn },
  sessaoChunk: { findMany: mockQueryFn, findFirst: mockQueryFn },
  grimorioPessoal: { findMany: mockQueryFn, findFirst: mockQueryFn },
  notasConsulente: { findMany: mockQueryFn, findFirst: mockQueryFn },
  mapaCalculo: { findMany: mockQueryFn, findFirst: mockQueryFn },
  caminhante: { findMany: mockQueryFn, findFirst: mockQueryFn },
  caminhada: { findMany: mockQueryFn, findFirst: mockQueryFn },
  // Non-scoped model: should pass through unchanged.
  user: { findMany: mockQueryFn, findFirst: mockQueryFn },
  dailyReading: { findMany: mockQueryFn, findFirst: mockQueryFn },
};

const mockRawPrisma = {
  $extends: vi.fn(() => mockExtendedPrisma),
};

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: mockRawPrisma,
}));

// Static import. vi.mock above ensures the dependency is the stub.
import {
  withCaminhanteContext,
  getCaminhanteContext,
  prisma,
} from './tenant-context';

async function loadHelper() {
  // The helper is already imported statically; this no-op keeps the
  // API uniform with tests that need re-imports.
  return {
    withCaminhanteContext,
    getCaminhanteContext,
    prisma,
  };
}

describe('tenant-context — multi-tenant isolation (D-XXX, ADR 0004)', () => {
  beforeEach(() => {
    mockQueryFn.mockClear();
    mockRawPrisma.$extends.mockClear();
    mockQueryFn.mockImplementation(async (args: unknown) => args);
  });

  afterEach(() => {
    // Clear any active AsyncLocalStorage by exiting the wrapper.
    // (The test framework's afterEach already runs outside any
    // withCaminhanteContext, so this is a no-op in practice — kept
    // for explicit intent.)
  });

  // ── Test 1: withCaminhanteContext sets context correctly ────────────────
  it('withCaminhanteContext: sets context visible to getCaminhanteContext', async () => {
    const { withCaminhanteContext, getCaminhanteContext } = await loadHelper();

    const ctx = { zeladorId: 'zelador-1', caminhadaId: 'caminhada-42' };
    const observed = withCaminhanteContext(ctx, () => getCaminhanteContext());

    expect(observed).toEqual(ctx);
    expect(observed?.zeladorId).toBe('zelador-1');
    expect(observed?.caminhadaId).toBe('caminhada-42');
  });

  // ── Test 2: getCaminhanteContext returns undefined outside wrapper ─────
  it('getCaminhanteContext: returns undefined when no wrapper is active', async () => {
    const { getCaminhanteContext } = await loadHelper();

    expect(getCaminhanteContext()).toBeUndefined();
  });

  // ── Test 3: Mock prisma call within context includes zeladorId filter ──
  it('prisma.<scopedModel>.findMany: within context injects zeladorId + caminhadaId into where', async () => {
    const { withCaminhanteContext, prisma } = await loadHelper();

    const ctx = { zeladorId: 'zelador-1', caminhadaId: 'caminhada-42' };
    const result = await withCaminhanteContext(ctx, () =>
      prisma.sessao.findMany({ where: { status: 'aberta' } } as never),
    );

    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    // The first call's first arg is the merged `args` we pass to `query()`.
    const passedArgs = mockQueryFn.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };
    expect(passedArgs.where.zeladorId).toBe('zelador-1');
    expect(passedArgs.where.caminhadaId).toBe('caminhada-42');
    expect(passedArgs.where.status).toBe('aberta');
    // Sanity: the result of the mock is whatever we passed in.
    expect(result).toEqual(passedArgs);
  });

  // ── Test 4: Mock prisma call without context THROWS ─────────────────────
  it('prisma.<scopedModel>.findMany: outside context throws [Tenant] Missing CaminhanteContext', async () => {
    const { prisma } = await loadHelper();

    expect(() => prisma.sessao.findMany({} as never)).toThrow(
      /\[Tenant\] Missing CaminhanteContext for scoped model Sessao/,
    );
    // Ensure the underlying query function was never called.
    expect(mockQueryFn).not.toHaveBeenCalled();
  });

  // ── Test 5: GrimorioPessoal does NOT require caminhadaId in context ─────
  it('prisma.grimorioPessoal: injects ONLY zeladorId, no caminhadaId (D-XXX.4)', async () => {
    const { withCaminhanteContext, prisma } = await loadHelper();

    const ctx = { zeladorId: 'zelador-1', caminhadaId: 'caminhada-42' };
    await withCaminhanteContext(ctx, () =>
      prisma.grimorioPessoal.findMany({ where: {} } as never),
    );

    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    const passedArgs = mockQueryFn.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };
    expect(passedArgs.where.zeladorId).toBe('zelador-1');
    expect(passedArgs.where).not.toHaveProperty('caminhadaId');
  });

  // ── Test 6: Nested withCaminhanteContext works (inner wins) ─────────────
  it('nested withCaminhanteContext: innermost wrapper wins (isolated ALS context)', async () => {
    const { withCaminhanteContext, getCaminhanteContext, prisma } = await loadHelper();

    const outer = { zeladorId: 'zelador-OUTER', caminhadaId: 'caminhada-OUTER' };
    const inner = { zeladorId: 'zelador-INNER', caminhadaId: 'caminhada-INNER' };

    let outerSeenInsideInner: ReturnType<typeof getCaminhanteContext> = undefined;
    let innerSeenInsideInner: ReturnType<typeof getCaminhanteContext> = undefined;
    let outerSeenAfterInner: ReturnType<typeof getCaminhanteContext> = undefined;

    await withCaminhanteContext(outer, async () => {
      // Inside the outer wrapper, only the outer context is visible.
      outerSeenInsideInner = getCaminhanteContext();
      // Open the inner wrapper.
      await withCaminhanteContext(inner, async () => {
        innerSeenInsideInner = getCaminhanteContext();
        // Run a scoped query to assert the inner context is used.
        await prisma.sessao.findMany({} as never);
      });
      // After the inner wrapper closes, outer must be visible again.
      outerSeenAfterInner = getCaminhanteContext();
    });

    // Outer is visible before inner opens.
    expect(outerSeenInsideInner).toEqual(outer);
    // Inner is visible inside the nested wrapper.
    expect(innerSeenInsideInner).toEqual(inner);
    // Outer is restored after the inner wrapper closes.
    expect(outerSeenAfterInner).toEqual(outer);

    // The prisma call inside the inner wrapper must have used INNER ids.
    const passedArgs = mockQueryFn.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };
    expect(passedArgs.where.zeladorId).toBe('zelador-INNER');
    expect(passedArgs.where.caminhadaId).toBe('caminhada-INNER');
  });

  // ── Bonus: non-scoped models are NOT touched by the extension ──────────
  it('non-scoped models (e.g. user): pass through with no where injection', async () => {
    const { withCaminhanteContext, prisma } = await loadHelper();

    const ctx = { zeladorId: 'zelador-1', caminhadaId: 'caminhada-42' };
    await withCaminhanteContext(ctx, () =>
      prisma.user.findMany({ where: { email: 'foo@bar' } } as never),
    );

    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    const passedArgs = mockQueryFn.mock.calls[0][0] as {
      where: Record<string, unknown>;
    };
    expect(passedArgs.where).toEqual({ email: 'foo@bar' });
    // No accidental injection on non-scoped models.
    expect(passedArgs.where).not.toHaveProperty('zeladorId');
    expect(passedArgs.where).not.toHaveProperty('caminhadaId');
  });
});
