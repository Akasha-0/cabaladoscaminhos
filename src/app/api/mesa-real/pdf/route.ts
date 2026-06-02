// src/app/api/mesa-real/pdf/route.ts
// POST /api/mesa-real/pdf
// Retorna os dados necessários para o cliente gerar o PDF do dossiê.
// Não gera o PDF no servidor — mantém o servidor leve.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';

// Tipos que o cliente espera
const pdfRequestSchema = z.object({
  readingId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  // 1. Autenticar
  const auth = await requireOperator(request);
  if (auth instanceof NextResponse) return auth;

  // 2. Validar input
  let body: z.infer<typeof pdfRequestSchema>;
  try {
    body = pdfRequestSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'readingId é obrigatório' }, { status: 400 });
  }

  // 3. Buscar leitura + client + report + matrixData
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

  // 4. Verificar propriedade
  if (reading.operatorId !== auth.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  // 5. Verificar que há dossiê gerado
  if (!reading.report) {
    return NextResponse.json({ error: 'Dossiê ainda não foi gerado' }, { status: 400 });
  }

  // 6. Retornar dados para o cliente montar o PDF
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
