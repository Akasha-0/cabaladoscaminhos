'use client';

// ============================================================================
// PersonalAnalyticsClient — UI for /me/analytics (Wave 38)
// ============================================================================
// Renders: hero stats, engagement score, weekly trend chart, tradition
// breakdown, practice patterns (time-of-day / day-of-week heatmaps),
// export buttons (CSV / JSON).
//
// Mobile-first: grid responsivo, charts em SVG puro (sem deps).
// ============================================================================

import { useState } from 'react';
import type { EngagementScore } from '@/lib/analytics/engagement-score';

interface PersonalAnalytics {
  userId: string;
  periodDays: number;
  counts: {
    postsAuthored: number;
    commentsAuthored: number;
    reactionsReceived: number;
    akashaConversations: number;
    mentorshipSessions: number;
    marketplaceActivity: number;
    preferredTradition?: string;
    primaryPlatform?: 'mobile' | 'desktop';
  };
  engagement: EngagementScore;
  weeklyTrend: Array<{ week: string; posts: number; comments: number; reactions: number }>;
  traditionBreakdown: Array<{ tradition: string; percent: number; count: number }>;
  practicePatterns: {
    timeOfDay: Array<{ hour: number; count: number }>;
    dayOfWeek: Array<{ day: number; count: number }>;
  };
  streakDays: number;
  generatedAt: string;
}

const TIER_COLOR: Record<EngagementScore['tier'], string> = {
  LOW: 'bg-slate-700 text-slate-200',
  MID: 'bg-blue-700 text-blue-100',
  HIGH: 'bg-emerald-700 text-emerald-100',
  POWER: 'bg-amber-600 text-amber-50',
};

const TIER_LABEL: Record<EngagementScore['tier'], string> = {
  LOW: 'Iniciante',
  MID: 'Ativo',
  HIGH: 'Engajado',
  POWER: 'Power user',
};

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function PersonalAnalyticsClient({ data }: { data: PersonalAnalytics }) {
  const [exporting, setExporting] = useState(false);

  const totalActivity =
    data.counts.postsAuthored +
    data.counts.commentsAuthored +
    data.counts.akashaConversations +
    data.counts.mentorshipSessions +
    data.counts.marketplaceActivity;

  return (
    <div className="space-y-6">
      {/* SECTION 1 — Hero stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Posts" value={data.counts.postsAuthored} accent="text-cyan-300" />
        <Stat label="Comentários" value={data.counts.commentsAuthored} accent="text-blue-300" />
        <Stat label="Reações recebidas" value={data.counts.reactionsReceived} accent="text-pink-300" />
        <Stat label="Akasha chats" value={data.counts.akashaConversations} accent="text-purple-300" />
        <Stat label="Mentorias" value={data.counts.mentorshipSessions} accent="text-amber-300" />
        <Stat label="Marketplace" value={data.counts.marketplaceActivity} accent="text-emerald-300" />
      </section>

      {/* SECTION 2 — Engagement score */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Score de engajamento</h2>
            <p className="text-xs text-slate-400">
              Calculado por atividade ponderada (mentoria = 3×, marketplace = 2.5×, Akasha = 2×).
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${TIER_COLOR[data.engagement.tier]}`}>
            {TIER_LABEL[data.engagement.tier]}
          </span>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <ScoreGauge score={data.engagement.score} tier={data.engagement.tier} />
          <BreakdownBars breakdown={data.engagement.breakdown} />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Plataforma primária: <strong>{data.counts.primaryPlatform ?? '—'}</strong> · Tradição:{' '}
          <strong>{data.counts.preferredTradition ?? '—'}</strong>
        </p>
      </section>

      {/* SECTION 3 — Weekly trend */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-100">Tendência semanal (8 semanas)</h2>
          <p className="text-xs text-slate-400">Posts, comentários e reações por semana ISO.</p>
        </header>
        <WeeklyTrendChart data={data.weeklyTrend} />
      </section>

      {/* SECTION 4 — Tradição breakdown */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-100">Tradição breakdown</h2>
          <p className="text-xs text-slate-400">Distribuição do seu conteúdo por tradição.</p>
        </header>
        <TraditionBars data={data.traditionBreakdown} />
      </section>

      {/* SECTION 5 — Practice patterns */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <header className="mb-3">
            <h2 className="text-lg font-semibold text-slate-100">Horário de prática</h2>
            <p className="text-xs text-slate-400">Distribuição por hora do dia.</p>
          </header>
          <TimeOfDayHeatmap data={data.practicePatterns.timeOfDay} />
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <header className="mb-3">
            <h2 className="text-lg font-semibold text-slate-100">Dia da semana</h2>
            <p className="text-xs text-slate-400">Quando você mais pratica.</p>
          </header>
          <DayOfWeekBars data={data.practicePatterns.dayOfWeek} />
        </div>
      </section>

      {/* SECTION 6 — Streak */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Sequência de prática</h2>
            <p className="text-xs text-slate-400">Informal, sem badges ou conquistas. Apenas um termômetro.</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-amber-300">{data.streakDays}</p>
            <p className="text-xs text-slate-400">dias consecutivos</p>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Export */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-slate-100">Exportar meus dados</h2>
          <p className="text-xs text-slate-400">LGPD Art. 18: seus dados, seu controle.</p>
        </header>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={exporting}
            onClick={() => {
              setExporting(true);
              downloadFile('minhas-analytics.json', JSON.stringify(data, null, 2), 'application/json');
              setExporting(false);
            }}
            className="rounded bg-cyan-600 px-3 py-1.5 text-sm text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            Baixar JSON
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => {
              setExporting(true);
              downloadFile('minhas-analytics.csv', toCsv(data), 'text/csv;charset=utf-8');
              setExporting(false);
            }}
            className="rounded bg-slate-700 px-3 py-1.5 text-sm text-slate-100 hover:bg-slate-600 disabled:opacity-50"
          >
            Baixar CSV
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {totalActivity} atividades registradas no período de {data.periodDays} dias.
        </p>
      </section>

      <footer className="text-xs text-slate-500">
        Gerado em {new Date(data.generatedAt).toLocaleString('pt-BR')}. Cálculos executados em tempo real,
        sem cache de longo prazo.
      </footer>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function ScoreGauge({ score, tier }: { score: number; tier: EngagementScore['tier'] }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);
  const color =
    tier === 'POWER' ? '#fbbf24' :
    tier === 'HIGH' ? '#10b981' :
    tier === 'MID' ? '#3b82f6' : '#475569';
  return (
    <div className="flex items-center gap-4">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 70 70)"
          strokeLinecap="round"
        />
        <text x="70" y="76" textAnchor="middle" fill="#f1f5f9" fontSize="32" fontWeight="700">
          {score}
        </text>
      </svg>
      <div className="text-xs text-slate-400">
        <p>0 = inativo</p>
        <p>25 = ativo</p>
        <p>60 = engajado</p>
        <p>85+ = power user</p>
      </div>
    </div>
  );
}

function BreakdownBars({ breakdown }: { breakdown: EngagementScore['breakdown'] }) {
  const KEYS: Array<keyof EngagementScore['breakdown']> = [
    'mentorshipSessions',
    'marketplaceActivity',
    'akashaConversations',
    'postsAuthored',
    'commentsAuthored',
    'reactionsReceived',
  ];
  const LABELS: Record<keyof EngagementScore['breakdown'], string> = {
    mentorshipSessions: 'Mentorias',
    marketplaceActivity: 'Marketplace',
    akashaConversations: 'Akasha',
    postsAuthored: 'Posts',
    commentsAuthored: 'Comentários',
    reactionsReceived: 'Reações',
  };
  return (
    <div className="space-y-2">
      {KEYS.map((k) => (
        <div key={k} className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-24 text-slate-400">{LABELS[k]}</span>
          <div className="h-3 flex-1 rounded bg-slate-800">
            <div
              className="h-full rounded bg-cyan-500"
              style={{ width: `${breakdown[k]}%` }}
            />
          </div>
          <span className="w-10 text-right font-mono">{breakdown[k].toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}

function WeeklyTrendChart({ data }: { data: PersonalAnalytics['weeklyTrend'] }) {
  const maxVal = Math.max(...data.flatMap((d) => [d.posts, d.comments, d.reactions]), 1);
  const width = 600;
  const height = 160;
  const padding = 20;
  const colWidth = (width - padding * 2) / data.length;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Axis */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />
        {/* Bars */}
        {data.map((d, i) => {
          const x = padding + i * colWidth;
          const barW = (colWidth - 6) / 3;
          const totalH = ((d.posts + d.comments + d.reactions) / maxVal) * (height - padding * 2);
          const stackH = (d.posts / maxVal) * (height - padding * 2);
          const stackC = (d.comments / maxVal) * (height - padding * 2);
          const stackR = (d.reactions / maxVal) * (height - padding * 2);
          return (
            <g key={d.week}>
              <rect
                x={x}
                y={height - padding - stackR}
                width={barW}
                height={stackR}
                fill="#ec4899"
                opacity="0.7"
              />
              <rect
                x={x + barW + 1}
                y={height - padding - stackC}
                width={barW}
                height={stackC}
                fill="#3b82f6"
                opacity="0.7"
              />
              <rect
                x={x + (barW + 1) * 2}
                y={height - padding - stackH}
                width={barW}
                height={stackH}
                fill="#06b6d4"
                opacity="0.9"
              />
              <text
                x={x + colWidth / 2 - 3}
                y={height - 6}
                fontSize="8"
                fill="#64748b"
                textAnchor="middle"
              >
                {d.week.slice(5)}
              </text>
              <title>
                {d.week}: {d.posts}p / {d.comments}c / {d.reactions}r (total {d.posts + d.comments + d.reactions})
              </title>
              {/* @ts-ignore unused */}
              <desc>{totalH}</desc>
            </g>
          );
        })}
        {/* Legend */}
        <g transform={`translate(${padding}, 12)`}>
          <rect width="10" height="10" fill="#06b6d4" />
          <text x="14" y="9" fontSize="10" fill="#cbd5e1">Posts</text>
          <rect x="60" width="10" height="10" fill="#3b82f6" />
          <text x="74" y="9" fontSize="10" fill="#cbd5e1">Comentários</text>
          <rect x="150" width="10" height="10" fill="#ec4899" opacity="0.7" />
          <text x="164" y="9" fontSize="10" fill="#cbd5e1">Reações</text>
        </g>
      </svg>
    </div>
  );
}

function TraditionBars({ data }: { data: PersonalAnalytics['traditionBreakdown'] }) {
  return (
    <div className="space-y-2">
      {data.map((t) => (
        <div key={t.tradition} className="flex items-center gap-2 text-xs text-slate-300">
          <span className="w-32 text-slate-400">{t.tradition}</span>
          <div className="h-3 flex-1 rounded bg-slate-800">
            <div className="h-full rounded bg-emerald-500" style={{ width: `${t.percent}%` }} />
          </div>
          <span className="w-16 text-right font-mono">{t.percent}% · {t.count}</span>
        </div>
      ))}
    </div>
  );
}

function TimeOfDayHeatmap({ data }: { data: PersonalAnalytics['practicePatterns']['timeOfDay'] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="grid grid-cols-12 gap-1">
      {data.map((d) => {
        const intensity = d.count / max;
        return (
          <div
            key={d.hour}
            className="aspect-square rounded"
            style={{
              backgroundColor: `rgba(6, 182, 212, ${0.15 + intensity * 0.85})`,
            }}
            title={`${d.hour}h: ${d.count} atividades`}
          >
            <div className="flex h-full items-center justify-center text-[8px] font-bold text-slate-900 mix-blend-difference">
              {d.hour}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayOfWeekBars({ data }: { data: PersonalAnalytics['practicePatterns']['dayOfWeek'] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end justify-between gap-2">
      {data.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
          <div className="text-xs font-bold text-cyan-300">{d.count}</div>
          <div
            className="w-full rounded-t bg-gradient-to-t from-cyan-700 to-cyan-400"
            style={{ height: `${(d.count / max) * 100}px`, minHeight: '4px' }}
          />
          <div className="text-xs text-slate-400">{DAYS_PT[d.day]}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Export helpers
// ============================================================================

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCsv(data: PersonalAnalytics): string {
  const lines: string[] = [];
  lines.push('# Personal Analytics — Cabala dos Caminhos');
  lines.push(`# Gerado em: ${data.generatedAt}`);
  lines.push(`# Período: ${data.periodDays} dias`);
  lines.push('');
  lines.push('metric,value');
  lines.push(`postsAuthored,${data.counts.postsAuthored}`);
  lines.push(`commentsAuthored,${data.counts.commentsAuthored}`);
  lines.push(`reactionsReceived,${data.counts.reactionsReceived}`);
  lines.push(`akashaConversations,${data.counts.akashaConversations}`);
  lines.push(`mentorshipSessions,${data.counts.mentorshipSessions}`);
  lines.push(`marketplaceActivity,${data.counts.marketplaceActivity}`);
  lines.push(`engagementScore,${data.engagement.score}`);
  lines.push(`engagementTier,${data.engagement.tier}`);
  lines.push(`streakDays,${data.streakDays}`);
  lines.push('');
  lines.push('# Weekly trend');
  lines.push('week,posts,comments,reactions');
  for (const w of data.weeklyTrend) {
    lines.push(`${w.week},${w.posts},${w.comments},${w.reactions}`);
  }
  return lines.join('\n');
}