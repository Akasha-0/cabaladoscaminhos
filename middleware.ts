import { NextResponse, type NextRequest } from 'next/server';
import { extractIdentifier } from '@/middleware/rateLimit';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateRequestId } from '@/lib/logging';
import { updateSession } from '@/lib/supabase/middleware';

// ============================================
// Rate Limiting Configuration
// ============================================

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,    // 100 requests per minute
};

// ============================================
// CORS Configuration
// ============================================

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ============================================
// Security Headers
// ============================================

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

/**
 * Middleware raiz — combina:
 *  1. Rate limit (rotas /api/*)
 *  2. CORS preflight
 *  3. Auth Supabase (rotas protegidas — ver src/lib/supabase/middleware.ts)
 *  4. Security headers em todas as respostas
 *
 * O guard de auth acontece em `updateSession`. Rotas que exigem login
 * redirecionam para `/login?redirectTo=<original>`. Rotas `/login`,
 * `/register`, `/forgot-password` redirecionam para `/feed` se já
 * autenticado. Demais caminhos passam.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Security headers — aplicados em toda resposta
  const requestId = generateRequestId();
  const baseResponse = NextResponse.next({ request });
  baseResponse.headers.set('X-Request-Id', requestId);
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    baseResponse.headers.set(key, value);
  });

  // 2. Skip rate limiting e auth para paths excluídos
  const EXCLUDED_PATHS = ['/_next', '/favicon.ico', '/api/health'];
  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return baseResponse;
  }

  // 3. CORS preflight em /api
  if (pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204, headers: baseResponse.headers });
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      res.headers.set(key, value);
    });
    return res;
  }

  // 4. Rate limit em /api
  if (pathname.startsWith('/api/') && pathname !== '/api/health') {
    const identifier = extractIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIG);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const apiResponse = NextResponse.next({ request });
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      apiResponse.headers.set(key, value);
    });
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      apiResponse.headers.set(key, value);
    });
    return apiResponse;
  }

  // 5. Auth guard via Supabase — proteção de (community)/* e outras rotas
  //    Ver src/lib/supabase/middleware.ts para lista de PROTECTED_PREFIXES.
  try {
    const { response: authResponse, user } = await updateSession(request);

    // Propaga os cookies/headers da auth response pra response final
    baseResponse.headers.set('X-Auth-User', user?.id ?? 'anonymous');

    // Se auth retornou redirect (rota protegida sem user ou /login com user)
    if (authResponse.status >= 300 && authResponse.status < 400) {
      // Garante que security headers vão no redirect também
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        authResponse.headers.set(key, value);
      });
      return authResponse;
    }

    // Caso contrário, propaga os cookies de auth para a response base
    authResponse.cookies.getAll().forEach((cookie) => {
      baseResponse.cookies.set(cookie);
    });

    return baseResponse;
  } catch (err) {
    // Não bloqueia request em caso de erro inesperado no auth — UX pior
    // que cair pra /login. Loga para investigação.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[middleware] updateSession failed:', err);
    }
    return baseResponse;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};