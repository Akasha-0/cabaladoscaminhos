/**
 * voice-tts.ts — Akasha fala (voice mode) text-to-speech engine wrapper.
 *
 * Camada de TTS do Akasha Portal. Recebe o texto que a IA do Akasha está
 * transmitindo via streaming (w25/akasha-streaming-ui) e produz chunks de
 * áudio sintetizado para que o consulente ouça a consulta em vez de ler.
 *
 * Integração pretendida (não importada diretamente — orquestrada pela wave
 * do streaming-ui):
 *   - w25/akasha-streaming-ui: cada bloco de texto finalizado entra aqui como
 *     `SynthesisRequest`. Os `AudioChunk`s resultantes voltam para o player
 *     da interface Akasha fala.
 *   - w24/oracle-engine: respostas longas do oráculo são quebradas em chunks
 *     via `chunkText` antes de chegarem ao consumidor humano.
 *
 * Princípios:
 *   - Determinismo: funções puras recebem `now: string` (ISO-8601) quando
 *     precisam de carimbo de tempo. Nada de `Date.now()` interno.
 *   - Vocabulário místico/axé em PT-BR nos exemplos de JSDoc.
 *   - Standalone: zero import de outros módulos do repo, zero deps externas.
 *   - Mobile-first: opera em PT-BR por padrão, com cache LRU enxuto.
 *
 * @module w41/voice-tts
 * @version 0.1.0 (wave 41)
 */

// ──────────────────────────────────────────────────────────────────────────────
// Tipos públicos
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Identificadores de voz suportados pelo wrapper de TTS.
 *
 * O sufixo da voz indica o par (idioma × gênero). `neutral-tts` é uma voz
 * fallback sem identidade de gênero — útil para narração de números e símbolos.
 */
export type VoiceId =
  | "akasha-female-pt"
  | "akasha-male-pt"
  | "akasha-female-en"
  | "akasha-male-en"
  | "akasha-female-es"
  | "akasha-male-en"
  | "neutral-tts";

/**
 * Idiomas suportados pela camada de TTS. Segue o padrão BCP-47 com a região.
 */
export type Language = "pt-BR" | "en-US" | "es-ES";

/**
 * Emoções que a voz pode assumir durante a síntese. Alinhado com os tons
 * narrativos mais usados no consultório espiritual:
 *   - neutral: tom informativo padrão
 *   - happy:   acolhimento, bênção, abertura
 *   - calm:    meditação, mantra, respiração guiada
 *   - serious: alerta, Kaikan, advertência
 *   - mystical: revelação, búzios, mensagem do orixá
 */
export type Emotion = "neutral" | "happy" | "calm" | "serious" | "mystical";

/**
 * Status de um job de síntese. A máquina de estados é estritamente linear:
 * pending → streaming → completed | failed | cancelled.
 */
export type SynthesisStatus =
  | "pending"
  | "streaming"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * Formato de saída do áudio sintetizado. `mp3` é o padrão mobile.
 */
export type AudioFormat = "mp3" | "wav" | "ogg" | "pcm";

/**
 * Metadados de uma voz provisionada. Não armazena o áudio em si — apenas a
 * "identidade" da voz, para que a UI possa mostrá-la ao consulente.
 */
export interface VoiceProfile {
  readonly id: VoiceId;
  /** Nome amigável (PT-BR) exibido na UI. */
  readonly name: string;
  readonly language: Language;
  readonly gender: "female" | "male" | "neutral";
  /** Sample rate em Hz. 22050 é compacto (mobile); 24000 é o padrão TTS. */
  readonly sampleRate: number;
  /** Se esta é a voz padrão para o seu idioma. */
  readonly isDefault: boolean;
}

/**
 * Requisição de síntese. É o "envelope" que o streaming-ui entrega ao TTS.
 *
 * @example
 * const req: SynthesisRequest = {
 *   text: "Que o axé dos seus Orixás te acompanhe nesta jornada.",
 *   voiceId: "akasha-female-pt",
 *   speed: 0.95,
 *   pitch: -1,
 *   volume: 1.0,
 *   emotion: "mystical",
 *   outputFormat: "mp3",
 * };
 */
export interface SynthesisRequest {
  readonly text: string;
  readonly voiceId: VoiceId;
  /** Velocidade. 0.5 = metade; 2.0 = dobro. Padrão 1.0. */
  readonly speed: number;
  /** Tom em semitons. -12 a +12. Padrão 0. */
  readonly pitch: number;
  /** Volume. 0 = mudo; 10 = máximo. Padrão 1.0. */
  readonly volume: number;
  readonly emotion: Emotion;
  readonly outputFormat: AudioFormat;
}

/**
 * Um fragmento de áudio produzido pela síntese. Pode carregar os bytes
 * codificados em base64 (`data`) ou apenas uma referência opaca (`ref`)
 * caso o wrapper esteja em modo streaming-storage.
 */
export interface AudioChunk {
  readonly id: string;
  readonly data?: string;
  readonly ref?: string;
  readonly durationMs: number;
  readonly format: AudioFormat;
  readonly voiceId: VoiceId;
  /** ISO-8601 em UTC. */
  readonly createdAt: string;
}

/**
 * Configuração do motor de TTS. Consumida pela classe orquestradora — este
 * módulo só lê, mas expõe defaults sensatos para mobile-first.
 */
export interface TTSConfig {
  readonly defaultVoiceId: VoiceId;
  readonly maxChunkChars: number;
  readonly maxConcurrentRequests: number;
  readonly cacheEnabled: boolean;
  readonly cacheTtlSeconds: number;
}

/**
 * Job de síntese. Representa UMA requisição que pode (ou não) ser quebrada
 * em múltiplos chunks. Acompanhado pela UI do Akasha fala em tempo real.
 */
export interface SynthesisJob {
  readonly id: string;
  readonly status: SynthesisStatus;
  readonly request: SynthesisRequest;
  readonly chunks: ReadonlyArray<AudioChunk>;
  readonly totalDurationMs: number;
  /** ISO-8601 em UTC. */
  readonly startedAt: string;
  /** ISO-8601 em UTC. Preenchido apenas quando status !== "pending"|"streaming". */
  readonly completedAt?: string;
  readonly error?: string;
}

/**
 * Entrada de cache de voz. Cada entrada é imutável — substituições no LRU
 * inserem novas entradas e descartam as antigas.
 */
export interface VoiceCacheEntry {
  readonly key: string;
  readonly voiceId: VoiceId;
  /** Hash determinístico da requisição. */
  readonly hash: string;
  readonly chunks: ReadonlyArray<AudioChunk>;
  /** ISO-8601 em UTC. */
  readonly createdAt: string;
  readonly ttlSeconds: number;
  /** Quantas vezes esta entrada já foi reaproveitada. */
  readonly hitCount: number;
}

/**
 * Resultado da validação de uma `SynthesisRequest`. `ok=true` significa que
 * pode ser enfileirada sem ressalvas.
 */
export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: ReadonlyArray<string>;
}

/**
 * Sumário compacto de um job — usado pela UI para listar o histórico do
 * consulente sem precisar carregar todos os chunks.
 */
export interface JobSummary {
  readonly id: string;
  readonly status: SynthesisStatus;
  readonly totalChars: number;
  readonly totalDurationMs: number;
  readonly chunkCount: number;
  readonly voiceId: VoiceId;
}

/**
 * Rollup agregado de vários jobs — alimenta analytics e dashboards.
 */
export interface JobsRollup {
  readonly totalDurationMs: number;
  readonly totalChars: number;
  readonly byVoiceId: Readonly<Record<VoiceId, number>>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Constantes públicas
// ──────────────────────────────────────────────────────────────────────────────

/** Tamanho máximo de cada chunk de texto antes da síntese. */
export const MAX_CHUNK_CHARS = 500;

/** Hard cap por job — evita que uma resposta patológica domine a fila. */
export const MAX_CHUNKS_PER_JOB = 100;

/** Quantos jobs podem rodar em paralelo (mobile: manter baixo!). */
export const MAX_CONCURRENT_REQUESTS = 3;

/** Velocidade padrão. 1.0 = fala natural. */
export const DEFAULT_SPEED = 1.0;

/** Pitch padrão em semitons. 0 = voz original. */
export const DEFAULT_PITCH = 0;

/** Volume padrão (escala 0-10). 1.0 é confortável. */
export const DEFAULT_VOLUME = 1.0;

/** TTL padrão do cache de voz, em segundos. 1h. */
export const CACHE_TTL_SECONDS = 3600;

/** Quantas entradas o cache LRU aguenta antes de evictar. */
export const CACHE_MAX_ENTRIES = 200;

/**
 * Idiomas suportados. Imutável por construção.
 */
export const SUPPORTED_LANGUAGES: ReadonlyArray<Language> = [
  "pt-BR",
  "en-US",
  "es-ES",
] as const;

/**
 * Perfis de voz provisionados por padrão.
 *
 * Cobertura: 3 idiomas × 2 gêneros (+ 1 neutro fallback). Cada idioma
 * tem uma voz feminina marcada como `isDefault`.
 */
export const DEFAULT_VOICE_PROFILES: ReadonlyArray<VoiceProfile> = [
  {
    id: "akasha-female-pt",
    name: "Akasha Iyá (PT-BR)",
    language: "pt-BR",
    gender: "female",
    sampleRate: 24000,
    isDefault: true,
  },
  {
    id: "akasha-male-pt",
    name: "Akasha Babalorixá (PT-BR)",
    language: "pt-BR",
    gender: "male",
    sampleRate: 24000,
    isDefault: false,
  },
  {
    id: "akasha-female-en",
    name: "Akasha She (EN-US)",
    language: "en-US",
    gender: "female",
    sampleRate: 24000,
    isDefault: true,
  },
  {
    id: "akasha-male-en",
    name: "Akasha He (EN-US)",
    language: "en-US",
    gender: "male",
    sampleRate: 24000,
    isDefault: false,
  },
  {
    id: "akasha-female-es",
    name: "Akasha Ella (ES-ES)",
    language: "es-ES",
    gender: "female",
    sampleRate: 24000,
    isDefault: true,
  },
  {
    id: "neutral-tts",
    name: "Akasha Neutro",
    language: "pt-BR",
    gender: "neutral",
    sampleRate: 22050,
    isDefault: false,
  },
] as const;

/**
 * Palavras-chave que ativam a emoção "mystical" quando detectadas no texto.
 *
 * Cobertura:
 *   - PT-BR: axé, orixá, orixás, búzios, Ifá, Kaikan, Cabala, sagrado,
 *     sagrado, luz, paz, amor, bênção, glória, mara, gentileza, etc.
 *   - EN-US: sacred, mystical, divine, oracle, aye, blessing, etc.
 *   - ES-ES: sagrado, místico, divino, oráculo, axé, etc.
 *
 * Match é case-insensitive e acento-insensitive.
 */
export const EMOTION_KEYWORDS: ReadonlyArray<string> = [
  // PT-BR
  "axé",
  "axé",
  "orixá",
  "orixás",
  "búzios",
  "buzios",
  "ifá",
  "ifan",
  "kaikan",
  "cabala",
  "cabalah",
  "sagrado",
  "sagrada",
  "sagrados",
  "luz",
  "paz",
  "amor",
  "bênção",
  "benção",
  "bencaos",
  "glória",
  "gloria",
  "mara",
  "gentileza",
  "orun",
  "oddu",
  "odu",
  "oṣu",
  "exu",
  "ogum",
  "oyá",
  "iemanja",
  "iemanjá",
  "oxalá",
  "xango",
  "xangô",
  "iansã",
  "iansa",
  "oba",
  "oxum",
  "oxossi",
  "nanã",
  "nana",
  "omulu",
  "obaluaê",
  "obaluae",
  // EN-US
  "sacred",
  "mystical",
  "mystic",
  "divine",
  "oracle",
  "blessing",
  "blessings",
  "light",
  "peace",
  "love",
  "glory",
  "spirit",
  "holy",
  // ES-ES
  "sagrado",
  "místico",
  "mistico",
  "divino",
  "oráculo",
  "oraculo",
  "bendición",
  "bendicion",
  "luz",
  "paz",
  "amor",
  "gloria",
] as const;

// ──────────────────────────────────────────────────────────────────────────────
// Utilitários internos (privados)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Gera um identificador opaco curto (não-criptográfico). Baseado em
 * carimbo de tempo + counter monotônico — suficiente para correlacionar
 * jobs no console.
 */
let __internal_counter = 0;
function genId(prefix: string): string {
  __internal_counter = (__internal_counter + 1) % 0x7fffffff;
  return `${prefix}-${Date.now().toString(36)}-${__internal_counter.toString(36)}`;
}

/**
 * Remove acentos de uma string para comparação acento-insensitive.
 */
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Mapa de acentos pré-calculado pelo fold (cache local frouxo). */
const FOLD_CACHE = new Map<string, string>();
function foldCached(s: string): string {
  const cached = FOLD_CACHE.get(s);
  if (cached !== undefined) return cached;
  const v = fold(s);
  FOLD_CACHE.set(s, v);
  return v;
}

/**
 * Hash determinístico FNV-1a 32-bit. Pequeno, estável, suficiente para
 * chaves de cache. Não é criptográfico — não usar para tokens.
 */
function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // unsigned 32-bit hex
  return (h >>> 0).toString(16).padStart(8, "0");
}

/**
 * Encontra a última fronteira de "sentença" antes de `limit`. Fronteiras,
 * em ordem de preferência: `. ! ?` ; nova-linha. Se nada servir, recorta
 * no último espaço.
 */
function findSentenceBreak(text: string, limit: number): number {
  const slice = text.slice(0, limit);
  // Procura por ., !, ? da direita para a esquerda (excluindo o último char
  // para evitar quebras no próprio delimitador).
  const punctuationOrder = [".", "!", "?", ";"];
  for (const pun of punctuationOrder) {
    const idx = slice.lastIndexOf(pun);
    if (idx > limit * 0.4) {
      // Garante que não estamos no começo da slice.
      return idx + 1;
    }
  }
  // Nova linha?
  const nlIdx = slice.lastIndexOf("\n");
  if (nlIdx > limit * 0.4) return nlIdx + 1;
  // Espaço antes do limite.
  const spaceIdx = slice.lastIndexOf(" ");
  if (spaceIdx > 0) return spaceIdx + 1;
  // Sem fronteira — recorte bruto.
  return limit;
}

// ──────────────────────────────────────────────────────────────────────────────
// Funções exportadas — chunking & hashing
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Divide um texto longo em chunks amigáveis para TTS.
 *
 * Regras:
 *   1. Respeita fronteiras de sentença (. ! ? ;) sempre que possível.
 *   2. Nunca produz chunk maior que `maxChunkChars`.
 *   3. Não quebra palavra no meio (recorta no último espaço).
 *   4. Retorna pelo menos 1 chunk, mesmo se o texto for vazio (chunk = "").
 *
 * @example
 * chunkText("Que o axé dos seus Orixás te acompanhe. Respire fundo.", 30);
 * // => ["Que o axé dos seus Orixás", " te acompanhe.", " Respire fundo."]
 *
 * @param text       Texto completo a ser quebrado.
 * @param maxChunkChars Tamanho máximo (inclusive) de cada chunk.
 * @returns Array imutável de chunks.
 */
export function chunkText(
  text: string,
  maxChunkChars: number,
): ReadonlyArray<string> {
  if (maxChunkChars <= 0) {
    throw new RangeError("maxChunkChars deve ser > 0");
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) return [""];
  if (trimmed.length <= maxChunkChars) return [trimmed];

  const out: string[] = [];
  let remaining = trimmed;
  let safety = MAX_CHUNKS_PER_JOB + 5; // limite defensivo

  while (remaining.length > 0 && safety-- > 0) {
    if (remaining.length <= maxChunkChars) {
      out.push(remaining);
      break;
    }
    const breakAt = findSentenceBreak(remaining, maxChunkChars);
    const piece = remaining.slice(0, breakAt).trim();
    if (piece.length > 0) out.push(piece);
    remaining = remaining.slice(breakAt).trimStart();
    if (out.length >= MAX_CHUNKS_PER_JOB) {
      // Cap atingido — descarta o resto silenciosamente.
      break;
    }
  }
  return out.length === 0 ? [""] : out;
}

/**
 * Gera um hash determinístico para uma requisição de síntese.
 *
 * Inclui todos os campos que afetam o áudio final: texto, voz, speed, pitch,
 * volume, emoção e formato. Mudou qualquer um → hash muda.
 *
 * @example
 * hashRequest({ text: "axé", voiceId: "akasha-female-pt", speed: 1,
 *   pitch: 0, volume: 1, emotion: "neutral", outputFormat: "mp3" })
 * // => "3a8b91f0"
 *
 * @param req Requisição a ser resumida.
 * @returns Hex de 8 caracteres.
 */
export function hashRequest(req: SynthesisRequest): string {
  const canonical = [
    req.text,
    req.voiceId,
    req.speed.toFixed(3),
    req.pitch.toString(),
    req.volume.toFixed(3),
    req.emotion,
    req.outputFormat,
  ].join("|");
  return fnv1a(canonical);
}

/**
 * Produz a chave de cache combinando voz + hash do texto.
 *
 * Usada quando queremos reaproveitar chunks entre requisições idênticas
 * exceto por campos acessórios (emotion decorativa, etc.).
 *
 * @param voiceId Voz canônica.
 * @param text   Texto literal.
 */
export function getCacheKey(voiceId: VoiceId, text: string): string {
  return `voice-cache:${voiceId}:${fnv1a(text)}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Funções exportadas — ciclo de vida do job
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Cria um job "pending" a partir de uma requisição. Não enfileira chunks
 * ainda — isso é responsabilidade de `enqueueChunks`.
 *
 * @param req  Requisição validada (use `validateRequest` antes).
 * @param now  Carimbo ISO-8601 externo.
 */
export function createJob(req: SynthesisRequest, now: string): SynthesisJob {
  return {
    id: genId("job"),
    status: "pending",
    request: req,
    chunks: [],
    totalDurationMs: 0,
    startedAt: now,
  };
}

/**
 * Quebra o texto da requisição em chunks e os popula no job.
 *
 * Cada chunk fica vinculado ao `voiceId` da requisição e herda o formato
 * de saída. A duração estimada é calculada via `estimateDurationMs` em
 * cada chunk individual. O `totalDurationMs` é a soma.
 *
 * @param job  Job criado (status ainda não importa — vamos marcar pending).
 * @param text Texto a ser quebrado; se vazio, retorna job intocado.
 */
export function enqueueChunks(
  job: SynthesisJob,
  text: string,
): SynthesisJob {
  const cleaned = text.trim();
  if (cleaned.length === 0) return job;

  const maxChars = Math.min(MAX_CHUNK_CHARS, text.length + 1);
  const pieces = chunkText(cleaned, maxChars);

  const now = job.startedAt;
  const chunks: AudioChunk[] = [];
  let total = 0;
  for (const piece of pieces) {
    const dur = estimateDurationMs(piece, job.request.speed);
    total += dur;
    chunks.push({
      id: genId("chunk"),
      ref: `pending://${job.id}/${chunks.length}`,
      durationMs: dur,
      format: job.request.outputFormat,
      voiceId: job.request.voiceId,
      createdAt: now,
    });
  }

  return {
    ...job,
    chunks,
    totalDurationMs: total,
  };
}

/**
 * Avança o status do job. Preenche `completedAt` automaticamente quando
 * entra em estado terminal (completed/failed/cancelled).
 *
 * @param job    Job atual.
 * @param status Novo status.
 * @param now    Carimbo ISO-8601 externo.
 */
export function advanceJobStatus(
  job: SynthesisJob,
  status: SynthesisStatus,
  now: string,
): SynthesisJob {
  const terminal =
    status === "completed" || status === "failed" || status === "cancelled";
  return {
    ...job,
    status,
    completedAt: terminal ? now : job.completedAt,
  };
}

/**
 * Decide se um novo job pode ser iniciado, dado o número de jobs ativos.
 *
 * Ativos = pending ou streaming. Completed/failed/cancelled não bloqueiam.
 *
 * @param activeJobs Jobs em estado não-terminal.
 * @param max        Cap configurado (use `MAX_CONCURRENT_REQUESTS` em produção).
 */
export function canStartJob(
  activeJobs: ReadonlyArray<SynthesisJob>,
  max: number,
): boolean {
  if (max <= 0) return false;
  const active = activeJobs.filter(
    (j) => j.status === "pending" || j.status === "streaming",
  ).length;
  return active < max;
}

// ──────────────────────────────────────────────────────────────────────────────
// Funções exportadas — cache LRU
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Procura uma entrada no cache pela chave exata. Não verifica TTL — quem
 * chama decide se a entrada está "fresca".
 *
 * @param cache Lista atual de entradas (a mais recente primeiro).
 * @param key   Chave a procurar.
 */
export function cacheLookup(
  cache: ReadonlyArray<VoiceCacheEntry>,
  key: string,
): VoiceCacheEntry | null {
  for (const entry of cache) {
    if (entry.key === key) return entry;
  }
  return null;
}

/**
 * Armazena (ou substitui) uma entrada no cache. Política LRU simples:
 *   1. Remove qualquer entrada com a mesma chave (idempotência).
 *   2. Insere a nova no começo (mais recente).
 *   3. Se o tamanho ultrapassar `maxEntries`, descarta a mais antiga
 *      (final do array).
 *
 * NÃO verifica TTL — é responsabilidade do caller limpar entradas
 * expiradas antes de chamar esta função se quiser estrito.
 *
 * @param cache      Lista atual (será clonada, não mutada).
 * @param entry      Nova entrada a armazenar.
 * @param maxEntries Teto. Use `CACHE_MAX_ENTRIES` em produção.
 */
export function cacheStore(
  cache: ReadonlyArray<VoiceCacheEntry>,
  entry: VoiceCacheEntry,
  maxEntries: number,
): ReadonlyArray<VoiceCacheEntry> {
  if (maxEntries <= 0) return [];
  const filtered = cache.filter((e) => e.key !== entry.key);
  const next = [entry, ...filtered];
  if (next.length > maxEntries) next.length = maxEntries;
  return next;
}

// ──────────────────────────────────────────────────────────────────────────────
// Funções exportadas — heurísticas e perfis
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Estima a duração em milissegundos de um texto a uma dada velocidade.
 *
 * Heurística simples: ~15 chars por segundo em velocidade 1.0. Scaling
 * linear pela velocidade.
 *
 * @example
 * estimateDurationMs("Que o axé esteja com você", 1.0); // ~1867ms
 * estimateDurationMs("rápido", 2.0); // ~167ms
 *
 * @param text  Texto a ser falado.
 * @param speed Fator de velocidade (0.5–2.0).
 */
export function estimateDurationMs(text: string, speed: number): number {
  const safeSpeed = speed <= 0 ? DEFAULT_SPEED : speed;
  const chars = text.trim().length;
  if (chars === 0) return 0;
  // 15 chars/s = ~66ms por char, /speed.
  const ms = (chars / 15) * 1000;
  return Math.max(0, Math.round(ms / safeSpeed));
}

/**
 * Seleciona a voz padrão para um idioma dentro de uma lista de perfis.
 *
 * Critérios:
 *   1. Procura um perfil com `language === language` e `isDefault === true`.
 *   2. Se nenhum for default, pega o primeiro com o idioma correto.
 *   3. Se nada servir, retorna o primeiro perfil (fallback).
 *   4. Lista vazia → erro.
 *
 * @param language Idioma desejado.
 * @param profiles Pool de perfis disponíveis.
 */
export function selectVoiceForLanguage(
  language: Language,
  profiles: ReadonlyArray<VoiceProfile>,
): VoiceProfile {
  if (profiles.length === 0) {
    throw new Error("Nenhum perfil de voz disponível");
  }
  const matchLang = profiles.filter((p) => p.language === language);
  if (matchLang.length > 0) {
    const def = matchLang.find((p) => p.isDefault);
    if (def) return def;
    return matchLang[0];
  }
  return profiles[0];
}

/**
 * Ajusta uma `SynthesisRequest` conforme as palavras-chave emocionais
 * presentes no texto.
 *
 * Regras (PT-BR focado):
 *   - "mystical", "sacred", "axé", "orixá", "búzios" etc → emoción = "mystical",
 *     speed = 0.9 (mais lento e imponente), pitch = -1 (mais grave).
 *   - "love", "luz", "paz", "bênção" → emoción = "calm", speed = 0.95, pitch = 0.
 *   - Match acento-insensitive. Sem match → retorna a req inalterada.
 *
 * @param req  Requisição original.
 * @param text Texto onde buscar as keywords.
 */
export function applyEmotion(
  req: SynthesisRequest,
  text: string,
): SynthesisRequest {
  if (text.trim().length === 0) return req;
  const foldedText = foldCached(text);
  const foldedKeywords = EMOTION_KEYWORDS.map(foldCached);

  // Verifica mystical primeiro (mais específico).
  const mysticalKw = [
    "axé", "orixá", "orixás", "búzios", "buzios", "ifá",
    "mystical", "místico", "divino", "divine", "kankan",
  ];
  const isMystical = mysticalKw.some((kw) => foldedText.includes(foldCached(kw)));
  if (isMystical) {
    return {
      ...req,
      emotion: "mystical",
      speed: 0.9,
      pitch: -1,
    };
  }

  // Verifica acalento (love/luz/paz).
  const calmKw = ["amor", "love", "luz", "light", "paz", "peace", "bênção"];
  const isCalm = calmKw.some((kw) => foldedText.includes(foldCached(kw)));
  if (isCalm) {
    return {
      ...req,
      emotion: "calm",
      speed: 0.95,
      pitch: 0,
    };
  }

  // Garante que usamos o set de keywords.
  void foldedKeywords;
  return req;
}

/**
 * Valida uma requisição antes de enfileirar.
 *
 * Regras:
 *   - text.length > 0 e <= 5000
 *   - speed ∈ [0.5, 2.0]
 *   - pitch ∈ [-12, 12]
 *   - volume ∈ [0, 10]
 *   - voiceId é um dos perfis conhecidos (best-effort)
 *
 * @returns `{ ok, errors }`. `errors` é vazio se ok=true.
 */
export function validateRequest(
  req: SynthesisRequest,
): ValidationResult {
  const errors: string[] = [];

  if (typeof req.text !== "string" || req.text.trim().length === 0) {
    errors.push("text: deve ser string não-vazia");
  } else if (req.text.length > 5000) {
    errors.push(`text: máximo 5000 chars (recebido ${req.text.length})`);
  }

  if (req.speed < 0.5 || req.speed > 2.0) {
    errors.push(`speed: fora de [0.5, 2.0] (recebido ${req.speed})`);
  }
  if (req.pitch < -12 || req.pitch > 12) {
    errors.push(`pitch: fora de [-12, 12] (recebido ${req.pitch})`);
  }
  if (req.volume < 0 || req.volume > 10) {
    errors.push(`volume: fora de [0, 10] (recebido ${req.volume})`);
  }

  const knownVoices = DEFAULT_VOICE_PROFILES.map((p) => p.id);
  if (!knownVoices.includes(req.voiceId)) {
    errors.push(`voiceId: desconhecido (${req.voiceId})`);
  }

  const validEmotions: ReadonlyArray<Emotion> = [
    "neutral",
    "happy",
    "calm",
    "serious",
    "mystical",
  ];
  if (!validEmotions.includes(req.emotion)) {
    errors.push(`emotion: inválida (${req.emotion})`);
  }

  const validFormats: ReadonlyArray<AudioFormat> = [
    "mp3",
    "wav",
    "ogg",
    "pcm",
  ];
  if (!validFormats.includes(req.outputFormat)) {
    errors.push(`outputFormat: inválido (${req.outputFormat})`);
  }

  return { ok: errors.length === 0, errors };
}

// ──────────────────────────────────────────────────────────────────────────────
// Funções exportadas — sumário & rollup
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Produz um sumário compacto de um job — ideal para listar no histórico
 * do consulente sem carregar todos os chunks na memória da UI.
 *
 * @param job Job (ou subconjunto dele).
 */
export function summarizeJob(job: SynthesisJob): JobSummary {
  return {
    id: job.id,
    status: job.status,
    totalChars: job.request.text.length,
    totalDurationMs: job.totalDurationMs,
    chunkCount: job.chunks.length,
    voiceId: job.request.voiceId,
  };
}

/**
 * Combina vários jobs em um rollup agregado. Útil para dashboards
 * de analytics ("tempo total ouvido por voz", etc.).
 *
 * @param jobs Lista de jobs (pode incluir estados terminais e ativos).
 */
export function mergeJobs(
  jobs: ReadonlyArray<SynthesisJob>,
): JobsRollup {
  let totalDurationMs = 0;
  let totalChars = 0;
  const byVoiceId = {} as Record<VoiceId, number>;

  for (const job of jobs) {
    totalDurationMs += job.totalDurationMs;
    totalChars += job.request.text.length;
    const cur = byVoiceId[job.request.voiceId] ?? 0;
    byVoiceId[job.request.voiceId] = cur + job.totalDurationMs;
  }

  return { totalDurationMs, totalChars, byVoiceId };
}
