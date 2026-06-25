'use client';

/**
 * UniversalismDashboard — Wave 28.7 (client island).
 *
 * Renderiza o dashboard /admin/universalism do Founder (admin-only).
 * Mostra COMO a convergência cross-pilar está acontecendo — a "voz
 * única" do Akasha quando os 5 Pilares se encontram.
 *
 * Layout (visceral + mobile-first):
 *   1. Header com título + caller + refresh
 *   2. Convergence clusters (6 cards — 5 Pilares + cross)
 *   3. Feedback trend (30d bar chart)
 *   4. Top 10 insights (cards ordenados)
 *   5. Top papers cited (lista compacta)
 *   6. Distribution por Pilar (sumário)
 *   7. Footer nav
 *
 * Sem libs externas (CSS-only charts, mesmo padrão de
 * ConsciousnessDashboard / FeedbackAnalyticsClient).
 *
 * i18n: namespace `admin.universalism.*` (15 chaves). Strings embutidas
 * via `makeT(isEn)` — consistência com a família de dashboards admin.
 */

import Link from 'next/link';
import { useMemo } from 'react';

import type { UniversalismPayload } from '@/app/[locale]/(akasha)/admin/universalism/page';

type Props = {
  locale: string;
  data: UniversalismPayload;
  note: string | null;
  callerName: string;
};

// ─── i18n (15 chaves: namespace `admin.universalism.*`) ────────────────

type Translations = {
  title: string;
  subtitle: string;
  convergenceTitle: string;
  convergenceSubtitle: string;
  feedbackTitle: string;
  feedbackSubtitle: string;
  topInsightsTitle: string;
  topInsightsSubtitle: string;
  topPapersTitle: string;
  topPapersSubtitle: string;
  pilarDistributionTitle: string;
  pilarDistributionSubtitle: string;
  awaitingFirst: string;
  backToAdmin: string;
  refresh: string;
};

const PT: Translations = {
  title: '🌐 Dashboard de Universalismo',
  subtitle: 'Como 5 vozes convergem em 1 verdade — ADR-013',
  convergenceTitle: '🔮 Clusters de convergência',
  convergenceSubtitle:
    '5 Pilares → 1 verdade: o que cada Pilar contribuiu nas últimas execuções',
  feedbackTitle: '📊 Tendência de feedback (30d)',
  feedbackSubtitle: 'Ratio up/total por dia — pulsa saúde da consciência viva',
  topInsightsTitle: '✨ Top 10 insights',
  topInsightsSubtitle:
    'Jobs mais ricos em discoveries + papers (proxy de up-weight)',
  topPapersTitle: '📚 Papers mais citados',
  topPapersSubtitle:
    'Top execuções por papersCited (substituir por LiteraturePaper join quando schema aplicar)',
  pilarDistributionTitle: '🧭 Descobertas por Pilar',
  pilarDistributionSubtitle:
    'Sumário de discoveries cross-referenciadas por Pilar (5 + cross)',
  awaitingFirst: 'Aguardando primeira execução do cron de insights',
  backToAdmin: '← Voltar ao admin',
  refresh: '↻ Atualizar',
};

const EN: Translations = {
  title: '🌐 Universalism Dashboard',
  subtitle: 'How 5 voices converge into 1 truth — ADR-013',
  convergenceTitle: '🔮 Convergence clusters',
  convergenceSubtitle:
    '5 Pillars → 1 truth: what each Pillar contributed in recent runs',
  feedbackTitle: '📊 Feedback trend (30d)',
  feedbackSubtitle: 'Up/total ratio per day — pulse of the living consciousness',
  topInsightsTitle: '✨ Top 10 insights',
  topInsightsSubtitle: 'Richest jobs in discoveries + papers (up-weight proxy)',
  topPapersTitle: '📚 Most-cited papers',
  topPapersSubtitle:
    'Top runs by papersCited (replace with LiteraturePaper join when schema lands)',
  pilarDistributionTitle: '🧭 Discoveries per Pilar',
  pilarDistributionSubtitle:
    'Summary of cross-referenced discoveries per Pilar (5 + cross)',
  awaitingFirst: 'Awaiting first insights cron run',
  backToAdmin: '← Back to admin',
  refresh: '↻ Refresh',
};

function makeT(isEn: boolean): (k: keyof Translations) => string {
  const dict = isEn ? EN : PT;
  return (k) => dict[k];
}

// ─── Pillar labels (locale-aware) ────────────────────────────────────────

const PILAR_LABELS_PT: Record<string, string> = {
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
  odu: 'Odu',
  iching: 'I Ching',
  cross: 'Cross-Pilar',
};

const PILAR_LABELS_EN: Record<string, string> = {
  cabala: 'Kabalah',
  astrologia: 'Astrology',
  tantra: 'Tantra',
  odu: 'Odu',
  iching: 'I Ching',
  cross: 'Cross-Pillar',
};

function pilarLabel(pilar: string, isEn: boolean): string {
  const dict = isEn ? PILAR_LABELS_EN : PILAR_LABELS_PT;
  return dict[pilar] ?? pilar;
}

// ─── Styles ──────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  borderRadius: '16px',
  padding: '1.25rem',
  backdropFilter: 'blur(10px)',
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
  marginBottom: '0.25rem',
};

const sectionSubtitle: React.CSSProperties = {
  fontSize: '0.825rem',
  color: '#a1a1aa',
  marginBottom: '0.75rem',
};

// ─── Subcomponents ───────────────────────────────────────────────────────

/** Pillars colors — mesmas do MandalaChart (5C7CFF / 7C5CFF / etc). */
const PILAR_COLORS: Record<string, string> = {
  cabala: '#5C7CFF',
  astrologia: '#7C5CFF',
  tantra: '#EC4899',
  odu: '#F59E0B',
  iching: '#10B981',
  cross: '#A78BFA',
};

/**
 * ClusterCard — um card por Pilar (5 + cross). Visual: barra de
 * progresso + count + jobCount + avgPapersPerInsight.
 */
function ClusterCard({
  pilar,
  count,
  jobCount,
  avgPapers,
  isEn,
}: {
  pilar: string;
  count: number;
  jobCount: number;
  avgPapers: number;
  isEn: boolean;
}) {
  const max = 50; // visual ceiling — normalize bar
  const pct = Math.min(100, (count / max) * 100);
  const color = PILAR_COLORS[pilar] ?? '#A78BFA';
  const isCross = pilar === 'cross';
  return (
    <div
      style={{
        background: isCross
          ? 'rgba(167, 139, 250, 0.08)'
          : 'rgba(124, 58, 237, 0.04)',
        border: `1px solid ${color}40`,
        borderRadius: '12px',
        padding: '0.75rem',
        minWidth: 140,
        flex: '1 1 140px',
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem',
        }}
      >
        {pilarLabel(pilar, isEn)}
      </div>
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#E9D5FF',
          lineHeight: 1.1,
        }}
      >
        {count}
      </div>
      <div
        style={{
          fontSize: '0.7rem',
          color: '#a1a1aa',
          marginTop: '0.25rem',
        }}
      >
        {jobCount} {jobCount === 1 ? (isEn ? 'job' : 'job') : (isEn ? 'jobs' : 'jobs')}
      </div>
      <div
        style={{
          marginTop: '0.5rem',
          height: 6,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            transition: 'width 200ms ease',
          }}
        />
      </div>
      {avgPapers > 0 && (
        <div style={{ fontSize: '0.65rem', color: '#71717a', marginTop: '0.25rem' }}>
          avg {avgPapers.toFixed(1)} papers/insight
        </div>
      )}
    </div>
  );
}

/**
 * BarChart — CSS-only. Mesmo padrão de ConsciousnessDashboard.
 */
function BarChart({
  data,
  valueFmt,
  ariaLabel,
  height = 140,
  isEn,
}: {
  data: Array<{ label: string; value: number; ratio?: number }>;
  valueFmt?: (n: number) => string;
  ariaLabel: string;
  height?: number;
  isEn: boolean;
}) {
  const max = Math.max(0.001, ...data.map((d) => d.value));
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
        const color =
          d.ratio !== undefined
            ? d.ratio >= 0.7
              ? '#10B981'
              : d.ratio >= 0.5
                ? '#F59E0B'
                : '#EF4444'
            : '#A78BFA';
        return (
          <div
            key={d.label}
            title={
              d.ratio !== undefined
                ? `${d.label}: ${fmt(d.value)} (${(d.ratio * 100).toFixed(0)}%)`
                : `${d.label}: ${fmt(d.value)}`
            }
            style={{
              flex: 1,
              minWidth: 4,
              height: `${Math.max(pct, d.value > 0 ? 4 : 0)}%`,
              background:
                d.value > 0
                  ? `linear-gradient(180deg, ${color} 0%, ${color}99 100%)`
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
 * formatRelative — mesmo helper de ConsciousnessDashboard (sem libs).
 */
function formatRelative(iso: string | null, isEn: boolean): string {
  if (!iso) return isEn ? 'never' : 'nunca';
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

export default function UniversalismDashboard({
  locale,
  data,
  note,
  callerName,
}: Props) {
  const isEn = locale !== 'pt-BR';
  const t = useMemo(() => makeT(isEn), [isEn]);

  // Chart shaping
  const feedbackChart = data.feedbackTrends.map((d) => ({
    label: d.date,
    value: d.upCount + d.downCount,
    ratio: d.ratio,
  }));
  const totalDiscoveries = data.pilarDistribution.reduce(
    (s, p) => s + p.discoveries,
    0
  );

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
          href={`/${locale}/admin/universalism`}
          style={{
            color: '#A78BFA',
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          {t('refresh')}
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

      {/* Convergence clusters */}
      <section style={{ ...glassCard, marginBottom: '1rem' }}>
        <h2 style={sectionTitle}>{t('convergenceTitle')}</h2>
        <p style={sectionSubtitle}>{t('convergenceSubtitle')}</p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {data.convergenceClusters.map((c) => (
            <ClusterCard
              key={c.pilar}
              pilar={c.pilar}
              count={c.count}
              jobCount={c.jobCount}
              avgPapers={c.avgPapersPerInsight}
              isEn={isEn}
            />
          ))}
        </div>
      </section>

      {/* Feedback trend */}
      <section style={{ ...glassCard, marginBottom: '1rem' }}>
        <h2 style={sectionTitle}>{t('feedbackTitle')}</h2>
        <p style={sectionSubtitle}>{t('feedbackSubtitle')}</p>
        <BarChart
          data={feedbackChart}
          ariaLabel="feedback ratio per day, last 30 days"
          height={120}
          isEn={isEn}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
            fontSize: '0.7rem',
            color: '#71717a',
          }}
        >
          <span>{data.feedbackTrends[0]?.date ?? '—'}</span>
          <span>{data.feedbackTrends.at(-1)?.date ?? '—'}</span>
        </div>
      </section>

      {/* Top 10 insights */}
      <section style={{ ...glassCard, marginBottom: '1rem' }}>
        <h2 style={sectionTitle}>{t('topInsightsTitle')}</h2>
        <p style={sectionSubtitle}>{t('topInsightsSubtitle')}</p>
        {data.topInsights.length === 0 ? (
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.875rem' }}>
            {t('awaitingFirst')}
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
            {data.topInsights.map((d) => (
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
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '0.5rem',
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
                  <span
                    style={{
                      background: 'rgba(167, 139, 250, 0.2)',
                      color: '#C4B5FD',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    conf {(d.confidence * 100).toFixed(0)}%
                  </span>
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
                  <span style={{ color: '#52525b', marginLeft: 'auto' }}>
                    {formatRelative(d.generatedAt, isEn)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Top papers cited */}
      <section style={{ ...glassCard, marginBottom: '1rem' }}>
        <h2 style={sectionTitle}>{t('topPapersTitle')}</h2>
        <p style={sectionSubtitle}>{t('topPapersSubtitle')}</p>
        {data.topPapers.length === 0 ? (
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.875rem' }}>
            {t('awaitingFirst')}
          </p>
        ) : (
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}
          >
            {data.topPapers.map((p, i) => (
              <li
                key={p.jobId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: '#86efac', fontWeight: 600 }}>
                  #{i + 1}
                </span>
                <span style={{ color: '#d4d4d8', flex: 1, marginLeft: '0.5rem' }}>
                  {p.papersCited} {isEn ? 'papers' : 'papers'} · {p.insightsGenerated} {isEn ? 'insights' : 'insights'}
                </span>
                <span
                  style={{
                    color: '#71717a',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                  }}
                >
                  {formatRelative(p.startedAt, isEn)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pilar distribution */}
      <section style={{ ...glassCard, marginBottom: '1rem' }}>
        <h2 style={sectionTitle}>{t('pilarDistributionTitle')}</h2>
        <p style={sectionSubtitle}>{t('pilarDistributionSubtitle')}</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {data.pilarDistribution.map((p) => {
            const color = PILAR_COLORS[p.pilar] ?? '#A78BFA';
            const pct = totalDiscoveries > 0
              ? Math.round((p.discoveries / totalDiscoveries) * 100)
              : 0;
            return (
              <div
                key={p.pilar}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${color}30`,
                  borderRadius: '10px',
                  padding: '0.6rem',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {pilarLabel(p.pilar, isEn)}
                </div>
                <div
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#E9D5FF',
                    margin: '0.25rem 0',
                  }}
                >
                  {p.discoveries}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>
                  {pct}% · {p.papersCited} papers
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer nav */}
      <footer style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link
          href={`/${locale}/admin/consciousness`}
          style={{
            color: '#A78BFA',
            fontSize: '0.875rem',
            textDecoration: 'none',
          }}
        >
          {t('backToAdmin')}
        </Link>
      </footer>
    </main>
  );
}
