// ============================================================================
// W87-B — Mentorship Pairing · types
// ----------------------------------------------------------------------------
// Modelo de domínio para a feature NOVA de mentoria 1-on-1 (mentor ↔ mentee).
// O pareamento é score-based e considera:
//   - tradição match (mesma tradição que o mentee escolheu)
//   - study-area overlap (quantas áreas de estudo batem)
//   - language match (mesma língua ou compatível)
//   - timezone diff (penalidade se diff > 3h)
//   - level guard (penalidade se mentee.level > mentor.level)
// ----------------------------------------------------------------------------
// Decisões:
//   - IDs branded (string & { __brand }) para evitar mix-ups
//   - Score normalizado [0, 100] (saturado)
//   - LGPD consent obrigatório no createPairingRequest (LGPD_VERSION)
//   - `acceptMentees: boolean` permite mentor pausar mentorias sem perder
//     visibilidade (preserva card, mas exclui de findPairings)
//   - Availability é lista de slots ISO (compatível com `new Date(...)`)
// ============================================================================

/** Versão da política de LGPD exigida no consentimento */
export const LGPD_VERSION = '2026-01';

/** 7 tradições (mesmas do portal: cigano, candomblé, umbanda, ifá, cabala,
 *  astrologia, tantra) */
export type Tradição =
  | 'cigano'
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra';

/** Símbolo textual (Unicode) por tradição — announcement-friendly */
export const TRADIÇÃO_SYMBOL: Readonly<Record<Tradição, string>> = Object.freeze({
  cigano: '✦',
  candomble: '🪶',
  umbanda: '☩',
  ifa: '◈',
  cabala: '☸',
  astrologia: '☉',
  tantra: '☬',
});

/** Label humana (pt-BR) por tradição */
export const TRADIÇÃO_LABEL: Readonly<Record<Tradição, string>> = Object.freeze({
  cigano: 'Cigano',
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
});

/** Lista canônica — exportada para uso em filtros/UI */
export const TRADIÇÕES: ReadonlyArray<Tradição> = Object.freeze([
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
]);

/** Áreas de estudo suportadas (10 — alinhadas com prática esotérica) */
export type StudyArea =
  | 'meditacao'
  | 'rituais'
  | 'astrologia-pratica'
  | 'cabala-mistica'
  | 'leitura-de-orixas'
  | 'cura-energetica'
  | 'taro-cigano'
  | 'leitura-de-odu'
  | 'tantra'
  | 'pranayama';

/** Labels humanos (pt-BR) */
export const STUDY_AREA_LABEL: Readonly<Record<StudyArea, string>> = Object.freeze({
  meditacao: 'Meditação',
  rituais: 'Rituais',
  'astrologia-pratica': 'Astrologia prática',
  'cabala-mistica': 'Cabala mística',
  'leitura-de-orixas': 'Leitura de Orixás',
  'cura-energetica': 'Cura energética',
  'taro-cigano': 'Tarô-cigano',
  'leitura-de-odu': 'Leitura de Odu',
  tantra: 'Tantra',
  pranayama: 'Pranayama',
});

/** Lista canônica para UIs de filtro */
export const STUDY_AREAS: ReadonlyArray<StudyArea> = Object.freeze([
  'meditacao',
  'rituais',
  'astrologia-pratica',
  'cabala-mistica',
  'leitura-de-orixas',
  'cura-energetica',
  'taro-cigano',
  'leitura-de-odu',
  'tantra',
  'pranayama',
]);

/** Línguas suportadas pelo portal */
export type Language = 'pt-BR' | 'en' | 'es';

/** Níveis de experiência (4 estágios alinhados com tradição esotérica) */
export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado' | 'mestre';

/** Ordem numérica implícita dos níveis — usado para o level guard */
export const LEVEL_ORDER: Readonly<Record<ExperienceLevel, number>> = Object.freeze({
  iniciante: 1,
  intermediario: 2,
  avancado: 3,
  mestre: 4,
});

/** Labels humanos para os níveis */
export const LEVEL_LABEL: Readonly<Record<ExperienceLevel, string>> = Object.freeze({
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  mestre: 'Mestre',
});

// ============================================================
// Branded IDs
// ============================================================

export type MentorId = string & { readonly __mentorId: unique symbol };
export type MenteeId = string & { readonly __menteeId: unique symbol };
export type PairingId = string & { readonly __pairingId: unique symbol };

// ============================================================
// Helpers — produção de IDs branded
// ============================================================

export function mentorId(value: string): MentorId {
  return value as MentorId;
}
export function menteeId(value: string): MenteeId {
  return value as MenteeId;
}
export function pairingId(value: string): PairingId {
  return value as PairingId;
}

// ============================================================
// Perfis
// ============================================================

/** Slot de disponibilidade — ISO 8601 (compatível com `new Date(...)`) */
export interface AvailabilitySlot {
  readonly startsAt: string;
  readonly endsAt: string;
}

/** Perfil de mentor */
export interface MentorProfile {
  readonly id: MentorId;
  readonly displayName: string;
  readonly handle: string;
  readonly tradição: Tradição;
  readonly studyAreas: ReadonlyArray<StudyArea>;
  readonly languages: ReadonlyArray<Language>;
  readonly level: ExperienceLevel;
  readonly bio: string;
  readonly availability: ReadonlyArray<AvailabilitySlot>;
  /** IANA timezone — ex: 'America/Sao_Paulo', 'Europe/Lisbon' */
  readonly timezone: string;
  /** Toggle — false esconde do pareamento mas mantém card visível */
  readonly acceptMentees: boolean;
}

/** Perfil de mentee */
export interface MenteeProfile {
  readonly id: MenteeId;
  readonly displayName: string;
  readonly handle: string;
  readonly tradiçãoEscolhida: Tradição;
  readonly interests: ReadonlyArray<StudyArea>;
  readonly level: ExperienceLevel;
  readonly languages: ReadonlyArray<Language>;
  /** IANA timezone */
  readonly timezone: string;
}

/** Status do pairing (independent do estado do evento) */
export type PairingStatus = 'pending' | 'accepted' | 'declined' | 'completed';

/** Resultado do pareamento (score + explicação) */
export interface PairingScore {
  readonly mentorId: MentorId;
  /** [0, 100] — saturado */
  readonly score: number;
  /** Explicação transparente: ["+30 tradição match", "+20 study overlap", ...] */
  readonly reason: ReadonlyArray<string>;
  /** Bandeira derivada — true se há match plausível (>= 50) */
  readonly isPlausible: boolean;
}

/** Pedido de pareamento (estado mutável) */
export interface PairingRequest {
  readonly id: PairingId;
  readonly menteeId: MenteeId;
  readonly mentorId: MentorId;
  readonly status: PairingStatus;
  /** Mensagem inicial do mentee */
  readonly message: string;
  /** LGPD consent — obrigatório no createPairingRequest */
  readonly lgpdConsent: boolean;
  /** ISO 8601 — quando foi criado */
  readonly createdAt: string;
  /** ISO 8601 — quando mudou de status (opcional) */
  readonly updatedAt?: string;
}

// ============================================================
// Filtros
// ============================================================

export interface MentorFilter {
  readonly tradição?: Tradição;
  readonly studyArea?: StudyArea;
  readonly language?: Language;
  readonly level?: ExperienceLevel;
  /** Quando true (default), exclui mentores com `acceptMentees === false` */
  readonly onlyAccepting?: boolean;
}

/** Adapter — backend agnóstico (memory | supabase | http) */
export interface MentorshipAdapter {
  listMentors(filter?: MentorFilter): Promise<ReadonlyArray<MentorProfile>>;
  getMentor(id: MentorId): Promise<MentorProfile | null>;
  listMentees(): Promise<ReadonlyArray<MenteeProfile>>;
  getMentee(id: MenteeId): Promise<MenteeProfile | null>;
  savePairingRequest(req: PairingRequest): Promise<void>;
  updatePairingRequest(req: PairingRequest): Promise<void>;
  listPairingRequests(filter?: {
    readonly menteeId?: MenteeId;
    readonly mentorId?: MentorId;
  }): Promise<ReadonlyArray<PairingRequest>>;
}

// ============================================================
// Engine API
// ============================================================

export interface CreatePairingResult {
  readonly kind:
    | 'success'
    | 'lgpd_missing'
    | 'mentor_not_found'
    | 'mentee_not_found'
    | 'mentor_not_accepting'
    | 'duplicate'
    | 'message_required';
  readonly message: string;
  readonly pairing?: PairingRequest;
}

export interface TransitionResult {
  readonly ok: boolean;
  readonly message: string;
  readonly pairing?: PairingRequest;
}

export interface MentorshipEngine {
  listAvailableMentors(filter?: MentorFilter): Promise<ReadonlyArray<MentorProfile>>;
  getMentor(id: MentorId): Promise<MentorProfile | null>;
  findPairings(mentee: MenteeProfile, topN?: number): Promise<ReadonlyArray<PairingScore>>;
  createPairingRequest(args: {
    readonly menteeId: MenteeId;
    readonly mentorId: MentorId;
    readonly message: string;
    readonly lgpdConsent: boolean;
  }): Promise<CreatePairingResult>;
  acceptPairing(pairingId: PairingId): Promise<TransitionResult>;
  declinePairing(pairingId: PairingId): Promise<TransitionResult>;
  completePairing(pairingId: PairingId): Promise<TransitionResult>;
  listPairingRequests(filter?: {
    readonly menteeId?: MenteeId;
    readonly mentorId?: MentorId;
  }): Promise<ReadonlyArray<PairingRequest>>;
}

// ============================================================
// Pesos do scoring (constantes — versionadas)
// ============================================================

export const SCORE_WEIGHTS = Object.freeze({
  /** tradição match (mentor.tradição === mentee.tradiçãoEscolhida) */
  tradiçãoMatch: 30,
  /** cada study area em comum (cap em 5 matches) */
  studyAreaPerMatch: 10,
  /** quando mentor fala alguma língua do mentee */
  languageMatch: 15,
  /** timezone diff < 3h */
  timezoneClose: 10,
  /** mentor.level >= mentee.level (proteção do iniciante) */
  levelGuard: 5,
  /** penalidade se mentee.level > mentor.level (estoura) */
  levelOverflow: -10,
  /** penalidade por hora de diff > 3h */
  timezoneOverflowPerHour: -3,
});

/** Cap de matches de study area (evita score > 100 com só estudo) */
export const STUDY_AREA_MATCH_CAP = 5;

/** Limite para considerar um pairing plausible */
export const PLAUSIBLE_THRESHOLD = 50;

/** Duração máxima da mensagem inicial (proteção de spam/UI) */
export const MESSAGE_MAX_LEN = 1000;
export const MESSAGE_MIN_LEN = 10;
