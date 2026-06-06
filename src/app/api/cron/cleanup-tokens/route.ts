/**
 * Cron endpoint for token cleanup (Doc 22 AD-22.10)
 *
 * Deletes expired OperatorSession records per retention policy.
 * Refresh tokens are stored as OperatorSession with `type: REFRESH`
 * (Fase 15), so this single query covers both ACCESS and REFRESH.
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

    // ── OperatorSession cleanup (covers ACCESS + REFRESH tokens) ─────────────
    // Delete sessions where:
    //   - expiresAt is in the past (ACCESS token expired), OR
    //   - refreshExpiresAt is in the past (REFRESH token expired), OR
    //   - revokedAt is set AND older than 30 days (audit retention)
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

    console.log(`[cron/cleanup-tokens] Cleaned up: ${sessionResult.count} sessions`);

    return NextResponse.json({
      success: true,
      cleaned: {
        sessions: sessionResult.count,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[cron/cleanup-tokens] Error:', error);
    return NextResponse.json({ success: false, error: 'Cleanup failed' }, { status: 500 });
  }
}
