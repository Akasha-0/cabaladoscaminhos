'use client';

import { Sparkles } from 'lucide-react';
import type { DimensaoSintese } from '@/lib/grimoire/synthesis/synthesizer';

interface DashboardCompassProps {
  dimensoes: readonly DimensaoSintese[];
  dimFocoId: string | undefined;
  selectedDimension: DimensaoSintese | null;
  onSelectDimension: (dim: DimensaoSintese) => void;
}

export function DashboardCompass({
  dimensoes,
  dimFocoId,
  selectedDimension,
  onSelectDimension,
}: DashboardCompassProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-white/10" />
        <h3 className="text-xs text-white/30 uppercase tracking-widest font-mono">
          Sua Bússola Existencial ({dimensoes.length} Dimensões)
        </h3>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {dimensoes.map((dim) => {
          const isPriority = dim.dimensoesId === dimFocoId;
          return (
            <button
              aria-pressed={selectedDimension?.dimensoesId === dim.dimensoesId}
              key={dim.dimensoesId}
              onClick={() => onSelectDimension(dim)}
              className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border bg-[#0B0E1C]/45 hover:bg-white/5 hover:border-[#7C5CFF]/30 active:scale-95 transition-all text-center min-h-[92px] group relative ${
                isPriority
                  ? 'border-[#F0B429]/60 shadow-[0_0_12px_rgba(240,180,41,0.12)]'
                  : 'border-white/5'
              }`}
            >
              {isPriority && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-[#F0B429] text-[#06070F] shadow-[0_0_8px_rgba(240,180,41,0.4)]">
                  Foco
                </span>
              )}
              <span className="text-lg text-[#9D86FF] group-hover:scale-110 transition-transform duration-300">
                {dim.icone ? (
                  dim.icone
                ) : (
                  <Sparkles size={18} className="text-[#9D86FF]" />
                )}
              </span>
              <span className="text-[11px] font-bold text-white leading-tight">
                {dim.titulo.split(' & ')[0]}
              </span>
              {dim.descricao && (
                <span className="text-[10px] text-white/30 leading-tight px-1">
                  {dim.descricao.split('.')[0]}.
                </span>
              )}
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[10px] text-[#9D86FF] group-hover:bg-[#7C5CFF]/20 group-hover:border-[#7C5CFF]/40 transition-all">
                Explorar <span>→</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
