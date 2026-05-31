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
});

const KarmaBodySchema = z.object({
  acao: z.string().min(1, 'Ação é obrigatória'),
  tipo: z.enum(['positiva', 'negativa', 'neutra']),
  descricao: z.string().optional(),
  impacto: z.number().min(1).max(10).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
});

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
    description: 'Declaração honesta mesmo em situações difíceis, gera mérito cármico.',
    karmicDebt: -2,
    karmicMerit: 4,
  },
  {
    id: 'roubo',
    name: 'Roubo',
    namePt: 'Roubo',
    tipo: 'negativa',
    impacto: 9,
    element: 'Terra',
    sefirot: ['Malkuth', 'Gevurah'],
    chakra: 1,
    orixa: ['Ogum', 'Omolu'],
    description: 'Ato de apropriar-se do que não é seu, gera forte dívida cármica.',
    karmicDebt: 6,
    karmicMerit: -4,
  },
  {
    id: 'oferta-sagrada',
    name: 'Oferta Sagrada',
    namePt: 'Oferta Sagrada',
    tipo: 'positiva',
    impacto: 10,
    element: 'Fogo',
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    orixa: ['Oxalá', 'Oxum', 'Ogum'],
    description: 'Oferta voluntária aos Orixás ou em nome de ancestrais, gera grande mérito.',
    karmicDebt: -4,
    karmicMerit: 6,
  },
  {
    id: 'cultivo-saude',
    name: 'Cultivo da Saúde',
    namePt: 'Cultivo da Saúde',
    tipo: 'positiva',
    impacto: 8,
    element: 'Terra',
    sefirot: ['Chesed'],
    chakra: 3,
    orixa: ['Omolu', 'Oxum'],
    description: 'Prática de hábitos saudáveis e cuidado corporal, gera mérito cármico.',
    karmicDebt: -2,
    karmicMerit: 4,
  },
  {
    id: 'negligencia-familia',
    name: 'Negligência Familiar',
    namePt: 'Negligência Familiar',
    tipo: 'negativa',
    impacto: 8,
    element: 'Água',
    sefirot: ['Binah', 'Chesed'],
    chakra: 6,
    orixa: ['Iemanjá', 'Oxum'],
    description: 'Abandono de responsabilidades familiares, gera dívida cármica.',
    karmicDebt: 4,
    karmicMerit: -3,
  },
  {
    id: 'pratica-espiritual',
    name: 'Prática Espiritual Regular',
    namePt: 'Prática Espiritual Regular',
    tipo: 'positiva',
    impacto: 9,
    element: 'Éter',
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    orixa: ['Oxalá', 'Orunmilá'],
    description: 'Prática consistente de rituals, meditação ou oração, gera alto mérito.',
    karmicDebt: -3,
    karmicMerit: 5,
  },
  {
    id: 'manipulacao',
    name: 'Manipulação',
    namePt: 'Manipulação',
    tipo: 'negativa',
    impacto: 8,
    element: 'Água',
    sefirot: ['Hod', 'Malkuth'],
    chakra: 6,
    orixa: ['Exu'],
    description: 'Uso de meios desonestos para controlar outros, gera dívida cármica.',
    karmicDebt: 4,
    karmicMerit: -3,
  },
  {
    id: 'gratidao-expressa',
    name: 'Gratidão Expressa',
    namePt: 'Gratidão Expressa',
    tipo: 'positiva',
    impacto: 7,
    element: 'Fogo',
    sefirot: ['Tipheret', 'Netzach'],
    chakra: 4,
    orixa: ['Oxum', 'Iemanjá'],
    description: 'Expressão genuína de agradecimento, multiplica energias positivas.',
    karmicDebt: -2,
    karmicMerit: 4,
  },
  {
    id: 'irrigacao-karmica',
    name: 'Irrigação Cármica',
    namePt: 'Irrigação Cármica',
    tipo: 'neutra',
    impacto: 5,
    element: 'Água',
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 2,
    orixa: ['Iemanjá'],
    description: 'Processo de consciência cármica para compreender padrões e liberá-los.',
    karmicDebt: 0,
    karmicMerit: 2,
  },
];

// ─── Karma States with Spiritual Correlations ──────────────────────────────────────────
const KARMA_STATES = [
  {
    id: 'limpo',
    name: 'Karma Limpo',
    namePt: 'Karma Limpo',
    sefirot: ['Kether', 'Tipheret'],
    chakra: 7,
    element: 'Éter',
    description: 'Estado de graça espiritual onde ações passam pela luz sem attached karmic weight.',
    requires: ['pratica-espiritual', 'acao-caridade', 'verdade-falada'],
    excludes: ['acao-violencia', 'roubo', 'manipulacao'],
  },
  {
    id: 'em-progresso',
    name: 'Karma em Progresso',
    namePt: 'Karma em Progresso',
    sefirot: ['Tipheret', 'Yesod'],
    chakra: 5,
    element: 'Ar',
    description: 'Estado de trabalho cármico ativo com equilíbrio entre débitos e méritos.',
    requires: ['irrigacao-karmica'],
    excludes: [],
  },
  {
    id: 'devendo',
    name: 'Karma Devendo',
    namePt: 'Karma Devendo',
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    description: 'Estado de dívida cármica que requer ação reparadora.',
    requires: ['oferta-sagrada', 'acao-caridade'],
    excludes: ['acao-violencia', 'roubo'],
  },
  {
    id: 'acumulando-merito',
    name: 'Acumulando Mérito',
    namePt: 'Acumulando Mérito',
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    description: 'Estado de crescimento espiritual positivo com práticas consistentes.',
    requires: ['pratica-espiritual', 'oferta-sagrada', 'cultivo-saude'],
    excludes: ['negligencia-familia', 'manipulacao'],
  },
];

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
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
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { action, userId, ciclo, sefirot, chakra, element } = parseResult.data;

    switch (action) {
      case 'types': {
        let types = [...KARMA_TYPES];

        // Filter by spiritual correlations
        if (sefirot) {
          types = types.filter(t => t.sefirot.includes(sefirot));
        }
        if (chakra) {
          types = types.filter(t => t.chakra === chakra);
        }
        if (element) {
          types = types.filter(t => t.element === element);
        }

        return NextResponse.json({
          success: true,
          types,
          total: types.length,
        });
      }

      case 'status': {
        return NextResponse.json({
          success: true,
          status: 'ok',
          action: 'status',
          userId,
          ciclo,
          states: KARMA_STATES,
          message: 'Karma status retrieved',
        });
      }

      case 'history': {
        return NextResponse.json({
          success: true,
          status: 'ok',
          action: 'history',
          userId,
          history: [],
          message: 'Karma history retrieved',
        });
      }

      case 'calculate': {
        return NextResponse.json({
          success: true,
          status: 'ok',
          action: 'calculate',
          userId,
          message: 'Karma calculation retrieved',
        });
      }

      default: {
        return NextResponse.json({
          success: true,
          endpoints: [
            'GET /api/karma?action=types - Get karma types with spiritual correlations',
            'GET /api/karma?action=status&userId=<id> - Get karma status',
            'GET /api/karma?action=history&userId=<id> - Get karma history',
            'GET /api/karma?action=calculate&userId=<id> - Calculate karma',
          ],
          spiritualCorrelations: {
            sefirot: ['Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'],
            chakras: [1, 2, 3, 4, 5, 6, 7],
            elements: ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'],
            orixas: ['Oxalá', 'Oxum', 'Iemanjá', 'Ogum', 'Xangô', 'Omolu', 'Exu', 'Orunmilá'],
          },
        });
      }
    }
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}

// POST /api/karma - Record karma action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = KarmaBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { acao, tipo, descricao, impacto, sefirot, chakra } = parseResult.data;

    // Find matching karma type
    const karmaType = KARMA_TYPES.find(t =>
      t.namePt.toLowerCase().includes(acao.toLowerCase()) ||
      t.name.toLowerCase().includes(acao.toLowerCase())
    );

    const record = {
      id: crypto.randomUUID(),
      acao,
      tipo,
      descricao,
      impacto: impacto || karmaType?.impacto || 5,
      sefirot: sefirot || karmaType?.sefirot || ['Tipheret'],
      chakra: chakra || karmaType?.chakra || 5,
      karmicDebt: karmaType?.karmicDebt || 0,
      karmicMerit: karmaType?.karmicMerit || 0,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      record,
      spiritualCorrelations: {
        sefirot: record.sefirot,
        chakra: record.chakra,
        element: karmaType?.element || 'Ar',
        orixa: karmaType?.orixa || ['Oxalá'],
      },
    }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}