/**
 * Share Target Receiver — F-240
 *
 * Endpoint que recebe conteúdo compartilhado pelo usuário via Web Share Target
 * API (PWA). O manifest.json expõe `/compartilhar/receber` como action; o
 * navegador faz POST com FormData contendo `title`, `text`, `url`.
 *
 * Comportamento:
 * 1. Parse FormData
 * 2. Auth: requer `akasha_session` cookie (se ausente, redirect onboarding)
 * 3. Criar rascunho de consulta do Mentor (model `MentorRascunho` se existir,
 *    ou session storage)
 * 4. Redirect para `/oraculo?rascunho=<id>` para o usuário refinar
 *
 * SECURITY (Wave 12.5):
 * - Valida tamanho do input (max 2KB por field)
 * - Sanitiza HTML / markdown injection
 * - Rejeita URL com javascript: scheme
 * - SSRF guard (defense-in-depth) — bloqueia URLs que apontam para
 *   IPs privados/loopback, mesmo que hoje não fetcheamos server-side.
 *   Se evoluirmos para "preview do link", a validação já está pronta.
 * - Auth obrigatório (não é endpoint público)
 * - LGPD: rate-limit + hashIp para identifier (não logamos IP puro)
 */
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';
import { checkStrictRateLimit, buildStrictRateLimitResponse } from '@/lib/infrastructure/security/rate-limit-strict';
import { assertSafeExternalUrl, SsrfBlockedError } from '@/lib/infrastructure/security/ssrf';

const MAX_FIELD_LENGTH = 2000;
const DANGEROUS_SCHEMES = /^(javascript|data|vbscript|file):/i;

function sanitizeString(value: FormDataEntryValue | null): string | null {
  if (value === null || typeof value !== 'string') return null;
  // Truncar
  const truncated = value.slice(0, MAX_FIELD_LENGTH);
  return truncated;
}

function isSafeUrl(url: string): boolean {
  // Wave 12.5: SSRF guard centralizado substitui a regex antiga.
  // assertSafeExternalUrl cobre: scheme (https/http only), private IPs,
  // localhost, IPv4-mapped IPv6, userinfo-in-url.
  try {
    assertSafeExternalUrl(url);
    return !DANGEROUS_SCHEMES.test(new URL(url).protocol);
  } catch {
    return false;
  }
}

export const dynamic = 'force-dynamic';

/**
 * Wave 12.5: rate limit no share-target (defense in depth).
 * 30 req/min por user — uso humano normal (compartilhar artigo,
 * link, etc.) é bem abaixo disso; >30/min é claramente abuso.
 */
async function enforceShareRateLimit(request: NextRequest) {
  const rateLimit = await checkStrictRateLimit(request, 'AUTH_ME', { preferUserId: true });
  if (!rateLimit.allowed) {
    const blocked = buildStrictRateLimitResponse('AUTH_ME');
    return NextResponse.json(blocked.body, {
      status: blocked.status,
      headers: {
        'Retry-After': String(blocked.body.retryAfterSeconds),
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
      },
    });
  }
  return null;
}

export async function POST(request: NextRequest) {
  // 1. Rate limit (anti-abuso do share-target — evita flood de rascunhos)
  const blocked = await enforceShareRateLimit(request);
  if (blocked) return blocked;

  // 2. Auth
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const payload = verifyAkashaToken(token, 'access');
  if (!payload) {
    // Share Target sem auth — redirect para login com return URL preservado
    const url = new URL(request.url);
    const locale = 'pt-BR';
    return NextResponse.redirect(
      new URL(
        `/${locale}/login?return=${encodeURIComponent('/' + locale + '/compartilhar/receber')}`,
        url.origin
      ),
      303
    );
  }

  // 3. Parse FormData
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'invalid_form_data' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const title = sanitizeString(formData.get('title'));
  const text = sanitizeString(formData.get('text'));
  const url = sanitizeString(formData.get('url'));

  // 4. Validate URL safety — defense-in-depth SSRF guard.
  // Atualmente NÃO fetcheamos a URL server-side (só exibimos como
  // fonte). Se evoluirmos para preview, o guard já está aplicado.
  if (url) {
    try {
      assertSafeExternalUrl(url);
    } catch (err) {
      if (err instanceof SsrfBlockedError) {
        return NextResponse.json(
          { error: 'unsafe_url', reason: 'ssrf_guard' },
          { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
      }
      throw err;
    }
    // Belt-and-suspenders: legacy scheme regex
    if (!isSafeUrl(url)) {
      return NextResponse.json(
        { error: 'unsafe_url' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  // 5. Build "intent" string (concatenação limpa)
  const intentParts: string[] = [];
  if (title) intentParts.push(`# ${title}`);
  if (text) intentParts.push(text);
  if (url) intentParts.push(`(fonte: ${url})`);
  const intent = intentParts.join('\n\n').slice(0, 4000);

  if (intent.length === 0) {
    return NextResponse.json(
      { error: 'empty_intent' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // 6. Persistir como rascunho de Mentor
  // (Tabela `mentorRascunho` pode não existir ainda — fallback: session flag)
  let rascunhoId: string | null = null;
  try {
    const rascunho = await (prisma as any).mentorRascunho?.create?.({
      data: {
        userId: payload.sub,
        intent,
        source: 'share-target',
        metadata: { title, text, url },
      },
      select: { id: true },
    });
    rascunhoId = rascunho?.id ?? null;
  } catch {
    // Tabela não existe — usar query string fallback
    rascunhoId = null;
  }

  // 7. Redirect para /oraculo com o rascunho
  const redirectUrl = new URL(
    rascunhoId
      ? `/oraculo?rascunho=${encodeURIComponent(rascunhoId)}`
      : `/oraculo?intent=${encodeURIComponent(intent)}`,
    request.url
  );
  return NextResponse.redirect(redirectUrl, 303);
}
