// prettier-ignore
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CategoriaSchema = z.enum(['cabala', 'numerologia', 'orixas', 'tarot']);
const AffirmationQuerySchema = z.object({
  categoria: CategoriaSchema.optional(),
});
export const dynamic = 'force-dynamic';
interface Affirmation {
  // Orixás
  { id: 'ori-001', texto: 'Xangô me concede a força da justiça e o equilíbrio das emoções.', fonte: 'Tradição Iorubá', categoria: 'orixas', tags: ['justiça', 'equilíbrio'] },
  { id: 'ori-002', texto: 'Iemanjá abençoa minha jornada com proteção e fluidez.', fonte: 'Louvação a Iemanjá', categoria: 'orixas', tags: ['proteção', 'fluidez'] },
  { id: 'ori-003', texto: 'Ogum abre os caminhos quando minha determinação é firme.', fonte: 'Oração a Ogum', categoria: 'orixas', tags: ['determinação', 'caminhos'] },
  { id: 'ori-004', texto: 'Oxum revela a beleza interior e a prosperidade consciente.', fonte: 'Saudação a Oxum', categoria: 'orixas', tags: ['beleza', 'prosperidade'] },
  { id: 'ori-005', texto: 'Olorum sincroniza minha alma com a energia criadora do universo.', fonte: 'Oração Ancestral', categoria: 'orixas', tags: ['criação', 'sincronia'] },
  { id: 'ori-006', texto: 'Oxalá traz paz e luz aos meus pensamentos e ações.', fonte: 'Prece a Oxalá', categoria: 'orixas', tags: ['paz', 'luz'] },
  { id: 'ori-007', texto: 'Iansã me dá coragem para enfrentar as transformações.', fonte: 'Invocação a Iansã', categoria: 'orixas', tags: ['coragem', 'transformação'] },
  { id: 'ori-008', texto: 'Nanã purifica minha essência com a sabedoria dos anciões.', fonte: 'Saudação a Nanã', categoria: 'orixas', tags: ['purificação', 'sabedoria'] },

  // Tarot
  { id: 'tar-001', texto: 'Eu abraço a transformação que emerge das sombras com coragem.', fonte: 'O Louco', categoria: 'tarot', tags: ['transformação', 'coragem'] },
  { id: 'tar-002', texto: 'Minha intuição é minha bússola sagrada que nunca falha.', fonte: 'A Sacerdotisa', categoria: 'tarot', tags: ['intuição', 'guia'] },
  { id: 'tar-003', texto: 'A Imperatriz nutre minha criatividade e abundância interior.', fonte: 'A Imperatriz', categoria: 'tarot', tags: ['criatividade', 'abundância'] },
  { id: 'tar-004', texto: 'O Mago manifesta através de mim com clareza e propósito.', fonte: 'O Mago', categoria: 'tarot', tags: ['manifestação', 'propósito'] },
  { id: 'tar-005', texto: 'Os-wheel me ensina que cada ciclo traz aprendizado divino.', fonte: 'A Roda da Fortuna', categoria: 'tarot', tags: ['ciclos', 'aprendizado'] },
  { id: 'tar-006', texto: 'A Força interior me guia através de todos os desafios.', fonte: 'A Força', categoria: 'tarot', tags: ['força', 'desafios'] },
  { id: 'tar-007', texto: 'O Sol ilumina meu caminho com alegria e vitalidade.', fonte: 'O Sol', categoria: 'tarot', tags: ['alegria', 'vitalidade'] },
  { id: 'tar-008', texto: 'A Estrela traz esperança e renovação para minha alma.', fonte: 'A Estrela', categoria: 'tarot', tags: ['esperança', 'renovação'] },
];

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getAffirmationOfDay(seed: number): Affirmation {
  const index = seed % affirmations.length;
  return affirmations[index];
}

function getAffirmationByCategory(category: string, seed: number): Affirmation | null {
  const filtered = affirmations.filter(a => a.categoria === category);
  if (filtered.length === 0) return null;
  const index = seed % filtered.length;
  return filtered[index];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = AffirmationQuerySchema.safeParse({
      categoria: searchParams.get('categoria'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { categoria } = parseResult.data;
    const today = new Date();
    const dayOfYear = getDayOfYear(today);
    const affirmation = categoria
      ? getAffirmationByCategory(categoria, dayOfYear)
      : getAffirmationOfDay(dayOfYear);
    if (!affirmation) {
      return NextResponse.json(
        { affirmation: null, error: 'Nenhuma afirmação encontrada.' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      affirmation: {
        id: affirmation.id,
        texto: affirmation.texto,
        fonte: affirmation.fonte,
        categoria: affirmation.categoria,
        tags: affirmation.tags,
      },
      meta: {
        diaDoAno: dayOfYear,
        data: today.toISOString().split('T')[0],
        categoria: categoria || 'todas',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar afirmação' }, { status: 500 });
  }
}
