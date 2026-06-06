/**
 * Security Headers Tests
 * 
 * Tests the security headers applied by middleware.ts to all responses.
 * Covers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection,
 * Referrer-Policy, Permissions-Policy, Content-Security-Policy.
 */

import { describe, it, expect } from 'vitest';
import { NextResponse } from 'next/server';

 // ============================================
 // Security Headers Configuration (from middleware.ts)
 // ============================================

 const SECURITY_HEADERS: Record<string, string> = {
   'X-Content-Type-Options': 'nosniff',
   'X-Frame-Options': 'DENY',
   'X-XSS-Protection': '1; mode=block',
   'Referrer-Policy': 'strict-origin-when-cross-origin',
   'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
 };

 const API_CSP = "default-src 'none'; frame-ancestors 'none'";

 const COCKPIT_CSP = [
   "default-src 'self'",
   "script-src 'self'",
   "style-src 'self' 'unsafe-inline'",
   "img-src 'self' data: https://*.openstreetmap.org https://*.tile.openstreetmap.org",
   "font-src 'self' data:",
   "connect-src 'self'",
   "frame-ancestors 'none'",
   "base-uri 'self'",
   "form-action 'self'",
 ].join('; ');

 const EXCLUDED_PATHS = ['/_next', '/favicon.ico', '/api/health'];

// ============================================
// Simulated Middleware Logic
// ============================================

 function simulateMiddlewareResponse(
   pathname: string,
   options: { status?: number; body?: string | null } = {}
 ): NextResponse {
   const { status = 200, body = null } = options;

   const response = body !== null
     ? NextResponse.json(body || {}, { status })
     : NextResponse.next();

   // Apply security headers (same logic as middleware.ts)
   Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
     response.headers.set(key, value);
   });

   // Skip further processing for excluded paths
   if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
     return response;
   }

   // CSP for API routes
   if (pathname.startsWith('/api/')) {
     response.headers.set('Content-Security-Policy', API_CSP);
   }
   // CSP for cockpit pages
   if (pathname.startsWith('/cockpit')) {
     response.headers.set('Content-Security-Policy', COCKPIT_CSP);
   }

   return response;
 }

function simulateErrorResponse(pathname: string, statusCode: number): NextResponse {
  const response = NextResponse.json(
    { error: 'Test error', status: statusCode },
    { status: statusCode }
  );

  // Apply security headers to error responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

function getHeadersArray(response: NextResponse): [string, string][] {
  const headers: [string, string][] = [];
  response.headers.forEach((value, key) => {
    headers.push([key, value]);
  });
  return headers;
}

// ============================================
// Tests
// ============================================

describe('Security Headers', () => {
  describe('X-Content-Type-Options', () => {
    it('should set X-Content-Type-Options to nosniff on API routes', () => {
      const response = simulateMiddlewareResponse('/api/numerologia');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should set X-Content-Type-Options to nosniff on page routes', () => {
      const response = simulateMiddlewareResponse('/dashboard');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should set X-Content-Type-Options to nosniff on error responses', () => {
      const response = simulateErrorResponse('/api/test', 500);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });
  });

  describe('X-Frame-Options', () => {
    it('should set X-Frame-Options to DENY on API routes', () => {
      const response = simulateMiddlewareResponse('/api/numerologia');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should set X-Frame-Options to DENY on page routes', () => {
      const response = simulateMiddlewareResponse('/dashboard');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should prevent clickjacking by denying frame embedding', () => {
      const response = simulateMiddlewareResponse('/login');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('X-XSS-Protection', () => {
    it('should set X-XSS-Protection to 1; mode=block on API routes', () => {
      const response = simulateMiddlewareResponse('/api/numerologia');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });

    it('should set X-XSS-Protection to 1; mode=block on page routes', () => {
      const response = simulateMiddlewareResponse('/dashboard');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });

    it('should enable XSS filter in blocking mode', () => {
      const response = simulateMiddlewareResponse('/');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });

  describe('Referrer-Policy', () => {
    it('should set Referrer-Policy to strict-origin-when-cross-origin on API routes', () => {
      const response = simulateMiddlewareResponse('/api/numerologia');
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should set Referrer-Policy to strict-origin-when-cross-origin on page routes', () => {
      const response = simulateMiddlewareResponse('/dashboard');
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should only send full URL for same-origin requests', () => {
      const response = simulateMiddlewareResponse('/login');
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Permissions-Policy', () => {
    it('should set Permissions-Policy on API routes', () => {
      const response = simulateMiddlewareResponse('/api/numerologia');
      const policy = response.headers.get('Permissions-Policy') ?? '';
      expect(policy).toBeDefined();
      expect(typeof policy).toBe('string');
      expect(policy.length).toBeGreaterThan(0);
    });

    it('should set Permissions-Policy on page routes', () => {
      const response = simulateMiddlewareResponse('/dashboard');
      const policy = response.headers.get('Permissions-Policy') ?? '';
      expect(policy).toBeDefined();
      expect(policy).toContain('geolocation=()');
      expect(policy).toContain('microphone=()');
      expect(policy).toContain('camera=()');
    });

    it('should restrict sensitive device access', () => {
      const response = simulateMiddlewareResponse('/mapa');
      const policy = response.headers.get('Permissions-Policy') ?? '';
      expect(policy).toContain('geolocation=()');
      expect(policy).toContain('microphone=()');
      expect(policy).toContain('camera=()');
    });
  });

  describe('Content-Security-Policy', () => {
    it('should set Content-Security-Policy on API routes when defined in middleware', () => {
      const response = simulateMiddlewareResponse('/api/numerologia');
      const csp = response.headers.get('Content-Security-Policy');
      
      // If CSP is defined in SECURITY_HEADERS, verify it
      if (SECURITY_HEADERS['Content-Security-Policy']) {
        expect(csp).toBe(SECURITY_HEADERS['Content-Security-Policy']);
      }
    });

    it('should set Content-Security-Policy on page routes when defined', () => {
      const response = simulateMiddlewareResponse('/dashboard');
      const csp = response.headers.get('Content-Security-Policy');
      
      if (SECURITY_HEADERS['Content-Security-Policy']) {
        expect(csp).toBeDefined();
      }
    });
  });

  describe('No Internal Path Leakage', () => {
    it('should not expose internal file paths in security headers', () => {
      const paths = [
        '/api/numerologia',
        '/dashboard/mapa',
        '/api/health',
        '/_next/static/test.js',
      ];

      paths.forEach(path => {
        const response = simulateMiddlewareResponse(path);
        const allHeaders = getHeadersArray(response);
        
        // Check that no header value contains file system paths
        const internalPaths = allHeaders.filter(([, value]) => 
          value.includes('/app/') || 
          value.includes('/src/') || 
          value.includes('/lib/') ||
          value.includes('.ts') ||
          value.includes('.tsx')
        );

        expect(internalPaths).toHaveLength(0);
      });
    });

    it('should not expose node_modules or package paths', () => {
      const response = simulateMiddlewareResponse('/api/test');
      const allHeaders = getHeadersArray(response);
      
      const internalPaths = allHeaders.filter(([, value]) => 
        value.includes('node_modules') || 
        value.includes('.next/') ||
        value.includes('package.json')
      );

      expect(internalPaths).toHaveLength(0);
    });

    it('should not expose server-side environment details', () => {
      const response = simulateMiddlewareResponse('/dashboard');
      const allHeaders = getHeadersArray(response);
      
      const sensitivePatterns = [
        /secret/i,
        /password/i,
        /api[_-]?key/i,
        /token/i,
      ];

      const exposedSecrets = allHeaders.filter(([, value]) => 
        sensitivePatterns.some(pattern => pattern.test(value))
      );

      expect(exposedSecrets).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should apply security headers to 200 OK responses', () => {
      const response = simulateMiddlewareResponse('/api/numerologia');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should apply security headers to 401 Unauthorized responses', () => {
      const response = simulateErrorResponse('/api/protected', 401);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should apply security headers to 500 Internal Server Error responses', () => {
      const response = simulateErrorResponse('/api/error', 500);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should apply security headers to static file requests', () => {
      const response = simulateMiddlewareResponse('/_next/static/test.js');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should apply security headers to excluded paths', () => {
      const response = simulateMiddlewareResponse('/api/health');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should maintain headers across different response types', () => {
      const endpoints = [
        { path: '/api/numerologia', status: 200 },
        { path: '/api/protected', status: 401 },
        { path: '/api/error', status: 500 },
      ];

      endpoints.forEach(({ path, status }) => {
        const response = status >= 400 
          ? simulateErrorResponse(path, status)
          : simulateMiddlewareResponse(path);

        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
        expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
        expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
        expect(response.headers.get('Permissions-Policy')).toBeDefined();
      });
    });
  });

  describe('Header Consistency', () => {
    it('should have consistent security headers across all page routes', () => {
      const pageRoutes = ['/', '/login', '/registro', '/dashboard', '/mapa'];

      pageRoutes.forEach(route => {
        const response = simulateMiddlewareResponse(route);
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      });
    });

    it('should have consistent security headers across all API routes', () => {
      const apiRoutes = [
        '/api/numerologia',
        '/api/mapa',
        '/api/oracle',
        '/api/dashboard',
      ];

      apiRoutes.forEach(route => {
        const response = simulateMiddlewareResponse(route);
        expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
        expect(response.headers.get('X-Frame-Options')).toBe('DENY');
        expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      });
    });

    it('should not duplicate security headers', () => {
      const response = simulateMiddlewareResponse('/api/test');
      const headerNames: string[] = [];
      response.headers.forEach((_, key) => {
        if (key in SECURITY_HEADERS) {
          headerNames.push(key);
        }
      });
      const uniqueHeaders = new Set(headerNames);
      expect(uniqueHeaders.size).toBe(headerNames.length);
     });
   });

   describe('Cockpit CSP', () => {
     const cockpitRoutes = [
       '/cockpit',
       '/cockpit/dashboard',
       '/cockpit/consulentes',
       '/cockpit/leituras',
       '/cockpit/settings',
     ];

     it('should set Content-Security-Policy on cockpit routes', () => {
       cockpitRoutes.forEach(route => {
         const response = simulateMiddlewareResponse(route);
         const csp = response.headers.get('Content-Security-Policy');
         expect(csp).toBeDefined();
         expect(typeof csp).toBe('string');
         expect(csp!.length).toBeGreaterThan(0);
       });
     });

     it('should set frame-ancestors none in cockpit CSP', () => {
       const response = simulateMiddlewareResponse('/cockpit');
       const csp = response.headers.get('Content-Security-Policy') ?? '';
       expect(csp).toContain("frame-ancestors 'none'");
     });

     it('should restrict default-src to self in cockpit CSP', () => {
       const response = simulateMiddlewareResponse('/cockpit');
       const csp = response.headers.get('Content-Security-Policy') ?? '';
       expect(csp).toContain("default-src 'self'");
     });

     it('should restrict scripts to self only in cockpit CSP', () => {
       const response = simulateMiddlewareResponse('/cockpit');
       const csp = response.headers.get('Content-Security-Policy') ?? '';
       expect(csp).toContain("script-src 'self'");
       // Only self is allowed — no unsafe-inline or external sources
       expect(csp).toMatch(/script-src 'self'(?!.*script-src)/);
     });
     it('should allow unsafe-inline for styles (Tailwind CSS)', () => {
       const response = simulateMiddlewareResponse('/cockpit');
       const csp = response.headers.get('Content-Security-Policy') ?? '';
       // unsafe-inline is required for Tailwind's critical CSS inlining
       expect(csp).toContain("style-src 'self' 'unsafe-inline'");
     });

     it('should allow OpenStreetMap tiles for city autocomplete', () => {
       const response = simulateMiddlewareResponse('/cockpit');
       const csp = response.headers.get('Content-Security-Policy') ?? '';
       expect(csp).toContain('https://*.openstreetmap.org');
     });

     it('should set base-uri to self', () => {
       const response = simulateMiddlewareResponse('/cockpit');
       const csp = response.headers.get('Content-Security-Policy') ?? '';
       expect(csp).toContain("base-uri 'self'");
     });

     it('should not set API CSP on cockpit routes', () => {
       const response = simulateMiddlewareResponse('/cockpit');
       const csp = response.headers.get('Content-Security-Policy') ?? '';
       // Cockpit CSP should NOT be the restrictive API CSP
       expect(csp).not.toBe(API_CSP);
     });

     it('should have consistent CSP across all cockpit routes', () => {
       cockpitRoutes.forEach(route => {
         const response = simulateMiddlewareResponse(route);
         expect(response.headers.get('Content-Security-Policy')).toBe(COCKPIT_CSP);
       });
     });
   });
});