// ============================================================
// DASHBOARD DATA SOURCES API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const DataSourceTypeSchema = z.enum(['api', 'database', 'file', 'stream', 'cache', 'orixa', 'astrology', 'numerology']);
const DataSourceStatusSchema = z.enum(['connected', 'disconnected', 'error', 'syncing']);
const DataSourceQuerySchema = z.object({
  tipo: DataSourceTypeSchema.optional(),
  status: DataSourceStatusSchema.optional(),
  habilitado: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
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
  // Spiritual correlations
  sefirot?: string[];
  orixa?: string;
  tradicao?: string;
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
      ultimoSync: new Date(Date.now() - 300000).toISOString(),
    },
    habilitado: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    tradicao: 'IA Espiritual',
    sefirot: ['Chokhmah', 'Binah'],
  },
  {
    id: 'ds-002',
    nome: 'Banco de Dados Principal',
    tipo: 'database',
    status: 'connected',
    configuracao: {
      host: 'db.cabala.example.com',
      porta: 5432,
      database: 'cabala_production',
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 8,
      uptime: 99.95,
      requisicoes: 892340,
      erros: 3,
      ultimoSync: new Date().toISOString(),
    },
    habilitado: true,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    tradicao: 'Armazenamento',
  },
  {
    id: 'ds-003',
    nome: 'Cache Redis (Sefirot)',
    tipo: 'cache',
    status: 'connected',
    configuracao: {
      host: 'redis.cabala.example.com',
      porta: 6379,
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 2,
      uptime: 99.99,
      requisicoes: 4523000,
      erros: 0,
      ultimoSync: new Date().toISOString(),
    },
    habilitado: true,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    sefirot: ['Yesod'],
    tradicao: 'Cache Espiritual',
  },
  {
    id: 'ds-004',
    nome: 'API Astrológica (Ephemeris)',
    tipo: 'astrology',
    status: 'connected',
    configuracao: {
      endpoint: 'https://api.ephemeris.io',
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 85,
      uptime: 99.5,
      requisicoes: 12450,
      erros: 5,
      ultimoSync: new Date(Date.now() - 600000).toISOString(),
    },
    habilitado: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    tradicao: 'Astrologia',
    sefirot: ['Chokhmah'],
  },
  {
    id: 'ds-005',
    nome: 'API Orixás (Ifá)',
    tipo: 'orixa',
    status: 'connected',
    configuracao: {
      endpoint: 'https://api.orixa.io',
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 95,
      uptime: 98.9,
      requisicoes: 8720,
      erros: 8,
      ultimoSync: new Date(Date.now() - 900000).toISOString(),
    },
    habilitado: true,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    tradicao: 'Candomblé/Umbanda',
    sefirot: ['Binah', 'Yesod'],
    orixa: 'Oxum',
  },
  {
    id: 'ds-006',
    nome: 'API Numerologia Cabalística',
    tipo: 'numerology',
    status: 'connected',
    configuracao: {
      endpoint: 'https://api.numerologia.cabala',
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 42,
      uptime: 99.7,
      requisicoes: 23500,
      erros: 2,
      ultimoSync: new Date().toISOString(),
    },
    habilitado: true,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    tradicao: 'Cabala',
    sefirot: ['Malkuth', 'Kether'],
  },
  {
    id: 'ds-007',
    nome: 'Stream de Trânsitos Planetários',
    tipo: 'stream',
    status: 'syncing',
    configuracao: {
      host: 'stream.cabala.example.com',
      porta: 8080,
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 15,
      uptime: 99.2,
      requisicoes: 156780,
      erros: 1,
      ultimoSync: new Date().toISOString(),
    },
    habilitado: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
    tradicao: 'Trânsitos Astrais',
    sefirot: ['Gevurah'],
  },
  {
    id: 'ds-008',
    nome: 'Arquivo de Logs Espirituais',
    tipo: 'file',
    status: 'connected',
    configuracao: {
      host: '/var/log/cabala',
      ssl: false,
    },
    metricas: {
      latencia: 5,
      uptime: 100,
      requisicoes: 8900,
      erros: 0,
      ultimoSync: new Date().toISOString(),
    },
    habilitado: false,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    tradicao: 'Logs',
  },
];

function getDataSourcesData(): DataSourcesData {
  return {
    fontes: mockDataSources,
    total: mockDataSources.length,
    conectadas: mockDataSources.filter(d => d.status === 'connected').length,
  };
}

// ─── API Routes ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = DataSourceQuerySchema.safeParse({
      tipo: searchParams.get('tipo'),
      status: searchParams.get('status'),
      habilitado: searchParams.get('habilitado'),
      limit: searchParams.get('limit'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { tipo, status, habilitado, limit } = parseResult.data;
    let fontes = [...mockDataSources];

    // Apply filters
    if (tipo) {
      fontes = fontes.filter(d => d.tipo === tipo);
    }

    if (status) {
      fontes = fontes.filter(d => d.status === status);
    }

    if (habilitado !== undefined) {
      fontes = fontes.filter(d => d.habilitado === habilitado);
    }

    if (limit) {
      fontes = fontes.slice(0, limit);
    }

    const data = getDataSourcesData();

    return NextResponse.json({
      success: true,
      fontes,
      pagination: {
        total: fontes.length,
        limit: limit || fontes.length,
      },
      stats: {
        total: data.total,
        conectadas: data.conectadas,
        disconnected: data.fontes.filter(d => d.status === 'disconnected').length,
        error: data.fontes.filter(d => d.status === 'error').length,
        syncing: data.fontes.filter(d => d.status === 'syncing').length,
      },
      byTipo: {
        api: data.fontes.filter(d => d.tipo === 'api').length,
        database: data.fontes.filter(d => d.tipo === 'database').length,
        cache: data.fontes.filter(d => d.tipo === 'cache').length,
        orixa: data.fontes.filter(d => d.tipo === 'orixa').length,
        astrology: data.fontes.filter(d => d.tipo === 'astrology').length,
        numerology: data.fontes.filter(d => d.tipo === 'numerology').length,
        stream: data.fontes.filter(d => d.tipo === 'stream').length,
        file: data.fontes.filter(d => d.tipo === 'file').length,
      },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar fontes de dados',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'connect') {
      const body = await request.json();
      const parseResult = ConnectDataSourceSchema.safeParse(body);

      if (!parseResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Payload inválido',
          details: parseResult.error.flatten().fieldErrors,
        }, { status: 400 });
      }

      const dataSource = mockDataSources.find(d => d.id === parseResult.data.id);

      if (!dataSource) {
        return NextResponse.json({
          success: false,
          error: 'Fonte de dados não encontrada',
          validIds: mockDataSources.map(d => d.id),
        }, { status: 404 });
      }

      // Simulate connection
      dataSource.status = 'connected';
      dataSource.configuracao = { ...dataSource.configuracao, ...parseResult.data.configuracao };
      dataSource.updatedAt = new Date().toISOString();

      return NextResponse.json({
        success: true,
        dataSource,
        message: 'Fonte de dados conectada com sucesso',
      });
    }

    if (action === 'disconnect') {
      const body = await request.json();
      const idSchema = z.object({ id: z.string().min(1, 'ID é obrigatório') });
      const parseResult = idSchema.safeParse(body);

      if (!parseResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Payload inválido',
          details: parseResult.error.flatten().fieldErrors,
        }, { status: 400 });
      }

      const dataSource = mockDataSources.find(d => d.id === parseResult.data.id);

      if (!dataSource) {
        return NextResponse.json({
          success: false,
          error: 'Fonte de dados não encontrada',
        }, { status: 404 });
      }

      dataSource.status = 'disconnected';
      dataSource.updatedAt = new Date().toISOString();

      return NextResponse.json({
        success: true,
        dataSource,
        message: 'Fonte de dados desconectada',
      });
    }

    if (action === 'test') {
      const body = await request.json();
      const idSchema = z.object({ id: z.string().min(1, 'ID é obrigatório') });
      const parseResult = idSchema.safeParse(body);

      if (!parseResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Payload inválido',
          details: parseResult.error.flatten().fieldErrors,
        }, { status: 400 });
      }

      const dataSource = mockDataSources.find(d => d.id === parseResult.data.id);

      if (!dataSource) {
        return NextResponse.json({
          success: false,
          error: 'Fonte de dados não encontrada',
        }, { status: 404 });
      }

      // Simulate connection test
      const testResult = {
        success: true,
        latency: Math.floor(Math.random() * 100) + 10,
        status: dataSource.status,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        testResult,
        message: 'Conexão testada com sucesso',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Ação inválida. Use: connect, disconnect ou test',
    }, { status: 400 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar ação',
    }, { status: 500 });
  }
}