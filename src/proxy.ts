import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-jwt';

// ============================================
// Configurações de Rota
// ============================================

// Rotas que requerem autenticação JWT (API)
const PROTECTED_API_PATHS = [
  '/api/chat',
  '/api/credits',
  '/api/payments',
  '/api/webhooks',
  '/api/insights',
];

// Rotas públicas da API (não requerem JWT)
const PUBLIC_API_PATHS = [
  '/api/auth',
  '/api/astrologia',
  '/api/numerologia',
  '/api/odus',
  '/api/ciclos',
];

// Rotas públicas do frontend
const PUBLIC_PAGE_ROUTES = ['/', '/login', '/registro'];

function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
}

// ============================================
// Middleware Principal
// ============================================

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // ROTEAMENTO: API vs Pages
  // ========================================

  // ==============================
  // API Routes (JWT Auth)
  // ==============================
  if (pathname.startsWith('/api/')) {
    // Rotas públicas da API não precisam de auth
    if (isPublicApiPath(pathname)) {
      return NextResponse.next();
    }

    // Rotas não protegidas não precisam de auth
    if (!isProtectedApiPath(pathname)) {
      return NextResponse.next();
    }

    // Extrair e verificar JWT do cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const token = cookies['auth_token'];

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Adicionar info do usuário nos headers para uso downstream
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // ==============================
  // Page Routes (Supabase Auth)
  // ==============================
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirecionar usuários não autenticados
  if (!user && !PUBLIC_PAGE_ROUTES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirecionar usuários autenticados longe das páginas de auth
  if (user && (pathname === '/login' || pathname === '/registro')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};