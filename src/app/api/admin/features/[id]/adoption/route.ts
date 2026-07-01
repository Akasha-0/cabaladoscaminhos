// ============================================================================
// GET /api/admin/features/[id]/adoption — Feature adoption stats (Wave 38)
// ============================================================================
// Returns: DAU/MAU per feature, time-to-first-use, retention, power users,
// tradition breakdown, mobile vs desktop.
//
// Auth: admin only.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode, handleError } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FEATURES = [
  'feed',
  'akasha',
  'library',
  'events',
  'mentorship',
  'marketplace',
  'groups',
  'oraculo',
  'notifications',
] as const;

type FeatureId = (typeof FEATURES)[number];

export interface FeatureAdoption {
  featureId: FeatureId;
  dau: number;
  mau: number;
  dauMauRatio: number;
  /** Minutos desde signup até primeiro uso (mediano). */
  timeToFirstUseMin: number;
  /** D7 retention dos adopters (fraction 0..1). */
  retentionD7: number;
  powerUserCount: number;
  traditionBreakdown: Array<{ tradition: string; users: number; percent: number }>;
  platformBreakdown: { mobile: number; desktop: number };
  adoptionTrend: Array<{ week: string; newUsers: number }>;
}

function loadDemoFeatureAdoption(featureId: FeatureId): FeatureAdoption {
  // Seed by feature for determinism
  const seed = featureId
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = mulberry32(seed);

  const dau = Math.floor(rng() * 800) + 100;
  const mau = dau + Math.floor(rng() * 1500) + 200;

  const TRADITIONS = ['umbanda', 'candomble', 'espiritismo', 'budismo', 'catolicismo', 'umbanda_omeg'];
  const traditionBreakdown = TRADITIONS.slice(0, 7).map((t) => {
    const users = Math.floor(rng() * 200);
    return { tradition: t, users, percent: 0 };
  });
  const totalTrad = traditionBreakdown.reduce((a, b) => a + b.users, 0) || 1;
  for (const t of traditionBreakdown) t.percent = Math.round((t.users / totalTrad) * 100);

  return {
    featureId,
    dau,
    mau,
    dauMauRatio: Number((dau / mau).toFixed(3)),
    timeToFirstUseMin: Math.floor(rng() * 600) + 5,
    retentionD7: Number((0.35 + rng() * 0.45).toFixed(3)),
    powerUserCount: Math.floor(rng() * 80) + 10,
    traditionBreakdown,
    platformBreakdown: {
      mobile: Math.floor(mau * (0.55 + rng() * 0.15)),
      desktop: 0, // computed below
    },
    adoptionTrend: Array.from({ length: 8 }, (_, i) => ({
      week: isoWeekMinus(7 - i),
      newUsers: Math.floor(rng() * 100) + 10,
    })),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(403, ErrorCode.FORBIDDEN, `Admin required (${session.reason})`);
    }

    const { id: rawId } = await params;
    const featureId = rawId.toLowerCase() as FeatureId;
    if (!FEATURES.includes(featureId)) {
      return fail(
        400,
        ErrorCode.BAD_REQUEST,
        `Feature inválida: ${rawId}. Válidas: ${FEATURES.join(', ')}`
      );
    }

    const adoption = loadDemoFeatureAdoption(featureId);
    adoption.platformBreakdown.desktop =
      adoption.mau - adoption.platformBreakdown.mobile;

    return ok(
      adoption,
      {
        meta: { featureId },
        cache: { sMaxage: 120, staleWhileRevalidate: 600 },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoWeekMinus(weeksAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - weeksAgo * 7);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}