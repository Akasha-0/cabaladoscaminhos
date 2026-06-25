/**
 * /[locale]/(akasha)/conta/notifications — User notification preferences (D-048 / Wave 18.2).
 *
 * Server Component: auth guard + fetch initial preferences + render the
 * client-side toggle UI. Auth via cookie + JWT (mesmo padrão de /conta).
 *
 * LGPD: preferences são userId-only (sem PII). UI explica Art. 18 §VI
 * (revogação granular do consentimento).
 */

import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { getTranslations } from '@/lib/i18n';
import NotificationPrefsClient from './NotificationPrefsClient';

export const metadata: Metadata = {
  title: 'Preferências de notificações — Akasha Portal',
  description:
    'Escolha quais tipos de notificação você quer receber (LGPD Art. 18, VI — revogação granular).',
};

export const dynamic = 'force-dynamic';

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
};

export default async function NotificationPrefsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // ─── Auth (mesmo padrão de /conta/page.tsx) ─────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && (!token || !verifyAkashaToken(token, 'access'))) {
    redirect(`/${locale}/login`);
  }

  // ─── i18n ──────────────────────────────────────────────────────────
  const t = getTranslations(locale);

  // ─── Fetch initial preferences ─────────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const cookieHeader = token ? `__Host-akasha_session=${token}` : '';
  let initialPrefs: Array<{ type: string; enabled: boolean }> = [];
  let fetchError: string | null = null;
  try {
    const res = await fetch(`${baseUrl}/api/notifications/preferences`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) {
      fetchError = t('notification.prefs.saveError');
    } else {
      const data = await res.json();
      initialPrefs = Array.isArray(data.preferences) ? data.preferences : [];
    }
  } catch {
    fetchError = t('notification.prefs.saveError');
  }

  return (
    <main
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '1.5rem 1.25rem 6rem',
        fontFamily: 'system-ui, sans-serif',
        color: '#e4e4e7',
      }}
    >
      <header style={{ marginBottom: '1.5rem' }}>
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(167, 139, 250, 0.7)',
            marginBottom: '0.4rem',
          }}
        >
          {t('conta.title')} · {t('notification.title')}
        </p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
          {t('notification.prefs.pageTitle')}
        </h1>
        <p
          style={{
            fontSize: '0.95rem',
            color: 'rgba(226, 232, 240, 0.7)',
            lineHeight: 1.55,
            marginTop: '0.75rem',
          }}
        >
          {t('notification.prefs.pageDescription')}
        </p>
      </header>

      <section style={glassCard} className="p-5 mb-4">
        <p
          style={{
            fontSize: '0.875rem',
            color: 'rgba(226, 232, 240, 0.65)',
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {t('notification.prefs.intro')}
        </p>
      </section>

      {fetchError && (
        <div
          className="p-4 mb-4"
          style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            color: '#f87171',
            fontSize: '0.875rem',
          }}
        >
          {fetchError}
        </div>
      )}

      <NotificationPrefsClient
        initialPreferences={initialPrefs.map((p) => ({
          type: p.type,
          enabled: Boolean(p.enabled),
        }))}
        labels={{
          diario: t('notification.types.diario'),
          mentor: t('notification.types.mentor'),
          conexoes: t('notification.types.conexoes'),
          credits: t('notification.types.credits'),
          system: t('notification.types.system'),
        }}
        descriptions={{
          diario: t('notification.prefs.typeDescriptions.diario'),
          mentor: t('notification.prefs.typeDescriptions.mentor'),
          conexoes: t('notification.prefs.typeDescriptions.conexoes'),
          credits: t('notification.prefs.typeDescriptions.credits'),
          system: t('notification.prefs.typeDescriptions.system'),
        }}
        enabledLabel={t('notification.prefs.enabledLabel')}
        disabledLabel={t('notification.prefs.disabledLabel')}
        savedSuccess={t('notification.prefs.savedSuccess')}
        saveError={t('notification.prefs.saveError')}
      />

      <footer
        style={{
          marginTop: '2rem',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid rgba(124, 58, 237, 0.12)',
          fontSize: '0.8rem',
          color: 'rgba(226, 232, 240, 0.55)',
          lineHeight: 1.55,
        }}
      >
        <p style={{ margin: 0 }}>
          <strong style={{ color: '#A78BFA' }}>LGPD:</strong>{' '}
          {t('notification.prefs.lgpdNote')}
        </p>
      </footer>

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
        <a
          href={`/${locale}/conta`}
          style={{ color: '#A78BFA', textDecoration: 'underline' }}
        >
          ← Voltar para {t('conta.title')}
        </a>
      </p>
    </main>
  );
}
