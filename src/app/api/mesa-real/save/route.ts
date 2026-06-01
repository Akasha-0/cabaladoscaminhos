// ============================================================
// API ROUTE — Salvar Leitura Completa
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface CasaData {
  carta: { numero: number; nome: string; significado: string } | null;
  odu: { numero: number; nome: string; significado: string } | null;
}

interface MatrixData {
  [key: number]: CasaData | null;
}

interface SaveReadingRequest {
  clientId: string;
  matrixData: MatrixData;
}

function isValidMatrixData(data: unknown): data is MatrixData {
  if (typeof data !== 'object' || data === null) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SaveReadingRequest;

    // Validate required fields
    if (!body.clientId) {
      return NextResponse.json(
        { error: 'clientId é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.matrixData || !isValidMatrixData(body.matrixData)) {
      return NextResponse.json(
        { error: 'matrixData é obrigatório' },
        { status: 400 }
      );
    }

    // Validate that at least one house is filled
    const filledHouses = Object.values(body.matrixData).filter(
      (house) => house?.carta && house?.odu
    );

    if (filledHouses.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos uma casa deve estar preenchida' },
        { status: 400 }
      );
    }

    // TODO: Save to database using Prisma
    // const reading = await prisma.reading.create({
    //   data: {
    //     clientId: body.clientId,
    //     userId: getCurrentUserId(),
    //     matrixData: body.matrixData as Json,
    //     status: 'draft',
    //   },
    // });

    return NextResponse.json({
      success: true,
      filledHouses: filledHouses.length,
      message: 'Leitura salva com sucesso',
    });
  } catch (error) {
    console.error('Error saving reading:', error);
    return NextResponse.json(
      { error: 'Erro interno ao salvar leitura' },
      { status: 500 }
    );
  }
}