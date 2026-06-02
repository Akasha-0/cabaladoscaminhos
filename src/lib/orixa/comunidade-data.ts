// @ts-nocheck
// SKIP_LINT

/**
 * Comunidade Data Module
 * Spiritual community data for Ifá practitioners network and connections
 */

export interface CommunityMember {
  id: string;
  name: string;
  orixaPrincipal: string;
  level: number;
  rituals: number;
  joinedDate: string;
  city: string;
  estado: string;
  bio: string;
  avatar: string;
  online: boolean;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  orixa: string;
  members: number;
  category: "ritual" | "estudo" | "cura" | "divinacao" | "geral";
  city: string;
  estado: string;
  leader: string;
  meetingDay: string;
  meetingTime: string;
  active: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  type: "ritual" | " workshop" | "encontro" | "celebracao" | "formacao";
  date: string;
  time: string;
  location: string;
  city: string;
  estado: string;
  organizer: string;
  orixa: string;
  participants: number;
  maxParticipants: number;
  description: string;
  imageUrl: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  category: "ritual" | "orixa" | " divinacao" | "saude" | "educacao" | "geral";
  author: string;
  authorId: string;
  createdAt: string;
  replies: number;
  views: number;
  lastActivity: string;
  pinned: boolean;
}

export interface SharedRitual {
  id: string;
  name: string;
  orixa: string;
  description: string;
  duration: string;
  difficulty: "iniciante" | "intermediario" | "avancado";
  author: string;
  authorId: string;
  likes: number;
  saves: number;
  createdAt: string;
  ingredients: string[];
  steps: string[];
}

export interface Testimonial {
  id: string;
  author: string;
  orixa: string;
  content: string;
  rating: number;
  createdAt: string;
  verified: boolean;
}

export interface CommunityData {
  stats: {
    totalMembers: number;
    totalGroups: number;
    totalEvents: number;
    totalRituals: number;
  };
  featuredMembers: CommunityMember[];
  groups: CommunityGroup[];
  upcomingEvents: CommunityEvent[];
  recentTopics: ForumTopic[];
  popularRituals: SharedRitual[];
  testimonials: Testimonial[];
}

const COMUNIDADE_DATA: CommunityData = {
  stats: {
    totalMembers: 1247,
    totalGroups: 38,
    totalEvents: 156,
    totalRituals: 3892
  },
  featuredMembers: [
    {
      id: "mem-1",
      name: "Babalawo Antonio Silva",
      orixaPrincipal: "Orunmila",
      level: 7,
      rituals: 234,
      joinedDate: "2024-03-15",
      city: "Rio de Janeiro",
      estado: "RJ",
      bio: "Iniciado há 25 anos na tradição Ifá. Especialista em Odu e interpretação dos Opele.",
      avatar: "/avatars/mem-1.jpg",
      online: true
    },
    {
      id: "mem-2",
      name: "Iyalorixá Maria Santos",
      orixaPrincipal: "Oxum",
      level: 6,
      rituals: 189,
      joinedDate: "2024-06-20",
      city: "Salvador",
      estado: "BA",
      bio: "Cuidadora de Oxum há 18 anos. Especialista em banhos sagrados e ebós.",
      avatar: "/avatars/mem-2.jpg",
      online: true
    },
    {
      id: "mem-3",
      name: "Ogboni João Oliveira",
      orixaPrincipal: "Ogum",
      level: 5,
      rituals: 156,
      joinedDate: "2025-01-10",
      city: "São Paulo",
      estado: "SP",
      bio: "Guerreiro de Ogum. Focado em trabalhos de proteção e律ancamento de empresas.",
      avatar: "/avatars/mem-3.jpg",
      online: false
    },
    {
      id: "mem-4",
      name: "Babaloshi Pedro Costa",
      orixaPrincipal: "Xangô",
      level: 5,
      rituals: 142,
      joinedDate: "2025-02-28",
      city: "Recife",
      estado: "PE",
      bio: "Devoto de Xangô há 12 anos. Especialista em rituas de justiça e reconciliação.",
      avatar: "/avatars/mem-4.jpg",
      online: true
    }
  ],
  groups: [
    {
      id: "grp-1",
      name: "Casa de Oxum - Rio",
      description: "Grupo de praticantes de Oxum no Rio de Janeiro. Encontros quinzenais para rituas coletivos.",
      orixa: "Oxum",
      members: 45,
      category: "ritual",
      city: "Rio de Janeiro",
      estado: "RJ",
      leader: "Maria Santos",
      meetingDay: "Sábado",
      meetingTime: "14:00",
      active: true
    },
    {
      id: "grp-2",
      name: "Estudos de Ifá - SP",
      description: "Grupo de estudo semanal sobre Odu e tradições oraculares.",
      orixa: "Orunmila",
      members: 32,
      category: "estudo",
      city: "São Paulo",
      estado: "SP",
      leader: "Antonio Silva",
      meetingDay: "Quarta-feira",
      meetingTime: "19:00",
      active: true
    },
    {
      id: "grp-3",
      name: "Guerreiros de Ogum - Nordeste",
      description: "Comunidade de ogum. Rituais de proteção e força espiritual.",
      orixa: "Ogum",
      members: 67,
      category: "ritual",
      city: "Recife",
      estado: "PE",
      leader: "João Oliveira",
      meetingDay: "Terça-feira",
      meetingTime: "20:00",
      active: true
    },
    {
      id: "grp-4",
      name: "Cura e Ancestralidade",
      description: "Grupo focado em práticas de cura com Omolu e ancestrais.",
      orixa: "Omolu",
      members: 28,
      category: "cura",
      city: "Salvador",
      estado: "BA",
      leader: "Ana Ferreira",
      meetingDay: "Domingo",
      meetingTime: "09:00",
      active: true
    },
    {
      id: "grp-5",
      name: "Xangô - Justiça e Verdade",
      description: "Devotos de Xangô dedicados à justiça e verdade.",
      orixa: "Xangô",
      members: 41,
      category: "ritual",
      city: "Recife",
      estado: "PE",
      leader: "Pedro Costa",
      meetingDay: "Quinta-feira",
      meetingTime: "19:30",
      active: true
    }
  ],
  upcomingEvents: [
    {
      id: "evt-1",
      title: "Ritual Coletivo de Oxum",
      type: "ritual",
      date: "2026-06-01",
      time: "10:00",
      location: "Centro Espírita Oxum",
      city: "Rio de Janeiro",
      estado: "RJ",
      organizer: "Maria Santos",
      orixa: "Oxum",
      participants: 28,
      maxParticipants: 40,
      description: "Ritual coletivo de Oxum para prosperidade e amor. Inclui ebó de mel e flores.",
      imageUrl: "/events/oxum-ritual.jpg"
    },
    {
      id: "evt-2",
      title: "Workshop de Ifá - Odu",
      type: " workshop",
      date: "2026-06-05",
      time: "14:00",
      location: "Instituto de Tradições Afro",
      city: "São Paulo",
      estado: "SP",
      organizer: "Antonio Silva",
      orixa: "Orunmila",
      participants: 15,
      maxParticipants: 20,
      description: "Workshop intensivo sobre os 16 Odu principais e sua interpretação.",
      imageUrl: "/events/ifa-workshop.jpg"
    },
    {
      id: "evt-3",
      title: "Xangô - Noite de Justiça",
      type: "celebracao",
      date: "2026-06-08",
      time: "20:00",
      location: " Terreiro de Xangô",
      city: "Recife",
      estado: "PE",
      organizer: "Pedro Costa",
      orixa: "Xangô",
      participants: 52,
      maxParticipants: 60,
      description: "Celebração em honra a Xangô. Rituais de fogo e pedidos de justiça.",
      imageUrl: "/events/shango-celebration.jpg"
    },
    {
      id: "evt-4",
      title: "Encontro de Ogboni",
      type: "encontro",
      date: "2026-06-12",
      time: "09:00",
      location: "Casa dos Ogboni",
      city: "São Paulo",
      estado: "SP",
      organizer: "João Oliveira",
      orixa: "Ogum",
      participants: 18,
      maxParticipants: 25,
      description: "Encontro mensal da sociedade Ogboni. Assuntos internos e rituais.",
      imageUrl: "/events/ogboni-meeting.jpg"
    }
  ],
  recentTopics: [
    {
      id: "top-1",
      title: "Dúvida sobre Odu Odi - Como interpretar?",
      category: "divinacao",
      author: "Carlos Mendes",
      authorId: "mem-10",
      createdAt: "2026-05-29",
      replies: 12,
      views: 145,
      lastActivity: "2026-05-29T10:30:00",
      pinned: true
    },
    {
      id: "top-2",
      title: "Banho de Oxum - Receitas e precautions",
      category: "ritual",
      author: "Ana Paula",
      authorId: "mem-15",
      createdAt: "2026-05-28",
      replies: 8,
      views: 98,
      lastActivity: "2026-05-28T18:45:00",
      pinned: false
    },
    {
      id: "top-3",
      title: "Experiência com Ogun Fe - Depoimento",
      category: "orixa",
      author: "Roberto Silva",
      authorId: "mem-22",
      createdAt: "2026-05-27",
      replies: 23,
      views: 312,
      lastActivity: "2026-05-29T08:15:00",
      pinned: false
    },
    {
      id: "top-4",
      title: " Como montar seu cantinho de orixás?",
      category: "geral",
      author: "Fernanda Costa",
      authorId: "mem-30",
      createdAt: "2026-05-26",
      replies: 15,
      views: 267,
      lastActivity: "2026-05-28T22:00:00",
      pinned: false
    },
    {
      id: "top-5",
      title: "Omolu e saúde - Rituais de cura",
      category: "saude",
      author: "Dr. Marcos",
      authorId: "mem-40",
      createdAt: "2026-05-25",
      replies: 19,
      views: 201,
      lastActivity: "2026-05-29T09:00:00",
      pinned: false
    }
  ],
  popularRituals: [
    {
      id: "rit-1",
      name: "Ebo de Oxum para Prosperidade",
      orixa: "Oxum",
      description: "Ritual completo de oferta para Oxum atraindo abundância.",
      duration: "2 horas",
      difficulty: "iniciante",
      author: "Maria Santos",
      authorId: "mem-2",
      likes: 234,
      saves: 89,
      createdAt: "2025-11-15",
      ingredients: ["1 mel", "1 água doce", "1 flores amarelas", "1 espelho", "1 vela dourada"],
      steps: [
        "Prepare o espaço com limpeza energetica",
        "Acenda a vela dourada",
        "Coloque o mel e a água no prato",
        "Disperse as flores ao redor",
        "Faça sua oração a Oxum",
        "Deixe descansar por 1 hora",
        "Agradeça e encerramento"
      ]
    },
    {
      id: "rit-2",
      name: "Ogun Fe - Rituais de Proteção",
      orixa: "Ogum",
      description: "Ritual poderoso de proteção com Ogum.",
      duration: "3 horas",
      difficulty: "intermediario",
      author: "João Oliveira",
      authorId: "mem-3",
      likes: 189,
      saves: 67,
      createdAt: "2025-12-20",
      ingredients: ["1 faca ritual", "1 fumo de incenso", "1 aguardente", "1 folha de espada", "1 Alecrim"],
      steps: [
        "Prepare o ponto de Ogum",
        "Acenda o incenso de proteção",
        "Com a faca, trace um círculo de proteção",
        "Despeje a aguardente como oferenda",
        "Coloque a espada e o alecrim",
        "Faça sua oração a Ogum",
        "Enterre os restos fora de casa"
      ]
    },
    {
      id: "rit-3",
      name: "Xangô - Fogo da Justiça",
      orixa: "Xangô",
      description: "Ritual de Xangô para justiça e verdade.",
      duration: "2.5 horas",
      difficulty: "avancado",
      author: "Pedro Costa",
      authorId: "mem-4",
      likes: 156,
      saves: 52,
      createdAt: "2026-01-10",
      ingredients: ["1 madeira de lei", "1 pedra de raio", "1 fumo", "1 vinho", "1 pimenta"],
      steps: [
        "Construa a fogueira ritual",
        "Coloque a pedra de raio no centro",
        "Acenda o fogo com intenções",
        "Ofereça o vinho ao fogo",
        "Jogue a pimenta nas chamas",
        "Faça seus pedidos a Xangô",
        "Deixe a fogueira apagar naturalmente"
      ]
    }
  ],
  testimonials: [
    {
      id: "test-1",
      author: "Mariana Costa",
      orixa: "Oxum",
      content: "Este aplicativo transformou minha prática espiritual. Os rituais guiados e a comunidade me deram confiança para aprofundar minha conexão com Oxum.",
      rating: 5,
      createdAt: "2026-05-20",
      verified: true
    },
    {
      id: "test-2",
      author: "Ricardo Almeida",
      orixa: "Ogum",
      content: "Finalmente encontrei uma comunidade de Ogum active. Os encontros virtuais e os rituais compartilhados têm sido fundamentais no meu caminho.",
      rating: 5,
      createdAt: "2026-05-15",
      verified: true
    },
    {
      id: "test-3",
      author: "Juliana Pereira",
      orixa: "Yemoja",
      content: "A jornada de mapas astrais e numerologia me ajudou a entender melhor meu orixá principal. Recomendo a todos os iniciantes!",
      rating: 4,
      createdAt: "2026-05-10",
      verified: true
    },
    {
      id: "test-4",
      author: "Paulo Henrique",
      orixa: "Orunmila",
      content: "Como babalawo, valorizo ter uma ferramenta moderna para acompanhar meus clientes. A comunidade de Salvador tem crescido muito.",
      rating: 5,
      createdAt: "2026-05-05",
      verified: true
    }
  ]
};

export function getData(): CommunityData {
  return COMUNIDADE_DATA;
}

function getStats() {
  return COMUNIDADE_DATA.stats;
}

function getFeaturedMembers(): CommunityMember[] {
  return COMUNIDADE_DATA.featuredMembers;
}

function getGroups(): CommunityGroup[] {
  return COMUNIDADE_DATA.groups;
}

function getUpcomingEvents(): CommunityEvent[] {
  return COMUNIDADE_DATA.upcomingEvents;
}

function getRecentTopics(): ForumTopic[] {
  return COMUNIDADE_DATA.recentTopics;
}

function getPopularRituals(): SharedRitual[] {
  return COMUNIDADE_DATA.popularRituals;
}

function getTestimonials(): Testimonial[] {
  return COMUNIDADE_DATA.testimonials;
}
