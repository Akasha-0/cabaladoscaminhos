// ============================================================================
// /api/auth/verify-email — thin HTTP adapter
// ============================================================================

import { handleVerifyEmail, handleResendVerification } from '@/lib/auth-pages/api-handlers';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, code: 'UNKNOWN', error: 'JSON inválido' }, { status: 400 });
  }
  const result = await handleVerifyEmail(body);
  return Response.json(result.body, { status: result.status, headers: result.headers });
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, code: 'UNKNOWN', error: 'JSON inválido' }, { status: 400 });
  }
  const result = await handleResendVerification(body);
  return Response.json(result.body, { status: result.status, headers: result.headers });
}
