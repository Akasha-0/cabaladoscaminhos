// ============================================================================
// PUSH UNSUBSCRIBE — moved
// ============================================================================
// A partir do Wave 21 (2026-06-28), o unsubscribe vive em DELETE
// /api/push/subscribe (mesmo path, métodos diferentes). Esta rota existe
// apenas para legados do client antigo que possam chamar — responde 410
// Gone com header Location apontando para o endpoint correto.
//
// Wave 25 fix: cada método agora é envolvido por try/catch canônico
// (defensivo — não há lógica que falhe, mas mantém consistência com o
// resto das routes e protege contra erros do runtime do Next).
// ============================================================================

import { NextResponse } from 'next/server';
import { handleError } from '@/lib/error-handling';

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

export async function POST() {
  try {
    return moved();
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE() {
  try {
    return moved();
  } catch (err) {
    return handleError(err);
  }
}

export async function GET() {
  try {
    return moved();
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT() {
  try {
    return moved();
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH() {
  try {
    return moved();
  } catch (err) {
    return handleError(err);
  }
}