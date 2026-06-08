/**
 * /api/akasha/oraculo/iching — Akasha v0.0.5 T8
 *
 * Sorteio do hexagrama I-Ching no /oraculo. Opt-in LGPD: exige
 * `user.ichingEnabled = true`. Custa 1 crédito.
 *
 * Persiste o hexagrama sorteado em `Consultation.hexagram` (string
 * com metadados estruturados). Leitura cruzada com Cabala e Odu
 * fica como placeholder (T8 não cobre a interpretação).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';
import { getCreditBalance, addCredits } from '@/lib/application/akasha/stripe-akasha';
import { drawIchingHexagram } from '@/lib/domain/oracle/iching-draw';

const bodySchema = z.object({
  /** Seed opcional para sorteio determinístico (testes). */
  seed: z.number().int().optional(),
  /** ID de consultation existente (opcional). */
  consultationId: z.string().optional(),
});

const CREDIT_COST = 1;

export async function POST(request: NextRequest) {
  // 1. Auth
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  // 2. Validate body
  let parsed: z.infer<typeof bodySchema>;
  try {
    const raw = await request.json();
    parsed = bodySchema.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  }

  // 3. Opt-in LGPD
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ichingEnabled: true },
  });
  if (!user?.ichingEnabled) {
    return NextResponse.json(
      { error: 'Sorteio de I-Ching desativado. Ative o opt-in em /conta.' },
      { status: 403 }
    );
  }

  // 4. Credit balance
  const balance = await getCreditBalance(userId);
  if (balance < CREDIT_COST) {
    return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 402 });
  }

  // 5. Draw hexagram
  const draw = drawIchingHexagram(parsed.seed);

  // 6. Persist consultation (create or reuse)
  let consultation: { id: string };
  if (parsed.consultationId) {
    const existing = await prisma.consultation.findFirst({
      where: { id: parsed.consultationId, userId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }
    consultation = existing;
    // Atualiza o hexagrama da consultation existente
    await prisma.consultation.update({
      where: { id: consultation.id },
      data: { hexagram: JSON.stringify(draw) },
    });
  } else {
    const created = await prisma.consultation.create({
      data: {
        userId,
        title: `Sorteio de I-Ching — Hex. ${draw.hexagramNumber}`,
        hexagram: JSON.stringify(draw),
      },
      select: { id: true },
    });
    consultation = created;
  }

  // 7. Debit credit
  const { balance: newBalance } = await addCredits(userId, -CREDIT_COST, 'iching_draw');

  // 8. Resposta — leitura cruzada com Cabala e Odu é placeholder nesta T.
  return NextResponse.json({
    hexagram: draw,
    crossReadings: {
      cabala: null,
      odu: null,
    },
    consultationId: consultation.id,
    creditCost: CREDIT_COST,
    remainingBalance: newBalance,
  });
}
