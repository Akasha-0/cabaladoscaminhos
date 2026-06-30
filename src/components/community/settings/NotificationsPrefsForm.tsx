'use client';

// ============================================================================
// W91s — NotificationsPrefsForm
// ============================================================================
// Formulário de preferências de notificação consumido pela página
// /settings/notifications. Mobile-first (≥44px touch targets), ARIA acessível,
// positive-only copy.
//
// Estrutura:
//   1) Quiet Hours (silenciar durante a noite, sem cortar alertas críticos)
//   2) Channel matrix por tradição (Cigano/Ifá/Cabala/Candomblé/Umbanda/Astrologia)
//   3) Tipos agrupados por categoria (social/comunidade/conteudo/sistema/meta)
//   4) Footer com LGPD gate (canSubmit) + ação "Restaurar" + status final
//
// Hook: useNotificationPrefs (em @/lib/w91s/notifications-prefs-engine).
// Persistência: o form só coleta — quem persiste é o pai (page Server
// Component) que submete pra API quando dirty + canSubmit.
// ============================================================================

import React, { useEffect, useId, useMemo, useState } from 'react';
import {
  Bell, Mail, Smartphone, Save, RefreshCcw, AlertTriangle,
  Search, Filter, Moon, Sun, ChevronDown, Info, CheckCircle2,
  Volume2, VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  useNotificationPrefs,
  buildPrefsRows,
  applyPageFilter,
  countActiveChannels,
  hasAnyChannel,
  EMPTY_PAGE_FILTER,
  TRADICAO_ORDER,
  TRADICAO_LABEL,
  TRADICAO_SYMBOL,
  CHANNEL_ORDER,
  CHANNEL_LABEL,
  CHANNEL_ICON,
  DEFAULT_QUIET_HOURS,
  NOTIFICATION_TYPE_META,
  parseHHMM,
  formatHHMM,
  createQuietHours,
} from '@/lib/w91s/notifications-prefs-engine';
import type {
  NotificationChannel,
  NotificationType,
  NotificationTradicao,
  PageFilter,
  PrefsCategory,
  QuietHoursWindow,
  ResolvedPreferences,
} from '@/lib/w91s/notifications-prefs-engine';
import type {
  NotificationPreferenceDto,
  NotificationType as PrismaNotificationType,
} from '@/lib/notifications';

// ============================================================================
// Props
// ============================================================================

export interface NotificationsPrefsFormProps {
  /** Estado inicial resolvido (DB → ResolvedPreferences). */
  readonly initial?: ResolvedPreferences;
  /** Tradição do usuário (define canais default). */
  readonly tradicao?: NotificationTradicao;
  /** Quiet hours preferido (do perfil). */
  readonly quietHours?: QuietHoursWindow;
  /** Lista de preferências salvas (DB) — opcional, pra reconciliação inicial. */
  readonly saved?: readonly NotificationPreferenceDto[];
  /** Callback chamado quando o form está dirty + canSubmit (LGPD gate). */
  readonly onPersist?: (payload: {
    readonly prefs: ResolvedPreferences;
    readonly quietHours: QuietHoursWindow;
  }) => Promise<{ ok: boolean; error?: string }>;
  /** URL de retorno após salvar (padrão: stay). */
  readonly redirectTo?: string;
}

// ============================================================================
// Component
// ============================================================================

export function NotificationsPrefsForm({
  initial,
  tradicao = 'cigano',
  quietHours,
  saved,
  onPersist,
  redirectTo,
}: NotificationsPrefsFormProps) {
  // Reconciliação inicial a partir de `saved` quando houver.
  const initialFromSaved = useMemo<ResolvedPreferences | undefined>(() => {
    if (!saved || saved.length === 0) return initial;
    const map: Record<string, NotificationPreferenceDto> = {};
    for (const row of saved) map[row.type] = row;
    if (!initial) return undefined;
    const out = {} as ResolvedPreferences;
    for (const type of Object.keys(initial) as NotificationType[]) {
      const row = map[type];
      if (!row) {
        out[type] = initial[type];
        continue;
      }
      out[type] = Object.freeze({
        inApp: row.inApp,
        email: row.email,
        push: row.push,
        weeklyDigest: row.weeklyDigest,
      });
    }
    return Object.freeze(out) as ResolvedPreferences;
  }, [initial, saved]);

  const {
    prefs,
    quietHours: currentQuietHours,
    status,
    dirty,
    canSubmit,
    toggle,
    toggleWeeklyDigest,
    bulkSet,
    setQuietHours,
    setStatus,
    commit,
    reset,
  } = useNotificationPrefs({
    initial: initialFromSaved,
    tradicao,
    quietHours: quietHours ?? DEFAULT_QUIET_HOURS,
  });

  // Page filter (UI-side state)
  const [filter, setFilter] = useState<PageFilter>(EMPTY_PAGE_FILTER);
  const [expandedCats, setExpandedCats] = useState<Record<PrefsCategory, boolean>>({
    social: true,
    comunidade: true,
    conteudo: true,
    sistema: false,
    meta: false,
  });

  // Persist action: o pai controla LGPD gate (canSubmit deve estar true).
  const [lastError, setLastError] = useState<string | null>(null);
  const persist = async () => {
    if (!onPersist) {
      setStatus('saved', null);
      commit();
      return;
    }
    if (!canSubmit) {
      setLastError(
        'Ative pelo menos um canal (no app, e-mail ou push) pra salvar.'
      );
      return;
    }
    setStatus('saving', null);
    try {
      const result = await onPersist({
        prefs,
        quietHours: currentQuietHours,
      });
      if (!result.ok) {
        setLastError(result.error ?? 'Falha ao salvar preferências.');
        setStatus('error', result.error ?? 'save-failed');
        return;
      }
      setLastError(null);
      setStatus('saved', null);
      commit();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'save-failed';
      setLastError(msg);
      setStatus('error', msg);
    }
  };

  const rows = useMemo(() => buildPrefsRows(prefs, tradicao), [prefs, tradicao]);
  const filteredRows = useMemo(
    () => applyPageFilter(rows, filter),
    [rows, filter]
  );

  const activeByChannel = useMemo(() => {
    const counts = {
      IN_APP: countActiveChannels(rows, 'IN_APP'),
      EMAIL: countActiveChannels(rows, 'EMAIL'),
      PUSH: countActiveChannels(rows, 'PUSH'),
    } as const;
    return counts;
  }, [rows]);

  // Quiet Hours preview (dinâmico)
  const [nowMinutes, setNowMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  useEffect(() => {
    const id = window.setInterval(() => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const inQuietNow = useMemo(() => {
    const { startMinutes, endMinutes } = currentQuietHours;
    if (startMinutes === endMinutes) return false;
    if (startMinutes < endMinutes) {
      return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    }
    return nowMinutes >= startMinutes || nowMinutes < endMinutes;
  }, [currentQuietHours, nowMinutes]);

  // Reset dirty → id status
  useEffect(() => {
    if (!dirty && status === 'saved') {
      const id = window.setTimeout(() => setStatus('idle', null), 2500);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [dirty, status, setStatus]);

  return (
    <form
      className="space-y-8 max-w-full sm:max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
      aria-labelledby="notif-prefs-title"
      onSubmit={(e) => {
        e.preventDefault();
        void persist();
      }}
      data-testid="notifications-prefs-form"
    >
      {/* HEADER ------------------------------------------------------------- */}
      <header className="space-y-2">
        <h1
          id="notif-prefs-title"
          className="text-2xl sm:text-3xl font-bold text-foreground"
          data-testid="notifications-prefs-title"
        >
          Preferências de notificações
        </h1>
        <p className="text-sm text-muted-foreground">
          Escolha como receber avisos da comunidade, do seu ciclo de estudos e das
          tradições que você acompanha — sem perder o que importa.
        </p>
        <ul className="flex flex-wrap items-center gap-2 pt-2" aria-label="Resumo rápido">
          <li>
            <SummaryBadge
              icon={<Volume2 className="w-3.5 h-3.5" aria-hidden="true" />}
              label="No app"
              count={activeByChannel.IN_APP}
              total={rows.length}
              testId="summary-in-app"
            />
          </li>
          <li>
            <SummaryBadge
              icon={<Mail className="w-3.5 h-3.5" aria-hidden="true" />}
              label="E-mail"
              count={activeByChannel.EMAIL}
              total={rows.length}
              testId="summary-email"
            />
          </li>
          <li>
            <SummaryBadge
              icon={<Smartphone className="w-3.5 h-3.5" aria-hidden="true" />}
              label="Push"
              count={activeByChannel.PUSH}
              total={rows.length}
              testId="summary-push"
            />
          </li>
        </ul>
      </header>

      {/* QUIET HOURS -------------------------------------------------------- */}
      <QuietHoursCard
        quietHours={currentQuietHours}
        inQuietNow={inQuietNow}
        onChange={(w) => setQuietHours(w)}
        testId="quiet-hours-card"
      />

      {/* PAGE FILTER -------------------------------------------------------- */}
      <section
        className="space-y-4"
        aria-label="Filtro de tipos"
        data-testid="notifications-filter-section"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-base font-semibold text-foreground">
            Filtrar por tradição ou categoria
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="filter-tradicao"
              className="block text-sm font-medium text-foreground/90"
            >
              Tradição ativa
            </label>
            <select
              id="filter-tradicao"
              className="mt-1 w-full min-h-[44px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={filter.tradicao}
              onChange={(e) => {
                const v = e.target.value as PageFilter['tradicao'];
                setFilter({ ...filter, tradicao: v });
              }}
              data-testid="filter-tradicao-select"
              aria-label="Filtrar por tradição"
            >
              <option value="all">Todas as tradições</option>
              {TRADICAO_ORDER.map((t) => (
                <option key={t} value={t}>
                  {TRADICAO_SYMBOL[t]} {TRADICAO_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="filter-cat"
              className="block text-sm font-medium text-foreground/90"
            >
              Categoria
            </label>
            <select
              id="filter-cat"
              className="mt-1 w-full min-h-[44px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={filter.category}
              onChange={(e) => {
                const v = e.target.value as PageFilter['category'];
                setFilter({ ...filter, category: v });
              }}
              data-testid="filter-category-select"
              aria-label="Filtrar por categoria"
            >
              <option value="all">Todas as categorias</option>
              <option value="social">Social</option>
              <option value="comunidade">Comunidade</option>
              <option value="conteudo">Conteúdo</option>
              <option value="sistema">Sistema</option>
              <option value="meta">Meta</option>
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="filter-search"
            className="block text-sm font-medium text-foreground/90"
          >
            Buscar
          </label>
          <div className="relative mt-1">
            <Search
              className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="filter-search"
              type="search"
              placeholder="Curtidas, menções, convites…"
              className="min-h-[44px] pl-9"
              value={filter.query}
              onChange={(e) =>
                setFilter({ ...filter, query: e.target.value })
              }
              data-testid="filter-search-input"
              aria-label="Buscar nas notificações"
            />
          </div>
        </div>
      </section>

      {/* CATEGORY GROUPS --------------------------------------------------- */}
      <section
        className="space-y-4"
        aria-label="Tipos por categoria"
        data-testid="notifications-prefs-list"
      >
        {renderCategoryGroups({
          rows: filteredRows,
          expandedCats,
          onToggleExpand: (cat) =>
            setExpandedCats({ ...expandedCats, [cat]: !expandedCats[cat] }),
          onToggleChannel: (type, channel) => toggle(type, channel),
          onToggleWeeklyDigest: (type) => toggleWeeklyDigest(type),
        })}
      </section>

      {/* Bulk helpers ---------------------------------------------------- */}
      <section
        className="rounded-lg border border-border bg-card/40 p-4 space-y-3"
        aria-label="Ações em massa"
        data-testid="bulk-actions-section"
      >
        <h3 className="text-sm font-semibold text-foreground/90">
          Ações em massa
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px] px-4"
            onClick={() => {
              const all: Partial<ResolvedPreferences> = {};
              for (const type of Object.keys(prefs) as NotificationType[]) {
                all[type] = Object.freeze({
                  inApp: true,
                  email: false,
                  push: false,
                  weeklyDigest: false,
                });
              }
              bulkSet(all);
            }}
            data-testid="bulk-in-app-only"
            aria-label="Manter somente notificações no app"
          >
            <Bell className="w-4 h-4 mr-2" aria-hidden="true" /> Só no app
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px] px-4"
            onClick={() => {
              const all: Partial<ResolvedPreferences> = {};
              for (const type of Object.keys(prefs) as NotificationType[]) {
                all[type] = Object.freeze({
                  inApp: false,
                  email: true,
                  push: false,
                  weeklyDigest: false,
                });
              }
              bulkSet(all);
            }}
            data-testid="bulk-email-only"
            aria-label="Receber somente por e-mail"
          >
            <Mail className="w-4 h-4 mr-2" aria-hidden="true" /> Só e-mail
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px] px-4"
            onClick={() => {
              const all: Partial<ResolvedPreferences> = {};
              for (const type of Object.keys(prefs) as NotificationType[]) {
                all[type] = Object.freeze({
                  inApp: true,
                  email: true,
                  push: false,
                  weeklyDigest: false,
                });
              }
              bulkSet(all);
            }}
            data-testid="bulk-in-app-and-email"
            aria-label="Receber no app e por e-mail"
          >
            <Bell className="w-4 h-4 mr-2" aria-hidden="true" /> No app + e-mail
          </Button>
        </div>
      </section>

      {/* FOOTER (LGPD gate + status) --------------------------------------- */}
      <footer
        className="sticky bottom-0 left-0 right-0 bg-background/90 backdrop-blur border-t border-border -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 space-y-3"
        data-testid="notifications-prefs-footer"
      >
        {lastError && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 flex items-start gap-2"
            data-testid="notifications-prefs-error"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5" aria-hidden="true" />
            <span>{lastError}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {status === 'saving' && (
              <span className="flex items-center gap-1" data-testid="status-saving">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                Salvando…
              </span>
            )}
            {status === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-400" data-testid="status-saved">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                Salvo
              </span>
            )}
            {status === 'idle' && dirty && (
              <span className="flex items-center gap-1" data-testid="status-dirty">
                <Info className="w-4 h-4" aria-hidden="true" />
                Mudanças pendentes
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              className="min-h-[44px] px-4"
              onClick={() => reset()}
              disabled={!dirty}
              data-testid="reset-button"
              aria-label="Restaurar preferências originais"
            >
              <RefreshCcw className="w-4 h-4 mr-2" aria-hidden="true" />
              Restaurar
            </Button>
            <Button
              type="submit"
              className="min-h-[44px] px-5"
              disabled={!canSubmit || status === 'saving'}
              data-testid="save-button"
              aria-label="Salvar preferências de notificação"
            >
              <Save className="w-4 h-4 mr-2" aria-hidden="true" />
              {status === 'saving' ? 'Salvando…' : 'Salvar preferências'}
            </Button>
          </div>
        </div>
        {redirectTo && (
          <p className="text-xs text-muted-foreground">
            Após salvar você será encaminhado(a) para {redirectTo}.
          </p>
        )}
      </footer>
    </form>
  );
}

// ============================================================================
// Subcomponentes
// ============================================================================

function SummaryBadge({
  icon,
  label,
  count,
  total,
  testId,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly count: number;
  readonly total: number;
  readonly testId: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-xs text-foreground/90"
      data-testid={testId}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground" aria-label="ativas">
        {count}/{total}
      </span>
    </span>
  );
}

function QuietHoursCard({
  quietHours,
  inQuietNow,
  onChange,
  testId,
}: {
  readonly quietHours: QuietHoursWindow;
  readonly inQuietNow: boolean;
  readonly onChange: (w: QuietHoursWindow) => void;
  readonly testId: string;
}) {
  const startId = useId();
  const endId = useId();

  return (
    <section
      className="rounded-lg border border-border bg-card/40 p-4 sm:p-5 space-y-3"
      data-testid={testId}
      aria-labelledby={`${testId}-title`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-2">
          {inQuietNow ? (
            <VolumeX className="w-5 h-5 text-violet-400 mt-0.5" aria-hidden="true" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-400 mt-0.5" aria-hidden="true" />
          )}
          <div>
            <h2
              id={`${testId}-title`}
              className="text-base font-semibold text-foreground"
            >
              Silenciar durante
            </h2>
            <p className="text-sm text-muted-foreground">
              Notificações não-críticas caem no próximo resumo. Alertas do sistema
              continuam chegando normalmente.
            </p>
          </div>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full border',
            inQuietNow
              ? 'border-violet-400/40 text-violet-200 bg-violet-500/10'
              : 'border-emerald-400/40 text-emerald-200 bg-emerald-500/10'
          )}
          aria-live="polite"
          data-testid="quiet-hours-status"
        >
          {inQuietNow ? 'Em silêncio agora' : 'Fora da janela'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={startId}
            className="block text-sm font-medium text-foreground/90"
          >
            Início
          </label>
          <Input
            id={startId}
            type="time"
            className="mt-1 min-h-[44px]"
            value={formatHHMM(quietHours.startMinutes)}
            onChange={(e) => {
              try {
                const start = parseHHMM(e.target.value);
                onChange(createQuietHours(start, quietHours.endMinutes, quietHours.tz));
              } catch {
                // silently ignore parse errors (UX).
              }
            }}
            data-testid="quiet-hours-start"
            aria-label="Início da janela de silêncio"
          />
        </div>
        <div>
          <label
            htmlFor={endId}
            className="block text-sm font-medium text-foreground/90"
          >
            Fim
          </label>
          <Input
            id={endId}
            type="time"
            className="mt-1 min-h-[44px]"
            value={formatHHMM(quietHours.endMinutes)}
            onChange={(e) => {
              try {
                const end = parseHHMM(e.target.value);
                onChange(createQuietHours(quietHours.startMinutes, end, quietHours.tz));
              } catch {
                // silently ignore parse errors (UX).
              }
            }}
            data-testid="quiet-hours-end"
            aria-label="Fim da janela de silêncio"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Moon className="w-3.5 h-3.5" aria-hidden="true" />
        <Sun className="w-3.5 h-3.5" aria-hidden="true" />
        Janela noturna típica: 22:00 às 08:00.
      </p>
    </section>
  );
}

function renderCategoryGroups({
  rows,
  expandedCats,
  onToggleExpand,
  onToggleChannel,
  onToggleWeeklyDigest,
}: {
  readonly rows: readonly {
    readonly type: NotificationType;
    readonly meta: typeof NOTIFICATION_TYPE_META[NotificationType];
    readonly preferences: { readonly inApp: boolean; readonly email: boolean; readonly push: boolean; readonly weeklyDigest: boolean };
  }[];
  readonly expandedCats: Record<PrefsCategory, boolean>;
  readonly onToggleExpand: (cat: PrefsCategory) => void;
  readonly onToggleChannel: (type: NotificationType, channel: NotificationChannel) => void;
  readonly onToggleWeeklyDigest: (type: NotificationType) => void;
}) {
  const grouped: Record<PrefsCategory, Array<typeof rows[number]>> = {
    social: [],
    comunidade: [],
    conteudo: [],
    sistema: [],
    meta: [],
  };
  for (const row of rows) grouped[row.meta.category].push(row);

  return (Object.keys(grouped) as PrefsCategory[]).map((cat) => (
    <div
      key={cat}
      className="rounded-lg border border-border bg-card/30 overflow-hidden"
      data-testid={`category-${cat}`}
    >
      <button
        type="button"
        onClick={() => onToggleExpand(cat)}
        className="w-full min-h-[44px] px-4 py-3 flex items-center justify-between text-left"
        aria-expanded={expandedCats[cat]}
        data-testid={`category-${cat}-toggle`}
      >
        <span className="font-semibold text-foreground capitalize">
          {categoryLabel(cat)}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {grouped[cat].length} tipos
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              !expandedCats[cat] && '-rotate-90'
            )}
            aria-hidden="true"
          />
        </span>
      </button>
      {expandedCats[cat] && (
        <div className="divide-y divide-border/60">
          {grouped[cat].map((row) => (
            <PrefsRowComponent
              key={row.type}
              row={row}
              onToggleChannel={onToggleChannel}
              onToggleWeeklyDigest={onToggleWeeklyDigest}
            />
          ))}
        </div>
      )}
    </div>
  ));
}

function categoryLabel(cat: PrefsCategory): string {
  switch (cat) {
    case 'social': return 'Convívio social';
    case 'comunidade': return 'Roda & comunidade';
    case 'conteudo': return 'Conteúdo & leitura';
    case 'sistema': return 'Sistema (essencial)';
    case 'meta': return 'Resumos & agregados';
    default: return cat;
  }
}

function PrefsRowComponent({
  row,
  onToggleChannel,
  onToggleWeeklyDigest,
}: {
  readonly row: {
    readonly type: NotificationType;
    readonly meta: typeof NOTIFICATION_TYPE_META[NotificationType];
    readonly preferences: { readonly inApp: boolean; readonly email: boolean; readonly push: boolean; readonly weeklyDigest: boolean };
  };
  readonly onToggleChannel: (type: NotificationType, channel: NotificationChannel) => void;
  readonly onToggleWeeklyDigest: (type: NotificationType) => void;
}) {
  const allOff = !hasAnyChannel(row.preferences);
  return (
    <div
      className="px-4 py-3 flex flex-col gap-3"
      data-testid={`row-${row.type}`}
      aria-label={row.meta.label}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-foreground">{row.meta.label}</p>
          <p className="text-xs text-muted-foreground">{row.meta.description}</p>
        </div>
        {allOff && (
          <span
            className="text-xs px-2 py-0.5 rounded-full border border-amber-400/40 text-amber-200 bg-amber-500/10"
            data-testid={`row-${row.type}-muted`}
          >
            Silenciado
          </span>
        )}
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={`Canais para ${row.meta.label}`}
        data-testid={`row-${row.type}-channels`}
      >
        {CHANNEL_ORDER.map((channel) => (
          <ChannelToggle
            key={channel}
            label={CHANNEL_LABEL[channel]}
            icon={CHANNEL_ICON[channel]}
            active={isActive(row.preferences, channel)}
            onClick={() => onToggleChannel(row.type, channel)}
            testId={`toggle-${row.type}-${channel}`}
            ariaLabel={`${row.meta.label}: ${CHANNEL_LABEL[channel]}`}
          />
        ))}
        <ChannelToggle
          label="Resumo semanal"
          icon="📰"
          active={row.preferences.weeklyDigest}
          onClick={() => onToggleWeeklyDigest(row.type)}
          testId={`toggle-${row.type}-WEEKLY_DIGEST`}
          ariaLabel={`${row.meta.label}: resumo semanal`}
        />
      </div>
    </div>
  );
}

function isActive(
  row: { inApp: boolean; email: boolean; push: boolean; weeklyDigest: boolean },
  channel: NotificationChannel
): boolean {
  if (channel === 'IN_APP') return row.inApp;
  if (channel === 'EMAIL') return row.email;
  if (channel === 'PUSH') return row.push;
  return false;
}

function ChannelToggle({
  label,
  icon,
  active,
  onClick,
  testId,
  ariaLabel,
}: {
  readonly label: string;
  readonly icon: string;
  readonly active: boolean;
  readonly onClick: () => void;
  readonly testId: string;
  readonly ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={ariaLabel}
      data-testid={testId}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 min-h-[44px] min-w-[88px] px-3 py-2 rounded-md border text-sm transition-colors',
        active
          ? 'border-violet-400/60 bg-violet-500/15 text-violet-100'
          : 'border-border bg-background/40 text-muted-foreground hover:bg-background/70'
      )}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

// ============================================================================
// Default export (Next.js convention)
// ============================================================================

export default NotificationsPrefsForm;

// ============================================================================
// Re-export types que a página pode precisar
// ============================================================================

export type {
  NotificationChannel,
  NotificationType,
  NotificationTradicao,
  PageFilter,
  PrefsCategory,
  ResolvedPreferences,
  QuietHoursWindow,
} from '@/lib/w91s/notifications-prefs-engine';

// Bridge com tipos do Prisma pra evitar erro de lint quando o consumidor
// já importa do @prisma/client via @/lib/notifications.
export type { PrismaNotificationType };
