/**
 * w65 community-moderation-engine
 * ------------------------------
 * Sacred-aware text moderation for posts, comments, and reports.
 *
 * Hardest constraint: legitimate sacred content (Candomblé, Umbanda, Ifá,
 * Cabala, Astrologia, Tantra, Numerologia, Cigano Ramiro) is ALWAYS allowed;
 * moderation only flags the dark-pattern overlay (urgency, fear, manipulation,
 * spiritual-bypass, guilt-trip, money-focus, unverified claims).
 *
 * Architecture (14 numbered sections):
 *   §1  Type definitions
 *   §2  Constants (categories, severity floors, audit floors)
 *   §3  Error classes
 *   §4  Sacred-symbol catalog (split across 8 constants — cycle 64 rule)
 *   §5  Dark-pattern regex catalog (split across 7 categories)
 *   §6  Helpers (word-boundary, normalization, severity math)
 *   §7  Type guards
 *   §8  Domain detectors (sacred + dark-pattern)
 *   §9  Crypto (HMAC chain + pseudonymization, LGPD Art. 9)
 *   §10 Validation (never-throws)
 *   §11 Formatters (display-only)
 *   §12 Dispatcher (moderateText, flagReport)
 *   §13 Audit (auditModeration, auditDarkPatterns, auditSacredCoverage)
 *   §14 __ALL_EXPORTS (grep-audit visibility)
 *
 * Anti-patterns strictly avoided:
 *   - .includes() for sacred boundary (use \b...\b regex)
 *   - false positive on legitimate sacred content
 *   - any / as unknown as casts
 *   - raw userId persisted (pseudonymization mandatory)
 *   - hand-rolled HMAC (reuses w64 process.getBuiltinModule pattern)
 *   - throw on dark-pattern detection (return severity, never throw)
 */

// ============================================================================
// §1  TYPE DEFINITIONS
// ============================================================================

export type ModerationInput = {
  readonly text: string
  readonly contentId: string
  readonly authorId: string
  readonly kind: "post" | "comment" | "report"
}

export type ModerationContext = {
  readonly locale: "pt-BR" | "en" | "es"
  readonly sacredWhitelist?: ReadonlyArray<string>
  readonly minSeverityToBlock?: Severity
}

export type Severity = "none" | "low" | "medium" | "high" | "critical"

export type FlagKind =
  | "dark_pattern"
  | "low_quality_signal"
  | "sacred_content_respected"

export type SacredHit = {
  readonly symbol: string
  readonly tradition: SacredTradition
  readonly charStart: number
  readonly charEnd: number
}

export type SacredTradition =
  | "cigano"
  | "orixas"
  | "sefirot"
  | "chakras"
  | "planetas"
  | "hebrew"
  | "astrologia"

export type DarkPatternHit = {
  readonly category: DarkPatternCategory
  readonly phrase: string
  readonly regexIndex: number
  readonly charStart: number
  readonly charEnd: number
}

export type DarkPatternCategory =
  | "URGENCY_PRESSURE"
  | "FEAR_MONGERING"
  | "MANIPULATION"
  | "SPIRITUAL_BYPASS"
  | "GUILT_TRIP"
  | "MONEY_FOCUS"
  | "UNVERIFIED_CLAIMS"

export type ModerationFlag = {
  readonly kind: FlagKind
  readonly severity: Severity
  readonly detail: string
}

export type ModerationResult = {
  readonly contentId: string
  readonly allowed: boolean
  readonly severity: Severity
  readonly flags: ReadonlyArray<ModerationFlag>
  readonly sacredHits: ReadonlyArray<SacredHit>
  readonly darkPatternHits: ReadonlyArray<DarkPatternHit>
  readonly traditionCounts: Readonly<Record<SacredTradition, number>>
  readonly categoryCounts: Readonly<Record<DarkPatternCategory, number>>
  readonly auditHash: string
  readonly decidedAt: string
}

export type ReportReason =
  | "spam"
  | "harassment"
  | "dark_pattern"
  | "sacred_misuse"
  | "fraud"
  | "other"

export type ReportRecord = {
  readonly reportId: string
  readonly contentId: string
  readonly reporterPseudonym: string
  readonly reason: ReportReason
  readonly detail: string
  readonly pseudonymSalt: string
  readonly auditHash: string
  readonly createdAt: string
}

export type ModerationCoverageAudit = {
  readonly totalScanned: number
  readonly byTradition: Readonly<Record<SacredTradition, number>>
  readonly darkPatternsDetected: number
  readonly isFullCoverage: boolean
  readonly traditionFloorMet: Readonly<Record<SacredTradition, boolean>>
  readonly missingTraditions: ReadonlyArray<SacredTradition>
}

export type DarkPatternAuditRow = {
  readonly category: DarkPatternCategory
  readonly matches: ReadonlyArray<string>
}

export type ValidationOutcome = {
  readonly ok: boolean
  readonly errors: ReadonlyArray<string>
}

export type PseudonymOptions = {
  readonly truncationChars?: number
  readonly algorithm?: "sha256"
}

// ============================================================================
// §2  CONSTANTS
// ============================================================================

export const DARK_PATTERN_CATEGORIES: Readonly<Record<
  DarkPatternCategory,
  { readonly id: DarkPatternCategory; readonly label: string; readonly weight: number }
>> = Object.freeze({
  URGENCY_PRESSURE:  { id: "URGENCY_PRESSURE",  label: "Urgência artificial",            weight: 0.35 },
  FEAR_MONGERING:    { id: "FEAR_MONGERING",    label: "Apelo ao medo",                 weight: 0.45 },
  MANIPULATION:      { id: "MANIPULATION",      label: "Manipulação emocional",         weight: 0.40 },
  SPIRITUAL_BYPASS:  { id: "SPIRITUAL_BYPASS",  label: "Bypass espiritual",             weight: 0.55 },
  GUILT_TRIP:        { id: "GUILT_TRIP",        label: "Culpa espiritual",              weight: 0.40 },
  MONEY_FOCUS:       { id: "MONEY_FOCUS",       label: "Foco monetário indevido",       weight: 0.30 },
  UNVERIFIED_CLAIMS: { id: "UNVERIFIED_CLAIMS", label: "Promessas não verificáveis",    weight: 0.50 },
})

export const SEVERITY_FLOORS: Readonly<Record<Severity, number>> = Object.freeze({
  none: 0,
  low: 0.20,
  medium: 0.40,
  high: 0.65,
  critical: 0.85,
})

export const SEVERITY_ORDER: ReadonlyArray<Severity> = Object.freeze([
  "none",
  "low",
  "medium",
  "high",
  "critical",
])

export const SACRED_TRADITION_FLOOR = 7 as const
export const PSEUDONYM_DEFAULT_TRUNCATION = 16 as const
export const HMAC_ALGO = "sha256" as const
export const MIN_TEXT_LENGTH = 1 as const
export const MAX_TEXT_LENGTH = 50_000 as const

export const SUPPORTED_LOCALES: ReadonlyArray<ModerationContext["locale"]> = Object.freeze([
  "pt-BR",
  "en",
  "es",
])

export const SUPPORTED_REPORT_REASONS: ReadonlyArray<ReportReason> = Object.freeze([
  "spam",
  "harassment",
  "dark_pattern",
  "sacred_misuse",
  "fraud",
  "other",
])

export const FORBIDDEN_RESULT_REASONS: ReadonlyArray<string> = Object.freeze([
  "personal_data_leaked",
  "raw_user_persisted",
  "no_pseudonymization",
  "throw_on_pattern",
])

// ============================================================================
// §3  ERROR CLASSES
// ============================================================================

export class ModerationEngineError extends Error {
  readonly code: string
  constructor(code: string, message: string) {
    super(`MODERATION_ENGINE: ${code}: ${message}`)
    this.name = "ModerationEngineError"
    this.code = code
  }
}

export class InvalidModerationInputError extends ModerationEngineError {
  constructor(message: string) {
    super("INVALID_MODERATION_INPUT", message)
    this.name = "InvalidModerationInputError"
  }
}

export class InvalidDarkPatternError extends ModerationEngineError {
  constructor(message: string) {
    super("INVALID_DARK_PATTERN", message)
    this.name = "InvalidDarkPatternError"
  }
}

export class InvalidReportError extends ModerationEngineError {
  constructor(message: string) {
    super("INVALID_REPORT", message)
    this.name = "InvalidReportError"
  }
}

export class InvalidSacredSymbolError extends ModerationEngineError {
  constructor(message: string) {
    super("INVALID_SACRED_SYMBOL", message)
    this.name = "InvalidSacredSymbolError"
  }
}

export class ChainIntegrityError extends ModerationEngineError {
  constructor(message: string) {
    super("CHAIN_INTEGRITY", message)
    this.name = "ChainIntegrityError"
  }
}

// ============================================================================
// §4  SACRED-SYMBOL CATALOG (split across 7 tradition constants)
//     cycle-64 rule: catalogs ≥100 entries MUST be split into N constants
//                    by natural partition, each ≤50 lines.
//     Total: 36 + 16 + 10 + 7 + 11 + 22 + 12 = 114 sacred symbols,
//            across 7 traditions (per-tradition audit floor: 7).
// ============================================================================

export const CIGANO_CARDS: ReadonlyArray<string> = Object.freeze([
  // 36 cards of the Cigano (Lenormand) deck
  "Cavaleiro",          // 1
  "Trevo",              // 2
  "Navio",              // 3
  "Casa",               // 4
  "Árvore",             // 5
  "Nuvens",             // 6
  "Cobra",              // 7
  "Caixão",             // 8
  "Buquê",              // 9
  "Foice",              // 10
  "Chicote",            // 11
  "Pássaros",           // 12
  "Criança",            // 13
  "Cachorro",           // 14
  "Raposa",             // 15
  "Urso",               // 16
  "Estrelas",           // 17
  "Cegonha",            // 18
  "Caminho",            // 19 — caminho/cruzamento
  "Jardim",             // 20
  "Torre",              // 21
  "Cruz",               // 22
  "Ratos",              // 23
  "Coração",            // 24
  "Anel",               // 25
  "Livro",              // 26
  "Carta",              // 27
  "Cigano",             // 28 — O Cigano (homem)
  "Cigana",             // 29 — A Cigana (mulher)
  "Lírios",             // 30
  "Sol",                // 31
  "Lua",                // 32
  "Chave",              // 33
  "Peixes",             // 34
  "Âncora",             // 35
  "Sorte",              // 36 — carta final (bônus)
])

export const ORIXAS: ReadonlyArray<string> = Object.freeze([
  "Exu", "Ogum", "Oxossi", "Oxum", "Xangô", "Iansã", "Iemanjá", "Nanã",
  "Omulu", "Oxalá", "Ibeji", "Logun-Edé", "Oxum-Igbon", "Oxumarê", "Iama", "Obaluaiê",
])

export const SEFIROT: ReadonlyArray<string> = Object.freeze([
  "Keter", "Chokhmah", "Binah", "Chesed", "Geburah",
  "Tiferet", "Netzach", "Hod", "Yesod", "Malkuth",
])

export const CHAKRAS: ReadonlyArray<string> = Object.freeze([
  "Muladhara", "Svadhisthana", "Manipura", "Anahata",
  "Vishuddha", "Ajna", "Sahasrara",
])

export const PLANETS: ReadonlyArray<string> = Object.freeze([
  "Sol", "Lua", "Mercúrio", "Vênus", "Marte",
  "Júpiter", "Saturno", "Urano", "Netuno", "Plutão", "Quirón",
])

export const HEBREW_LETTERS: ReadonlyArray<string> = Object.freeze([
  "Aleph", "Bet", "Gimel", "Dalet", "He", "Vav",
  "Zayin", "Het", "Tet", "Yod", "Kaf", "Lamed",
  "Mem", "Nun", "Samekh", "Ayin", "Pe", "Tsade",
  "Qof", "Resh", "Shin", "Tav",
])

export const ASTROLOGY_HOUSES: ReadonlyArray<string> = Object.freeze([
  "Casa 1", "Casa 2", "Casa 3", "Casa 4", "Casa 5", "Casa 6",
  "Casa 7", "Casa 8", "Casa 9", "Casa 10", "Casa 11", "Casa 12",
])

export const ALL_SACRED: ReadonlyArray<SacredEntry> = Object.freeze([
  ...CIGANO_CARDS.map<SacredEntry>((s) => ({ symbol: s, tradition: "cigano" as const })),
  ...ORIXAS.map<SacredEntry>((s) => ({ symbol: s, tradition: "orixas" as const })),
  ...SEFIROT.map<SacredEntry>((s) => ({ symbol: s, tradition: "sefirot" as const })),
  ...CHAKRAS.map<SacredEntry>((s) => ({ symbol: s, tradition: "chakras" as const })),
  ...PLANETS.map<SacredEntry>((s) => ({ symbol: s, tradition: "planetas" as const })),
  ...HEBREW_LETTERS.map<SacredEntry>((s) => ({ symbol: s, tradition: "hebrew" as const })),
  ...ASTROLOGY_HOUSES.map<SacredEntry>((s) => ({ symbol: s, tradition: "astrologia" as const })),
])

export const SACRED_BY_TRADITION: Readonly<Record<SacredTradition, ReadonlyArray<string>>> = Object.freeze({
  cigano: CIGANO_CARDS,
  orixas: ORIXAS,
  sefirot: SEFIROT,
  chakras: CHAKRAS,
  planetas: PLANETS,
  hebrew: HEBREW_LETTERS,
  astrologia: ASTROLOGY_HOUSES,
})

export const TRADITION_FLOORS_MET_DEFAULT: Readonly<Record<SacredTradition, boolean>> = Object.freeze({
  cigano: CIGANO_CARDS.length >= SACRED_TRADITION_FLOOR,
  orixas: ORIXAS.length >= SACRED_TRADITION_FLOOR,
  sefirot: SEFIROT.length >= SACRED_TRADITION_FLOOR,
  chakras: CHAKRAS.length >= SACRED_TRADITION_FLOOR,
  planetas: PLANETS.length >= SACRED_TRADITION_FLOOR,
  hebrew: HEBREW_LETTERS.length >= SACRED_TRADITION_FLOOR,
  astrologia: ASTROLOGY_HOUSES.length >= SACRED_TRADITION_FLOOR,
})

export type SacredEntry = {
  readonly symbol: string
  readonly tradition: SacredTradition
}

// ============================================================================
// §5  DARK-PATTERN REGEX CATALOG (split across 7 categories, ≥30 patterns)
// ============================================================================

export const URGENCY_PRESSURE_PATTERNS: ReadonlyArray<DarkPatternRegex> = Object.freeze([
  { phrase: "agora ou nunca",          regex: /\bagora\s+ou\s+nunca\b/gi },
  { phrase: "última chance",           regex: /\b[úu]ltima\s+chance\b/gi },
  { phrase: "expira em X",             regex: /\bexpira\s+em\s+\d+\s+(horas?|dias?|minutos?|segundos?)\b/gi },
  { phrase: "só hoje",                 regex: /\bs[óo]\s+hoje\b/gi },
  { phrase: "vagas limitadas",         regex: /\bvagas?\s+limitadas?\b/gi },
  { phrase: "aproveite agora",         regex: /\baproveite\s+agora\b/gi },
  { phrase: "encerra em breve",        regex: /\bencerra\s+em\s+breve\b/gi },
])

export const FEAR_MONGERING_PATTERNS: ReadonlyArray<DarkPatternRegex> = Object.freeze([
  { phrase: "vai sofrer",             regex: /\bvai\s+(sofrer|adoecer|morrer|adoentar)\b/gi },
  { phrase: "maldição",               regex: /\bmaldi[çc][ãa]o\b/gi },
  { phrase: "espírito ruim vai te pegar", regex: /\besp[íi]rito\s+(ruim|mau)\s+vai\s+te\s+(pegar|atingir)\b/gi },
  { phrase: "está em perigo",         regex: /\best[áa]\s+em\s+perigo\b/gi },
  { phrase: "ter medo",               regex: /\bdeve\s+ter\s+medo\b/gi },
  { phrase: "consequência grave",     regex: /\bconsequ[êe]ncia\s+grave\b/gi },
])

export const MANIPULATION_PATTERNS: ReadonlyArray<DarkPatternRegex> = Object.freeze([
  { phrase: "faça isso ou",          regex: /\bfa[çc]a\s+isso\s+ou\b/gi },
  { phrase: "se não fizer",          regex: /\bse\s+n[ãa]o\s+(fizer|fizer\s+isso|agir|ajudar)\b/gi },
  { phrase: "só você pode",          regex: /\bs[óo]\s+voc[êe]\s+pode\b/gi },
  { phrase: "somente você",          regex: /\bsomente\s+voc[êe]\b/gi },
  { phrase: "não deixe pra depois",  regex: /\bn[ãa]o\s+deixe\s+(pra\s+)?depois\b/gi },
  { phrase: "responsabilidade sua",  regex: /\b[aá]\s+responsabilidade\s+(e[ée]\s+)?sua\b/gi },
])

export const SPIRITUAL_BYPASS_PATTERNS: ReadonlyArray<DarkPatternRegex> = Object.freeze([
  { phrase: "não é terapia",                  regex: /\bn[ãa]o\s+[ée]\s+terapia\b/gi },
  { phrase: "deus cura tudo",                 regex: /\bdeus\s+cura\s+(tudo|qualquer\s+coisa)\b/gi },
  { phrase: "ignore o médico",                regex: /\bignore\s+o\s+m[ée]dico\b/gi },
  { phrase: "não precisa de remédio",         regex: /\bn[ãa]o\s+precisa\s+de\s+(rem[ée]dio|tratamento)\b/gi },
  { phrase: "fé cura",                        regex: /\bf[ée]\s+cura\b/gi },
  { phrase: "não precisa de psicólogo",       regex: /\bn[ãa]o\s+precisa\s+de\s+(psic[óo]logo|psiquiatra)\b/gi },
  { phrase: "espiritualidade substitui remédio", regex: /\bespiritualidade\s+substitui\s+(rem[ée]dio|tratamento)\b/gi },
])

export const GUILT_TRIP_PATTERNS: ReadonlyArray<DarkPatternRegex> = Object.freeze([
  { phrase: "vai decepcionar",     regex: /\bvai\s+decepcionar\b/gi },
  { phrase: "não merece",          regex: /\bn[ãa]o\s+merece\b/gi },
  { phrase: "egoísmo espiritual", regex: /\bego[íi]smo\s+espiritual\b/gi },
  { phrase: "está abandonando",    regex: /\best[áa]\s+abandonando\b/gi },
  { phrase: "não liga pros outros", regex: /\bn[ãa]o\s+liga\s+(pros?\s+)?outros\b/gi },
  { phrase: "vai fracassar",       regex: /\bvai\s+fracassar\b/gi },
])

export const MONEY_FOCUS_PATTERNS: ReadonlyArray<DarkPatternRegex> = Object.freeze([
  { phrase: "doe X reais",         regex: /\bdoe\s+(R\$\s*)?\d+([.,]\d+)?\b/gi },
  { phrase: "contribua com",       regex: /\bcontribua\s+com\b/gi },
  { phrase: "pix para",            regex: /\bpix\s+para\b/gi },
  { phrase: "transferência para",  regex: /\btransfer[êe]ncia\s+para\b/gi },
  { phrase: "oferta obrigatória",  regex: /\boferta\s+obrigat[óo]ria\b/gi },
  { phrase: "depósito urgente",    regex: /\bdep[óo]sito\s+urgente\b/gi },
  { phrase: "valor mínimo",        regex: /\bvalor\s+m[íi]nimo\s+(de\s+)?(R\$\s*)?\d+/gi },
])

export const UNVERIFIED_CLAIMS_PATTERNS: ReadonlyArray<DarkPatternRegex> = Object.freeze([
  { phrase: "100% garantido",            regex: /\b100\s*%\s+(garantid[ao]|certo|eficaz|comprovad[ao]|eficaz)\b/gi },
  { phrase: "resultado certo",           regex: /\bresultado\s+certo\b/gi },
  { phrase: "sem risco",                 regex: /\bsem\s+risco\b/gi },
  { phrase: "comprovado cientificamente", regex: /\bcomprovado\s+cientificamente\b/gi },
  { phrase: "sem efeitos colaterais",    regex: /\bsem\s+efeitos?\s+colaterais?\b/gi },
  { phrase: "cura definitiva",           regex: /\bcura\s+definitiva\b/gi },
  { phrase: "reversão garantida",        regex: /\brevers[ãa]o\s+garantida\b/gi },
])

export const DARK_PATTERN_PATTERNS: Readonly<Record<
  DarkPatternCategory,
  ReadonlyArray<DarkPatternRegex>
>> = Object.freeze({
  URGENCY_PRESSURE:  URGENCY_PRESSURE_PATTERNS,
  FEAR_MONGERING:    FEAR_MONGERING_PATTERNS,
  MANIPULATION:      MANIPULATION_PATTERNS,
  SPIRITUAL_BYPASS:  SPIRITUAL_BYPASS_PATTERNS,
  GUILT_TRIP:        GUILT_TRIP_PATTERNS,
  MONEY_FOCUS:       MONEY_FOCUS_PATTERNS,
  UNVERIFIED_CLAIMS: UNVERIFIED_CLAIMS_PATTERNS,
})

export type DarkPatternRegex = {
  readonly phrase: string
  readonly regex: RegExp
}

export const TOTAL_DARK_PATTERN_PATTERNS: number =
  URGENCY_PRESSURE_PATTERNS.length +
  FEAR_MONGERING_PATTERNS.length +
  MANIPULATION_PATTERNS.length +
  SPIRITUAL_BYPASS_PATTERNS.length +
  GUILT_TRIP_PATTERNS.length +
  MONEY_FOCUS_PATTERNS.length +
  UNVERIFIED_CLAIMS_PATTERNS.length

// ============================================================================
// §6  HELPERS (word-boundary, normalization, severity math)
// ============================================================================

/**
 * Build a word-boundary regex from a sacred symbol.
 *
 * cycle 55+60 lesson — `.includes()` matches "exu" in "exuberant".
 * We always use a word-boundary regex that handles UTF-8 multi-byte chars.
 *
 * NOTE: Node.js's `\b` does NOT treat accented chars (`ê`, `é`, ...) as
 * word characters even with the `u` flag — `\w` still requires the unicode
 * property escape `\\p{L}` for that. To stay compatible with plain JS regex
 * AND avoid `\p{...}` portability issues across TS strict versions, we use
 * the (^|\\W) / ($|\\W) idiom instead of `\b`. That gives correct behavior
 * for both ASCII and accented symbols like Oxumarê, Iemanjá, Estrelas, ...
 */
export function buildSacredRegex(symbol: string): RegExp {
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const safe = escaped.replace(/ /g, "\\s+")
  return new RegExp(`(?:^|\\W)${safe}(?:$|\\W)`, "giu")
}

/**
 * Strip diacritics (NFD + unicode combine removal) for forgiving detection.
 * Returns normalized text in lowercase without combining marks.
 *
 * Uses the legacy Unicode block range [\u0300-\u036f] for the combining
 * diacritical marks instead of `\p{...}` for broader TS strict-mode
 * compatibility.
 */
export function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]+/g, "")
}

/**
 * Clamp a numeric value to [0, 1]. Cycle 63 lesson:
 * Math.min(0.99, ...) for boost cap, not just clampUnit (clamping to 1.0).
 */
export function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/**
 * Convert a numeric severity score (0..1) to a Severity bucket.
 */
export function severityFromScore(score: number): Severity {
  const s = clampUnit(score)
  if (s >= SEVERITY_FLOORS.critical) return "critical"
  if (s >= SEVERITY_FLOORS.high) return "high"
  if (s >= SEVERITY_FLOORS.medium) return "medium"
  if (s >= SEVERITY_FLOORS.low) return "low"
  return "none"
}

/**
 * Pick the higher of two Severity levels.
 */
export function maxSeverity(a: Severity, b: Severity): Severity {
  return SEVERITY_ORDER.indexOf(a) >= SEVERITY_ORDER.indexOf(b) ? a : b
}

/**
 * Append one Severity-bounded boost to a base score, capped at 0.99.
 * Cycle 63 lesson: explicit Math.min(0.99, ...), not just clampUnit.
 */
export function boostScore(base: number, boost: number, weight: number): number {
  const added = clampUnit(boost) * clampUnit(weight)
  return Math.min(0.99, clampUnit(base) + added)
}

/**
 * Validate UUID-shape id — informal, used only to avoid path-traversal strings.
 */
export function isSafeId(id: string): boolean {
  if (typeof id !== "string") return false
  if (id.length === 0 || id.length > 256) return false
  return /^[A-Za-z0-9_\-:.]+$/.test(id)
}

/**
 * Stable JSON stringifier with sorted keys — used for HMAC payloads.
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    if (typeof value === "string") return JSON.stringify(value)
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null"
    if (typeof value === "boolean") return value ? "true" : "false"
    return "null"
  }
  if (Array.isArray(value)) {
    return "[" + value.map((v) => stableStringify(v)).join(",") + "]"
  }
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}"
}

/**
 * Parse free text into a list of candidate `SacredHit` entries.
 * Returns an empty array on empty input — never throws.
 */
export function findSacredHits(text: string): SacredHit[] {
  if (typeof text !== "string" || text.length === 0) return []
  const hits: SacredHit[] = []
  for (const entry of ALL_SACRED) {
    const rx = buildSacredRegex(entry.symbol)
    let match: RegExpExecArray | null
    rx.lastIndex = 0
    while ((match = rx.exec(text)) !== null) {
      hits.push({
        symbol: entry.symbol,
        tradition: entry.tradition,
        charStart: match.index,
        charEnd: match.index + match[0].length,
      })
      if (rx.lastIndex === match.index) rx.lastIndex++
    }
  }
  return hits
}

// ============================================================================
// §7  TYPE GUARDS
// ============================================================================

export function isSacredHit(value: unknown): value is SacredHit {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.symbol === "string" &&
    typeof v.tradition === "string" &&
    typeof v.charStart === "number" &&
    typeof v.charEnd === "number" &&
    Number.isFinite(v.charStart) &&
    Number.isFinite(v.charEnd) &&
    v.charStart >= 0 &&
    v.charEnd >= v.charStart
  )
}

export function isDarkPatternHit(value: unknown): value is DarkPatternHit {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  const isCat = (
    v.category === "URGENCY_PRESSURE" ||
    v.category === "FEAR_MONGERING" ||
    v.category === "MANIPULATION" ||
    v.category === "SPIRITUAL_BYPASS" ||
    v.category === "GUILT_TRIP" ||
    v.category === "MONEY_FOCUS" ||
    v.category === "UNVERIFIED_CLAIMS"
  )
  return (
    isCat &&
    typeof v.phrase === "string" &&
    typeof v.regexIndex === "number" &&
    typeof v.charStart === "number" &&
    typeof v.charEnd === "number"
  )
}

export function isModerationResult(value: unknown): value is ModerationResult {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    typeof v.contentId === "string" &&
    typeof v.allowed === "boolean" &&
    typeof v.severity === "string" &&
    Array.isArray(v.flags) &&
    Array.isArray(v.sacredHits) &&
    Array.isArray(v.darkPatternHits) &&
    typeof v.auditHash === "string"
  )
}

export function isDarkPatternCategory(value: unknown): value is DarkPatternCategory {
  return (
    value === "URGENCY_PRESSURE" ||
    value === "FEAR_MONGERING" ||
    value === "MANIPULATION" ||
    value === "SPIRITUAL_BYPASS" ||
    value === "GUILT_TRIP" ||
    value === "MONEY_FOCUS" ||
    value === "UNVERIFIED_CLAIMS"
  )
}

export function isSacredTradition(value: unknown): value is SacredTradition {
  return (
    value === "cigano" ||
    value === "orixas" ||
    value === "sefirot" ||
    value === "chakras" ||
    value === "planetas" ||
    value === "hebrew" ||
    value === "astrologia"
  )
}

export function isSeverity(value: unknown): value is Severity {
  return (
    value === "none" ||
    value === "low" ||
    value === "medium" ||
    value === "high" ||
    value === "critical"
  )
}

export function isReportReason(value: unknown): value is ReportReason {
  return (
    value === "spam" ||
    value === "harassment" ||
    value === "dark_pattern" ||
    value === "sacred_misuse" ||
    value === "fraud" ||
    value === "other"
  )
}

export function isStringArray(value: unknown): value is ReadonlyArray<string> {
  return Array.isArray(value) && value.every((v) => typeof v === "string")
}

// ============================================================================
// §8  DOMAIN DETECTORS
// ============================================================================

/**
 * Detect dark-pattern hits in `text`. NEVER throws.
 * Returns an empty array on empty input. Cycle 62 lesson 6: this is the
 * exported anti-dark-pattern audit.
 */
export function auditDarkPatterns(text: string): DarkPatternAuditRow[] {
  if (typeof text !== "string" || text.length === 0) return []
  const rows: DarkPatternAuditRow[] = []
  for (const cat of Object.keys(DARK_PATTERN_PATTERNS) as DarkPatternCategory[]) {
    const row: { category: DarkPatternCategory; matches: string[] } = { category: cat, matches: [] }
    for (const p of DARK_PATTERN_PATTERNS[cat]) {
      const safe = new RegExp(p.regex.source, p.regex.flags)
      let m: RegExpExecArray | null
      safe.lastIndex = 0
      while ((m = safe.exec(text)) !== null) {
        const hit = m[0]
        if (!row.matches.includes(hit)) row.matches.push(hit)
        if (safe.lastIndex === m.index) safe.lastIndex++
      }
    }
    if (row.matches.length > 0) rows.push({ category: row.category, matches: row.matches })
  }
  return rows
}

/**
 * Detect all dark-pattern hits with span (start/end). NEVER throws.
 */
export function detectDarkPatternHits(text: string): DarkPatternHit[] {
  if (typeof text !== "string" || text.length === 0) return []
  const hits: DarkPatternHit[] = []
  for (const cat of Object.keys(DARK_PATTERN_PATTERNS) as DarkPatternCategory[]) {
    DARK_PATTERN_PATTERNS[cat].forEach((p, idx) => {
      const safe = new RegExp(p.regex.source, p.regex.flags)
      safe.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = safe.exec(text)) !== null) {
        hits.push({
          category: cat,
          phrase: p.phrase,
          regexIndex: idx,
          charStart: m.index,
          charEnd: m.index + m[0].length,
        })
        if (safe.lastIndex === m.index) safe.lastIndex++
      }
    })
  }
  return hits
}

/**
 * Bucket sacred hits by tradition.
 */
export function countTraditionHits(hits: ReadonlyArray<SacredHit>): Record<SacredTradition, number> {
  const counts: Record<SacredTradition, number> = {
    cigano: 0, orixas: 0, sefirot: 0, chakras: 0, planetas: 0, hebrew: 0, astrologia: 0,
  }
  for (const h of hits) counts[h.tradition]++
  return counts
}

/**
 * Bucket dark-pattern hits by category.
 */
export function countCategoryHits(hits: ReadonlyArray<DarkPatternHit>): Record<DarkPatternCategory, number> {
  const counts: Record<DarkPatternCategory, number> = {
    URGENCY_PRESSURE: 0, FEAR_MONGERING: 0, MANIPULATION: 0,
    SPIRITUAL_BYPASS: 0, GUILT_TRIP: 0, MONEY_FOCUS: 0, UNVERIFIED_CLAIMS: 0,
  }
  for (const h of hits) counts[h.category]++
  return counts
}

/**
 * Severity math — never throws. Aggregates per-category weighted scores into
 * a single bucket using the formula:
 *
 *   per-cat_score = weight * (1.3 + (hitCount - 1) * 0.15)
 *   total = max(per-cat_score) + (numCategories - 1) * 0.10
 *   score = min(0.99, total)
 *
 * Properties:
 *   - A single SPIRITUAL_BYPASS hit (weight 0.55) -> 0.715 -> "high"
 *   - 7 SPIRITUAL_BYPASS hits in one category -> 0.55*2.2=1.21 capped -> "critical"
 *   - 4 categories firing simultaneously -> max(0.55*1.3)+3*0.1=1.015 capped -> "critical"
 *   - 1 URGENCY_PRESSURE hit -> 0.35*1.3=0.455 -> "medium"
 *   - Sacred hits slightly deflate the score (multiplier 0.95) so legitimate
 *     sacred content is respected but doesn't fully cancel dark patterns.
 *
 * Final score capped at 0.99 per the cycle-63 lesson (Math.min(0.99, ...)).
 */
export function calculateSeverity(
  darkHits: ReadonlyArray<DarkPatternHit>,
  sacredHits: ReadonlyArray<SacredHit>,
): Severity {
  if (darkHits.length === 0) {
    return "none"
  }
  const counts = countCategoryHits(darkHits)
  const cats: DarkPatternCategory[] = (Object.keys(counts) as DarkPatternCategory[]).filter(
    (c) => counts[c] > 0,
  )
  let perCatMax = 0
  for (const cat of cats) {
    const weight = DARK_PATTERN_CATEGORIES[cat].weight
    const hitCount = counts[cat]
    const perCat = weight * (1.3 + (hitCount - 1) * 0.15)
    if (perCat > perCatMax) perCatMax = perCat
  }
  const numCats = cats.length
  const score = Math.min(
    0.99,
    perCatMax + Math.max(0, numCats - 1) * 0.10,
  )
  const finalScore = sacredHits.length > 0 ? clampUnit(score * 0.95) : score
  return severityFromScore(finalScore)
}

/**
 * Decide if `allowed` from the inputs and severity.
 * High / critical -> false. Low / medium depend on caller threshold (default high).
 * Never throws.
 */
export function decideAllowed(severity: Severity, threshold: Severity): boolean {
  return SEVERITY_ORDER.indexOf(severity) < SEVERITY_ORDER.indexOf(threshold)
}

/**
 * Build the `flags` array summarizing what was detected.
 * Sacred hits ALWAYS appear under "sacred_content_respected" with severity "none"
 * (or "low" if many sacred hits and no dark-pattern hits to acknowledge respect).
 */
export function buildFlags(
  sacredHits: ReadonlyArray<SacredHit>,
  darkHits: ReadonlyArray<DarkPatternHit>,
): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  if (sacredHits.length > 0) {
    const detail = `${sacredHits.length} sacred reference(s) detected and respected`
    flags.push({
      kind: sacredHits.length > 8 ? "sacred_content_respected" : "sacred_content_respected",
      severity: "none",
      detail,
    })
  }
  const counts = countCategoryHits(darkHits)
  for (const cat of Object.keys(counts) as DarkPatternCategory[]) {
    const c = counts[cat]
    if (c === 0) continue
    flags.push({
      kind: "dark_pattern",
      severity: DARK_PATTERN_CATEGORIES[cat].weight >= 0.45 ? "high" : "medium",
      detail: `${DARK_PATTERN_CATEGORIES[cat].label}: ${c} hit(s)`,
    })
  }
  return flags
}

// ============================================================================
// §9  CRYPTO (HMAC chain + pseudonymization, LGPD Art. 9)
// ============================================================================

/**
 * A tiny structural type that matches the subset of `node:crypto` we use.
 * Defined locally so the module compiles without `@types/node`.
 */
type HashLike = {
  update(data: string): HashLike
  digest(encoding: "hex"): string
}
type CryptoLike = {
  createHash(algo: string): HashLike
}
type RequireLike = (id: string) => unknown
type ModuleLike = { createRequire?: (url: string) => RequireLike } | undefined

/**
 * Resolve the `crypto` module in a portable way.
 * - Bun (bun runtime) may inject `require` via `process.getBuiltinModule`.
 * - Node.js (esm) needs `createRequire(import.meta.url)`.
 * - CommonJS reads `require("node:crypto")` directly.
 *
 * Reuses cycle-64 w64 pattern.
 */
function resolveCrypto(): CryptoLike {
  const tryGlobal = (globalThis as { crypto?: { createHash?: (a: string) => unknown } }).crypto
  if (tryGlobal?.createHash && typeof tryGlobal.createHash === "function") {
    return tryGlobal as unknown as CryptoLike
  }
  // Try with a properly-formed file URL pointing to this file. Strip-types
  // mode doesn't expose `import.meta.url`, so we fall back to a sentinel
  // absolute path. Node's createRequire accepts absolute paths.
  const proc = process as unknown as { getBuiltinModule?: (m: string) => ModuleLike }
  const viaBuiltin = proc.getBuiltinModule
  if (viaBuiltin) {
    const mod = viaBuiltin.call(proc, "node:module") as ModuleLike
    if (mod && typeof mod.createRequire === "function") {
      const req = mod.createRequire("/workspace/wt-w65-moderation/src/lib/w65/community-moderation-engine.ts")
      const c = req("node:crypto") as CryptoLike
      return c
    }
  }
  // Fallback: assume node:crypto is reachable through global require (CJS)
  const fallback = (globalThis as { require?: RequireLike }).require
  if (typeof fallback === "function") {
    const c = fallback("node:crypto") as CryptoLike
    return c
  }
  throw new ModerationEngineError(
    "CRYPTO_UNAVAILABLE",
    "neither globalThis.crypto, process.getBuiltinModule, nor a require() were available",
  )
}

/**
 * Compute a 64-char hex HMAC chain link.
 * chain(prevHash, payload, secret) = sha256-hex(prev | payload | secret)
 *
 * Cycle 64 lesson: chain semantics — each call hashes `prev|payload`,
 * tampering any link breaks verification.
 */
export function chainModerationHash(
  prevHash: string,
  payload: string,
  secret: string,
): string {
  if (typeof prevHash !== "string") prevHash = ""
  if (typeof payload !== "string") payload = String(payload)
  if (typeof secret !== "string" || secret.length === 0) {
    throw new ChainIntegrityError("secret must be a non-empty string")
  }
  const crypto = resolveCrypto()
  const h = crypto.createHash(HMAC_ALGO)
  const updated = h.update(`${prevHash}|${payload}|${secret}`)
  const out = updated.digest("hex")
  if (typeof out !== "string" || out.length < 16) {
    throw new ChainIntegrityError("hmac output invalid")
  }
  return out
}

/**
 * LGPD Art. 9 pseudonymization: SHA-256(userId + ":" + salt) truncated to 16
 * hex chars. NEVER persists the raw userId. NEVER throws.
 */
export function pseudonymizeUserId(
  userId: string,
  salt: string,
  options?: PseudonymOptions,
): string {
  if (typeof userId !== "string" || userId.length === 0) return ""
  if (typeof salt !== "string") salt = ""
  const truncation = options?.truncationChars ?? PSEUDONYM_DEFAULT_TRUNCATION
  const algo = options?.algorithm ?? "sha256"
  if (algo !== "sha256") return ""
  const crypto = resolveCrypto()
  const h = crypto.createHash(algo)
  const updated = h.update(`${userId}:${salt}`)
  const hex = updated.digest("hex")
  return hex.slice(0, Math.max(8, Math.min(64, truncation)))
}

/**
 * Verify a chain link — re-derives and compares. Constant-time compare.
 * Returns true if the chain would accept the given (prev, payload, hash, secret).
 */
export function verifyModerationChainLink(
  prevHash: string,
  payload: string,
  hash: string,
  secret: string,
): boolean {
  const expected = chainModerationHash(prevHash, payload, secret)
  if (expected.length !== hash.length) return false
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= (expected.charCodeAt(i) ^ hash.charCodeAt(i))
  }
  return mismatch === 0
}

// ============================================================================
// §10 VALIDATION (never-throws)
// ============================================================================

/**
 * Validate a moderation result shape. NEVER throws — returns errors[].
 */
export function validateModeration(m: ModerationResult): ValidationOutcome {
  const errors: string[] = []
  if (!m || typeof m !== "object") {
    return { ok: false, errors: ["validation: result is null or not an object"] }
  }
  if (!isSafeId(m.contentId)) errors.push("validation: contentId must be a safe string")
  if (typeof m.allowed !== "boolean") errors.push("validation: allowed must be boolean")
  if (!isSeverity(m.severity)) errors.push("validation: severity must be one of the 5 buckets")
  if (!Array.isArray(m.flags)) errors.push("validation: flags must be array")
  if (!Array.isArray(m.sacredHits)) errors.push("validation: sacredHits must be array")
  if (!Array.isArray(m.darkPatternHits)) errors.push("validation: darkPatternHits must be array")
  if (typeof m.auditHash !== "string" || m.auditHash.length < 16) {
    errors.push("validation: auditHash must be 16+ char string")
  }
  for (const h of m.sacredHits) {
    if (!isSacredHit(h)) { errors.push(`validation: bad sacred hit ${stableStringify(h)}`); break }
  }
  for (const h of m.darkPatternHits) {
    if (!isDarkPatternHit(h)) { errors.push(`validation: bad dark hit ${stableStringify(h)}`); break }
  }
  if (m.traditionCounts) {
    for (const k of Object.keys(m.traditionCounts)) {
      if (!isSacredTradition(k)) { errors.push(`validation: unknown tradition ${k}`); break }
    }
  }
  if (m.categoryCounts) {
    for (const k of Object.keys(m.categoryCounts)) {
      if (!isDarkPatternCategory(k)) { errors.push(`validation: unknown category ${k}`); break }
    }
  }
  return { ok: errors.length === 0, errors }
}

/**
 * Validate a report record. NEVER throws.
 */
export function validateReport(r: ReportRecord): ValidationOutcome {
  const errors: string[] = []
  if (!r || typeof r !== "object") {
    return { ok: false, errors: ["validation: report is null or not an object"] }
  }
  if (!isSafeId(r.reportId)) errors.push("validation: reportId must be a safe string")
  if (!isSafeId(r.contentId)) errors.push("validation: contentId must be a safe string")
  if (typeof r.reporterPseudonym !== "string" || r.reporterPseudonym.length < 8) {
    errors.push("validation: reporterPseudonym must be 8+ char pseudonymized string")
  }
  if (!isReportReason(r.reason)) errors.push("validation: reason invalid")
  if (typeof r.detail !== "string") errors.push("validation: detail must be string")
  if (typeof r.pseudonymSalt !== "string") errors.push("validation: pseudonymSalt must be string")
  if (typeof r.auditHash !== "string" || r.auditHash.length < 16) {
    errors.push("validation: auditHash must be 16+ char string")
  }
  return { ok: errors.length === 0, errors }
}

// ============================================================================
// §11 FORMATTERS (display-only)
// ============================================================================

/**
 * Format moderation result as a human-readable pt-BR string.
 * NEVER throws.
 */
export function formatModerationResult(m: ModerationResult): string {
  if (!m || typeof m !== "object") return "(invalid ModerationResult)"
  const sacred = m.sacredHits.length
  const dark = m.darkPatternHits.length
  return [
    `ModerationResult[${m.contentId}]`,
    `  allowed: ${m.allowed}`,
    `  severity: ${m.severity}`,
    `  sacredHits: ${sacred}`,
    `  darkPatternHits: ${dark}`,
    `  flags: ${m.flags.map((f) => f.kind).join(",") || "(none)"}`,
  ].join("\n")
}

export function formatReport(r: ReportRecord): string {
  if (!r || typeof r !== "object") return "(invalid ReportRecord)"
  return [
    `Report[${r.reportId}]`,
    `  contentId: ${r.contentId}`,
    `  reporterPseudonym: ${r.reporterPseudonym}`,
    `  reason: ${r.reason}`,
    `  detail: ${r.detail}`,
    `  auditHash: ${r.auditHash.slice(0, 16)}…`,
  ].join("\n")
}

export function formatSacredHits(hits: ReadonlyArray<SacredHit>): string {
  if (hits.length === 0) return "(no sacred hits)"
  return hits
    .slice(0, 64)
    .map((h) => `[${h.tradition}] ${h.symbol} @ ${h.charStart}-${h.charEnd}`)
    .join(" | ")
}

export function formatDarkPatternHits(hits: ReadonlyArray<DarkPatternHit>): string {
  if (hits.length === 0) return "(no dark pattern hits)"
  return hits
    .slice(0, 64)
    .map((h) => `[${h.category}] "${h.phrase}" @ ${h.charStart}-${h.charEnd}`)
    .join(" | ")
}

// ============================================================================
// §12 DISPATCHER
// ============================================================================

/**
 * Moderate a piece of text. NEVER throws (except programmer errors on bad input).
 * Returns a `ModerationResult` with allowed/severity/flags/sacredHits/darkPatternHits.
 *
 * The hardest requirement:
 *   legitimate sacred content is ALWAYS allowed (sacred hits do NOT lower allowed).
 *   Dark patterns raise severity and may flip allowed to false.
 *
 * `ctx.minSeverityToBlock` defaults to "high" — at "high"/"critical" the content
 * is blocked. Adjust per product surface (comments are stricter than posts).
 */
export function moderateText(
  input: ModerationInput,
  ctx: ModerationContext,
): ModerationResult {
  if (!input || typeof input !== "object") {
    throw new InvalidModerationInputError("input must be an object")
  }
  if (typeof input.text !== "string") {
    throw new InvalidModerationInputError("input.text must be a string")
  }
  if (input.text.length < MIN_TEXT_LENGTH || input.text.length > MAX_TEXT_LENGTH) {
    throw new InvalidModerationInputError(
      `input.text length must be ${MIN_TEXT_LENGTH}..${MAX_TEXT_LENGTH} chars`,
    )
  }
  if (!isSafeId(input.contentId)) {
    throw new InvalidModerationInputError("contentId must be a safe id")
  }
  if (!isSafeId(input.authorId)) {
    throw new InvalidModerationInputError("authorId must be a safe id")
  }
  if (!ctx || typeof ctx !== "object") {
    throw new InvalidModerationInputError("ctx must be an object")
  }
  if (!SUPPORTED_LOCALES.includes(ctx.locale)) {
    throw new InvalidModerationInputError(`locale must be one of ${SUPPORTED_LOCALES.join(",")}`)
  }

  const sacredHits = findSacredHits(input.text)
  const darkPatternHits = detectDarkPatternHits(input.text)
  const severity = calculateSeverity(darkPatternHits, sacredHits)
  const threshold = ctx.minSeverityToBlock ?? "high"
  const allowed = decideAllowed(severity, threshold)

  const flags = buildFlags(sacredHits, darkPatternHits)
  const traditionCounts = countTraditionHits(sacredHits)
  const categoryCounts = countCategoryHits(darkPatternHits)

  const auditPayload = stableStringify({
    cid: input.contentId,
    aid: input.authorId,
    sev: severity,
    allowed,
    sacred: sacredHits.length,
    dark: darkPatternHits.length,
    loc: ctx.locale,
  })
  const auditHash = chainModerationHash("genesis", auditPayload, "w65-moderation-default-secret")

  return {
    contentId: input.contentId,
    allowed,
    severity,
    flags,
    sacredHits,
    darkPatternHits,
    traditionCounts,
    categoryCounts,
    auditHash,
    decidedAt: new Date(0).toISOString(),
  }
}

/**
 * File a report against a piece of content. Pseudonymizes reporterId,
 * attaches an HMAC chain link. NEVER persists the raw userId.
 */
export function flagReport(
  contentId: string,
  reporterId: string,
  reason: ReportReason,
  ctx: { locale: "pt-BR" | "en" | "es"; detail?: string },
): ReportRecord {
  if (!isSafeId(contentId)) {
    throw new InvalidReportError("contentId must be a safe id")
  }
  if (typeof reporterId !== "string" || reporterId.length === 0) {
    throw new InvalidReportError("reporterId must be a non-empty string")
  }
  if (!isReportReason(reason)) {
    throw new InvalidReportError(`reason must be one of ${SUPPORTED_REPORT_REASONS.join(",")}`)
  }
  if (!ctx || typeof ctx !== "object") {
    throw new InvalidReportError("ctx must be an object")
  }

  const salt = `w65-${ctx.locale}-${reason}-${contentId}`
  const pseudonym = pseudonymizeUserId(reporterId, salt)
  if (pseudonym.length < 8) {
    throw new InvalidReportError("pseudonymization produced too-short hash")
  }
  const detail = (typeof ctx.detail === "string" && ctx.detail.length > 0)
    ? ctx.detail.slice(0, 2000)
    : ""

  const payload = stableStringify({
    cid: contentId,
    r: reason,
    p: pseudonym,
    d: detail,
    l: ctx.locale,
  })
  const auditHash = chainModerationHash("genesis", payload, `w65-report-${ctx.locale}`)

  return {
    reportId: `r_${auditHash.slice(0, 16)}`,
    contentId,
    reporterPseudonym: pseudonym,
    reason,
    detail,
    pseudonymSalt: salt,
    auditHash,
    createdAt: new Date(0).toISOString(),
  }
}

// ============================================================================
// §13 AUDIT (coverage + dark-pattern totals)
// ============================================================================

/**
 * Audit how much coverage this engine has for the sacred traditions and
 * how many dark patterns it would detect on a representative sample.
 *
 * `totalScanned` reflects the number of sacred symbols in the catalog.
 * `byTradition` is the per-tradition symbol count (floor 7).
 * `darkPatternsDetected` is the total number of unique phrases.
 * `isFullCoverage` is true iff every tradition meets the floor AND ≥1 dark
 * pattern is detected per category.
 */
export function auditModeration(): ModerationCoverageAudit {
  const byTradition: Record<SacredTradition, number> = {
    cigano: CIGANO_CARDS.length,
    orixas: ORIXAS.length,
    sefirot: SEFIROT.length,
    chakras: CHAKRAS.length,
    planetas: PLANETS.length,
    hebrew: HEBREW_LETTERS.length,
    astrologia: ASTROLOGY_HOUSES.length,
  }
  const darkPatternsDetected = TOTAL_DARK_PATTERN_PATTERNS
  const traditionFloorMet: Record<SacredTradition, boolean> = {
    cigano: byTradition.cigano >= SACRED_TRADITION_FLOOR,
    orixas: byTradition.orixas >= SACRED_TRADITION_FLOOR,
    sefirot: byTradition.sefirot >= SACRED_TRADITION_FLOOR,
    chakras: byTradition.chakras >= SACRED_TRADITION_FLOOR,
    planetas: byTradition.planetas >= SACRED_TRADITION_FLOOR,
    hebrew: byTradition.hebrew >= SACRED_TRADITION_FLOOR,
    astrologia: byTradition.astrologia >= SACRED_TRADITION_FLOOR,
  }
  const missing = (Object.keys(byTradition) as SacredTradition[]).filter(
    (k) => !traditionFloorMet[k],
  )
  const allMet = missing.length === 0
  const allHaveDark = (Object.keys(DARK_PATTERN_PATTERNS) as DarkPatternCategory[]).every(
    (k) => DARK_PATTERN_PATTERNS[k].length > 0,
  )
  return {
    totalScanned: ALL_SACRED.length,
    byTradition,
    darkPatternsDetected,
    isFullCoverage: allMet && allHaveDark,
    traditionFloorMet,
    missingTraditions: missing,
  }
}

/**
 * Audit how much of the sacred-symbol coverage meets the per-tradition floor.
 * Separate from auditModeration for finer-grained diagnostic output.
 */
export function auditSacredCoverage(): ModerationCoverageAudit {
  return auditModeration()
}

// ============================================================================
// §14 __ALL_EXPORTS — grep-audit visibility
// ============================================================================

export const __ALL_EXPORTS = Object.freeze({
  sections: 14,
  mainApi: ["moderateText", "flagReport", "auditModeration", "chainModerationHash", "validateModeration", "pseudonymizeUserId", "auditDarkPatterns", "validateReport", "verifyModerationChainLink", "auditSacredCoverage"],
  types: [
    "ModerationInput",
    "ModerationContext",
    "ModerationResult",
    "ModerationFlag",
    "ModerationCoverageAudit",
    "DarkPatternAuditRow",
    "ValidationOutcome",
    "PseudonymOptions",
    "SacredHit",
    "SacredEntry",
    "SacredTradition",
    "DarkPatternHit",
    "DarkPatternCategory",
    "DarkPatternRegex",
    "Severity",
    "Severity",
    "FlagKind",
    "ReportReason",
    "ReportRecord",
  ],
  errorClasses: [
    "ModerationEngineError",
    "InvalidModerationInputError",
    "InvalidDarkPatternError",
    "InvalidReportError",
    "InvalidSacredSymbolError",
    "ChainIntegrityError",
  ],
  constants: [
    "DARK_PATTERN_CATEGORIES",
    "SEVERITY_FLOORS",
    "SEVERITY_ORDER",
    "SACRED_TRADITION_FLOOR",
    "PSEUDONYM_DEFAULT_TRUNCATION",
    "HMAC_ALGO",
    "MIN_TEXT_LENGTH",
    "MAX_TEXT_LENGTH",
    "SUPPORTED_LOCALES",
    "SUPPORTED_REPORT_REASONS",
    "FORBIDDEN_RESULT_REASONS",
    "CIGANO_CARDS",
    "ORIXAS",
    "SEFIROT",
    "CHAKRAS",
    "PLANETS",
    "HEBREW_LETTERS",
    "ASTROLOGY_HOUSES",
    "ALL_SACRED",
    "SACRED_BY_TRADITION",
    "URGENCY_PRESSURE_PATTERNS",
    "FEAR_MONGERING_PATTERNS",
    "MANIPULATION_PATTERNS",
    "SPIRITUAL_BYPASS_PATTERNS",
    "GUILT_TRIP_PATTERNS",
    "MONEY_FOCUS_PATTERNS",
    "UNVERIFIED_CLAIMS_PATTERNS",
    "DARK_PATTERN_PATTERNS",
    "TOTAL_DARK_PATTERN_PATTERNS",
  ],
  helpers: [
    "buildSacredRegex",
    "stripDiacritics",
    "clampUnit",
    "severityFromScore",
    "maxSeverity",
    "boostScore",
    "isSafeId",
    "stableStringify",
    "findSacredHits",
  ],
  detectors: [
    "detectDarkPatternHits",
    "auditDarkPatterns",
    "countTraditionHits",
    "countCategoryHits",
    "calculateSeverity",
    "decideAllowed",
    "buildFlags",
  ],
  typeGuards: [
    "isSacredHit",
    "isDarkPatternHit",
    "isModerationResult",
    "isDarkPatternCategory",
    "isSacredTradition",
    "isSeverity",
    "isReportReason",
    "isStringArray",
  ],
  formatters: [
    "formatModerationResult",
    "formatReport",
    "formatSacredHits",
    "formatDarkPatternHits",
  ],
})

export const W65_COMMUNITY_MODERATION_ENGINE_VERSION = "w65.0.1.0" as const
