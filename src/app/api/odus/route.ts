import { NextRequest, NextResponse } from 'next/server';
import { calcularOduNascimento, odusData } from '@/lib/odus/calculos';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const data = searchParams.get('data');
  const tipo = searchParams.get('tipo');

  if (!data) {
    return NextResponse.json(
      { error: 'Parâmetro "data" é obrigatório' },
      { status: 400 }
    );
  }

  try {
    if (tipo === 'todos') {
      return NextResponse.json({
        odus: Object.values(odusData),
        timestamp: new Date().toISOString()
      });
    }

    const { principal, secundario } = calcularOduNascimento(data);

    return NextResponse.json({
      principal,
      secundario,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao calcular Odú:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cálculo de Odú' },
      { status: 500 }
    );
  }
}