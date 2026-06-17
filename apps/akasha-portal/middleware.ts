import { NextResponse, type NextRequest } from 'next/server';
import { generateRequestId } from '@/lib/shared/logging';
import { checkApiRateLimit } from '@/middleware/rateLimit';
import { defaultLocale, locales, type Locale } from '@/i18n/config';

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
// Auth Token Refresh via Internal Fetch (Edge Runtime)
// ============================================
// Uses the existing /api/akasha/auth/refresh endpoint internally.
// This avoids Edge-runtime crypto limitations (node:crypto not available).
// The refresh endpoint handles JWT signing using Node.js crypto (server runtime).

const AKASHA_ACCESS_COOKIE = 'akasha_session';
const AKASHA_REFRESH_COOKIE = 'akasha_refresh';

function getCookiesFromResponseHeaders(headers: Headers): { name: string; value: string }[] {
  const setCookieHeaders = headers.getSetCookie();
  return setCookieHeaders.map((header) => {
    const parts = header.split(';')[0].split('=');
    return { name: parts[0], value: parts.slice(1).join('=') };
  });
}

async function authRefresh(request: NextRequest): Promise<{ name: string; value: string }[] | null> {
  try {
    // Build the internal request to the refresh endpoint.
    // We pass the refresh cookie directly to the endpoint.
    const refreshToken = request.cookies.get(AKASHA_REFRESH_COOKIE)?.value;
    if (!refreshToken) return null;

    // Create a base URL from the request — works in both dev and production.
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = request.headers.get('host') ?? 'localhost:3000';
    const refreshUrl = `${protocol}://${host}/api/akasha/auth/refresh`;

    const refreshResponse = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        cookie: `${AKASHA_REFRESH_COOKIE}=${refreshToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!refreshResponse.ok) return null;

    const newCookies = getCookiesFromResponseHeaders(refreshResponse.headers);
    if (newCookies.length === 0) return null;
    return newCookies;
  } catch {
    return null;
  }
}

const PROTECTED_PATH_PREFIXES = [
  '/dashboard', '/conta', '/diario', '/mandala', '/oraculo',
  '/conexoes', '/mapa', '/manifesto', '/meu-dia',
];

function shouldRefreshAuth(pathname: string): boolean {
  // Strip locale prefix (e.g. /pt-BR, /en) before checking protected paths.
  // Without this, /pt-BR/dashboard fails the /dashboard prefix check and
  // auth refresh never fires → expired access token → redirect to /onboarding.
  const segments = pathname.split('/'); // ['', 'pt-BR', 'dashboard']
  const pathWithoutLocale = (segments.length >= 2 && (locales as readonly string[]).includes(segments[1]))
    ? '/' + segments.slice(2).join('/')
    : pathname;
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathWithoutLocale.startsWith(prefix) || pathWithoutLocale.includes('/akasha')
  );
}

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

    const rateLimitResult = checkApiRateLimit(request);

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

  // Auth token refresh: prevent sessions from expiring after 15min.
  // Calls /api/akasha/auth/refresh internally; sets new cookies on the response.
  // Fixes UX bug: users were kicked to /onboarding after token expiry.
  if (shouldRefreshAuth(pathname)) {
    const newCookies = await authRefresh(request);
    if (newCookies) {
      for (const cookie of newCookies) {
        response.cookies.set(cookie.name, cookie.value, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        });
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
