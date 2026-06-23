'use client';

/**
 * @akasha/portal — Dashboard Daily Ritual Card
 * Extracted from Dashboard.tsx (lines 739–871)
 * Contains: ritual card with expandable instruction and completion flow
 */
import { motion } from 'framer-motion';
import { Sparkles, Wind, Heart, ChevronUp, ChevronDown, Loader, UserCheck, CheckCircle } from 'lucide-react';
import type { DailyRitualUI } from './hooks/useAkashaSynthesis';

interface DashboardDailyRitualProps {
  ritual: DailyRitualUI;
  ritualExpanded: boolean;
  completedToday: boolean;
  completing: boolean;
  dominantFrequency?: 'shadow' | 'gift' | 'siddhi';
  onRitualExpand: (v: boolean) => void;
  onCompleteRitual: () => Promise<void>;
}

export function DashboardDailyRitual({
  ritual,
  ritualExpanded,
  completedToday,
  completing,
  dominantFrequency = 'gift',
  onRitualExpand,
  onCompleteRitual,
}: DashboardDailyRitualProps) {
  return (
    <div className="relative group">
      {/* Glow effect behind card */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#7C5CFF]/20 via-[#2DD4BF]/10 to-[#7C5CFF]/20 rounded-3xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      <div className="relative bg-[#0B0E1C]/90 border border-[#7C5CFF]/20 rounded-2xl p-6 backdrop-blur-md">
        {/* Header with gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7C5CFF]/50 to-transparent" />

        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#2DD4BF]/10 border border-[#7C5CFF]/20 flex items-center justify-center">
                <Sparkles size={18} className="text-[#9D86FF]" />
              </div>
              <h3 className="text-[10px] text-[#9D86FF] font-semibold uppercase tracking-widest font-mono">
                Ritual do Dia
              </h3>
            </div>
            <h3 className="text-xl font-bold font-cinzel text-white leading-tight">
              {ritual.titulo}
            </h3>
            <div className="flex items-center gap-3 text-xs text-[#A7AECF]/70">
              {ritual.elemento ? (
                <span className="flex items-center gap-1">
                  <Wind size={12} className="text-[#2DD4BF]" />
                  <span className="text-[10px] text-[#A7AECF]/50 mr-1">elemento</span>
                  <span className="text-xs text-white">{ritual.elemento}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="text-[10px] text-[#A7AECF]/50">cor</span>
                  <span className="text-xs text-white">{ritual.cor || '15 min'}</span>
                </span>
              )}
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#2DD4BF]/10 border border-[#7C5CFF]/20 flex items-center justify-center shadow-[0_0_20px_rgba(124,92,255,0.15)]">
            <Heart size={28} className="text-[#9D86FF]" />
          </div>
        </div>

        {/* Instruction with truncation */}
        <div
          id="ritual-instructions"
          className="relative"
          style={{ maxHeight: ritualExpanded ? 'none' : '7.5em', overflow: 'hidden' }}
        >
          <div className="bg-[#0B0E1C]/80 rounded-xl p-4 mb-2 border border-white/5">
            <p className="text-sm text-[#A7AECF] leading-relaxed">
              {ritual.instrucao}
            </p>
          </div>
          {!ritualExpanded && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2.5em',
                background: 'linear-gradient(to bottom, transparent, #06070F 85%)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
        <button
          onClick={() => onRitualExpand(!ritualExpanded)}
          aria-expanded={ritualExpanded}
          aria-controls="ritual-instructions"
          className="text-xs text-[#7C5CFF]/90 hover:text-[#7C5CFF] transition-colors px-3 py-2 min-h-11 rounded-lg"
        >
          {ritualExpanded ? (
            <>
              <ChevronUp size={12} className="inline" /> Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown size={12} className="inline" /> Ver instrução completa
            </>
          )}
        </button>

        {/* Completion Button */}
        <div className="pt-2">
          {completedToday ? (
            <div className="relative">
              <div className="absolute inset-0 bg-[#2DD4BF]/10 rounded-xl blur-md" />
              <div className="relative w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] font-bold text-sm shadow-[0_0_20px_rgba(45,212,191,0.15)]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <CheckCircle size={20} className="text-[#2DD4BF]" />
                </motion.div>
                <span>
                  Ritual Concluído!{' '}
                  <Sparkles size={14} className="inline ml-1 text-[#2DD4BF]" />
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={onCompleteRitual}
              disabled={completing}
              aria-busy={completing}
              className="w-full relative group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#9D86FF] rounded-xl blur-md opacity-50 group-hover/btn:opacity-70 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#9D86FF] text-white font-bold text-sm shadow-[0_0_25px_rgba(124,92,255,0.35)] hover:shadow-[0_0_35px_rgba(124,92,255,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none">
                {completing ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <UserCheck size={16} />
                    Confirmar Prática
                  </>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
