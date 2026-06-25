/**
 * /[locale]/(akasha)/conta/privacidade — Privacy Controls UI (Wave 19.3).
 *
 * Server Component: auth guard + fetch initial consents/history + render
 * the client-side toggle UI. Auth via cookie + JWT (mesmo padrão de
 * /conta/notifications).
 *
 * LGPD Art. 7º (consentimento livre, informado, inequívoco) + Art. 8º
 * (revogação a qualquer momento) + Art. 18 §VI (revogação granular) +
 * Art. 37 (registro das operações — audit trail imutável).
 *
 * Diferente de /conta/notifications (D-048), aqui cada decisão gera uma
 * NOVA row no audit trail (LGPD Art. 37). UI exibe o histórico de
 * decisões em ordem cronológica reversa.
 */

import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { getTranslations } from '@/lib/i18n';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacidade e Consentimento — Akasha Portal',
  description:
    'Gerencie seus consentimentos granulares (LGPD Art. 7 e Art. 8). Decisões registradas com audit trail completo.',
};

export const dynamic = 'force-dynamic';

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // ─── Auth (mesmo padrão de /conta e /conta/notifications) ─────────
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && (!token || !verifyAkashaToken(token, 'access'))) {
    redirect(`/${locale}/login`);
  }

  // ─── i18n ────────────────────────────────────────────────────────
  const t = getTranslations(locale);

  // ─── Fetch initial state ─────────────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const cookieHeader = token ? `__Host-akasha_session=${token}` : '';
  let initialConsents: Array<{ type: string; granted: boolean; decidedAt: string }> = [];
  let initialHistory: Array<{
    id: string;
    type: string;
    granted: boolean;
    decidedAt: string;
  }> = [];
  let fetchError: string | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/account/privacy`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) {
      fetchError = t('privacy.fetchError');
    } else {
      const data = await res.json();
      initialConsents = Array.isArray(data.consents) ? data.consents : [];
      initialHistory = Array.isArray(data.history) ? data.history : [];
    }
  } catch {
    fetchError = t('privacy.fetchError');
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
          {t('conta.title')} · {t('privacy.title')}
        </p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
          {t('privacy.title')}
        </h1>
        <p
          style={{
            fontSize: '0.95rem',
            color: 'rgba(226, 232, 240, 0.7)',
            lineHeight: 1.55,
            marginTop: '0.75rem',
          }}
        >
          {t('privacy.desc')}
        </p>
      </header>

      {/* LGPD Art. 7 + 8 (side-by-side, educational) */}
      <section
        style={{
          ...glassCard,
          padding: '1rem 1.25rem',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          color: 'rgba(226, 232, 240, 0.75)',
          lineHeight: 1.55,
        }}
      >
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong style={{ color: '#A78BFA' }}>LGPD Art. 7º:</strong>{' '}
          {t('privacy.lgpdArticle7')}
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: '#A78BFA' }}>LGPD Art. 8º:</strong>{' '}
          {t('privacy.lgpdArticle8')}
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

      <PrivacyClient
        initialConsents={initialConsents.map((c) => ({
          type: c.type,
          granted: Boolean(c.granted),
          decidedAt: c.decidedAt,
        }))}
        initialHistory={initialHistory.map((h) => ({
          id: h.id,
          type: h.type,
          granted: Boolean(h.granted),
          decidedAt: h.decidedAt,
        }))}
        labels={{
          MARKETING: t('privacy.consentTypes.MARKETING'),
          ANALYTICS: t('privacy.consentTypes.ANALYTICS'),
          AI_TRAINING: t('privacy.consentTypes.AI_TRAINING'),
          THIRD_PARTY_SHARING: t('privacy.consentTypes.THIRD_PARTY_SHARING'),
        }}
        descriptions={{
          MARKETING: t('privacy.consentDescriptions.MARKETING'),
          ANALYTICS: t('privacy.consentDescriptions.ANALYTICS'),
          AI_TRAINING: t('privacy.consentDescriptions.AI_TRAINING'),
          THIRD_PARTY_SHARING: t('privacy.consentDescriptions.THIRD_PARTY_SHARING'),
        }}
        historyLabel={t('privacy.history')}
        historyEmptyLabel={t('privacy.historyEmpty')}
        historyDecisionTemplate={t('privacy.historyDecision')}
        historyActionGrantLabel={t('privacy.historyAction.grant')}
        historyActionRevokeLabel={t('privacy.historyAction.revoke')}
        enabledLabel={t('privacy.enabledLabel')}
        disabledLabel={t('privacy.disabledLabel')}
        savedSuccessLabel={t('privacy.savedSuccess')}
        saveErrorLabel={t('privacy.saveError')}
        loadingStateLabel={t('privacy.loadingState')}
        loadingHistoryLabel={t('privacy.loadingHistory')}
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
          <strong style={{ color: '#A78BFA' }}>LGPD Art. 37:</strong>{' '}
          {t('privacy.lgpdNote')}
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