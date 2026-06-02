// ============================================================
// API ROUTE — Revogar 1 sessão ACCESS do Operator (Fase 16)
// ============================================================
// DELETE /api/operator/auth/sessions/[id]
// Marca a OperatorSession (ACCESS) como revogada. Só permite
// revogar sessions do PRÓPRIO operator — qualquer tentativa de
// revogar session de outro operator → 404 (não 403, para não
// vazar a existência).
//
// Respostas:
//   200 — { success: true, id }
//   401 — operator não autenticado
//   404 — session não existe, não é ACCESS, ou pertence a outro operator
//
// Edge case importante: a UI chama essa rota para a sessão atual
// também (ex: botão "Sair deste"). Como o cookie httpOnly é
// re-emitido em /refresh, a sessão "atual" só é invalidada quando
// o access token expirar (15min) ou o refresh rotacionar. Para
// "sair de verdade", o cliente deve chamar /logout — mas o /sessions/[id]
// já garante que aquele token específico não funciona mais.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  const { id } = await params;
  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: 'ID da sessão inválido' },
      { status: 400 }
    );
  }

  // 1) Procura a session por ID — restrito a ACCESS do operator atual
  //    Combinando o filtro na própria query evitamos um round-trip
  //    (e a chance de TOCTOU entre o lookup e o update).
  const session = await prisma.operatorSession.findFirst({
    where: {
      id,
      operatorId: operator.id, // segurança: não revoga de outro operator
      type: 'ACCESS', // UI não expõe REFRESH, mas reforça a invariante
    },
    select: { id: true, revokedAt: true },
  });

  if (!session) {
    return NextResponse.json(
      { error: 'Sessão não encontrada' },
      { status: 404 }
    );
  }

  // 2) Idempotente: já revogada → 200 com success=true
  if (session.revokedAt !== null) {
    return NextResponse.json({ success: true, id });
  }

  // 3) Soft revoke — preserva linha para auditoria
  await prisma.operatorSession.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true, id });
}
