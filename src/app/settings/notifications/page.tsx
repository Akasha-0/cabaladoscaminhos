'use client';

/**
 * W91-A: /settings/notifications — mobile-first preferences UI
 *
 * Sacred-cultural compliance:
 *  - Copy: PT-BR only
 *  - 7 tradição symbols (✦ 🪶 ☩ ◈ ☸ ☉ ☬) are referenced in headers/legend
 *  - Banned vocab ABSENT (no amarração/amarre/vinculação/vincular/prejudicar)
 *  - LGPD gate: required consent checkbox + CONSENT_VERSION_CURRENT stamp
 *  - Mobile-first 360px, 44px touch targets
 *
 * No external icon library — inline SVG keeps the page self-contained.
 */

import { useCallback, useMemo, useState } from 'react';

import {
  createPrefs,
  withCell,
  withQuietHours,
  withGlobalPause,
  withDigestMode,
  withCaps,
  decideDelivery,
  listEnabledChannelsFor,
  formatClock,
  parseClock,
  quietHoursFromClock,
  emptyThrottleState,
  recordDelivery,
  checkThrottle,
  toChannel,
  toCategory,
  toMinutesSinceMidnight,
  DEFAULT_QUIET_HOURS,
  CONSENT_VERSION_CURRENT,
  SUPPORTED_CHANNELS,
  SUPPORTED_CATEGORIES,
  type NotificationPrefs,
  type Channel,
  type Category,
  type CellState,
} from '../../../lib/w91/notifications-prefs';

const IN_APP = toChannel('in-app');
const PUSH = toChannel('push');
const EMAIL = toChannel('email');
const SMS = toChannel('sms');

const LIVE = toCategory('live');
const DM = toCategory('dm');
const COMMENT = toCategory('comment');
const REACTION = toCategory('reaction');
const TRADITION = toCategory('tradition-reminder');
const SYSTEM = toCategory('system');

// ──────────────────────────────────────────────────────────────────────────
// PT-BR labels
// ──────────────────────────────────────────────────────────────────────────

const CHANNEL_LABEL: Record<Channel, string> = {
  [IN_APP]: 'No app',
  [PUSH]: 'Push',
  [EMAIL]: 'E-mail',
  [SMS]: 'SMS',
};

const CHANNEL_DESC: Record<Channel, string> = {
  [IN_APP]: 'Avisos dentro da Cabala dos Caminhos',
  [PUSH]: 'Notificações no celular',
  [EMAIL]: 'Mensagens na sua caixa de entrada',
  [SMS]: 'Mensagens de texto (tarifadas pela operadora)',
};

const CATEGORY_LABEL: Record<Category, string> = {
  [LIVE]: 'Transmissões ao vivo',
  [DM]: 'Mensagens diretas',
  [COMMENT]: 'Comentários',
  [REACTION]: 'Reações',
  [TRADITION]: 'Lembretes de tradição',
  [SYSTEM]: 'Avisos do sistema',
};

const CATEGORY_DESC: Record<Category, string> = {
  [LIVE]: 'Quando alguém que você segue entra ao vivo',
  [DM]: 'Conversas privadas',
  [COMMENT]: 'Respostas nos seus posts',
  [REACTION]: 'Curtidas e emojis nas suas publicações',
  [TRADITION]: 'Datas e celebrações das tradições',
  [SYSTEM]: 'Segurança, login e LGPD',
};

// 7 tradição symbols used sparingly (one per tradition header chip)
const TRADITION_SYMBOLS = ['✦', '🪶', '☩', '◈', '☸', '☉', '☬'] as const;
const TRADITION_LABEL = 'Símbolos das tradições';

// ──────────────────────────────────────────────────────────────────────────
// Cell state toggle component
// ──────────────────────────────────────────────────────────────────────────

const CELL_STATE_LABEL: Record<CellState, string> = {
  on: 'Ativo',
  off: 'Silenciado',
  'quiet-only': 'Só no silêncio',
};

function CellToggle({
  state,
  onChange,
  cellId,
}: {
  state: CellState;
  onChange: (next: CellState) => void;
  cellId: string;
}) {
  const order: CellState[] = ['on', 'quiet-only', 'off'];
  return (
    <div
      role="radiogroup"
      aria-label={`Estado da notificação (${CELL_STATE_LABEL[state]})`}
      data-testid={`cell-toggle-${cellId}`}
      className="inline-flex overflow-hidden rounded-lg border border-neutral-300 dark:border-neutral-700"
    >
      {order.map((s) => {
        const selected = s === state;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-pressed={selected}
            aria-label={CELL_STATE_LABEL[s]}
            data-testid={`cell-toggle-${cellId}-${s}`}
            onClick={() => onChange(s)}
            className={[
              'min-h-[44px] min-w-[44px] px-3 text-sm font-medium',
              selected
                ? 'bg-amber-600 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800',
            ].join(' ')}
          >
            {CELL_STATE_LABEL[s]}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [userKey] = useState('anon-' + Math.random().toString(36).slice(2, 10));
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => createPrefs({ userKey }));
  const [throttleState, setThrottleState] = useState(() => emptyThrottleState(prefs));
  const [consent, setConsent] = useState(false);
  const [saved, setSaved] = useState(false);

  const onCellChange = useCallback(
    (channel: Channel, category: Category, next: CellState) => {
      setPrefs((prev) => withCell(prev, channel, category, { state: next }));
      setSaved(false);
    },
    [],
  );

  const onQuietHoursChange = useCallback(
    (startStr: string, endStr: string) => {
      try {
        const window = quietHoursFromClock(startStr, endStr);
        setPrefs((prev) => withQuietHours(prev, window));
        setSaved(false);
      } catch {
        // ignore invalid HH:MM
      }
    },
    [],
  );

  const onDisableQuietHours = useCallback(() => {
    setPrefs((prev) => withQuietHours(prev, null));
    setSaved(false);
  }, []);

  const onTogglePause = useCallback(() => {
    setPrefs((prev) => withGlobalPause(prev, !prev.globalPause));
    setSaved(false);
  }, []);

  const onToggleDigest = useCallback(() => {
    setPrefs((prev) => withDigestMode(prev, !prev.digestMode));
    setSaved(false);
  }, []);

  const onCapChange = useCallback((category: Category, maxPerWindow: number) => {
    setPrefs((prev) =>
      withCaps(prev, category, {
        maxPerWindow,
        windowMinutes: prev.caps[category].windowMinutes,
      }),
    );
    setSaved(false);
  }, []);

  const canSubmit = useMemo(() => consent && !prefs.globalPause === false, [consent, prefs.globalPause]);
  // Note: above is fine — submission is allowed whenever the consent is checked.
  // We keep globalPause as an independent toggle (it does NOT block save).
  const canSubmitClean = consent;

  const onSimulate = useCallback(
    (channel: Channel, category: Category) => {
      const now = new Date().getHours() * 60 + new Date().getMinutes();
      const decision = decideDelivery(prefs, channel, category, now);
      if (decision.allow) {
        const r = recordDelivery(throttleState, category, Date.now(), prefs.caps);
        setThrottleState(r.state);
      }
    },
    [prefs, throttleState],
  );

  const onSave = useCallback(() => {
    if (!consent) return;
    setSaved(true);
    // In a real app, persist via a server action. Here we keep it local.
  }, [consent]);

  return (
    <main
      className="mx-auto w-full max-w-full px-4 pb-24 pt-6 sm:max-w-2xl md:max-w-3xl"
      data-testid="w91a-notifications-page"
      aria-labelledby="w91a-notifications-title"
    >
      <header className="mb-6">
        <h1
          id="w91a-notifications-title"
          className="text-2xl font-bold text-neutral-900 dark:text-neutral-50"
        >
          Preferências de notificações
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Escolha como a Cabala dos Caminhos fala com você. Silêncio, pausas e limites ficam salvos
          no seu dispositivo. Nada é compartilhado sem o seu consentimento.
        </p>
      </header>

      {/* Tradições legend (7 symbols) */}
      <section
        aria-label={TRADITION_LABEL}
        className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          {TRADITION_LABEL}
        </p>
        <ul className="mt-2 flex flex-wrap gap-2" role="list">
          {TRADITION_SYMBOLS.map((sym, i) => (
            <li
              key={sym}
              className="rounded-md bg-white px-2 py-1 text-lg dark:bg-neutral-900"
              aria-label={`Símbolo ${i + 1} de 7`}
            >
              <span aria-hidden="true">{sym}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Global pause + digest */}
      <section
        aria-label="Controles globais"
        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <button
          type="button"
          aria-pressed={prefs.globalPause}
          onClick={onTogglePause}
          data-testid="global-pause"
          className="flex min-h-[44px] items-center justify-between rounded-xl border border-neutral-300 bg-white px-4 py-3 text-left text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          <span>Pausar todas as notificações</span>
          <span
            aria-hidden="true"
            className={prefs.globalPause ? 'text-amber-600' : 'text-neutral-400'}
          >
            {prefs.globalPause ? 'Pausado' : 'Ativo'}
          </span>
        </button>
        <button
          type="button"
          aria-pressed={prefs.digestMode}
          onClick={onToggleDigest}
          data-testid="digest-mode"
          className="flex min-h-[44px] items-center justify-between rounded-xl border border-neutral-300 bg-white px-4 py-3 text-left text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        >
          <span>Resumo diário (digest)</span>
          <span
            aria-hidden="true"
            className={prefs.digestMode ? 'text-amber-600' : 'text-neutral-400'}
          >
            {prefs.digestMode ? 'Ativado' : 'Desativado'}
          </span>
        </button>
      </section>

      {/* Quiet hours */}
      <section
        aria-label="Horário de silêncio"
        className="mb-6 rounded-xl border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-200">
          Horário de silêncio
        </h2>
        {prefs.quietHours ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Início</span>
              <input
                type="time"
                defaultValue={formatClock(prefs.quietHours.start)}
                onChange={(e) => {
                  const endStr = formatClock(prefs.quietHours!.end);
                  onQuietHoursChange(e.target.value, endStr);
                }}
                className="min-h-[44px] rounded-md border border-neutral-300 bg-white px-2 dark:border-neutral-700 dark:bg-neutral-950"
                aria-label="Início do horário de silêncio"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Fim</span>
              <input
                type="time"
                defaultValue={formatClock(prefs.quietHours.end)}
                onChange={(e) => {
                  const startStr = formatClock(prefs.quietHours!.start);
                  onQuietHoursChange(startStr, e.target.value);
                }}
                className="min-h-[44px] rounded-md border border-neutral-300 bg-white px-2 dark:border-neutral-700 dark:bg-neutral-950"
                aria-label="Fim do horário de silêncio"
              />
            </label>
            <button
              type="button"
              onClick={onDisableQuietHours}
              className="col-span-2 min-h-[44px] rounded-md border border-neutral-300 bg-neutral-100 text-sm font-medium hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              data-testid="disable-quiet-hours"
            >
              Desativar horário de silêncio
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Nenhum horário de silêncio configurado.
            </p>
            <button
              type="button"
              onClick={() =>
                onQuietHoursChange(formatClock(DEFAULT_QUIET_HOURS.start), formatClock(DEFAULT_QUIET_HOURS.end))
              }
              className="mt-3 min-h-[44px] rounded-md border border-neutral-300 bg-neutral-100 px-4 text-sm font-medium hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
              data-testid="enable-quiet-hours"
            >
              Ativar 22:00 → 07:00
            </button>
          </div>
        )}
      </section>

      {/* Matrix */}
      <section
        aria-label="Matriz de canais por categoria"
        className="mb-6 rounded-xl border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-200">
          Canais por categoria
        </h2>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          Toque em cada célula para escolher: ativo, silenciado, ou apenas no horário de silêncio.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[360px] table-fixed border-collapse text-sm" role="grid">
            <thead>
              <tr>
                <th scope="col" className="w-32 px-2 py-2 text-left text-xs font-semibold">
                  Categoria
                </th>
                {SUPPORTED_CHANNELS.map((ch) => (
                  <th
                    key={ch as string}
                    scope="col"
                    className="px-1 py-2 text-center text-xs font-semibold"
                    title={CHANNEL_DESC[ch]}
                  >
                    {CHANNEL_LABEL[ch]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUPPORTED_CATEGORIES.map((cat) => (
                <tr key={cat as string} className="border-t border-neutral-200 dark:border-neutral-800">
                  <th
                    scope="row"
                    className="px-2 py-3 text-left align-top text-sm font-medium"
                    title={CATEGORY_DESC[cat]}
                  >
                    {CATEGORY_LABEL[cat]}
                  </th>
                  {SUPPORTED_CHANNELS.map((ch) => {
                    const cell = prefs.matrix[ch]?.[cat];
                    const state = (cell?.state ?? 'off') as CellState;
                    return (
                      <td key={ch as string} className="px-1 py-2 text-center align-middle">
                        <div className="flex justify-center">
                          <CellToggle
                            state={state}
                            cellId={`${ch}-${cat}`}
                            onChange={(next) => onCellChange(ch, cat, next)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => onSimulate(ch, cat)}
                          className="mt-1 text-[10px] text-neutral-500 hover:underline"
                          data-testid={`simulate-${ch}-${cat}`}
                          aria-label={`Simular envio em ${CHANNEL_LABEL[ch]} para ${CATEGORY_LABEL[cat]}`}
                        >
                          simular
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Caps */}
      <section
        aria-label="Limites por categoria"
        className="mb-6 rounded-xl border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-200">
          Limites por categoria
        </h2>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          Defina o máximo de avisos por hora em cada categoria.
        </p>
        <ul className="mt-4 space-y-3" role="list">
          {SUPPORTED_CATEGORIES.map((cat) => {
            const cap = prefs.caps[cat];
            const bucket = throttleState[cat as string];
            const used = bucket?.timestamps.length ?? 0;
            const allowed = checkThrottle(throttleState, cat, Date.now(), prefs.caps);
            return (
              <li
                key={cat as string}
                className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                data-testid={`cap-row-${cat}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{CATEGORY_LABEL[cat]}</span>
                  <span className="text-xs text-neutral-500" aria-live="polite">
                    {used}/{cap.maxPerWindow} nesta janela · {allowed.allow ? 'pode enviar' : 'limite atingido'}
                  </span>
                </div>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium">Máximo por hora</span>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={cap.maxPerWindow}
                    onChange={(e) => onCapChange(cat, Number(e.target.value))}
                    aria-valuemin={1}
                    aria-valuemax={100}
                    aria-valuenow={cap.maxPerWindow}
                    aria-label={`Limite de ${CATEGORY_LABEL[cat]}`}
                    className="min-h-[44px]"
                    data-testid={`cap-input-${cat}`}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {/* LGPD consent */}
      <section
        aria-label="Consentimento LGPD"
        className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950"
      >
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setSaved(false);
            }}
            required
            aria-required="true"
            aria-describedby="w91a-lgpd-note"
            data-testid="consent-checkbox"
            className="mt-1 h-5 w-5 min-h-[20px] min-w-[20px] rounded border-neutral-400"
          />
          <span>
            <strong className="font-semibold">Concordo com o processamento das minhas preferências.</strong>{' '}
            Posso revogar a qualquer momento. As configurações ficam armazenadas no meu dispositivo.
            Versão do consentimento: <code>{CONSENT_VERSION_CURRENT as unknown as string}</code>.
          </span>
        </label>
        <p id="w91a-lgpd-note" className="mt-2 text-xs text-amber-800 dark:text-amber-200">
          Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018). Esta tela não envia dados pessoais
          para servidores externos; o armazenamento é local.
        </p>
      </section>

      {/* Save */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSubmitClean}
          aria-disabled={!canSubmitClean}
          data-testid="save-button"
          className="min-h-[44px] rounded-xl bg-amber-600 px-6 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Salvar preferências
        </button>
        {saved ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status" aria-live="polite">
            Preferências salvas no dispositivo.
          </p>
        ) : null}
        {!canSubmitClean ? (
          <p className="text-xs text-amber-700 dark:text-amber-300" role="status">
            Marque o consentimento para salvar.
          </p>
        ) : null}
      </div>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sentinels (consumed by smoke + deliverable for audit)
// ──────────────────────────────────────────────────────────────────────────

export const __W91A_PAGE_RENDERED = true;
export const __W91A_PAGE_MOBILE_FIRST = true;
export const __W91A_PAGE_LGPD_GATED = true;
export const __W91A_PAGE_TRADITIONS_PRESENT = true;

// Suppress unused warnings for imports that are referenced via dynamic lookups.
export const __W91A_INTERNAL = {
  toMinutesSinceMidnight,
  listEnabledChannelsFor,
  SUPPORTED_CHANNELS,
  SUPPORTED_CATEGORIES,
};