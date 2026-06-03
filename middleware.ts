import { NextResponse, type NextRequest } from 'next/server';
import { generateRequestId } from '@/lib/logging';
import { checkRateLimit } from '@/lib/rate-limit';
import { extractIdentifier } from '@/middleware/rateLimit';

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
// Quarentena do B2C legado (Doc 16 AD-01)
// --------------------------------------------
// O produto é o Cockpit Oracular (B2B). A plataforma B2C de bem-estar
// (dashboard, mapa pessoal, rituais, billing…) é fora de escopo (Doc 09 §5.1/§9).
// Esta quarentena a remove do roteamento de produção SEM apagar nada:
//   - `LEGACY_B2C=on`  → restaura o B2C (reversível por flag).
//   - ausente/qualquer → B2C quarentenado: páginas → /cockpit; APIs → 404.
// ============================================

const LEGACY_B2C_ENABLED = process.env.LEGACY_B2C === 'on';

// Prefixos do produto B2B — sempre acessíveis.
const B2B_PREFIXES = ['/cockpit', '/api/mesa-real', '/api/consult', '/api/operator', '/api/health'];
// Infraestrutura/PWA — sempre acessível.
const INFRA_PREFIXES = [
  '/_next',
  '/favicon.ico',
  '/manifest',
  '/icons',
  '/offline',
  '/sw',
  '/api/og',
];

function isAllowedWhenQuarantined(pathname: string): boolean {
  const prefixes = [...B2B_PREFIXES, ...INFRA_PREFIXES];
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

// ============================================
// Middleware - Auth is handled client-side
// ============================================

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Generate request ID for tracing
  const requestId = generateRequestId();

  // Add security headers to response
  const response = NextResponse.next();
  response.headers.set('X-Request-Id', requestId);
  // Expor pathname para layouts server-side (evita self-redirect no /cockpit/login)
  response.headers.set('x-pathname', pathname);
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  // CSP strict para APIs
  if (pathname.startsWith('/api/')) {
    response.headers.set('Content-Security-Policy', API_CSP);
  }
  // CSP para cockpit (páginas do produto B2B)
  if (pathname.startsWith('/cockpit')) {
    response.headers.set('Content-Security-Policy', COCKPIT_CSP);
  }

  // ── Quarentena do B2C legado (Doc 16 AD-01) ──
  // Tudo que não é B2B nem infraestrutura é bloqueado quando a flag está desligada.
  if (!LEGACY_B2C_ENABLED && !isAllowedWhenQuarantined(pathname)) {
    if (pathname.startsWith('/api/')) {
      // APIs legadas não existem no produto B2B.
      const notFound = NextResponse.json({ error: 'Not found' }, { status: 404 });
      // Aplica headers de segurança + CSP também no 404 (defense in depth).
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        notFound.headers.set(key, value);
      });
      notFound.headers.set('Content-Security-Policy', API_CSP);
      return notFound;
    }
    // Raiz e páginas legadas levam ao Cockpit (entrada única do produto).
    return NextResponse.redirect(new URL('/cockpit', request.url));
  }

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

// ============================================
// CSP for Cockpit Pages (Fase 23)
// ============================================
// Restrictive CSP for cockpit — no external scripts, no iframes.
// 'unsafe-inline' for style-src is REQUIRED: Tailwind CSS inlines critical
// styles in production (Next.js extracts and inlines Tailwind classes).
// nonce-based approach is ideal but requires more setup; unsafe-inline
// with strict default-src 'self' is an acceptable balance for internal tools.
const COCKPIT_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // unsafe-inline required for Tailwind critical CSS inlining in production
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.openstreetmap.org https://*.tile.openstreetmap.org",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');
