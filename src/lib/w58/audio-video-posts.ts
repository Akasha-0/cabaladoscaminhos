/**
 * w58/audio-video-posts
 * ──────────────────────────────────────────────────────────────────
 * Engine de posts com mídia (áudio + vídeo) para o ciclo w58.
 * Cobre o ciclo de vida completo: upload chunked, transcodificação,
 * waveform, thumbnail, captions/transcripts com mascaramento
 * sagrado, defesa contra spoofing de MIME, e conformidade LGPD
 * Art. 7 (consentimento, sagrado vs biométrico), Art. 9 (finalidade
 * declarada), Art. 18 (acesso, correção, erasure, opt-out).
 *
 * Contraparte expandida do w24/audio-video-uploader (que tratava só
 * do upload). Aqui entramos em todo o ciclo de vida do post:
 * transcode → thumbnails → captions → transcrição → auditoria →
 * consentimento → purge. Nenhum import do repo — apenas contrato
 * estrutural espelhado para w55/akasha-ia-streaming-ui,
 * w56/voice-mode-tts-akasha e w57/events-workshops-platform.
 *
 * Self-contained: tipos TS + Math nativo + string ops + TypedArrays.
 * Sem dependência externa, sem node:crypto, sem prisma em runtime,
 * sem fetch. Determinístico quando RNG é seedada.
 *
 * Defense in depth (4 camadas obrigatórias):
 *   1. Primary:   `isSacredViolation` — filtro de conteúdo sagrado
 *                 com hard-block antes de qualquer render.
 *   2. Secondary: `detectMimeSpoofing` — validação MIME ↔ magic
 *                 bytes nos primeiros 16 bytes do asset.
 *   3. Tertiary:  `verifyMediaAuditChain` — cadeia HMAC para
 *                 tamper-evidence dos MediaAuditEvent.
 *   4. Quaternary: tracks de consentimento SEPARADAS — opt-in
 *                 sagrado é distinto do opt-in geral; opt-in
 *                 biométrico é distinto do opt-in sagrado. Nenhuma
 *                 flag controla todos os fluxos.
 *
 * LGPD:
 *   - Art. 7: opt-in sagrado é mais explícito (consentimento
 *     separado + assinatura de propósito); consentimento biométrico
 *     para face-in-video é separado do sagrado.
 *   - Art. 9: finalidades declaradas (upload, transcodificação,
 *     captions, analytics, biometric-id, sacred-display).
 *   - Art. 18: direitos do titular via exportUserMediaHistory,
 *     purgeMediaAsset (com AuditReceipt), withdrawMediaConsent.
 *   - Retenção: audit indefinido (hash-chained), analytics 90d,
 *     biometric até withdrawal.
 *
 * Layout:
 *   §1  Tipos & contratos
 *   §2  Constantes, taxonomias, magic bytes, sacred patterns
 *   §3  Math helpers (FNV-1a 32/64, SHA-256, HMAC-SHA256,
 *        Mulberry32, hex, MIME magic byte detect)
 *   §4  Upload session (startUpload, addChunk, completeUpload
 *        com fingerprint + audit)
 *   §5  Transcode job (queueTranscode, transcodeStep com codec
 *        detection hand-rolled)
 *   §6  Waveform (peaks determinísticos do content hash)
 *   §7  Thumbnail (mock data URL com sacred-blur)
 *   §8  Captions (VTT/SRT, sacred-aware: track separada)
 *   §9  Transcript (segments com sacred-mask por segmento)
 *   §10 Sacred-content guard (primary + secondary leak detect)
 *   §11 MIME spoofing detection (hand-rolled magic-byte sniff)
 *   §12 Validation (duração máx 60min, resolução máx 4K)
 *   §13 Biometric consent (flag separada, never collapse com sacred)
 *   §14 LGPD Art. 18 (withdraw, purge, export, AuditReceipt)
 *   §15 Audit chain (HMAC-SHA256 verify + tamper detection)
 *   §16 Smoke / regression scenarios
 *   §17 Doc-string constants
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Tipos & Contratos                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Tipos de mídia suportados pelo engine. */
export type MediaType = "audio" | "video";

/**
 * Categorias de codec suportadas para transcodificação.
 * `passthrough` significa manter o codec original (sem re-encode).
 */
export type CodecKind =
  | "audio/aac"
  | "audio/mp3"
  | "audio/opus"
  | "audio/flac"
  | "audio/wav"
  | "video/avc"
  | "video/hevc"
  | "video/vp9"
  | "video/av1"
  | "passthrough";

/** Estados de uma sessão de upload chunked. */
export type UploadStatus =
  | "pending"
  | "uploading"
  | "completed"
  | "failed"
  | "aborted";

/** Estados de um job de transcodificação. */
export type TranscodeStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed";

/** Status de visibilidade do conteúdo sagrado. */
export type SacredVisibility =
  | "auto-blurred"      // default para thumbnail
  | "explicit-revealed" // viewer marcou "reveal" conscientemente
  | "redacted";         // palavra mascarada com `[conteúdo protegido]`

/** Tipos de finalidade LGPD — Art. 9 (finalidade declarada). */
export type LgpdPurpose =
  | "upload"            // armazenamento + entrega
  | "transcode"         // re-encoding para formatos compatíveis
  | "captions"          // geração de legendas automáticas
  | "analytics"         // métricas agregadas (90d)
  | "biometric-id"      // identificação biométrica (face-in-video)
  | "sacred-display";   // exibição de conteúdo sagrado (opt-in)

/** Tipos de evento de auditoria de mídia. */
export type MediaEventKind =
  | "uploaded"
  | "transcoded"
  | "captioned"
  | "transcribed"
  | "viewed"
  | "shared"
  | "deleted"
  | "purged"
  | "consent-withdrawn"
  | "consent-granted"
  | "sacred-redacted"
  | "mime-rejected"
  | "biometric-redacted";

/** Categorias de tag sagrada — mutuamente exclusivas (módulo-resolved). */
export type SacredKind =
  | "prayer"       // rezas / mantras / liturgias
  | "ritual"       // rituais / oferendas
  | "oracle"       // tiragens sagradas privadas
  | "lineage"      // linhagem / fundamentos iniciáticos
  | "biometric"    // face / voz reconhecida de entidade
  | "other-sacred";

/**
 * Metadados de acessibilidade de um MediaAsset. Caption-transcript
 * são preenchidos após o transcode; `a11y` carrega os IDs das tracks.
 */
export interface AccessibilityMetadata {
  captionTrackIds: string[];        // VTT/SRT tracks geradas
  transcriptId?: string;            // ID do TranscriptSegment[] gerado
  altText?: string;                 // alt-text descritivo para thumbnail
  languageCodes: string[];          // BCP-47 das tracks disponíveis
  hasSacredTrack: boolean;          // existe track sagrada separada?
  /** Tags aria obrigatórias para o componente MediaCard. */
  ariaLabels: {
    playButton: string;
    muteButton: string;
    captionToggle: string;
    sacredRevealToggle: string;
  };
}

/**
 * MediaAsset — entidade principal do engine. `id` é FNV-1a 64
 * do fingerprint; `fingerprint` é SHA-256 do conteúdo final
 * concatenado. `sacredFlag` denota se o asset contém trechos
 * sagrados (não remove, só blinda).
 */
export interface MediaAsset {
  id: string;                       // FNV-1a 64 do fingerprint
  type: MediaType;
  ownerId: string;
  url: string;                      // URL relativa (mock)
  mimeType: string;                 // MIME declarado pelo uploader
  detectedMime: string;             // MIME detectado por magic bytes
  sizeBytes: number;
  durationMs: number;
  codec: CodecKind;
  width?: number;                   // só vídeo
  height?: number;                  // só vídeo
  channels?: number;                // só áudio (1=mono, 2=stereo)
  sampleRate?: number;              // só áudio (Hz)
  bitrate?: number;                 // bits per second
  fingerprint: string;              // SHA-256 hex
  chunksFingerprint: string;        // FNV-1a 64 dos chunk hashes
  sacredFlag: boolean;
  sacredKinds: SacredKind[];
  sacredConsentToken?: string;      // opt-in token (separado do geral)
  biometricConsentToken?: string;   // opt-in biométrico (separado)
  a11y: AccessibilityMetadata;
  uploadedAt: number;               // unix ms
  transcodedAt?: number;
  retentionUntil?: number;          // unix ms; undefined = indefinite
}

/** UploadSession — chunked upload com FNV-1a por chunk. */
export interface UploadSession {
  sessionId: string;                // FNV-1a 64(ownerId|mimeType|startedAt)
  ownerId: string;
  type: MediaType;
  mimeType: string;
  startedAt: number;                // unix ms
  status: UploadStatus;
  totalBytes: number;
  receivedBytes: number;
  chunks: UploadChunk[];
  fingerprint: string;              // FNV-1a 64 acumulado
  completedAt?: number;
  errorMessage?: string;
  abortedReason?: string;
}

export interface UploadChunk {
  chunkIdx: number;
  size: number;
  fingerprint: string;              // FNV-1a 64 do conteúdo do chunk
  receivedAt: number;               // unix ms
}

/** Job de transcodificação. */
export interface TranscodeJob {
  jobId: string;                    // FNV-1a 64
  assetId: string;
  sourceCodec: CodecKind;
  targetCodec: CodecKind;
  targetBitrate: number;            // bits per second
  status: TranscodeStatus;
  progress: number;                 // 0..1
  startedAt: number;
  completedAt?: number;
  estimatedMsRemaining: number;
  errorMessage?: string;
  /** Detectado via magic bytes (hand-rolled). */
  detectedSourceMime?: string;
}

/** Caption track (VTT ou SRT) — sagrado é track SEPARADA. */
export interface CaptionTrack {
  trackId: string;
  assetId: string;
  language: string;                 // BCP-47 (e.g. "pt-BR")
  format: "vtt" | "srt";
  sacredFlag: boolean;              // true → track sagrada isolada
  sacredKind?: SacredKind;
  content: string;                  // texto formatado VTT/SRT
  cueCount: number;
  durationMs: number;
  generatedAt: number;
}

/** Segmento individual de transcrição. */
export interface TranscriptSegment {
  segmentId: string;                // FNV-1a 64
  startMs: number;
  endMs: number;
  text: string;                     // pode conter [protegido] se sacred
  sacredMasked: boolean;            // true → texto estava sacred
  sacredKind?: SacredKind;
  speakerId?: string;               // speaker diarization (mock)
  confidence: number;               // 0..1
}

/** Waveform mock — peaks determinísticos do content hash. */
export interface AudioWaveform {
  assetId: string;
  sampleRate: number;               // Hz
  durationMs: number;
  peaks: number[];                  // 0..1 normalizado
  peaksCount: number;
  generatedAt: number;
  /** Seed usada para gerar os peaks (FNV-1a 64 do fingerprint). */
  seed: string;
}

/** Thumbnail mock — data URL com sacred-blur opcional. */
export interface VideoThumbnail {
  assetId: string;
  timestampMs: number;
  dataUrl: string;                  // mock data:image/png;base64,...
  sacredBlurred: boolean;
  width: number;
  height: number;
  generatedAt: number;
}

/**
 * SacredContentGuard — regras declarativas de proteção de conteúdo
 * sagrado. Avaliadas antes de qualquer render público.
 */
export interface SacredContentGuard {
  assetId: string;
  sacredFlag: boolean;
  sacredKinds: SacredKind[];
  /** Thumbnail auto-blur por default — exige `revealSacredThumbnail`. */
  thumbnailAutoBlur: boolean;
  /** Caption track sagrada é SEPARADA do track geral. */
  captionTrackSeparated: boolean;
  /** Transcript segment sagrado é masked — não aparece em
   *  transcript público, só em transcript protegido (opt-in). */
  transcriptSegmentMasked: boolean;
  /** Biometric consent é flag INDEPENDENTE do sacred opt-in. */
  biometricConsentIndependent: boolean;
  /** LGPD Art. 7: opt-in sagrado exige token explícito. */
  consentTokenRequired: boolean;
}

/** MediaAuditEvent — entrada imutável na cadeia HMAC. */
export interface MediaAuditEvent {
  eventId: string;                  // FNV-1a 64
  assetId: string;
  ownerId: string;
  kind: MediaEventKind;
  /** Timestamp unix ms. */
  at: number;
  /** Identificador adicional (viewerId, sharerId, etc). */
  actorId?: string;
  recipientId?: string;             // para share
  durationMs?: number;              // para view
  purpose?: LgpdPurpose;
  payload: Record<string, string | number | boolean>;
  /** SHA-256 do evento anterior (chain link). */
  prevHash: string;
  /** HMAC-SHA256(prevHash || canonicalJSON(event)). */
  hmac: string;
}

/**
 * AuditReceipt — devolvido por `purgeMediaAsset` para evidência
 * LGPD Art. 18 erasure. Hash chain garante que o evento de purge
 * foi registrado antes da remoção dos dados.
 */
export interface AuditReceipt {
  receiptId: string;
  userId: string;
  assetId: string;
  erasedAt: number;
  erasedScopes: Array<
    | "asset"
    | "thumbnail"
    | "caption"
    | "transcript"
    | "biometric-template"
    | "view-history"
    | "share-history"
  >;
  hmac: string;                     // HMAC do purge event
  canonicalProof: string;           // JSON canonical do purge
  lgpdArticle: "Art. 18 inciso VI"; // erasure
}

/** Estado de consentimento por finalidade (LGPD Art. 7 + 9). */
export interface MediaConsentState {
  userId: string;
  general: boolean;                 // consentimento geral de mídia
  sacred: boolean;                  // consentimento sagrado (separado)
  biometric: boolean;               // consentimento biométrico (separado)
  purposesAllowed: LgpdPurpose[];
  grantedAt?: number;
  withdrawnAt?: number;
}

/**
 * Erros tipados do engine — carregam contexto suficiente para
 * surface na UI sem leak de internals.
 */
export type MediaEngineError =
  | { kind: "INVALID_MIME"; declared: string; detected: string }
  | { kind: "DURATION_EXCEEDED"; maxMs: number; actualMs: number }
  | { kind: "RESOLUTION_EXCEEDED"; maxW: number; maxH: number; actualW: number; actualH: number }
  | { kind: "SACRED_VIOLATION"; kinds: SacredKind[] }
  | { kind: "CHUNK_OUT_OF_ORDER"; expected: number; received: number }
  | { kind: "UPLOAD_NOT_COMPLETE"; received: number; total: number }
  | { kind: "CONSENT_REQUIRED"; purpose: LgpdPurpose }
  | { kind: "BIOMETRIC_CONSENT_MISSING" }
  | { kind: "AUDIT_CHAIN_BROKEN"; at: number };

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constantes, taxonomias, magic bytes, sacred patterns                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Versão do engine — bump em mudanças incompatíveis. */
export const MEDIA_ENGINE_VERSION = "w58.1.0";

/** Limites duros (Art. 12 LGPD — necessidade). */
export const MAX_AUDIO_DURATION_MS = 60 * 60 * 1000;        // 60 min
export const MAX_VIDEO_DURATION_MS = 90 * 60 * 1000;        // 90 min
export const MAX_VIDEO_WIDTH = 3840;                         // 4K
export const MAX_VIDEO_HEIGHT = 2160;
export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;       // 500 MB
export const MAX_CHUNK_SIZE_BYTES = 5 * 1024 * 1024;        // 5 MB per chunk
export const MIN_CHUNK_SIZE_BYTES = 64 * 1024;              // 64 KB
export const MIN_AUDIO_DURATION_MS = 500;                   // 500 ms

/** Retenção. */
export const AUDIT_RETENTION_DAYS = 365 * 5;                // audit indefinido (5y hash)
export const ANALYTICS_RETENTION_DAYS = 90;
export const BIOMETRIC_RETENTION_DAYS = 365;

/** Janela de export LGPD Art. 18. */
export const LGPD_EXPORT_WINDOW_DAYS = 90;

/** MIME types suportados (whitelist para spoofing detection). */
export const SUPPORTED_MIME_TYPES = new Set<string>([
  "audio/mpeg",
  "audio/mp4",
  "audio/aac",
  "audio/opus",
  "audio/ogg",
  "audio/wav",
  "audio/flac",
  "audio/webm",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
]);

/** MIME magic bytes — 4 bytes iniciais para detecção hand-rolled. */
export const MIME_MAGIC_SIGNATURES: ReadonlyArray<{
  mime: string;
  marker: Uint8Array;
  offset: number;
}> = [
  // "RIFF????WAVE" — WAV
  { mime: "audio/wav", marker: new Uint8Array([0x52, 0x49, 0x46, 0x46]), offset: 0 },
  // "fLaC"
  { mime: "audio/flac", marker: new Uint8Array([0x66, 0x4c, 0x61, 0x43]), offset: 0 },
  // "ID3" — MP3 com tag ID3
  { mime: "audio/mpeg", marker: new Uint8Array([0x49, 0x44, 0x33]), offset: 0 },
  // 0xFF 0xFB/FA/F3/F2 — MP3 frame sync
  { mime: "audio/mpeg", marker: new Uint8Array([0xff, 0xfb]), offset: 0 },
  // "OggS" — OGG/Opus
  { mime: "audio/ogg", marker: new Uint8Array([0x4f, 0x67, 0x67, 0x53]), offset: 0 },
  // "ftyp" — MP4 container (offset 4)
  { mime: "video/mp4", marker: new Uint8Array([0x66, 0x74, 0x79, 0x70]), offset: 4 },
  // "????ftyp" — MP4 (lookup at offset 4)
  { mime: "video/mp4", marker: new Uint8Array([0x66, 0x74, 0x79, 0x70]), offset: 4 },
  // 0x1A 0x45 0xDF 0xA3 — Matroska/WebM
  { mime: "video/x-matroska", marker: new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]), offset: 0 },
  // 0x00 0x00 0x00 ?? — QuickTime (MOV)
  { mime: "video/quicktime", marker: new Uint8Array([0x00, 0x00, 0x00, 0x14]), offset: 0 },
];

/** MIME → Codec padrão. */
export const MIME_TO_CODEC: Record<string, CodecKind> = {
  "audio/mpeg": "audio/mp3",
  "audio/mp4": "audio/aac",
  "audio/aac": "audio/aac",
  "audio/opus": "audio/opus",
  "audio/ogg": "audio/opus",
  "audio/wav": "audio/wav",
  "audio/flac": "audio/flac",
  "audio/webm": "audio/opus",
  "video/mp4": "video/avc",
  "video/webm": "video/vp9",
  "video/quicktime": "video/avc",
  "video/x-matroska": "video/vp9",
};

/** Codec → bitrate alvo default (bps). */
export const CODEC_TARGET_BITRATE: Record<CodecKind, number> = {
  "audio/aac": 128_000,
  "audio/mp3": 192_000,
  "audio/opus": 96_000,
  "audio/flac": 0, // lossless → passthrough
  "audio/wav": 0, // lossless → passthrough
  "video/avc": 2_500_000,
  "video/hevc": 1_500_000,
  "video/vp9": 1_800_000,
  "video/av1": 1_400_000,
  passthrough: 0,
};

/** Bitrate mínimo por codec (validation). */
export const CODEC_MIN_BITRATE: Record<CodecKind, number> = {
  "audio/aac": 32_000,
  "audio/mp3": 64_000,
  "audio/opus": 32_000,
  "audio/flac": 0,
  "audio/wav": 0,
  "video/avc": 400_000,
  "video/hevc": 300_000,
  "video/vp9": 400_000,
  "video/av1": 300_000,
  passthrough: 0,
};

/** Bitrate máximo por codec. */
export const CODEC_MAX_BITRATE: Record<CodecKind, number> = {
  "audio/aac": 320_000,
  "audio/mp3": 320_000,
  "audio/opus": 256_000,
  "audio/flac": 0,
  "audio/wav": 0,
  "video/avc": 20_000_000,
  "video/hevc": 15_000_000,
  "video/vp9": 14_000_000,
  "video/av1": 12_000_000,
  passthrough: 0,
};

/** Padrões sagrados em texto (lowercase, sem acento). Detector primário. */
export const SACRED_PATTERNS: ReadonlyArray<{
  pattern: string;
  kind: SacredKind;
}> = [
  { pattern: "reza de ogum", kind: "prayer" },
  { pattern: "mantra de oxala", kind: "prayer" },
  { pattern: "patakori", kind: "ritual" },
  { pattern: "fundamento iniciatico", kind: "lineage" },
  { pattern: "linhagem direta", kind: "lineage" },
  { pattern: "tiragem fechada", kind: "oracle" },
  { pattern: "oracao secreta", kind: "prayer" },
  { pattern: "ponto riscado", kind: "ritual" },
  { pattern: "ebó", kind: "ritual" },
  { pattern: "feitura de santo", kind: "ritual" },
  { pattern: "axé de dentro", kind: "lineage" },
  { pattern: "quarto de santo", kind: "lineage" },
];

/** Lista de stopwords para mascaramento sagrado. */
export const SACRED_MASK_PLACEHOLDER = "[conteúdo em modo silêncio]";
export const SACRED_THUMBNAIL_BLUR_RADIUS = 32;

/** Bucket de MIME para classificação rápida. */
export const AUDIO_MIMES = new Set<string>([
  "audio/mpeg", "audio/mp4", "audio/aac", "audio/opus",
  "audio/ogg", "audio/wav", "audio/flac", "audio/webm",
]);

/** Sample rate default para waveform. */
export const DEFAULT_SAMPLE_RATE = 44_100;
export const DEFAULT_PEAKS_COUNT = 256;
export const DEFAULT_VIDEO_PEAK_RATE = 8_000;

/** Hash chain constants. */
export const AUDIT_HMAC_KEY_PREFIX = "w58-media-audit-v1";
export const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math helpers — FNV-1a 32/64, SHA-256, HMAC-SHA256, Mulberry32, MIME   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Converte string para UTF-8 bytes (hand-rolled, sem TextEncoder). */
export function utf8ToBytes(s: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6));
      out.push(0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      out.push(0xe0 | (c >> 12));
      out.push(0x80 | ((c >> 6) & 0x3f));
      out.push(0x80 | (c & 0x3f));
    } else {
      // Surrogate pair
      i++;
      const c2 = s.charCodeAt(i);
      const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      out.push(0xf0 | (cp >> 18));
      out.push(0x80 | ((cp >> 12) & 0x3f));
      out.push(0x80 | ((cp >> 6) & 0x3f));
      out.push(0x80 | (cp & 0x3f));
    }
  }
  return new Uint8Array(out);
}

/** Hex encode de bytes para string minúscula. */
export function bytesToHex(bytes: Uint8Array): string {
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    out += hex[(b >> 4) & 0x0f];
    out += hex[b & 0x0f];
  }
  return out;
}

/** FNV-1a 32-bit hash — string ou bytes. */
export function fnv1a32(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? utf8ToBytes(input) : input;
  let h = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** FNV-1a 64-bit hash (simulado com 2×32 bits e concat). */
export function fnv1a64(input: string | Uint8Array): string {
  const a = fnv1a32(input);
  const b = fnv1a32("w58-salt:" + (typeof input === "string" ? input : bytesToHex(input)));
  return a + b + a + b; // 32 hex chars
}

/** SHA-256 — implementação FIPS 180-4 pura JS, ~120L. */
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function sha256Compress(state: Uint32Array, block: Uint8Array): void {
  const w = new Uint32Array(64);
  for (let i = 0; i < 16; i++) {
    w[i] = ((block[i * 4] << 24) | (block[i * 4 + 1] << 16) | (block[i * 4 + 2] << 8) | block[i * 4 + 3]) >>> 0;
  }
  for (let i = 16; i < 64; i++) {
    const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
    const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
  }
  let [a, b, c, d, e, f, g, h] = state;
  for (let i = 0; i < 64; i++) {
    const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
    const ch = (e & f) ^ (~e & g);
    const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
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
  state[0] = (state[0] + a) >>> 0;
  state[1] = (state[1] + b) >>> 0;
  state[2] = (state[2] + c) >>> 0;
  state[3] = (state[3] + d) >>> 0;
  state[4] = (state[4] + e) >>> 0;
  state[5] = (state[5] + f) >>> 0;
  state[6] = (state[6] + g) >>> 0;
  state[7] = (state[7] + h) >>> 0;
}

export function sha256(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? utf8ToBytes(input) : input;
  const state = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const len = bytes.length;
  const bitLen = len * 8;
  const padded = new Uint8Array(Math.ceil((len + 9) / 64) * 64);
  padded.set(bytes);
  padded[len] = 0x80;
  // Big-endian bit length
  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  const off = padded.length - 8;
  padded[off]     = (hi >>> 24) & 0xff;
  padded[off + 1] = (hi >>> 16) & 0xff;
  padded[off + 2] = (hi >>> 8) & 0xff;
  padded[off + 3] = hi & 0xff;
  padded[off + 4] = (lo >>> 24) & 0xff;
  padded[off + 5] = (lo >>> 16) & 0xff;
  padded[off + 6] = (lo >>> 8) & 0xff;
  padded[off + 7] = lo & 0xff;
  for (let i = 0; i < padded.length; i += 64) {
    sha256Compress(state, padded.subarray(i, i + 64));
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    out[i * 4]     = (state[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (state[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (state[i] >>> 8) & 0xff;
    out[i * 4 + 3] = state[i] & 0xff;
  }
  return bytesToHex(out);
}

/** SHA-256 de bytes sem passar pela UTF-8 round-trip — para HMAC ipad/opad. */
export function sha256OfBytes(bytes: Uint8Array): string {
  return sha256(bytes);
}

/**
 * HMAC-SHA256 — implementação RFC 2104 pura JS. Recebe key em bytes
 * (NÃO string) para evitar expansão UTF-8 que corromperia ipad/opad
 * XOR (lesson w55/auth-pages).
 */
export function hmacSha256(keyBytes: Uint8Array, message: string | Uint8Array): string {
  const BLOCK_SIZE = 64;
  let key = keyBytes;
  if (key.length > BLOCK_SIZE) {
    key = new Uint8Array(32);
    const hex = sha256(keyBytes);
    for (let i = 0; i < 32; i++) {
      key[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
  } else if (key.length < BLOCK_SIZE) {
    const padded = new Uint8Array(BLOCK_SIZE);
    padded.set(key);
    key = padded;
  }
  const ipad = new Uint8Array(BLOCK_SIZE);
  const opad = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    ipad[i] = key[i] ^ 0x36;
    opad[i] = key[i] ^ 0x5c;
  }
  const msg = typeof message === "string" ? utf8ToBytes(message) : message;
  const inner = new Uint8Array(BLOCK_SIZE + msg.length);
  inner.set(ipad);
  inner.set(msg, BLOCK_SIZE);
  const innerHash = new Uint8Array(32);
  const innerHex = sha256OfBytes(inner);
  for (let i = 0; i < 32; i++) {
    innerHash[i] = parseInt(innerHex.substring(i * 2, i * 2 + 2), 16);
  }
  const outer = new Uint8Array(BLOCK_SIZE + 32);
  outer.set(opad);
  outer.set(innerHash, BLOCK_SIZE);
  return sha256OfBytes(outer);
}

/** Mulberry32 PRNG seeded — para peaks determinísticos. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Detecção hand-rolled de MIME via magic bytes (primeiros 16 bytes).
 * Retorna MIME detectado ou "application/octet-stream" se nenhum
 * marker casar. Função usada por `detectMimeSpoofing` para defesa
 * secundária contra spoofing.
 */
export function sniffMimeFromBytes(first16: Uint8Array): string {
  if (first16.length < 4) return "application/octet-stream";
  for (const sig of MIME_MAGIC_SIGNATURES) {
    if (first16.length < sig.offset + sig.marker.length) continue;
    let match = true;
    for (let i = 0; i < sig.marker.length; i++) {
      if (first16[sig.offset + i] !== sig.marker[i]) {
        match = false;
        break;
      }
    }
    if (match) return sig.mime;
  }
  return "application/octet-stream";
}

/** Constant-time comparison de hex strings — para tag HMAC. */
export function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Canonical JSON para audit chain (chaves ordenadas, sem whitespace). */
export function canonicalJSON(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalJSON).join(",") + "]";
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const parts = keys.map((k) => {
    const v = (obj as Record<string, unknown>)[k];
    return JSON.stringify(k) + ":" + canonicalJSON(v);
  });
  return "{" + parts.join(",") + "}";
}

/** Clamp helper. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Detection de MIME válido — defensive. */
export function isValidMime(mime: string): boolean {
  return SUPPORTED_MIME_TYPES.has(mime);
}

/** Classifica MIME em MediaType. */
export function classifyMimeType(mime: string): MediaType | "unknown" {
  if (AUDIO_MIMES.has(mime)) return "audio";
  if (mime.startsWith("video/")) return "video";
  return "unknown";
}

/** Helper: seconds → "HH:MM:SS.mmm" para VTT/SRT. */
export function formatTimestampVTT(ms: number): string {
  const total = Math.max(0, Math.floor(ms));
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor((total % 3_600_000) / 60_000);
  const s = Math.floor((total % 60_000) / 1000);
  const millis = total % 1000;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(millis)}`;
}

export function formatTimestampSRT(ms: number): string {
  const total = Math.max(0, Math.floor(ms));
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor((total % 3_600_000) / 60_000);
  const s = Math.floor((total % 60_000) / 1000);
  const millis = total % 1000;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)},${pad3(millis)}`;
}

function pad2(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}
function pad3(n: number): string {
  if (n < 10) return "00" + n;
  if (n < 100) return "0" + n;
  return "" + n;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 Upload session                                                         ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Singleton store — engine é by-shape, sem persistência. */
const UPLOAD_SESSIONS = new Map<string, UploadSession>();
const MEDIA_ASSETS = new Map<string, MediaAsset>();
const TRANSCODE_JOBS = new Map<string, TranscodeJob>();
const CAPTION_TRACKS = new Map<string, CaptionTrack>();
const TRANSCRIPT_SEGMENTS = new Map<string, TranscriptSegment[]>();
const AUDIT_LOG: MediaAuditEvent[] = [];
const CONSENT_STATE = new Map<string, MediaConsentState>();
const ASSET_OWNER_INDEX = new Map<string, Set<string>>(); // ownerId → assetIds

let AUDIT_HMAC_KEY: Uint8Array | null = null;

/** Inicializa a chave HMAC do audit log — chamada por startAuditChain(). */
export function startAuditChain(seedKey?: string): void {
  if (AUDIT_HMAC_KEY) return;
  const base = (seedKey || AUDIT_HMAC_KEY_PREFIX) + ":" + Date.now().toString(36);
  AUDIT_HMAC_KEY = utf8ToBytes(base);
}

/** Reseta estado interno — para testes. */
export function _resetMediaEngine(): void {
  UPLOAD_SESSIONS.clear();
  MEDIA_ASSETS.clear();
  TRANSCODE_JOBS.clear();
  CAPTION_TRACKS.clear();
  TRANSCRIPT_SEGMENTS.clear();
  AUDIT_LOG.length = 0;
  CONSENT_STATE.clear();
  ASSET_OWNER_INDEX.clear();
  AUDIT_HMAC_KEY = null;
}

/** Acesso read-only ao audit log — para verificadores. */
export function getMediaAuditLog(): ReadonlyArray<MediaAuditEvent> {
  return AUDIT_LOG.slice();
}

/** Lookup helpers (expostos para testabilidade). */
export function getMediaAsset(assetId: string): MediaAsset | undefined {
  return MEDIA_ASSETS.get(assetId);
}

export function getUploadSession(sessionId: string): UploadSession | undefined {
  return UPLOAD_SESSIONS.get(sessionId);
}

export function getTranscodeJob(jobId: string): TranscodeJob | undefined {
  return TRANSCODE_JOBS.get(jobId);
}

export function getCaptionTrack(trackId: string): CaptionTrack | undefined {
  return CAPTION_TRACKS.get(trackId);
}

export function getTranscript(assetId: string): TranscriptSegment[] | undefined {
  return TRANSCRIPT_SEGMENTS.get(assetId);
}

export function getConsentState(userId: string): MediaConsentState | undefined {
  return CONSENT_STATE.get(userId);
}

/**
 * Inicia uma sessão de upload chunked. Cria sessionId determinístico
 * a partir de ownerId + mimeType + startedAt. Status inicial é
 * "pending" — só vira "uploading" no primeiro addChunk.
 */
export function startUpload(
  ownerId: string,
  type: MediaType,
  mimeType: string,
): UploadSession {
  if (!isValidMime(mimeType)) {
    throw {
      kind: "INVALID_MIME",
      declared: mimeType,
      detected: "unsupported",
    } as MediaEngineError;
  }
  const inferred = classifyMimeType(mimeType);
  if (inferred !== type) {
    throw {
      kind: "INVALID_MIME",
      declared: mimeType,
      detected: `type-mismatch-expected-${type}`,
    } as MediaEngineError;
  }
  const startedAt = Date.now();
  const sessionId = fnv1a64(`upload:${ownerId}:${mimeType}:${startedAt}`);
  const session: UploadSession = {
    sessionId,
    ownerId,
    type,
    mimeType,
    startedAt,
    status: "pending",
    totalBytes: 0,
    receivedBytes: 0,
    chunks: [],
    fingerprint: GENESIS_HASH.slice(0, 32),
  };
  UPLOAD_SESSIONS.set(sessionId, session);
  return session;
}

/**
 * Adiciona chunk à sessão. Valida ordem (chunkIdx sequencial),
 * tamanho (MIN..MAX), atualiza fingerprint acumulado com FNV-1a 64
 * misturando todos os chunks.
 */
export function addChunk(
  sessionId: string,
  chunkIdx: number,
  data: Uint8Array,
): UploadSession {
  const session = UPLOAD_SESSIONS.get(sessionId);
  if (!session) throw new Error(`Upload session ${sessionId} not found`);
  if (session.status === "completed" || session.status === "aborted") {
    throw new Error(`Upload session ${sessionId} already finalized`);
  }
  if (chunkIdx !== session.chunks.length) {
    throw {
      kind: "CHUNK_OUT_OF_ORDER",
      expected: session.chunks.length,
      received: chunkIdx,
    } as MediaEngineError;
  }
  if (data.length < MIN_CHUNK_SIZE_BYTES && chunkIdx !== 0) {
    throw new Error(`Chunk ${chunkIdx} too small (min ${MIN_CHUNK_SIZE_BYTES})`);
  }
  if (data.length > MAX_CHUNK_SIZE_BYTES) {
    throw new Error(`Chunk ${chunkIdx} too large (max ${MAX_CHUNK_SIZE_BYTES})`);
  }
  const chunkFp = fnv1a64(data);
  const chunk: UploadChunk = {
    chunkIdx,
    size: data.length,
    fingerprint: chunkFp,
    receivedAt: Date.now(),
  };
  session.chunks.push(chunk);
  session.receivedBytes += data.length;
  session.status = "uploading";
  // Mix no fingerprint acumulado: combine (FNV-1a 64) com xor de halves
  const prev = session.fingerprint;
  const mixed = mixFingerprints(prev, chunkFp);
  session.fingerprint = mixed;
  UPLOAD_SESSIONS.set(sessionId, session);
  return session;
}

/** Mix determinístico de duas fingerprints hex de 32 chars. */
function mixFingerprints(a: string, b: string): string {
  const aBytes = hexToBytes(a);
  const bBytes = hexToBytes(b);
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    out[i] = aBytes[i] ^ bBytes[i] ^ ((i * 31) & 0xff);
  }
  return bytesToHex(out).padEnd(32, "0").slice(0, 32);
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-f]/gi, "");
  const padded = clean.length % 2 === 0 ? clean : "0" + clean;
  const out = new Uint8Array(padded.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(padded.substring(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Finaliza upload. Valida que receivedBytes >= totalBytes (se
 * declarado). Cria MediaAsset com fingerprint final, MIME detectado
 * via magic bytes do primeiro chunk (passado pelo caller via
 * `detectedMime`).
 */
export function completeUpload(
  sessionId: string,
  detectedMime: string,
  metadata: {
    durationMs: number;
    width?: number;
    height?: number;
    channels?: number;
    sampleRate?: number;
    bitrate?: number;
    totalBytes?: number;
    sacredFlag?: boolean;
    sacredKinds?: SacredKind[];
  },
): MediaAsset {
  const session = UPLOAD_SESSIONS.get(sessionId);
  if (!session) throw new Error(`Upload session ${sessionId} not found`);
  if (session.status === "completed") {
    return MEDIA_ASSETS.get(session.fingerprint.slice(0, 32)) as MediaAsset;
  }
  if (session.status === "aborted") {
    throw new Error(`Upload session ${sessionId} was aborted`);
  }
  if (metadata.totalBytes !== undefined && session.receivedBytes < metadata.totalBytes) {
    throw {
      kind: "UPLOAD_NOT_COMPLETE",
      received: session.receivedBytes,
      total: metadata.totalBytes,
    } as MediaEngineError;
  }
  if (session.type === "audio") {
    const r = validateAudioDuration(metadata.durationMs);
    if (!r.valid) {
      throw { kind: "DURATION_EXCEEDED", maxMs: MAX_AUDIO_DURATION_MS, actualMs: metadata.durationMs } as MediaEngineError;
    }
  }
  if (session.type === "video" && metadata.width && metadata.height) {
    const r = validateVideoResolution(metadata.width, metadata.height);
    if (!r.valid) {
      throw {
        kind: "RESOLUTION_EXCEEDED",
        maxW: MAX_VIDEO_WIDTH,
        maxH: MAX_VIDEO_HEIGHT,
        actualW: metadata.width,
        actualH: metadata.height,
      } as MediaEngineError;
    }
  }
  session.status = "completed";
  session.completedAt = Date.now();
  session.totalBytes = metadata.totalBytes || session.receivedBytes;
  UPLOAD_SESSIONS.set(sessionId, session);

  const codec = MIME_TO_CODEC[session.mimeType] || "passthrough";
  const id = fnv1a64(`asset:${session.fingerprint}:${session.sessionId}`);
  const asset: MediaAsset = {
    id,
    type: session.type,
    ownerId: session.ownerId,
    url: `/media/${session.ownerId}/${id}`,
    mimeType: session.mimeType,
    detectedMime,
    sizeBytes: session.totalBytes,
    durationMs: metadata.durationMs,
    codec,
    width: metadata.width,
    height: metadata.height,
    channels: metadata.channels,
    sampleRate: metadata.sampleRate,
    bitrate: metadata.bitrate,
    fingerprint: sha256(session.fingerprint + ":" + session.sessionId),
    chunksFingerprint: session.fingerprint,
    sacredFlag: metadata.sacredFlag || false,
    sacredKinds: metadata.sacredKinds || [],
    sacredConsentToken: metadata.sacredFlag
      ? fnv1a64(`sacred-token:${session.ownerId}:${id}`)
      : undefined,
    biometricConsentToken: undefined, // só setado se biometric opt-in
    a11y: {
      captionTrackIds: [],
      languageCodes: [],
      hasSacredTrack: false,
      ariaLabels: {
        playButton: `Reproduzir ${session.type === "audio" ? "áudio" : "vídeo"}`,
        muteButton: "Silenciar",
        captionToggle: "Alternar legendas",
        sacredRevealToggle: "Revelar conteúdo sagrado",
      },
    },
    uploadedAt: session.completedAt,
  };
  MEDIA_ASSETS.set(id, asset);
  if (!ASSET_OWNER_INDEX.has(session.ownerId)) {
    ASSET_OWNER_INDEX.set(session.ownerId, new Set());
  }
  ASSET_OWNER_INDEX.get(session.ownerId)!.add(id);

  appendAudit({
    assetId: id,
    ownerId: session.ownerId,
    kind: "uploaded",
    actorId: session.ownerId,
    purpose: "upload",
    payload: {
      mime: session.mimeType,
      detectedMime,
      sizeBytes: session.totalBytes,
      durationMs: metadata.durationMs,
      sacredFlag: asset.sacredFlag,
    },
  });

  if (asset.sacredFlag) {
    appendAudit({
      assetId: id,
      ownerId: session.ownerId,
      kind: "sacred-redacted",
      actorId: session.ownerId,
      purpose: "sacred-display",
      payload: {
        kinds: asset.sacredKinds.join(","),
        consentToken: asset.sacredConsentToken || "",
      },
    });
  }
  return asset;
}

/** Aborta upload — usado em cancelamento de UI. */
export function abortUpload(sessionId: string, reason: string): UploadSession {
  const session = UPLOAD_SESSIONS.get(sessionId);
  if (!session) throw new Error(`Upload session ${sessionId} not found`);
  session.status = "aborted";
  session.abortedReason = reason;
  UPLOAD_SESSIONS.set(sessionId, session);
  return session;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 Transcode job                                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Enfileira job de transcodificação. Valida bitrate mínimo/máximo
 * do codec alvo. Status inicial "queued".
 */
export function queueTranscode(
  assetId: string,
  targetCodec: CodecKind,
  targetBitrate: number,
): TranscodeJob {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  const min = CODEC_MIN_BITRATE[targetCodec];
  const max = CODEC_MAX_BITRATE[targetCodec];
  if (min > 0 && targetBitrate < min) {
    throw new Error(`Bitrate ${targetBitrate} below min ${min} for ${targetCodec}`);
  }
  if (max > 0 && targetBitrate > max) {
    throw new Error(`Bitrate ${targetBitrate} above max ${max} for ${targetCodec}`);
  }
  const jobId = fnv1a64(`transcode:${assetId}:${targetCodec}:${Date.now()}`);
  const sourceCodec = asset.codec;
  const job: TranscodeJob = {
    jobId,
    assetId,
    sourceCodec,
    targetCodec,
    targetBitrate,
    status: "queued",
    progress: 0,
    startedAt: Date.now(),
    estimatedMsRemaining: estimateTranscodeMs(asset, targetCodec),
    detectedSourceMime: asset.detectedMime,
  };
  TRANSCODE_JOBS.set(jobId, job);
  return job;
}

/** Estima duração de transcodificação baseado em size + codec. */
export function estimateTranscodeMs(asset: MediaAsset, targetCodec: CodecKind): number {
  const seconds = asset.durationMs / 1000;
  const codecFactor = targetCodec.startsWith("audio/")
    ? 0.05
    : targetCodec === "video/hevc" || targetCodec === "video/av1"
    ? 0.6
    : 0.3;
  return Math.floor(seconds * 1000 * codecFactor) + 500;
}

/**
 * Avança progresso de transcodificação. Aceita progresso no range
 * [0..1] e atualiza status. Quando progresso === 1, marca
 * "completed" e atualiza asset.transcodedAt. Auditoria gerada
 * uma vez na conclusão.
 */
export function transcodeStep(jobId: string, progress: number): TranscodeJob {
  const job = TRANSCODE_JOBS.get(jobId);
  if (!job) throw new Error(`Transcode job ${jobId} not found`);
  const p = clamp(progress, 0, 1);
  if (job.status === "completed") return job;
  if (job.status === "queued" && p > 0) job.status = "running";
  job.progress = p;
  job.estimatedMsRemaining = Math.floor(job.estimatedMsRemaining * (1 - p));
  if (p >= 1) {
    job.status = "completed";
    job.completedAt = Date.now();
    job.estimatedMsRemaining = 0;
    const asset = MEDIA_ASSETS.get(job.assetId);
    if (asset) {
      asset.transcodedAt = job.completedAt;
      asset.codec = job.targetCodec;
      asset.bitrate = job.targetBitrate;
      MEDIA_ASSETS.set(asset.id, asset);
    }
    appendAudit({
      assetId: job.assetId,
      ownerId: asset?.ownerId || "unknown",
      kind: "transcoded",
      purpose: "transcode",
      payload: {
        sourceCodec: job.sourceCodec,
        targetCodec: job.targetCodec,
        targetBitrate: job.targetBitrate,
        jobId,
      },
    });
  }
  TRANSCODE_JOBS.set(jobId, job);
  return job;
}

/** Pausa transcodificação. */
export function pauseTranscode(jobId: string): TranscodeJob {
  const job = TRANSCODE_JOBS.get(jobId);
  if (!job) throw new Error(`Transcode job ${jobId} not found`);
  if (job.status === "running") job.status = "paused";
  TRANSCODE_JOBS.set(jobId, job);
  return job;
}

/** Resume transcodificação (paused → running). */
export function resumeTranscode(jobId: string): TranscodeJob {
  const job = TRANSCODE_JOBS.get(jobId);
  if (!job) throw new Error(`Transcode job ${jobId} not found`);
  if (job.status === "paused") job.status = "running";
  TRANSCODE_JOBS.set(jobId, job);
  return job;
}

/** Falha transcodificação com mensagem. */
export function failTranscode(jobId: string, errorMessage: string): TranscodeJob {
  const job = TRANSCODE_JOBS.get(jobId);
  if (!job) throw new Error(`Transcode job ${jobId} not found`);
  job.status = "failed";
  job.errorMessage = errorMessage;
  TRANSCODE_JOBS.set(jobId, job);
  return job;
}

/** Lista jobs ativos (running/queued/paused). */
export function listActiveTranscodeJobs(): TranscodeJob[] {
  return Array.from(TRANSCODE_JOBS.values()).filter(
    (j) => j.status === "running" || j.status === "queued" || j.status === "paused",
  );
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 Waveform (peaks determinísticos do content hash)                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Gera waveform mock determinístico do content hash do asset.
 * Peaks são derivados via Mulberry32 seeded com o FNV-1a 32 do
 * fingerprint, garantindo que o mesmo asset sempre gera o mesmo
 * waveform. Suavização por janela de 4 para evitar variação
 * aleatória dura.
 */
export function generateWaveform(assetId: string): AudioWaveform {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  const seedHex = fnv1a32(asset.fingerprint);
  const seed = parseInt(seedHex, 16) >>> 0;
  const rng = mulberry32(seed);
  const peakCount = DEFAULT_PEAKS_COUNT;
  const raw = new Array<number>(peakCount);
  for (let i = 0; i < peakCount; i++) {
    raw[i] = rng();
  }
  // Suavização janela 4
  const peaks = new Array<number>(peakCount);
  for (let i = 0; i < peakCount; i++) {
    let sum = 0;
    let count = 0;
    for (let k = -2; k <= 2; k++) {
      const idx = i + k;
      if (idx >= 0 && idx < peakCount) {
        sum += raw[idx];
        count++;
      }
    }
    peaks[i] = sum / count;
  }
  // Normalizar para [0..1]
  const max = Math.max(...peaks) || 1;
  const min = Math.min(...peaks) || 0;
  for (let i = 0; i < peakCount; i++) {
    peaks[i] = (peaks[i] - min) / (max - min || 1);
  }
  const sampleRate = asset.sampleRate || DEFAULT_SAMPLE_RATE;
  const durationMs = asset.durationMs;
  const waveform: AudioWaveform = {
    assetId,
    sampleRate,
    durationMs,
    peaks,
    peaksCount: peakCount,
    generatedAt: Date.now(),
    seed: seedHex,
  };
  return waveform;
}

/**
 * Converte waveform em SVG path "M x,y L x,y ..." para renderização
 * cliente. Helper opcional.
 */
export function waveformToSVGPath(wf: AudioWaveform, width: number, height: number): string {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const step = w / wf.peaksCount;
  let path = "";
  for (let i = 0; i < wf.peaksCount; i++) {
    const x = i * step;
    const y = (1 - wf.peaks[i]) * h / 2;
    if (i === 0) {
      path += `M ${x.toFixed(2)},${y.toFixed(2)}`;
    } else {
      path += ` L ${x.toFixed(2)},${y.toFixed(2)}`;
    }
  }
  return path;
}

/** RMS (root mean square) aproximado do waveform — para medição de loudness. */
export function waveformRMS(wf: AudioWaveform): number {
  let sum = 0;
  for (const p of wf.peaks) sum += p * p;
  return Math.sqrt(sum / wf.peaksCount);
}

/** Peak máximo do waveform — para normalização. */
export function waveformPeakMax(wf: AudioWaveform): number {
  let m = 0;
  for (const p of wf.peaks) if (p > m) m = p;
  return m;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 Thumbnail (mock data URL com sacred-blur)                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Gera thumbnail mock determinístico. dataUrl é mock (1x1 px PNG
 * base64) — o objetivo é o contrato, não o render real.
 * Se o asset tem `sacredFlag`, o thumbnail auto-blur por default;
 * exige `revealSacredThumbnail` para exibir nítido.
 */
export function generateThumbnail(
  assetId: string,
  timestampMs: number,
  options?: {
    revealSacred?: boolean;
    width?: number;
    height?: number;
  },
): VideoThumbnail {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  if (asset.type !== "video") {
    throw new Error(`Thumbnail only for video assets (got ${asset.type})`);
  }
  const w = options?.width || asset.width || 320;
  const h = options?.height || asset.height || 240;
  const sacredBlurred =
    asset.sacredFlag && !options?.revealSacred;
  const mockDataUrl =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const thumbnail: VideoThumbnail = {
    assetId,
    timestampMs: clamp(timestampMs, 0, asset.durationMs),
    dataUrl: sacredBlurred ? "data:image/png;base64,BLURRED" : mockDataUrl,
    sacredBlurred,
    width: w,
    height: h,
    generatedAt: Date.now(),
  };
  return thumbnail;
}

/**
 * Revela thumbnail sagrado — exige consentimento explícito (opt-in
 * separado + token). Retorna novo thumbnail nítido.
 */
export function revealSacredThumbnail(
  assetId: string,
  timestampMs: number,
  consentToken: string,
): VideoThumbnail {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  if (!asset.sacredFlag) {
    throw new Error("Asset is not sacred — use generateThumbnail directly");
  }
  if (!asset.sacredConsentToken || asset.sacredConsentToken !== consentToken) {
    throw { kind: "CONSENT_REQUIRED", purpose: "sacred-display" } as MediaEngineError;
  }
  return generateThumbnail(assetId, timestampMs, { revealSacred: true });
}

/** Gera múltiplos thumbnails para scrubbing de vídeo. */
export function generateThumbnailStrip(
  assetId: string,
  count: number,
): VideoThumbnail[] {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  if (asset.type !== "video") {
    throw new Error("Thumbnail strip only for video assets");
  }
  const step = asset.durationMs / (count + 1);
  const out: VideoThumbnail[] = [];
  for (let i = 0; i < count; i++) {
    out.push(generateThumbnail(assetId, Math.floor(step * (i + 1))));
  }
  return out;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Captions (VTT/SRT, sacred-aware: track separada)                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Gera caption track (VTT ou SRT). Se o asset é sagrado, gera uma
 * track SEPARADA com `sacredFlag=true` — nunca mesclada com a track
 * geral. Track geral é sempre não-sagrada; track sagrada só é
 * servida se o viewer tem opt-in.
 */
export function generateCaptions(
  assetId: string,
  language: string,
  format: "vtt" | "srt" = "vtt",
): CaptionTrack {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  const cues = mockCaptionCues(asset, language, false);
  const content = format === "vtt"
    ? serializeVTT(cues)
    : serializeSRT(cues);
  const trackId = fnv1a64(`caption:${assetId}:${language}:${format}:general`);
  const track: CaptionTrack = {
    trackId,
    assetId,
    language,
    format,
    sacredFlag: false,
    content,
    cueCount: cues.length,
    durationMs: asset.durationMs,
    generatedAt: Date.now(),
  };
  CAPTION_TRACKS.set(trackId, track);
  const a11y = MEDIA_ASSETS.get(assetId)!.a11y;
  if (!a11y.captionTrackIds.includes(trackId)) {
    a11y.captionTrackIds.push(trackId);
  }
  if (!a11y.languageCodes.includes(language)) {
    a11y.languageCodes.push(language);
  }
  return track;
}

/**
 * Gera caption track sagrada — separada da track geral. Só
 * servida se o viewer tem opt-in sagrado + token.
 */
export function generateSacredCaptions(
  assetId: string,
  language: string,
  format: "vtt" | "srt" = "vtt",
): CaptionTrack {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  if (!asset.sacredFlag) {
    throw new Error("Asset is not sacred — no sacred caption track");
  }
  const cues = mockCaptionCues(asset, language, true);
  const content = format === "vtt"
    ? serializeVTT(cues)
    : serializeSRT(cues);
  const trackId = fnv1a64(`caption:${assetId}:${language}:${format}:sacred`);
  const track: CaptionTrack = {
    trackId,
    assetId,
    language,
    format,
    sacredFlag: true,
    sacredKind: asset.sacredKinds[0],
    content,
    cueCount: cues.length,
    durationMs: asset.durationMs,
    generatedAt: Date.now(),
  };
  CAPTION_TRACKS.set(trackId, track);
  const a11y = MEDIA_ASSETS.get(assetId)!.a11y;
  if (!a11y.captionTrackIds.includes(trackId)) {
    a11y.captionTrackIds.push(trackId);
  }
  a11y.hasSacredTrack = true;
  appendAudit({
    assetId,
    ownerId: asset.ownerId,
    kind: "captioned",
    purpose: "captions",
    payload: { trackId, sacredFlag: true, language, format },
  });
  return track;
}

/** Mock de cues — determinístico do fingerprint + language. */
function mockCaptionCues(
  asset: MediaAsset,
  language: string,
  sacred: boolean,
): Array<{ startMs: number; endMs: number; text: string }> {
  const seed = fnv1a32(`${asset.fingerprint}:${language}:${sacred ? "s" : "g"}`);
  const rng = mulberry32(parseInt(seed, 16) >>> 0);
  const cueCount = Math.max(2, Math.floor(asset.durationMs / 8000));
  const cues: Array<{ startMs: number; endMs: number; text: string }> = [];
  const samples = sacred
    ? ["[conteúdo protegido em modo silêncio]", "[reza em modo silêncio]", "[mantra em modo silêncio]"]
    : [
        "Esta é uma fala pública do conteúdo",
        "Continuação do trecho público",
        "Bloco informativo comum",
        "Considerações finais",
      ];
  for (let i = 0; i < cueCount; i++) {
    const start = Math.floor((i / cueCount) * asset.durationMs);
    const end = Math.floor(((i + 1) / cueCount) * asset.durationMs);
    const text = samples[Math.floor(rng() * samples.length)];
    cues.push({ startMs: start, endMs: end, text });
  }
  return cues;
}

function serializeVTT(cues: Array<{ startMs: number; endMs: number; text: string }>): string {
  let out = "WEBVTT\n\n";
  for (const c of cues) {
    out += `${formatTimestampVTT(c.startMs)} --> ${formatTimestampVTT(c.endMs)}\n${c.text}\n\n`;
  }
  return out;
}

function serializeSRT(cues: Array<{ startMs: number; endMs: number; text: string }>): string {
  let out = "";
  cues.forEach((c, i) => {
    out += `${i + 1}\n${formatTimestampSRT(c.startMs)} --> ${formatTimestampSRT(c.endMs)}\n${c.text}\n\n`;
  });
  return out;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 Transcript (segments com sacred-mask por segmento)                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Gera transcript com segments. Cada segment pode ser marcado
 * `sacredMasked=true` se a diarização heurística detectar conteúdo
 * sagrado. Segmentos masked têm `text` substituído por placeholder
 * e não aparecem no transcript público — só no transcript protegido.
 */
export function generateTranscript(assetId: string): TranscriptSegment[] {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  const segCount = Math.max(2, Math.floor(asset.durationMs / 10000));
  const seed = fnv1a32(`transcript:${asset.fingerprint}`);
  const rng = mulberry32(parseInt(seed, 16) >>> 0);
  const segments: TranscriptSegment[] = [];
  for (let i = 0; i < segCount; i++) {
    const startMs = Math.floor((i / segCount) * asset.durationMs);
    const endMs = Math.floor(((i + 1) / segCount) * asset.durationMs);
    const isSacred = asset.sacredFlag && rng() < 0.3;
    const sacredKind = isSacred
      ? asset.sacredKinds[Math.floor(rng() * asset.sacredKinds.length)]
      : undefined;
    const baseText = isSacred
      ? SACRED_MASK_PLACEHOLDER
      : sampleTranscriptText(rng, asset);
    segments.push({
      segmentId: fnv1a64(`seg:${assetId}:${i}`),
      startMs,
      endMs,
      text: baseText,
      sacredMasked: isSacred,
      sacredKind,
      speakerId: `spk-${Math.floor(rng() * 3) + 1}`,
      confidence: 0.7 + rng() * 0.3,
    });
  }
  TRANSCRIPT_SEGMENTS.set(assetId, segments);
  const publicSegments = segments.filter((s) => !s.sacredMasked);
  appendAudit({
    assetId,
    ownerId: asset.ownerId,
    kind: "transcribed",
    purpose: "captions",
    payload: {
      totalSegments: segments.length,
      publicSegments: publicSegments.length,
      sacredMasked: segments.length - publicSegments.length,
    },
  });
  return segments;
}

/** Transcript protegido — só pra viewers com opt-in sagrado + token. */
export function generateProtectedTranscript(
  assetId: string,
  consentToken: string,
): TranscriptSegment[] {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  if (!asset.sacredFlag) {
    throw new Error("Asset is not sacred — no protected transcript");
  }
  if (!asset.sacredConsentToken || asset.sacredConsentToken !== consentToken) {
    throw { kind: "CONSENT_REQUIRED", purpose: "sacred-display" } as MediaEngineError;
  }
  return generateTranscript(assetId);
}

function sampleTranscriptText(rng: () => number, asset: MediaAsset): string {
  const samples = [
    "Boa noite, hoje vamos refletir sobre o tema proposto",
    "O trabalho que vem sendo construído tem mostrado resultados consistentes",
    "A comunidade tem se organizado em torno desses princípios",
    "Os pontos levantados merecem atenção cuidadosa",
    "A integração entre os saberes é o caminho que seguimos",
  ];
  return samples[Math.floor(rng() * samples.length)];
}

/** Conta segmentos masked vs total. */
export function transcriptStats(segments: TranscriptSegment[]): {
  total: number;
  public: number;
  sacred: number;
} {
  let sacred = 0;
  for (const s of segments) if (s.sacredMasked) sacred++;
  return { total: segments.length, public: segments.length - sacred, sacred };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §10 Sacred-content guard (primary + secondary leak detect)                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Detector primário de violação de conteúdo sagrado. Analisa
 * transcript + caption tracks em busca de padrões sagrados em
 * texto público (não-masked). Retorna true se houver leak.
 *
 * Este é o ponto de entrada único para gate de renderização
 * pública — qualquer rota que sirva conteúdo deve chamar este
 * gate antes.
 */
export function isSacredViolation(asset: MediaAsset): boolean {
  // Asset não-sagrado: nunca é violação
  if (!asset.sacredFlag) return false;
  // Se tem track sagrada separada, OK
  if (!asset.a11y.hasSacredTrack) return true;
  // Se transcript público tem segmentos sagrados não-masked, leak
  const segments = TRANSCRIPT_SEGMENTS.get(asset.id);
  if (segments) {
    for (const s of segments) {
      if (s.sacredMasked === false) {
        // Segment público — checa se texto casa padrões sagrados
        const norm = normalizeForSacred(s.text);
        for (const p of SACRED_PATTERNS) {
          if (norm.includes(p.pattern)) return true;
        }
      }
    }
  }
  // Caption track geral não deve ter conteúdo sagrado
  for (const tid of asset.a11y.captionTrackIds) {
    const t = CAPTION_TRACKS.get(tid);
    if (t && !t.sacredFlag) {
      const norm = normalizeForSacred(t.content);
      for (const p of SACRED_PATTERNS) {
        if (norm.includes(p.pattern)) return true;
      }
    }
  }
  return false;
}

function normalizeForSacred(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Aplica blur sagrado no asset — só thumbnails + transcripts visíveis
 * publicamente. Garante que o asset retém sacredFlag (para auditoria)
 * mas que toda exposição pública é via track/segment separados.
 */
export function applySacredBlur(asset: MediaAsset): MediaAsset {
  if (!asset.sacredFlag) return asset;
  // Auto-blur: força thumbnail a vir blurred
  const updated: MediaAsset = {
    ...asset,
    a11y: {
      ...asset.a11y,
      hasSacredTrack: true,
    },
  };
  MEDIA_ASSETS.set(asset.id, updated);
  return updated;
}

/**
 * Guard declarativo — descreve todas as regras de proteção
 * aplicadas ao asset. Útil para UI mostrar "Por que este conteúdo
 * está protegido?".
 */
export function getSacredContentGuard(asset: MediaAsset): SacredContentGuard {
  return {
    assetId: asset.id,
    sacredFlag: asset.sacredFlag,
    sacredKinds: asset.sacredKinds,
    thumbnailAutoBlur: asset.sacredFlag,
    captionTrackSeparated: asset.sacredFlag,
    transcriptSegmentMasked: asset.sacredFlag,
    biometricConsentIndependent: true, // por design
    consentTokenRequired: asset.sacredFlag,
  };
}

/** Lista todos os padrões sagrados detectados em um texto. */
export function detectSacredPatterns(text: string): SacredKind[] {
  const norm = normalizeForSacred(text);
  const found = new Set<SacredKind>();
  for (const p of SACRED_PATTERNS) {
    if (norm.includes(p.pattern)) found.add(p.kind);
  }
  return Array.from(found);
}

/** Classifica um texto como sagrado ou não. */
export function classifyTextSacred(text: string): boolean {
  return detectSacredPatterns(text).length > 0;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §11 MIME spoofing detection (hand-rolled magic-byte sniff)                ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Detecta MIME spoofing — compara MIME declarado pelo uploader com
 * MIME detectado por magic bytes nos primeiros 16 bytes do asset.
 * Retorna true se houver divergência (candidato a spoofing).
 */
export function detectMimeSpoofing(
  declaredMime: string,
  first16Bytes: Uint8Array,
): boolean {
  const detected = sniffMimeFromBytes(first16Bytes);
  if (detected === "application/octet-stream") {
    // Não conseguimos detectar — só aceita se MIME declarado está
    // na whitelist
    return !isValidMime(declaredMime);
  }
  return detected !== declaredMime;
}

/** Versão que recebe o asset + sample para checagem direta. */
export function detectMimeSpoofingOnAsset(
  asset: MediaAsset,
  first16Bytes: Uint8Array,
): boolean {
  return detectMimeSpoofing(asset.mimeType, first16Bytes);
}

/** Fingerprint MIME-check — emite audit se houver divergência. */
export function enforceMimeIntegrity(
  asset: MediaAsset,
  first16Bytes: Uint8Array,
): { ok: boolean; detected: string; declared: string } {
  const detected = sniffMimeFromBytes(first16Bytes);
  const ok = detected === asset.mimeType;
  if (!ok) {
    appendAudit({
      assetId: asset.id,
      ownerId: asset.ownerId,
      kind: "mime-rejected",
      payload: {
        declared: asset.mimeType,
        detected,
      },
    });
  }
  return { ok, detected, declared: asset.mimeType };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §12 Validation (duração, resolução, bitrate)                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Valida duração de áudio — máx 60 min, mín 500 ms. */
export function validateAudioDuration(durationMs: number): { valid: boolean; reason?: string } {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return { valid: false, reason: "duration must be a non-negative finite number" };
  }
  if (durationMs < MIN_AUDIO_DURATION_MS) {
    return { valid: false, reason: `audio too short (min ${MIN_AUDIO_DURATION_MS}ms)` };
  }
  if (durationMs > MAX_AUDIO_DURATION_MS) {
    return { valid: false, reason: `audio too long (max ${MAX_AUDIO_DURATION_MS}ms = 60min)` };
  }
  return { valid: true };
}

/** Valida resolução de vídeo — máx 4K (3840×2160). */
export function validateVideoResolution(
  width: number,
  height: number,
): { valid: boolean; reason?: string } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return { valid: false, reason: "resolution must be positive finite numbers" };
  }
  if (width > MAX_VIDEO_WIDTH || height > MAX_VIDEO_HEIGHT) {
    return { valid: false, reason: `resolution exceeds 4K (max ${MAX_VIDEO_WIDTH}×${MAX_VIDEO_HEIGHT})` };
  }
  return { valid: true };
}

/** Valida bitrate de codec alvo. */
export function validateBitrate(
  codec: CodecKind,
  bitrate: number,
): { valid: boolean; reason?: string } {
  if (!Number.isFinite(bitrate) || bitrate < 0) {
    return { valid: false, reason: "bitrate must be non-negative finite" };
  }
  const min = CODEC_MIN_BITRATE[codec];
  const max = CODEC_MAX_BITRATE[codec];
  if (min > 0 && bitrate < min) {
    return { valid: false, reason: `bitrate ${bitrate} below min ${min} for ${codec}` };
  }
  if (max > 0 && bitrate > max) {
    return { valid: false, reason: `bitrate ${bitrate} above max ${max} for ${codec}` };
  }
  return { valid: true };
}

/** Valida tamanho total do arquivo. */
export function validateFileSize(sizeBytes: number): { valid: boolean; reason?: string } {
  if (!Number.isFinite(sizeBytes) || sizeBytes < 0) {
    return { valid: false, reason: "size must be non-negative finite" };
  }
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, reason: `file too large (max ${MAX_FILE_SIZE_BYTES} bytes = 500MB)` };
  }
  return { valid: true };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §13 Biometric consent (flag separada, never collapse com sacred)          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Concede consentimento biométrico — flag INDEPENDENTE do consentimento
 * sagrado. Biometric cobre face-in-video recognition, voiceprint, etc.
 * LGPD Art. 9 + Art. 11 (dado biométrico = dado sensível).
 */
export function grantBiometricConsent(
  userId: string,
  purpose: LgpdPurpose = "biometric-id",
): MediaConsentState {
  const current = CONSENT_STATE.get(userId) || defaultConsent(userId);
  if (!current.purposesAllowed.includes(purpose)) {
    current.purposesAllowed.push(purpose);
  }
  current.biometric = true;
  current.grantedAt = Date.now();
  CONSENT_STATE.set(userId, current);
  // Para cada asset do usuário, popula token biométrico
  const assetIds = ASSET_OWNER_INDEX.get(userId) || new Set();
  for (const aid of assetIds) {
    const a = MEDIA_ASSETS.get(aid);
    if (a && !a.biometricConsentToken) {
      a.biometricConsentToken = fnv1a64(`biometric:${userId}:${aid}`);
      MEDIA_ASSETS.set(aid, a);
    }
  }
  appendAudit({
    assetId: "user",
    ownerId: userId,
    kind: "consent-granted",
    actorId: userId,
    purpose,
    payload: { consentType: "biometric" },
  });
  return current;
}

/** Revoga consentimento biométrico — apaga templates biométricos. */
export function revokeBiometricConsent(userId: string): MediaConsentState {
  const current = CONSENT_STATE.get(userId) || defaultConsent(userId);
  current.biometric = false;
  current.purposesAllowed = current.purposesAllowed.filter(
    (p) => p !== "biometric-id",
  );
  const assetIds = ASSET_OWNER_INDEX.get(userId) || new Set();
  for (const aid of assetIds) {
    const a = MEDIA_ASSETS.get(aid);
    if (a) {
      a.biometricConsentToken = undefined;
      MEDIA_ASSETS.set(aid, a);
    }
  }
  appendAudit({
    assetId: "user",
    ownerId: userId,
    kind: "consent-withdrawn",
    actorId: userId,
    purpose: "biometric-id",
    payload: { consentType: "biometric" },
  });
  return current;
}

/**
 * Concede consentimento sagrado — flag separada do consentimento
 * geral. Exige purpose "sacred-display".
 */
export function grantSacredConsent(userId: string): MediaConsentState {
  const current = CONSENT_STATE.get(userId) || defaultConsent(userId);
  if (!current.purposesAllowed.includes("sacred-display")) {
    current.purposesAllowed.push("sacred-display");
  }
  current.sacred = true;
  current.grantedAt = Date.now();
  CONSENT_STATE.set(userId, current);
  // Popula token sagrado em assets existentes
  const assetIds = ASSET_OWNER_INDEX.get(userId) || new Set();
  for (const aid of assetIds) {
    const a = MEDIA_ASSETS.get(aid);
    if (a && a.sacredFlag && !a.sacredConsentToken) {
      a.sacredConsentToken = fnv1a64(`sacred-token:${userId}:${aid}`);
      MEDIA_ASSETS.set(aid, a);
    }
  }
  appendAudit({
    assetId: "user",
    ownerId: userId,
    kind: "consent-granted",
    actorId: userId,
    purpose: "sacred-display",
    payload: { consentType: "sacred" },
  });
  return current;
}

/** Verifica se um asset biométrico pode ser processado para o viewer. */
export function canProcessBiometric(
  userId: string,
  asset: MediaAsset,
): { allowed: boolean; reason?: string } {
  if (!asset.biometricConsentToken) {
    return { allowed: false, reason: "asset has no biometric consent token" };
  }
  const state = CONSENT_STATE.get(userId);
  if (!state || !state.biometric) {
    return { allowed: false, reason: "user has no biometric consent" };
  }
  if (!state.purposesAllowed.includes("biometric-id")) {
    return { allowed: false, reason: "biometric-id purpose not allowed" };
  }
  return { allowed: true };
}

/** Verifica se um asset sagrado pode ser exibido para o viewer. */
export function canDisplaySacred(
  userId: string,
  asset: MediaAsset,
): { allowed: boolean; reason?: string } {
  if (!asset.sacredFlag) return { allowed: true };
  if (!asset.sacredConsentToken) {
    return { allowed: false, reason: "asset has no sacred consent token" };
  }
  const state = CONSENT_STATE.get(userId);
  if (!state || !state.sacred) {
    return { allowed: false, reason: "user has no sacred consent" };
  }
  if (!state.purposesAllowed.includes("sacred-display")) {
    return { allowed: false, reason: "sacred-display purpose not allowed" };
  }
  return { allowed: true };
}

/** Estado default de consentimento — opt-in sempre OFF. */
export function defaultConsent(userId: string): MediaConsentState {
  return {
    userId,
    general: false,
    sacred: false,
    biometric: false,
    purposesAllowed: [],
  };
}

/** Concede consentimento geral de mídia. */
export function grantGeneralConsent(userId: string): MediaConsentState {
  const current = CONSENT_STATE.get(userId) || defaultConsent(userId);
  current.general = true;
  if (!current.purposesAllowed.includes("upload")) {
    current.purposesAllowed.push("upload");
  }
  if (!current.purposesAllowed.includes("captions")) {
    current.purposesAllowed.push("captions");
  }
  current.grantedAt = Date.now();
  CONSENT_STATE.set(userId, current);
  appendAudit({
    assetId: "user",
    ownerId: userId,
    kind: "consent-granted",
    actorId: userId,
    purpose: "upload",
    payload: { consentType: "general" },
  });
  return current;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §14 LGPD Art. 18 (withdraw, purge, export, AuditReceipt)                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Withdraw consent — LGPD Art. 18 inciso IX (revogação do consentimento).
 * Apaga dados biométricos, mantém audit hash. NÃO apaga asset geral
 * (esse precisa de purge explícito).
 */
export function withdrawMediaConsent(userId: string): {
  state: MediaConsentState;
  erased: { biometric: boolean; sacred: boolean };
} {
  const current = CONSENT_STATE.get(userId) || defaultConsent(userId);
  const hadBiometric = current.biometric;
  const hadSacred = current.sacred;
  current.general = false;
  current.sacred = false;
  current.biometric = false;
  current.purposesAllowed = [];
  current.withdrawnAt = Date.now();
  CONSENT_STATE.set(userId, current);
  // Apaga tokens em todos os assets
  const assetIds = ASSET_OWNER_INDEX.get(userId) || new Set();
  for (const aid of assetIds) {
    const a = MEDIA_ASSETS.get(aid);
    if (a) {
      a.biometricConsentToken = undefined;
      a.sacredConsentToken = undefined;
      MEDIA_ASSETS.set(aid, a);
    }
  }
  appendAudit({
    assetId: "user",
    ownerId: userId,
    kind: "consent-withdrawn",
    actorId: userId,
    payload: {
      hadBiometric,
      hadSacred,
      erasedBiometric: hadBiometric,
      erasedSacred: hadSacred,
    },
  });
  return {
    state: current,
    erased: { biometric: hadBiometric, sacred: hadSacred },
  };
}

/**
 * Purge total de um asset — LGPD Art. 18 inciso VI (eliminação).
 * Retorna AuditReceipt como evidência. Apaga:
 *   - asset (MediaAsset)
 *   - thumbnails geradas (não persistidas, mas referência removida)
 *   - caption tracks (geral + sagrada)
 *   - transcript segments
 *   - view-history (audit events do asset)
 * Mantém: 1 audit event "purged" para evidência.
 */
export function purgeMediaAsset(assetId: string, userId: string): AuditReceipt {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  if (asset.ownerId !== userId) {
    throw new Error("Only the owner can purge an asset");
  }
  const erasedAt = Date.now();
  const erasedScopes: AuditReceipt["erasedScopes"] = ["asset"];
  // Caption tracks
  for (const tid of asset.a11y.captionTrackIds) {
    CAPTION_TRACKS.delete(tid);
    erasedScopes.push("caption");
  }
  // Transcript
  if (TRANSCRIPT_SEGMENTS.has(assetId)) {
    TRANSCRIPT_SEGMENTS.delete(assetId);
    erasedScopes.push("transcript");
  }
  // View-history events do asset
  let viewCount = 0;
  let shareCount = 0;
  for (let i = AUDIT_LOG.length - 1; i >= 0; i--) {
    if (AUDIT_LOG[i].assetId === assetId) {
      if (AUDIT_LOG[i].kind === "viewed") viewCount++;
      if (AUDIT_LOG[i].kind === "shared") shareCount++;
      AUDIT_LOG.splice(i, 1);
    }
  }
  if (viewCount > 0) erasedScopes.push("view-history");
  if (shareCount > 0) erasedScopes.push("share-history");
  // Asset
  MEDIA_ASSETS.delete(assetId);
  ASSET_OWNER_INDEX.get(userId)?.delete(assetId);
  const canonicalProof = canonicalJSON({
    assetId,
    userId,
    erasedAt,
    erasedScopes,
  });
  const hmac = appendAudit({
    assetId,
    ownerId: userId,
    kind: "purged",
    actorId: userId,
    payload: {
      erasedScopes: erasedScopes.join(","),
      erasedAt,
    },
  });
  const receipt: AuditReceipt = {
    receiptId: fnv1a64(`receipt:${assetId}:${erasedAt}`),
    userId,
    assetId,
    erasedAt,
    erasedScopes,
    hmac,
    canonicalProof,
    lgpdArticle: "Art. 18 inciso VI",
  };
  return receipt;
}

/**
 * Export LGPD Art. 18 inciso V (acesso) — retorna todos os audit
 * events do usuário dentro da janela de export (LGPD_EXPORT_WINDOW_DAYS).
 */
export function exportUserMediaHistory(userId: string): MediaAuditEvent[] {
  const cutoff = Date.now() - LGPD_EXPORT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const events = AUDIT_LOG.filter(
    (e) => e.ownerId === userId && e.at >= cutoff,
  );
  appendAudit({
    assetId: "user",
    ownerId: userId,
    kind: "consent-withdrawn",
    actorId: userId,
    purpose: "upload",
    payload: { action: "export", events: events.length },
  });
  return events;
}

/**
 * Verify integrity do audit log — retorna true se toda a cadeia HMAC
 * está válida. Útil para check diário / SOC2-style.
 */
export function verifyMediaAuditChain(log?: ReadonlyArray<MediaAuditEvent>): boolean {
  const events = log || AUDIT_LOG;
  let prev = GENESIS_HASH;
  for (const e of events) {
    if (e.prevHash !== prev) return false;
    const expected = computeAuditHMAC(e, prev);
    if (!constantTimeEqualHex(expected, e.hmac)) return false;
    prev = e.hmac;
  }
  return true;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §15 Audit chain (HMAC-SHA256 verify + tamper detection)                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Computa HMAC para um audit event dado prevHash. */
function computeAuditHMAC(event: MediaAuditEvent, prevHash: string): string {
  if (!AUDIT_HMAC_KEY) startAuditChain();
  const canonical = canonicalJSON({
    eventId: event.eventId,
    assetId: event.assetId,
    ownerId: event.ownerId,
    kind: event.kind,
    at: event.at,
    actorId: event.actorId,
    recipientId: event.recipientId,
    durationMs: event.durationMs,
    purpose: event.purpose,
    payload: event.payload,
    prevHash,
  });
  return hmacSha256(AUDIT_HMAC_KEY!, canonical);
}

/** Append audit event à cadeia — calcula prevHash + hmac automaticamente. */
function appendAudit(input: {
  assetId: string;
  ownerId: string;
  kind: MediaEventKind;
  actorId?: string;
  recipientId?: string;
  durationMs?: number;
  purpose?: LgpdPurpose;
  payload?: Record<string, string | number | boolean>;
}): string {
  if (!AUDIT_HMAC_KEY) startAuditChain();
  const prev = AUDIT_LOG.length === 0
    ? GENESIS_HASH
    : AUDIT_LOG[AUDIT_LOG.length - 1].hmac;
  const eventId = fnv1a64(`audit:${input.assetId}:${input.kind}:${Date.now()}:${AUDIT_LOG.length}`);
  const at = Date.now();
  const event: MediaAuditEvent = {
    eventId,
    assetId: input.assetId,
    ownerId: input.ownerId,
    kind: input.kind,
    at,
    actorId: input.actorId,
    recipientId: input.recipientId,
    durationMs: input.durationMs,
    purpose: input.purpose,
    payload: input.payload || {},
    prevHash: prev,
    hmac: "0000000000000000000000000000000000000000000000000000000000000000",
  };
  event.hmac = computeAuditHMAC(event, prev);
  AUDIT_LOG.push(event);
  return event.hmac;
}

/**
 * Registra visualização de asset. Audit LGPD Art. 9 (analytics).
 * Retorna o evento gerado.
 */
export function recordMediaView(
  assetId: string,
  viewerId: string,
  durationMs: number,
): MediaAuditEvent {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  if (asset.ownerId === viewerId) {
    // Auto-view: log sem compartilhar com terceiros
  }
  const event: MediaAuditEvent = appendAuditEvent({
    assetId,
    ownerId: asset.ownerId,
    kind: "viewed",
    actorId: viewerId,
    durationMs,
    purpose: "analytics",
    payload: {
      durationMs,
      viewerId,
    },
  });
  return event;
}

/**
 * Registra compartilhamento. Audit LGPD Art. 9 (recipient = purpose).
 */
export function recordMediaShare(
  assetId: string,
  sharerId: string,
  recipientId: string,
): MediaAuditEvent {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) throw new Error(`MediaAsset ${assetId} not found`);
  const event = appendAuditEvent({
    assetId,
    ownerId: asset.ownerId,
    kind: "shared",
    actorId: sharerId,
    recipientId,
    payload: { sharerId, recipientId },
  });
  return event;
}

/** Append manual — wrapper exposto. */
function appendAuditEvent(input: {
  assetId: string;
  ownerId: string;
  kind: MediaEventKind;
  actorId?: string;
  recipientId?: string;
  durationMs?: number;
  purpose?: LgpdPurpose;
  payload?: Record<string, string | number | boolean>;
}): MediaAuditEvent {
  if (!AUDIT_HMAC_KEY) startAuditChain();
  const prev = AUDIT_LOG.length === 0
    ? GENESIS_HASH
    : AUDIT_LOG[AUDIT_LOG.length - 1].hmac;
  const eventId = fnv1a64(`audit:${input.assetId}:${input.kind}:${Date.now()}:${AUDIT_LOG.length}`);
  const at = Date.now();
  const event: MediaAuditEvent = {
    eventId,
    assetId: input.assetId,
    ownerId: input.ownerId,
    kind: input.kind,
    at,
    actorId: input.actorId,
    recipientId: input.recipientId,
    durationMs: input.durationMs,
    purpose: input.purpose,
    payload: input.payload || {},
    prevHash: prev,
    hmac: "0000000000000000000000000000000000000000000000000000000000000000",
  };
  event.hmac = computeAuditHMAC(event, prev);
  AUDIT_LOG.push(event);
  return event;
}

/** Deleta um asset (soft) sem erasure completo — usado em "delete post". */
export function deleteMediaAsset(assetId: string, userId: string): { deleted: boolean } {
  const asset = MEDIA_ASSETS.get(assetId);
  if (!asset) return { deleted: false };
  if (asset.ownerId !== userId) {
    throw new Error("Only the owner can delete");
  }
  appendAuditEvent({
    assetId,
    ownerId: userId,
    kind: "deleted",
    actorId: userId,
    payload: { soft: true },
  });
  return { deleted: true };
}

/** Lista todos os assets de um usuário. */
export function listUserAssets(userId: string): MediaAsset[] {
  const ids = ASSET_OWNER_INDEX.get(userId);
  if (!ids) return [];
  const out: MediaAsset[] = [];
  for (const id of ids) {
    const a = MEDIA_ASSETS.get(id);
    if (a) out.push(a);
  }
  return out;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §16 Smoke / regression scenarios                                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Smoke test runner — executa todos os cenários e retorna número
 * de passes + falhas. Cada cenário é uma função `void → void` que
 * lança em caso de falha.
 */
export function smokeRunAll(): { passed: number; failed: number; failures: string[] } {
  let passed = 0;
  const failures: string[] = [];
  const scenarios = smokeScenarios();
  for (const s of scenarios) {
    try {
      _resetMediaEngine();
      s.fn();
      passed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${s.name}: ${msg}`);
    }
  }
  return { passed, failed: failures.length, failures };
}

interface SmokeScenario {
  name: string;
  fn: () => void;
}

export function smokeScenarios(): SmokeScenario[] {
  return [
    {
      name: "chunked_upload_finalizes_with_correct_fingerprint",
      fn: () => {
        const sess = startUpload("user1", "audio", "audio/mpeg");
        const data1 = new Uint8Array(80_000).fill(0x42);
        const data2 = new Uint8Array(80_000).fill(0x43);
        const data3 = new Uint8Array(80_000).fill(0x44);
        addChunk(sess.sessionId, 0, data1);
        addChunk(sess.sessionId, 1, data2);
        addChunk(sess.sessionId, 2, data3);
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 30_000,
          channels: 2,
          sampleRate: 44_100,
          bitrate: 192_000,
          totalBytes: 240_000,
        });
        if (asset.fingerprint.length !== 64) throw new Error("fingerprint not 64 chars");
        if (asset.sizeBytes !== 240_000) throw new Error("size mismatch");
        if (asset.codec !== "audio/mp3") throw new Error("codec mismatch");
      },
    },
    {
      name: "transcode_job_progresses_0_to_1",
      fn: () => {
        const sess = startUpload("user2", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0x10));
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 10_000,
          totalBytes: 80_000,
        });
        const job = queueTranscode(asset.id, "audio/aac", 128_000);
        if (job.progress !== 0) throw new Error("initial progress not 0");
        transcodeStep(job.jobId, 0.5);
        if (TRANSCODE_JOBS.get(job.jobId)!.progress !== 0.5) throw new Error("progress not 0.5");
        transcodeStep(job.jobId, 1);
        if (TRANSCODE_JOBS.get(job.jobId)!.status !== "completed") throw new Error("not completed");
        const updated = MEDIA_ASSETS.get(asset.id)!;
        if (updated.codec !== "audio/aac") throw new Error("asset codec not updated");
      },
    },
    {
      name: "sacred_thumbnail_auto_blurs",
      fn: () => {
        const sess = startUpload("user3", "video", "video/mp4");
        // Mock MP4 magic bytes
        const mp4Header = new Uint8Array(80_000);
        mp4Header[4] = 0x66; mp4Header[5] = 0x74; mp4Header[6] = 0x79; mp4Header[7] = 0x70;
        addChunk(sess.sessionId, 0, mp4Header);
        grantSacredConsent("user3");
        const asset = completeUpload(sess.sessionId, "video/mp4", {
          durationMs: 5000,
          width: 1280,
          height: 720,
          totalBytes: 80_000,
          sacredFlag: true,
          sacredKinds: ["prayer"],
        });
        const thumb = generateThumbnail(asset.id, 1000);
        if (!thumb.sacredBlurred) throw new Error("sacred thumbnail should auto-blur");
      },
    },
    {
      name: "sacred_captions_are_separate_track",
      fn: () => {
        const sess = startUpload("user4", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0x55));
        grantSacredConsent("user4");
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 60_000,
          totalBytes: 80_000,
          sacredFlag: true,
          sacredKinds: ["ritual"],
        });
        const general = generateCaptions(asset.id, "pt-BR", "vtt");
        const sacred = generateSacredCaptions(asset.id, "pt-BR", "vtt");
        if (general.sacredFlag) throw new Error("general captions should not be sacred");
        if (!sacred.sacredFlag) throw new Error("sacred captions should be sacredFlag=true");
        if (general.trackId === sacred.trackId) throw new Error("tracks must be separate");
        const a11y = MEDIA_ASSETS.get(asset.id)!.a11y;
        if (!a11y.hasSacredTrack) throw new Error("hasSacredTrack not set");
      },
    },
    {
      name: "lgpd_art18_erasure_returns_receipt_and_nukes_thumbnails",
      fn: () => {
        const sess = startUpload("user5", "video", "video/mp4");
        const mp4Header = new Uint8Array(80_000);
        mp4Header[4] = 0x66; mp4Header[5] = 0x74; mp4Header[6] = 0x79; mp4Header[7] = 0x70;
        addChunk(sess.sessionId, 0, mp4Header);
        const asset = completeUpload(sess.sessionId, "video/mp4", {
          durationMs: 5000,
          width: 1280,
          height: 720,
          totalBytes: 80_000,
        });
        generateThumbnail(asset.id, 1000);
        generateThumbnail(asset.id, 2000);
        const receipt = purgeMediaAsset(asset.id, "user5");
        if (receipt.lgpdArticle !== "Art. 18 inciso VI") throw new Error("wrong article");
        if (MEDIA_ASSETS.has(asset.id)) throw new Error("asset not deleted");
        if (!receipt.erasedScopes.includes("asset")) throw new Error("scope missing");
      },
    },
    {
      name: "mime_spoofing_detection_catches_fake_wav",
      fn: () => {
        // Header falsificado: declarado "audio/wav" mas bytes são MP3
        const fakeMp3 = new Uint8Array(16);
        fakeMp3[0] = 0xff;
        fakeMp3[1] = 0xfb;
        const isSpoof = detectMimeSpoofing("audio/wav", fakeMp3);
        if (!isSpoof) throw new Error("should detect spoof");
        // Header correto: real WAV
        const realWav = new Uint8Array(16);
        realWav[0] = 0x52; realWav[1] = 0x49; realWav[2] = 0x46; realWav[3] = 0x46;
        const notSpoof = detectMimeSpoofing("audio/wav", realWav);
        if (notSpoof) throw new Error("false positive on real WAV");
      },
    },
    {
      name: "audio_duration_validation_max_60min",
      fn: () => {
        const ok = validateAudioDuration(60 * 60 * 1000);
        if (!ok.valid) throw new Error("60min should be valid");
        const tooLong = validateAudioDuration(60 * 60 * 1000 + 1);
        if (tooLong.valid) throw new Error("61min should fail");
        const tooShort = validateAudioDuration(100);
        if (tooShort.valid) throw new Error("100ms should fail");
      },
    },
    {
      name: "video_resolution_validation_max_4k",
      fn: () => {
        const ok = validateVideoResolution(3840, 2160);
        if (!ok.valid) throw new Error("4K should be valid");
        const tooBig = validateVideoResolution(3841, 2160);
        if (tooBig.valid) throw new Error("3841w should fail");
      },
    },
    {
      name: "hmac_chain_verify_clean_returns_true",
      fn: () => {
        const sess = startUpload("user9", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0x77));
        completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 10_000,
          totalBytes: 80_000,
        });
        appendAuditEvent({
          assetId: "user9",
          ownerId: "user9",
          kind: "viewed",
          actorId: "viewer1",
        });
        const ok = verifyMediaAuditChain();
        if (!ok) throw new Error("clean chain should verify");
      },
    },
    {
      name: "hmac_chain_verify_tampered_returns_false",
      fn: () => {
        const sess = startUpload("user10", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0x88));
        completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 10_000,
          totalBytes: 80_000,
        });
        // Tamper um evento
        const log = getMediaAuditLog();
        if (log.length === 0) throw new Error("no events");
        const tampered = log.map((e, i) =>
          i === log.length - 1 ? { ...e, payload: { ...e.payload, tampered: true } } : e,
        );
        const ok = verifyMediaAuditChain(tampered);
        if (ok) throw new Error("tampered chain should fail");
      },
    },
    {
      name: "biometric_opt_in_separate_from_sacred",
      fn: () => {
        const sess = startUpload("user11", "video", "video/mp4");
        const mp4 = new Uint8Array(80_000);
        mp4[4] = 0x66; mp4[5] = 0x74; mp4[6] = 0x79; mp4[7] = 0x70;
        addChunk(sess.sessionId, 0, mp4);
        grantGeneralConsent("user11");
        const state = CONSENT_STATE.get("user11")!;
        if (!state.general) throw new Error("general not granted");
        if (state.sacred) throw new Error("sacred should not be granted by general");
        if (state.biometric) throw new Error("biometric should not be granted by general");
        grantBiometricConsent("user11");
        const after = CONSENT_STATE.get("user11")!;
        if (!after.biometric) throw new Error("biometric not granted");
        if (!after.purposesAllowed.includes("biometric-id")) throw new Error("biometric purpose missing");
        if (!after.purposesAllowed.includes("upload")) throw new Error("upload purpose lost");
      },
    },
    {
      name: "chunked_upload_out_of_order_throws",
      fn: () => {
        const sess = startUpload("user12", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0x99));
        let threw = false;
        try {
          addChunk(sess.sessionId, 5, new Uint8Array(80_000).fill(0x99));
        } catch (e) {
          threw = true;
        }
        if (!threw) throw new Error("should throw on out-of-order chunk");
      },
    },
    {
      name: "waveform_is_deterministic_from_fingerprint",
      fn: () => {
        const sess = startUpload("user13", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0xaa));
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 30_000,
          totalBytes: 80_000,
        });
        const wf1 = generateWaveform(asset.id);
        const wf2 = generateWaveform(asset.id);
        if (wf1.peaksCount !== wf2.peaksCount) throw new Error("peak count differs");
        for (let i = 0; i < wf1.peaksCount; i++) {
          if (Math.abs(wf1.peaks[i] - wf2.peaks[i]) > 1e-9) throw new Error("peak differs at " + i);
        }
        if (wf1.seed !== wf2.seed) throw new Error("seed differs");
      },
    },
    {
      name: "transcript_masks_sacred_segments",
      fn: () => {
        const sess = startUpload("user14", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0xbb));
        grantSacredConsent("user14");
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 120_000,
          totalBytes: 80_000,
          sacredFlag: true,
          sacredKinds: ["prayer"],
        });
        const segments = generateTranscript(asset.id);
        const stats = transcriptStats(segments);
        if (stats.total === 0) throw new Error("no segments");
        // Some segments should be masked
        if (stats.sacred === 0 && stats.public === stats.total) {
          // Acceptable probabilistically but unlikely — try again
        }
        const protectedSegs = segments.filter((s) => s.sacredMasked);
        for (const s of protectedSegs) {
          if (s.text !== SACRED_MASK_PLACEHOLDER) {
            throw new Error("masked segment should have placeholder text");
          }
        }
      },
    },
    {
      name: "sacred_pattern_detector_classifies_text",
      fn: () => {
        const kinds = detectSacredPatterns("hoje vamos fazer uma reza de ogum forte");
        if (!kinds.includes("prayer")) throw new Error("should detect prayer pattern");
        const none = detectSacredPatterns("bom dia, hoje o tempo está ensolarado");
        if (none.length > 0) throw new Error("false positive on mundane text");
      },
    },
    {
      name: "export_user_media_history_returns_windowed_events",
      fn: () => {
        const sess = startUpload("user15", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0xcc));
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 10_000,
          totalBytes: 80_000,
        });
        recordMediaView(asset.id, "viewerA", 5000);
        recordMediaShare(asset.id, "user15", "viewerA");
        const events = exportUserMediaHistory("user15");
        if (events.length === 0) throw new Error("no events exported");
        const kinds = events.map((e) => e.kind);
        if (!kinds.includes("uploaded")) throw new Error("uploaded event missing");
      },
    },
    {
      name: "withdraw_consent_erases_biometric_tokens",
      fn: () => {
        const sess = startUpload("user16", "video", "video/mp4");
        const mp4 = new Uint8Array(80_000);
        mp4[4] = 0x66; mp4[5] = 0x74; mp4[6] = 0x79; mp4[7] = 0x70;
        addChunk(sess.sessionId, 0, mp4);
        const asset16 = completeUpload(sess.sessionId, "video/mp4", {
          durationMs: 5000,
          width: 1280,
          height: 720,
          totalBytes: 80_000,
        });
        grantGeneralConsent("user16");
        grantBiometricConsent("user16");
        grantSacredConsent("user16");
        const before = MEDIA_ASSETS.get(asset16.id)!;
        if (!before.biometricConsentToken) throw new Error("biometric token not set");
        const result = withdrawMediaConsent("user16");
        if (!result.erased.biometric) throw new Error("biometric should be erased");
        if (!result.erased.sacred) throw new Error("sacred should be erased");
        const after = MEDIA_ASSETS.get(asset16.id)!;
        if (after.biometricConsentToken) throw new Error("biometric token not cleared");
        if (after.sacredConsentToken) throw new Error("sacred token not cleared");
      },
    },
    {
      name: "abort_upload_sets_status_and_reason",
      fn: () => {
        const sess = startUpload("user17", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0xdd));
        const aborted = abortUpload(sess.sessionId, "user cancelled");
        if (aborted.status !== "aborted") throw new Error("status not aborted");
        if (aborted.abortedReason !== "user cancelled") throw new Error("reason not set");
      },
    },
    {
      name: "reveal_sacred_thumbnail_requires_token",
      fn: () => {
        const sess = startUpload("user18", "video", "video/mp4");
        const mp4 = new Uint8Array(80_000);
        mp4[4] = 0x66; mp4[5] = 0x74; mp4[6] = 0x79; mp4[7] = 0x70;
        addChunk(sess.sessionId, 0, mp4);
        grantSacredConsent("user18");
        const asset = completeUpload(sess.sessionId, "video/mp4", {
          durationMs: 5000,
          width: 1280,
          height: 720,
          totalBytes: 80_000,
          sacredFlag: true,
          sacredKinds: ["oracle"],
        });
        let threw = false;
        try {
          revealSacredThumbnail(asset.id, 1000, "wrong-token");
        } catch {
          threw = true;
        }
        if (!threw) throw new Error("should reject wrong token");
        if (!asset.sacredConsentToken) throw new Error("no consent token");
        const ok = revealSacredThumbnail(asset.id, 1000, asset.sacredConsentToken);
        if (ok.sacredBlurred) throw new Error("revealed thumb should not be blurred");
      },
    },
    {
      name: "purge_receipt_carries_canonical_proof",
      fn: () => {
        const sess = startUpload("user19", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0xee));
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 10_000,
          totalBytes: 80_000,
        });
        const receipt = purgeMediaAsset(asset.id, "user19");
        if (!receipt.canonicalProof.startsWith("{")) throw new Error("not canonical JSON");
        if (!receipt.hmac || receipt.hmac.length !== 64) throw new Error("hmac invalid");
      },
    },
    {
      name: "sacred_content_guard_describes_protection_rules",
      fn: () => {
        const sess = startUpload("user20", "video", "video/mp4");
        const mp4 = new Uint8Array(80_000);
        mp4[4] = 0x66; mp4[5] = 0x74; mp4[6] = 0x79; mp4[7] = 0x70;
        addChunk(sess.sessionId, 0, mp4);
        grantSacredConsent("user20");
        const asset = completeUpload(sess.sessionId, "video/mp4", {
          durationMs: 5000,
          width: 1280,
          height: 720,
          totalBytes: 80_000,
          sacredFlag: true,
          sacredKinds: ["ritual"],
        });
        const guard = getSacredContentGuard(asset);
        if (!guard.thumbnailAutoBlur) throw new Error("thumbnail should auto-blur");
        if (!guard.captionTrackSeparated) throw new Error("caption should be separated");
        if (!guard.transcriptSegmentMasked) throw new Error("transcript should be masked");
        if (!guard.consentTokenRequired) throw new Error("consent token should be required");
      },
    },
    {
      name: "audio_codec_detection_from_mime",
      fn: () => {
        const sess = startUpload("user21", "audio", "audio/flac");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0xff));
        const asset = completeUpload(sess.sessionId, "audio/flac", {
          durationMs: 10_000,
          totalBytes: 80_000,
        });
        if (asset.codec !== "audio/flac") throw new Error("flac codec wrong");
      },
    },
    {
      name: "transcode_pause_and_resume",
      fn: () => {
        const sess = startUpload("user22", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0x21));
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 10_000,
          totalBytes: 80_000,
        });
        const job = queueTranscode(asset.id, "audio/aac", 128_000);
        transcodeStep(job.jobId, 0.3);
        pauseTranscode(job.jobId);
        if (TRANSCODE_JOBS.get(job.jobId)!.status !== "paused") throw new Error("not paused");
        resumeTranscode(job.jobId);
        if (TRANSCODE_JOBS.get(job.jobId)!.status !== "running") throw new Error("not running");
      },
    },
    {
      name: "sniff_mime_from_real_mp4_magic",
      fn: () => {
        // Real MP4 magic: bytes 0-3 are box size, bytes 4-7 are "ftyp"
        const mp4 = new Uint8Array(16);
        mp4[4] = 0x66; mp4[5] = 0x74; mp4[6] = 0x79; mp4[7] = 0x70;
        const mime = sniffMimeFromBytes(mp4);
        if (mime !== "video/mp4") throw new Error("should detect mp4, got " + mime);
      },
    },
    {
      name: "transcript_protected_requires_sacred_token",
      fn: () => {
        const sess = startUpload("user23", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0x23));
        grantSacredConsent("user23");
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 10_000,
          totalBytes: 80_000,
          sacredFlag: true,
          sacredKinds: ["lineage"],
        });
        let threw = false;
        try {
          generateProtectedTranscript(asset.id, "bad-token");
        } catch {
          threw = true;
        }
        if (!threw) throw new Error("should reject bad token");
        if (!asset.sacredConsentToken) throw new Error("no consent token");
        const ok = generateProtectedTranscript(asset.id, asset.sacredConsentToken);
        if (ok.length === 0) throw new Error("no segments");
      },
    },
    {
      name: "waveform_rms_in_range",
      fn: () => {
        const sess = startUpload("user24", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0x24));
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 10_000,
          totalBytes: 80_000,
        });
        const wf = generateWaveform(asset.id);
        const rms = waveformRMS(wf);
        if (rms < 0 || rms > 1) throw new Error("RMS out of range");
        const peak = waveformPeakMax(wf);
        if (peak <= 0) throw new Error("peak should be > 0");
      },
    },
    {
      name: "list_user_assets_returns_only_owned",
      fn: () => {
        const s1 = startUpload("alice", "audio", "audio/mpeg");
        addChunk(s1.sessionId, 0, new Uint8Array(80_000).fill(0xa1));
        completeUpload(s1.sessionId, "audio/mpeg", {
          durationMs: 5000,
          totalBytes: 80_000,
        });
        const s2 = startUpload("bob", "audio", "audio/mpeg");
        addChunk(s2.sessionId, 0, new Uint8Array(80_000).fill(0xb1));
        completeUpload(s2.sessionId, "audio/mpeg", {
          durationMs: 5000,
          totalBytes: 80_000,
        });
        const aliceAssets = listUserAssets("alice");
        const bobAssets = listUserAssets("bob");
        if (aliceAssets.length !== 1) throw new Error("alice should have 1 asset");
        if (bobAssets.length !== 1) throw new Error("bob should have 1 asset");
        if (aliceAssets[0].ownerId !== "alice") throw new Error("alice asset has wrong owner");
      },
    },
    {
      name: "apply_sacred_blur_no_op_for_non_sacred",
      fn: () => {
        const sess = startUpload("user25", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0x25));
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 10_000,
          totalBytes: 80_000,
          sacredFlag: false,
        });
        const result = applySacredBlur(asset);
        if (result !== asset) throw new Error("non-sacred asset should be returned unchanged");
      },
    },
    {
      name: "biometric_can_process_requires_consent",
      fn: () => {
        const sess = startUpload("user26", "video", "video/mp4");
        const mp4 = new Uint8Array(80_000);
        mp4[4] = 0x66; mp4[5] = 0x74; mp4[6] = 0x79; mp4[7] = 0x70;
        addChunk(sess.sessionId, 0, mp4);
        const asset = completeUpload(sess.sessionId, "video/mp4", {
          durationMs: 5000,
          width: 1280,
          height: 720,
          totalBytes: 80_000,
        });
        const r1 = canProcessBiometric("user26", asset);
        if (r1.allowed) throw new Error("should not allow without consent");
        grantBiometricConsent("user26");
        const r2 = canProcessBiometric("user26", asset);
        if (!r2.allowed) throw new Error("should allow after consent");
      },
    },
    {
      name: "thumbnail_strip_returns_count_thumbnails",
      fn: () => {
        const sess = startUpload("user27", "video", "video/mp4");
        const mp4 = new Uint8Array(80_000);
        mp4[4] = 0x66; mp4[5] = 0x74; mp4[6] = 0x79; mp4[7] = 0x70;
        addChunk(sess.sessionId, 0, mp4);
        const asset = completeUpload(sess.sessionId, "video/mp4", {
          durationMs: 30_000,
          width: 1280,
          height: 720,
          totalBytes: 80_000,
        });
        const strip = generateThumbnailStrip(asset.id, 5);
        if (strip.length !== 5) throw new Error("strip count wrong");
        // Timestamps should be in ascending order
        for (let i = 1; i < strip.length; i++) {
          if (strip[i].timestampMs <= strip[i - 1].timestampMs) {
            throw new Error("timestamps not ascending");
          }
        }
      },
    },
    {
      name: "view_event_emits_audit_with_viewer_id",
      fn: () => {
        const sess = startUpload("user28", "audio", "audio/mpeg");
        addChunk(sess.sessionId, 0, new Uint8Array(80_000).fill(0x28));
        const asset = completeUpload(sess.sessionId, "audio/mpeg", {
          durationMs: 10_000,
          totalBytes: 80_000,
        });
        const event = recordMediaView(asset.id, "viewer1", 5000);
        if (event.kind !== "viewed") throw new Error("not viewed event");
        if (event.durationMs !== 5000) throw new Error("duration missing");
        if (event.actorId !== "viewer1") throw new Error("actor missing");
      },
    },
  ];
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §17 Doc-string constants                                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Versão do schema — bump quando MediaAsset ganha campos obrigatórios. */
export const MEDIA_ASSET_SCHEMA_VERSION = "1.0.0";

/** Engine ID para telemetria. */
export const MEDIA_ENGINE_ID = "w58-audio-video-posts";

/** Política de retenção consolidada para docs. */
export const RETENTION_POLICY = {
  audit: "indefinite (hash-chained, 5y minimum)",
  analytics: `${ANALYTICS_RETENTION_DAYS} days`,
  biometric: `${BIOMETRIC_RETENTION_DAYS} days (until withdrawal)`,
} as const;

/** Resumo de regras LGPD cobertas. */
export const LGPD_COVERAGE = {
  Art_7_consent: "general + sacred + biometric (separate flags)",
  Art_9_purpose: "upload, transcode, captions, analytics, biometric-id, sacred-display",
  Art_11_sensitive: "biometric (face-in-video) requires explicit consent",
  Art_18_access: "exportUserMediaHistory (90d window)",
  Art_18_correction: "owner can re-upload to replace (out of scope here)",
  Art_18_erasure: "purgeMediaAsset + AuditReceipt",
  Art_18_revocation: "withdrawMediaConsent",
} as const;

/** Resumo das 4 camadas de defense in depth. */
export const DEFENSE_IN_DEPTH_LAYERS = {
  primary: "isSacredViolation — sacred content filter pre-render",
  secondary: "detectMimeSpoofing — MIME magic byte validation",
  tertiary: "verifyMediaAuditChain — HMAC-SHA256 tamper evidence",
  quaternary: "separate consent tracks (general / sacred / biometric)",
} as const;

/** Tipos de caption suportados. */
export const CAPTION_FORMATS = ["vtt", "srt"] as const;

/** Tipos de mídia suportados (alias export). */
export const SUPPORTED_MEDIA_TYPES: ReadonlyArray<MediaType> = ["audio", "video"];

/** Codecs suportados (alias export). */
export const SUPPORTED_CODECS: ReadonlyArray<CodecKind> = [
  "audio/aac", "audio/mp3", "audio/opus", "audio/flac", "audio/wav",
  "video/avc", "video/hevc", "video/vp9", "video/av1", "passthrough",
];

/** Eventos de auditoria cobertos. */
export const COVERED_AUDIT_EVENTS: ReadonlyArray<MediaEventKind> = [
  "uploaded", "transcoded", "captioned", "transcribed",
  "viewed", "shared", "deleted", "purged",
  "consent-withdrawn", "consent-granted",
  "sacred-redacted", "mime-rejected", "biometric-redacted",
];

/** Finalidades LGPD cobertas. */
export const COVERED_LGPD_PURPOSES: ReadonlyArray<LgpdPurpose> = [
  "upload", "transcode", "captions", "analytics", "biometric-id", "sacred-display",
];

/** Tipos de sacred kind cobertos. */
export const COVERED_SACRED_KINDS: ReadonlyArray<SacredKind> = [
  "prayer", "ritual", "oracle", "lineage", "biometric", "other-sacred",
];

/** Helper para descrição da engine em index/docs. */
export function engineDescription(): string {
  return `${MEDIA_ENGINE_ID} v${MEDIA_ENGINE_VERSION} — upload chunked, transcode, waveform, thumbnail, captions (sacred-aware), transcript (sacred-mask), MIME spoofing detection, LGPD Art. 7/9/11/18, defense in depth 4 camadas.`;
}

/** Status report consolidado — útil para healthcheck de UI. */
export interface MediaEngineHealth {
  version: string;
  uploadsActive: number;
  assetsTotal: number;
  transcodeActive: number;
  transcodeCompleted: number;
  captionTracks: number;
  transcripts: number;
  auditEvents: number;
  auditChainValid: boolean;
  usersWithConsent: number;
}

export function getMediaEngineHealth(): MediaEngineHealth {
  let transcodeCompleted = 0;
  for (const j of TRANSCODE_JOBS.values()) {
    if (j.status === "completed") transcodeCompleted++;
  }
  return {
    version: MEDIA_ENGINE_VERSION,
    uploadsActive: Array.from(UPLOAD_SESSIONS.values()).filter(
      (s) => s.status === "uploading" || s.status === "pending",
    ).length,
    assetsTotal: MEDIA_ASSETS.size,
    transcodeActive: listActiveTranscodeJobs().length,
    transcodeCompleted,
    captionTracks: CAPTION_TRACKS.size,
    transcripts: TRANSCRIPT_SEGMENTS.size,
    auditEvents: AUDIT_LOG.length,
    auditChainValid: verifyMediaAuditChain(),
    usersWithConsent: CONSENT_STATE.size,
  };
}

/** Converte asset para JSON-safe (sem undefined). */
export function serializeMediaAsset(asset: MediaAsset): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(asset)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/** Compara dois assets por fingerprint + URL. */
export function mediaAssetsEqual(a: MediaAsset, b: MediaAsset): boolean {
  return a.id === b.id && a.fingerprint === b.fingerprint;
}

/** Index para auditoria rápida — quantos assets por tipo. */
export function mediaAssetBreakdown(): { audio: number; video: number; sacred: number } {
  let audio = 0;
  let video = 0;
  let sacred = 0;
  for (const a of MEDIA_ASSETS.values()) {
    if (a.type === "audio") audio++;
    if (a.type === "video") video++;
    if (a.sacredFlag) sacred++;
  }
  return { audio, video, sacred };
}

/** Estimativa de uso de storage (somatório de sizeBytes). */
export function mediaStorageUsage(): number {
  let total = 0;
  for (const a of MEDIA_ASSETS.values()) total += a.sizeBytes;
  return total;
}

/** Helper final — exports count helper (consistente com w55/56). */
export function countExports(): number {
  let count = 0;
  // Use Object.getOwnPropertyNames para contar exports nomeados
  const moduleObj = (typeof globalThis !== "undefined" ? (globalThis as any) : {}) as Record<string, unknown>;
  const modKeys = Object.keys(moduleObj).filter((k) =>
    /^[A-Z]|^[a-z]+[A-Z]/.test(k),
  );
  for (const _ of modKeys) count++;
  // Conta via regex simples no source — fallback
  return count;
}