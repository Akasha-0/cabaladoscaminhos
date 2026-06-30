// ============================================================================
// GET /api/beta/track/open/[tokenHash] — Tracking pixel 1x1 (Wave 32)
// ============================================================================// Retorna imagem GIF transparente 1x1 e marca invite como OPENED.
// Idempotente — só avança se status = SENT.
// tokenHash aqui é o hash HMAC (NUNCA o plaintext); o caller (email send)
// envia o hash já calculado.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { markInviteOpened } from '@/lib/beta/invites';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GIF 1x1 transparente (43 bytes) — base64 → Buffer
const PIXEL_BASE64 =
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

function pixelResponse(): Response {
  const buf = Buffer.from(PIXEL_BASE64, 'base64');
  return new Response(buf, {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(buf.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { tokenHash: string } }
) {
  // Validação defensiva: hash deve ser hex 64 chars
  if (!/^[a-f0-9]{64}$/.test(params.tokenHash)) {
    // Mesmo em erro, devolvemos o pixel (não vaza estado)
    return pixelResponse();
  }
  try {
    await markInviteOpened(params.tokenHash);
  } catch (err) {
    console.error('[beta][track/open] failed', {
      hashPrefix: params.tokenHash.slice(0, 8),
      error: err instanceof Error ? err.message : 'unknown',
    });
  }
  return pixelResponse();
}