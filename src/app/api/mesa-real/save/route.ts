// ============================================================
// API ROUTE — Salvar Leitura Completa (Fase 7: cabeada ao Prisma)
// ============================================================
// Doc 04 §1 / Doc 06. Recebe { clientId, matrixData }, valida o
// operador autenticado, e cria a Reading (status PENDING) via Prisma.
//
// Auth: ver `src/lib/auth/operator-session.ts` — stub explícito (cookie
// `cockpit_session` OU header dev `x-dev-operator-id`). Quando o login
// real for cabeado, esta rota passa a exigir o cookie automaticamente.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';

interface CasaData {
  carta: { numero: number; nome: string; significado: string } | null;
  odu: { numero: number; nome: string; significado: string } | null;
}

type MatrixData = Record<number, CasaData | null>;

const saveReadingSchema = z.object({
  clientId: z.string().min(1, 'clientId é obrigatório'),
  matrixData: z.record(z.unknown()).refine(
    (data) => {
      if (typeof data !== 'object' || data === null) return false;
      // Pelo menos uma casa preenchida (carta + odu presentes)
      return Object.values(data as MatrixData).some(
        (h) => h && h.carta && h.odu
      );
    },
    { message: 'matrixData deve ter ao menos uma casa preenchida (carta + odu)' }
  ),
});

export async function POST(request: NextRequest) {
  // 1) Auth
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  // 2) Parse + validação
  let body: z.infer<typeof saveReadingSchema>;
  try {
    body = saveReadingSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  // 3) Verifica que o Client existe (FK constraint)
  const client = await prisma.client.findUnique({
    where: { id: body.clientId },
    select: { id: true },
  });
  if (!client) {
    return NextResponse.json(
      { error: `Cliente ${body.clientId} não encontrado` },
      { status: 404 }
    );
  }

  // 4) Conta casas preenchidas
  const filledHouses = Object.values(body.matrixData as MatrixData).filter(
    (h) => h?.carta && h?.odu
  ).length;

  // 5) Cria a Reading
  const reading = await prisma.reading.create({
    data: {
      clientId: body.clientId,
      operatorId: operator.id,
      matrixData: body.matrixData as object,
      status: 'PENDING',
    },
    include: { client: { select: { id: true, fullName: true } } },
  });

  return NextResponse.json(
    {
      success: true,
      reading,
      filledHouses,
      message: 'Leitura salva com sucesso',
    },
    { status: 201 }
  );
}
