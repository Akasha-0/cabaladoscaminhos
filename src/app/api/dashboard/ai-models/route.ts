// ============================================================
// DASHBOARD AI MODELS API - CABALA DOS CAMINHOS
// ============================================================
// Gerenciamento de modelos de IA
// - Listar modelos com status e métricas
// - Criar, treinar, atualizar e remover modelos
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface AIModel {
  id: string;
  nome: string;
  tipo: 'chat' | 'completion' | 'embedding' | 'vision' | 'speech';
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
}

interface AIModelsData {
  modelos: AIModel[];
  total: number;
  ativos: number;
}

// Mock data
const mockModels: AIModel[] = [
  {
    id: 'model-001',
    nome: 'MiniMax Chat',
    tipo: 'chat',
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
  },
  {
    id: 'model-003',
    nome: 'GPT-4 Backup',
    tipo: 'chat',
    provider: 'OpenAI',
    modelo: 'gpt-4',
    status: 'inactive',
    habilitado: false,
    configuracao: {
      temperatura: 0.8,
      maxTokens: 4096,
      topP: 0.9,
      frequenciaPenalty: 0.3,
      presencaPenalty: 0.2,
    },
    metricas: {
      totalRequisicoes: 12500,
      requisicoesHoje: 0,
      errosHoje: 0,
      tempoMedioResposta: 2.1,
      taxaSucesso: 98.5,
      custoTotal: 125.60,
    },
    versao: '1.0.0',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    ultimoUso: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'model-004',
    nome: 'Spiritual Analysis',
    tipo: 'completion',
    provider: 'MiniMax',
    modelo: 'abab5.5-chat-spiritual',
    status: 'training',
    habilitado: true,
    configuracao: {
      temperatura: 0.9,
      maxTokens: 3072,
      topP: 0.95,
      frequenciaPenalty: 0.2,
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
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    ultimoUso: null,
  },
  {
    id: 'model-005',
    nome: 'Claudio TTS',
    tipo: 'speech',
    provider: 'MiniMax',
    modelo: 'speech-01-turbo',
    status: 'active',
    habilitado: true,
    configuracao: {
      temperatura: 0.0,
      maxTokens: 1024,
      topP: 1.0,
      frequenciaPenalty: 0.0,
      presencaPenalty: 0.0,
    },
    metricas: {
      totalRequisicoes: 8920,
      requisicoesHoje: 340,
      errosHoje: 1,
      tempoMedioResposta: 0.8,
      taxaSucesso: 99.7,
      custoTotal: 28.90,
    },
    versao: '1.2.0',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    ultimoUso: new Date(Date.now() - 1800000).toISOString(),
  },
];

function getModelsData(): AIModelsData {
  return {
    modelos: mockModels,
    total: mockModels.length,
    ativos: mockModels.filter(m => m.status === 'active' && m.habilitado).length,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const statusFilter = searchParams.get('status');
  const tipoFilter = searchParams.get('tipo');
  const providerFilter = searchParams.get('provider');
  const enabledOnly = searchParams.get('enabled') === 'true';

  try {
    let filtered = [...mockModels];

    if (statusFilter) {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    if (tipoFilter) {
      filtered = filtered.filter(m => m.tipo === tipoFilter);
    }

    if (providerFilter) {
      filtered = filtered.filter(m => m.provider === providerFilter);
    }

    if (enabledOnly) {
      filtered = filtered.filter(m => m.habilitado);
    }

    // Sort by status priority and name
    const statusOrder: Record<string, number> = { active: 0, training: 1, inactive: 2, error: 3, deprecated: 4 };
    filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.nome.localeCompare(b.nome));

    return NextResponse.json({
      success: true,
      data: filtered,
      total: mockModels.length,
      ativos: mockModels.filter(m => m.status === 'active' && m.habilitado).length,
      filtered: filtered.length,
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao obter modelos de IA',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create': {
        const { nome, tipo, provider, modelo } = body;

        if (!nome || !tipo) {
          return NextResponse.json({
            success: false,
            error: 'Nome e tipo são obrigatórios',
          }, { status: 400 });
        }

        const novoModelo: AIModel = {
          id: `model-${Date.now()}`,
          nome,
          tipo,
          provider: provider || 'custom',
          modelo: modelo || nome.toLowerCase().replace(/\s+/g, '-'),
          status: 'inactive',
          habilitado: false,
          configuracao: {
            temperatura: 0.7,
            maxTokens: 2048,
            topP: 0.95,
            frequenciaPenalty: 0.0,
            presencaPenalty: 0.0,
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

        mockModels.push(novoModelo);

        return NextResponse.json({
          success: true,
          data: novoModelo,
          message: 'Modelo criado com sucesso',
        }, { status: 201 });
      }

      case 'train': {
        const { modelId, datasetId } = body;

        if (!modelId) {
          return NextResponse.json({
            success: false,
            error: 'ID do modelo é obrigatório',
          }, { status: 400 });
        }

        const modelIndex = mockModels.findIndex(m => m.id === modelId);
        if (modelIndex === -1) {
          return NextResponse.json({
            success: false,
            error: 'Modelo não encontrado',
          }, { status: 404 });
        }

        if (mockModels[modelIndex].status === 'training') {
          return NextResponse.json({
            success: false,
            error: 'Modelo já está em treinamento',
          }, { status: 400 });
        }

        mockModels[modelIndex].status = 'training';
        mockModels[modelIndex].updatedAt = new Date().toISOString();

        // Simulate training completion
        setTimeout(() => {
          const idx = mockModels.findIndex(m => m.id === modelId);
          if (idx !== -1 && mockModels[idx].status === 'training') {
            mockModels[idx].status = 'active';
            mockModels[idx].habilitado = true;
            mockModels[idx].versao = incrementVersion(mockModels[idx].versao);
            mockModels[idx].updatedAt = new Date().toISOString();
          }
        }, 5000);

        return NextResponse.json({
          success: true,
          data: mockModels[modelIndex],
          message: 'Treinamento iniciado',
          tempoEstimado: '5 segundos',
        }, { status: 200 });
      }

      case 'predict': {
        const { modelId, prompt, parametros } = body;

        if (!modelId || !prompt) {
          return NextResponse.json({
            success: false,
            error: 'ID do modelo e prompt são obrigatórios',
          }, { status: 400 });
        }

        const model = mockModels.find(m => m.id === modelId);
        if (!model) {
          return NextResponse.json({
            success: false,
            error: 'Modelo não encontrado',
          }, { status: 404 });
        }

        if (model.status !== 'active' || !model.habilitado) {
          return NextResponse.json({
            success: false,
            error: 'Modelo não está ativo',
          }, { status: 400 });
        }

        // Simulate prediction
        const prediction = {
          modelId,
          modelNome: model.nome,
          prompt,
          resposta: `Resposta simulada do modelo ${model.nome}`,
          tokensUsados: Math.floor(Math.random() * 500) + 100,
          tempoResposta: Math.random() * 2 + 0.5,
          createdAt: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: prediction,
        }, { status: 200 });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não reconhecida',
        }, { status: 400 });
    }
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao processar requisição',
    }, { status: 500 });
  }
}

function incrementVersion(version: string): string {
  const parts = version.split('.');
  const lastPart = parseInt(parts[parts.length - 1], 10) + 1;
  parts[parts.length - 1] = lastPart.toString();
  return parts.join('.');
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, nome, configuracao, habilitado } = body;

    if (!modelId) {
      return NextResponse.json({
        success: false,
        error: 'ID do modelo é obrigatório',
      }, { status: 400 });
    }

    const modelIndex = mockModels.findIndex(m => m.id === modelId);
    if (modelIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Modelo não encontrado',
      }, { status: 404 });
    }

    const model = mockModels[modelIndex];

    if (nome) model.nome = nome;
    if (configuracao) {
      model.configuracao = { ...model.configuracao, ...configuracao };
    }
    if (typeof habilitado === 'boolean') {
      model.habilitado = habilitado;
      if (habilitado && model.status === 'inactive') {
        model.status = 'active';
      } else if (!habilitado && model.status === 'active') {
        model.status = 'inactive';
      }
    }
    model.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: model,
      message: 'Modelo atualizado com sucesso',
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao atualizar modelo',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const modelId = searchParams.get('id');

  try {
    if (!modelId) {
      return NextResponse.json({
        success: false,
        error: 'ID do modelo é obrigatório',
      }, { status: 400 });
    }

    const modelIndex = mockModels.findIndex(m => m.id === modelId);
    if (modelIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Modelo não encontrado',
      }, { status: 404 });
    }

    const removido = mockModels.splice(modelIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: { removidoId: removido.id, nome: removido.nome },
      message: 'Modelo removido com sucesso',
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao remover modelo',
    }, { status: 500 });
  }
}