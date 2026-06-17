'use client';

// Shared FrequencyBadge — Pilar 4 (Gene Keys Shadow/Gift/Siddhi) pattern.
// Used by MandalaNarrative.tsx and AkashaLifeAreasDashboard.tsx.
//
// Gen-keys naming: "Shadow → Gift → Siddhi" (PT-BR: Sombra, Dom, Siddhi).
// Per coding_prompt N+3: NÃO usar naming Gene Keys (Shadow/Gift/Siddhi
// em inglês); usar PT-BR (Sombra, Dom, Siddhi). Componentes abaixo
// usam PT-BR internally; API aceita strings em inglês para compat
// com código existente.

import { CheckCircle2, Star, XCircle, type LucideIcon } from 'lucide-react';

export type FrequencyLevel = 'shadow' | 'gift' | 'siddhi';

const FREQ_CONFIG: Record<FrequencyLevel, { label: string; color: string; Icon: LucideIcon }> = {
  shadow: { label: 'Sombra', color: '#FF2D55', Icon: XCircle },
  gift:   { label: 'Dom',   color: '#34C759', Icon: CheckCircle2 },
  siddhi: { label: 'Siddhi',color: '#AF52DE', Icon: Star },
};

export interface FrequencyBadgeProps {
  frequency: FrequencyLevel;
  className?: string;
}

export function FrequencyBadge({ frequency, className = '' }: FrequencyBadgeProps) {
  const { label, color, Icon } = FREQ_CONFIG[frequency];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: `${color}22`, color }}
    >
      <Icon size={10} />
      {label}
    </span>
  );
}

// Re-export config for consumers that need direct access (e.g.
// for tooltips with full descriptions). This avoids duplicating the
// color/icon map.
export const FREQUENCY_CONFIG_DETAILED: Record<
  FrequencyLevel,
  { label: string; color: string; icon: LucideIcon; description: string }
> = {
  shadow: {
    label: 'Sombra',
    color: '#FF2D55',
    icon: XCircle,
    description: 'Padrão inconsciente de sofrimento',
  },
  gift: {
    label: 'Dom',
    color: '#34C759',
    icon: CheckCircle2,
    description: 'Genialidade e amor inato',
  },
  siddhi: {
    label: 'Realização',
    color: '#AF52DE',
    icon: Star,
    description: 'Transcendência do padrão',
  },
};
