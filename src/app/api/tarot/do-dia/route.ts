import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const TarotQuerySchema = z.object({
  include: z.enum(['meaning', 'keywords', 'all']).optional(),
  position: z.enum(['upright', 'reversed', 'random']).optional(),
});

// ─── Tarot Card Data ────────────────────────────────────────────────────────
interface TarotCardData {
  numero: number;
  nome: string;
  arcano: 'Maior' | 'Menor';
  significadoUpright: string;
  significadoReversed: string;
  keywords: string[];
  sefirot: string[];
  element: string;
  chakra: string;
}

const TAROT_CARDS: TarotCardData[] = [
  { numero: 0, nome: 'O Louco', arcano: 'Maior', significadoUpright: 'Novos começos, liberdade, espontaneidade, inocência', significadoReversed: 'Irresponsabilidade, impulsividade, loucura, presa de riscos desnecessários', keywords: ['liberdade', 'aventura', 'espontaneidade'], sefirot: ['Kether'], element: 'Ar', chakra: 'Sahasrara (7º)' },
  { numero: 1, nome: 'O Mago', arcano: 'Maior', significadoUpright: 'Manifestação, recursos, habilidade, propósito', significadoReversed: 'Manipulação, influências negativas, falta de direção', keywords: ['manifestação', 'poder', 'ação'], sefirot: ['Chokhmah'], element: 'Ar', chakra: 'Ajna (6º)' },
  { numero: 2, nome: 'A Sacerdotisa', arcano: 'Maior', significadoUpright: 'Intuição, sabedoria interior, profundezas do inconsciente', significadoReversed: 'Segredos, mistérios não revelados, superficialidade', keywords: ['intuição', 'mistério', 'conhecimento'], sefirot: ['Binah'], element: 'Água', chakra: 'Ajna (6º)' },
  { numero: 3, nome: 'A Imperadora', arcano: 'Maior', significadoUpright: 'Fertilidade, abundância, natureza, nutrição', significadoReversed: 'Bloqueio criativo, dependência de outros, negligência', keywords: ['abundância', 'maturidade', 'criação'], sefirot: ['Chesed'], element: 'Terra', chakra: 'Anahata (4º)' },
  { numero: 4, nome: 'O Imperador', arcano: 'Maior', significadoUpright: 'Autoridade, estrutura, controle, liderança', significadoReversed: 'Rigidez, domínio excessivo, fragilidade', keywords: ['estrutura', 'liderança', 'estabilidade'], sefirot: ['Gevurah'], element: 'Fogo', chakra: 'Manipura (3º)' },
  { numero: 5, nome: 'O Hierofante', arcano: 'Maior', significadoUpright: 'Tradição, espiritualidade, conformidade, ética', significadoReversed: 'Rebeldia, novos caminhos, falta de tradição', keywords: ['tradição', 'espiritualidade', 'educação'], sefirot: ['Tipheret'], element: 'Terra', chakra: 'Anahata (4º)' },
  { numero: 6, nome: 'Os Enamorados', arcano: 'Maior', significadoUpright: 'Amor, harmonia, relacionamentos, escolha', significadoReversed: 'Disharmonia, desequilíbrio, má escolha', keywords: ['amor', 'união', 'decisão'], sefirot: ['Netzach'], element: 'Ar', chakra: 'Anahata (4º)' },
  { numero: 7, nome: 'O Carro', arcano: 'Maior', significadoUpright: 'Vitória, conquista, controle, vontade', significadoReversed: 'Falta de direção, agressividade, obstáculos', keywords: ['conquista', 'vitória', 'determinação'], sefirot: ['Chesed'], element: 'Fogo', chakra: 'Manipura (3º)' },
  { numero: 8, nome: 'A Força', arcano: 'Maior', significadoUpright: 'Coragem, persuasão, influência, compaixão', significadoReversed: 'Interior fraco, autodúvida, manipulação', keywords: ['força', 'coragem', 'compaixão'], sefirot: ['Gevurah'], element: 'Fogo', chakra: 'Manipura (3º)' },
  { numero: 9, nome: 'O Eremita', arcano: 'Maior', significadoUpright: 'Introspecção, solidão, busca interior, autoconhecimento', significadoReversed: 'Isolamento extremo, timidez, solidão', keywords: ['introspecção', 'sabedoria', 'iluminação'], sefirot: ['Hod'], element: 'Terra', chakra: 'Ajna (6º)' },
  { numero: 10, nome: 'A Roda da Fortuna', arcano: 'Maior', significadoUpright: 'Ciclos, destino, mudança, sorte', significadoReversed: 'Má sorte, procrastinação, ciclo vicioso', keywords: ['destino', 'sorte', 'transformação'], sefirot: ['Chokhmah'], element: 'Fogo', chakra: 'Ajna (6º)' },
  { numero: 11, nome: 'A Justiça', arcano: 'Maior', significadoUpright: 'Justiça, verdade, lei, equidade', significadoReversed: 'Injustiça, falta de responsabilidade, desonestidade', keywords: ['equidade', 'verdade', 'justiça'], sefirot: ['Tipheret'], element: 'Ar', chakra: 'Anahata (4º)' },
  { numero: 12, nome: 'O Enforcado', arcano: 'Maior', significadoUpright: 'Pausa, sacrifício, nova perspectiva, rendição', significadoReversed: 'Resistência, estagnação, indolência', keywords: ['sacrifício', 'renovação', 'perspectiva'], sefirot: ['Chesed'], element: 'Água', chakra: 'Vishuddha (5º)' },
  { numero: 13, nome: 'A Morte', arcano: 'Maior', significadoUpright: 'Fim de ciclo, transição, transformação, renascimento', significadoReversed: 'Medo de mudança, estagnação, decomposição', keywords: ['transformação', 'metamorfose', 'renascimento'], sefirot: ['Yesod'], element: 'Água', chakra: 'Svadhisthana (2º)' },
  { numero: 14, nome: 'A Temperança', arcano: 'Maior', significadoUpright: 'Equilíbrio, paciência, propósito, harmonia', significadoReversed: 'Desequilíbrio, excesso, falta de propósito', keywords: ['harmonia', 'equilíbrio', 'moderação'], sefirot: ['Tipheret'], element: 'Fogo', chakra: 'Anahata (4º)' },
  { numero: 15, nome: 'O Diabo', arcano: 'Maior', significadoUpright: 'Escravidão, vício, ilusão, materialismo', significadoReversed: 'Libertação, renúncia, recuperação do poder', keywords: ['ilusão', 'vício', 'libertação'], sefirot: ['Gevurah'], element: 'Terra', chakra: 'Svadhisthana (2º)' },
  { numero: 16, nome: 'A Torre', arcano: 'Maior', significadoUpright: 'Mudança repentina, catastrofe, revelação, upheaval', significadoReversed: 'Mudança evitada, medo de transformação, catastrofe adiada', keywords: ['catástrofe', 'revelação', 'libertação'], sefirot: ['Gevurah'], element: 'Fogo', chakra: 'Manipura (3º)' },
  { numero: 17, nome: 'A Estrela', arcano: 'Maior', significadoUpright: 'Esperança, fé, propósito, serenidade', significadoReversed: 'Desesperança, descrença, desespero', keywords: ['esperança', 'inspiração', 'paz'], sefirot: ['Chesed'], element: 'Água', chakra: 'Anahata (4º)' },
  { numero: 18, nome: 'A Lua', arcano: 'Maior', significadoUpright: 'Ilusão, medo, ansiedade, inconsciente', significadoReversed: 'Medo, confusão, esclarecimento', keywords: ['ilusão', 'intuição', 'inconsciente'], sefirot: ['Yesod'], element: 'Água', chakra: 'Svadhisthana (2º)' },
  { numero: 19, nome: 'O Sol', arcano: 'Maior', significadoUpright: 'Alegria, sucesso, celebração, vitalidade', significadoReversed: 'Excesso de confiança, otimismo exagerado', keywords: ['alegria', 'sucesso', 'vitalidade'], sefirot: ['Tipheret'], element: 'Fogo', chakra: 'Manipura (3º)' },
  { numero: 20, nome: 'O Julgamento', arcano: 'Maior', significadoUpright: 'Julgamento, redenção, prova, despertar', significadoReversed: 'Autocondenação, reflexão tardia, julgamentos errôneos', keywords: ['redenção', 'renascimento', 'julgamento'], sefirot: ['Yesod'], element: 'Fogo', chakra: 'Anahata (4º)' },
  { numero: 21, nome: 'O Mundo', arcano: 'Maior', significadoUpright: 'Realização, completude, integração, viagens', significadoReversed: 'Falta de progresso, sentimento de incompletude', keywords: ['realização', 'completude', 'integração'], sefirot: ['Malkuth'], element: 'Terra', chakra: 'Sahasrara (7º)' },
];

interface TarotCardResult {
  numero: number;
  nome: string;
  arcano: string;
  significado: string;
  isReversed: boolean;
  keywords: string[];
  sefirot: string[];
  element: string;
  chakra: string;
}

function getDailyCard(position: string): TarotCardResult {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const cardIndex = seed % TAROT_CARDS.length;
  
  let isReversed: boolean;
  if (position === 'upright') {
    isReversed = false;
  } else if (position === 'reversed') {
    isReversed = true;
  } else {
    isReversed = (seed * 7) % 2 === 1;
  }

  const card = TAROT_CARDS[cardIndex];

  return {
    numero: card.numero,
    nome: card.nome,
    arcano: card.arcano,
    significado: isReversed ? card.significadoReversed : card.significadoUpright,
    isReversed,
    keywords: card.keywords,
    sefirot: card.sefirot,
    element: card.element,
    chakra: card.chakra,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = TarotQuerySchema.safeParse({
    include: searchParams.get('include'),
    position: searchParams.get('position'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { include, position } = parseResult.data;
  const dailyCard = getDailyCard(position || 'random');
  const now = new Date();

  const response: Record<string, unknown> = {
    success: true,
    card: {
      numero: dailyCard.numero,
      nome: dailyCard.nome,
      arcano: dailyCard.arcano,
      significado: dailyCard.significado,
      isReversed: dailyCard.isReversed,
    },
    meta: {
      data: now.toISOString().split('T')[0],
      arcano: dailyCard.arcano,
    },
  };

  if (include === 'all' || include === 'keywords') {
    response.card = { ...response.card as object, keywords: dailyCard.keywords };
  }

  if (include === 'all' || include === 'meaning') {
    response.card = { ...response.card as object, sefirot: dailyCard.sefirot, element: dailyCard.element, chakra: dailyCard.chakra };
  }

  return NextResponse.json(response);
}