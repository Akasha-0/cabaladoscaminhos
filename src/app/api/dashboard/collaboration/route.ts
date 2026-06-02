// ============================================================
// DASHBOARD COLLABORATION API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CollaborationViewSchema = z.enum(['users', 'activities', 'invites', 'all', 'rituals', 'sessions']);
const CollaborationQuerySchema = z.object({
  view: CollaborationViewSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(['online', 'away', 'busy', 'offline']).optional(),
  includeSpiritual: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

const CreateInviteSchema = z.object({
  paraEmail: z.string().email('Email inválido'),
  funcao: z.enum(['admin', 'editor', 'viewer']),
  sefirot: z.array(z.string()).optional(),
});

const CreateSessionSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['ritual', 'meditation', 'reading', 'study', 'consultation']),
  orixa: z.string().optional(),
  participantes: z.array(z.string()).optional(),
  duracao: z.number().int().positive().optional(),
});

// ─── Type Definitions ───────────────────────────────────────────────────────
interface Collaborator {
  id: string;
  nome: string;
  email: string;
  avatar: string | null;
  status: 'online' | 'away' | 'busy' | 'offline';
  funcao: 'admin' | 'editor' | 'viewer';
  ultimoAcesso: string;
  sessaoAtual: string | null;
  // Spiritual correlations
  sefirot?: string[];
  orixa?: string;
  caminhoVida?: number;
  chakra?: string;
}

interface Atividade {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  tipo: 'join' | 'leave' | 'edit' | 'view' | 'comment' | 'share' | 'ritual' | 'meditation' | 'reading';
  descricao: string;
  recurso: string | null;
  timestamp: string;
  sefirot?: string[];
  orixa?: string;
}

interface Convite {
  id: string;
  paraEmail: string;
  funcao: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  criadoPor: string;
  criadoEm: string;
  expiraEm: string;
  sefirot?: string[];
}

interface Session {
  id: string;
  nome: string;
  tipo: 'ritual' | 'meditation' | 'reading' | 'study' | 'consultation';
  orixa?: string;
  participantes: string[];
  iniciadaEm: string;
  duracao?: number;
  sefirot: string[];
  chakra: string;
}

interface ColaboracaoData {
  colaboradores: Collaborator[];
  atividades: Atividade[];
  convites: Convite[];
  sessoes: Session[];
  totalOnline: number;
}

export const dynamic = 'force-dynamic';

// ─── Mock Data Store ───────────────────────────────────────────────────────
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
    sefirot: ['Chokhmah', 'Binah', 'Tipheret'],
    orixa: 'Oxum',
    caminhoVida: 11,
    chakra: 'Anahata (4º)',
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
    sefirot: ['Malkuth', 'Yesod'],
    orixa: 'Ogum',
    caminhoVida: 8,
    chakra: 'Muladhara (1º)',
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
    sefirot: ['Chesed', 'Netzach'],
    orixa: 'Iemanjá',
    caminhoVida: 22,
    chakra: 'Sahasrara (7º)',
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
    sefirot: ['Gevurah', 'Hod'],
    orixa: 'Xangô',
    caminhoVida: 7,
    chakra: 'Manipura (3º)',
  },
  {
    id: 'collab-005',
    nome: 'Lucia Ferreira',
    email: 'lucia@exemplo.com',
    avatar: null,
    status: 'busy',
    funcao: 'editor',
    ultimoAcesso: new Date(Date.now() - 120000).toISOString(),
    sessaoAtual: 'sessao-ritual-001',
    sefirot: ['Tipheret', 'Kether'],
    orixa: 'Oxalá',
    caminhoVida: 33,
    chakra: 'Ajna (6º)',
  },
];

const mockAtividades: Atividade[] = [
  {
    id: 'ativ-001',
    usuarioId: 'collab-001',
    usuarioNome: 'Maria Silva',
    tipo: 'ritual',
    descricao: 'Iniciou Ritual de Oxum para prosperidade',
    recurso: 'ritual-oxum-prosperidade',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    sefirot: ['Chesed', 'Hod'],
    orixa: 'Oxum',
  },
  {
    id: 'ativ-002',
    usuarioId: 'collab-002',
    usuarioNome: 'João Santos',
    tipo: 'view',
    descricao: 'Visualizou mapa astral de cliente',
    recurso: 'mapa-astral-joao-cliente',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'ativ-003',
    usuarioId: 'collab-001',
    usuarioNome: 'Maria Silva',
    tipo: 'reading',
    descricao: 'Realizou leitura de Tarot Celtic Cross',
    recurso: 'tarot-celtic-001',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    sefirot: ['Tipheret'],
    orixa: 'Oxum',
  },
  {
    id: 'ativ-004',
    usuarioId: 'collab-002',
    usuarioNome: 'João Santos',
    tipo: 'join',
    descricao: 'Entrou na sessão de meditação guiada',
    recurso: 'meditacao-kundalini',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    sefirot: ['Muladhara'],
  },
  {
    id: 'ativ-005',
    usuarioId: 'collab-003',
    usuarioNome: 'Ana Costa',
    tipo: 'edit',
    descricao: 'Atualizou configuração de correspondência Orixá-Sefirot',
    recurso: 'correspondencia-config',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    sefirot: ['Binah', 'Yesod'],
    orixa: 'Iemanjá',
  },
  {
    id: 'ativ-006',
    usuarioId: 'collab-005',
    usuarioNome: 'Lucia Ferreira',
    tipo: 'ritual',
    descricao: 'Conduziu cura ancestral com Omolu',
    recurso: 'ritual-ancestral-omolu',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    sefirot: ['Malkuth', 'Yesod'],
    orixa: 'Omolu',
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
    sefirot: ['Netzach'],
  },
  {
    id: 'convite-002',
    paraEmail: 'admin@exemplo.com',
    funcao: 'admin',
    status: 'accepted',
    criadoPor: 'collab-001',
    criadoEm: new Date(Date.now() - 3 * 86400000).toISOString(),
    expiraEm: new Date(Date.now() + 4 * 86400000).toISOString(),
  },
  {
    id: 'convite-003',
    paraEmail: 'editor@exemplo.com',
    funcao: 'editor',
    status: 'expired',
    criadoPor: 'collab-002',
    criadoEm: new Date(Date.now() - 10 * 86400000).toISOString(),
    expiraEm: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const mockSessoes: Session[] = [
  {
    id: 'sessao-main-001',
    nome: 'Sessão de Estudo Cabalístico',
    tipo: 'study',
    participantes: ['collab-001', 'collab-002'],
    iniciadaEm: new Date(Date.now() - 3600000).toISOString(),
    duracao: 60,
    sefirot: ['Kether', 'Chokhmah', 'Binah'],
    chakra: 'Sahasrara (7º)',
  },
  {
    id: 'sessao-ritual-001',
    nome: 'Ritual de Prosperidade com Oxum',
    tipo: 'ritual',
    orixa: 'Oxum',
    participantes: ['collab-005'],
    iniciadaEm: new Date(Date.now() - 1200000).toISOString(),
    duracao: 45,
    sefirot: ['Chesed', 'Hod'],
    chakra: 'Svadhisthana (2º)',
  },
  {
    id: 'sessao-med-001',
    nome: 'Meditação dos Chakras',
    tipo: 'meditation',
    participantes: ['collab-002'],
    iniciadaEm: new Date(Date.now() - 1800000).toISOString(),
    duracao: 30,
    sefirot: ['Malkuth', 'Yesod', 'Gevurah', 'Chesed', 'Tipheret', 'Netzach', 'Hod', 'Kether'],
    chakra: 'Sete chakras',
  },
];

function getColaboracaoData(): ColaboracaoData {
  return {
    colaboradores: mockColaboradores,
    atividades: mockAtividades,
    convites: mockConvites,
    sessoes: mockSessoes,
    totalOnline: mockColaboradores.filter(c => c.status === 'online').length,
  };
}

// ─── API Routes ─────────────────────────────────────────────────────────────
// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = CollaborationQuerySchema.safeParse({
      view: searchParams.get('view'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      includeSpiritual: searchParams.get('includeSpiritual'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { view, limit, status, includeSpiritual } = parseResult.data;
    const data = getColaboracaoData();

    switch (view) {
      case 'users': {
        let usuarios = [...data.colaboradores];
        if (status) {
          usuarios = usuarios.filter(u => u.status === status);
        }
        if (limit) {
          usuarios = usuarios.slice(0, limit);
        }
        if (!includeSpiritual) {
          usuarios = usuarios.map(({ sefirot, orixa, caminhoVida, chakra, ...rest }) => rest as Collaborator);
        }
        return NextResponse.json({
          success: true,
          usuarios,
          stats: {
            total: data.colaboradores.length,
            online: data.totalOnline,
            byStatus: {
              online: data.colaboradores.filter(c => c.status === 'online').length,
              away: data.colaboradores.filter(c => c.status === 'away').length,
              busy: data.colaboradores.filter(c => c.status === 'busy').length,
              offline: data.colaboradores.filter(c => c.status === 'offline').length,
            },
          },
        });
      }

      case 'activities': {
        let atividades = [...data.atividades];
        if (limit) {
          atividades = atividades.slice(0, limit);
        }
        if (!includeSpiritual) {
          atividades = atividades.map(({ sefirot, orixa, ...rest }) => rest as Atividade);
        }
        return NextResponse.json({
          success: true,
          atividades,
          stats: {
            total: data.atividades.length,
            byTipo: {
              ritual: data.atividades.filter(a => a.tipo === 'ritual').length,
              meditation: data.atividades.filter(a => a.tipo === 'meditation').length,
              reading: data.atividades.filter(a => a.tipo === 'reading').length,
              edit: data.atividades.filter(a => a.tipo === 'edit').length,
              view: data.atividades.filter(a => a.tipo === 'view').length,
            },
          },
        });
      }

      case 'invites': {
        let convites = [...data.convites];
        if (limit) {
          convites = convites.slice(0, limit);
        }
        return NextResponse.json({
          success: true,
          convites,
          stats: {
            total: data.convites.length,
            pending: data.convites.filter(c => c.status === 'pending').length,
            accepted: data.convites.filter(c => c.status === 'accepted').length,
          },
        });
      }

      case 'sessions': {
        let sessoes = [...data.sessoes];
        if (limit) {
          sessoes = sessoes.slice(0, limit);
        }
        return NextResponse.json({
          success: true,
          sessoes,
          stats: {
            total: data.sessoes.length,
            active: data.sessoes.length,
            byTipo: {
              ritual: data.sessoes.filter(s => s.tipo === 'ritual').length,
              meditation: data.sessoes.filter(s => s.tipo === 'meditation').length,
              reading: data.sessoes.filter(s => s.tipo === 'reading').length,
              study: data.sessoes.filter(s => s.tipo === 'study').length,
            },
          },
        });
      }

      default: {
        return NextResponse.json({
          success: true,
          collaborators: data.colaboradores.length,
          activities: data.atividades.length,
          invites: data.convites.length,
          sessions: data.sessoes.length,
          totalOnline: data.totalOnline,
          stats: {
            byRole: {
              admin: data.colaboradores.filter(c => c.funcao === 'admin').length,
              editor: data.colaboradores.filter(c => c.funcao === 'editor').length,
              viewer: data.colaboradores.filter(c => c.funcao === 'viewer').length,
            },
          },
        });
      }
    }
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar dados de colaboração',
    }, { status: 500 });
  }
}

// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'invite') {
      const body = await request.json();
      const parseResult = CreateInviteSchema.safeParse(body);

      if (!parseResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Payload inválido',
          details: parseResult.error.flatten().fieldErrors,
        }, { status: 400 });
      }

      const convite: Convite = {
        id: `convite-${Date.now()}`,
        paraEmail: parseResult.data.paraEmail,
        funcao: parseResult.data.funcao,
        status: 'pending',
        criadoPor: 'current-user',
        criadoEm: new Date().toISOString(),
        expiraEm: new Date(Date.now() + 7 * 86400000).toISOString(),
        sefirot: parseResult.data.sefirot,
      };

      mockConvites.push(convite);

      return NextResponse.json({
        success: true,
        convite,
        message: 'Convite enviado com sucesso',
      }, { status: 201 });
    }

    if (action === 'session') {
      const body = await request.json();
      const parseResult = CreateSessionSchema.safeParse(body);

      if (!parseResult.success) {
        return NextResponse.json({
          success: false,
          error: 'Payload inválido',
          details: parseResult.error.flatten().fieldErrors,
        }, { status: 400 });
      }

      const session: Session = {
        id: `sessao-${Date.now()}`,
        nome: parseResult.data.nome,
        tipo: parseResult.data.tipo,
        orixa: parseResult.data.orixa,
        participantes: parseResult.data.participantes || [],
        iniciadaEm: new Date().toISOString(),
        duracao: parseResult.data.duracao,
        sefirot: parseResult.data.tipo === 'ritual' ? ['Tipheret'] : [],
        chakra: 'Anahata (4º)',
      };

      mockSessoes.push(session);

      return NextResponse.json({
        success: true,
        session,
        message: 'Sessão criada com sucesso',
      }, { status: 201 });
    }

    return NextResponse.json({
      success: false,
      error: 'Ação inválida. Use: invite ou session',
    }, { status: 400 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar ação',
    }, { status: 500 });
  }
}