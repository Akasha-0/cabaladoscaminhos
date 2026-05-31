// ============================================================
// DASHBOARD AI MODELS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const ModelTypeSchema = z.enum(['chat', 'completion', 'embedding', 'vision', 'speech', 'oracle', 'divination']);
const ModelStatusSchema = z.enum(['active', 'inactive', 'training', 'error', 'deprecated']);
const ModelQuerySchema = z.object({
  tipo: ModelTypeSchema.optional(),
  status: ModelStatusSchema.optional(),
  provider: z.string().optional(),
  habilitado: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const UpdateModelSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  configuracao: z.object({
    temperatura: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().optional(),
    topP: z.number().min(0).max(1).optional(),
    frequenciaPenalty: z.number().min(-2).max(2).optional(),
    presencaPenalty: z.number().min(-2).max(2).optional(),
  }).optional(),
  habilitado: z.boolean().optional(),
});

const CreateModelSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: ModelTypeSchema,
  provider: z.string().min(1, 'Provider é obrigatório'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  configuracao: z.object({
    temperatura: z.number().min(0).max(2).optional().default(0.7),
    maxTokens: z.number().int().positive().optional().default(2048),
    topP: z.number().min(0).max(1).optional().default(0.95),
    frequenciaPenalty: z.number().min(-2).max(2).optional().default(0),
    presencaPenalty: z.number().min(-2).max(2).optional().default(0),
  }).optional(),
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for AI Model Types ──────────────────────────────────────────
const MODEL_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  chat: {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'O diálogo espiritual expande minha consciência',
    frequency: '741 Hz',
  },
  completion: {
    sefirot: ['Chokhmah', 'Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A completude revela padrões ocultos',
    frequency: '741 Hz',
  },
  embedding: {
    sefirot: ['Binah', 'Yesod'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'Os embeddings capturam a essência sagrada',
    frequency: '639 Hz',
  },
  vision: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'A visão espiritual atravessa véus',
    frequency: '639 Hz',
  },
  speech: {
    sefirot: ['Netzach', 'Hod'],
    chakra: 5,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A palavra falada carrega poder de transformação',
    frequency: '528 Hz',
  },
  oracle: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O oráculo revela verdades divinas',
    frequency: '963 Hz',
  },
  divination: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'A divincação conecta passado, presente e futuro',
    frequency: '639 Hz',
  },
};

// ─── Type Definitions ───────────────────────────────────────────────────────
interface AIModel {
  id: string;
  nome: string;
  tipo: string;
  provider: string;
  modelo: string;
  status: 'active' | 'inactive' | 'training' | 'error' | 'deprecated';
  habilitado: boolean;
  configuracao: {
    temperatura: number;
    maxTokens: number;
    topP: number;
    frequenciaPenalty: number;
    presencaPenalty: number;
  };
  metricas: {
    totalRequisicoes: number;
    requisicoesHoje: number;
    errosHoje: number;
    tempoMedioResposta: number;
    taxaSucesso: number;
    custoTotal: number;
  };
  versao: string;
  createdAt: string;
  updatedAt: string;
  ultimoUso: string | null;
  sefirot?: string[];
  tradicao?: string;
  proposito?: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

interface AIModelsData {
  modelos: AIModel[];
  total: number;
  ativos: number;
}

export const dynamic = 'force-dynamic';

// ─── Mock Data Store ───────────────────────────────────────────────────────
const mockModels: AIModel[] = [
  {
    id: 'model-001',
    nome: 'Oracle GPT-4',
    tipo: 'oracle',
    provider: 'OpenAI',
    modelo: 'gpt-4-turbo',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.7,
      maxTokens: 4096,
      topP: 0.95,
      frequenciaPenalty: 0,
      presencaPenalty: 0,
    },
    metricas: {
      totalRequisicoes: 45600,
      requisicoesHoje: 1200,
      errosHoje: 8,
      tempoMedioResposta: 1800,
      taxaSucesso: 99.82,
      custoTotal: 234.50,
    },
    versao: '1.2.0',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    ultimoUso: '2026-05-31T03:25:00Z',
    sefirot: ['Kether', 'Chokhmah'],
    tradicao: 'Cabala/A西方的',
    proposito: 'Respostas espirituais profundas',
    spiritualCorrelations: MODEL_SPIRITUAL_CORRELATIONS['oracle'],
  },
  {
    id: 'model-002',
    nome: 'Divinator MiniMax',
    tipo: 'divination',
    provider: 'MiniMax',
    modelo: 'abab5-chat',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.8,
      maxTokens: 2048,
      topP: 0.9,
      frequenciaPenalty: 0.2,
      presencaPenalty: 0.1,
    },
    metricas: {
      totalRequisicoes: 28900,
      requisicoesHoje: 890,
      errosHoje: 3,
      tempoMedioResposta: 1200,
      taxaSucesso: 99.95,
      custoTotal: 0,
    },
    versao: '2.1.0',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    ultimoUso: '2026-05-31T03:20:00Z',
    sefirot: ['Binah', 'Chokhmah'],
    tradicao: 'Multi-tradição',
    proposito: 'Divinação e orientação',
    spiritualCorrelations: MODEL_SPIRITUAL_CORRELATIONS['divination'],
  },
  {
    id: 'model-003',
    nome: 'Tarot Vision',
    tipo: 'vision',
    provider: 'OpenAI',
    modelo: 'gpt-4-vision-preview',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.6,
      maxTokens: 2048,
      topP: 0.95,
      frequenciaPenalty: 0,
      presencaPenalty: 0,
    },
    metricas: {
      totalRequisicoes: 12400,
      requisicoesHoje: 340,
      errosHoje: 2,
      tempoMedioResposta: 2500,
      taxaSucesso: 99.78,
      custoTotal: 156.80,
    },
    versao: '1.0.0',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    ultimoUso: '2026-05-31T02:45:00Z',
    sefirot: ['Chokhmah', 'Binah'],
    tradicao: 'Tarot',
    proposito: 'Análise visual de cartas',
    spiritualCorrelations: MODEL_SPIRITUAL_CORRELATIONS['vision'],
  },
  {
    id: 'model-004',
    nome: 'Spirit Voice',
    tipo: 'speech',
    provider: 'OpenAI',
    modelo: 'tts-1',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.7,
      maxTokens: 4096,
      topP: 0.95,
      frequenciaPenalty: 0,
      presencaPenalty: 0,
    },
    metricas: {
      totalRequisicoes: 8900,
      requisicoesHoje: 180,
      errosHoje: 1,
      tempoMedioResposta: 3000,
      taxaSucesso: 99.99,
      custoTotal: 89.00,
    },
    versao: '1.1.0',
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    ultimoUso: '2026-05-31T01:30:00Z',
    sefirot: ['Netzach', 'Hod'],
    tradicao: 'Umbanda/Candomblé',
    proposito: 'Ritual de ebó falado',
    spiritualCorrelations: MODEL_SPIRITUAL_CORRELATIONS['speech'],
  },
  {
    id: 'model-005',
    nome: 'Embedding Sefirot',
    tipo: 'embedding',
    provider: 'OpenAI',
    modelo: 'text-embedding-3-large',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.1,
      maxTokens: 8192,
      topP: 0.95,
      frequenciaPenalty: 0,
      presencaPenalty: 0,
    },
    metricas: {
      totalRequisicoes: 156000,
      requisicoesHoje: 4500,
      errosHoje: 0,
      tempoMedioResposta: 200,
      taxaSucesso: 100,
      custoTotal: 78.00,
    },
    versao: '1.0.0',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    ultimoUso: '2026-05-31T03:25:00Z',
    sefirot: ['Binah', 'Yesod'],
    tradicao: 'Cabala',
    proposito: 'Busca semântica espiritual',
    spiritualCorrelations: MODEL_SPIRITUAL_CORRELATIONS['embedding'],
  },
  {
    id: 'model-006',
    nome: 'Chat Espiritual',
    tipo: 'chat',
    provider: 'MiniMax',
    modelo: 'abab5-chat',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.9,
      maxTokens: 2048,
      topP: 0.9,
      frequenciaPenalty: 0.3,
      presencaPenalty: 0.2,
    },
    metricas: {
      totalRequisicoes: 67800,
      requisicoesHoje: 2100,
      errosHoje: 12,
      tempoMedioResposta: 800,
      taxaSucesso: 99.82,
      custoTotal: 0,
    },
    versao: '2.0.0',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    ultimoUso: '2026-05-31T03:25:00Z',
    sefirot: ['Hod', 'Netzach'],
    tradicao: 'Universal',
    proposito: 'Diálogo espiritual',
    spiritualCorrelations: MODEL_SPIRITUAL_CORRELATIONS['chat'],
  },
  {
    id: 'model-007',
    nome: 'Orixá Guide',
    tipo: 'oracle',
    provider: 'MiniMax',
    modelo: 'abab5-chat',
    status: 'training',
    habilitado: false,
    configuracao: {
      temperatura: 0.75,
      maxTokens: 2048,
      topP: 0.9,
      frequenciaPenalty: 0.1,
      presencaPenalty: 0.1,
    },
    metricas: {
      totalRequisicoes: 0,
      requisicoesHoje: 0,
      errosHoje: 0,
      tempoMedioResposta: 0,
      taxaSucesso: 0,
      custoTotal: 0,
    },
    versao: '0.5.0-beta',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    ultimoUso: null,
    sefirot: ['Tipheret', 'Chesed'],
    tradicao: 'Candomblé',
    proposito: 'Guia de Orixás',
    spiritualCorrelations: MODEL_SPIRITUAL_CORRELATIONS['oracle'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = ModelQuerySchema.safeParse({
      tipo: searchParams.get('tipo'),
      status: searchParams.get('status'),
      provider: searchParams.get('provider'),
      habilitado: searchParams.get('habilitado'),
      limit: searchParams.get('limit'),
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

    const { tipo, status, provider, habilitado, limit, sefirot, chakra, element, orixa } = parseResult.data;

    let modelos = [...mockModels];

    if (tipo) {
      modelos = modelos.filter(m => m.tipo === tipo);
    }

    if (status) {
      modelos = modelos.filter(m => m.status === status);
    }

    if (provider) {
      modelos = modelos.filter(m => m.provider.toLowerCase().includes(provider.toLowerCase()));
    }

    if (habilitado !== undefined) {
      modelos = modelos.filter(m => m.habilitado === habilitado);
    }

    if (sefirot) {
      modelos = modelos.filter(m => m.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      modelos = modelos.filter(m => m.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      modelos = modelos.filter(m => m.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      modelos = modelos.filter(m => m.spiritualCorrelations?.orixa === orixa);
    }

    if (limit && modelos.length > limit) {
      modelos = modelos.slice(0, limit);
    }

    const total = modelos.length;
    const ativos = modelos.filter(m => m.status === 'active' && m.habilitado).length;

    // Calculate spiritual stats
    const spiritualStats = {
      byTipo: modelos.reduce((acc, m) => {
        acc[m.tipo] = (acc[m.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: modelos.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byProvider: modelos.reduce((acc, m) => {
        acc[m.provider] = (acc[m.provider] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: modelos.reduce((acc, m) => {
        m.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: modelos.reduce((acc, m) => {
        const c = m.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: modelos.reduce((acc, m) => {
        const e = m.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: modelos.reduce((acc, m) => {
        const o = m.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      modelos,
      total,
      ativos,
      spiritualCorrelations: MODEL_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { tipo, status, provider, habilitado, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}