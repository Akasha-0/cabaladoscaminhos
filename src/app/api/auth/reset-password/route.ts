// ============================================================================
// /api/auth/reset-password — thin HTTP adapter
// ============================================================================

import { handleResetPassword } from '@/lib/auth-pages/api-handlers';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, code: 'UNKNOWN', error: 'JSON inválido' }, { status: 400 });
  }
  const result = await handleResetPassword(body);
  return Response.json(result.body, { status: result.status, headers: result.headers });
}
