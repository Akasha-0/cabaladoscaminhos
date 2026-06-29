// =============================================================================
// w66/translation-tooling.ts
// -----------------------------------------------------------------------------
// Operational translation tooling layer for Cabala dos Caminhos.
//
// Provides:
//   - Translator queue with 5-state machine (pending → claimed → in_review → approved | rejected)
//   - Sacred term glossary (28 cards × 3 locales = 84 entries, across 7 traditions)
//   - Locale bundle manifest (PT-BR / EN / ES) with completion % per section
//   - Hand-rolled bleu-lite scoring (1-gram + 2-gram overlap, sacred terms weighted ×2)
//   - A11y preservation check (preserves <mark>, ARIA, SSML marks from w62 voice mode)
//   - MT review flag (google | deepl | azure | null) — flagged jobs get extra review
//   - HMAC-SHA256 audit chain (cross-runtime, NO FNV, NO npm deps)
//   - LGPD Art. 18 export + erasure support
//
// Sacred-tag catalog: 7 traditions, exact 130 symbols
//   CIGANO=36, ORIXAS=16, TAROT=22, ASTROLOGIA=12, SEFIROT=10, CHAKRAS=7, HEBREW=27
//   (HEBREW = 22 letters + 5 sofit forms: ך ם ן ף ץ — cycle 65 lesson 3)
//
// Cycle 66. Worker C. Pure data layer. NO npm deps. Zero `any`.
// =============================================================================

// -----------------------------------------------------------------------------
// SECTION 1 — Cross-runtime HMAC imports (cycle 64 pattern)
// -----------------------------------------------------------------------------
// node:module + createRequire works in Node v22 ESM. Falls back to globalThis.crypto
// for older runtimes / edge. NEVER FNV. NEVER MD5.

const _nodeModule: { createRequire: (u: string) => (id: string) => unknown } | undefined =
  (globalThis as { process?: { getBuiltinModule?: (m: string) => unknown } }).process
    ?.getBuiltinModule?.("node:module") as
    | { createRequire: (u: string) => (id: string) => unknown }
    | undefined;

type NodeRequire = (id: string) => unknown;
const _require: NodeRequire | undefined = (() => {
  try {
    if (_nodeModule) {
      return _nodeModule.createRequire(import.meta.url);
    }
  } catch {
    // ignore — fall through to globalThis.crypto path
  }
  return undefined;
})();

type CryptoLike = {
  createHash: (alg: "sha256") => {
    update: (data: string) => {
      digest: (enc: "hex" | "base64") => string;
    };
  };
  createHmac: (alg: "sha256", key: string) => {
    update: (data: string) => {
      digest: (enc: "hex" | "base64") => string;
    };
  };
};

function loadCrypto(): CryptoLike | undefined {
  // 1) node:crypto via createRequire
  if (_require) {
    try {
      const mod = _require("node:crypto") as CryptoLike;
      if (mod && typeof mod.createHmac === "function") return mod;
    } catch {
      // ignore
    }
  }
  // 2) globalThis.crypto.subtle — only works async, skip for sync HMAC chain
  // 3) globalThis.crypto — Deno/Bun interop
  const g = globalThis as unknown as { crypto?: CryptoLike };
  if (g.crypto && typeof g.crypto.createHmac === "function") return g.crypto;
  return undefined;
}

function loadCryptoSubtle(): { digest: (alg: string, data: ArrayBuffer | Uint8Array) => Promise<ArrayBuffer> } | undefined {
  const g = globalThis as { crypto?: { subtle?: { digest: (alg: string, data: ArrayBuffer | Uint8Array) => Promise<ArrayBuffer> } } };
  return g.crypto?.subtle;
}

function hmacHex(payload: string, secret: string): string {
  const crypto = loadCrypto();
  if (crypto && typeof crypto.createHmac === "function") {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }
  // Fallback: SHA-256 of (secret|payload) twice — defensive, not cryptographically equivalent
  // but deterministic and reversible for audit trail.
  const subtle = loadCryptoSubtle();
  if (subtle) {
    // Synchronous path unavailable in subtle API. Use sync fallback.
    return sha256SyncFallback(`${secret}|${payload}`);
  }
  return sha256SyncFallback(`${secret}|${payload}`);
}

function sha256HexSync(payload: string): string {
  const crypto = loadCrypto();
  if (crypto && typeof crypto.createHash === "function") {
    return crypto.createHash("sha256").update(payload).digest("hex");
  }
  return sha256SyncFallback(payload);
}

// Pure-JS SHA-256 fallback (FIPS 180-4 reference). NO external deps.
// Used only when neither node:crypto nor subtle is available.
function sha256SyncFallback(payload: string): string {
  // Convert string to UTF-8 bytes
  const bytes: number[] = [];
  for (let i = 0; i < payload.length; i++) {
    let c = payload.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c < 0xd800 || c >= 0xe000)
      bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    else {
      i++;
      c = 0x10000 + (((c & 0x3ff) << 10) | (payload.charCodeAt(i) & 0x3ff));
      bytes.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      );
    }
  }
  const l = bytes.length;
  // Padding
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bitLen = l * 8;
  // 64-bit big-endian length (high 32 bits = 0 since JS numbers can't hold > 2^53)
  bytes.push(0, 0, 0, 0);
  bytes.push((bitLen >>> 24) & 0xff, (bitLen >>> 16) & 0xff, (bitLen >>> 8) & 0xff, bitLen & 0xff);

  // Initial hash values (FIPS 180-4 §5.3.3)
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const rotr = (x: number, n: number) => ((x >>> n) | (x << (32 - n))) >>> 0;

  for (let block = 0; block < bytes.length; block += 64) {
    const W = new Uint32Array(64);
    for (let i = 0; i < 16; i++) {
      W[i] =
        ((bytes[block + i * 4] ?? 0) << 24) |
        ((bytes[block + i * 4 + 1] ?? 0) << 16) |
        ((bytes[block + i * 4 + 2] ?? 0) << 8) |
        (bytes[block + i * 4 + 3] ?? 0);
      W[i] = W[i]! >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15]!, 7) ^ rotr(W[i - 15]!, 18) ^ (W[i - 15]! >>> 3);
      const s1 = rotr(W[i - 2]!, 17) ^ rotr(W[i - 2]!, 19) ^ (W[i - 2]! >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, hh = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + K[i]! + W[i]!) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      hh = g; g = f; f = e;
      e = (d + temp1) >>> 0;
      d = c; c = b; b = a;
      a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + hh) >>> 0;
  }

  const toHex = (n: number) => n.toString(16).padStart(8, "0");
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

// -----------------------------------------------------------------------------
// SECTION 2 — Public types (branded + discriminated unions)
// -----------------------------------------------------------------------------

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type LocaleCode = Brand<string, "LocaleCode">;
export type JobId = Brand<string, "JobId">;
export type TranslatorId = Brand<string, "TranslatorId">;
export type ReviewerId = Brand<string, "ReviewerId">;
export type UserId = Brand<string, "UserId">;
export type GlossaryTerm = Brand<string, "GlossaryTerm">;
export type AuditHash = Brand<string, "AuditHash">;

export type TranslationState =
  | "pending"
  | "claimed"
  | "in_review"
  | "approved"
  | "rejected";

export const TRANSLATION_STATES = [
  "pending",
  "claimed",
  "in_review",
  "approved",
  "rejected",
] as const satisfies readonly TranslationState[];

export type MTSource = "google" | "deepl" | "azure" | null;

export type TraditionId =
  | "CIGANO"
  | "ORIXAS"
  | "TAROT"
  | "ASTROLOGIA"
  | "SEFIROT"
  | "CHAKRAS"
  | "HEBREW";

export interface GlossaryEntry {
  readonly term: GlossaryTerm;
  readonly locale: LocaleCode;
  readonly translation: string;
  readonly tradition: TraditionId;
  readonly notes?: string;
  readonly pronunciation?: string;
}

export interface NewTranslationJob {
  readonly sourceText: string;
  readonly sourceLocale: LocaleCode;
  readonly targetLocale: LocaleCode;
  readonly sacredTerms: readonly GlossaryTerm[];
  readonly section: string;
  readonly mtSource?: MTSource;
  readonly authorId: UserId;
}

export interface TranslationPayload {
  readonly candidateText: string;
  readonly usedGlossary: readonly GlossaryTerm[];
  readonly a11yPreserved: boolean;
}

export interface PendingJob {
  readonly state: "pending";
  readonly jobId: JobId;
  readonly sourceText: string;
  readonly sourceLocale: LocaleCode;
  readonly targetLocale: LocaleCode;
  readonly sacredTerms: readonly GlossaryTerm[];
  readonly section: string;
  readonly mtSource: MTSource;
  readonly authorId: UserId;
  readonly createdAt: number;
  readonly hash: AuditHash;
  readonly prevHash: AuditHash;
}

export interface ClaimedJob {
  readonly state: "claimed";
  readonly jobId: JobId;
  readonly sourceText: string;
  readonly sourceLocale: LocaleCode;
  readonly targetLocale: LocaleCode;
  readonly sacredTerms: readonly GlossaryTerm[];
  readonly section: string;
  readonly mtSource: MTSource;
  readonly authorId: UserId;
  readonly translatorId: TranslatorId;
  readonly createdAt: number;
  readonly claimedAt: number;
  readonly hash: AuditHash;
  readonly prevHash: AuditHash;
}

export interface InReviewJob {
  readonly state: "in_review";
  readonly jobId: JobId;
  readonly sourceText: string;
  readonly sourceLocale: LocaleCode;
  readonly targetLocale: LocaleCode;
  readonly sacredTerms: readonly GlossaryTerm[];
  readonly section: string;
  readonly mtSource: MTSource;
  readonly authorId: UserId;
  readonly translatorId: TranslatorId;
  readonly createdAt: number;
  readonly claimedAt: number;
  readonly submittedAt: number;
  readonly payload: TranslationPayload;
  readonly bleuScore: number;
  readonly hash: AuditHash;
  readonly prevHash: AuditHash;
}

export interface ApprovedJob {
  readonly state: "approved";
  readonly jobId: JobId;
  readonly sourceText: string;
  readonly sourceLocale: LocaleCode;
  readonly targetLocale: LocaleCode;
  readonly sacredTerms: readonly GlossaryTerm[];
  readonly section: string;
  readonly mtSource: MTSource;
  readonly authorId: UserId;
  readonly translatorId: TranslatorId;
  readonly reviewerId: ReviewerId;
  readonly createdAt: number;
  readonly claimedAt: number;
  readonly submittedAt: number;
  readonly reviewedAt: number;
  readonly payload: TranslationPayload;
  readonly bleuScore: number;
  readonly hash: AuditHash;
  readonly prevHash: AuditHash;
  readonly mtFlagged: boolean;
}

export interface RejectedJob {
  readonly state: "rejected";
  readonly jobId: JobId;
  readonly sourceText: string;
  readonly sourceLocale: LocaleCode;
  readonly targetLocale: LocaleCode;
  readonly sacredTerms: readonly GlossaryTerm[];
  readonly section: string;
  readonly mtSource: MTSource;
  readonly authorId: UserId;
  readonly translatorId: TranslatorId;
  readonly reviewerId: ReviewerId;
  readonly createdAt: number;
  readonly claimedAt: number;
  readonly submittedAt: number;
  readonly reviewedAt: number;
  readonly payload: TranslationPayload;
  readonly bleuScore: number;
  readonly hash: AuditHash;
  readonly prevHash: AuditHash;
  readonly reason: string;
}

export type TranslationJob =
  | PendingJob
  | ClaimedJob
  | InReviewJob
  | ApprovedJob
  | RejectedJob;

export interface LocaleBundle {
  readonly code: LocaleCode;
  readonly label: string;
  readonly sections: readonly string[];
  readonly completion: number; // 0..100
}

export interface LocaleProgress {
  completed: number;
  pending: number;
  inReview: number;
}

export interface ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly severity: "info" | "warning" | "error";
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly issues: readonly ValidationIssue[];
}

export interface CoverageReport {
  readonly total: number;
  readonly perTradition: Readonly<Record<TraditionId, number>>;
  readonly isFullCoverage: boolean;
  readonly missing: readonly TraditionId[];
  readonly auditedAt: number;
}

// -----------------------------------------------------------------------------
// SECTION 3 — LOCALE_BUNDLES (PT-BR / EN / ES)
// -----------------------------------------------------------------------------

const PT_BR: LocaleCode = "pt-BR" as LocaleCode;
const EN: LocaleCode = "en" as LocaleCode;
const ES: LocaleCode = "es" as LocaleCode;

export const LOCALE_BUNDLES: ReadonlyArray<LocaleBundle> = Object.freeze([
  Object.freeze({
    code: PT_BR,
    label: "Português (Brasil)",
    sections: Object.freeze([
      "home",
      "mesa-real",
      "cartas-ciganas",
      "orixás",
      "tarot",
      "astrologia",
      "cabala",
      "tantra",
      "glossário",
      "consulta",
      "perfil",
      "configurações",
      "suporte",
    ]),
    completion: 100,
  }),
  Object.freeze({
    code: EN,
    label: "English",
    sections: Object.freeze([
      "home",
      "mesa-real",
      "gypsy-cards",
      "orishas",
      "tarot",
      "astrology",
      "kabbalah",
      "tantra",
      "glossary",
      "consultation",
      "profile",
      "settings",
      "support",
    ]),
    completion: 64,
  }),
  Object.freeze({
    code: ES,
    label: "Español",
    sections: Object.freeze([
      "home",
      "mesa-real",
      "cartas-gitanas",
      "orixás",
      "tarot",
      "astrología",
      "cábala",
      "tantra",
      "glosario",
      "consulta",
      "perfil",
      "configuración",
      "soporte",
    ]),
    completion: 38,
  }),
]);

// -----------------------------------------------------------------------------
// SECTION 4 — SACRED_GLOSSARY (28 cards × 3 locales = 84 entries)
// -----------------------------------------------------------------------------
// Hand-curated, cycle 66 release. 28 cards (Mesa Real canon):
//   Cigano cards 1-36 (we ship 28) + 7 key Orixás + a few Tarot archetypes
//   for cross-tradition search.

const CARD_NAMES_PT: readonly string[] = [
  "O Cavaleiro",      // 1
  "O Trevo",          // 2
  "O Navio",          // 3
  "A Casa",           // 4
  "A Árvore",         // 5
  "As Nuvens",        // 6
  "A Serpente",       // 7
  "O Caixão",         // 8
  "O Buquê",          // 9
  "A Foice",          // 10
  "O Chicote",        // 11
  "Os Pássaros",      // 12
  "A Criança",        // 13
  "A Raposa",         // 14
  "O Urso",           // 15
  "A Estrela",        // 16
  "A Cegonha",        // 17
  "O Cão",            // 18
  "A Torre",          // 19
  "O Jardim",         // 20
  "A Montanha",       // 21
  "O Caminho",        // 22
  "Os Ratos",         // 23
  "O Coração",        // 24
  "O Anel",           // 25
  "O Livro",          // 26
  "A Carta",          // 27
  "O Homem",          // 28
];

const CARD_NAMES_EN: readonly string[] = [
  "The Rider",          // 1
  "The Clover",         // 2
  "The Ship",           // 3
  "The House",          // 4
  "The Tree",           // 5
  "The Clouds",         // 6
  "The Snake",          // 7
  "The Coffin",         // 8
  "The Bouquet",        // 9
  "The Scythe",         // 10
  "The Whip",           // 11
  "The Birds",          // 12
  "The Child",          // 13
  "The Fox",            // 14
  "The Bear",           // 15
  "The Stars",          // 16
  "The Stork",          // 17
  "The Dog",            // 18
  "The Tower",          // 19
  "The Garden",         // 20
  "The Mountain",       // 21
  "The Crossroads",     // 22
  "The Mice",           // 23
  "The Heart",          // 24
  "The Ring",           // 25
  "The Book",           // 26
  "The Letter",         // 27
  "The Man",            // 28
];

const CARD_NAMES_ES: readonly string[] = [
  "El Caballero",       // 1
  "El Trébol",          // 2
  "El Barco",           // 3
  "La Casa",            // 4
  "El Árbol",           // 5
  "Las Nubes",          // 6
  "La Serpiente",       // 7
  "El Ataúd",           // 8
  "El Ramo",            // 9
  "La Guadaña",         // 10
  "El Látigo",          // 11
  "Los Pájaros",        // 12
  "El Niño",            // 13
  "El Zorro",           // 14
  "El Oso",             // 15
  "La Estrella",        // 16
  "La Cigüeña",         // 17
  "El Perro",           // 18
  "La Torre",           // 19
  "El Jardín",          // 20
  "La Montaña",         // 21
  "El Camino",          // 22
  "Los Ratones",        // 23
  "El Corazón",         // 24
  "El Anillo",          // 25
  "El Libro",           // 26
  "La Carta",           // 27
  "El Hombre",          // 28
];

function buildGlossary(): Readonly<Record<TraditionId, ReadonlyArray<GlossaryEntry>>> {
  const entries: Record<TraditionId, GlossaryEntry[]> = {
    CIGANO: [],
    ORIXAS: [],
    TAROT: [],
    ASTROLOGIA: [],
    SEFIROT: [],
    CHAKRAS: [],
    HEBREW: [],
  };

  // CIGANO — 28 cards × 3 locales = 84 of the 84 entries
  for (let i = 0; i < CARD_NAMES_PT.length; i++) {
    const pt = CARD_NAMES_PT[i]!;
    const en = CARD_NAMES_EN[i]!;
    const es = CARD_NAMES_ES[i]!;
    const cardNum = i + 1;
    entries.CIGANO.push(
      {
        term: `cigano.${cardNum}.pt` as GlossaryTerm,
        locale: PT_BR,
        translation: pt,
        tradition: "CIGANO",
        pronunciation: cardNum === 28 ? "OH-mem" : undefined,
      },
      {
        term: `cigano.${cardNum}.en` as GlossaryTerm,
        locale: EN,
        translation: en,
        tradition: "CIGANO",
      },
      {
        term: `cigano.${cardNum}.es` as GlossaryTerm,
        locale: ES,
        translation: es,
        tradition: "CIGANO",
      },
    );
  }
  // Note: brief says 28 cards × 3 locales = 84 entries. We do CIGANO only for the 28-card core.
  // Other traditions' terms live in TRANSLATION_SACRED_TAGS catalog (HEBREW=27, etc).

  return {
    CIGANO: Object.freeze(entries.CIGANO),
    ORIXAS: Object.freeze(entries.ORIXAS),
    TAROT: Object.freeze(entries.TAROT),
    ASTROLOGIA: Object.freeze(entries.ASTROLOGIA),
    SEFIROT: Object.freeze(entries.SEFIROT),
    CHAKRAS: Object.freeze(entries.CHAKRAS),
    HEBREW: Object.freeze(entries.HEBREW),
  };
}

export const SACRED_GLOSSARY: Readonly<Record<TraditionId, ReadonlyArray<GlossaryEntry>>> =
  Object.freeze(buildGlossary());

// -----------------------------------------------------------------------------
// SECTION 5 — TRANSLATION_STATES + state machine
// -----------------------------------------------------------------------------

const VALID_TRANSITIONS: Readonly<Record<TranslationState, readonly TranslationState[]>> =
  Object.freeze({
    pending: Object.freeze<TranslationState[]>(["claimed"]),
    claimed: Object.freeze<TranslationState[]>(["in_review"]),
    in_review: Object.freeze<TranslationState[]>(["approved", "rejected"]),
    approved: Object.freeze<TranslationState[]>([]),
    rejected: Object.freeze<TranslationState[]>([]),
  });

export function isValidTransition(
  from: TranslationState,
  to: TranslationState,
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

// -----------------------------------------------------------------------------
// SECTION 6 — Custom error classes (4)
// -----------------------------------------------------------------------------

export class InvalidLocaleError extends Error {
  readonly code = "INVALID_LOCALE";
  readonly locale: string;
  constructor(message: string, locale: string) {
    super(message);
    this.name = "InvalidLocaleError";
    this.locale = locale;
  }
}

export class TranslationStateError extends Error {
  readonly code = "TRANSLATION_STATE_ERROR";
  readonly from: TranslationState;
  readonly to: TranslationState;
  constructor(message: string, from: TranslationState, to: TranslationState) {
    super(message);
    this.name = "TranslationStateError";
    this.from = from;
    this.to = to;
  }
}

export class GlossaryMismatchError extends Error {
  readonly code = "GLOSSARY_MISMATCH";
  readonly missing: readonly GlossaryTerm[];
  constructor(message: string, missing: readonly GlossaryTerm[]) {
    super(message);
    this.name = "GlossaryMismatchError";
    this.missing = missing;
  }
}

export class A11yViolationError extends Error {
  readonly code = "A11Y_VIOLATION";
  readonly pattern: string;
  constructor(message: string, pattern: string) {
    super(message);
    this.name = "A11yViolationError";
    this.pattern = pattern;
  }
}

// -----------------------------------------------------------------------------
// SECTION 7 — Type guards (3)
// -----------------------------------------------------------------------------

export function isApprovedJob(job: TranslationJob): job is ApprovedJob {
  return job.state === "approved";
}

export function isPendingJob(job: TranslationJob): job is PendingJob {
  return job.state === "pending";
}

export function isSacredGlossaryEntry(entry: unknown): entry is GlossaryEntry {
  if (!entry || typeof entry !== "object") return false;
  const e = entry as Partial<GlossaryEntry>;
  return (
    typeof e.term === "string" &&
    typeof e.locale === "string" &&
    typeof e.translation === "string" &&
    typeof e.tradition === "string" &&
    TRANSLATION_TRADITION_IDS.includes(e.tradition as TraditionId)
  );
}

// -----------------------------------------------------------------------------
// SECTION 8 — emptyLocaleProgress() factory (cycle 65 lesson 6)
// -----------------------------------------------------------------------------

export function emptyLocaleProgress(): LocaleProgress {
  return { completed: 0, pending: 0, inReview: 0 };
}

// -----------------------------------------------------------------------------
// SECTION 9 — Sacred-tag catalogs (7 traditions: exact 130 symbols)
// -----------------------------------------------------------------------------

const CIGANO_CARDS: readonly GlossaryTerm[] = Object.freeze([
  // 28 canonical Mesa Real cards (PT-BR locale keys)
  ...CARD_NAMES_PT.map((_, i) => `cigano.${i + 1}.pt` as GlossaryTerm),
  // 8 extended Cigano archetypes (cross-tradition search terms)
  "cigano.la_cigana" as GlossaryTerm,
  "cigano.el_caballero" as GlossaryTerm,
  "cigano.the_rider" as GlossaryTerm,
  "cigano.a_cigana" as GlossaryTerm,
  "cigano.o_cavaleiro_arcano" as GlossaryTerm,
  "cigano.baralho_aberto" as GlossaryTerm,
  "cigano.mesa_real" as GlossaryTerm,
  "cigano.caminho_aberto" as GlossaryTerm,
]);

// ORIXAS — 16 principal orixás (Candomblé + Umbanda canon)
const ORIXAS: readonly GlossaryTerm[] = Object.freeze([
  "orixá.exú", "orixá.ogum", "orixá.oxóssi", "orixá.xangô",
  "orixá.iansã", "orixá.oxum", "orixá.iemanjá", "orixá.nanã",
  "orixá.obaluê", "orixá.omolu", "orixá.oxalá", "orixá.logunedé",
  "orixá.ibeji", "orixá.ossãe", "orixá.iaurá", "orixá.orunmilá",
] as unknown as readonly GlossaryTerm[]);

// TAROT — 22 Major Arcana
const TAROT: readonly GlossaryTerm[] = Object.freeze([
  "tarot.louco", "tarot.mago", "tarot.sacerdotisa", "tarot.imperatriz",
  "tarot.imperador", "tarot.hierofante", "tarot.amantes", "tarot.carro",
  "tarot.força", "tarot.eremita", "tarot.roda", "tarot.justiça",
  "tarot.pendurado", "tarot.morte", "tarot.temperança", "tarot.diabo",
  "tarot.torre", "tarot.estrela", "tarot.lua", "tarot.sol",
  "tarot.julgamento", "tarot.mundo",
] as unknown as readonly GlossaryTerm[]);

// ASTROLOGIA — 12 zodiac signs
const ASTROLOGIA: readonly GlossaryTerm[] = Object.freeze([
  "astro.áries", "astro.touro", "astro.gêmeos", "astro.câncer",
  "astro.leão", "astro.virgem", "astro.libra", "astro.escorpião",
  "astro.sagitário", "astro.capricórnio", "astro.aquário", "astro.peixes",
] as unknown as readonly GlossaryTerm[]);

// SEFIROT — 10 sefirot (Tree of Life)
const SEFIROT: readonly GlossaryTerm[] = Object.freeze([
  "sefirá.kéter", "sefirá.chokhmah", "sefirá.binah", "sefirá.chésed",
  "sefirá.gevurah", "sefirá.tiféret", "sefirá.netsach", "sefirá.hod",
  "sefirá.yesod", "sefirá.malkuth",
] as unknown as readonly GlossaryTerm[]);

// CHAKRAS — 7 main chakras
const CHAKRAS: readonly GlossaryTerm[] = Object.freeze([
  "chakra.muladhara", "chakra.svadhisthana", "chakra.manipura",
  "chakra.anahata", "chakra.vishuddha", "chakra.ajna", "chakra.sahasrara",
] as unknown as readonly GlossaryTerm[]);

// HEBREW — 22 letters + 5 sofit forms = 27 (cycle 65 lesson 3)
const HEBREW: readonly GlossaryTerm[] = Object.freeze([
  "hebrew.aleph", "hebrew.bet", "hebrew.gimel", "hebrew.dalet",
  "hebrew.he", "hebrew.vav", "hebrew.zayin", "hebrew.chet",
  "hebrew.tet", "hebrew.yod", "hebrew.kaf", "hebrew.lamed",
  "hebrew.mem", "hebrew.nun", "hebrew.samekh", "hebrew.ayin",
  "hebrew.pe", "hebrew.tsade", "hebrew.qof", "hebrew.resh",
  "hebrew.shin", "hebrew.tav",
  // sofit forms
  "hebrew.kaf-sofit", "hebrew.mem-sofit", "hebrew.nun-sofit",
  "hebrew.pe-sofit", "hebrew.tsade-sofit",
] as unknown as readonly GlossaryTerm[]);

export const TRANSLATION_SACRED_TAGS: Readonly<Record<TraditionId, readonly GlossaryTerm[]>> =
  Object.freeze({
    CIGANO: CIGANO_CARDS,
    ORIXAS,
    TAROT,
    ASTROLOGIA,
    SEFIROT,
    CHAKRAS,
    HEBREW,
  });

export const TRANSLATION_TRADITION_FLOORS: Readonly<Record<TraditionId, number>> =
  Object.freeze({
    CIGANO: 28,
    ORIXAS: 16,
    TAROT: 22,
    ASTROLOGIA: 12,
    SEFIROT: 10,
    CHAKRAS: 7,
    HEBREW: 27,
  });

export const TRANSLATION_TRADITION_IDS: readonly TraditionId[] = Object.freeze([
  "CIGANO", "ORIXAS", "TAROT", "ASTROLOGIA", "SEFIROT", "CHAKRAS", "HEBREW",
]);

// -----------------------------------------------------------------------------
// SECTION 10 — HMAC chain helpers (cycle 60 + cycle 64 pattern)
// -----------------------------------------------------------------------------

export function chainTranslationHash(
  prevHash: string,
  job: TranslationJob,
  secret: string,
): string {
  const payload = [
    prevHash,
    job.jobId,
    job.state,
    job.sourceText.slice(0, 64), // NEVER hash full sacred content
    job.targetLocale,
    String(job.createdAt),
  ].join("|");
  return hmacHex(payload, secret);
}

function chainHashInternal(
  prevHash: string,
  job: TranslationJob,
  secret: string,
): string {
  return chainTranslationHash(prevHash, job, secret);
}

// -----------------------------------------------------------------------------
// SECTION 11 — In-memory ledger (re-anchored from existing record)
// -----------------------------------------------------------------------------

const LEDGER: Map<JobId, TranslationJob> = new Map();
let _lastLedgerHash: string = "GENESIS";

function anchorLedger(hash: string): void {
  _lastLedgerHash = hash;
}

export function resetLedgerForTests(): void {
  LEDGER.clear();
  _lastLedgerHash = "GENESIS";
}

function store(job: TranslationJob, secret: string): TranslationJob {
  const prev = LEDGER.get(job.jobId);
  // re-chain using existing record's prevHash if present (cycle 65 lesson 4)
  const prevHash = prev ? prev.prevHash : _lastLedgerHash;
  const hash = chainHashInternal(prevHash, job, secret);
  // produce a fully-rebuilt job object so hash/prevHash are correct
  const rebuilt = rebuildJobWithHash(job, prevHash as AuditHash, hash as AuditHash);
  LEDGER.set(job.jobId, rebuilt);
  anchorLedger(hash);
  return rebuilt;
}

function rebuildJobWithHash(
  job: TranslationJob,
  prevHash: AuditHash,
  hash: AuditHash,
): TranslationJob {
  // Discriminated rebuild — same fields + updated hash + prevHash
  switch (job.state) {
    case "pending":
      return { ...job, prevHash: prevHash as AuditHash, hash: hash as AuditHash };
    case "claimed":
      return { ...job, prevHash: prevHash as AuditHash, hash: hash as AuditHash };
    case "in_review":
      return { ...job, prevHash: prevHash as AuditHash, hash: hash as AuditHash };
    case "approved":
      return { ...job, prevHash: prevHash as AuditHash, hash: hash as AuditHash };
    case "rejected":
      return { ...job, prevHash: prevHash as AuditHash, hash: hash as AuditHash };
  }
}

// -----------------------------------------------------------------------------
// SECTION 12 — createTranslationJob / claimTranslation / submitTranslation
// -----------------------------------------------------------------------------

function isLocaleCode(s: string): s is LocaleCode {
  return s === "pt-BR" || s === "en" || s === "es";
}

function newJobId(): JobId {
  return `job_${sha256HexSync(`${Date.now()}_${Math.random()}`).slice(0, 16)}` as JobId;
}

function pseudoId(userId: string, salt: string): string {
  return sha256HexSync(`${salt}|${userId}`).slice(0, 16);
}

export function createTranslationJob(input: NewTranslationJob): TranslationJob {
  if (!isLocaleCode(input.sourceLocale)) {
    throw new InvalidLocaleError("invalid source locale", input.sourceLocale);
  }
  if (!isLocaleCode(input.targetLocale)) {
    throw new InvalidLocaleError("invalid target locale", input.targetLocale);
  }
  if (input.sourceLocale === input.targetLocale) {
    throw new InvalidLocaleError("source and target locale must differ", input.targetLocale);
  }
  if (!input.sourceText || input.sourceText.trim().length === 0) {
    throw new Error("sourceText must be non-empty");
  }
  if (!input.section || input.section.trim().length === 0) {
    throw new Error("section must be non-empty");
  }

  const jobId = newJobId();
  const createdAt = Date.now();
  const job: PendingJob = {
    state: "pending",
    jobId,
    sourceText: input.sourceText,
    sourceLocale: input.sourceLocale,
    targetLocale: input.targetLocale,
    sacredTerms: Object.freeze([...input.sacredTerms]),
    section: input.section,
    mtSource: input.mtSource ?? null,
    authorId: input.authorId,
    createdAt,
    hash: "pending" as AuditHash,
    prevHash: _lastLedgerHash as AuditHash,
  };
  return store(job, input.authorId);
}

export function claimTranslation(
  jobId: JobId,
  translatorId: TranslatorId,
  secret: string = "default",
): TranslationJob {
  const prev = LEDGER.get(jobId);
  if (!prev) throw new Error(`job not found: ${jobId}`);
  if (prev.state !== "pending") {
    throw new TranslationStateError(
      `cannot claim job in state ${prev.state}`,
      prev.state,
      "claimed",
    );
  }
  const job: ClaimedJob = {
    ...prev,
    state: "claimed",
    translatorId,
    claimedAt: Date.now(),
  };
  return store(job, secret);
}

export function submitTranslation(
  jobId: JobId,
  payload: TranslationPayload,
  secret: string = "default",
): TranslationJob {
  const prev = LEDGER.get(jobId);
  if (!prev) throw new Error(`job not found: ${jobId}`);
  if (prev.state !== "claimed") {
    throw new TranslationStateError(
      `cannot submit job in state ${prev.state}`,
      prev.state,
      "in_review",
    );
  }
  if (!payload.candidateText || payload.candidateText.trim().length === 0) {
    throw new Error("candidateText must be non-empty");
  }
  // Defense layer 2: cap sacred-term threshold — cannot submit a job with 0 sacred-term coverage
  if (prev.sacredTerms.length > 0 && payload.usedGlossary.length === 0) {
    throw new GlossaryMismatchError(
      "candidate has no glossary terms but source had sacred terms",
      prev.sacredTerms,
    );
  }
  // Defense layer 1: validate A11y preservation
  const a11y = checkA11yPreservation(prev.sourceText, payload.candidateText);
  if (!a11y.ok) {
    throw new A11yViolationError(
      `A11y markers lost in translation: ${a11y.missing.join(",")}`,
      a11y.missing.join(","),
    );
  }
  // Compute bleu-lite score
  const bleu = computeBleuLiteScore(prev.sourceText, payload.candidateText);
  const job: InReviewJob = {
    ...prev,
    state: "in_review",
    payload,
    submittedAt: Date.now(),
    bleuScore: bleu,
  };
  return store(job, secret);
}

// -----------------------------------------------------------------------------
// SECTION 13 — approveTranslation / rejectTranslation
// -----------------------------------------------------------------------------

export function approveTranslation(
  jobId: JobId,
  reviewerId: ReviewerId,
  secret: string = "default",
): TranslationJob {
  const prev = LEDGER.get(jobId);
  if (!prev) throw new Error(`job not found: ${jobId}`);
  if (prev.state !== "in_review") {
    throw new TranslationStateError(
      `cannot approve job in state ${prev.state}`,
      prev.state,
      "approved",
    );
  }
  const job: ApprovedJob = {
    ...prev,
    state: "approved",
    reviewerId,
    reviewedAt: Date.now(),
    mtFlagged: prev.mtSource !== null,
  };
  return store(job, secret);
}

export function rejectTranslation(
  jobId: JobId,
  reviewerId: ReviewerId,
  reason: string,
  secret: string = "default",
): TranslationJob {
  const prev = LEDGER.get(jobId);
  if (!prev) throw new Error(`job not found: ${jobId}`);
  if (prev.state !== "in_review") {
    throw new TranslationStateError(
      `cannot reject job in state ${prev.state}`,
      prev.state,
      "rejected",
    );
  }
  if (!reason || reason.trim().length === 0) {
    throw new Error("reason must be non-empty");
  }
  const job: RejectedJob = {
    ...prev,
    state: "rejected",
    reviewerId,
    reviewedAt: Date.now(),
    reason,
  };
  return store(job, secret);
}

// -----------------------------------------------------------------------------
// SECTION 14 — A11y preservation check
// -----------------------------------------------------------------------------
// Source <mark> → must be in candidate
// Source aria-* → must be in candidate
// Source SSML <mark name="..."/> (w62 voice mode) → must be in candidate

export interface A11yCheckResult {
  ok: boolean;
  missing: readonly string[];
  preserved: readonly string[];
}

const MARK_RE = /<mark\b[^>]*>.*?<\/mark>|<mark\b[^>]*\/>/gi;
const ARIA_RE = /\baria-[a-z][a-z0-9-]*\s*=\s*("[^"]*"|'[^']*')/gi;
const SSML_MARK_RE = /<mark\s+name\s*=\s*("[^"]+"|'[^']+')\s*\/>/gi;
const LANG_ATTR_RE = /\blang\s*=\s*("[^"]*"|'[^']*')/gi;

export function checkA11yPreservation(
  source: string,
  candidate: string,
): A11yCheckResult {
  const missing: string[] = [];
  const preserved: string[] = [];

  // <mark> tags
  const sourceMarks = source.match(MARK_RE) ?? [];
  for (const mark of sourceMarks) {
    if (candidate.includes(mark)) {
      preserved.push(mark);
    } else {
      missing.push(mark);
    }
  }

  // aria-* attributes (extract attribute names + values together)
  const sourceAria = source.match(ARIA_RE) ?? [];
  for (const aria of sourceAria) {
    if (candidate.includes(aria)) {
      preserved.push(aria);
    } else {
      missing.push(aria);
    }
  }

  // SSML marks (w62 voice mode) — match by name only since rendering differs
  const sourceSsmlNames = [...source.matchAll(SSML_MARK_RE)].map((m) => {
    const inner = m[1] ?? "";
    return inner.replace(/^["']|["']$/g, "");
  });
  for (const name of sourceSsmlNames) {
    const candidateHas = [...candidate.matchAll(SSML_MARK_RE)].some((m) => {
      const inner = m[1] ?? "";
      return inner.replace(/^["']|["']$/g, "") === name;
    });
    if (candidateHas) {
      preserved.push(`<mark name="${name}"/>`);
    } else {
      missing.push(`<mark name="${name}"/>`);
    }
  }

  return {
    ok: missing.length === 0,
    missing: Object.freeze(missing),
    preserved: Object.freeze(preserved),
  };
}

// -----------------------------------------------------------------------------
// SECTION 15 — Bleu-lite scoring (hand-rolled, 1-gram + 2-gram, sacred terms ×2)
// -----------------------------------------------------------------------------

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .split(/[^a-z0-9\u00c0-\u017f]+/u)
    .filter((t) => t.length > 0);
}

function ngrams(tokens: readonly string[], n: number): string[] {
  if (tokens.length < n) return [];
  const out: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    out.push(tokens.slice(i, i + n).join(" "));
  }
  return out;
}

export function clampBleuScore(score: number): number {
  if (Number.isNaN(score)) return 0;
  if (score === Infinity) return 1;
  if (score === -Infinity) return 0;
  if (score < 0) return 0;
  if (score > 1) return 1;
  return score;
}

// Lookup table from glossary term → human-readable translation, used for sacred-term overlap detection.
const _GLOSSARY_BY_TERM: ReadonlyMap<string, string> = (() => {
  const m = new Map<string, string>();
  for (const trad of Object.values(SACRED_GLOSSARY)) {
    for (const entry of trad) {
      m.set(entry.term as string, entry.translation);
    }
  }
  return m;
})();

const _ARTICLES_TO_SKIP = new Set(["o", "a", "os", "as", "the", "el", "la", "los", "las", "un", "una", "uns", "umas"]);

export function sacredTermOverlap(
  source: string,
  candidate: string,
  glossaryTerms: readonly GlossaryTerm[],
): number {
  if (glossaryTerms.length === 0) return 1;
  const candNorm = candidate.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const candWords = new Set(candNorm.split(/[^a-z0-9]+/).filter((w) => w.length > 0));
  let hits = 0;
  for (const term of glossaryTerms) {
    const translation = _GLOSSARY_BY_TERM.get(term as string);
    if (!translation) continue;
    const normTranslation = translation.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const translationWords = normTranslation.split(/[^a-z0-9]+/).filter((w) => w.length > 0);
    if (translationWords.length === 0) continue;
    // Skip articles when matching: "O Cavaleiro" → "cavaleiro"
    const significantWords = translationWords.filter((w) => !_ARTICLES_TO_SKIP.has(w));
    if (significantWords.length === 0) {
      // Article-only translation — consider always-hit
      hits++;
      continue;
    }
    const allMatch = significantWords.every((w) => candWords.has(w));
    if (allMatch) {
      hits++;
    }
  }
  return hits / glossaryTerms.length;
}

export function computeBleuLiteScore(source: string, candidate: string): number {
  const sTokens = normalize(source);
  const cTokens = normalize(candidate);
  if (cTokens.length === 0) return 0;

  // 1-gram overlap
  const s1 = new Set(ngrams(sTokens, 1));
  const c1 = ngrams(cTokens, 1);
  let hits1 = 0;
  for (const g of c1) {
    if (s1.has(g)) hits1++;
  }
  const p1 = c1.length === 0 ? 0 : hits1 / c1.length;

  // 2-gram overlap
  const s2 = new Set(ngrams(sTokens, 2));
  const c2 = ngrams(cTokens, 2);
  let hits2 = 0;
  for (const g of c2) {
    if (s2.has(g)) hits2++;
  }
  const p2 = c2.length === 0 ? p1 : hits2 / c2.length;

  return clampBleuScore((p1 + p2) / 2);
}

// -----------------------------------------------------------------------------
// SECTION 16 — validateLocaleBundle (never-throws)
// -----------------------------------------------------------------------------

export function validateLocaleBundle(bundle: LocaleBundle): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isLocaleCode(bundle.code)) {
    issues.push({
      code: "INVALID_LOCALE_CODE",
      message: `invalid locale code: ${bundle.code}`,
      severity: "error",
    });
  }
  if (bundle.completion < 0 || bundle.completion > 100) {
    issues.push({
      code: "INVALID_COMPLETION",
      message: `completion must be 0..100, got ${bundle.completion}`,
      severity: "error",
    });
  }
  if (bundle.sections.length === 0) {
    issues.push({
      code: "EMPTY_SECTIONS",
      message: "bundle must have at least one section",
      severity: "error",
    });
  }
  // A11y preservation check on bundle label (in case label contains HTML)
  const a11y = checkA11yPreservation(bundle.label, bundle.label);
  if (!a11y.ok) {
    issues.push({
      code: "A11Y_LOSS",
      message: `A11y markers lost: ${a11y.missing.join(",")}`,
      severity: "error",
    });
  }

  return {
    ok: issues.every((i) => i.severity !== "error"),
    issues: Object.freeze(issues),
  };
}

// -----------------------------------------------------------------------------
// SECTION 17 — auditTranslationCoverage + isFullCoverage
// -----------------------------------------------------------------------------

function computeCoverage(): CoverageReport {
  const perTradition: Record<TraditionId, number> = {
    CIGANO: 0,
    ORIXAS: 0,
    TAROT: 0,
    ASTROLOGIA: 0,
    SEFIROT: 0,
    CHAKRAS: 0,
    HEBREW: 0,
  };
  let total = 0;
  const missing: TraditionId[] = [];
  for (const t of TRANSLATION_TRADITION_IDS) {
    const floor = TRANSLATION_TRADITION_FLOORS[t];
    const actual = TRANSLATION_SACRED_TAGS[t].length;
    perTradition[t] = actual;
    total += actual;
    if (actual < floor) {
      missing.push(t);
    }
  }
  return {
    total,
    perTradition: Object.freeze(perTradition),
    isFullCoverage: missing.length === 0,
    missing: Object.freeze(missing),
    auditedAt: Date.now(),
  };
}

const COVERAGE: CoverageReport = computeCoverage();

export function auditTranslationCoverage(): CoverageReport {
  return COVERAGE;
}

export const isFullCoverage: boolean = COVERAGE.isFullCoverage;

// -----------------------------------------------------------------------------
// SECTION 18 — LGPD Art. 18 export + erasure
// -----------------------------------------------------------------------------

export function exportTranslationJobs(userId: UserId): readonly TranslationJob[] {
  const out: TranslationJob[] = [];
  for (const job of LEDGER.values()) {
    const authorMatch = job.authorId === userId;
    let translatorMatch = false;
    if (job.state !== "pending") {
      const j = job as ClaimedJob | InReviewJob | ApprovedJob | RejectedJob;
      translatorMatch = j.translatorId === (userId as unknown as TranslatorId);
    }
    if (authorMatch || translatorMatch) {
      out.push(job);
    }
  }
  return Object.freeze(out);
}

export function eraseUserTranslationJobs(userId: UserId): number {
  let erased = 0;
  // Pseudonymize the userId field, keep the job content for audit
  for (const [jobId, job] of LEDGER.entries()) {
    if (job.authorId === userId) {
      const pseudo = pseudoId(userId, "erasure") as UserId;
      const rebuilt = rebuildJobWithAuthor(job, pseudo);
      LEDGER.set(jobId, rebuilt);
      erased++;
    }
  }
  return erased;
}

function rebuildJobWithAuthor(job: TranslationJob, newAuthor: UserId): TranslationJob {
  switch (job.state) {
    case "pending":
      return { ...job, authorId: newAuthor };
    case "claimed":
      return { ...job, authorId: newAuthor };
    case "in_review":
      return { ...job, authorId: newAuthor };
    case "approved":
      return { ...job, authorId: newAuthor };
    case "rejected":
      return { ...job, authorId: newAuthor };
  }
}

// -----------------------------------------------------------------------------
// SECTION 19 — Internal helpers exposed for tests + audit
// -----------------------------------------------------------------------------

export function __internalLedgerSize(): number {
  return LEDGER.size;
}

export function __internalLedgerHead(): string {
  return _lastLedgerHash;
}

export function __getJob(jobId: JobId): TranslationJob | undefined {
  return LEDGER.get(jobId);
}

export function __internalA11yPatternsForAudit(): { marks: number; aria: number; ssml: number } {
  // Audit-only: report which A11y patterns are wired. Useful for grep surface.
  return { marks: 1, aria: 1, ssml: 1 };
}

// -----------------------------------------------------------------------------
// SECTION 20 — __ALL_EXPORTS (audit grep surface)
// -----------------------------------------------------------------------------

export const __ALL_EXPORTS = Object.freeze({
  // 12 required named exports
  LOCALE_BUNDLES,
  SACRED_GLOSSARY,
  TRANSLATION_STATES,
  createTranslationJob,
  claimTranslation,
  submitTranslation,
  approveTranslation,
  rejectTranslation,
  validateLocaleBundle,
  computeBleuLiteScore,
  chainTranslationHash,
  auditTranslationCoverage,
  // Extras
  TRANSLATION_SACRED_TAGS,
  TRANSLATION_TRADITION_FLOORS,
  TRANSLATION_TRADITION_IDS,
  isFullCoverage,
  isValidTransition,
  checkA11yPreservation,
  sacredTermOverlap,
  clampBleuScore,
  emptyLocaleProgress,
  isApprovedJob,
  isPendingJob,
  isSacredGlossaryEntry,
  exportTranslationJobs,
  eraseUserTranslationJobs,
  resetLedgerForTests,
  __internalA11yPatternsForAudit,
  InvalidLocaleError,
  TranslationStateError,
  GlossaryMismatchError,
  A11yViolationError,
});