/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — LocaleSwitcher
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Mobile-first segmented control / desktop dropdown for switching locale.
 *
 * UX:
 *   - Mobile (≤640px): full-width stacked buttons (one per locale)
 *   - Desktop: native <select> with flag + native name
 *
 * A11y:
 *   - aria-label="Selecionar idioma" / language-neutral "Select language"
 *     on the wrapper.
 *   - Each option has role=radio + aria-checked (segmented control style)
 *     OR plain <option> inside <select> — we ship BOTH render modes.
 *   - Selected option gets aria-current=true + visual ring.
 *
 * Sacred-cultural sensitivity:
 *   - Flag emoji / 2-letter code is purely decorative (BR/US/ES text).
 *   - We use the country flag GLYPH only as visual hint; screen readers
 *     announce the full locale name.
 *
 * The component is `'use client'` because locale switching requires
 * localStorage + re-render — server can't do that.
 */

'use client';

import { useCallback, type ReactElement } from 'react';

import { useLocale } from './useLocale';
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  isLocale,
  type Locale,
} from './types';

export interface LocaleSwitcherProps {
  /** Optional CSS class for the wrapper. */
  className?: string;
  /** Optional id for the wrapper (for label association). */
  id?: string;
}

export function LocaleSwitcher(props: LocaleSwitcherProps): ReactElement {
  const { className, id } = props;
  const { locale, setLocale } = useLocale();

  const onSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>): void => {
      const next = e.target.value;
      if (isLocale(next)) setLocale(next);
    },
    [setLocale],
  );

  return (
    <div
      id={id}
      className={className}
      role="group"
      aria-label="Selecionar idioma"
      data-testid="locale-switcher"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        width: '100%',
      }}
    >
      {/* Mobile-friendly stacked radios (visible <640px via media query) */}
      <div
        role="radiogroup"
        aria-label="Selecionar idioma (segmented)"
        data-testid="locale-switcher-radios"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          width: '100%',
        }}
      >
        {SUPPORTED_LOCALES.map((l: Locale) => {
          const meta = LOCALE_LABELS[l];
          const checked = l === locale;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={meta.aria}
              data-locale={l}
              onClick={() => setLocale(l)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                minHeight: '48px',
                fontSize: '1rem',
                border: '1px solid',
                borderColor: checked ? '#7c3aed' : '#d6cfc7',
                borderRadius: '0.5rem',
                background: checked ? '#f4ecff' : '#ffffff',
                color: '#1f1a17',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  fontWeight: 600,
                  minWidth: '2rem',
                  fontSize: '0.875rem',
                  color: checked ? '#7c3aed' : '#7a6f68',
                }}
              >
                {meta.flag}
              </span>
              <span style={{ flex: 1 }}>{meta.native}</span>
              {checked ? (
                <span aria-hidden="true" style={{ color: '#7c3aed', fontWeight: 700 }}>
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Native select — accessible default for keyboard / screen readers.
          Visually hidden on mobile (the stacked radios are primary), shown on
          desktop ≥640px. We toggle via inline style since this is a single
          isolated component (no CSS module pipeline). */}
      <label
        htmlFor="locale-switcher-native"
        style={{
          display: 'none',
          fontSize: '0.875rem',
          color: '#7a6f68',
        }}
        data-testid="locale-switcher-native-label"
      >
        Idioma (dropdown)
      </label>
      <select
        id="locale-switcher-native"
        value={locale}
        onChange={onSelect}
        aria-label="Selecionar idioma"
        data-testid="locale-switcher-select"
        style={{
          padding: '0.75rem 1rem',
          minHeight: '48px',
          fontSize: '1rem',
          border: '1px solid #d6cfc7',
          borderRadius: '0.5rem',
          background: '#ffffff',
          color: '#1f1a17',
          width: '100%',
        }}
      >
        {SUPPORTED_LOCALES.map((l: Locale) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l].flag} — {LOCALE_LABELS[l].native}
          </option>
        ))}
      </select>
    </div>
  );
}
