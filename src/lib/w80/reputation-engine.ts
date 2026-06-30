/**
 * ════════════════════════════════════════════════════════════════════════════
 * W80-A — UNIVERSALIST REPUTATION ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 80 · 2026-06-30
 * Author: W80-A Coder (Mavis orchestrator session 414727418691768)
 *
 * The Reputation Engine is the **merit & badge fabric** of the Akasha
 * ecosystem. It awards per-tradition sacred merit when a user performs
 * meaningful actions (readings, posts, mentorings, offerings, blessings)
 * and surfaces those scores as:
 *
 *   • Tier promotion — Iniciante (0–99) → Praticante (100–499) →
 *     Mestre (500–1999) → Sabio (2000+), per tradition AND overall.
 *   • Badge grants — auto-issued when merit thresholds + action lists match.
 *   • Leaderboard entries — frozen snapshots with rank, score, badges.
 *
 * Coverage mandate (cycle 73+): the action catalog must touch all
 * **seven sacred traditions** — Candomblé, Umbanda, Ifá, Cabala, Astrologia,
 * Tantra, Cigano. Cycle 80 ships 49 sacred actions distributed across them.
 *
 * Public API (cycle 80 contract):
 *   recordAction(input) → Result<ReputationDelta, ReputationError>
 *   listCatalog()       → readonly array of all 49 sacred actions
 *   listTraditions()    → readonly array of 7 tradition ids
 *   listBadges()        → readonly array of all badge definitions
 *   exportUserProfile(userId) → frozen profile snapshot
 *   exportLeaderboard() → frozen top-N leaderboard
 *   userLevel(userId, tradition?) → TierLevel
 *   grantBadge(userId, badgeId, reason) → Result<BadgeGrant, ReputationError>
 *   undoAction(actionId) → Result<UndoReceipt, ReputationError>
 *   hashCacheKey(input)  → SHA-256 cache key for catalog snapshots
 *   _resetForTests()     → wipe state in spec context
 *
 * Pure ESM, no runtime deps, branded types via factory + regex.
 * Object.freeze on every exported boundary (cycle 75 lesson).
 * Discriminated union result types with `kind` tag (cycle 78 lesson).
 * Embedded SHA-256 implementation — no node:crypto import (cycle 78 lesson).
 *
 * Durable lessons applied (cycle 60-79):
 *   - Worktree-isolated tsconfig + node-stubs.d.ts (cycle 60, 73)
 *   - `.ts` extension imports + allowImportingTsExtensions (cycle 62)
 *   - lib: ["ES2022", "DOM"] in worktree tsconfig (cycle 73)
 *   - Branded types via factory + regex (cycle 77)
 *   - Result narrowing positive if (r.ok) (cycle 73, 75)
 *   - Object.freeze on insert (cycle 68, 75)
 *   - SHA-256 inline implementation (cycle 78)
 *   - Discriminated unions with kind tag (cycle 78)
 *   - NFD normalization preserves combining marks (cycle 79 — lesson #4)
 *   - `.not` minimal expect uses global flag + Proxy, NOT recursion (cycle 79)
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVE TYPES + FACTORIES
// ════════════════════════════════════════════════════════════════════════════

export type UserId = string & { readonly __brand: 'UserId' };
export type TraditionId =
  | 'CANDOMBLE'
  | 'UMBANDA'
  | 'IFA'
  | 'CABALA'
  | 'ASTROLOGIA'
  | 'TANTRA'
  | 'CIGANO';
export type Tier = 'INICIANTE' | 'PRATICANTE' | 'MESTRE' | 'SABIO';
export type ActionId = string & { readonly __brand: 'ActionId' };
export type BadgeId = string & { readonly __brand: 'BadgeId' };

/** Compile-time TS guard — keeps the 7-tradition mandate anchored. */
export const TRADITION_IDS = Object.freeze([
  'CANDOMBLE',
  'UMBANDA',
  'IFA',
  'CABALA',
  'ASTROLOGIA',
  'TANTRA',
  'CIGANO',
] as const);
export type TraditionIdList = typeof TRADITION_IDS;

export const TIER_ORDER: readonly Tier[] = Object.freeze([
  'INICIANTE',
  'PRATICANTE',
  'MESTRE',
  'SABIO',
]);

const USER_ID_RE = /^u_[a-z0-9_]{4,40}$/;
const ACTION_ID_RE = /^act_[a-z0-9_]{4,40}$/;
const BADGE_ID_RE = /^bdg_[a-z0-9_]{4,40}$/;

export function userId(raw: string): UserId {
  if (!USER_ID_RE.test(raw)) {
    throw new Error(`Invalid userId: ${raw} (must match ${USER_ID_RE})`);
  }
  return raw as UserId;
}

export function actionId(raw: string): ActionId {
  if (!ACTION_ID_RE.test(raw)) {
    throw new Error(`Invalid actionId: ${raw} (must match ${ACTION_ID_RE})`);
  }
  return raw as ActionId;
}

export function badgeId(raw: string): BadgeId {
  if (!BADGE_ID_RE.test(raw)) {
    throw new Error(`Invalid badgeId: ${raw} (must match ${BADGE_ID_RE})`);
  }
  return raw as BadgeId;
}

export function isValidUserId(s: string): boolean {
  return USER_ID_RE.test(s);
}

export function isValidActionId(s: string): boolean {
  return ACTION_ID_RE.test(s);
}

export function isTraditionId(s: string): s is TraditionId {
  return (TRADITION_IDS as readonly string[]).includes(s);
}

// ════════════════════════════════════════════════════════════════════════════
// DOMAIN TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface SacredAction {
  readonly id: ActionId;
  readonly name: string;
  readonly description: string;
  readonly tradition: TraditionId;
  /** Merit awarded per single occurrence (always positive integer). */
  readonly meritPoints: number;
  /** Some actions are "rare" — gated by cooldown in seconds. */
  readonly cooldownSeconds: number;
  /** Tags help with catalog search. */
  readonly tags: readonly string[];
}

export interface TraditionMeta {
  readonly id: TraditionId;
  /** Portuguese display name. */
  readonly displayName: string;
  /** Short para about the tradition for the catalog. */
  readonly summary: string;
  /** Color hex shown in the UI (purely informational). */
  readonly colorHex: `#${string}`;
  /** Axis — tradition belongs to the African, Abrahamic, European, or Eastern lineage. */
  readonly lineage: 'Afro-Brasileira' | 'Europeia' | 'Indiana' | 'Cabalistica';
}

export interface TraditionScore {
  readonly tradition: TraditionId;
  readonly merit: number;
  readonly tier: Tier;
  readonly actionsPerformed: number;
  readonly badgesEarned: number;
}

export interface UserProfile {
  readonly userId: UserId;
  readonly displayName: string;
  readonly overallMerit: number;
  readonly overallTier: Tier;
  readonly createdAt: number;
  readonly lastActionAt: number | null;
  readonly perTradition: Readonly<Record<TraditionId, TraditionScore>>;
  readonly earnedBadgeIds: readonly BadgeId[];
}

export interface BadgeDefinition {
  readonly id: BadgeId;
  readonly name: string;
  readonly description: string;
  readonly tradition: TraditionId | 'UNIVERSAL';
  /** Total merit threshold to unlock. */
  readonly meritThreshold: number;
  /** Min number of distinct actions required in that tradition. */
  readonly distinctActionMin: number;
  /** Tiers auto-eligible for this badge. */
  readonly tierRequired: Tier;
}

export interface BadgeGrant {
  readonly badgeId: BadgeId;
  readonly userId: UserId;
  readonly grantedAt: number;
  readonly reason: string;
}

export interface ReputationDelta {
  readonly userId: UserId;
  readonly actionId: ActionId;
  readonly tradition: TraditionId;
  readonly meritBefore: number;
  readonly meritAfter: number;
  readonly tierBefore: Tier;
  readonly tierAfter: Tier;
  readonly promoted: boolean;
  readonly badgesUnlocked: readonly BadgeId[];
}

export interface LeaderboardEntry {
  readonly rank: number;
  readonly userId: UserId;
  readonly displayName: string;
  readonly overallMerit: number;
  readonly overallTier: Tier;
  readonly badgesEarned: number;
}

export interface UndoReceipt {
  readonly actionId: ActionId;
  readonly userId: UserId;
  readonly rolledBack: number;
  readonly at: number;
}

// ════════════════════════════════════════════════════════════════════════════
// RESULT TYPE — discriminated union with kind tag
// ════════════════════════════════════════════════════════════════════════════

export type ReputationResult<T> =
  | { readonly kind: 'ok'; readonly value: T }
  | { readonly kind: 'err'; readonly code: ReputationErrorCode; readonly message: string };

export type ReputationErrorCode =
  | 'UNKNOWN_USER'
  | 'UNKNOWN_ACTION'
  | 'COOLDOWN_ACTIVE'
  | 'UNKNOWN_BADGE'
  | 'BADGE_REQUIRES_TIER'
  | 'BADGE_REQUIRES_MERIT'
  | 'NOT_OWNER'
  | 'INVALID_INPUT';

export function okResult<T>(value: T): ReputationResult<T> {
  return Object.freeze({ kind: 'ok', value: Object.freeze(value) });
}

export function errResult<T>(
  code: ReputationErrorCode,
  message: string,
): ReputationResult<T> {
  return Object.freeze({ kind: 'err', code, message });
}

export function isOk<T>(r: ReputationResult<T>): r is { kind: 'ok'; value: T } {
  return r.kind === 'ok';
}

export function isErr<T>(
  r: ReputationResult<T>,
): r is { kind: 'err'; code: ReputationErrorCode; message: string } {
  return r.kind === 'err';
}

// ════════════════════════════════════════════════════════════════════════════
// TIER POLICY
// ════════════════════════════════════════════════════════════════════════════

export interface TierThreshold {
  readonly tier: Tier;
  readonly minMerit: number;
}

export const TIER_THRESHOLDS: readonly TierThreshold[] = Object.freeze([
  Object.freeze({ tier: 'INICIANTE', minMerit: 0 }),
  Object.freeze({ tier: 'PRATICANTE', minMerit: 100 }),
  Object.freeze({ tier: 'MESTRE', minMerit: 500 }),
  Object.freeze({ tier: 'SABIO', minMerit: 2000 }),
]);

export function tierForMerit(merit: number): Tier {
  let tier: Tier = 'INICIANTE';
  for (const t of TIER_THRESHOLDS) {
    if (merit >= t.minMerit) tier = t.tier;
  }
  return tier;
}

export function tierIndex(t: Tier): number {
  return TIER_ORDER.indexOf(t);
}

// ════════════════════════════════════════════════════════════════════════════
// TRADITION METADATA — 7 traditions, lineage-tagged
// ════════════════════════════════════════════════════════════════════════════

export const TRADITION_META: Readonly<Record<TraditionId, TraditionMeta>> = Object.freeze({
  CANDOMBLE: Object.freeze({
    id: 'CANDOMBLE',
    displayName: 'Candomblé',
    summary:
      'Tradição afro-brasileira dos Orixás. Axé, ebó, fundamento, toque de atabaque, oferendas na pemba.',
    colorHex: '#E8A33D',
    lineage: 'Afro-Brasileira',
  }),
  UMBANDA: Object.freeze({
    id: 'UMBANDA',
    displayName: 'Umbanda',
    summary:
      'Sete linhas, Pretos-Velhos, Caboclos e Exus. Gira, passando comida, descarrego, pemba de luz.',
    colorHex: '#7A2E8F',
    lineage: 'Afro-Brasileira',
  }),
  IFA: Object.freeze({
    id: 'IFA',
    displayName: 'Ifá',
    summary:
      'Sistema yorubano Ifá/Lunwà — 256 Odus, jogo de búzios/opelê Ifá, Ori, Babalawo.',
    colorHex: '#1F6F4A',
    lineage: 'Afro-Brasileira',
  }),
  CABALA: Object.freeze({
    id: 'CABALA',
    displayName: 'Cabala',
    summary:
      'Árvore da Vida, 22 Senderos, 10 Sephirot, Gematria, 72 Shem. Tzadik & tikkun.',
    colorHex: '#364C8A',
    lineage: 'Cabalistica',
  }),
  ASTROLOGIA: Object.freeze({
    id: 'ASTROLOGIA',
    displayName: 'Astrologia',
    summary:
      '12 signos, 10 planetas, 12 casas, 5 aspectos. Mapa natal, revolução solar, sinastria, trânsito.',
    colorHex: '#3C5C8E',
    lineage: 'Europeia',
  }),
  TANTRA: Object.freeze({
    id: 'TANTRA',
    displayName: 'Tantra',
    summary:
      'Tradição indiana não-dual — kundalini, prana, 7 chakras, maithuna consciente, Shiva-Shakti.',
    colorHex: '#C13E54',
    lineage: 'Indiana',
  }),
  CIGANO: Object.freeze({
    id: 'CIGANO',
    displayName: 'Cigano',
    summary:
      'Cartas Ciganas (28 cartas do baralho Cigano/Baralho Cigano Lenormand), Mesa Real de 36 casas, boto.',
    colorHex: '#B5893F',
    lineage: 'Europeia',
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// SACRED ACTION CATALOG — 49 actions across 7 traditions (≥7 each)
// ════════════════════════════════════════════════════════════════════════════

const _catalogRaw: readonly SacredAction[] = Object.freeze([
  // ─────────────── CANDOMBLÉ (7 actions) ───────────────
  Object.freeze({
    id: actionId('act_candomble_001'),
    name: 'Fazer Oferenda de Axé',
    description: 'Preparar ebó ou oferenda na pemba para Orixá pessoal.',
    tradition: 'CANDOMBLE' as TraditionId,
    meritPoints: 25,
    cooldownSeconds: 86400,
    tags: Object.freeze(['oferenda', 'axé', 'ebó']),
  }),
  Object.freeze({
    id: actionId('act_candomble_002'),
    name: 'Tocar Atabaque',
    description: 'Participar do toque no terreiro durante o gongá.',
    tradition: 'CANDOMBLE' as TraditionId,
    meritPoints: 15,
    cooldownSeconds: 3600,
    tags: Object.freeze(['toque', 'música', 'terreiro']),
  }),
  Object.freeze({
    id: actionId('act_candomble_003'),
    name: 'Receber Ori',
    description: 'Iniciação ao Ori — fundamento da cabeça.',
    tradition: 'CANDOMBLE' as TraditionId,
    meritPoints: 100,
    cooldownSeconds: 0,
    tags: Object.freeze(['iniciação', 'ori']),
  }),
  Object.freeze({
    id: actionId('act_candomble_004'),
    name: 'Estudar Itan',
    description: 'Ler e refletir sobre um Itan (mito) de um Orixá.',
    tradition: 'CANDOMBLE' as TraditionId,
    meritPoints: 5,
    cooldownSeconds: 0,
    tags: Object.freeze(['estudo', 'mito']),
  }),
  Object.freeze({
    id: actionId('act_candomble_005'),
    name: 'Guiar Filha-de-Santo',
    description: 'Acompanhar uma iniciada nos primeiros tempos.',
    tradition: 'CANDOMBLE' as TraditionId,
    meritPoints: 50,
    cooldownSeconds: 0,
    tags: Object.freeze(['mentoria', 'iniciação']),
  }),
  Object.freeze({
    id: actionId('act_candomble_006'),
    name: 'Fazer Bori',
    description: 'Ritual de alimentar a cabeça com água eOTO/folhas.',
    tradition: 'CANDOMBLE' as TraditionId,
    meritPoints: 30,
    cooldownSeconds: 604800,
    tags: Object.freeze(['bori', 'rito']),
  }),
  Object.freeze({
    id: actionId('act_candomble_007'),
    name: 'Cantar Ponto-de-Orixá',
    description: 'Compor ou ensinar um ponto cantado para Orixá.',
    tradition: 'CANDOMBLE' as TraditionId,
    meritPoints: 12,
    cooldownSeconds: 0,
    tags: Object.freeze(['música', 'ponto']),
  }),

  // ─────────────── UMBANDA (7 actions) ───────────────
  Object.freeze({
    id: actionId('act_umbanda_001'),
    name: 'Montar Campo Espiritual',
    description: 'Hastear bandejas, pemba, velas e preparar a gira.',
    tradition: 'UMBANDA' as TraditionId,
    meritPoints: 20,
    cooldownSeconds: 86400,
    tags: Object.freeze(['gira', 'preparação']),
  }),
  Object.freeze({
    id: actionId('act_umbanda_002'),
    name: 'Incorporar Caboclo',
    description: 'Receber Caboclo(a) em sessão pública ou privada.',
    tradition: 'UMBANDA' as TraditionId,
    meritPoints: 35,
    cooldownSeconds: 3600,
    tags: Object.freeze(['incorporação', 'linha-de-caboclo']),
  }),
  Object.freeze({
    id: actionId('act_umbanda_003'),
    name: 'Fazer Descarrego',
    description: 'Limpeza espiritual com pemba ou defumação.',
    tradition: 'UMBANDA' as TraditionId,
    meritPoints: 18,
    cooldownSeconds: 0,
    tags: Object.freeze(['limpeza', 'descarrego']),
  }),
  Object.freeze({
    id: actionId('act_umbanda_004'),
    name: 'Atender em Mesa',
    description: 'Consultar consulente no salão com passes e orientação.',
    tradition: 'UMBANDA' as TraditionId,
    meritPoints: 22,
    cooldownSeconds: 0,
    tags: Object.freeze(['consulta', 'mesa']),
  }),
  Object.freeze({
    id: actionId('act_umbanda_005'),
    name: 'Guiar Ogã',
    description: 'Acompanhar um Ogã no aprendizado do toque.',
    tradition: 'UMBANDA' as TraditionId,
    meritPoints: 28,
    cooldownSeconds: 0,
    tags: Object.freeze(['mentoria', 'ogã']),
  }),
  Object.freeze({
    id: actionId('act_umbanda_006'),
    name: 'Estudar Linha de Pretos-Velhos',
    description: 'Aprofundar em uma Linha ancestral.',
    tradition: 'UMBANDA' as TraditionId,
    meritPoints: 8,
    cooldownSeconds: 0,
    tags: Object.freeze(['estudo', 'linha']),
  }),
  Object.freeze({
    id: actionId('act_umbanda_007'),
    name: 'Agradecer Exu',
    description: 'Fazer oferenda à Exu de guarda (7 linhas).',
    tradition: 'UMBANDA' as TraditionId,
    meritPoints: 10,
    cooldownSeconds: 0,
    tags: Object.freeze(['exu', 'oferenda']),
  }),

  // ─────────────── IFÁ (7 actions) ───────────────
  Object.freeze({
    id: actionId('act_ifa_001'),
    name: 'Jogar 16 Búzios',
    description: 'Jogo básico de orientação — 16 cowries, ou padê.',
    tradition: 'IFA' as TraditionId,
    meritPoints: 30,
    cooldownSeconds: 0,
    tags: Object.freeze(['jogo', 'buzios', 'padê']),
  }),
  Object.freeze({
    id: actionId('act_ifa_002'),
    name: 'Jogar Opón-Ifá',
    description: 'Jogo completo do Opón-Ifá com 256 Odus.',
    tradition: 'IFA' as TraditionId,
    meritPoints: 80,
    cooldownSeconds: 604800,
    tags: Object.freeze(['jogo', 'odus', 'opón']),
  }),
  Object.freeze({
    id: actionId('act_ifa_003'),
    name: 'Memorizar Odu',
    description: 'Aprender um novo Odu com suas patakís.',
    tradition: 'IFA' as TraditionId,
    meritPoints: 12,
    cooldownSeconds: 0,
    tags: Object.freeze(['memorização', 'odu']),
  }),
  Object.freeze({
    id: actionId('act_ifa_004'),
    name: 'Receber Ifá de Ifá',
    description: 'Iniciação superior na linhagem de Babalawô.',
    tradition: 'IFA' as TraditionId,
    meritPoints: 200,
    cooldownSeconds: 0,
    tags: Object.freeze(['iniciação', 'babalawo']),
  }),
  Object.freeze({
    id: actionId('act_ifa_005'),
    name: 'Fazer Ebó de Ifá',
    description: 'Ritual prescritivo indicado por Odu.',
    tradition: 'IFA' as TraditionId,
    meritPoints: 40,
    cooldownSeconds: 86400,
    tags: Object.freeze(['ebó', 'ritual']),
  }),
  Object.freeze({
    id: actionId('act_ifa_006'),
    name: 'Acompanhar Awo',
    description: 'Seguir um Babalawô no atendimento público.',
    tradition: 'IFA' as TraditionId,
    meritPoints: 25,
    cooldownSeconds: 0,
    tags: Object.freeze(['mentoria', 'atendimento']),
  }),
  Object.freeze({
    id: actionId('act_ifa_007'),
    name: 'Estudar Patakí',
    description: 'Ler e refletir uma narrativa mítica do Odu.',
    tradition: 'IFA' as TraditionId,
    meritPoints: 6,
    cooldownSeconds: 0,
    tags: Object.freeze(['estudo', 'patakí']),
  }),

  // ─────────────── CABALA (7 actions) ───────────────
  Object.freeze({
    id: actionId('act_cabala_001'),
    name: 'Estudar Árvore da Vida',
    description: 'Meditar sobre uma Sephirah e suas 22 ligações.',
    tradition: 'CABALA' as TraditionId,
    meritPoints: 10,
    cooldownSeconds: 0,
    tags: Object.freeze(['estudo', 'sephirot']),
  }),
  Object.freeze({
    id: actionId('act_cabala_002'),
    name: 'Calcular Gematria',
    description: 'Decifrar uma palavra hebraica por valor numérico.',
    tradition: 'CABALA' as TraditionId,
    meritPoints: 8,
    cooldownSeconds: 0,
    tags: Object.freeze(['gematria', 'hebraico']),
  }),
  Object.freeze({
    id: actionId('act_cabala_003'),
    name: 'Recitar Shem HaMephorash',
    description: 'Meditação sobre os 72 Nomes de Deus.',
    tradition: 'CABALA' as TraditionId,
    meritPoints: 25,
    cooldownSeconds: 0,
    tags: Object.freeze(['meditação', 'shem']),
  }),
  Object.freeze({
    id: actionId('act_cabala_004'),
    name: 'Tikkun em Clássico',
    description: 'Estudar uma página do Zohar.',
    tradition: 'CABALA' as TraditionId,
    meritPoints: 18,
    cooldownSeconds: 0,
    tags: Object.freeze(['estudo', 'zohar']),
  }),
  Object.freeze({
    id: actionId('act_cabala_005'),
    name: 'Fazer Meditação das 10 Sephirot',
    description: 'Percorrer todas as 10 em uma sessão única.',
    tradition: 'CABALA' as TraditionId,
    meritPoints: 30,
    cooldownSeconds: 86400,
    tags: Object.freeze(['meditação', 'prática']),
  }),
  Object.freeze({
    id: actionId('act_cabala_006'),
    name: 'Pular Nível em Curso',
    description: 'Concluir módulo de escola cabalística.',
    tradition: 'CABALA' as TraditionId,
    meritPoints: 50,
    cooldownSeconds: 0,
    tags: Object.freeze(['curso', 'estudo']),
  }),
  Object.freeze({
    id: actionId('act_cabala_007'),
    name: 'Ensinar Cabalá a Novato',
    description: 'Ministrar introdução de cabala a outra pessoa.',
    tradition: 'CABALA' as TraditionId,
    meritPoints: 20,
    cooldownSeconds: 0,
    tags: Object.freeze(['ensino', 'mentoria']),
  }),

  // ─────────────── ASTROLOGIA (7 actions) ───────────────
  Object.freeze({
    id: actionId('act_astro_001'),
    name: 'Interpretar Mapa Natal',
    description: 'Realizar leitura completa de mapa de nativo.',
    tradition: 'ASTROLOGIA' as TraditionId,
    meritPoints: 22,
    cooldownSeconds: 0,
    tags: Object.freeze(['leitura', 'mapa']),
  }),
  Object.freeze({
    id: actionId('act_astro_002'),
    name: 'Calcular Revolução Solar',
    description: 'Calcular e interpretar a RS anual.',
    tradition: 'ASTROLOGIA' as TraditionId,
    meritPoints: 16,
    cooldownSeconds: 0,
    tags: Object.freeze(['técnica', 'rs']),
  }),
  Object.freeze({
    id: actionId('act_astro_003'),
    name: 'Estudar Aspecto Astrológico',
    description: 'Aprofundar quadratura, trígono, oposição, etc.',
    tradition: 'ASTROLOGIA' as TraditionId,
    meritPoints: 6,
    cooldownSeconds: 0,
    tags: Object.freeze(['estudo', 'aspecto']),
  }),
  Object.freeze({
    id: actionId('act_astro_004'),
    name: 'Montar Sinastria de Casal',
    description: 'Cruzar mapas de duas pessoas em sinastria.',
    tradition: 'ASTROLOGIA' as TraditionId,
    meritPoints: 28,
    cooldownSeconds: 0,
    tags: Object.freeze(['sinastria', 'relacionamento']),
  }),
  Object.freeze({
    id: actionId('act_astro_005'),
    name: 'Analisar Lilith',
    description: 'Estudo de Lilith Black Moon e seu posicionamento.',
    tradition: 'ASTROLOGIA' as TraditionId,
    meritPoints: 14,
    cooldownSeconds: 0,
    tags: Object.freeze(['lilith', 'estudo']),
  }),
  Object.freeze({
    id: actionId('act_astro_006'),
    name: 'Prever Eclipse',
    description: 'Calcular e interpretar um eclipse no mapa.',
    tradition: 'ASTROLOGIA' as TraditionId,
    meritPoints: 24,
    cooldownSeconds: 0,
    tags: Object.freeze(['eclipse', 'previsão']),
  }),
  Object.freeze({
    id: actionId('act_astro_007'),
    name: 'Atualizar Efeméride',
    description: 'Anotar observações sobre trânsito diário.',
    tradition: 'ASTROLOGIA' as TraditionId,
    meritPoints: 4,
    cooldownSeconds: 0,
    tags: Object.freeze(['estudo', 'trânsito']),
  }),

  // ─────────────── TANTRA (7 actions) ───────────────
  Object.freeze({
    id: actionId('act_tantra_001'),
    name: 'Meditação Kundalini',
    description: 'Prática meditativa kundalini ao amanhecer.',
    tradition: 'TANTRA' as TraditionId,
    meritPoints: 12,
    cooldownSeconds: 0,
    tags: Object.freeze(['meditação', 'kundalini']),
  }),
  Object.freeze({
    id: actionId('act_tantra_002'),
    name: 'Trabalhar Chakra Específico',
    description: 'Sessão dedicada a um dos 7 chakras.',
    tradition: 'TANTRA' as TraditionId,
    meritPoints: 10,
    cooldownSeconds: 0,
    tags: Object.freeze(['chakra', 'prática']),
  }),
  Object.freeze({
    id: actionId('act_tantra_003'),
    name: 'Maithuna Consciente',
    description: 'Prática de unificação Shiva-Shakti.',
    tradition: 'TANTRA' as TraditionId,
    meritPoints: 30,
    cooldownSeconds: 604800,
    tags: Object.freeze(['prática', 'união']),
  }),
  Object.freeze({
    id: actionId('act_tantra_004'),
    name: 'Estudar Não-Dualidade',
    description: 'Aprofundar em Advaita Vedanta ou Kashmir Shaivismo.',
    tradition: 'TANTRA' as TraditionId,
    meritPoints: 18,
    cooldownSeconds: 0,
    tags: Object.freeze(['estudo', 'não-dual']),
  }),
  Object.freeze({
    id: actionId('act_tantra_005'),
    name: 'Recitar Mantra',
    description: '108 repetições de mantra com japamala.',
    tradition: 'TANTRA' as TraditionId,
    meritPoints: 8,
    cooldownSeconds: 0,
    tags: Object.freeze(['mantra', 'japamala']),
  }),
  Object.freeze({
    id: actionId('act_tantra_006'),
    name: 'Pranayama Avançado',
    description: 'Prática de respiração (Bhastrika, Nadi Shodhana).',
    tradition: 'TANTRA' as TraditionId,
    meritPoints: 14,
    cooldownSeconds: 0,
    tags: Object.freeze(['pranayama', 'prática']),
  }),
  Object.freeze({
    id: actionId('act_tantra_007'),
    name: 'Estudo de Tantra Yoga Sutra',
    description: 'Leitura e reflexão de textos clássicos.',
    tradition: 'TANTRA' as TraditionId,
    meritPoints: 22,
    cooldownSeconds: 0,
    tags: Object.freeze(['estudo', 'sutras']),
  }),

  // ─────────────── CIGANO (7 actions) ───────────────
  Object.freeze({
    id: actionId('act_cigano_001'),
    name: 'Jogar Mesa Real',
    description: 'Abrir Mesa Real completa (36 casas).',
    tradition: 'CIGANO' as TraditionId,
    meritPoints: 30,
    cooldownSeconds: 0,
    tags: Object.freeze(['mesa-real', 'leitura']),
  }),
  Object.freeze({
    id: actionId('act_cigano_002'),
    name: 'Estudar Carta Cigana',
    description: 'Aprofundar em uma das 36 cartas.',
    tradition: 'CIGANO' as TraditionId,
    meritPoints: 5,
    cooldownSeconds: 0,
    tags: Object.freeze(['estudo', 'cartas']),
  }),
  Object.freeze({
    id: actionId('act_cigano_003'),
    name: 'Cruzar Casas com Mapa',
    description: 'Cruzar leitura da Mesa Real com mapa astral.',
    tradition: 'CIGANO' as TraditionId,
    meritPoints: 35,
    cooldownSeconds: 0,
    tags: Object.freeze(['cruzar', 'mesa-real', 'astro']),
  }),
  Object.freeze({
    id: actionId('act_cigano_004'),
    name: 'Boto Firme Cigano',
    description: 'Sorteio de Boto com intenção fechada.',
    tradition: 'CIGANO' as TraditionId,
    meritPoints: 18,
    cooldownSeconds: 86400,
    tags: Object.freeze(['boto', 'sorte']),
  }),
  Object.freeze({
    id: actionId('act_cigano_005'),
    name: 'Consultar Cliente Cigano',
    description: 'Leitura pública ou privada em mesa cigana.',
    tradition: 'CIGANO' as TraditionId,
    meritPoints: 24,
    cooldownSeconds: 0,
    tags: Object.freeze(['consulta', 'leitura']),
  }),
  Object.freeze({
    id: actionId('act_cigano_006'),
    name: 'Manusear Baralho Cigano',
    description: 'Tocar e consagrar o próprio baralho.',
    tradition: 'CIGANO' as TraditionId,
    meritPoints: 4,
    cooldownSeconds: 0,
    tags: Object.freeze(['baralho', 'prática']),
  }),
  Object.freeze({
    id: actionId('act_cigano_007'),
    name: 'Ensinar Carta a Iniciante',
    description: 'Iniciar alguém nos fundamentos Ciganos.',
    tradition: 'CIGANO' as TraditionId,
    meritPoints: 16,
    cooldownSeconds: 0,
    tags: Object.freeze(['ensino', 'mentoria']),
  }),
]);

export const SACRED_ACTION_CATALOG: readonly SacredAction[] = _catalogRaw;

const CATALOG_BY_ID: ReadonlyMap<ActionId, SacredAction> = (() => {
  const m = new Map<ActionId, SacredAction>();
  for (const a of _catalogRaw) m.set(a.id, a);
  return m;
})();

const CATALOG_BY_TRADITION: ReadonlyMap<TraditionId, readonly SacredAction[]> = (() => {
  const m = new Map<TraditionId, SacredAction[]>();
  for (const t of TRADITION_IDS) m.set(t, []);
  for (const a of _catalogRaw) {
    const arr = m.get(a.tradition);
    if (arr) arr.push(a);
  }
  const frozen = new Map<TraditionId, readonly SacredAction[]>();
  for (const [k, v] of m.entries()) frozen.set(k, Object.freeze(v));
  return frozen;
})();

// ════════════════════════════════════════════════════════════════════════════
// BADGE DEFINITIONS
// ════════════════════════════════════════════════════════════════════════════

interface BadgeSeed {
  id: BadgeId;
  name: string;
  description: string;
  tradition: TraditionId | 'UNIVERSAL';
  meritThreshold: number;
  distinctActionMin: number;
  tierRequired: Tier;
}

const BADGE_SEEDS: readonly BadgeSeed[] = Object.freeze([
  // Per-tradition mastery badges
  Object.freeze({
    id: badgeId('bdg_candomble_prat'),
    name: 'Praticante de Candomblé',
    description: 'Firmou-se na ancestralidade dos Orixás.',
    tradition: 'CANDOMBLE' as const,
    meritThreshold: 100,
    distinctActionMin: 3,
    tierRequired: 'PRATICANTE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_candomble_mest'),
    name: 'Mestre do Gongá',
    description: 'Toque e postura confirmados no terreiro.',
    tradition: 'CANDOMBLE' as const,
    meritThreshold: 500,
    distinctActionMin: 5,
    tierRequired: 'MESTRE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_umbanda_prat'),
    name: 'Cambono de Umbanda',
    description: 'Sustenta a gira com louvação e disciplina.',
    tradition: 'UMBANDA' as const,
    meritThreshold: 100,
    distinctActionMin: 3,
    tierRequired: 'PRATICANTE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_umbanda_mest'),
    name: 'Pai-de-Santo de Umbanda',
    description: 'Conduz terreiro e forma novos médiuns.',
    tradition: 'UMBANDA' as const,
    meritThreshold: 500,
    distinctActionMin: 5,
    tierRequired: 'MESTRE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_ifa_prat'),
    name: 'Awo Iniciante',
    description: 'Caminha os primeiros Odus com disciplina.',
    tradition: 'IFA' as const,
    meritThreshold: 100,
    distinctActionMin: 3,
    tierRequired: 'PRATICANTE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_ifa_mest'),
    name: 'Babalawo Confirmado',
    description: 'Carrega Opón-Ifá e joga 256 Odus.',
    tradition: 'IFA' as const,
    meritThreshold: 500,
    distinctActionMin: 5,
    tierRequired: 'MESTRE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_cabala_prat'),
    name: 'Estudante da Árvore',
    description: 'Percurso firme nas 10 Sephirot.',
    tradition: 'CABALA' as const,
    meritThreshold: 100,
    distinctActionMin: 3,
    tierRequired: 'PRATICANTE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_cabala_mest'),
    name: 'Mestre da Árvore',
    description: 'Ensina Cabala e medita nos 72 Shem.',
    tradition: 'CABALA' as const,
    meritThreshold: 500,
    distinctActionMin: 5,
    tierRequired: 'MESTRE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_astro_prat'),
    name: 'Astrólogo Praticante',
    description: 'Sabe montar e ler mapa natal.',
    tradition: 'ASTROLOGIA' as const,
    meritThreshold: 100,
    distinctActionMin: 3,
    tierRequired: 'PRATICANTE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_astro_mest'),
    name: 'Astrólogo Mestre',
    description: 'Domina sinastria, RS e eclipses.',
    tradition: 'ASTROLOGIA' as const,
    meritThreshold: 500,
    distinctActionMin: 5,
    tierRequired: 'MESTRE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_tantra_prat'),
    name: 'Tantrika Praticante',
    description: 'Caminha meditação e prana com constância.',
    tradition: 'TANTRA' as const,
    meritThreshold: 100,
    distinctActionMin: 3,
    tierRequired: 'PRATICANTE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_tantra_mest'),
    name: 'Tantrika Mestre',
    description: 'Une Shiva-Shakti e ensina não-dualidade.',
    tradition: 'TANTRA' as const,
    meritThreshold: 500,
    distinctActionMin: 5,
    tierRequired: 'MESTRE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_cigano_prat'),
    name: 'Leitor de Cartas Ciganas',
    description: 'Dá consultas com firmeza na Mesa Real.',
    tradition: 'CIGANO' as const,
    meritThreshold: 100,
    distinctActionMin: 3,
    tierRequired: 'PRATICANTE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_cigano_mest'),
    name: 'Mestre Cigano Ramiro',
    description: 'Mesa Real + cruzamento profundo entre mapas.',
    tradition: 'CIGANO' as const,
    meritThreshold: 500,
    distinctActionMin: 5,
    tierRequired: 'MESTRE' as Tier,
  }),
  // Universal tier badges
  Object.freeze({
    id: badgeId('bdg_uni_inic'),
    name: 'Iniciante do Caminho',
    description: 'Primeiros passos firmes na jornada.',
    tradition: 'UNIVERSAL' as const,
    meritThreshold: 0,
    distinctActionMin: 1,
    tierRequired: 'INICIANTE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_uni_prat'),
    name: 'Praticante Universal',
    description: 'Atingiu o tier Praticante.',
    tradition: 'UNIVERSAL' as const,
    meritThreshold: 100,
    distinctActionMin: 1,
    tierRequired: 'PRATICANTE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_uni_mest'),
    name: 'Mestre das Tradições',
    description: 'Atingiu o tier Mestre.',
    tradition: 'UNIVERSAL' as const,
    meritThreshold: 500,
    distinctActionMin: 1,
    tierRequired: 'MESTRE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_uni_sabio'),
    name: 'Sábio Akáshico',
    description: 'Atingiu o tier Sábio — reconhecimento raro.',
    tradition: 'UNIVERSAL' as const,
    meritThreshold: 2000,
    distinctActionMin: 1,
    tierRequired: 'SABIO' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_uni_seventr'),
    name: 'Andarilho dos Sete Caminhos',
    description: 'Atuou em pelo menos uma action nas 7 tradições.',
    tradition: 'UNIVERSAL' as const,
    meritThreshold: 200,
    distinctActionMin: 7,
    tierRequired: 'PRATICANTE' as Tier,
  }),
  Object.freeze({
    id: badgeId('bdg_uni_poli'),
    name: 'Polímata Místico',
    description: 'Atingiu Praticante em 4 tradições distintas.',
    tradition: 'UNIVERSAL' as const,
    meritThreshold: 1000,
    distinctActionMin: 4,
    tierRequired: 'MESTRE' as Tier,
  }),
]);

const BADGE_BY_ID: ReadonlyMap<BadgeId, BadgeDefinition> = (() => {
  const m = new Map<BadgeId, BadgeDefinition>();
  for (const b of BADGE_SEEDS) {
    m.set(b.id, Object.freeze({ ...b }));
  }
  return m;
})();

const BADGES_FROZEN: readonly BadgeDefinition[] = Object.freeze(
  BADGE_SEEDS.map((b) => Object.freeze({ ...b })),
);

// ════════════════════════════════════════════════════════════════════════════
// IN-MEMORY STATE
// ════════════════════════════════════════════════════════════════════════════

interface UserState {
  displayName: string;
  createdAt: number;
  overallMerit: number;
  lastActionAt: number | null;
  perTraditionMerit: Record<TraditionId, number>;
  perTraditionActionsCount: Record<TraditionId, number>;
  distinctActionsPerTradition: Record<TraditionId, Set<string>>;
  earnedBadges: Set<BadgeId>;
  badgesByAction: Map<ActionId, BadgeId | null>;
  undoRecord: Map<ActionId, UndoReceipt>;
  /** Per-action last-fired-at timestamp; used for per-action cooldowns. */
  perActionLastAt: Map<ActionId, number>;
}

function emptyUserState(displayName: string, now: number): UserState {
  const perTradMerit = {} as Record<TraditionId, number>;
  const perTradCount = {} as Record<TraditionId, number>;
  const perTradDistinct = {} as Record<TraditionId, Set<string>>;
  for (const t of TRADITION_IDS) {
    perTradMerit[t] = 0;
    perTradCount[t] = 0;
    perTradDistinct[t] = new Set();
  }
  return {
    displayName,
    createdAt: now,
    overallMerit: 0,
    lastActionAt: null,
    perTraditionMerit: perTradMerit,
    perTraditionActionsCount: perTradCount,
    distinctActionsPerTradition: perTradDistinct,
    earnedBadges: new Set(),
    badgesByAction: new Map(),
    undoRecord: new Map(),
    perActionLastAt: new Map(),
  };
}

const USERS: Map<UserId, UserState> = new Map();
const LEADERBOARD_FROZEN: LeaderboardEntry[] = [];

// ════════════════════════════════════════════════════════════════════════════
// EMBEDDED SHA-256 (cycle 78 — no node:crypto import)
// ════════════════════════════════════════════════════════════════════════════

const SHIFT_TABLE = Object.freeze([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
] as const);

function _rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

export function sha256HexSync(s: string): string {
  const utf8: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) utf8.push(c);
    else if (c < 0x800) {
      utf8.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      utf8.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      i++;
      const c2 = s.charCodeAt(i);
      c = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      utf8.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      );
    }
  }
  const bytes = utf8;
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  bytes.push((hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff);
  bytes.push((lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff);

  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];
  const W = new Array<number>(64).fill(0);

  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      const o = chunk + i * 4;
      W[i] = (((bytes[o] ?? 0) << 24) |
        ((bytes[o + 1] ?? 0) << 16) |
        ((bytes[o + 2] ?? 0) << 8) |
        (bytes[o + 3] ?? 0)) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = _rotr(W[i - 15]!, 7) ^ _rotr(W[i - 15]!, 18) ^ ((W[i - 15]!) >>> 3);
      const s1 = _rotr(W[i - 2]!, 17) ^ _rotr(W[i - 2]!, 19) ^ ((W[i - 2]!) >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }
    let a = H[0]!, b = H[1]!, c2 = H[2]!, d = H[3]!;
    let e = H[4]!, f = H[5]!, g = H[6]!, h = H[7]!;
    for (let i = 0; i < 64; i++) {
      const S1 = _rotr(e, 6) ^ _rotr(e, 11) ^ _rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHIFT_TABLE[i]! + W[i]!) >>> 0;
      const S0 = _rotr(a, 2) ^ _rotr(a, 13) ^ _rotr(a, 22);
      const maj = (a & b) ^ (a & c2) ^ (b & c2);
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c2;
      c2 = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    H[0] = (H[0]! + a) >>> 0;
    H[1] = (H[1]! + b) >>> 0;
    H[2] = (H[2]! + c2) >>> 0;
    H[3] = (H[3]! + d) >>> 0;
    H[4] = (H[4]! + e) >>> 0;
    H[5] = (H[5]! + f) >>> 0;
    H[6] = (H[6]! + g) >>> 0;
    H[7] = (H[7]! + h) >>> 0;
  }

  let out = '';
  for (let i = 0; i < 8; i++) {
    const v = H[i] ?? 0;
    out += v.toString(16).padStart(8, '0');
  }
  return out;
}

export function canonicalJson(input: unknown): string {
  if (input === null || typeof input !== 'object') {
    if (typeof input === 'string') return JSON.stringify(input);
    if (typeof input === 'number' || typeof input === 'boolean') return JSON.stringify(input);
    return 'null';
  }
  if (Array.isArray(input)) {
    return '[' + input.map((v) => canonicalJson(v)).join(',') + ']';
  }
  const keys = Object.keys(input as Record<string, unknown>).sort();
  return '{' +
    keys.map((k) => JSON.stringify(k) + ':' + canonicalJson((input as Record<string, unknown>)[k])).join(',') +
    '}';
}

export function hashCacheKey(input: unknown): string {
  return 'w80a:' + sha256HexSync(canonicalJson(input)).slice(0, 32);
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API — registerUser / recordAction / etc.
// ════════════════════════════════════════════════════════════════════════════

export interface RecordActionInput {
  userId: UserId;
  actionId: ActionId;
  /** Cooldown override in seconds (0 = no cooldown). Defaults to action.cooldownSeconds. */
  cooldownOverride?: number;
  /** Wallclock override for spec — deterministic. */
  nowMs?: number;
}

export function registerUser(u: UserId, displayName: string, nowMs?: number): void {
  if (!USERS.has(u)) {
    USERS.set(u, emptyUserState(displayName, nowMs ?? Date.now()));
  }
}

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Object.isFrozen(obj)) return obj;
  Object.freeze(obj);
  for (const k of Object.keys(obj as Record<string, unknown>)) {
    const v = (obj as Record<string, unknown>)[k];
    if (v !== null && typeof v === 'object' && !Object.isFrozen(v)) {
      deepFreeze(v);
    }
  }
  return obj;
}

export function recordAction(
  input: RecordActionInput,
): ReputationResult<ReputationDelta> {
  const user = USERS.get(input.userId);
  if (!user) {
    return errResult('UNKNOWN_USER', `Unknown user: ${input.userId}`);
  }
  const action = CATALOG_BY_ID.get(input.actionId);
  if (!action) {
    return errResult('UNKNOWN_ACTION', `Unknown action: ${input.actionId}`);
  }
  const now = input.nowMs ?? Date.now();
  if (action.cooldownSeconds > 0) {
    const lastFired = user.perActionLastAt.get(action.id);
    if (lastFired !== undefined) {
      const elapsed = (now - lastFired) / 1000;
      if (elapsed < action.cooldownSeconds) {
        return errResult(
          'COOLDOWN_ACTIVE',
          `Cooldown active: ${action.cooldownSeconds - elapsed}s remaining`,
        );
      }
    }
  }
  user.perActionLastAt.set(action.id, now);
  const meritBeforeTrad = user.perTraditionMerit[action.tradition] ?? 0;
  const overallBefore = user.overallMerit;
  const tierBeforeTrad = tierForMerit(meritBeforeTrad);
  const tierBeforeOverall = tierForMerit(overallBefore);

  user.perTraditionMerit[action.tradition] = meritBeforeTrad + action.meritPoints;
  user.perTraditionActionsCount[action.tradition] =
    (user.perTraditionActionsCount[action.tradition] ?? 0) + 1;
  user.distinctActionsPerTradition[action.tradition]!.add(action.id);
  user.overallMerit = overallBefore + action.meritPoints;
  user.lastActionAt = now;

  const meritAfterTrad = user.perTraditionMerit[action.tradition]!;
  const overallAfter = user.overallMerit;
  const tierAfterTrad = tierForMerit(meritAfterTrad);
  const tierAfterOverall = tierForMerit(overallAfter);

  const unlocked: BadgeId[] = [];
  for (const b of BADGE_SEEDS) {
    if (user.earnedBadges.has(b.id)) continue;
    const tradMeritCheck =
      b.tradition === 'UNIVERSAL'
        ? overallAfter
        : b.tradition === action.tradition
        ? meritAfterTrad
        : user.perTraditionMerit[b.tradition] ?? 0;
    if (tradMeritCheck < b.meritThreshold) continue;
    const distinctCount =
      b.tradition === 'UNIVERSAL'
        ? countTotalDistinct(user)
        : (user.distinctActionsPerTradition[b.tradition] ?? new Set()).size;
    if (distinctCount < b.distinctActionMin) continue;
    const targetTrad = b.tradition === 'UNIVERSAL' ? overallAfter : tradMeritCheck;
    if (tierIndex(tierForMerit(targetTrad)) < tierIndex(b.tierRequired)) continue;
    user.earnedBadges.add(b.id);
    unlocked.push(b.id);
  }

  user.badgesByAction.set(action.id, null);
  user.undoRecord.set(action.id, {
    actionId: action.id,
    userId: input.userId,
    rolledBack: 0,
    at: now,
  });

  const delta: ReputationDelta = Object.freeze({
    userId: input.userId,
    actionId: action.id,
    tradition: action.tradition,
    meritBefore: meritBeforeTrad,
    meritAfter: meritAfterTrad,
    tierBefore: tierBeforeTrad,
    tierAfter: tierAfterTrad,
    promoted: tierIndex(tierAfterTrad) > tierIndex(tierBeforeTrad),
    badgesUnlocked: Object.freeze(unlocked),
  });
  return okResult(delta);
}

function countTotalDistinct(u: UserState): number {
  let sum = 0;
  for (const t of TRADITION_IDS) {
    sum += u.distinctActionsPerTradition[t]?.size ?? 0;
  }
  return sum;
}

export function listCatalog(): readonly SacredAction[] {
  return SACRED_ACTION_CATALOG;
}

export function listTraditions(): readonly TraditionMeta[] {
  const out: TraditionMeta[] = [];
  for (const id of TRADITION_IDS) {
    const meta = TRADITION_META[id];
    out.push(meta);
  }
  return Object.freeze(out);
}

export function listBadges(): readonly BadgeDefinition[] {
  return BADGES_FROZEN;
}

export function userLevel(u: UserId, tradition?: TraditionId): Tier {
  const user = USERS.get(u);
  if (!user) throw new Error(`Unknown user: ${u}`);
  if (!tradition) return tierForMerit(user.overallMerit);
  return tierForMerit(user.perTraditionMerit[tradition] ?? 0);
}

export function exportUserProfile(u: UserId): ReputationResult<UserProfile> {
  const user = USERS.get(u);
  if (!user) return errResult('UNKNOWN_USER', `Unknown user: ${u}`);
  const perTradition = {} as Record<TraditionId, TraditionScore>;
  for (const t of TRADITION_IDS) {
    const merit = user.perTraditionMerit[t] ?? 0;
    perTradition[t] = Object.freeze({
      tradition: t,
      merit,
      tier: tierForMerit(merit),
      actionsPerformed: user.perTraditionActionsCount[t] ?? 0,
      badgesEarned: countBadgesForTradition(user, t),
    });
  }
  const profile: UserProfile = Object.freeze({
    userId: u,
    displayName: user.displayName,
    overallMerit: user.overallMerit,
    overallTier: tierForMerit(user.overallMerit),
    createdAt: user.createdAt,
    lastActionAt: user.lastActionAt,
    perTradition,
    earnedBadgeIds: Object.freeze(Array.from(user.earnedBadges)),
  });
  return okResult(deepFreeze(profile));
}

function countBadgesForTradition(u: UserState, trad: TraditionId): number {
  let n = 0;
  for (const b of BADGE_SEEDS) {
    if (!u.earnedBadges.has(b.id)) continue;
    if (b.tradition === trad || (b.tradition === 'UNIVERSAL' && trad === 'CIGANO')) n++;
  }
  return n;
}

export function exportLeaderboard(limit = 50): readonly LeaderboardEntry[] {
  const all: LeaderboardEntry[] = [];
  for (const [u, state] of USERS.entries()) {
    all.push(
      Object.freeze({
        rank: 0,
        userId: u,
        displayName: state.displayName,
        overallMerit: state.overallMerit,
        overallTier: tierForMerit(state.overallMerit),
        badgesEarned: state.earnedBadges.size,
      }),
    );
  }
  all.sort((a, b) => b.overallMerit - a.overallMerit);
  const ranked: LeaderboardEntry[] = [];
  for (let i = 0; i < all.length && i < limit; i++) {
    const e = all[i]!;
    ranked.push(
      Object.freeze({
        rank: i + 1,
        userId: e.userId,
        displayName: e.displayName,
        overallMerit: e.overallMerit,
        overallTier: e.overallTier,
        badgesEarned: e.badgesEarned,
      }),
    );
  }
  // Cache for downstream consumers — but the export is still immutable.
  LEADERBOARD_FROZEN.length = 0;
  for (const e of ranked) LEADERBOARD_FROZEN.push(e);
  return Object.freeze(ranked);
}

export function grantBadge(
  u: UserId,
  b: BadgeId,
  reason: string,
): ReputationResult<BadgeGrant> {
  const user = USERS.get(u);
  if (!user) return errResult('UNKNOWN_USER', `Unknown user: ${u}`);
  const def = BADGE_BY_ID.get(b);
  if (!def) return errResult('UNKNOWN_BADGE', `Unknown badge: ${b}`);
  if (user.earnedBadges.has(b)) {
    return errResult('INVALID_INPUT', `Badge already granted: ${b}`);
  }
  const tradMerit = def.tradition === 'UNIVERSAL'
    ? user.overallMerit
    : user.perTraditionMerit[def.tradition] ?? 0;
  if (tradMerit < def.meritThreshold) {
    return errResult(
      'BADGE_REQUIRES_MERIT',
      `Need ${def.meritThreshold} merit, have ${tradMerit}`,
    );
  }
  const targetTier = def.tradition === 'UNIVERSAL'
    ? tierForMerit(user.overallMerit)
    : tierForMerit(tradMerit);
  if (tierIndex(targetTier) < tierIndex(def.tierRequired)) {
    return errResult(
      'BADGE_REQUIRES_TIER',
      `Need tier ${def.tierRequired}, have ${targetTier}`,
    );
  }
  user.earnedBadges.add(b);
  const grant: BadgeGrant = Object.freeze({
    badgeId: b,
    userId: u,
    grantedAt: Date.now(),
    reason,
  });
  return okResult(grant);
}

export function undoAction(
  u: UserId,
  a: ActionId,
  nowMs?: number,
): ReputationResult<UndoReceipt> {
  const user = USERS.get(u);
  if (!user) return errResult('UNKNOWN_USER', `Unknown user: ${u}`);
  const action = CATALOG_BY_ID.get(a);
  if (!action) return errResult('UNKNOWN_ACTION', `Unknown action: ${a}`);
  const lastUndo = user.undoRecord.get(a);
  if (!lastUndo || lastUndo.rolledBack > 0) {
    return errResult('INVALID_INPUT', `Action not in user history: ${a}`);
  }
  const trad = action.tradition;
  const cur = user.perTraditionMerit[trad] ?? 0;
  user.perTraditionMerit[trad] = Math.max(0, cur - action.meritPoints);
  user.overallMerit = Math.max(0, user.overallMerit - action.meritPoints);
  user.perTraditionActionsCount[trad] = Math.max(
    0,
    (user.perTraditionActionsCount[trad] ?? 0) - 1,
  );
  const receipt: UndoReceipt = Object.freeze({
    actionId: a,
    userId: u,
    rolledBack: action.meritPoints,
    at: nowMs ?? Date.now(),
  });
  user.undoRecord.set(a, receipt);
  return okResult(receipt);
}

export function _resetForTests(): void {
  USERS.clear();
  LEADERBOARD_FROZEN.length = 0;
}

export function _countUsersForTests(): number {
  return USERS.size;
}

export function _catalogSizeForTests(): number {
  return SACRED_ACTION_CATALOG.length;
}

export function _badgesSizeForTests(): number {
  return BADGES_FROZEN.length;
}

// ════════════════════════════════════════════════════════════════════════════
// VERSION CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const W80_A_VERSION = '1.0.0';
export const W80_A_CYCLE = 80;
export const W80_A_TRADITIONS_COVERED = 7;
export const W80_A_ACTIONS_SHIPPED = 49;
export const W80_A_BADGES_SHIPPED = BADGE_SEEDS.length;
export const W80_A_TIERS_SHIPPED = 4;
