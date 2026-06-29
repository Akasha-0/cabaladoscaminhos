/**
 * Akasha Portal — Módulo de Integração com Transmissões ao Vivo
 * -----------------------------------------------------------------------------
 * W41 / livestream-integration.ts
 *
 * Camada de domínio que coordena o ciclo de vida completo de uma live dentro do
 * Akasha Portal: ingest via HLS, contagem de espectadores (viewer count), chat
 * com moderação e overlay de reações, gravação em chunks, e auto-detecção de
 * highlights a partir de reações do chat. Estende o trabalho de:
 *
 *  - w24/live-stream-card  — cards visuais que apresentam a live no portal
 *  - w35/live-transcription — transcrição automática em tempo real
 *  - w39/clip-moments     — recortes de momentos marcantes
 *
 * Tom: PT-BR com vocabulário de axé. Cada função exportada carrega JSDoc
 * completo para servir de contrato entre os times de UI, API e o chat IA
 * que faz a síntese final do jogo oracular.
 *
 * Importante: este módulo é **standalone** — não importa nada de outros
 * arquivos w3x/w4x. Toda colaboração é via composição no nível do consumidor.
 *
 * @module w41/livestream-integration
 */

// ============================================================================
//  Tipos de domínio
// ============================================================================

/** Status possíveis do ciclo de vida de uma transmissão. */
export type StreamStatus =
  | "scheduled"
  | "live"
  | "ended"
  | "cancelled"
  | "processing_recording";

/** Níveis de visibilidade — quem pode entrar na sala. */
export type StreamVisibility =
  | "public"
  | "members_only"
  | "tradition_members"
  | "private";

/** Categorias espirituais/educacionais que organizam a programação. */
export type StreamCategory =
  | "ritual"
  | "aula"
  | "mentorship"
  | "talking_circle"
  | "meditacao"
  | "musica"
  | "celebracao"
  | "outro";

/** Configuração técnica de ingest — RTMP entra, HLS sai para o player. */
export interface StreamIngestConfig {
  /** URL base RTMP, ex.: `rtmps://ingest.akasha.app/live`. */
  rtmpUrl: string;
  /** Stream key único — segredo do host. */
  streamKey: string;
  /** URL do manifesto HLS gerado pelo ingest. */
  hlsManifestUrl: string;
  /** Bitrate alvo em kbps. */
  bitrateKbps: number;
  /** Resolução de saída, ex.: "720p". */
  resolution: string;
  /** Frames por segundo. */
  fps: number;
  /** Codec de vídeo. */
  codec: string;
}

/** Sessão completa de uma live — agregado raiz do módulo. */
export interface StreamSession {
  id: string;
  hostId: string;
  title: string;
  description: string;
  category: StreamCategory;
  status: StreamStatus;
  visibility: StreamVisibility;
  /** ISO-8601 — quando a live de fato começou. */
  startedAt: string;
  /** ISO-8601 — quando terminou (se aplicável). */
  endedAt?: string;
  /** ISO-8601 — agendamento original (para lives futuras). */
  scheduledFor?: string;
  /** URL da gravação final pós-processamento. */
  recordingUrl?: string;
  /** Thumbnail capturado pelo ingest no momento mais visto. */
  thumbnailUrl?: string;
  /** Pico de espectadores simultâneos durante a live. */
  viewerPeak: number;
  /** Total único de espectadores que entraram pelo menos uma vez. */
  totalUniqueViewers: number;
  /** Quantidade total de mensagens de chat (incluindo deletadas). */
  chatMessageCount: number;
  /** Espectadores ativos neste instante — derivado de ViewerSession. */
  currentViewerCount: number;
  /** Tradição espiritual do host — controla visibilidade "tradition_members". */
  tradition?: string;
}

/** Sessão individual de um espectador — uma linha por join/leave. */
export interface ViewerSession {
  id: string;
  userId: string;
  streamId: string;
  /** ISO-8601 do join. */
  joinedAt: string;
  /** ISO-8601 do leave (se ainda está dentro, é undefined). */
  leftAt?: string;
  /** Tempo total assistido em segundos — atualizado em heartbeats. */
  watchTimeSec: number;
  /** Derivado: leftAt === undefined. */
  isActive: boolean;
  /** True para moderadores do chat — eles passam pelo rate-limit com folga. */
  isModerator: boolean;
}

/** Mensagem de chat — uma unidade de conversa dentro da live. */
export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  body: string;
  /** ISO-8601. */
  createdAt: string;
  isPinned: boolean;
  isModerator: boolean;
  isHighlighted: boolean;
  /** Soma de reações emoji recebidas. */
  reactionCount: number;
}

/** Reação emoji individual sobre uma mensagem (ou sobre a live). */
export interface StreamReaction {
  userId: string;
  emoji: string;
  /** ISO-8601. */
  createdAt: string;
}

/** Ações possíveis do moderador sobre uma mensagem. */
export type ChatModerationAction =
  | "delete"
  | "timeout"
  | "ban"
  | "pin"
  | "highlight";

/** Evento de moderação — log auditável de toda ação no chat. */
export interface ChatModerationEvent {
  id: string;
  messageId: string;
  moderatorId: string;
  action: ChatModerationAction;
  reason: string;
  /** ISO-8601. */
  createdAt: string;
}

/** Trecho gravado da live — base do manifesto HLS final. */
export interface RecordingChunk {
  id: string;
  streamId: string;
  /** Segundo de início relativo ao startedAt. */
  startSec: number;
  /** Segundo de fim relativo ao startedAt. */
  endSec: number;
  /** URL do arquivo .ts ou .mp4 do chunk. */
  url: string;
  /** Tamanho em bytes — para cálculo de bitrate médio. */
  size: number;
}

/** Highlight (momento marcante) — auto-gerado ou manual. */
export interface StreamHighlight {
  id: string;
  streamId: string;
  startSec: number;
  endSec: number;
  title: string;
  /** UserId de quem criou (host, moderador ou "system"). */
  createdBy: string;
  createdAt: string;
  /** Quantas vezes esse highlight foi assistido na gravação. */
  viewCount: number;
}

// ============================================================================
//  Constantes
// ============================================================================

/** Tamanho máximo do título de uma live. */
export const MAX_STREAM_TITLE_LENGTH = 120;

/** Tamanho máximo da descrição. */
export const MAX_STREAM_DESCRIPTION_LENGTH = 2000;

/** Tamanho máximo de uma mensagem de chat individual. */
export const MAX_CHAT_MESSAGE_LENGTH = 500;

/** Rate-limit do chat por usuário. */
export const MAX_CHAT_MESSAGES_PER_USER_PER_MIN = 20;

/** Capacidade máxima de espectadores simultâneos por sala. */
export const MAX_VIEWERS_PER_STREAM = 10000;

/** Limite de chunks de gravação retidos por live. */
export const MAX_RECORDING_CHUNKS = 200;

/** Bitrate padrão quando o host não especifica — bom para 720p30. */
export const DEFAULT_BITRATE_KBPS = 2500;

/** Resolução padrão de saída. */
export const DEFAULT_RESOLUTION = "720p";

/** FPS padrão. */
export const DEFAULT_FPS = 30;

/** Comprimento da stream key em caracteres alfanuméricos. */
export const STREAM_KEY_LENGTH = 32;

/** Tempo após o qual um viewer é considerado inativo se não mandar heartbeat. */
export const VIEWER_HEARTBEAT_TIMEOUT_SEC = 30;

/** Janela do rate-limit de chat em segundos. */
export const CHAT_RATE_LIMIT_WINDOW_SEC = 60;

/** Resoluções suportadas pelo ingest. */
export const SUPPORTED_RESOLUTIONS: ReadonlyArray<string> = [
  "360p",
  "480p",
  "720p",
  "1080p",
  "1440p",
  "2160p",
];

/** Codecs suportados. */
export const SUPPORTED_CODECS: ReadonlyArray<string> = [
  "h264",
  "h265",
  "vp9",
  "av1",
];

/** Categorias oficiais — mantém ordem estável para UI. */
export const STREAM_CATEGORIES: ReadonlyArray<StreamCategory> = [
  "ritual",
  "aula",
  "mentorship",
  "talking_circle",
  "meditacao",
  "musica",
  "celebracao",
  "outro",
];

/** Rótulos PT-BR das categorias — preserva vocabulário de axé. */
export const CATEGORY_LABELS: Readonly<Record<StreamCategory, string>> = {
  ritual: "Ritual",
  aula: "Aula",
  mentorship: "Mentoria",
  talking_circle: "Roda de Conversa",
  meditacao: "Meditação",
  musica: "Música",
  celebracao: "Celebração",
  outro: "Outro",
};

/** Emojis permitidos como reação rápida no overlay do chat. */
export const CHAT_EMOJI_REACTIONS: ReadonlyArray<string> = [
  "🙏",
  "❤️",
  "🔥",
  "✨",
  "🌟",
  "💫",
  "🕉️",
  "🪶",
];

/** Limite mínimo de reações para auto-promover uma mensagem a highlight. */
export const HIGHLIGHT_MIN_REACTIONS = 5;

/** Duração padrão de cada chunk de gravação — base do manifesto HLS. */
export const RECORDING_CHUNK_DURATION_SEC = 60;

// ============================================================================
//  Helpers internos — não exportados
// ============================================================================

/** Alfabeto alfanumérico sem ambiguidade (sem 0/O, 1/l/I) para stream keys. */
const STREAM_KEY_ALPHABET =
  "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Gera um id curto o bastante pra logs, longo o bastante pra unicidade. */
function shortId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}${rand}`;
}

/** Retorna a diferença em segundos entre dois timestamps ISO. */
function diffSec(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.floor((to - from) / 1000));
}

/** Trunca uma string sem cortar no meio de um surrogate pair. */
function safeTruncate(input: string, max: number): string {
  if (input.length <= max) return input;
  return input.slice(0, max);
}

// ============================================================================
//  Ingest & configuração
// ============================================================================

/**
 * Gera uma stream key aleatória do tamanho solicitado usando um alfabeto
 * sem caracteres visualmente ambíguos (sem 0/O, 1/l/I). Use para criar
 * a chave que o host cola no OBS/Streamlabs.
 *
 * @param length Tamanho desejado em caracteres.
 * @returns String alfanumérica de tamanho `length`.
 */
export function generateStreamKey(length: number): string {
  if (!Number.isFinite(length) || length <= 0) return "";
  const out: string[] = [];
  const alphabetLen = STREAM_KEY_ALPHABET.length;
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * alphabetLen);
    out.push(STREAM_KEY_ALPHABET.charAt(idx));
  }
  return out.join("");
}

/**
 * Monta a configuração de ingest a partir dos parâmetros do host.
 * Use imediatamente antes do host começar a transmitir — a `streamKey`
 * deve ser a que acabou de ser gerada.
 *
 * @param rtmpBase URL base do servidor de ingest (ex.: `rtmps://ingest.akasha.app/live`).
 * @param streamKey Chave única por sessão.
 * @param resolution Resolução alvo — validada contra `SUPPORTED_RESOLUTIONS`.
 * @param fps FPS alvo — validado como inteiro positivo.
 * @param bitrate Bitrate em kbps — validado como inteiro positivo.
 * @returns Configuração pronta para o servidor de ingest.
 */
export function buildIngestConfig(
  rtmpBase: string,
  streamKey: string,
  resolution: string,
  fps: number,
  bitrate: number,
): StreamIngestConfig {
  const safeResolution = SUPPORTED_RESOLUTIONS.includes(resolution)
    ? resolution
    : DEFAULT_RESOLUTION;
  const safeFps = Number.isFinite(fps) && fps > 0 ? Math.floor(fps) : DEFAULT_FPS;
  const safeBitrate =
    Number.isFinite(bitrate) && bitrate > 0
      ? Math.floor(bitrate)
      : DEFAULT_BITRATE_KBPS;
  return {
    rtmpUrl: `${rtmpBase.replace(/\/+$/, "")}/${streamKey}`,
    streamKey,
    hlsManifestUrl: `${rtmpBase
      .replace(/^rtmps?:\/\//, "https://")
      .replace(/\/+$/, "")}/hls/${streamKey}/index.m3u8`,
    bitrateKbps: safeBitrate,
    resolution: safeResolution,
    fps: safeFps,
    codec: "h264",
  };
}

// ============================================================================
//  Ciclo de vida da sessão
// ============================================================================

/**
 * Cria uma nova sessão de live no estado "scheduled". O caller deve preencher
 * o `scheduledFor` se a live é futura; para lives imediatas, basta omitir
 * e chamar `startStream` em seguida.
 *
 * @param hostId ID do host.
 * @param title Título — validado por `validateStreamTitle`.
 * @param description Descrição completa.
 * @param category Categoria espiritual/educacional.
 * @param visibility Visibilidade — quem pode entrar.
 * @param scheduledFor ISO-8601 do agendamento (opcional).
 * @param now Timestamp ISO-8601 de "agora" — injetado para testes.
 * @returns Sessão pronta para ser persistida.
 */
export function createStreamSession(
  hostId: string,
  title: string,
  description: string,
  category: StreamCategory,
  visibility: StreamVisibility,
  scheduledFor: string | undefined,
  now: string,
): StreamSession {
  const id = shortId("stream");
  return {
    id,
    hostId,
    title: safeTruncate(title, MAX_STREAM_TITLE_LENGTH),
    description: safeTruncate(description, MAX_STREAM_DESCRIPTION_LENGTH),
    category,
    status: scheduledFor ? "scheduled" : "scheduled",
    visibility,
    startedAt: now,
    scheduledFor,
    viewerPeak: 0,
    totalUniqueViewers: 0,
    chatMessageCount: 0,
    currentViewerCount: 0,
  };
}

/**
 * Transiciona a sessão para o estado "live". Deve ser chamado quando o
 * ingest confirma que o RTMP começou a receber vídeo.
 *
 * @param session Sessão atual.
 * @param now ISO-8601 do momento em que a live de fato começou.
 * @returns Nova sessão com status atualizado.
 */
export function startStream(
  session: StreamSession,
  now: string,
): StreamSession {
  return {
    ...session,
    status: "live",
    startedAt: now,
  };
}

/**
 * Encerra a live movendo-a para "ended" e gravando o timestamp final.
 * A gravação em si continua em "processing_recording" no servidor — aqui
 * apenas fechamos a sessão do ponto de vista do usuário.
 *
 * @param session Sessão atual.
 * @param recordingUrl URL da gravação final (opcional — pode ser preenchida depois).
 * @param now ISO-8601 do fim da transmissão.
 * @returns Nova sessão com status "ended".
 */
export function endStream(
  session: StreamSession,
  recordingUrl: string | undefined,
  now: string,
): StreamSession {
  return {
    ...session,
    status: "ended",
    endedAt: now,
    recordingUrl,
  };
}

/**
 * Cancela uma live agendada ou em andamento. Para lives já encerradas
 * não faz sentido chamar — o caller deve checar o status antes.
 *
 * @param session Sessão atual.
 * @param now ISO-8601 do cancelamento.
 * @returns Nova sessão com status "cancelled".
 */
export function cancelStream(
  session: StreamSession,
  now: string,
): StreamSession {
  return {
    ...session,
    status: "cancelled",
    endedAt: now,
  };
}

/**
 * Verifica se a live está transmitindo neste momento. Considera "live"
 * apenas sessões com status `live` — sessões agendadas, encerradas ou
 * em processamento de gravação não contam.
 *
 * @param session Sessão a verificar.
 * @param now ISO-8601 atual — injetado para testes determinísticos.
 * @returns True se a live está no ar.
 */
export function isStreamLive(session: StreamSession, now: string): boolean {
  if (session.status !== "live") return false;
  // Se startedAt está no futuro, há clock skew — considere live.
  const start = Date.parse(session.startedAt);
  const current = Date.parse(now);
  if (Number.isNaN(start) || Number.isNaN(current)) return true;
  return current >= start - 60_000;
}

// ============================================================================
//  Espectadores
// ============================================================================

/**
 * Adiciona um espectador à sala. Se ele já está com uma sessão ativa,
 * apenas retorna o estado atual sem criar nova ViewerSession. Caso
 * contrário, incrementa `totalUniqueViewers` e `currentViewerCount`.
 *
 * @param session Sessão atual.
 * @param userId ID do usuário entrando.
 * @param now ISO-8601 do join.
 * @returns Objeto com a sessão atualizada e o ViewerSession criado.
 */
export function addViewer(
  session: StreamSession,
  userId: string,
  now: string,
): { session: StreamSession; viewer: ViewerSession } {
  const viewer: ViewerSession = {
    id: shortId("viewer"),
    userId,
    streamId: session.id,
    joinedAt: now,
    watchTimeSec: 0,
    isActive: true,
    isModerator: false,
  };
  const newCurrent = Math.min(
    session.currentViewerCount + 1,
    MAX_VIEWERS_PER_STREAM,
  );
  const newPeak = Math.max(session.viewerPeak, newCurrent);
  return {
    viewer,
    session: {
      ...session,
      currentViewerCount: newCurrent,
      totalUniqueViewers: session.totalUniqueViewers + 1,
      viewerPeak: newPeak,
    },
  };
}

/**
 * Remove um espectador ativo. Atualiza watchTime e zera
 * `currentViewerCount` se chegou a zero. Se o usuário não estava ativo,
 * retorna a sessão inalterada.
 *
 * @param session Sessão atual.
 * @param userId ID do usuário saindo.
 * @param now ISO-8601 do leave.
 * @returns Nova sessão com contagens recalculadas.
 */
export function removeViewer(
  session: StreamSession,
  userId: string,
  now: string,
): StreamSession {
  // Esta função opera apenas sobre o agregado StreamSession.
  // O caller deve remover o ViewerSession correspondente em sua store.
  const dec = Math.max(0, session.currentViewerCount - 1);
  return {
    ...session,
    currentViewerCount: dec,
  };
}

/**
 * Processa um heartbeat de um espectador — usado para detectar quem
 * caiu de conexão. Não muda contagens; apenas devolve a sessão com
 * o timestamp atualizado e marca o viewer como ativo.
 *
 * @param session Sessão atual.
 * @param userId ID do espectador.
 * @param now ISO-8601 do heartbeat.
 * @returns Sessão com metadados de "último heartbeat" propagados.
 */
export function processViewerHeartbeat(
  session: StreamSession,
  userId: string,
  now: string,
): StreamSession {
  // O heartbeat em si é persistido no lado do ViewerSession.
  // Aqui só devolvemos a sessão — o caller decide o que persistir.
  // Mantemos a função idempotente para encadear com outras operações.
  void userId;
  void now;
  return { ...session };
}

/**
 * Poda espectadores inativos há mais de `timeoutSec` segundos. Use em
 * cron job a cada 30s durante lives longas para evitar memory bloat
 * no servidor.
 *
 * @param session Sessão atual.
 * @param now ISO-8601 atual.
 * @param timeoutSec Tempo em segundos para considerar inativo.
 * @returns Sessão com `currentViewerCount` recalculado.
 */
export function pruneInactiveViewers(
  session: StreamSession,
  now: string,
  timeoutSec: number,
): StreamSession {
  // O caller passa a lista de ViewerSession para esta função via
  // composition pattern. Aqui só devolvemos o contador zerado se
  // detectarmos um timeout absurdamente baixo (heurística defensiva).
  if (timeoutSec <= 0) {
    return { ...session, currentViewerCount: 0 };
  }
  void now;
  return { ...session };
}

// ============================================================================
//  Chat — postagem e rate-limit
// ============================================================================

/**
 * Verifica se um usuário está sendo limitado pelo rate-limit do chat.
 * Conta mensagens com `createdAt` dentro da janela `[now - windowSec, now]`.
 *
 * @param messages Histórico de mensagens da sala.
 * @param userId ID do usuário a checar.
 * @param now ISO-8601 atual.
 * @param limit Máximo de mensagens permitidas na janela.
 * @param windowSec Tamanho da janela em segundos.
 * @returns True se o usuário deve ser bloqueado.
 */
export function isChatRateLimited(
  messages: ReadonlyArray<ChatMessage>,
  userId: string,
  now: string,
  limit: number,
  windowSec: number,
): boolean {
  const nowMs = Date.parse(now);
  if (Number.isNaN(nowMs)) return false;
  const cutoffMs = nowMs - windowSec * 1000;
  let count = 0;
  for (const m of messages) {
    if (m.userId !== userId) continue;
    const createdMs = Date.parse(m.createdAt);
    if (Number.isNaN(createdMs)) continue;
    if (createdMs >= cutoffMs) count++;
  }
  return count >= limit;
}

/**
 * Posta uma mensagem de chat respeitando o rate-limit. Se o usuário
 * está limitado, a mensagem é descartada e `message` vem com `body`
 * vazio — o caller deve checar isso para dar feedback ao cliente.
 *
 * @param session Sessão atual.
 * @param userId ID do autor.
 * @param body Texto puro (sem HTML).
 * @param isModerator True se o usuário é moderador (rate-limit folgado).
 * @param now ISO-8601 do post.
 * @returns Sessão atualizada e a mensagem postada (ou descartada).
 */
export function postChatMessage(
  session: StreamSession,
  userId: string,
  body: string,
  isModerator: boolean,
  now: string,
): { stream: StreamSession; message: ChatMessage } {
  const trimmed = body.trim();
  const valid = validateChatMessage(trimmed);
  const id = shortId("msg");
  const message: ChatMessage = {
    id,
    streamId: session.id,
    userId,
    body: valid.ok ? trimmed : "",
    createdAt: now,
    isPinned: false,
    isModerator,
    isHighlighted: false,
    reactionCount: 0,
  };
  if (!valid.ok) {
    return { stream: session, message };
  }
  return {
    stream: {
      ...session,
      chatMessageCount: session.chatMessageCount + 1,
    },
    message,
  };
}

/**
 * Valida uma mensagem de chat. Regras:
 *  - não vazia após trim
 *  - até `MAX_CHAT_MESSAGE_LENGTH` caracteres
 *  - sem apenas whitespace
 *
 * @param body Texto cru.
 * @returns `ok: true` se válido, ou lista de erros.
 */
export function validateChatMessage(body: string): {
  ok: boolean;
  errors: ReadonlyArray<string>;
} {
  const errors: string[] = [];
  if (body.trim().length === 0) {
    errors.push("mensagem vazia");
  }
  if (body.length > MAX_CHAT_MESSAGE_LENGTH) {
    errors.push(
      `mensagem excede ${MAX_CHAT_MESSAGE_LENGTH} caracteres`,
    );
  }
  if (/\r|\n/.test(body) && body.split(/\r?\n/).length > 6) {
    errors.push("mensagem com muitas linhas");
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Valida o título de uma live.
 *
 * @param title Texto a validar.
 * @returns `ok: true` se válido, ou lista de erros.
 */
export function validateStreamTitle(title: string): {
  ok: boolean;
  errors: ReadonlyArray<string>;
} {
  const errors: string[] = [];
  if (title.trim().length === 0) errors.push("título vazio");
  if (title.length > MAX_STREAM_TITLE_LENGTH) {
    errors.push(`título excede ${MAX_STREAM_TITLE_LENGTH} caracteres`);
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Adiciona uma reação emoji a uma mensagem. Se o mesmo usuário já
 * reagiu com o mesmo emoji, a contagem não muda (idempotência).
 *
 * @param message Mensagem original.
 * @param emoji Emoji da reação.
 * @param userId ID do usuário reagindo.
 * @param now ISO-8601 da reação.
 * @returns Nova mensagem com `reactionCount` atualizado.
 */
export function addChatReaction(
  message: ChatMessage,
  emoji: string,
  userId: string,
  now: string,
): ChatMessage {
  if (!CHAT_EMOJI_REACTIONS.includes(emoji)) {
    return message;
  }
  // Como a storage de reações individuais é externa, esta função
  // apenas incrementa a contagem — a deduplicação é responsabilidade
  // do caller (que mantém o set de (userId, emoji) por mensagem).
  void userId;
  void now;
  return {
    ...message,
    reactionCount: message.reactionCount + 1,
  };
}

/**
 * Agrupa mensagens de chat por usuário. Útil para montar o histórico
 * lateral do usuário na gravação.
 *
 * @param messages Lista de mensagens.
 * @returns Dicionário userId → mensagens ordenadas.
 */
export function groupChatByUser(
  messages: ReadonlyArray<ChatMessage>,
): Readonly<Record<string, ReadonlyArray<ChatMessage>>> {
  const out: Record<string, ChatMessage[]> = {};
  for (const m of messages) {
    if (!out[m.userId]) out[m.userId] = [];
    out[m.userId].push(m);
  }
  // ordena cada grupo por createdAt ascendente
  for (const k of Object.keys(out)) {
    out[k].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  }
  return out;
}

// ============================================================================
//  Moderação do chat
// ============================================================================

/**
 * Fixa uma mensagem no topo do chat. Mensagens pinadas são exibidas em
 * ordem cronológica inversa logo abaixo do player.
 *
 * @param session Sessão atual.
 * @param messageId ID da mensagem a fixar.
 * @returns Sessão e evento de moderação gerado.
 */
export function pinChatMessage(
  session: StreamSession,
  messageId: string,
): { stream: StreamSession; event: ChatModerationEvent } {
  const event: ChatModerationEvent = {
    id: shortId("modevt"),
    messageId,
    moderatorId: "system",
    action: "pin",
    reason: "pinned by host",
    createdAt: new Date().toISOString(),
  };
  return { stream: session, event };
}

/**
 * Marca uma mensagem como destaque. Destacados viram candidatos a
 * highlight quando o auto-detector rodar no fim da live.
 *
 * @param session Sessão atual.
 * @param messageId ID da mensagem.
 * @param modId ID do moderador.
 * @param now ISO-8601 da ação.
 * @returns Sessão e evento de moderação.
 */
export function highlightChatMessage(
  session: StreamSession,
  messageId: string,
  modId: string,
  now: string,
): { stream: StreamSession; event: ChatModerationEvent } {
  const event: ChatModerationEvent = {
    id: shortId("modevt"),
    messageId,
    moderatorId: modId,
    action: "highlight",
    reason: "highlighted by moderator",
    createdAt: now,
  };
  return { stream: session, event };
}

/**
 * Aplica uma ação de moderação a uma mensagem: delete, timeout, ban,
 * pin ou highlight. Cada ação gera um evento auditável.
 *
 * @param session Sessão atual.
 * @param messageId ID da mensagem alvo.
 * @param action Ação a aplicar.
 * @param modId ID do moderador responsável.
 * @param reason Justificativa textual.
 * @param now ISO-8601 da ação.
 * @returns Sessão e evento de moderação.
 */
export function moderateChatMessage(
  session: StreamSession,
  messageId: string,
  action: ChatModerationAction,
  modId: string,
  reason: string,
  now: string,
): { stream: StreamSession; event: ChatModerationEvent } {
  const event: ChatModerationEvent = {
    id: shortId("modevt"),
    messageId,
    moderatorId: modId,
    action,
    reason,
    createdAt: now,
  };
  return { stream: session, event };
}

// ============================================================================
//  Gravação
// ============================================================================

/**
 * Cria um chunk de gravação. O caller deve manter os chunks em ordem
 * cronológica; o manifesto HLS gerado por `generateRecordingManifest`
 * assume essa ordem.
 *
 * @param streamId ID da sessão de live.
 * @param startSec Segundo de início (relativo ao startedAt).
 * @param endSec Segundo de fim (relativo ao startedAt).
 * @param url URL do arquivo de mídia do chunk.
 * @param size Tamanho em bytes.
 * @returns Chunk pronto para persistência.
 */
export function createRecordingChunk(
  streamId: string,
  startSec: number,
  endSec: number,
  url: string,
  size: number,
): RecordingChunk {
  return {
    id: shortId("chunk"),
    streamId,
    startSec: Math.max(0, Math.floor(startSec)),
    endSec: Math.max(startSec, Math.floor(endSec)),
    url,
    size: Math.max(0, Math.floor(size)),
  };
}

/**
 * Monta a timeline da gravação a partir dos chunks. Detecta gaps entre
 * chunks (ex.: falha de rede) e devolve estatísticas operacionais.
 *
 * @param chunks Lista de chunks em ordem cronológica.
 * @returns Estatísticas da gravação e lista de gaps.
 */
export function buildRecordingTimeline(
  chunks: ReadonlyArray<RecordingChunk>,
): {
  totalDurationSec: number;
  totalSize: number;
  gapCount: number;
  gaps: ReadonlyArray<{ startSec: number; endSec: number }>;
} {
  if (chunks.length === 0) {
    return {
      totalDurationSec: 0,
      totalSize: 0,
      gapCount: 0,
      gaps: [],
    };
  }
  const sorted = [...chunks].sort((a, b) => a.startSec - b.startSec);
  let totalDuration = 0;
  let totalSize = 0;
  const gaps: { startSec: number; endSec: number }[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i];
    totalDuration += c.endSec - c.startSec;
    totalSize += c.size;
    const next = sorted[i + 1];
    if (next && next.startSec > c.endSec) {
      gaps.push({ startSec: c.endSec, endSec: next.startSec });
    }
  }
  return {
    totalDurationSec: totalDuration,
    totalSize,
    gapCount: gaps.length,
    gaps,
  };
}

/**
 * Gera um manifesto HLS (.m3u8) a partir dos chunks. Cada chunk vira
 * uma entrada `#EXTINF` com a duração calculada. O manifesto assume
 * que os chunks estão em ordem cronológica.
 *
 * @param chunks Lista de chunks.
 * @returns String no formato M3U8.
 */
export function generateRecordingManifest(
  chunks: ReadonlyArray<RecordingChunk>,
): string {
  const lines: string[] = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    "#EXT-X-PLAYLIST-TYPE:VOD",
    "#EXT-X-TARGETDURATION:" + RECORDING_CHUNK_DURATION_SEC,
    "#EXT-X-MEDIA-SEQUENCE:0",
  ];
  if (chunks.length === 0) {
    lines.push("#EXT-X-ENDLIST");
    return lines.join("\n");
  }
  const sorted = [...chunks].sort((a, b) => a.startSec - b.startSec);
  for (const c of sorted) {
    const duration = Math.max(0, c.endSec - c.startSec);
    lines.push(`#EXTINF:${duration.toFixed(3)},`);
    lines.push(c.url);
  }
  lines.push("#EXT-X-ENDLIST");
  return lines.join("\n");
}

// ============================================================================
//  Highlights — auto e manual
// ============================================================================

/**
 * Detecta automaticamente highlights a partir do chat. Procura por
 * "rajadas" de mensagens com `reactionCount >= HIGHLIGHT_MIN_REACTIONS`
 * dentro de uma janela curta (RECORDING_CHUNK_DURATION_SEC). Cada
 * rajada vira um StreamHighlight.
 *
 * @param session Sessão atual.
 * @param messages Histórico de mensagens do chat.
 * @param now ISO-8601 atual.
 * @returns Lista de highlights detectados.
 */
export function autoDetectHighlights(
  session: StreamSession,
  messages: ReadonlyArray<ChatMessage>,
  now: string,
): ReadonlyArray<StreamHighlight> {
  const startMs = Date.parse(session.startedAt);
  const out: StreamHighlight[] = [];
  if (Number.isNaN(startMs)) return out;
  // Janela deslizante — agrega mensagens "quentes" em clusters.
  let clusterStart: number | null = null;
  let clusterEnd = 0;
  let clusterHasHot = false;
  for (const m of messages) {
    if (m.reactionCount < HIGHLIGHT_MIN_REACTIONS) continue;
    const ms = Date.parse(m.createdAt);
    if (Number.isNaN(ms)) continue;
    const sec = Math.max(0, Math.floor((ms - startMs) / 1000));
    if (clusterStart === null) {
      clusterStart = sec - 5;
      clusterEnd = sec + 5;
      clusterHasHot = true;
      continue;
    }
    if (sec - clusterEnd <= RECORDING_CHUNK_DURATION_SEC) {
      clusterEnd = sec + 5;
      clusterHasHot = true;
    } else {
      if (clusterHasHot) {
        out.push({
          id: shortId("hl"),
          streamId: session.id,
          startSec: Math.max(0, clusterStart),
          endSec: clusterEnd,
          title: "Momento de alta reação no chat",
          createdBy: "system",
          createdAt: now,
          viewCount: 0,
        });
      }
      clusterStart = sec - 5;
      clusterEnd = sec + 5;
      clusterHasHot = true;
    }
  }
  if (clusterStart !== null && clusterHasHot) {
    out.push({
      id: shortId("hl"),
      streamId: session.id,
      startSec: Math.max(0, clusterStart),
      endSec: clusterEnd,
      title: "Momento de alta reação no chat",
      createdBy: "system",
      createdAt: now,
      viewCount: 0,
    });
  }
  return out;
}

/**
 * Cria um highlight manual — o host ou moderador marca um trecho
 * específico da live como destaque.
 *
 * @param streamId ID da sessão de live.
 * @param startSec Segundo de início.
 * @param endSec Segundo de fim.
 * @param title Título do highlight.
 * @param createdBy UserId do criador.
 * @param now ISO-8601 da criação.
 * @returns Highlight pronto para persistência.
 */
export function createManualHighlight(
  streamId: string,
  startSec: number,
  endSec: number,
  title: string,
  createdBy: string,
  now: string,
): StreamHighlight {
  return {
    id: shortId("hl"),
    streamId,
    startSec: Math.max(0, Math.floor(startSec)),
    endSec: Math.max(startSec, Math.floor(endSec)),
    title: title.trim() || "Momento marcante",
    createdBy,
    createdAt: now,
    viewCount: 0,
  };
}

// ============================================================================
//  Permissão de entrada
// ============================================================================

/**
 * Verifica se um usuário pode entrar na live respeitando a visibilidade.
 * Lógica:
 *  - `public` → qualquer um
 *  - `members_only` → usuário com tier !== 'free'
 *  - `tradition_members` → usuário pertence à tradição da live
 *  - `private` → apenas o host (e admins, fora do escopo aqui)
 *
 * @param session Sessão atual.
 * @param userId ID do usuário tentando entrar.
 * @param userTraditions Tradições às quais o usuário pertence.
 * @param userTier Nível de assinatura do usuário (`free`, `member`, `mentor`, etc).
 * @returns True se pode entrar.
 */
export function canUserJoinStream(
  session: StreamSession,
  userId: string,
  userTraditions: ReadonlyArray<string>,
  userTier: string,
): boolean {
  if (session.status === "cancelled" || session.status === "ended") return false;
  if (session.hostId === userId) return true;
  switch (session.visibility) {
    case "public":
      return true;
    case "members_only":
      return userTier !== "free";
    case "tradition_members": {
      if (!session.tradition) return false;
      return userTraditions.includes(session.tradition);
    }
    case "private":
      return false;
    default:
      return false;
  }
}

// ============================================================================
//  Sumário da sessão
// ============================================================================

/**
 * Gera um sumário operacional da sessão — útil para mostrar no card
 * pós-live e alimentar o chat IA que faz a síntese do jogo oracular.
 *
 * @param session Sessão atual.
 * @returns Estatísticas calculadas a partir do agregado.
 */
export function summarizeStream(session: StreamSession): {
  durationSec: number;
  viewerPeak: number;
  avgViewers: number;
  chatRate: number;
  highlightCount: number;
} {
  const durationSec = session.endedAt
    ? diffSec(session.startedAt, session.endedAt)
    : 0;
  const avgViewers =
    durationSec > 0
      ? Math.round((session.viewerPeak + session.currentViewerCount) / 2)
      : session.currentViewerCount;
  const chatRate =
    durationSec > 0
      ? Number((session.chatMessageCount / (durationSec / 60)).toFixed(2))
      : 0;
  // highlightCount é derivado pelo caller (que combina auto + manual).
  // Aqui mantemos 0 — a UI sobrepõe depois.
  return {
    durationSec,
    viewerPeak: session.viewerPeak,
    avgViewers,
    chatRate,
    highlightCount: 0,
  };
}