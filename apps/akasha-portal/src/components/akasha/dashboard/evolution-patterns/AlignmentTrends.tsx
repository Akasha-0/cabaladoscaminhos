'use client';

import type { CycleHistoryData } from '../hooks/useCyclePersistence';

type AreaKey =
  | 'vitalidadeEnergia'
  | 'conexoesAmor'
  | 'carreiraProsperidade'
  | 'oriCabecaQuizilas'
  | 'missaoDestino'
  | 'desafiosSombras';

const AREA_KEYS: AreaKey[] = [
  'vitalidadeEnergia',
  'conexoesAmor',
  'carreiraProsperidade',
  'oriCabecaQuizilas',
  'missaoDestino',
  'desafiosSombras',
];

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ scores, color }: { scores: number[]; color: string }) {
  if (scores.length < 2) return <span className="text-[10px] text-white/30">—</span>;
  const w = 80;
  const h = 28;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const pts = scores.map((v, i) => {
    const x = (i / (scores.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="inline-block" aria-hidden="true">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}

// ── Alignment sparklines ───────────────────────────────────────────────────────

export function AlignmentTrends({
  history,
  areaLabels,
  noDataLabel,
}: {
  history: CycleHistoryData;
  areaLabels: Record<string, string>;
  noDataLabel: string;
}) {
  const trends = AREA_KEYS.map((area) => {
    const entries = history.areaHistory
      .filter((e) => e.area === area)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);
    const scores = entries.map((e) => e.alignmentScore ?? 50);
    const latest = scores[scores.length - 1] ?? 50;
    const color = latest >= 70 ? '#2DD4BF' : latest >= 50 ? '#F0B429' : '#FB5781';
    return { area, scores, latest, color };
  }).filter((t) => t.scores.length > 0);

  if (trends.length === 0) {
    return <p className="text-[11px] text-white/40">{noDataLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {trends.map(({ area, scores, latest, color }) => (
        <div key={area} className="flex items-center gap-3">
          <span className="text-[10px] text-white/60 w-24 shrink-0 truncate">
            {areaLabels[area] ?? area}
          </span>
          <Sparkline scores={scores} color={color} />
          <span className="text-[10px] font-mono w-8 text-right shrink-0" style={{ color }}>
            {latest}
          </span>
        </div>
      ))}
    </div>
  );
}
