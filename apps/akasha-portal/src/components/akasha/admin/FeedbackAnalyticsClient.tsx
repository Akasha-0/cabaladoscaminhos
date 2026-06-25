'use client';

/**
 * FeedbackAnalyticsClient — Wave 18.3
 *
 * Renderiza os agregados retornados por `/api/admin/feedback/analytics`:
 *   - Cards (avg rating up/down, total)
 *   - Trend chart (CSS-only, sem libs)
 *   - Top 5 mensagens com down (com snippet truncado LGPD-safe)
 *   - Breakdown por Pilar (com progress bars CSS)
 *
 * Charts: barras horizontais CSS — sem libs externas, sem SVG inline
 * complicado. Acessível (role/aria-label).
 *
 * LGPD: snippet já vem truncado a 100 chars do servidor.
 */

import Link from 'next/link';
import { useMemo } from 'react';

type AnalyticsData = {
  avgRating: { up: number; down: number };
  totalFeedback: number;
  trendLast30Days: Array<{
    date: string;
    upCount: number;
    downCount: number;
    ratio: number;
  }>;
  topDownMessages: Array<{
    messageId: string;
    downCount: number;
    lastOccurredAt: string;
    snippet: string;
  }>;
  byPilar: Record<string, number>;
};

type Props = {
  locale: string;
  days: number;
  data: AnalyticsData | null;
  error: string | null;
  callerName: string;
};

const PILAR_LABELS_PT: Record<string, string> = {
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  numerologia: 'Numerologia',
  tantrica: 'Tântrica',
  odu: 'Odu',
  iching: 'I Ching',
  global: 'Global',
};
const PILAR_LABELS_EN: Record<string, string> = {
  cabala: 'Kabbalah',
  astrologia: 'Astrology',
  numerologia: 'Numerology',
  tantrica: 'Tantric',
  odu: 'Odu',
  iching: 'I Ching',
  global: 'Global',
};

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  borderRadius: '16px',
  padding: '1.25rem',
  backdropFilter: 'blur(10px)',
};

export default function FeedbackAnalyticsClient({
  locale,
  days,
  data,
  error,
  callerName,
}: Props) {
  const labels = locale === 'pt-BR' ? PILAR_LABELS_PT : PILAR_LABELS_EN;
  const isEn = locale !== 'pt-BR';

  const t = useMemo(() => makeT(isEn), [isEn]);

  if (error) {
    return (
      <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ color: '#A78BFA' }}>{t('title')}</h1>
        <div
          role="alert"
          style={{
            ...glassCard,
            borderColor: 'rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.08)',
            marginTop: '1rem',
          }}
        >
          <p style={{ margin: 0, color: '#fca5a5' }}>
            {t('error')}: <code>{error}</code>
          </p>
        </div>
        <p style={{ marginTop: '1rem' }}>
          <Link href={`/${locale}/admin/feedback`}>← {t('refresh')}</Link>
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ color: '#A78BFA' }}>{t('title')}</h1>
        <p style={{ color: '#a1a1aa' }}>{t('loading')}</p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: '1.5rem',
        maxWidth: 1080,
        margin: '0 auto',
        color: '#e4e4e7',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#A78BFA', margin: 0 }}>{t('title')}</h1>
        <p style={{ color: '#a1a1aa', margin: '0.25rem 0 0' }}>{t('subtitle')}</p>
        <p style={{ color: '#71717a', fontSize: '0.85rem', margin: '0.5rem 0 0' }}>
          {t('window', { days })} · {callerName}
        </p>
      </header>

      {/* ── Cards ─────────────────────────────────────────────── */}
      <section
        aria-label={t('cards.totalFeedback')}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <MetricCard
          label={t('cards.avgUp')}
          value={`${(data.avgRating.up * 100).toFixed(1)}%`}
          sub={`${t('cards.ratioLabel')}: ${data.avgRating.up.toFixed(3)}`}
          color="#22c55e"
        />
        <MetricCard
          label={t('cards.avgDown')}
          value={`${(data.avgRating.down * 100).toFixed(1)}%`}
          sub={`${t('cards.ratioLabel')}: ${data.avgRating.down.toFixed(3)}`}
          color="#ef4444"
        />
        <MetricCard
          label={t('cards.totalFeedback')}
          value={data.totalFeedback.toLocaleString(locale)}
          sub={`${t('window', { days })}`}
          color="#A78BFA"
        />
      </section>

      {/* ── Trend chart (CSS-only) ───────────────────────────── */}
      <section
        aria-label={t('trend.title')}
        style={{ ...glassCard, marginBottom: '1.5rem' }}
      >
        <h2 style={{ margin: '0 0 0.5rem', color: '#e4e4e7', fontSize: '1.05rem' }}>
          {t('trend.title')}
        </h2>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            fontSize: '0.85rem',
            color: '#a1a1aa',
            marginBottom: '0.75rem',
          }}
        >
          <span>
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                background: '#22c55e',
                marginRight: 4,
                verticalAlign: 'middle',
              }}
            />
            {t('trend.legendUp')}
          </span>
          <span>
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                background: '#ef4444',
                marginRight: 4,
                verticalAlign: 'middle',
              }}
            />
            {t('trend.legendDown')}
          </span>
        </div>
        <TrendBars trend={data.trendLast30Days} ariaLabel={t('axisDay')} />
      </section>

      {/* ── Top 5 down messages ──────────────────────────────── */}
      <section
        aria-label={t('topDown.title')}
        style={{ ...glassCard, marginBottom: '1.5rem' }}
      >
        <h2 style={{ margin: '0 0 0.75rem', color: '#e4e4e7', fontSize: '1.05rem' }}>
          {t('topDown.title')}
        </h2>
        {data.topDownMessages.length === 0 ? (
          <p style={{ color: '#a1a1aa', margin: 0 }}>{t('topDown.empty')}</p>
        ) : (
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.topDownMessages.map((m) => (
              <li
                key={m.messageId}
                style={{
                  borderTop: '1px solid rgba(124, 58, 237, 0.12)',
                  padding: '0.75rem 0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <code
                    style={{
                      color: '#fbbf24',
                      fontSize: '0.85rem',
                      wordBreak: 'break-all',
                    }}
                  >
                    {m.messageId}
                  </code>
                  <span style={{ color: '#fca5a5', fontSize: '0.9rem' }}>
                    {t('topDown.downCount', { count: m.downCount })}
                  </span>
                </div>
                <p
                  style={{
                    color: '#a1a1aa',
                    fontSize: '0.8rem',
                    margin: '0.25rem 0 0',
                  }}
                >
                  {t('topDown.lastOccurred', {
                    date: new Date(m.lastOccurredAt).toLocaleString(locale),
                  })}
                </p>
                {m.snippet ? (
                  <blockquote
                    style={{
                      margin: '0.5rem 0 0',
                      padding: '0.5rem 0.75rem',
                      borderLeft: '3px solid rgba(239, 68, 68, 0.4)',
                      background: 'rgba(239, 68, 68, 0.05)',
                      color: '#e4e4e7',
                      fontStyle: 'italic',
                      fontSize: '0.9rem',
                    }}
                    title={t('topDown.snippetLabel')}
                  >
                    {m.snippet}
                  </blockquote>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ── By Pilar ─────────────────────────────────────────── */}
      <section aria-label={t('byPilar.title')} style={{ ...glassCard }}>
        <h2 style={{ margin: '0 0 0.75rem', color: '#e4e4e7', fontSize: '1.05rem' }}>
          {t('byPilar.title')}
        </h2>
        <PilarBars byPilar={data.byPilar} labels={labels} />
      </section>

      <p style={{ marginTop: '1.5rem' }}>
        <Link href={`/${locale}/admin/feedback?days=${days}`}>↻ {t('refresh')}</Link>
      </p>
    </main>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div style={glassCard}>
      <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.85rem' }}>{label}</p>
      <p
        style={{
          margin: '0.25rem 0 0',
          fontSize: '1.75rem',
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </p>
      {sub ? (
        <p style={{ margin: '0.25rem 0 0', color: '#71717a', fontSize: '0.8rem' }}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}

function TrendBars({
  trend,
  ariaLabel,
}: {
  trend: AnalyticsData['trendLast30Days'];
  ariaLabel: string;
}) {
  if (trend.length === 0) {
    return (
      <p style={{ color: '#a1a1aa', margin: 0 }}>
        {ariaLabel}: (empty)
      </p>
    );
  }
  // Max value para normalizar altura
  const maxVal = Math.max(
    1,
    ...trend.map((d) => Math.max(d.upCount, d.downCount))
  );
  return (
    <div
      role="img"
      aria-label={`${ariaLabel}: stacked bars per day`}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 2,
        height: 120,
        overflowX: 'auto',
        paddingBottom: '0.25rem',
      }}
    >
      {trend.map((d) => {
        const upH = (d.upCount / maxVal) * 100;
        const downH = (d.downCount / maxVal) * 100;
        const titleParts = [
          d.date,
          `↑${d.upCount}`,
          `↓${d.downCount}`,
        ];
        return (
          <div
            key={d.date}
            title={titleParts.join(' · ')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minWidth: 12,
              flex: '0 0 auto',
              gap: 1,
            }}
          >
            <div
              style={{
                height: `${upH}%`,
                minHeight: d.upCount > 0 ? 2 : 0,
                background: '#22c55e',
                borderRadius: '2px 2px 0 0',
              }}
            />
            <div
              style={{
                height: `${downH}%`,
                minHeight: d.downCount > 0 ? 2 : 0,
                background: '#ef4444',
                borderRadius: '2px 2px 0 0',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function PilarBars({
  byPilar,
  labels,
}: {
  byPilar: Record<string, number>;
  labels: Record<string, string>;
}) {
  const entries = Object.entries(byPilar);
  if (entries.length === 0) {
    return <p style={{ color: '#a1a1aa', margin: 0 }}>(empty)</p>;
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {entries.map(([key, ratio]) => {
        const pct = (ratio * 100).toFixed(1);
        const barColor = ratio >= 0.7 ? '#22c55e' : ratio >= 0.4 ? '#fbbf24' : '#ef4444';
        return (
          <li
            key={key}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 60px',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.4rem 0',
            }}
          >
            <span style={{ color: '#e4e4e7' }}>{labels[key] ?? key}</span>
            <div
              role="progressbar"
              aria-valuenow={ratio}
              aria-valuemin={0}
              aria-valuemax={1}
              aria-label={`${labels[key] ?? key} ${pct}%`}
              style={{
                height: 12,
                background: 'rgba(124, 58, 237, 0.08)',
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(0, Math.min(100, parseFloat(pct)))}%`,
                  background: barColor,
                  transition: 'width 200ms ease-out',
                }}
              />
            </div>
            <span
              style={{
                color: '#a1a1aa',
                fontSize: '0.9rem',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {pct}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Tiny inline i18n (page-local) ──────────────────────────────────────────
//
// Não usamos `getTranslations` aqui porque este é um Client Component e
// `getTranslations` foi pensado para server-side. Mantemos um helper local
// para evitar arrastar toda a árvore de i18n para o bundle.

type Dict = Record<string, string>;

const PT: Dict = {
  title: 'Analytics de Feedback',
  subtitle: 'Agregados de FeedbackEntry (Wave 13.5) — sem PII',
  loading: 'Carregando analytics...',
  error: 'Não foi possível carregar os dados.',
  window: 'Janela: {days} dias',
  'cards.avgUp': 'Aprovação (👍)',
  'cards.avgDown': 'Rejeição (👎)',
  'cards.totalFeedback': 'Total de votos',
  'cards.ratioLabel': 'ratio',
  'trend.title': 'Tendência diária',
  'trend.legendUp': '👍 up',
  'trend.legendDown': '👎 down',
  'trend.axisDay': 'dia',
  'topDown.title': 'Top 5 mensagens com 👎',
  'topDown.downCount': '{count} votos',
  'topDown.lastOccurred': 'último em {date}',
  'topDown.empty': 'Nenhuma mensagem recebeu 👎 ainda.',
  'topDown.snippetLabel': 'comentário (truncado a 100 chars, sem PII)',
  'byPilar.title': 'Aprovação por Pilar',
  'byPilar.empty': 'Sem dados por Pilar.',
  refresh: 'Atualizar',
};

const EN: Dict = {
  title: 'Feedback Analytics',
  subtitle: 'Aggregates from FeedbackEntry (Wave 13.5) — no PII',
  loading: 'Loading analytics...',
  error: 'Could not load analytics.',
  window: 'Window: {days} days',
  'cards.avgUp': 'Approval (👍)',
  'cards.avgDown': 'Rejection (👎)',
  'cards.totalFeedback': 'Total votes',
  'cards.ratioLabel': 'ratio',
  'trend.title': 'Daily trend',
  'trend.legendUp': '👍 up',
  'trend.legendDown': '👎 down',
  'trend.axisDay': 'day',
  'topDown.title': 'Top 5 messages with 👎',
  'topDown.downCount': '{count} votes',
  'topDown.lastOccurred': 'last at {date}',
  'topDown.empty': 'No message has received 👎 yet.',
  'topDown.snippetLabel': 'comment (truncated to 100 chars, no PII)',
  'byPilar.title': 'Approval by Pilar',
  'byPilar.empty': 'No data per Pilar.',
  refresh: 'Refresh',
};

function makeT(isEn: boolean) {
  const dict = isEn ? EN : PT;
  return function t(key: string, params?: Record<string, string | number>): string {
    let s = dict[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return s;
  };
}