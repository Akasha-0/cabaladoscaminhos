/**
 * Supabase Middleware Client
 * ----------------------------------------------------------------------------
 * Use esta factory no middleware do Next.js (root `middleware.ts`) para
 * refresh de sessão + guard de rotas protegidas.
 *
 * O middleware do Next roda no Edge Runtime — não use `prisma` aqui.
 * Apenas verificação de cookie de sessão via Supabase.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Rotas que exigem user autenticado. Os route groups do Next (parênteses)
// não aparecem na URL — `(community)/feed/page.tsx` resolve para `/feed`.
export const PROTECTED_PREFIXES = [
  '/feed',
  '/explore',
  '/library',
  '/notifications',
  '/post',
  '/u',
  '/groups',
  '/onboarding',
  '/settings',
  '/me',
];
export const AUTH_PREFIXES = [
  '/login',
  '/signup',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export interface MiddlewareAuthResult {
  response: NextResponse;
  user: { id: string; email: string | null } | null;
}

/**
 * Refresh da sessão Supabase e guard de rotas:
 *   - Caminhos em PROTECTED_PREFIXES exigem user → redireciona para /login
 *   - Caminhos em AUTH_PREFIXES com user logado → redireciona para /feed
 *   - Demais caminhos passam com cookies atualizados
 *
 * Se as variáveis Supabase não estiverem configuradas, libera tudo (modo
 * sandbox).
 */
export async function updateSession(request: NextRequest): Promise<MiddlewareAuthResult> {
  const pathname = request.nextUrl.pathname;

  // Quando Supabase não está configurado, deixa passar — UX em sandbox
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });

  if (!url || !anonKey) {
    // Bloqueia rotas protegidas mesmo sem Supabase (não há como saber se user existe)
    if (isProtectedPath(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return {
        response: NextResponse.redirect(redirectUrl),
        user: null,
      };
    }
    return { response, user: null };
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANTE: getUser() força refresh do token se necessário.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ---- Guard de rotas protegidas ----
  if (isProtectedPath(pathname) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return {
      response: NextResponse.redirect(redirectUrl),
      user: null,
    };
  }

  // ---- Logado tentando entrar em /login ou /register → manda pro feed ----
  if (isAuthPath(pathname) && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/feed';
    redirectUrl.searchParams.delete('redirectTo');
    return {
      response: NextResponse.redirect(redirectUrl),
      user: user
        ? { id: user.id, email: user.email ?? null }
        : null,
    };
  }

  return {
    response,
    user: user ? { id: user.id, email: user.email ?? null } : null,
  };
}