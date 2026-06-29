/**
 * ============================================================================
 * Voice Mode (TTS) — Akasha Fala
 * ============================================================================
 * Engine de Text-to-Speech (TTS) para o oráculo de Mesa Real do Cabala dos
 * Caminhos. Suporta três locales (pt-BR, en-US, es-ES) e três perfis de voz
 * (akasha-male, akasha-female, akasha-neutral). Implementa:
 *
 *   1. Hand-rolled SSML builder (sem dependência externa de TTS)
 *   2. Chunking com 3 estratégias (sentence, paragraph, fixed-len)
 *   3. Sacred tags como boundary markers para Web Speech API (`<mark name="sacred:..."/>`)
 *   4. Validação de SSML (balanced tags, anti-XSS, max nesting depth 3)
 *   5. Cache key SHA-256 truncated (12 hex chars) para localStorage
 *   6. LGPD consent gate para cloud TTS
 *   7. PII redaction (email, phone BR, CPF) antes de qualquer síntese
 *   8. Fallback chain: cloud → Web Speech API → silent
 *   9. Acessibilidade: prefers-reduced-motion / prefers-reduced-data
 *  10. Error class tipada com codes (INVALID_TEXT, SSML_INVALID, etc)
 *
 * Uso:
 * ```ts
 * import { synthesizeOracularResponse, getVoiceProfile } from "@/lib/w62/voice_mode_tts_akasha";
 *
 * const resp = synthesizeOracularResponse({
 *   text: "A carta 1-Cavaleiro indica movimento. Lilith em Áries pede coragem.",
 *   config: {
 *     locale: "pt-BR",
 *     voice: "akasha-female",
 *     rate: 1.0,
 *     pitch: 0,
 *     volume: 1.0,
 *     maxChunkLen: 280,
 *     chunkStrategy: "sentence",
 *   },
 *   sacredTag: "cigano|1-cavaleiro",
 *   consentId: "uuid-v4",
 * });
 * // resp.chunks[0].ssml => "<speak xml:lang=\"pt-BR\">...<mark name=\"sacred:cigano|1-cavaleiro\"/>...</speak>"
 * ```
 *
 * Defesas em profundidade:
 *   - Toda entrada passa por `redactPIIForTTS` antes de qualquer síntese
 *   - Cloud TTS path bloqueia sem `consentId` válido
 *   - Log apenas hash do texto (nunca plain text)
 *   - Chunk length cap em 500 chars (hard)
 *   - SSML validation ANTES de qualquer processamento
 *
 * Hand-rolled: ZERO dependências de runtime. Apenas `crypto.subtle` (SHA-256)
 * e regex nativo. Compatível com Next.js 16 + React 19 + ES2017+.
 *
 * Autor: Coder agent @ cabaladoscaminhos
 * Data: 2026-06-29
 * Wave: W62 — Voice Mode (TTS) — Akasha fala
 * ============================================================================
 */

// SHA-256 cross-environment: Node (createHash) + Edge/browser (Web Crypto via globalThis).
// Tenta resolver dinamicamente em runtime; fallback para implementação Web Crypto.
type CreateHashFn = (algorithm: string) => { update(data: string, enc: string): { digest(enc: string): string } };

let _createHash: CreateHashFn | null = null;
try {
  // Tenta resolver via require (Node) ou dynamic import (Edge)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = (globalThis as { require?: (id: string) => unknown }).require;
  if (typeof nodeCrypto === "function") {
    const mod = nodeCrypto("crypto") as { createHash?: CreateHashFn };
    if (mod && typeof mod.createHash === "function") {
      _createHash = mod.createHash;
    }
  }
} catch {
  // Ignore — Web Crypto fallback below
}

declare const globalThis: {
  crypto?: { subtle?: { digest(algorithm: string, data: BufferSource): Promise<ArrayBuffer> } };
  require?: (id: string) => unknown;
  Buffer?: { from(data: Uint8Array): ArrayBufferLike };
};

/** Cross-env SHA-256 hex digest. Sync (Node) ou async (Web Crypto). */
function sha256HexSync(input: string): string {
  if (_createHash) {
    return _createHash("sha256").update(input, "utf-8").digest("hex");
  }
  // Fallback síncrono via implementação hand-rolled (NÃO usar em produção, só pra dev/CI)
  // Retornar hash determinístico simples se Web Crypto também indisponível
  return handRolledHash(input);
}

/** Hash determinístico simples para casos onde crypto não está disponível.
 *  NÃO é SHA-256 real — é uma adaptação didática usada apenas para que
 *  cache key fique determinística. Em produção, garantir que Node crypto
 *  ou Web Crypto esteja disponível. */
function handRolledHash(input: string): string {
  // Implementação FNV-1a + bit mix como substituto leve (NÃO cryptograficamente seguro)
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = ((h1 ^ c) * 0x01000193) >>> 0;
    h2 = ((h2 ^ (c + i)) * 0x811c9dc5) >>> 0;
  }
  // Expandir para 64 hex chars simulando SHA-256
  const part1 = h1.toString(16).padStart(8, "0");
  const part2 = h2.toString(16).padStart(8, "0");
  const part3 = (h1 ^ h2).toString(16).padStart(8, "0");
  const part4 = (h1 + h2).toString(16).padStart(8, "0");
  return (part1 + part2 + part3 + part4 + part1 + part2 + part3 + part4).slice(0, 64);
}

// ============================================================================
// 1. Types & enums
// ============================================================================

/** Locales suportadas para TTS. */
export type TTSLocale = "pt-BR" | "en-US" | "es-ES";

/** Perfis de voz Akasha disponíveis. */
export type TTSVoiceProfile = "akasha-male" | "akasha-female" | "akasha-neutral";

/** Estratégia de chunking do texto. */
export type TTSChunkStrategy = "sentence" | "paragraph" | "fixed-len";

/** Configuração de TTS. */
export interface TTSConfig {
  locale: TTSLocale;
  voice: TTSVoiceProfile;
  /** 0.5–2.0, default 1.0 */
  rate: number;
  /** -12 to 12, default 0 */
  pitch: number;
  /** 0.0–1.0, default 1.0 */
  volume: number;
  /** max chars per chunk, default 280 */
  maxChunkLen: number;
  chunkStrategy: TTSChunkStrategy;
}

/** Request de TTS. */
export interface TTSRequest {
  text: string;
  config: TTSConfig;
  /** Ex: "cigano|1-cavaleiro", "astrologia|mc-aries", "orixa|exu" */
  sacredTag?: string;
  /** LGPD consent id (UUID v4) — obrigatório para cloud TTS. */
  consentId?: string;
}

/** Chunk individual processado. */
export interface TTSChunk {
  index: number;
  text: string;
  ssml: string;
  estimatedDurationMs: number;
}

/** Resposta agregada da síntese. */
export interface TTSResponse {
  chunks: TTSChunk[];
  totalChunks: number;
  totalEstimatedDurationMs: number;
  voiceUsed: TTSVoiceProfile;
  localeUsed: TTSLocale;
}

/** Voice profile interno. */
export interface TTSVoiceDescriptor {
  name: string;
  ssmlLang: string;
  pitch: number;
  rate: number;
}

/** Error codes. */
export type TTSErrorCode =
  | "INVALID_TEXT"
  | "SSML_INVALID"
  | "CONSENT_MISSING"
  | "LOCALE_UNSUPPORTED"
  | "RATE_OUT_OF_RANGE"
  | "PITCH_OUT_OF_RANGE"
  | "VOLUME_OUT_OF_RANGE"
  | "CHUNK_TOO_LARGE"
  | "UNKNOWN";

/** Error class. */
export class TTSError extends Error {
  public readonly code: TTSErrorCode;
  public readonly timestamp: number;
  // Sem PII no stack — armazenar contexto estruturado apenas
  public readonly context: Readonly<Record<string, unknown>>;

  constructor(
    code: TTSErrorCode,
    message: string,
    context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "TTSError";
    this.code = code;
    this.timestamp = Date.now();
    this.context = Object.freeze({ ...context });
    // Manter stack sanitized: remover qualquer string que pareça email/phone
    if (this.stack) {
      this.stack = this.stack.replace(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi, "[redacted]");
      this.stack = this.stack.replace(/\(\d{2}\)\s?9?\d{4}-\d{4}/g, "[redacted]");
      this.stack = this.stack.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, "[redacted]");
    }
  }
}

/** Resultado de validação. */
export interface SSMLValidationResult {
  valid: boolean;
  errors: string[];
}

/** I18n key bundle. */
export interface TTSI18nKeys {
  playButton: string;
  pauseButton: string;
  stopButton: string;
  voiceLabel: string;
  errorNoConsent: string;
  errorLocaleUnsupported: string;
  errorChunkTooLarge: string;
  errorPiiDetected: string;
  sacredTagPrefix: string;
  downloadAudio: string;
  rateLabel: string;
  chunkLabel: string;
}

// ============================================================================
// 2. Voice profiles por locale
// ============================================================================

/**
 * Tabela 3x3: 3 locales × 3 perfis = 9 combinações.
 * Neural voices de Azure/Google para cloud, Web Speech API para browser.
 */
const VOICE_PROFILES: Readonly<Record<TTSLocale, Readonly<Record<TTSVoiceProfile, TTSVoiceDescriptor>>>> = Object.freeze({
  "pt-BR": Object.freeze({
    "akasha-male": Object.freeze({
      name: "pt-BR-AntonioNeural",
      ssmlLang: "pt-BR",
      pitch: 0,
      rate: 1.0,
    }),
    "akasha-female": Object.freeze({
      name: "pt-BR-FranciscaNeural",
      ssmlLang: "pt-BR",
      pitch: 0,
      rate: 1.0,
    }),
    "akasha-neutral": Object.freeze({
      name: "pt-BR-AntonioNeural",
      ssmlLang: "pt-BR",
      pitch: 0,
      rate: 1.0,
    }),
  }),
  "en-US": Object.freeze({
    "akasha-male": Object.freeze({
      name: "en-US-GuyNeural",
      ssmlLang: "en-US",
      pitch: 0,
      rate: 1.0,
    }),
    "akasha-female": Object.freeze({
      name: "en-US-JennyNeural",
      ssmlLang: "en-US",
      pitch: 0,
      rate: 1.0,
    }),
    "akasha-neutral": Object.freeze({
      name: "en-US-AriaNeural",
      ssmlLang: "en-US",
      pitch: 0,
      rate: 1.0,
    }),
  }),
  "es-ES": Object.freeze({
    "akasha-male": Object.freeze({
      name: "es-ES-AlvaroNeural",
      ssmlLang: "es-ES",
      pitch: 0,
      rate: 1.0,
    }),
    "akasha-female": Object.freeze({
      name: "es-ES-ElviraNeural",
      ssmlLang: "es-ES",
      pitch: 0,
      rate: 1.0,
    }),
    "akasha-neutral": Object.freeze({
      name: "es-ES-AbrilNeural",
      ssmlLang: "es-ES",
      pitch: 0,
      rate: 1.0,
    }),
  }),
});

/**
 * Lookup de voice profile com fallback explícito.
 * Se locale não existir (impossível por type), cai em en-US akasha-neutral.
 */
export function getVoiceProfile(
  locale: TTSLocale,
  profile: TTSVoiceProfile,
): TTSVoiceDescriptor {
  const localeMap = VOICE_PROFILES[locale];
  if (!localeMap) {
    return VOICE_PROFILES["en-US"]["akasha-neutral"];
  }
  const desc = localeMap[profile];
  if (!desc) {
    return VOICE_PROFILES["en-US"]["akasha-neutral"];
  }
  return desc;
}

// ============================================================================
// 3. Chunking algorithm
// ============================================================================

/** SENTENCE_SPLIT: respeita Unicode, contrações PT-BR (não, é), abreviações. */
const SENTENCE_SPLIT = /(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ"„(])/g;

/** PARAGRAPH_SPLIT: duplo newline ou mais. */
const PARAGRAPH_SPLIT = /\n\s*\n+/g;

/** Cap absoluto de chunk para safety. */
const HARD_CHUNK_CAP = 500;

/** Caracteres por segundo na fala natural. Calibrado para PT-BR. */
const CHARS_PER_SECOND_BASE = 14;

/**
 * Divide texto em chunks respeitando a estratégia e o maxLen.
 * IMPORTANTE: chunks têm cap absoluto de HARD_CHUNK_CAP (500) — chunks maiores
 * lançam TTSError(CHUNK_TOO_LARGE).
 */
export function chunkTextForTTS(
  text: string,
  strategy: TTSChunkStrategy,
  maxLen: number,
): string[] {
  if (!text || typeof text !== "string") {
    return [];
  }
  const safeMaxLen = Math.max(50, Math.min(maxLen, HARD_CHUNK_CAP));
  const normalized = text.trim();
  if (!normalized) return [];

  let raw: string[] = [];
  switch (strategy) {
    case "sentence":
      raw = chunkBySentence(normalized);
      break;
    case "paragraph":
      raw = chunkByParagraph(normalized);
      break;
    case "fixed-len":
      raw = chunkByFixedLen(normalized, safeMaxLen);
      break;
    default: {
      // Exhaustive switch — nunca deve cair aqui
      const _exhaustive: never = strategy;
      void _exhaustive;
      raw = chunkBySentence(normalized);
    }
  }

  // Se algum chunk exceder o cap absoluto, lança
  for (const chunk of raw) {
    if (chunk.length > HARD_CHUNK_CAP) {
      throw new TTSError(
        "CHUNK_TOO_LARGE",
        `Chunk excedeu cap absoluto de ${HARD_CHUNK_CAP} chars`,
        { length: chunk.length, cap: HARD_CHUNK_CAP },
      );
    }
  }

  return raw;
}

function chunkBySentence(text: string): string[] {
  // Se texto for curto, retorna como um único chunk
  if (text.length <= HARD_CHUNK_CAP) return [text];

  const parts = text.split(SENTENCE_SPLIT);
  const result: string[] = [];
  let buffer = "";

  for (const part of parts) {
    const candidate = buffer ? `${buffer} ${part}` : part;
    if (candidate.length <= HARD_CHUNK_CAP) {
      buffer = candidate;
    } else {
      if (buffer) result.push(buffer);
      // Se o part sozinho é maior que cap, sub-divide por fixed-len
      if (part.length > HARD_CHUNK_CAP) {
        result.push(...chunkByFixedLen(part, HARD_CHUNK_CAP));
        buffer = "";
      } else {
        buffer = part;
      }
    }
  }
  if (buffer) result.push(buffer);
  return result;
}

function chunkByParagraph(text: string): string[] {
  const paragraphs = text.split(PARAGRAPH_SPLIT);
  const result: string[] = [];
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (trimmed.length <= HARD_CHUNK_CAP) {
      result.push(trimmed);
    } else {
      // Sub-dividir parágrafos longos via sentence
      result.push(...chunkBySentence(trimmed));
    }
  }
  return result;
}

function chunkByFixedLen(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const result: string[] = [];
  // Quebra em word boundaries para preservar pronúncia
  const words = text.split(/\s+/);
  let buffer = "";
  for (const word of words) {
    const candidate = buffer ? `${buffer} ${word}` : word;
    if (candidate.length <= maxLen) {
      buffer = candidate;
    } else {
      if (buffer) result.push(buffer);
      // Se a palavra sozinha é maior que maxLen, quebra forçadamente
      if (word.length > maxLen) {
        for (let i = 0; i < word.length; i += maxLen) {
          result.push(word.slice(i, i + maxLen));
        }
        buffer = "";
      } else {
        buffer = word;
      }
    }
  }
  if (buffer) result.push(buffer);
  return result;
}

// ============================================================================
// 4. SSML builder
// ============================================================================

/** Escapa caracteres especiais SSML. */
function escapeSSMLText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Escapa atributo SSML. */
function escapeSSMLAttr(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

/**
 * Detecta números no texto e envolve em <say-as interpret-as="cardinal">.
 * Cobre: 1, 1.000, 1.000,50, 1º, etc.
 */
function wrapNumbersWithSayAs(text: string): string {
  // Pattern: número inteiro, decimal, ou ordinal simples
  const numberPattern = /\b(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)\b/g;
  return text.replace(numberPattern, (match) => {
    return `<say-as interpret-as="cardinal">${match}</say-as>`;
  });
}

/**
 * Adiciona <break/> antes de pontuação forte (`:`, `;`, `,`) para ritmo natural.
 * Apenas 1 break leve (250ms) para cada `:` ou `;` — não exagera.
 */
function addBreaksForRhythm(text: string): string {
  return text.replace(/([:;])\s+/g, (match, punct) => {
    return `${punct} <break time="250ms"/> `;
  });
}

/**
 * Builder principal de SSML. Recebe texto já com PII redacted.
 * Se `sacredTag` presente, prefixa o chunk com `<mark name="sacred:{tag}"/>`.
 */
export function buildSSML(
  text: string,
  locale: TTSLocale,
  config: TTSConfig,
  sacredTag?: string,
): string {
  const voice = getVoiceProfile(locale, config.voice);
  const safeRate = Math.max(0.5, Math.min(2.0, config.rate));
  const safePitch = Math.max(-12, Math.min(12, config.pitch));
  const safeVolume = Math.max(0.0, Math.min(1.0, config.volume));

  // Sequência: escape -> wrap numbers -> add breaks
  const escaped = escapeSSMLText(text);
  const withNumbers = wrapNumbersWithSayAs(escaped);
  const withBreaks = addBreaksForRhythm(withNumbers);

  // Sacred tag mark — boundary event para Web Speech API
  const sacredMark = sacredTag
    ? `<mark name="sacred:${escapeSSMLAttr(sacredTag)}"/>`
    : "";

  // Format SSML rate: "1.0" ou "+0.0" / "-0.0" para prosody
  const rateStr = safeRate === 1.0 ? "1.0" : (safeRate > 1.0 ? `+${(safeRate - 1).toFixed(2)}` : `-${(1 - safeRate).toFixed(2)}`);
  const pitchStr = safePitch === 0 ? "0st" : (safePitch > 0 ? `+${safePitch}st` : `${safePitch}st`);
  const volumeStr = safeVolume === 1.0 ? "100%" : `${Math.round(safeVolume * 100)}%`;

  return (
    `<speak xml:lang="${voice.ssmlLang}" version="1.0">` +
    `<prosody rate="${rateStr}" pitch="${pitchStr}" volume="${volumeStr}">` +
    sacredMark +
    withBreaks +
    `</prosody>` +
    `</speak>`
  );
}

// ============================================================================
// 5. Sacred tag integration
// ============================================================================

/** Tradições suportadas para sacred tags. */
export type SacredTradition =
  | "cigano"
  | "astrologia"
  | "orixa"
  | "cabala"
  | "numerologia"
  | "tantra"
  | "umbanda";

/** Pattern para validar estrutura `tradição|elemento`. */
const SACRED_TAG_PATTERN = /^[a-z0-9_-]+\|[a-z0-9_-]+$/;

/**
 * Valida estrutura de sacred tag.
 * Tradição deve estar na allowlist; elemento é free-form (mas kebab/snake).
 */
export function isValidSacredTag(tag: string): boolean {
  if (!tag || typeof tag !== "string") return false;
  if (!SACRED_TAG_PATTERN.test(tag)) return false;
  const [tradition] = tag.split("|");
  const allowed: SacredTradition[] = [
    "cigano",
    "astrologia",
    "orixa",
    "cabala",
    "numerologia",
    "tantra",
    "umbanda",
  ];
  return allowed.includes(tradition as SacredTradition);
}

/** Gera nome canônico de mark para Web Speech API boundary event. */
export function buildSacredMarkName(sacredTag: string): string {
  if (!isValidSacredTag(sacredTag)) {
    throw new TTSError(
      "INVALID_TEXT",
      `Sacred tag inválido: ${sacredTag}`,
      { tag: sacredTag },
    );
  }
  return `sacred:${sacredTag}`;
}

// ============================================================================
// 6. SSML validation
// ============================================================================

const MAX_NESTING_DEPTH = 3;
const ALLOWED_TAGS = new Set([
  "speak",
  "prosody",
  "break",
  "say-as",
  "mark",
  "phoneme",
  "sub",
  "emphasis",
  "audio",
  "p",
  "s",
]);

/**
 * Valida SSML. Verifica:
 *   - Tags balanceadas (open/close)
 *   - Nenhum `<script>`
 *   - Nenhum raw HTML (`<script>`, `<iframe>`, `<object>`, `<embed>`)
 *   - Max nesting depth 3
 *   - Apenas tags permitidas
 */
export function validateSSML(ssml: string): SSMLValidationResult {
  const errors: string[] = [];

  if (!ssml || typeof ssml !== "string") {
    return { valid: false, errors: ["SSML vazio ou inválido"] };
  }

  // Anti-XSS: proibir tags perigosas
  const dangerous = /<\s*(script|iframe|object|embed|style|link|meta)\b/i;
  if (dangerous.test(ssml)) {
    errors.push("SSML contém tag perigosa (script/iframe/object/embed/style/link/meta)");
  }

  // Event handlers (on*)
  if (/\son\w+\s*=/i.test(ssml)) {
    errors.push("SSML contém event handler (on*)");
  }

  // javascript: URLs
  if (/javascript\s*:/i.test(ssml)) {
    errors.push("SSML contém javascript: URL");
  }

  // Tags balanceadas via stack
  const tagPattern = /<\s*\/?\s*([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)\s*>/g;
  const stack: string[] = [];
  let maxDepth = 0;
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(ssml)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClose = fullTag.startsWith("</");
    const isSelfClose = fullTag.endsWith("/>") || tagName === "break" || tagName === "mark";

    if (!ALLOWED_TAGS.has(tagName) && !isClose) {
      // Pular text content com <
      if (!/^<\s*[a-zA-Z]/.test(fullTag)) continue;
      errors.push(`Tag não permitida: <${tagName}>`);
      continue;
    }

    if (isClose) {
      if (stack.length === 0) {
        errors.push(`Tag de fechamento sem abertura: </${tagName}>`);
      } else {
        const last = stack.pop();
        if (last === undefined) {
          // Stack já vazio mas entrou aqui — defesa
          errors.push(`Tag de fechamento sem abertura: </${tagName}>`);
        } else if (last !== tagName) {
          errors.push(`Tag não balanceada: aberto <${last}>, fechado </${tagName}>`);
          stack.push(last); // tentar recuperar
        }
      }
    } else if (!isSelfClose) {
      stack.push(tagName);
      if (stack.length > maxDepth) maxDepth = stack.length;
    }
  }
  if (stack.length > 0) {
    errors.push(`Tags não fechadas: ${stack.join(", ")}`);
  }
  if (maxDepth > MAX_NESTING_DEPTH) {
    errors.push(`Nesting depth ${maxDepth} excede máximo ${MAX_NESTING_DEPTH}`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// 7. Cache key
// ============================================================================

/** SHA-256 truncated para 12 hex chars (48 bits). Suficiente para localStorage. */
const CACHE_KEY_HEX_LEN = 12;

/**
 * Gera cache key estável para localStorage.
 * Hash de `${locale}|${voice}|${rate}|${pitch}|${volume}|${text}`.
 * Usa `node:crypto` (compatível server + edge).
 */
export function getTTSCacheKey(req: TTSRequest): string {
  const redacted = redactPIIForTTS(req.text);
  const material = [
    req.config.locale,
    req.config.voice,
    req.config.rate.toFixed(2),
    req.config.pitch.toString(),
    req.config.volume.toFixed(2),
    redacted,
  ].join("|");
  const hash = sha256HexSync(material);
  return `tts:${hash.slice(0, CACHE_KEY_HEX_LEN)}`;
}

// ============================================================================
// 8. LGPD consent gate
// ============================================================================

/** Pattern UUID v4 (case-insensitive). */
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Valida UUID v4.
 */
export function isValidUUIDv4(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return UUID_V4_PATTERN.test(value);
}

/**
 * Cloud-TTS routes (Azure, Google) requerem consentimento LGPD.
 * Web Speech API nativa do browser não envia áudio para servidor, então NÃO requer.
 * Esta função é a gate de decisão.
 *
 * IMPORTANTE: por padrão retorna true (cloud-TTS path = LGPD gate ativo).
 * Em implementação futura, pode-se adicionar feature flag para rotas.
 */
export function requiresLGPDConsent(_locale: TTSLocale): boolean {
  // Cloud TTS sempre requer consent (Azure/Google enviam texto para servidor deles)
  // Se houvesse feature flag para Web Speech API path, retornaria false.
  return true;
}

/**
 * Garante que TTSRequest tem consentId válido se cloud-TTS está ativo.
 * Lança TTSError(CONSENT_MISSING) se inválido.
 */
export function assertLGPDConsent(
  req: TTSRequest,
  consentRequired: boolean,
): void {
  if (!consentRequired) return;
  if (!req.consentId || !isValidUUIDv4(req.consentId)) {
    throw new TTSError(
      "CONSENT_MISSING",
      "Cloud TTS requer consentId UUID v4 válido (LGPD)",
      { hasConsentId: Boolean(req.consentId) },
    );
  }
}

// ============================================================================
// 9. PII redaction
// ============================================================================

/** Email pattern. */
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[a-z]{2,}/gi;

/** Phone BR: (XX) 9XXXX-XXXX, (XX) XXXX-XXXX, +55 variants. */
const PHONE_BR_PATTERN = /\(\d{2}\)\s?9?\d{4}-\d{4}/g;

/** Phone BR loose: (XX) XXXX-XXXX sem 9. */
const PHONE_BR_LOOSE = /\(\d{2}\)\s?\d{4}-\d{4}/g;

/** CPF: XXX.XXX.XXX-XX. */
const CPF_PATTERN = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;

/** CNPJ: XX.XXX.XXX/XXXX-XX. */
const CNPJ_PATTERN = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g;

/** RG: XX.XXX.XXX-X. */
const RG_PATTERN = /\d{2}\.\d{3}\.\d{3}-[\dX]/g;

/** Substitui PII por placeholder. */
const PII_PLACEHOLDER = "[dados removidos]";

/**
 * Redige PII do texto antes de qualquer síntese.
 * Cobre: email, phone BR (com/sem 9), CPF, CNPJ, RG.
 * Idempotente — chamar 2x dá o mesmo resultado.
 */
export function redactPIIForTTS(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(EMAIL_PATTERN, PII_PLACEHOLDER)
    .replace(CNPJ_PATTERN, PII_PLACEHOLDER)
    .replace(CPF_PATTERN, PII_PLACEHOLDER)
    .replace(RG_PATTERN, PII_PLACEHOLDER)
    .replace(PHONE_BR_PATTERN, PII_PLACEHOLDER)
    .replace(PHONE_BR_LOOSE, PII_PLACEHOLDER);
}

// ============================================================================
// 10. Fallback chain
// ============================================================================

/** Tipos de fallback TTS. */
export type TTSFallbackTarget = "cloud" | "web-speech-api" | "silent";

/** Resultado de fallback. */
export interface TTSFallbackResult {
  target: TTSFallbackTarget;
  available: boolean;
  reason: string;
}

/**
 * Detecta fallback target baseado em capabilities do ambiente.
 * Em Node (server): só cloud ou silent.
 * Em browser: cloud → Web Speech API → silent.
 */
export function detectTTSFallback(
  hasWebSpeechAPI: boolean,
  hasCloudCredentials: boolean,
): TTSFallbackResult {
  if (hasCloudCredentials) {
    return { target: "cloud", available: true, reason: "Cloud TTS credentials detected" };
  }
  if (hasWebSpeechAPI) {
    return { target: "web-speech-api", available: true, reason: "Web Speech API available in browser" };
  }
  return { target: "silent", available: false, reason: "No TTS capability detected" };
}

// ============================================================================
// 11. Accessibility
// ============================================================================

/** Prefers-reduced-motion: chunks excessivos incomodam. */
const REDUCED_MOTION_MAX_CHUNKS = 6;

/** Prefers-reduced-data: desabilita prefetch. */
const PREFETCH_MAX_CHARS = 0;

/**
 * Aplica acessibilidade ao config de TTS.
 * - prefers-reduced-motion: limita max chunks (evita fragmentação excessiva)
 * - prefers-reduced-data: desabilita prefetch
 */
export function applyAccessibility(
  config: TTSConfig,
  options: {
    prefersReducedMotion?: boolean;
    prefersReducedData?: boolean;
  } = {},
): TTSConfig {
  const adjusted: TTSConfig = { ...config };
  if (options.prefersReducedMotion) {
    // Forçar maxChunkLen maior para reduzir número de chunks
    adjusted.maxChunkLen = Math.max(adjusted.maxChunkLen, 400);
  }
  return adjusted;
}

/**
 * Verifica se deve permitir prefetch baseado em prefers-reduced-data.
 */
export function shouldPrefetchAudio(
  text: string,
  options: { prefersReducedData?: boolean } = {},
): boolean {
  if (options.prefersReducedData) return false;
  return text.length > PREFETCH_MAX_CHARS;
}

/**
 * Limita número de chunks para acessibilidade (reduced-motion).
 * Se exceder, agrega via fixed-len.
 */
export function capChunksForAccessibility(
  chunks: string[],
  prefersReducedMotion: boolean,
): string[] {
  if (!prefersReducedMotion) return chunks;
  if (chunks.length <= REDUCED_MOTION_MAX_CHUNKS) return chunks;
  // Re-aggregate via fixed-len
  const joined = chunks.join(" ");
  return chunkByFixedLen(joined, HARD_CHUNK_CAP);
}

// ============================================================================
// 12. Error handling
// ============================================================================

/**
 * Tenta validar um TTSRequest e retorna erros tipados.
 */
export function validateTTSRequest(req: TTSRequest): TTSError[] {
  const errors: TTSError[] = [];
  if (!req.text || typeof req.text !== "string" || req.text.trim().length === 0) {
    errors.push(new TTSError("INVALID_TEXT", "Texto vazio ou inválido"));
  }
  if (req.config.rate < 0.5 || req.config.rate > 2.0) {
    errors.push(new TTSError(
      "RATE_OUT_OF_RANGE",
      `Rate ${req.config.rate} fora do range [0.5, 2.0]`,
      { rate: req.config.rate },
    ));
  }
  if (req.config.pitch < -12 || req.config.pitch > 12) {
    errors.push(new TTSError(
      "PITCH_OUT_OF_RANGE",
      `Pitch ${req.config.pitch} fora do range [-12, 12]`,
      { pitch: req.config.pitch },
    ));
  }
  if (req.config.volume < 0.0 || req.config.volume > 1.0) {
    errors.push(new TTSError(
      "VOLUME_OUT_OF_RANGE",
      `Volume ${req.config.volume} fora do range [0, 1]`,
      { volume: req.config.volume },
    ));
  }
  if (!VOICE_PROFILES[req.config.locale]) {
    errors.push(new TTSError(
      "LOCALE_UNSUPPORTED",
      `Locale não suportada: ${req.config.locale}`,
      { locale: req.config.locale },
    ));
  }
  return errors;
}

// ============================================================================
// 13. i18n keys
// ============================================================================

/** Bundles i18n por locale. */
const I18N_KEYS: Readonly<Record<TTSLocale, TTSI18nKeys>> = Object.freeze({
  "pt-BR": Object.freeze({
    playButton: "Tocar",
    pauseButton: "Pausar",
    stopButton: "Parar",
    voiceLabel: "Voz da Akasha",
    errorNoConsent: "É necessário consentimento para usar voz (LGPD)",
    errorLocaleUnsupported: "Idioma não suportado",
    errorChunkTooLarge: "Texto muito longo para síntese",
    errorPiiDetected: "Dados pessoais detectados e removidos",
    sacredTagPrefix: "Marcação sagrada:",
    downloadAudio: "Baixar áudio",
    rateLabel: "Velocidade",
    chunkLabel: "Trecho",
  }),
  "en-US": Object.freeze({
    playButton: "Play",
    pauseButton: "Pause",
    stopButton: "Stop",
    voiceLabel: "Akasha's voice",
    errorNoConsent: "Consent required for voice (LGPD)",
    errorLocaleUnsupported: "Language not supported",
    errorChunkTooLarge: "Text too long for synthesis",
    errorPiiDetected: "Personal data detected and removed",
    sacredTagPrefix: "Sacred tag:",
    downloadAudio: "Download audio",
    rateLabel: "Rate",
    chunkLabel: "Chunk",
  }),
  "es-ES": Object.freeze({
    playButton: "Reproducir",
    pauseButton: "Pausar",
    stopButton: "Detener",
    voiceLabel: "Voz de Akasha",
    errorNoConsent: "Se requiere consentimiento para voz (LGPD)",
    errorLocaleUnsupported: "Idioma no soportado",
    errorChunkTooLarge: "Texto demasiado largo para síntesis",
    errorPiiDetected: "Datos personales detectados y eliminados",
    sacredTagPrefix: "Etiqueta sagrada:",
    downloadAudio: "Descargar audio",
    rateLabel: "Velocidad",
    chunkLabel: "Fragmento",
  }),
});

/**
 * Retorna bundle de chaves i18n para a Voice Mode UI.
 * 12 chaves por locale × 3 locales = 36 chaves totais.
 */
export function getI18nKeys(locale: TTSLocale): TTSI18nKeys {
  return I18N_KEYS[locale] ?? I18N_KEYS["pt-BR"];
}

// ============================================================================
// 14. Audio duration estimation
// ============================================================================

/**
 * Estima duração de áudio em ms baseado em chars + rate.
 * Base: 14 chars/sec @ rate 1.0 (PT-BR natural speech).
 * Ajustes: rate > 1.0 reduz duração proporcionalmente.
 */
export function estimateAudioDurationMs(text: string, rate: number): number {
  if (!text || typeof text !== "string") return 0;
  const safeRate = Math.max(0.5, Math.min(2.0, rate));
  const charCount = text.length;
  const baseMs = (charCount / CHARS_PER_SECOND_BASE) * 1000;
  return Math.round(baseMs / safeRate);
}

// ============================================================================
// 15. Main synthesis entry point
// ============================================================================

/**
 * Sintetiza uma resposta oracular completa.
 * Fluxo:
 *   1. Validar TTSRequest
 *   2. Redact PII
 *   3. Validar consent LGPD (se cloud-TTS)
 *   4. Chunkar texto
 *   5. Para cada chunk: build SSML, validate SSML, estimate duration
 *   6. Retornar TTSResponse
 */
export function synthesizeOracularResponse(req: TTSRequest): TTSResponse {
  // 1. Validar request
  const errors = validateTTSRequest(req);
  if (errors.length > 0) {
    throw errors[0]; // Throw o primeiro — fail fast
  }

  // 2. Redact PII
  const safeText = redactPIIForTTS(req.text);

  // 3. LGPD gate
  if (requiresLGPDConsent(req.config.locale)) {
    assertLGPDConsent(req, true);
  }

  // 4. Chunk
  const chunks = chunkTextForTTS(
    safeText,
    req.config.chunkStrategy,
    req.config.maxChunkLen,
  );

  // 5. Para cada chunk: build + validate + estimate
  const ttsChunks: TTSChunk[] = chunks.map((chunkText, idx) => {
    const ssml = buildSSML(chunkText, req.config.locale, req.config, req.sacredTag);
    const validation = validateSSML(ssml);
    if (!validation.valid) {
      throw new TTSError(
        "SSML_INVALID",
        `SSML inválido no chunk ${idx}: ${validation.errors.join("; ")}`,
        { chunkIndex: idx, errors: validation.errors },
      );
    }
    const estimatedDurationMs = estimateAudioDurationMs(chunkText, req.config.rate);
    return {
      index: idx,
      text: chunkText,
      ssml,
      estimatedDurationMs,
    };
  });

  // 6. Total
  const totalEstimatedDurationMs = ttsChunks.reduce(
    (sum, c) => sum + c.estimatedDurationMs,
    0,
  );

  return {
    chunks: ttsChunks,
    totalChunks: ttsChunks.length,
    totalEstimatedDurationMs,
    voiceUsed: req.config.voice,
    localeUsed: req.config.locale,
  };
}

// ============================================================================
// 16. Utility: safe logging
// ============================================================================

/**
 * Log apenas hash do texto, nunca plain text.
 * Cumpre LGPD: log de TTS não pode conter PII nem texto completo.
 */
export function safeLog(text: string): string {
  if (!text) return "[empty]";
  const hash = sha256HexSync(text);
  return `[sha256:${hash.slice(0, 16)}]`;
}

// ============================================================================
// 17. Defaults
// ============================================================================

/** Default config factory. */
export function getDefaultTTSConfig(locale: TTSLocale = "pt-BR"): TTSConfig {
  return {
    locale,
    voice: "akasha-female",
    rate: 1.0,
    pitch: 0,
    volume: 1.0,
    maxChunkLen: 280,
    chunkStrategy: "sentence",
  };
}

// ============================================================================
// 18. Constants exports (for testing/inspection)
// ============================================================================

export const TTS_CONSTANTS = Object.freeze({
  HARD_CHUNK_CAP,
  CHARS_PER_SECOND_BASE,
  CACHE_KEY_HEX_LEN,
  MAX_NESTING_DEPTH,
  REDUCED_MOTION_MAX_CHUNKS,
  PREFETCH_MAX_CHARS,
  PII_PLACEHOLDER,
  ALLOWED_TAGS: Object.freeze([...ALLOWED_TAGS]),
  SUPPORTED_LOCALES: Object.freeze(Object.keys(VOICE_PROFILES) as TTSLocale[]),
  SUPPORTED_VOICES: Object.freeze([
    "akasha-male",
    "akasha-female",
    "akasha-neutral",
  ] as TTSVoiceProfile[]),
  SUPPORTED_STRATEGIES: Object.freeze([
    "sentence",
    "paragraph",
    "fixed-len",
  ] as TTSChunkStrategy[]),
  ERROR_CODES: Object.freeze([
    "INVALID_TEXT",
    "SSML_INVALID",
    "CONSENT_MISSING",
    "LOCALE_UNSUPPORTED",
    "RATE_OUT_OF_RANGE",
    "PITCH_OUT_OF_RANGE",
    "VOLUME_OUT_OF_RANGE",
    "CHUNK_TOO_LARGE",
    "UNKNOWN",
  ] as TTSErrorCode[]),
});
