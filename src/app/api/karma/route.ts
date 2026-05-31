import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const KarmaQuerySchema = z.object({
  action: z.enum(['status', 'history', 'calculate', 'types']).optional(),
  userId: z.string().optional(),
  ciclo: z.coerce.number().int().positive().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const KarmaBodySchema = z.object({
  acao: z.string().min(1, 'Ação é obrigatória'),
  tipo: z.enum(['positiva', 'negativa', 'neutra']),
  descricao: z.string().optional(),
  impacto: z.number().min(1).max(10).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
});

// ─── Spiritual Correlations for Karma Types ──────────────────────────────────────────
const KARMA_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  positiva: {
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Ações positivas geram mérito cármico',
    frequency: '528 Hz',
  },
  negativa: {
    sefirot: ['Gevurah'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'Ações negativas geram dívida cármica',
    frequency: '417 Hz',
  },
  neutra: {
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Nanã',
    affirmation: 'Ações neutras mantêm o equilíbrio cármico',
    frequency: '741 Hz',
  },
};

// ─── Karma Types with Spiritual Correlations ──────────────────────────────────────────
const KARMA_TYPES = [
  {
    id: 'acao-caridade',
    name: 'Ação de Caridade',
    namePt: 'Ação de Caridade',
    tipo: 'positiva',
    impacto: 9,
    element: 'Fogo',
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    orixa: ['Oxum', 'Iemanjá'],
    description: 'Ato de generosidade desinteressada que gera mérito cármico positivo.',
    karmicDebt: -3,
    karmicMerit: 5,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['positiva'],
  },
  {
    id: 'acao-violencia',
    name: 'Ação de Violência',
    namePt: 'Ação de Violência',
    tipo: 'negativa',
    impacto: 10,
    element: 'Fogo',
    sefirot: ['Gevurah'],
    chakra: 3,
    orixa: ['Ogum', 'Xangô'],
    description: 'Ato de agressão física ou verbal que gera dívida cármica.',
    karmicDebt: 5,
    karmicMerit: -3,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['negativa'],
  },
  {
    id: 'mentira',
    name: 'Mentira',
    namePt: 'Mentira',
    tipo: 'negativa',
    impacto: 7,
    element: 'Ar',
    sefirot: ['Hod', 'Gevurah'],
    chakra: 5,
    orixa: ['Exu', 'Ogum'],
    description: 'Ato de falsidade que compromete a integridade espiritual.',
    karmicDebt: 3,
    karmicMerit: -2,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['negativa'],
  },
  {
    id: 'verdade-falada',
    name: 'Verdade Falada',
    namePt: 'Verdade Falada',
    tipo: 'positiva',
    impacto: 8,
    element: 'Fogo',
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 5,
    orixa: ['Oxalá'],
    description: 'Ato de integridade e honestidade que gera mérito cármico.',
    karmicDebt: -2,
    karmicMerit: 4,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['positiva'],
  },
  {
    id: 'meditacao-diaria',
    name: 'Meditação Diária',
    namePt: 'Meditação Diária',
    tipo: 'positiva',
    impacto: 8,
    element: 'Éter',
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    orixa: ['Oxalá'],
    description: 'Prática regular de meditação que eleva a consciência espiritual.',
    karmicDebt: -2,
    karmicMerit: 4,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['positiva'],
  },
  {
    id: 'ritual-sagrado',
    name: 'Ritual Sagrado',
    namePt: 'Ritual Sagrado',
    tipo: 'positiva',
    impacto: 9,
    element: 'Fogo',
    sefirot: ['Chesed', 'Gevurah', 'Tipheret'],
    chakra: 4,
    orixa: ['Ogum', 'Xangô'],
    description: 'Realização de rituais sagrados que purificam a energia cármica.',
    karmicDebt: -3,
    karmicMerit: 5,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['positiva'],
  },
  {
    id: 'oferta-orixa',
    name: 'Oferta ao Orixá',
    namePt: 'Oferta ao Orixá',
    tipo: 'positiva',
    impacto: 8,
    element: 'Água',
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 4,
    orixa: ['Iemanjá', 'Oxum'],
    description: 'Ofrenda sagrada aos Orixás que gera proteção e mérito cármico.',
    karmicDebt: -2,
    karmicMerit: 4,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['positiva'],
  },
  {
    id: 'trabalho-honesto',
    name: 'Trabalho Honesto',
    namePt: 'Trabalho Honesto',
    tipo: 'positiva',
    impacto: 7,
    element: 'Terra',
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    orixa: ['Ogum'],
    description: 'Trabalho dignificado que gera mérito cármico através do esforço.',
    karmicDebt: -1,
    karmicMerit: 3,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['positiva'],
  },
  {
    id: 'inveja',
    name: 'Inveja',
    namePt: 'Inveja',
    tipo: 'negativa',
    impacto: 6,
    element: 'Terra',
    sefirot: ['Malkuth'],
    chakra: 2,
    orixa: ['Exu'],
    description: 'Sentimento de cobiça que gera dívida cármica.',
    karmicDebt: 2,
    karmicMerit: -1,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['negativa'],
  },
  {
    id: 'orgulho',
    name: 'Orgulho',
    namePt: 'Orgulho',
    tipo: 'negativa',
    impacto: 7,
    element: 'Fogo',
    sefirot: ['Gevurah'],
    chakra: 3,
    orixa: ['Xangô'],
    description: 'Ego inflado que gera dívida cármica.',
    karmicDebt: 3,
    karmicMerit: -2,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['negativa'],
  },
 {
    id: 'agradecimento',
    name: 'Agradecimento',
    namePt: 'Agradecimento',
    tipo: 'positiva',
    impacto: 6,
    element: 'Fogo',
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    orixa: ['Oxum'],
    description: 'Prática de gratidão que gera mérito cármico.',
    karmicDebt: -1,
    karmicMerit: 3,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['positiva'],
  },
  {
    id: 'perdao',
    name: 'Perdão',
    namePt: 'Perdão',
    tipo: 'positiva',
    impacto: 9,
    element: 'Fogo',
    sefirot: ['Tipheret', 'Binah'],
    chakra: 4,
    orixa: ['Iemanjá'],
    description: 'Ato de libertação que dissolve dívidas cármicas.',
    karmicDebt: -4,
    karmicMerit: 4,
    spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS['positiva'],
  },
];

// In-memory karma history (would be database in production)
const karmaHistory: Array<{
  id: string;
  userId: string;
  actionId: string;
  actionName: string;
  tipo: string;
  karmicDebt: number;
  karmicMerit: number;
  timestamp: string;
}> = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = KarmaQuerySchema.safeParse({
      action: searchParams.get('action'),
      userId: searchParams.get('userId'),
      ciclo: searchParams.get('ciclo'),
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

    const { action, userId, ciclo, sefirot, chakra, element, orixa } = parseResult.data;

    if (action === 'types') {
      let types = [...KARMA_TYPES];

      if (sefirot) {
        types = types.filter(t => t.spiritualCorrelations?.sefirot.includes(sefirot));
      }

      if (chakra) {
        types = types.filter(t => t.spiritualCorrelations?.chakra === chakra);
      }

      if (element) {
        types = types.filter(t => t.spiritualCorrelations?.element === element);
      }

      if (orixa) {
        types = types.filter(t => t.spiritualCorrelations?.orixa === orixa);
      }

      // Calculate spiritual stats
      const spiritualStats = {
        byTipo: types.reduce((acc, t) => {
          acc[t.tipo] = (acc[t.tipo] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        bySefirot: types.reduce((acc, t) => {
          t.spiritualCorrelations?.sefirot.forEach(s => {
            acc[s] = (acc[s] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>),
        byChakra: types.reduce((acc, t) => {
          const c = t.spiritualCorrelations?.chakra;
          if (c) acc[c] = (acc[c] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byElement: types.reduce((acc, t) => {
          const e = t.spiritualCorrelations?.element;
          if (e) acc[e] = (acc[e] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byOrixa: types.reduce((acc, t) => {
          const o = t.spiritualCorrelations?.orixa;
          if (o) acc[o] = (acc[o] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return NextResponse.json({
        success: true,
        types,
        count: types.length,
        spiritualCorrelations: KARMA_SPIRITUAL_CORRELATIONS,
        spiritualStats,
      });
    }

    if (action === 'history' && userId) {
      const userHistory = karmaHistory.filter(h => h.userId === userId);
      return NextResponse.json({
        success: true,
        history: userHistory,
        total: userHistory.length,
      });
    }

    if (action === 'status' && userId) {
      const userHistory = karmaHistory.filter(h => h.userId === userId);
      const totalMerit = userHistory.reduce((sum, h) => sum + h.karmicMerit, 0);
      const totalDebt = userHistory.reduce((sum, h) => sum + h.karmicDebt, 0);
      const balance = totalMerit + totalDebt;

      return NextResponse.json({
        success: true,
        status: {
          userId,
          totalMerit,
          totalDebt,
          balance,
          historyCount: userHistory.length,
        },
      });
    }

    // Default: return all karma types
    return NextResponse.json({
      success: true,
      types: KARMA_TYPES,
      count: KARMA_TYPES.length,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = KarmaBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { acao, tipo, descricao, impacto, sefirot, chakra } = parseResult.data;

    // Find matching karma type
    const karmaType = KARMA_TYPES.find(t => t.namePt === acao || t.name === acao);

    if (!karmaType) {
      return NextResponse.json({
        success: false,
        error: 'Tipo de karma não encontrado',
      }, { status: 404 });
    }

    const entry = {
      id: crypto.randomUUID(),
      userId: 'user-001', // Would come from auth in production
      actionId: karmaType.id,
      actionName: karmaType.namePt,
      tipo: karmaType.tipo,
      karmicDebt: karmaType.karmicDebt,
      karmicMerit: karmaType.karmicMerit,
      timestamp: new Date().toISOString(),
    };

    karmaHistory.push(entry);

    return NextResponse.json({
      success: true,
      entry,
      spiritualCorrelations: karmaType.spiritualCorrelations,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}