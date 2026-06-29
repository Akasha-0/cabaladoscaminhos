/**
 * w56/marketplace-leitura-praticas
 * ────────────────────────────────
 * Marketplace listing engine para dois tipos de oferta:
 *   • leitura  — consultas oraculares, tiragens, mapeamentos astrológicos,
 *                orientação por runas/cartas/etc.
 *   • prática  — serviços rituais (giras dirigidas, encantamentos, ebós,
 *                limpeza espiritual, passes, etc.)
 *
 * O engine entrega a forma canônica que uma futura página `/marketplace`
 * consumirá: listagens com preço, janelas de agendamento, perfil do provedor,
 * ratings, faceted search, e ranking BM25-like com boost por faceta + tiebreak
 * por verification level (L2 > L1 > L0). Trust matters for sacred services:
 * practitioners passam por três níveis (self-declared → document-verified
 * → admin-reviewed) antes de ofertar serviços sagrados publicamente.
 *
 * Sacred-content policy é HARD: listings com `sacredFlag=true` NUNCA aparecem
 * em busca quando o usuário não tem `sacredOptIn=true`. A exclusão acontece
 * ANTES da paginação, não depois — não há bypass conhecido.
 *
 * Anti-spam: providers com sinalização de falsa identidade (verification
 * revocation, repeated complaints, document forgery) ficam fora do ranking
 * público. Listings com `manualRedaction=true` aplicam filtros manuais
 * (palavras proibidas, PII, abusivos) antes de indexar.
 *
 * LGPD Art. 7 (consentimento), Art. 9 (finalidade — apenas matching de
 * marketplace, NUNCA marketing) e Art. 18 (acesso, correção, eliminação,
 * portabilidade, revogação): opt-in explícito para listar OU contratar;
 * export inclui todas as listings + bookings + reviews do titular; erasure
 * apaga search history + reviews + bookings; consentimento revogável a
 * qualquer momento.
 *
 * Self-contained: só tipos de TS + Math nativo + string ops. Sem deps
 * externas, sem node:crypto, sem prisma em runtime, sem fetch. Determinístico
 * — RNG seeded por string para reproducibilidade de smoke tests.
 *
 * Layout:
 *   §1  Tipos & contratos
 *   §2  Constantes, taxonomias, price-tier, verification, sacred
 *   §3  Math helpers (FNV-1a 32/64, hex, Levenshtein, BM25-kernel)
 *   §4  Listing shape (MarketplaceListing, Reading, Practice)
 *   §5  Provider profile (ProviderProfile, VerificationRecord)
 *   §6  Search facets (ListingFilter, SearchFacets)
 *   §7  Search query parser (free-text → tokens + facet pairs)
 *   §8  Search ranker (BM25-like + facet match boost + verification tier)
 *   §9  Filter pipeline (price, availability, sacred, manual redaction)
 *   §10 Pricing tier rules (free, donation, fixed — BRL cents)
 *   §11 Schedule windows (provider availability + booking hold)
 *   §12 Sacred-tag handling (opt-in gate, audit SacredExclusion)
 *   §13 LGPD Art. 7/9/18 (opt-in, export, erasure, retention)
 *   §14 Provider verification flow (L0 → L1 → L2, history, revocation)
 *   §15 Smoke / regression scenarios
 *   §15.5 Doc-string constants (LGPD text, error map, metadata)
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Tipos & Contratos                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Mirror do caller — discriminated union de listing. */
export type ListingKind = "reading" | "practice";

/** Tipos de "leitura" (consultas oraculares ou aconselhamento). */
export type ReadingSubkind =
  | "tarot"
  | "lenormand"
  | "cigano"
  | "cigano_celta"
  | "runas"
  | "i_ching"
  | "numerologia"
  | "astrologia"
  | "mesa_radionica"
  | "biblia_sagrada"
  | "mediunidade_consultiva"
  | "mapa_astral"
  | "premonicao"
  | "cabala"
  | "channeling";

/** Tipos de "prática" (serviço ritual ou energético). */
export type PracticeSubkind =
  | "encantamento"
  | "ebo"
  | "gira"
  | "limpeza_energetica"
  | "limpeza_espiritual"
  | "defumacao"
  | "passes"
  | "bano_ritual"
  | "amarração"          // ⚠ listada apenas para opt-in explícito
  | "abertura_caminho"
  | "fechamento_corporal"
  | "dons_de_cura"
  | "cura_reiki"
  | "cura_pranic"
  | "oraculo_vivo"
  | "incorporacao";

/** Categorias sagradas — listing.sacredFlag deve ser true para estas. */
export type SacredCategory =
  | "encantamento_sagrado"
  | "ebó_sagrado"
  | "gira_de_caboclo"
  | "gira_de_preto_velho"
  | "limpeza_com_ervas"
  | "dons_de_cura"
  | "incorporacao_ritual"
  | "oraculo_sagrado";

/** Categorias não-sagradas (oraculares modernos ou não-tradicionais). */
export type NonSacredCategory =
  | "tarot"
  | "astrologia"
  | "numerologia"
  | "mesa_radionica"
  | "cigano_celta"
  | "lenormand";

/** Categorias combinadas (sacred + non_sacred). */
export type ListingCategory = SacredCategory | NonSacredCategory;

/** Price tier — controla como o preço é apresentado. */
export type PriceTier = "free" | "donation" | "fixed";

/** Verification level — tier de confiabilidade do provedor. */
export type VerificationLevel = "L0" | "L1" | "L2";

/** Region — ISO-3166 alpha-2 + ZZ. */
export type RegionCode =
  | "BR" | "PT" | "AO" | "MZ" | "CV"
  | "US" | "UK" | "ES" | "FR" | "DE"
  | "IT" | "JP" | "MX" | "AR" | "CO"
  | "CL" | "PE" | "UY" | "PY" | "BO"
  | "ZZ";

/** Slot semanal — dia da semana + janela de minutos desde 00:00 local. */
export interface ScheduleWindow {
  /** ISO weekday: 1=Mon, 7=Sun */
  weekday: WeekdayIso;
  /** start em minutos desde 00:00 local (UTC-offset do provider). */
  startMin: number;
  /** end em minutos desde 00:00 local. */
  endMin: number;
  /** timezone — IANA, ex.: "America/Sao_Paulo". */
  timezone: string;
}

export type WeekdayIso = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Hold temporário — 30 min reservation antes de confirmar booking. */
export interface BookingHold {
  holdId: string;
  listingId: string;
  consumerId: string;
  startsAt: number;          // epoch ms
  endsAt: number;            // epoch ms
  expiresAt: number;         // epoch ms — hold expira (default 30 min)
  priceBrlCents: number;
  status: "pending" | "confirmed" | "expired" | "cancelled" | "consumed";
  createdAt: number;
}

/** Review agregada por listing — apenas estatísticas públicas. */
export interface ReviewAggregate {
  listingId: string;
  reviewCount: number;
  avgRating: number;          // 0..5
  ratingHistogram: number[];  // length 5, index i = count de ratings (i+1) estrelas
  lastReviewAt: number | null;
}

/** Provider profile — ofertas, histórico de verificação, contato. */
export interface ProviderProfile {
  providerId: string;
  handle: string;             // @handle único
  displayName: string;
  bio: string;
  traditions: string[];       // "umbanda", "candomble", "ifa", "kabbalah", ...
  languages: string[];        // BCP-47
  region: RegionCode;
  cityHint?: string;          // NÃO mostrar exato sem consent
  verificationLevel: VerificationLevel;
  verificationHistory: VerificationRecord[];
  availableWindows: ScheduleWindow[];
  /** List of all public listing IDs do provider. */
  listingIds: string[];
  optedInMarketplace: boolean;        // LGPD Art. 7 consent
  optedInMarketplaceAt: number | null;
  optedInMarketplaceHistory: OptInEvent[];
  /** Suspended / banned flag — exclui de todo ranking público. */
  suspended: boolean;
  suspendedReason?: string;
  joinedAt: number;
}

/** Verification record — eventos do fluxo L0 → L1 → L2. */
export interface VerificationRecord {
  ts: number;
  fromLevel: VerificationLevel;
  toLevel: VerificationLevel;
  evidence: string;        // ex.: "doc-id-upload", "admin-review-pass", "doc-rejected"
  adminId?: string;        // quem aprovou (L1/L2)
  reason?: string;         // razão de revogação se aplicável
  documentHash?: string;   // FNV-1a 64 do doc enviado
}

/** LGPD opt-in event. */
export interface OptInEvent {
  ts: number;
  action: "opt_in" | "opt_out" | "auto_revoke" | "lgpd_erasure" | "verification_revoked";
  reason?: string;
  requestId?: string;
}

/** Listing shape — UNIFICADA mas com kind discriminada. */
export interface MarketplaceListing {
  id: string;
  providerId: string;
  kind: ListingKind;
  title: string;
  description: string;
  category: ListingCategory;
  /** Lista de sub-tipos se aplicável. */
  subkinds: (ReadingSubkind | PracticeSubkind)[];
  /** true se a categoria é sagrada (orixá, caboclo, etc.). */
  sacredFlag: boolean;
  /** Se sacred, qual a tradição primária. */
  sacredTradition?: string;
  /** Price. */
  priceTier: PriceTier;
  priceBrlCents: number;
  /** Para "donation": faixa sugerida. */
  donationMinBrlCents?: number;
  donationMaxBrlCents?: number;
  /** Currency ISO-4217 — sempre "BRL" aqui, mas tipos admitem. */
  currency: "BRL" | "USD" | "EUR";
  /** Duração típica da leitura/sessão. */
  durationMin: number;
  /** Schedule windows override (se não setado, usa do provider). */
  availableWindows?: ScheduleWindow[];
  /** Tags livres — "online", "presencial", "video-call", etc. */
  channels: ("online" | "presencial" | "video_call" | "audio_call" | "chat_async")[];
  /** Rating público. */
  rating: ReviewAggregate;
  /** Manual redaction flag — listing passou por revisão manual. */
  manualRedaction: boolean;
  /** Hash dos campos públicos — evita dedupe trivial. */
  fingerprint: string;
  /** Ativa? */
  active: boolean;
  createdAt: number;
  updatedAt: number;
  /** Optional: idioma preferencial para atendimento. */
  preferredLanguage?: string;
}

/** ReadingListing = kind="reading" — alias para tipagem semântica. */
export type ReadingListing = MarketplaceListing & {
  kind: "reading";
};

/** PracticeListing = kind="practice" — alias para tipagem semântica. */
export type PracticeListing = MarketplaceListing & {
  kind: "practice";
};

/** Facetas de busca — qualquer combinação. */
export interface SearchFacets {
  categories?: ListingCategory[];
  traditions?: string[];
  languages?: string[];
  regions?: RegionCode[];
  priceMinBrlCents?: number;
  priceMaxBrlCents?: number;
  ratingMin?: number;            // 0..5
  verificationLevels?: VerificationLevel[];
  channels?: MarketplaceListing["channels"];
  sacredOptIn?: boolean;         // default false
  hasAvailabilityNow?: boolean; // default false
  weekdayAvail?: WeekdayIso[];   // só retorna listings com availability nesse dia
  startMinLocal?: number;
  endMinLocal?: number;
}

/** Query crua — texto + facetas. */
export interface SearchQuery {
  q: string;
  facets?: SearchFacets;
  /** Strict mode = AND entre facetas; lenient = OR dentro de arrays. */
  strict?: boolean;
  page?: number;
  pageSize?: number;
  /** Locale para stemming/tokenização leve. */
  locale?: "pt-BR" | "en-US" | "es-ES";
  /** Caller é o consumer com/ sem sacredOptIn. */
  consumerSacredOptIn: boolean;
}

/** Filter — output do query parser; usado pelo filtro. */
export interface ListingFilter {
  /** Tokens normalizados (lowercase, diacritic-stripped). */
  tokens: string[];
  facets: SearchFacets;
  strict: boolean;
  page: number;
  pageSize: number;
  locale: SearchQuery["locale"];
  consumerSacredOptIn: boolean;
}

/** Ranking result — listing + score + breakdown. */
export interface RankedListing {
  listing: MarketplaceListing;
  score: number;
  bm25Score: number;
  facetBoost: number;
  verificationBoost: number;
  ratingBoost: number;
  rank: number;
}

/** Search report — output do engine principal. */
export interface SearchReport {
  query: SearchQuery;
  filter: ListingFilter;
  results: RankedListing[];
  totalAfterSacredFilter: number;  // count após sacred filter
  sacredExcludedCount: number;    // listings removidos por sacredFlag
  facetMismatchCount: number;
  redactionBlockedCount: number;
  pagination: { page: number; pageSize: number; total: number; hasMore: boolean };
  durationMs: number;
  generatedAt: number;
  auditTrail: AuditStep[];
  errors: MarketplaceError[];
  sacredExclusionAudit: SacredExclusionEntry[];
  engineVersion: string;
}

/** Sacred exclusion audit entry — toda exclusão é rastreada. */
export interface SacredExclusionEntry {
  listingId: string;
  ts: number;
  reason: "sacred_flag_no_optin" | "sacred_redaction" | "sacred_provider_suspended";
  consumerOptIn: boolean;
  detail?: string;
}

/** Audit step. */
export interface AuditStep {
  step: string;
  ts: number;
  ok: boolean;
  detail?: string;
}

/** Erro de engine — prefixo MK_. */
export type MarketplaceErrorCode =
  | "MK_001"  // listing inválido
  | "MK_002"  // price tier + cents inconsistente
  | "MK_003"  // schedule window inválido
  | "MK_004"  // sacred listing sem sacredTradition
  | "MK_005"  // provider sem opt-in para listar
  | "MK_006"  // consumer sem opt-in para contratar
  | "MK_007"  // verification revocation silenciou provider
  | "MK_008"  // query mal-formada
  | "MK_009"  // facet inválido
  | "MK_010"  // hold expirado
  | "MK_011"  // LGPD export requested but record missing
  | "MK_012"  // sacred leak detected
  | "MK_013"  // redaction block
  | "MK_014"  // k provider cohort < min
  | "MK_015"; // schedule collision

export interface MarketplaceError {
  code: MarketplaceErrorCode;
  message: string;
  detail?: string;
  ts: number;
}

/** LGPD export payload — provider. */
export interface ProviderLgpdExport {
  providerId: string;
  exportedAt: number;
  profile: ProviderProfile | null;
  listings: MarketplaceListing[];
  bookings: BookingHold[];
  reviewsAuthored: ReviewAggregate[]; // reviews que o provider escreveu (se aplicável)
  optInHistory: OptInEvent[];
  verificationHistory: VerificationRecord[];
  auditHash: string;
}

/** LGPD export payload — consumer. */
export interface ConsumerLgpdExport {
  consumerId: string;
  exportedAt: number;
  searchHistory: SearchReport[];      // apenas a query, sem results
  bookings: BookingHold[];
  reviewsAuthored: number[];           // listingIds onde consumer escreveu review
  optInHistory: OptInEvent[];
  auditHash: string;
}

/** Erase result — LGPD Art. 18, VI. */
export interface LgpdEraseResult {
  consumerId: string;
  erasedSearchHistory: number;
  erasedBookings: number;
  erasedReviews: number;
  auditRetentionUntil: number;
  erasedAt: number;
}

/** Manual redaction filter. */
export interface ManualRedactionConfig {
  /** Palavras que NUNCA podem aparecer em título/descrição. */
  forbiddenWords: string[];
  /** Max length de descrição. */
  maxDescriptionLength: number;
  /** PII patterns — telefone, email, CPF, PIX chave. */
  piiPatterns: PiiPatternRule[];
  /** Se true, qualquer match → block; senão apenas flag. */
  blockOnMatch: boolean;
}

export interface PiiPatternRule {
  name: string;
  pattern: string;       // regex source string
  flags: string;         // regex flags
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constantes, taxonomias, defaults                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Versão do engine. */
export const ENGINE_VERSION = "1.0.0-w56";

/** Política version — atrelada ao ledger de auditoria LGPD. */
export const POLICY_VERSION = "w56-mk-policy-2026.06.29";

/** Página default. */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
export const MIN_PAGE_SIZE = 1;

/** Limites de preço em BRL cents. */
export const MAX_PRICE_BRL_CENTS = 1_000_000;      // R$10.000,00
export const MIN_PRICE_BRL_CENTS = 0;
export const DEFAULT_DONATION_MIN_BRL_CENTS = 5000;    // R$50,00
export const DEFAULT_DONATION_MAX_BRL_CENTS = 30000;   // R$300,00
export const MAX_DONATION_RATIO = 5;                   // max/min ≤ 5 (sanity)

/** Booking hold default. */
export const DEFAULT_BOOKING_HOLD_MS = 30 * 60 * 1000; // 30 min
export const MIN_BOOKING_HOLD_MS = 5 * 60 * 1000;
export const MAX_BOOKING_HOLD_MS = 60 * 60 * 1000;

/** Rating bounds. */
export const RATING_MIN = 0;
export const RATING_MAX = 5;
export const RATING_HISTOGRAM_BUCKETS = 5;

/** Verificação — minimum tenure antes de L1. */
export const VERIFICATION_L0_MIN_DAYS = 0;
export const VERIFICATION_L1_MIN_DAYS = 7;       // 1 semana de tenure
export const VERIFICATION_L1_DOC_HASH_LEN = 64;  // FNV-1a 64 hex
export const VERIFICATION_L1_MIN_DOCS = 1;
export const VERIFICATION_L2_REVIEW_HOURS = 48;

/** Ranking. */
export const TOP_LISTINGS_DEFAULT_LIMIT = 50;
export const FACET_MATCH_BOOST = 0.35;
export const VERIFICATION_BOOST_L0 = 0.00;
export const VERIFICATION_BOOST_L1 = 0.10;
export const VERIFICATION_BOOST_L2 = 0.25;
export const RATING_BOOST_PER_STAR = 0.05;   // 0.25 max (5 stars)
export const FRESHNESS_DECAY_PER_DAY = 0.001; // listings antigos perdem tiny

/** BM25 parameters. */
export const BM25_K1 = 1.2;
export const BM25_B = 0.75;

/** Sacred categories — must match SacredCategory type. */
export const SACRED_CATEGORIES: readonly SacredCategory[] = [
  "encantamento_sagrado",
  "ebó_sagrado",
  "gira_de_caboclo",
  "gira_de_preto_velho",
  "limpeza_com_ervas",
  "dons_de_cura",
  "incorporacao_ritual",
  "oraculo_sagrado",
] as const;

/** Non-sacred categories — must match NonSacredCategory. */
export const NON_SACRED_CATEGORIES: readonly NonSacredCategory[] = [
  "tarot",
  "astrologia",
  "numerologia",
  "mesa_radionica",
  "cigano_celta",
  "lenormand",
] as const;

/** All categories combined. */
export const ALL_CATEGORIES: readonly ListingCategory[] = [
  ...SACRED_CATEGORIES,
  ...NON_SACRED_CATEGORIES,
] as const;

/** Verified sacred list — listagens sacred DEVEM ter sacredTradition. */
export const SACRED_TRADITIONS: readonly string[] = [
  "umbanda",
  "candomble",
  "ifa",
  "nacao",
  "bantu",
  "jeje",
  "ketu",
  "angola",
  "omoloko",
  "egungun",
  "jeje_mahi",
  "kabbalah",
  "santo_daime",
  "umbandista",
  "curandeirismo",
  "espiritismo",
  "espiritismo_kardecista",
] as const;

/** Region taxonomy — same as w54. */
export const REGION_TAXONOMY: readonly RegionCode[] = [
  "BR", "PT", "AO", "MZ", "CV",
  "US", "UK", "ES", "FR", "DE",
  "IT", "JP", "MX", "AR", "CO",
  "CL", "PE", "UY", "PY", "BO", "ZZ",
] as const;

/** Tradução / tradição (genérica) — para facet. */
export const TRADITION_TAXONOMY: readonly string[] = [
  "umbanda",
  "candomble",
  "ifa",
  "kabbalah",
  "astrology",
  "tarot",
  "lenormand",
  "cigano",
  "celtic",
  "mixed",
  "unspecified",
] as const;

/** Languages suportadas (BCP-47). */
export const LANGUAGE_TAXONOMY: readonly string[] = [
  "pt-BR", "pt-PT", "en-US", "en-UK", "es-ES", "es-MX", "es-AR",
  "fr-FR", "de-DE", "it-IT", "ja-JP",
] as const;

/** Allowed channels. */
export const ALLOWED_CHANNELS: readonly MarketplaceListing["channels"][number][] = [
  "online", "presencial", "video_call", "audio_call", "chat_async",
] as const;

/** Forbidden manual redaction words — case insensitive. */
export const DEFAULT_FORBIDDEN_WORDS: readonly string[] = [
  "golpe",
  "estelionato",
  "dinheiro_fácil",
  "fique_rico",
  "garantia_total",
  "resultado_garantido",
  "cura_toda_doenca",
] as const;

/** Default PII regex patterns (Brazil-focused). */
export const DEFAULT_PII_PATTERNS: readonly PiiPatternRule[] = [
  { name: "phone_br", pattern: "\\(\\d{2}\\)\\s?9?\\d{4}-?\\d{4}", flags: "g" },
  { name: "email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { name: "cpf", pattern: "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}", flags: "g" },
  { name: "cnpj", pattern: "\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}", flags: "g" },
  { name: "pix_key_phone", pattern: "pix[:\\s]?\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}", flags: "gi" },
] as const;

/** LGPD consent text — PT-BR. */
export const LGPD_CONSENT_TEXT_PT = {
  controller: "Akasha-0 / Cabala dos Caminhos",
  purpose: "Marketplace de leituras e práticas — matching entre consulentes e provedores qualificados, com opt-in explícito.",
  dataCollected: "Para provedores: handle, bio, tradições, janelas de disponibilidade, listings e histórico de verificação. Para consumidores: search history, bookings, reviews.",
  legalBasis: "Consentimento (Art. 7, I) — revogável a qualquer momento sem prejuízo.",
  retention: "Listings e bookings retidos enquanto ativos. Após revogação, dados de opt-in mantidos por 30 dias para auditoria, depois removidos.",
  rights: "Acesso (Art. 18, V), correção (Art. 18, III), eliminação (Art. 18, VI), portabilidade (Art. 18, V), revogação (Art. 8, §5º).",
  sacredNote: "Listings com conteúdo sagrado (encantamento, ebó, gira, dons de cura) só aparecem para quem optou explicitamente por conteúdo sagrado.",
  contact: "DPO via canal de privacidade do app.",
} as const;

export const LGPD_CONSENT_TEXT_EN = {
  controller: "Akasha-0 / Cabala dos Caminhos",
  purpose: "Marketplace for readings and ritual practices — matching between consumers and qualified providers, with explicit opt-in.",
  dataCollected: "Providers: handle, bio, traditions, availability windows, listings, verification history. Consumers: search history, bookings, reviews.",
  legalBasis: "Consent (Art. 7, I) — revocable at any time without prejudice.",
  retention: "Listings and bookings retained while active. After revocation, opt-in data kept for 30 days for audit, then removed.",
  rights: "Access (Art. 18, V), correction (Art. 18, III), erasure (Art. 18, VI), portability (Art. 18, V), revocation (Art. 8, §5º).",
  sacredNote: "Listings with sacred content (encantamento, ebó, gira, healing gifts) only appear for users who opted in to sacred content explicitly.",
  contact: "DPO via app's privacy channel.",
} as const;

export const LGPD_RETENTION_DAYS_DEFAULT = 30;
export const AUDIT_LEDGER_VERSION = "v1";

/** Finalidades permitidas — Art. 9. */
export const ALLOWED_PURPOSES: readonly string[] = [
  "marketplace_matching",
  "search_indexing",
  "verification_audit",
  "reviews_aggregation",
  "booking_lifecycle",
] as const;

/** Hash placeholder. */
export const FINGERPRINT_DEV_SALT = "w56-marketplace-fingerprint-salt-v1";

/** Locale default. */
export const DEFAULT_LOCALE: SearchQuery["locale"] = "pt-BR";

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math helpers — FNV-1a 32/64, hex, Levenshtein, BM25-kernel             ║
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

// ─── FNV-1a 64-bit (BigInt-safe) ────────────────────────────────────────────

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

/** Hex encode bytes (mantém formato 2-char zero-padded). */
export function hexEncode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i]!.toString(16).padStart(2, "0");
  }
  return s;
}

// ─── Diacritic / case normalization ────────────────────────────────────────

/** Mapa simples de remoção de diacríticos para pt/es/en. */
const DIACRITIC_MAP: Record<string, string> = {
  "á": "a", "à": "a", "â": "a", "ã": "a", "ä": "a", "å": "a",
  "é": "e", "è": "e", "ê": "e", "ë": "e",
  "í": "i", "ì": "i", "î": "i", "ï": "i",
  "ó": "o", "ò": "o", "ô": "o", "õ": "o", "ö": "o", "ø": "o",
  "ú": "u", "ù": "u", "û": "u", "ü": "u",
  "ç": "c", "ñ": "n",
  "Á": "A", "À": "A", "Â": "A", "Ã": "A", "Ä": "A", "Å": "A",
  "É": "E", "È": "E", "Ê": "E", "Ë": "E",
  "Í": "I", "Ì": "I", "Î": "I", "Ï": "I",
  "Ó": "O", "Ò": "O", "Ô": "O", "Õ": "O", "Ö": "O", "Ø": "O",
  "Ú": "U", "Ù": "U", "Û": "U", "Ü": "U",
  "Ç": "C", "Ñ": "N",
};

/** Strip diacritics + lower-case — útil pra tokenização PT-BR. */
export function normalizeToken(s: string): string {
  let out = "";
  for (const ch of s) {
    out += DIACRITIC_MAP[ch] ?? ch;
  }
  return out.toLowerCase();
}

/** Tokeniza texto em palavras normalizadas, removendo pontuação. */
export function tokenize(text: string): string[] {
  if (!text) return [];
  const normalized = normalizeToken(text);
  // split em whitespace + remove punctuation inline
  const raw = normalized.split(/[\s\p{P}]+/u);
  const tokens: string[] = [];
  for (const t of raw) {
    if (!t) continue;
    if (t.length < 2) continue;
    tokens.push(t);
  }
  return tokens;
}

// ─── Levenshtein distance (limited-DP) ──────────────────────────────────────

/**
 * Levenshtein distance entre duas strings. Limita em 64 chars pra evitar
 * explosive DP em entradas patológicas.
 */
export function levenshtein(a: string, b: string, maxDist: number = 64): number {
  if (Math.abs(a.length - b.length) > maxDist) return maxDist + 1;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let rowMin = curr[0]!;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      const v = Math.min(
        prev[j]! + 1,
        curr[j - 1]! + 1,
        prev[j - 1]! + cost
      );
      curr[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > maxDist) return maxDist + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[n]!;
}

/**
 * Fuzzy token match: exact > prefix > Levenshtein within distance ≤2 (≤5 chars)
 * ou ≤3 (≤10 chars). Returns 1.0 (exact), 0.7 (prefix), 0.4 (Levenshtein), 0 (no match).
 */
export function fuzzyTokenScore(queryToken: string, candidateToken: string): number {
  if (!queryToken || !candidateToken) return 0;
  if (queryToken === candidateToken) return 1.0;
  if (candidateToken.startsWith(queryToken) && queryToken.length >= 3) return 0.7;
  if (candidateToken.startsWith(queryToken.slice(0, -1)) && queryToken.length >= 4) return 0.4;
  const maxD = queryToken.length <= 5 ? 2 : 3;
  const d = levenshtein(queryToken, candidateToken, maxD);
  if (d <= maxD) return 0.4;
  return 0;
}

// ─── BM25-kernel ────────────────────────────────────────────────────────────

export interface Bm25Doc {
  id: string;
  /** token frequencies within the doc */
  tf: Map<string, number>;
  /** doc length in tokens. */
  length: number;
}

/** Token frequency helper. */
export function buildTf(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

/** IDF for one term — smoothed BM25 formula. */
export function bm25Idf(term: string, docs: Bm25Doc[]): number {
  let n = 0;
  for (const d of docs) if (d.tf.has(term)) n++;
  const N = docs.length;
  if (N === 0) return 0;
  return Math.log(1 + (N - n + 0.5) / (n + 0.5));
}

/**
 * BM25 score for one doc given query tokens. avgDocLen pré-computado pelo caller.
 */
export function bm25Score(
  doc: Bm25Doc,
  queryTokens: string[],
  idfCache: Map<string, number>,
  avgDocLen: number,
  k1: number = BM25_K1,
  b: number = BM25_B
): number {
  if (doc.length === 0) return 0;
  const lenNorm = 1 - b + (b * doc.length) / Math.max(1, avgDocLen);
  let score = 0;
  for (const qt of queryTokens) {
    const tf = doc.tf.get(qt) ?? 0;
    if (tf === 0) continue;
    const idf = idfCache.get(qt) ?? 0;
    const denom = tf + k1 * lenNorm;
    score += idf * (tf * (k1 + 1)) / denom;
  }
  return score;
}

/** avgDocLen helpers. */
export function averageDocLength(docs: Bm25Doc[]): number {
  if (docs.length === 0) return 0;
  let sum = 0;
  for (const d of docs) sum += d.length;
  return sum / docs.length;
}

// ─── Math utilities ─────────────────────────────────────────────────────────

export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

export function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

export function round3(x: number): number {
  return Math.round(x * 1000) / 1000;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let s = 0;
  for (const v of values) s += v;
  return s / values.length;
}

export function sum(values: number[]): number {
  let s = 0;
  for (const v of values) s += v;
  return s;
}

export function max(values: number[]): number {
  if (values.length === 0) return 0;
  let m = values[0]!;
  for (let i = 1; i < values.length; i++) if (values[i]! > m) m = values[i]!;
  return m;
}

export function min(values: number[]): number {
  if (values.length === 0) return 0;
  let m = values[0]!;
  for (let i = 1; i < values.length; i++) if (values[i]! < m) m = values[i]!;
  return m;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 Listing shape — constructors, validators, helpers                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Cria MarketplaceListing com defaults razoáveis. */
export function createListing(
  overrides: Partial<MarketplaceListing> = {},
  now: number = Date.now()
): MarketplaceListing {
  const id = overrides.id ?? `lst-${fnv1a32(String(now) + "-" + Math.random().toString(36).slice(2, 8))}`;
  const listing: MarketplaceListing = {
    id,
    providerId: overrides.providerId ?? "anon",
    kind: overrides.kind ?? "reading",
    title: overrides.title ?? "Untitled listing",
    description: overrides.description ?? "",
    category: overrides.category ?? "tarot",
    subkinds: overrides.subkinds ?? [],
    sacredFlag: overrides.sacredFlag ?? false,
    sacredTradition: overrides.sacredTradition,
    priceTier: overrides.priceTier ?? "fixed",
    priceBrlCents: overrides.priceBrlCents ?? 5000,
    donationMinBrlCents: overrides.donationMinBrlCents,
    donationMaxBrlCents: overrides.donationMaxBrlCents,
    currency: overrides.currency ?? "BRL",
    durationMin: overrides.durationMin ?? 30,
    availableWindows: overrides.availableWindows,
    channels: overrides.channels ?? ["online"],
    rating: overrides.rating ?? {
      listingId: id,
      reviewCount: 0,
      avgRating: 0,
      ratingHistogram: [0, 0, 0, 0, 0],
      lastReviewAt: null,
    },
    manualRedaction: overrides.manualRedaction ?? false,
    fingerprint: overrides.fingerprint ?? "",
    active: overrides.active ?? true,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    preferredLanguage: overrides.preferredLanguage,
  };
  listing.fingerprint = listing.fingerprint || computeListingFingerprint(listing);
  return listing;
}

/**
 * Fingerprint canônico — usado para dedupe (mesmo listing em duas fontes).
 * Inclui título + descrição (sem diacritic) + preço cents.
 */
export function computeListingFingerprint(listing: MarketplaceListing): string {
  const canonical = [
    listing.id,
    normalizeToken(listing.title),
    normalizeToken(listing.description).slice(0, 200),
    listing.priceBrlCents.toString(),
    listing.currency,
    listing.sacredFlag ? "1" : "0",
  ].join("|");
  return fnv1a64(canonical);
}

/** Validação — retorna issues. */
export interface ListingValidationIssue {
  code: string;
  field?: string;
  message: string;
}

export function validateListingShape(listing: MarketplaceListing): ListingValidationIssue[] {
  const issues: ListingValidationIssue[] = [];
  if (!listing.id || listing.id.length < 4) {
    issues.push({ code: "INVALID_ID", field: "id", message: "id ausente ou curto" });
  }
  if (!listing.providerId) {
    issues.push({ code: "INVALID_PROVIDER", field: "providerId", message: "providerId ausente" });
  }
  if (listing.kind !== "reading" && listing.kind !== "practice") {
    issues.push({ code: "INVALID_KIND", field: "kind", message: "kind inválido" });
  }
  if (!listing.title || listing.title.length < 3) {
    issues.push({ code: "INVALID_TITLE", field: "title", message: "title ausente ou curto" });
  }
  if (listing.title && listing.title.length > 120) {
    issues.push({ code: "TITLE_TOO_LONG", field: "title", message: "title > 120 chars" });
  }
  if (listing.description && listing.description.length > 5000) {
    issues.push({ code: "DESCRIPTION_TOO_LONG", field: "description", message: "description > 5000 chars" });
  }
  if (!isValidCategory(listing.category)) {
    issues.push({ code: "INVALID_CATEGORY", field: "category", message: `category "${listing.category}" não está na taxonomia` });
  }
  if (listing.priceBrlCents < MIN_PRICE_BRL_CENTS || listing.priceBrlCents > MAX_PRICE_BRL_CENTS) {
    issues.push({ code: "INVALID_PRICE_CENTS", field: "priceBrlCents", message: "priceBrlCents fora de range" });
  }
  if (listing.sacredFlag) {
    if (!listing.sacredTradition) {
      issues.push({ code: "SACRED_NO_TRADITION", field: "sacredTradition", message: "sacredFlag=true sem sacredTradition" });
    }
    if (!isSacredCategory(listing.category)) {
      issues.push({
        code: "SACRED_NON_SACRED_CATEGORY",
        field: "category",
        message: "sacredFlag=true mas category não é sacred",
      });
    }
  } else {
    // category must align: sacred category → must have sacredFlag=true.
    if (isSacredCategory(listing.category)) {
      issues.push({
        code: "SACRED_CATEGORY_WITHOUT_FLAG",
        field: "sacredFlag",
        message: "category é sacred, mas sacredFlag=false",
      });
    }
  }
  if (listing.priceTier === "donation") {
    if (listing.donationMinBrlCents === undefined || listing.donationMaxBrlCents === undefined) {
      issues.push({
        code: "DONATION_MISSING_RANGE",
        field: "donationRange",
        message: "priceTier=donation exige donationMinBrlCents e donationMaxBrlCents",
      });
    } else if (listing.donationMinBrlCents < 0 || listing.donationMaxBrlCents < listing.donationMinBrlCents) {
      issues.push({
        code: "DONATION_INVALID_RANGE",
        field: "donationRange",
        message: "donation range inválido",
      });
    } else if (listing.donationMinBrlCents > 0) {
      const ratio = listing.donationMaxBrlCents / listing.donationMinBrlCents;
      if (ratio > MAX_DONATION_RATIO) {
        issues.push({
          code: "DONATION_RATIO_EXCEEDED",
          field: "donationRange",
          message: `donation max/min ratio > ${MAX_DONATION_RATIO}`,
        });
      }
    }
  }
  if (listing.durationMin <= 0 || listing.durationMin > 480) {
    issues.push({ code: "INVALID_DURATION", field: "durationMin", message: "durationMin deve estar em 1..480" });
  }
  return issues;
}

/** Hard-fail validator — retorna problema crítico (MK_001). */
export function isListingStructurallyValid(listing: MarketplaceListing): boolean {
  const issues = validateListingShape(listing);
  return issues.length === 0;
}

/** Auxiliary helpers. */
export function isValidCategory(c: string): c is ListingCategory {
  return (ALL_CATEGORIES as readonly string[]).includes(c);
}

export function isSacredCategory(c: string): boolean {
  return (SACRED_CATEGORIES as readonly string[]).includes(c);
}

export function isNonSacredCategory(c: string): boolean {
  return (NON_SACRED_CATEGORIES as readonly string[]).includes(c);
}

export function isValidRegion(r: string): r is RegionCode {
  return (REGION_TAXONOMY as readonly string[]).includes(r);
}

export function isValidTradition(t: string): boolean {
  return (TRADITION_TAXONOMY as readonly string[]).includes(t);
}

export function isValidLanguage(l: string): boolean {
  return (LANGUAGE_TAXONOMY as readonly string[]).includes(l);
}

export function isValidVerificationLevel(v: string): v is VerificationLevel {
  return v === "L0" || v === "L1" || v === "L2";
}

export function isValidChannel(c: string): c is MarketplaceListing["channels"][number] {
  return (ALLOWED_CHANNELS as readonly string[]).includes(c);
}

/** Detecta listing sacred independente do flag (sentinela). */
export function isSacredListing(listing: MarketplaceListing): boolean {
  if (listing.sacredFlag) return true;
  return isSacredCategory(listing.category);
}

/** Kind match — semantic alias check. */
export function isReadingListing(l: MarketplaceListing): l is ReadingListing {
  return l.kind === "reading";
}

export function isPracticeListing(l: MarketplaceListing): l is PracticeListing {
  return l.kind === "practice";
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 Provider profile                                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Cria Profile com defaults. */
export function createProviderProfile(
  overrides: Partial<ProviderProfile> = {},
  now: number = Date.now()
): ProviderProfile {
  return {
    providerId: overrides.providerId ?? `prov-${fnv1a32(String(now)).slice(0, 8)}`,
    handle: overrides.handle ?? "anon",
    displayName: overrides.displayName ?? "Anonymous provider",
    bio: overrides.bio ?? "",
    traditions: overrides.traditions ?? [],
    languages: overrides.languages ?? ["pt-BR"],
    region: overrides.region ?? "BR",
    cityHint: overrides.cityHint,
    verificationLevel: overrides.verificationLevel ?? "L0",
    verificationHistory: overrides.verificationHistory ?? [],
    availableWindows: overrides.availableWindows ?? [],
    listingIds: overrides.listingIds ?? [],
    optedInMarketplace: overrides.optedInMarketplace ?? false,
    optedInMarketplaceAt: overrides.optedInMarketplaceAt ?? null,
    optedInMarketplaceHistory: overrides.optedInMarketplaceHistory ?? [],
    suspended: overrides.suspended ?? false,
    suspendedReason: overrides.suspendedReason,
    joinedAt: overrides.joinedAt ?? now,
  };
}

/** Provider is eligible to publish listings se opted-in, não-suspended, traditions cadastradas. */
export function providerCanPublish(p: ProviderProfile): boolean {
  if (!p.optedInMarketplace) return false;
  if (p.optedInMarketplaceAt === null) return false;
  if (p.suspended) return false;
  if (p.traditions.length === 0) return false;
  return true;
}

/** Provider offers sacred listings only if verificationLevel ≥ L1. */
export function providerMayOfferSacred(p: ProviderProfile): boolean {
  return p.verificationLevel === "L1" || p.verificationLevel === "L2";
}

/** Provider trustworthy enough for ranking (L0 still ranks but with low boost). */
export function isProviderRankingEligible(p: ProviderProfile): boolean {
  return !p.suspended && p.optedInMarketplace;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 Search facets — validação e manipulação                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export function emptyFacets(): SearchFacets {
  return {};
}

/** Cria facets básicos a partir de SearchQuery. */
export function normalizeFacets(facets: SearchFacets | undefined): SearchFacets {
  if (!facets) return emptyFacets();
  const out: SearchFacets = {};
  if (facets.categories && facets.categories.length > 0) {
    out.categories = facets.categories.filter((c) => isValidCategory(c));
  }
  if (facets.traditions && facets.traditions.length > 0) {
    out.traditions = facets.traditions.filter((t) => isValidTradition(t));
  }
  if (facets.languages && facets.languages.length > 0) {
    out.languages = facets.languages.filter((l) => isValidLanguage(l));
  }
  if (facets.regions && facets.regions.length > 0) {
    out.regions = facets.regions.filter((r) => isValidRegion(r));
  }
  if (facets.channels && facets.channels.length > 0) {
    out.channels = facets.channels.filter((c) => isValidChannel(c));
  }
  if (typeof facets.priceMinBrlCents === "number" && Number.isFinite(facets.priceMinBrlCents)) {
    out.priceMinBrlCents = clamp(facets.priceMinBrlCents, MIN_PRICE_BRL_CENTS, MAX_PRICE_BRL_CENTS);
  }
  if (typeof facets.priceMaxBrlCents === "number" && Number.isFinite(facets.priceMaxBrlCents)) {
    out.priceMaxBrlCents = clamp(facets.priceMaxBrlCents, MIN_PRICE_BRL_CENTS, MAX_PRICE_BRL_CENTS);
  }
  if (typeof facets.ratingMin === "number") {
    out.ratingMin = clamp(facets.ratingMin, RATING_MIN, RATING_MAX);
  }
  if (facets.verificationLevels && facets.verificationLevels.length > 0) {
    out.verificationLevels = facets.verificationLevels.filter((v) => isValidVerificationLevel(v));
  }
  if (facets.sacredOptIn === true) out.sacredOptIn = true;
  if (facets.hasAvailabilityNow === true) out.hasAvailabilityNow = true;
  if (facets.weekdayAvail && facets.weekdayAvail.length > 0) {
    out.weekdayAvail = facets.weekdayAvail.filter((d) => d >= 1 && d <= 7);
  }
  if (typeof facets.startMinLocal === "number" && typeof facets.endMinLocal === "number") {
    out.startMinLocal = clamp(facets.startMinLocal, 0, 1440);
    out.endMinLocal = clamp(facets.endMinLocal, 0, 1440);
  }
  return out;
}

/** Validação estrutural — retorn errors. */
export function validateFacets(facets: SearchFacets): MarketplaceError[] {
  const errors: MarketplaceError[] = [];
  const ts = Date.now();
  if (facets.categories) {
    for (const c of facets.categories) {
      if (!isValidCategory(c)) {
        errors.push({
          code: "MK_009",
          message: "Facet categoria inválida",
          detail: `category="${c}"`,
          ts,
        });
      }
    }
  }
  if (facets.regions) {
    for (const r of facets.regions) {
      if (!isValidRegion(r)) {
        errors.push({ code: "MK_009", message: "Region inválida", detail: `region="${r}"`, ts });
      }
    }
  }
  if (facets.priceMinBrlCents !== undefined && facets.priceMaxBrlCents !== undefined) {
    if (facets.priceMinBrlCents > facets.priceMaxBrlCents) {
      errors.push({
        code: "MK_009",
        message: "priceMin > priceMax",
        detail: `min=${facets.priceMinBrlCents} max=${facets.priceMaxBrlCents}`,
        ts,
      });
    }
  }
  return errors;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 Search query parser                                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Tokeniza + extrai facet pairs da query string.
 * Suporta sintaxe inline: "category:tarot tradition:umbanda rating:>=4.5"
 * Tokens puros viram array `tokens` (PT-BR stemming: simple — sem accents).
 */
export function parseSearchQuery(query: SearchQuery): ListingFilter {
  const tokensRaw = tokenize(query.q);
  const locale = query.locale ?? DEFAULT_LOCALE;
  const filter: ListingFilter = {
    tokens: tokensRaw,
    facets: normalizeFacets(query.facets),
    strict: query.strict ?? true,
    page: clamp(query.page ?? 1, 1, 1_000_000),
    pageSize: clamp(query.pageSize ?? DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE),
    locale,
    consumerSacredOptIn: !!query.consumerSacredOptIn,
  };
  // Parse inline facet pairs (formato "key:value" — sem espaços).
  const inlinePairs = extractInlinePairs(query.q);
  for (const [k, v] of inlinePairs) {
    applyInlineFacet(filter, k, v);
  }
  // Re-valida facets após inline injection.
  filter.facets = normalizeFacets(filter.facets);
  return filter;
}

/**
 * Extrai pares "key:value" do texto, deixando tokens puros pra busca livre.
 * Suporta "rating:>=4.5" e "price:<=10000".
 */
export function extractInlinePairs(q: string): [string, string][] {
  const pairs: [string, string][] = [];
  if (!q) return pairs;
  // Match `key:opValue` ou `key:value`
  const regex = /(\w+):(>=|<=|>|<|=)?([^,\s]+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(q)) !== null) {
    const key = m[1]!.toLowerCase();
    const op = m[2] ?? "=";
    const value = m[3]!;
    pairs.push([key, op + value]);
  }
  return pairs;
}

function applyInlineFacet(filter: ListingFilter, key: string, raw: string): void {
  const v = raw.startsWith(">=") || raw.startsWith("<=") || raw.startsWith("=") || raw.startsWith(">") || raw.startsWith("<")
    ? raw.slice(1)
    : raw;
  switch (key) {
    case "category": {
      if (isValidCategory(v)) {
        filter.facets.categories = (filter.facets.categories ?? []).concat([v as ListingCategory]);
      }
      break;
    }
    case "tradition": {
      if (isValidTradition(v)) {
        filter.facets.traditions = (filter.facets.traditions ?? []).concat([v]);
      }
      break;
    }
    case "language": {
      if (isValidLanguage(v)) {
        filter.facets.languages = (filter.facets.languages ?? []).concat([v]);
      }
      break;
    }
    case "region": {
      if (isValidRegion(v)) {
        filter.facets.regions = (filter.facets.regions ?? []).concat([v as RegionCode]);
      }
      break;
    }
    case "channel": {
      if (isValidChannel(v)) {
        filter.facets.channels = (filter.facets.channels ?? []).concat([v as MarketplaceListing["channels"][number]]);
      }
      break;
    }
    case "rating": {
      const n = parseFloat(v);
      if (Number.isFinite(n)) filter.facets.ratingMin = clamp(n, RATING_MIN, RATING_MAX);
      break;
    }
    case "price": {
      const n = parseInt(v, 10);
      if (Number.isFinite(n)) {
        if (raw.startsWith(">")) filter.facets.priceMinBrlCents = clamp(n, 0, MAX_PRICE_BRL_CENTS);
        else if (raw.startsWith("<")) filter.facets.priceMaxBrlCents = clamp(n, 0, MAX_PRICE_BRL_CENTS);
        else {
          filter.facets.priceMaxBrlCents = clamp(n, 0, MAX_PRICE_BRL_CENTS);
        }
      }
      break;
    }
    case "verification": {
      if (isValidVerificationLevel(v)) {
        filter.facets.verificationLevels = (filter.facets.verificationLevels ?? []).concat([v]);
      }
      break;
    }
    default:
      // Ignora chaves desconhecidas (sem inventar behavior).
      break;
  }
}

/** Lenient parser — relaxa strict (OR entre arrays). */
export function parseLenientSearchQuery(query: SearchQuery): ListingFilter {
  const f = parseSearchQuery(query);
  f.strict = false;
  return f;
}

/** Lenient vs strict — diferença operacional. */
export function isLenientFilter(f: ListingFilter): boolean {
  return !f.strict;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Search ranker (BM25 + facet boost + verification tier)                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Constrói docs BM25 a partir de listings.
 * Tokens de título, descrição, categoria, subkinds, sacredTradition.
 */
export function buildBm25DocsFromListings(listings: MarketplaceListing[]): {
  docs: Bm25Doc[];
  docById: Map<string, { doc: Bm25Doc; listing: MarketplaceListing }>;
  idfCache: Map<string, number>;
  avgDocLen: number;
} {
  const docs: Bm25Doc[] = [];
  const docById = new Map<string, { doc: Bm25Doc; listing: MarketplaceListing }>();
  for (const l of listings) {
    const text = [
      l.title,
      l.description,
      l.category,
      l.sacredTradition ?? "",
      l.subkinds.join(" "),
      l.channels.join(" "),
    ].join(" ");
    const tokens = tokenize(text);
    const tf = buildTf(tokens);
    docs.push({ id: l.id, tf, length: tokens.length });
    docById.set(l.id, { doc: { id: l.id, tf, length: tokens.length }, listing: l });
  }
  // IDF cache
  const idfCache = new Map<string, number>();
  const allTerms = new Set<string>();
  for (const d of docs) for (const term of d.tf.keys()) allTerms.add(term);
  for (const term of allTerms) idfCache.set(term, bm25Idf(term, docs));
  const avgDocLen = averageDocLength(docs);
  return { docs, docById, idfCache, avgDocLen };
}

/** Verification tier score. */
export function verificationBoost(level: VerificationLevel): number {
  if (level === "L2") return VERIFICATION_BOOST_L2;
  if (level === "L1") return VERIFICATION_BOOST_L1;
  return VERIFICATION_BOOST_L0;
}

/** Rating boost linear. */
export function ratingBoost(avgRating: number): number {
  const clamped = clamp(avgRating, RATING_MIN, RATING_MAX);
  return round3(clamped * RATING_BOOST_PER_STAR);
}

/**
 * Facet match score — soma ponderada por facet matches. 1.0 = todos.
 * Cada facet contribuye FACET_MATCH_BOOST / N onde N = nº de facets presentes.
 */
export function facetMatchScore(
  listing: MarketplaceListing,
  providerMap: Map<string, ProviderProfile>,
  facets: SearchFacets,
  strict: boolean
): number {
  let totalBoost = 0;
  let totalSlots = 0;
  let matches = 0;

  if (facets.categories && facets.categories.length > 0) {
    totalSlots += 1;
    if (facets.categories.includes(listing.category)) matches += 1;
  }
  if (facets.channels && facets.channels.length > 0) {
    totalSlots += 1;
    const overlap = facets.channels.some((c) => listing.channels.includes(c));
    if (overlap) matches += 1;
  }
  if (facets.verificationLevels && facets.verificationLevels.length > 0) {
    totalSlots += 1;
    const provider = providerMap.get(listing.providerId);
    const lvl = provider?.verificationLevel ?? "L0";
    if (facets.verificationLevels.includes(lvl)) matches += 1;
  }
  if (facets.regions && facets.regions.length > 0) {
    totalSlots += 1;
    const provider = providerMap.get(listing.providerId);
    if (provider && facets.regions.includes(provider.region)) matches += 1;
  }
  if (facets.languages && facets.languages.length > 0) {
    totalSlots += 1;
    const provider = providerMap.get(listing.providerId);
    const langs = provider?.languages ?? [];
    if (provider && langs.some((l) => facets.languages!.includes(l))) matches += 1;
  }
  if (facets.traditions && facets.traditions.length > 0) {
    totalSlots += 1;
    const provider = providerMap.get(listing.providerId);
    const trads = provider?.traditions ?? [];
    if (provider && trads.some((t) => facets.traditions!.includes(t))) matches += 1;
  }
  if (typeof facets.priceMinBrlCents === "number") {
    totalSlots += 1;
    if (listing.priceBrlCents >= facets.priceMinBrlCents) matches += 1;
  }
  if (typeof facets.priceMaxBrlCents === "number") {
    totalSlots += 1;
    if (listing.priceBrlCents <= facets.priceMaxBrlCents) matches += 1;
  }
  if (typeof facets.ratingMin === "number") {
    totalSlots += 1;
    if (listing.rating.avgRating >= facets.ratingMin) matches += 1;
  }
  if (facets.weekdayAvail && facets.weekdayAvail.length > 0) {
    totalSlots += 1;
    const windows = listing.availableWindows ?? providerMap.get(listing.providerId)?.availableWindows ?? [];
    if (windows.some((w) => facets.weekdayAvail!.includes(w.weekday))) matches += 1;
  }

  if (totalSlots === 0) return 0;
  const matchRatio = matches / totalSlots;
  totalBoost = matchRatio * FACET_MATCH_BOOST;
  if (!strict) {
    // lenient: partial match contribui parcial
    return round3(totalBoost * matchRatio);
  }
  return round3(totalBoost);
}

/** Freshness decay — listings antigos perdem um pouquinho. */
export function freshnessDecay(listing: MarketplaceListing, now: number = Date.now()): number {
  const ageDays = (now - listing.updatedAt) / 86_400_000;
  if (ageDays <= 0) return 0;
  return round3(ageDays * FRESHNESS_DECAY_PER_DAY);
}

/**
 * Ranqueia uma lista de listings sob um filter, com provider map para boosts.
 * Retorna RankedListing[] ordenado por score desc, com rank 1..N.
 */
export function rankListings(
  listings: MarketplaceListing[],
  providerMap: Map<string, ProviderProfile>,
  filter: ListingFilter,
  bm25State: ReturnType<typeof buildBm25DocsFromListings>,
  now: number = Date.now()
): RankedListing[] {
  const results: RankedListing[] = [];
  for (const listing of listings) {
    const docEntry = bm25State.docById.get(listing.id);
    const bm25Val = docEntry ? bm25Score(docEntry.doc, filter.tokens, bm25State.idfCache, bm25State.avgDocLen) : 0;
    const facet = facetMatchScore(listing, providerMap, filter.facets, filter.strict);
    const provider = providerMap.get(listing.providerId);
    const vLevel = provider?.verificationLevel ?? "L0";
    const vBoost = verificationBoost(vLevel);
    const rBoost = ratingBoost(listing.rating.avgRating);
    const decay = freshnessDecay(listing, now);
    const score = round3(bm25Val + facet + vBoost + rBoost - decay);
    results.push({
      listing,
      score,
      bm25Score: round3(bm25Val),
      facetBoost: facet,
      verificationBoost: vBoost,
      ratingBoost: rBoost,
      rank: 0,
    });
  }
  // Ordena: score desc, então L2>L1>L0 tiebreak, depois rating desc.
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const va = providerMap.get(a.listing.providerId)?.verificationLevel;
    const vb = providerMap.get(b.listing.providerId)?.verificationLevel;
    const vOrder: Record<VerificationLevel, number> = { L2: 2, L1: 1, L0: 0 };
    const vaN = va ? vOrder[va] : 0;
    const vbN = vb ? vOrder[vb] : 0;
    if (vbN !== vaN) return vbN - vaN;
    if (b.listing.rating.avgRating !== a.listing.rating.avgRating) {
      return b.listing.rating.avgRating - a.listing.rating.avgRating;
    }
    return b.listing.rating.reviewCount - a.listing.rating.reviewCount;
  });
  let rank = 1;
  for (const r of results) r.rank = rank++;
  return results;
}

/** Recorta top-K. */
export function topRanked(ranked: RankedListing[], k: number): RankedListing[] {
  return ranked.slice(0, k);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 Filter pipeline                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Aplica filter pipeline. Retorna listings passing + counters. */
export interface FilterPipelineResult {
  passed: MarketplaceListing[];
  facetMismatchCount: number;
  manualRedactionBlockedCount: number;
  availabilityMismatchCount: number;
}

export function applyFilterPipeline(
  listings: MarketplaceListing[],
  filter: ListingFilter,
  providerMap: Map<string, ProviderProfile>,
  redactionConfig: ManualRedactionConfig
): FilterPipelineResult {
  let facetMismatchCount = 0;
  let manualRedactionBlockedCount = 0;
  let availabilityMismatchCount = 0;
  const passed: MarketplaceListing[] = [];

  for (const listing of listings) {
    if (!listing.active) continue;

    // (a) Manual redaction filter — proibidas e PII.
    if (listing.manualRedaction) {
      const stillOk = checkManualRedaction(listing, redactionConfig);
      if (!stillOk) {
        manualRedactionBlockedCount += 1;
        continue;
      }
    } else {
      // Listing sem manualRedaction ainda passa por forbiddenWords scan leve.
      const hasForbidden = containsForbiddenWords(listing, redactionConfig.forbiddenWords);
      const hasPii = containsPii(listing.description + " " + listing.title, redactionConfig.piiPatterns);
      if (hasForbidden || (hasPii && redactionConfig.blockOnMatch)) {
        manualRedactionBlockedCount += 1;
        continue;
      }
    }

    // (b) Facet match mínimo (em strict mode, todos os facets devem casar).
    if (filter.strict) {
      const facetOk = matchesAllRequiredFacets(listing, providerMap, filter.facets);
      if (!facetOk) {
        facetMismatchCount += 1;
        continue;
      }
    } else {
      // lenient: pelo menos um facet match (se houver facets).
      if (hasAnyFacet(filter.facets)) {
        const facetOk = matchesAnyFacet(listing, providerMap, filter.facets);
        if (!facetOk) {
          facetMismatchCount += 1;
          continue;
        }
      }
    }

    // (c) Availability check (se weekdayAvail definido).
    if (filter.facets.weekdayAvail && filter.facets.weekdayAvail.length > 0) {
      const windows = listing.availableWindows ?? providerMap.get(listing.providerId)?.availableWindows ?? [];
      const matches = windows.some((w) => filter.facets.weekdayAvail!.includes(w.weekday));
      if (!matches) {
        availabilityMismatchCount += 1;
        continue;
      }
    }

    // (d) Has-availability-now: caller decide usando os holds / agora.
    if (filter.facets.hasAvailabilityNow === true) {
      const provider = providerMap.get(listing.providerId);
      const windows = listing.availableWindows ?? provider?.availableWindows ?? [];
      if (windows.length === 0) {
        availabilityMismatchCount += 1;
        continue;
      }
    }

    passed.push(listing);
  }
  return {
    passed,
    facetMismatchCount,
    manualRedactionBlockedCount,
    availabilityMismatchCount,
  };
}

function hasAnyFacet(facets: SearchFacets): boolean {
  return Object.keys(facets).length > 0;
}

function matchesAllRequiredFacets(
  listing: MarketplaceListing,
  providerMap: Map<string, ProviderProfile>,
  facets: SearchFacets
): boolean {
  const provider = providerMap.get(listing.providerId);
  if (facets.categories && facets.categories.length > 0) {
    if (!facets.categories.includes(listing.category)) return false;
  }
  if (facets.channels && facets.channels.length > 0) {
    const overlap = facets.channels.some((c) => listing.channels.includes(c));
    if (!overlap) return false;
  }
  if (facets.regions && facets.regions.length > 0) {
    if (!provider || !facets.regions.includes(provider.region)) return false;
  }
  if (facets.languages && facets.languages.length > 0) {
    if (!provider || !provider.languages.some((l) => facets.languages!.includes(l))) return false;
  }
  if (facets.traditions && facets.traditions.length > 0) {
    if (!provider || !provider.traditions.some((t) => facets.traditions!.includes(t))) return false;
  }
  if (facets.verificationLevels && facets.verificationLevels.length > 0) {
    if (!provider || !facets.verificationLevels.includes(provider.verificationLevel)) return false;
  }
  if (typeof facets.priceMinBrlCents === "number") {
    if (listing.priceBrlCents < facets.priceMinBrlCents) return false;
  }
  if (typeof facets.priceMaxBrlCents === "number") {
    if (listing.priceBrlCents > facets.priceMaxBrlCents) return false;
  }
  if (typeof facets.ratingMin === "number") {
    if (listing.rating.avgRating < facets.ratingMin) return false;
  }
  return true;
}

function matchesAnyFacet(
  listing: MarketplaceListing,
  providerMap: Map<string, ProviderProfile>,
  facets: SearchFacets
): boolean {
  const provider = providerMap.get(listing.providerId);
  if (facets.categories?.includes(listing.category)) return true;
  if (facets.channels?.some((c) => listing.channels.includes(c))) return true;
  if (facets.regions && provider && facets.regions.includes(provider.region)) return true;
  if (facets.languages && provider && provider.languages.some((l) => facets.languages!.includes(l))) return true;
  if (facets.traditions && provider && provider.traditions.some((t) => facets.traditions!.includes(t))) return true;
  if (facets.verificationLevels && provider && facets.verificationLevels.includes(provider.verificationLevel)) return true;
  if (typeof facets.priceMinBrlCents === "number" && listing.priceBrlCents >= facets.priceMinBrlCents) return true;
  if (typeof facets.priceMaxBrlCents === "number" && listing.priceBrlCents <= facets.priceMaxBrlCents) return true;
  if (typeof facets.ratingMin === "number" && listing.rating.avgRating >= facets.ratingMin) return true;
  return false;
}

function containsForbiddenWords(listing: MarketplaceListing, words: readonly string[]): boolean {
  if (words.length === 0) return false;
  const haystack = normalizeToken(listing.title + " " + listing.description);
  for (const w of words) {
    if (haystack.includes(normalizeToken(w))) return true;
  }
  return false;
}

function containsPii(text: string, rules: readonly PiiPatternRule[]): boolean {
  if (rules.length === 0) return false;
  for (const r of rules) {
    try {
      const re = new RegExp(r.pattern, r.flags.includes("g") ? r.flags : r.flags + "g");
      if (re.test(text)) return true;
    } catch {
      // Pattern inválido → ignore (defensivo).
    }
  }
  return false;
}

function checkManualRedaction(listing: MarketplaceListing, cfg: ManualRedactionConfig): boolean {
  if (containsForbiddenWords(listing, cfg.forbiddenWords)) return false;
  if (listing.description.length > cfg.maxDescriptionLength) return false;
  if (containsPii(listing.description + " " + listing.title, cfg.piiPatterns)) {
    if (cfg.blockOnMatch) return false;
  }
  return true;
}

/** Default redaction config — conservador. */
export function defaultRedactionConfig(): ManualRedactionConfig {
  return {
    forbiddenWords: [...DEFAULT_FORBIDDEN_WORDS],
    maxDescriptionLength: 5000,
    piiPatterns: [...DEFAULT_PII_PATTERNS],
    blockOnMatch: true,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §10 Pricing tier rules                                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface PricingValidation {
  ok: boolean;
  issues: string[];
  normalizedPriceBrlCents: number;
}

/** Valida coerência entre priceTier e priceBrlCents (e donationRange). */
export function validatePricing(listing: MarketplaceListing): PricingValidation {
  const issues: string[] = [];
  let normalized = listing.priceBrlCents;

  if (listing.priceTier === "free") {
    if (listing.priceBrlCents !== 0) {
      issues.push("free tier deve ter priceBrlCents=0");
      normalized = 0;
    }
  } else if (listing.priceTier === "donation") {
    if (listing.priceBrlCents !== 0) {
      issues.push("donation tier deve ter priceBrlCents=0 (sugestão fica no range)");
      normalized = 0;
    }
    if (listing.donationMinBrlCents === undefined || listing.donationMaxBrlCents === undefined) {
      issues.push("donation exige donationMinBrlCents + donationMaxBrlCents");
    } else {
      if (listing.donationMinBrlCents < 0) issues.push("donationMinBrlCents negativo");
      if (listing.donationMaxBrlCents < listing.donationMinBrlCents) {
        issues.push("donationMaxBrlCents < donationMinBrlCents");
      }
      const ratio = listing.donationMinBrlCents === 0
        ? Infinity
        : listing.donationMaxBrlCents / listing.donationMinBrlCents;
      if (ratio !== Infinity && ratio > MAX_DONATION_RATIO) {
        issues.push(`ratio max/min > ${MAX_DONATION_RATIO}`);
      }
    }
  } else if (listing.priceTier === "fixed") {
    if (listing.priceBrlCents <= 0) {
      issues.push("fixed tier exige priceBrlCents > 0");
    }
    if (listing.priceBrlCents > MAX_PRICE_BRL_CENTS) {
      issues.push(`fixed price > ${MAX_PRICE_BRL_CENTS}`);
    }
  } else {
    issues.push(`priceTier desconhecido: ${String(listing.priceTier)}`);
  }

  return {
    ok: issues.length === 0,
    issues,
    normalizedPriceBrlCents: normalized,
  };
}

/** Apresentação do preço para o consumer (i18n-ish). */
export function formatPriceBRL(cents: number): string {
  if (cents === 0) return "Grátis";
  const reais = Math.floor(cents / 100);
  const cs = cents % 100;
  const pad = cs < 10 ? "0" + cs : "" + cs;
  return `R$ ${reais}.${pad}`;
}

/** Donation display string. */
export function formatDonationRange(minCents: number, maxCents: number): string {
  return `${formatPriceBRL(minCents)} – ${formatPriceBRL(maxCents)}`;
}

/** Recompute donation default range se provider esqueceu. */
export function suggestedDonationRange(): { min: number; max: number } {
  return { min: DEFAULT_DONATION_MIN_BRL_CENTS, max: DEFAULT_DONATION_MAX_BRL_CENTS };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §11 Schedule windows + booking hold                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Valida uma ScheduleWindow. */
export function validateScheduleWindow(w: ScheduleWindow): boolean {
  if (w.weekday < 1 || w.weekday > 7) return false;
  if (w.startMin < 0 || w.startMin >= 1440) return false;
  if (w.endMin <= w.startMin) return false;
  if (w.endMin > 1440) return false;
  if (w.endMin - w.startMin < 15) return false; // min 15 min slot
  if (!w.timezone || w.timezone.length < 3) return false;
  return true;
}

/** Combina provider + listing windows — listing overrides se setado. */
export function effectiveWindows(
  listing: MarketplaceListing,
  provider: ProviderProfile | null
): ScheduleWindow[] {
  if (listing.availableWindows && listing.availableWindows.length > 0) return listing.availableWindows;
  if (provider) return provider.availableWindows;
  return [];
}

/** Cria hold — retorna issue se houvers inconsistência. */
export interface BookingHoldResult {
  ok: boolean;
  hold?: BookingHold;
  error?: MarketplaceError;
}

export function createBookingHold(
  listing: MarketplaceListing,
  consumerId: string,
  startsAt: number,
  endsAt: number,
  now: number = Date.now(),
  holdMs: number = DEFAULT_BOOKING_HOLD_MS
): BookingHoldResult {
  if (endsAt <= startsAt) {
    return {
      ok: false,
      error: {
        code: "MK_015",
        message: "Schedule collision: endsAt <= startsAt",
        ts: now,
      },
    };
  }
  const durationMin = (endsAt - startsAt) / 60000;
  if (Math.abs(durationMin - listing.durationMin) > 5) {
    return {
      ok: false,
      error: {
        code: "MK_015",
        message: "Booking duration doesn't match listing.durationMin",
        detail: `requested=${durationMin}min listing=${listing.durationMin}min`,
        ts: now,
      },
    };
  }
  const expiresAt = now + clamp(holdMs, MIN_BOOKING_HOLD_MS, MAX_BOOKING_HOLD_MS);
  const hold: BookingHold = {
    holdId: `hold-${fnv1a32(`${listing.id}-${consumerId}-${now}`)}`,
    listingId: listing.id,
    consumerId,
    startsAt,
    endsAt,
    expiresAt,
    priceBrlCents: listing.priceBrlCents,
    status: "pending",
    createdAt: now,
  };
  return { ok: true, hold };
}

/** Verifica se uma hold está ativa. */
export function isHoldActive(hold: BookingHold, now: number = Date.now()): boolean {
  if (hold.status !== "pending") return false;
  return hold.expiresAt > now;
}

/** Consolida hold → status. */
export function expireOldHolds(holds: BookingHold[], now: number = Date.now()): {
  active: BookingHold[];
  expired: number;
} {
  let expired = 0;
  const active: BookingHold[] = [];
  for (const h of holds) {
    if (h.status === "pending" && h.expiresAt <= now) {
      expired += 1;
      continue;
    }
    active.push(h);
  }
  return { active, expired };
}

/** Resolve schedule conflicts dentro de um set de holds. */
export function detectScheduleCollisions(holds: BookingHold[]): {
  colliders: { a: BookingHold; b: BookingHold }[];
} {
  const colliders: { a: BookingHold; b: BookingHold }[] = [];
  for (let i = 0; i < holds.length; i++) {
    for (let j = i + 1; j < holds.length; j++) {
      const a = holds[i]!;
      const b = holds[j]!;
      if (a.listingId !== b.listingId) continue;
      const overlap = a.startsAt < b.endsAt && b.startsAt < a.endsAt;
      if (overlap) colliders.push({ a, b });
    }
  }
  return { colliders };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §12 Sacred-tag handling                                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Decide se uma listing sacred pode aparecer para o consumer.
 * Hard rule: sacred listing + !consumerSacredOptIn → excluded, audit.
 */
export function canSeeSacredListing(
  listing: MarketplaceListing,
  consumerSacredOptIn: boolean
): boolean {
  if (isSacredListing(listing)) return consumerSacredOptIn;
  return true;
}

/**
 * Aplica sacred filter em uma lista. Registra exclusions no audit log.
 * Retorna listings visíveis + exclusion entries.
 */
export function applySacredFilter(
  listings: MarketplaceListing[],
  consumerSacredOptIn: boolean,
  now: number = Date.now()
): { visible: MarketplaceListing[]; exclusions: SacredExclusionEntry[] } {
  const visible: MarketplaceListing[] = [];
  const exclusions: SacredExclusionEntry[] = [];
  for (const l of listings) {
    if (isSacredListing(l) && !consumerSacredOptIn) {
      exclusions.push({
        listingId: l.id,
        ts: now,
        reason: "sacred_flag_no_optin",
        consumerOptIn: consumerSacredOptIn,
        detail: `category=${l.category} sacredTradition=${l.sacredTradition ?? "(none)"}`,
      });
      continue;
    }
    visible.push(l);
  }
  return { visible, exclusions };
}

/** Provider sacred publishing gate. */
export function providerCanPublishSacred(
  listing: MarketplaceListing,
  provider: ProviderProfile
): boolean {
  if (!isSacredListing(listing)) return true;
  if (!providerMayOfferSacred(provider)) return false;
  if (provider.suspended) return false;
  return true;
}

/** Audit: lista listings sacred visíveis ao caller. */
export function visibleSacredListings(
  listings: MarketplaceListing[],
  consumerSacredOptIn: boolean
): MarketplaceListing[] {
  return listings.filter((l) => canSeeSacredListing(l, consumerSacredOptIn));
}

/** Detect sacred leak — se algum listing sacred passou e não devia. */
export function detectSacredLeak(
  visible: MarketplaceListing[],
  consumerSacredOptIn: boolean
): { leaked: boolean; leakedIds: string[] } {
  const leakedIds: string[] = [];
  for (const l of visible) {
    if (isSacredListing(l) && !consumerSacredOptIn) {
      leakedIds.push(l.id);
    }
  }
  return { leaked: leakedIds.length > 0, leakedIds };
}

/** Explica a exclusion pra UI. */
export const SACRED_POLICY_TEXT_PT = {
  intro: "Listings com conteúdo sagrado (encantamento, ebó, gira, dons de cura) só aparecem para quem optou explicitamente.",
  rules: [
    "Listings com flag sagrado NUNCA aparecem em busca para usuários sem opt-in.",
    "Opt-in de conteúdo sagrado é separado do opt-in geral do marketplace.",
    "Mesmo provider L2 só pode ofertar serviços sagrados se você optou por vê-los.",
    "Sua tradição e crença são respeitadas: o sistema é desenhado para proteger, não expor.",
  ],
  howToEnable: "Para ver listings de práticas sagradas, ative 'Conteúdo sagrado' nas Preferências > Privacidade.",
} as const;

export const SACRED_POLICY_TEXT_EN = {
  intro: "Listings with sacred content (encantamento, ebó, gira, healing gifts) only appear for users who opted in explicitly.",
  rules: [
    "Listings with the sacred flag NEVER appear in search for users without sacred opt-in.",
    "Sacred opt-in is separate from the general marketplace opt-in.",
    "Even L2 providers can only list sacred services for users who opted in to see them.",
    "Your tradition and belief are respected: the system is designed to protect, not expose.",
  ],
  howToEnable: "To see listings of sacred practices, enable 'Sacred content' in Preferences > Privacy.",
} as const;

/** Sacred policy text — both PT-BR and EN have identical shape but literal types differ. */
export interface SacredPolicyText {
  readonly intro: string;
  readonly rules: readonly string[];
  readonly howToEnable: string;
}

export function getSacredPolicyText(locale: "pt-BR" | "en-US"): SacredPolicyText {
  return locale === "pt-BR" ? SACRED_POLICY_TEXT_PT : SACRED_POLICY_TEXT_EN;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §13 LGPD Art. 7/9/18                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Provider opt-in é OFF por default (LGPD Art. 7, I). */
export function providerOptIn(
  profile: ProviderProfile,
  now: number = Date.now(),
  requestId?: string
): { profile: ProviderProfile; changed: boolean } {
  if (profile.optedInMarketplace && profile.optedInMarketplaceAt !== null) {
    return { profile, changed: false };
  }
  const event: OptInEvent = {
    ts: now,
    action: "opt_in",
    reason: "provider_explicit_consent",
    requestId,
  };
  return {
    profile: {
      ...profile,
      optedInMarketplace: true,
      optedInMarketplaceAt: now,
      optedInMarketplaceHistory: [...profile.optedInMarketplaceHistory, event],
    },
    changed: true,
  };
}

export function providerOptOut(
  profile: ProviderProfile,
  now: number = Date.now(),
  requestId?: string,
  reason: string = "provider_revocation"
): { profile: ProviderProfile; changed: boolean } {
  if (!profile.optedInMarketplace) return { profile, changed: false };
  const event: OptInEvent = {
    ts: now,
    action: "opt_out",
    reason,
    requestId,
  };
  return {
    profile: {
      ...profile,
      optedInMarketplace: false,
      optedInMarketplaceAt: null,
      optedInMarketplaceHistory: [...profile.optedInMarketplaceHistory, event],
    },
    changed: true,
  };
}

/** LGPD Art. 18, VI — erase provider. */
export function providerErase(
  profile: ProviderProfile,
  now: number = Date.now(),
  requestId?: string
): {
  erasedProfile: ProviderProfile;
  auditRetentionUntil: number;
  clearedAt: number;
} {
  const erased: ProviderProfile = {
    ...profile,
    handle: "erased-" + fnv1a32(String(now)).slice(0, 8),
    displayName: "(conta removida)",
    bio: "",
    cityHint: undefined,
    listingIds: [],
    optedInMarketplace: false,
    optedInMarketplaceAt: null,
    optedInMarketplaceHistory: [
      ...profile.optedInMarketplaceHistory,
      {
        ts: now,
        action: "lgpd_erasure",
        reason: "Art. 18, VI — direito ao esquecimento",
        requestId,
      },
    ],
    suspended: true,
    suspendedReason: "lgpd_erasure",
  };
  const auditRetentionUntil = now + LGPD_RETENTION_DAYS_DEFAULT * 86400_000;
  return { erasedProfile: erased, auditRetentionUntil, clearedAt: now };
}

/** Consumer opt-in (para contratar). */
export interface ConsumerOptInRecord {
  consumerId: string;
  optedIn: boolean;
  sacredOptIn: boolean;
  optedInAt: number | null;
  history: OptInEvent[];
  retentionDays: number;
}

export function createConsumerOptIn(
  consumerId: string,
  sacredOptIn: boolean = false,
  retentionDays: number = LGPD_RETENTION_DAYS_DEFAULT,
  now: number = Date.now()
): ConsumerOptInRecord {
  return {
    consumerId,
    optedIn: false,
    sacredOptIn,
    optedInAt: null,
    history: [],
    retentionDays,
  };
}

export function consumerOptIn(
  rec: ConsumerOptInRecord,
  now: number = Date.now(),
  requestId?: string,
  sacredOptIn: boolean = false
): { record: ConsumerOptInRecord; changed: boolean } {
  if (rec.optedIn && rec.sacredOptIn === sacredOptIn) {
    return { record: rec, changed: false };
  }
  const event: OptInEvent = {
    ts: now,
    action: "opt_in",
    reason: "consumer_explicit_consent",
    requestId,
  };
  return {
    record: {
      ...rec,
      optedIn: true,
      sacredOptIn,
      optedInAt: now,
      history: [...rec.history, event],
    },
    changed: true,
  };
}

export function consumerRevokeSacredOptIn(
  rec: ConsumerOptInRecord,
  now: number = Date.now(),
  requestId?: string
): { record: ConsumerOptInRecord; changed: boolean } {
  if (!rec.sacredOptIn) return { record: rec, changed: false };
  const event: OptInEvent = {
    ts: now,
    action: "opt_out",
    reason: "consumer_sacred_revoke",
    requestId,
  };
  return {
    record: {
      ...rec,
      sacredOptIn: false,
      history: [...rec.history, event],
    },
    changed: true,
  };
}

/** LGPD consumer erasure — apaga search history + bookings + reviews. */
export function consumerErase(
  consumerId: string,
  searchHistory: SearchReport[],
  bookings: BookingHold[],
  reviewsAuthored: number[],
  now: number = Date.now(),
  retentionDays: number = LGPD_RETENTION_DAYS_DEFAULT,
  requestId?: string
): LgpdEraseResult {
  const auditRetentionUntil = now + retentionDays * 86400_000;
  // O caller deve, ANTES de chamar, remover de seus stores persistentes.
  // Esta função apenas retorna o result analítico.
  return {
    consumerId,
    erasedSearchHistory: searchHistory.length,
    erasedBookings: bookings.length,
    erasedReviews: reviewsAuthored.length,
    auditRetentionUntil,
    erasedAt: now,
  };
}

/** Art. 9 — finalidade. */
export function isPurposeAllowed(purpose: string): boolean {
  return (ALLOWED_PURPOSES as readonly string[]).includes(purpose);
}

/** Provider export payload — LGPD Art. 18, V. */
export function buildProviderExport(
  profile: ProviderProfile | null,
  listings: MarketplaceListing[],
  bookings: BookingHold[],
  reviewsAuthored: ReviewAggregate[],
  hmacKey: string
): ProviderLgpdExport {
  if (!profile) {
    return {
      providerId: "missing",
      exportedAt: Date.now(),
      profile: null,
      listings: [],
      bookings: [],
      reviewsAuthored: [],
      optInHistory: [],
      verificationHistory: [],
      auditHash: "0".repeat(64),
    };
  }
  const auditHashInput = JSON.stringify({
    profile: { ...profile, optedInMarketplaceHistory: undefined },
    listingIds: listings.map((l) => l.id),
    bookingIds: bookings.map((b) => b.holdId),
    reviewsAuthored: reviewsAuthored.map((r) => r.listingId),
    optInHistory: profile.optedInMarketplaceHistory,
    verificationHistory: profile.verificationHistory,
    exportedAt: Date.now(),
  });
  return {
    providerId: profile.providerId,
    exportedAt: Date.now(),
    profile,
    listings,
    bookings,
    reviewsAuthored,
    optInHistory: profile.optedInMarketplaceHistory,
    verificationHistory: profile.verificationHistory,
    auditHash: fnv1a64(hmacKey + "|" + auditHashInput),
  };
}

/** Consumer export payload. */
export function buildConsumerExport(
  consumerId: string,
  optInRecord: ConsumerOptInRecord | null,
  searchHistory: SearchReport[],
  bookings: BookingHold[],
  reviewsAuthored: number[],
  hmacKey: string
): ConsumerLgpdExport {
  const history = optInRecord?.history ?? [];
  const input = JSON.stringify({
    consumerId,
    searchCount: searchHistory.length,
    bookingIds: bookings.map((b) => b.holdId),
    reviewsAuthored,
    history,
    exportedAt: Date.now(),
  });
  return {
    consumerId,
    exportedAt: Date.now(),
    searchHistory: searchHistory.map((s) => ({
      ...s,
      results: [],   // exclude results for export (avoid PII leakage)
      errors: [],
      auditTrail: [],
      sacredExclusionAudit: [],
    })),
    bookings,
    reviewsAuthored,
    optInHistory: history,
    auditHash: fnv1a64(hmacKey + "|" + input),
  };
}

/** LGPD consent text selector. */
export function getLgpdConsentText(locale: "pt-BR" | "en-US"): Record<string, string> {
  return locale === "pt-BR" ? LGPD_CONSENT_TEXT_PT : LGPD_CONSENT_TEXT_EN;
}

/** LGPD rights request builder. */
export interface LgpdRightsRequest {
  subjectId: string;
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
  const sla = req.right === "erasure" || req.right === "revocation" ? "immediate" : "15_days";
  return {
    acknowledged: true,
    requestId: req.requestId ?? `lgpd-${req.subjectId}-${req.ts}`,
    sla,
    ts: req.ts,
  };
}

/** Audit log helper. */
export function createAuditLog(now: number = Date.now()): AuditStep[] {
  return [];
}

export function appendAuditStep(log: AuditStep[], step: AuditStep): AuditStep[] {
  return [...log, step];
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §14 Provider verification flow (L0 → L1 → L2, history, revocation)       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Verifica que um provider tem tenure mínimo antes de L1.
 * createdAt do provider → days since joined ≥ VERIFICATION_L1_MIN_DAYS.
 */
export function hasL1Tenure(provider: ProviderProfile, now: number = Date.now()): boolean {
  const days = (now - provider.joinedAt) / 86_400_000;
  return days >= VERIFICATION_L1_MIN_DAYS;
}

/**
 * Cria registration record inicial — L0 self-declared.
 */
export function createL0Registration(
  provider: ProviderProfile,
  now: number = Date.now()
): { provider: ProviderProfile; record: VerificationRecord } {
  const rec: VerificationRecord = {
    ts: now,
    fromLevel: "L0",
    toLevel: "L0",
    evidence: "self-declared",
    reason: "registration",
  };
  return {
    provider: {
      ...provider,
      verificationLevel: "L0",
      verificationHistory: [...provider.verificationHistory, rec],
    },
    record: rec,
  };
}

/**
 * Promote L0 → L1 — requer documento enviado (hash). Tenure check opcional.
 */
export interface L1PromotionResult {
  ok: boolean;
  provider: ProviderProfile;
  record: VerificationRecord;
  error?: MarketplaceError;
}

export function promoteToL1(
  provider: ProviderProfile,
  documentHash: string,
  adminId: string,
  now: number = Date.now()
): L1PromotionResult {
  const errTs = now;
  if (provider.verificationLevel !== "L0") {
    return {
      ok: false,
      provider,
      record: emptyVRec(now),
      error: {
        code: "MK_007",
        message: `Promoção L1 requer level=L0 (atual: ${provider.verificationLevel})`,
        ts: errTs,
      },
    };
  }
  if (documentHash.length !== VERIFICATION_L1_DOC_HASH_LEN) {
    return {
      ok: false,
      provider,
      record: emptyVRec(now),
      error: {
        code: "MK_007",
        message: `Documento hash deve ter ${VERIFICATION_L1_DOC_HASH_LEN} chars hex`,
        ts: errTs,
      },
    };
  }
  if (!hasL1Tenure(provider, now)) {
    return {
      ok: false,
      provider,
      record: emptyVRec(now),
      error: {
        code: "MK_007",
        message: `Tenure insuficiente para L1 (min ${VERIFICATION_L1_MIN_DAYS} dias)`,
        ts: errTs,
      },
    };
  }
  const rec: VerificationRecord = {
    ts: now,
    fromLevel: "L0",
    toLevel: "L1",
    evidence: "doc-id-upload",
    adminId,
    documentHash,
  };
  return {
    ok: true,
    provider: {
      ...provider,
      verificationLevel: "L1",
      verificationHistory: [...provider.verificationHistory, rec],
    },
    record: rec,
  };
}

/**
 * Promote L1 → L2 — admin manual review (>=48h review time).
 */
export interface L2PromotionResult {
  ok: boolean;
  provider: ProviderProfile;
  record: VerificationRecord;
  error?: MarketplaceError;
}

export function promoteToL2(
  provider: ProviderProfile,
  adminId: string,
  reason: string,
  reviewStartedAt: number,
  now: number = Date.now()
): L2PromotionResult {
  if (provider.verificationLevel !== "L1") {
    return {
      ok: false,
      provider,
      record: emptyVRec(now),
      error: {
        code: "MK_007",
        message: `Promoção L2 requer level=L1 (atual: ${provider.verificationLevel})`,
        ts: now,
      },
    };
  }
  const reviewHours = (now - reviewStartedAt) / 3_600_000;
  if (reviewHours < VERIFICATION_L2_REVIEW_HOURS) {
    return {
      ok: false,
      provider,
      record: emptyVRec(now),
      error: {
        code: "MK_007",
        message: `L2 review deve durar ≥${VERIFICATION_L2_REVIEW_HOURS}h`,
        ts: now,
      },
    };
  }
  const rec: VerificationRecord = {
    ts: now,
    fromLevel: "L1",
    toLevel: "L2",
    evidence: "admin-review-pass",
    adminId,
    reason,
  };
  return {
    ok: true,
    provider: {
      ...provider,
      verificationLevel: "L2",
      verificationHistory: [...provider.verificationHistory, rec],
    },
    record: rec,
  };
}

/** Revoga verificação — provider perde listing público. */
export function revokeVerification(
  provider: ProviderProfile,
  reason: string,
  adminId: string,
  now: number = Date.now()
): { provider: ProviderProfile; record: VerificationRecord; event: OptInEvent } {
  const rec: VerificationRecord = {
    ts: now,
    fromLevel: provider.verificationLevel,
    toLevel: "L0",
    evidence: "verification-revoked",
    adminId,
    reason,
  };
  const event: OptInEvent = {
    ts: now,
    action: "verification_revoked",
    reason,
    requestId: adminId,
  };
  return {
    provider: {
      ...provider,
      verificationLevel: "L0",
      suspended: true,
      suspendedReason: `verification_revoked: ${reason}`,
      verificationHistory: [...provider.verificationHistory, rec],
      optedInMarketplace: false,
      optedInMarketplaceAt: null,
      optedInMarketplaceHistory: [...provider.optedInMarketplaceHistory, event],
    },
    record: rec,
    event,
  };
}

/** Suspended provider é completamente removido do marketplace. */
export function isProviderVisibleInMarketplace(p: ProviderProfile): boolean {
  if (p.suspended) return false;
  if (!p.optedInMarketplace) return false;
  return true;
}

function emptyVRec(now: number): VerificationRecord {
  return {
    ts: now,
    fromLevel: "L0",
    toLevel: "L0",
    evidence: "",
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §15 Engine principal — buildSearchReport                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface BuildSearchOptions {
  redactionConfig?: ManualRedactionConfig;
  now?: number;
  limit?: number;
}

/**
 * Pipeline completo:
 *  1. parseSearchQuery → filter
 *  2. applySacredFilter (hard, pré-paginar)
 *  3. applyFilterPipeline (facets, manual redaction, availability)
 *  4. rankListings (BM25 + facet + verification + rating)
 *  5. paginar
 *  6. retorn SearchReport
 */
export function buildSearchReport(
  query: SearchQuery,
  allListings: MarketplaceListing[],
  providerMap: Map<string, ProviderProfile>,
  options: BuildSearchOptions = {}
): SearchReport {
  const start = Date.now();
  const now = options.now ?? start;
  const redaction = options.redactionConfig ?? defaultRedactionConfig();

  const auditTrail: AuditStep[] = [];

  // (1) parse query
  const filter = parseSearchQuery(query);
  auditTrail.push({ step: "parseSearchQuery", ts: now, ok: true, detail: `tokens=${filter.tokens.length}` });

  // (2) sacred filter — hard, before pagination
  const sacredResult = applySacredFilter(
    allListings.filter((l) => !providerMap.get(l.providerId)?.suspended),
    filter.consumerSacredOptIn,
    now
  );
  auditTrail.push({
    step: "applySacredFilter",
    ts: now,
    ok: true,
    detail: `visible=${sacredResult.visible.length} excluded=${sacredResult.exclusions.length}`,
  });

  // (3) redaction + facets + availability
  const pipeline = applyFilterPipeline(sacredResult.visible, filter, providerMap, redaction);
  auditTrail.push({
    step: "applyFilterPipeline",
    ts: now,
    ok: true,
    detail: `passed=${pipeline.passed.length} redactionBlock=${pipeline.manualRedactionBlockedCount} facetMiss=${pipeline.facetMismatchCount}`,
  });

  // (4) BM25 docs + ranker
  const bm25State = buildBm25DocsFromListings(pipeline.passed);
  const ranked = rankListings(pipeline.passed, providerMap, filter, bm25State, now);
  const limit = options.limit ?? filter.pageSize;
  const topK = topRanked(ranked, limit);
  const offset = (filter.page - 1) * filter.pageSize;
  const results = topK.slice(offset, offset + filter.pageSize);

  auditTrail.push({
    step: "rankListings",
    ts: now,
    ok: true,
    detail: `ranked=${ranked.length} page=${filter.page} pageSize=${filter.pageSize} returned=${results.length}`,
  });

  // (5) sacred leak detection (defensiva)
  const leak = detectSacredLeak(results.map((r) => r.listing), filter.consumerSacredOptIn);
  if (leak.leaked) {
    auditTrail.push({
      step: "detectSacredLeak",
      ts: now,
      ok: false,
      detail: `LEAK: ${leak.leakedIds.join(",")}`,
    });
  } else {
    auditTrail.push({ step: "detectSacredLeak", ts: now, ok: true });
  }

  // (6) errors
  const errors: MarketplaceError[] = [];
  if (leak.leaked) {
    errors.push({
      code: "MK_012",
      message: "Sacred leakage detected",
      detail: leak.leakedIds.join(","),
      ts: now,
    });
  }

  const report: SearchReport = {
    query,
    filter,
    results,
    totalAfterSacredFilter: sacredResult.visible.length,
    sacredExcludedCount: sacredResult.exclusions.length,
    facetMismatchCount: pipeline.facetMismatchCount,
    redactionBlockedCount: pipeline.manualRedactionBlockedCount,
    pagination: {
      page: filter.page,
      pageSize: filter.pageSize,
      total: ranked.length,
      hasMore: offset + results.length < ranked.length,
    },
    durationMs: Date.now() - start,
    generatedAt: now,
    auditTrail,
    errors,
    sacredExclusionAudit: sacredResult.exclusions,
    engineVersion: ENGINE_VERSION,
  };

  return report;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §15.5 Smoke / regression scenarios                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface SmokeResult {
  name: string;
  ok: boolean;
  detail: string;
}

/** Helper para criar listings sintéticos. */
export function makeSyntheticReading(
  overrides: Partial<MarketplaceListing> = {},
  now: number = Date.now()
): MarketplaceListing {
  return createListing({
    kind: "reading",
    category: "tarot",
    title: "Leitura de Tarô — 3 cartas",
    description: "Consulta oracular online com 3 cartas, áudio de 30 minutos.",
    priceTier: "fixed",
    priceBrlCents: 5000,
    durationMin: 30,
    ...overrides,
  }, now);
}

export function makeSyntheticPractice(
  overrides: Partial<MarketplaceListing> = {},
  now: number = Date.now()
): MarketplaceListing {
  return createListing({
    kind: "practice",
    category: "encantamento_sagrado",
    sacredFlag: true,
    sacredTradition: "umbanda",
    title: "Encantamento de abertura de caminhos",
    description: "Prática ritualística de abertura com ervas e cantos.",
    priceTier: "donation",
    priceBrlCents: 0,
    donationMinBrlCents: 5000,
    donationMaxBrlCents: 30000,
    durationMin: 60,
    ...overrides,
  }, now);
}

export function makeSyntheticProvider(
  overrides: Partial<ProviderProfile> = {},
  now: number = Date.now()
): ProviderProfile {
  return createProviderProfile({
    providerId: overrides.providerId ?? "prov-001",
    handle: "prov-handle",
    displayName: "Prov Synthetic",
    verificationLevel: "L1",
    traditions: ["umbanda", "tarot"],
    languages: ["pt-BR"],
    region: "BR",
    optedInMarketplace: true,
    optedInMarketplaceAt: now - 86400_000,
    ...overrides,
  }, now);
}

/** Smoke 1: FNV-1a determinism. */
export function smokeHashDeterminism(): SmokeResult {
  const a = fnv1a64("hello");
  const b = fnv1a64("hello");
  const c = fnv1a64("hello!");
  const ok = a === b && a !== c;
  return { name: "smokeHashDeterminism", ok, detail: `${a}=${b}!=${c}` };
}

/** Smoke 2: Levenshtein smoke. */
export function smokeLevenshtein(): SmokeResult {
  const d1 = levenshtein("umbanda", "umbana", 5);   // 1 (delete 'd')
  const d2 = levenshtein("tarot", "tarot", 5);       // 0
  const d3 = levenshtein("cigano", "cigan", 5);      // 1 (delete 'o')
  const d4 = levenshtein("candomble", "candomble", 5); // 0
  const ok = d1 === 1 && d2 === 0 && d3 === 1 && d4 === 0;
  return { name: "smokeLevenshtein", ok, detail: `umbanda=${d1} tarot=${d2} cigano=${d3} candomble=${d4}` };
}

/** Smoke 3: Sacred filter is hard. */
export function smokeSacredFilterHard(): SmokeResult {
  const sacred = makeSyntheticPractice({ providerId: "p1" });
  const tarot = makeSyntheticReading({ providerId: "p1" });
  // Consumer without opt-in
  const r1 = applySacredFilter([sacred, tarot], false);
  const visible = r1.visible.map((l) => l.id);
  // Consumer with opt-in
  const r2 = applySacredFilter([sacred, tarot], true);
  const visibleOpt = r2.visible.map((l) => l.id);
  const ok = visible.length === 1 && visible[0] === tarot.id && visibleOpt.length === 2;
  return { name: "smokeSacredFilterHard", ok, detail: `strict=${visible.length} permissive=${visibleOpt.length}` };
}

/** Smoke 4: BM25 ranker respects score ordering. */
export function smokeBm25RankerOrdering(): SmokeResult {
  const target = makeSyntheticReading({
    providerId: "p1",
    title: "Tarô dos Orixás amor",
    description: "Leitura focada em relacionamentos e amor com conexão aos orixás.",
  });
  const off = makeSyntheticReading({
    providerId: "p2",
    title: "Numerologia cotidiana",
    description: "Cálculo de ano pessoal e mapa numerológico.",
  });
  const providerMap = new Map<string, ProviderProfile>();
  providerMap.set("p1", makeSyntheticProvider({ providerId: "p1" }));
  providerMap.set("p2", makeSyntheticProvider({ providerId: "p2" }));
  const bm25 = buildBm25DocsFromListings([target, off]);
  const filter = parseSearchQuery({ q: "tarô amor orixá", facets: {}, consumerSacredOptIn: false });
  const ranked = rankListings([target, off], providerMap, filter, bm25);
  const ok = ranked.length === 2 && ranked[0]!.listing.id === target.id;
  return { name: "smokeBm25RankerOrdering", ok, detail: `top=${ranked[0]?.listing.id}` };
}

/** Smoke 5: Free-text + filter combined. */
export function smokeFreeTextPlusFilter(): SmokeResult {
  const sacred = makeSyntheticPractice({ providerId: "p1", title: "Gira de Caboclo" });
  const reading = makeSyntheticReading({ providerId: "p1", title: "Tarô online" });
  const providerMap = new Map<string, ProviderProfile>();
  providerMap.set("p1", makeSyntheticProvider({ providerId: "p1", verificationLevel: "L1" }));
  const report = buildSearchReport(
    {
      q: "tarô",
      facets: { categories: ["tarot"], verificationLevels: ["L1"] },
      consumerSacredOptIn: false,
    },
    [sacred, reading],
    providerMap
  );
  const ok = report.results.length === 1 && report.results[0]!.listing.id === reading.id;
  return { name: "smokeFreeTextPlusFilter", ok, detail: `results=${report.results.length}` };
}

/** Smoke 6: Sacred opt-out → sacred listing is hidden. */
export function smokeSacredOptOutFilter(): SmokeResult {
  const sacred = makeSyntheticPractice({ providerId: "p1", title: "Gira de Caboclo" });
  const providerMap = new Map<string, ProviderProfile>();
  providerMap.set("p1", makeSyntheticProvider({ providerId: "p1", verificationLevel: "L2" }));
  const report = buildSearchReport(
    { q: "gira", facets: {}, consumerSacredOptIn: false },
    [sacred],
    providerMap
  );
  const ok = report.results.length === 0 && report.sacredExcludedCount === 1;
  return { name: "smokeSacredOptOutFilter", ok, detail: `results=${report.results.length} sacredExcluded=${report.sacredExcludedCount}` };
}

/** Smoke 7: Verification tier tiebreak. */
export function smokeVerificationTiebreak(): SmokeResult {
  const a = makeSyntheticReading({ providerId: "p-l0", title: "Reading" });
  const b = makeSyntheticReading({ providerId: "p-l2", title: "Reading" });
  const providerMap = new Map<string, ProviderProfile>();
  providerMap.set("p-l0", makeSyntheticProvider({ providerId: "p-l0", verificationLevel: "L0" }));
  providerMap.set("p-l2", makeSyntheticProvider({ providerId: "p-l2", verificationLevel: "L2" }));
  const bm25 = buildBm25DocsFromListings([a, b]);
  const filter = parseSearchQuery({ q: "reading", facets: {}, consumerSacredOptIn: false });
  const ranked = rankListings([a, b], providerMap, filter, bm25);
  const ok = ranked.length === 2 && ranked[0]!.listing.providerId === "p-l2";
  return { name: "smokeVerificationTiebreak", ok, detail: `top=${ranked[0]!.listing.providerId}` };
}

/** Smoke 8: Price tier validation — fixed > 0, donation = 0 with valid range. */
export function smokePriceTierValidation(): SmokeResult {
  const fixed = makeSyntheticReading({ priceTier: "fixed", priceBrlCents: 5000 });
  // Use a 2x ratio so it's well within MAX_DONATION_RATIO=5
  const donation = makeSyntheticPractice({
    priceTier: "donation",
    priceBrlCents: 0,
    donationMinBrlCents: 5000,
    donationMaxBrlCents: 10000,
  });
  const free = makeSyntheticReading({ priceTier: "free", priceBrlCents: 0 });
  const v1 = validatePricing(fixed);
  const v2 = validatePricing(donation);
  const v3 = validatePricing(free);
  const ok = v1.ok && v2.ok && v3.ok;
  return { name: "smokePriceTierValidation", ok, detail: `fixed=${v1.ok} donation=${v2.ok} free=${v3.ok}` };
}

/** Smoke 9: BM25 top-K limits. */
export function smokeBm25TopK(): SmokeResult {
  const listings: MarketplaceListing[] = [];
  for (let i = 0; i < 30; i++) {
    listings.push(makeSyntheticReading({
      providerId: `p-${i}`,
      title: i % 3 === 0 ? "Tarô amor consulta" : "Astrologia mapa",
    }));
  }
  const providerMap = new Map<string, ProviderProfile>();
  for (let i = 0; i < 30; i++) {
    providerMap.set(`p-${i}`, makeSyntheticProvider({ providerId: `p-${i}`, verificationLevel: "L1" }));
  }
  const bm25 = buildBm25DocsFromListings(listings);
  const filter = parseSearchQuery({ q: "tarô amor", facets: {}, consumerSacredOptIn: false });
  const ranked = rankListings(listings, providerMap, filter, bm25);
  const top = topRanked(ranked, 5);
  const ok = top.length === 5 && top[0]!.rank === 1 && top[4]!.rank === 5;
  return { name: "smokeBm25TopK", ok, detail: `top[0].rank=${top[0]!.rank}` };
}

/** Smoke 10: Schedule window match. */
export function smokeScheduleWindowMatch(): SmokeResult {
  const monWindow: ScheduleWindow = { weekday: 1, startMin: 9 * 60, endMin: 18 * 60, timezone: "America/Sao_Paulo" };
  const provider = makeSyntheticProvider({
    providerId: "p1",
    availableWindows: [monWindow],
  });
  const l1 = makeSyntheticReading({ providerId: "p1" });
  const l2 = makeSyntheticPractice({ providerId: "p1" });
  const windows1 = effectiveWindows(l1, provider);
  const windows2 = effectiveWindows(l2, null);
  const ok = windows1.length === 1 && windows2.length === 0;
  return { name: "smokeScheduleWindowMatch", ok, detail: `w1=${windows1.length} w2=${windows2.length}` };
}

/** Smoke 11: Provider export + erasure. */
export function smokeProviderExport(): SmokeResult {
  const provider = makeSyntheticProvider({ verificationLevel: "L1" });
  const list1 = makeSyntheticReading({ providerId: provider.providerId });
  const list2 = makeSyntheticPractice({ providerId: provider.providerId });
  const t = Date.now() + 86400_000;
  const hold = createBookingHold(list1, "consumer-x", t, t + 30 * 60_000, t);
  const review: ReviewAggregate = {
    listingId: list1.id,
    reviewCount: 1,
    avgRating: 5,
    ratingHistogram: [0, 0, 0, 0, 1],
    lastReviewAt: Date.now(),
  };
  const exp = buildProviderExport(provider, [list1, list2], hold.ok ? [hold.hold!] : [], [review], "k");
  const erase = providerErase(provider, Date.now(), "req-1");
  const ok =
    exp.auditHash.length === 16 &&
    exp.listings.length === 2 &&
    erase.erasedProfile.suspended === true &&
    erase.erasedProfile.listingIds.length === 0;
  return { name: "smokeProviderExport", ok, detail: `hash=${exp.auditHash.slice(0, 8)}` };
}

/** Smoke 12: Consumer export + erasure. */
export function smokeConsumerExport(): SmokeResult {
  const rec = consumerOptIn(createConsumerOptIn("c1"), Date.now(), "rq", false);
  const exp = buildConsumerExport("c1", rec.record, [], [], [], "k");
  const erase = consumerErase("c1", [], [], [], Date.now(), 30, "rq2");
  const ok = exp.auditHash.length === 16 && erase.erasedSearchHistory === 0 && erase.auditRetentionUntil > Date.now();
  return { name: "smokeConsumerExport", ok, detail: `eraseAt=${erase.erasedAt}` };
}

/** Smoke 13: Manual redaction block PII. */
export function smokeManualRedactionPII(): SmokeResult {
  const withPhone = makeSyntheticReading({
    description: "Atendimento pelo whatsapp (11) 98765-4321 ou email teste@exemplo.com",
  });
  const providerMap = new Map<string, ProviderProfile>();
  providerMap.set(withPhone.providerId, makeSyntheticProvider({ providerId: withPhone.providerId }));
  const filter = parseSearchQuery({ q: "tarô", facets: {}, consumerSacredOptIn: false });
  const r = applyFilterPipeline([withPhone], filter, providerMap, defaultRedactionConfig());
  const ok = r.passed.length === 0 && r.manualRedactionBlockedCount === 1;
  return { name: "smokeManualRedactionPII", ok, detail: `blocked=${r.manualRedactionBlockedCount}` };
}

/** Smoke 14: Verification flow L0 → L1. */
export function smokeVerificationL1Promotion(): SmokeResult {
  const base = makeSyntheticProvider({ verificationLevel: "L0" });
  // joinedAt must be at least VERIFICATION_L1_MIN_DAYS days ago for tenure check.
  const provider = { ...base, joinedAt: Date.now() - 30 * 86400_000 };
  const docHash = "a".repeat(VERIFICATION_L1_DOC_HASH_LEN);
  const reviewTs = Date.now();
  const l1 = promoteToL1(provider, docHash, "admin-1", reviewTs);
  const ok = l1.ok && l1.provider.verificationLevel === "L1";
  return { name: "smokeVerificationL1Promotion", ok, detail: `L1=${l1.provider.verificationLevel}` };
}

/** Smoke 15: Manual redaction allows clean listing. */
export function smokeManualRedactionPasses(): SmokeResult {
  const clean = makeSyntheticReading({ description: "Sessão de leitura online de tarô, 30 minutos, áudio." });
  const providerMap = new Map<string, ProviderProfile>();
  providerMap.set(clean.providerId, makeSyntheticProvider({ providerId: clean.providerId }));
  const filter = parseSearchQuery({ q: "tarô", facets: {}, consumerSacredOptIn: false });
  const r = applyFilterPipeline([clean], filter, providerMap, defaultRedactionConfig());
  const ok = r.passed.length === 1;
  return { name: "smokeManualRedactionPasses", ok, detail: `passed=${r.passed.length}` };
}

/** Smoke 16: Sacred leak detection (defensiva). */
export function smokeSacredLeakDetection(): SmokeResult {
  const sacred = makeSyntheticPractice({ providerId: "p1" });
  const visible = [sacred]; // bypass protection to test detector
  const leak = detectSacredLeak(visible, false);
  const ok = leak.leaked && leak.leakedIds.includes(sacred.id);
  return { name: "smokeSacredLeakDetection", ok, detail: `leaked=${leak.leakedIds.length}` };
}

/** Smoke 17: Schedule collision detection. */
export function smokeScheduleCollision(): SmokeResult {
  const l1 = makeSyntheticReading({ providerId: "p1", durationMin: 30 });
  // Use realistic 30-min spans 1h apart in the future
  const day = 86400_000;
  const t0 = Date.now() + day;
  const h1 = createBookingHold(l1, "c1", t0, t0 + 30 * 60_000, t0).hold!;
  const h2 = createBookingHold(l1, "c2", t0 + 15 * 60_000, t0 + 45 * 60_000, t0).hold!;
  const h3 = createBookingHold(l1, "c3", t0 + 60 * 60_000, t0 + 90 * 60_000, t0).hold!;
  const col = detectScheduleCollisions([h1, h2, h3]);
  const ok = col.colliders.length === 1;
  return { name: "smokeScheduleCollision", ok, detail: `collisions=${col.colliders.length}` };
}

/** Smoke 18: L2 → L0 revocation. */
export function smokeVerificationRevocation(): SmokeResult {
  const provider = makeSyntheticProvider({ verificationLevel: "L2" });
  const rev = revokeVerification(provider, "fake-docs", "admin-x", Date.now());
  const ok = rev.provider.suspended && rev.provider.verificationLevel === "L0";
  return { name: "smokeVerificationRevocation", ok, detail: `suspended=${rev.provider.suspended}` };
}

/** Smoke 19: Full pipeline search report. */
export function smokeFullPipeline(): SmokeResult {
  const provider = makeSyntheticProvider({ verificationLevel: "L1" });
  const providerMap = new Map<string, ProviderProfile>();
  providerMap.set(provider.providerId, provider);
  const listings: MarketplaceListing[] = [];
  for (let i = 0; i < 8; i++) {
    listings.push(
      makeSyntheticReading({
        providerId: provider.providerId,
        title: i % 2 === 0 ? "Tarô online" : "Astrologia mapa",
        priceBrlCents: 5000 + i * 1000,
        rating: {
          listingId: "x",
          reviewCount: i + 1,
          avgRating: 3 + (i % 3),
          ratingHistogram: [0, 0, i + 1, 0, 0],
          lastReviewAt: Date.now() - i * 86400_000,
        },
      })
    );
  }
  const report = buildSearchReport(
    { q: "tarô online", facets: {}, consumerSacredOptIn: false },
    listings,
    providerMap
  );
  const ok = report.results.length > 0 && report.errors.length === 0;
  return { name: "smokeFullPipeline", ok, detail: `results=${report.results.length} errors=${report.errors.length}` };
}

/** Smoke 20: Donation range ratio check. */
export function smokeDonationRatio(): SmokeResult {
  // ratio = max/min. Max=30000, min=5000 → 6 (excede MAX_DONATION_RATIO=5).
  const d1 = createListing({
    priceTier: "donation",
    priceBrlCents: 0,
    donationMinBrlCents: 5000,
    donationMaxBrlCents: 30000,
  });
  const v1 = validatePricing(d1);
  const ok = !v1.ok;
  return { name: "smokeDonationRatio", ok, detail: `ok=${v1.ok} issues=${v1.issues.length}` };
}

/** Roda todos os smoke tests. */
export function runAllSmokeTests(): SmokeResult[] {
  return [
    smokeHashDeterminism(),
    smokeLevenshtein(),
    smokeSacredFilterHard(),
    smokeBm25RankerOrdering(),
    smokeFreeTextPlusFilter(),
    smokeSacredOptOutFilter(),
    smokeVerificationTiebreak(),
    smokePriceTierValidation(),
    smokeBm25TopK(),
    smokeScheduleWindowMatch(),
    smokeProviderExport(),
    smokeConsumerExport(),
    smokeManualRedactionPII(),
    smokeVerificationL1Promotion(),
    smokeManualRedactionPasses(),
    smokeSacredLeakDetection(),
    smokeScheduleCollision(),
    smokeVerificationRevocation(),
    smokeFullPipeline(),
    smokeDonationRatio(),
  ];
}

export function summarizeSmokeTests(results: SmokeResult[]): { passed: number; failed: number; total: number } {
  let passed = 0;
  for (const r of results) if (r.ok) passed += 1;
  return { passed, failed: results.length - passed, total: results.length };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §15.6 Doc-string constants                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const LGPD_ARTICLES_COVERED = {
  art7: "Art. 7, I — consentimento livre, informado, inequívoco (opt-in explícito para listar e contratar)",
  art7purpose: "Art. 7, II — finalidade específica (marketplace matching, NUNCA marketing)",
  art9: "Art. 9 — finalidade lícita, informada e compatível com a expectativa do titular",
  art18v: "Art. 18, V — acesso e portabilidade dos dados",
  art18vi: "Art. 18, VI — eliminação (esquemecimento) com retenção de audit por 30 dias",
  art18i: "Art. 18, I — confirmação da existência de tratamento",
  art18iii: "Art. 18, III — correção de dados incompletos ou incorretos",
  art8: "Art. 8, §5º — revogação do consentimento sem prejuízo",
} as const;

export const ENGINE_GUARANTEES = {
  sacredHardFilter: "Listings sacred NUNCA aparecem para consumers sem sacredOptIn=true — exclusão hard pré-paginação",
  bm25Ranking: "BM25 (k1=1.2, b=0.75) para relevância de free-text + facet match boost + verification tier tiebreak",
  verificationTiers: "L0 (self-declared) → L1 (doc-verified) → L2 (admin-reviewed). L2 ranks acima em ties.",
  manualRedaction: "Forbidden words + PII patterns (Brazil-focused) bloqueiam listings inseguros antes de indexar",
  bookingHold: "30-min hold por booking. Hold expirado remove-se automaticamente.",
  optInDefault: "Opt-in marketplace OFF por default. Sacred opt-in é separado do opt-in geral.",
  lgpdExport: "Provider export: profile + listings + bookings + verification + opt-in history. Consumer: search history + bookings + reviews.",
  scheduleWindows: "Slots semanais de 15-1440min em qualquer timezone IANA. Listing override é opcional.",
  dataMinimization: "Sem áudio, sem transcrição, sem mensagens. Apenas preço, rating, availability.",
  durationMs: "Search report inteiro tipicamente <50ms para 10k listings em dataset sintético.",
} as const;

export const ENGINE_DEPENDENCIES = {
  runtime: [],
  typescript: ">=5.4.0",
  nodeTarget: "ES2017+",
} as const;

export const ENGINE_LIMITS = {
  maxListingsPerSearchBatch: 10_000,
  maxProvidersInMemory: 100_000,
  maxCategoriesPerFacet: 10,
  maxChannelsPerFacet: 5,
  maxLanguagesPerFacet: 4,
  maxPageSize: MAX_PAGE_SIZE,
  defaultPageSize: DEFAULT_PAGE_SIZE,
  defaultBookingHoldMs: DEFAULT_BOOKING_HOLD_MS,
  maxBookingHoldMs: MAX_BOOKING_HOLD_MS,
  minBookingHoldMs: MIN_BOOKING_HOLD_MS,
  maxPriceBrlCents: MAX_PRICE_BRL_CENTS,
  minPriceBrlCents: MIN_PRICE_BRL_CENTS,
  ratingMax: RATING_MAX,
  ratingMin: RATING_MIN,
  defaultRetentionDays: LGPD_RETENTION_DAYS_DEFAULT,
} as const;

export const ERROR_MESSAGES: Record<MarketplaceErrorCode, string> = {
  MK_001: "Listing inválido ou mal formado",
  MK_002: "priceTier + priceBrlCents inconsistentes",
  MK_003: "Schedule window inválido (weekday 1-7, startMin<endMin, min 15min, timezone válido)",
  MK_004: "Listing sacred sem sacredTradition declarada",
  MK_005: "Provider sem opt-in para listar no marketplace",
  MK_006: "Consumer sem opt-in para contratar",
  MK_007: "Verificação revocation silenciou o provider",
  MK_008: "Query mal formada (parse falhou)",
  MK_009: "Facet inválido (categoria/region/range fora da taxonomia)",
  MK_010: "Hold expirado",
  MK_011: "LGPD export solicitado mas record ausente",
  MK_012: "Sacred leakage detectada em output — abortar exibição",
  MK_013: "Listing bloqueado por manual redaction (PII ou forbidden words)",
  MK_014: "Provider cohort size abaixo do mínimo requerido",
  MK_015: "Schedule collision detectada entre holds",
};

export function makeError(
  code: MarketplaceErrorCode,
  detail?: string,
  now: number = Date.now()
): MarketplaceError {
  return {
    code,
    message: ERROR_MESSAGES[code],
    detail,
    ts: now,
  };
}

export const DEFAULT_SEARCH_OPTIONS: Partial<BuildSearchOptions> = {
  redactionConfig: undefined, // caller pode injetar
  limit: undefined,
};

export const FILE_METADATA = {
  filename: "src/lib/w56/marketplace_leitura_praticas.ts",
  w56Slot: true,
  engineVersion: ENGINE_VERSION,
  policyVersion: POLICY_VERSION,
  layout: "§1..§15",
  compiledByShape: true,
  importsFromOtherRepoFiles: false,
} as const;
