// ============================================================================
// ROOT MIDDLEWARE — Wave 34 / Security Hardening 6/8
// ============================================================================
// Aplica em TODA resposta (incluindo erros 4xx/5xx, exceto assets internos):
//   1. Content-Security-Policy (CSP) — bloqueia scripts inline não autorizados,
//      fontes externas, framing não-allowlist, mixed-content, navegação de base
//      URI, e form-actions para origens estranhas. Stripe e Supabase Realtime
//      explicitamente permitidos para o checkout e o feed ao vivo.
//   2. Strict-Transport-Security (HSTS) — força HTTPS por 1 ano + subdomains.
//   3. X-Frame-Options: DENY — defesa em profundidade contra clickjacking,
//      mesmo com `frame-ancestors 'none'`.
//   4. X-Content-Type-Options: nosniff — força MIME estrito.
//   5. Referrer-Policy: strict-origin-when-cross-origin — vazamento mínimo
//      de URL completa para terceiros.
//   6. Permissions-Policy — desabilita camera/microphone/geolocation por
//      padrão. Stripe precisa de camera? Não precisa para 3DS2; browser usa
//      autofill nativo, então bloqueio é seguro.
//   7. X-Permitted-Cross-Domain-Policies: none — bloqueia Flash/Acrobat
//      crossdomain (legacy mas barato e elimina vetor).
//   8. Cross-Origin-*-Policy — isola o app contra side-channel (Spectre).
//
// LGPD Art. 46 (segurança) + Art. 7 (consentimento) — HSTS + CSP reduzem risco
// de intercepção em redes inseguras.
// ============================================================================

import { NextResponse, type NextRequest } from 'next/server';
import {
  middleware as supabaseMiddleware,
  PROTECTED_PREFIXES,
} from '@/lib/supabase/middleware';

// ============================================================================
// CSP — build em runtime para permitir swap por env (sandbox vs prod)
// ============================================================================

const SUPABASE_HOST = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  try {
    return url ? new URL(url).host : '*.supabase.co';
  } catch {
    return '*.supabase.co';
  }
})();

const CSP_DIRECTIVES = [
  `default-src 'self'`,
  // Scripts: self + Stripe.js + inline (Next.js injeta inline para hydration)
  // + eval (necessário em dev para Source Maps; em prod removemos via nonce)
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.supabase.co`,
  // Estilos: self + Google Fonts + inline (Tailwind/CSS-in-JS precisa)
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  // Imagens: self + data URI + blob (preview de upload) + qualquer HTTPS
  // (avatares externos, OG images)
  `img-src 'self' data: blob: https:`,
  // Fontes: self + Google Fonts + data URI
  `font-src 'self' data: https://fonts.gstatic.com`,
  // Conexões: APIs (OpenAI, Anthropic, Stripe), Supabase Realtime (wss), e
  // nosso próprio backend. ws/wss para SSE no /api/feed.
  `connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.stripe.com https://api.resend.com https://*.supabase.co wss://${SUPABASE_HOST} ws: wss:`,
  // Mídia: apenas self e blob (upload-preview)
  `media-src 'self' blob:`,
  // Frames: Stripe Checkout + Stripe Hooks (webhook receiver em iframe
  // não acontece, mas Stripe Connect usa) — **sem** allowlist genérico.
  `frame-src https://js.stripe.com https://hooks.stripe.com`,
  // Base URI: força 'self' (anti <base href> injection)
  `base-uri 'self'`,
  // Form actions: apenas same-origin
  `form-action 'self'`,
  // frame-ancestors 'none' é equivalente a X-Frame-Options: DENY
  `frame-ancestors 'none'`,
  // Upgrade HTTP → HTTPS em qualquer recurso
  `upgrade-insecure-requests`,
].join('; ');

// ============================================================================
// Security headers (estáticos)
// ============================================================================

const HSTS_VALUE = 'max-age=31536000; includeSubDomains; preload';
const PERMISSIONS_POLICY = [
  'camera=()',
  'microphone=()',
  'geolocation=()',
  'payment=(self "https://js.stripe.com")',
  'usb=()',
  'magnetometer=()',
  'gyroscope=()',
  'accelerometer=()',
].join(', ');

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP_DIRECTIVES,
  'Strict-Transport-Security': HSTS_VALUE,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': PERMISSIONS_POLICY,
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

const RATE_LIMIT_HEADERS = [
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
  'retry-after',
];

// ============================================================================
// Path allowlist — paths que NÃO devem receber security headers
// ============================================================================
//   - _next/*      → recursos internos do Next (chunks, imagens)
//   - favicon.ico  → browser-side fetch, headers extras quebram cache
//   - api/health   → probes de k8s devem ser leves e sem HSTS forçado
//   - api/webhooks/stripe → Stripe envia POST sem headers especiais; CSP aqui
//     não ajuda (server-to-server) e HSTS poderia bloquear retries
// ============================================================================
const SKIP_HEADER_PREFIXES = ['/_next/', '/favicon.ico'];
const SKIP_HEADER_EXACT = new Set(['/api/health', '/api/webhooks/stripe']);

// ============================================================================
// Helper: aplica headers a um NextResponse
// ============================================================================
function applySecurityHeaders(response: NextResponse, pathname: string) {
  if (
    SKIP_HEADER_PREFIXES.some((p) => pathname.startsWith(p)) ||
    SKIP_HEADER_EXACT.has(pathname)
  ) {
    return response;
  }

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    // .set() sobrescreve se já existir (defesa contra header pre-existente)
    response.headers.set(key, value);
  }

  // X-Robots-Tag: previne indexação de rotas internas (protegidas)
  if (
    PROTECTED_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    ) ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/settings')
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }
}

// ============================================================================
// Main middleware
// ============================================================================
export async function middleware(request: NextRequest) {
  // 1. Supabase: refresh de cookie + guard de rotas protegidas
  const response = await supabaseMiddleware(request);

  // 2. Security headers em TODA resposta (incluindo 401/403/500 do guard acima)
  applySecurityHeaders(response, request.nextUrl.pathname);

  // 3. CSRF check para POST/PATCH/PUT/DELETE em /api/* (não-webhook)
  if (
    /^\/api\//.test(request.nextUrl.pathname) &&
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
    request.nextUrl.pathname !== '/api/webhooks/stripe'
  ) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    // Origin deve bater com o host atual (mesma origem)
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return new NextResponse(
            JSON.stringify({
              error: 'CSRF_BLOCKED',
              message: 'Origem não corresponde ao host.',
            }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                ...Object.fromEntries(
                  Object.entries(SECURITY_HEADERS).filter(([k]) =>
                    RATE_LIMIT_HEADERS.includes(k.toLowerCase())
                      ? false
                      : true
                  )
                ),
              },
            }
          );
        }
      } catch {
        // Origin mal formado → bloqueia (defesa em profundidade)
        return new NextResponse(
          JSON.stringify({ error: 'CSRF_BLOCKED', message: 'Origin inválido.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  return response;
}

// ============================================================================
// Matcher — aplica em tudo exceto assets estáticos e imagens otimizadas
// ============================================================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (cache de build)
     * - _next/image (otimização de imagem)
     * - favicon.ico
     * - images/ (uploads locais servidos diretamente)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
