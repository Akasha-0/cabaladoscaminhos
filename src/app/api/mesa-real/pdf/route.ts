// src/app/api/mesa-real/pdf/route.ts
// POST /api/mesa-real/pdf
// Retorna os dados necessários para o cliente gerar o PDF do dossiê.
// Não gera o PDF no servidor — mantém o servidor leve.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';
import { checkOperatorRateLimit, OPERATOR_RATE_LIMITS } from '@/lib/auth/rate-limit';

const OPERATOR_LIMIT = OPERATOR_RATE_LIMITS['pdf-export'].max;
const OPERATOR_WINDOW = OPERATOR_RATE_LIMITS['pdf-export'].windowSeconds;

// Tipos que o cliente espera
const pdfRequestSchema = z.object({
  readingId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  // 1. Autenticar
  const auth = await requireOperator(request);
  if (auth instanceof NextResponse) return auth;

  // 2. Rate-limit por operator
  const rlResult = await checkOperatorRateLimit(
    auth.id,
    'pdf-export',
    OPERATOR_LIMIT,
    OPERATOR_WINDOW
  );
  if (!rlResult.allowed) {
    return NextResponse.json(
      { error: 'Limite de operações por operador excedido. Tente novamente mais tarde.', retryAfter: rlResult.retryAfterSeconds },
      { status: 429, headers: { 'X-RateLimit-Limit': rlResult.limit.toString(), 'X-RateLimit-Remaining': rlResult.remaining.toString(), 'X-RateLimit-Reset': rlResult.resetAt.toString(), 'Retry-After': rlResult.retryAfterSeconds.toString() } }
    );
  }

  // 3. Validar input
  let body: z.infer<typeof pdfRequestSchema>;
  try {
    body = pdfRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'readingId é obrigatório' }, { status: 400 });
  }

  // 4. Buscar leitura + client + report + matrixData
  const reading = await prisma.reading.findUnique({
    where: { id: body.readingId },
    include: {
      client: {
        select: {
          fullName: true,
          birthDate: true,
          astrologyMap: true,
          kabalisticMap: true,
          tantricMap: true,
          oduBirth: true,
        },
      },
      report: {
        select: {
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!reading) {
    return NextResponse.json({ error: 'Leitura não encontrada' }, { status: 404 });
  }

  // 5. Verificar propriedade
  if (reading.operatorId !== auth.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  // 6. Verificar que há dossiê gerado
  if (!reading.report) {
    return NextResponse.json({ error: 'Dossiê ainda não foi gerado' }, { status: 400 });
  }

  // 7. Retornar dados para o cliente montar o PDF
  return NextResponse.json({
    clientName: reading.client.fullName,
    readingDate: reading.date.toISOString(),
    reportCreatedAt: reading.report.createdAt.toISOString(),
    matrixData: reading.matrixData as Record<string, { carta: number; odu: number } | null>,
    reportContent: reading.report.content,
    maps: {
      astrology: reading.client.astrologyMap,
      kabalistic: reading.client.kabalisticMap,
      tantric: reading.client.tantricMap,
      odu: reading.client.oduBirth,
    },
  });
}
