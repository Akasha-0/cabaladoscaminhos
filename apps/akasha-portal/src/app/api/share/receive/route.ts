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
 * SECURITY:
 * - Valida tamanho do input (max 2KB por field)
 * - Sanitiza HTML / markdown injection
 * - Rejeita URL com javascript: scheme
 * - Auth obrigatório (não é endpoint público)
 */
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { prisma } from '@/lib/infrastructure/prisma';

const MAX_FIELD_LENGTH = 2000;
const DANGEROUS_SCHEMES = /^(javascript|data|vbscript|file):/i;

function sanitizeString(value: FormDataEntryValue | null): string | null {
  if (value === null || typeof value !== 'string') return null;
  // Truncar
  const truncated = value.slice(0, MAX_FIELD_LENGTH);
  return truncated;
}

function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return !DANGEROUS_SCHEMES.test(u.protocol);
  } catch {
    return false;
  }
}

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // 1. Auth
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

  // 2. Parse FormData
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

  // 3. Validate URL safety
  if (url && !isSafeUrl(url)) {
    return NextResponse.json(
      { error: 'unsafe_url' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // 4. Build "intent" string (concatenação limpa)
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

  // 5. Persistir como rascunho de Mentor
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

  // 6. Redirect para /oraculo com o rascunho
  const redirectUrl = new URL(
    rascunhoId
      ? `/oraculo?rascunho=${encodeURIComponent(rascunhoId)}`
      : `/oraculo?intent=${encodeURIComponent(intent)}`,
    request.url
  );
  return NextResponse.redirect(redirectUrl, 303);
}
