import { NextResponse, type NextRequest } from 'next/server';
import { extractIdentifier } from '@/middleware/rateLimit';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateRequestId } from '@/lib/logging';

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
const INFRA_PREFIXES = ['/_next', '/favicon.ico', '/manifest', '/icons', '/offline', '/sw', '/api/og'];

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
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // ── Quarentena do B2C legado (Doc 16 AD-01) ──
  // Tudo que não é B2B nem infraestrutura é bloqueado quando a flag está desligada.
  if (!LEGACY_B2C_ENABLED && !isAllowedWhenQuarantined(pathname)) {
    if (pathname.startsWith('/api/')) {
      // APIs legadas não existem no produto B2B.
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // Raiz e páginas legadas levam ao Cockpit (entrada única do produto).
    return NextResponse.redirect(new URL('/cockpit', request.url));
  }

  // Skip rate limiting for excluded paths
  const EXCLUDED_PATHS = ['/_next', '/favicon.ico', '/api/health'];
  if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return response;
  }

  // Apply rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Handle OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
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
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Add CORS headers for API routes
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // All client-side routes are allowed - auth is verified by SupabaseProvider
  // The dashboard page itself checks authentication and shows redirect if not logged in
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};