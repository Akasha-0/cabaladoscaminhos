// ============================================================
// API ROUTE — Salvar Leitura Completa (Fase 7: cabeada ao Prisma)
// ============================================================
// Doc 04 §1 / Doc 06. Recebe { clientId, matrixData }, valida o
// operador autenticado, e cria a Reading (status PENDING) via Prisma.
//
// Auth: ver `src/lib/auth/operator-session.ts` — stub explícito (cookie
// `cockpit_session` OU header dev `x-dev-operator-id`). Quando o login
// real for cabeado, esta rota passa a exigir o cookie automaticamente.
//
// AD-17.2: Validação de unicidade das cartas — cada carta (1-36) só pode
// aparecer uma única vez na leitura (Grande Tableau).

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

// AD-17.2: Custom error class for card uniqueness violations
class DuplicateCardError extends Error {
  constructor(
    public readonly cardNumber: number,
    public readonly cardName: string,
    public readonly houses: number[]
  ) {
    super(`Carta "${cardName}" (#${cardNumber}) aparece em mais de uma casa: ${houses.join(', ')}`);
    this.name = 'DuplicateCardError';
  }
}

/**
 * Valida que não há cartas duplicadas no matrixData (AD-17.2).
 * Returns array of duplicate cards with their house positions.
 */
// fallow-ignore-next-line complexity
function validateCardUniqueness(matrixData: MatrixData): { valid: boolean; duplicates: DuplicateCardError[] } {
  const cardToHouses = new Map<number, { name: string; houses: number[] }>();

  // Collect all placed cards and their houses
  for (const [casa, data] of Object.entries(matrixData)) {
    if (data?.carta && data?.odu) {
      const cartaNum = data.carta.numero;
      const existing = cardToHouses.get(cartaNum);
      
      if (existing) {
        existing.houses.push(parseInt(casa, 10));
      } else {
        cardToHouses.set(cartaNum, {
          name: data.carta.nome,
          houses: [parseInt(casa, 10)],
        });
      }
    }
  }

  // Find cards that appear in multiple houses
  const duplicates: DuplicateCardError[] = [];
  for (const [cardNum, info] of cardToHouses.entries()) {
    if (info.houses.length > 1) {
      duplicates.push(new DuplicateCardError(cardNum, info.name, info.houses));
    }
  }

  return {
    valid: duplicates.length === 0,
    duplicates,
  };
}

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

  const matrixData = body.matrixData as MatrixData;

  // 3) AD-17.2: Validação de unicidade das cartas
  const uniquenessCheck = validateCardUniqueness(matrixData);
  if (!uniquenessCheck.valid) {
    const duplicateInfo = uniquenessCheck.duplicates.map((d) => ({
      cardNumber: d.cardNumber,
      cardName: d.cardName,
      houses: d.houses,
    }));

    return NextResponse.json(
      {
        error: 'Cartas duplicadas detectadas (AD-17.2)',
        message: 'Cada carta (1-36) só pode aparecer uma vez na leitura. Grande Tableau exige 36 cartas únicas.',
        duplicates: duplicateInfo,
      },
      { status: 400 }
    );
  }

  // 4) Verifica que o Client existe (FK constraint)
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

  // 5) Conta casas preenchidas
  const filledHouses = Object.values(matrixData).filter(
    (h) => h?.carta && h?.odu
  ).length;

  // 6) Cria a Reading
  const reading = await prisma.reading.create({
    data: {
      clientId: body.clientId,
      operatorId: operator.id,
      matrixData: matrixData as object,
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
