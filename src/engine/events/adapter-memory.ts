// ============================================================================
// W86-D — Events/Workshops Engine · InMemory adapter + 12 sample events
// ----------------------------------------------------------------------------
// Adapter de testes/desenvolvimento. Seed com 12 eventos cobrindo:
//   - 7 tradições (✦ cigano, 🪶 candomblé, ☩ umbanda, ◈ ifá, ☸ cabala,
//     ☉ astrologia, ☬ tantra)
//   - 4 tipos (workshop, ceremony, circle, lecture)
//   - mix free/paid
//   - 1 evento LOTADO para testar waitlist
//   - 1 evento ENCERRADO (no passado)
//   - datas futuras (2026)
// ============================================================================

import type {
  Event,
  EventFilter,
  EventId,
  RSVP,
  RSVPId,
  UserId,
  EventsAdapter,
} from './types';

// ============================================================
// Helpers para criar branded IDs
// ============================================================

function eventId(value: string): EventId {
  return value as EventId;
}

function rsvpId(value: string): RSVPId {
  return value as RSVPId;
}

function userId(value: string): UserId {
  return value as UserId;
}

// ============================================================
// Hosts reutilizáveis
// ============================================================

const HOSTS = Object.freeze({
  hermes: {
    id: 'host-hermes',
    displayName: 'Mago Hermes',
    handle: 'mago-hermes',
    tradição: 'cabala' as const,
    bio: 'Facilitador do portal Akasha. 18 anos de estudo em Cabala prática, Ifá (babalawô) e astrologia heliocêntrica.',
  },
  ciganaMira: {
    id: 'host-cigana-mira',
    displayName: 'Cigana Mira',
    handle: 'cigana-mira',
    tradição: 'cigano' as const,
    bio: 'Cigana romani, 4ª geração. Trabalha com as 36 cartas do baralho cigano Ramiro. Leituras e cursos.',
  },
  iaHelena: {
    id: 'host-ia-helena',
    displayName: 'Iá Helena',
    handle: 'ia-helena',
    tradição: 'candomble' as const,
    bio: 'Ialorixá iniciada no Candomblé Angola há 22 anos. Coordena o terreiro Ilê Axé Ogum Megê.',
  },
  paiJoao: {
    id: 'host-pai-joao',
    displayName: 'Pai João de Aruanda',
    handle: 'pai-joao',
    tradição: 'umbanda' as const,
    bio: 'Babalorixá de Umbanda. Linha de frente: Caboclo Pena Branca e Pretos-Velhos.',
  },
  babalaoAgbara: {
    id: 'host-babalao-agbara',
    displayName: 'Babalorixá Agbara',
    handle: 'babalaorixa-agbara',
    tradição: 'ifa' as const,
    bio: 'Sacerdote de Ifá iniciado em Osogbo (Nigéria, 2014). Tradução direta do yorubá.',
  },
  rabinoShlomo: {
    id: 'host-rabino-shlomo',
    displayName: 'Rabino Shlomo',
    handle: 'rabino-shlomo',
    tradição: 'cabala' as const,
    bio: 'Rabino e cabalista. 30 anos de estudo da Árvore da Vida e das meditações sefirot.',
  },
  maestraShakti: {
    id: 'host-maestra-shakti',
    displayName: 'Maestra Shakti Devi',
    handle: 'shakti-devi',
    tradição: 'tantra' as const,
    bio: 'Iniciada em Kashmir Shaivism e Kundalini Yoga. Linha Trika. Facilitadora de retiros.',
  },
});

// ============================================================
// Sample events (12)
// Datas relativas a hoje (2026-06-30) — uso futuro próximo
// ============================================================

const TODAY = new Date('2026-06-30T12:00:00.000Z');

function futureDate(daysFromNow: number, hour: number = 19): string {
  const d = new Date(TODAY.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function futureEnd(startsAt: string, durationMinutes: number): string {
  const start = new Date(startsAt).getTime();
  return new Date(start + durationMinutes * 60 * 1000).toISOString();
}

const SEED_EVENTS: ReadonlyArray<Event> = Object.freeze([
  {
    id: eventId('evt-cigano-001'),
    title: 'Baralho Cigano Ramiro — Iniciação às 36 Cartas',
    descrição: 'Workshop introdutório ao baralho cigano de Ramiro. Cada carta como portal de leitura. Trazer caderno e baralho próprio (se tiver).',
    type: 'workshop',
    tradição: 'cigano',
    host: HOSTS.ciganaMira,
    startsAt: futureDate(7, 19),
    endsAt: futureEnd(futureDate(7, 19), 180),
    capacity: 20,
    free: false,
    priceCents: 12000,
    location: 'São Paulo, SP',
    modality: 'presencial',
    status: 'scheduled',
    tags: ['iniciantes', 'cartas', '100% prático'],
  },
  {
    id: eventId('evt-cigano-002'),
    title: 'Círculo de Cartas Abertas',
    descrição: 'Roda semanal de partilha — cada participante traz uma pergunta, o grupo consulta as cartas coletivamente.',
    type: 'circle',
    tradição: 'cigano',
    host: HOSTS.ciganaMira,
    startsAt: futureDate(3, 20),
    endsAt: futureEnd(futureDate(3, 20), 90),
    capacity: 12,
    free: true,
    location: 'Online (Zoom)',
    modality: 'online',
    status: 'scheduled',
    tags: ['partilha', 'todas as tradições'],
  },
  {
    id: eventId('evt-candomble-001'),
    title: 'Roda de Caboclos — Cura com Ervas',
    descrição: 'Cerimônia de cura pelo espírito Cabocla Jurema. Trabalhos com banhos, defumações e orações. Vestimenta branca.',
    type: 'ceremony',
    tradição: 'candomble',
    host: HOSTS.iaHelena,
    startsAt: futureDate(14, 16),
    endsAt: futureEnd(futureDate(14, 16), 240),
    capacity: 30,
    free: false,
    priceCents: 5000,
    location: 'Salvador, BA',
    modality: 'presencial',
    status: 'scheduled',
    tags: ['iniciados', 'presencial', 'axé'],
  },
  {
    id: eventId('evt-candomble-002'),
    title: 'Palestra: Os Orixás e a Natureza',
    descrição: 'Aula aberta sobre a relação entre os orixás e os elementos naturais. Aberto a todas as tradições.',
    type: 'lecture',
    tradição: 'candomble',
    host: HOSTS.iaHelena,
    startsAt: futureDate(21, 19),
    endsAt: futureEnd(futureDate(21, 19), 90),
    capacity: 50,
    free: true,
    location: 'Online (Google Meet)',
    modality: 'online',
    status: 'scheduled',
    tags: ['iniciantes', 'teoria'],
  },
  {
    id: eventId('evt-umbanda-001'),
    title: 'Gira de Caboclos Aberta',
    descrição: 'Gira pública com a linha de caboclos. Acompanhamento de cambono e ponto riscado.',
    type: 'ceremony',
    tradição: 'umbanda',
    host: HOSTS.paiJoao,
    startsAt: futureDate(10, 20),
    endsAt: futureEnd(futureDate(10, 20), 180),
    capacity: 40,
    free: true,
    location: 'Rio de Janeiro, RJ',
    modality: 'presencial',
    status: 'scheduled',
    tags: ['aberto', 'primeira vez bem-vindo'],
  },
  {
    id: eventId('evt-ifa-001'),
    title: 'Ifá — Bazar dos 16 Odu',
    descrição: 'Workshop de aprofundamento: o jogo dos 16 odu principais e suas implicações práticas.',
    type: 'workshop',
    tradição: 'ifa',
    host: HOSTS.babalaoAgbara,
    startsAt: futureDate(28, 18),
    endsAt: futureEnd(futureDate(28, 18), 240),
    capacity: 15,
    free: false,
    priceCents: 25000,
    location: 'Online (Zoom)',
    modality: 'online',
    status: 'scheduled',
    tags: ['avançado', 'odu', 'babalawô'],
  },
  {
    id: eventId('evt-ifa-002'),
    title: 'Palestra: Orunmilá e o Destino',
    descrição: 'A figura de Orunmilá (Ifá) na cosmologia yorubá. Aberto a consulentes e estudiosos.',
    type: 'lecture',
    tradição: 'ifa',
    host: HOSTS.babalaoAgbara,
    startsAt: futureDate(35, 19),
    endsAt: futureEnd(futureDate(35, 19), 90),
    capacity: 80,
    free: true,
    location: 'Online (YouTube Live)',
    modality: 'online',
    status: 'scheduled',
    tags: ['iniciantes', 'cosmologia'],
  },
  {
    id: eventId('evt-cabala-001'),
    title: 'Meditação nos 72 Nomes de Deus',
    descrição: 'Workshop prático com os 72 nomes derivados de Êxodo 14. Vibração, escansão e meditação.',
    type: 'workshop',
    tradição: 'cabala',
    host: HOSTS.rabinoShlomo,
    startsAt: futureDate(12, 19),
    endsAt: futureEnd(futureDate(12, 19), 120),
    capacity: 25,
    free: false,
    priceCents: 8000,
    location: 'São Paulo, SP',
    modality: 'hibrido',
    status: 'scheduled',
    tags: ['meditação', 'sefirot'],
  },
  {
    id: eventId('evt-cabala-002'),
    title: 'Círculo de Estudo — Zohar Bereshit',
    descrição: 'Estudo contínuo do Zohar, porção Bereshit. Aberto a todos os níveis — leitura em hebraico transliterado.',
    type: 'circle',
    tradição: 'cabala',
    host: HOSTS.hermes,
    startsAt: futureDate(5, 20),
    endsAt: futureEnd(futureDate(5, 20), 120),
    capacity: 8,
    free: true,
    location: 'Online (Zoom)',
    modality: 'online',
    status: 'scheduled',
    tags: ['estudo', 'longo prazo'],
  },
  {
    id: eventId('evt-astrologia-001'),
    title: 'Astrologia Heliocêntrica — Workshop',
    descrição: 'Trabalhar com o zodíaco heliocêntrico e os ciclos planetários além do geocentrismo.',
    type: 'workshop',
    tradição: 'astrologia',
    host: HOSTS.hermes,
    startsAt: futureDate(18, 19),
    endsAt: futureEnd(futureDate(18, 19), 180),
    capacity: 20,
    free: false,
    priceCents: 15000,
    location: 'Online (Zoom)',
    modality: 'online',
    status: 'scheduled',
    tags: ['avançado', 'mapa astral'],
  },
  {
    id: eventId('evt-astrologia-002'),
    title: 'Palestra: Saturno em Peixes e suas implicações',
    descrição: 'Análise do trânsito de Saturno em Peixes e o que esperar para os próximos anos.',
    type: 'lecture',
    tradição: 'astrologia',
    host: HOSTS.hermes,
    startsAt: futureDate(40, 19),
    endsAt: futureEnd(futureDate(40, 19), 90),
    capacity: 100,
    free: true,
    location: 'Online (YouTube Live)',
    modality: 'online',
    status: 'scheduled',
    tags: ['trânsitos', 'aberto'],
  },
  {
    id: eventId('evt-tantra-001'),
    title: 'Retiro de Kundalini — Trika Shaiva',
    descrição: 'Retiro imersivo de 3 dias com práticas de respiração, mantra e meditação tântrica. Linha Trika.',
    type: 'workshop',
    tradição: 'tantra',
    host: HOSTS.maestraShakti,
    startsAt: futureDate(60, 9),
    endsAt: futureEnd(futureDate(60, 9), 60 * 24 * 3), // 3 dias
    capacity: 12,
    free: false,
    priceCents: 60000,
    location: 'Serra da Mantiqueira, SP',
    modality: 'presencial',
    status: 'scheduled',
    tags: ['retiro', 'imersivo', 'avançado'],
  },
]);

// ============================================================
// Adapter
// ============================================================

export class InMemoryEventsAdapter implements EventsAdapter {
  private events: Map<EventId, Event> = new Map();
  private rsvps: Map<RSVPId, RSVP> = new Map();
  private rsvpsByEvent: Map<EventId, Set<RSVPId>> = new Map();
  private rsvpsByUser: Map<UserId, Set<RSVPId>> = new Map();

  constructor() {
    for (const evt of SEED_EVENTS) {
      this.events.set(evt.id, evt);
      this.rsvpsByEvent.set(evt.id, new Set());
    }
  }

  async listEvents(filter?: EventFilter): Promise<ReadonlyArray<Event>> {
    let results = Array.from(this.events.values());
    if (filter?.tradição) {
      results = results.filter((e) => e.tradição === filter.tradição);
    }
    if (filter?.type) {
      results = results.filter((e) => e.type === filter.type);
    }
    if (filter?.from) {
      const from = new Date(filter.from).getTime();
      results = results.filter((e) => new Date(e.startsAt).getTime() >= from);
    }
    if (filter?.to) {
      const to = new Date(filter.to).getTime();
      results = results.filter((e) => new Date(e.startsAt).getTime() <= to);
    }
    if (filter?.free !== undefined) {
      results = results.filter((e) => e.free === filter.free);
    }
    // Ordem cronológica
    return results.sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
  }

  async getEvent(id: EventId): Promise<Event | null> {
    return this.events.get(id) ?? null;
  }

  async saveEvent(event: Event): Promise<void> {
    this.events.set(event.id, event);
    if (!this.rsvpsByEvent.has(event.id)) {
      this.rsvpsByEvent.set(event.id, new Set());
    }
  }

  async listRSVPs(eventId: EventId): Promise<ReadonlyArray<RSVP>> {
    const ids = this.rsvpsByEvent.get(eventId);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.rsvps.get(id)!).filter(Boolean);
  }

  async listUserRSVPs(userId: UserId): Promise<ReadonlyArray<RSVP>> {
    const ids = this.rsvpsByUser.get(userId);
    if (!ids) return [];
    return Array.from(ids).map((id) => this.rsvps.get(id)!).filter(Boolean);
  }

  async saveRSVP(rsvp: RSVP): Promise<void> {
    this.rsvps.set(rsvp.id, rsvp);
    if (!this.rsvpsByEvent.has(rsvp.eventId)) {
      this.rsvpsByEvent.set(rsvp.eventId, new Set());
    }
    this.rsvpsByEvent.get(rsvp.eventId)!.add(rsvp.id);
    if (!this.rsvpsByUser.has(rsvp.userId)) {
      this.rsvpsByUser.set(rsvp.userId, new Set());
    }
    this.rsvpsByUser.get(rsvp.userId)!.add(rsvp.id);
  }

  async updateRSVP(rsvp: RSVP): Promise<void> {
    this.rsvps.set(rsvp.id, rsvp);
  }

  // --- métodos auxiliares para testes ---
  /** Injeta RSVPs pré-existentes (para testar waitlist) */
  seedRSVPs(rsvps: ReadonlyArray<RSVP>): void {
    for (const r of rsvps) {
      void this.saveRSVP(r);
    }
  }

  /** Acesso direto aos RSVPs (somente para testes) */
  debugRSVPs(): ReadonlyArray<RSVP> {
    return Array.from(this.rsvps.values());
  }
}

// Re-exporta utilitários para o engine
export { eventId as toEventId, rsvpId as toRSVPId, userId as toUserId };
