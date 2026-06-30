// ============================================================================
// /api/auth/signup — thin HTTP adapter around handleSignup
// ============================================================================

import { handleSignup } from '@/lib/auth-pages/api-handlers';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, code: 'UNKNOWN', error: 'JSON inválido' }, { status: 400 });
  }
  const result = await handleSignup(body);
  return Response.json(result.body, { status: result.status, headers: result.headers });
}
