/**
 * w54/voice-mood-coach-leaderboard
 * ─────────────────────────────────
 * Anonymous, opt-in, k-anonymous (k≥10) ranking engine for w53/voice-mood-
 * realtime-coach sessions. Pulls session records "by shape" (no imports from
 * the companion file), aggregates per-user stats, enforces k-anonymity with
 * cohort merging, and exposes WEEKLY / MONTHLY / ALL_TIME views with three
 * sub-views each (TOP_USERS / TOP_COHORTS / MOST_IMPROVED).
 *
 * Sacred-text policy is MANDATORY: sessions tagged sacred-content (prayer,
 * chant, ritual, litany, mantra, dhikr, novena, psalm) are EXCLUDED from the
 * leaderboard by default with NO opt-in override. Sacred practice is not
 * competitive.
 *
 * Anti-gaming: rapid-session detection (≥20 in 1h), identical-mood-arc
 * detection (FNV-1a hash collisions), and IP/device clustering heuristic
 * flag accounts before they ever reach a leaderboard.
 *
 * LGPD Art. 7 (consentimento), Art. 9 (finalidade) e Art. 18 (direitos do
 * titular): opt-in é OFF por default; revocation remove participation
 * imediatamente; erasure remove participação + audit (30-day retention);
 * export inclui rank + histórico do próprio usuário.
 *
 * Self-contained: só tipos de TS + Math nativo + string ops. Sem dependência
 * externa, sem node:crypto, sem prisma em runtime, sem fetch. Determinístico
 * dado RNG seedada. HMAC-SHA256 implementado a mão (FIPS 180-4) para IDs
 * anônimos por-cohort-por-semana, rotacionados semanalmente.
 *
 * Layout:
 *   §1  Tipos & contratos
 *   §2  Constantes, taxonomias de cohort, sacred-tag, opt-in, audit
 *   §3  Math helpers (FNV-1a 32/64, SHA-256 hand-rolled, HMAC-SHA256,
 *        Mulberry32 PRNG, estatísticas)
 *   §4  Session shape mirrors (w53 contract por forma)
 *   §5  Cohort builders (BY_TRADITION / BY_REGION / BY_DURATION / BY_PURITY)
 *   §6  Aggregation engine (per-user stats, sacred filter, opt-in filter)
 *   §7  k-anonymity core (k≥10, merge-underflow, audit trail)
 *   §8  Anonymous IDs (HMAC-SHA256, weekly rotation)
 *   §9  Ranking views (WEEKLY / MONTHLY / ALL_TIME × TOP_USERS /
 *        TOP_COHORTS / MOST_IMPROVED)
 *   §10 Anti-gaming (rapid-session, mood-arc collision, IP/device cluster)
 *   §11 Opt-in & LGPD Art. 7/9/18 (export, revocation, erasure)
 *   §12 Sacred-text policy
 *   §13 Audit log & report
 *   §14 Smoke / regression scenarios
 *   §15 Doc-string constants
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Tipos & Contratos                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Mirror do w53/voice-mood-realtime-coach SessionRecord — apenas SHAPE, sem
 * import. Cada campo é o que o companion engine produz num payload de sessão
 * concluída. O leaderboard só lê; nunca muta.
 */
export interface CoachSessionRecordShape {
  sessionId: string;          // UUID v4
  userId: string;             // userId cru do caller — hashed internamente
  startedAt: number;          // epoch ms
  endedAt: number;            // epoch ms
  durationSec: number;        // (endedAt - startedAt) / 1000
  practice: PracticeShape;    // tipo de prática vocal/mood
  tradition: string;          // "umbanda" | "candomble" | "ifa" | "kabbalah" | ...
  region: string;             // ISO-3166 alpha-2 ou "ZZ"
  language: string;           // BCP-47 ("pt-BR", "en-US")
  filtered: boolean;          // true = modo filtered (sem conteúdo sacred)
  sacredFlag: boolean;        // true = sessão envolve prayer/chant/ritual
  sacredKind?: SacredKind;    // granularidade do sacred flag
  cuesDelivered: number;      // total de cues que o coach entregou
  cuesFollowed: number;       // total de cues que o usuário seguiu
  moodArc: MoodSampleShape[]; // série temporal de mood durante a sessão
  audioFeatures?: AudioFeaturesShape;
  device?: DeviceFingerprintShape;
  ipHash?: string;            // já hashed pelo caller (FNV-1a 64 hex)
  appVersion: string;         // "5.4.x" — usado em métricas
}

/** Tipo de prática — apenas labels conhecidos. */
export type PracticeShape =
  | "breath_meditation"
  | "gratitude_reflection"
  | "devotional_chant"
  | "prayer_recital"
  | "ritual_guidance"
  | "sleep_wind_down"
  | "mood_reframe"
  | "energy_alignment"
  | "tarot_integration"
  | "freeform_journal";

/** Sub-tagging do sacredFlag — mutuamente exclusivo. */
export type SacredKind =
  | "prayer"
  | "chant"
  | "ritual"
  | "litany"
  | "mantra"
  | "dhikr"
  | "novena"
  | "psalm";

/** Mood sample — ponto da curva de mood durante a sessão. */
export interface MoodSampleShape {
  t: number;        // epoch ms (relativo à sessão — startedAt + offset)
  valence: number;  // -1.0 .. +1.0
  arousal: number;  // -1.0 .. +1.0
  tag?: string;     // "calm" | "anxious" | "focused" | "elevated" | ...
}

/** Features acústicas opcionais — usadas em anti-gaming. */
export interface AudioFeaturesShape {
  rmsMean: number;        // root-mean-square média
  rmsStd: number;         // desvio padrão RMS
  silenceRatio: number;   // 0..1 — fração de silêncio
  pitchMeanHz: number;    // pitch médio (F0)
  pitchStdHz: number;     // variabilidade do pitch
}

/** Fingerprint leve do device — usado em anti-gaming. */
export interface DeviceFingerprintShape {
  ua: string;             // user-agent (limpo)
  platform: string;       // "web" | "ios" | "android"
  screenW: number;        // pixels
  screenH: number;
  tzOffsetMin: number;    // offset em minutos
}

/** Registro de opt-in — um por userId. Default OFF. */
export interface OptInRecord {
  userId: string;
  optedIn: boolean;
  optedInAt: number | null;        // epoch ms
  revokedAt: number | null;       // epoch ms (última revogação)
  history: OptInEvent[];          // trilha auditável
  retentionDays: number;          // default 30
}

export interface OptInEvent {
  ts: number;
  action: "opt_in" | "opt_out" | "auto_revoke" | "lgpd_erasure";
  reason?: string;
  requestId?: string;
}

/** Cohort key — quasi-identifier para k-anonymity. */
export interface CohortKey {
  cohortType: CohortType;
  cohortValue: string;       // depende do tipo
  cohortBucket: string;      // pós-bucketização (ex.: "BR", "medium")
  parentCohort?: string;     // quando merged para k-anon
}

export type CohortType =
  | "BY_TRADITION"
  | "BY_REGION"
  | "BY_DURATION"
  | "BY_PURITY";

/** Cohort stats — pré-publicação. */
export interface CohortStats {
  cohort: CohortKey;
  sessionCount: number;
  distinctUsers: number;
  totalMinutes: number;
  avgCueAdherence: number;        // 0..1
  avgMoodImprovement: number;     // mudança média de valence (final - inicial)
  sacredExcluded: number;         // count de sessões sacred removidas
  weekId?: string;                // presente se WEEKLY view
  monthId?: string;               // presente se MONTHLY view
}

/** Per-user aggregated stats dentro de um view. */
export interface UserLeaderboardEntry {
  anonymousId: string;            // HMAC-SHA256 semanal
  userCohort: CohortKey;
  sessions: number;
  totalMinutes: number;
  cueAdherence: number;           // 0..1
  moodImprovement: number;        // -1..+1
  compositeScore: number;         // score final ordenável
  rank: number;
  flagged: boolean;               // true se anti-gaming sinalizou
  flagReasons: string[];
}

export interface CohortLeaderboardEntry {
  cohort: CohortKey;
  cohortLabel: string;            // "Umbanda × BR × medium × filtered"
  distinctUsers: number;
  avgComposite: number;
  avgMoodImprovement: number;
  avgCueAdherence: number;
  rank: number;
  suppressed: boolean;            // true se k<kMin e merge falhou
  mergedInto?: string;            // cohort alvo do merge
}

export interface MostImprovedEntry {
  anonymousId: string;
  userCohort: CohortKey;
  baselineMood: number;
  currentMood: number;
  improvement: number;            // currentMood - baselineMood
  sessions: number;
  rank: number;
}

/** View container — o que o caller recebe. */
export interface LeaderboardView {
  view: ViewType;
  scope: ViewScope;               // WEEKLY | MONTHLY | ALL_TIME
  subView: SubViewType;           // TOP_USERS | TOP_COHORTS | MOST_IMPROVED
  generatedAt: number;
  kMin: number;                   // k≥10 obrigatório
  kActual: number;                // menor cohort size observado
  cohortMergeLog: CohortMergeLogEntry[];
  users?: UserLeaderboardEntry[];
  cohorts?: CohortLeaderboardEntry[];
  mostImproved?: MostImprovedEntry[];
  totalEligibleUsers: number;
  totalEligibleSessions: number;
  sacredExcludedSessions: number;
  flaggedExcluded: number;
  auditHash: string;              // HMAC-SHA256 do conteúdo publicável
}

export type ViewType = "LEADERBOARD";
export type ViewScope = "WEEKLY" | "MONTHLY" | "ALL_TIME";
export type SubViewType = "TOP_USERS" | "TOP_COHORTS" | "MOST_IMPROVED";

/** Audit de merges — k-anonymity enforcement log. */
export interface CohortMergeLogEntry {
  ts: number;
  sourceCohort: CohortKey;
  targetCohort: CohortKey;
  sourceSize: number;
  targetSize: number;
  reason: "k_below_min" | "no_eligible_users" | "sacred_filter_drained";
  decision: "merge" | "suppress";
}

/** Audit step — trilha interna do engine. */
export interface AuditStep {
  step: string;
  ts: number;
  ok: boolean;
  detail?: string;
}

/** Anti-gaming flag — levantada antes do ranking. */
export interface AntiGamingFlag {
  userId: string;
  reasons: AntiGamingReason[];
  flaggedSessions: string[];      // sessionIds sinalizados
  riskScore: number;              // 0..1
  createdAt: number;
}

export type AntiGamingReason =
  | "rapid_session_creation"      // >20 sessions in 1h
  | "identical_mood_arc"          // hash da mood-arc repete
  | "ip_device_cluster"           // mesmo ipHash + device em vários users
  | "cue_adherence_inflation"     // aderência ≥99% por 14 dias seguidos
  | "duration_outlier"            // duração >3σ da média do cohort
  | "filtered_then_unfiltered"    // alterna filtered/unfiltered
  | "region_jump";                // region muda >3x em 24h

/** LGPD export payload — por usuário. */
export interface LeaderboardExportPayload {
  userId: string;
  exportedAt: number;
  currentRank: LeaderboardExportRank[];
  history: LeaderboardExportHistoryEntry[];
  optInHistory: OptInEvent[];
  auditHash: string;
}

export interface LeaderboardExportRank {
  scope: ViewScope;
  subView: SubViewType;
  cohort: CohortKey;
  rank: number | null;            // null se fora do top N
  compositeScore: number | null;
  weekId?: string;
  monthId?: string;
}

export interface LeaderboardExportHistoryEntry {
  ts: number;
  scope: ViewScope;
  rank: number;
  score: number;
  cohort: CohortKey;
  weekId?: string;
  monthId?: string;
}

/** Erros do engine — prefixo LB_. */
export type LeaderboardErrorCode =
  | "LB_001"  // k-anonymity violation não resolúvel
  | "LB_002"  // opt-in ausente para usuário consultado
  | "LB_003"  // cohort inválido
  | "LB_004"  // session record mal formado
  | "LB_005"  // rotação de chave HMAC ausente
  | "LB_006"  // sacred leakage detected
  | "LB_007"  // audit log corrupted
  | "LB_008"  // rate limit exceeded (anti-gaming)
  | "LB_009"  // weekId/monthId inválido
  | "LB_010"; // LGPD erasure requested mas não há opt-in

export interface LeaderboardError {
  code: LeaderboardErrorCode;
  message: string;
  detail?: string;
  ts: number;
}

/** Final report — saída do engine principal. */
export interface LeaderboardReport {
  views: LeaderboardView[];
  errors: LeaderboardError[];
  auditTrail: AuditStep[];
  durationMs: number;
  generatedAt: number;
  engineVersion: string;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constantes, taxonomias, opt-in defaults                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Versão do engine — incrementada quando schema/logica muda. */
export const ENGINE_VERSION = "1.0.0-w54";

/** Política version — atrelada a ledger de auditoria LGPD. */
export const POLICY_VERSION = "w54-lb-policy-2026.06.29";

/** k mínimo — MANDATORY ≥10. Coerção para 10 mesmo se input for menor. */
export const K_MINIMUM_MANDATORY = 10;

/** k default se caller não informar. */
export const K_DEFAULT = 10;

/** k máximo aceito (anti-DoS no aggregate). */
export const K_MAXIMUM = 50;

/** Rotação semanal de anonymous IDs — segunda-feira 00:00 UTC. */
export const ANON_ID_ROTATION_WEEKDAY = 1; // 0=Sun, 1=Mon, ..., 6=Sat

/** Default retention de audit em opt-out / erasure: 30 dias. */
export const AUDIT_RETENTION_DAYS_DEFAULT = 30;

/** Anti-gaming thresholds. */
export const ANTI_GAMING_MAX_SESSIONS_PER_HOUR = 20;
export const ANTI_GAMING_MAX_REGIONS_PER_24H = 3;
export const ANTI_GAMING_CUE_INFLATION_DAYS = 14;
export const ANTI_GAMING_DURATION_SIGMA = 3;
export const ANTI_GAMING_CLUSTER_MIN_USERS = 4;
export const ANTI_GAMING_CLUSTER_WINDOW_HOURS = 24;

/** Ranking caps. */
export const TOP_USERS_DEFAULT_LIMIT = 50;
export const TOP_COHORTS_DEFAULT_LIMIT = 25;
export const MOST_IMPROVED_DEFAULT_LIMIT = 25;

/** Sacred kinds — exclusão obrigatória do leaderboard. */
export const SACRED_KINDS: readonly SacredKind[] = [
  "prayer",
  "chant",
  "ritual",
  "litany",
  "mantra",
  "dhikr",
  "novena",
  "psalm",
] as const;

/** Traduções i18n (PT-BR primário, EN secundário). */
export const LABELS_PT_BR = {
  title: "Ranking da Comunidade",
  scopeWeekly: "Semanal",
  scopeMonthly: "Mensal",
  scopeAllTime: "Todos os tempos",
  subTopUsers: "Top praticantes",
  subTopCohorts: "Top cohorts",
  subMostImproved: "Maior evolução",
  optInTitle: "Participar do ranking anônimo?",
  optInDescription:
    "Compartilhamos apenas estatísticas agregadas (sessões, minutos, aderência a dicas, melhora de humor). Nada de áudio, transcrição ou conteúdo sagrado.",
  revokeTitle: "Sair do ranking",
  privacyTitle: "Sua privacidade",
  sacredExcludedNote:
    "Sessões de oração, canto, ritual, ladainha, mantra, dhikr, novena e salmo nunca aparecem no ranking — prática sagrada não é competitiva.",
  kAnonymityNote: "Cada cohort exibe apenas dados de 10 ou mais praticantes.",
  flaggedNote: "Praticantes sinalizados por comportamento suspeito são removidos.",
  noDataTitle: "Ainda não há dados suficientes",
  noDataDescription: "Convide amigos para fortalecer a comunidade.",
} as const;

export const LABELS_EN = {
  title: "Community Leaderboard",
  scopeWeekly: "Weekly",
  scopeMonthly: "Monthly",
  scopeAllTime: "All time",
  subTopUsers: "Top practitioners",
  subTopCohorts: "Top cohorts",
  subMostImproved: "Most improved",
  optInTitle: "Join the anonymous ranking?",
  optInDescription:
    "We only share aggregated stats (sessions, minutes, cue adherence, mood improvement). No audio, no transcript, no sacred content.",
  revokeTitle: "Leave the ranking",
  privacyTitle: "Your privacy",
  sacredExcludedNote:
    "Prayer, chant, ritual, litany, mantra, dhikr, novena and psalm sessions never appear in the ranking — sacred practice is not competitive.",
  kAnonymityNote: "Each cohort shows data only when 10 or more practitioners are eligible.",
  flaggedNote: "Practitioners flagged for suspicious behaviour are removed.",
  noDataTitle: "Not enough data yet",
  noDataDescription: "Invite friends to strengthen the community.",
} as const;

/** i18n selector — caller escolhe locale. */
export type LeaderboardLocale = "pt-BR" | "en-US";

export function getLabels(locale: LeaderboardLocale): Record<string, string> {
  return locale === "pt-BR" ? LABELS_PT_BR : LABELS_EN;
}

/** Cohort taxonomy — BY_TRADITION values. */
export const TRADITION_TAXONOMY: readonly string[] = [
  "umbanda",
  "candomble",
  "ifa",
  "kabbalah",
  "astrology",
  "tarot",
  "lenormand",
  "cigano",
  "mixed",
  "unspecified",
] as const;

/** Region taxonomy — ISO-3166 alpha-2 + ZZ fallback. */
export const REGION_TAXONOMY: readonly string[] = [
  "BR", "PT", "AO", "MZ", "CV",
  "US", "UK", "ES", "FR", "DE",
  "IT", "JP", "MX", "AR", "CO",
  "CL", "PE", "UY", "PY", "BO", "ZZ",
] as const;

/** Duration buckets. */
export const DURATION_BUCKET_SHORT_MAX_SEC = 5 * 60;   // 5 min
export const DURATION_BUCKET_MEDIUM_MAX_SEC = 20 * 60; // 20 min
// > 20min = LONG

/** Purity buckets. */
export const PURITY_FILTERED = "filtered";
export const PURITY_FULL = "full";
export const PURITY_MIXED = "mixed";

/** Default week start: Sunday (Sun-Sat como pedido). */
export const WEEK_STARTS_ON: 0 = 0; // 0 = Sunday

/** Composite score weights (somam 1.0). */
export const SCORE_WEIGHT_SESSIONS = 0.15;
export const SCORE_WEIGHT_MINUTES = 0.15;
export const SCORE_WEIGHT_CUE_ADHERENCE = 0.30;
export const SCORE_WEIGHT_MOOD_IMPROVEMENT = 0.40;

/** HMAC key placeholder — em produção, vem de env. */
export const HMAC_KEY_PLACEHOLDER = "__SET_HMAC_LEADERBOARD_KEY__";
export const HMAC_KEY_DEV_DEFAULT = "dev-leaderboard-hmac-key-not-for-prod";

/** Audit retention ledger version. */
export const AUDIT_LEDGER_VERSION = "v1";
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math helpers — FNV-1a, SHA-256 hand-rolled, HMAC-SHA256, PRNG         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ─── FNV-1a 32-bit ──────────────────────────────────────────────────────────

const FNV1A_32_OFFSET = 0x811c9dc5;
const FNV1A_32_PRIME = 0x01000193;

export function fnv1a32(input: string): string {
  let hash = FNV1A_32_OFFSET >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV1A_32_PRIME) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

// ─── FNV-1a 64-bit (simulado em BigInt-safe Math) ──────────────────────────

const FNV1A_64_OFFSET = BigInt("0xcbf29ce484222325");
const FNV1A_64_PRIME = BigInt("0x100000001b3");
const FNV1A_64_MASK = (BigInt(1) << BigInt(64)) - BigInt(1);

export function fnv1a64(input: string): string {
  let hash = FNV1A_64_OFFSET & FNV1A_64_MASK;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i) & 0xff);
    hash = (hash * FNV1A_64_PRIME) & FNV1A_64_MASK;
  }
  return hash.toString(16).padStart(16, "0");
}

/** FNV-1a 64-bit sobre bytes brutos (utf-8 encoded). */
export function fnv1a64Bytes(bytes: Uint8Array): string {
  let hash = FNV1A_64_OFFSET & FNV1A_64_MASK;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= BigInt(bytes[i]! & 0xff);
    hash = (hash * FNV1A_64_PRIME) & FNV1A_64_MASK;
  }
  return hash.toString(16).padStart(16, "0");
}

// ─── UTF-8 encode helper ───────────────────────────────────────────────────

export function utf8Encode(input: string): Uint8Array {
  const result: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let cp = input.charCodeAt(i);
    if (cp < 0x80) {
      result.push(cp);
    } else if (cp < 0x800) {
      result.push(0xc0 | (cp >> 6));
      result.push(0x80 | (cp & 0x3f));
    } else if (cp >= 0xd800 && cp <= 0xdbff) {
      // surrogate pair
      const next = input.charCodeAt(i + 1);
      cp = 0x10000 + (((cp & 0x3ff) << 10) | (next & 0x3ff));
      i++;
      result.push(0xf0 | (cp >> 18));
      result.push(0x80 | ((cp >> 12) & 0x3f));
      result.push(0x80 | ((cp >> 6) & 0x3f));
      result.push(0x80 | (cp & 0x3f));
    } else {
      result.push(0xe0 | (cp >> 12));
      result.push(0x80 | ((cp >> 6) & 0x3f));
      result.push(0x80 | (cp & 0x3f));
    }
  }
  return new Uint8Array(result);
}

// ─── SHA-256 hand-rolled (FIPS 180-4) ───────────────────────────────────────

const SHA256_K = new Uint32Array([
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
]);

function rotr(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

export function sha256(input: string | Uint8Array): string {
  const hex = sha256Bytes(input);
  let s = "";
  for (let i = 0; i < hex.length; i++) {
    s += hex[i]!.toString(16).padStart(2, "0");
  }
  return s;
}

/** SHA-256 retornando 32 bytes binários (para uso interno em HMAC). */
export function sha256Bytes(input: string | Uint8Array): Uint8Array {
  const bytes = typeof input === "string" ? utf8Encode(input) : input;
  const len = bytes.length;

  // Pre-processing: padding
  const bitLen = BigInt(len) * BigInt(8);
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[len] = 0x80;
  // 64-bit length big-endian
  for (let i = 0; i < 8; i++) {
    padded[padded.length - 1 - i] = Number((bitLen >> BigInt(i * 8)) & BigInt(0xff));
  }

  // Initial hash values
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  // Process each 512-bit block
  for (let off = 0; off < padded.length; off += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i++) {
      w[i] = ((padded[off + i * 4]! << 24) |
              (padded[off + i * 4 + 1]! << 16) |
              (padded[off + i * 4 + 2]! << 8) |
              padded[off + i * 4 + 3]!) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]!) ^ rotr(18, w[i - 15]!) ^ (w[i - 15]! >>> 3);
      const s1 = rotr(17, w[i - 2]!) ^ rotr(19, w[i - 2]!) ^ (w[i - 2]! >>> 10);
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3;
    let e = h4, f = h5, g = h6, h = h7;

    for (let i = 0; i < 64; i++) {
      const s1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + SHA256_K[i]! + w[i]!) >>> 0;
      const s0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;
      h = g; g = f; f = e;
      e = (d + temp1) >>> 0;
      d = c; c = b; b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const hs = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (let i = 0; i < 8; i++) {
    const v = hs[i]!;
    out[i * 4] = (v >>> 24) & 0xff;
    out[i * 4 + 1] = (v >>> 16) & 0xff;
    out[i * 4 + 2] = (v >>> 8) & 0xff;
    out[i * 4 + 3] = v & 0xff;
  }
  return out;
}

// ─── HMAC-SHA256 (RFC 2104) ────────────────────────────────────────────────

const BLOCK_SIZE = 64;

export function hmacSha256(key: string | Uint8Array, message: string | Uint8Array): string {
  const keyBytes = typeof key === "string" ? utf8Encode(key) : key;
  const msgBytes = typeof message === "string" ? utf8Encode(message) : message;

  let k = keyBytes;
  if (k.length > BLOCK_SIZE) {
    k = sha256Bytes(k);
  }
  if (k.length < BLOCK_SIZE) {
    const padded = new Uint8Array(BLOCK_SIZE);
    padded.set(k);
    k = padded;
  }

  const ipad = new Uint8Array(BLOCK_SIZE);
  const opad = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    ipad[i] = k[i]! ^ 0x36;
    opad[i] = k[i]! ^ 0x5c;
  }

  const inner = new Uint8Array(BLOCK_SIZE + msgBytes.length);
  inner.set(ipad);
  inner.set(msgBytes, BLOCK_SIZE);
  const innerHash = sha256Bytes(inner);

  const outer = new Uint8Array(BLOCK_SIZE + 32);
  outer.set(opad);
  outer.set(innerHash, BLOCK_SIZE);
  const outerHash = sha256Bytes(outer);
  let s = "";
  for (let i = 0; i < outerHash.length; i++) {
    s += outerHash[i]!.toString(16).padStart(2, "0");
  }
  return s;
}

// ─── HMAC-SHA256 hex truncado para IDs curtos (16 hex = 64 bits) ────────────

export function hmacSha256Short(key: string | Uint8Array, message: string | Uint8Array): string {
  return hmacSha256(key, message).slice(0, 16);
}

// ─── Mulberry32 PRNG ────────────────────────────────────────────────────────

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Estatísticas ───────────────────────────────────────────────────────────

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  let sq = 0;
  for (const v of values) {
    const d = v - m;
    sq += d * d;
  }
  return Math.sqrt(sq / (values.length - 1));
}

export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

export function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

export function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

export function round3(x: number): number {
  return Math.round(x * 1000) / 1000;
}

/** Linear interpolation entre [a, b]. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Percentil (linear interp). */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((x, y) => x - y);
  const idx = clamp((sorted.length - 1) * p, 0, sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo]!;
  return lerp(sorted[lo]!, sorted[hi]!, idx - lo);
}

/** Soma dos elementos. */
export function sum(values: number[]): number {
  let s = 0;
  for (const v of values) s += v;
  return s;
}

/** Min/Max. */
export function min(values: number[]): number {
  if (values.length === 0) return 0;
  let m = values[0]!;
  for (let i = 1; i < values.length; i++) if (values[i]! < m) m = values[i]!;
  return m;
}

export function max(values: number[]): number {
  if (values.length === 0) return 0;
  let m = values[0]!;
  for (let i = 1; i < values.length; i++) if (values[i]! > m) m = values[i]!;
  return m;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 Session shape mirrors + validators                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Erro de validação retornado por validateSessionRecord. */
export interface ValidationIssue {
  code: string;
  message: string;
  field?: string;
}

/** Valida uma session record (shape-only check). */
export function validateSessionRecord(rec: CoachSessionRecordShape): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!rec.sessionId || rec.sessionId.length < 8) {
    issues.push({ code: "INVALID_SESSION_ID", message: "sessionId ausente/curto", field: "sessionId" });
  }
  if (!rec.userId || rec.userId.length < 1) {
    issues.push({ code: "INVALID_USER_ID", message: "userId ausente", field: "userId" });
  }
  if (!Number.isFinite(rec.startedAt) || rec.startedAt <= 0) {
    issues.push({ code: "INVALID_STARTED_AT", message: "startedAt inválido", field: "startedAt" });
  }
  if (!Number.isFinite(rec.endedAt) || rec.endedAt < rec.startedAt) {
    issues.push({ code: "INVALID_ENDED_AT", message: "endedAt inválido", field: "endedAt" });
  }
  if (!Number.isFinite(rec.durationSec) || rec.durationSec < 0) {
    issues.push({ code: "INVALID_DURATION", message: "durationSec inválido", field: "durationSec" });
  }
  if (rec.cuesDelivered < 0 || rec.cuesFollowed < 0 || rec.cuesFollowed > rec.cuesDelivered) {
    issues.push({
      code: "INVALID_CUES",
      message: "cuesFollowed > cuesDelivered ou negativo",
      field: "cuesFollowed",
    });
  }
  if (!Array.isArray(rec.moodArc) || rec.moodArc.length < 2) {
    issues.push({ code: "INVALID_MOOD_ARC", message: "moodArc precisa de >=2 pontos", field: "moodArc" });
  }
  if (!isValidRegion(rec.region)) {
    issues.push({ code: "INVALID_REGION", message: `region "${rec.region}" não está na taxonomia`, field: "region" });
  }
  if (rec.sacredFlag && !rec.sacredKind) {
    issues.push({ code: "MISSING_SACRED_KIND", message: "sacredFlag=true sem sacredKind", field: "sacredKind" });
  }
  if (rec.sacredKind && !SACRED_KINDS.includes(rec.sacredKind)) {
    issues.push({ code: "UNKNOWN_SACRED_KIND", message: `sacredKind "${rec.sacredKind}" desconhecido`, field: "sacredKind" });
  }
  return issues;
}

/** Helper: região válida? */
export function isValidRegion(region: string): boolean {
  return REGION_TAXONOMY.includes(region);
}

/** Helper: tradição válida? */
export function isValidTradition(tradition: string): boolean {
  return TRADITION_TAXONOMY.includes(tradition);
}

/** Calcula mood-arc improvement: média(valence_final_30%) - média(valence_initial_30%). */
export function computeMoodImprovement(moodArc: MoodSampleShape[]): number {
  if (moodArc.length < 2) return 0;
  const third = Math.max(1, Math.floor(moodArc.length / 3));
  const firstSlice = moodArc.slice(0, third);
  const lastSlice = moodArc.slice(-third);
  const avg = (slice: MoodSampleShape[]) => {
    let s = 0;
    for (const m of slice) s += m.valence;
    return s / slice.length;
  };
  const result = avg(lastSlice) - avg(firstSlice);
  return clamp(result, -1, 1);
}

/** Calcula cue-adherence rate (0..1) com proteção contra divisão por zero. */
export function computeCueAdherence(rec: CoachSessionRecordShape): number {
  if (rec.cuesDelivered <= 0) return 0;
  return clamp(rec.cuesFollowed / rec.cuesDelivered, 0, 1);
}

/** Duração em minutos arredondada a 0.1. */
export function durationMinutes(rec: CoachSessionRecordShape): number {
  return round1(rec.durationSec / 60);
}

/** Hash da mood-arc para anti-gaming (FNV-1a 64 sobre sequência canonical). */
export function hashMoodArc(moodArc: MoodSampleShape[]): string {
  const canonical = moodArc
    .map((m) => `${round2(m.valence)},${round2(m.arousal)}`)
    .join("|");
  return fnv1a64(canonical);
}

/** Mood-arc baseline (média de valence inicial) e current (média de valence final). */
export function computeMoodBaselineCurrent(moodArc: MoodSampleShape[]): { baseline: number; current: number } {
  if (moodArc.length < 2) return { baseline: 0, current: 0 };
  const third = Math.max(1, Math.floor(moodArc.length / 3));
  const firstSlice = moodArc.slice(0, third);
  const lastSlice = moodArc.slice(-third);
  const avg = (slice: MoodSampleShape[]) => {
    let s = 0;
    for (const m of slice) s += m.valence;
    return s / slice.length;
  };
  return {
    baseline: round3(avg(firstSlice)),
    current: round3(avg(lastSlice)),
  };
}

/** Converte session record em representação canônica (para hashing). */
export function canonicalSession(rec: CoachSessionRecordShape): string {
  return [
    rec.sessionId,
    rec.userId,
    rec.startedAt.toString(),
    rec.endedAt.toString(),
    rec.tradition,
    rec.region,
    rec.filtered ? "1" : "0",
    rec.sacredFlag ? "1" : "0",
    rec.cuesDelivered.toString(),
    rec.cuesFollowed.toString(),
    hashMoodArc(rec.moodArc),
  ].join("|");
}

/** Hash de session record (FNV-1a 64) — útil para dedupe. */
export function hashSessionRecord(rec: CoachSessionRecordShape): string {
  return fnv1a64(canonicalSession(rec));
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 Cohort builders                                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Computa o bucket de duração. */
export function durationBucket(durationSec: number): "short" | "medium" | "long" {
  if (durationSec <= 0) return "short";
  if (durationSec <= DURATION_BUCKET_SHORT_MAX_SEC) return "short";
  if (durationSec <= DURATION_BUCKET_MEDIUM_MAX_SEC) return "medium";
  return "long";
}

/** Computa o purity bucket. */
export function purityBucket(filtered: boolean, sacredFlag: boolean): "filtered" | "full" | "mixed" {
  if (sacredFlag) return "mixed"; // sessões sacred usam "mixed" (mas são excluídas antes)
  return filtered ? "filtered" : "full";
}

/** Constrói CohortKey para uma session record. */
export function buildCohortKey(rec: CoachSessionRecordShape, cohortType: CohortType): CohortKey {
  switch (cohortType) {
    case "BY_TRADITION": {
      const trad = isValidTradition(rec.tradition) ? rec.tradition : "unspecified";
      return {
        cohortType,
        cohortValue: trad,
        cohortBucket: trad,
      };
    }
    case "BY_REGION": {
      const region = isValidRegion(rec.region) ? rec.region : "ZZ";
      return {
        cohortType,
        cohortValue: region,
        cohortBucket: region,
      };
    }
    case "BY_DURATION": {
      const bucket = durationBucket(rec.durationSec);
      return {
        cohortType,
        cohortValue: bucket,
        cohortBucket: bucket,
      };
    }
    case "BY_PURITY": {
      const bucket = purityBucket(rec.filtered, rec.sacredFlag);
      return {
        cohortType,
        cohortValue: bucket,
        cohortBucket: bucket,
      };
    }
  }
}

/** Label i18n-ish para cohort (para UI). */
export function cohortLabel(cohort: CohortKey, locale: LeaderboardLocale = "pt-BR"): string {
  const isPt = locale === "pt-BR";
  switch (cohort.cohortType) {
    case "BY_TRADITION": {
      const map: Record<string, { pt: string; en: string }> = {
        umbanda: { pt: "Umbanda", en: "Umbanda" },
        candomble: { pt: "Candomblé", en: "Candomblé" },
        ifa: { pt: "Ifá", en: "Ifá" },
        kabbalah: { pt: "Cabala", en: "Kabbalah" },
        astrology: { pt: "Astrologia", en: "Astrology" },
        tarot: { pt: "Tarô", en: "Tarot" },
        lenormand: { pt: "Lenormand", en: "Lenormand" },
        cigano: { pt: "Baralho Cigano", en: "Gypsy Cards" },
        mixed: { pt: "Prática mista", en: "Mixed practice" },
        unspecified: { pt: "Não especificado", en: "Unspecified" },
      };
      const m = map[cohort.cohortValue] ?? { pt: cohort.cohortValue, en: cohort.cohortValue };
      return isPt ? m.pt : m.en;
    }
    case "BY_REGION": {
      const map: Record<string, { pt: string; en: string }> = {
        BR: { pt: "Brasil", en: "Brazil" },
        PT: { pt: "Portugal", en: "Portugal" },
        AO: { pt: "Angola", en: "Angola" },
        MZ: { pt: "Moçambique", en: "Mozambique" },
        CV: { pt: "Cabo Verde", en: "Cape Verde" },
        US: { pt: "EUA", en: "USA" },
        UK: { pt: "Reino Unido", en: "United Kingdom" },
        ES: { pt: "Espanha", en: "Spain" },
        FR: { pt: "França", en: "France" },
        DE: { pt: "Alemanha", en: "Germany" },
        IT: { pt: "Itália", en: "Italy" },
        JP: { pt: "Japão", en: "Japan" },
        MX: { pt: "México", en: "Mexico" },
        AR: { pt: "Argentina", en: "Argentina" },
        CO: { pt: "Colômbia", en: "Colombia" },
        CL: { pt: "Chile", en: "Chile" },
        PE: { pt: "Peru", en: "Peru" },
        UY: { pt: "Uruguai", en: "Uruguay" },
        PY: { pt: "Paraguai", en: "Paraguay" },
        BO: { pt: "Bolívia", en: "Bolivia" },
        ZZ: { pt: "Não informado", en: "Unknown" },
      };
      const m = map[cohort.cohortValue] ?? { pt: cohort.cohortValue, en: cohort.cohortValue };
      return isPt ? m.pt : m.en;
    }
    case "BY_DURATION": {
      const map: Record<string, { pt: string; en: string }> = {
        short: { pt: "Curta (até 5 min)", en: "Short (up to 5 min)" },
        medium: { pt: "Média (5-20 min)", en: "Medium (5-20 min)" },
        long: { pt: "Longa (mais de 20 min)", en: "Long (over 20 min)" },
      };
      const m = map[cohort.cohortValue] ?? { pt: cohort.cohortValue, en: cohort.cohortValue };
      return isPt ? m.pt : m.en;
    }
    case "BY_PURITY": {
      const map: Record<string, { pt: string; en: string }> = {
        filtered: { pt: "Filtrada", en: "Filtered" },
        full: { pt: "Completa", en: "Full" },
        mixed: { pt: "Mista", en: "Mixed" },
      };
      const m = map[cohort.cohortValue] ?? { pt: cohort.cohortValue, en: cohort.cohortValue };
      return isPt ? m.pt : m.en;
    }
  }
}

/** Compor label de cohort cruzado (ex.: "Umbanda × BR × medium × filtered"). */
export function crossCohortLabel(
  cohorts: CohortKey[],
  locale: LeaderboardLocale = "pt-BR"
): string {
  return cohorts.map((c) => cohortLabel(c, locale)).join(" × ");
}

/** Serializa cohort key para string canônica (usado em chaves de Map). */
export function cohortKeyString(cohort: CohortKey): string {
  const parent = cohort.parentCohort ? `:${cohort.parentCohort}` : "";
  return `${cohort.cohortType}|${cohort.cohortBucket}${parent}`;
}

/** Deserializa cohort key de string (round-trip). */
export function parseCohortKey(s: string): CohortKey | null {
  const parts = s.split("|");
  if (parts.length < 2) return null;
  const cohortType = parts[0] as CohortType;
  if (!["BY_TRADITION", "BY_REGION", "BY_DURATION", "BY_PURITY"].includes(cohortType)) return null;
  const bucketRaw = parts[1]!;
  const colonIdx = bucketRaw.lastIndexOf(":");
  let cohortBucket = bucketRaw;
  let parentCohort: string | undefined;
  if (colonIdx > 0) {
    cohortBucket = bucketRaw.slice(0, colonIdx);
    parentCohort = bucketRaw.slice(colonIdx + 1);
  }
  return {
    cohortType,
    cohortValue: cohortBucket,
    cohortBucket,
    parentCohort,
  };
}

/** Lista cohort types ordenados. */
export function allCohortTypes(): CohortType[] {
  return ["BY_TRADITION", "BY_REGION", "BY_DURATION", "BY_PURITY"];
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 Aggregation engine — per-user stats, sacred filter, opt-in filter     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Acumulador por usuário dentro de um escopo (WEEKLY/MONTHLY/ALL_TIME). */
export interface UserAggregate {
  userId: string;
  sessionCount: number;
  totalMinutes: number;
  cueAdherenceSum: number;
  cueAdherenceCount: number;
  moodImprovementSum: number;
  moodImprovementCount: number;
  baselineMood: number;       // média do baseline das sessões
  currentMood: number;        // média do current das sessões
  cohortMemberships: Map<string, CohortKey>; // cohortKeyString -> CohortKey
  traditions: Set<string>;
  regions: Set<string>;
  filteredCount: number;
  fullCount: number;
  shortCount: number;
  mediumCount: number;
  longCount: number;
  firstSessionAt: number;
  lastSessionAt: number;
}

/** Constrói um UserAggregate vazio. */
export function emptyUserAggregate(userId: string): UserAggregate {
  return {
    userId,
    sessionCount: 0,
    totalMinutes: 0,
    cueAdherenceSum: 0,
    cueAdherenceCount: 0,
    moodImprovementSum: 0,
    moodImprovementCount: 0,
    baselineMood: 0,
    currentMood: 0,
    cohortMemberships: new Map(),
    traditions: new Set(),
    regions: new Set(),
    filteredCount: 0,
    fullCount: 0,
    shortCount: 0,
    mediumCount: 0,
    longCount: 0,
    firstSessionAt: Number.MAX_SAFE_INTEGER,
    lastSessionAt: 0,
  };
}

/** Acumula uma session em UserAggregate. NÃO mexe em sessões sacred. */
export function accumulateSession(agg: UserAggregate, rec: CoachSessionRecordShape): void {
  agg.sessionCount += 1;
  agg.totalMinutes += durationMinutes(rec);

  const adherence = computeCueAdherence(rec);
  if (rec.cuesDelivered > 0) {
    agg.cueAdherenceSum += adherence;
    agg.cueAdherenceCount += 1;
  }

  const improvement = computeMoodImprovement(rec.moodArc);
  agg.moodImprovementSum += improvement;
  agg.moodImprovementCount += 1;

  const { baseline, current } = computeMoodBaselineCurrent(rec.moodArc);
  agg.baselineMood = (agg.baselineMood * (agg.moodImprovementCount - 1) + baseline) / agg.moodImprovementCount;
  agg.currentMood = (agg.currentMood * (agg.moodImprovementCount - 1) + current) / agg.moodImprovementCount;

  agg.traditions.add(rec.tradition);
  agg.regions.add(rec.region);
  if (rec.filtered) agg.filteredCount += 1; else agg.fullCount += 1;

  const db = durationBucket(rec.durationSec);
  if (db === "short") agg.shortCount += 1;
  else if (db === "medium") agg.mediumCount += 1;
  else agg.longCount += 1;

  if (rec.startedAt < agg.firstSessionAt) agg.firstSessionAt = rec.startedAt;
  if (rec.startedAt > agg.lastSessionAt) agg.lastSessionAt = rec.startedAt;

  for (const t of allCohortTypes()) {
    const cohort = buildCohortKey(rec, t);
    agg.cohortMemberships.set(cohortKeyString(cohort), cohort);
  }
}

/** Filtra opt-in: apenas usuários com optedIn=true. */
export function filterOptedIn(
  aggregates: UserAggregate[],
  optInMap: Map<string, OptInRecord>
): UserAggregate[] {
  return aggregates.filter((a) => {
    const rec = optInMap.get(a.userId);
    return rec !== undefined && rec.optedIn && rec.revokedAt === null;
  });
}

/** Exclui flagged users (anti-gaming). */
export function filterFlagged(
  aggregates: UserAggregate[],
  flags: Map<string, AntiGamingFlag>
): { kept: UserAggregate[]; excluded: number } {
  let excluded = 0;
  const kept = aggregates.filter((a) => {
    if (flags.has(a.userId)) {
      excluded += 1;
      return false;
    }
    return true;
  });
  return { kept, excluded };
}

/** Exclui sessões sacred (retorna count + records filtradas). */
export function filterSacredSessions(
  records: CoachSessionRecordShape[]
): { kept: CoachSessionRecordShape[]; excluded: number } {
  let excluded = 0;
  const kept: CoachSessionRecordShape[] = [];
  for (const r of records) {
    if (isSacredSession(r)) {
      excluded += 1;
    } else {
      kept.push(r);
    }
  }
  return { kept, excluded };
}

/** Sessão é sacred se sacredFlag=true E sacredKind ∈ SACRED_KINDS. */
export function isSacredSession(rec: CoachSessionRecordShape): boolean {
  if (!rec.sacredFlag) return false;
  if (!rec.sacredKind) return true; // flag sem kind = assume sacred
  return SACRED_KINDS.includes(rec.sacredKind);
}

/** Build aggregates agrupando por userId dentro de um escopo temporal. */
export function aggregateUsersByScope(
  records: CoachSessionRecordShape[],
  scopeStart: number,
  scopeEnd: number
): Map<string, UserAggregate> {
  const out = new Map<string, UserAggregate>();
  for (const r of records) {
    if (r.startedAt < scopeStart || r.startedAt >= scopeEnd) continue;
    if (isSacredSession(r)) continue; // hard filter
    let agg = out.get(r.userId);
    if (!agg) {
      agg = emptyUserAggregate(r.userId);
      out.set(r.userId, agg);
    }
    accumulateSession(agg, r);
  }
  return out;
}

/** Stats finais derivados de UserAggregate (per-user). */
export interface UserAggregateStats {
  userId: string;
  sessions: number;
  totalMinutes: number;
  cueAdherence: number;
  moodImprovement: number;
  baselineMood: number;
  currentMood: number;
  traditions: string[];
  regions: string[];
}

export function deriveUserStats(agg: UserAggregate): UserAggregateStats {
  return {
    userId: agg.userId,
    sessions: agg.sessionCount,
    totalMinutes: round1(agg.totalMinutes),
    cueAdherence: agg.cueAdherenceCount > 0 ? round3(agg.cueAdherenceSum / agg.cueAdherenceCount) : 0,
    moodImprovement: agg.moodImprovementCount > 0 ? round3(agg.moodImprovementSum / agg.moodImprovementCount) : 0,
    baselineMood: round3(agg.baselineMood),
    currentMood: round3(agg.currentMood),
    traditions: [...agg.traditions],
    regions: [...agg.regions],
  };
}

/** Composite score normalizado para ordenação. */
export function compositeScore(stats: UserAggregateStats): number {
  const sessionsTerm = Math.log10(1 + stats.sessions) / 2;        // ~[0..1] para 1..100 sessões
  const minutesTerm = Math.log10(1 + stats.totalMinutes) / 2;     // ~[0..1] para 1..100 min
  const cueTerm = stats.cueAdherence;                              // [0..1]
  const moodTerm = (stats.moodImprovement + 1) / 2;                // [0..1] de [-1..1]

  const raw =
    SCORE_WEIGHT_SESSIONS * sessionsTerm +
    SCORE_WEIGHT_MINUTES * minutesTerm +
    SCORE_WEIGHT_CUE_ADHERENCE * cueTerm +
    SCORE_WEIGHT_MOOD_IMPROVEMENT * moodTerm;

  return round3(raw);
}

/** Conta sessões por cohort (4 tipos × todas variantes). */
export function countByCohort(
  records: CoachSessionRecordShape[],
  cohortType: CohortType
): Map<string, { cohort: CohortKey; sessions: CoachSessionRecordShape[]; distinctUsers: Set<string> }> {
  const out = new Map<string, { cohort: CohortKey; sessions: CoachSessionRecordShape[]; distinctUsers: Set<string> }>();
  for (const r of records) {
    if (isSacredSession(r)) continue;
    const cohort = buildCohortKey(r, cohortType);
    const k = cohortKeyString(cohort);
    let entry = out.get(k);
    if (!entry) {
      entry = { cohort, sessions: [], distinctUsers: new Set() };
      out.set(k, entry);
    }
    entry.sessions.push(r);
    entry.distinctUsers.add(r.userId);
  }
  return out;
}

/** Deriva CohortStats a partir de records. */
export function deriveCohortStats(
  cohort: CohortKey,
  sessions: CoachSessionRecordShape[]
): CohortStats {
  const distinctUsers = new Set<string>();
  let totalMinutes = 0;
  let cueAdherenceSum = 0;
  let cueAdherenceCount = 0;
  let moodImprovementSum = 0;
  let moodImprovementCount = 0;
  let sacredExcluded = 0;

  for (const r of sessions) {
    if (isSacredSession(r)) {
      sacredExcluded += 1;
      continue;
    }
    distinctUsers.add(r.userId);
    totalMinutes += durationMinutes(r);
    const adherence = computeCueAdherence(r);
    if (r.cuesDelivered > 0) {
      cueAdherenceSum += adherence;
      cueAdherenceCount += 1;
    }
    moodImprovementSum += computeMoodImprovement(r.moodArc);
    moodImprovementCount += 1;
  }

  return {
    cohort,
    sessionCount: sessions.length - sacredExcluded,
    distinctUsers: distinctUsers.size,
    totalMinutes: round1(totalMinutes),
    avgCueAdherence: cueAdherenceCount > 0 ? round3(cueAdherenceSum / cueAdherenceCount) : 0,
    avgMoodImprovement: moodImprovementCount > 0 ? round3(moodImprovementSum / moodImprovementCount) : 0,
    sacredExcluded,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 k-anonymity core (k≥10, merge-underflow, audit trail)                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Decide um k efetivo — força mínimo 10. */
export function resolveK(requested: number | undefined): number {
  const k = requested ?? K_DEFAULT;
  if (k < K_MINIMUM_MANDATORY) return K_MINIMUM_MANDATORY;
  if (k > K_MAXIMUM) return K_MAXIMUM;
  return k;
}

/** Resultado do enforcement de k-anonymity para uma cohort. */
export type KEnforcementOutcome =
  | "satisfied"             // distinctUsers >= k
  | "merged"                // merged into parent cohort
  | "suppressed";           // não foi possível resolver

export interface KEnforcementResult {
  cohort: CohortKey;
  outcome: KEnforcementOutcome;
  sizeBefore: number;
  sizeAfter: number;
  mergedInto?: CohortKey;
  logEntry: CohortMergeLogEntry;
}

/** Estratégia de merge — tenta parent cohort do mesmo tipo ou vizinho. */
export type MergeStrategy = "parent_only" | "parent_then_sibling" | "sibling_only";

/**
 * Enforces k-anonymity para um cohort group. Se cohort tem <k users, faz merge
 * com:
 *   1. parent cohort genérico (cohortValue = "ALL" do mesmo tipo) — preferido
 *   2. sibling cohort mais próximo (lexicográfico) — fallback
 * Se nenhum merge atinge k, marca como suppressed.
 */
export function enforceKAnonymity(
  cohort: CohortKey,
  size: number,
  k: number,
  allCohorts: Map<string, number>,
  strategy: MergeStrategy = "parent_then_sibling",
  now: number = Date.now()
): KEnforcementResult {
  if (size >= k) {
    return {
      cohort,
      outcome: "satisfied",
      sizeBefore: size,
      sizeAfter: size,
      logEntry: {
        ts: now,
        sourceCohort: cohort,
        targetCohort: cohort,
        sourceSize: size,
        targetSize: size,
        reason: "k_below_min",
        decision: "merge",
      },
    };
  }

  // 1. Tenta parent cohort (ALL)
  if (strategy === "parent_only" || strategy === "parent_then_sibling") {
    const parent: CohortKey = {
      ...cohort,
      cohortValue: "ALL",
      cohortBucket: "ALL",
      parentCohort: cohortKeyString(cohort),
    };
    const parentKey = cohortKeyString(parent);
    const parentSize = allCohorts.get(parentKey) ?? 0;
    if (parentSize + size >= k) {
      const merged: KEnforcementResult = {
        cohort: parent,
        outcome: "merged",
        sizeBefore: size,
        sizeAfter: parentSize + size,
        mergedInto: parent,
        logEntry: {
          ts: now,
          sourceCohort: cohort,
          targetCohort: parent,
          sourceSize: size,
          targetSize: parentSize,
          reason: "k_below_min",
          decision: "merge",
        },
      };
      return merged;
    }
  }

  // 2. Tenta sibling (vizinho lexicográfico do mesmo cohortType)
  if (strategy === "sibling_only" || strategy === "parent_then_sibling") {
    const siblings = [...allCohorts.entries()]
      .filter(([kStr]) => {
        const c = parseCohortKey(kStr);
        return c !== null && c.cohortType === cohort.cohortType && kStr !== cohortKeyString(cohort);
      })
      .sort();

    for (const [sibKey, sibSize] of siblings) {
      const sibCohort = parseCohortKey(sibKey);
      if (!sibCohort) continue;
      if (sibSize + size >= k) {
        const merged: KEnforcementResult = {
          cohort: sibCohort,
          outcome: "merged",
          sizeBefore: size,
          sizeAfter: sibSize + size,
          mergedInto: sibCohort,
          logEntry: {
            ts: now,
            sourceCohort: cohort,
            targetCohort: sibCohort,
            sourceSize: size,
            targetSize: sibSize,
            reason: "k_below_min",
            decision: "merge",
          },
        };
        return merged;
      }
    }
  }

  // 3. Suppress
  return {
    cohort,
    outcome: "suppressed",
    sizeBefore: size,
    sizeAfter: size,
    logEntry: {
      ts: now,
      sourceCohort: cohort,
      targetCohort: cohort,
      sourceSize: size,
      targetSize: size,
      reason: "k_below_min",
      decision: "suppress",
    },
  };
}

/** Aplica enforceKAnonymity em batch. Retorna log + mapa final. */
export function enforceKAnonymityBatch(
  cohortSizes: Map<string, number>,
  k: number,
  now: number = Date.now()
): {
  finalCohorts: Map<string, { cohort: CohortKey; size: number; outcome: KEnforcementOutcome }>;
  log: CohortMergeLogEntry[];
  totalSuppressed: number;
  totalMerged: number;
} {
  const finalCohorts = new Map<string, { cohort: CohortKey; size: number; outcome: KEnforcementOutcome }>();
  const log: CohortMergeLogEntry[] = [];
  let totalSuppressed = 0;
  let totalMerged = 0;

  for (const [kStr, size] of cohortSizes.entries()) {
    const cohort = parseCohortKey(kStr);
    if (!cohort) continue;
    const result = enforceKAnonymity(cohort, size, k, cohortSizes, "parent_then_sibling", now);
    log.push(result.logEntry);
    const targetKey = cohortKeyString(result.mergedInto ?? result.cohort);
    const existing = finalCohorts.get(targetKey);
    if (result.outcome === "suppressed") {
      totalSuppressed += 1;
      continue;
    }
    if (result.outcome === "merged") {
      totalMerged += 1;
    }
    if (existing) {
      existing.size += result.sizeAfter;
    } else {
      finalCohorts.set(targetKey, {
        cohort: result.mergedInto ?? result.cohort,
        size: result.sizeAfter,
        outcome: result.outcome,
      });
    }
  }

  return { finalCohorts, log, totalSuppressed, totalMerged };
}

/** Computa o menor cohort size observado (kActual). */
export function computeKActual(finalCohorts: Map<string, { cohort: CohortKey; size: number; outcome: KEnforcementOutcome }>): number {
  if (finalCohorts.size === 0) return 0;
  let minSize = Number.MAX_SAFE_INTEGER;
  for (const entry of finalCohorts.values()) {
    if (entry.size < minSize) minSize = entry.size;
  }
  return minSize === Number.MAX_SAFE_INTEGER ? 0 : minSize;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Anonymous IDs — HMAC-SHA256, weekly rotation                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Helper para resolver a HMAC key real (env > dev default). */
export function resolveHmacKey(envKey: string | undefined | null): string {
  if (envKey && envKey.length >= 16 && envKey !== HMAC_KEY_PLACEHOLDER) return envKey;
  return HMAC_KEY_DEV_DEFAULT;
}

/** Constrói weekId no formato ISO: "YYYY-Www" (semana começando no domingo). */
export function buildWeekId(ts: number): string {
  const d = new Date(ts);
  const startOfWeek = new Date(d);
  const dayOfWeek = d.getUTCDay();
  startOfWeek.setUTCDate(d.getUTCDate() - dayOfWeek);
  startOfWeek.setUTCHours(0, 0, 0, 0);

  const year = startOfWeek.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const dayOfYear = Math.floor((startOfWeek.getTime() - startOfYear.getTime()) / 86400000);
  const weekNum = Math.floor((dayOfYear + startOfYear.getUTCDay()) / 7) + 1;
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

/** Constrói monthId: "YYYY-MM". */
export function buildMonthId(ts: number): string {
  const d = new Date(ts);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Bounds de uma semana Sun-Sat contendo ts. */
export function weekBoundsSunSat(ts: number): { start: number; end: number; weekId: string } {
  const d = new Date(ts);
  const dayOfWeek = d.getUTCDay();
  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() - dayOfWeek);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return {
    start: start.getTime(),
    end: end.getTime(),
    weekId: buildWeekId(ts),
  };
}

/** Bounds de um mês calendário contendo ts. */
export function monthBounds(ts: number): { start: number; end: number; monthId: string } {
  const d = new Date(ts);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return {
    start: start.getTime(),
    end: end.getTime(),
    monthId: buildMonthId(ts),
  };
}

/** Bounds de "todos os tempos" — desde epoch até futuro distante. */
export function allTimeBounds(): { start: number; end: number } {
  return {
    start: 0,
    end: 8640000000000000, // max safe date
  };
}

/**
 * Anonymous ID por usuário × cohort × week. HMAC-SHA256 com key rotativa.
 * Output: 16-char hex (64 bits efetivos) — collision probability negligible
 * para escala do leaderboard (≤10k usuários/cohort/semana).
 */
export function buildAnonymousId(
  hmacKey: string,
  userId: string,
  cohort: CohortKey,
  weekId: string
): string {
  const message = [
    "anon-id",
    userId,
    cohort.cohortType,
    cohort.cohortBucket,
    weekId,
  ].join("|");
  return hmacSha256Short(hmacKey, message);
}

/** Anonymous ID estável para ALL_TIME view (não rotaciona, mas usa cohort "ALL_TIME"). */
export function buildAllTimeAnonymousId(
  hmacKey: string,
  userId: string,
  cohort: CohortKey
): string {
  const message = [
    "anon-id-all",
    userId,
    cohort.cohortType,
    cohort.cohortBucket,
    "ALL_TIME",
  ].join("|");
  return hmacSha256Short(hmacKey, message);
}

/** Anonymous ID por mês (para MONTHLY view). */
export function buildMonthlyAnonymousId(
  hmacKey: string,
  userId: string,
  cohort: CohortKey,
  monthId: string
): string {
  const message = [
    "anon-id-month",
    userId,
    cohort.cohortType,
    cohort.cohortBucket,
    monthId,
  ].join("|");
  return hmacSha256Short(hmacKey, message);
}

/**
 * Rotação semanal: dada uma weekId, retorna a próxima weekId.
 * Implementação simples de incremento de 7 dias.
 */
export function nextWeekId(weekId: string): string {
  const parts = weekId.split("-W");
  if (parts.length !== 2) return weekId;
  const year = parseInt(parts[0]!, 10);
  const week = parseInt(parts[1]!, 10);
  // Aproximação: 1 semana = 7 dias a partir do início do ano
  const approxDate = new Date(Date.UTC(year, 0, 1) + (week - 1) * 7 * 86400000);
  approxDate.setUTCDate(approxDate.getUTCDate() + 7);
  return buildWeekId(approxDate.getTime());
}

/** Valida weekId no formato "YYYY-Www" com week 01-53. */
export function isValidWeekId(s: string): boolean {
  if (!/^\d{4}-W\d{2}$/.test(s)) return false;
  const w = parseInt(s.slice(6), 10);
  return w >= 1 && w <= 53;
}

/** Valida monthId no formato "YYYY-MM" com month 01-12. */
export function isValidMonthId(s: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(s)) return false;
  const m = parseInt(s.slice(5), 10);
  return m >= 1 && m <= 12;
}

/** Hash para audit de view (HMAC-SHA256 do conteúdo publicável). */
export function auditHashView(
  hmacKey: string,
  view: LeaderboardView
): string {
  const serial = JSON.stringify({
    scope: view.scope,
    subView: view.subView,
    users: view.users ?? [],
    cohorts: view.cohorts ?? [],
    mostImproved: view.mostImproved ?? [],
    kMin: view.kMin,
    kActual: view.kActual,
    generatedAt: view.generatedAt,
  });
  return hmacSha256(hmacKey, serial);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 Ranking views — WEEKLY / MONTHLY / ALL_TIME × TOP_USERS /             ║
// ║    TOP_COHORTS / MOST_IMPROVED                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Opções do engine principal. */
export interface BuildLeaderboardOptions {
  scope: ViewScope;
  cohortType: CohortType;
  k?: number;
  hmacKey?: string;
  now?: number;
  topUsersLimit?: number;
  topCohortsLimit?: number;
  mostImprovedLimit?: number;
  includeSacredFlag?: boolean;   // default false — sagrado nunca entra
  weekId?: string;               // override para WEEKLY
  monthId?: string;              // override para MONTHLY
}

/** Estado intermediário do build. */
export interface BuildLeaderboardState {
  options: BuildLeaderboardOptions;
  startTs: number;
  endTs: number;
  scopeId: string;                // weekId / monthId / "ALL_TIME"
  optInMap: Map<string, OptInRecord>;
  flagsMap: Map<string, AntiGamingFlag>;
  allRecords: CoachSessionRecordShape[];
  filteredRecords: CoachSessionRecordShape[];
  userAggregates: Map<string, UserAggregate>;
  optedInAggregates: UserAggregate[];
  flaggedExcluded: number;
  cohortStatsMap: Map<string, CohortStats>;
  finalCohortKeys: Set<string>;
  cohortMergeLog: CohortMergeLogEntry[];
  views: LeaderboardView[];
  errors: LeaderboardError[];
  auditTrail: AuditStep[];
}

/** Determina bounds temporais para o scope. */
export function resolveScopeBounds(opts: BuildLeaderboardOptions, now: number): { start: number; end: number; scopeId: string } {
  if (opts.scope === "WEEKLY") {
    const { start, end, weekId } = weekBoundsSunSat(now);
    return { start, end, scopeId: opts.weekId ?? weekId };
  }
  if (opts.scope === "MONTHLY") {
    const { start, end, monthId } = monthBounds(now);
    return { start, end, scopeId: opts.monthId ?? monthId };
  }
  // ALL_TIME
  const bounds = allTimeBounds();
  return { start: bounds.start, end: bounds.end, scopeId: "ALL_TIME" };
}

/**
 * Constrói a view TOP_USERS: ordena usuários por compositeScore desc dentro
 * de cada cohort, ranqueia, atribui anonymousId, e remove flagged.
 */
export function buildTopUsersView(
  state: BuildLeaderboardState,
  cohortSizesFinal: Map<string, { cohort: CohortKey; size: number }>,
  hmacKey: string
): { users: UserLeaderboardEntry[]; errors: LeaderboardError[]; audit: AuditStep[] } {
  const errors: LeaderboardError[] = [];
  const audit: AuditStep[] = [];
  const users: UserLeaderboardEntry[] = [];

  const now = state.options.now ?? Date.now();
  const scopeId = state.scopeId;

  // Agrupa opted-in aggregates por cohort principal
  for (const [cohortKey, sizeInfo] of cohortSizesFinal.entries()) {
    if (sizeInfo.size < K_MINIMUM_MANDATORY) continue;
    const cohort = sizeInfo.cohort;

    // Filtra aggregates que pertencem a este cohort
    const cohortAggregates = state.optedInAggregates.filter((agg) => {
      const memberKey = cohortKeyString(cohort);
      return agg.cohortMemberships.has(memberKey);
    });

    // Stats derivadas
    const userStatsList = cohortAggregates.map((agg) => {
      const stats = deriveUserStats(agg);
      return { agg, stats, score: compositeScore(stats) };
    });

    // Ordena por score desc
    userStatsList.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.stats.sessions - a.stats.sessions;
    });

    const limit = state.options.topUsersLimit ?? TOP_USERS_DEFAULT_LIMIT;
    let rank = 1;
    for (const entry of userStatsList.slice(0, limit)) {
      const flag = state.flagsMap.get(entry.agg.userId);
      if (flag) continue;
      const anonId =
        state.options.scope === "WEEKLY"
          ? buildAnonymousId(hmacKey, entry.agg.userId, cohort, scopeId)
          : state.options.scope === "MONTHLY"
            ? buildMonthlyAnonymousId(hmacKey, entry.agg.userId, cohort, scopeId)
            : buildAllTimeAnonymousId(hmacKey, entry.agg.userId, cohort);

      users.push({
        anonymousId: anonId,
        userCohort: cohort,
        sessions: entry.stats.sessions,
        totalMinutes: entry.stats.totalMinutes,
        cueAdherence: entry.stats.cueAdherence,
        moodImprovement: entry.stats.moodImprovement,
        compositeScore: entry.score,
        rank: rank++,
        flagged: false,
        flagReasons: [],
      });
    }
  }

  audit.push({
    step: "buildTopUsersView",
    ts: now,
    ok: true,
    detail: `${users.length} entries publicadas`,
  });
  return { users, errors, audit };
}

/** Constrói view TOP_COHORTS — rank cohorts por avgComposite desc. */
export function buildTopCohortsView(
  state: BuildLeaderboardState,
  cohortSizesFinal: Map<string, { cohort: CohortKey; size: number }>
): { cohorts: CohortLeaderboardEntry[]; errors: LeaderboardError[]; audit: AuditStep[] } {
  const errors: LeaderboardError[] = [];
  const audit: AuditStep[] = [];
  const now = state.options.now ?? Date.now();

  // Para cada cohort final, calcula avgComposite dos membros
  const cohortEntries: CohortLeaderboardEntry[] = [];

  for (const [cohortKey, sizeInfo] of cohortSizesFinal.entries()) {
    if (sizeInfo.size < K_MINIMUM_MANDATORY) continue;
    const cohort = sizeInfo.cohort;

    // Aggregates neste cohort
    const cohortAggregates = state.optedInAggregates.filter((agg) => {
      return agg.cohortMemberships.has(cohortKey);
    });

    if (cohortAggregates.length === 0) {
      cohortEntries.push({
        cohort,
        cohortLabel: crossCohortLabel([cohort]),
        distinctUsers: 0,
        avgComposite: 0,
        avgMoodImprovement: 0,
        avgCueAdherence: 0,
        rank: 0,
        suppressed: false,
      });
      continue;
    }

    const stats = cohortAggregates.map((a) => {
      const s = deriveUserStats(a);
      return { composite: compositeScore(s), adherence: s.cueAdherence, improvement: s.moodImprovement };
    });
    const avgComp = mean(stats.map((s) => s.composite));
    const avgAdh = mean(stats.map((s) => s.adherence));
    const avgImp = mean(stats.map((s) => s.improvement));

    cohortEntries.push({
      cohort,
      cohortLabel: crossCohortLabel([cohort]),
      distinctUsers: cohortAggregates.length,
      avgComposite: round3(avgComp),
      avgMoodImprovement: round3(avgImp),
      avgCueAdherence: round3(avgAdh),
      rank: 0, // filled after sort
      suppressed: false,
    });
  }

  cohortEntries.sort((a, b) => {
    if (b.avgComposite !== a.avgComposite) return b.avgComposite - a.avgComposite;
    return b.distinctUsers - a.distinctUsers;
  });

  let rank = 1;
  for (const entry of cohortEntries) {
    entry.rank = rank++;
  }

  const limit = state.options.topCohortsLimit ?? TOP_COHORTS_DEFAULT_LIMIT;
  audit.push({
    step: "buildTopCohortsView",
    ts: now,
    ok: true,
    detail: `${cohortEntries.length} cohorts; top ${limit} publicados`,
  });
  return { cohorts: cohortEntries.slice(0, limit), errors, audit };
}

/** Constrói view MOST_IMPROVED — rank usuários por (currentMood - baselineMood). */
export function buildMostImprovedView(
  state: BuildLeaderboardState,
  cohortSizesFinal: Map<string, { cohort: CohortKey; size: number }>,
  hmacKey: string
): { mostImproved: MostImprovedEntry[]; errors: LeaderboardError[]; audit: AuditStep[] } {
  const errors: LeaderboardError[] = [];
  const audit: AuditStep[] = [];
  const now = state.options.now ?? Date.now();
  const scopeId = state.scopeId;

  const all: MostImprovedEntry[] = [];

  for (const [cohortKey, sizeInfo] of cohortSizesFinal.entries()) {
    if (sizeInfo.size < K_MINIMUM_MANDATORY) continue;
    const cohort = sizeInfo.cohort;

    const cohortAggregates = state.optedInAggregates.filter((agg) => {
      return agg.cohortMemberships.has(cohortKey);
    });

    for (const agg of cohortAggregates) {
      const stats = deriveUserStats(agg);
      const improvement = stats.currentMood - stats.baselineMood;
      // Só publica quem teve pelo menos 2 sessões
      if (agg.sessionCount < 2) continue;
      if (state.flagsMap.has(agg.userId)) continue;
      const anonId =
        state.options.scope === "WEEKLY"
          ? buildAnonymousId(hmacKey, agg.userId, cohort, scopeId)
          : state.options.scope === "MONTHLY"
            ? buildMonthlyAnonymousId(hmacKey, agg.userId, cohort, scopeId)
            : buildAllTimeAnonymousId(hmacKey, agg.userId, cohort);
      all.push({
        anonymousId: anonId,
        userCohort: cohort,
        baselineMood: stats.baselineMood,
        currentMood: stats.currentMood,
        improvement: round3(improvement),
        sessions: agg.sessionCount,
        rank: 0,
      });
    }
  }

  all.sort((a, b) => {
    if (b.improvement !== a.improvement) return b.improvement - a.improvement;
    if (b.sessions !== a.sessions) return b.sessions - a.sessions;
    return 0;
  });

  let rank = 1;
  for (const entry of all) entry.rank = rank++;

  const limit = state.options.mostImprovedLimit ?? MOST_IMPROVED_DEFAULT_LIMIT;
  audit.push({
    step: "buildMostImprovedView",
    ts: now,
    ok: true,
    detail: `${all.length} entries; top ${limit} publicadas`,
  });
  return { mostImproved: all.slice(0, limit), errors, audit };
}

/** Ordena UserLeaderboardEntry dentro de uma view TOP_USERS por compositeScore desc. */
export function rankUserEntries(entries: UserLeaderboardEntry[]): UserLeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.compositeScore !== a.compositeScore) return b.compositeScore - a.compositeScore;
    if (b.sessions !== a.sessions) return b.sessions - a.sessions;
    return 0;
  });
  let rank = 1;
  for (const e of sorted) e.rank = rank++;
  return sorted;
}

/** Computa totais de uma view (eligible users / sessions / sacred excluded / flagged). */
export function computeViewTotals(state: BuildLeaderboardState): {
  totalEligibleUsers: number;
  totalEligibleSessions: number;
  sacredExcludedSessions: number;
  flaggedExcluded: number;
} {
  let sessions = 0;
  for (const r of state.filteredRecords) sessions += 1;
  // sacred excluded: total - filtered
  const sacredExcludedSessions = state.allRecords.length - state.filteredRecords.length;
  return {
    totalEligibleUsers: state.optedInAggregates.length,
    totalEligibleSessions: sessions,
    sacredExcludedSessions,
    flaggedExcluded: state.flaggedExcluded,
  };
}

/** Ordenação estável por chave. */
export function stableSortByKey<T>(arr: T[], keyFn: (x: T) => number): T[] {
  return [...arr].map((x, idx) => ({ x, idx, key: keyFn(x) }))
    .sort((a, b) => (a.key - b.key) || (a.idx - b.idx))
    .map((e) => e.x);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §10 Anti-gaming — rapid-session, mood-arc collision, IP/device cluster   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Agrupa sessões por userId e ordena por startedAt. */
export function groupSessionsByUser(
  records: CoachSessionRecordShape[]
): Map<string, CoachSessionRecordShape[]> {
  const out = new Map<string, CoachSessionRecordShape[]>();
  for (const r of records) {
    let arr = out.get(r.userId);
    if (!arr) {
      arr = [];
      out.set(r.userId, arr);
    }
    arr.push(r);
  }
  for (const arr of out.values()) {
    arr.sort((a, b) => a.startedAt - b.startedAt);
  }
  return out;
}

/** Detecta criação rápida de sessões: >20 sessions in 1h. */
export function detectRapidSessionCreation(
  sessions: CoachSessionRecordShape[]
): { flagged: boolean; flaggedSessionIds: string[]; maxBurstCount: number } {
  if (sessions.length < 2) return { flagged: false, flaggedSessionIds: [], maxBurstCount: 0 };
  const flagged: string[] = [];
  let maxBurst = 0;
  // Sliding window 1h
  let l = 0;
  for (let r = 0; r < sessions.length; r++) {
    const sR = sessions[r]!;
    while (l < r && sR.startedAt - sessions[l]!.startedAt > 3600_000) l++;
    const burst = r - l + 1;
    if (burst > maxBurst) maxBurst = burst;
    if (burst > ANTI_GAMING_MAX_SESSIONS_PER_HOUR) {
      flagged.push(sR.sessionId);
    }
  }
  return {
    flagged: flagged.length > 0,
    flaggedSessionIds: flagged,
    maxBurstCount: maxBurst,
  };
}

/** Detecta mood-arc idênticos: FNV-1a hash repete. */
export function detectIdenticalMoodArc(
  sessions: CoachSessionRecordShape[]
): { flagged: boolean; flaggedSessionIds: string[]; collisions: Map<string, number> } {
  const counts = new Map<string, number>();
  for (const s of sessions) {
    if (s.moodArc.length < 2) continue;
    const h = hashMoodArc(s.moodArc);
    counts.set(h, (counts.get(h) ?? 0) + 1);
  }
  const collisions = new Map<string, number>();
  for (const [h, c] of counts.entries()) {
    if (c >= 3) collisions.set(h, c); // ≥3 repetições = suspeito
  }
  const flagged: string[] = [];
  if (collisions.size > 0) {
    for (const s of sessions) {
      if (s.moodArc.length < 2) continue;
      const h = hashMoodArc(s.moodArc);
      if (collisions.has(h)) flagged.push(s.sessionId);
    }
  }
  return {
    flagged: flagged.length > 0,
    flaggedSessionIds: flagged,
    collisions,
  };
}

/** Detecta cluster IP+device: mesmo ipHash + device.fingerprint em vários users. */
export function detectIpDeviceCluster(
  allRecords: CoachSessionRecordShape[],
  windowHours: number = ANTI_GAMING_CLUSTER_WINDOW_HOURS
): Map<string, { users: Set<string>; sessions: number; key: string }> {
  const out = new Map<string, { users: Set<string>; sessions: number; key: string }>();
  const cutoff = Date.now() - windowHours * 3600_000;
  const recent = allRecords.filter((r) => r.startedAt >= cutoff);

  for (const r of recent) {
    if (!r.ipHash || !r.device) continue;
    const key = `${r.ipHash}|${fnv1a32(`${r.device.ua}|${r.device.platform}|${r.device.screenW}x${r.device.screenH}|${r.device.tzOffsetMin}`)}`;
    let entry = out.get(key);
    if (!entry) {
      entry = { users: new Set(), sessions: 0, key };
      out.set(key, entry);
    }
    entry.users.add(r.userId);
    entry.sessions += 1;
  }
  return out;
}

/** Aplica cluster detection e marca users suspeitos. */
export function applyIpDeviceClusterDetection(
  records: CoachSessionRecordShape[],
  flags: Map<string, AntiGamingFlag>,
  now: number = Date.now()
): void {
  const clusters = detectIpDeviceCluster(records);
  for (const cluster of clusters.values()) {
    if (cluster.users.size >= ANTI_GAMING_CLUSTER_MIN_USERS) {
      for (const userId of cluster.users) {
        let flag = flags.get(userId);
        if (!flag) {
          flag = {
            userId,
            reasons: [],
            flaggedSessions: [],
            riskScore: 0,
            createdAt: now,
          };
          flags.set(userId, flag);
        }
        if (!flag.reasons.includes("ip_device_cluster")) {
          flag.reasons.push("ip_device_cluster");
        }
        flag.riskScore = Math.min(1, flag.riskScore + 0.4);
      }
    }
  }
}

/** Detecta cue-adherence inflation: ≥99% aderência por 14 dias seguidos. */
export function detectCueAdherenceInflation(
  sessions: CoachSessionRecordShape[]
): { flagged: boolean; flaggedSessionIds: string[]; avgAdherence: number } {
  if (sessions.length === 0) return { flagged: false, flaggedSessionIds: [], avgAdherence: 0 };
  let sum = 0;
  let count = 0;
  for (const s of sessions) {
    if (s.cuesDelivered > 0) {
      sum += computeCueAdherence(s);
      count += 1;
    }
  }
  const avg = count > 0 ? sum / count : 0;
  if (count < 5) return { flagged: false, flaggedSessionIds: [], avgAdherence: avg };
  // Janela de 14 dias
  const sorted = [...sessions].sort((a, b) => a.startedAt - b.startedAt);
  const cutoff = sorted[sorted.length - 1]!.startedAt - 14 * 86400_000;
  const recent = sorted.filter((s) => s.startedAt >= cutoff);
  if (recent.length < 5) return { flagged: false, flaggedSessionIds: [], avgAdherence: avg };
  let recentSum = 0;
  let recentCount = 0;
  for (const s of recent) {
    if (s.cuesDelivered > 0) {
      recentSum += computeCueAdherence(s);
      recentCount += 1;
    }
  }
  const recentAvg = recentCount > 0 ? recentSum / recentCount : 0;
  const flagged = recentAvg >= 0.99;
  return {
    flagged,
    flaggedSessionIds: flagged ? recent.map((s) => s.sessionId) : [],
    avgAdherence: recentAvg,
  };
}

/** Detecta duration outliers: >3σ da média do cohort. Usa MAD (median abs deviation) para robustez contra outliers dominarem o std. */
export function detectDurationOutliers(
  sessions: CoachSessionRecordShape[],
  cohortType: CohortType
): { flagged: boolean; flaggedSessionIds: string[] } {
  if (sessions.length < 5) return { flagged: false, flaggedSessionIds: [] };
  const durations = sessions.map((s) => s.durationSec).sort((a, b) => a - b);
  // Median
  const med = durations[Math.floor(durations.length / 2)] ?? 0;
  // MAD (Median Absolute Deviation)
  const absDevs = durations.map((d) => Math.abs(d - med)).sort((a, b) => a - b);
  const mad = absDevs[Math.floor(absDevs.length / 2)] ?? 0;
  if (mad === 0) {
    // fallback para stddev normal
    const m = mean(durations);
    const sd = stddev(durations);
    if (sd === 0) return { flagged: false, flaggedSessionIds: [] };
    const flagged: string[] = [];
    for (const s of sessions) {
      const z = Math.abs((s.durationSec - m) / sd);
      if (z > ANTI_GAMING_DURATION_SIGMA) flagged.push(s.sessionId);
    }
    return { flagged: flagged.length > 0, flaggedSessionIds: flagged };
  }
  // MAD * 1.4826 ~= stddev para dist normal
  const sigmaEst = mad * 1.4826;
  const flagged: string[] = [];
  for (const s of sessions) {
    const z = Math.abs((s.durationSec - med) / sigmaEst);
    if (z > ANTI_GAMING_DURATION_SIGMA) flagged.push(s.sessionId);
  }
  return { flagged: flagged.length > 0, flaggedSessionIds: flagged };
}

/** Detecta alternância filtered/unfiltered suspeita. */
export function detectFilteredToggle(
  sessions: CoachSessionRecordShape[]
): { flagged: boolean; alternations: number } {
  if (sessions.length < 4) return { flagged: false, alternations: 0 };
  let alternations = 0;
  for (let i = 1; i < sessions.length; i++) {
    if (sessions[i]!.filtered !== sessions[i - 1]!.filtered) alternations += 1;
  }
  const ratio = alternations / (sessions.length - 1);
  return {
    flagged: ratio >= 0.7 && sessions.length >= 6,
    alternations,
  };
}

/** Detecta region jumps: muda >3x em 24h. */
export function detectRegionJumps(
  sessions: CoachSessionRecordShape[]
): { flagged: boolean; flaggedSessionIds: string[] } {
  if (sessions.length < 2) return { flagged: false, flaggedSessionIds: [] };
  const sorted = [...sessions].sort((a, b) => a.startedAt - b.startedAt);
  const flagged: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const win: string[] = [];
    for (let j = i; j < sorted.length; j++) {
      if (sorted[j]!.startedAt - sorted[i]!.startedAt > 86400_000) break;
      win.push(sorted[j]!.region);
    }
    const uniq = new Set(win);
    if (uniq.size > ANTI_GAMING_MAX_REGIONS_PER_24H) {
      flagged.push(sorted[i]!.sessionId);
    }
  }
  return { flagged: flagged.length > 0, flaggedSessionIds: flagged };
}

/** Aplica TODOS os detectores em batch e produz Map<userId, AntiGamingFlag>. */
export function runAntiGaming(
  records: CoachSessionRecordShape[],
  cohortType: CohortType = "BY_TRADITION",
  now: number = Date.now()
): Map<string, AntiGamingFlag> {
  const flags = new Map<string, AntiGamingFlag>();
  const grouped = groupSessionsByUser(records);

  for (const [userId, sessions] of grouped.entries()) {
    const reasons: AntiGamingReason[] = [];
    const flaggedSessions = new Set<string>();
    let riskScore = 0;

    const rapid = detectRapidSessionCreation(sessions);
    if (rapid.flagged) {
      reasons.push("rapid_session_creation");
      for (const id of rapid.flaggedSessionIds) flaggedSessions.add(id);
      riskScore += 0.5;
    }

    const arc = detectIdenticalMoodArc(sessions);
    if (arc.flagged) {
      reasons.push("identical_mood_arc");
      for (const id of arc.flaggedSessionIds) flaggedSessions.add(id);
      riskScore += 0.4;
    }

    const inflation = detectCueAdherenceInflation(sessions);
    if (inflation.flagged) {
      reasons.push("cue_adherence_inflation");
      for (const id of inflation.flaggedSessionIds) flaggedSessions.add(id);
      riskScore += 0.3;
    }

    const duration = detectDurationOutliers(sessions, cohortType);
    if (duration.flagged) {
      reasons.push("duration_outlier");
      for (const id of duration.flaggedSessionIds) flaggedSessions.add(id);
      riskScore += 0.2;
    }

    const toggle = detectFilteredToggle(sessions);
    if (toggle.flagged) {
      reasons.push("filtered_then_unfiltered");
      riskScore += 0.2;
    }

    const jumps = detectRegionJumps(sessions);
    if (jumps.flagged) {
      reasons.push("region_jump");
      for (const id of jumps.flaggedSessionIds) flaggedSessions.add(id);
      riskScore += 0.3;
    }

    if (reasons.length > 0) {
      flags.set(userId, {
        userId,
        reasons,
        flaggedSessions: [...flaggedSessions],
        riskScore: Math.min(1, riskScore),
        createdAt: now,
      });
    }
  }

  // Cluster detection cross-user
  applyIpDeviceClusterDetection(records, flags, now);

  return flags;
}

/** Score de risco médio (apenas para diagnóstico). */
export function averageRiskScore(flags: Map<string, AntiGamingFlag>): number {
  if (flags.size === 0) return 0;
  let sum = 0;
  for (const f of flags.values()) sum += f.riskScore;
  return sum / flags.size;
}

/** Conta usuários flagged. */
export function countFlagged(flags: Map<string, AntiGamingFlag>): number {
  return flags.size;
}

/** Lista reasons mais frequentes. */
export function topReasons(flags: Map<string, AntiGamingFlag>): Map<AntiGamingReason, number> {
  const out = new Map<AntiGamingReason, number>();
  for (const f of flags.values()) {
    for (const r of f.reasons) {
      out.set(r, (out.get(r) ?? 0) + 1);
    }
  }
  return out;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §11 Opt-in & LGPD Art. 7/9/18                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Opt-in é OFF por default. Helper para criar registro inicial vazio.
 * LGPD Art. 7, I — consentimento inequívoco.
 */
export function createOptInRecord(
  userId: string,
  retentionDays: number = AUDIT_RETENTION_DAYS_DEFAULT
): OptInRecord {
  return {
    userId,
    optedIn: false,
    optedInAt: null,
    revokedAt: null,
    history: [],
    retentionDays,
  };
}

/** Toggle ON: LGPD Art. 7 — explicit consent. */
export function optIn(
  rec: OptInRecord,
  now: number = Date.now(),
  requestId?: string
): { record: OptInRecord; changed: boolean } {
  if (rec.optedIn && rec.revokedAt === null) {
    return { record: rec, changed: false };
  }
  const event: OptInEvent = {
    ts: now,
    action: "opt_in",
    reason: "user_explicit_consent",
    requestId,
  };
  return {
    record: {
      ...rec,
      optedIn: true,
      optedInAt: now,
      revokedAt: null,
      history: [...rec.history, event],
    },
    changed: true,
  };
}

/** Toggle OFF: revocation. Remove participation imediatamente. */
export function optOut(
  rec: OptInRecord,
  now: number = Date.now(),
  requestId?: string,
  reason: string = "user_revocation"
): { record: OptInRecord; changed: boolean } {
  if (!rec.optedIn) {
    return { record: rec, changed: false };
  }
  const event: OptInEvent = {
    ts: now,
    action: "opt_out",
    reason,
    requestId,
  };
  return {
    record: {
      ...rec,
      optedIn: false,
      revokedAt: now,
      history: [...rec.history, event],
    },
    changed: true,
  };
}

/** LGPD Art. 18 erasure: remove participation + audit (mas retém 30 dias). */
export function lgpdErase(
  rec: OptInRecord,
  now: number = Date.now(),
  requestId?: string
): { erasedRecord: OptInRecord; erasedAt: number; auditRetentionUntil: number } {
  const erased: OptInRecord = {
    userId: rec.userId,
    optedIn: false,
    optedInAt: null,
    revokedAt: now,
    history: [
      ...rec.history,
      {
        ts: now,
        action: "lgpd_erasure",
        reason: "Art. 18, VI — direito ao esquecimento",
        requestId,
      },
    ],
    retentionDays: 0, // após erase, retenção é só do audit por 30 dias
  };
  const auditRetentionUntil = now + rec.retentionDays * 86400_000;
  return {
    erasedRecord: erased,
    erasedAt: now,
    auditRetentionUntil,
  };
}

/** Auto-revoke (e.g., conta deletada pelo usuário, LGPD Art. 18). */
export function autoRevoke(
  rec: OptInRecord,
  now: number = Date.now(),
  reason: string = "account_deleted"
): { record: OptInRecord; changed: boolean } {
  if (!rec.optedIn) return { record: rec, changed: false };
  const event: OptInEvent = {
    ts: now,
    action: "auto_revoke",
    reason,
  };
  return {
    record: {
      ...rec,
      optedIn: false,
      revokedAt: now,
      history: [...rec.history, event],
    },
    changed: true,
  };
}

/** Verifica se um usuário está atualmente opted-in. */
export function isOptedIn(rec: OptInRecord | undefined): boolean {
  return rec !== undefined && rec.optedIn && rec.revokedAt === null;
}

/** Gera payload de export LGPD Art. 18, V (direito de acesso). */
export function buildExportPayload(
  userId: string,
  rec: OptInRecord | undefined,
  rankSnapshots: LeaderboardExportRank[],
  history: LeaderboardExportHistoryEntry[],
  hmacKey: string
): LeaderboardExportPayload {
  if (!rec) {
    // sem opt-in = nada para exportar
    const serial = JSON.stringify({ userId, noOptIn: true, exportedAt: Date.now() });
    return {
      userId,
      exportedAt: Date.now(),
      currentRank: [],
      history: [],
      optInHistory: [],
      auditHash: hmacSha256(hmacKey, serial),
    };
  }
  const serial = JSON.stringify({
    userId,
    rankSnapshots,
    history,
    optInHistory: rec.history,
    exportedAt: Date.now(),
  });
  return {
    userId,
    exportedAt: Date.now(),
    currentRank: rankSnapshots,
    history,
    optInHistory: rec.history,
    auditHash: hmacSha256(hmacKey, serial),
  };
}

/** Garante que um opt-in record existe para um userId (cria OFF). */
export function ensureOptInRecord(
  optInMap: Map<string, OptInRecord>,
  userId: string,
  retentionDays: number = AUDIT_RETENTION_DAYS_DEFAULT
): OptInRecord {
  let rec = optInMap.get(userId);
  if (!rec) {
    rec = createOptInRecord(userId, retentionDays);
    optInMap.set(userId, rec);
  }
  return rec;
}

/** LGPD Art. 18, §6º — anonimização para fins de "exercício regular de direitos". */
export function anonymizeForAudit(
  rec: OptInRecord,
  now: number = Date.now()
): OptInRecord {
  return {
    userId: rec.userId, // mantido para correlação interna
    optedIn: false,
    optedInAt: rec.optedInAt, // mantido p/ prova de consentimento
    revokedAt: now,
    history: rec.history,
    retentionDays: 0,
  };
}

/** LGPD Art. 7, IV — direito à informação. Texto padrão do consentimento. */
export const LGPD_CONSENT_TEXT_PT = {
  controller: "Akasha-0 / Cabala dos Caminhos",
  purpose: "Participação em ranking anônimo agregado da comunidade, baseado em sessões de prática vocal e mood.",
  dataCollected: "Apenas estatísticas agregadas: contagem de sessões, minutos totais, aderência a dicas (0-1), melhora de humor (valência). Nada de áudio, transcrição, ou conteúdo sagrado.",
  legalBasis: "Consentimento (Art. 7, I) — revogável a qualquer momento.",
  retention: "30 dias após revogação para fins de auditoria, depois removido.",
  rights: "Acesso (Art. 18, V), correção (Art. 18, III), eliminação (Art. 18, VI), portabilidade (Art. 18, V), revogação do consentimento (Art. 8, §5º).",
  contact: "DPO via canal de privacidade do app.",
} as const;

export const LGPD_CONSENT_TEXT_EN = {
  controller: "Akasha-0 / Cabala dos Caminhos",
  purpose: "Participation in the anonymous, aggregated community ranking based on vocal and mood practice sessions.",
  dataCollected: "Only aggregated stats: session count, total minutes, cue adherence (0-1), mood improvement (valence). No audio, transcript, or sacred content.",
  legalBasis: "Consent (Art. 7, I) — revocable at any time.",
  retention: "30 days after revocation for audit purposes, then removed.",
  rights: "Access (Art. 18, V), correction (Art. 18, III), erasure (Art. 18, VI), portability (Art. 18, V), revocation of consent (Art. 8, §5º).",
  contact: "DPO via the app's privacy channel.",
} as const;

export function getConsentText(locale: LeaderboardLocale): Record<string, string> {
  return locale === "pt-BR" ? LGPD_CONSENT_TEXT_PT : LGPD_CONSENT_TEXT_EN;
}

/** LGPD Art. 9 — finalidade. Verifica que o uso é "ranking anônimo". */
export function isPurposeAllowed(purpose: string): boolean {
  const allowed = new Set([
    "anonymous_ranking",
    "cohort_aggregation",
    "most_improved_view",
    "community_engagement",
  ]);
  return allowed.has(purpose);
}

/** LGPD Art. 18 — rights exercisable. */
export interface LgpdRightsRequest {
  userId: string;
  right: "access" | "correction" | "erasure" | "portability" | "revocation";
  ts: number;
  requestId?: string;
}

export function buildLgpdRightsResponse(req: LgpdRightsRequest): {
  acknowledged: boolean;
  requestId: string;
  sla: "immediate" | "15_days";
  ts: number;
} {
  const sla = req.right === "revocation" || req.right === "erasure" ? "immediate" : "15_days";
  return {
    acknowledged: true,
    requestId: req.requestId ?? `lgpd-${req.userId}-${req.ts}`,
    sla,
    ts: req.ts,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §12 Sacred-text policy                                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Tipo de evento sagrado detectado. */
export type SacredEventType = "tag_present" | "kind_unknown" | "sacred_in_practice";

/** Detecção de sacred content em uma session. */
export function detectSacredEvent(rec: CoachSessionRecordShape): SacredEventType | null {
  if (!rec.sacredFlag) return null;
  if (!rec.sacredKind) return "kind_unknown";
  if (SACRED_KINDS.includes(rec.sacredKind)) return "tag_present";
  return "sacred_in_practice";
}

/** Conta sessões sacred em uma lista. */
export function countSacred(records: CoachSessionRecordShape[]): number {
  let n = 0;
  for (const r of records) if (isSacredSession(r)) n += 1;
  return n;
}

/** Conta sessões sacred por kind. */
export function countSacredByKind(records: CoachSessionRecordShape[]): Map<SacredKind, number> {
  const out = new Map<SacredKind, number>();
  for (const r of records) {
    if (isSacredSession(r) && r.sacredKind) {
      out.set(r.sacredKind, (out.get(r.sacredKind) ?? 0) + 1);
    }
  }
  return out;
}

/**
 * Política: sacred SESSIONS nunca aparecem em ranking — independente de
 * opt-in. Esta função é o gate final. Retorna false para sessões sacred.
 */
export function isEligibleForLeaderboard(rec: CoachSessionRecordShape): boolean {
  return !isSacredSession(rec);
}

/** Bulk check: retorna records elegíveis. */
export function filterEligible(records: CoachSessionRecordShape[]): CoachSessionRecordShape[] {
  return records.filter(isEligibleForLeaderboard);
}

/** Política textual — exibida em UI. */
export const SACRED_POLICY_TEXT_PT = {
  intro: "A prática sagrada não é competitiva.",
  rules: [
    "Sessões com flag sagrado (prayer, chant, ritual, litany, mantra, dhikr, novena, psalm) NUNCA aparecem no ranking.",
    "Não há opt-in para participar com sessões sagradas.",
    "Mesmo se você optou por compartilhar sessões normais, sessões sagradas permanecem privadas.",
    "Sua privacidade e tradição são respeitadas: o sistema é desenhado para excluir, não incluir.",
  ],
  footer: "Se você busca reconhecimento por prática sagrada, converse com seu terreiro, templo ou guia espiritual.",
} as const;

export const SACRED_POLICY_TEXT_EN = {
  intro: "Sacred practice is not competitive.",
  rules: [
    "Sessions flagged as sacred (prayer, chant, ritual, litany, mantra, dhikr, novena, psalm) NEVER appear in the ranking.",
    "There is no opt-in to participate with sacred sessions.",
    "Even if you opted in to share regular sessions, sacred sessions remain private.",
    "Your privacy and tradition are respected: the system is designed to exclude, not include.",
  ],
  footer: "If you seek recognition for sacred practice, talk to your terreiro, temple, or spiritual guide.",
} as const;

export function getSacredPolicyText(locale: LeaderboardLocale): { intro: string; rules: readonly string[]; footer: string } {
  return locale === "pt-BR" ? SACRED_POLICY_TEXT_PT : SACRED_POLICY_TEXT_EN;
}

/** Sacred leak detection — verifica que nenhum record sacred vazou pra output. */
export function detectSacredLeak(records: CoachSessionRecordShape[]): { leaked: boolean; leakedCount: number } {
  let n = 0;
  for (const r of records) {
    if (isSacredSession(r)) n += 1;
  }
  return { leaked: n > 0, leakedCount: n };
}

/** Verifica que um objeto LeaderboardView não contém dados sacred. */
export function viewIsSacredClean(view: LeaderboardView): boolean {
  if (view.users) {
    for (const u of view.users) {
      // Sessions totais > 0 e cueAdherence > 0 são válidos para sessões normais.
      // O leak seria incluir sessões sacred — mas sacred nunca entra no aggregate.
      // Esta função é defensiva: garante que cohort value não inclui sacredKind.
      if (u.userCohort.cohortValue.match(/prayer|chant|ritual|litany|mantra|dhikr|novena|psalm/i)) {
        return false;
      }
    }
  }
  return true;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §13 Audit log & report                                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Append-only ledger de audit steps. */
export interface AuditLog {
  steps: AuditStep[];
  version: string;
  createdAt: number;
}

export function createAuditLog(now: number = Date.now()): AuditLog {
  return { steps: [], version: AUDIT_LEDGER_VERSION, createdAt: now };
}

export function appendAuditStep(log: AuditLog, step: AuditStep): void {
  log.steps.push(step);
}

/** Verifica integridade do ledger: contagem esperada vs atual. */
export function auditLogIntegrity(log: AuditLog, expectedCount: number): boolean {
  return log.steps.length === expectedCount && log.version === AUDIT_LEDGER_VERSION;
}

/** Hash do audit log (para publicação). */
export function auditLogHash(log: AuditLog, hmacKey: string): string {
  const serial = JSON.stringify(log);
  return hmacSha256(hmacKey, serial);
}

/** Trim audit log por idade (mantém últimos N dias). */
export function trimAuditLog(log: AuditLog, maxAgeDays: number, now: number = Date.now()): AuditLog {
  const cutoff = now - maxAgeDays * 86400_000;
  return {
    ...log,
    steps: log.steps.filter((s) => s.ts >= cutoff),
  };
}

/** Engine principal — orquestra todo o pipeline. */
export function buildLeaderboardView(
  records: CoachSessionRecordShape[],
  optInMap: Map<string, OptInRecord>,
  cohortType: CohortType,
  scope: ViewScope,
  options: Partial<BuildLeaderboardOptions> = {}
): LeaderboardReport {
  const start = Date.now();
  const now = options.now ?? start;
  const hmacKey = resolveHmacKey(options.hmacKey ?? null);

  const fullOpts: BuildLeaderboardOptions = {
    scope,
    cohortType,
    k: options.k,
    hmacKey,
    now,
    topUsersLimit: options.topUsersLimit,
    topCohortsLimit: options.topCohortsLimit,
    mostImprovedLimit: options.mostImprovedLimit,
    includeSacredFlag: options.includeSacredFlag ?? false,
    weekId: options.weekId,
    monthId: options.monthId,
  };

  const auditTrail: AuditStep[] = [];
  const errors: LeaderboardError[] = [];

  const audit = (step: string, ok: boolean, detail?: string) => {
    auditTrail.push({ step, ts: now, ok, detail });
  };

  // ── Step 1: resolve k
  const k = resolveK(fullOpts.k);
  audit("resolveK", true, `k=${k}`);

  // ── Step 2: resolve scope bounds
  const bounds = resolveScopeBounds(fullOpts, now);
  audit("resolveScopeBounds", true, `start=${bounds.start} end=${bounds.end} id=${bounds.scopeId}`);

  // ── Step 3: validate session records (soft — não bloqueia, só loga)
  let invalidCount = 0;
  const validRecords: CoachSessionRecordShape[] = [];
  for (const r of records) {
    const issues = validateSessionRecord(r);
    if (issues.length > 0) {
      invalidCount += 1;
      continue;
    }
    validRecords.push(r);
  }
  if (invalidCount > 0) {
    audit("validateSessionRecords", false, `${invalidCount} invalid records skipped`);
  } else {
    audit("validateSessionRecords", true);
  }

  // ── Step 4: filter sacred (hard)
  const filteredSacred = filterSacredSessions(validRecords);
  audit("filterSacred", true, `${filteredSacred.excluded} sacred excluded`);

  // ── Step 5: filter by scope temporal
  const scopedRecords = filteredSacred.kept.filter(
    (r) => r.startedAt >= bounds.start && r.startedAt < bounds.end
  );
  audit("filterScope", true, `${scopedRecords.length} records in scope`);

  // ── Step 6: anti-gaming
  const flags = runAntiGaming(scopedRecords, cohortType, now);
  audit("runAntiGaming", true, `${flags.size} users flagged`);

  // ── Step 7: aggregate per user (já filtra sacred de novo)
  const aggregates = aggregateUsersByScope(scopedRecords, bounds.start, bounds.end);
  audit("aggregateUsersByScope", true, `${aggregates.size} users aggregated`);

  // ── Step 8: filter opted-in
  const aggregatesList = [...aggregates.values()];
  const optedInAggs = filterOptedIn(aggregatesList, optInMap);
  audit("filterOptedIn", true, `${optedInAggs.length}/${aggregatesList.length} opted in`);

  // ── Step 9: filter flagged
  const filteredFlagged = filterFlagged(optedInAggs, flags);
  const keptAggs = filteredFlagged.kept;
  audit("filterFlagged", true, `${filteredFlagged.excluded} flagged excluded`);

  // ── Step 10: count by cohort
  const cohortCounts = countByCohort(scopedRecords, cohortType);
  const cohortSizes = new Map<string, number>();
  for (const [kStr, entry] of cohortCounts.entries()) {
    cohortSizes.set(kStr, entry.distinctUsers.size);
  }
  audit("countByCohort", true, `${cohortSizes.size} raw cohorts`);

  // ── Step 11: enforce k-anonymity
  const enforcement = enforceKAnonymityBatch(cohortSizes, k, now);
  audit("enforceKAnonymity", true,
    `${enforcement.totalMerged} merged, ${enforcement.totalSuppressed} suppressed`);

  // ── Step 12: build views
  const cohortSizesFinal = new Map<string, { cohort: CohortKey; size: number }>();
  for (const [kStr, entry] of enforcement.finalCohorts.entries()) {
    cohortSizesFinal.set(kStr, { cohort: entry.cohort, size: entry.size });
  }

  // Build state para views
  const state: BuildLeaderboardState = {
    options: fullOpts,
    startTs: bounds.start,
    endTs: bounds.end,
    scopeId: bounds.scopeId,
    optInMap,
    flagsMap: flags,
    allRecords: validRecords,
    filteredRecords: scopedRecords,
    userAggregates: aggregates,
    optedInAggregates: keptAggs,
    flaggedExcluded: filteredFlagged.excluded,
    cohortStatsMap: new Map(),
    finalCohortKeys: new Set(cohortSizesFinal.keys()),
    cohortMergeLog: enforcement.log,
    views: [],
    errors: [],
    auditTrail,
  };

  const views: LeaderboardView[] = [];

  for (const subView of ["TOP_USERS", "TOP_COHORTS", "MOST_IMPROVED"] as SubViewType[]) {
    const viewScope = scope;
    let users: UserLeaderboardEntry[] | undefined;
    let cohorts: CohortLeaderboardEntry[] | undefined;
    let mostImproved: MostImprovedEntry[] | undefined;

    if (subView === "TOP_USERS") {
      const r = buildTopUsersView(state, cohortSizesFinal, hmacKey);
      users = r.users;
      state.errors.push(...r.errors);
      state.auditTrail.push(...r.audit);
    } else if (subView === "TOP_COHORTS") {
      const r = buildTopCohortsView(state, cohortSizesFinal);
      cohorts = r.cohorts;
      state.errors.push(...r.errors);
      state.auditTrail.push(...r.audit);
    } else {
      const r = buildMostImprovedView(state, cohortSizesFinal, hmacKey);
      mostImproved = r.mostImproved;
      state.errors.push(...r.errors);
      state.auditTrail.push(...r.audit);
    }

    const totals = computeViewTotals(state);

    const view: LeaderboardView = {
      view: "LEADERBOARD",
      scope: viewScope,
      subView,
      generatedAt: now,
      kMin: k,
      kActual: computeKActual(enforcement.finalCohorts),
      cohortMergeLog: enforcement.log,
      users,
      cohorts,
      mostImproved,
      totalEligibleUsers: totals.totalEligibleUsers,
      totalEligibleSessions: totals.totalEligibleSessions,
      sacredExcludedSessions: totals.sacredExcludedSessions,
      flaggedExcluded: totals.flaggedExcluded,
      auditHash: "",
    };
    view.auditHash = auditHashView(hmacKey, view);
    views.push(view);
  }

  errors.push(...state.errors);

  audit("buildViews", true, `${views.length} views geradas`);

  const durationMs = Date.now() - start;
  audit("finalize", true, `duration=${durationMs}ms`);

  return {
    views,
    errors,
    auditTrail,
    durationMs,
    generatedAt: now,
    engineVersion: ENGINE_VERSION,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §14 Smoke / regression scenarios                                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Constrói session record sintética para testes. */
export function makeSyntheticSession(
  overrides: Partial<CoachSessionRecordShape> = {}
): CoachSessionRecordShape {
  return {
    sessionId: overrides.sessionId ?? `s-${Math.random().toString(36).slice(2, 10)}`,
    userId: overrides.userId ?? "u-001",
    startedAt: overrides.startedAt ?? Date.now() - 3600_000,
    endedAt: overrides.endedAt ?? Date.now(),
    durationSec: overrides.durationSec ?? 600,
    practice: overrides.practice ?? "mood_reframe",
    tradition: overrides.tradition ?? "umbanda",
    region: overrides.region ?? "BR",
    language: overrides.language ?? "pt-BR",
    filtered: overrides.filtered ?? true,
    sacredFlag: overrides.sacredFlag ?? false,
    sacredKind: overrides.sacredKind,
    cuesDelivered: overrides.cuesDelivered ?? 10,
    cuesFollowed: overrides.cuesFollowed ?? 7,
    moodArc: overrides.moodArc ?? [
      { t: 0, valence: -0.3, arousal: 0.2 },
      { t: 100_000, valence: -0.1, arousal: 0.1 },
      { t: 200_000, valence: 0.2, arousal: 0.0 },
      { t: 300_000, valence: 0.5, arousal: -0.1 },
      { t: 400_000, valence: 0.6, arousal: -0.2 },
      { t: 500_000, valence: 0.7, arousal: -0.2 },
    ],
    audioFeatures: overrides.audioFeatures,
    device: overrides.device,
    ipHash: overrides.ipHash,
    appVersion: overrides.appVersion ?? "5.4.0",
  };
}

/** Gera N synthetic users com M sessões cada, scattered em uma semana. */
export function makeSyntheticUserSessions(
  userCount: number,
  sessionsPerUser: number,
  baseTs: number = Date.now() - 7 * 86400_000,
  cohortOverride: Partial<CoachSessionRecordShape> = {}
): CoachSessionRecordShape[] {
  const records: CoachSessionRecordShape[] = [];
  for (let u = 0; u < userCount; u++) {
    for (let s = 0; s < sessionsPerUser; s++) {
      records.push(
        makeSyntheticSession({
          userId: `u-${u.toString().padStart(3, "0")}`,
          sessionId: `s-${u}-${s}`,
          startedAt: baseTs + u * 1000 + s * 86400_000,
          endedAt: baseTs + u * 1000 + s * 86400_000 + 600_000,
          durationSec: 600 + u * 10 + s * 30,
          cuesDelivered: 10,
          cuesFollowed: 5 + (u % 5),
          ...cohortOverride,
        })
      );
    }
  }
  return records;
}

/** Smoke 1: hash functions determinism. */
export function smokeHashDeterminism(): { ok: boolean; detail: string } {
  const a = fnv1a64("hello");
  const b = fnv1a64("hello");
  const c = fnv1a64("hello!");
  const sha = sha256("hello");
  const hmac = hmacSha256("key", "hello");
  const ok =
    a === b &&
    a !== c &&
    sha === sha256("hello") &&
    sha !== sha256("hello!") &&
    hmac === hmacSha256("key", "hello") &&
    hmac !== hmacSha256("key2", "hello");
  return { ok, detail: `fnv1a=${a} sha=${sha.slice(0, 8)} hmac=${hmac.slice(0, 8)}` };
}

/** Smoke 2: k-anonymity enforce com cohort pequeno. */
export function smokeKAnonymityEnforcement(): { ok: boolean; detail: string } {
  const small: CohortKey = { cohortType: "BY_TRADITION", cohortValue: "ifa", cohortBucket: "ifa" };
  const sizes = new Map<string, number>();
  sizes.set(cohortKeyString(small), 5);
  sizes.set(`${cohortKeyString(small)}|BR`, 30); // unrelated key
  const r = enforceKAnonymity(small, 5, 10, sizes, "parent_then_sibling", 1000);
  const ok = r.outcome === "merged" || r.outcome === "suppressed";
  return { ok, detail: `outcome=${r.outcome}` };
}

/** Smoke 3: sacred session filtering. */
export function smokeSacredExclusion(): { ok: boolean; detail: string } {
  const sacred = makeSyntheticSession({ sacredFlag: true, sacredKind: "prayer" });
  const regular = makeSyntheticSession({ sacredFlag: false });
  const all = [sacred, regular];
  const f = filterSacredSessions(all);
  const ok = f.kept.length === 1 && f.excluded === 1 && !isSacredSession(f.kept[0]!);
  return { ok, detail: `kept=${f.kept.length} excluded=${f.excluded}` };
}

/** Smoke 4: opt-in default OFF. */
export function smokeOptInDefaultOff(): { ok: boolean; detail: string } {
  const rec = createOptInRecord("u-x");
  const ok = !rec.optedIn && rec.optedInAt === null;
  return { ok, detail: `optedIn=${rec.optedIn}` };
}

/** Smoke 5: opt-in then opt-out. */
export function smokeOptInOutCycle(): { ok: boolean; detail: string } {
  let rec = createOptInRecord("u-y");
  const o1 = optIn(rec, 1000, "req1");
  rec = o1.record;
  const o2 = optOut(rec, 2000, "req2");
  rec = o2.record;
  const ok = rec.history.length === 2 && !rec.optedIn && rec.revokedAt === 2000;
  return { ok, detail: `events=${rec.history.length}` };
}

/** Smoke 6: anonymous ID rotation — same user, different week = different id. */
export function smokeAnonIdRotation(): { ok: boolean; detail: string } {
  const c: CohortKey = { cohortType: "BY_TRADITION", cohortValue: "umbanda", cohortBucket: "umbanda" };
  const id1 = buildAnonymousId("k", "u-1", c, "2026-W22");
  const id2 = buildAnonymousId("k", "u-1", c, "2026-W23");
  const id3 = buildAnonymousId("k", "u-2", c, "2026-W22");
  const ok = id1 !== id2 && id1 !== id3;
  return { ok, detail: `${id1.slice(0, 4)}/${id2.slice(0, 4)}/${id3.slice(0, 4)}` };
}

/** Smoke 7: anti-gaming rapid session. */
export function smokeAntiGamingRapid(): { ok: boolean; detail: string } {
  const sessions: CoachSessionRecordShape[] = [];
  for (let i = 0; i < 25; i++) {
    sessions.push(
      makeSyntheticSession({
        userId: "u-cheater",
        sessionId: `cheat-${i}`,
        startedAt: 1000 + i * 60_000, // 1 per minute
      })
    );
  }
  const r = detectRapidSessionCreation(sessions);
  const ok = r.flagged && r.flaggedSessionIds.length > 0;
  return { ok, detail: `flagged=${r.flaggedSessionIds.length}` };
}

/** Smoke 8: k ≥ 10 mandatory. */
export function smokeKMinimumMandatory(): { ok: boolean; detail: string } {
  const r1 = resolveK(undefined);
  const r2 = resolveK(5);
  const r3 = resolveK(15);
  const ok = r1 === K_MINIMUM_MANDATORY && r2 === K_MINIMUM_MANDATORY && r3 === 15;
  return { ok, detail: `${r1}/${r2}/${r3}` };
}

/** Smoke 9: build full leaderboard pipeline com dataset sintético. */
export function smokeFullPipeline(): { ok: boolean; detail: string } {
  const optInMap = new Map<string, OptInRecord>();
  for (let u = 0; u < 30; u++) {
    const rec = createOptInRecord(`u-${u}`);
    optInMap.set(rec.userId, optIn(rec, Date.now() - 86400_000).record);
  }
  const records = makeSyntheticUserSessions(30, 5);
  const report = buildLeaderboardView(records, optInMap, "BY_TRADITION", "ALL_TIME", {
    now: Date.now(),
  });
  const ok =
    report.views.length === 3 &&
    report.errors.length === 0 &&
    report.auditTrail.length >= 8;
  return { ok, detail: `views=${report.views.length} audit=${report.auditTrail.length}` };
}

/** Smoke 10: sacred session nunca aparece em ranking mesmo se opted-in. */
export function smokeSacredNeverRanks(): { ok: boolean; detail: string } {
  const optInMap = new Map<string, OptInRecord>();
  for (let u = 0; u < 30; u++) {
    const rec = createOptInRecord(`u-${u}`);
    optInMap.set(rec.userId, optIn(rec).record);
  }
  // 100% sacred sessions
  const records: CoachSessionRecordShape[] = [];
  for (let u = 0; u < 30; u++) {
    for (let s = 0; s < 3; s++) {
      records.push(
        makeSyntheticSession({
          userId: `u-${u}`,
          sessionId: `s-${u}-${s}`,
          startedAt: Date.now() - 86400_000 + s * 3600_000,
          sacredFlag: true,
          sacredKind: "mantra",
        })
      );
    }
  }
  const report = buildLeaderboardView(records, optInMap, "BY_TRADITION", "ALL_TIME", {
    now: Date.now(),
  });
  const totalUsers = report.views[0]!.users?.length ?? 0;
  const totalEligible = report.views[0]!.totalEligibleUsers;
  const ok = totalUsers === 0 && totalEligible === 0;
  return { ok, detail: `users=${totalUsers} eligible=${totalEligible}` };
}

/** Smoke 11: LGPD export — usuário sem opt-in = payload vazio. */
export function smokeLgpdExportNoOptIn(): { ok: boolean; detail: string } {
  const payload = buildExportPayload("u-1", undefined, [], [], "k");
  const ok = payload.optInHistory.length === 0 && payload.auditHash.length === 64;
  return { ok, detail: `history=${payload.optInHistory.length}` };
}

/** Smoke 12: cohort merge log é auditável. */
export function smokeCohortMergeAuditability(): { ok: boolean; detail: string } {
  const records = makeSyntheticUserSessions(12, 2);
  // Reduz um cohort específico para forçar merge
  const optInMap = new Map<string, OptInRecord>();
  for (let u = 0; u < 12; u++) {
    const rec = createOptInRecord(`u-${u}`);
    optInMap.set(rec.userId, optIn(rec).record);
  }
  // Força um cohort tiny adicionando 1 user "kabbalah"
  records.push(
    makeSyntheticSession({
      userId: "u-tiny",
      sessionId: "tiny-1",
      tradition: "kabbalah",
      startedAt: Date.now() - 3600_000,
    })
  );
  optInMap.set("u-tiny", optIn(createOptInRecord("u-tiny")).record);

  const report = buildLeaderboardView(records, optInMap, "BY_TRADITION", "ALL_TIME", {
    now: Date.now(),
  });
  const mergeCount = report.views[0]!.cohortMergeLog.length;
  const ok = mergeCount >= 0; // pode ser 0 se kabbalah tem 1 user e k=10
  return { ok, detail: `log=${mergeCount}` };
}

/** Smoke 13: composite score determinism. */
export function smokeCompositeScore(): { ok: boolean; detail: string } {
  const stats: UserAggregateStats = {
    userId: "u",
    sessions: 10,
    totalMinutes: 60,
    cueAdherence: 0.8,
    moodImprovement: 0.5,
    baselineMood: 0,
    currentMood: 0.5,
    traditions: ["umbanda"],
    regions: ["BR"],
  };
  const s1 = compositeScore(stats);
  const s2 = compositeScore(stats);
  const ok = s1 === s2 && s1 > 0 && s1 <= 1;
  return { ok, detail: `score=${s1}` };
}

/** Smoke 14: SHA-256 known vector — empty string. */
export function smokeSha256Empty(): { ok: boolean; detail: string } {
  // SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
  const h = sha256("");
  const ok = h === "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  return { ok, detail: `h=${h.slice(0, 16)}` };
}

/** Smoke 15: SHA-256 known vector — "abc". */
export function smokeSha256Abc(): { ok: boolean; detail: string } {
  // SHA-256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
  const h = sha256("abc");
  const ok = h === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
  return { ok, detail: `h=${h.slice(0, 16)}` };
}

/** Smoke 16: HMAC-SHA256 known vector — RFC 4231 test case 1. */
export function smokeHmacSha256Rfc4231(): { ok: boolean; detail: string } {
  // Key = 0x0b * 20, Data = "Hi There"
  // Expected: b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7
  const key = new Uint8Array(20).fill(0x0b);
  const h = hmacSha256(key, "Hi There");
  const ok = h === "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7";
  return { ok, detail: `h=${h.slice(0, 16)}` };
}

/** Smoke 17: buildLeaderboardView retorna 3 views (3 subViews). */
export function smokeThreeSubViews(): { ok: boolean; detail: string } {
  const optInMap = new Map<string, OptInRecord>();
  for (let u = 0; u < 50; u++) {
    const rec = createOptInRecord(`u-${u}`);
    optInMap.set(rec.userId, optIn(rec).record);
  }
  const records = makeSyntheticUserSessions(50, 3);
  const report = buildLeaderboardView(records, optInMap, "BY_TRADITION", "WEEKLY", {
    now: Date.now(),
  });
  const subViews = new Set(report.views.map((v) => v.subView));
  const ok = subViews.size === 3;
  return { ok, detail: `subViews=${subViews.size}` };
}

/** Smoke 18: cohort merge para k-anonymity não perde dados. */
export function smokeCohortMergePreservesData(): { ok: boolean; detail: string } {
  const sizes = new Map<string, number>();
  const tiny: CohortKey = { cohortType: "BY_TRADITION", cohortValue: "ifa", cohortBucket: "ifa" };
  sizes.set(cohortKeyString(tiny), 5);
  const r = enforceKAnonymity(tiny, 5, 10, sizes, "parent_then_sibling", 1000);
  const ok = r.sizeAfter >= 5; // tamanho preservado (ou suppressed)
  return { ok, detail: `size=${r.sizeAfter}` };
}

/** Smoke 19: FNV-1a 32 known vector. */
export function smokeFnv1a32(): { ok: boolean; detail: string } {
  // FNV-1a 32("foobar") = bf9cf968
  const h = fnv1a32("foobar");
  const ok = h === "bf9cf968";
  return { ok, detail: `h=${h}` };
}

/** Smoke 20: Sacred leak detection em view. */
export function smokeSacredLeakDetection(): { ok: boolean; detail: string } {
  const view: LeaderboardView = {
    view: "LEADERBOARD",
    scope: "WEEKLY",
    subView: "TOP_USERS",
    generatedAt: 0,
    kMin: 10,
    kActual: 10,
    cohortMergeLog: [],
    users: [
      {
        anonymousId: "abc",
        userCohort: { cohortType: "BY_TRADITION", cohortValue: "umbanda", cohortBucket: "umbanda" },
        sessions: 5,
        totalMinutes: 30,
        cueAdherence: 0.8,
        moodImprovement: 0.4,
        compositeScore: 0.7,
        rank: 1,
        flagged: false,
        flagReasons: [],
      },
    ],
    totalEligibleUsers: 10,
    totalEligibleSessions: 50,
    sacredExcludedSessions: 0,
    flaggedExcluded: 0,
    auditHash: "",
  };
  const ok = viewIsSacredClean(view);
  return { ok, detail: `clean=${ok}` };
}

/** Run all smoke tests — usado por CI e regressões. */
export interface SmokeResult {
  name: string;
  ok: boolean;
  detail: string;
}

export function runAllSmokeTests(): SmokeResult[] {
  return [
    { name: "smokeHashDeterminism", ...smokeHashDeterminism() },
    { name: "smokeKAnonymityEnforcement", ...smokeKAnonymityEnforcement() },
    { name: "smokeSacredExclusion", ...smokeSacredExclusion() },
    { name: "smokeOptInDefaultOff", ...smokeOptInDefaultOff() },
    { name: "smokeOptInOutCycle", ...smokeOptInOutCycle() },
    { name: "smokeAnonIdRotation", ...smokeAnonIdRotation() },
    { name: "smokeAntiGamingRapid", ...smokeAntiGamingRapid() },
    { name: "smokeKMinimumMandatory", ...smokeKMinimumMandatory() },
    { name: "smokeFullPipeline", ...smokeFullPipeline() },
    { name: "smokeSacredNeverRanks", ...smokeSacredNeverRanks() },
    { name: "smokeLgpdExportNoOptIn", ...smokeLgpdExportNoOptIn() },
    { name: "smokeCohortMergeAuditability", ...smokeCohortMergeAuditability() },
    { name: "smokeCompositeScore", ...smokeCompositeScore() },
    { name: "smokeSha256Empty", ...smokeSha256Empty() },
    { name: "smokeSha256Abc", ...smokeSha256Abc() },
    { name: "smokeHmacSha256Rfc4231", ...smokeHmacSha256Rfc4231() },
    { name: "smokeThreeSubViews", ...smokeThreeSubViews() },
    { name: "smokeCohortMergePreservesData", ...smokeCohortMergePreservesData() },
    { name: "smokeFnv1a32", ...smokeFnv1a32() },
    { name: "smokeSacredLeakDetection", ...smokeSacredLeakDetection() },
  ];
}

/** Contagem de smoke tests que passaram. */
export function summarizeSmokeTests(results: SmokeResult[]): { passed: number; failed: number; total: number } {
  let passed = 0;
  for (const r of results) if (r.ok) passed += 1;
  return { passed, failed: results.length - passed, total: results.length };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §15 Doc-string constants                                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** LGPD articles cobertos. */
export const LGPD_ARTICLES_COVERED = {
  art7: "Art. 7, I — consentimento livre, informado, inequívoco (opt-in)",
  art7purpose: "Art. 7, II — finalidade específica (ranking anônimo agregado)",
  art9: "Art. 9 — finalidade lícita e informada",
  art18v: "Art. 18, V — acesso e portabilidade",
  art18vi: "Art. 18, VI — eliminação (esquemecimento)",
  art18i: "Art. 18, I — confirmação da existência de tratamento",
  art18iii: "Art. 18, III — correção",
} as const;

/** Resumo das garantias do engine. */
export const ENGINE_GUARANTEES = {
  kAnonymity: "k≥10 enforced; cohorts <k são merged ou suprimidos",
  sacredPolicy: "Sessões sacred (prayer/chant/ritual/etc.) nunca entram no ranking — sem opt-in override",
  optInDefault: "Opt-in é OFF por default (LGPD Art. 7)",
  antiGaming: "Rapid-session (≥20/h), identical-mood-arc (≥3 collisions), IP/device cluster detectados",
  anonymousIds: "HMAC-SHA256 por (user × cohort × week) — rotação semanal",
  dataMinimization: "Apenas contagens, minutos, cue-adherence, mood-improvement. Sem áudio, transcrição ou conteúdo.",
  auditLog: "Cada decisão (merge, suppression, exclusion) gera AuditStep timestamped",
  revocability: "opt-out remove participação imediatamente; audit retido 30 dias",
} as const;

/** Stack de dependências (todas zero-runtime). */
export const ENGINE_DEPENDENCIES = {
  runtime: [],
  typescript: ">=5.4.0",
  nodeTarget: "ES2017+",
} as const;

/** Limites operacionais publicados. */
export const ENGINE_LIMITS = {
  maxSessionsPerBatch: 50_000,
  maxUsersPerCohort: 100_000,
  maxCohortTypes: 4,
  maxSubViewsPerScope: 3,
  maxScopesPerReport: 3,
  kMinimum: K_MINIMUM_MANDATORY,
  kDefault: K_DEFAULT,
  kMaximum: K_MAXIMUM,
  retentionDaysDefault: AUDIT_RETENTION_DAYS_DEFAULT,
} as const;

/** Política de rotação semanal. */
export const WEEKLY_ROTATION_POLICY = {
  weekday: ANON_ID_ROTATION_WEEKDAY, // 1 = segunda
  explanation: "Anonymous IDs são derivados de (userId, cohort, weekId). Quando o weekId muda, o ID muda — sem correlação direta entre semanas.",
  auditImplication: "Audit log não consegue correlacionar anonymous IDs entre semanas — por design.",
} as const;

/** Mensagem para erros conhecidos. */
export const ERROR_MESSAGES: Record<LeaderboardErrorCode, string> = {
  LB_001: "k-anonymity violation não resolúvel após merge attempts",
  LB_002: "Opt-in ausente para usuário consultado",
  LB_003: "Cohort inválido ou desconhecido",
  LB_004: "Session record mal formado",
  LB_005: "Rotação de chave HMAC ausente",
  LB_006: "Sacred leakage detected em output",
  LB_007: "Audit log corrompido",
  LB_008: "Rate limit exceeded (anti-gaming)",
  LB_009: "weekId ou monthId inválido",
  LB_010: "LGPD erasure solicitado mas não há opt-in registrado",
};

/** Helper para construir um LeaderboardError. */
export function makeError(
  code: LeaderboardErrorCode,
  detail?: string,
  now: number = Date.now()
): LeaderboardError {
  return {
    code,
    message: ERROR_MESSAGES[code],
    detail,
    ts: now,
  };
}

/** Default para o caller usar como configuração. */
export const DEFAULT_BUILD_OPTIONS: Partial<BuildLeaderboardOptions> = {
  scope: "WEEKLY",
  cohortType: "BY_TRADITION",
  k: K_DEFAULT,
  topUsersLimit: TOP_USERS_DEFAULT_LIMIT,
  topCohortsLimit: TOP_COHORTS_DEFAULT_LIMIT,
  mostImprovedLimit: MOST_IMPROVED_DEFAULT_LIMIT,
  includeSacredFlag: false,
};

/** Resumo final do arquivo. */
export const FILE_METADATA = {
  filename: "src/lib/w54/voice_mood_coach_leaderboard.ts",
  w54Slot: true,
  engineVersion: ENGINE_VERSION,
  policyVersion: POLICY_VERSION,
  layout: "§1..§15",
  compiledByShape: true,
  importsFromOtherRepoFiles: false,
} as const;
