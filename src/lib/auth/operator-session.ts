// src/lib/auth/operator-session.ts
// Resolução da sessão do Operator (terapeuta) a partir de uma requisição HTTP.
//
// Stub explícito (Doc 04 §1, Fase 7). O fluxo de login real (bcrypt + JWT
// + refresh token) ainda não está implementado; esta função marca o
// "ponto de integração" para que, quando o login for cabeado, TODAS as
// rotas cockpit passem a verificar o operador autenticado sem mudanças
// adicionais.
//
// Como identificar o operator (em ordem de precedência):
//   1. Cookie `cockpit_session` (setado pelo fluxo de login real — futuro).
//   2. Header `x-dev-operator-id` (DEV ONLY; permite testar sem login).
//   3. Caso contrário: null → 401.
//
// Esta camada NÃO faz a verificação de credencial — apenas lê um
// identificador e carrega o Operator do banco. A integridade do
// identificador é responsabilidade do cookie/header emitter.

import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Operator } from '@prisma/client';

const COOKIE_NAME = 'cockpit_session';
const DEV_HEADER = 'x-dev-operator-id';

/**
 * Lê o operatorId da requisição via cookie ou header de dev.
 * Retorna `null` se nenhum for encontrado.
 */
async function readOperatorIdFromRequest(request: NextRequest): Promise<string | null> {
  // 1) Cookie (padrão em produção — setado pelo fluxo de login)
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (fromCookie) return fromCookie;

  // 2) Header dev-only (úteis em testes e preview)
  const fromHeader = request.headers.get(DEV_HEADER);
  if (fromHeader) return fromHeader;

  return null;
}

/**
 * Resolve o Operator autenticado para a requisição.
 * Retorna `null` se não houver identificador válido ou se o operator
 * não existir no banco.
 */
export async function getOperatorFromRequest(
  request: NextRequest
): Promise<Operator | null> {
  const operatorId = await readOperatorIdFromRequest(request);
  if (!operatorId) return null;

  try {
    return await prisma.operator.findUnique({ where: { id: operatorId } });
  } catch (err) {
    // Log sem expor PII; mantém o helper resistente a falhas de DB.
    console.error('[operator-session] DB lookup failed', err);
    return null;
  }
}

/**
 * Variante "guard": resolve o Operator OU devolve um NextResponse 401.
 * Use em rotas que requerem operador autenticado:
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
          'Operator não identificado. Forneça o cookie `cockpit_session` ou o header `x-dev-operator-id` (dev only).',
      },
      { status: 401 }
    );
  }
  return operator;
}

// ============================================================================
// Helpers de servidor (sem NextRequest) — para uso em Server Components
// e Server Actions, onde a fonte do identificador é diferente.
// ============================================================================

/**
 * Versão para Server Components / Server Actions: lê dos cookies/headers
 * da requisição atual sem precisar do NextRequest explícito.
 */
export async function getOperatorFromServerContext(): Promise<Operator | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const operatorId =
    cookieStore.get(COOKIE_NAME)?.value ?? headerStore.get(DEV_HEADER);
  if (!operatorId) return null;

  try {
    return await prisma.operator.findUnique({ where: { id: operatorId } });
  } catch (err) {
    console.error('[operator-session] DB lookup failed', err);
    return null;
  }
}
