/**
 * Dashboard utilities: area config, frequency config, tradition mapping,
 * and shared badge components for the Akasha life-areas dashboard.
 */
import {
  Zap,
  Heart,
  TrendingUp,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Star,
  type LucideIcon,
} from 'lucide-react';

// ─── Tradition map ───────────────────────────────────────────────────────────

// Map legacy tradition names to Akasha-native labels used in chainOfReasoning
const TRADITION_MAP: Record<string, string> = {
  Cabala: 'Número de Vida',
  Astrologia: 'Movimento Celeste',
  Odus: 'Ancestralidade',
  Odu: 'Ancestralidade',
  Tantra: 'Corpo e Energia',
  'I Ching': 'Mutação do Caminho',
};

export function cleanTraditionName(text: string): string {
  let result = text;
  for (const [legacy, akasha] of Object.entries(TRADITION_MAP)) {
    result = result.replace(new RegExp(`\\b${legacy}\\b`, 'g'), akasha);
  }
  return result;
}

// ─── Area config ─────────────────────────────────────────────────────────────

export const AREA_CONFIG: Record<
  string,
  {
    icon: LucideIcon;
    color: string;
    bgColor: string;
    label: string;
    description: string;
  }
> = {
  vitalidadeEnergia: {
    icon: Zap,
    color: '#FF9500',
    bgColor: 'rgba(255,149,0,0.12)',
    label: 'Corpo',
    description: 'Saúde, sexualidade e energia vital',
  },
  conexoesAmor: {
    icon: Heart,
    color: '#FF3B30',
    bgColor: 'rgba(255,59,48,0.12)',
    label: 'Relações',
    description: 'Amor, família e vínculos afetivos',
  },
  carreiraProsperidade: {
    icon: TrendingUp,
    color: '#34C759',
    bgColor: 'rgba(52,199,89,0.12)',
    label: 'Recursos',
    description: 'Finanças, carreira e abundância',
  },
  oriCabecaQuizilas: {
    icon: Brain,
    color: '#5856D6',
    bgColor: 'rgba(88,86,214,0.12)',
    label: 'Mente',
    description: 'Intuição, direção e propósito',
  },
  missaoDestino: {
    icon: Sparkles,
    color: '#AF52DE',
    bgColor: 'rgba(175,82,222,0.12)',
    label: 'Espiritual',
    description: 'Missão, destino e transcendência',
  },
  desafiosSombras: {
    icon: AlertTriangle,
    color: '#FF2D55',
    bgColor: 'rgba(255,45,85,0.12)',
    label: 'Transformação',
    description: 'Karma, padrões inconscientes e superação',
  },
};

// ─── Frequency config ────────────────────────────────────────────────────────

export const FREQUENCY_CONFIG = {
  shadow: {
    label: 'Sombra',
    color: '#FF2D55',
    description: 'Padrão inconsciente de sofrimento',
    icon: XCircle,
  },
  gift: {
    label: 'Dom',
    color: '#34C759',
    description: 'Genialidade e amor inato',
    icon: CheckCircle2,
  },
  siddhi: {
    label: 'Realização',
    color: '#AF52DE',
    description: 'Transcendência do padrão',
    icon: Star,
  },
};

// ─── Shared badge components ─────────────────────────────────────────────────

export function FrequencyBadge({ frequency }: { frequency: 'shadow' | 'gift' | 'siddhi' }) {
  const cfg = FREQUENCY_CONFIG[frequency];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${cfg.color}22`, color: cfg.color }}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

export function IntensityDots({ intensity }: { intensity: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: i <= intensity ? '#FF9500' : '#3A3A3C' }}
        />
      ))}
    </div>
  );
}
