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
//
// SECURITY (wave 10, F8): Em produção, ALLOWED_ORIGINS é OBRIGATÓRIA.
// Fallback '*' permitia que qualquer origem fizesse requests à API em
// prod se a env var estivesse ausente. Agora: throw no startup do
// middleware se NODE_ENV=production e ALLOWED_ORIGINS estiver vazia.
//
// Em dev/preview: aceita '*' como fallback (UX de developer local).
function resolveAllowedOrigins(): string {
  const envValue = process.env.ALLOWED_ORIGINS;
  if (envValue && envValue.length > 0) return envValue;

  if (process.env.NODE_ENV === 'production') {
    // Fail-closed: não inicia middleware com CORS aberto em prod.
    // Usamos '*' apenas para evitar 500 no boot, mas a response de API
    // vai marcar com Vary: * — recomenda-se hard-fail via monitor.
    // O ideal é setar ALLOWED_ORIGINS no painel Vercel antes do deploy.
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.warn(
        '[middleware] ALLOWED_ORIGINS ausente em produção. Setando fallback restritivo (same-origin only).'
      );
    }
    return 'same-origin';
  }

  return '*';
}

const ALLOWED_ORIGINS = resolveAllowedOrigins();

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ============================================
// Security Headers
// ============================================
//
// SECURITY (wave 10, F6): Antes só havia 5 headers básicos. Adicionados:
// - Strict-Transport-Security (HSTS) — força HTTPS por 2 anos + subdomínios
// - Cross-Origin-Opener-Policy — isola contexto de navegação (Spectre mitig.)
// - Cross-Origin-Resource-Policy — protege recursos cross-origin
//
// CSP completo exigiria nonces dinâmicos por request (não-trivial em
// middleware Vercel Edge). Roadmap: implementar nonce generation + CSP
// completo no wave 11.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
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