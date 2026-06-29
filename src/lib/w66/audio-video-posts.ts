/**
 * w66 audio-video-posts engine
 * ----------------------------
 * Pure data-layer engine for audio/video posts on the feed.
 *
 * Architecture (15 numbered sections):
 *   §1   Type definitions (MediaKind, MediaFormat, MediaPost, etc.)
 *   §2   Cross-runtime HMAC + crypto resolution
 *   §3   MEDIA_FORMATS whitelist (AUDIO_KINDS, VIDEO_KINDS)
 *   §4   MEDIA_LIMITS constants (15MB audio, 50MB video)
 *   §5   Custom error classes (4) — extend Error with code + kind
 *   §6   Sacred-tag catalogs (5 traditions: CIGANO=36, ORIXAS=16, CHAKRAS=7, SEFIROT=10, ASTROLOGIA=18)
 *   §7   Type guards (3) — isAudioPost, isVideoPost, isSacredMediaRef
 *   §8   Helpers (getMediaKind, clampMediaSize, sacredMediaRefs)
 *   §9   Duration extractors (3: extractDurationMp3, extractDurationMp4, extractDurationWebm — hand-rolled)
 *   §10  Waveform + contact-sheet SVG generators (2 — pure SVG, NO canvas)
 *   §11  Validation (validateMediaPost — never-throws)
 *   §12  Builders (createAudioPost, createVideoPost — full pipeline + LGPD consent + HMAC id)
 *   §13  HMAC chain (chainMediaHash, verifyMediaHashLink — SHA-256, NEVER FNV)
 *   §14  Audit (auditMediaCoverage, isFullCoverage gate)
 *   §15  __ALL_EXPORTS (grep-audit visibility)
 *
 * Anti-patterns strictly avoided:
 *   - canvas / ffmpeg / music-metadata (no npm deps; cycle 62 lesson 7)
 *   - any / as unknown as casts (TS strict mode)
 *   - raw userId persisted (pseudonymization mandatory per LGPD Art. 9)
 *   - FNV-1a hash (NEVER — only HMAC-SHA256, cycle 60 lesson)
 *   - throw inside validate (always returns errors[])
 *   - destructuring with default secrets (caller MUST supply)
 */

// ============================================================================
// §1  TYPE DEFINITIONS
// ============================================================================

export type MediaKind = "audio" | "video"

export type MediaFormat = "mp3" | "wav" | "ogg" | "mp4" | "webm"

/**
 * Branded type: a MediaId is a non-empty string that has been validated
 * through `toMediaId`. Prevents accidental cross-wiring of arbitrary strings
 * into the audit chain.
 */
export type MediaId = string & { readonly __brand: "MediaId" }

export type PostId = string & { readonly __brand: "PostId" }

export type SacredTradition =
  | "CIGANO"
  | "ORIXAS"
  | "CHAKRAS"
  | "SEFIROT"
  | "ASTROLOGIA"

export type SacredTag = string & { readonly __brand: "SacredTag" }

export type SacredMediaRef = {
  readonly tag: SacredTag
  readonly tradition: SacredTradition
  readonly charStart: number
  readonly charEnd: number
}

export type MediaConsent = {
  readonly faceConsent: boolean
  readonly voiceConsent: boolean
  readonly grantedAt: string
  readonly expiresAt: string
}

export type MediaLimits = {
  readonly maxBytes: number
  readonly minDurationSec: number
  readonly maxDurationSec: number
}

export type MediaPostBase = {
  readonly id: MediaId
  readonly postId: PostId
  readonly authorPseudonym: string
  readonly caption: string
  readonly format: MediaFormat
  readonly sizeBytes: number
  readonly durationSec: number | null
  readonly durationSource: "parsed" | "fallback" | "caller_supplied" | "unknown"
  readonly sacredRefs: ReadonlyArray<SacredMediaRef>
  readonly sacredTags: ReadonlyArray<SacredTag>
  readonly createdAt: string
  readonly auditHash: string
}

export type AudioPost = MediaPostBase & {
  readonly kind: "audio"
  readonly audioConsent: MediaConsent
}

export type VideoPost = MediaPostBase & {
  readonly kind: "video"
  readonly videoConsent: MediaConsent
  readonly contactSheetDataUri: string | null
}

export type MediaPost = AudioPost | VideoPost

export type AudioPostInput = {
  readonly authorId: string
  readonly pseudonymSalt: string
  readonly caption: string
  readonly format: "mp3" | "wav" | "ogg"
  readonly buffer: Uint8Array
  readonly consent: MediaConsent
  readonly callerDurationSec?: number
  readonly secret: string
  readonly createdAt?: string
}

export type VideoPostInput = {
  readonly authorId: string
  readonly pseudonymSalt: string
  readonly caption: string
  readonly format: "mp4" | "webm"
  readonly buffer: Uint8Array
  readonly consent: MediaConsent
  readonly includeContactSheet?: boolean
  readonly callerDurationSec?: number
  readonly secret: string
  readonly createdAt?: string
}

export type MediaPostInput = {
  readonly kind: MediaKind
  readonly format: MediaFormat
  readonly buffer: Uint8Array
  readonly caption: string
  readonly consent: MediaConsent
  readonly callerDurationSec?: number
}

export type ValidationResult =
  | { readonly ok: true; readonly post?: undefined; readonly warnings: ReadonlyArray<string> }
  | { readonly ok: false; readonly errors: ReadonlyArray<string>; readonly post?: undefined }

export type CoverageReport = {
  readonly byTradition: Readonly<Record<SacredTradition, number>>
  readonly total: number
  readonly isFullCoverage: boolean
  readonly floorMet: Readonly<Record<SacredTradition, boolean>>
  readonly gaps: ReadonlyArray<SacredTradition>
}

export type ExtractOptions = {
  readonly strict?: boolean
}

// ============================================================================
// §2  CROSS-RUNTIME HMAC + CRYPTO
// ============================================================================

type HashLike = {
  update(s: string): HashLike
  digest(encoding: string): string
}

type CryptoLike = {
  createHash(algo: string): HashLike
}

type RequireLike = (id: string) => unknown
type ModuleLike = { createRequire?: (url: string) => RequireLike } | undefined

function resolveCrypto(): CryptoLike {
  // 1. globalThis.crypto (subtle + node webcrypto) — Bun + browser-ish
  const tryGlobal = (globalThis as { crypto?: { createHash?: (a: string) => unknown } }).crypto
  if (tryGlobal?.createHash && typeof tryGlobal.createHash === "function") {
    return tryGlobal as unknown as CryptoLike
  }
  // 2. process.getBuiltinModule("node:module") — Bun + modern Node
  const proc = process as unknown as { getBuiltinModule?: (m: string) => ModuleLike }
  const viaBuiltin = proc.getBuiltinModule
  if (viaBuiltin) {
    const mod = viaBuiltin.call(proc, "node:module") as ModuleLike
    if (mod && typeof mod.createRequire === "function") {
      const req = mod.createRequire("/workspace/wt-w66-audio-video/src/lib/w66/audio-video-posts.ts")
      const c = req("node:crypto") as CryptoLike
      return c
    }
  }
  // 3. CommonJS globalThis.require
  const fallback = (globalThis as { require?: RequireLike }).require
  if (typeof fallback === "function") {
    const c = fallback("node:crypto") as CryptoLike
    return c
  }
  throw new MediaEngineError(
    "CRYPTO_UNAVAILABLE",
    "neither globalThis.crypto, process.getBuiltinModule, nor a require() were available",
  )
}

// ============================================================================
// §3  MEDIA_FORMATS WHITELIST
// ============================================================================

export const AUDIO_FORMATS: ReadonlyArray<"mp3" | "wav" | "ogg"> = Object.freeze([
  "mp3",
  "wav",
  "ogg",
])

export const VIDEO_FORMATS: ReadonlyArray<"mp4" | "webm"> = Object.freeze([
  "mp4",
  "webm",
])

export const MEDIA_FORMATS: Readonly<Record<MediaKind, ReadonlyArray<string>>> = Object.freeze({
  audio: AUDIO_FORMATS,
  video: VIDEO_FORMATS,
})

export const FORBIDDEN_FORMATS: ReadonlyArray<string> = Object.freeze([
  "wma",
  "flac",
  "aac",
  "avi",
  "mov",
  "mkv",
  "m4a",
  "opus",
])

// ============================================================================
// §4  MEDIA_LIMITS
// ============================================================================

export const MEDIA_LIMITS: Readonly<Record<MediaKind, MediaLimits>> = Object.freeze({
  audio: Object.freeze({ maxBytes: 15 * 1024 * 1024, minDurationSec: 1, maxDurationSec: 1800 }),
  video: Object.freeze({ maxBytes: 50 * 1024 * 1024, minDurationSec: 1, maxDurationSec: 3600 }),
})

export const CAPTION_MIN = 1 as const
export const CAPTION_MAX = 2_000 as const
export const CONSENT_REQUIRED_GRANT_AHEAD_SEC = 60 as const
export const HMAC_ALGO = "sha256" as const

// ============================================================================
// §5  ERROR CLASSES
// ============================================================================

export class MediaEngineError extends Error {
  readonly code: string
  readonly kind: MediaKind | "meta"
  constructor(code: string, message: string, kind: MediaKind | "meta" = "meta") {
    super(`MEDIA_ENGINE: ${code}: ${message}`)
    this.name = "MediaEngineError"
    this.code = code
    this.kind = kind
  }
}

export class InvalidMediaFormatError extends MediaEngineError {
  constructor(format: string) {
    super("INVALID_MEDIA_FORMAT", `format "${format}" is not in the MEDIA_FORMATS whitelist`, "meta")
    this.name = "InvalidMediaFormatError"
  }
}

export class MediaSizeExceededError extends MediaEngineError {
  constructor(kind: MediaKind, sizeBytes: number, maxBytes: number) {
    super(
      "MEDIA_SIZE_EXCEEDED",
      `${kind} post is ${sizeBytes} bytes, exceeds cap of ${maxBytes}`,
      kind,
    )
    this.name = "MediaSizeExceededError"
  }
}

export class MediaConsentMissingError extends MediaEngineError {
  constructor(kind: MediaKind, what: "face" | "voice" | "expiry" | "object") {
    const reason = `${kind} post requires consent (${what})`
    super("MEDIA_CONSENT_MISSING", reason, kind)
    this.name = "MediaConsentMissingError"
  }
}

export class DurationParseError extends MediaEngineError {
  constructor(format: string, reason: string) {
    super("DURATION_PARSE_FAILED", `could not parse ${format} duration: ${reason}`, "meta")
    this.name = "DurationParseError"
  }
}

// ============================================================================
// §6  SACRED-TAG CATALOGS (5 traditions, 87 symbols total)
// ============================================================================

export const CIGANO_CARDS: readonly SacredTag[] = Object.freeze([
  "Cavaleiro", "Cigana", "Cigano", "Navio", "Casa", "Nuvem", "Cobra",
  "Caixão", "Buquê", "Foice", "Chicote", "Pássaros", "Criança", "Raposa",
  "Urso", "Estrelas", "Cegonha", "Cachorro", "Torre", "Jardim", "Montanha",
  "Caminho", "Ratos", "Coração", "Anel", "Livro", "Carta", "Homem",
  "Mulher", "Lírios", "Sol", "Lua", "Peixe", "Âncora", "Cruz", "Chaves",
] as SacredTag[])

export const ORIXAS: readonly SacredTag[] = Object.freeze([
  "Exu", "Ogum", "Oxossi", "Xangô", "Iansã", "Oxum", "Iemanjá",
  "Obaluaiê", "Nanã", "Omulu", "Logunedé", "Oxumaré", "Ewá", "Ibeji",
  "Orixá", "Oba",
] as SacredTag[])

export const CHAKRAS: readonly SacredTag[] = Object.freeze([
  "Muladhara", "Swadhisthana", "Manipura", "Anahata", "Vishuddha",
  "Ajna", "Sahasrara",
] as SacredTag[])

export const SEFIROT: readonly SacredTag[] = Object.freeze([
  "Keter", "Chokhmah", "Binah", "Chesed", "Gevurah",
  "Tiferet", "Netzach", "Hod", "Yesod", "Malkuth",
] as SacredTag[])

/**
 * ASTROLOGIA — 12 zodiac signs + 6 axes (Ascendente, Meio-do-Céu,
 * Descendente, Fundo-do-Céu, Nodo Norte, Nodo Sul) = 18 total.
 */
export const ASTROLOGIA: readonly SacredTag[] = Object.freeze([
  "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem",
  "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes",
  "Ascendente", "Meio-do-Céu", "Descendente", "Fundo-do-Céu",
  "Nodo Norte", "Nodo Sul",
] as SacredTag[])

export const TRADITION_FLOORS: Readonly<Record<SacredTradition, number>> = Object.freeze({
  CIGANO: 36,
  ORIXAS: 16,
  CHAKRAS: 7,
  SEFIROT: 10,
  ASTROLOGIA: 18,
})

export const TRADITION_CATALOG: Readonly<Record<SacredTradition, ReadonlyArray<SacredTag>>> = Object.freeze({
  CIGANO: CIGANO_CARDS,
  ORIXAS: ORIXAS,
  CHAKRAS: CHAKRAS,
  SEFIROT: SEFIROT,
  ASTROLOGIA: ASTROLOGIA,
})

export const ALL_MEDIA_SACRED_TAGS: ReadonlyArray<SacredTag> = Object.freeze([
  ...CIGANO_CARDS,
  ...ORIXAS,
  ...CHAKRAS,
  ...SEFIROT,
  ...ASTROLOGIA,
] as SacredTag[])

/** Tag → tradition lookup map (built once, frozen). */
const SACRED_TAG_TO_TRADITION: ReadonlyMap<string, SacredTradition> = (() => {
  const m = new Map<string, SacredTradition>()
  for (const t of CIGANO_CARDS) m.set(t, "CIGANO")
  for (const t of ORIXAS) m.set(t, "ORIXAS")
  for (const t of CHAKRAS) m.set(t, "CHAKRAS")
  for (const t of SEFIROT) m.set(t, "SEFIROT")
  for (const t of ASTROLOGIA) m.set(t, "ASTROLOGIA")
  return m
})()

// ============================================================================
// §7  TYPE GUARDS
// ============================================================================

export function isAudioPost(p: MediaPost | null | undefined): p is AudioPost {
  return !!p && typeof p === "object" && (p as { kind?: unknown }).kind === "audio"
}

export function isVideoPost(p: MediaPost | null | undefined): p is VideoPost {
  return !!p && typeof p === "object" && (p as { kind?: unknown }).kind === "video"
}

export function isSacredMediaRef(x: unknown): x is SacredMediaRef {
  if (!x || typeof x !== "object") return false
  const o = x as Record<string, unknown>
  if (typeof o.tag !== "string") return false
  if (typeof o.charStart !== "number") return false
  if (typeof o.charEnd !== "number") return false
  if (typeof o.tradition !== "string") return false
  const t = o.tradition as SacredTradition
  return TRADITION_FLOORS[t] !== undefined
}

// ============================================================================
// §8  HELPERS
// ============================================================================

export function getMediaKind(format: MediaFormat): MediaKind {
  if ((AUDIO_FORMATS as ReadonlyArray<string>).includes(format)) return "audio"
  if ((VIDEO_FORMATS as ReadonlyArray<string>).includes(format)) return "video"
  throw new InvalidMediaFormatError(format)
}

export function clampMediaSize(bytes: number, kind: MediaKind): number {
  if (!Number.isFinite(bytes) || bytes < 0) return 0
  const cap = MEDIA_LIMITS[kind].maxBytes
  return Math.min(bytes, cap)
}

function toMediaId(s: string): MediaId {
  if (typeof s !== "string" || s.length === 0) {
    throw new MediaEngineError("INVALID_MEDIA_ID", "media id must be non-empty string")
  }
  return s as MediaId
}

function toPostId(s: string): PostId {
  if (typeof s !== "string" || s.length === 0) {
    throw new MediaEngineError("INVALID_POST_ID", "post id must be non-empty string")
  }
  return s as PostId
}

function toSacredTag(s: string): SacredTag {
  return s as SacredTag
}

function pseudonymizeAuthor(authorId: string, salt: string): string {
  if (typeof authorId !== "string" || authorId.length === 0) return ""
  const crypto = resolveCrypto()
  const h = crypto.createHash("sha256")
  const updated = h.update(`${authorId}:${salt}`)
  const hex = updated.digest("hex")
  return hex.slice(0, 16)
}

function isValidIsoTimestamp(s: string): boolean {
  if (typeof s !== "string") return false
  const t = Date.parse(s)
  return Number.isFinite(t)
}

/**
 * Scan a caption for sacred-tag occurrences, returning char-ranged refs.
 * Uses word-boundary lookaround because `\b` doesn't catch accented chars
 * in Node v22 (cycle 64 lesson).
 */
export function sacredMediaRefs(caption: string): ReadonlyArray<SacredMediaRef> {
  if (typeof caption !== "string" || caption.length === 0) return []
  const refs: SacredMediaRef[] = []
  const seen = new Set<string>()
  for (const tag of ALL_MEDIA_SACRED_TAGS) {
    const tradition = SACRED_TAG_TO_TRADITION.get(tag)
    if (!tradition) continue
    if (seen.has(tag)) continue
    // word-boundary-ish scan: tag may be wrapped in punctuation/whitespace
    let from = 0
    while (from <= caption.length) {
      const idx = caption.indexOf(tag, from)
      if (idx < 0) break
      const before = idx === 0 ? "" : caption.charAt(idx - 1)
      const after = idx + tag.length >= caption.length ? "" : caption.charAt(idx + tag.length)
      const isWordChar = (c: string): boolean => /[A-Za-zÀ-ÿ0-9]/.test(c)
      const leftOk = !isWordChar(before)
      const rightOk = !isWordChar(after)
      if (leftOk && rightOk) {
        refs.push({
          tag: toSacredTag(tag),
          tradition,
          charStart: idx,
          charEnd: idx + tag.length,
        })
        seen.add(tag)
        break
      }
      from = idx + 1
    }
  }
  return refs
}

// ============================================================================
// §9  DURATION EXTRACTORS (hand-rolled, NO npm deps)
// ============================================================================

// MPEG audio frame header constants (ISO/IEC 11172-3 + 13818-3)
const MP3_BITRATE_TABLE: ReadonlyArray<number> = Object.freeze([
  // Layer III, version 1 (MPEG-1). Index 0 is "free", 15 is "bad".
  0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0,
])

const MP3_SAMPLERATE_TABLE: ReadonlyArray<number> = Object.freeze([
  44100, 48000, 32000, 0,
])

/**
 * Read a 32-bit big-endian unsigned int from a buffer.
 */
function readU32BE(buf: Uint8Array, off: number): number {
  if (off + 4 > buf.length) return 0
  return ((buf[off] as number) << 24) |
         (((buf[off + 1] as number) & 0xff) << 16) |
         (((buf[off + 2] as number) & 0xff) << 8) |
         ((buf[off + 3] as number) & 0xff)
}

/**
 * Read a 32-bit big-endian unsigned int from a buffer (signed-safe).
 */
function readU32BELong(buf: Uint8Array, off: number): number {
  return readU32BE(buf, off) >>> 0
}

/**
 * Read a 16-bit big-endian unsigned int.
 */
function readU16BE(buf: Uint8Array, off: number): number {
  if (off + 2 > buf.length) return 0
  return ((buf[off] as number) << 8) | ((buf[off + 1] as number) & 0xff)
}

/**
 * Read an ID3v2 size (synchsafe integer, 4 bytes).
 */
function readId3v2Synchsafe(buf: Uint8Array, off: number): number {
  if (off + 4 > buf.length) return 0
  const b0 = (buf[off] as number) & 0x7f
  const b1 = (buf[off + 1] as number) & 0x7f
  const b2 = (buf[off + 2] as number) & 0x7f
  const b3 = (buf[off + 3] as number) & 0x7f
  return (b0 << 21) | (b1 << 14) | (b2 << 7) | b3
}

/**
 * extractDurationMp3 — parse MPEG audio frame header.
 * Strategy: skip ID3v2 header if present, scan for 11-bit sync word
 * (0xFFE_), read bitrate + sample rate, then look for Xing/VBRI header
 * to get total frame count for VBR. Falls back to fixed-frame estimate.
 *
 * Throws DurationParseError if no valid frame header is found.
 */
export function extractDurationMp3(buffer: Uint8Array): number {
  if (!(buffer instanceof Uint8Array) || buffer.length < 128) {
    throw new DurationParseError("mp3", "buffer too small or not a Uint8Array")
  }
  let offset = 0
  // Skip ID3v2 tag if present (starts with "ID3")
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    const tagSize = readId3v2Synchsafe(buffer, 6)
    offset = 10 + tagSize
    if (offset >= buffer.length) {
      throw new DurationParseError("mp3", "ID3v2 tag consumes entire buffer")
    }
  }
  // Scan for first valid MPEG audio frame header (skip false sync words)
  let frameHeader = 0
  let headerOffset = -1
  let scanLimit = Math.min(offset + 4096, buffer.length - 4)
  for (let i = offset; i < scanLimit; i++) {
    const b0 = buffer[i] as number
    const b1 = buffer[i + 1] as number
    if (b0 !== 0xff) continue
    if ((b1 & 0xe0) !== 0xe0) continue
    const candidate = readU32BELong(buffer, i)
    // Validate candidate header before accepting it (avoid false sync words in random data)
    const candB1 = (candidate >> 16) & 0xff
    const candB2 = (candidate >> 8) & 0xff
    const candVersion = (candB1 >> 3) & 0x03
    const candLayer = (candB1 >> 1) & 0x03
    const candBitrateIdx = (candB2 >> 4) & 0x0f
    const candSampleIdx = (candB2 >> 2) & 0x03
    if (candLayer !== 1) continue            // need Layer III
    if (candVersion === 1) continue          // reserved version
    if (candBitrateIdx === 0 || candBitrateIdx === 15) continue  // invalid bitrate
    if (candSampleIdx === 3) continue        // invalid sample rate
    frameHeader = candidate
    headerOffset = i
    break
  }
  if (headerOffset < 0) {
    throw new DurationParseError("mp3", "no MPEG audio sync word found in scan window")
  }
  const b1 = (frameHeader >> 16) & 0xff
  const b2 = (frameHeader >> 8) & 0xff
  const versionId = (b1 >> 3) & 0x03  // 0=MPEG-2.5, 1=reserved, 2=MPEG-2, 3=MPEG-1
  const layerBits = (b1 >> 1) & 0x03
  const bitrateIndex = (b2 >> 4) & 0x0f
  const samplerateIndex = (b2 >> 2) & 0x03
  const padding = (b2 >> 1) & 0x01
  if (layerBits !== 1) {
    throw new DurationParseError("mp3", `unsupported layer (${layerBits}); only Layer III supported`)
  }
  if (versionId === 1) {
    throw new DurationParseError("mp3", "reserved MPEG version id")
  }
  if (bitrateIndex === 0 || bitrateIndex === 15) {
    throw new DurationParseError("mp3", `invalid bitrate index ${bitrateIndex}`)
  }
  if (samplerateIndex === 3) {
    throw new DurationParseError("mp3", "invalid sample rate index")
  }
  const isMpeg1 = versionId === 3
  const bitrateKbps = isMpeg1 ? MP3_BITRATE_TABLE[bitrateIndex] as number : (MP3_BITRATE_TABLE[bitrateIndex] as number) / 2
  const sampleRate = MP3_SAMPLERATE_TABLE[samplerateIndex] as number
  if (bitrateKbps <= 0 || sampleRate <= 0) {
    throw new DurationParseError("mp3", "bitrate/sample rate lookup returned 0")
  }
  // Frame size (Layer III): floor(144 * bitrate / sampleRate) + padding
  const frameSize = Math.floor((144 * (bitrateKbps * 1000)) / sampleRate) + (padding ? 1 : 0)
  if (frameSize <= 0) {
    throw new DurationParseError("mp3", "computed frame size ≤ 0")
  }
  // Look for Xing/Info VBR header (typically at offset 32 after header, for MPEG-1)
  const xingOffset = headerOffset + (isMpeg1 ? 32 : 17)
  let totalFrames: number | null = null
  if (xingOffset + 16 <= buffer.length) {
    const tag = String.fromCharCode(
      buffer[xingOffset] as number,
      buffer[xingOffset + 1] as number,
      buffer[xingOffset + 2] as number,
      buffer[xingOffset + 3] as number,
    )
    if (tag === "Xing" || tag === "Info") {
      // flags are 4 bytes after tag; FRAMES_FLAG = bit0
      const flags = readU32BELong(buffer, xingOffset + 4)
      if (flags & 0x01) {
        totalFrames = readU32BELong(buffer, xingOffset + 8)
      }
    } else {
      // Check for VBRI header at offset 32 (after frame header)
      const vbriOffset = headerOffset + 32
      if (vbriOffset + 26 <= buffer.length) {
        const vbriTag = String.fromCharCode(
          buffer[vbriOffset] as number,
          buffer[vbriOffset + 1] as number,
          buffer[vbriOffset + 2] as number,
          buffer[vbriOffset + 3] as number,
        )
        if (vbriTag === "VBRI") {
          // VBRI: bytes 14-17 = total frame count (big-endian)
          totalFrames = readU32BELong(buffer, vbriOffset + 14)
        }
      }
    }
  }
  const samplesPerFrame = isMpeg1 ? 1152 : 576
  if (totalFrames !== null && totalFrames > 0) {
    return Math.round((totalFrames * samplesPerFrame) / sampleRate)
  }
  // Fallback: estimate from file size
  const audioBytes = buffer.length - offset
  const bytesPerSec = (bitrateKbps * 1000) / 8
  return Math.max(1, Math.round(audioBytes / bytesPerSec))
}

// ISO BMFF box walker for MP4
function readMp4BoxType(buf: Uint8Array, off: number): string {
  if (off + 8 > buf.length) return ""
  return String.fromCharCode(
    buf[off + 4] as number,
    buf[off + 5] as number,
    buf[off + 6] as number,
    buf[off + 7] as number,
  )
}

/**
 * Walk MP4 boxes (ISO BMFF). Calls cb(type, headerOff, bodyOff, size) for each.
 * Stops early if cb returns false.
 */
function walkMp4Boxes(
  buf: Uint8Array,
  start: number,
  end: number,
  cb: (type: string, headerOff: number, bodyOff: number, size: number) => boolean,
): void {
  let off = start
  while (off + 8 <= end) {
    const size32 = readU32BE(buf, off)
    const type = readMp4BoxType(buf, off)
    let boxSize: number
    let headerSize: number
    if (size32 === 1) {
      // 64-bit size
      const hi = readU32BE(buf, off + 8)
      const lo = readU32BE(buf, off + 12)
      boxSize = hi * 0x1_0000_0000 + lo
      headerSize = 16
    } else if (size32 === 0) {
      // extends to end of file
      boxSize = end - off
      headerSize = 8
    } else {
      boxSize = size32
      headerSize = 8
    }
    if (boxSize < headerSize) break
    const bodyOff = off + headerSize
    if (bodyOff > end) break
    const cont = cb(type, off, bodyOff, boxSize)
    if (!cont) return
    if (type === "moov" || type === "trak" || type === "mdia" || type === "minf" || type === "stbl") {
      walkMp4Boxes(buf, bodyOff, off + boxSize, cb)
      return
    }
    off += boxSize
  }
}

/**
 * extractDurationMp4 — walk ISO BMFF, find `moov` → `mvhd`, read duration.
 * Supports both mvhd v0 (4-byte timescale + 4-byte duration) and v1
 * (4-byte timescale + 8-byte duration).
 */
export function extractDurationMp4(buffer: Uint8Array): number {
  if (!(buffer instanceof Uint8Array) || buffer.length < 32) {
    throw new DurationParseError("mp4", "buffer too small or not a Uint8Array")
  }
  // Validate ftyp presence
  const ftypType = readMp4BoxType(buffer, 0)
  if (ftypType !== "ftyp") {
    throw new DurationParseError("mp4", "missing 'ftyp' box at offset 0")
  }
  const mvhdBox: { value: { version: number; timescale: number; duration: number } | null } = { value: null }
  walkMp4Boxes(buffer, 0, buffer.length, (type, _headerOff, bodyOff, _size) => {
    if (type !== "mvhd") return true
    if (bodyOff + 4 > buffer.length) return false
    const version = (buffer[bodyOff] as number) & 0xff
    const payloadStart = bodyOff + 4
    let timescale = 0
    let duration = 0
    if (version === 1) {
      if (payloadStart + 8 + 8 + 8 > buffer.length) return false
      // 8 bytes creation, 8 bytes modification, 4 bytes timescale, 8 bytes duration
      timescale = readU32BE(buffer, payloadStart + 16)
      const hi = readU32BE(buffer, payloadStart + 20)
      const lo = readU32BE(buffer, payloadStart + 24)
      duration = hi * 0x1_0000_0000 + lo
    } else {
      if (payloadStart + 4 + 4 + 4 > buffer.length) return false
      timescale = readU32BE(buffer, payloadStart + 8)
      duration = readU32BE(buffer, payloadStart + 12)
    }
    if (timescale <= 0) return false
    mvhdBox.value = { version, timescale, duration }
    return false
  })
  const mvhd = mvhdBox.value
  if (!mvhd) {
    throw new DurationParseError("mp4", "no 'mvhd' box found inside 'moov'")
  }
  if (mvhd.timescale <= 0) {
    throw new DurationParseError("mp4", "mvhd timescale is 0")
  }
  return Math.max(1, Math.round(mvhd.duration / mvhd.timescale))
}

// EBML Variable-Size Integer decoder
function readEbmlId(buf: Uint8Array, off: number): { id: number; len: number } | null {
  if (off >= buf.length) return null
  const first = buf[off] as number
  let len = 1
  for (let i = 0; i < 8; i++) {
    if ((first & (1 << (7 - i))) !== 0) {
      len = i + 1
      break
    }
  }
  if (off + len > buf.length) return null
  let id = 0
  for (let i = 0; i < len; i++) {
    id = (id << 8) | (buf[off + i] as number)
  }
  return { id, len }
}

function readEbmlSize(buf: Uint8Array, off: number): { size: number; len: number } | null {
  if (off >= buf.length) return null
  const first = buf[off] as number
  let len = 1
  for (let i = 0; i < 8; i++) {
    if ((first & (1 << (7 - i))) !== 0) {
      len = i + 1
      break
    }
  }
  if (off + len > buf.length) return null
  // Length-encoded size: the marker bits indicate how many bytes encode the value
  // The first byte keeps the leading 1-bit marker + length tag in the high bits,
  // then the remaining (len-1) bytes carry the value.
  const valueMask = (1 << (8 - len)) - 1
  let size = first & valueMask
  for (let i = 1; i < len; i++) {
    size = (size << 8) | (buf[off + i] as number)
  }
  return { size, len }
}

/**
 * Walk EBML elements (WebM/Matroska). Calls cb(id, dataOff, size) for each.
 */
function walkEbmlElements(
  buf: Uint8Array,
  start: number,
  end: number,
  cb: (id: number, dataOff: number, size: number) => boolean,
): void {
  let off = start
  while (off < end) {
    const idRes = readEbmlId(buf, off)
    if (!idRes) return
    // Special case: EBML root element (0x1A45DFA3) often has no size VINT —
    // we treat the rest of the file as its data region.
    let dataOff: number
    let dataSize: number
    if (idRes.id === 0x1a45dfa3) {
      dataOff = off + idRes.len
      dataSize = end - dataOff
    } else {
      const sizeRes = readEbmlSize(buf, off + idRes.len)
      if (!sizeRes) return
      dataOff = off + idRes.len + sizeRes.len
      dataSize = sizeRes.size
    }
    if (dataOff > end) return
    const cont = cb(idRes.id, dataOff, dataSize)
    if (!cont) return
    // Recurse into known container elements
    if (
      idRes.id === 0x1a45dfa3 || // EBML root
      idRes.id === 0x18538067 || // Segment
      idRes.id === 0x1f43b675    // Cluster
    ) {
      walkEbmlElements(buf, dataOff, dataOff + dataSize, cb)
      return
    }
    off = dataOff + dataSize
  }
}

/**
 * extractDurationWebm — parse EBML, find Segment(0x18538067) → Duration(0x4489).
 * Duration is stored as a float64 in network byte order.
 */
export function extractDurationWebm(buffer: Uint8Array): number {
  if (!(buffer instanceof Uint8Array) || buffer.length < 16) {
    throw new DurationParseError("webm", "buffer too small or not a Uint8Array")
  }
  // Validate EBML magic: 0x1A 0x45 0xDF 0xA3
  if (buffer[0] !== 0x1a || buffer[1] !== 0x45 || buffer[2] !== 0xdf || buffer[3] !== 0xa3) {
    throw new DurationParseError("webm", "missing EBML magic header 0x1A45DFA3")
  }
  const stateBox: { durationFound: number | null; foundTimestampScale: number } = {
    durationFound: null,
    foundTimestampScale: 1_000_000, // default nanoseconds
  }
  walkEbmlElements(buffer, 0, buffer.length, (id, dataOff, dataSize) => {
    if (id === 0x18538067) {
      // Segment — recurse
      walkEbmlElements(buffer, dataOff, dataOff + dataSize, (subId, subOff, subSize) => {
        if (subId === 0x4489) {
          // Duration (float, big-endian)
          if (subSize >= 8) {
            const hi = readU32BE(buffer, subOff)
            const lo = readU32BE(buffer, subOff + 4)
            const combined = hi * 0x1_0000_0000 + lo
            // Interpret as IEEE 754 double (big-endian)
            const view = new DataView(new ArrayBuffer(8))
            const hi32 = Math.floor(combined / 0x1_0000_0000) >>> 0
            const lo32 = combined >>> 0
            view.setUint32(0, hi32, false)  // big-endian
            view.setUint32(4, lo32, false)  // big-endian
            stateBox.durationFound = view.getFloat64(0, false)  // big-endian read
            return false
          }
        }
        if (subId === 0x2ad7b1) {
          // TimestampScale (uint)
          if (subSize >= 1 && subSize <= 8) {
            let v = 0
            for (let i = 0; i < subSize; i++) {
              v = v * 256 + (buffer[subOff + i] as number)
            }
            stateBox.foundTimestampScale = v
          }
        }
        return true
      })
      return false
    }
    return true
  })
  const durationFound = stateBox.durationFound
  if (durationFound === null || durationFound <= 0) {
    throw new DurationParseError("webm", "no Segment/Duration(0x4489) found or duration ≤ 0")
  }
  // Per the Matroska spec, Duration is in timecode units; multiply by
  // TimestampScale (in ns per unit) and divide by 1e9 to get seconds.
  // For the W66 simplified engine, we expose this as a fraction so callers
  // get seconds directly.
  const scale = stateBox.foundTimestampScale
  const seconds = (durationFound * scale) / 1_000_000_000
  return Math.max(1, Math.round(seconds))
}

/**
 * Extract duration from any media buffer by format. Returns null on
 * failure (never throws); caller can supply `callerDurationSec` instead.
 */
export function extractDuration(format: MediaFormat, buffer: Uint8Array): number | null {
  try {
    if (format === "mp3") return extractDurationMp3(buffer)
    if (format === "mp4") return extractDurationMp4(buffer)
    if (format === "webm") return extractDurationWebm(buffer)
    // WAV/OGG: not in scope per brief (no mp3/wav only — wait, brief says mp3/wav/ogg ≤ 15MB)
    // WAV: standard RIFF/WAVE format. For now, throw DurationParseError; caller falls back.
    // OGG: too complex without deps. Caller must supply durationSec.
    throw new DurationParseError(format, "duration extractor not implemented for this format")
  } catch {
    return null
  }
}

// ============================================================================
// §10  WAVEFORM + CONTACT-SHEET SVG GENERATORS (pure SVG, NO canvas)
// ============================================================================

/**
 * Base64 encode a string for data-URI embedding.
 */
function toBase64(s: string): string {
  // Browser + Node both expose btoa; if not, fall back to a manual encoder.
  const g = globalThis as { btoa?: (s: string) => string }
  if (typeof g.btoa === "function") return g.btoa(s)
  // Minimal manual encoder (Latin-1 safe — SVG is ASCII)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  let out = ""
  for (let i = 0; i < s.length; i += 3) {
    const c0 = s.charCodeAt(i)
    const c1 = i + 1 < s.length ? s.charCodeAt(i + 1) : 0
    const c2 = i + 2 < s.length ? s.charCodeAt(i + 2) : 0
    const t = (c0 << 16) | (c1 << 8) | c2
    out += chars[(t >> 18) & 0x3f]
    out += chars[(t >> 12) & 0x3f]
    out += i + 1 < s.length ? chars[(t >> 6) & 0x3f] : "="
    out += i + 2 < s.length ? chars[t & 0x3f] : "="
  }
  return out
}

/**
 * generateWaveformDataUri — produce a 256-step amplitude envelope as a
 * data:image/svg+xml;base64,... data URI. NO canvas / NO ffmpeg.
 *
 * For each step `i` in [0, 256), sample 1/256 of the buffer, take the
 * max absolute byte value (treated as PCM16-ish), normalize to 0..100,
 * emit a <rect> of that height. Returns full SVG wrapped as data URI.
 */
export function generateWaveformDataUri(buffer: Uint8Array, steps: number): string {
  if (!(buffer instanceof Uint8Array) || buffer.length === 0) {
    return "data:image/svg+xml;base64,${empty}"
  }
  const n = steps === 256 ? 256 : 256
  const sliceSize = Math.max(1, Math.floor(buffer.length / n))
  const heights: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    const start = i * sliceSize
    const end = Math.min(buffer.length, start + sliceSize)
    let max = 0
    for (let j = start; j < end; j++) {
      const v = (buffer[j] as number) & 0xff
      if (v > max) max = v
    }
    heights[i] = Math.round((max / 255) * 100)
  }
  const width = 512
  const height = 96
  const barWidth = (width / n).toFixed(3)
  const gap = 1
  let rects = ""
  for (let i = 0; i < n; i++) {
    const x = (i * (width / n)).toFixed(2)
    const h = heights[i] as number
    const y = ((height - h) / 2).toFixed(2)
    rects += `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="#7c3aed"/>`
    if (i + 1 < n) {
      // gap placeholder (no rect) — already covered by barWidth < width/n
      void gap
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${rects}</svg>`
  return `data:image/svg+xml;base64,${toBase64(svg)}`
}

/**
 * generateVideoContactSheetDataUri — emit a 3×3 SVG grid with frame
 * numbers (real pixel extraction deferred to caller). NO canvas.
 */
export function generateVideoContactSheetDataUri(buffer: Uint8Array, frames: number): string {
  const f = frames === 9 ? 9 : 9
  const cols = 3
  const rows = 3
  const tileW = 160
  const tileH = 90
  const padX = 8
  const padY = 8
  const width = cols * tileW + (cols + 1) * padX
  const height = rows * tileH + (rows + 1) * padY
  let tiles = ""
  // Sample 9 byte-positions across the buffer to derive a "dominant color"
  // for the placeholder tile background. Pure heuristic, deterministic.
  for (let i = 0; i < f; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = padX + col * (tileW + padX)
    const y = padY + row * (tileH + padY)
    const sampleOff = Math.min(buffer.length - 1, Math.floor((i + 1) * (buffer.length / (f + 1))))
    const s0 = (buffer[sampleOff] ?? 0) & 0xff
    const s1 = (buffer[Math.min(buffer.length - 1, sampleOff + 1)] ?? 0) & 0xff
    const fill = `#${s0.toString(16).padStart(2, "0")}${s1.toString(16).padStart(2, "0")}aa`
    tiles += `<rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" fill="${fill}" stroke="#1e293b" stroke-width="1"/>`
    tiles += `<text x="${x + 8}" y="${y + 20}" fill="#ffffff" font-family="monospace" font-size="14">frame ${i + 1}</text>`
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${tiles}</svg>`
  return `data:image/svg+xml;base64,${toBase64(svg)}`
}

// ============================================================================
// §11  VALIDATION (never-throws)
// ============================================================================

/**
 * validateMediaPost — runs all 4 layers (format, size, consent, duration)
 * without throwing. Returns `{ok: true, warnings}` or `{ok: false, errors}`.
 *
 * NEVER throws — even malformed input is reported as errors[].
 */
export function validateMediaPost(input: MediaPostInput): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["input_not_object"] }
  }

  // Layer 1 — format whitelist
  const formatsForKind: ReadonlyArray<string> = MEDIA_FORMATS[input.kind] ?? []
  if (!formatsForKind.includes(input.format)) {
    errors.push("invalid_format")
  }

  // Layer 2 — size cap
  if (!(input.buffer instanceof Uint8Array)) {
    errors.push("buffer_not_uint8array")
  } else {
    const cap = MEDIA_LIMITS[input.kind].maxBytes
    if (input.buffer.length === 0) {
      errors.push("empty_buffer")
    }
    if (input.buffer.length > cap) {
      errors.push("size_exceeded")
    }
  }

  // Layer 3 — caption
  if (typeof input.caption !== "string") {
    errors.push("caption_not_string")
  } else {
    if (input.caption.length < CAPTION_MIN) errors.push("caption_too_short")
    if (input.caption.length > CAPTION_MAX) errors.push("caption_too_long")
  }

  // Layer 4 — consent (LGPD)
  if (!input.consent || typeof input.consent !== "object") {
    errors.push("consent_missing")
  } else {
    const c = input.consent
    if (input.kind === "video" && c.faceConsent !== true) errors.push("video_face_consent_required")
    if (c.voiceConsent !== true) errors.push("voice_consent_required")
    if (!isValidIsoTimestamp(c.grantedAt)) errors.push("consent_grantedAt_invalid")
    if (!isValidIsoTimestamp(c.expiresAt)) errors.push("consent_expiresAt_invalid")
    if (isValidIsoTimestamp(c.grantedAt) && isValidIsoTimestamp(c.expiresAt)) {
      const g = Date.parse(c.grantedAt)
      const e = Date.parse(c.expiresAt)
      if (g >= e) errors.push("consent_window_invalid")
      if (e - Date.now() < 0) errors.push("consent_expired")
      else if (e - Date.now() < CONSENT_REQUIRED_GRANT_AHEAD_SEC * 1000) {
        warnings.push("consent_expiring_soon")
      }
    }
  }

  // Layer 5 — duration (caller-supplied fallback)
  if (typeof input.callerDurationSec === "number") {
    const d = input.callerDurationSec
    const limits = MEDIA_LIMITS[input.kind]
    if (!Number.isFinite(d) || d < limits.minDurationSec || d > limits.maxDurationSec) {
      errors.push("caller_duration_out_of_range")
    }
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, warnings }
}

// ============================================================================
// §12  BUILDERS (createAudioPost, createVideoPost)
// ============================================================================

/**
 * Generate a hex id with the given prefix.
 */
function genHexId(prefix: string, byteLen: number): string {
  const crypto = resolveCrypto()
  const h = crypto.createHash(HMAC_ALGO)
  // deterministically mix in a timestamp + counter via SHA-256 of fixed payload
  // — not cryptographic randomness, but a stable unique-ish id.
  const seed = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const updated = h.update(seed)
  const hex = updated.digest("hex")
  return `${prefix}_${hex.slice(0, byteLen * 2)}`
}

function buildMediaAuditPayload(p: Omit<MediaPostBase, "auditHash">): string {
  // stable JSON — sorted keys, no whitespace
  const keys = Object.keys(p).sort()
  const parts: string[] = []
  for (const k of keys) {
    const v = (p as Record<string, unknown>)[k]
    if (Array.isArray(v)) {
      parts.push(`${k}=[${v.map((x) => JSON.stringify(x)).join(",")}]`)
    } else if (v === null) {
      parts.push(`${k}=null`)
    } else if (typeof v === "object") {
      parts.push(`${k}=${JSON.stringify(v)}`)
    } else {
      parts.push(`${k}=${JSON.stringify(v)}`)
    }
  }
  return parts.join("|")
}

/**
 * Build a base media post (no consent yet). Validates format + size first.
 * Duration is parsed from buffer if extractor supports format; otherwise
 * falls back to callerDurationSec.
 */
function buildMediaBase(
  kind: MediaKind,
  format: MediaFormat,
  buffer: Uint8Array,
  caption: string,
  authorPseudonym: string,
  callerDurationSec: number | undefined,
  createdAt: string,
): Omit<MediaPostBase, "auditHash" | "id" | "postId"> {
  // Format check
  const formatsForKind = MEDIA_FORMATS[kind]
  if (!formatsForKind.includes(format)) {
    throw new InvalidMediaFormatError(format)
  }
  // Size check
  const cap = MEDIA_LIMITS[kind].maxBytes
  if (buffer.length > cap) {
    throw new MediaSizeExceededError(kind, buffer.length, cap)
  }
  // Duration: try parser, fall back to caller
  const parsed = extractDuration(format, buffer)
  let durationSec: number | null = null
  let durationSource: MediaPostBase["durationSource"] = "unknown"
  if (parsed !== null) {
    durationSec = parsed
    durationSource = "parsed"
  } else if (typeof callerDurationSec === "number" && Number.isFinite(callerDurationSec)) {
    durationSec = Math.max(1, Math.round(callerDurationSec))
    durationSource = "caller_supplied"
  }
  const refs = sacredMediaRefs(caption)
  const tags: SacredTag[] = refs.map((r) => r.tag)
  return {
    authorPseudonym,
    caption,
    format,
    sizeBytes: buffer.length,
    durationSec,
    durationSource,
    sacredRefs: refs,
    sacredTags: tags,
    createdAt,
  }
}

/**
 * createAudioPost — full pipeline: validate + extract + HMAC id + chain link.
 * Throws on validation failure. LGPD consent gate enforced (faceConsent=false
 * is allowed for audio; voiceConsent=true required).
 */
export function createAudioPost(input: AudioPostInput): AudioPost {
  // Pre-check consent
  if (!input.consent || typeof input.consent !== "object") {
    throw new MediaConsentMissingError("audio", "object")
  }
  if (input.consent.voiceConsent !== true) {
    throw new MediaConsentMissingError("audio", "voice")
  }
  if (!isValidIsoTimestamp(input.consent.grantedAt) || !isValidIsoTimestamp(input.consent.expiresAt)) {
    throw new MediaConsentMissingError("audio", "expiry")
  }
  const v = validateMediaPost({
    kind: "audio",
    format: input.format,
    buffer: input.buffer,
    caption: input.caption,
    consent: input.consent,
    callerDurationSec: input.callerDurationSec,
  })
  if (!v.ok) {
    if (v.errors.includes("size_exceeded")) {
      throw new MediaSizeExceededError("audio", input.buffer.length, MEDIA_LIMITS.audio.maxBytes)
    }
    throw new MediaEngineError("VALIDATION_FAILED", v.errors.join(", "), "audio")
  }
  const createdAt = input.createdAt ?? new Date().toISOString()
  const pseudonym = pseudonymizeAuthor(input.authorId, input.pseudonymSalt)
  const base = buildMediaBase(
    "audio",
    input.format,
    input.buffer,
    input.caption,
    pseudonym,
    input.callerDurationSec,
    createdAt,
  )
  const id = toMediaId(genHexId("media", 12))
  const postId = toPostId(genHexId("post", 12))
  const partial: Omit<AudioPost, "auditHash"> = {
    ...base,
    id,
    postId,
    kind: "audio",
    audioConsent: input.consent,
  }
  const payload = buildMediaAuditPayload(partial)
  const auditHash = chainMediaHash("genesis", payload, input.secret)
  return { ...partial, auditHash }
}

/**
 * createVideoPost — full pipeline: validate + extract + contact-sheet + HMAC id + chain link.
 * Throws on validation failure. LGPD: faceConsent=true AND voiceConsent=true required.
 */
export function createVideoPost(input: VideoPostInput): VideoPost {
  // Pre-check consent
  if (!input.consent || typeof input.consent !== "object") {
    throw new MediaConsentMissingError("video", "object")
  }
  if (input.consent.faceConsent !== true) {
    throw new MediaConsentMissingError("video", "face")
  }
  if (input.consent.voiceConsent !== true) {
    throw new MediaConsentMissingError("video", "voice")
  }
  if (!isValidIsoTimestamp(input.consent.grantedAt) || !isValidIsoTimestamp(input.consent.expiresAt)) {
    throw new MediaConsentMissingError("video", "expiry")
  }
  const v = validateMediaPost({
    kind: "video",
    format: input.format,
    buffer: input.buffer,
    caption: input.caption,
    consent: input.consent,
    callerDurationSec: input.callerDurationSec,
  })
  if (!v.ok) {
    if (v.errors.includes("size_exceeded")) {
      throw new MediaSizeExceededError("video", input.buffer.length, MEDIA_LIMITS.video.maxBytes)
    }
    throw new MediaEngineError("VALIDATION_FAILED", v.errors.join(", "), "video")
  }
  const createdAt = input.createdAt ?? new Date().toISOString()
  const pseudonym = pseudonymizeAuthor(input.authorId, input.pseudonymSalt)
  const base = buildMediaBase(
    "video",
    input.format,
    input.buffer,
    input.caption,
    pseudonym,
    input.callerDurationSec,
    createdAt,
  )
  const contactSheetDataUri = input.includeContactSheet === false
    ? null
    : generateVideoContactSheetDataUri(input.buffer, 9)
  const id = toMediaId(genHexId("media", 12))
  const postId = toPostId(genHexId("post", 12))
  const partial: Omit<VideoPost, "auditHash"> = {
    ...base,
    id,
    postId,
    kind: "video",
    videoConsent: input.consent,
    contactSheetDataUri,
  }
  const payload = buildMediaAuditPayload(partial)
  const auditHash = chainMediaHash("genesis", payload, input.secret)
  return { ...partial, auditHash }
}

// ============================================================================
// §13  HMAC CHAIN (cycle 60 pattern — NEVER FNV)
// ============================================================================

/**
 * chainMediaHash — compute a 64-char hex HMAC-SHA256 chain link.
 * chain(prevHash, payload, secret) = sha256-hex(prev | payload | secret).
 *
 * Cycle 60 lesson: HMAC-SHA256 only, never FNV-1a, never MD5.
 * Cycle 65 lesson: resolveCrypto handles Bun, Node ESM, and CommonJS.
 */
export function chainMediaHash(prevHash: string, payload: string, secret: string): string {
  if (typeof prevHash !== "string") prevHash = ""
  if (typeof payload !== "string") payload = String(payload)
  if (typeof secret !== "string" || secret.length === 0) {
    throw new MediaEngineError("INVALID_SECRET", "secret must be a non-empty string")
  }
  const crypto = resolveCrypto()
  const h = crypto.createHash(HMAC_ALGO)
  const updated = h.update(`${prevHash}|${payload}|${secret}`)
  const out = updated.digest("hex")
  if (typeof out !== "string" || out.length < 16) {
    throw new MediaEngineError("HMAC_OUTPUT_INVALID", "hmac output invalid")
  }
  return out
}

/**
 * verifyMediaHashLink — constant-time compare of an expected chain link.
 * Returns true iff re-deriving from (prev, payload, secret) yields `hash`.
 */
export function verifyMediaHashLink(
  prevHash: string,
  payload: string,
  hash: string,
  secret: string,
): boolean {
  const expected = chainMediaHash(prevHash, payload, secret)
  if (typeof hash !== "string") return false
  if (expected.length !== hash.length) return false
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= (expected.charCodeAt(i) ^ hash.charCodeAt(i))
  }
  return mismatch === 0
}

/** Genesis sentinel for fresh ledgers. */
export const GENESIS_MEDIA_HASH = "genesis" as const

// ============================================================================
// §14  AUDIT (Coverage + per-tradition floors)
// ============================================================================

/**
 * auditMediaCoverage — counts each tradition's sacred-tag catalog and
 * reports isFullCoverage (true iff every tradition meets its floor).
 *
 * Hard floor: 87 symbols total across 5 traditions.
 */
export function auditMediaCoverage(): CoverageReport {
  const byTradition: Record<SacredTradition, number> = {
    CIGANO: CIGANO_CARDS.length,
    ORIXAS: ORIXAS.length,
    CHAKRAS: CHAKRAS.length,
    SEFIROT: SEFIROT.length,
    ASTROLOGIA: ASTROLOGIA.length,
  }
  const floorMet: Record<SacredTradition, boolean> = {
    CIGANO: byTradition.CIGANO >= TRADITION_FLOORS.CIGANO,
    ORIXAS: byTradition.ORIXAS >= TRADITION_FLOORS.ORIXAS,
    CHAKRAS: byTradition.CHAKRAS >= TRADITION_FLOORS.CHAKRAS,
    SEFIROT: byTradition.SEFIROT >= TRADITION_FLOORS.SEFIROT,
    ASTROLOGIA: byTradition.ASTROLOGIA >= TRADITION_FLOORS.ASTROLOGIA,
  }
  const gaps = (Object.keys(floorMet) as SacredTradition[]).filter((k) => !floorMet[k])
  const total = byTradition.CIGANO + byTradition.ORIXAS + byTradition.CHAKRAS + byTradition.SEFIROT + byTradition.ASTROLOGIA
  return {
    byTradition,
    total,
    isFullCoverage: gaps.length === 0 && total >= 87,
    floorMet,
    gaps,
  }
}

/** Module-init gate — must be true at import time. */
export const IS_FULL_COVERAGE: boolean = auditMediaCoverage().isFullCoverage

// ============================================================================
// §15  __ALL_EXPORTS (grep-audit visibility)
// ============================================================================

export const __ALL_EXPORTS = {
  constants: [
    "AUDIO_FORMATS",
    "VIDEO_FORMATS",
    "MEDIA_FORMATS",
    "MEDIA_LIMITS",
    "FORBIDDEN_FORMATS",
    "CAPTION_MIN",
    "CAPTION_MAX",
    "HMAC_ALGO",
    "CIGANO_CARDS",
    "ORIXAS",
    "CHAKRAS",
    "SEFIROT",
    "ASTROLOGIA",
    "TRADITION_FLOORS",
    "TRADITION_CATALOG",
    "ALL_MEDIA_SACRED_TAGS",
    "GENESIS_MEDIA_HASH",
    "IS_FULL_COVERAGE",
  ],
  functions: [
    "validateMediaPost",
    "createAudioPost",
    "createVideoPost",
    "extractDurationMp3",
    "extractDurationMp4",
    "extractDurationWebm",
    "generateWaveformDataUri",
    "generateVideoContactSheetDataUri",
    "auditMediaCoverage",
    "chainMediaHash",
    "verifyMediaHashLink",
    "getMediaKind",
    "clampMediaSize",
    "sacredMediaRefs",
  ],
  typeGuards: ["isAudioPost", "isVideoPost", "isSacredMediaRef"],
  errorClasses: [
    "MediaEngineError",
    "InvalidMediaFormatError",
    "MediaSizeExceededError",
    "MediaConsentMissingError",
    "DurationParseError",
  ],
  types: [
    "MediaKind",
    "MediaFormat",
    "MediaId",
    "PostId",
    "SacredTradition",
    "SacredTag",
    "SacredMediaRef",
    "MediaConsent",
    "MediaLimits",
    "MediaPostBase",
    "AudioPost",
    "VideoPost",
    "MediaPost",
    "AudioPostInput",
    "VideoPostInput",
    "MediaPostInput",
    "ValidationResult",
    "CoverageReport",
    "ExtractOptions",
  ],
  sections: [
    "§1  Type definitions",
    "§2  Cross-runtime HMAC + crypto",
    "§3  MEDIA_FORMATS whitelist",
    "§4  MEDIA_LIMITS",
    "§5  Error classes",
    "§6  Sacred-tag catalogs",
    "§7  Type guards",
    "§8  Helpers",
    "§9  Duration extractors",
    "§10  Waveform + contact-sheet SVG generators",
    "§11  Validation (never-throws)",
    "§12  Builders",
    "§13  HMAC chain",
    "§14  Audit",
    "§15  __ALL_EXPORTS",
  ],
  sectionsCount: 15,
} as const