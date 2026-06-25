/**
 * with-workspace.ts — HTTP middleware that activates WorkspaceContext
 *
 * Wraps a Next.js route handler so the request enters with a verified
 * workspace context active in AsyncLocalStorage. Use this at the top of
 * any route that touches user-scoped data (User, DailyReading).
 *
 * Usage:
 *   import { withWorkspace } from '@/lib/application/auth/with-workspace';
 *
 *   export async function GET(request: NextRequest) {
 *     return withWorkspace(request, async () => {
 *       const ctx = getWorkspaceContext();
 *       // ... use scoped prisma here
 *       return NextResponse.json({ workspace: ctx.workspaceId });
 *     });
 *   }
 *
 * Flow:
 *   1. Extract session cookie (`akasha_session`).
 *   2. Verify JWT -> userId (sub claim).
 *   3. Resolve workspaceId from DB (Phase 2: JWT claim).
 *   4. Activate WorkspaceContext.
 *   5. Run handler.
 *   6. Errors -> 401 (no session / stale user), 500 (no workspace).
 *
 * Composition:
 *   withWorkspace can wrap a handler that internally calls
 *   withCaminhante (or vice-versa). The two ALSs are independent;
 *   inner scope shadows outer. See tenant-context.ts.
 *
 * Why a wrapper (not a Next.js middleware.ts)?
 *   Next.js middleware runs on the Edge runtime, where Prisma + Node
 *   `async_hooks` don't work. We need both. This wrapper runs in the
 *   Node runtime, inside the route handler. Same trade-off as
 *   tenant-context.ts.
 */

import { NextRequest, NextResponse } from 'next/server';

import {
  AKASHA_TOKEN_COOKIE,
  verifyAkashaToken,
} from './akasha-jwt';
import {
  type WorkspaceContext,
  resolveWorkspaceForUser,
  withWorkspaceContext,
} from './workspace-context';

// ============================================================================
// Constants
// ============================================================================

const UNAUTHORIZED_NO_SESSION = NextResponse.json(
  { error: 'unauthorized' },
  { status: 401, headers: { 'Cache-Control': 'no-store' } },
);
const UNAUTHORIZED_TOKEN_INVALID = NextResponse.json(
  { error: 'token_invalid' },
  { status: 401, headers: { 'Cache-Control': 'no-store' } },
);
const INTERNAL_NO_WORKSPACE = NextResponse.json(
  { error: 'workspace_not_provisioned' },
  { status: 500, headers: { 'Cache-Control': 'no-store' } },
);

// ============================================================================
// Internal helpers
// ============================================================================

/**
 * Extract the akasha_session cookie value. Returns null if missing.
 * Implementation detail: NextRequest.cookies.get(name) returns
 * { value: string } | undefined.
 */
function readSessionCookie(request: NextRequest): string | null {
  const raw = request.cookies.get(AKASHA_TOKEN_COOKIE);
  if (!raw) return null;
  const value = raw.value;
  return value && value.length > 0 ? value : null;
}

// ============================================================================
// Public wrapper
// ============================================================================

/**
 * Higher-order handler wrapper. Returns 401 if the request is not
 * authenticated; 500 if the user has no workspace provisioned; the
 * handler's response otherwise.
 *
 * The handler receives no arguments -- it should call
 * `getWorkspaceContext()` (from workspace-context.ts) to read the
 * active scope. This keeps the call signature identical to the
 * underlying Node handler shape, avoiding accidental prop drilling.
 */
export function withWorkspace(
  request: NextRequest,
  handler: () => Promise<NextResponse> | NextResponse,
): Promise<NextResponse> {
  return runWithWorkspace(request, handler);
}

/**
 * Lower-level runner. Async so the call chain reads naturally when
 * called from `withWorkspace` or from a custom wrapper (e.g. one
 * that also activates zelador context).
 */
export async function runWithWorkspace(
  request: NextRequest,
  handler: () => Promise<NextResponse> | NextResponse,
): Promise<NextResponse> {
  const token = readSessionCookie(request);
  if (!token) return UNAUTHORIZED_NO_SESSION;

  let payload: { sub?: string; email?: string } | null = null;
  try {
    payload = verifyAkashaToken(token);
  } catch {
    return UNAUTHORIZED_TOKEN_INVALID;
  }
  if (!payload || !payload.sub) return UNAUTHORIZED_NO_SESSION;

  const resolution = await resolveWorkspaceForUser(payload.sub);
  if (resolution.kind === 'user_not_found') {
    return UNAUTHORIZED_NO_SESSION;
  }
  if (resolution.kind === 'no_workspace') {
    return INTERNAL_NO_WORKSPACE;
  }
  const ctx: WorkspaceContext = resolution.context;

  return withWorkspaceContext(ctx, async () => handler());
}

// ============================================================================
// Type exports
// ============================================================================

export type { WorkspaceContext };
