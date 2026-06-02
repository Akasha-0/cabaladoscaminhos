// src/lib/auth/operator-session.ts
// Resolução da sessão do Operator (terapeuta) — Fase 8 com JWT real.
//
// Fluxo:
//   1. Cookie `cockpit_session` (JWT assinado) — caminho produção.
//   2. Header `x-dev-operator-id` — DEV/TEST ONLY (NODE_ENV !== 'production').
//      Permite testar sem login, mantém compat com testes da Fase 7.
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

/**
 * Lê o token JWT do cookie da requisição.
 * Retorna `null` se o cookie não existir ou o token for inválido.
 */
async function readJwtFromRequest(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(OPERATOR_TOKEN_COOKIE)?.value ?? null;
}

/**
 * Em dev/test, lê o operatorId do header de fallback.
 * Em produção, retorna sempre null (header desabilitado).
 */
async function readDevHeaderFromRequest(request: NextRequest): Promise<string | null> {
  if (process.env.NODE_ENV === 'production') return null;
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

  // 2) Dev header (apenas NODE_ENV !== 'production')
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
// fallow-ignore-next-line complexity
export async function getOperatorFromServerContext(): Promise<Operator | null> {
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

  // 2) Dev header (apenas NODE_ENV !== 'production')
  if (process.env.NODE_ENV !== 'production') {
    const devId = headerStore.get(DEV_HEADER);
    if (devId) return loadOperator(devId);
  }

  return null;
}
