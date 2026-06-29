// ============================================================================
// AKASHA SESSION EXPORT ENGINE — Wave 64
// ============================================================================
// Engine para exportação de sessões Akasha (leitura completa do consulente)
// em 4 formatos: Markdown, JSON, HTML e PDFMetadata (estrutura, não bytes).
//
// LGPD Art. 9 — Dados sensíveis:
//   - Funções redact*() aplicam 5 padrões (CPF, email, phone, address, name).
//   - Sacred refs (Cartas Ciganas 1-36, Orixás, Sefirot) NÃO são PII e devem
//     ser preservados intactos.
//   - Audit chain via HMAC-SHA256 (Web Crypto API / node:crypto built-in).
//     NÃO usamos FNV-1a como fallback (lesson cycle 60 — FNV ≠ HMAC).
//
// Escopo:
//   - Engine pura (sem I/O real de arquivos).
//   - loadSession() é stub — retorna null para ids desconhecidos.
//   - PDF é só metadata; bytes PDF ficam para biblioteca downstream.
// ============================================================================

// SECTION 1 — Types
export type SessionId = string & { readonly __brand: "SessionId" };
export type ExportFormat = "md" | "json" | "html" | "pdf-metadata";
export type TraditionId =
  | "candomble" | "umbanda" | "ifa" | "cabala" | "astrologia"
  | "numerologia" | "tantra" | "yoga" | "budismo" | "kimbanda"
  | "espiritismo" | "open";

export interface CardRef {
  cardId: number;
  house: number;
  orientation?: "upright" | "reversed";
}
export interface CardInterpretation {
  cardId: number;
  house: number;
  text: string;
  citations?: string[];
  sacredRefs?: string[];
}
export interface MesaRealReading {
  centerHouse: number;
  theme: string;
  perHouseText: Record<number, string>;
  crosses?: Array<{ fromHouse: number; toHouse: number; theme: string }>;
}
export interface JournalEntry {
  id: string;
  timestamp: string;
  type: "reflection" | "action" | "insight" | "sync";
  text: string;
}
export interface Session {
  id: SessionId;
  askerPseudonym: string;
  askerTradition?: TraditionId;
  question: string;
  cards: CardRef[];
  interpretations: CardInterpretation[];
  mesaReal?: MesaRealReading;
  audioTranscript?: string;
  journal: JournalEntry[];
  createdAt: string;
  locale: "pt-BR" | "en" | "es";
}
export interface ExportOpts {
  redactPII: boolean;
  includeAudioTranscript: boolean;
  includeJournal: boolean;
  includeCitations: boolean;
  signatureSecret?: string;
  maxAudioLines?: number;
}
export interface RedactReport {
  totalRedactions: number;
  byCategory: Record<"cpf" | "email" | "phone" | "address" | "name", number>;
  piiLeakCheck: "pass" | "fail" | "unknown";
}
export interface ExportArtifact {
  format: ExportFormat;
  content: string;
  contentLength: number;
  redactionReport: RedactReport;
  citationCount: number;
  sacredRefCount: number;
  integrityHash?: string;
  generatedAt: string;
}
export interface PDFMetadata {
  format: "pdf-metadata";
  pageTitle: string;
  author: string;
  subject: string;
  keywords: string[];
  pageCount: number;
  estimatedSizeBytes: number;
  sections: Array<{
    heading: string;
    bodyLength: number;
    sacredRefs: string[];
  }>;
  rawMarkdown: string;
}
export interface RedactOpts {
  knownNames?: string[];
  preserveSacred?: boolean;
}
export interface RedactResult {
  text: string;
  redactions: Array<{
    type: "cpf" | "email" | "phone" | "address" | "name";
    original: string;
    placeholder: string;
    position: { start: number; end: number };
  }>;
}
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
export interface CoverageReport {
  hasRedactions: boolean;
  redactionCount: number;
  citationCount: number;
  sacredRefCount: number;
  piiLeakRisk: "low" | "medium" | "high";
  sectionsPresent: string[];
}

// SECTION 2 — Constants
export const ENGINE_INFO = {
  engine: "akasha_session_export_engine",
  version: "w64-1.0.0",
  cycle: 64,
  supportedFormats: ["md", "json", "html", "pdf-metadata"] as ExportFormat[],
  sacredLists: { ciganoCards: 36, orixas: 19, sefirot: 10 },
} as const;

export const DEFAULT_EXPORT_OPTS: Required<Omit<ExportOpts, "signatureSecret">> &
  Pick<ExportOpts, "signatureSecret"> = {
  redactPII: true,
  includeAudioTranscript: true,
  includeJournal: true,
  includeCitations: true,
  signatureSecret: undefined,
  maxAudioLines: 200,
};

export const MAX_CONTENT_BYTES = 5 * 1024 * 1024;
export const MAX_DISPLAY_NAME = 80;
export const MIN_SESSION_ID_LEN = 8;
export const MAX_QUESTION_LEN = 2000;
export const SCORE_CAP = 0.99;
export const SCORE_FLOOR = 0.0;
export const SUPPORTED_FORMATS: ReadonlyArray<ExportFormat> = ["md", "json", "html", "pdf-metadata"];
export const REDACT_CATEGORIES = ["cpf", "email", "phone", "address", "name"] as const;

// Bounded regex (no unanchored .*) per cycle 60 lesson.
const CPF_REGEX = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_BR_REGEX = /\b(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}-?\d{4}\b/g;
const ADDRESS_REGEX = /\b(?:Rua|Av\.|Avenida|Travessa|Alameda|R\.|Estrada)\s+[A-Za-záéíóúâêôãõçÀ-ÿ][A-Za-záéíóúâêôãõçÀ-ÿ\s]{0,80},?\s*\d{1,5}\b/g;

export const SACRED_KEYWORDS = [
  "Exu", "Ogum", "Oxalá", "Oxum", "Iansã", "Iemanjá", "Xangô", "Nanã",
  "Obá", "Logunedé", "Obaluaê", "Omolu", "Ibeji", "Iroko", "Ewá",
  "Oxumarê", "Bará", "Pomba Gira", "Caboclo",
  "Keter", "Chokmah", "Binah", "Chesed", "Geburah", "Tiphareth",
  "Netzach", "Hod", "Yesod", "Malkuth", "Daat",
];
export const SACRED_LIST = SACRED_KEYWORDS;

const SACRED_REGEX = new RegExp(
  "\\b(?:" + SACRED_KEYWORDS.join("|") + ")\\b",
  "g",
);

// SECTION 3 — Error classes
export class InvalidSessionError extends Error {
  public readonly code = "INVALID_SESSION";
  constructor(message: string) {
    super(message);
    this.name = "InvalidSessionError";
  }
}
export class InvalidExportFormatError extends Error {
  public readonly code = "INVALID_EXPORT_FORMAT";
  constructor(format: string) {
    super("Invalid export format: " + format);
    this.name = "InvalidExportFormatError";
  }
}
export class PIILeakError extends Error {
  public readonly code = "PII_LEAK";
  public readonly leaks: string[];
  constructor(leaks: string[]) {
    super("PII leak detected: " + leaks.join(", "));
    this.name = "PIILeakError";
    this.leaks = leaks;
  }
}
export class IntegrityCheckError extends Error {
  public readonly code = "INTEGRITY_CHECK_FAILED";
  constructor(message: string) {
    super(message);
    this.name = "IntegrityCheckError";
  }
}

// SECTION 4 — Pure helpers
export function clampUnit(n: number): number {
  if (Number.isNaN(n)) return SCORE_FLOOR;
  if (n === Infinity) return SCORE_CAP;
  if (n === -Infinity) return SCORE_FLOOR;
  if (n < SCORE_FLOOR) return SCORE_FLOOR;
  if (n > SCORE_CAP) return SCORE_CAP;
  return n;
}
export function safeId(input: unknown): SessionId {
  if (typeof input !== "string") return ("sess_anon_" + Date.now()) as SessionId;
  const cleaned = input.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  if (cleaned.length < MIN_SESSION_ID_LEN) {
    return ("sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10)) as SessionId;
  }
  return cleaned as SessionId;
}
export function truncateSacredText(text: string, maxLen: number): string {
  if (typeof text !== "string") return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, Math.max(0, maxLen - 3)) + "...";
}
export function normalizeText(text: string): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[\t ]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
export function countWords(text: string): number {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}
export function boostScoreByCitations(base: number, citationCount: number): number {
  const safeBase = clampUnit(base);
  const citations = Math.max(0, Math.floor(citationCount));
  const boost = Math.min(0.05 * citations, 0.2);
  return clampUnit(safeBase + boost);
}
export function combineScore(...scores: number[]): {
  min: number;
  max: number;
  mean: number;
  weightedMean: number;
  geometricMean: number;
} {
  const safe = scores.filter((s) => Number.isFinite(s)).map((s) => clampUnit(s));
  if (safe.length === 0) {
    return { min: 0, max: 0, mean: 0, weightedMean: 0, geometricMean: 0 };
  }
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const sum = safe.reduce((a, b) => a + b, 0);
  const mean = sum / safe.length;
  const weights = safe.map((_, i) => i + 1);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const weightedMean = safe.reduce((acc, s, i) => acc + s * weights[i], 0) / weightSum;
  const geo = Math.exp(
    safe.reduce((acc, s) => acc + Math.log(Math.max(s, 1e-9)), 0) / safe.length,
  );
  return {
    min: clampUnit(min),
    max: clampUnit(max),
    mean: clampUnit(mean),
    weightedMean: clampUnit(weightedMean),
    geometricMean: clampUnit(geo),
  };
}

// SECTION 5 — Type guards
export function isSession(input: unknown): input is Session {
  if (!input || typeof input !== "object") return false;
  const s = input as Partial<Session>;
  return (
    typeof s.id === "string" &&
    typeof s.askerPseudonym === "string" &&
    typeof s.question === "string" &&
    Array.isArray(s.cards) &&
    Array.isArray(s.interpretations) &&
    Array.isArray(s.journal) &&
    typeof s.createdAt === "string" &&
    (s.locale === "pt-BR" || s.locale === "en" || s.locale === "es")
  );
}
export function isSessionId(input: unknown): input is SessionId {
  return typeof input === "string" && input.length >= MIN_SESSION_ID_LEN;
}
export function isExportFormat(input: unknown): input is ExportFormat {
  return input === "md" || input === "json" || input === "html" || input === "pdf-metadata";
}
export function isExportOpts(input: unknown): input is ExportOpts {
  if (!input || typeof input !== "object") return false;
  const o = input as Partial<ExportOpts>;
  return (
    typeof o.redactPII === "boolean" &&
    typeof o.includeAudioTranscript === "boolean" &&
    typeof o.includeJournal === "boolean" &&
    typeof o.includeCitations === "boolean" &&
    (o.signatureSecret === undefined || typeof o.signatureSecret === "string") &&
    (o.maxAudioLines === undefined || typeof o.maxAudioLines === "number")
  );
}
export function isExportArtifact(input: unknown): input is ExportArtifact {
  if (!input || typeof input !== "object") return false;
  const e = input as Partial<ExportArtifact>;
  return (
    isExportFormat(e.format) &&
    typeof e.content === "string" &&
    typeof e.contentLength === "number" &&
    typeof e.generatedAt === "string" &&
    typeof e.citationCount === "number" &&
    typeof e.sacredRefCount === "number" &&
    typeof e.redactionReport === "object"
  );
}
export function isRedactResult(input: unknown): input is RedactResult {
  if (!input || typeof input !== "object") return false;
  const r = input as Partial<RedactResult>;
  return typeof r.text === "string" && Array.isArray(r.redactions);
}

// SECTION 6 — Redaction (LGPD Art. 9)
function placeholderFor(category: RedactResult["redactions"][number]["type"], counter: number): string {
  return "[REDACTED:" + category + "-" + counter + "]";
}

export function redactCPF(text: string): string {
  if (typeof text !== "string") return "";
  let counter = 0;
  return text.replace(CPF_REGEX, () => placeholderFor("cpf", ++counter));
}

export function redactEmail(text: string): string {
  if (typeof text !== "string") return "";
  let counter = 0;
  return text.replace(EMAIL_REGEX, () => placeholderFor("email", ++counter));
}

export function redactPhone(text: string): string {
  if (typeof text !== "string") return "";
  let counter = 0;
  return text.replace(PHONE_BR_REGEX, (match) => {
    const digits = match.replace(/\D/g, "");
    if (digits.length < 8) return match;
    return placeholderFor("phone", ++counter);
  });
}

export function redactAddress(text: string): string {
  if (typeof text !== "string") return "";
  let counter = 0;
  return text.replace(ADDRESS_REGEX, () => placeholderFor("address", ++counter));
}

export function redactName(text: string, knownNames: string[]): string {
  if (typeof text !== "string") return "";
  if (!Array.isArray(knownNames) || knownNames.length === 0) return text;
  let out = text;
  let counter = 0;
  for (const name of knownNames) {
    if (typeof name !== "string" || name.length < 3) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("\\b" + escaped + "\\b", "g");
    out = out.replace(re, () => placeholderFor("name", ++counter));
  }
  return out;
}

function adjustForSacred(pos: number, sacredHits: Array<{ start: number; end: number }>): number {
  for (const hit of sacredHits) {
    if (pos >= hit.start && pos <= hit.end) return hit.start;
  }
  return pos;
}

export function redactPII(text: string, opts?: RedactOpts): RedactResult {
  if (typeof text !== "string") return { text: "", redactions: [] };
  const preserveSacred = opts?.preserveSacred !== false;
  const knownNames = Array.isArray(opts?.knownNames) ? opts!.knownNames : [];
  const redactions: RedactResult["redactions"] = [];
  const sacredHits: Array<{ start: number; end: number }> = [];
  if (preserveSacred) {
    let m: RegExpExecArray | null;
    SACRED_REGEX.lastIndex = 0;
    while ((m = SACRED_REGEX.exec(text)) !== null) {
      sacredHits.push({ start: m.index, end: m.index + m[0].length });
    }
  }

  function diffCategory(
    before: string,
    after: string,
    category: RedactResult["redactions"][number]["type"],
  ): void {
    // Re-find redactions in `after` and corresponding PII ranges in `before`.
    // Strategy: walk both strings, advance in lockstep, detect redaction placeholders
    // by comparing chars.
    let bi = 0;
    let ai = 0;
    let pos = 0;
    const placeholderRe = /\[REDACTED:[a-z]+-\d+\]/;
    while (ai < after.length) {
      const m = after.slice(ai).match(placeholderRe);
      if (m && m.index !== undefined) {
        const placeholder = m[0];
        const consumed = m.index; // chars in `after` before placeholder
        // `before` should match for `consumed` chars (the unredacted portion).
        bi += consumed;
        pos += consumed;
        // Now extract the original PII from `before` — run the category regex on it.
        const orig = redactOriginal(before, bi, category);
        const adjustedStart = adjustForSacred(pos, sacredHits);
        redactions.push({
          type: category,
          original: orig,
          placeholder,
          position: { start: adjustedStart, end: adjustedStart + orig.length },
        });
        pos += placeholder.length;
        bi += orig.length;
        ai += consumed + placeholder.length;
      } else {
        // No more placeholders — consume rest
        const rest = after.length - ai;
        bi += rest;
        pos += rest;
        ai = after.length;
      }
    }
  }

  function redactOriginal(before: string, start: number, category: RedactResult["redactions"][number]["type"]): string {
    let re: RegExp;
    if (category === "cpf") re = CPF_REGEX;
    else if (category === "email") re = EMAIL_REGEX;
    else if (category === "phone") re = PHONE_BR_REGEX;
    else if (category === "address") re = ADDRESS_REGEX;
    else return "";
    re.lastIndex = start;
    const m = re.exec(before);
    return m ? m[0] : "";
  }

  let before = text;
  let working = redactCPF(before);
  if (before !== working) diffCategory(before, working, "cpf");

  before = working;
  working = redactEmail(before);
  if (before !== working) diffCategory(before, working, "email");

  before = working;
  working = redactPhone(before);
  if (before !== working) diffCategory(before, working, "phone");

  before = working;
  working = redactAddress(before);
  if (before !== working) diffCategory(before, working, "address");

  before = working;
  working = redactName(before, knownNames);
  if (before !== working) diffCategory(before, working, "name");

  return { text: working, redactions };
}

// SECTION 7 — HMAC-SHA256 chain (NO FNV fallback per cycle 60)
// Ambient declarations for Node built-ins (avoids requiring @types/node at type-check).
declare const require: (id: string) => unknown;
declare class Buffer {
  static from(data: Uint8Array): Buffer;
}
interface NodeRequire {
  (id: string): unknown;
}

type CryptoLike = {
  subtle?: { digest: (alg: string, data: ArrayBuffer | Uint8Array) => Promise<ArrayBuffer> };
  createHmac?: (alg: string, key: string) => HasherFn;
  createHash?: (alg: string) => HasherFn;
};

type HasherFn = {
  update: (data: string | Uint8Array) => { digest: (enc?: string) => string };
};

interface HasherLike {
  update(d: unknown): { digest(e?: string): string };
  digest(e?: string): string;
}

function getCrypto(): CryptoLike | null {
  // Prefer node:crypto when available (sync createHash/createHmac).
  // Fall back to WebCrypto (globalThis.crypto.subtle) — but that's async only.
  try {
    const moduleMod = requireNodeModule() as {
      createRequire?: (url: string) => NodeRequire;
    };
    if (moduleMod && typeof moduleMod.createRequire === "function") {
      const req: NodeRequire = moduleMod.createRequire(metaUrl());
      const nodeCrypto = req("node:crypto") as CryptoLike;
      if (nodeCrypto.createHash || nodeCrypto.createHmac) return nodeCrypto;
    }
  } catch {
    // not in Node
  }
  if (typeof globalThis !== "undefined" && (globalThis as { crypto?: CryptoLike }).crypto) {
    return (globalThis as { crypto?: CryptoLike }).crypto!;
  }
  return null;
}

let _cachedNodeModule: unknown | null = null;
let _cachedNodeModuleErr: unknown = null;
function requireNodeModule(): unknown {
  if (_cachedNodeModule) return _cachedNodeModule;
  if (_cachedNodeModuleErr) throw _cachedNodeModuleErr;
  try {
    // node:module is built-in. Use createRequire for ESM compat.
    const proc = (globalThis as { process?: { getBuiltinModule?: (s: string) => unknown } }).process;
    const moduleMod = proc?.getBuiltinModule
      ? proc.getBuiltinModule("node:module")
      : null;
    if (moduleMod) {
      _cachedNodeModule = moduleMod;
      return moduleMod;
    }
    throw new Error("no builtin module loader");
  } catch (e) {
    _cachedNodeModuleErr = e;
    throw e;
  }
}

function metaUrl(): string {
  try {
    return (import.meta as { url: string }).url;
  } catch {
    return "file:///akasha-w64/";
  }
}

function utf8ToBytes(s: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(s);
  }
  const bytes: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6));
      bytes.push(0x80 | (c & 0x3f));
    } else {
      bytes.push(0xe0 | (c >> 12));
      bytes.push(0x80 | ((c >> 6) & 0x3f));
      bytes.push(0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function deriveKey(secret: string, sessionId: string): Uint8Array {
  const c = getCrypto();
  if (!c) throw new IntegrityCheckError("No crypto API available for HMAC");
  if (c.createHash) {
    const h: HasherLike = c.createHash("sha256") as unknown as HasherLike;
    h.update("akasha-w64-derive:" + secret + ":" + sessionId);
    const hex: string = h.digest("hex");
    return utf8ToBytes(hex.slice(0, 64));
  }
  if (c.createHmac) {
    const h: HasherLike = c.createHmac("sha256", "akasha-w64-derive") as unknown as HasherLike;
    h.update(secret + ":" + sessionId);
    const hex: string = h.digest("hex");
    return utf8ToBytes(hex.slice(0, 64));
  }
  throw new IntegrityCheckError("No HMAC/hash primitive available");
}

function sha256Node(input: Uint8Array): Uint8Array {
  try {
    const nodeCrypto = require("node:crypto") as {
      createHash: (alg: string) => HasherLike;
    };
    const h: HasherLike = nodeCrypto.createHash("sha256") as unknown as HasherLike;
    h.update(input);
    const hex: string = h.digest("hex");
    return utf8ToBytes(hex);
  } catch {
    return sha256Pure(input);
  }
}

function sha256Pure(input: Uint8Array): Uint8Array {
  const K = [
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
  ];
  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];
  const len = input.length;
  const bitLen = len * 8;
  const padLen = (len + 9 + 63) & ~63;
  const padded = new Uint8Array(padLen);
  padded.set(input, 0);
  padded[len] = 0x80;
  padded[padLen - 8] = (bitLen >>> 24) & 0xff;
  padded[padLen - 7] = (bitLen >>> 16) & 0xff;
  padded[padLen - 6] = (bitLen >>> 8) & 0xff;
  padded[padLen - 5] = bitLen & 0xff;
  for (let off = 0; off < padLen; off += 64) {
    const w = new Uint32Array(64);
    for (let i = 0; i < 16; i++) {
      const off4 = off + i * 4;
      w[i] = ((padded[off4] << 24) | (padded[off4 + 1] << 16) | (padded[off4 + 2] << 8) | padded[off4 + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3)) >>> 0;
      const s1 = (((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10)) >>> 0;
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let i = 0; i < 64; i++) {
      const S1 = (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = (((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) >>> 0;
      const mj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
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
    H = [
      (H[0] + a) >>> 0,
      (H[1] + b) >>> 0,
      (H[2] + c) >>> 0,
      (H[3] + d) >>> 0,
      (H[4] + e) >>> 0,
      (H[5] + f) >>> 0,
      (H[6] + g) >>> 0,
      (H[7] + h) >>> 0,
    ];
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    out[i * 4] = (H[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (H[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (H[i] >>> 8) & 0xff;
    out[i * 4 + 3] = H[i] & 0xff;
  }
  return out;
}

function hmacSha256Sync(key: Uint8Array, message: Uint8Array): Uint8Array {
  const BLOCK_SIZE = 64;
  let normKey: Uint8Array;
  if (key.length > BLOCK_SIZE) {
    normKey = new Uint8Array(BLOCK_SIZE);
    const hashed = sha256Node(key);
    normKey.set(hashed, 0);
  } else if (key.length < BLOCK_SIZE) {
    normKey = new Uint8Array(BLOCK_SIZE);
    normKey.set(key, 0);
  } else {
    normKey = key;
  }
  const ipad = new Uint8Array(BLOCK_SIZE);
  const opad = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    ipad[i] = normKey[i] ^ 0x36;
    opad[i] = normKey[i] ^ 0x5c;
  }
  const inner = new Uint8Array(BLOCK_SIZE + message.length);
  inner.set(ipad, 0);
  inner.set(message, BLOCK_SIZE);
  const innerHash = sha256Node(inner);
  const outer = new Uint8Array(BLOCK_SIZE + innerHash.length);
  outer.set(opad, 0);
  outer.set(innerHash, BLOCK_SIZE);
  return sha256Node(outer);
}

export function hashTagFor(redacted: string, sessionId: string, secret: string): string {
  if (typeof redacted !== "string") redacted = "";
  if (typeof sessionId !== "string") sessionId = "anonymous";
  if (typeof secret !== "string" || secret.length === 0) {
    throw new IntegrityCheckError("signatureSecret must be non-empty for HMAC");
  }
  const key = deriveKey(secret, sessionId);
  const msg = utf8ToBytes(redacted);
  return bytesToHex(hmacSha256Sync(key, msg));
}

export function chainAudit(prevHash: string, payload: string, secret: string): string {
  if (typeof prevHash !== "string") prevHash = "GENESIS";
  if (typeof payload !== "string") payload = "";
  if (typeof secret !== "string" || secret.length === 0) {
    throw new IntegrityCheckError("signatureSecret required for chainAudit");
  }
  const key = deriveKey(secret, prevHash || "GENESIS");
  const msg = utf8ToBytes((prevHash || "GENESIS") + "|" + payload);
  return bytesToHex(hmacSha256Sync(key, msg));
}

// SECTION 8 — Session load + validation (stubs)
const SESSION_REGISTRY: Map<SessionId, Session> = new Map();

export function loadSession(id: SessionId): Session | null {
  if (typeof id !== "string") return null;
  return SESSION_REGISTRY.get(id) ?? null;
}

export function registerSessionForTest(session: Session): void {
  if (!isSession(session)) return;
  SESSION_REGISTRY.set(session.id, session);
}

export function clearSessionRegistry(): void {
  SESSION_REGISTRY.clear();
}

export function validateSession(session: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!session || typeof session !== "object") {
    return { valid: false, errors: ["session is not an object"], warnings };
  }
  const s = session as Partial<Session>;
  if (typeof s.id !== "string" || s.id.length < MIN_SESSION_ID_LEN) {
    errors.push("id must be string >= " + MIN_SESSION_ID_LEN + " chars");
  }
  if (typeof s.askerPseudonym !== "string" || s.askerPseudonym.length === 0) {
    errors.push("askerPseudonym is required");
  }
  if (s.askerPseudonym && s.askerPseudonym.length > MAX_DISPLAY_NAME) {
    warnings.push("askerPseudonym exceeds " + MAX_DISPLAY_NAME + " chars");
  }
  if (typeof s.question !== "string") errors.push("question is required");
  else if (s.question.length > MAX_QUESTION_LEN) warnings.push("question very long");
  if (!Array.isArray(s.cards)) errors.push("cards must be array");
  if (!Array.isArray(s.interpretations)) errors.push("interpretations must be array");
  if (!Array.isArray(s.journal)) errors.push("journal must be array");
  if (typeof s.createdAt !== "string") errors.push("createdAt must be ISO string");
  if (s.locale !== "pt-BR" && s.locale !== "en" && s.locale !== "es") {
    errors.push("locale must be one of pt-BR/en/es");
  }
  return { valid: errors.length === 0, errors, warnings };
}

export function validateExportOpts(opts: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (opts === undefined || opts === null) {
    return { valid: true, errors, warnings };
  }
  if (typeof opts !== "object") {
    return { valid: false, errors: ["opts must be object"], warnings };
  }
  const o = opts as Partial<ExportOpts>;
  if (typeof o.redactPII !== "boolean") errors.push("redactPII must be boolean");
  if (typeof o.includeAudioTranscript !== "boolean") errors.push("includeAudioTranscript must be boolean");
  if (typeof o.includeJournal !== "boolean") errors.push("includeJournal must be boolean");
  if (typeof o.includeCitations !== "boolean") errors.push("includeCitations must be boolean");
  if (o.signatureSecret !== undefined && typeof o.signatureSecret !== "string") {
    errors.push("signatureSecret must be string when provided");
  }
  if (o.maxAudioLines !== undefined && (typeof o.maxAudioLines !== "number" || o.maxAudioLines < 0)) {
    errors.push("maxAudioLines must be non-negative number");
  }
  return { valid: errors.length === 0, errors, warnings };
}

// SECTION 9 — Markdown rendering
function safeLog(level: "info" | "warn" | "error", msg: string): void {
  void level;
  void msg;
}

export function renderMarkdown(
  session: Session,
  opts: Required<Omit<ExportOpts, "signatureSecret">> & Pick<ExportOpts, "signatureSecret">,
): string {
  if (!isSession(session)) throw new InvalidSessionError("session failed validation");
  const lines: string[] = [];
  lines.push("# Sessão Akasha");
  lines.push("");
  lines.push("**ID:** " + session.id);
  lines.push("**Consulente (pseudônimo):** " + session.askerPseudonym);
  if (session.askerTradition) {
    lines.push("**Tradição:** " + session.askerTradition);
  }
  lines.push("**Locale:** " + session.locale);
  lines.push("**Criado em:** " + session.createdAt);
  lines.push("");
  lines.push("## Pergunta");
  lines.push("");
  lines.push(normalizeText(session.question));
  lines.push("");
  lines.push("## Cartas");
  lines.push("");
  for (const c of session.cards) {
    lines.push("- Carta " + c.cardId + " → Casa " + c.house + (c.orientation ? " (" + c.orientation + ")" : ""));
  }
  lines.push("");
  lines.push("## Interpretações");
  lines.push("");
  for (const i of session.interpretations) {
    lines.push("### Carta " + i.cardId + " — Casa " + i.house);
    lines.push("");
    lines.push(normalizeText(i.text));
    if (opts.includeCitations && i.citations && i.citations.length > 0) {
      lines.push("");
      lines.push("**Citações:**");
      for (const cit of i.citations) lines.push("- " + cit);
    }
    if (i.sacredRefs && i.sacredRefs.length > 0) {
      lines.push("");
      lines.push("**Referências Sagradas:** " + i.sacredRefs.join(", "));
    }
    lines.push("");
  }
  if (session.mesaReal) {
    lines.push("## Mesa Real");
    lines.push("");
    lines.push("**Casa central:** " + session.mesaReal.centerHouse);
    lines.push("**Tema:** " + normalizeText(session.mesaReal.theme));
    lines.push("");
    const houseKeys = Object.keys(session.mesaReal.perHouseText).sort(
      (a, b) => Number(a) - Number(b),
    );
    for (const house of houseKeys) {
      lines.push("### Casa " + house);
      lines.push("");
      lines.push(normalizeText(session.mesaReal.perHouseText[Number(house)]));
      lines.push("");
    }
    if (session.mesaReal.crosses && session.mesaReal.crosses.length > 0) {
      lines.push("### Cruzamentos");
      lines.push("");
      for (const cr of session.mesaReal.crosses) {
        lines.push("- Casa " + cr.fromHouse + " → " + cr.toHouse + ": " + normalizeText(cr.theme));
      }
      lines.push("");
    }
  }
  if (opts.includeAudioTranscript && session.audioTranscript) {
    lines.push("## Transcrição de Áudio");
    lines.push("");
    const transcriptLines = session.audioTranscript.split("\n");
    const limit = opts.maxAudioLines ?? 200;
    const truncated = transcriptLines.length > limit;
    const slice = truncated ? transcriptLines.slice(0, limit) : transcriptLines;
    lines.push("```");
    lines.push(slice.join("\n"));
    lines.push("```");
    if (truncated) lines.push("\n_Truncado em " + limit + " linhas (original: " + transcriptLines.length + ")._");
    lines.push("");
  }
  if (opts.includeJournal && session.journal.length > 0) {
    lines.push("## Diário");
    lines.push("");
    for (const j of session.journal) {
      lines.push("### [" + j.type + "] " + j.timestamp);
      lines.push("");
      lines.push(normalizeText(j.text));
      lines.push("");
    }
  }
  const result = lines.join("\n");
  return opts.redactPII
    ? redactPII(result, { preserveSacred: true }).text
    : result;
}

export function exportAsMarkdown(session: Session, opts?: ExportOpts): string {
  const merged: Required<Omit<ExportOpts, "signatureSecret">> & Pick<ExportOpts, "signatureSecret"> = {
    redactPII: opts?.redactPII ?? DEFAULT_EXPORT_OPTS.redactPII,
    includeAudioTranscript: opts?.includeAudioTranscript ?? DEFAULT_EXPORT_OPTS.includeAudioTranscript,
    includeJournal: opts?.includeJournal ?? DEFAULT_EXPORT_OPTS.includeJournal,
    includeCitations: opts?.includeCitations ?? DEFAULT_EXPORT_OPTS.includeCitations,
    maxAudioLines: opts?.maxAudioLines ?? DEFAULT_EXPORT_OPTS.maxAudioLines,
    signatureSecret: opts?.signatureSecret,
  };
  return renderMarkdown(session, merged);
}

// SECTION 10 — JSON rendering
export function exportAsJSON(session: Session, opts?: ExportOpts): string {
  if (!isSession(session)) throw new InvalidSessionError("session failed validation");
  const redact = opts?.redactPII ?? DEFAULT_EXPORT_OPTS.redactPII;
  const redactFn = (text: string): string =>
    redact ? redactPII(text, { preserveSacred: true }).text : text;
  const safeSession: Session = {
    id: session.id,
    askerPseudonym: redactFn(session.askerPseudonym),
    askerTradition: session.askerTradition,
    question: redactFn(session.question),
    cards: session.cards.slice(),
    interpretations: session.interpretations.map((i) => ({
      cardId: i.cardId,
      house: i.house,
      text: redactFn(i.text),
      citations: opts?.includeCitations === false ? undefined : (i.citations ?? []).map(redactFn),
      sacredRefs: i.sacredRefs ?? [],
    })),
    mesaReal: session.mesaReal
      ? {
          centerHouse: session.mesaReal.centerHouse,
          theme: redactFn(session.mesaReal.theme),
          perHouseText: Object.fromEntries(
            Object.entries(session.mesaReal.perHouseText).map(([k, v]) => [k, redactFn(v)]),
          ),
          crosses: session.mesaReal.crosses?.map((c) => ({
            fromHouse: c.fromHouse,
            toHouse: c.toHouse,
            theme: redactFn(c.theme),
          })),
        }
      : undefined,
    audioTranscript:
      opts?.includeAudioTranscript === false
        ? undefined
        : session.audioTranscript
        ? truncateSacredText(
            redactFn(session.audioTranscript),
            (opts?.maxAudioLines ?? DEFAULT_EXPORT_OPTS.maxAudioLines ?? 200) * 80,
          )
        : undefined,
    journal: opts?.includeJournal === false ? [] : session.journal.map((j) => ({
      id: j.id,
      timestamp: j.timestamp,
      type: j.type,
      text: redactFn(j.text),
    })),
    createdAt: session.createdAt,
    locale: session.locale,
  };
  return JSON.stringify(safeSession, null, 2);
}

// SECTION 11 — HTML rendering
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function exportAsHTML(session: Session, opts?: ExportOpts): string {
  if (!isSession(session)) throw new InvalidSessionError("session failed validation");
  const merged: Required<Omit<ExportOpts, "signatureSecret">> & Pick<ExportOpts, "signatureSecret"> = {
    redactPII: opts?.redactPII ?? DEFAULT_EXPORT_OPTS.redactPII,
    includeAudioTranscript: opts?.includeAudioTranscript ?? DEFAULT_EXPORT_OPTS.includeAudioTranscript,
    includeJournal: opts?.includeJournal ?? DEFAULT_EXPORT_OPTS.includeJournal,
    includeCitations: opts?.includeCitations ?? DEFAULT_EXPORT_OPTS.includeCitations,
    maxAudioLines: opts?.maxAudioLines ?? DEFAULT_EXPORT_OPTS.maxAudioLines,
    signatureSecret: opts?.signatureSecret,
  };
  const md = renderMarkdown(session, merged);
  const htmlBody = md
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return "<h1>" + escapeHtml(line.slice(2)) + "</h1>";
      if (line.startsWith("## ")) return "<h2>" + escapeHtml(line.slice(3)) + "</h2>";
      if (line.startsWith("### ")) return "<h3>" + escapeHtml(line.slice(4)) + "</h3>";
      if (line.startsWith("- ")) return "<li>" + escapeHtml(line.slice(2)) + "</li>";
      if (/^```/.test(line)) return "<pre>" + escapeHtml(line.replace(/^```/, "")) + "</pre>";
      if (line.length === 0) return "";
      return "<p>" + escapeHtml(line) + "</p>";
    })
    .join("\n");
  return "<!DOCTYPE html>\n<html lang=\"" + session.locale + "\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Sessão Akasha — " + escapeHtml(session.askerPseudonym) + "</title>\n<style>body{font-family:Georgia,serif;max-width:760px;margin:2rem auto;padding:0 1rem;color:#222;}h1{color:#5a3e8a;}h2{color:#5a3e8a;border-bottom:1px solid #ddd;padding-bottom:.25rem;}h3{color:#7a5aaa;}pre{background:#f4f0fa;padding:.5rem;border-radius:4px;overflow-x:auto;}li{margin:.25rem 0;}</style>\n</head>\n<body>\n" + htmlBody + "\n</body>\n</html>";
}

// SECTION 12 — PDF metadata (structure only)
export function exportAsPDFMetadata(session: Session, opts?: ExportOpts): PDFMetadata {
  if (!isSession(session)) throw new InvalidSessionError("session failed validation");
  const merged: Required<Omit<ExportOpts, "signatureSecret">> & Pick<ExportOpts, "signatureSecret"> = {
    redactPII: opts?.redactPII ?? DEFAULT_EXPORT_OPTS.redactPII,
    includeAudioTranscript: opts?.includeAudioTranscript ?? DEFAULT_EXPORT_OPTS.includeAudioTranscript,
    includeJournal: opts?.includeJournal ?? DEFAULT_EXPORT_OPTS.includeJournal,
    includeCitations: opts?.includeCitations ?? DEFAULT_EXPORT_OPTS.includeCitations,
    maxAudioLines: opts?.maxAudioLines ?? DEFAULT_EXPORT_OPTS.maxAudioLines,
    signatureSecret: opts?.signatureSecret,
  };
  const md = renderMarkdown(session, merged);
  const sections: PDFMetadata["sections"] = [];
  const blocks = md.split(/^##\s+/m);
  for (const block of blocks) {
    const heading = block.split("\n", 1)[0]?.trim() ?? "";
    if (!heading) continue;
    const body = block.slice(heading.length).trim();
    SACRED_REGEX.lastIndex = 0;
    const sacredRefs = body.match(SACRED_REGEX)?.map((s) => s.trim()) ?? [];
    sections.push({ heading, bodyLength: body.length, sacredRefs });
  }
  return {
    format: "pdf-metadata",
    pageTitle: "Sessão Akasha — " + session.askerPseudonym,
    author: "Akasha Wave 64",
    subject: session.question.slice(0, 200),
    keywords: [
      session.askerTradition ?? "open",
      ...SACRED_KEYWORDS.slice(0, 5),
    ],
    pageCount: Math.max(1, Math.ceil(md.length / 3000)),
    estimatedSizeBytes: Math.ceil(md.length * 1.4),
    sections,
    rawMarkdown: md,
  };
}

// SECTION 13 — Top-level dispatcher + audit
function countCitations(text: string): number {
  const seen = new Set<string>();
  const m1 = text.match(/\b[A-Z][a-z]+(?:\s+et\s+al\.)?\s+\(\d{4}\)/g);
  if (m1) for (const s of m1) seen.add(s);
  const m2 = text.match(/^[-*]\s+[A-Z]/gm);
  if (m2) for (const s of m2) seen.add(s);
  return seen.size;
}

function countSacredRefs(text: string): number {
  if (!text) return 0;
  SACRED_REGEX.lastIndex = 0;
  const matches = text.match(SACRED_REGEX);
  return matches ? matches.length : 0;
}

export function auditForPIILeaks(text: string): "pass" | "fail" {
  if (typeof text !== "string") return "pass";
  if (text.match(CPF_REGEX)) return "fail";
  if (text.match(EMAIL_REGEX)) return "fail";
  if (text.match(PHONE_BR_REGEX)) return "fail";
  if (text.match(ADDRESS_REGEX)) return "fail";
  return "pass";
}

export function exportSession(
  session: Session,
  format: ExportFormat,
  opts?: ExportOpts,
): ExportArtifact {
  if (!isSession(session)) throw new InvalidSessionError("session failed validation");
  if (!isExportFormat(format)) throw new InvalidExportFormatError(format);
  const merged: Required<Omit<ExportOpts, "signatureSecret">> & Pick<ExportOpts, "signatureSecret"> = {
    redactPII: opts?.redactPII ?? DEFAULT_EXPORT_OPTS.redactPII,
    includeAudioTranscript: opts?.includeAudioTranscript ?? DEFAULT_EXPORT_OPTS.includeAudioTranscript,
    includeJournal: opts?.includeJournal ?? DEFAULT_EXPORT_OPTS.includeJournal,
    includeCitations: opts?.includeCitations ?? DEFAULT_EXPORT_OPTS.includeCitations,
    maxAudioLines: opts?.maxAudioLines ?? DEFAULT_EXPORT_OPTS.maxAudioLines,
    signatureSecret: opts?.signatureSecret,
  };
  const validateOpts = validateExportOpts(merged);
  if (!validateOpts.valid) {
    throw new InvalidSessionError("invalid opts: " + validateOpts.errors.join("; "));
  }
  // Render unredacted first, then redact in exportSession for accurate redaction counts.
  const unredactedOpts = { ...merged, redactPII: false };
  let rawContent = "";
  if (format === "md") rawContent = renderMarkdown(session, unredactedOpts);
  else if (format === "json") rawContent = exportAsJSON(session, unredactedOpts);
  else if (format === "html") rawContent = exportAsHTML(session, unredactedOpts);
  else if (format === "pdf-metadata") {
    rawContent = JSON.stringify(exportAsPDFMetadata(session, unredactedOpts), null, 2);
  }

  const redactResult = merged.redactPII
    ? redactPII(rawContent, { preserveSacred: true })
    : { text: rawContent, redactions: [] };
  const byCategory: RedactReport["byCategory"] = { cpf: 0, email: 0, phone: 0, address: 0, name: 0 };
  for (const r of redactResult.redactions) byCategory[r.type]++;

  const leakCheck = merged.redactPII ? auditForPIILeaks(redactResult.text) : "unknown";
  const citationCount = merged.includeCitations ? countCitations(rawContent) : 0;
  const sacredRefCount = countSacredRefs(rawContent);

  const artifact: ExportArtifact = {
    format,
    content: redactResult.text,
    contentLength: redactResult.text.length,
    redactionReport: {
      totalRedactions: redactResult.redactions.length,
      byCategory,
      piiLeakCheck: leakCheck,
    },
    citationCount,
    sacredRefCount,
    generatedAt: new Date().toISOString(),
  };

  if (merged.signatureSecret && typeof merged.signatureSecret === "string") {
    try {
      artifact.integrityHash = chainAudit("GENESIS", redactResult.text, merged.signatureSecret);
    } catch (e) {
      safeLog("warn", "integrity hash skipped: " + (e instanceof Error ? e.message : "unknown"));
    }
  }
  if (artifact.contentLength > MAX_CONTENT_BYTES) {
    throw new InvalidSessionError("content exceeds MAX_CONTENT_BYTES (" + MAX_CONTENT_BYTES + ")");
  }
  return artifact;
}

export function auditExportCoverage(exportArtifact: ExportArtifact): CoverageReport {
  if (!isExportArtifact(exportArtifact)) {
    return {
      hasRedactions: false,
      redactionCount: 0,
      citationCount: 0,
      sacredRefCount: 0,
      piiLeakRisk: "high",
      sectionsPresent: [],
    };
  }
  const sectionsPresent: string[] = [];
  if (exportArtifact.content.includes("# Sessão Akasha")) sectionsPresent.push("header");
  if (/## Pergunta/.test(exportArtifact.content)) sectionsPresent.push("question");
  if (/## Cartas/.test(exportArtifact.content)) sectionsPresent.push("cards");
  if (/## Interpretações/.test(exportArtifact.content)) sectionsPresent.push("interpretations");
  if (/## Mesa Real/.test(exportArtifact.content)) sectionsPresent.push("mesaReal");
  if (/## Transcrição/.test(exportArtifact.content)) sectionsPresent.push("audioTranscript");
  if (/## Diário/.test(exportArtifact.content)) sectionsPresent.push("journal");

  const leakCheck = auditForPIILeaks(exportArtifact.content);
  const piiLeakRisk: "low" | "medium" | "high" =
    leakCheck === "fail" ? "high" : exportArtifact.redactionReport.totalRedactions > 0 ? "medium" : "low";
  return {
    hasRedactions: exportArtifact.redactionReport.totalRedactions > 0,
    redactionCount: exportArtifact.redactionReport.totalRedactions,
    citationCount: exportArtifact.citationCount,
    sacredRefCount: exportArtifact.sacredRefCount,
    piiLeakRisk,
    sectionsPresent,
  };
}

export function verifyExportIntegrity(exportArtifact: ExportArtifact, secret: string): boolean {
  if (!isExportArtifact(exportArtifact)) return false;
  if (typeof secret !== "string" || secret.length === 0) return false;
  if (!exportArtifact.integrityHash) return false;
  try {
    const expected = chainAudit("GENESIS", exportArtifact.content, secret);
    return expected === exportArtifact.integrityHash;
  } catch {
    return false;
  }
}

// SECTION 14 — Internal helpers (exported for tests)
export function buildSampleSession(): Session {
  return {
    id: "sess_w64_test_sample" as SessionId,
    askerPseudonym: "Consulente Arco-Íris",
    askerTradition: "candomble",
    question: "Como Exu e Ogum podem me ajudar neste ciclo? Email: joao@example.com, CPF 123.456.789-00",
    cards: [
      { cardId: 1, house: 1, orientation: "upright" },
      { cardId: 7, house: 14, orientation: "reversed" },
      { cardId: 22, house: 22 },
    ],
    interpretations: [
      {
        cardId: 1,
        house: 1,
        text: "O Cavaleiro traz notícias de Exu, o mensageiro. A casa do consulente vibra em Keter.",
        citations: ["Goodwin et al. (2022) — NEJM — psilocibina para depressão"],
        sacredRefs: ["Exu", "Keter"],
      },
      {
        cardId: 7,
        house: 14,
        text: "A Serpente em reverso pede atenção a Geburah (justiça). Padrões precisam ser cortados.",
        citations: ["Johnson (2021) — Psicologia Junguiana e simbolismo"],
        sacredRefs: ["Geburah"],
      },
    ],
    mesaReal: {
      centerHouse: 1,
      theme: "Cruzamento entre Exu e a Lei (Ogum/Geburah).",
      perHouseText: {
        1: "Casa do consulente — Cavaleiro ativo, Keter acima.",
        14: "Cruzamento com Tiphareth — beleza + perigo.",
        22: "Casa 22 — Caminho de Mem (cabeça).",
      },
      crosses: [{ fromHouse: 1, toHouse: 14, theme: "Exu → Geburah (justiça cortante)" }],
    },
    audioTranscript: "Pergunta inicial: como lidar com esta transição?\nExu respondeu: coragem, movimento.\nOgum: ferramenta, decisão.\n(Transcript truncado para teste)",
    journal: [
      { id: "j1", timestamp: "2026-06-01T10:00:00Z", type: "reflection", text: "Reflexão sobre Exu." },
      { id: "j2", timestamp: "2026-06-02T15:30:00Z", type: "action", text: "Acendi vela para Ogum." },
    ],
    createdAt: "2026-06-01T09:00:00Z",
    locale: "pt-BR",
  };
}


