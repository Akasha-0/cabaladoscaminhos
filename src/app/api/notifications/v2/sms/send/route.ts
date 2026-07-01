// ============================================================================
// API /api/notifications/v2/sms/send — SMS stub (W37+ Twilio integration)
// ============================================================================
// POST — emite SMS para números críticos (pagamento, sessão, evento)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireViewer } from '@/lib/community/auth';
import { fail, handleError, ok } from '@/lib/community/api';
import { ALL_CATEGORIES, DEFAULT_QUIET_HOURS } from '@/lib/notifications/v2';

export const dynamic = 'force-dynamic';

interface SendBody {
  to: string;
  body: string;
  category: typeof ALL_CATEGORIES[number];
}

const VALID_CATEGORIES = new Set<typeof ALL_CATEGORIES[number]>(ALL_CATEGORIES);

export async function POST(req: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(403, 'FORBIDDEN', 'SMS requer permissão admin (W37+)');
    }

    let body: SendBody;
    try {
      body = (await req.json()) as SendBody;
    } catch {
      return fail(400, 'INVALID_JSON', 'Body inválido');
    }

    if (!body.to || !body.body) {
      return fail(400, 'MISSING_FIELDS', 'to e body obrigatórios');
    }
    if (!VALID_CATEGORIES.has(body.category)) {
      return fail(400, 'INVALID_CATEGORY', 'categoria inválida');
    }
    if (!/^\+\d{10,15}$/.test(body.to)) {
      return fail(400, 'INVALID_PHONE', 'número deve estar em formato E.164 (+55...)');
    }

    // Stub: integração real com Twilio fica para W37+
    return ok({
      userId: viewer.id,
      status: 'queued-stub',
      twilioSid: null,
      body: body.body,
      to: body.to,
      category: body.category,
      costCents: 1,
      sentAt: new Date().toISOString(),
    });
  } catch (err) {
    return handleError(err);
  }
}
