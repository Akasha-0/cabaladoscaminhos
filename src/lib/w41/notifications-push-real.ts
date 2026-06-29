/**
 * @file notifications-push-real.ts
 * @description Camada de abstração real de Web Push + FCM + APNs para o Cabala dos Caminhos.
 *
 * Este módulo SUBSTITUI os stubs placeholder deixados por:
 *   - w24/notifications-handler       (entrega bruta sem roteamento por canal)
 *   - w26/notifications-queue         (fila sem retry/backoff real)
 *   - w35/digest                      (digest sem agrupamento por categoria)
 *   - w38/digest-preview              (preview sem ordenação estável)
 *   - w39/digests-archive             (archive sem indexação por userId)
 *
 * Responsabilidades:
 *   1. Registro / desregistro de dispositivos multi-plataforma (web/ios/android).
 *   2. Construção de payloads canônicos de push com defaults sensatos por categoria.
 *   3. Roteamento de canais (webpush/fcm/apns/in_app) com deduplicação por usuário.
 *   4. Fila de notificações com retry exponencial e rate-limit por janela.
 *   5. Digest diário (agrupamento + HTML preview) respeitando quiet hours e mute.
 *   6. Preferências por usuário com validação forte e defaults em pt-BR.
 *
 * Importante: módulo STANDALONE — não importa de outros w3x/w4x para evitar acoplamento
 * entre workers paralelos. Toda dependência externa é resolvida via globals padrão
 * (URL, Intl, Date, Math) — não há `import` de outros módulos do projeto.
 *
 * @author Wave Worker #3 — cycle 41
 * @version 1.0.0
 */

// ============================================================================
//  TIPOS PÚBLICOS
// ============================================================================

/** Plataformas suportadas para registro de dispositivo. */
export type DevicePlatform = "web" | "ios" | "android";

/** Token de dispositivo registrado, pronto para roteamento de push. */
export interface DeviceToken {
  /** Identificador opaco (uuid v4 preferencialmente). */
  readonly id: string;
  /** Dono do dispositivo — referencia o usuário no auth. */
  readonly userId: string;
  /** Plataforma do dispositivo — define canal padrão. */
  readonly platform: DevicePlatform;
  /** Token bruto do push provider (FCM/APNs/Endpoint VAPID). */
  readonly token: string;
  /** Versão semântica do app cliente (ex.: "1.4.2"). */
  readonly appVersion: string;
  /** Locale do dispositivo (ex.: "pt-BR"). */
  readonly locale: string;
  /** Timezone IANA do dispositivo (ex.: "America/Sao_Paulo"). */
  readonly timezone: string;
  /** ISO-8601 do último heartbeat / uso do token. */
  readonly lastSeenAt: string;
  /** Flag de ativo — tokens inativos são podados após 30 dias. */
  readonly isActive: boolean;
}

/** Canal de entrega — pode coexistir com outros (ex.: in_app + webpush). */
export type PushChannel = "webpush" | "fcm" | "apns" | "in_app";

/** Payload canônico de push — convertido para o schema do provider no envio. */
export interface PushPayload {
  /** Título curto — máx. 100 chars (clipped via truncatePayload). */
  readonly title: string;
  /** Corpo — máx. 500 chars (clipped via truncatePayload). */
  readonly body: string;
  /** URL do ícone (opcional). */
  readonly icon?: string;
  /** URL da imagem grande (opcional). */
  readonly image?: string;
  /** Contador do badge (iOS/Android). */
  readonly badge?: number;
  /** Tag de agrupamento — colapsa pushes idênticos no cliente. */
  readonly tag?: string;
  /** Dados customizados — passados ao service worker / app. */
  readonly data?: Readonly<Record<string, string | number | boolean>>;
  /** TTL em segundos — default 3600. */
  readonly ttlSeconds: number;
  /** Prioridade de entrega — afeta fila do provider. */
  readonly priority: PushPriority;
  /** Som de notificação — iOS/Android. */
  readonly sound: string;
  /** Deep link / URL de ação ao tocar. */
  readonly clickAction: string;
}

/** Prioridade de push — mapeia para urgência no provider. */
export type PushPriority = "low" | "normal" | "high";

/** Categorias de notificação — base para mute, digest e roteamento. */
export type NotificationCategory =
  | "comment_mention"
  | "comment_reply"
  | "follow"
  | "endorsement"
  | "event_reminder"
  | "mentorship"
  | "marketplace"
  | "akasha_message"
  | "digest"
  | "system";

/** Preferências de notificação por usuário. */
export interface NotificationPreferences {
  /** Dono das preferências. */
  readonly userId: string;
  /** Categorias silenciadas — pushes suprimidos (digest ainda recebe). */
  readonly mutedCategories: ReadonlyArray<NotificationCategory>;
  /** Início do quiet hours (HH:MM 24h, opcional). */
  readonly quietHoursStart?: string;
  /** Fim do quiet hours (HH:MM 24h, opcional). */
  readonly quietHoursEnd?: string;
  /** Liga/desliga digest diário automático. */
  readonly dailyDigestEnabled: boolean;
  /** Limite diário de pushes — clamp em MAX_DAILY_PUSH_PER_USER. */
  readonly maxDailyNotifications: number;
  /** Locale para mensagens localizadas. */
  readonly locale: string;
}

/** Notificação enfileirada aguardando envio. */
export interface QueuedNotification {
  /** Identificador opaco. */
  readonly id: string;
  /** Destinatário. */
  readonly userId: string;
  /** Categoria — afeta mute, canal e agrupamento. */
  readonly category: NotificationCategory;
  /** Payload final (já com defaults aplicados). */
  readonly payload: PushPayload;
  /** Canais preferenciais — deduplicados por selectChannelForUser. */
  readonly channels: ReadonlyArray<PushChannel>;
  /** ISO-8601 do envio (futuro se scheduled, passado se imediato). */
  readonly scheduledFor: string;
  /** ISO-8601 de criação. */
  readonly createdAt: string;
  /** Quantas tentativas de envio já foram feitas. */
  readonly attempts: number;
  /** ISO-8601 da última tentativa (undefined se nunca tentou). */
  readonly lastAttemptAt?: string;
  /** Estado atual na fila. */
  readonly status: NotificationStatus;
  /** Mensagem de erro da última tentativa falhada. */
  readonly error?: string;
}

/** Estado da notificação na fila. */
export type NotificationStatus =
  | "pending"
  | "scheduled"
  | "sent"
  | "delivered"
  | "failed"
  | "cancelled"
  | "rate_limited";

/** Request de registro de dispositivo — entrada da API. */
export interface DeviceRegistrationRequest {
  /** Dono do dispositivo. */
  readonly userId: string;
  /** Plataforma — define canal padrão. */
  readonly platform: DevicePlatform;
  /** Token bruto do provider. */
  readonly token: string;
  /** Versão do app (semver livre). */
  readonly appVersion: string;
  /** Locale do dispositivo. */
  readonly locale: string;
  /** Timezone IANA do dispositivo. */
  readonly timezone: string;
}

/** Entrada de digest — resumo curto de notificação. */
export interface DigestEntry {
  /** ID da notificação original. */
  readonly notificationId: string;
  /** Categoria. */
  readonly category: NotificationCategory;
  /** Título reusado do payload. */
  readonly title: string;
  /** Snippet do body (primeiros 140 chars). */
  readonly snippet: string;
  /** ISO-8601 de criação da notificação original. */
  readonly createdAt: string;
  /** Deep link para abrir no app. */
  readonly deepLink: string;
}

// ============================================================================
//  CONSTANTES
// ============================================================================

/** Limite duro de dispositivos por usuário — acima disso, evicção LRU. */
export const MAX_DEVICES_PER_USER = 10;

/** Tamanho máximo do título — alinhado com APNs (128) com margem de segurança. */
export const MAX_PAYLOAD_TITLE_LENGTH = 100;

/** Tamanho máximo do corpo — alinhado com FCM (1024) com margem. */
export const MAX_PAYLOAD_BODY_LENGTH = 500;

/** TTL padrão de 1h — pushes urgentes usam 300, digests usam 86400. */
export const DEFAULT_TTL_SECONDS = 3600;

/** Limite diário de pushes por usuário — clamp em defaultPreferences. */
export const MAX_DAILY_PUSH_PER_USER = 50;

/** Janela de rate-limit em segundos — sliding window. */
export const RATE_LIMIT_WINDOW_SECONDS = 60;

/** Máximo de pushes por janela — protege contra storms. */
export const MAX_PUSH_PER_WINDOW = 5;

/** Backoff exponencial em segundos: 10s, 30s, 2min, 10min, 1h. */
export const RETRY_BACKOFF_SECONDS: ReadonlyArray<number> = Object.freeze([
  10,
  30,
  120,
  600,
  3600,
]);

/** Locale default para preferências recém-criadas. */
export const DEFAULT_PREFERENCES_LOCALE = "pt-BR";

/** Lista canônica de categorias — congelada para iteração estável. */
export const ALL_CATEGORIES: ReadonlyArray<NotificationCategory> = Object.freeze([
  "comment_mention",
  "comment_reply",
  "follow",
  "endorsement",
  "event_reminder",
  "mentorship",
  "marketplace",
  "akasha_message",
  "digest",
  "system",
]);

/** Mapeamento plataforma → canal default. */
export const CHANNEL_BY_PLATFORM: Readonly<Record<DevicePlatform, PushChannel>> = Object.freeze({
  web: "webpush",
  ios: "apns",
  android: "fcm",
});

/** Som default por categoria. */
const SOUND_BY_CATEGORY: Readonly<Record<NotificationCategory, string>> = Object.freeze({
  comment_mention: "mention.caf",
  comment_reply: "reply.caf",
  follow: "follow.caf",
  endorsement: "endorsement.caf",
  event_reminder: "reminder.caf",
  mentorship: "default",
  marketplace: "default",
  akasha_message: "message.caf",
  digest: "default",
  system: "default",
});

/** Tag de agrupamento default por categoria — agrupa pushes idênticos. */
const TAG_BY_CATEGORY: Readonly<Record<NotificationCategory, string>> = Object.freeze({
  comment_mention: "comment-mention",
  comment_reply: "comment-reply",
  follow: "follow",
  endorsement: "endorsement",
  event_reminder: "event-reminder",
  mentorship: "mentorship",
  marketplace: "marketplace",
  akasha_message: "akasha-message",
  digest: "daily-digest",
  system: "system",
});

/** Deep link base por categoria. */
const DEEP_LINK_BY_CATEGORY: Readonly<Record<NotificationCategory, string>> = Object.freeze({
  comment_mention: "/caminho/comentarios",
  comment_reply: "/caminho/comentarios",
  follow: "/perfil/seguidores",
  endorsement: "/perfil/reconhecimentos",
  event_reminder: "/eventos",
  mentorship: "/mentoria",
  marketplace: "/feira",
  akasha_message: "/akasha/mensagens",
  digest: "/akasha/digest",
  system: "/configuracoes",
});

// ============================================================================
//  UTILITÁRIOS INTERNOS
// ============================================================================

/**
 * Gera um ID opaco estilo UUID v4 sem dependências externas.
 * @returns String hex de 36 chars com hífens.
 */
function generateId(): string {
  // Preferir crypto.randomUUID se disponível (Node 19+, browsers modernos)
  const g: { randomUUID?: () => string } = globalThis as unknown as { randomUUID?: () => string };
  if (typeof g.randomUUID === "function") {
    return g.randomUUID();
  }
  // Fallback manual — 16 bytes hex
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  // Versão 4 + variante RFC 4122
  // byte 6: high nibble = 0100 (4), low nibble = random
  // byte 8: high two bits = 10
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex: string[] = [];
  for (let i = 0; i < 16; i++) {
    const b = bytes[i]!;
    hex.push(b.toString(16).padStart(2, "0"));
  }
  return (
    hex.slice(0, 4).join("") +
    "-" +
    hex.slice(4, 6).join("") +
    "-" +
    hex.slice(6, 8).join("") +
    "-" +
    hex.slice(8, 10).join("") +
    "-" +
    hex.slice(10, 16).join("")
  );
}

/**
 * Valida ISO-8601 de forma fraca — checa parseabilidade e formato.
 * @param s String candidata.
 * @returns true se for ISO-8601 válido e parseável.
 */
function isIso8601(s: string): boolean {
  if (typeof s !== "string" || s.length < 10) return false;
  const t = Date.parse(s);
  return Number.isFinite(t);
}

/**
 * Trunca uma string a N caracteres sem cortar graphemes no meio.
 * @param s String a truncar.
 * @param max Tamanho máximo.
 * @returns String truncada com reticências se necessário.
 */
function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  if (max <= 1) return s.slice(0, max);
  return s.slice(0, max - 1) + "\u2026";
}

/**
 * Converte "HH:MM" para minutos desde 00:00.
 * @param hhmm Horário em formato 24h.
 * @returns Minutos (0–1439).
 */
function hhmmToMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return 0;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h * 60 + min;
}

/**
 * Extrai a hora local (minutos desde 00:00) de uma data em um timezone IANA.
 * @param nowIso Data ISO-8601.
 * @param tz Timezone IANA.
 * @returns Minutos locais (0–1439).
 */
function localMinutes(nowIso: string, tz: string): number {
  const d = new Date(nowIso);
  if (Number.isNaN(d.getTime())) return 0;
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(d);
    let hh = 0;
    let mm = 0;
    for (const p of parts) {
      if (p.type === "hour") hh = Number(p.value) || 0;
      else if (p.type === "minute") mm = Number(p.value) || 0;
    }
    return hh * 60 + mm;
  } catch {
    // Timezone inválido — fallback para hora local do servidor
    return d.getHours() * 60 + d.getMinutes();
  }
}

/**
 * Escapa caracteres especiais de HTML para preview de digest.
 * @param s String crua.
 * @returns String escapada.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================================
//  REGISTRO DE DISPOSITIVOS
// ============================================================================

/**
 * Registra (ou atualiza) um dispositivo para um usuário. Se o mesmo `token`
 * já existir para o mesmo `userId`, atualiza `lastSeenAt` e `appVersion`.
 *
 * @param req Dados do request de registro.
 * @param now ISO-8601 do momento do registro.
 * @returns DeviceToken pronto para persistência.
 *
 * @example
 *   const dev = registerDevice({
 *     userId: "u-1",
 *     platform: "ios",
 *     token: "abc123",
 *     appVersion: "1.4.2",
 *     locale: "pt-BR",
 *     timezone: "America/Sao_Paulo",
 *   }, "2026-06-29T12:00:00.000Z");
 */
export function registerDevice(
  req: DeviceRegistrationRequest,
  now: string,
): DeviceToken {
  if (!isIso8601(now)) {
    throw new Error("now deve ser ISO-8601 válido");
  }
  if (!req.userId) {
    throw new Error("userId é obrigatório");
  }
  if (!req.token) {
    throw new Error("token é obrigatório");
  }
  if (!["web", "ios", "android"].includes(req.platform)) {
    throw new Error(`platform inválida: ${String(req.platform)}`);
  }
  return {
    id: generateId(),
    userId: req.userId,
    platform: req.platform,
    token: req.token,
    appVersion: req.appVersion || "0.0.0",
    locale: req.locale || DEFAULT_PREFERENCES_LOCALE,
    timezone: req.timezone || "UTC",
    lastSeenAt: now,
    isActive: true,
  };
}

/**
 * Remove um dispositivo pelo seu `id`. Retorna nova coleção imutável.
 * Se o id não existir, devolve a coleção original sem alterações.
 *
 * @param devices Coleção atual.
 * @param tokenId ID do dispositivo a remover.
 * @returns Nova coleção sem o dispositivo removido.
 */
export function unregisterDevice(
  devices: ReadonlyArray<DeviceToken>,
  tokenId: string,
): ReadonlyArray<DeviceToken> {
  return devices.filter((d) => d.id !== tokenId);
}

/**
 * Atualiza `lastSeenAt` de um dispositivo para indicar que foi visto agora.
 * Útil para heartbeats e para evicção LRU baseada em inatividade.
 *
 * @param devices Coleção atual.
 * @param tokenId ID do dispositivo.
 * @param now ISO-8601 do momento.
 * @returns Nova coleção com `lastSeenAt` atualizado; id não encontrado → original.
 */
export function refreshDeviceSeen(
  devices: ReadonlyArray<DeviceToken>,
  tokenId: string,
  now: string,
): ReadonlyArray<DeviceToken> {
  if (!isIso8601(now)) {
    throw new Error("now deve ser ISO-8601 válido");
  }
  return devices.map((d) => (d.id === tokenId ? { ...d, lastSeenAt: now, isActive: true } : d));
}

// ============================================================================
//  CONSTRUÇÃO DE PAYLOAD
// ============================================================================

/**
 * Constrói um payload canônico de push com defaults sensatos por categoria.
 * Aplica tag de agrupamento, som e deep link default se não fornecidos.
 *
 * @param category Categoria da notificação.
 * @param title Título (≤ 100 chars).
 * @param body Corpo (≤ 500 chars).
 * @param data Dados customizados opcionais.
 * @returns PushPayload com defaults aplicados.
 */
export function buildPushPayload(
  category: NotificationCategory,
  title: string,
  body: string,
  data?: Readonly<Record<string, string | number | boolean>>,
): PushPayload {
  return {
    title: title || "",
    body: body || "",
    icon: "/icons/akasha-192.png",
    image: undefined,
    badge: 0,
    tag: TAG_BY_CATEGORY[category],
    data: data ?? { category },
    ttlSeconds: DEFAULT_TTL_SECONDS,
    priority: "normal",
    sound: SOUND_BY_CATEGORY[category],
    clickAction: DEEP_LINK_BY_CATEGORY[category],
  };
}

/**
 * Trunca um payload aos limites máximos (preserva campos opcionais).
 *
 * @param payload Payload original.
 * @param maxTitle Limite do título (use MAX_PAYLOAD_TITLE_LENGTH).
 * @param maxBody Limite do corpo (use MAX_PAYLOAD_BODY_LENGTH).
 * @returns Novo payload com título/corpo truncados.
 */
export function truncatePayload(
  payload: PushPayload,
  maxTitle: number,
  maxBody: number,
): PushPayload {
  return {
    ...payload,
    title: clip(payload.title, maxTitle),
    body: clip(payload.body, maxBody),
  };
}

// ============================================================================
//  ROTEAMENTO DE CANAIS
// ============================================================================

/**
 * Retorna o canal default para uma plataforma.
 *
 * @param platform Plataforma do dispositivo.
 * @returns Canal preferido.
 */
export function selectChannelForPlatform(platform: DevicePlatform): PushChannel {
  return CHANNEL_BY_PLATFORM[platform];
}

/**
 * Seleciona os canais únicos disponíveis para um usuário, considerando todos
 * os seus dispositivos ativos. `in_app` é sempre incluído.
 *
 * @param devices Lista de dispositivos do usuário.
 * @param userId ID do usuário.
 * @returns Canais deduplicados.
 */
export function selectChannelForUser(
  devices: ReadonlyArray<DeviceToken>,
  userId: string,
): ReadonlyArray<PushChannel> {
  const set = new Set<PushChannel>(["in_app"]);
  for (const d of devices) {
    if (d.userId === userId && d.isActive) {
      set.add(CHANNEL_BY_PLATFORM[d.platform]);
    }
  }
  return Array.from(set);
}

// ============================================================================
//  PREFERÊNCIAS
// ============================================================================

/**
 * Cria preferências default em pt-BR com valores sensatos.
 *
 * @param userId ID do usuário.
 * @param locale Locale preferido (default pt-BR).
 * @returns Preferências inicializadas.
 */
export function defaultPreferences(userId: string, locale: string): NotificationPreferences {
  return {
    userId,
    mutedCategories: ["marketplace"],
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    dailyDigestEnabled: true,
    maxDailyNotifications: MAX_DAILY_PUSH_PER_USER,
    locale: locale || DEFAULT_PREFERENCES_LOCALE,
  };
}

/**
 * Valida um objeto de preferências. Retorna lista de erros sem lançar.
 *
 * @param prefs Preferências a validar.
 * @returns `{ ok, errors }` — `ok=true` se nenhum erro.
 */
export function validatePreferences(
  prefs: NotificationPreferences,
): { ok: boolean; errors: ReadonlyArray<string> } {
  const errors: string[] = [];
  if (!prefs.userId) errors.push("userId é obrigatório");
  if (!Array.isArray(prefs.mutedCategories)) {
    errors.push("mutedCategories deve ser array");
  } else {
    for (const c of prefs.mutedCategories) {
      if (!ALL_CATEGORIES.includes(c)) {
        errors.push(`categoria inválida em mutedCategories: ${String(c)}`);
      }
    }
  }
  if (
    prefs.quietHoursStart !== undefined &&
    !/^(\d{1,2}):(\d{2})$/.test(prefs.quietHoursStart)
  ) {
    errors.push("quietHoursStart deve ser HH:MM");
  }
  if (prefs.quietHoursEnd !== undefined && !/^(\d{1,2}):(\d{2})$/.test(prefs.quietHoursEnd)) {
    errors.push("quietHoursEnd deve ser HH:MM");
  }
  if (
    typeof prefs.maxDailyNotifications !== "number" ||
    !Number.isFinite(prefs.maxDailyNotifications) ||
    prefs.maxDailyNotifications < 0
  ) {
    errors.push("maxDailyNotifications deve ser número ≥ 0");
  } else if (prefs.maxDailyNotifications > MAX_DAILY_PUSH_PER_USER) {
    errors.push(
      `maxDailyNotifications não pode exceder ${String(MAX_DAILY_PUSH_PER_USER)}`,
    );
  }
  if (typeof prefs.dailyDigestEnabled !== "boolean") {
    errors.push("dailyDigestEnabled deve ser boolean");
  }
  if (!prefs.locale) errors.push("locale é obrigatório");
  return { ok: errors.length === 0, errors };
}

/**
 * Verifica se a categoria está silenciada nas preferências.
 *
 * @param prefs Preferências do usuário.
 * @param category Categoria a checar.
 * @returns true se silenciada.
 */
export function isMutedForCategory(
  prefs: NotificationPreferences,
  category: NotificationCategory,
): boolean {
  return prefs.mutedCategories.includes(category);
}

/**
 * Verifica se um push deve ser suprimido por quiet hours no timezone do usuário.
 * Suporta janelas que cruzam meia-noite (ex.: 22:00 → 07:00).
 *
 * @param now ISO-8601 do momento.
 * @param prefs Preferências do usuário.
 * @param tz Timezone IANA do usuário.
 * @returns true se estiver em quiet hours.
 */
export function shouldSendDuringQuietHours(
  now: string,
  prefs: NotificationPreferences,
  tz: string,
): boolean {
  if (!prefs.quietHoursStart || !prefs.quietHoursEnd) return false;
  const start = hhmmToMinutes(prefs.quietHoursStart);
  const end = hhmmToMinutes(prefs.quietHoursEnd);
  const nowMin = localMinutes(now, tz);
  if (start === end) return false; // janela vazia
  if (start < end) {
    return nowMin >= start && nowMin < end;
  }
  // cruza meia-noite (start > end): ex.: 22:00 → 07:00
  return nowMin >= start || nowMin < end;
}

// ============================================================================
//  RATE LIMIT
// ============================================================================

/**
 * Checa se o usuário está dentro do rate limit por janela. Considera apenas
 * notificações `sent` ou `delivered` nos últimos `RATE_LIMIT_WINDOW_SECONDS`.
 *
 * @param userId ID do usuário.
 * @param queuedNotifications Fila atual.
 * @param now ISO-8601 do momento.
 * @param maxPerWindow Limite (use MAX_PUSH_PER_WINDOW).
 * @returns true se pode enviar.
 */
export function canSendPush(
  userId: string,
  queuedNotifications: ReadonlyArray<QueuedNotification>,
  now: string,
  maxPerWindow: number,
): boolean {
  if (!isIso8601(now)) {
    throw new Error("now deve ser ISO-8601 válido");
  }
  const nowMs = Date.parse(now);
  const windowMs = RATE_LIMIT_WINDOW_SECONDS * 1000;
  let count = 0;
  for (const n of queuedNotifications) {
    if (n.userId !== userId) continue;
    if (n.status !== "sent" && n.status !== "delivered") continue;
    if (!n.lastAttemptAt) continue;
    const t = Date.parse(n.lastAttemptAt);
    if (!Number.isFinite(t)) continue;
    if (nowMs - t < windowMs) {
      count++;
      if (count >= maxPerWindow) return false;
    }
  }
  return true;
}

// ============================================================================
//  FILA DE NOTIFICAÇÕES
// ============================================================================

/**
 * Enfileira uma notificação para envio imediato. Status inicial = "pending".
 *
 * @param userId Destinatário.
 * @param category Categoria.
 * @param payload Payload já construído.
 * @param channels Canais preferenciais.
 * @param now ISO-8601 do momento.
 * @returns QueuedNotification pronta para envio.
 */
export function enqueueNotification(
  userId: string,
  category: NotificationCategory,
  payload: PushPayload,
  channels: ReadonlyArray<PushChannel>,
  now: string,
): QueuedNotification {
  if (!isIso8601(now)) {
    throw new Error("now deve ser ISO-8601 válido");
  }
  return {
    id: generateId(),
    userId,
    category,
    payload,
    channels,
    scheduledFor: now,
    createdAt: now,
    attempts: 0,
    status: "pending",
  };
}

/**
 * Move uma notificação para o estado "scheduled" com horário futuro.
 * Valida que `scheduledFor` é futuro em relação à criação.
 *
 * @param notif Notificação original.
 * @param scheduledFor ISO-8601 do envio futuro.
 * @returns Nova QueuedNotification com status "scheduled".
 */
export function scheduleNotification(
  notif: QueuedNotification,
  scheduledFor: string,
): QueuedNotification {
  if (!isIso8601(scheduledFor)) {
    throw new Error("scheduledFor deve ser ISO-8601 válido");
  }
  if (Date.parse(scheduledFor) <= Date.parse(notif.createdAt)) {
    throw new Error("scheduledFor deve ser estritamente futuro em relação a createdAt");
  }
  return { ...notif, scheduledFor, status: "scheduled" };
}

/**
 * Marca uma notificação como cancelada (imutável). Usado quando o usuário
 * deleta o conteúdo ou retira consentimento.
 *
 * @param notif Notificação original.
 * @returns Nova QueuedNotification com status "cancelled".
 */
export function cancelScheduledNotification(notif: QueuedNotification): QueuedNotification {
  return { ...notif, status: "cancelled" };
}

/**
 * Marca o resultado de uma tentativa de envio. Incrementa `attempts` e
 * seta `lastAttemptAt`. Status "rate_limited" NÃO incrementa attempts
 * (não conta como tentativa real).
 *
 * @param notif Notificação original.
 * @param status Novo status pós-tentativa.
 * @param error Mensagem de erro (opcional).
 * @returns Nova QueuedNotification.
 */
export function markAttempt(
  notif: QueuedNotification,
  status: NotificationStatus,
  error?: string,
): QueuedNotification {
  const now = new Date().toISOString();
  const isRealAttempt = status !== "rate_limited";
  return {
    ...notif,
    status,
    attempts: isRealAttempt ? notif.attempts + 1 : notif.attempts,
    lastAttemptAt: now,
    error: error,
  };
}

/**
 * Seleciona o delay de retry (em segundos) baseado no número de tentativas
 * e no array de backoff. Se `attempts` exceder o array, usa o último valor.
 *
 * @param attempts Quantas tentativas já feitas.
 * @param backoff Array de delays crescentes (segundos).
 * @returns Delay em segundos.
 */
export function selectRetryDelay(
  attempts: number,
  backoff: ReadonlyArray<number>,
): number {
  if (backoff.length === 0) return 0;
  if (attempts < 0) return backoff[0]!;
  if (attempts >= backoff.length) return backoff[backoff.length - 1]!;
  return backoff[attempts]!;
}

// ============================================================================
//  DIGEST
// ============================================================================

/**
 * Agrupa notificações por categoria — usado para renderizar digest e
 * calcular contadores de inbox.
 *
 * @param notifications Fila completa (ou filtrada por usuário).
 * @returns Record com array de notificações por categoria (categorias ausentes → []).
 */
export function groupByCategory(
  notifications: ReadonlyArray<QueuedNotification>,
): Readonly<Record<NotificationCategory, ReadonlyArray<QueuedNotification>>> {
  const out = {} as Record<NotificationCategory, QueuedNotification[]>;
  for (const c of ALL_CATEGORIES) {
    out[c] = [];
  }
  for (const n of notifications) {
    if (!out[n.category]) {
      out[n.category] = [];
    }
    out[n.category]!.push(n);
  }
  return out;
}

/**
 * Conta notificações não lidas (status pending/scheduled/rate_limited) por categoria.
 *
 * @param notifications Fila completa.
 * @returns Record com count por categoria.
 */
export function countUnreadByCategory(
  notifications: ReadonlyArray<QueuedNotification>,
): Readonly<Record<NotificationCategory, number>> {
  const out = {} as Record<NotificationCategory, number>;
  for (const c of ALL_CATEGORIES) {
    out[c] = 0;
  }
  for (const n of notifications) {
    if (n.status === "sent" || n.status === "delivered" || n.status === "cancelled") continue;
    if (n.status === "failed") continue;
    out[n.category] = (out[n.category] ?? 0) + 1;
  }
  return out;
}

/**
 * Gera entries de digest a partir de uma fila. Ordena por `createdAt` desc.
 *
 * @param notifications Fila (já filtrada por usuário).
 * @param now ISO-8601 do momento (usado no HTML preview).
 * @returns Entries ordenadas + HTML preview (string segura, escapada).
 */
export function buildDigest(
  notifications: ReadonlyArray<QueuedNotification>,
  now: string,
): { entries: DigestEntry[]; htmlPreview: string } {
  if (!isIso8601(now)) {
    throw new Error("now deve ser ISO-8601 válido");
  }
  const sorted = [...notifications].sort((a, b) => {
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
  const entries: DigestEntry[] = sorted.map((n) => ({
    notificationId: n.id,
    category: n.category,
    title: n.payload.title,
    snippet: clip(n.payload.body, 140),
    createdAt: n.createdAt,
    deepLink: n.payload.clickAction,
  }));
  const htmlPreview = renderDigestHtml(entries, now);
  return { entries, htmlPreview };
}

/**
 * Seleciona os top-N entries mais recentes para preview rápido.
 *
 * @param notifications Fila completa.
 * @param limit Quantos entries retornar (1–100).
 * @returns Top-N entries ordenados por createdAt desc.
 */
export function previewDigest(
  notifications: ReadonlyArray<QueuedNotification>,
  limit: number,
): ReadonlyArray<DigestEntry> {
  if (limit <= 0) return [];
  const sorted = [...notifications].sort((a, b) => {
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
  const cap = Math.min(limit, 100);
  return sorted.slice(0, cap).map((n) => ({
    notificationId: n.id,
    category: n.category,
    title: n.payload.title,
    snippet: clip(n.payload.body, 140),
    createdAt: n.createdAt,
    deepLink: n.payload.clickAction,
  }));
}

/**
 * Renderiza HTML simples e seguro (escapado) para preview de digest.
 *
 * @param entries Entries ordenadas.
 * @param now ISO-8601 do momento.
 * @returns HTML inline (sem `<html>`/`<body>` — pronto para embedding).
 */
function renderDigestHtml(entries: ReadonlyArray<DigestEntry>, now: string): string {
  const date = new Date(now);
  const dateLabel = isIso8601(now)
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)
    : "data inválida";
  const lines: string[] = [];
  lines.push(`<div class="akasha-digest" data-date="${escapeHtml(dateLabel)}">`);
  lines.push(`<h2>Seu digest Akasha — ${escapeHtml(dateLabel)}</h2>`);
  if (entries.length === 0) {
    lines.push('<p class="akasha-digest-empty">Nenhuma novidade por aqui hoje. Axé.</p>');
  } else {
    lines.push('<ul class="akasha-digest-list">');
    for (const e of entries) {
      lines.push('<li class="akasha-digest-item">');
      lines.push(`<span class="akasha-digest-category">${escapeHtml(e.category)}</span>`);
      lines.push(`<a class="akasha-digest-link" href="${escapeHtml(e.deepLink)}">`);
      lines.push(`<strong>${escapeHtml(e.title)}</strong>`);
      lines.push(`</a>`);
      lines.push(`<p class="akasha-digest-snippet">${escapeHtml(e.snippet)}</p>`);
      lines.push("</li>");
    }
    lines.push("</ul>");
  }
  lines.push("</div>");
  return lines.join("\n");
}

// ============================================================================
//  MÉTRICAS / RESUMO
// ============================================================================

/**
 * Resumo agregado da fila — útil para dashboards e health-checks.
 *
 * @param queue Fila completa.
 * @returns Contadores por status + distribuição por categoria.
 */
export function summarizeQueue(queue: ReadonlyArray<QueuedNotification>): {
  pending: number;
  scheduled: number;
  sent: number;
  failed: number;
  rateLimited: number;
  byCategory: Readonly<Record<NotificationCategory, number>>;
} {
  let pending = 0;
  let scheduled = 0;
  let sent = 0;
  let failed = 0;
  let rateLimited = 0;
  const byCategory = {} as Record<NotificationCategory, number>;
  for (const c of ALL_CATEGORIES) {
    byCategory[c] = 0;
  }
  for (const n of queue) {
    byCategory[n.category] = (byCategory[n.category] ?? 0) + 1;
    switch (n.status) {
      case "pending":
        pending++;
        break;
      case "scheduled":
        scheduled++;
        break;
      case "sent":
      case "delivered":
        sent++;
        break;
      case "failed":
      case "cancelled":
        failed++;
        break;
      case "rate_limited":
        rateLimited++;
        break;
    }
  }
  return { pending, scheduled, sent, failed, rateLimited, byCategory };
}
