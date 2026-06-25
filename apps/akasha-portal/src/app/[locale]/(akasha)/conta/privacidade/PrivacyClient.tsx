'use client';

/**
 * Client component for Privacy Controls UI (Wave 19.3).
 *
 * Renderiza 4 toggles (um por tipo: MARKETING / ANALYTICS / AI_TRAINING /
 * THIRD_PARTY_SHARING). Cada toggle faz PATCH otimista ao mudar — não
 * precisa "Salvar" explícito (UX mobile-first: feedback imediato).
 *
 * Abaixo dos toggles: histórico cronológico reverso das últimas N decisões
 * (audit trail LGPD Art. 37). Cada toggle PATCHADO gera uma nova entrada
 * — múltiplas rows por tipo coexistem no histórico.
 *
 * Estado local por toggle:
 *   - granted (controlled)
 *   - saving (em voo)
 *   - savedAt (timestamp ISO da última persistência bem-sucedida)
 *   - error (se falhou → rollback optimistic)
 *
 * Diferente de NotificationPrefsClient (Wave 18.2): aqui exibimos
 * histórico cronológico porque é parte essencial do compliance LGPD
 * (Art. 37 — demonstrabilidade).
 */

import { useMemo, useState, useTransition } from 'react';

type PrivacyType = 'MARKETING' | 'ANALYTICS' | 'AI_TRAINING' | 'THIRD_PARTY_SHARING';

interface ConsentState {
  type: string;
  granted: boolean;
  decidedAt: string;
}

interface HistoryEntry {
  id: string;
  type: string;
  granted: boolean;
  decidedAt: string;
}

interface Labels {
  MARKETING: string;
  ANALYTICS: string;
  AI_TRAINING: string;
  THIRD_PARTY_SHARING: string;
}

interface Descriptions {
  MARKETING: string;
  ANALYTICS: string;
  AI_TRAINING: string;
  THIRD_PARTY_SHARING: string;
}

interface Props {
  initialConsents: ConsentState[];
  initialHistory: HistoryEntry[];
  labels: Labels;
  descriptions: Descriptions;
  historyLabel: string;
  historyEmptyLabel: string;
  /** Template como "{action} em {date}" — {action} e {date} interpolados. */
  historyDecisionTemplate: string;
  historyActionGrantLabel: string;
  historyActionRevokeLabel: string;
  enabledLabel: string;
  disabledLabel: string;
  savedSuccessLabel: string;
  saveErrorLabel: string;
  loadingStateLabel: string;
  loadingHistoryLabel: string;
}

const TYPES: PrivacyType[] = ['MARKETING', 'ANALYTICS', 'AI_TRAINING', 'THIRD_PARTY_SHARING'];

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
};

function labelFor(type: PrivacyType, labels: Labels): string {
  return labels[type];
}

function descriptionFor(type: PrivacyType, descriptions: Descriptions): string {
  return descriptions[type];
}

function formatDate(iso: string): string {
  // '1970-01-01T00:00:00.000Z' = epoch zero = "nunca decidido"
  if (iso === '1970-01-01T00:00:00.000Z') return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function PrivacyClient({
  initialConsents,
  initialHistory,
  labels,
  descriptions,
  historyLabel,
  historyEmptyLabel,
  historyDecisionTemplate,
  historyActionGrantLabel,
  historyActionRevokeLabel,
  enabledLabel,
  disabledLabel,
  savedSuccessLabel,
  saveErrorLabel,
  loadingStateLabel,
  loadingHistoryLabel,
}: Props) {
  // ─── State map per type ────────────────────────────────────────────
  const [state, setState] = useState<Record<PrivacyType, boolean>>(() => {
    const base = {
      MARKETING: false,
      ANALYTICS: true,
      AI_TRAINING: false,
      THIRD_PARTY_SHARING: false,
    } as Record<PrivacyType, boolean>;
    for (const c of initialConsents) {
      if (TYPES.includes(c.type as PrivacyType)) {
        base[c.type as PrivacyType] = Boolean(c.granted);
      }
    }
    return base;
  });

  const [saving, setSaving] = useState<Record<PrivacyType, boolean>>({
    MARKETING: false,
    ANALYTICS: false,
    AI_TRAINING: false,
    THIRD_PARTY_SHARING: false,
  });
  const [savedAt, setSavedAt] = useState<Record<PrivacyType, string | null>>({
    MARKETING: null,
    ANALYTICS: null,
    AI_TRAINING: null,
    THIRD_PARTY_SHARING: null,
  });
  const [errors, setErrors] = useState<Record<PrivacyType, string | null>>({
    MARKETING: null,
    ANALYTICS: null,
    AI_TRAINING: null,
    THIRD_PARTY_SHARING: null,
  });

  // ─── History (audit trail) ────────────────────────────────────────
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory);

  const [, startTransition] = useTransition();

  async function handleToggle(type: PrivacyType, next: boolean) {
    // Optimistic update
    const prev = state[type];
    setState((s) => ({ ...s, [type]: next }));
    setSaving((s) => ({ ...s, [type]: true }));
    setErrors((e) => ({ ...e, [type]: null }));
    setSavedAt((s) => ({ ...s, [type]: null }));

    try {
      const res = await fetch('/api/account/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, granted: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? saveErrorLabel);
      }
      const data = (await res.json()) as {
        consent: HistoryEntry;
        state: ConsentState[];
      };

      setSavedAt((s) => ({
        ...s,
        [type]: new Date().toISOString(),
      }));

      // APPEND nova entrada ao histórico (LGPD Art. 37 — audit trail)
      startTransition(() => {
        setHistory((h) => [data.consent, ...h]);
      });
    } catch (e) {
      // Rollback + show error
      startTransition(() => {
        setState((s) => ({ ...s, [type]: prev }));
        setErrors((er) => ({
          ...er,
          [type]: e instanceof Error ? e.message : saveErrorLabel,
        }));
      });
    } finally {
      setSaving((s) => ({ ...s, [type]: false }));
    }
  }

  // Stats para header do histórico (count + unique types)
  const historyStats = useMemo(() => {
    const types = new Set(history.map((h) => h.type));
    return { total: history.length, uniqueTypes: types.size };
  }, [history]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Toggles */}
      <section
        aria-label="Privacy toggles"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        {TYPES.map((type) => {
          const granted = state[type];
          const isSaving = saving[type];
          const err = errors[type];
          const saved = savedAt[type];
          return (
            <article key={type} style={glassCard} className="p-5">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: '#E2E8F0',
                      margin: '0 0 0.25rem',
                    }}
                  >
                    {labelFor(type, labels)}
                  </h2>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'rgba(226, 232, 240, 0.6)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {descriptionFor(type, descriptions)}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      margin: '0.5rem 0 0',
                      color: err
                        ? '#f87171'
                        : saved
                          ? '#34D399'
                          : 'rgba(226, 232, 240, 0.4)',
                    }}
                    aria-live="polite"
                  >
                    {err
                      ? err
                      : isSaving
                        ? loadingStateLabel
                        : saved
                          ? `${savedSuccessLabel} ✓`
                          : granted
                            ? enabledLabel
                            : disabledLabel}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={granted}
                  aria-label={`${labelFor(type, labels)} (${granted ? enabledLabel : disabledLabel})`}
                  disabled={isSaving}
                  onClick={() => handleToggle(type, !granted)}
                  style={{
                    flexShrink: 0,
                    width: '52px',
                    height: '30px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: isSaving ? 'wait' : 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.18s ease',
                    background: granted
                      ? 'rgba(124, 58, 237, 0.8)'
                      : 'rgba(226, 232, 240, 0.2)',
                    opacity: isSaving ? 0.6 : 1,
                    padding: 0,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: granted ? '25px' : '3px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.18s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
                    }}
                  />
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* History (audit trail — LGPD Art. 37) */}
      <section
        aria-label={historyLabel}
        style={{ ...glassCard, padding: '1.25rem', marginTop: '0.5rem' }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#E2E8F0',
              margin: 0,
            }}
          >
            {historyLabel}
          </h2>
          {history.length > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'rgba(167, 139, 250, 0.7)',
              }}
            >
              {historyStats.total} · {historyStats.uniqueTypes}/4 tipos
            </span>
          )}
        </header>

        {history.length === 0 ? (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'rgba(226, 232, 240, 0.5)',
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            {historyEmptyLabel}
          </p>
        ) : (
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {history.slice(0, 30).map((entry) => {
              const typeLabel = TYPES.includes(entry.type as PrivacyType)
                ? labels[entry.type as PrivacyType]
                : entry.type;
              const actionLabel = entry.granted
                ? historyActionGrantLabel
                : historyActionRevokeLabel;
              const decision = historyDecisionTemplate
                .replace('{action}', actionLabel)
                .replace('{date}', formatDate(entry.decidedAt));
              return (
                <li
                  key={entry.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(124, 58, 237, 0.03)',
                    border: '1px solid rgba(124, 58, 237, 0.08)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                >
                  <span
                    style={{
                      color: entry.granted ? '#34D399' : '#f87171',
                      fontWeight: 600,
                      minWidth: '120px',
                    }}
                  >
                    {typeLabel}
                  </span>
                  <span
                    style={{
                      color: 'rgba(226, 232, 240, 0.65)',
                      flex: 1,
                      paddingLeft: '0.75rem',
                    }}
                  >
                    {decision}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {history.length > 30 && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'rgba(226, 232, 240, 0.4)',
              margin: '0.75rem 0 0',
              textAlign: 'center',
            }}
          >
            + {history.length - 30} mais recentes ocultas (limite de exibição)
          </p>
        )}
      </section>

      {/* ARIA-live region para screen readers (carregamento inicial) */}
      <p
        aria-live="polite"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {loadingHistoryLabel}
      </p>
    </div>
  );
}