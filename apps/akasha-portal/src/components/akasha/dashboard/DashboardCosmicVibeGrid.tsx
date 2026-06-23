'use client';

/**
 * @akasha/portal — Dashboard Cosmic Vibe Grid
 * Extracted from Dashboard.tsx (lines 431–516)
 * Three selectable filter chips: Clima, Fase Lunar, Tema
 */
import { Cloud, Moon, Sun, CheckCircle } from 'lucide-react';

interface DashboardCosmicVibeGridProps {
  climate: string | undefined;
  moonPhase: string | undefined;
  overallTheme: string | undefined;
  activeFilterChip: string | null;
  onFilterChipChange: (chip: string | null) => void;
}

export function DashboardCosmicVibeGrid({
  climate,
  moonPhase,
  overallTheme,
  activeFilterChip,
  onFilterChipChange,
}: DashboardCosmicVibeGridProps) {
  return (
    <>
      <p className="text-[10px] text-[#A7AECF]/40 text-center tracking-wide">
        Toque para filtrar · cada bloco destaca sua dimensão abaixo
      </p>
      <div id="daily-vibe" className="grid grid-cols-3 gap-2.5">
        {/* Clima Chip */}
        <button
          onClick={() => onFilterChipChange(activeFilterChip === 'clima' ? null : 'clima')}
          className={`relative group rounded-2xl p-3 text-center transition-all duration-200 ${
            activeFilterChip === 'clima'
              ? 'bg-[#2DD4BF]/15 border border-[#2DD4BF]/50 shadow-[0_0_15px_rgba(45,212,191,0.15)]'
              : 'bg-[#0B0E1C]/60 border border-[#2DD4BF]/20 hover:border-[#2DD4BF]/40 hover:bg-[#2DD4BF]/5'
          }`}
        >
          <div className="flex justify-center mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center">
              <Cloud size={16} className="text-[#2DD4BF]" />
            </div>
          </div>
          <p className="text-[11px] text-[#2DD4BF] uppercase tracking-widest font-mono font-semibold">
            Clima
          </p>
          <p className="text-xs font-bold mt-1 text-white truncate">
            {climate ?? 'Estável'}
          </p>
          {activeFilterChip === 'clima' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2DD4BF] flex items-center justify-center">
              <CheckCircle size={10} className="text-[#06070F]" />
            </div>
          )}
        </button>

        {/* Lua Chip */}
        <button
          onClick={() => onFilterChipChange(activeFilterChip === 'lua' ? null : 'lua')}
          className={`relative group rounded-2xl p-3 text-center transition-all duration-200 ${
            activeFilterChip === 'lua'
              ? 'bg-[#F0B429]/15 border border-[#F0B429]/50 shadow-[0_0_15px_rgba(240,180,41,0.15)]'
              : 'bg-[#0B0E1C]/60 border border-[#F0B429]/20 hover:border-[#F0B429]/40 hover:bg-[#F0B429]/5'
          }`}
        >
          <div className="flex justify-center mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#F0B429]/10 flex items-center justify-center">
              <Moon size={16} className="text-[#F0B429]" />
            </div>
          </div>
          <p className="text-[11px] text-[#F0B429] uppercase tracking-widest font-mono font-semibold">
            Fase Lunar
          </p>
          <p className="text-xs font-bold mt-1 text-white truncate">
            {moonPhase ?? 'Calculando'}
          </p>
          {activeFilterChip === 'lua' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F0B429] flex items-center justify-center">
              <CheckCircle size={10} className="text-[#06070F]" />
            </div>
          )}
        </button>

        {/* Tema Chip */}
        <button
          onClick={() => onFilterChipChange(activeFilterChip === 'tema' ? null : 'tema')}
          className={`relative group rounded-2xl p-3 text-center transition-all duration-200 ${
            activeFilterChip === 'tema'
              ? 'bg-[#7C5CFF]/15 border border-[#7C5CFF]/50 shadow-[0_0_15px_rgba(124,92,255,0.15)]'
              : 'bg-[#0B0E1C]/60 border border-[#7C5CFF]/20 hover:border-[#7C5CFF]/40 hover:bg-[#7C5CFF]/5'
          }`}
        >
          <div className="flex justify-center mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center">
              <Sun size={16} className="text-[#7C5CFF]" />
            </div>
          </div>
          <p className="text-[11px] text-[#7C5CFF] uppercase tracking-widest font-mono font-semibold">
            Tema
          </p>
          <p className="text-xs font-bold mt-1 text-white truncate">
            {overallTheme ?? 'Foco'}
          </p>
          {activeFilterChip === 'tema' && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7C5CFF] flex items-center justify-center">
              <CheckCircle size={10} className="text-white" />
            </div>
          )}
        </button>
      </div>
    </>
  );
}
