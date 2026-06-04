// ============================================================
// API ROUTE — Operator atual (Fase 8) + mudança de senha (Fase 60)
// ============================================================
// GET /api/operator/auth/me
//   Devolve o Operator autenticado. Útil para a UI do Cockpit checar
//   sessão ativa no boot / refresh.
//
// PATCH /api/operator/auth/me
//   Altera a senha do operator autenticado.
//   - Valida a senha atual (bcrypt compare)
//   - Hash e persiste a nova senha (bcrypt cost 12)
//   - Log PASSWORD_CHANGED (fire-and-forget)
//   - Revoga todas as outras sessões (força re-login no dispositivo atual)
//
//   Body: { currentPassword: string, newPassword: string }

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';
import { logSecurityEvent } from '@/lib/auth/audit-service';
import { OPERATOR_TOKEN_COOKIE } from '@/lib/auth/operator-jwt';
import { hashOperatorToken } from '@/lib/auth/operator-sessions';

const BCRYPT_COST = 12;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(8, 'Nova senha deve ter ao menos 8 caracteres')
    .max(200, 'Nova senha muito longa'),
});

// ============================================================
// GET — operador autenticado
// ============================================================

export async function GET(request: NextRequest) {
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  // Sem passwordHash na response
  return NextResponse.json({
    operator: {
      id: operator.id,
      email: operator.email,
      name: operator.name,
      role: operator.role,
    },
  });
}

// ============================================================
// PATCH — alterar senha
// ============================================================

export async function PATCH(request: NextRequest) {
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { currentPassword, newPassword } = parsed.data;

  // Carrega o operator com passwordHash para verificar a senha atual
  const operatorRecord = await prisma.operator.findUnique({
    where: { id: operator.id },
    select: { id: true, passwordHash: true },
  });

  if (!operatorRecord) {
    return NextResponse.json({ error: 'Operador não encontrado' }, { status: 401 });
  }

  // Verifica a senha atual
  const currentMatch = await bcrypt.compare(currentPassword, operatorRecord.passwordHash);
  if (!currentMatch) {
    return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 });
  }

  // Hash da nova senha
  const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_COST);

  // Identifica a sessão atual para preservá-la após a revogação
  const cookieStore = await cookies();
  const currentAccessToken = cookieStore.get(OPERATOR_TOKEN_COOKIE)?.value ?? null;
  const currentTokenHash = currentAccessToken ? hashOperatorToken(currentAccessToken) : null;

  // Atualiza senha E revoga outras sessões em transação
  await prisma.$transaction(async (tx) => {
    // 1) Atualiza a senha
    await tx.operator.update({
      where: { id: operator.id },
      data: { passwordHash: newPasswordHash },
    });

    // 2) Revoga todas as sessões EXCETO a atual
    await tx.operatorSession.updateMany({
      where: {
        operatorId: operator.id,
        revokedAt: null,
        ...(currentTokenHash ? { tokenHash: { not: currentTokenHash } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  });

  // PASSWORD_CHANGED — fire-and-forget, nunca bloqueia
  logSecurityEvent({
    type: 'PASSWORD_CHANGED',
    operatorId: operator.id,
    ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null,
    userAgent: request.headers.get('user-agent'),
  });

  return NextResponse.json({
    message: 'Senha alterada com sucesso. Todas as outras sessões foram revogadas.',
  });
}
