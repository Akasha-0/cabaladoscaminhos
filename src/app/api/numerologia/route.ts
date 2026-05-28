import { NextRequest, NextResponse } from 'next/server';
import { calcularPitagorica, calcularCaldeia, calcularCabalistica, calcularTantrica, calcularPitagoricaData, getInterpretacao } from '@/lib/numerologia/calculos';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');
  const nome = searchParams.get('nome');
  const data = searchParams.get('data');

  if (!tipo) {
    return NextResponse.json(
      { error: 'Parâmetro "tipo" é obrigatório' },
      { status: 400 }
    );
  }

  let numero: number | null = null;
  let interpretacao = null;

  try {
    switch (tipo.toLowerCase()) {
      case 'pitagorica':
        if (!nome) {
          return NextResponse.json({ error: 'Parâmetro "nome" é obrigatório para numerologia pitagórica' }, { status: 400 });
        }
        numero = calcularPitagorica(nome);
        break;

      case 'caldeia':
        if (!nome) {
          return NextResponse.json({ error: 'Parâmetro "nome" é obrigatório para numerologia caldeia' }, { status: 400 });
        }
        numero = calcularCaldeia(nome);
        break;

      case 'cabalistica':
        if (!nome) {
          return NextResponse.json({ error: 'Parâmetro "nome" é obrigatório para numerologia cabalística' }, { status: 400 });
        }
        numero = calcularCabalistica(nome);
        break;

      case 'tantrica':
        if (!data) {
          return NextResponse.json({ error: 'Parâmetro "data" é obrigatório para numerologia tântrica' }, { status: 400 });
        }
        numero = calcularTantrica(data);
        break;

      case 'pitagorica-data':
        if (!data) {
          return NextResponse.json({ error: 'Parâmetro "data" é obrigatório' }, { status: 400 });
        }
        numero = calcularPitagoricaData(data);
        break;

      case 'destino':
        if (!nome) {
          return NextResponse.json({ error: 'Parâmetro "nome" é obrigatório para número do destino' }, { status: 400 });
        }
        if (!data) {
          return NextResponse.json({ error: 'Parâmetro "data" é obrigatório para número do destino' }, { status: 400 });
        }
        const pitagorico = calcularPitagorica(nome);
        const tantrica = calcularTantrica(data);
        numero = somarDigitos(pitagorico + tantrica);
        break;

      default:
        return NextResponse.json(
          { error: `Tipo "${tipo}" não reconhecido. Tipos disponíveis: pitagorica, caldeia, cabalistica, tantrica, pitagorica-data, destino` },
          { status: 400 }
        );
    }

    if (numero !== null) {
      interpretacao = getInterpretacao(numero);
    }

    return NextResponse.json({
      tipo: tipo.toLowerCase(),
      numero,
      interpretacao,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no cálculo numerológico:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cálculo numerológico' },
      { status: 500 }
    );
  }
}

function somarDigitos(numero: number): number {
  while (numero > 9 && numero !== 11 && numero !== 22 && numero !== 33) {
    numero = numero.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return numero;
}