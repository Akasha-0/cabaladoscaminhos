/**
 * Cron endpoint for token cleanup (Doc 22 AD-22.10)
 *
 * Deletes expired OperatorSession and RefreshToken records per retention policy.
 * Runs daily via Vercel Cron.
 *
 * Retention: 30 days for revoked tokens
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    // ── OperatorSession cleanup ───────────────────────────────────────────────
    // Delete sessions where:
    //   - expiresAt is in the past, OR
    //   - refreshExpiresAt is in the past, OR
    //   - revokedAt is set AND older than 30 days
    const sessionResult = await prisma.operatorSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { refreshExpiresAt: { lt: now } },
          {
            AND: [{ revokedAt: { not: null } }, { revokedAt: { lt: thirtyDaysAgo } }],
          },
        ],
      },
    });

    // ── RefreshToken cleanup ───────────────────────────────────────────────────
    // Delete tokens where:
    //   - expiresAt is in the past, OR
    //   - revokedAt is set AND older than 30 days
    const tokenResult = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          {
            AND: [{ revokedAt: { not: null } }, { revokedAt: { lt: thirtyDaysAgo } }],
          },
        ],
      },
    });

    console.log(`[cron/cleanup-tokens] Cleaned up: ${sessionResult.count} sessions, ${tokenResult.count} refresh tokens`);

    return NextResponse.json({
      success: true,
      cleaned: {
        sessions: sessionResult.count,
        refreshTokens: tokenResult.count,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[cron/cleanup-tokens] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
