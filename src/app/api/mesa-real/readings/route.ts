// ============================================================
// READINGS API - Cabala Dos Caminhos
// Cockpit Oracular - Mesa Real Reading Management
// ============================================================
// Fase 17: rotas de leitura são Operator-only (Doc 16 AD-03). O
// `userId`/`clientId` na URL é só filtro — a autorização vem sempre
// do cookie de sessão, nunca do body.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOperator } from '@/lib/auth/operator-session';
import {
  createReading,
  getReading,
  getReadingsByClient,
  getReadingsByUser,
  updateMatrixData,
  updateReadingStatus,
  deleteReading,
  saveReport,
  getReportByReading,
} from '@/lib/db/reading-actions';

// ============================================================
// ROUTE HANDLERS
// ============================================================

// Schema for reading creation
const createReadingSchema = z.object({
  clientId: z.string().min(1),
  userId: z.string().min(1),
  matrixData: z.record(z.any()).optional(),
});

const matrixDataSchema = z.record(z.any());

// ============================================================
// GET /api/mesa-real/readings
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOperator(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const readingId = searchParams.get('readingId');
    const clientId = searchParams.get('clientId');
    const userId = searchParams.get('userId');

    if (readingId) {
      const reading = await getReading(readingId);
      if (!reading) {
        return NextResponse.json(
          { error: 'Leitura não encontrada' },
          { status: 404 }
        );
      }
      return NextResponse.json({ reading });
    }

    if (clientId) {
      const readings = await getReadingsByClient(clientId);
      return NextResponse.json({ readings });
    }

    if (userId) {
      const readings = await getReadingsByUser(userId);
      return NextResponse.json({ readings });
    }

    // Get report by readingId
    const reportReadingId = searchParams.get('reportFor');
    if (reportReadingId) {
      const report = await getReportByReading(reportReadingId);
      return NextResponse.json({ report });
    }

    return NextResponse.json(
      { error: 'readingId, clientId, ou userId é obrigatório' },
      { status: 400 }
    );

  } catch (error) {
    console.error('GET /api/mesa-real/readings error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar leituras' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/mesa-real/readings - Create reading or save report
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const auth = await requireOperator(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'saveReport') {
      // Save report from LLM
      const report = await saveReport({
        readingId: data.readingId,
        content: data.content,
        pdfUrl: data.pdfUrl,
      });
      return NextResponse.json({ report });
    }

    // Create new reading
    const parseResult = createReadingSchema.safeParse(data);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const reading = await createReading({
      clientId: parseResult.data.clientId,
      userId: parseResult.data.userId,
      matrixData: parseResult.data.matrixData,
    });

    return NextResponse.json({ reading }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/mesa-real/readings error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar leitura' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH /api/mesa-real/readings - Update matrix data or status
// ============================================================
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOperator(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { readingId, matrixData, status } = body;

    if (!readingId) {
      return NextResponse.json(
        { error: 'readingId é obrigatório' },
        { status: 400 }
      );
    }

    if (matrixData) {
      // Update matrix data
      const updated = await updateMatrixData(readingId, matrixData);
      return NextResponse.json({ reading: updated });
    }

    if (status) {
      // Update status
      const validStatuses = ['PENDING', 'COMPLETED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Status inválido. Use PENDING ou COMPLETED' },
          { status: 400 }
        );
      }
      const updated = await updateReadingStatus(readingId, status);
      return NextResponse.json({ reading: updated });
    }

    return NextResponse.json(
      { error: 'matrixData ou status é obrigatório' },
      { status: 400 }
    );

  } catch (error) {
    console.error('PATCH /api/mesa-real/readings error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar leitura' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/mesa-real/readings
// ============================================================
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireOperator(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const readingId = searchParams.get('readingId');

    if (!readingId) {
      return NextResponse.json(
        { error: 'readingId é obrigatório' },
        { status: 400 }
      );
    }

    await deleteReading(readingId);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('DELETE /api/mesa-real/readings error:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar leitura' },
      { status: 500 }
    );
  }
}
