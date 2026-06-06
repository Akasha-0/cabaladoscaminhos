// src/app/api/consult/history/route.ts
// GET /api/consult/history?consultationId=xxx
// Carrega as mensagens de uma consultation existente (para restaurar chat history).
import { NextRequest, NextResponse } from 'next/server';
import { requireOperator } from '@/lib/auth/operator-session';
import { getMessagesByConsultation } from '@/lib/db/consultation-actions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const op = await requireOperator(request);
  if (op instanceof NextResponse) return op;

  const { searchParams } = new URL(request.url);
  const consultationId = searchParams.get('consultationId');

  if (!consultationId) {
    return NextResponse.json(
      { error: 'consultationId é obrigatório' },
      { status: 400 }
    );
  }

  try {
    const messages = await getMessagesByConsultation(consultationId);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[consult/history] GET error:', err);
    return NextResponse.json(
      { error: 'Erro ao carregar histórico' },
      { status: 500 }
    );
  }
}
