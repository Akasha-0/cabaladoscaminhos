import { NextRequest, NextResponse } from 'next/server';
import { interpretacoesNumerologia, getInterpretacao, InterpretacaoNumerologia } from '@/lib/numerologia/calculos';
import { numberMeanings, NumberMeaning } from '@/lib/numerologia/number-meanings';
import { getAllNumbers } from '@/lib/numerologia/number-meanings';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const numero = searchParams.get('numero');

  const headers = new Headers();
  headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=172800');

  try {
    if (numero) {
      const num = parseInt(numero, 10);
      if (isNaN(num) || num < 1 || num > 33) {
        return NextResponse.json(
          { error: 'Número deve estar entre 1 e 33' },
          { status: 400, headers }
        );
      }

      const interpretacao: InterpretacaoNumerologia = getInterpretacao(num);
      const significado: NumberMeaning | undefined = numberMeanings[num];

      return NextResponse.json({
        ...interpretacao,
        planeta: significado?.planeta || null,
        sefira: significado?.sefira || null,
        arco: significado?.arco || null,
        cor: significado?.cor || null,
        pedra: significado?.pedra || null,
        qualidade: significado?.qualidade || null,
        palavraChave: significado?.palavraChave || null,
        affirmation: significado?.affirmation || null,
        timestamp: new Date().toISOString()
      }, { headers });
    }

    const todosNumeros = getAllNumbers();
    const dadosCompletos = todosNumeros.map(num => {
      const interpretacao = getInterpretacao(num);
      const significado = numberMeanings[num];
      return {
        ...interpretacao,
        planeta: significado?.planeta || null,
        sefira: significado?.sefira || null,
        arco: significado?.arco || null,
        cor: significado?.cor || null,
        pedra: significado?.pedra || null,
        qualidade: significado?.qualidade || null,
        palavraChave: significado?.palavraChave || null,
        affirmation: significado?.affirmation || null,
      };
    });

    return NextResponse.json({
      total: dadosCompletos.length,
      numeros: dadosCompletos,
      timestamp: new Date().toISOString()
    }, { headers });
  } catch (error) {
    console.error('Erro ao buscar dados de numerologia:', error);
    return NextResponse.json(
      { error: 'Erro ao processar dados numerológicos' },
      { status: 500, headers }
    );
  }
}
