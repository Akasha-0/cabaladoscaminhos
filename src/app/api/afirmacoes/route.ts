import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schema ───────────────────────────────────────────────────────────
const AfirmacaoQuerySchema = z.object({
  categoria: z.enum(['cabala', 'numerologia', 'orixas']).optional(),
});
const CATEGORIAS_VALIDAS = ['cabala', 'numerologia', 'orixas'] as const;
const afirmacoesPorCategoria = {
  cabala: [
    { texto: 'Eu sou parte da luz divina que ilumina o universo inteiro.', fonte: 'Séfer Yetzirá' },
    { texto: 'Minhas palavras carregam poder sagrado quando alinhadas à verdade.', fonte: 'Zohar' },
    { texto: 'Através da árvore da vida, declaro minha expansão consciente.', fonte: 'Cabala Moderna' },
    { texto: 'Cada Sephirah é um portal de transformação na minha jornada.', fonte: 'Meditação Cabalística' },
    { texto: 'Eu me conecto às energias superiores para guiá-lo em meu caminho.', fonte: 'Oração Cabalística' },
  ],
  numerologia: [
    { texto: 'Meu número de vida é a vibração que guia meus passos.', fonte: 'Pitágoras' },
    { texto: 'A energia do número 1 me dá força para iniciar novas jornadas.', fonte: 'Numerologia' },
    { texto: 'Cada dígito carrega sabedoria ancestral que me transforma.', fonte: 'Cálculo Vibracional' },
    { texto: 'Minhas ciclos pessoais estão alinhados com o propósito divino.', fonte: 'Análise Numérica' },
    { texto: 'A soma dos meus dias revela o caminho da minha alma.', fonte: 'Numerologia Espiritual' },
  ],
  orixas: [
    { texto: 'Xangô me concede a força da justiça e o equilíbrio das emoções.', fonte: 'Tradição Iorubá' },
    { texto: 'Iemanjá abençoa minha jornada com proteção e fluidez.', fonte: 'Louvação a Iemanjá' },
    { texto: 'Ogum abre os caminhos quando minha determinação é firme.', fonte: 'Oração a Ogum' },
    { texto: 'Oxum revela a beleza interior e a prosperidade consciente.', fonte: 'Saudação a Oxum' },
    { texto: 'Olorum sincroniza minha alma com a energia criadora do universo.', fonte: 'Oração Ancestral' },
  ],
};
type Categoria = 'cabala' | 'numerologia' | 'orixas';
function getAfirmacaoDoDia(): { dia: number } {
  const agora = new Date();
  const diaDoAno = Math.floor(
    (agora.getTime() - new Date(agora.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return { dia: diaDoAno };
}
function selectAfirmacao(categoria: Categoria): { texto: string; fonte: string } {
  const afirmacoes = afirmacoesPorCategoria[categoria];
  const agora = new Date();
  const diaDoAno = Math.floor(
    (agora.getTime() - new Date(agora.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const indice = diaDoAno % afirmacoes.length;
  return afirmacoes[indice];
}
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = AfirmacaoQuerySchema.safeParse({
    categoria: searchParams.get('categoria'),
  });
  const categoria = parseResult.success ? parseResult.data.categoria : null;
  if (categoria && !CATEGORIAS_VALIDAS.includes(categoria)) {
    return NextResponse.json(
      {
        affirmation: null,
        error: 'Categoria inválida',
        details: parseResult.error?.flatten().fieldErrors,
        categories: [...CATEGORIAS_VALIDAS],
      },
      { status: 400 }
    );
  }
  if (!categoria) {
    return NextResponse.json(
      {
        affirmation: null,
        error: 'Parâmetro "categoria" é obrigatório',
        categories: [...CATEGORIAS_VALIDAS],
      },
      { status: 400 }
    );
  }
  const diaDoAno = Math.floor(
    (agora.getTime() - new Date(agora.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return { dia: diaDoAno };
}

function selectAfirmacao(categoria: Categoria): { texto: string; fonte: string } {
  const afirmacoes = afirmacoesPorCategoria[categoria];
  const agora = new Date();
  const diaDoAno = Math.floor(
    (agora.getTime() - new Date(agora.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const indice = diaDoAno % afirmacoes.length;
  return afirmacoes[indice];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoria = searchParams.get('categoria') as Categoria | null;

  if (!categoria || !['cabala', 'numerologia', 'orixas'].includes(categoria)) {
    return NextResponse.json(
      {
        affirmation: null,
        error: 'Categoria inválida. Use: cabala, numerologia, orixas',
        categories: ['cabala', 'numerologia', 'orixas'],
      },
      { status: 400 }
    );
  }

  const afirmacao = selectAfirmacao(categoria);
  const agora = new Date();
  const diaDoAno = Math.floor(
    (agora.getTime() - new Date(agora.getFullYear(), 0, 0).getTime()) / 86400000
  );

  return NextResponse.json({
    affirmation: {
      texto: afirmacao.texto,
      fonte: afirmacao.fonte,
      categoria,
    },
    meta: {
      diaDoAno,
      data: agora.toISOString().split('T')[0],
    },
  });
}