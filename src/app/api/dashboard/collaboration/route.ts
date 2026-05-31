// ============================================================
// DASHBOARD COLLABORATION API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CollaborationViewSchema = z.enum(['users', 'activities', 'invites', 'all']);
const CollaborationQuerySchema = z.object({
  view: CollaborationViewSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['online', 'away', 'busy', 'offline']).optional(),
});
interface Collaborator {
  status: 'online' | 'away' | 'busy' | 'offline';
  funcao: 'admin' | 'editor' | 'viewer';
  ultimoAcesso: string;
  sessaoAtual: string | null;
}

interface Atividade {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  tipo: 'join' | 'leave' | 'edit' | 'view' | 'comment' | 'share';
  descricao: string;
  recurso: string | null;
  timestamp: string;
}

interface Convite {
  id: string;
  paraEmail: string;
  funcao: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  criadoPor: string;
  criadoEm: string;
  expiraEm: string;
}

interface ColaboracaoData {
  colaboradores: Collaborator[];
  atividades: Atividade[];
  convites: Convite[];
  totalOnline: number;
}

// Mock data
const mockColaboradores: Collaborator[] = [
  {
    id: 'collab-001',
    nome: 'Maria Silva',
    email: 'maria@exemplo.com',
    avatar: null,
    status: 'online',
    funcao: 'admin',
    ultimoAcesso: new Date().toISOString(),
    sessaoAtual: 'sessao-main-001',
  },
  {
    id: 'collab-002',
    nome: 'João Santos',
    email: 'joao@exemplo.com',
    avatar: null,
    status: 'online',
    funcao: 'editor',
    ultimoAcesso: new Date(Date.now() - 60000).toISOString(),
    sessaoAtual: 'sessao-main-001',
  },
  {
    id: 'collab-003',
    nome: 'Ana Costa',
    email: 'ana@exemplo.com',
    avatar: null,
    status: 'away',
    funcao: 'viewer',
    ultimoAcesso: new Date(Date.now() - 300000).toISOString(),
    sessaoAtual: null,
  },
  {
    id: 'collab-004',
    nome: 'Pedro Oliveira',
    email: 'pedro@exemplo.com',
    avatar: null,
    status: 'offline',
    funcao: 'editor',
    ultimoAcesso: new Date(Date.now() - 3600000).toISOString(),
    sessaoAtual: null,
  },
];

const mockAtividades: Atividade[] = [
  {
    id: 'ativ-001',
    usuarioId: 'collab-001',
    usuarioNome: 'Maria Silva',
    tipo: 'edit',
    descricao: 'Atualizou configuração do mapa astral',
    recurso: 'mapa-astral-config',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'ativ-002',
    usuarioId: 'collab-002',
    usuarioNome: 'João Santos',
    tipo: 'view',
    descricao: 'Visualizou relatório de numerologia',
    recurso: 'numerologia-relatorio',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'ativ-003',
    usuarioId: 'collab-001',
    usuarioNome: 'Maria Silva',
    tipo: 'comment',
    descricao: 'Adicionou comentário no Odu',
    recurso: 'odu-ogunda',
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'ativ-004',
    usuarioId: 'collab-002',
    usuarioNome: 'João Santos',
    tipo: 'join',
    descricao: 'Entrou na sessão de colaboração',
    recurso: null,
    timestamp: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'ativ-005',
    usuarioId: 'collab-003',
    usuarioNome: 'Ana Costa',
    tipo: 'leave',
    descricao: 'Saiu da sessão de colaboração',
    recurso: null,
    timestamp: new Date(Date.now() - 1500000).toISOString(),
  },
];

const mockConvites: Convite[] = [
  {
    id: 'convite-001',
    paraEmail: 'novo@exemplo.com',
    funcao: 'viewer',
    status: 'pending',
    criadoPor: 'collab-001',
    criadoEm: new Date(Date.now() - 86400000).toISOString(),
    expiraEm: new Date(Date.now() + 6 * 86400000).toISOString(),
  },
];

function getColaboracaoData(): ColaboracaoData {
  return {
    colaboradores: mockColaboradores,
    atividades: mockAtividades,
    convites: mockConvites,
    totalOnline: mockColaboradores.filter(c => c.status === 'online').length,
  };
}

export async function GET(request: NextRequest) {
  try {
    const parseResult = CollaborationQuerySchema.safeParse({
      view: searchParams.get('view'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { view = 'all', limit, status } = parseResult.data;
    if (view === 'users') {
      let users = [...mockColaboradores];
      if (status) {
        users = users.filter(u => u.status === status);
      }
      if (limit) {
        users = users.slice(0, limit);
      }
      return NextResponse.json({
        success: true,
        data: users,
        totalOnline: mockColaboradores.filter(c => c.status === 'online').length,
      }, { status: 200 });
    }
    if (view === 'activities') {
      let activities = [...mockAtividades];
      if (limit) {
        activities = activities.slice(0, limit);
      }
      return NextResponse.json({
        success: true,
        data: activities,
      }, { status: 200 });
    }
    if (view === 'invites') {
      let invites = [...mockConvites];
      if (limit) {
        invites = invites.slice(0, limit);
      }
      return NextResponse.json({
        success: true,
        data: invites,
      }, { status: 200 });
    }
    return NextResponse.json({
      success: true,
      data: getColaboracaoData(),
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao obter dados de colaboração',
    }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    switch (action) {
      case 'add-activity': {
        const { tipo, descricao, recurso } = body;
        const novaAtividade: Atividade = {
          id: `ativ-${Date.now()}`,
          usuarioId: 'current-user',
          usuarioNome: 'Usuário Atual',
          tipo: tipo || 'edit',
          descricao: descricao || 'Nova atividade registrada',
          recurso: recurso || null,
          timestamp: new Date().toISOString(),
        };
        mockAtividades.unshift(novaAtividade);
        return NextResponse.json({
          success: true,
          data: novaAtividade,
          message: 'Atividade registrada com sucesso',
        }, { status: 201 });
      }

      case 'invite': {
        const { email, funcao } = body;
        if (!email) {
          return NextResponse.json({
            success: false,
            error: 'Email é obrigatório',
          }, { status: 400 });
        }
        const novoConvite: Convite = {
          id: `convite-${Date.now()}`,
          paraEmail: email,
          funcao: funcao || 'viewer',
          status: 'pending',
          criadoPor: 'current-user',
          criadoEm: new Date().toISOString(),
          expiraEm: new Date(Date.now() + 7 * 86400000).toISOString(),
        };
        mockConvites.push(novoConvite);
        return NextResponse.json({
          success: true,
          data: novoConvite,
          message: `Convite enviado para ${email}`,
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
    const { collaboratorId, status } = body;

    if (!collaboratorId) {
      return NextResponse.json({
        success: false,
        error: 'ID do colaborador é obrigatório',
      }, { status: 400 });
    }

    const collaboratorIndex = mockColaboradores.findIndex(c => c.id === collaboratorId);
    if (collaboratorIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Colaborador não encontrado',
      }, { status: 404 });
    }

    if (status) {
      mockColaboradores[collaboratorIndex].status = status;
    }

    return NextResponse.json({
      success: true,
      data: mockColaboradores[collaboratorIndex],
      message: 'Status atualizado com sucesso',
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao atualizar status',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const collaboratorId = searchParams.get('id');

  try {
    if (!collaboratorId) {
      return NextResponse.json({
        success: false,
        error: 'ID do colaborador é obrigatório',
      }, { status: 400 });
    }

    const collaboratorIndex = mockColaboradores.findIndex(c => c.id === collaboratorId);
    if (collaboratorIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Colaborador não encontrado',
      }, { status: 404 });
    }

    const removido = mockColaboradores.splice(collaboratorIndex, 1)[0];
    
    // Adicionar atividade de saída
    const atividadeSaida: Atividade = {
      id: `ativ-${Date.now()}`,
      usuarioId: removido.id,
      usuarioNome: removido.nome,
      tipo: 'leave',
      descricao: 'Saiu da sessão de colaboração',
      recurso: null,
      timestamp: new Date().toISOString(),
    };
    mockAtividades.unshift(atividadeSaida);

    return NextResponse.json({
      success: true,
      data: { removidoId: removido.id },
      message: 'Usuário removido da sessão',
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao remover usuário',
    }, { status: 500 });
  }
}