// ============================================================================
// W91s — Notifications Preferences UI Engine
// ============================================================================
// Adapter layer between o engine de preferências (notifications/preferences.ts)
// e a UI da página /settings/notifications.
//
// Responsabilidades:
//   * Decidir quais CANAIS (in-app / email / push) estão disponíveis por
//     TRADICÃO (Cigano, Ifá, Candomblé, Umbanda, Cabala, Astrologia).
//   * Aplicar QUIET HOURS (horário em que notificações NÃO-AO-VIVO caem pra
//     digest, sem cortar segurança crítica).
//   * Aplicar FREQUENCY CAPS (limite diário por tipo, anti-spam respeitoso).
//   * Compor o PAGE FILTER (busca/grupo/tipo) usado pelo lado cliente.
//   * Expor um HOOK (useNotificationPrefs) que retorna estado + reducers
//     prontos para o formulário, com marcação `dirty` + `canSubmit`.
//
// Princípios:
//   * LGPD-friendly: push é opt-in, digest é opt-out pra in-app.
//   * Sacred-cultural: copy PT-BR com termos preservados (orixá, babalaô,
//     sefirá, cigano, axé) — vocabulários sensíveis não são usados em
//     comentário nem copy (verificado por source-inspection).
//   * Positive-only: copy sempre descritiva ("Acompanhar", "Receber", "Silenciar
//     durante X") sem "bloquear", "destruir", "odeiar".
//   * Pure helpers (sem Date.now()/Math.random/Mutation) — todo side-effect
//     fica no hook (clock + fetch).
//
// Tipos públicos em @/lib/notifications/preferences (input) — esta camada é
// PURAMENTE client-safe e roda em SSR/CSR/Edge.
// ============================================================================

'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ResolvedPreferences } from '@/lib/notifications/preferences';

// Re-export ResolvedPreferences para que consumidores consigam importar
// apenas do engine.
export type { ResolvedPreferences };

// ============================================================================
// NotificationType / NotificationChannel
// ============================================================================
// Estes tipos são exportados por `@prisma/client` no runtime (via `prisma
// generate`), mas como o cliente gerado não está presente no worktree atual,
// redefinimos os mesmos aliases aqui em sincronia total com o `schema.prisma`
// (ver bloco `enum NotificationType` + `enum NotificationChannel`).
//
// Manter o shape idêntico garante que o engine seja drop-in compatível com
// `import { NotificationType } from '@prisma/client'` em qualquer contexto
// onde o Prisma client JÁ esteja gerado.
// ============================================================================

export type NotificationType =
  | 'LIKE'
  | 'COMMENT'
  | 'POST_REPLY'
  | 'FOLLOW'
  | 'MENTION'
  | 'GROUP_INVITE'
  | 'GROUP_POST'
  | 'GROUP_ROLE_CHANGE'
  | 'ARTICLE_RECOMMENDATION'
  | 'ARTICLE_PUBLISHED'
  | 'SYSTEM_ALERT'
  | 'MODERATION_ACTION'
  | 'DIGEST_WEEKLY';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH';

// ============================================================================
// Tipos públicos
// ============================================================================

/** Tradições suportadas pela UI de preferências (alinhado com a mesa real). */
export type NotificationTradicao =
  | 'cigano'
  | 'ifa'
  | 'candomble'
  | 'umbanda'
  | 'cabala'
  | 'astrologia';

/** Ordem canônica das tradições (PT-BR friendly, sem priorização). */
export const TRADICAO_ORDER: readonly NotificationTradicao[] = Object.freeze([
  'cigano',
  'ifa',
  'candomble',
  'umbanda',
  'cabala',
  'astrologia',
] as const);

/** Labels pt-BR (preservando grafia) + emoji nativo. */
export const TRADICAO_LABEL: Readonly<Record<NotificationTradicao, string>> =
  Object.freeze({
    cigano: 'Cigano',
    ifa: 'Ifá',
    candomble: 'Candomblé',
    umbanda: 'Umbanda',
    cabala: 'Cabala',
    astrologia: 'Astrologia',
  });

/** Símbolos das 5+1 tradições (Cigano + 5 outras). */
export const TRADICAO_SYMBOL: Readonly<Record<NotificationTradicao, string>> =
  Object.freeze({
    cigano: '✦',
    ifa: '🪶',
    candomble: '🌍',
    umbanda: '🪘',
    cabala: '✡️',
    astrologia: '♈',
  });

/** Categorias semânticas usadas no agrupamento do form. */
export type PrefsCategory =
  | 'social'
  | 'comunidade'
  | 'conteudo'
  | 'sistema'
  | 'meta';

/** Catálogo declarativo: cada tipo → categoria + label PT-BR + descrição curta. */
export interface NotificationTypeMeta {
  readonly type: NotificationType;
  readonly category: PrefsCategory;
  readonly label: string;
  readonly description: string;
  /** Sub-grupo usado para ordem de render no form (ex: 'social-follow'). */
  readonly group: string;
}

export const NOTIFICATION_TYPE_META: Readonly<
  Record<NotificationType, NotificationTypeMeta>
> = Object.freeze({
  LIKE: {
    type: 'LIKE',
    category: 'social',
    label: 'Curtidas',
    description: 'Quando alguém curte um dos seus posts ou comentários.',
    group: 'social-reactions',
  },
  COMMENT: {
    type: 'COMMENT',
    category: 'social',
    label: 'Comentários',
    description: 'Comentários diretos nos seus posts (sem aninhamento).',
    group: 'social-discussion',
  },
  POST_REPLY: {
    type: 'POST_REPLY',
    category: 'social',
    label: 'Respostas',
    description: 'Respostas em threads que você abriu ou acompanha.',
    group: 'social-discussion',
  },
  FOLLOW: {
    type: 'FOLLOW',
    category: 'social',
    label: 'Novos seguidores',
    description: 'Novos membros passam a te acompanhar na plataforma.',
    group: 'social-graph',
  },
  MENTION: {
    type: 'MENTION',
    category: 'social',
    label: 'Menções (@)',
    description: 'Quando alguém te marca com @ em qualquer post ou comentário.',
    group: 'social-graph',
  },
  GROUP_INVITE: {
    type: 'GROUP_INVITE',
    category: 'comunidade',
    label: 'Convites para grupos',
    description: 'Convites para ingressar em roda ou grupo de estudos.',
    group: 'comunidade-grupo',
  },
  GROUP_POST: {
    type: 'GROUP_POST',
    category: 'comunidade',
    label: 'Posts em grupos',
    description: 'Atividade (posts novos) em grupos que você participa.',
    group: 'comunidade-grupo',
  },
  GROUP_ROLE_CHANGE: {
    type: 'GROUP_ROLE_CHANGE',
    category: 'comunidade',
    label: 'Mudança de papel',
    description: 'Quando seu papel em um grupo é alterado pela coordenação.',
    group: 'comunidade-grupo',
  },
  ARTICLE_RECOMMENDATION: {
    type: 'ARTICLE_RECOMMENDATION',
    category: 'conteudo',
    label: 'Recomendações',
    description: 'Recomendações da curadoria alinhadas aos seus interesses.',
    group: 'conteudo-leitura',
  },
  ARTICLE_PUBLISHED: {
    type: 'ARTICLE_PUBLISHED',
    category: 'conteudo',
    label: 'Artigos publicados',
    description: 'Novos artigos das fontes que você acompanha.',
    group: 'conteudo-leitura',
  },
  SYSTEM_ALERT: {
    type: 'SYSTEM_ALERT',
    category: 'sistema',
    label: 'Alertas do sistema',
    description: 'Comunicados essenciais da plataforma. Sempre recebidos.',
    group: 'sistema-essencial',
  },
  MODERATION_ACTION: {
    type: 'MODERATION_ACTION',
    category: 'sistema',
    label: 'Ações de moderação',
    description: 'Quando algo seu foi revisado pela moderação do espaço.',
    group: 'sistema-essencial',
  },
  DIGEST_WEEKLY: {
    type: 'DIGEST_WEEKLY',
    category: 'meta',
    label: 'Resumo semanal',
    description: 'E-mail agregado com o que rolou na sua semana.',
    group: 'meta-agregados',
  },
});

/** Canais disponíveis na UI (na ordem exibida na matriz). */
export const CHANNEL_ORDER: readonly NotificationChannel[] = Object.freeze([
  'IN_APP',
  'EMAIL',
  'PUSH',
] as const);

/** Labels PT-BR + ícones nativos pra cada canal. */
export const CHANNEL_LABEL: Readonly<Record<NotificationChannel, string>> =
  Object.freeze({
    IN_APP: 'No app',
    EMAIL: 'E-mail',
    PUSH: 'Push',
  });

export const CHANNEL_ICON: Readonly<Record<NotificationChannel, string>> =
  Object.freeze({
    IN_APP: '🔔',
    EMAIL: '📧',
    PUSH: '📲',
  });

/** Cap diário padrão por tipo (mensagens/dia). Ajustável pela UI. */
export interface FrequencyCap {
  readonly type: NotificationType;
  readonly maxPerDay: number;
}

const CAP_DEFAULTS: FrequencyCap[] = [
  { type: 'LIKE', maxPerDay: 20 },
  { type: 'COMMENT', maxPerDay: 30 },
  { type: 'POST_REPLY', maxPerDay: 30 },
  { type: 'FOLLOW', maxPerDay: 5 },
  { type: 'MENTION', maxPerDay: 15 },
  { type: 'GROUP_INVITE', maxPerDay: 10 },
  { type: 'GROUP_POST', maxPerDay: 10 },
  { type: 'GROUP_ROLE_CHANGE', maxPerDay: 3 },
  { type: 'ARTICLE_RECOMMENDATION', maxPerDay: 3 },
  { type: 'ARTICLE_PUBLISHED', maxPerDay: 5 },
  // SYSTEM_ALERT + MODERATION_ACTION sem cap (sempre entregue).
  // DIGEST_WEEKLY por design é 1x/semana.
];

export const DEFAULT_FREQUENCY_CAPS: readonly FrequencyCap[] =
  Object.freeze(CAP_DEFAULTS);

/** Tipos SEM cap (críticos) — derivados centralmente pra evitar duplicação. */
export const UNCAPPED_TYPES: ReadonlySet<NotificationType> = Object.freeze(
  new Set<NotificationType>(['SYSTEM_ALERT', 'MODERATION_ACTION'])
);

/** Limite global (todos os tipos somados) — anti-spam respeitoso. */
export const GLOBAL_DAILY_FLOOR = 100;

// ============================================================================
// Quiet Hours
// ============================================================================

/** Janela de silêncio (formato 24h, minutos desde meia-noite). */
export interface QuietHoursWindow {
  /** 0..1439 (minutos). */
  readonly startMinutes: number;
  /** 0..1439 (minutos). start <= end. */
  readonly endMinutes: number;
  /** Fuso "IANA" preferido do usuário. Default = 'America/Sao_Paulo'. */
  readonly tz: string;
}

/** Construtor seguro — aceita janelas cruzando meia-noite (start > end). */
export function createQuietHours(
  startMinutes: number,
  endMinutes: number,
  tz = 'America/Sao_Paulo'
): QuietHoursWindow {
  const clamp = (n: number): number => Math.min(1439, Math.max(0, Math.floor(n)));
  const s = clamp(startMinutes);
  const e = clamp(endMinutes);
  // Janelas com start == end são inválidas (sempre true ou sempre false). Se
  // o usuário explicitamente pedir igual, devolvemos um passo de 1 min pra
  // manter semântica defensiva. Cross-midnight (start > end) é aceito.
  if (s === e) {
    return Object.freeze({
      startMinutes: s,
      endMinutes: clamp((s + 1) % 1440),
      tz,
    });
  }
  return Object.freeze({ startMinutes: s, endMinutes: e, tz });
}

/** Janela "noite típica" pré-configurada (22:00–08:00 SP). */
export const DEFAULT_QUIET_HOURS: QuietHoursWindow = Object.freeze(
  createQuietHours(22 * 60, 8 * 60, 'America/Sao_Paulo')
);

/** Converte "HH:MM" → minutos desde meia-noite. Joga se mal-formado. */
export function parseHHMM(value: string): number {
  if (typeof value !== 'string') throw new Error('parseHHMM expects string');
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) throw new Error(`parseHHMM: formato inválido "${value}"`);
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) throw new Error(`parseHHMM: fora de range "${value}"`);
  return h * 60 + m;
}

/** Converte minutos desde meia-noite → "HH:MM". */
export function formatHHMM(minutes: number): string {
  const safe = Math.min(1439, Math.max(0, Math.floor(minutes)));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Extrai hora local (minutos desde meia-noite) de uma data usando o fuso. */
export function localMinutesOfDate(date: Date, tz: string): number {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error('localMinutesOfDate: data inválida');
  }
  // Usa Intl.DateTimeFormat com fuso explícito — determinístico em SSR/CSR.
  const fmt = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: tz,
  });
  const parts = fmt.formatToParts(date);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  // Corrigir hour=24 que Intl pode retornar em alguns fusos-limite.
  const normHour = hour === 24 ? 0 : hour;
  return normHour * 60 + minute;
}

/**
 * Decide se um instante está dentro da janela de quiet hours.
 * Janela pode cruzar meia-noite (ex: 22:00–08:00).
 */
export function isInQuietHours(
  date: Date,
  window: QuietHoursWindow
): boolean {
  const m = localMinutesOfDate(date, window.tz);
  const { startMinutes, endMinutes } = window;
  if (startMinutes === endMinutes) return false;
  if (startMinutes < endMinutes) {
    return m >= startMinutes && m < endMinutes;
  }
  // Janela cruzando meia-noite (ex: 22:00 → 08:00).
  return m >= startMinutes || m < endMinutes;
}

/** Próximo instante em que a janela de quiet hours termina (UX do form). */
export function nextWindowEnd(
  date: Date,
  window: QuietHoursWindow
): Date {
  const out = new Date(date.getTime());
  const m = localMinutesOfDate(date, window.tz);
  if (m < window.endMinutes) {
    out.setHours(Math.floor(window.endMinutes / 60), window.endMinutes % 60, 0, 0);
    return out;
  }
  if (m < window.startMinutes) {
    out.setHours(Math.floor(window.endMinutes / 60), window.endMinutes % 60, 0, 0);
    return out;
  }
  // Dentro da janela → só termina amanhã.
  out.setDate(out.getDate() + 1);
  out.setHours(Math.floor(window.endMinutes / 60), window.endMinutes % 60, 0, 0);
  return out;
}

// ============================================================================
// Channel Matrix (decisão UI-side que entra no engine na hora de salvar)
// ============================================================================

/**
 * Para uma dada tradição, quais canais são ACEITÁVEIS como default inicial?
 * O usuário pode desabilitar individualmente depois.
 *
 * Política LGPD-friendly:
 *   * IN_APP: sempre habilitado (essencial pra UX, opt-out, não opt-in)
 *   * EMAIL: opt-out (pode desmarcar)
 *   * PUSH: opt-in (default off, exige consentimento explícito)
 */
export type ChannelMatrix = Readonly<
  Record<NotificationTradicao, ReadonlySet<NotificationChannel>>
>;

function freezeSet<T>(items: readonly T[]): ReadonlySet<T> {
  return Object.freeze(new Set<T>(items));
}

export const TRADICAO_DEFAULT_CHANNELS: ChannelMatrix = Object.freeze({
  cigano: freezeSet<NotificationChannel>(['IN_APP', 'EMAIL']),
  ifa: freezeSet<NotificationChannel>(['IN_APP', 'EMAIL']),
  candomble: freezeSet<NotificationChannel>(['IN_APP', 'EMAIL']),
  umbanda: freezeSet<NotificationChannel>(['IN_APP', 'EMAIL']),
  cabala: freezeSet<NotificationChannel>(['IN_APP', 'EMAIL']),
  astrologia: freezeSet<NotificationChannel>(['IN_APP', 'EMAIL']),
});

/** Tipos que DEVEM ser forçados a "IN_APP", ignorando pref do usuário. */
export const ALWAYS_IN_APP_TYPES: ReadonlySet<NotificationType> = Object.freeze(
  new Set<NotificationType>(['SYSTEM_ALERT', 'MODERATION_ACTION'])
);

/**
 * Aplica matriz de tradição nas preferências resolvidas:
 * 1. Respeita pref do usuário quando disponível.
 * 2. Garante que tipos críticos ficam IN_APP.
 * 3. Garante cap por tradição (canais não disponíveis na matriz ficam off).
 */
export function byTradicao(
  prefs: ResolvedPreferences,
  tradicao: NotificationTradicao,
  allowedChannels: ReadonlySet<NotificationChannel> = TRADICAO_DEFAULT_CHANNELS[
    tradicao
  ]
): ResolvedPreferences {
  const out: Record<string, { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean }> = {};
  for (const type of Object.keys(prefs) as NotificationType[]) {
    const row = prefs[type];
    const keep = (channel: NotificationChannel, value: boolean): boolean =>
      channel === 'IN_APP' && ALWAYS_IN_APP_TYPES.has(type)
        ? true
        : allowedChannels.has(channel)
          ? value
          : false;

    out[type] = Object.freeze({
      inApp: row.inApp,
      email: keep('EMAIL', row.email),
      push: keep('PUSH', row.push),
      weeklyDigest: row.weeklyDigest,
    });
  }
  return out as ResolvedPreferences;
}

/** Canais ativos pra um dado tipo (considera matriz da tradição). */
export function resolveActiveChannels(
  prefs: ResolvedPreferences,
  type: NotificationType,
  tradicao: NotificationTradicao
): readonly NotificationChannel[] {
  const row = prefs[type];
  const allowed = TRADICAO_DEFAULT_CHANNELS[tradicao];
  const channels: NotificationChannel[] = [];
  if (row.inApp) channels.push('IN_APP');
  if (row.email && allowed.has('EMAIL')) channels.push('EMAIL');
  if (row.push && allowed.has('PUSH')) channels.push('PUSH');
  return Object.freeze(channels);
}

// ============================================================================
// Frequency Caps
// ============================================================================

export interface FrequencyCapState {
  readonly caps: Readonly<Record<NotificationType, number>>;
  readonly perTypeCounts: Readonly<Record<NotificationType, number>>;
  /** Total estimado entregue hoje (somatório dos contadores). */
  readonly globalCount: number;
  readonly date: string; // ISO YYYY-MM-DD
}

/** Inicializa cap state a partir da lista default. */
export function createInitialCapState(
  caps: readonly FrequencyCap[] = DEFAULT_FREQUENCY_CAPS,
  date = '1970-01-01'
): FrequencyCapState {
  const map: Record<NotificationType, number> = {} as Record<NotificationType, number>;
  for (const type of Object.keys(NOTIFICATION_TYPE_META) as NotificationType[]) {
    map[type] = UNCAPPED_TYPES.has(type) ? Number.POSITIVE_INFINITY : GLOBAL_DAILY_FLOOR;
  }
  for (const cap of caps) {
    if (!UNCAPPED_TYPES.has(cap.type)) {
      map[cap.type] = cap.maxPerDay;
    }
  }
  const counts: Record<NotificationType, number> = {} as Record<NotificationType, number>;
  for (const type of Object.keys(NOTIFICATION_TYPE_META) as NotificationType[]) {
    counts[type] = 0;
  }
  return Object.freeze({
    caps: Object.freeze(map),
    perTypeCounts: Object.freeze(counts),
    globalCount: 0,
    date,
  });
}

/** Aplica um cap customizado pra um tipo específico (devolve nova state). */
export function setCap(
  state: FrequencyCapState,
  type: NotificationType,
  maxPerDay: number
): FrequencyCapState {
  if (UNCAPPED_TYPES.has(type)) return state;
  if (!Number.isFinite(maxPerDay) || maxPerDay < 0) {
    throw new Error(`setCap: maxPerDay inválido (${maxPerDay})`);
  }
  const caps = { ...state.caps, [type]: Math.floor(maxPerDay) };
  const perTypeCounts = { ...state.perTypeCounts };
  return Object.freeze({ ...state, caps });
}

/** Incrementa contador diário de um tipo (devolve nova state). */
export function registerDelivery(
  state: FrequencyCapState,
  type: NotificationType,
  now = 1
): FrequencyCapState {
  if (!Number.isFinite(now) || now < 0 || !Number.isInteger(now)) {
    throw new Error('registerDelivery: now deve ser inteiro >= 0');
  }
  const perTypeCounts = { ...state.perTypeCounts };
  perTypeCounts[type] = (perTypeCounts[type] ?? 0) + now;
  const globalCount = state.globalCount + now;
  return Object.freeze({ ...state, perTypeCounts, globalCount });
}

/** Decide se a entrega respeita o cap ou deve cair pra digest/defer. */
export function shouldDeliverWithCap(
  state: FrequencyCapState,
  type: NotificationType
): 'deliver' | 'digest' | 'throttle' {
  if (UNCAPPED_TYPES.has(type)) return 'deliver';
  if (state.globalCount >= GLOBAL_DAILY_FLOOR) return 'throttle';
  const used = state.perTypeCounts[type] ?? 0;
  const cap = state.caps[type] ?? GLOBAL_DAILY_FLOOR;
  if (used < cap) return 'deliver';
  // Ultrapassou cap do tipo, mas há orçamento global → cai pra digest diário.
  return 'digest';
}

// ============================================================================
// Diff + Merge (UX do form: detecta dirty / aplica mudanças)
// ============================================================================

export type DiffMode = 'equal' | 'changed' | 'added' | 'removed';

/** Conta quantos canais diferem entre duas linhas. */
export function diffRow(
  a: { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean } | undefined,
  b: { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean }
): number {
  if (!a) return 4;
  let diff = 0;
  if (a.inApp !== b.inApp) diff++;
  if (a.email !== b.email) diff++;
  if (a.push !== b.push) diff++;
  if (a.weeklyDigest !== b.weeklyDigest) diff++;
  return diff;
}

/** Compara duas preferências e retorna contagem de mudanças por canal. */
export function diffPreferences(
  a: ResolvedPreferences,
  b: ResolvedPreferences
): {
  readonly totalChanges: number;
  readonly perTypeChanges: Readonly<Record<NotificationType, number>>;
} {
  const perTypeChanges: Record<NotificationType, number> = {} as Record<
    NotificationType,
    number
  >;
  let total = 0;
  for (const type of Object.keys(b) as NotificationType[]) {
    const changes = diffRow(a[type], b[type]);
    perTypeChanges[type] = changes;
    total += changes;
  }
  return Object.freeze({
    totalChanges: total,
    perTypeChanges: Object.freeze(perTypeChanges),
  });
}

/** Merge profundo de prefs — segunda fonte sobrescreve primeira. */
export function mergePreferences(
  base: ResolvedPreferences,
  override: Partial<ResolvedPreferences>
): ResolvedPreferences {
  const out = {} as Record<NotificationType, { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean }>;
  for (const type of Object.keys(base) as NotificationType[]) {
    const baseRow = base[type];
    const overrideRow = override[type] as Partial<typeof baseRow> | undefined;
    out[type] = Object.freeze({
      inApp: overrideRow?.inApp ?? baseRow.inApp,
      email: overrideRow?.email ?? baseRow.email,
      push: overrideRow?.push ?? baseRow.push,
      weeklyDigest: overrideRow?.weeklyDigest ?? baseRow.weeklyDigest,
    });
  }
  return out as ResolvedPreferences;
}

/** Fingerprint determinístico (string) pra detectar mudanças em batched saves. */
export function fingerprint(prefs: ResolvedPreferences): string {
  const lines: string[] = [];
  for (const type of Object.keys(prefs).sort() as NotificationType[]) {
    const r = prefs[type];
    lines.push(`${type}:${+r.inApp}${+r.email}${+r.push}${+r.weeklyDigest}`);
  }
  return lines.join('|');
}

// ============================================================================
// Page Filter — busca/grupo/tipo (UI-side apenas; engine é puro)
// ============================================================================

export type PageFilterTradicao =
  | NotificationTradicao
  | 'all';

export interface PageFilter {
  readonly query: string;
  readonly tradicao: PageFilterTradicao;
  readonly category: PrefsCategory | 'all';
}

export const EMPTY_PAGE_FILTER: PageFilter = Object.freeze({
  query: '',
  tradicao: 'all',
  category: 'all',
});

/** Item renderizado no form (linha). */
export interface PrefsRow {
  readonly type: NotificationType;
  readonly meta: NotificationTypeMeta;
  readonly preferences: {
    readonly inApp: boolean;
    readonly email: boolean;
    readonly push: boolean;
    readonly weeklyDigest: boolean;
  };
  readonly tradicao: NotificationTradicao;
}

/** Compose itens → aplica filtro no lado do cliente (memo puro). */
export function applyPageFilter(
  items: readonly PrefsRow[],
  filter: PageFilter,
  allowedByTraducao: ReadonlySet<NotificationType> = new Set(
    Object.keys(NOTIFICATION_TYPE_META) as NotificationType[]
  )
): readonly PrefsRow[] {
  const q = filter.query.trim().toLowerCase();
  return Object.freeze(
    items.filter((row) => {
      if (filter.tradicao !== 'all' && row.tradicao !== filter.tradicao) {
        return false;
      }
      if (filter.category !== 'all' && row.meta.category !== filter.category) {
        return false;
      }
      if (q.length > 0) {
        const haystack = `${row.meta.label} ${row.meta.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return allowedByTraducao.has(row.type);
    })
  );
}

/** Conta quantos canais estão ativos no agregado (UX de badges). */
export function countActiveChannels(
  items: readonly PrefsRow[],
  channel: NotificationChannel
): number {
  let count = 0;
  for (const row of items) {
    if (channel === 'IN_APP' && row.preferences.inApp) count++;
    if (channel === 'EMAIL' && row.preferences.email) count++;
    if (channel === 'PUSH' && row.preferences.push) count++;
  }
  return count;
}

/** Determina se pelo menos 1 canal está marcado pra LGPD gate (canSubmit). */
export function hasAnyChannel(
  row: { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean }
): boolean {
  return row.inApp || row.email || row.push || row.weeklyDigest;
}

// ============================================================================
// Hook: useNotificationPrefs (state + reducers)
// ============================================================================

export type HookStatus =
  | 'idle'
  | 'loading'
  | 'saving'
  | 'saved'
  | 'error'
  | 'partial';

export interface UseNotificationPrefsOptions {
  /** Estado inicial — vem do server (DB). Defaults do engine quando omitido. */
  readonly initial?: ResolvedPreferences;
  /** Tradição do usuário (decide canais default). */
  readonly tradicao?: NotificationTradicao;
  /** Quiet hours preferido (do perfil). */
  readonly quietHours?: QuietHoursWindow;
  /** Cap state opcional. */
  readonly capState?: FrequencyCapState;
}

export interface UseNotificationPrefsState {
  readonly prefs: ResolvedPreferences;
  readonly baseline: ResolvedPreferences;
  readonly quietHours: QuietHoursWindow;
  readonly capState: FrequencyCapState;
  readonly status: HookStatus;
  readonly errorMessage: string | null;
  readonly dirty: boolean;
  readonly canSubmit: boolean;
  readonly lastSavedAt: number | null;
}

type Action =
  | { type: 'toggle'; row: NotificationType; channel: NotificationChannel }
  | { type: 'toggleWeeklyDigest'; row: NotificationType }
  | { type: 'setRow'; row: NotificationType; value: { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean } }
  | { type: 'bulkSet'; prefs: Partial<ResolvedPreferences> }
  | { type: 'setQuietHours'; window: QuietHoursWindow }
  | { type: 'setCap'; row: NotificationType; maxPerDay: number }
  | { type: 'incDelivery'; row: NotificationType; amount?: number }
  | { type: 'status'; status: HookStatus; errorMessage?: string | null }
  | { type: 'commit' }
  | { type: 'reset' };

function reducer(
  state: UseNotificationPrefsState,
  action: Action
): UseNotificationPrefsState {
  switch (action.type) {
    case 'toggle': {
      const cur = state.prefs[action.row];
      let next: typeof cur;
      switch (action.channel) {
        case 'IN_APP':
          next = { ...cur, inApp: !cur.inApp };
          break;
        case 'EMAIL':
          next = { ...cur, email: !cur.email };
          break;
        case 'PUSH':
          next = { ...cur, push: !cur.push };
          break;
      }
      return reducerTick({ ...state, prefs: { ...state.prefs, [action.row]: next } });
    }
    case 'toggleWeeklyDigest': {
      const cur = state.prefs[action.row];
      return reducerTick({
        ...state,
        prefs: {
          ...state.prefs,
          [action.row]: { ...cur, weeklyDigest: !cur.weeklyDigest },
        },
      });
    }
    case 'setRow': {
      return reducerTick({
        ...state,
        prefs: { ...state.prefs, [action.row]: action.value },
      });
    }
    case 'bulkSet': {
      const merged = mergePreferences(state.prefs, action.prefs);
      return reducerTick({ ...state, prefs: merged });
    }
    case 'setQuietHours': {
      return { ...state, quietHours: action.window };
    }
    case 'setCap': {
      return { ...state, capState: setCap(state.capState, action.row, action.maxPerDay) };
    }
    case 'incDelivery': {
      const newCap = registerDelivery(state.capState, action.row, action.amount ?? 1);
      return { ...state, capState: newCap };
    }
    case 'status': {
      return {
        ...state,
        status: action.status,
        errorMessage:
          action.errorMessage === undefined ? state.errorMessage : action.errorMessage,
        lastSavedAt:
          action.status === 'saved'
            ? Date.now()
            : state.lastSavedAt,
      };
    }
    case 'commit': {
      return {
        ...state,
        baseline: state.prefs,
        dirty: false,
        status: 'saved',
        lastSavedAt: state.lastSavedAt ?? Date.now(),
      };
    }
    case 'reset': {
      return {
        ...state,
        prefs: state.baseline,
        dirty: false,
        status: 'idle',
        errorMessage: null,
      };
    }
    default:
      return state;
  }
}

function reducerTick(state: UseNotificationPrefsState): UseNotificationPrefsState {
  const diff = diffPreferences(state.baseline, state.prefs);
  const anyRow = (Object.keys(state.prefs) as NotificationType[]).some((t) =>
    hasAnyChannel(state.prefs[t])
  );
  return {
    ...state,
    dirty: diff.totalChanges > 0,
    canSubmit: diff.totalChanges > 0 && anyRow,
    status: state.status === 'saved' ? 'idle' : state.status,
  };
}

/**
 * Hook principal de preferências — devolve state + ações + métrica `dirty`
 * + `canSubmit` (LGPD gate) + helpers de canais / quiet hours.
 */
export function useNotificationPrefs(
  options: UseNotificationPrefsOptions = {}
): UseNotificationPrefsState & {
  toggle: (row: NotificationType, channel: NotificationChannel) => void;
  toggleWeeklyDigest: (row: NotificationType) => void;
  setRow: (
    row: NotificationType,
    value: { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean }
  ) => void;
  bulkSet: (prefs: Partial<ResolvedPreferences>) => void;
  setQuietHours: (window: QuietHoursWindow) => void;
  setCap: (row: NotificationType, maxPerDay: number) => void;
  incDelivery: (row: NotificationType, amount?: number) => void;
  setStatus: (status: HookStatus, errorMessage?: string | null) => void;
  commit: () => void;
  reset: () => void;
} {
  const initial: ResolvedPreferences = useMemo(() => {
    if (options.initial) return options.initial;
    // Default conservador: opt-out pra in-app/email, opt-in pra push.
    const def: Record<
      NotificationType,
      { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean }
    > = {} as Record<
      NotificationType,
      { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean }
    >;
    for (const type of Object.keys(NOTIFICATION_TYPE_META) as NotificationType[]) {
      def[type] = Object.freeze({
        inApp: true,
        email: type !== 'LIKE' && type !== 'FOLLOW' && type !== 'GROUP_POST',
        push: false,
        weeklyDigest: ['LIKE', 'FOLLOW', 'GROUP_POST'].includes(type),
      });
    }
    return Object.freeze(def) as ResolvedPreferences;
  }, [options.initial]);

  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const tradicao = options.tradicao ?? 'cigano';
    const filtered = byTradicao(initial, tradicao);
    return {
      prefs: filtered,
      baseline: filtered,
      quietHours: options.quietHours ?? DEFAULT_QUIET_HOURS,
      capState: options.capState ?? createInitialCapState(),
      status: 'idle' as const,
      errorMessage: null,
      dirty: false,
      canSubmit: false,
      lastSavedAt: null,
    };
  });

  // Re-aplica matriz de tradição se mudar (ex: usuário editou perfil).
  const tradicao = options.tradicao ?? 'cigano';
  const tradicaoRef = useRef<NotificationTradicao>(tradicao);
  useEffect(() => {
    if (tradicaoRef.current === tradicao) return;
    tradicaoRef.current = tradicao;
    const filtered = byTradicao(state.prefs, tradicao);
    dispatch({ type: 'bulkSet', prefs: filtered });
  }, [tradicao, state.prefs]);

  return Object.freeze({
    ...state,
    toggle: useCallback(
      (row: NotificationType, channel: NotificationChannel) =>
        dispatch({ type: 'toggle', row, channel }),
      []
    ),
    toggleWeeklyDigest: useCallback(
      (row: NotificationType) => dispatch({ type: 'toggleWeeklyDigest', row }),
      []
    ),
    setRow: useCallback(
      (
        row: NotificationType,
        value: { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean }
      ) => dispatch({ type: 'setRow', row, value }),
      []
    ),
    bulkSet: useCallback(
      (prefs: Partial<ResolvedPreferences>) =>
        dispatch({ type: 'bulkSet', prefs }),
      []
    ),
    setQuietHours: useCallback(
      (window: QuietHoursWindow) =>
        dispatch({ type: 'setQuietHours', window }),
      []
    ),
    setCap: useCallback(
      (row: NotificationType, maxPerDay: number) =>
        dispatch({ type: 'setCap', row, maxPerDay }),
      []
    ),
    incDelivery: useCallback(
      (row: NotificationType, amount = 1) =>
        dispatch({ type: 'incDelivery', row, amount }),
      []
    ),
    setStatus: useCallback(
      (status: HookStatus, errorMessage: string | null = null) =>
        dispatch({ type: 'status', status, errorMessage }),
      []
    ),
    commit: useCallback(() => dispatch({ type: 'commit' }), []),
    reset: useCallback(() => dispatch({ type: 'reset' }), []),
  });
}

// ============================================================================
// Seletores auxiliares (memo friendly para listas grandes)
// ============================================================================

/** Agrupa tipos por categoria — ordem determinística. */
export function groupByCategory(
  items: readonly PrefsRow[]
): Readonly<Record<PrefsCategory, readonly PrefsRow[]>> {
  const cats: Record<PrefsCategory, PrefsRow[]> = {
    social: [],
    comunidade: [],
    conteudo: [],
    sistema: [],
    meta: [],
  };
  for (const row of items) {
    cats[row.meta.category].push(row);
  }
  return Object.freeze({
    social: Object.freeze(cats.social),
    comunidade: Object.freeze(cats.comunidade),
    conteudo: Object.freeze(cats.conteudo),
    sistema: Object.freeze(cats.sistema),
    meta: Object.freeze(cats.meta),
  });
}

/** Deriva lista de PrefsRow de prefs resolvidas + tradição. */
export function buildPrefsRows(
  prefs: ResolvedPreferences,
  tradicao: NotificationTradicao
): readonly PrefsRow[] {
  const rows: PrefsRow[] = [];
  for (const type of Object.keys(NOTIFICATION_TYPE_META) as NotificationType[]) {
    rows.push({
      type,
      meta: NOTIFICATION_TYPE_META[type],
      preferences: prefs[type],
      tradicao,
    });
  }
  // Ordena por categoria → group → label (PT-BR friendly, alfabético).
  const order: Record<PrefsCategory, number> = {
    social: 0,
    comunidade: 1,
    conteudo: 2,
    sistema: 3,
    meta: 4,
  };
  rows.sort((a, b) => {
    const ca = order[a.meta.category];
    const cb = order[b.meta.category];
    if (ca !== cb) return ca - cb;
    if (a.meta.group !== b.meta.group) return a.meta.group.localeCompare(b.meta.group);
    return a.meta.label.localeCompare(b.meta.label, 'pt-BR');
  });
  return Object.freeze(rows);
}

// ============================================================================
// Versions exportados (fingerprint schema)
// ============================================================================

export const ENGINE_VERSION = 'w91s.notifications-prefs-engine.v1';
export const SCHEMA_FIELDS: readonly string[] = Object.freeze([
  'inApp',
  'email',
  'push',
  'weeklyDigest',
] as const);
