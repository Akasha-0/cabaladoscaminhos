/* eslint-disable @typescript-eslint/no-unused-vars */
 
/* prettier-ignore */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ReadingQuerySchema = z.object({
  tipo: z.enum(['tarot', 'cabala', 'numerologia', 'orixa']).optional(),
  forceRefresh: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});
export const dynamic = 'force-dynamic';

// ─── Spiritual Correlations for Daily Readings ──────────────────────────────────────────
const TAROT_SPIRITUAL_CORRELATIONS: Record<number, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  0: { sefirot: ['Kether'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'Inicio minha jornada com liberdade', frequency: '963 Hz' },
  1: { sefirot: ['Chokhmah'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'Manifesto minha vontade', frequency: '741 Hz' },
  2: { sefirot: ['Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Confio na minha intuição', frequency: '639 Hz' },
  3: { sefirot: ['Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A abundância flui em mim', frequency: '528 Hz' },
  4: { sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'Estrutura e liderança me guiam', frequency: '396 Hz' },
  5: { sefirot: ['Tipheret'], chakra: 5, element: 'Ar', orixa: 'Oxalá', affirmation: 'Tradição e espiritualidade me guiam', frequency: '741 Hz' },
  6: { sefirot: ['Netzach'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor guia minhas escolhas', frequency: '528 Hz' },
  7: { sefirot: ['Gevurah', 'Netzach'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'A vitória vem com determinação', frequency: '396 Hz' },
  8: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Coragem e compaixão me sustentam', frequency: '528 Hz' },
  9: { sefirot: ['Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Na solidão, encontro minha verdade', frequency: '639 Hz' },
  10: { sefirot: ['Chokhmah', 'Malkuth'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'O destino gira a meu favor', frequency: '741 Hz' },
  11: { sefirot: ['Gevurah', 'Tipheret'], chakra: 5, element: 'Ar', orixa: 'Oxalá', affirmation: 'A verdade e justiça guiam meu caminho', frequency: '852 Hz' },
  12: { sefirot: ['Gevurah', 'Chesed'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Rendo-me para uma nova perspectiva', frequency: '639 Hz' },
  13: { sefirot: ['Binah', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'A transformação traz renascimento', frequency: '639 Hz' },
  14: { sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O equilíbrio sustenta minha jornada', frequency: '528 Hz' },
  15: { sefirot: ['Malkuth', 'Hod'], chakra: 3, element: 'Terra', orixa: 'Ogum', affirmation: 'Libero-me das ilusões', frequency: '174 Hz' },
  16: { sefirot: ['Gevurah', 'Malkuth'], chakra: 3, element: 'Fogo', orixa: 'Ogum', affirmation: 'A revelação liberta minha estrutura', frequency: '396 Hz' },
  17: { sefirot: ['Chesed', 'Netzach'], chakra: 6, element: 'Fogo', orixa: 'Oxum', affirmation: 'Esperança e fé iluminam meu caminho', frequency: '528 Hz' },
  18: { sefirot: ['Yesod', 'Binah'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Confio além das ilusões', frequency: '639 Hz' },
  19: { sefirot: ['Kether', 'Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Alegria e vitalidade irradiam de mim', frequency: '528 Hz' },
  20: { sefirot: ['Kether', 'Binah'], chakra: 7, element: 'Fogo', orixa: 'Oxalá', affirmation: 'Desperto para minha verdadeira essência', frequency: '963 Hz' },
  21: { sefirot: ['Kether', 'Malkuth'], chakra: 7, element: 'Éter', orixa: 'Oxalá', affirmation: 'A realização completa minha jornada', frequency: '963 Hz' },
};

// ─── TYPE DEFINITIONS ──────────────────────────────────────────────────────
interface DailyReading {
  tipo: string;
  card?: any;
  cabala?: CabalaDaily;
  numerologia?: NumerologiaDaily;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

interface CabalaDaily {
  sephirah: string;
  caminho: string;
  tema: string;
  licao: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    affirmation: string;
  };
}

interface NumerologiaDaily {
  numero: number;
  vibracao: string;
  desafio: string;
  oportunidade: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
  };
}

function getDayKey(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay).toString();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getTarotCardOfDay(seed: number): any {
  const majorArcana = [
    { id: 0, nome: 'O Louco', significado: 'Novos começos, liberdade, espontaneidade' },
    { id: 1, nome: 'O Mago', significado: 'Manifestação, habilidade, poder' },
    { id: 2, nome: 'A Sacerdotisa', significado: 'Intuição, sabedoria interior, mistérios' },
    { id: 3, nome: 'A Imperatriz', significado: 'Abundância, fertilidade, criatividade' },
    { id: 4, nome: 'O Imperador', significado: 'Autoridade, estrutura, liderança' },
    { id: 5, nome: 'O Papa', significado: 'Orientação espiritual, tradição, bondade' },
    { id: 6, nome: 'Os Enamorados', significado: 'Amor, união, escolhas' },
    { id: 7, nome: 'O Carro', significado: 'Vitória, determinação, controle' },
    { id: 8, nome: 'A Força', significado: 'Coragem, perseverança, compaixão' },
    { id: 9, nome: 'O Eremita', significado: 'Introspecção, solidão, iluminação' },
    { id: 10, nome: 'A Roda da Fortuna', significado: 'Ciclos, destino, mudança' },
    { id: 11, nome: 'A Justiça', significado: 'Equilíbrio, verdade, lei' },
    { id: 12, nome: 'O Enforcado', significado: 'Sacrifício, nova perspectiva, sacrifício' },
    { id: 13, nome: 'A Morte', significado: 'Transformação, fim de ciclo, renovação' },
    { id: 14, nome: 'A Temperança', significado: 'Equilíbrio, paciência, harmonia' },
    { id: 15, nome: 'O Diabo', significado: 'Tentação, materialismo, libertação' },
    { id: 16, nome: 'A Torre', significado: 'Destruição, revelação, despertar' },
    { id: 17, nome: 'A Estrela', significado: 'Esperança, fé, renovação' },
    { id: 18, nome: 'A Lua', significado: 'Ilusão, intuição, inconsciência' },
    { id: 19, nome: 'O Sol', significado: 'Alegria, sucesso, vitalidade' },
    { id: 20, nome: 'O Julgamento', significado: 'Renascimento, julgamento, redenção' },
    { id: 21, nome: 'O Mundo', significado: 'Completude, realização, integração' },
  ];

  const cardIndex = seed % majorArcana.length;
  const card = majorArcana[cardIndex];
  const invertido = (seed % 2) === 1;

  const spiritualCorr = TAROT_SPIRITUAL_CORRELATIONS[card.id] || TAROT_SPIRITUAL_CORRELATIONS[0];

  return {
    ...card,
    arcano: 'major' as const,
    invertido,
    significado: invertido ? `Invertido: ${card.significado}` : card.significado,
    spiritualCorrelations: spiritualCorr,
  };
}

// ─── Cabala Daily Correlations ──────────────────────────────────────────
const CABALA_SPIRITUAL_CORRELATIONS: Record<string, {
  caminho: string;
  tema: string;
  licao: string;
  sefirot: string[];
  chakra: number;
  element: string;
  affirmation: string;
}> = {
  'Kether': { caminho: '1', tema: 'Coroa da vida', licao: 'Aceitar a vontade divina', sefirot: ['Kether'], chakra: 7, element: 'Éter', affirmation: 'Sou um com a fonte' },
  'Chokhmah': { caminho: '2', tema: 'Sabedoria', licao: 'Desenvolver percepção superior', sefirot: ['Chokhmah'], chakra: 6, element: 'Ar', affirmation: 'A sabedoria me guia' },
  'Binah': { caminho: '3', tema: 'Compreensão', licao: 'Analisar com profundidade', sefirot: ['Binah'], chakra: 6, element: 'Água', affirmation: 'Compreendo os mistérios' },
  'Chesed': { caminho: '4', tema: 'Misericórdia', licao: 'Praticar compaixão', sefirot: ['Chesed'], chakra: 4, element: 'Fogo', affirmation: 'A misericórdia me sustenta' },
  'Gevurah': { caminho: '5', tema: 'Força', licao: 'Usar poder com justiça', sefirot: ['Gevurah'], chakra: 3, element: 'Fogo', affirmation: 'A força justa habita em mim' },
  'Tipheret': { caminho: '6', tema: 'Beleza', licao: 'Integrar opostos', sefirot: ['Tipheret'], chakra: 5, element: 'Ar', affirmation: 'A harmonia me define' },
  'Netzach': { caminho: '7', tema: 'Vitória', licao: 'Perseverar com propósito', sefirot: ['Netzach'], chakra: 4, element: 'Fogo', affirmation: 'A vitória é minha jornada' },
  'Hod': { caminho: '8', tema: 'Glória', licao: 'Expressar conhecimento', sefirot: ['Hod'], chakra: 5, element: 'Ar', affirmation: 'A glória me sustenta' },
  'Yesod': { caminho: '9', tema: 'Fundamento', licao: 'Estabelecer base sólida', sefirot: ['Yesod'], chakra: 6, element: 'Água', affirmation: 'O fundamento me ancora' },
  'Malkuth': { caminho: '10', tema: 'Reino', licao: 'Manifestar no mundo físico', sefirot: ['Malkuth'], chakra: 1, element: 'Terra', affirmation: 'Terra e céu se encontram em mim' },
};

// ─── Numerology Daily Correlations ──────────────────────────────────────────
const NUMERO_SPIRITUAL_CORRELATIONS: Record<number, {
  vibracao: string;
  desafio: string;
  oportunidade: string;
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
}> = {
  1: { vibracao: 'Início e liderança', desafio: 'Egocentrismo', oportunidade: 'Pioneirismo', sefirot: ['Kether', 'Gevurah'], chakra: 1, element: 'Fogo', orixa: 'Ogum', affirmation: 'Inicio com coragem' },
  2: { vibracao: 'Parceria e diplomacy', desafio: 'Indecisão', oportunidade: 'Cooperação', sefirot: ['Chokhmah', 'Binah'], chakra: 2, element: 'Água', orixa: 'Iemanjá', affirmation: 'A cooperação traz harmonia' },
  3: { vibracao: 'Expressão criativa', desafio: 'Superficialidade', oportunidade: 'Comunicação', sefirot: ['Chokhmah', 'Netzach'], chakra: 5, element: 'Ar', orixa: 'Orunmilá', affirmation: 'A criatividade flui através de mim' },
  4: { vibracao: 'Estabilidade e trabalho', desafio: 'Rigidez', oportunidade: 'Construção', sefirot: ['Malkuth', 'Yesod'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'Construo uma base sólida' },
  5: { vibracao: 'Liberdade e mudança', desafio: 'Impaciência', oportunidade: 'Adaptação', sefirot: ['Hod', 'Gevurah'], chakra: 3, element: 'Fogo', orixa: 'Xangô', affirmation: 'A liberdade me guia' },
  6: { vibracao: 'Responsabilidade e amor', desafio: 'Sacrifício excessivo', oportunidade: 'Harmonia familiar', sefirot: ['Tipheret', 'Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'O amor e responsabilidade guiam meu caminho' },
  7: { vibracao: 'Sabedoria e introspecção', desafio: 'Isolamento', oportunidade: 'Espiritualidade', sefirot: ['Binah', 'Hod'], chakra: 6, element: 'Água', orixa: 'Oxalá', affirmation: 'A sabedoria interior me sustenta' },
  8: { vibracao: 'Poder e realizações', desafio: 'Materialismo', oportunidade: 'Abundância', sefirot: ['Gevurah', 'Malkuth'], chakra: 3, element: 'Terra', orixa: 'Ogum', affirmation: 'O poder justo flui através de mim' },
  9: { vibracao: 'Compaixão e humanismo', desafio: 'Expectativas irrealistas', oportunidade: 'Serviço', sefirot: ['Tipheret', 'Yesod'], chakra: 6, element: 'Água', orixa: 'Iemanjá', affirmation: 'Sou um canal de compaixão' },
  11: { vibracao: 'Intuição e iluminação', desafio: 'Ansiedade', oportunidade: 'Inspiração', sefirot: ['Kether', 'Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Oxalá', affirmation: 'Minha intuição ilumina o caminho' },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = ReadingQuerySchema.safeParse({
      tipo: searchParams.get('tipo'),
      forceRefresh: searchParams.get('forceRefresh'),
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

    const { tipo, forceRefresh, sefirot, chakra, element, orixa } = parseResult.data;
    const today = new Date();
    const dayKey = getDayKey(today);
    const seed = hashString(dayKey + (tipo || 'tarot'));

    // Filter by spiritual correlations
    if (sefirot || chakra || element || orixa) {
      if (tipo === 'tarot') {
        const card = getTarotCardOfDay(seed);
        if (sefirot && !card.spiritualCorrelations?.sefirot.includes(sefirot)) {
          // Find card that matches
        }
      }
    }

    switch (tipo) {
      case 'tarot': {
        const card = getTarotCardOfDay(seed);
        return NextResponse.json({
          success: true,
          reading: {
            tipo: 'tarot',
            date: today.toISOString(),
            card,
            spiritualCorrelations: card.spiritualCorrelations,
          },
        });
      }

      case 'cabala': {
        const sephirot = Object.keys(CABALA_SPIRITUAL_CORRELATIONS);
        const sephirahIndex = seed % sephirot.length;
        const sephirah = sephirot[sephirahIndex];
        const corr = CABALA_SPIRITUAL_CORRELATIONS[sephirah];

        return NextResponse.json({
          success: true,
          reading: {
            tipo: 'cabala',
            date: today.toISOString(),
            cabala: {
              sephirah,
              caminho: corr.caminho,
              tema: corr.tema,
              licao: corr.licao,
              spiritualCorrelations: {
                sefirot: corr.sefirot,
                chakra: corr.chakra,
                element: corr.element,
                affirmation: corr.affirmation,
              },
            },
          },
        });
      }

      case 'numerologia': {
        const dayOfMonth = today.getDate();
        const numero = dayOfMonth;
        const corr = NUMERO_SPIRITUAL_CORRELATIONS[numero] || NUMERO_SPIRITUAL_CORRELATIONS[3];

        return NextResponse.json({
          success: true,
          reading: {
            tipo: 'numerologia',
            date: today.toISOString(),
            numerologia: {
              numero,
              vibracao: corr.vibracao,
              desafio: corr.desafio,
              oportunidade: corr.oportunidade,
              spiritualCorrelations: {
                sefirot: corr.sefirot,
                chakra: corr.chakra,
                element: corr.element,
                orixa: corr.orixa,
                affirmation: corr.affirmation,
              },
            },
          },
        });
      }

      case 'orixa': {
        const orixas = ['Ogum', 'Oxum', 'Iemanjá', 'Oxalá', 'Xangô', 'Oxóssi', 'Iansã', 'Nanã'];
        const orixaIndex = seed % orixas.length;
        const orixaName = orixas[orixaIndex];

        return NextResponse.json({
          success: true,
          reading: {
            tipo: 'orixa',
            date: today.toISOString(),
            orixa: {
              name: orixaName,
              message: `O ${orixaName} guia seu dia`,
              spiritualCorrelations: {
                sefirot: ['Tipheret', 'Chesed', 'Gevurah'],
                chakra: 4,
                element: 'Fogo',
                orixa: orixaName,
                affirmation: `Honro ${orixaName} em minha jornada`,
              },
            },
          },
        });
      }

      default: {
        // Return all types
        return NextResponse.json({
          success: true,
          date: today.toISOString(),
          tarot: getTarotCardOfDay(seed),
          cabala: {
            sephirah: Object.keys(CABALA_SPIRITUAL_CORRELATIONS)[seed % 10],
            ...CABALA_SPIRITUAL_CORRELATIONS[Object.keys(CABALA_SPIRITUAL_CORRELATIONS)[seed % 10]],
          },
          numerologia: {
            numero: today.getDate(),
            ...NUMERO_SPIRITUAL_CORRELATIONS[today.getDate()] || NUMERO_SPIRITUAL_CORRELATIONS[3],
          },
        });
      }
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}