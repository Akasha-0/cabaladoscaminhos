// ============================================================
// DASHBOARD NOTIFICATIONS API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SefirotSchema, ChakraSchema, ElementSchema } from '@/lib/api/spiritual-filters';

// ─── Spiritual filter schemas imported from @/lib/api/spiritual-filters ─────

const NotificacaoTipoSchema = z.enum([
  'info',
  'success',
  'warning',
  'error',
  'system',
  'reading',
  'payment',
  'orixa',
  'transito',
  'ritual',
  'meditacao',
  'ciclo',
  'mensagem',
]);
const NotificacaoImportanciaSchema = z.enum(['low', 'medium', 'high', 'critical']);
const NotificationsQuerySchema = z.object({
  tipo: NotificacaoTipoSchema.optional(),
  lida: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  importancia: NotificacaoImportanciaSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  page: z.coerce.number().int().positive().optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const CreateNotificacaoSchema = z.object({
  tipo: NotificacaoTipoSchema,
  titulo: z.string().min(1, 'Título é obrigatório'),
  mensagem: z.string().min(1, 'Mensagem é obrigatória'),
  importancia: NotificacaoImportanciaSchema.optional().default('medium'),
  acaoUrl: z.string().url().optional().nullable(),
  orixa: z.string().optional(),
  sefirot: z.array(z.string()).optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
});

// ─── Spiritual Correlations for Notification Types ──────────────────────────────────────────
const NOTIFICATION_SPIRITUAL_CORRELATIONS: Record<
  string,
  {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  }
> = {
  info: {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A sabedoria me orienta',
    frequency: '741 Hz',
  },
  success: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O sucesso confirma minha jornada',
    frequency: '528 Hz',
  },
  warning: {
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 3,
    element: 'Fogo',
    orixa: 'Xangô',
    affirmation: 'A advertência me protege',
    frequency: '396 Hz',
  },
  error: {
    sefirot: ['Gevurah', 'Malkuth'],
    chakra: 1,
    element: 'Terra',
    orixa: 'Ogum',
    affirmation: 'O erro é mestre da sabedoria',
    frequency: '174 Hz',
  },
  system: {
    sefirot: ['Kether', 'Malkuth'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'O sistema serve à minha evolução',
    frequency: '963 Hz',
  },
  reading: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'A leitura revela minha verdade',
    frequency: '639 Hz',
  },
  payment: {
    sefirot: ['Chesed', 'Malkuth'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A abundância flui em mim',
    frequency: '528 Hz',
  },
  orixa: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O Orixá me abençoa',
    frequency: '528 Hz',
  },
  transito: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'O trânsito astrológico me guia',
    frequency: '639 Hz',
  },
  ritual: {
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O ritual transforma e purifica',
    frequency: '528 Hz',
  },
  meditacao: {
    sefirot: ['Kether', 'Binah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'A meditação me conecta à fonte',
    frequency: '963 Hz',
  },
  ciclo: {
    sefirot: ['Chokhmah', 'Malkuth'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'O ciclo se completa em mim',
    frequency: '741 Hz',
  },
  mensagem: {
    sefirot: ['Hod', 'Netzach'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A mensagem toca minha alma',
    frequency: '741 Hz',
  },
};
// fallow-ignore-next-line unused-type
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
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
}

interface NotificacoesData {
  notificacoes: Notificacao[];
  total: number;
  naoLidas: number;
}

export const dynamic = 'force-dynamic';

// ─── Mock Data Store ───────────────────────────────────────────────────────
const notificationStore: Map<string, Notificacao[]> = new Map([
  [
    'default',
    [
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
        spiritualCorrelations: NOTIFICATION_SPIRITUAL_CORRELATIONS['success'],
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
        spiritualCorrelations: NOTIFICATION_SPIRITUAL_CORRELATIONS['payment'],
      },
      {
        id: 'notif-003',
        tipo: 'reading',
        titulo: 'Nova Previsão',
        mensagem: 'Suas previsões mensais foram atualizadas.',
        lida: true,
        importancia: 'medium',
        acaoUrl: '/dashboard/previsoes',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        lidaEm: new Date(Date.now() - 3000000).toISOString(),
        spiritualCorrelations: NOTIFICATION_SPIRITUAL_CORRELATIONS['reading'],
      },
      {
        id: 'notif-004',
        tipo: 'orixa',
        titulo: 'Oxum送你祝福',
        mensagem: 'Oxum está manifestando sua energia de abundância em sua vida.',
        lida: false,
        importancia: 'high',
        acaoUrl: '/dashboard/orixas/oxum',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        lidaEm: null,
        orixa: 'Oxum',
        sefirot: ['Chesed', 'Netzach'],
        spiritualCorrelations: NOTIFICATION_SPIRITUAL_CORRELATIONS['orixa'],
      },
      {
        id: 'notif-005',
        tipo: 'ritual',
        titulo: 'Lembrete de Ritual',
        mensagem: 'Seu ritual diário de amanhã está agendado.',
        lida: true,
        importancia: 'low',
        acaoUrl: '/dashboard/rituais/agendados',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lidaEm: new Date(Date.now() - 82800000).toISOString(),
        spiritualCorrelations: NOTIFICATION_SPIRITUAL_CORRELATIONS['ritual'],
      },
    ],
  ],
]);

// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = NotificationsQuerySchema.safeParse({
      tipo: searchParams.get('tipo'),
      lida: searchParams.get('lida'),
      importancia: searchParams.get('importancia'),
      limit: searchParams.get('limit'),
      // fallow-ignore-next-line code-duplication
      page: searchParams.get('page'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { tipo, lida, importancia, limit, page, sefirot, chakra, element, orixa } =
      parseResult.data;

    const userId = request.headers.get('x-user-id') || 'default';
    let notificacoes = notificationStore.get(userId) || notificationStore.get('default')!;

    if (tipo) {
      notificacoes = notificacoes.filter((n) => n.tipo === tipo);
    }

    if (lida !== undefined) {
      notificacoes = notificacoes.filter((n) => n.lida === lida);
    }

    if (importancia) {
      notificacoes = notificacoes.filter((n) => n.importancia === importancia);
    }

    if (sefirot) {
      notificacoes = notificacoes.filter((n) => n.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      notificacoes = notificacoes.filter((n) => n.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      notificacoes = notificacoes.filter((n) => n.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      notificacoes = notificacoes.filter((n) => n.spiritualCorrelations?.orixa === orixa);
    }

    const total = notificacoes.length;
    const naoLidas = notificacoes.filter((n) => !n.lida).length;

    // Pagination
    const pageSize = limit || 20;
    const currentPage = page || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedNotificacoes = notificacoes.slice(startIndex, startIndex + pageSize);

    // Calculate spiritual stats
    const spiritualStats = {
      byTipo: notificacoes.reduce(
        (acc, n) => {
          acc[n.tipo] = (acc[n.tipo] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byImportancia: notificacoes.reduce(
        (acc, n) => {
          acc[n.importancia] = (acc[n.importancia] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      bySefirot: notificacoes.reduce(
        (acc, n) => {
          n.spiritualCorrelations?.sefirot.forEach((s) => {
            acc[s] = (acc[s] || 0) + 1;
          });
          return acc;
        },
        {} as Record<string, number>
      ),
      byChakra: notificacoes.reduce(
        (acc, n) => {
          const c = n.spiritualCorrelations?.chakra;
          if (c) acc[c] = (acc[c] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byElement: notificacoes.reduce(
        (acc, n) => {
          const e = n.spiritualCorrelations?.element;
          if (e) acc[e] = (acc[e] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byOrixa: notificacoes.reduce(
        (acc, n) => {
          const o = n.spiritualCorrelations?.orixa;
          if (o) acc[o] = (acc[o] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return NextResponse.json({
      success: true,
      notificacoes: paginatedNotificacoes,
      total,
      naoLidas,
      spiritualCorrelations: NOTIFICATION_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        page: currentPage,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        filters: { tipo, lida, importancia, limit, page, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      },
      { status: 500 }
    );
  }
}

// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateNotificacaoSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { tipo, titulo, mensagem, importancia, acaoUrl, orixa, sefirot, chakra, element } =
      parseResult.data;

    const baseCorr = NOTIFICATION_SPIRITUAL_CORRELATIONS[tipo];
    const spiritualCorr = {
      sefirot: sefirot || baseCorr?.sefirot || [],
      chakra: chakra || baseCorr?.chakra || 5,
      element: element || baseCorr?.element || 'Ar',
      orixa: orixa || baseCorr?.orixa || 'Oxalá',
      affirmation: baseCorr?.affirmation || '',
      frequency: baseCorr?.frequency || '528 Hz',
    };

    const notificacao: Notificacao = {
      id: `notif-${Date.now()}`,
      tipo,
      titulo,
      mensagem,
      lida: false,
      importancia: importancia || 'medium',
      acaoUrl: acaoUrl || null,
      createdAt: new Date().toISOString(),
      lidaEm: null,
      orixa,
      sefirot,
      spiritualCorrelations: spiritualCorr,
    };

    const userId = request.headers.get('x-user-id') || 'default';
    const userNotifications = notificationStore.get(userId) || [];
    userNotifications.unshift(notificacao);
    notificationStore.set(userId, userNotifications);

    return NextResponse.json(
      {
        success: true,
        notificacao,
        spiritualCorrelations: spiritualCorr,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      },
      { status: 500 }
    );
  }
}
