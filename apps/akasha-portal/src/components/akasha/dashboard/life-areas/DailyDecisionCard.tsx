'use client';
import { memo } from 'react';
import { Lightbulb, ArrowRight, XCircle } from 'lucide-react';
import type { DailyDecisionUI } from '../hooks/useAkashaSynthesis';
import { StrategyBadge } from './StrategyBadge';

export const DailyDecisionCard = memo(function DailyDecisionCard({ decision }: { decision: DailyDecisionUI }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-[#FF9500]" />
          <span className="text-sm font-semibold text-white">Decisão do Dia</span>
        </div>
        <StrategyBadge strategy={decision.strategy} />
      </div>

      <p className="text-sm text-white/70 leading-relaxed">{decision.strategyExplanation}</p>

      <div className="bg-white/5 rounded-xl p-3 space-y-2">
        <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Autoridade</p>
        <p className="text-sm text-white/80 italic">&ldquo;{decision.authorityQuestion}&rdquo;</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-start gap-2">
          <ArrowRight size={14} className="text-[#34C759] mt-0.5 shrink-0" />
          <p className="text-sm text-white/80">{decision.recommendation}</p>
        </div>
        <div className="flex items-start gap-2">
          <XCircle size={14} className="text-[#FF2D55] mt-0.5 shrink-0" />
          <p className="text-sm text-white/80">{decision.avoid}</p>
        </div>
      </div>
    </div>
  );
});
