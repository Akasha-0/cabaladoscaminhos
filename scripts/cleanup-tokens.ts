/**
 * Token cleanup script (Doc 22 AD-22.10 cron job)
 *
 * Deletes expired OperatorSession and RefreshToken records per retention policy.
 * Run via cron: npx tsx scripts/cleanup-tokens.ts
 *
 * Usage:
 *   npx tsx scripts/cleanup-tokens.ts        # live run
 *   npx tsx scripts/cleanup-tokens.ts --dry-run  # preview only
 */

import { prisma } from '@/lib/prisma';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const now = new Date();

  if (dryRun) {
    console.log('[DRY RUN] Preview of token cleanup — no records will be deleted\n');
  }

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

  if (dryRun) {
    console.log(`[DRY RUN] Would delete: ${sessionResult.count} sessions, ${tokenResult.count} refresh tokens`);
  } else {
    console.log(`Cleaned up: ${sessionResult.count} sessions, ${tokenResult.count} refresh tokens`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
