'use client';
/**
 * PriorityAreasQuickView — Top-3 áreas de vida ordenadas por frequência + intensidade
 *
 * Extraído de AkashaLifeAreasDashboard.tsx (original: lines 621–687)
 */
import { Sparkles } from 'lucide-react';
import type { AreaNarrativeUI } from './hooks/useAkashaSynthesis';
import { AREA_CONFIG, FREQUENCY_CONFIG, FrequencyBadge, IntensityDots } from './AkashaLifeAreasDashboard';

type CycleModulationEntry = { alignmentScore: number; suggestedBoost: string; rationale: string };

const FREQUENCY_SORT: Record<string, number> = { siddhi: 3, gift: 2, shadow: 1 };

export function PriorityAreasQuickView({
  areas,
  modMap,
}: {
  areas: Record<string, AreaNarrativeUI>;
  modMap?: Record<string, CycleModulationEntry>;
}) {
  const sorted = Object.entries(areas)
    .filter(([, n]) => n != null)
    .sort(([, a], [, b]) => {
      const fa = FREQUENCY_SORT[a.frequency] ?? 1;
      const fb = FREQUENCY_SORT[b.frequency] ?? 1;
      if (fa !== fb) return fb - fa;
      return (b.intensity ?? 0) - (a.intensity ?? 0);
    })
    .slice(0, 3);

  if (sorted.length === 0) return null;

  return (
    <div className="bg-[#1C1C1E]/80 rounded-2xl border border-white/8 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Sparkles size={11} className="text-[#FFD60A]" />
        <span className="text-[10px] font-semibold text-[#FFD60A]/80 uppercase tracking-wider">
          Prioridades de Hoje
        </span>
        {Object.values(modMap ?? {}).some(m => m.suggestedBoost === 'increase') && (
          <span className="text-[8px] px-1 py-0.5 rounded bg-[#F0B429]/15 text-[#F0B429] border border-[#F0B429]/25 font-mono">
            Ciclo ativo
          </span>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
        {sorted.map(([areaKey, narrative]) => {
          const cfg = AREA_CONFIG[areaKey] ?? AREA_CONFIG.desafiosSombras;
          const freqCfg = FREQUENCY_CONFIG[narrative.frequency];
          const mod = modMap?.[areaKey];
          const isBoosted = mod?.suggestedBoost === 'increase';
          return (
            <div
              key={areaKey}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shrink-0"
              style={{
                backgroundColor: isBoosted ? '#F0B42918' : `${cfg.color}12`,
                borderColor: isBoosted ? '#F0B42950' : `${cfg.color}30`,
              }}
              title={mod?.rationale ?? narrative.frequency}
            >
              {isBoosted && <span className="text-[8px] text-[#F0B429]">↑</span>}
              <span style={{ color: cfg.color }}>{cfg.label}</span>
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: freqCfg.color }}
                title={narrative.frequency}
              />
              <IntensityDots intensity={narrative.intensity} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
