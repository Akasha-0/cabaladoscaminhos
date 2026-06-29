// src/lib/w32/push-prefs-ui.ts
// Cycle 32 worker F — push notification preferences UI
// Composes w29/notifications-webpush (push channel shape) + w30/daily-reflection-push (reflection push shape) + w31/comments-mentions-notify (mention shape)
// Scope: per-channel toggles, quiet hours, frequency cap, digest mode
// Namespace: w32 — self-contained, no runtime deps on other waves

export type PushChannel =
  | "comments"
  | "mentions"
  | "replies"
  | "reactions"
  | "follows"
  | "circle_updates"
  | "events"
  | "livestreams"
  | "marketplace_messages"
  | "daily_reflection"
  | "moderation_alerts"
  | "security";

export type DigestMode = "realtime" | "hourly" | "daily" | "weekly" | "off";

export interface QuietHours {
  readonly enabled: boolean;
  readonly startHourLocal: number; // 0-23
  readonly startMinuteLocal: number;
  readonly endHourLocal: number;
  readonly endMinuteLocal: number;
  readonly timezone: string; // IANA
}

export interface PushPrefsState {
  readonly userId: string;
  readonly channelToggles: Readonly<Record<PushChannel, boolean>>;
  readonly quietHours: QuietHours;
  readonly digestMode: DigestMode;
  readonly maxPerHour: number; // 0 = unlimited
  readonly maxPerDay: number; // 0 = unlimited
  readonly soundEnabled: boolean;
  readonly vibrationEnabled: boolean;
  readonly showPreview: boolean;
  readonly language: "pt-BR" | "en" | "es";
}

export const DEFAULT_CHANNEL_TOGGLES: Readonly<Record<PushChannel, boolean>> = {
  comments: true,
  mentions: true,
  replies: true,
  reactions: false,
  follows: true,
  circle_updates: true,
  events: true,
  livestreams: true,
  marketplace_messages: true,
  daily_reflection: true,
  moderation_alerts: true,
  security: true,
};

export const DEFAULT_QUIET_HOURS: QuietHours = {
  enabled: false,
  startHourLocal: 22,
  startMinuteLocal: 0,
  endHourLocal: 7,
  endMinuteLocal: 0,
  timezone: "America/Sao_Paulo",
};

export function defaultPushPrefs(userId: string, language: PushPrefsState["language"]): PushPrefsState {
  return {
    userId,
    channelToggles: { ...DEFAULT_CHANNEL_TOGGLES },
    quietHours: { ...DEFAULT_QUIET_HOURS },
    digestMode: "realtime",
    maxPerHour: 20,
    maxPerDay: 100,
    soundEnabled: true,
    vibrationEnabled: true,
    showPreview: true,
    language,
  };
}

/** True if a given ISO timestamp falls within the user's quiet hours. */
export function isInQuietHours(
  state: PushPrefsState,
  atIso: string,
): boolean {
  if (!state.quietHours.enabled) return false;
  let localHour = 0;
  let localMinute = 0;
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: state.quietHours.timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    const parts = dtf.formatToParts(new Date(atIso));
    localHour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    if (localHour === 24) localHour = 0;
    localMinute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  } catch {
    return false;
  }
  const nowMin = localHour * 60 + localMinute;
  const startMin = state.quietHours.startHourLocal * 60 + state.quietHours.startMinuteLocal;
  const endMin = state.quietHours.endHourLocal * 60 + state.quietHours.endMinuteLocal;
  if (startMin === endMin) return false;
  if (startMin < endMin) return nowMin >= startMin && nowMin < endMin;
  // window crosses midnight
  return nowMin >= startMin || nowMin < endMin;
}

/** Should we deliver a push for this channel+state at the given instant? */
export function shouldDeliver(
  state: PushPrefsState,
  channel: PushChannel,
  atIso: string,
  recentCountLastHour: number,
  recentCountLastDay: number,
): { deliver: boolean; reason: string } {
  // Security alerts are always delivered (even if disabled, security overrides).
  if (channel === "security") return { deliver: true, reason: "security_override" };
  if (!state.channelToggles[channel]) return { deliver: false, reason: "channel_disabled" };
  if (state.digestMode === "off") return { deliver: false, reason: "digest_off" };
  if (isInQuietHours(state, atIso)) return { deliver: false, reason: "quiet_hours" };
  if (state.maxPerHour > 0 && recentCountLastHour >= state.maxPerHour) {
    return { deliver: false, reason: "rate_hourly" };
  }
  if (state.maxPerDay > 0 && recentCountLastDay >= state.maxPerDay) {
    return { deliver: false, reason: "rate_daily" };
  }
  return { deliver: true, reason: "ok" };
}

/** Build the channel list with display labels per locale. */
export interface ChannelDescriptor {
  readonly channel: PushChannel;
  readonly label: string;
  readonly description: string;
  readonly recommendedDefault: boolean;
  readonly category: "social" | "spiritual" | "commerce" | "system";
}

export const CHANNEL_DESCRIPTORS_PT_BR: ReadonlyArray<ChannelDescriptor> = [
  { channel: "comments", label: "Comentários", description: "Novos comentários nas suas postagens", recommendedDefault: true, category: "social" },
  { channel: "mentions", label: "Menções", description: "Quando alguém te marca com @", recommendedDefault: true, category: "social" },
  { channel: "replies", label: "Respostas", description: "Respostas a seus comentários", recommendedDefault: true, category: "social" },
  { channel: "reactions", label: "Reações", description: "Curtidas e outras reações", recommendedDefault: false, category: "social" },
  { channel: "follows", label: "Seguidores", description: "Novos seguidores no seu perfil", recommendedDefault: true, category: "social" },
  { channel: "circle_updates", label: "Círculo", description: "Atualizações dos seus círculos", recommendedDefault: true, category: "spiritual" },
  { channel: "events", label: "Eventos", description: "Lembretes de eventos e workshops", recommendedDefault: true, category: "spiritual" },
  { channel: "livestreams", label: "Lives", description: "Início de transmissões ao vivo", recommendedDefault: true, category: "spiritual" },
  { channel: "marketplace_messages", label: "Marketplace", description: "Mensagens sobre leituras e práticas", recommendedDefault: true, category: "commerce" },
  { channel: "daily_reflection", label: "Reflexão diária", description: "Lembrete para sua reflexão diária", recommendedDefault: true, category: "spiritual" },
  { channel: "moderation_alerts", label: "Moderação", description: "Alertas sobre conteúdo reportado", recommendedDefault: true, category: "system" },
  { channel: "security", label: "Segurança", description: "Avisos de segurança da conta", recommendedDefault: true, category: "system" },
];

export function channelsByCategory(
  descs: ReadonlyArray<ChannelDescriptor>,
): Readonly<Record<ChannelDescriptor["category"], ReadonlyArray<ChannelDescriptor>>> {
  const out: Record<ChannelDescriptor["category"], ChannelDescriptor[]> = {
    social: [],
    spiritual: [],
    commerce: [],
    system: [],
  };
  for (const d of descs) out[d.category].push(d);
  return out;
}

/** Validate a digest mode + max caps combo before save. */
export function validatePushPrefs(
  state: PushPrefsState,
): { ok: true } | { ok: false; error: string } {
  if (state.maxPerHour < 0 || state.maxPerHour > 500) {
    return { ok: false, error: "maxPorHora deve estar entre 0 e 500" };
  }
  if (state.maxPerDay < 0 || state.maxPerDay > 2000) {
    return { ok: false, error: "maxPorDia deve estar entre 0 e 2000" };
  }
  if (state.maxPerDay > 0 && state.maxPerHour > state.maxPerDay) {
    return { ok: false, error: "maxPorHora não pode exceder maxPorDia" };
  }
  const q = state.quietHours;
  if (q.enabled) {
    if (q.startHourLocal < 0 || q.startHourLocal > 23) {
      return { ok: false, error: "hora inicial inválida" };
    }
    if (q.endHourLocal < 0 || q.endHourLocal > 23) {
      return { ok: false, error: "hora final inválida" };
    }
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: q.timezone });
    } catch {
      return { ok: false, error: "fuso horário inválido" };
    }
  }
  return { ok: true };
}
