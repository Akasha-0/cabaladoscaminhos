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