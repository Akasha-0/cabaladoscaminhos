// ============================================================================
// EVENTS — Mock data (W26)
// ----------------------------------------------------------------------------
// 8 eventos de exemplo cobrindo a variedade do portal:
//   - 2 workshops (1 pago, 1 gratuito)
//   - 2 rituais (ambos presenciais)
//   - 2 círculos de estudo (online)
//   - 1 meditação guiada (online, gratuito)
//   - 1 workshop híbrido (curadoria)
// ============================================================================

import type { Event, Host } from './types';

// ============================================================
// Hosts reutilizáveis
// ============================================================

const hosts: Record<string, Host> = {
  hermes: {
    id: 'host-hermes',
    displayName: 'Mago Hermes',
    avatarUrl: '/mago-hermes-profile.png',
    traditionLine: 'Cabala · Ifá · Astrologia',
    handle: 'mago-hermes',
    bio:
      'Facilitador do portal Akasha. 18 anos de estudo em Cabala prática, Ifá (babalawô) e astrologia heliocêntrica. ' +
      'Metodologia: traduzir tradição em vivência. Cada workshop é um experimento, não uma aula.',
  },
  iah: {
    id: 'host-iah',
    displayName: 'Iá Helena',
    traditionLine: 'Candomblé · Umbanda',
    handle: 'ia-helena',
    bio:
      'Ialorixá iniciada no Candomblé Angola há 22 anos. Coordena o terreiro Ilê Axé Ogum Megê. ' +
      'Trabalha com cura através de ervas, banhos e giras de caboclo. Linha de frente: Cabocla Jurema.',
  },
  agbara: {
    id: 'host-agbara',
    displayName: 'Babalorixá Agbara',
    traditionLine: 'Ifá · Yorubá',
    handle: 'babalaorixa-agbara',
    bio:
      'Sacerdote de Ifá iniciado em Osogbo (Nigéria, 2014). Tradução direta do yorubá. ' +
      'Atende consulentes no Rio e online. Linhagem: Agbonniron.',
  },
  shakti: {
    id: 'host-shakti',
    displayName: 'Maestra Shakti Devi',
    traditionLine: 'Tântrica · Kundalini Yoga',
    handle: 'shakti-devi',
    bio:
      'Maestra de Tantra branco (consciência) há 12 anos. Aluna direta de Swami Jnaneshvara Bharati. ' +
      'Especialista em respiração holotrópica e meditação tântrica.',
  },
  kahina: {
    id: 'host-kahina',
    displayName: 'Xeica Kahina',
    traditionLine: 'Xamanismo Bereber · Sufismo',
    handle: 'xeica-kahina',
    bio:
      'Xeica (curandeira) da tradição Amazigh/Bereber do Marrocos. Linha: Tarikat Jerrahi-Sufi. ' +
      'Curandeira de ossos, cantora de dhikr, parteira espiritual.',
  },
};

// ============================================================
// 8 eventos — variedade completa
// ============================================================

export const mockEvents: Event[] = [
  // 1. Workshop Cabalístico PRESENCIAL · PAGO
  {
    slug: 'arvore-da-vida-em-movimento-setembro-2026',
    title: 'A Árvore da Vida em Movimento',
    description:
      'Workshop prático de Cabala usando o corpo como mapa. Cada Sephirah vira um movimento, uma postura, uma respiração. ' +
      'Indicado para iniciantes que já leram algo sobre o assunto e praticantes que querem sair da cabeça.',
    type: 'workshop',
    tradition: 'cabala',
    startsAt: '2026-09-14T15:00:00-03:00',
    endsAt: '2026-09-14T18:00:00-03:00',
    durationMin: 180,
    locationKind: 'presencial',
    city: 'São Paulo',
    neighborhood: 'Vila Madalena',
    capacity: 20,
    confirmedCount: 14,
    priceCents: 18000, // R$ 180
    coverImage:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200&q=70&auto=format&fit=crop',
    coverAlt: 'Mandala geométrica dourada sobre fundo escuro',
    tags: ['iniciantes', 'presencial', 'corpo'],
    signupStatus: 'open',
    host: hosts.hermes,
    language: 'pt-BR',
  },

  // 2. RITUAL PRESENCIAL · GRATUITO (oferta consciente)
  {
    slug: 'gira-de-cabocla-jurema-lua-cheia',
    title: 'Gira de Cabocla Jurema — Lua Cheia',
    description:
      'Ritual de abertura e fechamento do ciclo lunar. Oferendas, cantos em iorubá, consulta com Cabocla. ' +
      'Vagas limitadas. Traga roupa branca, uma garrafa de água e uma intenção clara.',
    type: 'ritual',
    tradition: 'candomble',
    startsAt: '2026-07-21T20:00:00-03:00',
    endsAt: '2026-07-22T02:00:00-03:00',
    durationMin: 360,
    locationKind: 'presencial',
    city: 'Rio de Janeiro',
    neighborhood: 'Ilê Axé Ogum Megê — Madureira',
    capacity: 30,
    confirmedCount: 27,
    priceCents: null,
    coverImage:
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=70&auto=format&fit=crop',
    coverAlt: 'Lua cheia sobre o mar, tons azul e dourado',
    tags: ['oferta', 'presencial', 'lua-cheia'],
    signupStatus: 'open',
    host: hosts.iah,
    language: 'pt-BR',
  },

  // 3. CÍRCULO DE ESTUDO ONLINE · GRATUITO
  {
    slug: 'circulo-de-estudo-odu-de-nascimento',
    title: 'Círculo de Estudo — Odu de Nascimento',
    description:
      'Estudo semanal do seu Odu principal. Cada participante traz sua data de nascimento e sai com o ' +
      'Odu regente, orixá pedindo atenção e caminho de mitigação. Continuidade: 4 encontros.',
    type: 'study-circle',
    tradition: 'ifa',
    startsAt: '2026-07-30T19:30:00-03:00',
    endsAt: '2026-07-30T21:30:00-03:00',
    durationMin: 120,
    locationKind: 'online',
    onlineUrl: 'https://meet.example.com/odu-nascimento',
    platform: 'Google Meet',
    capacity: 12,
    confirmedCount: 8,
    priceCents: null,
    coverImage:
      'https://images.unsplash.com/photo-1532635224-cf024e66f1b8?w=1200&q=70&auto=format&fit=crop',
    coverAlt: 'Símbolos geométricos africanos em madeira',
    tags: ['estudo', '4-encontros', 'online'],
    signupStatus: 'open',
    host: hosts.agbara,
    language: 'pt-BR',
  },

  // 4. MEDITAÇÃO ONLINE · GRATUITA
  {
    slug: 'meditacao-kundalini-raiz-7-chakras',
    title: 'Meditação Kundalini — Os 7 Chakras em 7 Dias',
    description:
      'Série gratuita de 7 meditações guiadas (uma por chakra). Cada sessão tem 21 minutos — ' +
      'tempo simbólico da respiração tântrica. Pode começar em qualquer dia; o recomendado é seguir a ordem.',
    type: 'meditation',
    tradition: 'tantra',
    startsAt: '2026-08-03T07:00:00-03:00',
    endsAt: '2026-08-03T07:21:00-03:00',
    durationMin: 21,
    locationKind: 'online',
    onlineUrl: 'https://youtube.com/live/akasha-kundalini',
    platform: 'YouTube Live',
    capacity: 0, // ilimitado
    confirmedCount: 0,
    priceCents: null,
    coverImage:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=70&auto=format&fit=crop',
    coverAlt: 'Silhueta em meditação contra céu de nascer do sol',
    tags: ['iniciantes', 'diário', '7-dias'],
    signupStatus: 'open',
    host: hosts.shakti,
    language: 'pt-BR',
  },

  // 5. WORKSHOP HÍBRIDO · PAGO
  {
    slug: 'workshop-sufismo-72-nomes-de-allah',
    title: 'Os 72 Nomes de Allah — Workshop Híbrido',
    description:
      'Cada um dos 72 nomes vira uma estação de dhikr. Em São Paulo (presencial) e via Zoom (online). ' +
      'Material: caderneta dos 72 nomes, escrita manual árabe, áudio com pronúncia correta.',
    type: 'workshop',
    tradition: 'sufismo',
    startsAt: '2026-08-17T14:00:00-03:00',
    endsAt: '2026-08-17T18:00:00-03:00',
    durationMin: 240,
    locationKind: 'hybrid',
    city: 'São Paulo',
    neighborhood: 'Centro Cultural Sufi — Bela Vista',
    onlineUrl: 'https://zoom.us/j/example-sufismo',
    platform: 'Zoom',
    capacity: 40,
    confirmedCount: 18,
    priceCents: 22000, // R$ 220
    coverImage:
      'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=1200&q=70&auto=format&fit=crop',
    coverAlt: 'Caligrafia árabe dourada sobre fundo azul marinho',
    tags: ['intermediário', 'híbrido', 'escrita-árabe'],
    signupStatus: 'open',
    host: hosts.kahina,
    language: 'pt-BR',
  },

  // 6. RITUAL XAMÂNICO · PAGO
  {
    slug: 'sessao-de-cura-com-rapé-e-sananga',
    title: 'Sessão de Cura — Rapé e Sananga',
    description:
      'Sessão individual ou em dupla (escolha no signup). Rapé de corda (TSUN), sananga da Amazônia, ' +
      'floresta de fundo sonoro. Trazer: toalha, roupa confortável, jejum de 4h.',
    type: 'ritual',
    tradition: 'xamanismo',
    startsAt: '2026-08-09T10:00:00-03:00',
    endsAt: '2026-08-09T11:30:00-03:00',
    durationMin: 90,
    locationKind: 'presencial',
    city: 'Curitiba',
    neighborhood: 'Espaço Akasha — Água Verde',
    capacity: 6,
    confirmedCount: 6,
    priceCents: 15000, // R$ 150
    coverImage:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=70&auto=format&fit=crop',
    coverAlt: 'Floresta com raios de sol filtrados, tons verdes',
    tags: ['individual', 'presencial', 'jejum'],
    signupStatus: 'full',
    host: hosts.kahina,
    language: 'pt-BR',
  },

  // 7. CÍRCULO DE ESTUDO ONLINE · GRATUITO
  {
    slug: 'circulo-astrologia-mapa-natal-coletivo',
    title: 'Círculo de Astrologia — Mapa Natal Coletivo',
    description:
      'Estudamos o mesmo mapa natal a cada encontro (mapa sorteado no primeiro). Passamos por signos, ' +
      'planetas, casas e aspectos com vocabulário simples. Para quem nunca viu um mapa na vida.',
    type: 'study-circle',
    tradition: 'astrologia',
    startsAt: '2026-09-02T20:00:00-03:00',
    endsAt: '2026-09-02T22:00:00-03:00',
    durationMin: 120,
    locationKind: 'online',
    onlineUrl: 'https://meet.example.com/astro-mapa',
    platform: 'Google Meet',
    capacity: 25,
    confirmedCount: 11,
    priceCents: null,
    coverImage:
      'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=1200&q=70&auto=format&fit=crop',
    coverAlt: 'Carta astral desenhada à mão sobre papel envelhecido',
    tags: ['iniciantes', '6-encontros', 'online'],
    signupStatus: 'open',
    host: hosts.hermes,
    language: 'pt-BR',
  },

  // 8. WORKSHOP TÂNTRICO ONLINE · PAGO
  {
    slug: 'taller-tantra-respiracion-holotropica',
    title: 'Taller de Tantra — Respiración Holotrópica (ES)',
    description:
      'Taller en español. 3 horas de respiración holotrópica guiada con música. ' +
      'Necesario: colchoneta, manta, agua, ayuno de 2h. Nivel: intermedio (ya haber tomado un taller antes).',
    type: 'workshop',
    tradition: 'tantra',
    startsAt: '2026-08-23T16:00:00-03:00',
    endsAt: '2026-08-23T19:00:00-03:00',
    durationMin: 180,
    locationKind: 'online',
    onlineUrl: 'https://zoom.us/j/example-tantra-es',
    platform: 'Zoom',
    capacity: 30,
    confirmedCount: 19,
    priceCents: 9500, // R$ 95
    coverImage:
      'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=1200&q=70&auto=format&fit=crop',
    coverAlt: 'Tecido vermelho drapeado com luz dourada',
    tags: ['intermediário', 'en-espanhol', 'online'],
    signupStatus: 'open',
    host: hosts.shakti,
    language: 'es',
  },
];

/** Helper: evento por slug (mock) */
export function getMockEventBySlug(slug: string): Event | undefined {
  return mockEvents.find((e) => e.slug === slug);
}

/** Helper: eventos futuros ordenados por data */
export function getMockUpcomingEvents(): Event[] {
  const now = Date.now();
  return mockEvents
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}