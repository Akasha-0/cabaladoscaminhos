// ============================================================
// DASHBOARD NOTIFICATIONS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const NotificacaoTipoSchema = z.enum([
  'info', 'success', 'warning', 'error', 'system',
  'reading', 'payment', 'orixa', 'transito', 'ritual',
  'meditacao', 'ciclo', 'mensagem'
]);
const NotificacaoImportanciaSchema = z.enum(['low', 'medium', 'high', 'critical']);
const NotificationsQuerySchema = z.object({
  tipo: NotificacaoTipoSchema.optional(),
  lida: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  importancia: NotificacaoImportanciaSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
});

const CreateNotificacaoSchema = z.object({
  tipo: NotificacaoTipoSchema,
  titulo: z.string().min(1, 'Título é obrigatório'),
  mensagem: z.string().min(1, 'Mensagem é obrigatória'),
  importancia: NotificacaoImportanciaSchema.optional().default('medium'),
  acaoUrl: z.string().url().optional().nullable(),
  orixa: z.string().optional(),
  sefirot: z.array(z.string()).optional(),
});

// ─── Type Definitions ───────────────────────────────────────────────────────
export interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  importancia: 'low' | 'medium' | 'high' | 'critical';
  acaoUrl: string | null;
  createdAt: string;
  lidaEm: string | null;
  orixa?: string;
  sefirot?: string[];
}

interface NotificacoesData {
  notificacoes: Notificacao[];
  total: number;
  naoLidas: number;
}

export const dynamic = 'force-dynamic';

// ─── Mock Data Store ───────────────────────────────────────────────────────
const notificationStore: Map<string, Notificacao[]> = new Map([
  ['default', [
    {
      id: 'notif-001',
      tipo: 'success',
      titulo: 'Leitura Concluída',
      mensagem: 'Sua leitura de tarot foi concluída com sucesso.',
      lida: false,
      importancia: 'high',
      acaoUrl: '/dashboard/leituras/tarot-001',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      lidaEm: null,
      sefirot: ['Tipheret'],
    },
    {
      id: 'notif-002',
      tipo: 'payment',
      titulo: 'Créditos Adicionados',
      mensagem: '100 créditos foram adicionados à sua conta.',
      lida: false,
      importancia: 'medium',
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
      importancia: 'medium',
      acaoUrl: '/dashboard/oracula/odu-do-dia',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      lidaEm: new Date(Date.now() - 3000000).toISOString(),
      orixa: 'Oxum',
    },
    {
      id: 'notif-004',
      tipo: 'info',
      titulo: 'Atualização do Sistema',
      mensagem: 'Nova versão do mapa astral disponível.',
      lida: true,
      importancia: 'low',
      acaoUrl: '/dashboard/mapa-astral',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      lidaEm: new Date(Date.now() - 6000000).toISOString(),
      sefirot: ['Kether'],
    },
    {
      id: 'notif-005',
      tipo: 'warning',
      titulo: 'Créditos Esgotando',
      mensagem: 'Você possui apenas 50 créditos restantes.',
      lida: false,
      importancia: 'high',
      acaoUrl: '/dashboard/creditos/comprar',
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      lidaEm: null,
    },
    {
      id: 'notif-006',
      tipo: 'orixa',
      titulo: 'Dia de Oxum',
      mensagem: 'Hoje é dedicado a Oxum. Pratique rituais de amor e prosperidade.',
      lida: false,
      importancia: 'high',
      acaoUrl: '/dashboard/rituais/oxum',
      createdAt: new Date(Date.now() - 28800000).toISOString(),
      lidaEm: null,
      orixa: 'Oxum',
      sefirot: ['Chesed', 'Hod'],
    },
    {
      id: 'notif-007',
      tipo: 'transito',
      titulo: 'Netuno em Peixes - Fim de Ciclo',
      mensagem: 'Netuno em Peixes traz encerramento de ciclos. Reflecte sobre suas experiências.',
      lida: false,
      importancia: 'medium',
      acaoUrl: '/dashboard/astrologia/transitos',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      lidaEm: null,
      sefirot: ['Yesod'],
    },
    {
      id: 'notif-008',
      tipo: 'ritual',
      titulo: 'Lembrete: Ritual do Amanhecer',
      mensagem: 'Não se esqueça de realizar seu ritual matinal de conexão com Oxalá.',
      lida: false,
      importancia: 'medium',
      acaoUrl: '/dashboard/rituais/matinal',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lidaEm: null,
      orixa: 'Oxalá',
      sefirot: ['Kether', 'Tipheret'],
    },
    {
      id: 'notif-009',
      tipo: 'meditacao',
      titulo: 'Lua Crescente - Meditação Guiada',
      mensagem: 'A lua crescente é momento propício para meditação e definição de intenções.',
      lida: true,
      importancia: 'low',
      acaoUrl: '/dashboard/meditacao/guiada',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      lidaEm: new Date(Date.now() - 86400000).toISOString(),
      sefirot: ['Chokhmah'],
    },
    {
      id: 'notif-010',
      tipo: 'ciclo',
      titulo: 'Novo Ano Cabalístico',
      mensagem: 'O Ano Cabalístico começa! Faça uma limpeza energética e renove suas intenções.',
      lida: false,
      importancia: 'critical',
      acaoUrl: '/dashboard/cabala/ano-novo',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      lidaEm: null,
      sefirot: ['Malkuth'],
    },
  ]],
]);

function getNotificacoes(userId: string): Notificacao[] {
  return notificationStore.get(userId) || notificationStore.get('default')!;
}

function getNotificacoesData(userId: string): NotificacoesData {
  const notificacoes = getNotificacoes(userId);
  return {
    notificacoes,
    total: notificacoes.length,
    naoLidas: notificacoes.filter(n => !n.lida).length,
  };
}

// ─── API Routes ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default';
    const { searchParams } = new URL(request.url);

    const parseResult = NotificationsQuerySchema.safeParse({
      tipo: searchParams.get('tipo'),
      lida: searchParams.get('lida'),
      importancia: searchParams.get('importancia'),
      limit: searchParams.get('limit'),
      page: searchParams.get('page'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { tipo, lida, importancia, limit, page } = parseResult.data;
    let notificacoes = [...getNotificacoes(userId)];

    // Apply filters
    if (tipo) {
      notificacoes = notificacoes.filter(n => n.tipo === tipo);
    }

    if (lida !== undefined) {
      notificacoes = notificacoes.filter(n => n.lida === lida);
    }

    if (importancia) {
      notificacoes = notificacoes.filter(n => n.importancia === importancia);
    }

    // Pagination
    const pageSize = limit || 20;
    const pageNum = page || 1;
    const startIndex = (pageNum - 1) * pageSize;
    const paginatedNotificacoes = notificacoes.slice(startIndex, startIndex + pageSize);

    const data = getNotificacoesData(userId);

    return NextResponse.json({
      success: true,
      notificacoes: paginatedNotificacoes,
      pagination: {
        page: pageNum,
        pageSize,
        total: notificacoes.length,
        totalPages: Math.ceil(notificacoes.length / pageSize),
      },
      stats: {
        total: data.total,
        naoLidas: data.naoLidas,
        porTipo: {
          info: data.notificacoes.filter(n => n.tipo === 'info').length,
          success: data.notificacoes.filter(n => n.tipo === 'success').length,
          warning: data.notificacoes.filter(n => n.tipo === 'warning').length,
          error: data.notificacoes.filter(n => n.tipo === 'error').length,
          orixa: data.notificacoes.filter(n => n.tipo === 'orixa').length,
          transito: data.notificacoes.filter(n => n.tipo === 'transito').length,
          ritual: data.notificacoes.filter(n => n.tipo === 'ritual').length,
        },
      },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar notificações',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default';
    const body = await request.json();

    const parseResult = CreateNotificacaoSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const notificacao: Notificacao = {
      id: `notif-${Date.now()}`,
      tipo: parseResult.data.tipo,
      titulo: parseResult.data.titulo,
      mensagem: parseResult.data.mensagem,
      importancia: parseResult.data.importancia || 'medium',
      acaoUrl: parseResult.data.acaoUrl || null,
      lida: false,
      createdAt: new Date().toISOString(),
      lidaEm: null,
      orixa: parseResult.data.orixa,
      sefirot: parseResult.data.sefirot,
    };

    // Add to store
    const userNotifications = notificationStore.get(userId) || [];
    userNotifications.unshift(notificacao);
    notificationStore.set(userId, userNotifications);

    return NextResponse.json({
      success: true,
      notificacao,
      message: 'Notificação criada com sucesso',
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar notificação',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default';
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (action === 'mark-read' && id) {
      const userNotifications = notificationStore.get(userId) || [];
      const index = userNotifications.findIndex(n => n.id === id);

      if (index === -1) {
        return NextResponse.json({
          success: false,
          error: 'Notificação não encontrada',
        }, { status: 404 });
      }

      userNotifications[index] = {
        ...userNotifications[index],
        lida: true,
        lidaEm: new Date().toISOString(),
      };
      notificationStore.set(userId, userNotifications);

      return NextResponse.json({
        success: true,
        message: 'Notificação marcada como lida',
      });
    }

    if (action === 'mark-all-read') {
      const userNotifications = notificationStore.get(userId) || [];
      const updated = userNotifications.map(n => ({
        ...n,
        lida: true,
        lidaEm: n.lidaEm || new Date().toISOString(),
      }));
      notificationStore.set(userId, updated);

      return NextResponse.json({
        success: true,
        message: 'Todas as notificações marcadas como lidas',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Ação inválida',
    }, { status: 400 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao atualizar notificação',
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'default';
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID é obrigatório',
      }, { status: 400 });
    }

    const userNotifications = notificationStore.get(userId) || [];
    const index = userNotifications.findIndex(n => n.id === id);

    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: 'Notificação não encontrada',
      }, { status: 404 });
    }

    userNotifications.splice(index, 1);
    notificationStore.set(userId, userNotifications);

    return NextResponse.json({
      success: true,
      message: 'Notificação deletada com sucesso',
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao deletar notificação',
    }, { status: 500 });
  }
}