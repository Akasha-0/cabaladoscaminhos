export type PredictionType = 'numerologia' | 'astrologia' | 'ifa' | 'candomble' | 'tarot' | 'cabala' | 'ritual' | 'energia';

const PREDICTION_TYPES: PredictionType[] = [
  'numerologia',
  'astrologia', 
  'ifa',
  'candomble',
  'tarot',
  'cabala',
  'ritual',
  'energia',
];

const ALL_PREDICTION_TYPES: PredictionType[] = PREDICTION_TYPES;

const TYPE_LABELS: Record<PredictionType, string> = {
  numerologia: 'Numerologia',
  astrologia: 'Astrologia',
  ifa: 'Ifá',
  candomble: 'Candomblé',
  tarot: 'Tarô',
  cabala: 'Cabala',
  ritual: 'Ritual',
  energia: 'Energia',
};

const TYPE_COLORS: Record<PredictionType, { primary: string; gradient: string; bg: string; border: string }> = {
  numerologia: {
    primary: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  astrologia: {
    primary: 'text-purple-400',
    gradient: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  ifa: {
    primary: 'text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  candomble: {
    primary: 'text-rose-400',
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  tarot: {
    primary: 'text-violet-400',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
  },
  cabala: {
    primary: 'text-yellow-400',
    gradient: 'from-yellow-500 to-amber-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  ritual: {
    primary: 'text-orange-400',
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  energia: {
    primary: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'Alta Confiança',
  medium: 'Média Confiança',
  low: 'Baixa Confiança',
};

const CONFIDENCE_THRESHOLDS = {
  high: 80,
  medium: 60,
};

const PERIOD_OPTIONS = [
  { value: 7, label: '7 dias' },
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
];

const DEFAULT_PERIOD = 30;
const MIN_PERIOD = 7;
const MAX_PERIOD = 90;