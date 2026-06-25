import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/security/headers
 * Returns the security headers configuration and current request header info.
 * Helps clients understand the security posture of the API.
 */

// Security headers that should be present in responses
// Wave 12.5: Permissions-Policy ampliado para cobrir mais APIs sensíveis.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
} as const;

// Headers that indicate client security context
const CLIENT_HEADERS = [
  'x-forwarded-for',
  'x-real-ip',
  'x-user-id',
  'x-session-id',
  'authorization',
] as const;

interface SecurityHeaderInfo {
  name: string;
  value: string;
  required: boolean;
  description: string;
}

interface ClientHeaderInfo {
  name: string;
  present: boolean;
  masked: boolean;
}

interface SecurityHeadersResponse {
  configuredHeaders: SecurityHeaderInfo[];
  clientHeaders: ClientHeaderInfo[];
  protocol: string;
  timestamp: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const configuredHeaders: SecurityHeaderInfo[] = Object.entries(SECURITY_HEADERS).map(
    ([name, value]) => ({
      name,
      value,
      required: true,
      description: getHeaderDescription(name),
    })
  );

  const clientHeaders: ClientHeaderInfo[] = CLIENT_HEADERS.map((name) => {
    const headerValue = request.headers.get(name);
    const isAuthHeader = name === 'authorization';

    return {
      name,
      present: headerValue !== null,
      masked: headerValue !== null && isAuthHeader,
    };
  });

  const response: SecurityHeadersResponse = {
    configuredHeaders,
    clientHeaders,
    protocol: 'HTTPS',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, {
    headers: {
      ...SECURITY_HEADERS,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Security-Policy': "default-src 'self'",
    },
  });
}

function getHeaderDescription(headerName: string): string {
  const descriptions: Record<string, string> = {
    'X-Content-Type-Options': 'Prevents MIME type sniffing',
    'X-Frame-Options': 'Prevents clickjacking attacks',
    'X-XSS-Protection': 'Legacy XSS filter (deprecated but still useful)',
    'Referrer-Policy': 'Controls referrer information sent with requests',
    'Permissions-Policy': 'Restricts access to browser features',
    'Strict-Transport-Security': 'Forces HTTPS connections',
  };
  return descriptions[headerName] || 'Security header';
}
