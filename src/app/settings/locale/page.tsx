/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — /settings/locale PAGE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * The user-facing Language Settings page. Shows:
 *   1. Page header (translated via useT)
 *   2. LocaleSwitcher (segmented control + native <select>)
 *   3. Live preview — 3 cards (PT/EN/ES) side-by-side, each showing the
 *      SAME translated key in that locale so the user can compare.
 *
 * Mobile-first:
 *   - Stacked layout by default
 *   - Cards stack vertically on mobile, 3-column grid ≥720px
 *
 * Sacred-cultural sensitivity:
 *   - Each preview card includes a sacred.* key (e.g. sacred.caboclo) so the
 *     user can SEE that the term is preserved verbatim across all locales.
 *
 * Reusable: any settings page that wants a live multilingual preview.
 */

'use client';

import type { ReactElement } from 'react';

import {
  LocaleProvider,
  LocaleSwitcher,
  SUPPORTED_LOCALES,
  useT,
  translate,
  type Locale,
} from '@/i18n';

// ── Sub-component: PreviewCard ────────────────────────────────────────────

interface PreviewCardProps {
  locale: Locale;
  nativeName: string;
  flag: string;
}

function PreviewCard(props: PreviewCardProps): ReactElement {
  const { locale, nativeName, flag } = props;
  // Card text is bound to the CARD's locale (not the active page locale) so
  // the user can compare translations side-by-side. translate() is pure and
  // takes locale as the second arg.
  const cardLabel = translate('settings.locale.card.' + locale.split('-')[0], locale);
  const mesaReal = translate('content.mesaReal', locale);
  const mesaDesc = translate('content.mesaRealDescription', locale);
  const caboclo = translate('sacred.caboclo', locale);
  const candomble = translate('sacred.candomble', locale);
  const tarot = translate('sacred.tarot', locale);
  const cabala = translate('sacred.cabala', locale);
  const orixa = translate('sacred.orixa', locale);

  return (
    <article
      data-testid={`preview-card-${locale}`}
      aria-label={`Preview em ${nativeName}`}
      style={{
        padding: '1rem',
        border: '1px solid #e8e0d6',
        borderRadius: '0.75rem',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '1px solid #f1ebe2',
          paddingBottom: '0.5rem',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontWeight: 700,
            fontSize: '0.875rem',
            color: '#7a6f68',
          }}
        >
          {flag}
        </span>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#1f1a17' }}>
          {nativeName}
        </h3>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#1f1a17' }}>
          {cardLabel}
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#7a6f68' }}>
          <strong style={{ color: '#1f1a17' }}>{mesaReal}:</strong> {mesaDesc}
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#7a6f68' }}>
          <strong style={{ color: '#1f1a17' }}>{caboclo}:</strong> {orixa} ·{' '}
          {candomble} · {tarot} · {cabala}
        </p>
      </div>
    </article>
  );
}

// ── Main page body — uses useT() for chrome ───────────────────────────────

function LocalePageBody(): ReactElement {
  const t = useT();
  return (
    <main
      style={{
        padding: '1rem',
        maxWidth: '960px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        color: '#1f1a17',
      }}
    >
      {/* Header */}
      <header>
        <h1
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1f1a17',
          }}
        >
          {t('settings.locale.title')}
        </h1>
        <p style={{ margin: '0.25rem 0 0 0', color: '#7a6f68' }}>
          {t('settings.locale.subtitle')}
        </p>
      </header>

      {/* Switcher */}
      <section
        aria-labelledby="locale-switcher-heading"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <h2
          id="locale-switcher-heading"
          style={{ margin: 0, fontSize: '1rem', color: '#1f1a17' }}
        >
          {t('settings.locale.title')}
        </h2>
        <LocaleSwitcher />
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#7a6f68' }}>
          {t('settings.locale.persistNote')}
        </p>
      </section>

      {/* Preview */}
      <section
        aria-labelledby="locale-preview-heading"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <h2
          id="locale-preview-heading"
          style={{ margin: 0, fontSize: '1rem', color: '#1f1a17' }}
        >
          {t('settings.locale.preview')}
        </h2>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#7a6f68' }}>
          {t('settings.locale.fallbackNote')}
        </p>

        <div
          data-testid="preview-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          {SUPPORTED_LOCALES.map((l) => {
            const nativeName =
              l === 'pt-BR'
                ? 'Português (Brasil)'
                : l === 'en'
                  ? 'English'
                  : 'Español';
            const flag = l === 'pt-BR' ? 'BR' : l === 'en' ? 'US' : 'ES';
            return (
              <PreviewCard
                key={l}
                locale={l}
                nativeName={nativeName}
                flag={flag}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}

// ── Page wrapper — provides LocaleProvider ────────────────────────────────

export default function LocaleSettingsPage(): ReactElement {
  return (
    <LocaleProvider>
      <LocalePageBody />
    </LocaleProvider>
  );
}
