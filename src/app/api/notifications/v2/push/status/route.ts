// ============================================================================
// API /api/notifications/v2/push/status — status de push + VAPID setup
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireViewer } from '@/lib/community/auth';
import { fail, handleError, ok } from '@/lib/community/api';
import { getPushSetupStatus, describeUnsubscribeFlow } from '@/lib/notifications/v2';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, 'UNAUTHORIZED', 'Não autenticado');
    }

    const status = getPushSetupStatus();
    const unsub = await describeUnsubscribeFlow();

    return ok({
      userId: viewer.id,
      push: status,
      unsubscribeFlow: unsub,
    });
  } catch (err) {
    return handleError(err);
  }
}
