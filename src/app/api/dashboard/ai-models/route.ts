// ============================================================
// DASHBOARD AI MODELS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ModelTypeSchema = z.enum(['chat', 'completion', 'embedding', 'vision', 'speech', 'oracle', 'divination']);
const ModelStatusSchema = z.enum(['active', 'inactive', 'training', 'error', 'deprecated']);
const ModelQuerySchema = z.object({
  tipo: ModelTypeSchema.optional(),
  status: ModelStatusSchema.optional(),
  provider: z.string().optional(),
  habilitado: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
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
});

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
  // Spiritual correlations
  sefirot?: string[];
  tradicao?: string;
  proposito?: string;
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
    nome: 'MiniMax Oracle',
    tipo: 'oracle',
    provider: 'MiniMax',
    modelo: 'abab5.5-chat',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.7,
      maxTokens: 2048,
      topP: 0.95,
      frequenciaPenalty: 0.5,
      presencaPenalty: 0.0,
    },
    metricas: {
      totalRequisicoes: 89420,
      requisicoesHoje: 1245,
      errosHoje: 8,
      tempoMedioResposta: 1.2,
      taxaSucesso: 99.4,
      custoTotal: 45.80,
    },
    versao: '2.1.0',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    ultimoUso: new Date(Date.now() - 60000).toISOString(),
    sefirot: ['Chokhmah', 'Binah', 'Tipheret'],
    tradicao: 'Oracle Cabalístico',
    proposito: 'Respostas espirituais baseadas em múltiplas tradições',
  },
  {
    id: 'model-002',
    nome: 'MiniMax Embedding',
    tipo: 'embedding',
    provider: 'MiniMax',
    modelo: 'embo-01',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.0,
      maxTokens: 512,
      topP: 1.0,
      frequenciaPenalty: 0.0,
      presencaPenalty: 0.0,
    },
    metricas: {
      totalRequisicoes: 345600,
      requisicoesHoje: 8920,
      errosHoje: 2,
      tempoMedioResposta: 0.3,
      taxaSucesso: 99.8,
      custoTotal: 12.40,
    },
    versao: '1.5.0',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    ultimoUso: new Date(Date.now() - 300000).toISOString(),
    sefirot: ['Yesod'],
    tradicao: 'Armazenamento de Conhecimento',
    proposito: 'Embedding de textos cabalísticos e tradições',
  },
  {
    id: 'model-003',
    nome: 'Oracle Ifá',
    tipo: 'divination',
    provider: 'OpenAI',
    modelo: 'gpt-4',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.8,
      maxTokens: 4096,
      topP: 0.9,
      frequenciaPenalty: 0.3,
      presencaPenalty: 0.2,
    },
    metricas: {
      totalRequisicoes: 12500,
      requisicoesHoje: 350,
      errosHoje: 1,
      tempoMedioResposta: 2.1,
      taxaSucesso: 99.1,
      custoTotal: 78.50,
    },
    versao: '3.0.0',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    ultimoUso: new Date(Date.now() - 120000).toISOString(),
    sefirot: ['Binah', 'Chokhmah'],
    tradicao: 'Ifá/Candomblé',
    proposito: 'Interpretação de Odús e orientação ancestral',
  },
  {
    id: 'model-004',
    nome: 'Chat Tarot',
    tipo: 'chat',
    provider: 'MiniMax',
    modelo: 'abab5.5-chat',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.6,
      maxTokens: 1536,
      topP: 0.92,
      frequenciaPenalty: 0.4,
      presencaPenalty: 0.1,
    },
    metricas: {
      totalRequisicoes: 67800,
      requisicoesHoje: 890,
      errosHoje: 3,
      tempoMedioResposta: 1.5,
      taxaSucesso: 99.2,
      custoTotal: 32.70,
    },
    versao: '2.0.0',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    ultimoUso: new Date(Date.now() - 180000).toISOString(),
    sefirot: ['Tipheret'],
    tradicao: 'Tarot Egípcio',
    proposito: 'Análise de cartas e spreads de tarot',
  },
  {
    id: 'model-005',
    nome: 'Numerologia Cabalística',
    tipo: 'completion',
    provider: 'OpenAI',
    modelo: 'gpt-3.5-turbo',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.3,
      maxTokens: 1024,
      topP: 0.95,
      frequenciaPenalty: 0.2,
      presencaPenalty: 0.0,
    },
    metricas: {
      totalRequisicoes: 45600,
      requisicoesHoje: 420,
      errosHoje: 2,
      tempoMedioResposta: 0.8,
      taxaSucesso: 99.5,
      custoTotal: 18.90,
    },
    versao: '1.8.0',
    createdAt: new Date(Date.now() - 75 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    ultimoUso: new Date(Date.now() - 600000).toISOString(),
    sefirot: ['Malkuth', 'Kether'],
    tradicao: 'Cabala Numérica',
    proposito: 'Cálculo de caminhos de vida e números mestres',
  },
  {
    id: 'model-006',
    nome: 'Astrologia Integration',
    tipo: 'oracle',
    provider: 'MiniMax',
    modelo: 'abab5.5-chat',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.5,
      maxTokens: 2048,
      topP: 0.93,
      frequenciaPenalty: 0.3,
      presencaPenalty: 0.1,
    },
    metricas: {
      totalRequisicoes: 38200,
      requisicoesHoje: 280,
      errosHoje: 1,
      tempoMedioResposta: 1.3,
      taxaSucesso: 99.6,
      custoTotal: 15.60,
    },
    versao: '2.2.0',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    ultimoUso: new Date(Date.now() - 240000).toISOString(),
    sefirot: ['Chokhmah', 'Gevurah'],
    tradicao: 'Astrologia Occidental',
    proposito: 'Análise de trânsitos e aspectos planetários',
  },
  {
    id: 'model-007',
    nome: 'Meditação Guiada',
    tipo: 'oracle',
    provider: 'MiniMax',
    modelo: 'abab5.5-chat',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.9,
      maxTokens: 3072,
      topP: 0.98,
      frequenciaPenalty: 0.6,
      presencaPenalty: 0.3,
    },
    metricas: {
      totalRequisicoes: 23400,
      requisicoesHoje: 150,
      errosHoje: 0,
      tempoMedioResposta: 2.0,
      taxaSucesso: 100,
      custoTotal: 10.20,
    },
    versao: '1.5.0',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    ultimoUso: new Date(Date.now() - 900000).toISOString(),
    sefirot: ['Kether', 'Tipheret', 'Netzach'],
    tradicao: 'Yoga/Vipassana',
    proposito: 'Meditações guiadas e visualizações espirituais',
  },
  {
    id: 'model-008',
    nome: 'Backup Model',
    tipo: 'chat',
    provider: 'OpenAI',
    modelo: 'gpt-3.5-turbo',
    status: 'inactive',
    habilitado: false,
    configuracao: {
      temperatura: 0.7,
      maxTokens: 2048,
      topP: 0.95,
      frequenciaPenalty: 0.5,
      presencaPenalty: 0.0,
    },
    metricas: {
      totalRequisicoes: 8900,
      requisicoesHoje: 0,
      errosHoje: 0,
      tempoMedioResposta: 0,
      taxaSucesso: 0,
      custoTotal: 0,
    },
    versao: '1.0.0',
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    ultimoUso: new Date(Date.now() - 86400000 * 4).toISOString(),
    tradicao: 'Backup',
    proposito: 'Modelo de backup em caso de falha',
  },
];

function getModelsData(): AIModelsData {
  return {
    modelos: mockModels,
    total: mockModels.length,
    ativos: mockModels.filter(m => m.status === 'active').length,
  };
}

// ─── API Routes ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = ModelQuerySchema.safeParse({
      tipo: searchParams.get('tipo'),
      status: searchParams.get('status'),
      provider: searchParams.get('provider'),
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

    const { tipo, status, provider, habilitado, limit } = parseResult.data;
    let modelos = [...mockModels];

    // Apply filters
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

    if (limit) {
      modelos = modelos.slice(0, limit);
    }

    const data = getModelsData();

    return NextResponse.json({
      success: true,
      modelos,
      pagination: {
        total: modelos.length,
        limit: limit || modelos.length,
      },
      stats: {
        total: data.total,
        ativos: data.ativos,
        inativos: data.total - data.ativos,
      },
      byProvider: {
        MiniMax: mockModels.filter(m => m.provider === 'MiniMax').length,
        OpenAI: mockModels.filter(m => m.provider === 'OpenAI').length,
      },
      byTipo: {
        oracle: mockModels.filter(m => m.tipo === 'oracle').length,
        divination: mockModels.filter(m => m.tipo === 'divination').length,
        chat: mockModels.filter(m => m.tipo === 'chat').length,
        embedding: mockModels.filter(m => m.tipo === 'embedding').length,
        completion: mockModels.filter(m => m.tipo === 'completion').length,
      },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar modelos',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateModelSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const model: AIModel = {
      id: `model-${Date.now()}`,
      nome: parseResult.data.nome,
      tipo: parseResult.data.tipo,
      provider: parseResult.data.provider,
      modelo: parseResult.data.modelo,
      status: 'inactive',
      habilitado: false,
      configuracao: parseResult.data.configuracao || {
        temperatura: 0.7,
        maxTokens: 2048,
        topP: 0.95,
        frequenciaPenalty: 0,
        presencaPenalty: 0,
      },
      metricas: {
        totalRequisicoes: 0,
        requisicoesHoje: 0,
        errosHoje: 0,
        tempoMedioResposta: 0,
        taxaSucesso: 0,
        custoTotal: 0,
      },
      versao: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ultimoUso: null,
    };

    mockModels.push(model);

    return NextResponse.json({
      success: true,
      modelo: model,
      message: 'Modelo criado com sucesso',
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar modelo',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = UpdateModelSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const model = mockModels.find(m => m.id === parseResult.data.id);

    if (!model) {
      return NextResponse.json({
        success: false,
        error: 'Modelo não encontrado',
        validIds: mockModels.map(m => m.id),
      }, { status: 404 });
    }

    // Update configuration
    if (parseResult.data.configuracao) {
      model.configuracao = { ...model.configuracao, ...parseResult.data.configuracao };
    }

    // Update enabled status
    if (parseResult.data.habilitado !== undefined) {
      model.habilitado = parseResult.data.habilitado;
      model.status = parseResult.data.habilitado ? 'active' : 'inactive';
    }

    model.updatedAt = new Date().toISOString();

    // Increment version
    const versionParts = model.versao.split('.');
    versionParts[2] = String(parseInt(versionParts[2]) + 1);
    model.versao = versionParts.join('.');

    return NextResponse.json({
      success: true,
      modelo: model,
      message: 'Modelo atualizado com sucesso',
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao atualizar modelo',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID é obrigatório',
      }, { status: 400 });
    }

    const index = mockModels.findIndex(m => m.id === id);

    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: 'Modelo não encontrado',
      }, { status: 404 });
    }

    mockModels.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Modelo removido com sucesso',
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao remover modelo',
    }, { status: 500 });
  }
}