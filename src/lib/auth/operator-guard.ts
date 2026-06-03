//
// Objetivo: padronizar o pattern de "página Operator precisa de login"
// em TODOS os page.tsx e route.ts do produto B2B.
//
// Convenção:
//   - Server Component (page.tsx) que serve Operator:
//       import { requireOperatorPage } from '@/lib/auth/operator-guard';
//       export default async function Page() {
//         const operator = await requireOperatorPage();
//         // ... usa operator
//       }
//
//   - API route (route.ts) que serve Operator:
//       import { requireOperatorApi } from '@/lib/auth/operator-guard';
//       export async function POST(request: NextRequest) {
//         const operatorOrResponse = await requireOperatorApi(request);
//         if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
//         const operator = operatorOrResponse;
//         // ... usa operator
//       }
//
// Por que dois helpers? Porque um redireciona (Server Component chama
// `redirect()` que lança) e o outro devolve um NextResponse 401 (Route
// Handler precisa devolver uma response, não lançar).
import type { Operator } from '@prisma/client';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { getOperatorFromRequest, getOperatorFromServerContext } from './operator-session';

/** Caminho de login do Operator (B2B). */
export const OPERATOR_LOGIN_PATH = '/cockpit/login';

/**
 * Server Component: garante que há um Operator logado.
 *
 * Resolve o Operator a partir dos cookies/headers da requisição atual
 * (JWT de access + check de session não-revogada). Se não houver,
 * REDIRECIONA para /cockpit/login (lança via `next/navigation`).
 *
 * Usar no topo de toda page.tsx que renderiza conteúdo Operator-only:
 *
 *   const operator = await requireOperatorPage();
 *   // prossegue com `operator` (já narrowed para `Operator`)
 */
export async function requireOperatorPage(): Promise<Operator> {
  const operator = await getOperatorFromServerContext();
  if (!operator) {
    redirect(OPERATOR_LOGIN_PATH);
  }
  return operator;
}

/**
 * Route Handler (API): garante que há um Operator logado.
 *
 * Variante "guard" do `getOperatorFromRequest` para uso em route.ts.
 * Devolve `Operator` se autenticado, ou `NextResponse` 401 se não.
 *
 *   const operatorOrResponse = await requireOperatorApi(request);
 *   if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
 *   const operator = operatorOrResponse;
 *
 * Defense in depth (Fase 17): NUNCA confiar no `userId` / `operatorId`
 * que veio no body da requisição. SEMPRE pegar do cookie validado.
 */
export async function requireOperatorApi(request: NextRequest): Promise<Operator | NextResponse> {
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
/**
 * Route Handler (API): garante que há um Operator logado COM role=ADMIN.
 *
 * Devolve `Operator` ( narrowed para ADMIN) se autenticado como admin,
 * ou `NextResponse` 403 Forbidden caso contrário.
 *
 *   const operatorOrResponse = await requireAdminApi(request);
 *   if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
 *   const admin = operatorOrResponse; // role === 'ADMIN'
 */
export async function requireAdminApi(request: NextRequest): Promise<Operator | NextResponse> {
  const operator = await getOperatorFromRequest(request);
  if (!operator) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }
  if (operator.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
  }
  return operator;
}
