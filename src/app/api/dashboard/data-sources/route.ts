// ============================================================
// DASHBOARD DATA SOURCES API - CABALA DOS CAMINHOS
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

const DataSourceTypeSchema = z.enum(['api', 'database', 'file', 'stream', 'cache', 'orixa', 'astrology', 'numerology']);
const DataSourceStatusSchema = z.enum(['connected', 'disconnected', 'error', 'syncing']);
const DataSourceQuerySchema = z.object({
  tipo: DataSourceTypeSchema.optional(),
  status: DataSourceStatusSchema.optional(),
  habilitado: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const ConnectDataSourceSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  configuracao: z.object({
    host: z.string().optional(),
    porta: z.number().int().positive().optional(),
    database: z.string().optional(),
    endpoint: z.string().url().optional(),
    autenticacao: z.enum(['none', 'basic', 'bearer', 'oauth']).optional(),
    ssl: z.boolean().optional(),
  }).optional(),
});

// ─── Spiritual Correlations for Data Source Types ──────────────────────────────────────────
const DATASOURCE_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  api: {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A API conecta-me à sabedoria universal',
    frequency: '741 Hz',
  },
  database: {
    sefirot: ['Malkuth', 'Yesod'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'O banco de dados sustenta minha prática',
    frequency: '174 Hz',
  },
  file: {
    sefirot: ['Malkuth', 'Hod'],
    chakra: 5,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'Os arquivos guardam conhecimento sagrado',
    frequency: '174 Hz',
  },
  stream: {
    sefirot: ['Chokhmah', 'Binah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'O fluxo de dados é como água sagrada',
    frequency: '639 Hz',
  },
  cache: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 2,
    element: 'Água',
    orixa: 'Iemanjá',
    affirmation: 'O cache preserva memórias espirituais',
    frequency: '285 Hz',
  },
  orixa: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A fonte oracular revela verdades',
    frequency: '528 Hz',
  },
  astrology: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'Os dados astrológicos guiam minha jornada',
    frequency: '639 Hz',
  },
  numerology: {
    sefirot: ['Hod', 'Malkuth'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Os números cabalísticos revelam meu destino',
    frequency: '741 Hz',
  },
};

// ─── Type Definitions ───────────────────────────────────────────────────────
interface DataSource {
  id: string;
  nome: string;
  tipo: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  configuracao: {
    host?: string;
    porta?: number;
    database?: string;
    endpoint?: string;
    autenticacao?: 'none' | 'basic' | 'bearer' | 'oauth';
    ssl: boolean;
  };
  metricas: {
    latencia: number;
    uptime: number;
    requisicoes: number;
    erros: number;
    ultimoSync: string | null;
  };
  habilitado: boolean;
  createdAt: string;
  updatedAt: string;
  sefirot?: string[];
  orixa?: string;
  tradicao?: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

interface DataSourcesData {
  fontes: DataSource[];
  total: number;
  conectadas: number;
}

export const dynamic = 'force-dynamic';

// ─── Mock Data Store ───────────────────────────────────────────────────────
const mockDataSources: DataSource[] = [
  {
    id: 'ds-001',
    nome: 'API MiniMax (Oracle)',
    tipo: 'api',
    status: 'connected',
    configuracao: {
      endpoint: 'https://api.minimax.io',
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 125,
      uptime: 99.8,
      requisicoes: 15420,
      erros: 12,
      ultimoSync: '2026-05-30T10:00:00Z',
    },
    habilitado: true,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    sefirot: ['Hod', 'Netzach'],
    tradicao: 'Oracle AI',
    spiritualCorrelations: DATASOURCE_SPIRITUAL_CORRELATIONS['api'],
  },
  {
    id: 'ds-002',
    nome: 'Banco de Dados Prisma',
    tipo: 'database',
    status: 'connected',
    configuracao: {
      host: 'db.cabala.internal',
      porta: 5432,
      database: 'cabala_production',
      ssl: true,
    },
    metricas: {
      latencia: 5,
      uptime: 99.99,
      requisicoes: 245000,
      erros: 0,
      ultimoSync: null,
    },
    habilitado: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    sefirot: ['Malkuth', 'Yesod'],
    tradicao: 'PostgreSQL',
    spiritualCorrelations: DATASOURCE_SPIRITUAL_CORRELATIONS['database'],
  },
  {
    id: 'ds-003',
    nome: 'Redis Cache',
    tipo: 'cache',
    status: 'connected',
    configuracao: {
      host: 'cache.cabala.internal',
      porta: 6379,
      ssl: false,
    },
    metricas: {
      latencia: 1,
      uptime: 99.95,
      requisicoes: 890000,
      erros: 3,
      ultimoSync: null,
    },
    habilitado: true,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    sefirot: ['Yesod', 'Malkuth'],
    tradicao: 'Redis',
    spiritualCorrelations: DATASOURCE_SPIRITUAL_CORRELATIONS['cache'],
  },
  {
    id: 'ds-004',
    nome: 'Motor de Orixás',
    tipo: 'orixa',
    status: 'connected',
    configuracao: {
      endpoint: 'https://orixa-api.cabala.internal',
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 45,
      uptime: 99.5,
      requisicoes: 8900,
      erros: 8,
      ultimoSync: '2026-05-30T09:30:00Z',
    },
    habilitado: true,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    sefirot: ['Tipheret', 'Chesed'],
    orixa: 'Oxum',
    tradicao: 'Candomblé/Umbanda',
    spiritualCorrelations: DATASOURCE_SPIRITUAL_CORRELATIONS['orixa'],
  },
  {
    id: 'ds-005',
    nome: 'API Astrológica',
    tipo: 'astrology',
    status: 'connected',
    configuracao: {
      endpoint: 'https://astrology-api.cabala.internal',
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 78,
      uptime: 99.2,
      requisicoes: 5600,
      erros: 15,
      ultimoSync: '2026-05-30T08:00:00Z',
    },
    habilitado: true,
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    sefirot: ['Binah', 'Chokhmah'],
    tradicao: 'Astrologia Occidental',
    spiritualCorrelations: DATASOURCE_SPIRITUAL_CORRELATIONS['astrology'],
  },
  {
    id: 'ds-006',
    nome: 'Motor Numerológico',
    tipo: 'numerology',
    status: 'connected',
    configuracao: {
      endpoint: 'https://numerology-api.cabala.internal',
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 32,
      uptime: 99.7,
      requisicoes: 12300,
      erros: 5,
      ultimoSync: '2026-05-30T09:00:00Z',
    },
    habilitado: true,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    sefirot: ['Hod', 'Malkuth'],
    tradicao: 'Numerologia Cabalística',
    spiritualCorrelations: DATASOURCE_SPIRITUAL_CORRELATIONS['numerology'],
  },
  {
    id: 'ds-007',
    nome: 'Arquivos Estáticos',
    tipo: 'file',
    status: 'connected',
    configuracao: {
      host: 'storage.cabala.internal',
      porta: 9000,
      ssl: false,
    },
    metricas: {
      latencia: 12,
      uptime: 99.9,
      requisicoes: 45000,
      erros: 1,
      ultimoSync: null,
    },
    habilitado: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    sefirot: ['Malkuth', 'Hod'],
    tradicao: 'Arquivos',
    spiritualCorrelations: DATASOURCE_SPIRITUAL_CORRELATIONS['file'],
  },
  {
    id: 'ds-008',
    nome: 'Stream de Eventos',
    tipo: 'stream',
    status: 'syncing',
    configuracao: {
      host: 'stream.cabala.internal',
      porta: 9092,
      ssl: true,
    },
    metricas: {
      latencia: 8,
      uptime: 98.5,
      requisicoes: 234000,
      erros: 45,
      ultimoSync: '2026-05-30T10:05:00Z',
    },
    habilitado: true,
    createdAt: '2026-04-15T00:00:00Z',
    updatedAt: '2026-05-30T10:05:00Z',
    sefirot: ['Chokhmah', 'Binah'],
    tradicao: 'Event Streams',
    spiritualCorrelations: DATASOURCE_SPIRITUAL_CORRELATIONS['stream'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = DataSourceQuerySchema.safeParse({
      tipo: searchParams.get('tipo'),
      status: searchParams.get('status'),
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

    const { tipo, status, habilitado, limit, sefirot, chakra, element, orixa } = parseResult.data;

    let fontes = [...mockDataSources];

    if (tipo) {
      fontes = fontes.filter(f => f.tipo === tipo);
    }

    if (status) {
      fontes = fontes.filter(f => f.status === status);
    }

    if (habilitado !== undefined) {
      fontes = fontes.filter(f => f.habilitado === habilitado);
    }

    if (sefirot) {
      fontes = fontes.filter(f => f.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      fontes = fontes.filter(f => f.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      fontes = fontes.filter(f => f.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      fontes = fontes.filter(f => f.spiritualCorrelations?.orixa === orixa);
    }

    if (limit && fontes.length > limit) {
      fontes = fontes.slice(0, limit);
    }

    const total = fontes.length;
    const conectadas = fontes.filter(f => f.status === 'connected').length;

    // Calculate spiritual stats
    const spiritualStats = {
      byTipo: fontes.reduce((acc, f) => {
        acc[f.tipo] = (acc[f.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: fontes.reduce((acc, f) => {
        acc[f.status] = (acc[f.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: fontes.reduce((acc, f) => {
        f.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: fontes.reduce((acc, f) => {
        const c = f.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: fontes.reduce((acc, f) => {
        const e = f.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: fontes.reduce((acc, f) => {
        const o = f.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      fontes,
      total,
      conectadas,
      spiritualCorrelations: DATASOURCE_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { tipo, status, habilitado, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}