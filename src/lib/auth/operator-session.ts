// src/lib/auth/operator-session.ts
// Resolução da sessão do Operator (terapeuta) — Fase 8 com JWT real.
//
// Fluxo (ordem de precedência):
//   0. COCKPIT_AUTH_BYPASS=true → Operator MOCK (bypass wide-open, dev only).
//   0. COCKPIT_BYPASS_TOKEN=<token> + token no cookie/header → MOCK (Fase 510).
//   1. Cookie `cockpit_session` (JWT assinado) — caminho produção.
//   2. Header `x-dev-operator-id` — DEV ONLY (requer ALLOW_DEV_AUTH_BYPASS=true).
//
// AVISO: Não use NODE_ENV para decisões de auth — preview/staging deployments
// podem ter NODE_ENV != 'production' mas serem publicamente acessíveis.
// Sempre use flags explícitas (COCKPIT_AUTH_BYPASS, COCKPIT_BYPASS_TOKEN,
// ALLOW_DEV_AUTH_BYPASS) para habilitar comportamento dev.
//
// A verificação do JWT é obrigatória: se o cookie existe mas o token é
// inválido/expirado/adulterado, é ignorado (cai pra null → 401).
//
// Helpers de Server Components / Server Actions ficam em
// `getOperatorFromServerContext` (mesma precedência).

import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Operator } from '@prisma/client';
import {
  OPERATOR_TOKEN_COOKIE,
  verifyOperatorToken,
} from './operator-jwt';
import { isSessionActive } from './operator-sessions';

const DEV_HEADER = 'x-dev-operator-id';
const BYPASS_HEADER = 'x-cockpit-bypass';
const BYPASS_COOKIE = 'cockpit_bypass';

// ============================================
// COCKPIT_AUTH_BYPASS (Fase 509)
// COCKPIT_BYPASS_TOKEN (Fase 510)
// ============================================
// COCKPIT_AUTH_BYPASS=true → Operator MOCK para qualquer requisição.
//   Wide-open. Use apenas em dev.
//
// COCKPIT_BYPASS_TOKEN=<token> → Operator MOCK apenas se a requisição
//   carregar o mesmo token em cookie `cockpit_bypass` ou header
//   `x-cockpit-bypass`. Modo mais granular: você controla no browser
//   (cookie persiste, header para curl).
//
// SEGURANÇA:
//   - Highest precedence — ganha de cookie JWT e dev header.
//   - Hard-refused em NODE_ENV=production (mesmo se as vars vazarem).
//   - Mock é ADMIN (acesso total ao cockpit + APIs admin).
//   - Reverter: unset as vars + reiniciar dev server.
//
// Não usar como mecanismo de "login permanente" — é para destravar
// dev, não para substituir o sistema de auth real.
// ============================================
const MOCK_OPERATOR_ID = 'cockpit-bypass-dev';
const MOCK_OPERATOR_EMAIL = 'dev-bypass@cockpit.local';
const MOCK_OPERATOR_NAME = 'Dev Bypass (COCKPIT_AUTH_BYPASS)';

/** Indica se o bypass wide-open está habilitado (COCKPIT_AUTH_BYPASS=true). */
export function isCockpitAuthBypassEnabled(): boolean {
  if (process.env.COCKPIT_AUTH_BYPASS !== 'true') return false;
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[operator-session] COCKPIT_AUTH_BYPASS refused: NODE_ENV=production'
    );
    return false;
  }
  return true;
}

/** Indica se o modo token está configurado (COCKPIT_BYPASS_TOKEN não-vazio). */
export function isCockpitBypassTokenConfigured(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  const t = process.env.COCKPIT_BYPASS_TOKEN;
  return typeof t === 'string' && t.length > 0;
}

/** Retorna o token configurado (ou null se não houver). Usado pelo banner. */
export function getCockpitBypassTokenForDisplay(): string | null {
  return isCockpitBypassTokenConfigured()
    ? process.env.COCKPIT_BYPASS_TOKEN ?? null
    : null;
}

/** Lê o token de bypass do request: header primeiro, depois cookie. */
function readBypassTokenFromRequest(request: NextRequest): string | null {
  return (
    request.headers.get(BYPASS_HEADER) ??
    request.cookies.get(BYPASS_COOKIE)?.value ??
    null
  );
}

/** Lê o token de bypass do server context (sem NextRequest explícito). */
async function readBypassTokenFromServerContext(): Promise<string | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  return (
    headerStore.get(BYPASS_HEADER) ??
    cookieStore.get(BYPASS_COOKIE)?.value ??
    null
  );
}

/** Operator mock in-memory para qualquer modo de bypass. */
function buildBypassOperator(): Operator {
  return {
    id: MOCK_OPERATOR_ID,
    email: MOCK_OPERATOR_EMAIL,
    name: MOCK_OPERATOR_NAME,
    passwordHash: '!bypass-no-password!',
    role: 'ADMIN',
    createdAt: new Date(0),
    updatedAt: new Date(0),
    failedLoginAttempts: 0,
    lockedUntil: null,
  } as Operator;
}

/**
 * Comparação constant-ish-time de dois tokens. Length-mismatch fast-fail
 * (não conseguimos esconder o length de qualquer jeito); depois varre
 * todos os bytes para não vazar posição da primeira diferença.
 */
function tokenMatches(requestToken: string, envToken: string): boolean {
  if (requestToken.length !== envToken.length) return false;
  let mismatch = 0;
  for (let i = 0; i < requestToken.length; i++) {
    mismatch |= requestToken.charCodeAt(i) ^ envToken.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Lê o token JWT do cookie da requisição.
 * Retorna `null` se o cookie não existir ou o token for inválido.
 */
async function readJwtFromRequest(_request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(OPERATOR_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Lê o operatorId do header de fallback para dev local.
 * Requer ALLOW_DEV_AUTH_BYPASS=true explicitamente — não usa NODE_ENV.
 */
async function readDevHeaderFromRequest(request: NextRequest): Promise<string | null> {
  if (process.env.ALLOW_DEV_AUTH_BYPASS !== 'true') return null;
  return request.headers.get(DEV_HEADER);
}

/**
 * Resolve o Operator autenticado para a requisição.
 * Retorna `null` se não houver identificador válido ou se o operator
 * não existir no banco.
 */
export async function getOperatorFromRequest(
  request: NextRequest
): Promise<Operator | null> {
  // 0a) Bypass wide-open (COCKPIT_AUTH_BYPASS=true) — ver bloco no topo
  if (isCockpitAuthBypassEnabled()) return buildBypassOperator();

  // 0b) Bypass por token (COCKPIT_BYPASS_TOKEN) — só se o request traz o token
  if (isCockpitBypassTokenConfigured()) {
    const envToken = process.env.COCKPIT_BYPASS_TOKEN!;
    const requestToken = readBypassTokenFromRequest(request);
    if (requestToken && tokenMatches(requestToken, envToken)) {
      return buildBypassOperator();
    }
  }

  // 1) Cookie JWT (caminho de produção)
  const token = await readJwtFromRequest(request);
  if (token) {
    // Fase 15: /me só aceita access token. Refresh token aqui = 401
    // (deve usar POST /refresh).
    const payload = verifyOperatorToken(token, 'access');
    if (payload) {
      // Fase 13: verifica também se a sessão não foi revogada/expirada
      // (logout imediato). Falha aqui → null (= 401). DB error →
      // fail-open (não bloqueia o usuário por causa de DB down).
      let sessionActive = true;
      try {
        sessionActive = await isSessionActive(token);
      } catch (err) {
        console.error('[operator-session] session check failed', err);
      }
      if (!sessionActive) return null;
      return loadOperator(payload.sub);
    }
    // Token inválido — não tenta o dev header (cookie adulterado/expirado
    // indica tentativa de bypass; cai direto pra 401).
    return null;
  }

  // 2) Dev header (apenas com ALLOW_DEV_AUTH_BYPASS=true explícito)
  const devOperatorId = await readDevHeaderFromRequest(request);
  if (devOperatorId) {
    return loadOperator(devOperatorId);
  }

  return null;
}

/** Carrega Operator do DB; tolera falhas de conexão. */
async function loadOperator(id: string): Promise<Operator | null> {
  try {
    return await prisma.operator.findUnique({ where: { id } });
  } catch (err) {
    console.error('[operator-session] DB lookup failed', err);
    return null;
  }
}

/**
 * Variante "guard": resolve o Operator OU devolve um NextResponse 401.
 *
 *   const operatorOrResponse = await requireOperator(request);
 *   if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
 *   const operator = operatorOrResponse; // narrowed to Operator
 */
export async function requireOperator(
  request: NextRequest
): Promise<Operator | NextResponse> {
  const operator = await getOperatorFromRequest(request);
  if (!operator) {
    return NextResponse.json(
      {
        error: 'Não autenticado',
        message:
          'Operator não identificado. Faça login em /api/operator/auth/login para obter o cookie de sessão.',
      },
      { status: 401 }
    );
  }
  return operator;
}

// ============================================================================
// Helpers de servidor (sem NextRequest)
// ============================================================================

/**
 * Versão para Server Components / Server Actions: lê dos cookies/headers
 * da requisição atual sem precisar do NextRequest explícito.
 *
 * Fase 14: Server-side auth gate — use isto em page.tsx e layouts
 * protegidos para garantir que o conteúdo não vaze antes do JS hidratar.
 * Comportamento idêntico ao `getOperatorFromRequest` (JWT + session check).
 */
export async function getOperatorFromServerContext(): Promise<Operator | null> {
  // 0a) Bypass wide-open
  if (isCockpitAuthBypassEnabled()) return buildBypassOperator();

  // 0b) Bypass por token
  if (isCockpitBypassTokenConfigured()) {
    const envToken = process.env.COCKPIT_BYPASS_TOKEN!;
    const requestToken = await readBypassTokenFromServerContext();
    if (requestToken && tokenMatches(requestToken, envToken)) {
      return buildBypassOperator();
    }
  }

  const cookieStore = await cookies();
  const headerStore = await headers();

  // 1) Cookie JWT (caminho de produção)
  const token = cookieStore.get(OPERATOR_TOKEN_COOKIE)?.value ?? null;
  if (token) {
    // Fase 15: server context só aceita access token (mesma regra do /me).
    const payload = verifyOperatorToken(token, 'access');
    if (payload) {
      // Fase 13: valida não-revogação da session. DB error → fail-open
      // (DB down não deve derrubar todos os usuários logados).
      let sessionActive = true;
      try {
        sessionActive = await isSessionActive(token);
      } catch (err) {
        console.error('[operator-session] session check failed', err);
      }
      if (!sessionActive) return null;
      return loadOperator(payload.sub);
    }
    // JWT inválido — não tenta dev header (prevenção de bypass)
    return null;
  }

  // 2) Dev header (requer ALLOW_DEV_AUTH_BYPASS=true explicitamente)
  if (process.env.ALLOW_DEV_AUTH_BYPASS === 'true') {
    const devId = headerStore.get(DEV_HEADER);
    if (devId) return loadOperator(devId);
  }

  return null;
}
