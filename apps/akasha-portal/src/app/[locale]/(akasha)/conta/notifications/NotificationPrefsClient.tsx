'use client';

/**
 * Client component for notification preferences toggles (D-048 / Wave 18.2).
 *
 * Renderiza 5 toggles (um por tipo: DIARIO/MENTOR/CONEXOES/CREDITS/SYSTEM).
 * Cada toggle faz PATCH otimista ao mudar — não precisa "Salvar" explícito
 * (UX mobile-first: feedback imediato).
 *
 * Estado local por toggle:
 *   - enabled (controlled)
 *   - saving (em voo)
 *   - savedAt (timestamp ISO da última persistência bem-sucedida)
 *   - error (se falhou → rollback optimistic)
 */

import { useState, useTransition } from 'react';

type NotificationType = 'DIARIO' | 'MENTOR' | 'CONEXOES' | 'CREDITS' | 'SYSTEM';

interface Pref {
  type: string;
  enabled: boolean;
}

interface Labels {
  diario: string;
  mentor: string;
  conexoes: string;
  credits: string;
  system: string;
}

interface Descriptions {
  diario: string;
  mentor: string;
  conexoes: string;
  credits: string;
  system: string;
}

interface Props {
  initialPreferences: Pref[];
  labels: Labels;
  descriptions: Descriptions;
  enabledLabel: string;
  disabledLabel: string;
  savedSuccess: string;
  saveError: string;
}

const TYPES: NotificationType[] = ['DIARIO', 'MENTOR', 'CONEXOES', 'CREDITS', 'SYSTEM'];

function labelFor(type: NotificationType, labels: Labels): string {
  switch (type) {
    case 'DIARIO':
      return labels.diario;
    case 'MENTOR':
      return labels.mentor;
    case 'CONEXOES':
      return labels.conexoes;
    case 'CREDITS':
      return labels.credits;
    case 'SYSTEM':
      return labels.system;
  }
}

function descriptionFor(type: NotificationType, descriptions: Descriptions): string {
  switch (type) {
    case 'DIARIO':
      return descriptions.diario;
    case 'MENTOR':
      return descriptions.mentor;
    case 'CONEXOES':
      return descriptions.conexoes;
    case 'CREDITS':
      return descriptions.credits;
    case 'SYSTEM':
      return descriptions.system;
  }
}

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
};

const defaultBools = (): Record<NotificationType, boolean> => ({
  DIARIO: true,
  MENTOR: true,
  CONEXOES: true,
  CREDITS: true,
  SYSTEM: true,
});

const defaultStrings = (): Record<NotificationType, string | null> => ({
  DIARIO: null,
  MENTOR: null,
  CONEXOES: null,
  CREDITS: null,
  SYSTEM: null,
});

export default function NotificationPrefsClient({
  initialPreferences,
  labels,
  descriptions,
  enabledLabel,
  disabledLabel,
  savedSuccess,
  saveError,
}: Props) {
  // Build initial state map. Tipos faltantes na resposta = default enabled.
  const [prefs, setPrefs] = useState<Record<NotificationType, boolean>>(() => {
    const base = defaultBools();
    for (const p of initialPreferences) {
      if (TYPES.includes(p.type as NotificationType)) {
        base[p.type as NotificationType] = Boolean(p.enabled);
      }
    }
    return base;
  });

  // per-toggle saving/error/success indicators
  const [saving, setSaving] = useState<Record<NotificationType, boolean>>(defaultBools);
  const [savedAt, setSavedAt] = useState<Record<NotificationType, string | null>>(defaultStrings);
  const [errors, setErrors] = useState<Record<NotificationType, string | null>>(defaultStrings);

  const [, startTransition] = useTransition();

  async function handleToggle(type: NotificationType, next: boolean) {
    // Optimistic update
    const prev = prefs[type];
    setPrefs((p) => ({ ...p, [type]: next }));
    setSaving((s) => ({ ...s, [type]: true }));
    setErrors((e) => ({ ...e, [type]: null }));
    setSavedAt((s) => ({ ...s, [type]: null }));

    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, enabled: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? saveError);
      }
      setSavedAt((s) => ({
        ...s,
        [type]: new Date().toISOString(),
      }));
    } catch (e) {
      // Rollback + show error
      startTransition(() => {
        setPrefs((p) => ({ ...p, [type]: prev }));
        setErrors((er) => ({
          ...er,
          [type]: e instanceof Error ? e.message : saveError,
        }));
      });
    } finally {
      setSaving((s) => ({ ...s, [type]: false }));
    }
  }

  return (
    <section
      aria-label="Notification type toggles"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      {TYPES.map((type) => {
        const enabled = prefs[type];
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
                {/* status line — aria-live polite para screen readers */}
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
                      ? '...'
                      : saved
                        ? `${savedSuccess} ✓`
                        : enabled
                          ? enabledLabel
                          : disabledLabel}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={enabled}
                aria-label={`${labelFor(type, labels)} (${enabled ? enabledLabel : disabledLabel})`}
                disabled={isSaving}
                onClick={() => handleToggle(type, !enabled)}
                style={{
                  flexShrink: 0,
                  width: '52px',
                  height: '30px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: isSaving ? 'wait' : 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.18s ease',
                  background: enabled
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
                    left: enabled ? '25px' : '3px',
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
  );
}
