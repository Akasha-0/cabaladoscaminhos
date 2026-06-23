'use client';
/**
 * AkashaProfileSummary — Akasha profile header + synthesis paragraph
 * Extracted from AkashaLifeAreasDashboard main component render.
 */
import { Sparkles, RefreshCw } from 'lucide-react';
import { memo } from 'react';
import type { AkashaSynthesisUI } from '../hooks/useAkashaSynthesis';
import type { ProcedenciaEntry } from '@akasha/core';
import { FrequencyBadge } from '../dashboard-utils';

const TRADICAO_COLORS: Record<string, string> = {
  cabala: '#7C5CFF',
  astrologia: '#2DD4BF',
  iching: '#A0763A',
  odu: '#FB5781',
  tantra: '#F0B429',
};

export const AkashaProfileSummary = memo(function AkashaProfileSummary({
  synthesis,
  onRefetch,
}: {
  synthesis: AkashaSynthesisUI;
  onRefetch?: () => void;
}) {
  const { akashaProfile, synthesisParagraph } = synthesis;

  return (
    <div className="rounded-2xl border border-[#FF9500]/30 bg-gradient-to-br from-[#FF9500]/8 to-transparent p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#FF9500]" />
          <span className="text-sm font-semibold text-white">Perfil Akasha</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            Score: {akashaProfile.overallFrequencyScore}/100
          </span>
          <FrequencyBadge frequency={akashaProfile.dominantFrequency} />
          {onRefetch && (
            <button
              onClick={onRefetch}
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-white/80 leading-relaxed italic">
        &ldquo;{synthesisParagraph}&rdquo;
      </p>
      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs text-white/40">
          Estágio:{' '}
          <span className="text-white/60 capitalize">{akashaProfile.transformationStage}</span>
        </span>
        <span className="text-xs text-white/40">
          Sequência ativa:{' '}
          <span className="text-white/60 capitalize">{akashaProfile.activeSequence}</span>
        </span>
      </div>
      {/* Procedência top — fonte simbólica da síntese */}
      <AkashaProcedenciaTop procedenciaTop={synthesis.procedenciaTop} />
    </div>
  );
});

function AkashaProcedenciaTop({ procedenciaTop }: { procedenciaTop?: ProcedenciaEntry[] }) {
  if (!procedenciaTop || procedenciaTop.length === 0) return null;
  return (
    <details className="mt-3 rounded-lg border border-white/10 bg-white/4 p-2">
      <summary className="text-[10px] text-white/30 cursor-pointer select-none uppercase tracking-wider hover:text-white/50">
        Fundamento Akáshico
      </summary>
      <div className="flex flex-wrap gap-1 mt-2">
        {procedenciaTop.slice(0, 6).map((p, i) => {
          const color = TRADICAO_COLORS[p.tradicao] ?? '#888';
          return (
            <div
              key={i}
              className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]"
              style={{ borderColor: `${color}44`, color: `${color}bb` }}
            >
              <span>{p.simbolo}</span>
              <span style={{ color: `${color}88` }}>
                {'●'.repeat(Math.min(3, Math.ceil((p.intensidade ?? 5) / 3)))}
              </span>
            </div>
          );
        })}
      </div>
    </details>
  );
}
