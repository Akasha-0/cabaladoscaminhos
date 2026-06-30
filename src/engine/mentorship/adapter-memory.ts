// ============================================================================
// W87-B — Mentorship Pairing · InMemory adapter
// ----------------------------------------------------------------------------
// Adapter de testes/desenvolvimento. Seed com:
//   - 8 mentores cobrindo as 7 tradições (cigano×2, candomblé, umbanda,
//     ifá, cabala, astrologia, tantra)
//   - 4 mentees com perfis diversos (idiomas, timezones, níveis)
//   - 1 mentor com acceptMentees=false (pausa temporária)
//   - State preservado entre chamadas (pairing requests)
//
// Decisões:
//   - Helpers `eid`/`mid`/`pid` para branded IDs com type-safety
//   - `debug*` exposto para os testes verificarem state interno
// ============================================================================

import {
  mentorId,
  menteeId,
  pairingId,
  type AvailabilitySlot,
  type MentorFilter,
  type MentorId,
  type MentorProfile,
  type MenteeId,
  type MenteeProfile,
  type MentorshipAdapter,
  type PairingId,
  type PairingRequest,
} from './types';

// ============================================================
// Branded ID helpers
// ============================================================

function eid(value: string): MentorId {
  return mentorId(value);
}
function mid(value: string): MenteeId {
  return menteeId(value);
}
function pid(value: string): PairingId {
  return pairingId(value);
}

// ============================================================
// Sample data — 8 mentores cobrindo as 7 tradições
// ============================================================================

/** Cria um slot ISO entre duas datas (mesma data, offsets diferentes) */
function slot(dateIso: string, hour: number, durMin = 60): AvailabilitySlot {
  const start = new Date(dateIso);
  start.setUTCHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + durMin * 60_000);
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

const SAMPLE_AVAILABILITY_2026_Q3: ReadonlyArray<AvailabilitySlot> = Object.freeze([
  slot('2026-07-15', 18),
  slot('2026-07-22', 18),
  slot('2026-07-29', 18),
  slot('2026-08-05', 19),
]);

const SAMPLE_MENTORS: ReadonlyArray<MentorProfile> = Object.freeze([
  // 1. Cigano (Cigana Mira — Ramiro 4ª geração)
  Object.freeze({
    id: eid('mentor-cigana-mira'),
    displayName: 'Cigana Mira',
    handle: 'cigana-mira',
    tradição: 'cigano' as const,
    studyAreas: Object.freeze(['taro-cigano', 'rituais', 'meditacao']) as ReadonlyArray<
      MentorProfile['studyAreas'][number]
    >,
    languages: Object.freeze(['pt-BR', 'es']) as ReadonlyArray<MentorProfile['languages'][number]>,
    level: 'mestre' as const,
    bio: 'Cigana romani, 4ª geração. Trabalha com as 36 cartas do baralho cigano Ramiro há 30 anos. Leituras, cursos e mentorias individuais.',
    availability: SAMPLE_AVAILABILITY_2026_Q3,
    timezone: 'America/Sao_Paulo',
    acceptMentees: true,
  }),

  // 2. Candomblé (Iá Helena — Ialorixá há 22 anos)
  Object.freeze({
    id: eid('mentor-ia-helena'),
    displayName: 'Iá Helena de Oxum',
    handle: 'ia-helena',
    tradição: 'candomble' as const,
    studyAreas: Object.freeze([
      'leitura-de-orixas',
      'rituais',
      'meditacao',
      'cura-energetica',
    ]) as ReadonlyArray<MentorProfile['studyAreas'][number]>,
    languages: Object.freeze(['pt-BR']) as ReadonlyArray<MentorProfile['languages'][number]>,
    level: 'mestre' as const,
    bio: 'Ialorixá iniciada no Candomblé Angola há 22 anos. Coordena o terreiro Ilê Axé Ogum Megê. Mentora em axé, ebó e fundamentos da casa.',
    availability: SAMPLE_AVAILABILITY_2026_Q3,
    timezone: 'America/Bahia',
    acceptMentees: true,
  }),

  // 3. Umbanda (Pai João — Babalorixá)
  Object.freeze({
    id: eid('mentor-pai-joao'),
    displayName: 'Pai João de Aruanda',
    handle: 'pai-joao',
    tradição: 'umbanda' as const,
    studyAreas: Object.freeze([
      'cura-energetica',
      'rituais',
      'meditacao',
    ]) as ReadonlyArray<MentorProfile['studyAreas'][number]>,
    languages: Object.freeze(['pt-BR']) as ReadonlyArray<MentorProfile['languages'][number]>,
    level: 'avancado' as const,
    bio: 'Babalorixá de Umbanda. Linha de frente: Caboclo Pena Branca e Pretos-Velhos. Trabalhos de cura e descarregos.',
    availability: SAMPLE_AVAILABILITY_2026_Q3,
    timezone: 'America/Sao_Paulo',
    acceptMentees: true,
  }),

  // 4. Ifá (Babalorixá Agbara — iniciado em Osogbo)
  Object.freeze({
    id: eid('mentor-babalao-agbara'),
    displayName: 'Babalorixá Agbara',
    handle: 'babalaorixa-agbara',
    tradição: 'ifa' as const,
    studyAreas: Object.freeze([
      'leitura-de-odu',
      'rituais',
      'leitura-de-orixas',
    ]) as ReadonlyArray<MentorProfile['studyAreas'][number]>,
    languages: Object.freeze(['pt-BR', 'en']) as ReadonlyArray<MentorProfile['languages'][number]>,
    level: 'mestre' as const,
    bio: 'Sacerdote de Ifá iniciado em Osogbo (Nigéria, 2014). Tradução direta do yorubá. Mentoria em leitura de Odu e fundamento de Ifá.',
    availability: SAMPLE_AVAILABILITY_2026_Q3,
    timezone: 'America/Sao_Paulo',
    acceptMentees: true,
  }),

  // 5. Cabala (Rabino Shlomo — 18 anos de estudo)
  Object.freeze({
    id: eid('mentor-rabino-shlomo'),
    displayName: 'Rabino Shlomo Ben-Levi',
    handle: 'rabino-shlomo',
    tradição: 'cabala' as const,
    studyAreas: Object.freeze([
      'cabala-mistica',
      'meditacao',
      'rituais',
      'pranayama',
    ]) as ReadonlyArray<MentorProfile['studyAreas'][number]>,
    languages: Object.freeze(['pt-BR', 'en', 'es']) as ReadonlyArray<
      MentorProfile['languages'][number]
    >,
    level: 'mestre' as const,
    bio: 'Rabino e cabalista. 18 anos de estudo em Cabala prática, Árvore da Vida e meditação sobre os nomes divinos.',
    availability: SAMPLE_AVAILABILITY_2026_Q3,
    timezone: 'America/Sao_Paulo',
    acceptMentees: true,
  }),

  // 6. Astrologia (Maga Astreia — heliocêntrica)
  Object.freeze({
    id: eid('mentor-maga-astreia'),
    displayName: 'Maga Astreia',
    handle: 'maga-astreia',
    tradição: 'astrologia' as const,
    studyAreas: Object.freeze([
      'astrologia-pratica',
      'rituais',
    ]) as ReadonlyArray<MentorProfile['studyAreas'][number]>,
    languages: Object.freeze(['pt-BR', 'es']) as ReadonlyArray<
      MentorProfile['languages'][number]
    >,
    level: 'avancado' as const,
    bio: 'Astróloga há 12 anos. Estudo em astrologia heliocêntrica, ciclos planetários e revolução solar. Mentoria em leitura de mapa natal.',
    availability: SAMPLE_AVAILABILITY_2026_Q3,
    timezone: 'Europe/Lisbon',
    acceptMentees: true,
  }),

  // 7. Tantra (Swami Dayananda — Tantra Kashmir)
  Object.freeze({
    id: eid('mentor-swami-dayananda'),
    displayName: 'Swami Dayananda',
    handle: 'swami-dayananda',
    tradição: 'tantra' as const,
    studyAreas: Object.freeze([
      'tantra',
      'pranayama',
      'meditacao',
    ]) as ReadonlyArray<MentorProfile['studyAreas'][number]>,
    languages: Object.freeze(['pt-BR', 'en']) as ReadonlyArray<
      MentorProfile['languages'][number]
    >,
    level: 'mestre' as const,
    bio: 'Iniciado em Tantra Kashmir (linhagem de Swami Lakshmanjoo). Ensina Tantra não-dual, pranayama e meditação.',
    availability: SAMPLE_AVAILABILITY_2026_Q3,
    timezone: 'America/Sao_Paulo',
    acceptMentees: true,
  }),

  // 8. Cigano #2 (Cigano Ramiro — círculo Cigano Ramiro original)
  Object.freeze({
    id: eid('mentor-cigano-ramiro'),
    displayName: 'Cigano Ramiro',
    handle: 'cigano-ramiro',
    tradição: 'cigano' as const,
    studyAreas: Object.freeze([
      'taro-cigano',
      'leitura-de-orixas',
      'meditacao',
    ]) as ReadonlyArray<MentorProfile['studyAreas'][number]>,
    languages: Object.freeze(['pt-BR']) as ReadonlyArray<MentorProfile['languages'][number]>,
    level: 'intermediario' as const,
    bio: 'Cigano rom, 2ª geração. Aprendeu o método Ramiro com o pai. Hoje mentor iniciantes no baralho cigano.',
    availability: SAMPLE_AVAILABILITY_2026_Q3,
    timezone: 'America/Sao_Paulo',
    acceptMentees: false, // PAUSADO — testa exclusão de findPairings
  }),
]);

const SAMPLE_MENTEES: ReadonlyArray<MenteeProfile> = Object.freeze([
  Object.freeze({
    id: mid('mentee-br-iniciante'),
    displayName: 'Lúcia Mendes',
    handle: 'lucia-mendes',
    tradiçãoEscolhida: 'cigano' as const,
    interests: Object.freeze(['taro-cigano', 'meditacao']) as ReadonlyArray<
      MenteeProfile['interests'][number]
    >,
    level: 'iniciante' as const,
    languages: Object.freeze(['pt-BR']) as ReadonlyArray<MenteeProfile['languages'][number]>,
    timezone: 'America/Sao_Paulo',
  }),
  Object.freeze({
    id: mid('mentee-br-intermediaria'),
    displayName: 'Rafael Souza',
    handle: 'rafael-souza',
    tradiçãoEscolhida: 'candomble' as const,
    interests: Object.freeze([
      'leitura-de-orixas',
      'rituais',
      'cura-energetica',
    ]) as ReadonlyArray<MenteeProfile['interests'][number]>,
    level: 'intermediario' as const,
    languages: Object.freeze(['pt-BR']) as ReadonlyArray<MenteeProfile['languages'][number]>,
    timezone: 'America/Sao_Paulo',
  }),
  Object.freeze({
    id: mid('mentee-eua-avancado'),
    displayName: 'Sarah Johnson',
    handle: 'sarah-johnson',
    tradiçãoEscolhida: 'cabala' as const,
    interests: Object.freeze([
      'cabala-mistica',
      'meditacao',
      'pranayama',
    ]) as ReadonlyArray<MenteeProfile['interests'][number]>,
    level: 'avancado' as const,
    languages: Object.freeze(['en', 'es']) as ReadonlyArray<MenteeProfile['languages'][number]>,
    timezone: 'America/New_York',
  }),
  Object.freeze({
    id: mid('mentee-es-mestre'),
    displayName: 'Carlos Vega',
    handle: 'carlos-vega',
    tradiçãoEscolhida: 'astrologia' as const,
    interests: Object.freeze([
      'astrologia-pratica',
      'rituais',
    ]) as ReadonlyArray<MenteeProfile['interests'][number]>,
    level: 'mestre' as const,
    languages: Object.freeze(['es', 'pt-BR']) as ReadonlyArray<MenteeProfile['languages'][number]>,
    timezone: 'Europe/Madrid',
  }),
]);

// ============================================================
// InMemory adapter (com state mutável)
// ============================================================================

export class InMemoryMentorshipAdapter implements MentorshipAdapter {
  private mentors: Map<MentorId, MentorProfile>;
  private mentees: Map<MenteeId, MenteeProfile>;
  private pairings: Map<PairingId, PairingRequest>;

  constructor(
    initialMentors: ReadonlyArray<MentorProfile> = SAMPLE_MENTORS,
    initialMentees: ReadonlyArray<MenteeProfile> = SAMPLE_MENTEES,
  ) {
    this.mentors = new Map(initialMentors.map((m) => [m.id, m]));
    this.mentees = new Map(initialMentees.map((m) => [m.id, m]));
    this.pairings = new Map();
  }

  async listMentors(filter?: MentorFilter): Promise<ReadonlyArray<MentorProfile>> {
    const all = Array.from(this.mentors.values());
    if (!filter) return all;
    return all.filter((m) => {
      if (filter.tradição && m.tradição !== filter.tradição) return false;
      if (filter.studyArea && !m.studyAreas.includes(filter.studyArea)) return false;
      if (filter.language && !m.languages.includes(filter.language)) return false;
      if (filter.level && m.level !== filter.level) return false;
      if (filter.onlyAccepting === true && !m.acceptMentees) return false;
      return true;
    });
  }

  async getMentor(id: MentorId): Promise<MentorProfile | null> {
    return this.mentors.get(id) ?? null;
  }

  async listMentees(): Promise<ReadonlyArray<MenteeProfile>> {
    return Array.from(this.mentees.values());
  }

  async getMentee(id: MenteeId): Promise<MenteeProfile | null> {
    return this.mentees.get(id) ?? null;
  }

  async savePairingRequest(req: PairingRequest): Promise<void> {
    this.pairings.set(req.id, req);
  }

  async updatePairingRequest(req: PairingRequest): Promise<void> {
    if (!this.pairings.has(req.id)) {
      throw new Error(`Pairing ${req.id} não existe para update`);
    }
    this.pairings.set(req.id, req);
  }

  async listPairingRequests(filter?: {
    menteeId?: MenteeId;
    mentorId?: MentorId;
  }): Promise<ReadonlyArray<PairingRequest>> {
    const all = Array.from(this.pairings.values());
    if (!filter) return all;
    return all.filter((r) => {
      if (filter.menteeId && r.menteeId !== filter.menteeId) return false;
      if (filter.mentorId && r.mentorId !== filter.mentorId) return false;
      return true;
    });
  }

  // ============================================================
  // Debug helpers (NÃO fazem parte do contrato público do adapter)
  // Usados pelos specs e pelo smoke para inspecionar state interno.
  // ============================================================

  /** Retorna todos os pairings (incluindo os cancelados/declinados) */
  debugPairings(): ReadonlyArray<PairingRequest> {
    return Array.from(this.pairings.values());
  }

  /** Reseta o adapter para o estado inicial (útil entre testes) */
  reset(): void {
    this.mentors = new Map(SAMPLE_MENTORS.map((m) => [m.id, m]));
    this.mentees = new Map(SAMPLE_MENTEES.map((m) => [m.id, m]));
    this.pairings = new Map();
  }
}
