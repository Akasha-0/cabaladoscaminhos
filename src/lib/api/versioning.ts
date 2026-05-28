// ============================================================
// API VERSIONING MIDDLEWARE - CABALA DOS CAMINHOS
// ============================================================
// Supports URL path versioning (/v1/, /v2/) and Accept-Version header fallback
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// Supported API versions
export const SUPPORTED_VERSIONS = ['v1', 'v2'] as const;
export type ApiVersion = (typeof SUPPORTED_VERSIONS)[number];

// Default version for fallback
export const DEFAULT_VERSION: ApiVersion = 'v1';

// Header and query param names
const ACCEPT_VERSION_HEADER = 'Accept-Version';
const VERSION_QUERY_PARAM = 'api-version';

/**
 * Extract version from URL path
 * Matches /v1/ or /v2/ at the start of the path
 */
function extractVersionFromPath(pathname: string): ApiVersion | null {
  const match = pathname.match(/^\/v(\d+)\//);
  if (match) {
    const version = `v${match[1]}` as ApiVersion;
    if (SUPPORTED_VERSIONS.includes(version)) {
      return version;
    }
  }
  return null;
}

/**
 * Extract version from Accept-Version header
 * Supports: "v1", "v1, v2", "v1; q=1.0, v2; q=0.9"
 */
function extractVersionFromHeader(request: NextRequest): ApiVersion | null {
  const headerValue = request.headers.get(ACCEPT_VERSION_HEADER);
  if (!headerValue) return null;

  // Parse comma-separated versions with quality values
  const versions = headerValue
    .split(',')
    .map((part) => {
      const [version, qualityPart] = part.trim().split(';');
      const versionStr = version.trim();
      const quality = qualityPart
        ? parseFloat(qualityPart.replace('q=', '').trim()) || 1
        : 1;
      return { version: versionStr, quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find first supported version in priority order
  for (const { version } of versions) {
    if (SUPPORTED_VERSIONS.includes(version as ApiVersion)) {
      return version as ApiVersion;
    }
  }

  return null;
}

/**
 * Extract version from query parameter
 * Supports: ?api-version=v1 or ?api-version=v2
 */
function extractVersionFromQuery(request: NextRequest): ApiVersion | null {
  const url = request.url;
  try {
    const searchParams = new URL(url).searchParams;
    const version = searchParams.get(VERSION_QUERY_PARAM);
    if (version && SUPPORTED_VERSIONS.includes(version as ApiVersion)) {
      return version as ApiVersion;
    }
  } catch {
    // Invalid URL, ignore
  }
  return null;
}

/**
 * API Version information attached to request
 */
export interface VersionInfo {
  version: ApiVersion;
  isDeprecated: boolean;
  deprecationWarning?: string;
}

/**
 * Request extension with version info
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NextServer {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RequestData {
      apiVersion?: VersionInfo;
    }
  }
}

/**
 * Check if a version is deprecated
 */
function isVersionDeprecated(version: ApiVersion): boolean {
  return false; // Extend when v1 is deprecated
}

/**
 * Get deprecation warning for a version
 */
function getDeprecationWarning(version: ApiVersion): string | undefined {
  if (version === 'v1') {
    return 'v1 is deprecated. Please migrate to v2.';
  }
  return undefined;
}

// Response headers for version negotiation
const VERSION_HEADER = 'X-API-Version';
const SUPPORTED_HEADERS = 'X-API-Supported-Versions';

/**
 * Version middleware for Next.js App Router
 * 
 * Usage in middleware.ts:
 *   import { versionMiddleware } from '@/lib/api/versioning';
 *   export default stackMiddlewares([versionMiddleware]);
 */
export function versionMiddleware(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  // Skip non-API routes
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  // Extract version using priority: path > header > query
  const version: ApiVersion = extractVersionFromPath(pathname)
    || extractVersionFromQuery(request)
    || extractVersionFromHeader(request)
    || DEFAULT_VERSION;

  // Create version info
  const versionInfo: VersionInfo = {
    version,
    isDeprecated: isVersionDeprecated(version),
    deprecationWarning: getDeprecationWarning(version),
  };

  // For internal passing, we could use request headers or a custom property
  // The version info is attached for downstream handlers

  // Create response with version headers
  // If it's a rewrite/internal request, just add headers
  const response = NextResponse.next();
  
  // Add version information headers
  response.headers.set(VERSION_HEADER, version);
  response.headers.set(SUPPORTED_HEADERS, SUPPORTED_VERSIONS.join(', '));

  // Add deprecation header if applicable
  if (versionInfo.isDeprecated && versionInfo.deprecationWarning) {
    response.headers.set('Deprecation', `true`);
    response.headers.set('Warning', `299 - "${versionInfo.deprecationWarning}"`);
  }

  // Return response with version info attached
  return response;
}

/**
 * Get version from Next.js request (for use in route handlers)
 */
export function getRequestVersion(request: NextRequest): ApiVersion {
  // Try path first
  const pathVersion = extractVersionFromPath(request.nextUrl.pathname);
  if (pathVersion) return pathVersion;

  // Try query param
  const queryVersion = extractVersionFromQuery(request);
  if (queryVersion) return queryVersion;

  // Try header
  const headerVersion = extractVersionFromHeader(request);
  if (headerVersion) return headerVersion;

  return DEFAULT_VERSION;
}

/**
 * Check if request version matches expected version
 */
export function requireVersion(
  request: NextRequest,
  expected: ApiVersion
): boolean {
  return getRequestVersion(request) === expected;
}

/**
 * Create a versioned API response
 */
export function versionedResponse<T>(
  data: T,
  request: NextRequest,
  options: {
    meta?: Record<string, unknown>;
    status?: number;
  } = {}
): NextResponse {
  const version = getRequestVersion(request);
  
  const body = {
    success: true,
    data,
    meta: {
      ...options.meta,
      version,
    },
  };

  return NextResponse.json(body, {
    status: options.status ?? 200,
    headers: {
      [VERSION_HEADER]: version,
      [SUPPORTED_HEADERS]: SUPPORTED_VERSIONS.join(', '),
    },
  });
}

/**
 * Middleware configuration options
 */
export interface VersioningOptions {
  /** Default version if none specified */
  defaultVersion?: ApiVersion;
  /** Whether to reject unsupported versions */
  strictMode?: boolean;
  /** Custom supported versions */
  supportedVersions?: readonly string[];
}

/**
 * Create a version middleware with custom options
 */
export function createVersionMiddleware(
  options: VersioningOptions = {}
) {
  const {
    defaultVersion = DEFAULT_VERSION,
    strictMode = false,
  } = options;

  return function versioningHandler(
    request: NextRequest
  ): NextResponse | null {
    const pathname = request.nextUrl.pathname;

    // Skip non-API routes
    if (!pathname.startsWith('/api/')) {
      return null;
    }

    // Extract version using priority: path > query > header
    let version: ApiVersion | null = extractVersionFromPath(pathname);
    
    if (!version) {
      version = extractVersionFromQuery(request);
    }
    
    if (!version) {
      version = extractVersionFromHeader(request);
    }

    if (!version) {
      version = defaultVersion;
    }

    // In strict mode, reject unsupported versions
    if (strictMode && !SUPPORTED_VERSIONS.includes(version)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNSUPPORTED_VERSION',
            message: `Unsupported API version: ${version}`,
            supportedVersions: SUPPORTED_VERSIONS,
          },
        },
        {
          status: 400,
          headers: {
            [SUPPORTED_HEADERS]: SUPPORTED_VERSIONS.join(', '),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set(VERSION_HEADER, version);
    response.headers.set(SUPPORTED_HEADERS, SUPPORTED_VERSIONS.join(', '));

    return response;
  };
}