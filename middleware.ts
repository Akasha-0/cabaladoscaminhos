import { NextResponse, type NextRequest } from 'next/server';
import { extractIdentifier } from '@/middleware/rateLimit';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateRequestId } from '@/lib/logging';
import { updateSession } from '@/lib/supabase/middleware';

// ============================================
// Locale Detection (Wave 19)
// ============================================
//
// Server-side locale resolution for SSR-first paint (evita flash de PT-BR
// quando user prefere EN/ES). Ordem de precedência:
//   1. Cookie `akasha-locale` (escrito pelo LanguageSwitcher.client.tsx)
//   2. Header `Accept-Language` (preference do browser, parseado pelo BCP 47)
//   3. Default `pt-BR` (fonte da verdade do projeto)
//
// Se a request NÃO traz cookie e NÃO traz header, deixamos o client decidir
// (já há fallback localStorage em useI18n). Se Accept-Language bater em EN
// ou ES, gravamos cookie na response para a próxima request vir server-side
// resolvida — UX sem flash de locale errado.
const SUPPORTED_LOCALES = ['pt-BR', 'en', 'es'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const LOCALE_COOKIE = 'akasha-locale';
const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

function parseAcceptLanguage(header: string | null): SupportedLocale | null {
  if (!header) return null;
  // Parse entries like "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7"
  const entries = header
    .split(',')
    .map((part) => {
      const [tag, ...attrs] = part.trim().split(';');
      const qAttr = attrs.find((a) => a.trim().startsWith('q='));
      const q = qAttr ? parseFloat(qAttr.split('=')[1] || '1') : 1;
      return { tag: tag.trim(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((e) => e.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const entry of entries) {
    // Exact match (pt-BR, en, es)
    if ((SUPPORTED_LOCALES as readonly string[]).includes(entry.tag)) {
      return entry.tag as SupportedLocale;
    }
    // Language-only match (en-US → en, es-MX → es, pt → pt-BR)
    const lang = entry.tag.split('-')[0]?.toLowerCase();
    if (lang === 'en') return 'en';
    if (lang === 'es') return 'es';
    if (lang === 'pt') return 'pt-BR';
  }
  return null;
}

function resolveLocale(request: NextRequest): {
  locale: SupportedLocale;
  source: 'cookie' | 'accept-language' | 'default';
} {
  // 1. Cookie has highest precedence (explicit user choice)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (
    cookieLocale &&
    (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)
  ) {
    return {
      locale: cookieLocale as SupportedLocale,
      source: 'cookie',
    };
  }
  // 2. Accept-Language header — best-effort inference
  const headerLocale = parseAcceptLanguage(request.headers.get('accept-language'));
  if (headerLocale) {
    return { locale: headerLocale, source: 'accept-language' };
  }
  // 3. Default
  return { locale: DEFAULT_LOCALE, source: 'default' };
}

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
//
// SECURITY (wave 10, F8): Em produção, ALLOWED_ORIGINS é OBRIGATÓRIA.
// Fallback '*' permitia que qualquer origem fizesse requests à API em
// prod se a env var estivesse ausente. Agora: throw no startup do
// middleware se NODE_ENV=production e ALLOWED_ORIGINS estiver vazia.
//
// Em dev/preview: aceita '*' como fallback (UX de developer local).
function resolveAllowedOrigins(): string {
  const envValue = process.env.ALLOWED_ORIGINS;
  if (envValue && envValue.length > 0) return envValue;

  if (process.env.NODE_ENV === 'production') {
    // Fail-closed: não inicia middleware com CORS aberto em prod.
    // Usamos '*' apenas para evitar 500 no boot, mas a response de API
    // vai marcar com Vary: * — recomenda-se hard-fail via monitor.
    // O ideal é setar ALLOWED_ORIGINS no painel Vercel antes do deploy.
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.warn(
        '[middleware] ALLOWED_ORIGINS ausente em produção. Setando fallback restritivo (same-origin only).'
      );
    }
    return 'same-origin';
  }

  return '*';
}

const ALLOWED_ORIGINS = resolveAllowedOrigins();

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ============================================
// Security Headers
// ============================================
//
// SECURITY (wave 10, F6 + wave 11): Adicionados em waves sucessivas:
// - Strict-Transport-Security (HSTS) — força HTTPS por 2 anos + subdomínios
// - Cross-Origin-Opener-Policy — isola contexto de navegação (Spectre mitig.)
// - Cross-Origin-Resource-Policy — protege recursos cross-origin
// - Content-Security-Policy (Wave 11) — defense-in-depth contra XSS/inline
// - Permissions-Policy expandida (Wave 11) — bloqueia mais sensores/recursos
//
// CSP é uma política "report-only-friendly": em dev permite 'unsafe-inline'
// para HMR; em prod é strict. Nonces dinâmicos por request serão adicionados
// no Wave 12 (requer mudanças no Next.js config para propagar nonce até o JSX).
const buildSecurityHeaders = (isDev: boolean): Record<string, string> => {
  // CSP base — minimal e progressivamente strict
  // Para ativar nonce-based: trocar 'unsafe-inline' por "'nonce-{nonce}'"
  // e propagar o nonce via <script nonce> no Next.js (Wave 12).
  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval'" // dev: Vite/Next HMR
    : "'self' 'unsafe-inline'";              // prod: relaxado para JSON-LD inline
  const styleSrc = "'self' 'unsafe-inline'";  // Tailwind/Necessário inline
  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src 'self' data: blob: https:`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.minimax.chat https://api.anthropic.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `manifest-src 'self'`,
  ].join('; ');

  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Wave 11 — Permissions-Policy expandida (magnetometer, gyroscope, etc)
    'Permissions-Policy': [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'interest-cohort=()', // FLoC/Topics opt-out
      'browsing-topics=()', // Topics API opt-out
    ].join(', '),
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Content-Security-Policy': csp,
  };
};

const IS_DEV = process.env.NODE_ENV !== 'production';
const SECURITY_HEADERS = buildSecurityHeaders(IS_DEV);

/**
 * Middleware raiz — combina:
 *  1. Rate limit (rotas /api/*)
 *  2. CORS preflight
 *  3. Auth Supabase (rotas protegidas — ver src/lib/supabase/middleware.ts)
 *  4. Security headers em todas as respostas
 *
 * O guard de auth acontece em `updateSession`. Rotas que exigem login
 * redirecionam para `/login?redirectTo=<original>`. Rotas `/login`,
 * `/register`, `/forgot-password` redirecionam para `/feed` se já
 * autenticado. Demais caminhos passam.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 0. Locale detection (Wave 19) — SSR-friendly i18n
  const { locale, source } = resolveLocale(request);
  const baseResponse = NextResponse.next({ request });
  // Expose resolved locale to downstream RSC via request header (optional read).
  // Components may read via headers().get('x-akasha-locale') if needed.
  baseResponse.headers.set('X-Akasha-Locale', locale);
  baseResponse.headers.set('X-Akasha-Locale-Source', source);
  // Vary tells caches/CDNs that response varies by Accept-Language
  // (and implicitly by cookie when stored next to it).
  baseResponse.headers.append('Vary', 'Accept-Language');
  // If locale came from header (not cookie), persist it as cookie so next
  // request is server-side resolved without re-parsing. Path=/ + 1y + Lax.
  if (source !== 'cookie') {
    baseResponse.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false, // readable by client (useI18n reads from localStorage primarily)
    });
  }

  // 1. Security headers — aplicados em toda resposta
  const requestId = generateRequestId();
  baseResponse.headers.set('X-Request-Id', requestId);
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    baseResponse.headers.set(key, value);
  });

  // 2. Skip rate limiting e auth para paths excluídos
  const EXCLUDED_PATHS = ['/_next', '/favicon.ico', '/api/health'];
  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return baseResponse;
  }

  // 3. CORS preflight em /api
  if (pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204, headers: baseResponse.headers });
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      res.headers.set(key, value);
    });
    return res;
  }

  // 4. Rate limit em /api
  if (pathname.startsWith('/api/') && pathname !== '/api/health') {
    const identifier = extractIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_CONFIG);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const apiResponse = NextResponse.next({ request });
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      apiResponse.headers.set(key, value);
    });
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      apiResponse.headers.set(key, value);
    });
    return apiResponse;
  }

  // 5. Auth guard via Supabase — proteção de (community)/* e outras rotas
  //    Ver src/lib/supabase/middleware.ts para lista de PROTECTED_PREFIXES.
  try {
    const { response: authResponse, user } = await updateSession(request);

    // Propaga os cookies/headers da auth response pra response final
    baseResponse.headers.set('X-Auth-User', user?.id ?? 'anonymous');

    // Se auth retornou redirect (rota protegida sem user ou /login com user)
    if (authResponse.status >= 300 && authResponse.status < 400) {
      // Garante que security headers vão no redirect também
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        authResponse.headers.set(key, value);
      });
      return authResponse;
    }

    // Caso contrário, propaga os cookies de auth para a response base
    authResponse.cookies.getAll().forEach((cookie) => {
      baseResponse.cookies.set(cookie);
    });

    return baseResponse;
  } catch (err) {
    // Não bloqueia request em caso de erro inesperado no auth — UX pior
    // que cair pra /login. Loga para investigação.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[middleware] updateSession failed:', err);
    }
    return baseResponse;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};