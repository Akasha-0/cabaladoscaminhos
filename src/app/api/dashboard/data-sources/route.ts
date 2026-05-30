// ============================================================
// DASHBOARD DATA SOURCES API - CABALA DOS CAMINHOS
// ============================================================
// Gerenciamento de fontes de dados do dashboard
// - Listar fontes de dados com métricas
// - Conectar/desconectar fontes
// - Testar conexões
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface DataSource {
  id: string;
  nome: string;
  tipo: 'api' | 'database' | 'file' | 'stream' | 'cache';
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
}

interface DataSourcesData {
  fontes: DataSource[];
  total: number;
  conectadas: number;
}

// Mock data
const mockDataSources: DataSource[] = [
  {
    id: 'ds-001',
    nome: 'API MiniMax',
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
  },
  {
    id: 'ds-003',
    nome: 'Cache Redis',
    tipo: 'cache',
    status: 'connected',
    configuracao: {
      host: 'redis.cabala.example.com',
      porta: 6379,
      autenticacao: 'basic',
      ssl: true,
    },
    metricas: {
      latencia: 2,
      uptime: 99.99,
      requisicoes: 1245890,
      erros: 0,
      ultimoSync: new Date().toISOString(),
    },
    habilitado: true,
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'ds-004',
    nome: 'Stream de Eventos',
    tipo: 'stream',
    status: 'syncing',
    configuracao: {
      host: 'stream.cabala.example.com',
      porta: 9092,
      autenticacao: 'bearer',
      ssl: true,
    },
    metricas: {
      latencia: 45,
      uptime: 98.5,
      requisicoes: 34560,
      erros: 5,
      ultimoSync: new Date(Date.now() - 60000).toISOString(),
    },
    habilitado: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'ds-005',
    nome: 'Arquivos Locais',
    tipo: 'file',
    status: 'disconnected',
    configuracao: {
      autenticacao: 'none',
      ssl: false,
    },
    metricas: {
      latencia: 0,
      uptime: 0,
      requisicoes: 0,
      erros: 0,
      ultimoSync: null,
    },
    habilitado: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

function getDataSourcesData(): DataSourcesData {
  return {
    fontes: mockDataSources,
    total: mockDataSources.length,
    conectadas: mockDataSources.filter(ds => ds.status === 'connected').length,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const statusFilter = searchParams.get('status');
  const tipoFilter = searchParams.get('tipo');
  const enabledOnly = searchParams.get('enabled') === 'true';

  try {
    let filtered = [...mockDataSources];

    if (statusFilter) {
      filtered = filtered.filter(ds => ds.status === statusFilter);
    }

    if (tipoFilter) {
      filtered = filtered.filter(ds => ds.tipo === tipoFilter);
    }

    if (enabledOnly) {
      filtered = filtered.filter(ds => ds.habilitado);
    }

    // Sort by status priority
    const statusOrder: Record<string, number> = { connected: 0, syncing: 1, error: 2, disconnected: 3 };
    filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return NextResponse.json({
      success: true,
      data: filtered,
      total: mockDataSources.length,
      conectadas: mockDataSources.filter(ds => ds.status === 'connected').length,
      filtered: filtered.length,
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao obter fontes de dados',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'connect': {
        const { sourceId } = body;

        if (!sourceId) {
          return NextResponse.json({
            success: false,
            error: 'ID da fonte de dados é obrigatório',
          }, { status: 400 });
        }

        const sourceIndex = mockDataSources.findIndex(ds => ds.id === sourceId);
        if (sourceIndex === -1) {
          return NextResponse.json({
            success: false,
            error: 'Fonte de dados não encontrada',
          }, { status: 404 });
        }

        mockDataSources[sourceIndex].status = 'syncing';
        mockDataSources[sourceIndex].habilitado = true;

        // Simulate connection success after delay
        setTimeout(() => {
          const idx = mockDataSources.findIndex(ds => ds.id === sourceId);
          if (idx !== -1 && mockDataSources[idx].status === 'syncing') {
            mockDataSources[idx].status = 'connected';
            mockDataSources[idx].metricas.ultimoSync = new Date().toISOString();
          }
        }, 100);

        return NextResponse.json({
          success: true,
          data: mockDataSources[sourceIndex],
          message: 'Conexão iniciada',
        }, { status: 200 });
      }

      case 'disconnect': {
        const { sourceId } = body;

        if (!sourceId) {
          return NextResponse.json({
            success: false,
            error: 'ID da fonte de dados é obrigatório',
          }, { status: 400 });
        }

        const sourceIndex = mockDataSources.findIndex(ds => ds.id === sourceId);
        if (sourceIndex === -1) {
          return NextResponse.json({
            success: false,
            error: 'Fonte de dados não encontrada',
          }, { status: 404 });
        }

        mockDataSources[sourceIndex].status = 'disconnected';
        mockDataSources[sourceIndex].habilitado = false;

        return NextResponse.json({
          success: true,
          data: mockDataSources[sourceIndex],
          message: 'Fonte de dados desconectada',
        }, { status: 200 });
      }

      case 'test': {
        const { sourceId } = body;

        if (!sourceId) {
          return NextResponse.json({
            success: false,
            error: 'ID da fonte de dados é obrigatório',
          }, { status: 400 });
        }

        const source = mockDataSources.find(ds => ds.id === sourceId);
        if (!source) {
          return NextResponse.json({
            success: false,
            error: 'Fonte de dados não encontrada',
          }, { status: 404 });
        }

        // Simulate connection test
        const testeSucesso = Math.random() > 0.1;
        const latenciaSimulada = Math.floor(Math.random() * 100) + 5;

        return NextResponse.json({
          success: true,
          data: {
            sourceId,
            nome: source.nome,
            sucesso: testeSucesso,
            latencia: latenciaSimulada,
            mensagem: testeSucesso 
              ? 'Conexão estabelecida com sucesso' 
              : 'Falha ao conectar. Verifique as configurações.',
          },
        }, { status: 200 });
      }

      case 'create': {
        const { nome, tipo, configuracao } = body;

        if (!nome || !tipo) {
          return NextResponse.json({
            success: false,
            error: 'Nome e tipo são obrigatórios',
          }, { status: 400 });
        }

        const novaFonte: DataSource = {
          id: `ds-${Date.now()}`,
          nome,
          tipo,
          status: 'disconnected',
          configuracao: {
            autenticacao: 'none',
            ssl: true,
            ...configuracao,
          },
          metricas: {
            latencia: 0,
            uptime: 0,
            requisicoes: 0,
            erros: 0,
            ultimoSync: null,
          },
          habilitado: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockDataSources.push(novaFonte);

        return NextResponse.json({
          success: true,
          data: novaFonte,
          message: 'Fonte de dados criada com sucesso',
        }, { status: 201 });
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, nome, configuracao, habilitado } = body;

    if (!sourceId) {
      return NextResponse.json({
        success: false,
        error: 'ID da fonte de dados é obrigatório',
      }, { status: 400 });
    }

    const sourceIndex = mockDataSources.findIndex(ds => ds.id === sourceId);
    if (sourceIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Fonte de dados não encontrada',
      }, { status: 404 });
    }

    const source = mockDataSources[sourceIndex];

    if (nome) source.nome = nome;
    if (configuracao) {
      source.configuracao = { ...source.configuracao, ...configuracao };
    }
    if (typeof habilitado === 'boolean') {
      source.habilitado = habilitado;
    }
    source.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: source,
      message: 'Fonte de dados atualizada com sucesso',
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao atualizar fonte de dados',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sourceId = searchParams.get('id');

  try {
    if (!sourceId) {
      return NextResponse.json({
        success: false,
        error: 'ID da fonte de dados é obrigatório',
      }, { status: 400 });
    }

    const sourceIndex = mockDataSources.findIndex(ds => ds.id === sourceId);
    if (sourceIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Fonte de dados não encontrada',
      }, { status: 404 });
    }

    const removida = mockDataSources.splice(sourceIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: { removidaId: removida.id, nome: removida.nome },
      message: 'Fonte de dados removida com sucesso',
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao remover fonte de dados',
    }, { status: 500 });
  }
}