import { NextResponse, type NextRequest } from 'next/server';
import { generateRequestId } from '@/lib/logging';
import { checkRateLimit } from '@/lib/rate-limit';
import { extractIdentifier } from '@/middleware/rateLimit';
import { defaultLocale, locales, type Locale } from '@/i18n/config';

// ============================================
// Rate Limiting Configuration
// ============================================

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

// ============================================
// CORS Configuration
// ============================================
function getCorsOrigin(requestOrigin: string | null): string | null {
  const configured = process.env.ALLOWED_ORIGINS;
  const isDev = (process.env.NODE_ENV ?? 'development') === 'development';
  if (configured) {
    // Validate against explicit allowlist (comma-separated)
    const allowed = configured.split(',').map((o) => o.trim());
    if (requestOrigin && allowed.includes(requestOrigin)) {
      return requestOrigin;
    }
    return null; // Origin not in allowlist
  }
  // No ALLOWED_ORIGINS configured
  if (isDev) {
    // Safe fallback: only localhost in dev
    if (requestOrigin?.startsWith('http://localhost:') || requestOrigin === 'http://localhost') {
      return requestOrigin;
    }
    return null;
  }
  // Production without ALLOWED_ORIGINS: reject all cross-origin requests
  console.warn('[middleware] ALLOWED_ORIGINS não definido — CORS desabilitado em produção');
  return null;
}
function buildCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ============================================
// Security Headers (Fase 18 — endurecido)
// ============================================
// HSTS (Strict-Transport-Security): força HTTPS por 1 ano, com
//   includeSubDomains e preload. Só é enviado em produção (HTTPS);
//   em dev (HTTP) o browser ignora — não quebra.
// X-Content-Type-Options: nosniff — bloqueia MIME sniffing.
// X-Frame-Options: DENY — bloqueia clickjacking (frame/iframe).
// Referrer-Policy: strict-origin-when-cross-origin — não vaza URL
//   completa para terceiros.
// Permissions-Policy: desabilita APIs sensíveis (geolocation etc).
//
// CSP para APIs: default-src 'none' — APIs não devem servir HTML/JS.
//   Para páginas, CSP fica no Next.js metadata / response headers;
//   aqui só endurecemos as rotas /api (que é onde ele tem efeito
//   bloqueante: se um atacante fizer upload de HTML, 'none' bloqueia).
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  // HSTS só faz sentido em produção com HTTPS. Em dev (http://localhost)
  // o browser ignora; mesmo assim, devolvemos o header para que
  // qualquer proxy reverso de dev também já esteja condicionado.
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/** CSP strict para rotas API (não servem conteúdo navegável). */
const API_CSP = "default-src 'none'; frame-ancestors 'none'";

// ============================================
// Middleware - Auth is handled client-side
// ============================================

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Generate request ID for tracing
  const requestId = generateRequestId();

  // Locale detection — Doc 25 §9 / v0.0.4-T9
  // Cookie takes priority; fallback to Accept-Language; default pt-BR.
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const acceptLang = request.headers.get('accept-language') ?? '';
  const headerLocale = acceptLang.toLowerCase().includes('en') ? 'en' : null;
  const locale: Locale = cookieLocale === 'en' || cookieLocale === 'pt-BR'
    ? (cookieLocale as Locale)
    : (headerLocale === 'en' ? 'en' : defaultLocale);

  // ============================================
  // Locale prefix redirect — Doc 25 §9 / v0.0.4-T9.9
  // ============================================
  // Paths that should NOT be locale-prefixed: API routes, Next internals,
  // static assets, PWA shell files. Everything else (page routes) must live
  // under `/{pt-BR|en}/...` per the [locale] segment in app/.
  const LOCALE_EXEMPT_PREFIXES = [
    '/_next',
    '/api',
    '/icons',
    '/fonts',
    '/sw.js',
    '/manifest.json',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/og-default.svg',
  ];
  const isLocaleExempt = LOCALE_EXEMPT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const firstSegment = pathname.split('/')[1] ?? '';
  const hasLocalePrefix = (locales as readonly string[]).includes(firstSegment);

  if (!isLocaleExempt && !hasLocalePrefix) {
    const target = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = target;
    // Preserve query string on the redirect.
    redirectUrl.search = request.nextUrl.search;
    const redirectResponse = NextResponse.redirect(redirectUrl, 307);
    // Propagate locale header even on the redirect (helps downstream tools).
    redirectResponse.headers.set('x-akasha-locale', locale);
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      redirectResponse.headers.set(key, value);
    });
    redirectResponse.headers.set('X-Request-Id', requestId);
    return redirectResponse;
  }

  // Add security headers to response
  const response = NextResponse.next();
  response.headers.set('X-Request-Id', requestId);
  response.headers.set('x-akasha-locale', locale);
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Skip rate limiting for excluded paths
  const EXCLUDED_PATHS = ['/_next', '/favicon.ico', '/api/health'];
  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return response;
  }

  // Apply rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Handle OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('origin');
      const allowedOrigin = getCorsOrigin(origin);
      const corsHeaders = buildCorsHeaders(allowedOrigin);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    // Skip health check
    if (pathname === '/api/health') {
      return response;
    }

    const identifier = extractIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIG);

    if (!rateLimitResult.allowed) {
      const tooMany = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
      // Defense in depth: headers de segurança + CSP também no 429.
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        tooMany.headers.set(key, value);
      });
      tooMany.headers.set('Content-Security-Policy', API_CSP);
      return tooMany;
    }

    // Add CORS headers for API routes (only if origin is allowed)
    const origin = request.headers.get('origin');
    const allowedOrigin = getCorsOrigin(origin);
    const corsHeaders = buildCorsHeaders(allowedOrigin);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // All client-side routes are allowed - auth is verified by SupabaseProvider
  // The dashboard page itself checks authentication and shows redirect if not logged in
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
