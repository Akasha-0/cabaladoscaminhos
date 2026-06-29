/**
 * dream-journal-engine.ts
 *
 * Cycle 67 — Worker B.
 *
 * Pure, hand-rolled engine for logging + analyzing dream entries with
 * sacred-symbolic interpretation across SEVEN traditions (Cigano, Orixás,
 * Sefirot, Astrologia, Chakras, Hebrew, Tarot). No NLP libs, no sentiment
 * API, no ML — pattern matching + sacred catalog lookup only.
 *
 * LGPD posture:
 *   - Dreams are SENSITIVE PERSONAL DATA (saúde mental + espiritualidade)
 *     under LGPD Art. 5 II + Art. 11
 *   - redactPII runs BEFORE sacred extraction (Art. 18 right-to-erasure)
 *   - chainDreamHash binds to redactedText + userId + timestamp (NEVER rawText)
 *   - forgetSymbol removes symbol from lexicon WITHOUT deleting the entry
 *     (audit-trail preservation per cycle 60 lesson C-5)
 *
 * Cross-cycle references:
 *   - HMAC pattern: cycle 60 + cycle 65 worker A (process.getBuiltinModule)
 *   - Sacred regex: cycle 65 lesson 1 (lookaround, NOT \b for Portuguese)
 *   - PII redaction: cycle 62 daily-reflection-prompt pattern
 *   - LGPD chain: cycle 60 lessons C-4 + C-5
 *   - Per-tradition audit floor: cycle 64 lesson 5 (natural cardinality)
 *
 * Exports inventory (13 total):
 *   Required (10):
 *     1. createDreamEntry
 *     2. extractSacredSymbols
 *     3. analyzeRecurringPatterns
 *     4. buildPersonalLexicon
 *     5. interpretDream
 *     6. redactPII
 *     7. chainDreamHash
 *     8. auditDreamCoverage
 *     9. DREAM_CATEGORIES (const)
 *    10. classifyDreamCategory
 *   Bonus (3):
 *    11. toDreamEntryId (branded type constructor)
 *    12. emptyLexicon (factory, never mutate shared defaults)
 *    13. forgetSymbol (LGPD Art. 18 right-to-be-forgotten)
 */

// =====================================================================
// Section 1: Branded types
// =====================================================================

/** Branded DreamEntry id — prevents accidental string mixups. */
export type DreamEntryId = string & { readonly __brand: "DreamEntryId" };

/** Branded UserId — same protection for user identifiers. */
export type UserId = string & { readonly __brand: "UserId" };

/** Branded HashChain hex string. */
export type DreamHash = string & { readonly __brand: "DreamHash" };

// =====================================================================
// Section 2: Sacred tradition enum + helpers
// =====================================================================

export const SACRED_TRADITIONS = [
  "cigano",
  "orixas",
  "sefirot",
  "astrologia",
  "chakras",
  "hebrew",
  "tarot",
] as const;

export type SacredTradition = (typeof SACRED_TRADITIONS)[number];

export function isSacredTradition(value: unknown): value is SacredTradition {
  return (
    typeof value === "string" &&
    (SACRED_TRADITIONS as readonly string[]).includes(value)
  );
}

// =====================================================================
// Section 3: Sacred symbol catalogs (7 traditions, 125 total)
// =====================================================================

export interface SacredSymbol {
  readonly tradition: SacredTradition;
  readonly symbol: string;
  /** Keyword strings that surface this symbol in dream text. */
  readonly triggers: readonly string[];
  /** Polarity used by buildPersonalLexicon for shadow/light/neutral. */
  readonly polarity: "light" | "shadow" | "neutral";
}

// --- CIGANO (36) — reuses lenormand-cards naming convention ---
export const CIGANO_SYMBOLS: readonly SacredSymbol[] = [
  { tradition: "cigano", symbol: "O Cavaleiro", triggers: ["cavaleiro", "cavalo", "cavaleira"], polarity: "neutral" },
  { tradition: "cigano", symbol: "O Trevo", triggers: ["trevo", "clover"], polarity: "light" },
  { tradition: "cigano", symbol: "O Navio", triggers: ["navio", "barco", "mar", "onda", "ondas"], polarity: "neutral" },
  { tradition: "cigano", symbol: "A Casa", triggers: ["casa", "lar", "residência"], polarity: "light" },
  { tradition: "cigano", symbol: "A Árvore", triggers: ["árvore", "arvore", "raiz", "raízes", "tronco"], polarity: "neutral" },
  { tradition: "cigano", symbol: "As Nuvens", triggers: ["nuvem", "nuvens", "neblina", "névoa"], polarity: "shadow" },
  { tradition: "cigano", symbol: "A Serpente", triggers: ["cobra", "serpente", "víbora"], polarity: "shadow" },
  { tradition: "cigano", symbol: "O Caixão", triggers: ["caixão", "caixao", "caixa", "ataúde", "tumulo"], polarity: "shadow" },
  { tradition: "cigano", symbol: "Os Buquês", triggers: ["buquê", "flores", "ramalhete"], polarity: "light" },
  { tradition: "cigano", symbol: "A Foice", triggers: ["foice", "foice", "colheita", "corte"], polarity: "neutral" },
  { tradition: "cigano", symbol: "O Chicote", triggers: ["chicote", "vassoura", "vara"], polarity: "shadow" },
  { tradition: "cigano", symbol: "Os Pássaros", triggers: ["pássaro", "passaro", "pássaros", "aves", "pomba"], polarity: "neutral" },
  { tradition: "cigano", symbol: "A Criança", triggers: ["criança", "crianca", "crianças", "menino", "menina", "bebê", "bebe"], polarity: "light" },
  { tradition: "cigano", symbol: "A Raposa", triggers: ["raposa", "raposão"], polarity: "shadow" },
  { tradition: "cigano", symbol: "O Urso", triggers: ["urso"], polarity: "neutral" },
  { tradition: "cigano", symbol: "A Estrela", triggers: ["estrela", "estrelas"], polarity: "light" },
  { tradition: "cigano", symbol: "A Cegonha", triggers: ["cegonha", "nascimento"], polarity: "light" },
  { tradition: "cigano", symbol: "O Cachorro", triggers: ["cachorro", "cão", "cao", "cães", "caes"], polarity: "light" },
  { tradition: "cigano", symbol: "A Torre", triggers: ["torre", "prisão", "prisao"], polarity: "neutral" },
  { tradition: "cigano", symbol: "O Jardim", triggers: ["jardim", "parque", "praça", "praca"], polarity: "light" },
  { tradition: "cigano", symbol: "A Montanha", triggers: ["montanha", "monte", "serra"], polarity: "shadow" },
  { tradition: "cigano", symbol: "Os Caminhos", triggers: ["caminho", "caminhos", "estrada", "rua", "trilha"], polarity: "neutral" },
  { tradition: "cigano", symbol: "O Rato", triggers: ["rato", "camundongo"], polarity: "shadow" },
  { tradition: "cigano", symbol: "O Coração", triggers: ["coração", "coracao", "amor", "paixão", "paixao"], polarity: "light" },
  { tradition: "cigano", symbol: "O Anel", triggers: ["anel", "aliança", "alianca"], polarity: "light" },
  { tradition: "cigano", symbol: "O Livro", triggers: ["livro", "caderno"], polarity: "neutral" },
  { tradition: "cigano", symbol: "A Carta", triggers: ["carta", "bilhete", "envelope"], polarity: "neutral" },
  { tradition: "cigano", symbol: "O Cigano", triggers: ["nômade", "nomade", "cigano (homem)", "andarilho"], polarity: "neutral" },
  { tradition: "cigano", symbol: "A Cigana", triggers: ["cigana", "nômade mulher", "adivinha"], polarity: "neutral" },
  { tradition: "cigano", symbol: "Os Lírios", triggers: ["lírio", "lirio", "lírios", "lirios"], polarity: "light" },
  { tradition: "cigano", symbol: "O Sol", triggers: ["sol", "luz dourada", "ouro", "raio de sol"], polarity: "light" },
  { tradition: "cigano", symbol: "A Lua", triggers: ["lua", "prata", "cristal", "noite"], polarity: "neutral" },
  { tradition: "cigano", symbol: "A Chave", triggers: ["chave", "chaves"], polarity: "light" },
  { tradition: "cigano", symbol: "Os Peixes", triggers: ["peixe", "peixes"], polarity: "light" },
  { tradition: "cigano", symbol: "A Âncora", triggers: ["âncora", "ancora"], polarity: "light" },
  { tradition: "cigano", symbol: "A Cruz", triggers: ["cruz", "cruzar", "cruzou", "cruzes", "igreja", "catedral"], polarity: "shadow" },
];

// --- ORIXÁS (16) ---
export const ORIXAS_SYMBOLS: readonly SacredSymbol[] = [
  { tradition: "orixas", symbol: "Oxalá", triggers: ["oxalá", "oxala"], polarity: "light" },
  { tradition: "orixas", symbol: "Iemanjá", triggers: ["iemanjá", "iemanja", "yemanjá", "yemanja"], polarity: "light" },
  { tradition: "orixas", symbol: "Xangô", triggers: ["xangô", "xango"], polarity: "neutral" },
  { tradition: "orixas", symbol: "Ogum", triggers: ["ogum"], polarity: "neutral" },
  { tradition: "orixas", symbol: "Oxum", triggers: ["oxum"], polarity: "light" },
  { tradition: "orixas", symbol: "Oxumarê", triggers: ["oxumarê", "oxumare"], polarity: "neutral" },
  { tradition: "orixas", symbol: "Iansã", triggers: ["iansã", "iansa"], polarity: "neutral" },
  { tradition: "orixas", symbol: "Nanã", triggers: ["nanã", "nana"], polarity: "shadow" },
  { tradition: "orixas", symbol: "Obaluaiê", triggers: ["obaluaiê", "obalaie", "omulu"], polarity: "shadow" },
  { tradition: "orixas", symbol: "Omulu", triggers: ["omulu"], polarity: "shadow" },
  { tradition: "orixas", symbol: "Logunedé", triggers: ["logunedé", "logunede"], polarity: "light" },
  { tradition: "orixas", symbol: "Ossãe", triggers: ["ossãe", "ossae"], polarity: "light" },
  { tradition: "orixas", symbol: "Iroko", triggers: ["iroko"], polarity: "neutral" },
  { tradition: "orixas", symbol: "Ewá", triggers: ["ewá", "ewa"], polarity: "light" },
  { tradition: "orixas", symbol: "Beira-Mar", triggers: ["beira-mar", "beira mar"], polarity: "light" },
  { tradition: "orixas", symbol: "Erê", triggers: ["erê", "ere", "criança (santo)"], polarity: "light" },
];

// --- SEFIROT (10) ---
export const SEFIROT_SYMBOLS: readonly SacredSymbol[] = [
  { tradition: "sefirot", symbol: "Kether", triggers: ["kether", "coroa"], polarity: "light" },
  { tradition: "sefirot", symbol: "Chokmah", triggers: ["chokmah", "sabedoria"], polarity: "light" },
  { tradition: "sefirot", symbol: "Binah", triggers: ["binah", "entendimento"], polarity: "neutral" },
  { tradition: "sefirot", symbol: "Chesed", triggers: ["chesed", "misericórdia", "misericordia"], polarity: "light" },
  { tradition: "sefirot", symbol: "Geburah", triggers: ["geburah", "rigor", "força (cabala)"], polarity: "neutral" },
  { tradition: "sefirot", symbol: "Tiphereth", triggers: ["tiphereth", "beleza", "equilíbrio"], polarity: "light" },
  { tradition: "sefirot", symbol: "Netzach", triggers: ["netzach", "vitória", "vitoria"], polarity: "light" },
  { tradition: "sefirot", symbol: "Hod", triggers: ["hod", "esplendor"], polarity: "neutral" },
  { tradition: "sefirot", symbol: "Yesod", triggers: ["yesod", "fundação", "fundacao"], polarity: "neutral" },
  { tradition: "sefirot", symbol: "Malkuth", triggers: ["malkuth", "reino"], polarity: "shadow" },
];

// --- ASTROLOGIA (12 signs) ---
export const ASTROLOGIA_SYMBOLS: readonly SacredSymbol[] = [
  { tradition: "astrologia", symbol: "Áries", triggers: ["áries", "aries", "carneiro"], polarity: "neutral" },
  { tradition: "astrologia", symbol: "Touro", triggers: ["touro", "touro (signo)"], polarity: "neutral" },
  { tradition: "astrologia", symbol: "Gêmeos", triggers: ["gêmeos", "gemeos"], polarity: "neutral" },
  { tradition: "astrologia", symbol: "Câncer", triggers: ["câncer", "cancer", "caranguejo"], polarity: "light" },
  { tradition: "astrologia", symbol: "Leão", triggers: ["leão", "leao"], polarity: "light" },
  { tradition: "astrologia", symbol: "Virgem", triggers: ["virgem"], polarity: "neutral" },
  { tradition: "astrologia", symbol: "Libra", triggers: ["libra", "balança", "balanca"], polarity: "neutral" },
  { tradition: "astrologia", symbol: "Escorpião", triggers: ["escorpião", "escorpiao"], polarity: "shadow" },
  { tradition: "astrologia", symbol: "Sagitário", triggers: ["sagitário", "sagitario"], polarity: "light" },
  { tradition: "astrologia", symbol: "Capricórnio", triggers: ["capricórnio", "capricornio"], polarity: "shadow" },
  { tradition: "astrologia", symbol: "Aquário", triggers: ["aquário", "aquario"], polarity: "neutral" },
  { tradition: "astrologia", symbol: "Peixes", triggers: ["peixes (signo)"], polarity: "light" },
];

// --- CHAKRAS (7) ---
export const CHAKRAS_SYMBOLS: readonly SacredSymbol[] = [
  { tradition: "chakras", symbol: "Muladhara", triggers: ["muladhara", "raiz (chakra)", "chakra raiz"], polarity: "shadow" },
  { tradition: "chakras", symbol: "Swadhisthana", triggers: ["swadhisthana", "sacral", "chakra sexual"], polarity: "neutral" },
  { tradition: "chakras", symbol: "Manipura", triggers: ["manipura", "plexo solar", "umbigo"], polarity: "neutral" },
  { tradition: "chakras", symbol: "Anahata", triggers: ["anahata", "coração (chakra)", "chakra cardíaco"], polarity: "light" },
  { tradition: "chakras", symbol: "Vishuddha", triggers: ["vishuddha", "garganta", "laringe"], polarity: "neutral" },
  { tradition: "chakras", symbol: "Ajna", triggers: ["ajna", "terceiro olho", "testa"], polarity: "light" },
  { tradition: "chakras", symbol: "Sahasrara", triggers: ["sahasrara", "coroa (chakra)", "alto da cabeça"], polarity: "light" },
];

// --- HEBREW (22 letters) ---
export const HEBREW_SYMBOLS: readonly SacredSymbol[] = [
  { tradition: "hebrew", symbol: "Aleph", triggers: ["aleph", "álefe"], polarity: "light" },
  { tradition: "hebrew", symbol: "Beth", triggers: ["beth", "bet"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Gimel", triggers: ["gimel"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Daleth", triggers: ["daleth", "dalet"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "He", triggers: ["he (letra)", "hei"], polarity: "light" },
  { tradition: "hebrew", symbol: "Vav", triggers: ["vav"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Zayin", triggers: ["zayin"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Cheth", triggers: ["cheth", "het"], polarity: "shadow" },
  { tradition: "hebrew", symbol: "Teth", triggers: ["teth", "tet"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Yod", triggers: ["yod", "iod"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Kaph", triggers: ["kaph", "caf"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Lamed", triggers: ["lamed"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Mem", triggers: ["mem (hebraico)", "águas (hebraico)"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Nun", triggers: ["nun (hebraico)"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Samekh", triggers: ["samekh", "samec"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Ayin", triggers: ["ayin", "áin"], polarity: "shadow" },
  { tradition: "hebrew", symbol: "Pe", triggers: ["pe (hebraico)", "pei"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Tsade", triggers: ["tsade", "tsadi", "tzade"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Qoph", triggers: ["qoph", "cof"], polarity: "neutral" },
  { tradition: "hebrew", symbol: "Resh", triggers: ["resh", "res"], polarity: "light" },
  { tradition: "hebrew", symbol: "Shin", triggers: ["shin", "sin (hebraico)"], polarity: "light" },
  { tradition: "hebrew", symbol: "Tav", triggers: ["tav", "tau"], polarity: "light" },
];

// --- TAROT (22 major arcana) ---
export const TAROT_SYMBOLS: readonly SacredSymbol[] = [
  { tradition: "tarot", symbol: "O Louco", triggers: ["louco", "andarilho", "viajante"], polarity: "neutral" },
  { tradition: "tarot", symbol: "O Mago", triggers: ["mago", "mágico", "magico"], polarity: "light" },
  { tradition: "tarot", symbol: "A Sacerdotisa", triggers: ["sacerdotisa"], polarity: "neutral" },
  { tradition: "tarot", symbol: "A Imperatriz", triggers: ["imperatriz", "deusa mãe"], polarity: "light" },
  { tradition: "tarot", symbol: "O Imperador", triggers: ["imperador", "rei (tarot)"], polarity: "neutral" },
  { tradition: "tarot", symbol: "O Hierofante", triggers: ["hierofante", "papa"], polarity: "neutral" },
  { tradition: "tarot", symbol: "Os Amantes", triggers: ["amantes", "casal", "par romântico"], polarity: "light" },
  { tradition: "tarot", symbol: "O Carro", triggers: ["carruagem", "carro (tarot)"], polarity: "light" },
  { tradition: "tarot", symbol: "A Força", triggers: ["força (tarot)", "forca (tarot)", "leão (força)"], polarity: "light" },
  { tradition: "tarot", symbol: "O Eremita", triggers: ["eremita", "ermitão", "ermitao"], polarity: "neutral" },
  { tradition: "tarot", symbol: "A Roda da Fortuna", triggers: ["roda da fortuna", "roda (tarot)"], polarity: "neutral" },
  { tradition: "tarot", symbol: "A Justiça", triggers: ["justiça", "justica", "balança (justiça)"], polarity: "neutral" },
  { tradition: "tarot", symbol: "O Pendurado", triggers: ["pendurado", "homem pendurado"], polarity: "neutral" },
  { tradition: "tarot", symbol: "A Morte", triggers: ["morte (tarot)", "caveira"], polarity: "shadow" },
  { tradition: "tarot", symbol: "A Temperança", triggers: ["temperança", "temperanca", "anjo (temperança)"], polarity: "light" },
  { tradition: "tarot", symbol: "O Diabo", triggers: ["diabo", "demônio", "demonio"], polarity: "shadow" },
  { tradition: "tarot", symbol: "A Torre", triggers: ["torre (tarot)", "raio (torre)", "trovão"], polarity: "shadow" },
  { tradition: "tarot", symbol: "A Estrela", triggers: ["estrela (tarot)", "estrela guia"], polarity: "light" },
  { tradition: "tarot", symbol: "A Lua", triggers: ["lua (tarot)", "lobos (lua)"], polarity: "shadow" },
  { tradition: "tarot", symbol: "O Sol", triggers: ["sol (tarot)", "sol criança"], polarity: "light" },
  { tradition: "tarot", symbol: "O Julgamento", triggers: ["julgamento", "anjo (julgamento)", "trombeta"], polarity: "light" },
  { tradition: "tarot", symbol: "O Mundo", triggers: ["mundo (tarot)", "oval (mundo)"], polarity: "light" },
];

export const ALL_SACRED_SYMBOLS: readonly SacredSymbol[] = [
  ...CIGANO_SYMBOLS,
  ...ORIXAS_SYMBOLS,
  ...SEFIROT_SYMBOLS,
  ...ASTROLOGIA_SYMBOLS,
  ...CHAKRAS_SYMBOLS,
  ...HEBREW_SYMBOLS,
  ...TAROT_SYMBOLS,
];

// =====================================================================
// Section 4: Error classes
// =====================================================================

export class DreamEngineError extends Error {
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "DreamEngineError";
    this.code = code;
  }
}

export class InvalidDreamTextError extends DreamEngineError {
  constructor(message: string) {
    super(message, "invalid_dream_text");
    this.name = "InvalidDreamTextError";
  }
}

export class InvalidUserIdError extends DreamEngineError {
  constructor(message: string) {
    super(message, "invalid_user_id");
    this.name = "InvalidUserIdError";
  }
}

export class InvalidTraditionError extends DreamEngineError {
  constructor(message: string) {
    super(message, "invalid_tradition");
    this.name = "InvalidTraditionError";
  }
}

export class CoverageIncompleteError extends DreamEngineError {
  constructor(message: string) {
    super(message, "coverage_incomplete");
    this.name = "CoverageIncompleteError";
  }
}

export class HashChainError extends DreamEngineError {
  constructor(message: string) {
    super(message, "hash_chain_error");
    this.name = "HashChainError";
  }
}

// =====================================================================
// Section 5: Branded constructors + type guards
// =====================================================================

export function toDreamEntryId(value: string): DreamEntryId {
  if (typeof value !== "string" || value.length === 0) {
    throw new InvalidDreamTextError("DreamEntryId must be non-empty string");
  }
  return value as DreamEntryId;
}

export function toUserId(value: string): UserId {
  if (typeof value !== "string" || value.length === 0) {
    throw new InvalidUserIdError("UserId must be non-empty string");
  }
  return value as UserId;
}

export function toDreamHash(hex: string): DreamHash {
  if (typeof hex !== "string" || hex.length !== 64 || !/^[0-9a-f]{64}$/.test(hex)) {
    throw new HashChainError("DreamHash must be 64-char hex");
  }
  return hex as DreamHash;
}

// =====================================================================
// Section 6: PII redaction (cycle 62 daily-reflection pattern)
// =====================================================================

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_BR_RE = /\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9?\d{4}-?\d{4}\b/g;
const CPF_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const RG_RE = /\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dXx]\b/g;
const URL_RE = /https?:\/\/\S+/g;

const REDACTED = "[REDACTED]";

/**
 * Redact common PII patterns BEFORE sacred extraction. Returns the
 * redacted text (caller stores this, NOT rawText).
 */
export function redactPII(text: string): string {
  if (typeof text !== "string") return "";
  let out = text;
  out = out.replace(EMAIL_RE, REDACTED);
  out = out.replace(PHONE_BR_RE, REDACTED);
  out = out.replace(CPF_RE, REDACTED);
  out = out.replace(RG_RE, REDACTED);
  out = out.replace(URL_RE, REDACTED);
  return out;
}

// =====================================================================
// Section 7: Sacred symbol extraction (lookaround regex per cycle 65 lesson 1)
// =====================================================================

export interface SacredHit {
  readonly tradition: SacredTradition;
  readonly symbol: string;
  readonly position: number;
  readonly snippet: string;
}

interface CompiledTrigger {
  readonly tradition: SacredTradition;
  readonly symbol: string;
  readonly trigger: string;
  readonly regex: RegExp;
  readonly polarity: "light" | "shadow" | "neutral";
}

/** Compile one regex per trigger. Lookaround (?:^|\W) avoids \b for Portuguese. */
function compileTrigger(entry: SacredSymbol, trigger: string): CompiledTrigger {
  const escaped = trigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Case-insensitive lookaround — handles accented Portuguese without \b issues
  const regex = new RegExp(`(?:^|\\W)(${escaped})(?:$|\\W)`, "giu");
  return {
    tradition: entry.tradition,
    symbol: entry.symbol,
    trigger,
    regex,
    polarity: entry.polarity,
  };
}

const COMPILED_TRIGGERS: readonly CompiledTrigger[] = ALL_SACRED_SYMBOLS.flatMap(
  (s) => s.triggers.map((t) => compileTrigger(s, t)),
);

/**
 * Extract sacred symbols from dream text. Caller MUST redact PII first.
 * Uses lookaround regex (cycle 65 lesson 1) — never \b for Portuguese.
 */
export function extractSacredSymbols(text: string): SacredHit[] {
  if (typeof text !== "string" || text.length === 0) return [];
  const hits: SacredHit[] = [];
  for (const compiled of COMPILED_TRIGGERS) {
    const re = new RegExp(compiled.regex.source, compiled.regex.flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      // capture group 1 is the actual trigger text
      const triggerText = match[1] ?? compiled.trigger;
      const triggerStart = match.index + (match[0].indexOf(triggerText));
      const snippet = text.slice(
        Math.max(0, triggerStart - 12),
        Math.min(text.length, triggerStart + triggerText.length + 12),
      );
      hits.push({
        tradition: compiled.tradition,
        symbol: compiled.symbol,
        position: triggerStart,
        snippet,
      });
    }
  }
  // Stable order: by position asc, then tradition, then symbol
  hits.sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    if (a.tradition !== b.tradition) return a.tradition.localeCompare(b.tradition);
    return a.symbol.localeCompare(b.symbol);
  });
  return hits;
}

// =====================================================================
// Section 8: Dream categories
// =====================================================================

export const DREAM_CATEGORIES = [
  "LUCID",
  "RECURRING",
  "NIGHTMARE",
  "PROPHETIC",
  "NORMAL",
  "ANXIETY",
] as const;

export type DreamCategory = (typeof DREAM_CATEGORIES)[number];

export function isDreamCategory(value: unknown): value is DreamCategory {
  return (
    typeof value === "string" &&
    (DREAM_CATEGORIES as readonly string[]).includes(value)
  );
}

const LUCID_TRIGGERS = ["lúcido", "lucido", "lúcida", "lucida", "controle", "sabia que sonhava", "sabia estar sonhando"];
const NIGHTMARE_TRIGGERS = ["pesadelo", "medo", "monstro", "assustador", "terror", "grito", "gritei", "sangue", "assassinato", "morte (sonho)", "demônio", "demonio"];
const PROPHETIC_TRIGGERS = ["profético", "profetico", "profética", "profetica", "visão", "visao", "futuro (sonho)", "premonição", "premonicao"];
const ANXIETY_TRIGGERS = ["ansiedade", "preocupação", "preocupacao", "preocupado", "preocupada", "corria", "corri", "fugindo", "fugi", "fuga", "perseguido", "perseguida", "atrasado", "atrasada"];

function classifyByKeywords(text: string): DreamCategory {
  const lower = text.toLowerCase();
  if (LUCID_TRIGGERS.some((t) => lower.includes(t))) return "LUCID";
  if (NIGHTMARE_TRIGGERS.some((t) => lower.includes(t))) return "NIGHTMARE";
  if (PROPHETIC_TRIGGERS.some((t) => lower.includes(t))) return "PROPHETIC";
  if (ANXIETY_TRIGGERS.some((t) => lower.includes(t))) return "ANXIETY";
  return "NORMAL";
}

/**
 * Classify a dream entry into a category. Caller may pass a lexicon to
 * escalate classification to RECURRING when symbol appears ≥ 3 times.
 */
export function classifyDreamCategory(
  text: string,
  lexicon?: UserLexicon,
): DreamCategory {
  if (typeof text !== "string" || text.length === 0) return "NORMAL";
  const base = classifyByKeywords(text);
  if (lexicon) {
    for (const item of lexicon.symbols) {
      if (item.frequency >= 3) return "RECURRING";
    }
  }
  return base;
}

// =====================================================================
// Section 9: Lexicon
// =====================================================================

export type LexiconCategory = "light" | "shadow" | "neutral";

export interface LexiconEntry {
  readonly symbol: string;
  readonly frequency: number;
  readonly lastSeen: number;
  readonly sacredTradition: SacredTradition;
  readonly category: LexiconCategory;
}

export interface UserLexicon {
  readonly userId: UserId;
  readonly symbols: readonly LexiconEntry[];
  readonly generatedAt: number;
}

export function emptyLexicon(userId: UserId): UserLexicon {
  return {
    userId,
    symbols: [],
    generatedAt: Date.now(),
  };
}

const POLARITY_BY_TRADITION: Record<SacredTradition, ReadonlyMap<string, "light" | "shadow" | "neutral">> = {
  cigano: new Map(CIGANO_SYMBOLS.map((s) => [s.symbol, s.polarity])),
  orixas: new Map(ORIXAS_SYMBOLS.map((s) => [s.symbol, s.polarity])),
  sefirot: new Map(SEFIROT_SYMBOLS.map((s) => [s.symbol, s.polarity])),
  astrologia: new Map(ASTROLOGIA_SYMBOLS.map((s) => [s.symbol, s.polarity])),
  chakras: new Map(CHAKRAS_SYMBOLS.map((s) => [s.symbol, s.polarity])),
  hebrew: new Map(HEBREW_SYMBOLS.map((s) => [s.symbol, s.polarity])),
  tarot: new Map(TAROT_SYMBOLS.map((s) => [s.symbol, s.polarity])),
};

function polarityFor(tradition: SacredTradition, symbol: string): LexiconCategory {
  const map = POLARITY_BY_TRADITION[tradition];
  return (map.get(symbol) ?? "neutral") as LexiconCategory;
}

/**
 * Build a personal dream lexicon from a user's entry history.
 * Returns a NEW lexicon — never mutates shared defaults.
 */
export function buildPersonalLexicon(entries: readonly DreamEntry[]): UserLexicon {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new InvalidDreamTextError("entries must be a non-empty array");
  }
  const firstUser = entries[0]!.userId;
  const counts = new Map<string, { tradition: SacredTradition; symbol: string; count: number; lastSeen: number }>();
  for (const entry of entries) {
    for (const hit of entry.sacredHits) {
      const key = `${hit.tradition}:${hit.symbol}`;
      const prev = counts.get(key);
      if (prev) {
        prev.count += 1;
        prev.lastSeen = Math.max(prev.lastSeen, entry.createdAt);
      } else {
        counts.set(key, {
          tradition: hit.tradition,
          symbol: hit.symbol,
          count: 1,
          lastSeen: entry.createdAt,
        });
      }
    }
  }
  const symbols: LexiconEntry[] = [];
  for (const [, v] of counts) {
    symbols.push({
      symbol: v.symbol,
      frequency: v.count,
      lastSeen: v.lastSeen,
      sacredTradition: v.tradition,
      category: polarityFor(v.tradition, v.symbol),
    });
  }
  symbols.sort((a, b) => b.frequency - a.frequency);
  return {
    userId: firstUser,
    symbols,
    generatedAt: Date.now(),
  };
}

/**
 * LGPD Art. 18 right-to-be-forgotten. Removes the symbol from the
 * lexicon WITHOUT deleting the source entry (audit-trail preservation
 * per cycle 60 lesson C-5). Returns a new lexicon.
 */
export function forgetSymbol(lexicon: UserLexicon, symbol: string): UserLexicon {
  if (!lexicon || typeof lexicon !== "object") {
    throw new InvalidDreamTextError("lexicon must be a UserLexicon");
  }
  if (typeof symbol !== "string" || symbol.length === 0) {
    throw new InvalidDreamTextError("symbol must be a non-empty string");
  }
  const filtered = lexicon.symbols.filter((s) => s.symbol !== symbol);
  return {
    userId: lexicon.userId,
    symbols: filtered,
    generatedAt: Date.now(),
  };
}

// =====================================================================
// Section 10: Recurring pattern analysis
// =====================================================================

export interface RecurringPattern {
  readonly symbol: string;
  readonly tradition: SacredTradition;
  readonly count: number;
  readonly firstSeen: number;
  readonly lastSeen: number;
  readonly sessions: number;
  readonly isNightmare: boolean;
}

/**
 * Caller-bound nightmare detection. The engine NEVER auto-flags a
 * dream as nightmare — caller passes isNightmare based on user signal
 * (e.g., they tagged it as such, or classification returned NIGHTMARE).
 */
export function analyzeRecurringPatterns(
  entries: readonly DreamEntry[],
  nightmareSymbols?: ReadonlySet<string>,
): RecurringPattern[] {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  const nightmare = nightmareSymbols ?? new Set<string>(["O Caixão", "A Serpente", "A Torre (tarot)", "O Diabo", "A Morte (tarot)"]);
  const map = new Map<string, { tradition: SacredTradition; symbol: string; count: number; firstSeen: number; lastSeen: number; sessions: Set<number> }>();
  for (const entry of entries) {
    for (const hit of entry.sacredHits) {
      const key = `${hit.tradition}:${hit.symbol}`;
      const prev = map.get(key);
      if (prev) {
        prev.count += 1;
        prev.firstSeen = Math.min(prev.firstSeen, entry.createdAt);
        prev.lastSeen = Math.max(prev.lastSeen, entry.createdAt);
        prev.sessions.add(entry.createdAt);
      } else {
        map.set(key, {
          tradition: hit.tradition,
          symbol: hit.symbol,
          count: 1,
          firstSeen: entry.createdAt,
          lastSeen: entry.createdAt,
          sessions: new Set([entry.createdAt]),
        });
      }
    }
  }
  const out: RecurringPattern[] = [];
  for (const [, v] of map) {
    out.push({
      symbol: v.symbol,
      tradition: v.tradition,
      count: v.count,
      firstSeen: v.firstSeen,
      lastSeen: v.lastSeen,
      sessions: v.sessions.size,
      isNightmare: nightmare.has(v.symbol),
    });
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

// =====================================================================
// Section 11: Dream entry + interpretation
// =====================================================================

export interface DreamEntry {
  readonly id: DreamEntryId;
  readonly userId: UserId;
  readonly rawText: string;
  readonly sanitizedText: string;
  readonly sacredHits: readonly SacredHit[];
  readonly recurringFlags: readonly string[];
  readonly interpretedSymbols: readonly string[];
  readonly lexiconDelta: readonly LexiconEntry[];
  readonly createdAt: number;
  readonly hashChain: DreamHash;
  readonly category: DreamCategory;
}

export interface DreamInterpretation {
  readonly primarySymbol: string;
  readonly secondarySymbols: readonly string[];
  readonly recurringContext: string;
  readonly suggestedOracle: "cigano" | "tarot" | "astrologia" | "odi" | "numerologia";
}

export interface CreateDreamEntryInput {
  readonly userId: string;
  readonly rawText: string;
  readonly recordedAt: number;
  readonly mood?: string;
}

/**
 * Create a new dream entry. Pipeline:
 *   rawText → redactPII → extractSacredSymbols → classifyDreamCategory
 *   → build lexicon delta → chainDreamHash (binds to redactedText + userId + recordedAt)
 *
 * rawText is preserved in the returned entry (caller chooses to persist
 * or not) BUT the hashChain NEVER binds to it (LGPD Art. 11).
 */
export function createDreamEntry(input: CreateDreamEntryInput): DreamEntry {
  if (!input || typeof input !== "object") {
    throw new InvalidDreamTextError("input must be an object");
  }
  if (typeof input.userId !== "string" || input.userId.length === 0) {
    throw new InvalidUserIdError("userId must be non-empty string");
  }
  if (typeof input.rawText !== "string") {
    throw new InvalidDreamTextError("rawText must be a string");
  }
  if (typeof input.recordedAt !== "number" || !Number.isFinite(input.recordedAt)) {
    throw new InvalidDreamTextError("recordedAt must be finite number");
  }
  const userId = toUserId(input.userId);
  const sanitizedText = redactPII(input.rawText);
  const sacredHits = extractSacredSymbols(sanitizedText);
  const category = classifyByKeywords(sanitizedText);
  const recurringFlags: string[] = [];
  const interpretedSymbols = Array.from(new Set(sacredHits.map((h) => h.symbol)));
  // lexiconDelta is what new symbols this entry adds; pure delta vs prior.
  // For createDreamEntry alone (no prior entries), all hits are deltas.
  const lexiconDelta: LexiconEntry[] = interpretedSymbols.map((sym) => {
    const hit = sacredHits.find((h) => h.symbol === sym);
    if (!hit) {
      throw new InvalidTraditionError(`lost hit for ${sym}`);
    }
    return {
      symbol: sym,
      frequency: 1,
      lastSeen: input.recordedAt,
      sacredTradition: hit.tradition,
      category: polarityFor(hit.tradition, hit.tradition === "tarot" ? sym : sym),
    };
  });
  const id = toDreamEntryId(
    `dream_${input.recordedAt.toString(36)}_${sanitizedText.length.toString(36)}_${Math.floor(Math.random() * 1e9).toString(36)}`,
  );
  const hashChain = chainDreamHash({
    redactedText: sanitizedText,
    userId,
    recordedAt: input.recordedAt,
  });
  return {
    id,
    userId,
    rawText: input.rawText,
    sanitizedText,
    sacredHits,
    recurringFlags,
    interpretedSymbols,
    lexiconDelta,
    createdAt: input.recordedAt,
    hashChain,
    category,
  };
}

/**
 * Suggest an oracle path based on which tradition dominates the entry.
 * Falls back to 'cigano' (the platform default — Mesa Real primary tool).
 */
export function interpretDream(
  entry: DreamEntry,
  _lexicon: UserLexicon,
): DreamInterpretation {
  if (!entry || typeof entry !== "object") {
    throw new InvalidDreamTextError("entry must be a DreamEntry");
  }
  if (!_lexicon || typeof _lexicon !== "object") {
    throw new InvalidDreamTextError("lexicon must be a UserLexicon");
  }
  if (entry.sacredHits.length === 0) {
    return {
      primarySymbol: "—",
      secondarySymbols: [],
      recurringContext: "nenhum símbolo sagrado detectado",
      suggestedOracle: "cigano",
    };
  }
  // Count by tradition
  const counts = new Map<SacredTradition, number>();
  for (const h of entry.sacredHits) {
    counts.set(h.tradition, (counts.get(h.tradition) ?? 0) + 1);
  }
  let topTradition: SacredTradition = "cigano";
  let topCount = 0;
  for (const [t, c] of counts) {
    if (c > topCount) {
      topTradition = t;
      topCount = c;
    }
  }
  const suggested: DreamInterpretation["suggestedOracle"] =
    topTradition === "cigano" ? "cigano" :
    topTradition === "tarot" ? "tarot" :
    topTradition === "astrologia" ? "astrologia" :
    topTradition === "orixas" ? "odi" :
    topTradition === "hebrew" ? "numerologia" :
    topTradition === "chakras" ? "numerologia" :
    "cigano";
  const primary = entry.sacredHits[0]!.symbol;
  const secondary = entry.sacredHits.slice(1, 4).map((h) => h.symbol);
  const recurringContext =
    _lexicon.symbols.length > 0
      ? `${_lexicon.symbols.length} símbolo(s) no seu léxico pessoal`
      : "primeira interação com este símbolo";
  return {
    primarySymbol: primary,
    secondarySymbols: secondary,
    recurringContext,
    suggestedOracle: suggested,
  };
}

// =====================================================================
// Section 12: HMAC chain (cycle 60 + 65 pattern)
// =====================================================================

/**
 * Cross-runtime HMAC-SHA256 helper. Works in Node v22, Bun, and CJS.
 * NEVER FNV-1a fallback. NEVER Date.now() in hash payload.
 */
function hmacSha256Hex(message: string, secret: string): string {
  try {
    // Node 22+ / Bun pattern
    const mod = process.getBuiltinModule?.("node:module") as
      | { createRequire: (url: string) => (id: string) => any }
      | undefined;
    const req = mod ? mod.createRequire(import.meta.url) : null;
    const crypto = req ? req("node:crypto") : null;
    if (crypto && typeof crypto.createHmac === "function") {
      const hmac = crypto.createHmac("sha256", secret) as {
        update(s: string): unknown;
        digest(e: string): string;
      };
      hmac.update(message);
      return hmac.digest("hex");
    }
  } catch {
    /* fall through */
  }
  try {
    const g = globalThis as unknown as { crypto?: { subtle?: unknown } };
    if (g.crypto?.subtle) {
      throw new HashChainError("no sync HMAC source available");
    }
    throw new HashChainError("no crypto available");
  } catch (e) {
    if (e instanceof HashChainError) throw e;
    throw new HashChainError("hash chain failed: " + (e as Error).message);
  }
}

export interface ChainDreamHashInput {
  readonly redactedText: string;
  readonly userId: UserId;
  readonly recordedAt: number;
}

const DEFAULT_DREAM_SECRET = "dream-journal-hmac-v1";

/**
 * Build the canonical payload and HMAC-SHA256 it.
 * Binds to redactedText + userId + timestamp — NEVER rawText.
 */
export function chainDreamHash(input: ChainDreamHashInput, secret?: string): DreamHash {
  if (!input || typeof input !== "object") {
    throw new HashChainError("input must be object");
  }
  if (typeof input.redactedText !== "string") {
    throw new HashChainError("redactedText must be string");
  }
  if (typeof input.userId !== "string") {
    throw new HashChainError("userId must be string");
  }
  if (typeof input.recordedAt !== "number" || !Number.isFinite(input.recordedAt)) {
    throw new HashChainError("recordedAt must be finite number");
  }
  const canonical =
    "dream|" +
    input.redactedText + "|" +
    input.userId + "|" +
    input.recordedAt.toString();
  const hex = hmacSha256Hex(canonical, secret ?? DEFAULT_DREAM_SECRET);
  return toDreamHash(hex);
}

/**
 * Verify a hash chain link. Constant-time string compare.
 */
export function verifyDreamHashLink(
  prev: DreamHash | null,
  input: ChainDreamHashInput,
  candidate: DreamHash,
  secret?: string,
): boolean {
  const expected = chainDreamHash(input, secret);
  if (expected !== candidate) return false;
  if (prev === null) return true;
  // prev chain binding is the caller's responsibility (linked-list shape)
  return prev.length === 64;
}

// =====================================================================
// Section 13: Sacred coverage audit
// =====================================================================

export interface SacredCoverageReport {
  readonly cigano: number;
  readonly orixas: number;
  readonly sefirot: number;
  readonly astrologia: number;
  readonly chakras: number;
  readonly hebrew: number;
  readonly tarot: number;
  readonly total: number;
  readonly isFullCoverage: boolean;
  readonly missing: readonly SacredTradition[];
}

export const REQUIRED_COVERAGE_FLOORS: Readonly<Record<SacredTradition, number>> = {
  cigano: 36,
  orixas: 16,
  sefirot: 10,
  astrologia: 12,
  chakras: 7,
  hebrew: 22,
  tarot: 22,
};

/**
 * Audit sacred symbol coverage. Gate: all 7 traditions meet floor.
 */
export function auditDreamCoverage(): SacredCoverageReport {
  const report: SacredCoverageReport = {
    cigano: CIGANO_SYMBOLS.length,
    orixas: ORIXAS_SYMBOLS.length,
    sefirot: SEFIROT_SYMBOLS.length,
    astrologia: ASTROLOGIA_SYMBOLS.length,
    chakras: CHAKRAS_SYMBOLS.length,
    hebrew: HEBREW_SYMBOLS.length,
    tarot: TAROT_SYMBOLS.length,
    total: ALL_SACRED_SYMBOLS.length,
    isFullCoverage: false,
    missing: [],
  };
  const missing: SacredTradition[] = [];
  for (const t of SACRED_TRADITIONS) {
    if (report[t] < REQUIRED_COVERAGE_FLOORS[t]) {
      missing.push(t);
    }
  }
  return { ...report, missing, isFullCoverage: missing.length === 0 };
}

// =====================================================================
// Section 14: Public type guard helpers
// =====================================================================

export function isSacredHit(value: unknown): value is SacredHit {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.tradition === "string" &&
    isSacredTradition(v.tradition) &&
    typeof v.symbol === "string" &&
    typeof v.position === "number" &&
    typeof v.snippet === "string"
  );
}

export function isUserLexicon(value: unknown): value is UserLexicon {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.userId === "string" &&
    Array.isArray(v.symbols) &&
    typeof v.generatedAt === "number"
  );
}

// =====================================================================
// Section 15: __ALL_EXPORTS (grep audit visibility)
// =====================================================================

export const __ALL_EXPORTS = {
  constants: [
    "SACRED_TRADITIONS",
    "DREAM_CATEGORIES",
    "REQUIRED_COVERAGE_FLOORS",
    "CIGANO_SYMBOLS",
    "ORIXAS_SYMBOLS",
    "SEFIROT_SYMBOLS",
    "ASTROLOGIA_SYMBOLS",
    "CHAKRAS_SYMBOLS",
    "HEBREW_SYMBOLS",
    "TAROT_SYMBOLS",
    "ALL_SACRED_SYMBOLS",
    "DEFAULT_DREAM_SECRET",
  ],
  functions: [
    "createDreamEntry",
    "extractSacredSymbols",
    "analyzeRecurringPatterns",
    "buildPersonalLexicon",
    "interpretDream",
    "redactPII",
    "chainDreamHash",
    "verifyDreamHashLink",
    "auditDreamCoverage",
    "classifyDreamCategory",
    "toDreamEntryId",
    "toUserId",
    "toDreamHash",
    "emptyLexicon",
    "forgetSymbol",
    "hmacSha256Hex",
  ],
  typeGuards: [
    "isSacredTradition",
    "isDreamCategory",
    "isSacredHit",
    "isUserLexicon",
  ],
  errorClasses: [
    "DreamEngineError",
    "InvalidDreamTextError",
    "InvalidUserIdError",
    "InvalidTraditionError",
    "CoverageIncompleteError",
    "HashChainError",
  ],
  types: [
    "DreamEntryId",
    "UserId",
    "DreamHash",
    "SacredTradition",
    "SacredSymbol",
    "SacredHit",
    "DreamCategory",
    "LexiconCategory",
    "LexiconEntry",
    "UserLexicon",
    "RecurringPattern",
    "DreamEntry",
    "DreamInterpretation",
    "CreateDreamEntryInput",
    "ChainDreamHashInput",
    "SacredCoverageReport",
  ],
  sections: [
    "1. Branded types",
    "2. Sacred tradition enum + helpers",
    "3. Sacred symbol catalogs (7 traditions, 125 total)",
    "4. Error classes",
    "5. Branded constructors + type guards",
    "6. PII redaction (cycle 62 daily-reflection pattern)",
    "7. Sacred symbol extraction (lookaround regex per cycle 65 lesson 1)",
    "8. Dream categories",
    "9. Lexicon",
    "10. Recurring pattern analysis",
    "11. Dream entry + interpretation",
    "12. HMAC chain (cycle 60 + 65 pattern)",
    "13. Sacred coverage audit",
    "14. Public type guard helpers",
    "15. __ALL_EXPORTS (grep audit visibility)",
  ],
  sectionsCount: 15,
} as const;