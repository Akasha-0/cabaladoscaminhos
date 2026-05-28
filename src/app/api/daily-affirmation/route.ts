/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* prettier-ignore */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Affirmation {
  id: string;
  texto: string;
  fonte: string;
  categoria: 'cabala' | 'numerologia' | 'orixas' | 'tarot';
  tags?: string[];
}

const affirmations: Affirmation[] = [
  // Cabala
  { id: 'cab-001', texto: 'Eu sou parte da luz divina que ilumina o universo inteiro.', fonte: 'Séfer Yetzirá', categoria: 'cabala', tags: ['luz', 'união'] },
  { id: 'cab-002', texto: 'Minhas palavras carregam poder sagrado quando alinhadas à verdade.', fonte: 'Zohar', categoria: 'cabala', tags: ['palavras', 'verdade'] },
  { id: 'cab-003', texto: 'Através da árvore da vida, declaro minha expansão consciente.', fonte: 'Cabala Moderna', categoria: 'cabala', tags: ['expansão', 'árvore da vida'] },
  { id: 'cab-004', texto: 'Cada Sephirah é um portal de transformação na minha jornada.', fonte: 'Meditação Cabalística', categoria: 'cabala', tags: ['transformação', 'sephirot'] },
  { id: 'cab-005', texto: 'Eu me conecto às energias superiores para guiar meu caminho.', fonte: 'Oração Cabalística', categoria: 'cabala', tags: ['conexão', 'energia'] },
  { id: 'cab-006', texto: 'Através do vazio, eu crio realidade com intenção pura.', fonte: 'Séfer HaBahir', categoria: 'cabala', tags: ['criação', 'intenção'] },
  { id: 'cab-007', texto: 'Minha alma reflete a luz infinita do En Soph.', fonte: 'Cabala Luriânica', categoria: 'cabala', tags: ['alma', 'infinito'] },
  { id: 'cab-008', texto: 'Os caminhos entre as sephirot iluminam meu caminho de evolução.', fonte: 'Árvore da Vida', categoria: 'cabala', tags: ['caminhos', 'evolução'] },

  // Numerologia
  { id: 'num-001', texto: 'Meu número de vida é a vibração que guia meus passos.', fonte: 'Pitágoras', categoria: 'numerologia', tags: ['vida', 'vibração'] },
  { id: 'num-002', texto: 'A energia do número 1 me dá força para iniciar novas jornadas.', fonte: 'Numerologia', categoria: 'numerologia', tags: ['início', 'força'] },
  { id: 'num-003', texto: 'Cada dígito carrega sabedoria ancestral que me transforma.', fonte: 'Cálculo Vibracional', categoria: 'numerologia', tags: ['sabedoria', 'ancestral'] },
  { id: 'num-004', texto: 'Meus ciclos pessoais estão alinhados com o propósito divino.', fonte: 'Análise Numérica', categoria: 'numerologia', tags: ['ciclos', 'propósito'] },
  { id: 'num-005', texto: 'A soma dos meus dias revela o caminho da minha alma.', fonte: 'Numerologia Espiritual', categoria: 'numerologia', tags: ['alma', 'revelação'] },
  { id: 'num-006', texto: 'Minhas portas de destino se abrem no momento certo.', fonte: 'Cálculo de Destino', categoria: 'numerologia', tags: ['destino', 'timing'] },
  { id: 'num-007', texto: 'A energia do 7 me conecta à sabedoria interior e à intuição.', fonte: 'Mistérios Numéricos', categoria: 'numerologia', tags: ['intuição', 'sabedoria interior'] },

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
  const searchParams = request.nextUrl.searchParams;
  const categoria = searchParams.get('categoria');
  const today = new Date();
  const dayOfYear = getDayOfYear(today);

  if (categoria && !['cabala', 'numerologia', 'orixas', 'tarot'].includes(categoria)) {
    return NextResponse.json(
      {
        affirmation: null,
        error: 'Categoria inválida. Use: cabala, numerologia, orixas, tarot',
        categories: ['cabala', 'numerologia', 'orixas', 'tarot'],
      },
      { status: 400 }
    );
  }

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
}
