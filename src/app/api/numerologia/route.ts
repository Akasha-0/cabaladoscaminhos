import { NextRequest, NextResponse } from 'next/server';
import { calcularPitagorica, calcularCaldeia, calcularCabalistica, calcularTantrica } from '@/lib/numerologia/calculos';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');
  const nome = searchParams.get('nome');
  const data = searchParams.get('data');

  const headers = new Headers();
  headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200');

  if (!nome) {
    return NextResponse.json(
      { error: 'Parâmetro "nome" é obrigatório' },
      { status: 400, headers }
    );
  }

  try {
    const pitagorica = calcularPitagorica(nome);
    const caldeia = calcularCaldeia(nome);
    const cabalistica = calcularCabalistica(nome);
    const tantrica = data ? calcularTantrica(data) : null;

    switch (tipo?.toLowerCase()) {
      case 'pitagorica':
        return NextResponse.json({
          tipo: 'pitagorica',
          numero: pitagorica,
          timestamp: new Date().toISOString()
        }, { headers });

      case 'caldeia':
        return NextResponse.json({
          tipo: 'caldeia',
          numero: caldeia,
          timestamp: new Date().toISOString()
        }, { headers });

      case 'cabalistica':
        return NextResponse.json({
          tipo: 'cabalistica',
          numero: cabalistica,
          timestamp: new Date().toISOString()
        }, { headers });

      case 'tantrica':
        if (!data) {
          return NextResponse.json(
            { error: 'Parâmetro "data" é obrigatório para cálculo tantrico' },
            { status: 400, headers }
          );
        }
        return NextResponse.json({
          tipo: 'tantrica',
          numero: tantrica,
          data: data,
          timestamp: new Date().toISOString()
        }, { headers });

      case null:
      case 'todos':
        return NextResponse.json({
          tipo: 'todos',
          pitagorica,
          caldeia,
          cabalistica,
          tantrica,
          timestamp: new Date().toISOString()
        }, { headers });

      default:
        return NextResponse.json(
          { error: `Tipo "${tipo}" não reconhecido. Tipos disponíveis: pitagorica, caldeia, cabalistica, tantrica, todos` },
          { status: 400, headers }
        );
    }
  } catch (error) {
    console.error('Erro no cálculo de numerologia:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cálculo numerológico' },
      { status: 500, headers }
    );
  }
}
