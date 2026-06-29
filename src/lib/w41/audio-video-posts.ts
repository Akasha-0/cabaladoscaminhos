/**
 * audio-video-posts.ts — Post creation with audio/video media.
 *
 * Integra com:
 *  - w24/audio-video-uploader (recebe uploads crus e valida MIME/duração)
 *  - w26/audio-post-handler  (pipeline legado de post em áudio)
 *  - w33/audio-video-recording (gravações in-app e chunking)
 *  - w35/live-transcription  (legendas VTT/SRT ao vivo)
 *  - w38/clips-v2            (extração de trechos a partir de capítulos)
 *  - w39/clip-moments        (highlight moments detectados automaticamente)
 *
 * Este módulo é puramente funcional e standalone — sem imports de outros w3x/w4x.
 * Toda mutação devolve um novo objeto (estilo Redux) para facilitar composição
 * com a UI Mesa Real do Cabala dos Caminhos.
 */

// =============================================================================
// Tipos públicos
// =============================================================================

/** Tipo de mídia: áudio ou vídeo. */
export type MediaKind = "audio" | "video";

/** Estado do ciclo de vida de um MediaAsset. */
export type MediaStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "failed"
  | "removed";

/** Formatos de container suportados (entrada e saída do transcode). */
export type MediaFormat =
  | "mp3"
  | "wav"
  | "m4a"
  | "ogg"
  | "mp4"
  | "webm"
  | "mov";

/** Metadados técnicos de áudio. */
export interface AudioMetadata {
  durationSec: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  codec: string;
  size: number;
}

/** Metadados técnicos de vídeo. */
export interface VideoMetadata {
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  size: number;
  hasAudio: boolean;
}

/** Recorte de capítulo dentro de um asset (TIPO capítulo, não clip). */
export interface MediaChapter {
  id: string;
  startSec: number;
  endSec: number;
  title: string;
  thumbnailUrl?: string;
}

/** Trecho extraído de um asset (TIPO clipe). */
export interface MediaClip {
  id: string;
  assetId: string;
  startSec: number;
  endSec: number;
  title: string;
  createdBy: string;
  createdAt: string;
}

/** Asset de mídia (áudio OU vídeo) com estado de processamento. */
export interface MediaAsset {
  id: string;
  userId: string;
  kind: MediaKind;
  originalUrl: string;
  transcodedUrls: Readonly<Record<MediaFormat, string>>;
  format: MediaFormat;
  status: MediaStatus;
  metadata: AudioMetadata | VideoMetadata;
  thumbnailUrl?: string;
  captionsUrl?: string;
  chapters?: ReadonlyArray<MediaChapter>;
  createdAt: string;
  updatedAt: string;
}

/** Status de um job de transcodificação. */
export type TranscodingStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

/** Job de transcodificação para um formato/bitrate alvo. */
export interface TranscodingJob {
  id: string;
  assetId: string;
  status: TranscodingStatus;
  progress: number;
  targetFormat: MediaFormat;
  targetBitrate: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

/** Sessão de playback por usuário. */
export interface PlaybackSession {
  id: string;
  userId: string;
  assetId: string;
  positionSec: number;
  totalSec: number;
  isPlaying: boolean;
  speed: number;
  volume: number;
  lastUpdatedAt: string;
}

/** Post com mídia(s) anexada(s). */
export interface PostWithMedia {
  postId: string;
  authorId: string;
  body: string;
  mediaIds: ReadonlyArray<string>;
  createdAt: string;
  visibility: "public" | "followers" | "private";
}

// =============================================================================
// Constantes
// =============================================================================

/** Tamanho máximo de áudio em MB (default). */
export const MAX_AUDIO_SIZE_MB = 100;

/** Tamanho máximo de vídeo em MB (default). */
export const MAX_VIDEO_SIZE_MB = 500;

/** Duração máxima de áudio em segundos (1h). */
export const MAX_AUDIO_DURATION_SEC = 3600;

/** Duração máxima de vídeo em segundos (2h). */
export const MAX_VIDEO_DURATION_SEC = 7200;

/** Cap de capítulos por asset. */
export const MAX_CHAPTERS_PER_ASSET = 50;

/** Cap de clips por asset. */
export const MAX_CLIPS_PER_ASSET = 30;

/** Bitrate padrão de áudio em kbps. */
export const DEFAULT_AUDIO_BITRATE_KBPS = 128;

/** Bitrate padrão de vídeo em kbps. */
export const DEFAULT_VIDEO_BITRATE_KBPS = 2500;

/** Formatos alvo de áudio (transcode). */
export const TARGET_AUDIO_FORMATS: ReadonlyArray<MediaFormat> = [
  "mp3",
  "ogg",
  "m4a",
];

/** Formatos alvo de vídeo (transcode). */
export const TARGET_VIDEO_FORMATS: ReadonlyArray<MediaFormat> = ["mp4", "webm"];

/** Estágios canônicos de progresso de transcodificação (%). */
export const TRANSCODING_PROGRESS_STAGES: ReadonlyArray<number> = [
  10, 30, 60, 90, 100,
];

/** Máximo de mídias anexadas a um único post. */
export const MAX_MEDIA_PER_POST = 4;

/** Velocidade padrão de playback. */
export const DEFAULT_PLAYBACK_SPEED = 1.0;

/** Velocidade mínima permitida. */
export const MIN_PLAYBACK_SPEED = 0.5;

/** Velocidade máxima permitida. */
export const MAX_PLAYBACK_SPEED = 2.0;

/** Limites de tamanho em bytes (derivados). */
export const MAX_AUDIO_SIZE_BYTES = MAX_AUDIO_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// =============================================================================
// Utilidades internas
// =============================================================================

/** Gera ID curto com prefixo. Não usa crypto — só pra fixtures/testes. */
function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}_${rand}`;
}

/** Clamp numérico genérico. */
function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Faz narração de tipo-narrow sem `any`. */
function isAudio(meta: AudioMetadata | VideoMetadata): meta is AudioMetadata {
  return (meta as AudioMetadata).bitrate !== undefined;
}

function isVideo(meta: AudioMetadata | VideoMetadata): meta is VideoMetadata {
  return (meta as VideoMetadata).width !== undefined;
}

/** Mapa vazio de transcodedUrls inicial. */
function emptyTranscodedMap(): Record<MediaFormat, string> {
  return {
    mp3: "",
    wav: "",
    m4a: "",
    ogg: "",
    mp4: "",
    webm: "",
    mov: "",
  };
}

// =============================================================================
// Validação de metadados
// =============================================================================

/**
 * Valida metadados de áudio retornando lista de erros.
 *
 * @example
 * validateAudioMetadata({
 *   durationSec: 60, bitrate: 128, sampleRate: 44100,
 *   channels: 2, codec: "aac", size: 1024 * 500
 * });
 */
export function validateAudioMetadata(meta: AudioMetadata): {
  ok: boolean;
  errors: ReadonlyArray<string>;
} {
  const errors: string[] = [];
  if (!meta || typeof meta !== "object") {
    return { ok: false, errors: ["metadata ausente ou inválida"] };
  }
  if (meta.durationSec <= 0) errors.push("durationSec deve ser > 0");
  if (meta.durationSec > MAX_AUDIO_DURATION_SEC) {
    errors.push(`durationSec excede ${MAX_AUDIO_DURATION_SEC}s`);
  }
  if (meta.bitrate <= 0) errors.push("bitrate deve ser > 0");
  if (meta.sampleRate <= 0) errors.push("sampleRate deve ser > 0");
  if (meta.channels < 1 || meta.channels > 8) {
    errors.push("channels fora da faixa [1,8]");
  }
  if (!meta.codec || meta.codec.trim().length === 0) {
    errors.push("codec obrigatório");
  }
  if (meta.size <= 0) errors.push("size deve ser > 0");
  if (meta.size > MAX_AUDIO_SIZE_BYTES) {
    errors.push(`size excede ${MAX_AUDIO_SIZE_MB}MB`);
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Valida metadados de vídeo retornando lista de erros.
 *
 * @example
 * validateVideoMetadata({
 *   durationSec: 600, width: 1920, height: 1080, fps: 30,
 *   codec: "h264", size: 1024 * 1024 * 50, hasAudio: true
 * });
 */
export function validateVideoMetadata(meta: VideoMetadata): {
  ok: boolean;
  errors: ReadonlyArray<string>;
} {
  const errors: string[] = [];
  if (!meta || typeof meta !== "object") {
    return { ok: false, errors: ["metadata ausente ou inválida"] };
  }
  if (meta.durationSec <= 0) errors.push("durationSec deve ser > 0");
  if (meta.durationSec > MAX_VIDEO_DURATION_SEC) {
    errors.push(`durationSec excede ${MAX_VIDEO_DURATION_SEC}s`);
  }
  if (meta.width < 1) errors.push("width deve ser >= 1");
  if (meta.height < 1) errors.push("height deve ser >= 1");
  if (meta.fps <= 0 || meta.fps > 240) {
    errors.push("fps fora da faixa (0, 240]");
  }
  if (!meta.codec || meta.codec.trim().length === 0) {
    errors.push("codec obrigatório");
  }
  if (meta.size <= 0) errors.push("size deve ser > 0");
  if (meta.size > MAX_VIDEO_SIZE_BYTES) {
    errors.push(`size excede ${MAX_VIDEO_SIZE_MB}MB`);
  }
  if (typeof meta.hasAudio !== "boolean") {
    errors.push("hasAudio deve ser boolean");
  }
  return { ok: errors.length === 0, errors };
}

// =============================================================================
// Criação de assets
// =============================================================================

/**
 * Cria um MediaAsset de áudio. Status inicial "uploading".
 */
export function createAudioAsset(
  userId: string,
  originalUrl: string,
  format: MediaFormat,
  metadata: AudioMetadata,
  now: string
): MediaAsset {
  if (!userId || userId.trim().length === 0) {
    throw new Error("userId obrigatório");
  }
  if (!originalUrl || originalUrl.trim().length === 0) {
    throw new Error("originalUrl obrigatório");
  }
  if (!isAudio(metadata)) {
    throw new Error("metadata não é AudioMetadata");
  }
  const id = newId("ast");
  return {
    id,
    userId,
    kind: "audio",
    originalUrl,
    transcodedUrls: emptyTranscodedMap(),
    format,
    status: "uploading",
    metadata,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Cria um MediaAsset de vídeo. Status inicial "uploading".
 */
export function createVideoAsset(
  userId: string,
  originalUrl: string,
  format: MediaFormat,
  metadata: VideoMetadata,
  now: string
): MediaAsset {
  if (!userId || userId.trim().length === 0) {
    throw new Error("userId obrigatório");
  }
  if (!originalUrl || originalUrl.trim().length === 0) {
    throw new Error("originalUrl obrigatório");
  }
  if (!isVideo(metadata)) {
    throw new Error("metadata não é VideoMetadata");
  }
  const id = newId("ast");
  return {
    id,
    userId,
    kind: "video",
    originalUrl,
    transcodedUrls: emptyTranscodedMap(),
    format,
    status: "uploading",
    metadata,
    createdAt: now,
    updatedAt: now,
  };
}

// =============================================================================
// Pipeline de transcodificação
// =============================================================================

/**
 * Enfileira um job de transcodificação. Status inicial "queued".
 */
export function enqueueTranscoding(
  assetId: string,
  targetFormat: MediaFormat,
  targetBitrate: number,
  now: string
): TranscodingJob {
  if (!assetId || assetId.trim().length === 0) {
    throw new Error("assetId obrigatório");
  }
  if (targetBitrate <= 0) {
    throw new Error("targetBitrate deve ser > 0");
  }
  return {
    id: newId("job"),
    assetId,
    status: "queued",
    progress: 0,
    targetFormat,
    targetBitrate,
    startedAt: now,
  };
}

/**
 * Avança o progresso de um job. Transições automáticas de status.
 * - 0 progress → status "running"
 * - progress >= 100 → não muda status (use completeTranscoding)
 */
export function advanceTranscodingProgress(
  job: TranscodingJob,
  progress: number,
  now: string
): TranscodingJob {
  const clamped = clamp(progress, 0, 100);
  let nextStatus: TranscodingStatus = job.status;
  if (job.status === "queued" && clamped > 0) {
    nextStatus = "running";
  }
  return {
    ...job,
    progress: clamped,
    status: nextStatus,
    startedAt: job.status === "queued" ? now : job.startedAt,
  };
}

/**
 * Marca transcodificação como completa e devolve job finalizado.
 */
export function completeTranscoding(
  job: TranscodingJob,
  transcodedUrl: string,
  now: string
): TranscodingJob {
  if (!transcodedUrl || transcodedUrl.trim().length === 0) {
    throw new Error("transcodedUrl obrigatório");
  }
  return {
    ...job,
    status: "completed",
    progress: 100,
    completedAt: now,
  };
}

/**
 * Marca transcodificação como falha com mensagem de erro.
 */
export function failTranscoding(
  job: TranscodingJob,
  error: string,
  now: string
): TranscodingJob {
  if (!error || error.trim().length === 0) {
    throw new Error("error obrigatório");
  }
  return {
    ...job,
    status: "failed",
    error,
    completedAt: now,
  };
}

/**
 * Seleciona formatos alvo de transcodificação por tipo de mídia.
 */
export function selectTargetFormats(
  kind: MediaKind
): ReadonlyArray<MediaFormat> {
  return kind === "audio" ? TARGET_AUDIO_FORMATS : TARGET_VIDEO_FORMATS;
}

// =============================================================================
// Capítulos
// =============================================================================

/**
 * Adiciona capítulo a um asset respeitando MAX_CHAPTERS_PER_ASSET.
 * Lista retornada é sempre ordenada por startSec.
 */
export function addChapter(
  asset: MediaAsset,
  chapter: MediaChapter
): MediaAsset {
  if (!chapter || !chapter.id) {
    throw new Error("chapter inválido");
  }
  if (chapter.startSec < 0 || chapter.endSec <= chapter.startSec) {
    throw new Error("intervalo de capítulo inválido");
  }
  const durationSec = asset.metadata.durationSec;
  if (chapter.endSec > durationSec) {
    throw new Error("capítulo ultrapassa duração do asset");
  }
  const existing: ReadonlyArray<MediaChapter> = asset.chapters ?? [];
  if (existing.length >= MAX_CHAPTERS_PER_ASSET) {
    throw new Error(`cap excedido (${MAX_CHAPTERS_PER_ASSET})`);
  }
  const next = [...existing, chapter].sort(
    (a, b) => a.startSec - b.startSec
  );
  return { ...asset, chapters: next, updatedAt: asset.updatedAt };
}

/**
 * Remove capítulo de um asset por id.
 */
export function removeChapter(
  asset: MediaAsset,
  chapterId: string
): MediaAsset {
  const existing: ReadonlyArray<MediaChapter> = asset.chapters ?? [];
  const filtered = existing.filter((c) => c.id !== chapterId);
  if (filtered.length === existing.length) {
    return asset; // idempotente
  }
  return { ...asset, chapters: filtered, updatedAt: asset.updatedAt };
}

// =============================================================================
// Clipes
// =============================================================================

/**
 * Cria um MediaClip. Valida end > start e janela dentro da duração.
 */
export function createClip(
  assetId: string,
  startSec: number,
  endSec: number,
  title: string,
  createdBy: string,
  now: string
): MediaClip {
  if (!assetId) throw new Error("assetId obrigatório");
  if (!createdBy) throw new Error("createdBy obrigatório");
  if (startSec < 0) throw new Error("startSec deve ser >= 0");
  if (endSec <= startSec) throw new Error("endSec deve ser > startSec");
  if (!title || title.trim().length === 0) {
    throw new Error("title obrigatório");
  }
  return {
    id: newId("clip"),
    assetId,
    startSec,
    endSec,
    title,
    createdBy,
    createdAt: now,
  };
}

// =============================================================================
// Playback sessions
// =============================================================================

/**
 * Inicia uma sessão de playback no início.
 */
export function startPlaybackSession(
  userId: string,
  assetId: string,
  now: string
): PlaybackSession {
  if (!userId) throw new Error("userId obrigatório");
  if (!assetId) throw new Error("assetId obrigatório");
  return {
    id: newId("ply"),
    userId,
    assetId,
    positionSec: 0,
    totalSec: 0,
    isPlaying: false,
    speed: DEFAULT_PLAYBACK_SPEED,
    volume: 1.0,
    lastUpdatedAt: now,
  };
}

/**
 * Atualiza posição de playback (em segundos).
 */
export function updatePlaybackPosition(
  session: PlaybackSession,
  positionSec: number,
  now: string
): PlaybackSession {
  const clamped = Math.max(0, positionSec);
  return {
    ...session,
    positionSec: clamped,
    lastUpdatedAt: now,
  };
}

/**
 * Liga/desliga o estado de play.
 */
export function togglePlayback(
  session: PlaybackSession,
  isPlaying: boolean,
  now: string
): PlaybackSession {
  return {
    ...session,
    isPlaying,
    lastUpdatedAt: now,
  };
}

/**
 * Define velocidade de playback com clamp em [0.5, 2.0].
 */
export function setPlaybackSpeed(
  session: PlaybackSession,
  speed: number
): PlaybackSession {
  const clamped = clamp(speed, MIN_PLAYBACK_SPEED, MAX_PLAYBACK_SPEED);
  return { ...session, speed: clamped };
}

/**
 * Define volume de playback com clamp em [0, 1].
 */
export function setPlaybackVolume(
  session: PlaybackSession,
  volume: number
): PlaybackSession {
  const clamped = clamp(volume, 0, 1);
  return { ...session, volume: clamped };
}

// =============================================================================
// Posts com mídia
// =============================================================================

/**
 * Cria um post com mídia(s) já anexada(s). Valida MAX_MEDIA_PER_POST.
 */
export function createPostWithMedia(
  authorId: string,
  body: string,
  mediaIds: ReadonlyArray<string>,
  now: string,
  visibility: "public" | "followers" | "private" = "public"
): PostWithMedia {
  if (!authorId) throw new Error("authorId obrigatório");
  if (mediaIds.length > MAX_MEDIA_PER_POST) {
    throw new Error(`máximo ${MAX_MEDIA_PER_POST} mídias por post`);
  }
  const validation = validatePostBody(body);
  if (!validation.ok) {
    throw new Error(`body inválido: ${validation.errors.join(", ")}`);
  }
  return {
    postId: newId("post"),
    authorId,
    body,
    mediaIds: [...mediaIds],
    createdAt: now,
    visibility,
  };
}

/**
 * Anexa mídia a um post respeitando MAX_MEDIA_PER_POST.
 * Idempotente para o mesmo assetId.
 */
export function attachMediaToPost(
  post: PostWithMedia,
  assetId: string
): PostWithMedia {
  if (!assetId) throw new Error("assetId obrigatório");
  if (post.mediaIds.includes(assetId)) {
    return post; // já anexado
  }
  if (post.mediaIds.length >= MAX_MEDIA_PER_POST) {
    throw new Error(`máximo ${MAX_MEDIA_PER_POST} mídias por post`);
  }
  return {
    ...post,
    mediaIds: [...post.mediaIds, assetId],
  };
}

/**
 * Desanexa mídia de um post.
 */
export function detachMediaFromPost(
  post: PostWithMedia,
  assetId: string
): PostWithMedia {
  const next = post.mediaIds.filter((id) => id !== assetId);
  if (next.length === post.mediaIds.length) return post;
  return { ...post, mediaIds: next };
}

// =============================================================================
// Estimativa e utilitários
// =============================================================================

/**
 * Estima tempo de transcodificação em segundos baseado em heurística:
 *  - áudio: ~0.1x do tempo real (rápido)
 *  - vídeo: ~0.5x do tempo real (CPU-bound)
 *  - bitrate alvo reduz tempo para alvos de menor qualidade
 */
export function estimateTranscodingTimeSec(
  meta: AudioMetadata | VideoMetadata,
  targetBitrate: number
): number {
  if (targetBitrate <= 0) {
    throw new Error("targetBitrate deve ser > 0");
  }
  const baseRatio = isVideo(meta) ? 0.5 : 0.1;
  const baseBitrate = isVideo(meta) ? DEFAULT_VIDEO_BITRATE_KBPS : DEFAULT_AUDIO_BITRATE_KBPS;
  const bitrateFactor = baseBitrate / targetBitrate;
  const estimate = meta.durationSec * baseRatio * bitrateFactor;
  return Math.max(1, Math.round(estimate));
}

/**
 * Resumo compacto de asset para listagens.
 */
export function summarizeAsset(asset: MediaAsset): {
  id: string;
  kind: MediaKind;
  status: MediaStatus;
  durationSec: number;
  format: MediaFormat;
  size: number;
  chapterCount: number;
  clipCount: number;
} {
  return {
    id: asset.id,
    kind: asset.kind,
    status: asset.status,
    durationSec: asset.metadata.durationSec,
    format: asset.format,
    size: asset.metadata.size,
    chapterCount: asset.chapters?.length ?? 0,
    clipCount: 0, // clips vivem fora do asset, mantido zero aqui
  };
}

/**
 * Agrupa assets por status. Inclui todas as chaves de MediaStatus.
 */
export function groupAssetsByStatus(
  assets: ReadonlyArray<MediaAsset>
): Readonly<Record<MediaStatus, ReadonlyArray<MediaAsset>>> {
  const result: Record<MediaStatus, MediaAsset[]> = {
    uploading: [],
    processing: [],
    ready: [],
    failed: [],
    removed: [],
  };
  for (const asset of assets) {
    result[asset.status].push(asset);
  }
  return result;
}

/**
 * Valida corpo de post (limite 5000 caracteres, não vazio).
 */
export function validatePostBody(body: string): {
  ok: boolean;
  errors: ReadonlyArray<string>;
} {
  const errors: string[] = [];
  if (typeof body !== "string") {
    return { ok: false, errors: ["body deve ser string"] };
  }
  if (body.trim().length === 0) {
    errors.push("body não pode ser vazio");
  }
  if (body.length > 5000) {
    errors.push("body excede 5000 caracteres");
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Filtra assets por userId.
 */
export function findAssetsByUser(
  assets: ReadonlyArray<MediaAsset>,
  userId: string
): ReadonlyArray<MediaAsset> {
  return assets.filter((a) => a.userId === userId);
}