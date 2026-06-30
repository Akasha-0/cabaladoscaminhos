/**
 * ════════════════════════════════════════════════════════════════════════════
 * W93-A — REPUTATION TYPES · BRANDED PRIMITIVES + DTOs
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 93 · 2026-06-30
 * Universalista — 5 tradições (Candomblé, Umbanda, Ifá, Astrologia, Cabala),
 * 5 eixos (acolhimento, conhecimento, presença, contribuição, escuta).
 * Multi-eixo, não single-score. Não-comparativo entre tradições.
 *
 * Princípios (GOAL.md):
 *   1. Multi-eixo, não single-score — a pessoa tem reputação em 5 eixos.
 *   2. Não-comparativo — tradição X não é "melhor" que Y. Cada eixo tem pesos
 *      diferentes POR TRADIÇÃO.
 *   3. LGPD by design — opt-in para ser avaliada, opt-out a qualquer momento,
 *      sem PII exposto, retention 90 dias máx.
 *   4. Universalista — funciona pra consulente E pra consulente-consulente
 *      (peer reputation, não só top-down).
 *
 * Termos sagrados preservados: orixás, axé, Iemanjá, Odu, Odus, entidades,
 * Cigano Ramiro, Akasha, pemba, Candomblé, Umbanda, Ifá.
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

/** Branded identifier — cada pessoa na plataforma tem um PersonId opaco. */
export type PersonId = string & { readonly __brand: 'PersonId' };

/** Branded identifier — cada atribuição (peer review) tem um AttributionId. */
export type AttributionId = string & { readonly __brand: 'AttributionId' };

/** 5 eixos universais da Cabala dos Caminhos. NÃO usar 'overall' (single-score proibido). */
export type ReputationAxis =
  | 'acolhimento'
  | 'conhecimento'
  | 'presenca'
  | 'contribuicao'
  | 'escuta';

/** 5 tradições oficialmente suportadas. NÃO comparar entre si. */
export type TraditionId =
  | 'Candomblé'
  | 'Umbanda'
  | 'Ifá'
  | 'Astrologia'
  | 'Cabala';

/** Tipo de relação no momento da atribuição — peer reputation universalista. */
export type AttributionContext =
  | 'consulta'        // consulente → consulente (cliente avisa o consulente)
  | 'peer'           // consulente ↔ consulente (pares se avaliando)
  | 'mentoria'       // mestre → aprendiz ou vice-versa
  | 'comunidade'     // interação na comunidade (post, comentário, chat)
  | 'estudo';        // grupo de estudo / mesa redonda

/** Direção da atribuição — quem fez a ação? */
export type AttributionDirection = 'received' | 'given';

/** Status LGPD — opt-in explícito é obrigatório para qualquer armazenamento. */
export type ConsentStatus = 'opted-in' | 'opted-out' | 'pending';

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS — 5 EIXOS, 5 TRADIÇÕES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Os 5 eixos universais. Multi-eixo é princípio — NUNCA reduzir para um único
 * número. Cada eixo é independente e armazenado separadamente.
 */
export const REPUTATION_AXES = [
  'acolhimento',
  'conhecimento',
  'presenca',
  'contribuicao',
  'escuta',
] as const satisfies readonly ReputationAxis[];

/** As 5 tradições oficialmente suportadas. Universalista. */
export const TRADITIONS = [
  'Candomblé',
  'Umbanda',
  'Ifá',
  'Astrologia',
  'Cabala',
] as const satisfies readonly TraditionId[];

/** Tipos de contexto onde a atribuição acontece. */
export const ATTRIBUTION_CONTEXTS = [
  'consulta',
  'peer',
  'mentoria',
  'comunidade',
  'estudo',
] as const satisfies readonly AttributionContext[];

// ════════════════════════════════════════════════════════════════════════════
// PESOS POR TRADIÇÃO × EIXO (não-comparativo!)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Pesos relativos POR TRADIÇÃO — cada tradição valoriza os 5 eixos de forma
 * diferente. Isso é a base não-comparativa: Candomblé não é "melhor" que
 * Astrologia, mas valora 'presenca' mais alto que Cabala valora.
 *
 * Pesos somam ~1.0 POR TRADIÇÃO (mas não precisam ser exatamente 1.0,
 * o engine normaliza no cálculo). Pesos são relativos DENTRO da tradição.
 *
 * Candomblé: axé (presença) + acolhimento muito altos, conhecimento mais baixo
 * Umbanda: acolhimento + escuta dominam, presença forte
 * Ifá: conhecimento (Odus) + escuta (cabalista) dominam, presença ritual
 * Astrologia: conhecimento + contribuição (papers/leituras) dominam
 * Cabala: conhecimento (Sefirot) + escuta (mestria) + presença
 *
 * IMPORTANTE: estes são pesos DENTRO de cada tradição, não entre tradições.
 */
export const TRADITION_AXIS_WEIGHTS = {
  Candomblé: {
    acolhimento: 0.20,
    conhecimento: 0.15,
    presenca: 0.30,
    contribuicao: 0.10,
    escuta: 0.25,
  },
  Umbanda: {
    acolhimento: 0.25,
    conhecimento: 0.10,
    presenca: 0.25,
    contribuicao: 0.10,
    escuta: 0.30,
  },
  Ifá: {
    acolhimento: 0.15,
    conhecimento: 0.35,
    presenca: 0.20,
    contribuicao: 0.10,
    escuta: 0.20,
  },
  Astrologia: {
    acolhimento: 0.10,
    conhecimento: 0.35,
    presenca: 0.15,
    contribuicao: 0.25,
    escuta: 0.15,
  },
  Cabala: {
    acolhimento: 0.10,
    conhecimento: 0.30,
    presenca: 0.20,
    contribuicao: 0.15,
    escuta: 0.25,
  },
} as const satisfies Record<TraditionId, Record<ReputationAxis, number>>;

// ════════════════════════════════════════════════════════════════════════════
// DECAY CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

/** Janela de retenção LGPD — 90 dias máx. Tudo além disso é descartado. */
export const LGPD_MAX_RETENTION_DAYS = 90 as const;

/**
 * Half-life (em dias) de uma atribuição. Atribuições perdem 50% do peso a
 * cada half-life. Isso evita que reputação fique "presa" — não é permanente.
 * 60 dias = ~3 atribuições por trimestre mantêm relevância; 5 anos zera.
 */
export const ATTRIBUTION_HALF_LIFE_DAYS = 60 as const;

/**
 * Decay floor — score nunca cai abaixo deste valor, mesmo após decay longo.
 * Preserva a história sem permitir "zero histórico".
 */
export const DECAY_FLOOR = 0.05 as const;

/** Janela de normalização para radar (UI). Scores normalizados para 0..100. */
export const RADAR_MAX_SCORE = 100 as const;

/** Score mínimo para ser exibido no radar (abaixo disso, oculto). */
export const RADAR_MIN_DISPLAY = 5 as const;

// ════════════════════════════════════════════════════════════════════════════
// SCORING RANGE
// ════════════════════════════════════════════════════════════════════════════

/** Score range por atribuição: 1 (muito negativo) → 5 (muito positivo). */
export const ATTRIBUTION_SCORE_MIN = 1 as const;
export const ATTRIBUTION_SCORE_MAX = 5 as const;

/** Score neutro — atribuições sem opinião clara. */
export const ATTRIBUTION_SCORE_NEUTRAL = 3 as const;

// ════════════════════════════════════════════════════════════════════════════
// DTOs
// ════════════════════════════════════════════════════════════════════════════

/** Atribuição crua — uma pessoa avalia outra em UM eixo. */
export interface Attribution {
  readonly id: AttributionId;
  readonly fromPersonId: PersonId;
  readonly toPersonId: PersonId;
  readonly axis: ReputationAxis;
  readonly score: 1 | 2 | 3 | 4 | 5;
  readonly tradition: TraditionId;
  readonly context: AttributionContext;
  readonly createdAt: number; // epoch ms
  readonly note?: string;
  readonly consentGiven: boolean; // LGPD: opt-in explícito
}

/** Atribuição segura (LGPD) — `fromPersonId` é stripado na saída pública. */
export type PublicAttribution = Omit<Attribution, 'fromPersonId' | 'note'>;

/** Score computado por eixo para uma pessoa. NÃO é média simples — é decay-weighted. */
export interface AxisScore {
  readonly axis: ReputationAxis;
  readonly rawScore: number;        // 0..100, decay-weighted
  readonly count: number;           // número de atribuições válidas (LGPD-compliant)
  readonly lastAttributionAt: number; // epoch ms, 0 se nunca
  readonly trend: 'rising' | 'stable' | 'falling' | 'new';
}

/** Score por tradição × eixo — não-comparativo entre tradições. */
export interface TraditionAxisScore {
  readonly tradition: TraditionId;
  readonly axis: ReputationAxis;
  readonly score: number;       // 0..100
  readonly weight: number;      // 0..1 (peso desta tradição para esta pessoa)
}

/** Snapshot da reputação de uma pessoa — SEM PII. */
export interface ReputationSnapshot {
  readonly personId: PersonId;
  readonly axes: ReadonlyArray<AxisScore>;                         // 5 eixos
  readonly byTradition: ReadonlyArray<TraditionAxisScore>;         // 5 × 5 = 25 cells
  readonly contextBreakdown: Readonly<Record<AttributionContext, number>>;
  readonly totalAttributions: number;                              // número puro (sem PII)
  readonly computedAt: number;
  readonly consentStatus: ConsentStatus;                            // LGPD
  readonly retentionDays: number;                                   // dias desde 1ª atribuição
}

/** Evento de mudança de consentimento LGPD. */
export interface ConsentEvent {
  readonly personId: PersonId;
  readonly status: ConsentStatus;
  readonly at: number;
  readonly reason?: 'user-opt-in' | 'user-opt-out' | 'auto-purge';
}

// ════════════════════════════════════════════════════════════════════════════
// INPUT TYPES
// ════════════════════════════════════════════════════════════════════════════

/** Input para criar uma atribuição. */
export interface CreateAttributionInput {
  readonly fromPersonId: PersonId;
  readonly toPersonId: PersonId;
  readonly axis: ReputationAxis;
  readonly score: 1 | 2 | 3 | 4 | 5;
  readonly tradition: TraditionId;
  readonly context: AttributionContext;
  readonly consentGiven: boolean;
  readonly note?: string;
}

/** Input para query de snapshot. */
export interface GetSnapshotInput {
  readonly personId: PersonId;
  readonly asOf?: number; // epoch ms (default: now)
}

/** Input para opt-in/opt-out. */
export interface ConsentInput {
  readonly personId: PersonId;
  readonly status: Exclude<ConsentStatus, 'pending'>;
  readonly reason?: string;
}

// ════════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ════════════════════════════════════════════════════════════════════════════

export function isReputationAxis(v: unknown): v is ReputationAxis {
  return typeof v === 'string' && (REPUTATION_AXES as readonly string[]).includes(v);
}

export function isTraditionId(v: unknown): v is TraditionId {
  return typeof v === 'string' && (TRADITIONS as readonly string[]).includes(v);
}

export function isAttributionContext(v: unknown): v is AttributionContext {
  return (
    typeof v === 'string' && (ATTRIBUTION_CONTEXTS as readonly string[]).includes(v)
  );
}

export function isValidScore(v: unknown): v is 1 | 2 | 3 | 4 | 5 {
  return (
    v === 1 || v === 2 || v === 3 || v === 4 || v === 5
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BRAND HELPERS
// ════════════════════════════════════════════════════════════════════════════

export function asPersonId(s: string): PersonId {
  if (!s || typeof s !== 'string') throw new Error('PersonId must be non-empty string');
  return s as PersonId;
}

export function asAttributionId(s: string): AttributionId {
  if (!s || typeof s !== 'string') throw new Error('AttributionId must be non-empty string');
  return s as AttributionId;
}