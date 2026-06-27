import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Debug endpoint — expõe estado da sessão Supabase + cookies.
 *
 * ⚠️ SECURITY (wave 10, F11): Rota originalmente exposta publicamente em
 * produção. Útil para dev mas facilita reconnaissance (lista de cookies,
 * presença de sessão, email do user se logado).
 *
 * Agora retorna 404 em qualquer ambiente não-dev. Não basta checar
 * `NODE_ENV !== 'production'` porque Vercel em preview deployments também
 * deveria estar bloqueado — verificamos explicitamente `development`.
 */
function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export async function GET() {
  if (!isDevEnvironment()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({
        configured: false,
        hasSession: false,
        userEmail: null,
      });
    }

    const { data: { session } } = await supabase.auth.getSession();

    return NextResponse.json({
      configured: true,
      hasSession: !!session,
      userEmail: session?.user?.email || null,
      userId: session?.user?.id || null,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Debug /auth/status]', err);
    return NextResponse.json({ error: 'debug_error' }, { status: 500 });
  }
}
