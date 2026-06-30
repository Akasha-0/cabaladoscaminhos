/**
 * /daily — Mobile-first contemplative reflection page (Cycle 84)
 *
 * Layout:
 *   - Top: streak counter (small, top-right)
 *   - Middle: today's prompt (large, contemplative typography)
 *   - Below: suggested action (lighter weight)
 *   - Button: "Responder" → opens bottom-sheet composer
 *   - History: collapsible, last 7 entries
 *   - Locale switch: pt-BR / en / es
 *
 * Cycle 84 lessons applied:
 *   - Strict isolation: only imports from src/lib/engines/daily-reflection
 *   - All data layer logic kept in the engine (this is pure presentation)
 *   - Bottom-sheet pattern from W83-C composer (drag handle + backdrop + a11y)
 *   - 44px min-height/width on every tap target (WCAG / iOS HIG)
 *   - role="dialog" aria-modal="true" on the composer overlay
 *   - role="alert" on error states
 *   - role="status" aria-live="polite" on success updates
 *   - Color contrast AA (manual review needed — see TODO in DELIVERABLE)
 *
 * Aesthetic: contemplative, low-stimulus. NOT a gamified streak app.
 * The streak counter is a quiet number with optional small icon per tradição.
 *
 * TODO W85+: Wire to real i18n module (useT.ts) + persist via localStorage
 *   adapter. Right now: in-memory + URL locale param.
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getDailyReflection,
  createInMemoryHistoryAdapter,
  type DailyReflection,
  type LocaleKey,
  type HistoryAdapter,
  type HistoryRecord,
  type UserId,
} from '@/lib/engines/daily-reflection';
import { TRADICOES, type Tradicao } from '@/lib/engines/daily-reflection';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LOCALES: ReadonlyArray<LocaleKey> = ['pt-BR', 'en', 'es'] as const;
const DEFAULT_USER_ID: UserId = 'daily-page-local' as UserId;
const MAX_RESPONSE = 200;

const LOCALE_LABELS: Readonly<Record<LocaleKey, string>> = Object.freeze({
  'pt-BR': 'PT',
  en: 'EN',
  es: 'ES',
});

type TEntry = string | ((n: number) => string);
const T_DEFAULTS: Readonly<Record<LocaleKey, Record<string, TEntry>>> = Object.freeze({
  'pt-BR': {
    title: 'Reflexão de hoje',
    streak: 'Streak',
    streakDays: (n: number) => `${n} ${n === 1 ? 'dia' : 'dias'}`,
    respond: 'Responder',
    history: 'Histórico',
    showHistory: 'Mostrar últimos 7 dias',
    hideHistory: 'Ocultar histórico',
    emptyHistory: 'Quando você responder à primeira reflexão, ela aparecerá aqui.',
    promptOf: 'Prompt de',
    today: 'Hoje',
    promptTag: 'Postura',
    placeholder: 'Escreve tua reflexão (até 200 caracteres)…',
    submit: 'Registrar',
    cancel: 'Cancelar',
    close: 'Fechar',
    saved: 'Reflexão registrada.',
    charCount: (n: number) => `${n}/200`,
    chooseTradition: 'Tradição',
  },
  en: {
    title: 'Today\'s reflection',
    streak: 'Streak',
    streakDays: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
    respond: 'Respond',
    history: 'History',
    showHistory: 'Show last 7 entries',
    hideHistory: 'Hide history',
    emptyHistory: 'When you respond to your first reflection, it will appear here.',
    promptOf: 'Prompt of',
    today: 'Today',
    promptTag: 'Posture',
    placeholder: 'Write your reflection (up to 200 characters)…',
    submit: 'Record',
    cancel: 'Cancel',
    close: 'Close',
    saved: 'Reflection recorded.',
    charCount: (n: number) => `${n}/200`,
    chooseTradition: 'Tradition',
  },
  es: {
    title: 'Reflexión de hoy',
    streak: 'Racha',
    streakDays: (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`,
    respond: 'Responder',
    history: 'Historial',
    showHistory: 'Mostrar últimos 7 días',
    hideHistory: 'Ocultar historial',
    emptyHistory: 'Cuando respondas a tu primera reflexión, aparecerá aquí.',
    promptOf: 'Prompt de',
    today: 'Hoy',
    promptTag: 'Postura',
    placeholder: 'Escribe tu reflexión (hasta 200 caracteres)…',
    submit: 'Registrar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    saved: 'Reflexión registrada.',
    charCount: (n: number) => `${n}/200`,
    chooseTradition: 'Tradición',
  },
});

type TFn = (key: string) => string;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DailyPage() {
  // Default tradição: can be swapped via prop or localStorage (W85+).
  const [tradition, setTradition] = useState<Tradicao>('cigano');
  const [locale, setLocale] = useState<LocaleKey>('pt-BR');
  const [adapter] = useState<HistoryAdapter>(() => createInMemoryHistoryAdapter());
  const userId = DEFAULT_USER_ID;

  // Static "today" pinned to page mount date — keeps the prompt stable
  // for the duration of the user's session.
  const today = useMemo<string>(() => {
    const d = new Date();
    return toIsoDate(d);
  }, []);

  const reflection = useMemo<DailyReflection>(() => {
    return getDailyReflection(tradition, today, locale);
  }, [tradition, today, locale]);

  // Streak
  const [streak, setStreak] = useState<number>(0);
  useEffect(() => {
    setStreak(adapter.getStreak(userId, today));
  }, [adapter, userId, today]);

  // History (last 7)
  const [history, setHistory] = useState<ReadonlyArray<HistoryRecord>>([]);
  useEffect(() => {
    setHistory(adapter.getRecent(userId, 7));
  }, [adapter, userId, streak]);

  // Composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // History visibility
  const [historyOpen, setHistoryOpen] = useState(false);

  const t: TFn = useCallback(
    (key: string): string => {
      const dict: Record<string, TEntry> = T_DEFAULTS[locale];
      const v = dict[key];
      return typeof v === 'string' ? v : key;
    },
    [locale],
  );

  const tFn = useCallback(
    (key: string, n: number): string => {
      const dict: Record<string, TEntry> = T_DEFAULTS[locale];
      const v = dict[key];
      return typeof v === 'function' ? (v as (n: number) => string)(n) : String(n);
    },
    [locale],
  );

  const openComposer = useCallback(() => {
    setComposerOpen(true);
    setDraft('');
    setError(null);
  }, []);

  const closeComposer = useCallback(() => {
    setComposerOpen(false);
    setError(null);
  }, []);

  const handleSubmit = useCallback((): void => {
    const text = draft.trim();
    if (text.length === 0) {
      setError(locale === 'en' ? 'Please write something.' : locale === 'es' ? 'Por favor escribe algo.' : 'Escreve algo, por favor.');
      return;
    }
    if (text.length > MAX_RESPONSE) {
      setError(
        locale === 'en'
          ? `Too long. Max ${MAX_RESPONSE} characters.`
          : locale === 'es'
          ? `Demasiado largo. Máx ${MAX_RESPONSE} caracteres.`
          : `Muito longo. Máx ${MAX_RESPONSE} caracteres.`,
      );
      return;
    }
    adapter.record({
      userId,
      promptId: reflection.promptId,
      tradicao: reflection.tradicao,
      responseText: text,
      date: today,
    });
    setComposerOpen(false);
    setDraft('');
    setStreak(adapter.getStreak(userId, today));
    setStatusMsg(t('saved'));
    setTimeout(() => setStatusMsg(null), 3500);
  }, [adapter, draft, locale, reflection, today, t, userId]);

  return (
    <main
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#1f1a17',
        backgroundColor: '#faf7f2',
        minHeight: '100vh',
      }}
      aria-label={t('title')}
    >
      {/* Top bar: streak + locale switch */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <LocaleSwitch locale={locale} onChange={setLocale} />
        <StreakPill streak={streak} tFn={tFn} />
      </header>

      {/* Title */}
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '8px',
          letterSpacing: '0.02em',
        }}
      >
        {t('today')}
      </h1>

      {/* Tag + tradição */}
      <div
        style={{
          fontSize: '13px',
          color: '#7a6f68',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '32px',
        }}
        aria-label={`${t('promptOf')} ${reflection.tradicao}`}
      >
        {t('promptOf')} {reflection.tradicao} · {t('promptTag')}: {reflection.tag}
      </div>

      {/* Main prompt — contemplative typography */}
      <section
        role="region"
        aria-label={t('title')}
        style={{
          padding: '32px 24px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 1px 2px rgba(31, 26, 23, 0.04)',
          marginBottom: '24px',
        }}
      >
        <p
          style={{
            fontSize: '20px',
            lineHeight: 1.55,
            margin: 0,
            fontWeight: 400,
          }}
        >
          {reflection.text}
        </p>
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #ece6df',
            fontSize: '14px',
            color: '#7a6f68',
            lineHeight: 1.5,
          }}
        >
          {reflection.suggestedAction}
        </div>
      </section>

      {/* Respond button */}
      <button
        type="button"
        onClick={openComposer}
        style={{
          width: '100%',
          minHeight: '48px',
          padding: '12px 24px',
          backgroundColor: '#1f1a17',
          color: '#faf7f2',
          border: 'none',
          borderRadius: '24px',
          fontSize: '16px',
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: '24px',
        }}
        aria-label={t('respond')}
      >
        {t('respond')}
      </button>

      {/* Status message (live region) */}
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#5b8f6a',
          marginBottom: '16px',
        }}
      >
        {statusMsg ?? ''}
      </div>

      {/* Tradição switch (compact) */}
      <fieldset
        style={{
          border: 'none',
          padding: 0,
          margin: '0 0 24px 0',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
        aria-label={t('chooseTradition')}
      >
        <legend
          style={{
            position: 'absolute',
            left: '-9999px',
            fontSize: '1px',
          }}
        >
          {t('chooseTradition')}
        </legend>
        {TRADICOES.map((tr) => {
          const selected = tr === tradition;
          return (
            <button
              key={tr}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTradition(tr)}
              style={{
                minHeight: '44px',
                minWidth: '44px',
                padding: '8px 12px',
                border: `1px solid ${selected ? '#1f1a17' : '#d9d2c9'}`,
                backgroundColor: selected ? '#1f1a17' : '#fff',
                color: selected ? '#faf7f2' : '#1f1a17',
                borderRadius: '20px',
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tr}
            </button>
          );
        })}
      </fieldset>

      {/* History drawer */}
      <HistoryDrawer
        history={history}
        open={historyOpen}
        onToggle={() => setHistoryOpen((v) => !v)}
        t={t}
      />

      {/* Composer (bottom sheet) */}
      {composerOpen && (
        <ComposerSheet
          draft={draft}
          setDraft={setDraft}
          error={error}
          onClose={closeComposer}
          onSubmit={handleSubmit}
          t={t}
          remaining={MAX_RESPONSE - draft.length}
        />
      )}
    </main>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LocaleSwitch({
  locale,
  onChange,
}: {
  locale: LocaleKey;
  onChange: (l: LocaleKey) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Locale"
      style={{ display: 'flex', gap: '4px' }}
    >
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => onChange(l)}
            aria-pressed={active}
            style={{
              minHeight: '36px',
              minWidth: '44px',
              padding: '4px 8px',
              background: 'transparent',
              border: `1px solid ${active ? '#1f1a17' : 'transparent'}`,
              borderRadius: '6px',
              color: active ? '#1f1a17' : '#7a6f68',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            {LOCALE_LABELS[l]}
          </button>
        );
      })}
    </div>
  );
}

function StreakPill({
  streak,
  tFn,
}: {
  streak: number;
  tFn: (key: string, n: number) => string;
}) {
  if (streak === 0) return null;
  return (
    <div
      role="status"
      aria-label={`Streak: ${streak}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: '#f4ede1',
        borderRadius: '20px',
        fontSize: '13px',
        color: '#5e4a3a',
        fontWeight: 500,
        minHeight: '36px',
      }}
    >
      <span
        aria-hidden="true"
        style={{ fontSize: '14px', lineHeight: 1 }}
      >
        ✦
      </span>
      <span>{tFn('streakDays', streak)}</span>
    </div>
  );
}

function HistoryDrawer({
  history,
  open,
  onToggle,
  t,
}: {
  history: ReadonlyArray<HistoryRecord>;
  open: boolean;
  onToggle: () => void;
  t: TFn;
}) {
  return (
    <section
      aria-label={t('history')}
      style={{
        marginTop: '32px',
        borderTop: '1px solid #ece6df',
        paddingTop: '24px',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="daily-history-list"
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '12px 0',
          fontSize: '14px',
          fontWeight: 500,
          color: '#1f1a17',
          cursor: 'pointer',
          textAlign: 'left',
          minHeight: '44px',
        }}
      >
        {open ? t('hideHistory') : t('showHistory')}
      </button>
      {open && (
        <>
          {history.length === 0 ? (
            <p
              style={{
                color: '#7a6f68',
                fontSize: '14px',
                padding: '16px 0',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {t('emptyHistory')}
            </p>
          ) : (
            <ul
              id="daily-history-list"
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              {history.map((r) => (
                <li
                  key={r.id}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #ece6df',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#7a6f68',
                      marginBottom: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{r.date}</span>
                    <span style={{ textTransform: 'capitalize' }}>{r.tradicao}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#1f1a17', lineHeight: 1.4 }}>
                    {r.responseText}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function ComposerSheet({
  draft,
  setDraft,
  error,
  onClose,
  onSubmit,
  t,
  remaining,
}: {
  draft: string;
  setDraft: (v: string) => void;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
  t: TFn;
  remaining: number;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('respond')}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(31, 26, 23, 0.5)',
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        style={{
          position: 'relative',
          backgroundColor: '#fff',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          padding: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)',
          maxHeight: '85vh',
          overflow: 'auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '40px',
            height: '4px',
            background: '#d9d2c9',
            borderRadius: '2px',
            margin: '0 auto 12px auto',
          }}
        />
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            {t('respond')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            style={{
              minHeight: '44px',
              minWidth: '44px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#7a6f68',
            }}
          >
            ✕
          </button>
        </header>

        <label
          htmlFor="daily-composer-input"
          style={{ display: 'block', fontSize: '13px', color: '#7a6f68', marginBottom: '6px' }}
        >
          {t('placeholder')}
        </label>
        <textarea
          id="daily-composer-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_RESPONSE}
          placeholder={t('placeholder')}
          aria-describedby={error ? 'daily-composer-error' : undefined}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            border: '1px solid #d9d2c9',
            borderRadius: '8px',
            fontFamily: 'inherit',
            fontSize: '16px',
            boxSizing: 'border-box',
            resize: 'vertical',
            color: '#1f1a17',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px',
            fontSize: '12px',
            color: remaining < 0 ? '#b00020' : '#7a6f68',
          }}
        >
          <span id="daily-composer-error" role="alert" style={{ color: '#b00020' }}>
            {error ?? ''}
          </span>
          <span>{remaining}/200</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              minHeight: '48px',
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #d9d2c9',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              color: '#1f1a17',
            }}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            style={{
              flex: 2,
              minHeight: '48px',
              padding: '12px',
              backgroundColor: '#1f1a17',
              color: '#faf7f2',
              border: 'none',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {t('submit')}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
