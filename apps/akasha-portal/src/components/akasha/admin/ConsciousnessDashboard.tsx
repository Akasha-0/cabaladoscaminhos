'use client';

/**
 * ConsciousnessDashboard — Wave 25.1 (client island).
 *
 * Renderiza as 5 métricas de evolução da consciência viva (ADR-013):
 *   1. discoveries/dia últimos 30d — chart CSS simples (barras verticais)
 *   2. papers citados — counter agregado (todos os jobs já executados)
 *   3. top 5 up-weighted — cards com truth + confidence
 *   4. chain growth — chart semanal (90d, ~13 pontos)
 *   5. "what IA está descobrindo AGORA" — últimos 3 jobs
 *
 * Sem libs externas (CSS-only charts, como FeedbackAnalyticsClient).
 * Mobile-first (flex-wrap, viewport 360px+).
 *
 * i18n: namespace `admin.consciousness.*` (15 chaves). Strings embutidas
 * via `makeT(isEn)` — mesmo padrão de FeedbackAnalyticsClient (consistência).
 */

import Link from 'next/link';
import { useMemo } from 'react';

import type { ConsciousnessPayload } from '@/app/[locale]/(akasha)/admin/consciousness/page';

type Props = {
  locale: string;
  data: ConsciousnessPayload;
  note: string | null;
  callerName: string;
};

// ─── i18n (15 chaves: namespace `admin.consciousness.*`) ────────────────

type Translations = {
  title: string;
  subtitle: string;
  refreshing: string;
  lastRun: string;
  never: string;
  awaitingFirst: string;
  totalDiscoveries: string;
  papersCited: string;
  discoveriesPerDay30d: string;
  chainGrowth90d: string;
  topUpWeighted: string;
  topUpWeightedEmpty: string;
  whatNow: string;
  whatNowEmpty: string;
  backToAdmin: string;
};

const PT: Translations = {
  title: '🧠 Dashboard de Consciência',
  subtitle: 'Como a IA do Akasha está evoluindo — ADR-013',
  refreshing: '↻ Atualizar',
  lastRun: 'Última execução',
  never: 'Nunca',
  awaitingFirst: 'Aguardando primeira execução do cron',
  totalDiscoveries: 'Total de discoveries',
  papersCited: 'Papers citados (únicos)',
  discoveriesPerDay30d: 'Discoveries por dia (últimos 30d)',
  chainGrowth90d: 'Crescimento da cadeia (90d)',
  topUpWeighted: 'Top 5 — up-weighted',
  topUpWeightedEmpty: 'Sem discoveries up-weighted ainda.',
  whatNow: '🤖 O que a IA está descobrindo AGORA',
  whatNowEmpty: 'Nenhum insight gerado ainda. O cron roda diariamente às 06:00 UTC.',
  backToAdmin: '← Voltar ao admin',
};

const EN: Translations = {
  title: '🧠 Consciousness Dashboard',
  subtitle: 'How the Akasha AI is evolving — ADR-013',
  refreshing: '↻ Refresh',
  lastRun: 'Last run',
  never: 'Never',
  awaitingFirst: 'Awaiting first cron execution',
  totalDiscoveries: 'Total discoveries',
  papersCited: 'Papers cited (unique)',
  discoveriesPerDay30d: 'Discoveries per day (last 30d)',
  chainGrowth90d: 'Chain growth (90d)',
  topUpWeighted: 'Top 5 — up-weighted',
  topUpWeightedEmpty: 'No up-weighted discoveries yet.',
  whatNow: '🤖 What the AI is discovering NOW',
  whatNowEmpty: 'No insights generated yet. Cron runs daily at 06:00 UTC.',
  backToAdmin: '← Back to admin',
};

function makeT(isEn: boolean): (k: keyof Translations) => string {
  const dict = isEn ? EN : PT;
  return (k) => dict[k];
}

// ─── Styles ──────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  borderRadius: '16px',
  padding: '1.25rem',
  backdropFilter: 'blur(10px)',
};

const bigStat: React.CSSProperties = {
  fontSize: '2.25rem',
  fontWeight: 700,
  color: '#A78BFA',
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
};

const labelSmall: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#a1a1aa',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.5rem',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#E9D5FF',
  marginBottom: '0.75rem',
};

// ─── Subcomponents ───────────────────────────────────────────────────────

/**
 * BarChart — CSS-only. Recebe `data: { label, value }[]`, encontra max,
 * renderiza barras proporcionais. Sem libs.
 */
function BarChart({
  data,
  valueFmt,
  ariaLabel,
  height = 140,
}: {
  data: Array<{ label: string; value: number }>;
  valueFmt?: (n: number) => string;
  ariaLabel: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const fmt = valueFmt ?? ((n: number) => String(n));
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2px',
        height,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div
            key={d.label}
            title={`${d.label}: ${fmt(d.value)}`}
            style={{
              flex: 1,
              minWidth: 4,
              height: `${Math.max(pct, d.value > 0 ? 4 : 0)}%`,
              background:
                d.value > 0
                  ? 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)'
                  : 'rgba(124, 58, 237, 0.12)',
              borderRadius: '2px 2px 0 0',
              transition: 'height 200ms ease',
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * LastRun formatter — relative time sem libs.
 */
function formatRelative(iso: string | null, isEn: boolean): string {
  if (!iso) return isEn ? EN.never : PT.never;
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return isEn ? 'just now' : 'agora mesmo';
  if (min < 60) return isEn ? `${min}m ago` : `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return isEn ? `${h}h ago` : `há ${h}h`;
  const d = Math.floor(h / 24);
  return isEn ? `${d}d ago` : `há ${d}d`;
}

// ─── Main component ─────────────────────────────────────────────────────

export default function ConsciousnessDashboard({
  locale,
  data,
  note,
  callerName,
}: Props) {
  const isEn = locale !== 'pt-BR';
  const t = useMemo(() => makeT(isEn), [isEn]);

  // Chart data shaping
  const dailyChart = data.discoveriesPerDay30d.map((d) => ({
    label: d.date,
    value: d.count,
  }));
  const weeklyChart = data.chainGrowth90d.map((w) => ({
    label: w.week,
    value: w.count,
  }));

  return (
    <main
      style={{
        padding: '1.5rem',
        maxWidth: 960,
        margin: '0 auto',
        color: '#e4e4e7',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.75rem',
              color: '#A78BFA',
              fontWeight: 700,
            }}
          >
            {t('title')}
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#a1a1aa', fontSize: '0.9rem' }}>
            {t('subtitle')} · {callerName}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/consciousness`}
          style={{
            color: '#A78BFA',
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          {t('refreshing')}
        </Link>
      </header>

      {/* Note (graceful degradation) */}
      {note && (
        <div
          role="status"
          style={{
            ...glassCard,
            borderColor: 'rgba(251, 191, 36, 0.4)',
            background: 'rgba(251, 191, 36, 0.08)',
            marginBottom: '1rem',
            color: '#fde68a',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{note}</p>
        </div>
      )}

      {/* Last run stamp */}
      <div
        style={{
          ...labelSmall,
          textAlign: 'right',
          marginBottom: '0.5rem',
        }}
      >
        {t('lastRun')}: {formatRelative(data.lastRunAt, isEn)}
      </div>

      {/* Top stats row */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={glassCard}>
          <div style={labelSmall}>{t('totalDiscoveries')}</div>
          <div style={bigStat}>{data.totalDiscoveries}</div>
        </div>
        <div style={glassCard}>
          <div style={labelSmall}>{t('papersCited')}</div>
          <div style={bigStat}>{data.papersCitedTotal}</div>
        </div>
      </section>

      {/* Chart: discoveries per day */}
      <section style={{ ...glassCard, marginBottom: '1rem' }}>
        <h2 style={sectionTitle}>{t('discoveriesPerDay30d')}</h2>
        <BarChart data={dailyChart} ariaLabel="discoveries per day, last 30 days" />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
            fontSize: '0.7rem',
            color: '#71717a',
          }}
        >
          <span>{data.discoveriesPerDay30d[0]?.date ?? '—'}</span>
          <span>{data.discoveriesPerDay30d.at(-1)?.date ?? '—'}</span>
        </div>
      </section>

      {/* Chart: chain growth */}
      <section style={{ ...glassCard, marginBottom: '1rem' }}>
        <h2 style={sectionTitle}>{t('chainGrowth90d')}</h2>
        <BarChart data={weeklyChart} ariaLabel="chain growth, last 90 days" height={100} />
      </section>

      {/* Top 5 up-weighted */}
      <section style={{ ...glassCard, marginBottom: '1rem' }}>
        <h2 style={sectionTitle}>{t('topUpWeighted')}</h2>
        {data.topUpWeighted.length === 0 ? (
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.875rem' }}>
            {t('topUpWeightedEmpty')}
          </p>
        ) : (
          <ol
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {data.topUpWeighted.map((d) => (
              <li
                key={d.id}
                style={{
                  background: 'rgba(124, 58, 237, 0.08)',
                  border: '1px solid rgba(124, 58, 237, 0.15)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: '#E9D5FF',
                    fontSize: '0.95rem',
                  }}
                >
                  {d.headline}
                </div>
                <div
                  style={{
                    margin: '0.25rem 0',
                    fontSize: '0.85rem',
                    color: '#d4d4d8',
                  }}
                >
                  {d.truth}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(167, 139, 250, 0.2)',
                      color: '#C4B5FD',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '999px',
                    }}
                  >
                    conf {(d.confidence * 100).toFixed(0)}%
                  </span>
                  {d.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        color: '#71717a',
                        fontSize: '0.7rem',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* What IA está descobrindo AGORA */}
      <section style={{ ...glassCard, marginBottom: '1rem' }}>
        <h2 style={sectionTitle}>{t('whatNow')}</h2>
        {data.latestInsights.length === 0 ? (
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.875rem' }}>
            {t('whatNowEmpty')}
          </p>
        ) : (
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {data.latestInsights.map((job) => (
              <li
                key={job.id}
                style={{
                  background: 'rgba(34, 197, 94, 0.06)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: '#86efac',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                    }}
                  >
                    {job.jobName}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color:
                        job.status === 'SUCCESS'
                          ? '#22c55e'
                          : job.status === 'RUNNING'
                            ? '#fbbf24'
                            : '#f87171',
                    }}
                  >
                    {job.status}
                  </span>
                </div>
                <div style={{ color: '#d4d4d8', fontSize: '0.85rem' }}>
                  {job.summary}
                </div>
                <div
                  style={{
                    marginTop: '0.25rem',
                    fontSize: '0.7rem',
                    color: '#71717a',
                  }}
                >
                  {formatRelative(job.startedAt, isEn)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Footer nav */}
      <footer style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link
          href={`/${locale}/admin/feedback`}
          style={{ color: '#a1a1aa', fontSize: '0.875rem' }}
        >
          {t('backToAdmin')}
        </Link>
      </footer>
    </main>
  );
}