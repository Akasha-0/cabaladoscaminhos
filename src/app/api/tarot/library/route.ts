import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ArcanoSchema = z.enum(['maior', 'menor']);
const TarotLibraryQuerySchema = z.object({
  arcano: ArcanoSchema.optional(),
  search: z.string().optional(),
  numero: z.coerce.number().int().min(0).max(21).optional(),
  limit: z.coerce.number().int().positive().max(78).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Tarot Card Spiritual Correlations ──────────────────────────────────────────
const TAROT_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}> = {
  0: { sefirot: ['Kether'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Inicio minha jornada com liberdade e inocência' },
  1: { sefirot: ['Chokhmah'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Manifesto minha vontade com habilidade' },
  2: { sefirot: ['Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A sabedoria interior guia minha intuição' },
  3: { sefirot: ['Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Fertilidade e abundância fluem através de mim' },
  4: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Estrutura e autoridade regem meu caminho' },
  5: { sefirot: ['Tipheret'], chakra: 5, element: 'Ar', orixa: 'Oxalá', affirmation: 'Tradição e espiritualidade me guiam' },
  6: { sefirot: ['Netzach'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor e a harmonia guiam minhas escolhas' },
  7: { sefirot: ['Gevurah', 'Netzach'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'A vitória vem através da minha determinação' },
  8: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Coragem e compaixão são minhas forças' },
  9: { sefirot: ['Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Na solidão, encontro minha verdade interior' },
  10: { sefirot: ['Chokhmah', 'Malkuth'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'O destino gira e eu abraço as mudanças' },
  11: { sefirot: ['Gevurah', 'Tipheret'], chakra: 5, element: 'Ar', orixa: 'Oxalá', affirmation: 'A verdade e a justiça guiam minhas ações' },
  12: { sefirot: ['Gevurah', 'Chesed'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Rendo-me para uma nova perspectiva' },
  13: { sefirot: ['Binah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A transformação traz renascimento' },
  14: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O equilíbrio e a harmonia me sustentam' },
  15: { sefirot: ['Malkuth', 'Hod'], chakra: 3, element: 'Terra', orixa: 'Ogum', affirmation: 'Libero-me das ilusões e enxergo a verdade' },
  16: { sefirot: ['Gevurah', 'Malkuth'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'A revelação traz libertação das estruturas antigas' },
  17: { sefirot: ['Chesed', 'Netzach'], chakra: 6, element: 'Fogo', orixa: 'Oxum', affirmation: 'Esperança e fé iluminam meu caminho' },
  18: { sefirot: ['Yesod', 'Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Confio na minha intuição além das ilusões' },
  19: { sefirot: ['Kether', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Alegria e vitalidade irradiam de meu ser' },
  20: { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Desperto para minha verdadeira essência' },
  21: { sefirot: ['Kether', 'Malkuth'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A realização completa minha jornada' },
};

// ─── Element by Arcana Number ──────────────────────────────────────────
const ELEMENT_BY_ARCANA: Record<number, string> = {
  0: 'Éter', 1: 'Ar', 2: 'Água', 3: 'Fogo', 4: 'Terra',
  5: 'Ar', 6: 'Fogo', 7: 'Fogo', 8: 'Fogo', 9: 'Água',
  10: 'Ar', 11: 'Ar', 12: 'Água', 13: 'Água', 14: 'Fogo',
  15: 'Terra', 16: 'Fogo', 17: 'Fogo', 18: 'Água', 19: 'Fogo',
  20: 'Fogo', 21: 'Éter',
};

// ─── Tarot cards complete data with spiritual correlations ──────────────────────────────────────────
const tarotCards = [
  { numero: 0, nome: 'O Louco', arcano: 'Maior', significadoUpright: 'Novos começos, liberdade, espontaneidade, inocência', significadoReversed: 'Irresponsabilidade, impulsividade, loucura, presa de riscos desnecessários', keywords: ['liberdade', 'aventura', 'espontaneidade'] },
  { numero: 1, nome: 'O Mago', arcano: 'Maior', significadoUpright: 'Manifestação, recursos, habilidade, propósito', significadoReversed: 'Manipulação, influências negativas, falta de direção', keywords: ['manifestação', 'poder', 'ação'] },
  { numero: 2, nome: 'A Sacerdotisa', arcano: 'Maior', significadoUpright: 'Intuição, sabedoria interior, profundezas do inconsciente', significadoReversed: 'Segredos, mistérios não revelados, superficialidade', keywords: ['intuição', 'mistério', 'conhecimento'] },
  { numero: 3, nome: 'A Imperadora', arcano: 'Maior', significadoUpright: 'Fertilidade, abundância, natureza, nutrição', significadoReversed: 'Bloqueio criativo, dependência de outros, negligência', keywords: ['abundância', 'maturidade', 'criação'] },
  { numero: 4, nome: 'O Imperador', arcano: 'Maior', significadoUpright: 'Autoridade, estrutura, controle, liderança', significadoReversed: 'Rigidez, domínio excessivo, fragilidade', keywords: ['estrutura', 'liderança', 'estabilidade'] },
  { numero: 5, nome: 'O Hierofante', arcano: 'Maior', significadoUpright: 'Tradição, espiritualidade, conformidade, ética', significadoReversed: 'Rebeldia, novos caminhos, falta de tradição', keywords: ['tradição', 'espiritualidade', 'educação'] },
  { numero: 6, nome: 'Os Enamorados', arcano: 'Maior', significadoUpright: 'Amor, harmonia, relacionamentos, escolha', significadoReversed: 'Disharmonia, desequilíbrio, má escolha', keywords: ['amor', 'união', 'decisão'] },
  { numero: 7, nome: 'O Carro', arcano: 'Maior', significadoUpright: 'Vitória, conquista, controle, vontade', significadoReversed: 'Falta de direção, agressividade, obstáculos', keywords: ['conquista', 'vitória', 'determinação'] },
  { numero: 8, nome: 'A Força', arcano: 'Maior', significadoUpright: 'Coragem, persuasão, influência, compaixão', significadoReversed: 'Interior fraco, autodúvida, manipulação', keywords: ['força', 'coragem', 'compaixão'] },
  { numero: 9, nome: 'O Eremita', arcano: 'Maior', significadoUpright: 'Introspecção, solidão, busca interior, autoconhecimento', significadoReversed: 'Isolamento extremo, timidez, solidão', keywords: ['introspecção', 'sabedoria', 'iluminação'] },
  { numero: 10, nome: 'A Roda da Fortuna', arcano: 'Maior', significadoUpright: 'Ciclos, destino, mudança, sorte', significadoReversed: 'Má sorte, procrastinação, ciclo vicioso', keywords: ['destino', 'sorte', 'transformação'] },
  { numero: 11, nome: 'A Justiça', arcano: 'Maior', significadoUpright: 'Justiça, verdade, lei, equidade', significadoReversed: 'Injustiça, falta de responsabilidade, desonestidade', keywords: ['equidade', 'verdade', 'justiça'] },
  { numero: 12, nome: 'O Enforcado', arcano: 'Maior', significadoUpright: 'Pausa, sacrifício, nova perspectiva, rendição', significadoReversed: 'Resistência, estagnação, indolência', keywords: ['sacrifício', 'renovação', 'perspectiva'] },
  { numero: 13, nome: 'A Morte', arcano: 'Maior', significadoUpright: 'Fim de ciclo, transição, transformação, renascimento', significadoReversed: 'Medo de mudança, estagnação, decomposição', keywords: ['transformação', 'metamorfose', 'renascimento'] },
  { numero: 14, nome: 'A Temperança', arcano: 'Maior', significadoUpright: 'Equilíbrio, paciência, propósito, harmonia', significadoReversed: 'Desequilíbrio, excesso, falta de propósito', keywords: ['harmonia', 'equilíbrio', 'moderação'] },
  { numero: 15, nome: 'O Diabo', arcano: 'Maior', significadoUpright: 'Escravidão, vício, ilusão, materialismo', significadoReversed: 'Libertação, renúncia, recuperação do poder', keywords: ['ilusão', 'vício', 'libertação'] },
  { numero: 16, nome: 'A Torre', arcano: 'Maior', significadoUpright: 'Mudança repentina, catastrofe, revelação, upheaval', significadoReversed: 'Mudança evitada, medo de transformação, catastrofe adiada', keywords: ['catástrofe', 'revelação', 'libertação'] },
  { numero: 17, nome: 'A Estrela', arcano: 'Maior', significadoUpright: 'Esperança, fé, propósito, serenidade', significadoReversed: 'Desesperança, descrença, desespero', keywords: ['esperança', 'inspiração', 'paz'] },
  { numero: 18, nome: 'A Lua', arcano: 'Maior', significadoUpright: 'Ilusão, medo, ansiedade, inconsciente', significadoReversed: 'Medo, confusão, esclarecimento', keywords: ['ilusão', 'intuição', 'inconsciente'] },
  { numero: 19, nome: 'O Sol', arcano: 'Maior', significadoUpright: 'Alegria, sucesso, celebração, vitalidade', significadoReversed: 'Excesso de confiança, otimismo exagerado', keywords: ['alegria', 'sucesso', 'vitalidade'] },
  { numero: 20, nome: 'O Julgamento', arcano: 'Maior', significadoUpright: 'Julgamento, redenção, prova, despertar', significadoReversed: 'Autocondenação, reflexão tardia, julgamentos errôneos', keywords: ['redenção', 'renascimento', 'julgamento'] },
  { numero: 21, nome: 'O Mundo', arcano: 'Maior', significadoUpright: 'Realização, completude, integração, viagens', significadoReversed: 'Falta de progresso, sentimento de incompletude', keywords: ['realização', 'completude', 'integração'] },
];

interface TarotCard {
  numero: number;
  nome: string;
  arcano: string;
  significadoUpright: string;
  significadoReversed: string;
  keywords: string[];
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();
    const parseResult = TarotLibraryQuerySchema.safeParse({
      arcano: searchParams.get('arcano'),
      search: searchParams.get('search'),
      numero: searchParams.get('numero'),
      limit: searchParams.get('limit'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { arcano, search, numero, limit, sefirot, chakra, element } = parseResult.data;

    let cards = [...tarotCards];

    // Filter by arcano (Maior/Menor)
    if (arcano) {
      cards = cards.filter(card => card.arcano.toLowerCase() === arcano.toLowerCase());
    }

    // Filter by card number
    if (numero !== undefined) {
      cards = cards.filter(card => card.numero === numero);
    }

    // Search by name or keywords
    if (search) {
      const searchLower = search.toLowerCase();
      cards = cards.filter(card =>
        card.nome.toLowerCase().includes(searchLower) ||
        card.keywords.some(k => k.toLowerCase().includes(searchLower)) ||
        card.significadoUpright.toLowerCase().includes(searchLower)
      );
    }

    // Add spiritual correlations
    cards = cards.map(card => {
      const corr = TAROT_SPIRITUAL_CORRELATIONS[card.numero];
      return {
        ...card,
        sefirot: corr?.sefirot || [],
        chakra: corr?.chakra || 5,
        element: ELEMENT_BY_ARCANA[card.numero] || 'Ar',
        orixa: corr?.orixa || 'Oxalá',
        affirmation: corr?.affirmation || 'A luz me guia',
      };
    });

    // Filter by spiritual correlations
    if (sefirot) {
      cards = cards.filter(card => card.sefirot.includes(sefirot));
    }
    if (chakra) {
      cards = cards.filter(card => card.chakra === chakra);
    }
    if (element) {
      cards = cards.filter(card => card.element === element);
    }

    // Apply limit
    if (limit && limit < cards.length) {
      cards = cards.slice(0, limit);
    }

    // Statistics
    const stats = {
      byElement: tarotCards.reduce((acc, c) => {
        const el = ELEMENT_BY_ARCANA[c.numero];
        acc[el] = (acc[el] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byChakra: Object.values(TAROT_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
        acc[c.chakra] = (acc[c.chakra] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      bySefirot: Object.values(TAROT_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
        c.sefirot.forEach(sf => {
          acc[sf] = (acc[sf] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byOrixa: Object.values(TAROT_SPIRITUAL_CORRELATIONS).reduce((acc, c) => {
        acc[c.orixa] = (acc[c.orixa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalCards: tarotCards.length,
    };

    return NextResponse.json({
      success: true,
      cards,
      meta: {
        total: cards.length,
        arcano: arcano || 'all',
        search: search || null,
        filters: {
          arcano: arcano || null,
          search: search || null,
          numero: numero !== undefined ? numero : null,
          sefirot: sefirot || null,
          chakra: chakra || null,
          element: element || null,
        },
      },
      stats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}