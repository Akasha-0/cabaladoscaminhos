// ============================================================================
// PUSH UNSUBSCRIBE — moved
// ============================================================================
// A partir do Wave 21 (2026-06-28), o unsubscribe vive em DELETE
// /api/push/subscribe (mesmo path, métodos diferentes). Esta rota existe
// apenas para legados do client antigo que possam chamar — responde 308
// Permanent Redirect.
// ============================================================================

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function moved() {
  return NextResponse.json(
    {
      error: {
        code: 4308,
        message:
          'Endpoint movido. Use DELETE /api/push/subscribe com body { endpoint }.',
      },
      meta: { timestamp: new Date().toISOString() },
    },
    {
      status: 410, // Gone
      headers: {
        Location: '/api/push/subscribe',
      },
    }
  );
}

export const POST = moved;
export const DELETE = moved;
export const GET = moved;
export const PUT = moved;
export const PATCH = moved;