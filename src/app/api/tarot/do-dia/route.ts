import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';
// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const TarotQuerySchema = z.object({
  include: z.enum(['meaning', 'keywords', 'all']).optional(),
  position: z.enum(['upright', 'reversed', 'random']).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
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
  orixa: string;
  affirmation: string;
  frequency: string;
}

const TAROT_CARDS: TarotCardData[] = [
  { numero: 0, nome: 'O Louco', arcano: 'Maior', significadoUpright: 'Novos começos, liberdade, espontaneidade, inocência', significadoReversed: 'Irresponsabilidade, impulsividade, loucura, presa de riscos desnecessários', keywords: ['liberdade', 'aventura', 'espontaneidade'], sefirot: ['Kether'], element: 'Ar', chakra: 'Sahasrara (7º)', orixa: 'Oxalá', affirmation: 'Aceito o novo com coragem e inocência', frequency: '963 Hz' },
  { numero: 1, nome: 'O Mago', arcano: 'Maior', significadoUpright: 'Manifestação, recursos, habilidade, propósito', significadoReversed: 'Manipulação, influências negativas, falta de direção', keywords: ['manifestação', 'poder', 'ação'], sefirot: ['Chokhmah'], element: 'Ar', chakra: 'Ajna (6º)', orixa: 'Iansã', affirmation: 'Tenho todo o poder para criar minha realidade', frequency: '741 Hz' },
  { numero: 2, nome: 'A Sacerdotisa', arcano: 'Maior', significadoUpright: 'Intuição, sabedoria interior, profundezas do inconsciente', significadoReversed: 'Segredos, mistérios não revelados, superficialidade', keywords: ['intuição', 'mistério', 'conhecimento'], sefirot: ['Binah'], element: 'Água', chakra: 'Ajna (6º)', orixa: 'Iemanjá', affirmation: 'Confio na sabedoria interior que me guia', frequency: '417 Hz' },
  { numero: 3, nome: 'A Imperadora', arcano: 'Maior', significadoUpright: 'Fertilidade, abundância, natureza, nutrição', significadoReversed: 'Bloqueio criativo, dependência de outros, negligência', keywords: ['abundância', 'maturidade', 'criação'], sefirot: ['Chesed'], element: 'Terra', chakra: 'Anahata (4º)', orixa: 'Oxum', affirmation: 'A abundância flui naturalmente em minha vida', frequency: '528 Hz' },
  { numero: 4, nome: 'O Imperador', arcano: 'Maior', significadoUpright: 'Autoridade, estrutura, controle, liderança', significadoReversed: 'Rigidez, domínio excessivo, fragilidade', keywords: ['estrutura', 'liderança', 'estabilidade'], sefirot: ['Gevurah'], element: 'Fogo', chakra: 'Manipura (3º)', orixa: 'Xangô', affirmation: 'A autoridade interna me sustenta', frequency: '528 Hz' },
  { numero: 5, nome: 'O Hierofante', arcano: 'Maior', significadoUpright: 'Tradição, espiritualidade, conformidade, ética', significadoReversed: 'Rebeldia, novos caminhos, falta de tradição', keywords: ['tradição', 'espiritualidade', 'educação'], sefirot: ['Tipheret'], element: 'Terra', chakra: 'Anahata (4º)', orixa: 'Oxalá', affirmation: 'A tradição espiritual me guia', frequency: '528 Hz' },
  { numero: 6, nome: 'Os Enamorados', arcano: 'Maior', significadoUpright: 'Amor, harmonia, relacionamentos, escolha', significadoReversed: 'Disharmonia, desequilíbrio, má escolha', keywords: ['amor', 'união', 'decisão'], sefirot: ['Netzach'], element: 'Ar', chakra: 'Anahata (4º)', orixa: 'Oxum', affirmation: 'O amor me guia em todas as escolhas', frequency: '528 Hz' },
  { numero: 7, nome: 'O Carro', arcano: 'Maior', significadoUpright: 'Vitória, conquista, controle, vontade', significadoReversed: 'Falta de direção, agressividade, obstáculos', keywords: ['conquista', 'vitória', 'determinação'], sefirot: ['Chesed'], element: 'Fogo', chakra: 'Manipura (3º)', orixa: 'Ogum', affirmation: 'A vitória é minha jornada', frequency: '528 Hz' },
  { numero: 8, nome: 'A Força', arcano: 'Maior', significadoUpright: 'Coragem, persuasão, influência, compaixão', significadoReversed: 'Interior fraco, autodúvida, manipulação', keywords: ['força', 'coragem', 'compaixão'], sefirot: ['Gevurah'], element: 'Fogo', chakra: 'Manipura (3º)', orixa: 'Xangô', affirmation: 'A força interior me sustenta', frequency: '528 Hz' },
  { numero: 9, nome: 'O Eremita', arcano: 'Maior', significadoUpright: 'Introspecção, solidão, busca interior, autoconhecimento', significadoReversed: 'Isolamento extremo, timidez, solidão', keywords: ['introspecção', 'sabedoria', 'iluminação'], sefirot: ['Hod'], element: 'Terra', chakra: 'Ajna (6º)', orixa: 'Orunmilá', affirmation: 'Na solidão encontro minha luz interior', frequency: '741 Hz' },
  { numero: 10, nome: 'A Roda da Fortuna', arcano: 'Maior', significadoUpright: 'Ciclos, destino, mudança, sorte', significadoReversed: 'Má sorte, procrastinação, ciclo vicioso', keywords: ['destino', 'sorte', 'transformação'], sefirot: ['Chokhmah'], element: 'Fogo', chakra: 'Ajna (6º)', orixa: 'Oxumaré', affirmation: 'Aceito os ciclos com confiança', frequency: '741 Hz' },
  { numero: 11, nome: 'A Justiça', arcano: 'Maior', significadoUpright: 'Justiça, verdade, lei, equidade', significadoReversed: 'Injustiça, falta de responsabilidade, desonestidade', keywords: ['equidade', 'verdade', 'justiça'], sefirot: ['Tipheret'], element: 'Ar', chakra: 'Anahata (4º)', orixa: 'Xangô', affirmation: 'A verdade e a justiça me guiam', frequency: '528 Hz' },
  { numero: 12, nome: 'O Enforcado', arcano: 'Maior', significadoUpright: 'Pausa, sacrifício, nova perspectiva, rendição', significadoReversed: 'Resistência, estagnação, indolência', keywords: ['sacrifício', 'renovação', 'perspectiva'], sefirot: ['Chesed'], element: 'Água', chakra: 'Vishuddha (5º)', orixa: 'Nanã', affirmation: 'O sacrifício traz nova perspectiva', frequency: '417 Hz' },
  { numero: 13, nome: 'A Morte', arcano: 'Maior', significadoUpright: 'Fim de ciclo, transição, transformação, renascimento', significadoReversed: 'Medo de mudança, estagnação, decomposição', keywords: ['transformação', 'metamorfose', 'renascimento'], sefirot: ['Yesod'], element: 'Água', chakra: 'Svadhisthana (2º)', orixa: 'Omolu', affirmation: 'A transformação me renova', frequency: '417 Hz' },
  { numero: 14, nome: 'A Temperança', arcano: 'Maior', significadoUpright: 'Equilíbrio, paciência, propósito, harmonia', significadoReversed: 'Desequilíbrio, excesso, falta de propósito', keywords: ['harmonia', 'equilíbrio', 'moderação'], sefirot: ['Tipheret'], element: 'Fogo', chakra: 'Anahata (4º)', orixa: 'Oxum', affirmation: 'O equilíbrioharmoniza minha vida', frequency: '528 Hz' },
  { numero: 15, nome: 'O Diabo', arcano: 'Maior', significadoUpright: 'Escravidão, vício, ilusão, materialismo', significadoReversed: 'Libertação, renúncia, recuperação do poder', keywords: ['ilusão', 'vício', 'libertação'], sefirot: ['Gevurah'], element: 'Terra', chakra: 'Svadhisthana (2º)', orixa: 'Ogum', affirmation: 'Libertar-me das ilusões me fortalece', frequency: '417 Hz' },
  { numero: 16, nome: 'A Torre', arcano: 'Maior', significadoUpright: 'Mudança repentina, catastrofe, revelação, upheaval', significadoReversed: 'Mudança evitada, medo de transformação, catastrofe adiada', keywords: ['catástrofe', 'revelação', 'libertação'], sefirot: ['Gevurah'], element: 'Fogo', chakra: 'Manipura (3º)', orixa: 'Xangô', affirmation: 'A revelação me liberta das estruturas falsas', frequency: '528 Hz' },
  { numero: 17, nome: 'A Estrela', arcano: 'Maior', significadoUpright: 'Esperança, fé, propósito, serenidade', significadoReversed: 'Desesperança, descrença, desespero', keywords: ['esperança', 'inspiração', 'paz'], sefirot: ['Chesed'], element: 'Água', chakra: 'Anahata (4º)', orixa: 'Iemanjá', affirmation: 'A esperança ilumina meu caminho', frequency: '528 Hz' },
  { numero: 18, nome: 'A Lua', arcano: 'Maior', significadoUpright: 'Ilusão, medo, ansiedade, inconsciente', significadoReversed: 'Medo, confusão, esclarecimento', keywords: ['ilusão', 'intuição', 'inconsciente'], sefirot: ['Yesod'], element: 'Água', chakra: 'Svadhisthana (2º)', orixa: 'Iemanjá', affirmation: 'A luz da verdade dissipa as ilusões', frequency: '417 Hz' },
  { numero: 19, nome: 'O Sol', arcano: 'Maior', significadoUpright: 'Alegria, sucesso, celebração, vitalidade', significadoReversed: 'Excesso de confiança, otimismo exagerado', keywords: ['alegria', 'sucesso', 'vitalidade'], sefirot: ['Tipheret'], element: 'Fogo', chakra: 'Manipura (3º)', orixa: 'Oxalá', affirmation: 'A luz solar ilumina minha alegria', frequency: '528 Hz' },
  { numero: 20, nome: 'O Julgamento', arcano: 'Maior', significadoUpright: 'Julgamento, redenção, prova, despertar', significadoReversed: 'Autocondenação, reflexão tardia, julgamentos errôneos', keywords: ['redenção', 'renascimento', 'julgamento'], sefirot: ['Yesod'], element: 'Fogo', chakra: 'Anahata (4º)', orixa: 'Orunmilá', affirmation: 'O despertar traz redenção', frequency: '528 Hz' },
  { numero: 21, nome: 'O Mundo', arcano: 'Maior', significadoUpright: 'Realização, completude, integração, viagens', significadoReversed: 'Falta de progresso, sentimento de incompletude', keywords: ['realização', 'completude', 'integração'], sefirot: ['Malkuth'], element: 'Terra', chakra: 'Sahasrara (7º)', orixa: 'Oxalá', affirmation: 'A completude integra minha jornada', frequency: '963 Hz' },
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
  orixa: string;
  affirmation: string;
  frequency: string;
}

// fallow-ignore-next-line complexity
function getDailyCard(position: string, filters?: { sefirot?: string; chakra?: number; element?: string; orixa?: string }): TarotCardResult {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  
  // Filter cards by spiritual dimensions if provided
  let availableCards = TAROT_CARDS;
  if (filters?.sefirot) {
    availableCards = availableCards.filter(c => c.sefirot.includes(filters.sefirot!));
  }
  if (filters?.chakra) {
    const chakraMap: Record<number, string> = { 1: 'Muladhara (1º)', 2: 'Svadhisthana (2º)', 3: 'Manipura (3º)', 4: 'Anahata (4º)', 5: 'Vishuddha (5º)', 6: 'Ajna (6º)', 7: 'Sahasrara (7º)' };
    availableCards = availableCards.filter(c => c.chakra === chakraMap[filters.chakra!]);
  }
  if (filters?.element) {
    availableCards = availableCards.filter(c => c.element === filters.element);
  }
  if (filters?.orixa) {
    availableCards = availableCards.filter(c => c.orixa === filters.orixa);
  }
  
  // Fallback to all cards if no matches
  if (availableCards.length === 0) {
    availableCards = TAROT_CARDS;
  }
  
  const cardIndex = seed % availableCards.length;
  
  let isReversed: boolean;
  if (position === 'upright') {
    isReversed = false;
  } else if (position === 'reversed') {
    isReversed = true;
  } else {
    isReversed = (seed * 7) % 2 === 1;
  }

  const card = availableCards[cardIndex];

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
    orixa: card.orixa,
    affirmation: card.affirmation,
    frequency: card.frequency,
  };
}
// fallow-ignore-next-line complexity

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = TarotQuerySchema.safeParse({
    include: searchParams.get('include'),
    position: searchParams.get('position'),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
    orixa: searchParams.get('orixa'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { include, position, sefirot, chakra, element, orixa } = parseResult.data;
  const dailyCard = getDailyCard(position || 'random', { sefirot, chakra, element, orixa });
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
    response.card = { ...response.card as object, sefirot: dailyCard.sefirot, element: dailyCard.element, chakra: dailyCard.chakra, orixa: dailyCard.orixa, affirmation: dailyCard.affirmation, frequency: dailyCard.frequency };
  }

  // Calculate spiritual stats
  const spiritualStats = {
    bySefirot: TAROT_CARDS.reduce((acc, c) => {
      c.sefirot.forEach(s => { acc[s] = (acc[s] || 0) + 1; });
      return acc;
    }, {} as Record<string, number>),
    byElement: TAROT_CARDS.reduce((acc, c) => {
      acc[c.element] = (acc[c.element] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byOrixa: TAROT_CARDS.reduce((acc, c) => {
      acc[c.orixa] = (acc[c.orixa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return NextResponse.json({
    ...response,
    spiritualStats,
 meta: {
      ...response.meta as object,
      filters: { sefirot, chakra, element, orixa },
    },
  });
}