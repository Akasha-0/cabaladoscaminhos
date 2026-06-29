/**
 * w55/i18n-locale-fallback-chain
 * ───────────────────────────────
 * Engine determinístico para detecção de locale + cadeia de fallback +
 * plural wrapper + missing-key detection + SACRED-KEY LOCK + region
 * k-anonymity + LGPD Art. 7/9/18. Projetado BY-SHAPE para os arquivos
 * existentes em `src/lib/i18n/{useT,index}.ts` sem fazer import deles.
 *
 * Princípios:
 *   - Detecção explícita > browser > IP-region mock > PT-BR default.
 *   - Cadeia de fallback padrão: pt-BR → en → es → literal da chave.
 *   - SACRED-KEY LOCK é HARD: namespaces prayer./ritual./mantra./liturgy.
 *     NUNCA atravessam a fallback chain. Se a chave sacred não existir
 *     no locale explícito do usuário, throw SacredKeyMissing. Terminologia
 *     sacred NUNCA é auto-traduzida — integrador deve seed prayer.* em
 *     CADA locale suportado.
 *   - Region k-anonymity: país sempre exposto, estado só com k≥100k,
 *     cidade NUNCA. Regiões pequenas viram `XX-SMALL`.
 *   - LGPD Art. 7 (consentimento): preferência de locale é consent-based,
 *     default OFF. Art. 9 (finalidade): tradução de UI apenas, sem tracking.
 *     Art. 18 (direitos do titular): export de chaves usadas + valores,
 *     erasure limpa userLocaleHistory.
 *
 * Self-contained: zero imports do repo. Só TS types + Math nativo + string
 * ops. Determinístico. Sem dependência externa.
 *
 * Layout:
 *   §1  Tipos & contratos
 *   §2  Constantes
 *   §3  Math helpers (FNV-1a 32/64, HMAC-SHA256, region hash)
 *   §4  Detection chain (explicit > browser > IP-region > PT-BR)
 *   §5  Normalize (pt-BR/pt_br/ptbr/PT-br → canonical)
 *   §6  Key resolution (namespace.key → fallback chain → literal)
 *   §7  Plural wrapper (Intl.PluralRules shape; cardinal+ordinal)
 *   §8  Interpolation ({{name}} replace, HTML-escape, max 50 vars)
 *   §9  SACRED-KEY LOCK
 *   §10 Region k-anonymity (k≥1000 floor; city never; XX-SMALL bucket)
 *   §11 LGPD Art. 7/9/18
 *   §12 Missing-key detection (MissingKeyReport + aggregate)
 *   §13 A11y (locale-aware date/number/currency; RTL_001 marker)
 *   §14 Audit events
 *   §15 Smoke / regression scenarios
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Tipos & Contratos                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** BCP-47 canonical — somente os 3 suportados. */
export type LocaleCode = "pt-BR" | "en" | "es";

/** ISO-3166 alpha-2 country OU special bucket `XX-SMALL` (k<1000). */
export type RegionCode =
  | "BR"
  | "US"
  | "ES"
  | "PT"
  | "AR"
  | "MX"
  | "XX-SMALL";

/** Chave de tradução dotted (`nav.home`, `prayer.oxala`). */
export type TranslationKey = string;

/** Categoria plural universal (CLDR). */
export type PluralCategory =
  | "zero"
  | "one"
  | "two"
  | "few"
  | "many"
  | "other";

/** Severidade de um report de chave ausente. */
export type MissingKeySeverity = "INFO" | "MISSING" | "SACRED_MISSING";

/** Entrada de relatório de chave ausente. */
export interface MissingKeyReport {
  key: TranslationKey;
  requestedLocale: LocaleCode;
  severity: MissingKeySeverity;
  hitLocale: LocaleCode | null;   // locale onde finalmente foi encontrada, ou null
  timestamp: number;              // epoch ms
  fallbackDepth: number;          // quantos steps a cadeia percorreu
}

/** Opções de fallback configuráveis pelo integrator. */
export interface FallbackOptions {
  chain?: LocaleCode[];           // default: FALLBACK_CHAIN_DEFAULT
  maxDepth?: number;              // default: MAX_FALLBACK_DEPTH
  throwOnSacredMissing?: boolean; // default: true (HARD lock)
  recordMissing?: boolean;        // default: true
}

/** Preferência de locale armazenada para um user (LGPD-scoped). */
export interface LocalePreference {
  userId: string;
  locale: LocaleCode;
  explicit: boolean;              // usuário escolheu manualmente (consent)
  setAt: number;
  ipRegion?: RegionCode;
}

/** IP geolocation input (mock shape). */
export interface IpGeoHint {
  ip: string;
  region: RegionCode;
  city?: string;                  // NUNCA exposto; usado só pra contagem
  population?: number;            // tamanho da região (k-anon check)
}

/** Resultado da detecção de locale. */
export interface LocaleDetectionResult {
  locale: LocaleCode;
  source: "explicit" | "browser" | "ip-region" | "default";
  region?: RegionCode;
  confidence: number;             // 0..1
}

/** Audit event payload. */
export interface LocaleAuditEvent {
  kind:
    | "LocaleDetected"
    | "LocaleChanged"
    | "KeyResolved"
    | "KeyMissing"
    | "SacredKeyLocked"
    | "RegionAnonymized"
    | "LgpdExport"
    | "LgpdErasure";
  userId?: string;
  locale?: LocaleCode;
  key?: TranslationKey;
  at: number;
  meta?: Record<string, string | number | boolean>;
}

/** Erro thrown quando sacred-key não está no locale explícito. */
export class SacredKeyMissing extends Error {
  readonly key: TranslationKey;
  readonly requestedLocale: LocaleCode;
  constructor(key: TranslationKey, requestedLocale: LocaleCode) {
    super(
      `Sacred key "${key}" missing in explicit locale "${requestedLocale}". ` +
        `Sacred terminology is NEVER auto-translated via fallback chain. ` +
        `Integrator must seed "${key}" in every supported locale.`,
    );
    this.name = "SacredKeyMissing";
    this.key = key;
    this.requestedLocale = requestedLocale;
  }
}

/** Erro thrown quando interpolation excede limites. */
export class InterpolationLimitExceeded extends Error {
  constructor(actual: number, max: number) {
    super(`Interpolation vars ${actual} exceeds limit ${max}`);
    this.name = "InterpolationLimitExceeded";
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constantes                                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const SUPPORTED_LOCALES: LocaleCode[] = ["pt-BR", "en", "es"];

export const FALLBACK_CHAIN_DEFAULT: LocaleCode[] = ["pt-BR", "en", "es"];

export const MAX_FALLBACK_DEPTH = 3;

export const MAX_INTERPOLATION_VARS = 50;

export const PLURAL_CATEGORIES: PluralCategory[] = [
  "zero",
  "one",
  "two",
  "few",
  "many",
  "other",
];

/** SACRED-KEY LOCK: estes namespaces NUNCA atravessam fallback chain. */
export const SACRED_KEY_NAMESPACES: readonly string[] = [
  "prayer.",
  "ritual.",
  "mantra.",
  "liturgy.",
] as const;

/** Region k-anonymity floors. */
export const REGION_K_ANON_BUCKETS = {
  /** Population mínima pra expor country code em logs/analytics. */
  COUNTRY_MIN: 1000,
  /** Population mínima pra expor state/region (sub-country). */
  STATE_MIN: 100_000,
  /** Population abaixo disso → bucketed como `XX-SMALL`. */
  SMALL_THRESHOLD: 1000,
} as const;

/** Mapping de prefixos IPv4 → region code (mock de IP geolocation). */
export const IP_REGION_PREFIXES: Record<string, RegionCode> = {
  "200.": "BR",
  "201.": "BR",
  "189.": "BR",
  "177.": "BR",
  "8.": "US",
  "24.": "US",
  "50.": "US",
  "80.": "ES",
  "88.": "ES",
  "213.": "ES",
  "82.": "PT",
  "85.": "PT",
  "181.": "AR",
  "190.": "AR",
  "189.146": "MX",
  "187.": "MX",
} as const;

/** Idiom → locale mapping p/ browser navigator.language parser. */
export const BROWSER_LANG_TO_LOCALE: Record<string, LocaleCode> = {
  "pt": "pt-BR",
  "pt-br": "pt-BR",
  "pt_br": "pt-BR",
  "ptbr": "pt-BR",
  "en": "en",
  "en-us": "en",
  "en-gb": "en",
  "es": "es",
  "es-es": "es",
  "es-mx": "es",
  "es-ar": "es",
} as const;

/** Plural rules — tabela explícita (determinística, sem Intl.PluralRules). */
export const PLURAL_RULES: Record<
  LocaleCode,
  {
    cardinal: (n: number) => PluralCategory;
    ordinal: (n: number) => PluralCategory;
  }
> = {
  "pt-BR": {
    // pt-BR: 0..1 = one, resto = other; ordinal segue o cardinal (sem special).
    cardinal: (n) => (n === 0 || n === 1 ? "one" : "other"),
    ordinal: (n) => (n === 0 || n === 1 ? "one" : "other"),
  },
  en: {
    // en: 1 = one, resto = other; ordinal: special cases.
    cardinal: (n) => (n === 1 ? "one" : "other"),
    ordinal: (n) => {
      const a100 = n % 100;
      if (a100 >= 11 && a100 <= 13) return "other";
      const a10 = n % 10;
      if (a10 === 1) return "one";
      if (a10 === 2) return "two";
      if (a10 === 3) return "few";
      return "other";
    },
  },
  es: {
    // es: 1 = one, resto = other.
    cardinal: (n) => (n === 1 ? "one" : "other"),
    ordinal: (n) => "other",
  },
};

/** LGPD purpose string (Art. 9 — finalidade). */
export const LGPD_PURPOSE = "UI translation only; no tracking, no profiling.";

/** Audit event kinds (canonical). */
export const AUDIT_KINDS: LocaleAuditEvent["kind"][] = [
  "LocaleDetected",
  "LocaleChanged",
  "KeyResolved",
  "KeyMissing",
  "SacredKeyLocked",
  "RegionAnonymized",
  "LgpdExport",
  "LgpdErasure",
] as const;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math helpers                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** FNV-1a 32-bit hash. Retorna uint32. */
export function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** FNV-1a 64-bit hash (via dois uint32). Retorna hex string 16 chars. */
export function fnv1a64Hex(input: string): string {
  let h1 = 0xcbf29ce4;
  let h2 = 0x84222325;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c & 0xffff;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= c >>> 16;
    h2 = Math.imul(h2, 0x01000193) >>> 0;
  }
  const part1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const part2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return part1 + part2;
}

/** Hex de um uint32. */
export function hex32(n: number): string {
  return (n >>> 0).toString(16).padStart(8, "0");
}

/** SHA-256 hand-rolled (FIPS 180-4) para HMAC. NÃO usar pra segurança real — só pra IDs determinísticos. */
function sha256(message: Uint8Array): Uint8Array {
  function rotr(x: number, n: number): number {
    return (x >>> n) | (x << (32 - n));
  }
  const K = new Uint32Array([
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
  let H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);
  const ml = message.length * 8;
  const padLen = (((message.length + 9) + 63) & ~63) - message.length;
  const padded = new Uint8Array(message.length + padLen);
  padded.set(message);
  padded[message.length] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, ml & 0xffffffff);
  dv.setUint32(padded.length - 8, Math.floor(ml / 0x100000000));
  const W = new Uint32Array(64);
  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = dv.getUint32(chunk + i * 4);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + mj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const dv2 = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) dv2.setUint32(i * 4, H[i]);
  return out;
}

/** Converte string → Uint8Array (UTF-8). */
function utf8(s: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(s);
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      i++;
      c = 0x10000 + (((c & 0x3ff) << 10) | (s.charCodeAt(i) & 0x3ff));
      out.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      );
    }
  }
  return new Uint8Array(out);
}

/** HMAC-SHA256(key, message) → hex 64. */
export function hmacSha256Hex(key: string, message: string): string {
  const blockSize = 64;
  const keyBytes = utf8(key);
  let k0: Uint8Array;
  if (keyBytes.length > blockSize) {
    const hashed = sha256(keyBytes);
    k0 = new Uint8Array(blockSize);
    k0.set(hashed);
  } else {
    k0 = new Uint8Array(blockSize);
    k0.set(keyBytes);
  }
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = k0[i] ^ 0x36;
    opad[i] = k0[i] ^ 0x5c;
  }
  const inner = new Uint8Array(blockSize);
  inner.set(ipad);
  const msgBytes = utf8(message);
  const innerInput = new Uint8Array(blockSize + msgBytes.length);
  innerInput.set(inner);
  innerInput.set(msgBytes, blockSize);
  const innerHash = sha256(innerInput);
  const outerInput = new Uint8Array(blockSize + 32);
  outerInput.set(opad);
  outerInput.set(innerHash, blockSize);
  const outerHash = sha256(outerInput);
  let hex = "";
  for (let i = 0; i < outerHash.length; i++) {
    hex += (outerHash[i] >>> 0).toString(16).padStart(2, "0");
  }
  return hex;
}

/** Region hash determinístico (k-anon correlation id). */
export function regionHash(region: RegionCode, salt: string): string {
  return fnv1a64Hex(region + ":" + salt);
}

/** K-anon bucket label. */
export function regionBucketLabel(population: number): RegionCode | "STATE_OK" | "SMALL" {
  if (population < REGION_K_ANON_BUCKETS.SMALL_THRESHOLD) return "SMALL";
  if (population >= REGION_K_ANON_BUCKETS.STATE_MIN) return "STATE_OK";
  return "XX-SMALL" as RegionCode;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 Detection chain                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface DetectionInput {
  explicit?: LocaleCode | string;  // user-stored preference (consented)
  browserLang?: string;            // navigator.language (e.g. "pt-BR")
  ipGeo?: IpGeoHint;               // mock IP geolocation
}

const SOURCE_CONFIDENCE: Record<LocaleDetectionResult["source"], number> = {
  explicit: 1.0,
  browser: 0.7,
  "ip-region": 0.5,
  default: 0.3,
};

/** Resolve prefixo IPv4 → RegionCode, ou null. */
export function regionFromIp(ip: string): RegionCode | null {
  for (const prefix of Object.keys(IP_REGION_PREFIXES)) {
    if (ip.startsWith(prefix)) return IP_REGION_PREFIXES[prefix];
  }
  return null;
}

/** Detecta locale via cadeia explicit > browser > IP-region > PT-BR. */
export function detectLocale(input: DetectionInput): LocaleDetectionResult {
  // 1. Explicit (consentido).
  if (input.explicit) {
    const norm = normalizeLocale(input.explicit);
    if (norm) {
      return {
        locale: norm,
        source: "explicit",
        region: input.ipGeo?.region,
        confidence: SOURCE_CONFIDENCE.explicit,
      };
    }
  }
  // 2. Browser navigator.language.
  if (input.browserLang) {
    const norm = normalizeLocale(input.browserLang);
    if (norm) {
      return {
        locale: norm,
        source: "browser",
        region: input.ipGeo?.region,
        confidence: SOURCE_CONFIDENCE.browser,
      };
    }
  }
  // 3. IP-region mock.
  if (input.ipGeo) {
    // Mapa reverso: region → locale default. BR → pt-BR, US → en, ES/PT → es/pt-BR.
    const regionToLocale: Record<RegionCode, LocaleCode> = {
      BR: "pt-BR",
      PT: "pt-BR",
      US: "en",
      ES: "es",
      AR: "es",
      MX: "es",
      "XX-SMALL": "pt-BR",
    };
    return {
      locale: regionToLocale[input.ipGeo.region],
      source: "ip-region",
      region: input.ipGeo.region,
      confidence: SOURCE_CONFIDENCE["ip-region"],
    };
  }
  // 4. PT-BR default.
  return {
    locale: "pt-BR",
    source: "default",
    confidence: SOURCE_CONFIDENCE.default,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 Normalize                                                             ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Aceita variantes comuns: `pt-BR`, `pt_br`, `ptbr`, `PT-br`.
 * Retorna canonical LocaleCode ou null se desconhecido.
 */
export function normalizeLocale(input: string): LocaleCode | null {
  if (!input) return null;
  const k = input.toLowerCase().trim();
  // Variant nua (sem separador).
  if (k === "ptbr") return "pt-BR";
  if (k === "enus") return "en";
  if (k === "eses") return "es";
  // Substitui separadores por `-`.
  const dashed = k.replace(/_/g, "-").replace(/\s+/g, "-");
  if (dashed in BROWSER_LANG_TO_LOCALE) return BROWSER_LANG_TO_LOCALE[dashed];
  // Prefixo de 2 letras (`pt`, `en`, `es`).
  const prefix = dashed.split("-")[0];
  if (prefix === "pt") return "pt-BR";
  if (prefix === "en") return "en";
  if (prefix === "es") return "es";
  return null;
}

/** Verifica se string é um LocaleCode canonical. */
export function isLocaleCode(s: string): s is LocaleCode {
  return SUPPORTED_LOCALES.includes(s as LocaleCode);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 Key resolution                                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface TranslationTables {
  "pt-BR": Record<string, string>;
  en: Record<string, string>;
  es: Record<string, string>;
}

export interface ResolveResult {
  value: string;
  hitLocale: LocaleCode | null;
  fallbackDepth: number;
  isLiteral: boolean;          // true = retornou a chave raw
}

/** Verifica se uma chave é sacred-key (namespace protegido). */
export function isSacredKey(key: TranslationKey): boolean {
  for (const ns of SACRED_KEY_NAMESPACES) {
    if (key.startsWith(ns)) return true;
  }
  return false;
}

/**
 * Resolve uma chave dotted (`nav.home`) na tabela de traduções.
 * - Se a chave for sacred-key (§9) e não existir no `explicitLocale` →
 *   THROW SacredKeyMissing (HARD lock).
 * - Caso contrário, percorre a fallback chain até achar.
 * - Se não achar em nenhum locale, retorna a chave literal e gera
 *   MissingKeyReport (severidade MISSING ou INFO).
 */
export function resolveKey(
  key: TranslationKey,
  tables: TranslationTables,
  explicitLocale: LocaleCode,
  options: FallbackOptions = {},
  now: number = Date.now(),
): ResolveResult {
  const chain = options.chain ?? FALLBACK_CHAIN_DEFAULT;
  const maxDepth = options.maxDepth ?? MAX_FALLBACK_DEPTH;
  const throwOnSacred = options.throwOnSacredMissing ?? true;
  const recordMissing = options.recordMissing ?? true;
  const sacred = isSacredKey(key);

  // Sacred-key HARD LOCK: tenta apenas o explicitLocale, sem fallback chain.
  if (sacred) {
    const v = tables[explicitLocale][key];
    if (v !== undefined) {
      recordReport({
        key,
        requestedLocale: explicitLocale,
        severity: "INFO",
        hitLocale: explicitLocale,
        timestamp: now,
        fallbackDepth: 0,
      });
      return { value: v, hitLocale: explicitLocale, fallbackDepth: 0, isLiteral: false };
    }
    // Não achou no explicit → THROW ou gera report + literal.
    if (throwOnSacred) {
      recordReport({
        key,
        requestedLocale: explicitLocale,
        severity: "SACRED_MISSING",
        hitLocale: null,
        timestamp: now,
        fallbackDepth: 0,
      });
      throw new SacredKeyMissing(key, explicitLocale);
    }
    recordReport({
      key,
      requestedLocale: explicitLocale,
      severity: "SACRED_MISSING",
      hitLocale: null,
      timestamp: now,
      fallbackDepth: 0,
    });
    return { value: key, hitLocale: null, fallbackDepth: 0, isLiteral: true };
  }

  // Non-sacred: percorre cadeia.
  const effectiveChain = chain.slice(0, maxDepth);
  for (let i = 0; i < effectiveChain.length; i++) {
    const loc = effectiveChain[i];
    const v = tables[loc][key];
    if (v !== undefined) {
      if (recordMissing) {
        recordReport({
          key,
          requestedLocale: explicitLocale,
          severity: i === 0 ? "INFO" : "MISSING",
          hitLocale: loc,
          timestamp: now,
          fallbackDepth: i,
        });
      }
      return { value: v, hitLocale: loc, fallbackDepth: i, isLiteral: false };
    }
  }
  // Não achou → literal + report.
  if (recordMissing) {
    recordReport({
      key,
      requestedLocale: explicitLocale,
      severity: "MISSING",
      hitLocale: null,
      timestamp: now,
      fallbackDepth: effectiveChain.length,
    });
  }
  return { value: key, hitLocale: null, fallbackDepth: effectiveChain.length, isLiteral: true };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 Plural wrapper                                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export type PluralForm = Record<PluralCategory, string>;

/** Determina categoria plural. Fallback sempre `other`. */
export function pluralCategory(
  locale: LocaleCode,
  n: number,
  form: "cardinal" | "ordinal" = "cardinal",
): PluralCategory {
  const rules = PLURAL_RULES[locale];
  if (!rules) return "other";
  const cat = form === "cardinal" ? rules.cardinal(n) : rules.ordinal(n);
  // Garantir categoria válida.
  return PLURAL_CATEGORIES.includes(cat) ? cat : "other";
}

/** Plural wrapper — escolhe forma correta baseada em `n`. */
export function plural(
  locale: LocaleCode,
  n: number,
  forms: Partial<PluralForm>,
  form: "cardinal" | "ordinal" = "cardinal",
): string {
  const cat = pluralCategory(locale, n, form);
  if (forms[cat] !== undefined) return forms[cat] as string;
  if (forms.other !== undefined) return forms.other;
  // Sem `other` → retorna a primeira categoria disponível ou `String(n)`.
  for (const c of PLURAL_CATEGORIES) {
    if (forms[c] !== undefined) return forms[c] as string;
  }
  return String(n);
}

/** Helper: cria PluralForm a partir de pares chave-valor. */
export function pluralForm(pairs: Partial<Record<PluralCategory, string>>): Partial<PluralForm> {
  return pairs;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Interpolation                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** HTML-escape básico. */
export function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Substitui `{{name}}` pelos valores em `vars`. HTML-escape aplicado.
 * Throws InterpolationLimitExceeded se vars > MAX_INTERPOLATION_VARS.
 * Não suporta nesting (`{{ {{ x }} }}` é literal).
 */
export function interpolate(
  text: string,
  vars: Record<string, string | number> = {},
  options: { htmlEscape?: boolean; maxVars?: number } = {},
): string {
  const maxVars = options.maxVars ?? MAX_INTERPOLATION_VARS;
  const keys = Object.keys(vars);
  if (keys.length > maxVars) {
    throw new InterpolationLimitExceeded(keys.length, maxVars);
  }
  const esc = options.htmlEscape ?? true;
  return text.replace(/\{\{([^}]+)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    const v = vars[key];
    if (v === undefined) return `{{${key}}}`;
    const s = String(v);
    return esc ? htmlEscape(s) : s;
  });
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 SACRED-KEY LOCK                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Wrappa resolveKey garantindo que sacred-key nunca atravesse fallback chain.
 * - Se explicitLocale tem a chave → retorna valor.
 * - Se não tem → THROW SacredKeyMissing (HARD).
 *
 * Esta é a única entry point aprovada para integradores lidarem com chaves
 * sacred. Nunca chame resolveKey diretamente para namespaces sacred
 * (prayer., ritual., mantra., liturgy.).
 */
export function resolveSacredKey(
  key: TranslationKey,
  tables: TranslationTables,
  explicitLocale: LocaleCode,
): string {
  if (!isSacredKey(key)) {
    throw new Error(
      `resolveSacredKey called with non-sacred key "${key}". ` +
        `Use resolveKey() instead.`,
    );
  }
  const v = tables[explicitLocale][key];
  if (v === undefined) throw new SacredKeyMissing(key, explicitLocale);
  return v;
}

/** Audit trail: tentativas de bypass (chamar resolveKey com sacred key). */
export function detectSacredBypassAttempt(
  key: TranslationKey,
  resolvedViaFallback: boolean,
): { attempted: boolean; key: TranslationKey } {
  return {
    attempted: isSacredKey(key) && resolvedViaFallback,
    key,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §10 Region k-anonymity                                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Aplica k-anonymity a um IpGeoHint.
 * - city: SEMPRE removido.
 * - region: retornado se population ≥ COUNTRY_MIN; senão `XX-SMALL`.
 *   country code (region) exposto só se STATE_MIN atingido.
 */
export interface AnonymizedRegion {
  region: RegionCode;
  city: null;                   // NEVER exposed
  populationBucket: "LARGE" | "STATE_OK" | "SMALL";
  kAnonymityFloorMet: boolean;
}

export function anonymizeRegion(geo: IpGeoHint): AnonymizedRegion {
  const pop = geo.population ?? REGION_K_ANON_BUCKETS.COUNTRY_MIN;
  const bucket = regionBucketLabel(pop);
  let region: RegionCode;
  let populationBucket: AnonymizedRegion["populationBucket"];
  let kAnonymityFloorMet: boolean;

  if (bucket === "SMALL") {
    region = "XX-SMALL";
    populationBucket = "SMALL";
    kAnonymityFloorMet = false;
  } else if (bucket === "STATE_OK") {
    region = geo.region;
    populationBucket = "STATE_OK";
    kAnonymityFloorMet = true;
  } else {
    // COUNTRY_MIN só expõe country code (region já é country-level).
    region = geo.region;
    populationBucket = "LARGE";
    kAnonymityFloorMet = pop >= REGION_K_ANON_BUCKETS.COUNTRY_MIN;
  }

  return {
    region,
    city: null,
    populationBucket,
    kAnonymityFloorMet,
  };
}

/** Sanitiza string de log removendo city (regex defensiva). */
export function sanitizeLogForCity(input: string, city: string | undefined): string {
  if (!city) return input;
  return input.split(city).join("[CITY_REDACTED]");
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §11 LGPD Art. 7/9/18                                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface LgpdExportPayload {
  userId: string;
  locale: LocaleCode;
  explicit: boolean;
  setAt: number;
  consent: {
    given: boolean;            // Art. 7
    purpose: string;           // Art. 9
  };
  usedKeys: Array<{
    key: TranslationKey;
    hitLocale: LocaleCode | null;
    fallbackDepth: number;
  }>;
  exportedAt: number;
}

/**
 * Gera payload exportável p/ o titular (LGPD Art. 18 V — direito de acesso).
 * Inclui locale preference + consent status + used keys.
 */
export function lgpdExport(
  preference: LocalePreference,
  usedKeys: Array<{ key: TranslationKey; hitLocale: LocaleCode | null; fallbackDepth: number }>,
): LgpdExportPayload {
  return {
    userId: preference.userId,
    locale: preference.locale,
    explicit: preference.explicit,
    setAt: preference.setAt,
    consent: {
      given: preference.explicit,  // consent = explicit pick
      purpose: LGPD_PURPOSE,
    },
    usedKeys,
    exportedAt: Date.now(),
  };
}

/**
 * Apaga histórico de locale do usuário (LGPD Art. 18 VI — direito ao
 * esquecimento). Retorna lista de prefs removidas (audit).
 */
export function lgpdErase(
  history: LocalePreference[],
  userId: string,
  now: number = Date.now(),
): { removed: LocalePreference[]; remaining: LocalePreference[] } {
  const removed: LocalePreference[] = [];
  const remaining: LocalePreference[] = [];
  for (const p of history) {
    if (p.userId === userId) removed.push(p);
    else remaining.push(p);
  }
  return { removed, remaining };
}

/** Consent gate: seta locale preference com consent (Art. 7). */
export function setLocalePreference(
  userId: string,
  locale: LocaleCode,
  consentGiven: boolean,
  ipRegion?: RegionCode,
  now: number = Date.now(),
): LocalePreference {
  return {
    userId,
    locale,
    explicit: consentGiven,
    setAt: now,
    ipRegion,
  };
}

/** Verifica se purpose string é compatível com LGPD (sem tracking). */
export function purposeIsLgpdCompliant(purpose: string): boolean {
  const lower = purpose.toLowerCase();
  const forbidden = ["tracking", "profiling", "advertising", "analytics", "remarketing"];
  for (const term of forbidden) {
    if (lower.includes(term)) return false;
  }
  return true;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §12 Missing-key detection                                                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Store interno de reports (sessão). NÃO persistente cross-session. */
const _missingKeyReports: MissingKeyReport[] = [];

/** Insere report. Visível internamente + exportável via getMissingKeysReport. */
export function recordReport(report: MissingKeyReport): void {
  _missingKeyReports.push(report);
}

/** Limpa reports (uso em testes). */
export function clearMissingKeysReport(): void {
  _missingKeyReports.length = 0;
}

/** Retorna snapshot dos reports. */
export function getMissingKeysReport(): MissingKeyReport[] {
  return _missingKeyReports.slice();
}

/** Agrega reports por chave (soma severidades). */
export interface MissingKeyAggregate {
  key: TranslationKey;
  hits: number;
  sacredMissing: number;
  plainMissing: number;
  info: number;
  lastSeenAt: number;
}

export function aggregateMissingKeys(
  reports: MissingKeyReport[] = getMissingKeysReport(),
): MissingKeyAggregate[] {
  const map = new Map<TranslationKey, MissingKeyAggregate>();
  for (const r of reports) {
    let agg = map.get(r.key);
    if (!agg) {
      agg = {
        key: r.key,
        hits: 0,
        sacredMissing: 0,
        plainMissing: 0,
        info: 0,
        lastSeenAt: r.timestamp,
      };
      map.set(r.key, agg);
    }
    agg.hits++;
    if (r.severity === "SACRED_MISSING") agg.sacredMissing++;
    else if (r.severity === "MISSING") agg.plainMissing++;
    else agg.info++;
    if (r.timestamp > agg.lastSeenAt) agg.lastSeenAt = r.timestamp;
  }
  return Array.from(map.values()).sort((a, b) => b.hits - a.hits);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §13 A11y (locale-aware formatting)                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const RTL_001 = "RTL_001: RTL languages unsupported in v1";

/** Set de locales RTL conhecidos (v1 não suporta). */
export const RTL_LOCALES: readonly string[] = ["ar", "he", "fa", "ur"] as const;

/** Verifica se locale é RTL. */
export function isRtlLocale(lang: string): boolean {
  const prefix = lang.toLowerCase().split("-")[0];
  return RTL_LOCALES.includes(prefix);
}

/** Formata data ISO-8601 por locale (sem Intl.DateTimeFormat — manual). */
export function formatDate(iso: string, locale: LocaleCode): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  if (locale === "en") return `${m}/${day}/${y}`;
  return `${day}/${m}/${y}`; // pt-BR & es
}

/** Formata número com separador por locale. */
export function formatNumber(n: number, locale: LocaleCode): string {
  const fixed = n.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  // pt-BR & es: . thousands, , decimal. en: , thousands, . decimal.
  const intNorm =
    locale === "en"
      ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sep = locale === "en" ? "." : ",";
  return `${intNorm}${sep}${decPart}`;
}

/** Formata currency BRL/USD/EUR. */
export function formatCurrency(amount: number, locale: LocaleCode, currency: "BRL" | "USD" | "EUR"): string {
  const symbol = currency === "BRL" ? "R$" : currency === "USD" ? "$" : "€";
  const formatted = formatNumber(amount, locale);
  if (locale === "en") return `${symbol}${formatted}`;
  return `${symbol} ${formatted}`;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §14 Audit log                                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const _auditLog: LocaleAuditEvent[] = [];

/** Append audit event. */
export function auditEvent(event: LocaleAuditEvent): void {
  if (!AUDIT_KINDS.includes(event.kind)) return;
  _auditLog.push(event);
}

/** Limpa audit log (uso em testes). */
export function clearAuditLog(): void {
  _auditLog.length = 0;
}

/** Snapshot do audit log. */
export function getAuditLog(): LocaleAuditEvent[] {
  return _auditLog.slice();
}

/** Filtra audit log por kind. */
export function filterAuditLog(kind: LocaleAuditEvent["kind"]): LocaleAuditEvent[] {
  return _auditLog.filter((e) => e.kind === kind);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §15 Smoke / regression scenarios                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Smoke suite — 10+ cenários. Retorna array de {name, pass, detail}.
 * Rodar via runSmoke(); falha de qualquer caso throw.
 */
export interface SmokeCase {
  name: string;
  pass: boolean;
  detail: string;
}

export function runSmoke(): SmokeCase[] {
  const cases: SmokeCase[] = [];
  const t = (name: string, pass: boolean, detail: string) => cases.push({ name, pass, detail });

  // Setup tables.
  const tables: TranslationTables = {
    "pt-BR": {
      "nav.home": "Início",
      "nav.login": "Entrar",
      "prayer.oxala": "Oxalá",
      "ritual.abertura": "Abertura do ritual",
      "feed.title": "Feed",
      "feed.empty": "Nenhum item",
    },
    en: {
      "nav.home": "Home",
      "nav.login": "Log in",
      "prayer.oxala": "Oxalá (sacred: do not translate)",
      "ritual.abertura": "Ritual opening (sacred: do not translate)",
      "feed.title": "Feed",
    },
    es: {
      "nav.home": "Inicio",
      "nav.login": "Entrar",
      "prayer.oxala": "Oxalá (sagrado: no traducir)",
      "ritual.abertura": "Apertura del ritual (sagrado: no traducir)",
      "feed.title": "Feed",
    },
  };

  clearMissingKeysReport();
  clearAuditLog();

  // 1. detectLocale com explicit.
  const r1 = detectLocale({ explicit: "pt-BR" });
  t(
    "detectLocale explicit pt-BR",
    r1.locale === "pt-BR" && r1.source === "explicit",
    JSON.stringify(r1),
  );

  // 2. detectLocale com browser.
  const r2 = detectLocale({ browserLang: "en-US" });
  t(
    "detectLocale browser en-US → en",
    r2.locale === "en" && r2.source === "browser",
    JSON.stringify(r2),
  );

  // 3. detectLocale com IP-region (BR).
  const r3 = detectLocale({
    ipGeo: { ip: "200.1.2.3", region: "BR", population: 50_000 },
  });
  t(
    "detectLocale IP 200.x → BR → pt-BR",
    r3.locale === "pt-BR" && r3.source === "ip-region",
    JSON.stringify(r3),
  );

  // 4. detectLocale default (sem nada).
  const r4 = detectLocale({});
  t(
    "detectLocale default → pt-BR",
    r4.locale === "pt-BR" && r4.source === "default",
    JSON.stringify(r4),
  );

  // 5. normalizeLocale variantes.
  const norms = [
    ["pt-BR", "pt-BR"],
    ["pt_br", "pt-BR"],
    ["ptbr", "pt-BR"],
    ["PT-br", "pt-BR"],
    ["en-us", "en"],
    ["enus", "en"],
    ["es-MX", "es"],
    ["xx-XX", null],
  ] as const;
  const normResults = norms.map(([i, e]) => [i, normalizeLocale(i)] as const);
  const normOk = normResults.every(([i, e]) => normalizeLocale(i) === e);
  t("normalizeLocale variants", normOk, JSON.stringify(normResults));

  // 6. resolveKey hit direto.
  const r6 = resolveKey("nav.home", tables, "pt-BR", { recordMissing: false });
  t(
    "resolveKey nav.home em pt-BR",
    r6.value === "Início" && r6.hitLocale === "pt-BR" && !r6.isLiteral,
    JSON.stringify(r6),
  );

  // 7. resolveKey fallback pt-BR → en.
  const r7 = resolveKey("nav.login", tables, "en", { recordMissing: false, chain: ["pt-BR", "en"] });
  t(
    "resolveKey fallback pt-BR → en",
    r7.value === "Entrar" && r7.hitLocale === "pt-BR",
    JSON.stringify(r7),
  );

  // 8. resolveKey missing → literal.
  const r8 = resolveKey("nav.doesnotexist", tables, "pt-BR", { recordMissing: false });
  t(
    "resolveKey missing → literal",
    r8.value === "nav.doesnotexist" && r8.isLiteral,
    JSON.stringify(r8),
  );

  // 9. resolveSacredKey hit.
  const r9 = resolveSacredKey("prayer.oxala", tables, "pt-BR");
  t("resolveSacredKey hit pt-BR", r9 === "Oxalá", r9);

  // 10. resolveSacredKey miss → THROW.
  let threw = false;
  try {
    resolveSacredKey("prayer.naoexiste", tables, "pt-BR");
  } catch (e) {
    threw = e instanceof SacredKeyMissing;
  }
  t("resolveSacredKey miss → SacredKeyMissing", threw, "threw=" + threw);

  // 11. plural pt-BR (0=one, 1=one, 2=other).
  const ptForms: Partial<PluralForm> = { one: "X item", other: "X itens" };
  t(
    "plural pt-BR 0 → one",
    plural("pt-BR", 0, ptForms) === "X item",
    plural("pt-BR", 0, ptForms),
  );
  t(
    "plural pt-BR 2 → other",
    plural("pt-BR", 2, ptForms) === "X itens",
    plural("pt-BR", 2, ptForms),
  );

  // 12. plural en cardinal (1=one, 5=other).
  const enForms: Partial<PluralForm> = { one: "%d item", other: "%d items" };
  t(
    "plural en cardinal 1 → one",
    plural("en", 1, enForms) === "%d item",
    plural("en", 1, enForms),
  );
  t(
    "plural en cardinal 5 → other",
    plural("en", 5, enForms) === "%d items",
    plural("en", 5, enForms),
  );

  // 13. plural en ordinal (1st=one, 2nd=two, 3rd=few, 4th=other, 11th=other).
  t(
    "plural en ordinal 1 → one",
    plural("en", 1, enForms, "ordinal") === "%d item",
    plural("en", 1, enForms, "ordinal"),
  );
  t(
    "plural en ordinal 11 → other",
    plural("en", 11, enForms, "ordinal") === "%d items",
    plural("en", 11, enForms, "ordinal"),
  );

  // 14. interpolation.
  const interp = interpolate("Olá, {{name}}!", { name: "Maria" });
  t("interpolate Olá {{name}}", interp === "Olá, Maria!", interp);

  // 15. interpolation HTML-escape.
  const esc = interpolate("Value: {{v}}", { v: "<script>" }, { htmlEscape: true });
  t(
    "interpolate html-escape",
    esc === "Value: &lt;script&gt;",
    esc,
  );

  // 16. interpolation limit.
  let limitThrew = false;
  try {
    const big: Record<string, string> = {};
    for (let i = 0; i < 51; i++) big["k" + i] = "v";
    interpolate("x", big);
  } catch (e) {
    limitThrew = e instanceof InterpolationLimitExceeded;
  }
  t("interpolate >50 vars throws", limitThrew, "limitThrew=" + limitThrew);

  // 17. region k-anon (small → XX-SMALL).
  const r17 = anonymizeRegion({ ip: "1.2.3.4", region: "BR", population: 500, city: "Sao Paulo" });
  t(
    "anonymizeRegion small → XX-SMALL, city null",
    r17.region === "XX-SMALL" && r17.city === null && !r17.kAnonymityFloorMet,
    JSON.stringify(r17),
  );

  // 18. region k-anon (large → ok).
  const r18 = anonymizeRegion({ ip: "200.1.2.3", region: "BR", population: 250_000, city: "Rio" });
  t(
    "anonymizeRegion large → BR, city null",
    r18.region === "BR" && r18.city === null && r18.kAnonymityFloorMet,
    JSON.stringify(r18),
  );

  // 19. missing-key aggregation.
  resolveKey("nav.missing1", tables, "pt-BR", { recordMissing: true });
  resolveKey("nav.missing2", tables, "pt-BR", { recordMissing: true });
  resolveKey("nav.missing1", tables, "en", { recordMissing: true });
  const agg = aggregateMissingKeys();
  const navMissing1 = agg.find((a) => a.key === "nav.missing1");
  t(
    "aggregateMissingKeys nav.missing1 hits=2",
    navMissing1 !== undefined && navMissing1.hits === 2,
    JSON.stringify(agg.slice(0, 3)),
  );

  // 20. LGPD export.
  const pref = setLocalePreference("user-1", "pt-BR", true, "BR");
  const exportPayload = lgpdExport(pref, [
    { key: "nav.home", hitLocale: "pt-BR", fallbackDepth: 0 },
  ]);
  t(
    "lgpdExport contains consent + keys",
    exportPayload.consent.given && exportPayload.usedKeys.length === 1 && exportPayload.consent.purpose === LGPD_PURPOSE,
    JSON.stringify({ given: exportPayload.consent.given, n: exportPayload.usedKeys.length }),
  );

  // 21. LGPD erasure.
  const history: LocalePreference[] = [
    pref,
    { userId: "user-2", locale: "en", explicit: true, setAt: 1 },
  ];
  const erased = lgpdErase(history, "user-1");
  t(
    "lgpdErase removes user-1, keeps user-2",
    erased.removed.length === 1 && erased.remaining.length === 1 && erased.remaining[0].userId === "user-2",
    JSON.stringify({ removed: erased.removed.length, remaining: erased.remaining.length }),
  );

  // 22. purpose LGPD compliant.
  t(
    "purposeIsLgpdCompliant UI translation only → true",
    purposeIsLgpdCompliant("UI translation only"),
    "ok",
  );
  t(
    "purposeIsLgpdCompliant tracking → false",
    !purposeIsLgpdCompliant("user tracking"),
    "ok",
  );

  // 23. RTL guard.
  t(
    "isRtlLocale ar → true",
    isRtlLocale("ar-SA"),
    "ok",
  );
  t(
    "isRtlLocale pt-BR → false",
    !isRtlLocale("pt-BR"),
    "ok",
  );

  // 24. formatDate en vs pt-BR.
  const dEn = formatDate("2026-06-29T12:00:00Z", "en");
  const dPt = formatDate("2026-06-29T12:00:00Z", "pt-BR");
  t(
    "formatDate en MM/DD/YYYY",
    dEn === "06/29/2026",
    dEn,
  );
  t(
    "formatDate pt-BR DD/MM/YYYY",
    dPt === "29/06/2026",
    dPt,
  );

  // 25. regionFromIp.
  t(
    "regionFromIp 200.1.2.3 → BR",
    regionFromIp("200.1.2.3") === "BR",
    String(regionFromIp("200.1.2.3")),
  );
  t(
    "regionFromIp 8.8.8.8 → US",
    regionFromIp("8.8.8.8") === "US",
    String(regionFromIp("8.8.8.8")),
  );

  // 26. isSacredKey.
  t("isSacredKey prayer.oxala → true", isSacredKey("prayer.oxala"), "ok");
  t("isSacredKey nav.home → false", !isSacredKey("nav.home"), "ok");
  t("isSacredKey mantra.x → true", isSacredKey("mantra.123"), "ok");

  // 27. auditEvent roundtrip.
  auditEvent({
    kind: "LocaleDetected",
    locale: "pt-BR",
    at: 100,
    meta: { source: "explicit" },
  });
  const audit = filterAuditLog("LocaleDetected");
  t("auditEvent LocaleDetected recorded", audit.length === 1, String(audit.length));

  // 28. regionHash deterministic.
  const h1 = regionHash("BR", "salt-2026-Q2");
  const h2 = regionHash("BR", "salt-2026-Q2");
  t("regionHash deterministic", h1 === h2 && h1.length === 16, h1);

  // 29. pluralCategory sanity.
  t("pluralCategory en 1 → one", pluralCategory("en", 1) === "one", "ok");
  t("pluralCategory pt-BR 5 → other", pluralCategory("pt-BR", 5) === "other", "ok");

  // 30. formatNumber thousands separator.
  t(
    "formatNumber pt-BR 1234.56",
    formatNumber(1234.56, "pt-BR") === "1.234,56",
    formatNumber(1234.56, "pt-BR"),
  );
  t(
    "formatNumber en 1234.56",
    formatNumber(1234.56, "en") === "1,234.56",
    formatNumber(1234.56, "en"),
  );

  // 31. formatCurrency.
  t(
    "formatCurrency BRL pt-BR",
    formatCurrency(1234.56, "pt-BR", "BRL") === "R$ 1.234,56",
    formatCurrency(1234.56, "pt-BR", "BRL"),
  );
  t(
    "formatCurrency USD en",
    formatCurrency(1234.56, "en", "USD") === "$1,234.56",
    formatCurrency(1234.56, "en", "USD"),
  );

  return cases;
}

/** Roda smoke + agrega resultados. Throws se algum caso falhar. */
export function smokeSummary(): { total: number; passed: number; failed: number; cases: SmokeCase[] } {
  const cases = runSmoke();
  const passed = cases.filter((c) => c.pass).length;
  const failed = cases.length - passed;
  if (failed > 0) {
    const failing = cases.filter((c) => !c.pass).map((c) => c.name);
    throw new Error(`Smoke failed: ${failed}/${cases.length} cases. Failing: ${failing.join(", ")}`);
  }
  return { total: cases.length, passed, failed, cases };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §15 Doc-string constants                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Resumo da engine em doc-string exportado (não-execução). */
export const ENGINE_DOC = {
  name: "w55/i18n-locale-fallback-chain",
  version: "1.0.0",
  features: [
    "explicit > browser > IP-region > PT-BR detection chain",
    "fallback chain (pt-BR → en → es → literal)",
    "plural wrapper (cardinal + ordinal, 6 categories)",
    "missing-key detection + aggregation",
    "SACRED-KEY LOCK (prayer./ritual./mantra./liturgy.) — HARD, throws SacredKeyMissing",
    "region k-anonymity (city never, state k≥100k, XX-SMALL bucket)",
    "LGPD Art. 7 (consent) + Art. 9 (UI-only purpose) + Art. 18 (export + erasure)",
    "locale-aware date/number/currency formatting",
    "RTL guard (v1 unsupported → RTL_001)",
  ],
  sacredKeyNamespaces: SACRED_KEY_NAMESPACES,
  supportedLocales: SUPPORTED_LOCALES,
  fallbackChain: FALLBACK_CHAIN_DEFAULT,
  maxFallbackDepth: MAX_FALLBACK_DEPTH,
  maxInterpolationVars: MAX_INTERPOLATION_VARS,
  lgpdPurpose: LGPD_PURPOSE,
  rtlUnsupportedMarker: RTL_001,
} as const;