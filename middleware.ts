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
// Configurações de Rota
// ============================================

// Rotas públicas do frontend
const PUBLIC_PAGE_ROUTES = ['/', '/login', '/registro', '/(dashboard)'];

// API routes que não requerem rate limiting
const EXCLUDED_PATHS = ['/_next', '/favicon.ico', '/api/health'];

// ============================================
// Middleware Simplificado
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

  // Skip rate limiting for excluded paths
  if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return response;
  }

  // Apply rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const identifier = extractIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, {
      windowMs: RATE_LIMIT_CONFIG.windowMs,
      maxRequests: RATE_LIMIT_CONFIG.maxRequests,
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetIn / 1000).toString());

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(rateLimitResult.resetIn / 1000),
          requestId,
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
            'X-Request-Id': requestId,
          },
        }
      );
    }
  }

  // Para páginas públicas (login/registro), apenas passar
  // A verificação de auth fica por conta do cliente (SupabaseProvider)
  if (PUBLIC_PAGE_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return response;
  }

  // Para outras rotas, redirecionar para login
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
