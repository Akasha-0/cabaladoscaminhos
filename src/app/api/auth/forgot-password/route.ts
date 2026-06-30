// ============================================================================
// /api/auth/forgot-password — thin HTTP adapter
// ============================================================================

import { handleForgotPassword } from '@/lib/auth-pages/api-handlers';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, code: 'UNKNOWN', error: 'JSON inválido' }, { status: 400 });
  }
  const result = await handleForgotPassword(body);
  return Response.json(result.body, { status: result.status, headers: result.headers });
}
