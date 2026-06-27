import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Logout via API route.
 *
 * ⚠️ SECURITY (wave 10, F2): A versão antiga deletava um cookie `cabala_auth`
 * que **nunca era definido** em lugar nenhum — Supabase Auth usa cookies
 * `sb-<project-ref>-auth-token`. Resultado: o usuário "deslogava" mas a
 * sessão Supabase permanecia válida (JWT continuava válido até expirar).
 *
 * Agora chamamos `supabase.auth.signOut()` server-side, que invalida a
 * sessão no Supabase + limpa todos os cookies `sb-*-auth-token`.
 *
 * Recomendação operacional: preferir a server action `logoutAction` em
 * `src/app/actions/auth.ts` (mesmo comportamento). Esta rota API existe
 * para compatibilidade com fetchers que não conseguem invocar server
 * actions (ex.: testes E2E que fazem POST direto).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Se Supabase não está configurado (sandbox dev), redireciona sem erro.
    if (!supabase) {
      return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      // Não vaza detalhes do erro (F14 — error messages sem reconnaissance).
      // Log detalhado fica server-side; user vê redirect neutro.
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('[auth/logout] signOut error:', error);
      }
      return NextResponse.redirect(new URL('/login?error=logout', request.url), {
        status: 303,
      });
    }

    // signOut() já limpou os cookies sb-*-auth-token via setAll().
    // Redirect para /login com 303 See Other (compatível com POST-redirect).
    return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  } catch (err) {
    // Fail-closed: qualquer erro não-bloqueante → redirect neutro.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[auth/logout] unexpected error:', err);
    }
    return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  }
}
