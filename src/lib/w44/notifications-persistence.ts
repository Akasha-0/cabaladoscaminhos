/**
 * @file notifications-persistence.ts
 * @description Camada de persistência + digest + preferências de canal para o
 * sistema de notificações do Cabala dos Caminhos.
 *
 * Este módulo SUBSTITUI / COMPLEMENTA os placeholders deixados por:
 *   - w41/notifications-push-real    (envio sem persistência tipada)
 *   - w35/digest                     (digest sem store durável)
 *   - w39/digests-archive            (archive sem cutoff explicito)
 *
 * Responsabilidades:
 *   1. Store em memória (DB-shaped) com migração futura para Prisma.
 *   2. Rollup de notificações similares
 *      (ex.: "João, Maria e +5 comentaram no seu post").
 *   3. Estado mark-read por usuário + por notificação (com timestamp).
 *   4. Opt-in por canal (webpush / apns / fcm / email / in_app).
 *   5. Preferências por categoria (mentions, comments, follows, events,
 *      marketplace, system).
 *   6. Snooze (1h, 4h, 1d, until-tomorrow).
 *   7. TTL de 90 dias + arquivo (cutoff explícito).
 *   8. Score de prioridade (high | normal | low) com ordenação estável.
 *   9. Agendamento de digest nas 08:00 / 20:00 no TZ do usuário
 *      (IANA, ex.: "America/Sao_Paulo").
 *
 * Importante: módulo STANDALONE — não importa de outros w3x/w4x para evitar
 * acoplamento entre workers paralelos. Toda dependência externa é resolvida
 * via globals padrão (URL, Intl, Date, Math) — não há `import` de outros
 * módulos do projeto.
 *
 * @author Wave Worker #4 — cycle 44
 * @version 1.0.0
 */

// ============================================================================
//  ENUMS
// ============================================================================

/**
 * Categorias de notificação. Cada categoria tem roteamento próprio
 * (canal padrão, digest group, prioridade default).
 *
 * @example
 *   if (cat === Category.Mention) { ... }
 */
export enum Category {
  /** Quando alguém te @-menciona num post / comentário. */
  Mention = "mentions",
  /** Resposta ou novo comentário num post seu. */
  Comment = "comments",
  /** Novo seguidor. */
  Follow = "follows",
  /** Lembrete de evento confirmado ou começando. */
  Event = "events",
  /** Marketplace — venda / compra / oferta. */
  Marketplace = "marketplace",
  /** Avisos de sistema — manutenção, política, segurança. */
  System = "system",
}

/**
 * Canais de entrega. Múltiplos podem estar ativos simultaneamente.
 * Ordem reflete precedência do fallback.
 *
 * @example
 *   const ch = Channel.Email; // para digest de mentions
 */
export enum Channel {
  /** Push nativo iOS (APNs). */
  Apns = "apns",
  /** Push nativo Android (FCM). */
  Fcm = "fcm",
  /** Push web (VAPID / Service Worker). */
  WebPush = "webpush",
  /** Email transacional (digest / fallback). */
  Email = "email",
  /** In-app — sempre presente, mesmo se outros estão muted. */
  InApp = "in_app",
}

/** Níveis de prioridade — afetam ordenação e canal. */
export enum Priority {
  /** Vai direto pro topo, ignora quiet hours (exceto system mute). */
  High = "high",
  /** Default — respeita quiet hours, vai pro digest se preferir. */
  Normal = "normal",
  /** Pode ser adiado / agrupado sem fricção. */
  Low = "low",
}

/** Status do ciclo de vida de uma notificação no store. */
export enum NotificationStatus {
  /** Criada mas ainda não decidida (push/digest/skip). */
  Pending = "pending",
  /** Marcada para digest (próximo slot 08:00 / 20:00 do user). */
  Digest = "digest",
  /** Entregue (in-app vista, push enviado, email enfileirado). */
  Delivered = "delivered",
  /** Snoozeada — reentra após snoozeUntil. */
  Snoozed = "snoozed",
  /** Arquivada (TTL > 90 dias). Read-only. */
  Archived = "archived",
  /** Descartada por filtro (muted, opt-out, etc). */
  Discarded = "discarded",
}

/** Durações pré-definidas de snooze. */
export enum SnoozeDuration {
  /** Snooze por uma hora. */
  OneHour = "1h",
  /** Snooze por quatro horas. */
  FourHours = "4h",
  /** Snooze por um dia. */
  OneDay = "1d",
  /** Snooze até amanhã 08:00 no TZ do usuário. */
  UntilTomorrow = "until_tomorrow",
}

// ============================================================================
//  CONSTANTES
// ============================================================================

/** TTL de notificações em dias. Após isso vai pro archive. */
export const NOTIFICATION_TTL_DAYS = 90 as const;

/** Cutoff em ms — alias para notificação de archival. */
export const ARCHIVAL_CUTOFF_MS = NOTIFICATION_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Horários do digest diário (24h, hora local do usuário). */
export const DIGEST_HOURS = { MORNING: 8, EVENING: 20 } as const;

/**
 * Categorias que SEMPRE geram push imediato (alto risco de perda).
 * Marque em channel prefs para suprimir, mas vai entrar como high priority.
 */
export const HIGH_PRIORITY_CATEGORIES: ReadonlyArray<Category> = [
  Category.Mention,
  Category.Event,
  Category.System,
] as const;

/** Score base de cada prioridade — usado por computePriority(). */
export const PRIORITY_SCORES: Readonly<Record<Priority, number>> = {
  [Priority.High]: 100,
  [Priority.Normal]: 50,
  [Priority.Low]: 10,
} as const;

/** Capacidade máxima de rollup — evita strings gigantes. */
export const ROLLUP_MAX_ACTORS = 10 as const;

/** Limite de notificações retornadas por query de inbox. */
export const MAX_INBOX_PAGE_SIZE = 50 as const;

/** Categorias habilitadas por padrão em ChannelPreferences. */
export const DEFAULT_ENABLED_CHANNELS: ReadonlyArray<Channel> = [
  Channel.InApp,
  Channel.Email,
] as const;

// ============================================================================
//  TIPOS
// ============================================================================

/** Ator que originou a notificação. */
export interface NotificationActor {
  readonly id: string;
  readonly name: string;
  readonly avatarUrl?: string;
}

/**
 * Conteúdo canônico — `verb` é i18n key, `target` aponta o recurso.
 * @example { verb: "notif.verb.commented", actor: { id:"u1", name:"Maria" }, target: { kind:"post", id:"p42" }, preview: "Adorei!" }
 */
export interface NotificationContent {
  /** Chave i18n (ex.: "notif.verb.commented"). */
  readonly verb: string;
  readonly actor?: NotificationActor;
  readonly target: {
    readonly kind: "post" | "comment" | "user" | "event" | "item" | "group" | "thread";
    readonly id: string;
  };
  readonly preview?: string;
  readonly meta?: Readonly<Record<string, string | number | boolean>>;
}

/**
 * Notificação persistida. Modelada pra migração Prisma futura.
 * @example { id:"n1", userId:"u1", category:Category.Comment, priority:Priority.Normal, content:{...}, createdAt:"2026-06-29T10:00:00Z" }
 */
export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly category: Category;
  readonly priority: Priority;
  readonly content: NotificationContent;
  readonly createdAt: string;
  /** Mutável — store muda status ao longo do ciclo de vida. */
  status: NotificationStatus;
  /** Mutável — score recalculado em mutate (snooze/unsnooze). */
  score: number;
  /** Mutável — incrementa a cada tentativa de delivery. */
  attempts: number;
  lastAttemptAt?: string;
  snoozeUntil?: string;
  deliveredAt?: string;
  readAt?: string;
  archivedAt?: string;
  digestId?: string;
  /** FNV-1a 32-bit — usado por dedup / rollup. */
  readonly fingerprint: string;
}

/**
 * Preferências por categoria — define quais canais entregam.
 * @example { userId:"u1", perCategory:{ [Category.Mention]:[Channel.InApp,Channel.WebPush], [Category.Follow]:[Channel.InApp] }, quietHours:{start:"22:00",end:"07:00"}, dailyDigest:false, smartRollup:true, timezone:"America/Sao_Paulo", locale:"pt-BR" }
 */
export interface ChannelPreferences {
  readonly userId: string;
  /** Canais habilitados POR categoria. InApp = sempre. */
  readonly perCategory: Readonly<Partial<Record<Category, ReadonlyArray<Channel>>>>;
  /** Quiet hours — pushes suprimidos; in_app permanece. */
  readonly quietHours?: { readonly start: string; readonly end: string };
  readonly dailyDigest: boolean;
  readonly smartRollup: boolean;
  /** IANA TZ (ex.: "America/Sao_Paulo"). */
  readonly timezone: string;
  readonly locale: string;
}

/**
 * Opt-in de push — separado de prefs porque tem ciclo próprio (verify/retry).
 * @example { userId:"u1", webpush:true, apns:false, fcm:true, email:true, tokens:[] }
 */
export interface PushOptIn {
  readonly userId: string;
  readonly webpush: boolean;
  readonly apns: boolean;
  readonly fcm: boolean;
  readonly email: boolean;
  readonly verifiedAt?: string;
  readonly tokens: ReadonlyArray<{
    readonly platform: Channel.Apns | Channel.Fcm | Channel.WebPush;
    readonly token: string;
    readonly lastSeenAt: string;
  }>;
}

/** Estado de leitura por notificação — sync multi-device. */
export interface UserReadState {
  readonly userId: string;
  readonly notificationId: string;
  readonly readAt: string;
  readonly deviceId?: string;
}

/** Entrada num digest — 1 notificação ou um rollup sintético. */
export interface DigestEntry {
  readonly id: string;
  readonly category: Category;
  readonly title: string;
  readonly snippet: string;
  readonly createdAt: string;
  readonly actors: ReadonlyArray<NotificationActor>;
  readonly deepLink: string;
  /** 1 pra single, N pra rollup. */
  readonly count: number;
}

/** Digest consolidado — saída de DigestBuilder.build(). */
export interface Digest {
  readonly id: string;
  readonly userId: string;
  readonly slot: "morning" | "evening";
  readonly generatedAt: string;
  readonly range: { readonly start: string; readonly end: string };
  readonly entries: ReadonlyArray<DigestEntry>;
  readonly stats: {
    readonly total: number;
    readonly unread: number;
    readonly byCategory: Readonly<Partial<Record<Category, number>>>;
  };
  readonly timezone: string;
}

/** Decisão de envio — saída de shouldSendNow(). */
export interface DispatchDecision {
  readonly action: "send_now" | "queue_digest" | "snooze" | "skip";
  readonly channels: ReadonlyArray<Channel>;
  readonly reason: string;
}

/** Opções pra rollupSimilar(). */
export interface RollupOptions {
  /** Janela em ms (default: 6h). */
  readonly windowMs?: number;
  /** Cap de atores exibidos (default: ROLLUP_MAX_ACTORS). */
  readonly maxActors?: number;
  readonly preferNewest?: boolean;
}

// ============================================================================
//  UTILITÁRIOS INTERNOS
// ============================================================================

/**
 * Gera UUID v4 simples (sem crypto.randomUUID pra rodar em qualquer env).
 * Usa Math.random — suficiente pra IDs de notificação.
 */
function uuid(): string {
  // 128 bits de randomness — formato 8-4-4-4-12
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      out += "-";
    } else if (i === 14) {
      out += "4";
    } else if (i === 19) {
      out += hex[(Math.random() * 4) | 0 | 8];
    } else {
      out += hex[(Math.random() * 16) | 0];
    }
  }
  return out;
}

/**
 * Hash determinístico pra fingerprint (FNV-1a 32-bit).
 * Não-criptográfico — usado só pra dedup.
 */
function fingerprint(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Conversão segura de ISO / Date pra epoch ms.
 */
function ts(value: string | number | Date | undefined, fallback = Date.now()): number {
  if (value === undefined) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  const t = d.getTime();
  return Number.isNaN(t) ? fallback : t;
}

/**
 * Compara duas prioridades numericamente (high=2, normal=1, low=0).
 */
function priorityRank(p: Priority): number {
  if (p === Priority.High) return 2;
  if (p === Priority.Normal) return 1;
  return 0;
}

/**
 * Faz parse de HH:MM string — retorna horas e minutos (0-23, 0-59).
 * Considera 24:00 equivalente a 00:00 do dia seguinte.
 */
function parseHHMM(s: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 24 || minute < 0 || minute > 59) return null;
  if (hour === 24 && minute !== 0) return null;
  return { hour, minute };
}

/**
 * Calcula offset (em minutos) de um TZ IANA numa data específica.
 * Usa Intl.DateTimeFormat pra extrair o "wall time" vs UTC.
 */
function tzOffsetMinutes(date: Date, tz: string): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = dtf.formatToParts(date);
    const lookup: Record<string, string> = {};
    for (const p of parts) lookup[p.type] = p.value;
    const asUTC = Date.UTC(
      Number(lookup.year),
      Number(lookup.month) - 1,
      Number(lookup.day),
      Number(lookup.hour === "24" ? "00" : lookup.hour),
      Number(lookup.minute),
      Number(lookup.second),
    );
    return (asUTC - date.getTime()) / 60000;
  } catch {
    return 0;
  }
}

// ============================================================================
//  FUNÇÕES EXPORTADAS — PURE / SEM EFEITO
// ============================================================================

/**
 * Cutoff (epoch ms) para archival: notificações mais velhas que
 * `now - ARCHIVAL_CUTOFF_MS` devem ser arquivadas.
 *
 * Prisma migração: `WHERE createdAt < archivalCutoff()` no cron diário.
 *
 * @example
 *   const cutoff = archivalCutoff();
 *   await prisma.notification.updateMany({ where: { createdAt: { lt: new Date(cutoff) } }, data: { status: "archived" } });
 */
export function archivalCutoff(now: Date | string | number = Date.now()): number {
  return ts(now) - ARCHIVAL_CUTOFF_MS;
}

/**
 * Score numérico da notificação (maior = mais ao topo).
 * Fórmula: PRIORITY_SCORES[priority] + bonusCategoria + freshness + optOut.
 *
 * @example
 *   const s = computePriority(notif, prefs);
 *   inbox.sort((a, b) => b.score - a.score);
 */
export function computePriority(
  notification: Pick<Notification, "category" | "priority" | "createdAt">,
  prefs?: Pick<ChannelPreferences, "perCategory">,
  now: Date | string | number = Date.now(),
): number {
  const base = PRIORITY_SCORES[notification.priority] ?? PRIORITY_SCORES[Priority.Normal];
  let bonus = 0;
  if (notification.category === Category.System) bonus += 30;
  if (notification.category === Category.Mention) bonus += 20;
  if (notification.category === Category.Event) bonus += 15;
  if (notification.category === Category.Marketplace) bonus += 5;

  const enabled = prefs?.perCategory?.[notification.category];
  if (!enabled || enabled.length === 0) bonus -= 200;

  const ageHours = Math.max(0, ts(now) - ts(notification.createdAt)) / 3_600_000;
  const freshness = Math.max(0, 50 - ageHours); // 50 → 0 em 50h
  return base + bonus + freshness;
}

/**
 * Aplica snooze — devolve cópia com `status=Snoozed` e `snoozeUntil` calculado.
 *
 * @example
 *   const n2 = applySnooze(n, SnoozeDuration.FourHours);
 *   // n2.status === NotificationStatus.Snoozed
 */
export function applySnooze(
  notification: Notification,
  duration: SnoozeDuration | string,
  now: Date | string | number = Date.now(),
  tz: string = "UTC",
): Notification {
  const ref = ts(now);
  let untilMs: number;
  switch (duration) {
    case SnoozeDuration.OneHour:
      untilMs = ref + 3_600_000; break;
    case SnoozeDuration.FourHours:
      untilMs = ref + 4 * 3_600_000; break;
    case SnoozeDuration.OneDay:
      untilMs = ref + 86_400_000; break;
    case SnoozeDuration.UntilTomorrow: {
      // 08:00 de amanhã no TZ do user
      const offset = tzOffsetMinutes(new Date(ref), tz);
      const local = new Date(ref + offset * 60000);
      const t = new Date(local);
      t.setUTCDate(t.getUTCDate() + 1);
      t.setUTCHours(DIGEST_HOURS.MORNING, 0, 0, 0);
      untilMs = t.getTime() - offset * 60000;
      break;
    }
    default: {
      // Custom "2h" / "30m" / "1d"
      const m = /^(\d+)\s*([mhd])$/i.exec(duration.trim());
      const n = m ? Number(m[1]) : 1;
      const unit = m ? m[2].toLowerCase() : "h";
      const mult = unit === "m" ? 60_000 : unit === "d" ? 86_400_000 : 3_600_000;
      untilMs = ref + n * mult;
    }
  }
  return {
    ...notification,
    status: NotificationStatus.Snoozed,
    snoozeUntil: new Date(untilMs).toISOString(),
    score: notification.score - 1000, // joga pro fim do inbox
  };
}

/**
 * Decide o que fazer com uma notificação: send_now | queue_digest | snooze | skip.
 *
 * @example
 *   const decision = shouldSendNow(n, prefs);
 *   if (decision.action === "send_now") push(decision.channels, n);
 */
export function shouldSendNow(
  notification: Notification,
  prefs: ChannelPreferences,
  now: Date | string | number = Date.now(),
): DispatchDecision {
  const ref = ts(now);

  if (notification.status === NotificationStatus.Archived) {
    return { action: "skip", channels: [], reason: "already_archived" };
  }
  if (notification.snoozeUntil && ts(notification.snoozeUntil) > ref) {
    return { action: "snooze", channels: [], reason: "within_snooze_window" };
  }
  const enabled = prefs.perCategory[notification.category];
  if (!enabled || enabled.length === 0) {
    return { action: "skip", channels: [], reason: "category_disabled" };
  }
  if (notification.priority === Priority.High) {
    return { action: "send_now", channels: enabled, reason: "high_priority_bypass" };
  }
  if (prefs.quietHours) {
    const start = parseHHMM(prefs.quietHours.start);
    const end = parseHHMM(prefs.quietHours.end);
    if (start && end && isWithinQuietHours(ref, start, end, prefs.timezone)) {
      return { action: "queue_digest", channels: [], reason: "quiet_hours" };
    }
  }
  if (prefs.dailyDigest) {
    return { action: "queue_digest", channels: [], reason: "daily_digest_mode" };
  }
  const lowAndNoisy =
    notification.priority === Priority.Low &&
    (notification.category === Category.Follow ||
      notification.category === Category.Comment ||
      notification.category === Category.Marketplace);
  if (lowAndNoisy && prefs.smartRollup) {
    return { action: "queue_digest", channels: [], reason: "low_priority_noisy" };
  }
  return { action: "send_now", channels: enabled, reason: "default" };
}

/** Epoch ms está dentro de start..end (TZ-aware, suporta cruzar meia-noite). */
function isWithinQuietHours(
  refMs: number,
  start: { hour: number; minute: number },
  end: { hour: number; minute: number },
  tz: string,
): boolean {
  const offset = tzOffsetMinutes(new Date(refMs), tz);
  const local = new Date(refMs + offset * 60000);
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
  const startMin = start.hour * 60 + start.minute;
  const endMin = end.hour * 60 + end.minute;
  if (startMin === endMin) return false;
  if (startMin < endMin) return minutes >= startMin && minutes < endMin;
  // Cruza meia-noite (22:00 → 07:00)
  return minutes >= startMin || minutes < endMin;
}

/**
 * Agrupa N notificações similares em rollups sintéticos.
 * Critério: mesma categoria, mesma target, mesmo verb, dentro de windowMs.
 *
 * @example
 *   const groups = rollupSimilar(notifications);
 *   // [{ count:7, actors:[João,Maria], preview:"..." }]
 */
export function rollupSimilar(
  notifications: ReadonlyArray<Notification>,
  options: RollupOptions = {},
): ReadonlyArray<Notification> {
  const windowMs = options.windowMs ?? 6 * 3_600_000;
  const maxActors = options.maxActors ?? ROLLUP_MAX_ACTORS;
  const preferNewest = options.preferNewest ?? true;
  const buckets = new Map<string, Notification[]>();
  const sorted = [...notifications].sort((a, b) =>
    preferNewest ? ts(b.createdAt) - ts(a.createdAt) : ts(a.createdAt) - ts(b.createdAt),
  );

  for (const n of sorted) {
    if (n.status === NotificationStatus.Archived) continue;
    const key = [n.category, n.content.target.kind, n.content.target.id, n.content.verb].join("|");
    const b = buckets.get(key);
    if (b) b.push(n); else buckets.set(key, [n]);
  }

  const rollups: Notification[] = [];
  for (const [, bucket] of buckets) {
    if (bucket.length === 1) { rollups.push(bucket[0]!); continue; }
    const headTs = ts(preferNewest ? bucket[0]!.createdAt : bucket[bucket.length - 1]!.createdAt);
    const inWindow = bucket.filter((n) => Math.abs(ts(n.createdAt) - headTs) <= windowMs);
    if (inWindow.length === 1) { rollups.push(inWindow[0]!); continue; }

    const head = bucket[0]!;
    const seen = new Set<string>();
    const actors: NotificationActor[] = [];
    for (const n of inWindow) {
      if (n.content.actor && !seen.has(n.content.actor.id)) {
        seen.add(n.content.actor.id);
        actors.push(n.content.actor);
        if (actors.length >= maxActors) break;
      }
    }
    const more = inWindow.length - actors.length;
    const preview = inWindow.length > 1
      ? `${head.content.preview ?? ""}${more > 0 ? ` (+${more})` : ""}`
      : head.content.preview;
    rollups.push({
      ...head,
      id: `rollup_${fingerprint(inWindow.map((n) => n.id).join(","))}`,
      status: NotificationStatus.Digest,
      content: {
        ...head.content,
        preview,
        meta: {
          ...(head.content.meta ?? {}),
          rollupCount: inWindow.length,
          rollupActorIds: actors.map((a) => a.id).join(","),
        },
      },
      score: computePriority(head) + Math.log2(inWindow.length) * 5,
      digestId: `pending_${head.userId}`,
    });
  }
  return rollups;
}

/**
 * Próximo slot de digest (08:00 ou 20:00) num IANA TZ.
 * @example getNextDigestTime(Date.now(), "America/Sao_Paulo") → { iso: "2026-06-29T20:00:00-03:00", slot: "evening" }
 */
export function getNextDigestTime(
  now: Date | string | number = Date.now(),
  tz: string = "UTC",
): { readonly iso: string; readonly slot: "morning" | "evening" } {
  const ref = ts(now);
  const offset = tzOffsetMinutes(new Date(ref), tz);
  const local = new Date(ref + offset * 60000);
  const localHour = local.getUTCHours();

  let targetDay = 0;
  let targetHour: number;
  if (localHour < DIGEST_HOURS.MORNING) targetHour = DIGEST_HOURS.MORNING;
  else if (localHour < DIGEST_HOURS.EVENING) targetHour = DIGEST_HOURS.EVENING;
  else { targetHour = DIGEST_HOURS.MORNING; targetDay = 1; }

  const targetLocal = new Date(local);
  targetLocal.setUTCDate(targetLocal.getUTCDate() + targetDay);
  targetLocal.setUTCHours(targetHour, 0, 0, 0);
  const targetMs = targetLocal.getTime() - offset * 60000;
  return {
    iso: new Date(targetMs).toISOString(),
    slot: targetHour === DIGEST_HOURS.MORNING ? "morning" : "evening",
  };
}

// ============================================================================
//  CLASSES
// ============================================================================

/**
 * NotificationStore — store em memória (DB-shaped) preparado pra migração
 * futura pra Prisma. Layout: `notifications`, `archived`, `prefs`, `optIn`,
 * `reads: Map<userId, Map<notificationId, UserReadState>>`.
 *
 * @example
 *   const store = new NotificationStore();
 *   const n = store.create({ userId:"u1", category:Category.Mention, content:{...} });
 *   store.markRead("u1", n.id);
 */
export class NotificationStore {
  private readonly notifications = new Map<string, Notification>();
  private readonly archived = new Map<string, Notification>();
  private readonly prefs = new Map<string, ChannelPreferences>();
  private readonly optIn = new Map<string, PushOptIn>();
  private readonly reads = new Map<string, Map<string, UserReadState>>();

  // -- CRUD básico --------------------------------------------------------

  /**
   * Cria uma notificação com dedup por fingerprint (5min window).
   * @example store.create({ userId:"u1", category:Category.Comment, content:{verb:"notif.verb.commented", target:{kind:"post",id:"p1"}} })
   */
  create(
    input: Omit<Notification, "id" | "createdAt" | "status" | "score" | "attempts" | "fingerprint"> & {
      readonly id?: string;
      readonly fingerprint?: string;
    },
  ): Notification {
    const id = input.id ?? uuid();
    const fp = input.fingerprint ?? fingerprint(
      [input.category, input.content.target.kind, input.content.target.id, input.content.verb, input.userId].join("|"),
    );
    const existing = this.findByFingerprint(input.userId, fp);
    if (existing && Date.now() - ts(existing.createdAt) < 5 * 60_000) return existing;
    const createdAt = new Date().toISOString();
    const created: Notification = {
      ...input,
      id,
      createdAt,
      status: NotificationStatus.Pending,
      attempts: 0,
      score: computePriority({ ...input, createdAt }),
      fingerprint: fp,
    };
    this.notifications.set(id, created);
    return created;
  }

  /** Retorna notificação por ID (ativos + arquivados). */
  get(id: string): Notification | undefined {
    return this.notifications.get(id) ?? this.archived.get(id);
  }

  /**
   * Lista inbox do usuário, ordenado por score desc.
   * @example store.listInbox("u1", { limit:20, unreadOnly:true })
   */
  listInbox(
    userId: string,
    options: { limit?: number; unreadOnly?: boolean; category?: Category } = {},
  ): ReadonlyArray<Notification> {
    const limit = Math.min(options.limit ?? MAX_INBOX_PAGE_SIZE, MAX_INBOX_PAGE_SIZE);
    let out = [...this.notifications.values()].filter((n) => n.userId === userId);
    if (options.unreadOnly) out = out.filter((n) => !n.readAt);
    if (options.category) out = out.filter((n) => n.category === options.category);
    out.sort((a, b) => b.score - a.score || ts(b.createdAt) - ts(a.createdAt));
    return out.slice(0, limit);
  }

  // -- Mark-read ---------------------------------------------------------

  /** Marca uma notificação como lida — registra readAt e estado por device. */
  markRead(userId: string, notificationId: string, deviceId?: string): UserReadState | null {
    const n = this.notifications.get(notificationId);
    if (!n || n.userId !== userId) return null;
    const readAt = new Date().toISOString();
    n.readAt = readAt;
    const state: UserReadState = { userId, notificationId, readAt, deviceId };
    const userReads = this.reads.get(userId) ?? new Map<string, UserReadState>();
    userReads.set(notificationId, state);
    this.reads.set(userId, userReads);
    return state;
  }

  /** Marca TODAS as notificações ativas do usuário como lidas. Retorna count. */
  markAllRead(userId: string, deviceId?: string, now: Date | string | number = Date.now()): number {
    const readAt = new Date(ts(now)).toISOString();
    const userReads = this.reads.get(userId) ?? new Map<string, UserReadState>();
    let count = 0;
    for (const n of this.notifications.values()) {
      if (n.userId === userId && !n.readAt) {
        n.readAt = readAt;
        userReads.set(n.id, { userId, notificationId: n.id, readAt, deviceId });
        count++;
      }
    }
    if (count > 0) this.reads.set(userId, userReads);
    return count;
  }

  /** Estado de leitura (ou null). */
  getReadState(userId: string, notificationId: string): UserReadState | null {
    return this.reads.get(userId)?.get(notificationId) ?? null;
  }

  /** Audit trail de todas as leituras do usuário. */
  listReadStates(userId: string): ReadonlyArray<UserReadState> {
    const u = this.reads.get(userId);
    return u ? [...u.values()] : [];
  }

  // -- Snooze / archive ---------------------------------------------------

  /** Aplica snooze — retorna cópia atualizada ou null. */
  snooze(
    userId: string,
    notificationId: string,
    duration: SnoozeDuration | string,
    now: Date | string | number = Date.now(),
  ): Notification | null {
    const n = this.notifications.get(notificationId);
    if (!n || n.userId !== userId) return null;
    const tz = this.prefs.get(userId)?.timezone ?? "UTC";
    const updated = applySnooze(n, duration, now, tz);
    this.notifications.set(notificationId, updated);
    return updated;
  }

  /** Reativa notificações snoozed cuja janela expirou. Chamado pelo cron. */
  unsnoozeExpired(now: Date | string | number = Date.now()): number {
    const ref = ts(now);
    let count = 0;
    for (const n of this.notifications.values()) {
      if (n.status === NotificationStatus.Snoozed && n.snoozeUntil && ts(n.snoozeUntil) <= ref) {
        n.status = NotificationStatus.Pending;
        delete n.snoozeUntil;
        n.score = computePriority(n);
        count++;
      }
    }
    return count;
  }

  /** Arquiva notificações mais velhas que o cutoff (90d default). Retorna count. */
  archiveOld(now: Date | string | number = Date.now()): number {
    const cutoff = archivalCutoff(now);
    let count = 0;
    for (const [id, n] of this.notifications) {
      if (ts(n.createdAt) < cutoff) {
        n.status = NotificationStatus.Archived;
        n.archivedAt = new Date(ts(now)).toISOString();
        this.archived.set(id, n);
        this.notifications.delete(id);
        count++;
      }
    }
    return count;
  }

  /** Dedup por fingerprint (O(n) — suficiente pra store in-memory). */
  private findByFingerprint(userId: string, fp: string): Notification | undefined {
    for (const n of this.notifications.values()) {
      if (n.userId === userId && n.fingerprint === fp) return n;
    }
    return undefined;
  }

  // -- Channel preferences -----------------------------------------------

  /** Retorna preferências do usuário (cria defaults se não existir). */
  getChannelPreferences(userId: string): ChannelPreferences {
    return this.prefs.get(userId) ?? {
      userId,
      perCategory: defaultPerCategory(),
      dailyDigest: false,
      smartRollup: true,
      timezone: "UTC",
      locale: "pt-BR",
    };
  }

  /** Atualiza preferências (merge). */
  updateChannelPreferences(
    userId: string,
    patch: Partial<Omit<ChannelPreferences, "userId">>,
  ): ChannelPreferences {
    const existing = this.getChannelPreferences(userId);
    const merged: ChannelPreferences = {
      ...existing, ...patch, userId,
      perCategory: { ...existing.perCategory, ...(patch.perCategory ?? {}) },
    };
    this.prefs.set(userId, merged);
    return merged;
  }

  // -- Push opt-in --------------------------------------------------------

  /** Retorna opt-in (cria vazio se não existir). */
  getPushOptIn(userId: string): PushOptIn {
    return this.optIn.get(userId) ?? {
      userId, webpush: false, apns: false, fcm: false, email: false, tokens: [],
    };
  }

  /** Atualiza opt-in (merge) — bump verifiedAt. */
  setPushOptIn(userId: string, patch: Partial<Omit<PushOptIn, "userId" | "tokens">> & {
    readonly tokens?: ReadonlyArray<PushOptIn["tokens"][number]>;
  }): PushOptIn {
    const existing = this.getPushOptIn(userId);
    const merged: PushOptIn = {
      ...existing, ...patch, userId,
      tokens: patch.tokens ?? existing.tokens,
      verifiedAt: new Date().toISOString(),
    };
    this.optIn.set(userId, merged);
    return merged;
  }

  /** Adiciona/atualiza token de push pra um usuário. */
  addPushToken(
    userId: string,
    platform: Channel.Apns | Channel.Fcm | Channel.WebPush,
    token: string,
  ): PushOptIn {
    const opt = this.getPushOptIn(userId);
    const tokens = [
      ...opt.tokens.filter((t) => t.token !== token),
      { platform, token, lastSeenAt: new Date().toISOString() },
    ] as ReadonlyArray<PushOptIn["tokens"][number]>;
    return this.setPushOptIn(userId, {
      webpush: platform === Channel.WebPush ? true : opt.webpush,
      apns: platform === Channel.Apns ? true : opt.apns,
      fcm: platform === Channel.Fcm ? true : opt.fcm,
      tokens,
    });
  }

  /** Remove token (logout do device, revoke permission). */
  removePushToken(userId: string, token: string): PushOptIn {
    const opt = this.getPushOptIn(userId);
    const tokens = opt.tokens.filter((t) => t.token !== token);
    return this.setPushOptIn(userId, {
      apns: tokens.some((t) => t.platform === Channel.Apns),
      fcm: tokens.some((t) => t.platform === Channel.Fcm),
      webpush: tokens.some((t) => t.platform === Channel.WebPush),
      tokens,
    });
  }

  // -- Snapshot / metrics --------------------------------------------------

  /** Snapshot imutável — debug, métricas, migração Prisma. */
  snapshot(): StoreSnapshot {
    const byCategory: Partial<Record<Category, number>> = {};
    const byStatus: Partial<Record<NotificationStatus, number>> = {};
    let unread = 0;
    for (const n of this.notifications.values()) {
      byCategory[n.category] = (byCategory[n.category] ?? 0) + 1;
      byStatus[n.status] = (byStatus[n.status] ?? 0) + 1;
      if (!n.readAt) unread++;
    }
    return {
      activeCount: this.notifications.size,
      archivedCount: this.archived.size,
      unreadCount: unread,
      byCategory,
      byStatus,
      usersWithPrefs: this.prefs.size,
      usersWithOptIn: this.optIn.size,
      takenAt: new Date().toISOString(),
    };
  }

  /** Limpa tudo — útil pra testes determinísticos. */
  clear(): void {
    this.notifications.clear();
    this.archived.clear();
    this.prefs.clear();
    this.optIn.clear();
    this.reads.clear();
  }
}

/** Defaults por categoria — InApp sempre, push só pra high-pri. */
function defaultPerCategory(): Partial<Record<Category, ReadonlyArray<Channel>>> {
  return {
    [Category.Mention]: [Channel.InApp, Channel.WebPush, Channel.Email],
    [Category.Comment]: [Channel.InApp, Channel.Email],
    [Category.Follow]: [Channel.InApp],
    [Category.Event]: [Channel.InApp, Channel.WebPush, Channel.Email],
    [Category.Marketplace]: [Channel.InApp, Channel.Email],
    [Category.System]: [Channel.InApp, Channel.Email, Channel.WebPush],
  };
}

/**
 * Snapshot imutável do NotificationStore.
 */
export interface StoreSnapshot {
  readonly activeCount: number;
  readonly archivedCount: number;
  readonly unreadCount: number;
  readonly byCategory: Partial<Record<Category, number>>;
  readonly byStatus: Partial<Record<NotificationStatus, number>>;
  readonly usersWithPrefs: number;
  readonly usersWithOptIn: number;
  readonly takenAt: string;
}

/**
 * DigestBuilder — constrói digests consolidados aplicando smart-rollup.
 * @example const d = builder.build("u1", { slot:"evening", lookbackMs: 12*3600*1000 });
 */
export class DigestBuilder {
  static readonly MAX_DIGEST_ENTRIES = 30;
  private static readonly BASE_URL = "https://cabala.app/";
  private static readonly TARGET_PATH: Partial<Record<NotificationContent["target"]["kind"], string>> = {
    post: "p", comment: "c", user: "u", event: "e", item: "i", group: "g", thread: "t",
  };

  constructor(private readonly store: NotificationStore) {}

  /**
   * Constrói digest pras notificações do usuário no lookback informado.
   * @example builder.build("u1");
   */
  build(
    userId: string,
    options: {
      readonly slot?: "morning" | "evening";
      readonly lookbackMs?: number;
      readonly maxEntries?: number;
      readonly now?: Date | string | number;
    } = {},
  ): Digest | null {
    const now = options.now ?? Date.now();
    const lookback = options.lookbackMs ?? 12 * 3_600_000;
    const maxEntries = options.maxEntries ?? DigestBuilder.MAX_DIGEST_ENTRIES;
    const prefs = this.store.getChannelPreferences(userId);

    const candidates = [...this.store.listInbox(userId, { limit: 200 })]
      .filter((n) => {
        const age = ts(now) - ts(n.createdAt);
        return age >= 0 && age <= lookback;
      })
      .filter((n) => !n.readAt);
    if (candidates.length === 0) return null;

    const grouped = prefs.smartRollup ? [...rollupSimilar(candidates)] : candidates;
    grouped.sort((a, b) => b.score - a.score);
    const limited = grouped.slice(0, maxEntries);

    const entries: DigestEntry[] = limited.map((n) => {
      const meta = n.content.meta ?? {};
      const actorIds = typeof meta.rollupActorIds === "string" ? meta.rollupActorIds.split(",").filter(Boolean) : [];
      const actors: ReadonlyArray<NotificationActor> = n.content.actor !== undefined
        ? [n.content.actor]
        : actorIds.map((id) => ({ id, name: id }));
      const actorName = n.content.actor?.name ?? "alguém";
      const verb = n.content.verb.replace(/^notif\.verb\./, "").replace(/_/g, " ");
      const kind = n.content.target.kind;
      const path = DigestBuilder.TARGET_PATH[kind] ?? "";
      return {
        id: n.id,
        category: n.category,
        title: `${actorName} ${verb} em ${kind}`,
        snippet: n.content.preview ?? "",
        createdAt: n.createdAt,
        actors,
        deepLink: path ? `${DigestBuilder.BASE_URL}${path}/${n.content.target.id}` : DigestBuilder.BASE_URL,
        count: typeof meta.rollupCount === "number" ? meta.rollupCount : 1,
      };
    });

    const byCategory: Partial<Record<Category, number>> = {};
    for (const n of candidates) byCategory[n.category] = (byCategory[n.category] ?? 0) + 1;

    const slot = options.slot ?? (getNextDigestTime(now, prefs.timezone).slot === "morning" ? "morning" : "evening");
    const generatedAt = new Date(ts(now)).toISOString();

    return {
      id: uuid(),
      userId,
      slot,
      generatedAt,
      range: {
        start: new Date(ts(now) - lookback).toISOString(),
        end: new Date(ts(now)).toISOString(),
      },
      entries,
      stats: { total: candidates.length, unread: candidates.length, byCategory },
      timezone: prefs.timezone,
    };
  }

  /**
   * Renderiza digest como HTML simples com escaping seguro.
   * Pra templates ricos, use um renderer externo.
   * @example const html = builder.renderHtml(digest);
   */
  renderHtml(digest: Digest): string {
    const esc = (s: string): string =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    const slotLabel = digest.slot === "morning" ? "Manhã" : "Noite";
    const sections = digest.entries.map((e) => {
      const names = e.actors.slice(0, 3).map((a) => esc(a.name)).join(", ");
      const more = e.actors.length > 3 ? `, +${e.actors.length - 3}` : "";
      return `<section style="margin-bottom:12px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;">
<h3 style="margin:0;font-size:14px;">${esc(e.title)}</h3>
${e.snippet ? `<p style="margin:4px 0 0;color:#374151;font-size:13px;">${esc(e.snippet)}</p>` : ""}
${names ? `<p style="margin:8px 0 0;color:#6b7280;font-size:12px;">por ${names}${more}</p>` : ""}
${e.deepLink ? `<p style="margin:8px 0 0;"><a href="${esc(e.deepLink)}" style="color:#2563eb;font-size:12px;">abrir →</a></p>` : ""}
</section>`;
    }).join("");
    return `<!doctype html><html><body style="font-family:system-ui;padding:24px;max-width:600px;margin:0 auto;">
<h1 style="margin:0 0 8px;">Cabala — Digest ${slotLabel}</h1>
<p style="color:#6b7280;margin:0 0 24px;">${digest.stats.total} notificações · ${digest.stats.unread} não lidas</p>
${sections}
<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
<p style="color:#9ca3af;font-size:11px;">Gerado em ${esc(digest.generatedAt)} (${esc(digest.timezone)})</p>
</body></html>`;
  }
}

// ============================================================================
//  FIM — notifications-persistence.ts (cycle 44)
// ============================================================================
