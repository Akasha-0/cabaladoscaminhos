'use client';
import { memo } from 'react';

const STRATEGY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  act: { color: '#34C759', bg: 'rgba(52,199,89,0.15)', label: 'Agir' },
  wait: { color: '#FF9500', bg: 'rgba(255,149,0,0.15)', label: 'Aguarde' },
  observe: { color: '#5856D6', bg: 'rgba(88,86,214,0.15)', label: 'Observe' },
};

export const StrategyBadge = memo(function StrategyBadge({ strategy }: { strategy: string }) {
  const c = STRATEGY_CONFIG[strategy] ?? STRATEGY_CONFIG.observe;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
});
