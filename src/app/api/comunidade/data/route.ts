// ============================================================
// COMUNIDADE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for comunidade data access
// - Retrieve all discussions and posts
// - Get specific discussion by ID
// - Community members and profiles
// - Topics and categories
// - Events and gatherings
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── INTERFACES ──────────────────────────────────────────────────────────────

interface CommunityMember {
  id: string;
  name: string;
  avatar: string | null;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
  postsCount: number;
  nivel: number;
  sign: string | null;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
  postsCount: number;
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  topicId: string;
  topicName: string;
  createdAt: string;
  updatedAt: string;
  repliesCount: number;
  likesCount: number;
  isPinned: boolean;
  tags: string[];
}

interface Reply {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
  likesCount: number;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'WORKSHOP' | 'MEETUP' | 'RITUAL' | 'COURSE';
  location: string | null;
  isOnline: boolean;
  participantsLimit: number | null;
  currentParticipants: number;
}

interface CommunityData {
  stats: {
    totalMembers: number;
    totalDiscussions: number;
    totalReplies: number;
    activeToday: number;
  };
  topics: Topic[];
  members: CommunityMember[];
  discussions: Discussion[];
  events: CommunityEvent[];
}

// ─── TOPICS DATA ──────────────────────────────────────────────────────────────

const TOPICS: Topic[] = [
  {
    id: 'orixás',
    name: 'Orixás',
    description: 'Discussões sobre os orixás do candomblé e umbanda',
    color: '#f59e0b',
    postsCount: 342,
  },
  {
    id: 'caminho-ancestral',
    name: 'Caminho Ancestral',
    description: 'Práticas e tradições do caminho ancestral',
    color: '#8b5cf6',
    postsCount: 289,
  },
  {
    id: 'numerologia',
    name: 'Numerologia Cabalística',
    description: 'Cálculos e interpretações numerológicas',
    color: '#06b6d4',
    postsCount: 198,
  },
  {
    id: 'mapa-natal',
    name: 'Mapa Natal',
    description: 'Análise de mapas natais e mapas de almas',
    color: '#10b981',
    postsCount: 456,
  },
  {
    id: 'rituais',
    name: 'Rituais e Práticas',
    description: 'Compartilhamento de rituais e práticas espirituais',
    color: '#ef4444',
    postsCount: 567,
  },
  {
    id: 'terapia',
    name: 'Terapias Alternativas',
    description: 'Discussões sobre terapias complementares',
    color: '#ec4899',
    postsCount: 123,
  },
  {
    id: 'dúvidas',
    name: 'Dúvidas e Perguntas',
    description: 'Espaço para tirar dúvidas da comunidade',
    color: '#6366f1',
    postsCount: 789,
  },
  {
    id: 'compartilhar',
    name: 'Compartilhar Experiências',
    description: 'Conte sua jornada espiritual',
    color: '#14b8a6',
    postsCount: 234,
  },
];

// ─── MEMBERS DATA ────────────────────────────────────────────────────────────

const MEMBERS: CommunityMember[] = [
  {
    id: 'member-001',
    name: 'Maria da Conceição',
    avatar: null,
    role: 'ADMIN',
    joinedAt: '2023-01-15T10:00:00Z',
    postsCount: 1245,
    nivel: 45,
    sign: 'Oxalá',
  },
  {
    id: 'member-002',
    name: 'João dos Santos',
    avatar: null,
    role: 'MODERATOR',
    joinedAt: '2023-03-20T14:30:00Z',
    postsCount: 876,
    nivel: 38,
    sign: 'Ogum',
  },
  {
    id: 'member-003',
    name: 'Ana Beatriz',
    avatar: null,
    role: 'MEMBER',
    joinedAt: '2023-06-10T09:15:00Z',
    postsCount: 234,
    nivel: 22,
    sign: 'Oxum',
  },
  {
    id: 'member-004',
    name: 'Carlos Eduardo',
    avatar: null,
    role: 'MEMBER',
    joinedAt: '2023-08-25T16:45:00Z',
    postsCount: 189,
    nivel: 18,
    sign: 'Xangô',
  },
  {
    id: 'member-005',
    name: 'Francisca das Chagas',
    avatar: null,
    role: 'MEMBER',
    joinedAt: '2024-01-05T11:20:00Z',
    postsCount: 67,
    nivel: 12,
    sign: 'Iemanjá',
  },
  {
    id: 'member-006',
    name: 'Pedro Henrique',
    avatar: null,
    role: 'MEMBER',
    joinedAt: '2024-02-18T08:00:00Z',
    postsCount: 145,
    nivel: 15,
    sign: 'Oxóssi',
  },
  {
    id: 'member-007',
    name: 'Lucia Ferreira',
    avatar: null,
    role: 'MODERATOR',
    joinedAt: '2023-04-12T13:30:00Z',
    postsCount: 567,
    nivel: 32,
    sign: 'Omolu',
  },
  {
    id: 'member-008',
    name: 'Antonio Carlos',
    avatar: null,
    role: 'MEMBER',
    joinedAt: '2024-03-01T10:00:00Z',
    postsCount: 89,
    nivel: 10,
    sign: 'Obaluaê',
  },
];

// ─── DISCUSSIONS DATA ────────────────────────────────────────────────────────

const DISCUSSIONS: Discussion[] = [
  {
    id: 'disc-001',
    title: 'O Papel do Orixá Oxalá na Nossa Vida Espiritual',
    content: 'Gostaria de abrir uma discussão sobre a importância de Oxalá em nosso caminho espiritual. Oxalá é considerado o pai de todos os orixás e representa a pureza, a paz e a luz. Como vocês incorporate a energia de Oxalá em suas práticas diárias?',
    authorId: 'member-001',
    authorName: 'Maria da Conceição',
    authorAvatar: null,
    topicId: 'orixás',
    topicName: 'Orixás',
    createdAt: '2024-05-20T10:00:00Z',
    updatedAt: '2024-05-25T15:30:00Z',
    repliesCount: 45,
    likesCount: 128,
    isPinned: true,
    tags: ['oxalá', 'paz', 'espiritualidade'],
  },
  {
    id: 'disc-002',
    title: 'Cálculo do Número Cabalístico - Dúvida',
    content: 'Estou com dúvidas sobre como calcular o número cabalístico. Tentei fazer o cálculo seguindo o método que encontrei, mas meu resultado não bate com o que o sistema mostra. Alguém pode me ajudar a entender o processo?',
    authorId: 'member-003',
    authorName: 'Ana Beatriz',
    authorAvatar: null,
    topicId: 'numerologia',
    topicName: 'Numerologia Cabalística',
    createdAt: '2024-05-22T14:30:00Z',
    updatedAt: '2024-05-24T09:15:00Z',
    repliesCount: 23,
    likesCount: 67,
    isPinned: false,
    tags: ['número cabalístico', 'cálculo', 'ajuda'],
  },
  {
    id: 'disc-003',
    title: 'Ritual de Aterramento para Iniciantes',
    content: 'Estou começando minha jornada espiritual e gostaria de saber mais sobre rituais de aterramento. Qual é o melhor ritual para iniciantes? Quais são os materiais necessários?',
    authorId: 'member-006',
    authorName: 'Pedro Henrique',
    authorAvatar: null,
    topicId: 'rituais',
    topicName: 'Rituais e Práticas',
    createdAt: '2024-05-23T08:00:00Z',
    updatedAt: '2024-05-26T11:45:00Z',
    repliesCount: 56,
    likesCount: 189,
    isPinned: false,
    tags: ['aterramento', 'iniciante', 'ritual'],
  },
  {
    id: 'disc-004',
    title: 'Meu Mapa Natal Revelou Coisas Incríveis',
    content: 'Recentemente fiz meu mapa natal no Cabala dos Caminhos e fiquei impressionado com a precisão das análises. Descobri coisas sobre mim que nunca tinha percebido. Alguém mais teve essa experiência?',
    authorId: 'member-004',
    authorName: 'Carlos Eduardo',
    authorAvatar: null,
    topicId: 'mapa-natal',
    topicName: 'Mapa Natal',
    createdAt: '2024-05-21T16:00:00Z',
    updatedAt: '2024-05-27T10:30:00Z',
    repliesCount: 78,
    likesCount: 234,
    isPinned: false,
    tags: ['mapa natal', 'experiência', 'descoberta'],
  },
  {
    id: 'disc-005',
    title: 'Conexão com os Ancestrais - Como Começar?',
    content: 'Sempre senti uma forte conexão com meus ancestrais, mas não sei como desenvolver essa relação de forma mais consciente. Quais são as práticas recomendadas para fortalecer essa conexão?',
    authorId: 'member-005',
    authorName: 'Francisca das Chagas',
    authorAvatar: null,
    topicId: 'caminho-ancestral',
    topicName: 'Caminho Ancestral',
    createdAt: '2024-05-24T11:30:00Z',
    updatedAt: '2024-05-26T14:00:00Z',
    repliesCount: 34,
    likesCount: 145,
    isPinned: false,
    tags: ['ancestrais', 'conexão', 'práticas'],
  },
  {
    id: 'disc-006',
    title: 'Reiki e Candomblé - São Compatíveis?',
    content: 'Pratico Reiki há alguns anos e agora estou explorando o candomblé. Alguém tem experiência com ambas as práticas? São complementares ou há conflitos?',
    authorId: 'member-007',
    authorName: 'Lucia Ferreira',
    authorAvatar: null,
    topicId: 'terapia',
    topicName: 'Terapias Alternativas',
    createdAt: '2024-05-25T09:00:00Z',
    updatedAt: '2024-05-27T16:20:00Z',
    repliesCount: 42,
    likesCount: 98,
    isPinned: false,
    tags: ['reiki', 'candomblé', 'complementar'],
  },
  {
    id: 'disc-007',
    title: 'Dúvida sobre Sigilos e Mandrágora',
    content: 'Tenho ouvido falar muito sobre sigilos e mandrágora. Alguém pode explicar o que são e como podem ser usados no caminho espiritual?',
    authorId: 'member-008',
    authorName: 'Antonio Carlos',
    authorAvatar: null,
    topicId: 'dúvidas',
    topicName: 'Dúvidas e Perguntas',
    createdAt: '2024-05-26T13:45:00Z',
    updatedAt: '2024-05-27T18:00:00Z',
    repliesCount: 19,
    likesCount: 56,
    isPinned: false,
    tags: ['sigilos', 'mandrágora', 'dúvida'],
  },
  {
    id: 'disc-008',
    title: 'Minha Jornada de Cura Espiritual',
    content: 'Gostaria de compartilhar minha jornada de cura espiritual. Há dois anos eu estava em um momento muito difícil, e através das práticas espirituais encontrei um novo caminho. Esta é minha história...',
    authorId: 'member-002',
    authorName: 'João dos Santos',
    authorAvatar: null,
    topicId: 'compartilhar',
    topicName: 'Compartilhar Experiências',
    createdAt: '2024-05-19T07:30:00Z',
    updatedAt: '2024-05-25T20:15:00Z',
    repliesCount: 89,
    likesCount: 312,
    isPinned: true,
    tags: ['cura', 'jornada', 'compartilhar'],
  },
];

// ─── EVENTS DATA ─────────────────────────────────────────────────────────────

const EVENTS: CommunityEvent[] = [
  {
    id: 'event-001',
    title: 'Workshop de Numerologia Cabalística',
    description: 'Workshop intensivo sobre numerologia cabalística, aprende a calcular e interpretar números cabalísticos.',
    date: '2024-06-15',
    time: '19:00',
    type: 'WORKSHOP',
    location: 'Online - Zoom',
    isOnline: true,
    participantsLimit: 50,
    currentParticipants: 32,
  },
  {
    id: 'event-002',
    title: 'Encontro Presencial de Meditação',
    description: 'Encontro mensal de meditação em grupo. Venha conectar-se com outros praticantes.',
    date: '2024-06-22',
    time: '10:00',
    type: 'MEETUP',
    location: 'Centro Espiritual São Jorge, Rio de Janeiro',
    isOnline: false,
    participantsLimit: 30,
    currentParticipants: 18,
  },
  {
    id: 'event-003',
    title: 'Ritual de Equinócio de Junho',
    description: 'Ritual coletivo para o equinócio de junho. Vamos harmonizar nossas energias com as forças da natureza.',
    date: '2024-06-21',
    time: '20:00',
    type: 'RITUAL',
    location: 'Online - YouTube Live',
    isOnline: true,
    participantsLimit: null,
    currentParticipants: 156,
  },
  {
    id: 'event-004',
    title: 'Curso de Mapa Natal Intermediário',
    description: 'Curso avançado para quem já tem conhecimento básico de mapa natal. Aprenda sobre casas, aspectos e interpetações.',
    date: '2024-07-01',
    time: '18:00',
    type: 'COURSE',
    location: 'Online - Google Meet',
    isOnline: true,
    participantsLimit: 25,
    currentParticipants: 20,
  },
];

// ─── GET HANDLER ─────────────────────────────────────────────────────────────

// GET /api/comunidade/data - Get comunidade data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Return single discussion by ID
    if (id) {
      const discussion = DISCUSSIONS.find((d) => d.id.toLowerCase() === id.toLowerCase());
      if (!discussion) {
        return NextResponse.json(
          { success: false, error: 'Discussion not found' },
          { status: 404 }
        );
      }

      // Get replies for this discussion (mock)
      const replies: Reply[] = [
        {
          id: `reply-${discussion.id}-001`,
          discussionId: discussion.id,
          content: 'Ótimo tema! Compartilho bastante dessa visão.',
          authorId: 'member-003',
          authorName: 'Ana Beatriz',
          authorAvatar: null,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          likesCount: 12,
        },
        {
          id: `reply-${discussion.id}-002`,
          discussionId: discussion.id,
          content: 'Muito interessante! Gostaria de saber mais sobre isso.',
          authorId: 'member-004',
          authorName: 'Carlos Eduardo',
          authorAvatar: null,
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          likesCount: 8,
        },
      ];

      return NextResponse.json({
        success: true,
        data: {
          discussion,
          replies,
        },
      });
    }

    // Return discussions filtered by topic
    if (topic) {
      const filteredDiscussions = DISCUSSIONS.filter(
        (d) => d.topicId.toLowerCase() === topic.toLowerCase()
      );
      return NextResponse.json({
        success: true,
        data: {
          discussions: filteredDiscussions.slice(offset, offset + limit),
          total: filteredDiscussions.length,
        },
      });
    }

    // Return topics
    if (type === 'topics') {
      return NextResponse.json({ success: true, data: TOPICS });
    }

    // Return members
    if (type === 'members') {
      return NextResponse.json({
        success: true,
        data: {
          members: MEMBERS.slice(offset, offset + limit),
          total: MEMBERS.length,
        },
      });
    }

    // Return events
    if (type === 'events') {
      return NextResponse.json({ success: true, data: EVENTS });
    }

    // Return discussions only
    if (type === 'discussions') {
      const sortedDiscussions = [...DISCUSSIONS].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      return NextResponse.json({
        success: true,
        data: {
          discussions: sortedDiscussions.slice(offset, offset + limit),
          total: DISCUSSIONS.length,
        },
      });
    }

    // Return community stats
    if (type === 'stats') {
      return NextResponse.json({
        success: true,
        data: {
          totalMembers: MEMBERS.length,
          totalDiscussions: DISCUSSIONS.length,
          totalReplies: DISCUSSIONS.reduce((sum, d) => sum + d.repliesCount, 0),
          activeToday: Math.floor(Math.random() * 20) + 5,
        },
      });
    }

    // Default — return all comunidade data
    const sortedDiscussions = [...DISCUSSIONS].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalMembers: MEMBERS.length,
          totalDiscussions: DISCUSSIONS.length,
          totalReplies: DISCUSSIONS.reduce((sum, d) => sum + d.repliesCount, 0),
          activeToday: Math.floor(Math.random() * 20) + 5,
        },
        topics: TOPICS,
        members: MEMBERS.slice(0, 8),
        discussions: sortedDiscussions.slice(0, limit),
        events: EVENTS,
      } as CommunityData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch comunidade data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}