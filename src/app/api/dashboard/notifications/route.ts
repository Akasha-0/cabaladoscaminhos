// ============================================================
// DASHBOARD NOTIFICATIONS API - CABALA DOS CAMINHOS
// ============================================================
// Gerenciamento de notificações do dashboard
// - Listar notificações com filtros
// - Criar, atualizar e remover notificações
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface Notificacao {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'error' | 'system' | 'reading' | 'payment';
  titulo: string;
  mensagem: string;
  lida: boolean;
  важність: 'low' | 'medium' | 'high';
  acaoUrl: string | null;
  createdAt: string;
  lidaEm: string | null;
}

interface NotificacoesData {
  notificacoes: Notificacao[];
  total: number;
  naoLidas: number;
}

// Mock data
const mockNotificacoes: Notificacao[] = [
  {
    id: 'notif-001',
    tipo: 'success',
    titulo: 'Leitura Concluída',
    mensagem: 'Sua leitura de tarot foi concluída com sucesso.',
    lida: false,
    важність: 'high',
    acaoUrl: '/dashboard/leituras/tarot-001',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    lidaEm: null,
  },
  {
    id: 'notif-002',
    tipo: 'payment',
    titulo: 'Créditos Adicionados',
    mensagem: '100 créditos foram adicionados à sua conta.',
    lida: false,
    важність: 'medium',
    acaoUrl: '/dashboard/creditos',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    lidaEm: null,
  },
  {
    id: 'notif-003',
    tipo: 'reading',
    titulo: 'Novo Odu Disponível',
    mensagem: 'O Odu do dia está pronto para consulta.',
    lida: true,
    важність: 'medium',
    acaoUrl: '/dashboard/oracula/odu-do-dia',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    lidaEm: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'notif-004',
    tipo: 'info',
    titulo: 'Atualização do Sistema',
    mensagem: 'Nova versão do mapa astral disponível.',
    lida: true,
    важність: 'low',
    acaoUrl: '/dashboard/mapa-astral',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    lidaEm: new Date(Date.now() - 6000000).toISOString(),
  },
  {
    id: 'notif-005',
    tipo: 'warning',
    titulo: 'Créditos Esgotando',
    mensagem: 'Você possui apenas 50 créditos restantes.',
    lida: false,
    важність: 'high',
    acaoUrl: '/dashboard/creditos/comprar',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    lidaEm: null,
  },
  {
    id: 'notif-006',
    tipo: 'system',
    titulo: 'Manutenção Agendada',
    mensagem: 'Sistema estará em manutenção às 3h da manhã.',
    lida: true,
    важність: 'low',
    acaoUrl: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lidaEm: new Date(Date.now() - 82800000).toISOString(),
  },
  {
    id: 'notif-007',
    tipo: 'success',
    titulo: 'Análise Numerológica',
    mensagem: 'Sua análise numerológica está pronta.',
    lida: false,
    важність: 'medium',
    acaoUrl: '/dashboard/numerologia/analise',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    lidaEm: null,
  },
];

function getNotificacoesData(): NotificacoesData {
  return {
    notificacoes: mockNotificacoes,
    total: mockNotificacoes.length,
    naoLidas: mockNotificacoes.filter(n => !n.lida).length,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const readFilter = searchParams.get('read');
  const tipoFilter = searchParams.get('tipo');
  const dateFrom = searchParams.get('from');
  const dateTo = searchParams.get('to');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    let filtered = [...mockNotificacoes];

    // Filter by read status
    if (readFilter === 'true') {
      filtered = filtered.filter(n => n.lida);
    } else if (readFilter === 'false') {
      filtered = filtered.filter(n => !n.lida);
    }

    // Filter by type
    if (tipoFilter) {
      filtered = filtered.filter(n => n.tipo === tipoFilter);
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(n => new Date(n.createdAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filtered = filtered.filter(n => new Date(n.createdAt) <= toDate);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply limit
    filtered = filtered.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: filtered,
      total: mockNotificacoes.length,
      naoLidas: mockNotificacoes.filter(n => !n.lida).length,
      filtered: filtered.length,
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao obter notificações',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create': {
        const { tipo, titulo, mensagem, важність, acaoUrl } = body;
        
        if (!titulo || !mensagem) {
          return NextResponse.json({
            success: false,
            error: 'Título e mensagem são obrigatórios',
          }, { status: 400 });
        }

        const novaNotificacao: Notificacao = {
          id: `notif-${Date.now()}`,
          tipo: tipo || 'info',
          titulo,
          mensagem,
          lida: false,
          важність: важність || 'medium',
          acaoUrl: acaoUrl || null,
          createdAt: new Date().toISOString(),
          lidaEm: null,
        };

        mockNotificacoes.unshift(novaNotificacao);

        return NextResponse.json({
          success: true,
          data: novaNotificacao,
          message: 'Notificação criada com sucesso',
        }, { status: 201 });
      }

      case 'mark-read': {
        const { notificationId } = body;

        if (!notificationId) {
          return NextResponse.json({
            success: false,
            error: 'ID da notificação é obrigatório',
          }, { status: 400 });
        }

        const notificationIndex = mockNotificacoes.findIndex(n => n.id === notificationId);
        if (notificationIndex === -1) {
          return NextResponse.json({
            success: false,
            error: 'Notificação não encontrada',
          }, { status: 404 });
        }

        mockNotificacoes[notificationIndex].lida = true;
        mockNotificacoes[notificationIndex].lidaEm = new Date().toISOString();

        return NextResponse.json({
          success: true,
          data: mockNotificacoes[notificationIndex],
          message: 'Notificação marcada como lida',
        }, { status: 200 });
      }

      case 'mark-all-read': {
        mockNotificacoes.forEach(n => {
          if (!n.lida) {
            n.lida = true;
            n.lidaEm = new Date().toISOString();
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Todas as notificações marcadas como lidas',
          totalLidas: mockNotificacoes.filter(n => n.lida).length,
        }, { status: 200 });
      }

      case 'clear-all': {
        const count = mockNotificacoes.length;
        mockNotificacoes.length = 0;

        return NextResponse.json({
          success: true,
          message: ` ${count} notificações removidas`,
          removidas: count,
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, lida, titulo, mensagem, tipo, важність } = body;

    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'ID da notificação é obrigatório',
      }, { status: 400 });
    }

    const notificationIndex = mockNotificacoes.findIndex(n => n.id === notificationId);
    if (notificationIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Notificação não encontrada',
      }, { status: 404 });
    }

    const notification = mockNotificacoes[notificationIndex];

    // Update fields
    if (typeof lida === 'boolean') {
      notification.lida = lida;
      notification.lidaEm = lida ? new Date().toISOString() : null;
    }
    if (titulo) notification.titulo = titulo;
    if (mensagem) notification.mensagem = mensagem;
    if (tipo) notification.tipo = tipo;
    if (важність) notification.важність = важність;

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notificação atualizada com sucesso',
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao atualizar notificação',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const notificationId = searchParams.get('id');

  try {
    if (!notificationId) {
      return NextResponse.json({
        success: false,
        error: 'ID da notificação é obrigatório',
      }, { status: 400 });
    }

    const notificationIndex = mockNotificacoes.findIndex(n => n.id === notificationId);
    if (notificationIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Notificação não encontrada',
      }, { status: 404 });
    }

    const removida = mockNotificacoes.splice(notificationIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: { removidaId: removida.id },
      message: 'Notificação removida com sucesso',
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao remover notificação',
    }, { status: 500 });
  }
}