// fallow-ignore-file unused-file
// ============================================================
// REQUEST/RESPONSE LOGGING MIDDLEWARE - CABALA DOS CAMINHOS
// ============================================================
// Logs HTTP requests and responses with timing information
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging';

export interface RequestLoggerOptions {
  /** Paths to skip logging */
  skipPaths?: string[];
  /** Headers to include in logs (besides userId) */
  extraHeaders?: string[];
}

const DEFAULT_SKIP_PATHS = ['/favicon.ico', '/robots.txt', '/health'];

export function createRequestLogger(options: RequestLoggerOptions = {}) {
  const { skipPaths = DEFAULT_SKIP_PATHS, extraHeaders = [] } = options;

// fallow-ignore-next-line complexity
  return async function requestLogger(
    request: NextRequest
  ): Promise<NextResponse | void> {
    // Skip certain paths
    if (skipPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
      return;
    }

    const startTime = performance.now();

    // Extract request info
    const method = request.method;
    const path = request.nextUrl.pathname;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Get userId from auth header if present
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        userId = payload.sub || payload.userId || payload.id;
      } catch {
        // Not a valid JWT, leave userId undefined
      }
    }

    // Collect extra headers if specified
    const headerContext: Record<string, string> = {};
    for (const header of extraHeaders) {
      const value = request.headers.get(header);
      if (value) headerContext[header] = value;
    }

    // Log incoming request
    logger.info(`${method} ${path}`, {
      ip,
      userAgent,
      userId,
      path,
      method,
      ...headerContext,
    });

    // Get response with timing
    const response = NextResponse.next();

    // Calculate duration
    const duration = Math.round(performance.now() - startTime);

    // Add timing header for debugging
    response.headers.set('X-Response-Time', `${duration}ms`);

    // Log response completion
    logger.info(`${method} ${path} 200`, {
      ip,
      userId,
      path,
      method,
      duration,
      status: 200,
    });

    return response;
  };
}

export const requestLogger = createRequestLogger();