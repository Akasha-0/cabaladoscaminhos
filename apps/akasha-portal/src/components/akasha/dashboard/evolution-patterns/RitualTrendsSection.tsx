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

// ── Ritual History per Area ──────────────────────────────────────────────────

export function RitualTrendsSection({
  history,
  areaLabels,
  noDataLabel,
}: {
  history: CycleHistoryData;
  areaLabels: Record<string, string>;
  noDataLabel: string;
}) {
  const ritualByArea = AREA_KEYS.map((area) => {
    const entries = history.areaHistory
      .filter((e) => e.area === area && e.ritualTitle)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
    return { area, entries };
  }).filter((r) => r.entries.length > 0);

  if (ritualByArea.length === 0) {
    return <p className="text-[10px] text-white/30">{noDataLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {ritualByArea.map(({ area, entries }) => (
        <div key={area}>
          <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1.5">
            {areaLabels[area] ?? area}
          </p>
          <div className="space-y-1">
            {entries.map((entry, i) => {
              const color = entry.ritualColor ?? '#7C5CFF';
              const dateStr = new Date(entry.date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
              });
              return (
                <div key={entry.id} className="flex items-center gap-2 text-[10px]">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color, opacity: 1 - i * 0.25 }}
                  />
                  <span className="text-white/60 shrink-0">{dateStr}</span>
                  <span
                    className="truncate flex-1"
                    style={{ color }}
                    title={entry.ritualInstruction ?? undefined}
                  >
                    {entry.ritualTitle}
                  </span>
                  {entry.ritualElement && (
                    <span className="text-white/30 shrink-0">{entry.ritualElement}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
