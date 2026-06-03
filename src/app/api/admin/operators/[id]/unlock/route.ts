// src/app/api/admin/operators/[id]/unlock/route.ts
// Fase 26 — Admin unlock endpoint
//
// POST /api/admin/operators/[id]/unlock
// Admin only: reseta o contador de tentativas falhas e remove o lockout
// da conta do Operator especificado por ID.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/auth/operator-guard';
import { unlockAccount } from '@/lib/auth/account-lockout';

const UnlockParamsSchema = z.object({
  id: z.string().min(1, 'ID do operador é obrigatório'),
});

/**
 * POST — Unlock an operator's account (admin only).
 *
 * Este endpoint permite a um ADMIN desbloquear manualmente uma conta
 * que está temporariamente bloqueada por excesso de tentativas falhas.
 *
 * Aceita apenas o ID do Operator na URL. Não aceita body.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1) Verificar se é admin
  const adminOrResponse = await requireAdminApi(request);
  if (adminOrResponse instanceof NextResponse) return adminOrResponse;

  // 2) Validar ID do operador
  const { id } = UnlockParamsSchema.parse(await params);

  // 3) Verificar se o operador existe
  const operator = await prisma.operator.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!operator) {
    return NextResponse.json(
      { error: 'Operador não encontrado' },
      { status: 404 }
    );
  }

  // 4) Unlock — reseta contador e limpa lockedUntil
  await unlockAccount(operator.email);

  return NextResponse.json({
    success: true,
    message: `Conta de ${operator.name} (${operator.email}) desbloqueada com sucesso.`,
    operator: {
      id: operator.id,
      email: operator.email,
      name: operator.name,
    },
  });
}
