// ============================================================================
// API /api/notifications/v2/health — health check do pipeline v2
// ============================================================================
// GET — retorna status de cada subsistema (matrix, context, dispatcher,
//        templates, digests, push setup, SSE).
// ============================================================================

import { NextResponse } from 'next/server';
import { notificationsV2SelfCheck } from '@/lib/notifications/v2';

export const dynamic = 'force-dynamic';

export async function GET() {
  const check = notificationsV2SelfCheck();
  return NextResponse.json(check, {
    status: check.ok ? 200 : 503,
    headers: { 'cache-control': 'no-store' },
  });
}
