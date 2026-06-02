// fallow-ignore-file unused-file
 import React, { useState, useMemo, useCallback } from 'react';
 import { cn } from '@/lib/utils';

// TYPES
// ============================================================

interface UserSpiritualData {
  nome: string;
  dataNascimento: string;
  numeroPessoal?: number;
  odu?: string;
  orixas?: string[];
  sefirot?: string[];
  mapaNatal?: {
    signos?: string[];
    planetas?: string[];
    casas?: string[];
  };
  caminho?: string;
}

type SpiritualSystem = 
  | 'Numerologia'
  | 'Astrologia'
  | 'Ifá/Odu'
  | 'Candomblé'
  | 'Tarot'
  | 'Cabala'
  | 'Elementos'
  | 'Chakras';

export interface BalanceRecord {
  date: string;
  overallBalance: number;
  systemBalances: Partial<Record<SpiritualSystem, number>>;
}

export interface Recommendation {
  system: SpiritualSystem;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SpiritualBalanceGaugeProps {
  /** User's spiritual data for context */
  userData: UserSpiritualData;
  /** Current balance scores per system (0-100), defaults to computed */
  currentBalance?: Partial<Record<SpiritualSystem, number>>;
  /** Additional CSS classes */
  className?: string;
  /** Show trend indicator */
  showTrend?: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================

const SPIRITUAL_SYSTEMS: SpiritualSystem[] = [
  'Numerologia',
  'Astrologia',
  'Ifá/Odu',
  'Candomblé',
  'Tarot',
  'Cabala',
  'Elementos',
  'Chakras',
];

const SYSTEM_COLORS: Record<SpiritualSystem, { primary: string; glow: string; bg: string; label: string }> = {
  Numerologia: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', bg: 'bg-amber-500/10', label: 'Números' },
  Astrologia: { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)', bg: 'bg-violet-500/10', label: 'Estrelas' },
  'Ifá/Odu': { primary: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)', bg: 'bg-emerald-500/10', label: 'Destino' },
  Candomblé: { primary: '#f97316', glow: 'rgba(249, 115, 22, 0.4)', bg: 'bg-orange-500/10', label: 'Orixás' },
  Tarot: { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', bg: 'bg-pink-500/10', label: 'Arcanos' },
  Cabala: { primary: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', bg: 'bg-indigo-500/10', label: 'Sefirot' },
  Elementos: { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', bg: 'bg-cyan-500/10', label: 'Elementos' },
  Chakras: { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', bg: 'bg-purple-500/10', label: 'Energia' },
};

const SYSTEM_RECOMMENDATIONS: Record<SpiritualSystem, string[]> = {
  Numerologia: [
    'Medite sobre seu número pessoal diariamente',
    'Observe padrões numéricos em sua vida',
  ],
  Astrologia: [
    'Acompanhe as fases da lua',
    'Reflita sobre aspectos do seu mapa natal',
  ],
  'Ifá/Odu': [
    'Respeite as orientações do seu odú',
    'Mantenha práticas divinatórias regulares',
  ],
  Candomblé: [
    'Honre seus orixás com oferendas adequadas',
    'Participe de ritos comunitários',
  ],
  Tarot: [
    'Consulte as cartas para insight diário',
    'Estude os Arcanos Maiores',
  ],
  Cabala: [
    'Pratique a Árvore da Vida em meditação',
    'Estude os 10 Sefirot',
  ],
  Elementos: [
    'Equilibre os elementos em seu ambiente',
    'Pratique respiração elemental',
  ],
  Chakras: [
    'Faça ativação dos chakras diariamente',
    'Use cristais para harmonizar centros energéticos',
  ],
};

const TREND_CONFIG = {
  up: { icon: '↑', label: 'Em Alta', color: 'text-emerald-400' },
  down: { icon: '↓', label: 'Em Baixa', color: 'text-rose-400' },
  stable: { icon: '→', label: 'Estável', color: 'text-slate-400' },
} as const;

const BALANCE_LABELS: Record<string, string> = {
  excellent: 'Excelente',
  good: 'Bom',
  moderate: 'Moderado',
  low: 'Atenção',
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateOverallBalance(balances: Partial<Record<SpiritualSystem, number>>): number {
  const systems = SPIRITUAL_SYSTEMS.filter(s => balances[s] !== undefined);
  if (systems.length === 0) return 0;
  const sum = systems.reduce((acc, s) => acc + (balances[s] ?? 0), 0);
  return Math.round(sum / systems.length);
}

function getBalanceLevel(balance: number): string {
  if (balance >= 80) return 'excellent';
  if (balance >= 60) return 'good';
  if (balance >= 40) return 'moderate';
  return 'low';
}

function getBalanceColors(balance: number): { stroke: string; glow: string; text: string; bg: string } {
  if (balance >= 80) {
    return {
      stroke: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.6)',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
    };
  }
  if (balance >= 60) {
    return {
      stroke: '#84cc16',
      glow: 'rgba(132, 204, 22, 0.6)',
      text: 'text-lime-400',
      bg: 'bg-lime-500/20',
    };
  }
  if (balance >= 40) {
    return {
      stroke: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.6)',
      text: 'text-amber-400',
      bg: 'bg-amber-500/20',
    };
  }
  return {
    stroke: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.6)',
    text: 'text-rose-400',
    bg: 'bg-rose-500/20',
  };
}

// fallow-ignore-next-line complexity
function generateRecommendations(balances: Partial<Record<SpiritualSystem, number>>): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const system of SPIRITUAL_SYSTEMS) {
    const balance = balances[system];
    if (balance === undefined || balance >= 70) continue;

    const priority: Recommendation['priority'] = balance < 40 ? 'high' : balance < 55 ? 'medium' : 'low';
    const suggestion = SYSTEM_RECOMMENDATIONS[system]?.[0] ?? `Fortaleça sua prática em ${system}`;

    recommendations.push({ system, suggestion, priority });
  }

  // Sort by priority (high first) then by balance (low first)
  return recommendations.sort((a, b) => {
    if (a.priority !== b.priority) {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    }
    return (balances[a.system] ?? 0) - (balances[b.system] ?? 0);
  });
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface BalanceGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

function BalanceGauge({ value, size = 180, strokeWidth = 14 }: BalanceGaugeProps) {
  const colors = useMemo(() => getBalanceColors(value), [value]);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{
            filter: `drop-shadow(0 0 10px ${colors.glow})`,
            transition: 'stroke-dasharray 1s ease-out, stroke 0.5s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-4xl font-bold', colors.text)}>
          {value}
        </span>
        <span className="text-xs text-slate-500 mt-1">/ 100</span>
      </div>
    </div>
  );
}

interface SystemBarProps {
  system: SpiritualSystem;
  balance: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function SystemBar({ system, balance, isExpanded, onToggle }: SystemBarProps) {
  const config = SYSTEM_COLORS[system];
  const colors = getBalanceColors(balance);

  return (
    <button
      onClick={onToggle}
      className="w-full flex flex-col gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: config.primary, boxShadow: `0 0 6px ${config.glow}` }}
          />
          <span className="text-sm font-medium text-slate-200">{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-slate-300">{balance}</span>
          <span className={cn('text-slate-500 transition-transform', isExpanded && 'rotate-180')}>
            ▼
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${balance}%`,
            backgroundColor: colors.stroke,
            boxShadow: `0 0 8px ${colors.glow}`,
          }}
        />
      </div>
    </button>
  );
}

interface TrendIndicatorProps {
  currentBalance: number;
  previousBalance?: number;
}

function TrendIndicator({ currentBalance, previousBalance }: TrendIndicatorProps) {
  if (previousBalance === undefined) return null;

  const diff = currentBalance - previousBalance;
  const trend = diff > 2 ? 'up' : diff < -2 ? 'down' : 'stable';
  const config = TREND_CONFIG[trend];

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'bg-slate-800/50 border border-slate-700'
      )}
    >
      <span className={config.color}>{config.icon}</span>
      <span className="text-xs sm:text-sm text-slate-300">{config.label}</span>
      {diff !== 0 && (
        <span className="text-xs text-slate-500">
          {diff > 0 ? '+' : ''}{diff}
        </span>
      )}
    </div>
  );
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  maxVisible?: number;
}

function RecommendationsPanel({ recommendations, maxVisible = 3 }: RecommendationsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? recommendations : recommendations.slice(0, maxVisible);

  if (recommendations.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <p className="text-sm text-emerald-400 text-center">
          ✨ Seu equilíbrio espiritual está harmonioso!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
// fallow-ignore-next-line complexity
        {visible.map((rec, index) => (
          <div
            key={`${rec.system}-${index}`}
            className={cn(
              'p-3 rounded-lg',
              rec.priority === 'high' && 'bg-rose-500/10 border border-rose-500/20',
              rec.priority === 'medium' && 'bg-amber-500/10 border border-amber-500/20',
              rec.priority === 'low' && 'bg-slate-800/50 border border-slate-700'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded font-medium uppercase',
                  rec.priority === 'high' && 'bg-rose-500/20 text-rose-400',
                  rec.priority === 'medium' && 'bg-amber-500/20 text-amber-400',
                  rec.priority === 'low' && 'bg-slate-700 text-slate-400'
                )}
              >
                {rec.priority}
              </span>
              <span className="text-sm text-slate-300 font-medium">
                {SYSTEM_COLORS[rec.system]?.label ?? rec.system}
              </span>
            </div>
            <p className="text-sm text-slate-400">{rec.suggestion}</p>
          </div>
        ))}
      </div>
      {recommendations.length > maxVisible && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-500 hover:text-slate-400 transition-colors py-1"
        >
          {expanded ? 'Mostrar menos' : `Ver todas (${recommendations.length})`}
        </button>
      )}
    </div>
  );
}

interface HistoricalChartProps {
  history: BalanceRecord[];
}

function HistoricalChart({ history }: HistoricalChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const last7 = history.slice(-7);
    if (last7.length < 2) return { points: '', height: 60, max: 100, min: 0 };

    const max = Math.max(...last7.map(h => h.overallBalance));
    const min = Math.min(...last7.map(h => h.overallBalance));
    const range = max - min || 1;

    const width = 280;
    const height = 60;
    const stepX = width / (last7.length - 1);

    const points = last7.map((record, i) => {
      const x = i * stepX;
      const y = height - ((record.overallBalance - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return { points, height, max, min };
  }, [history]);

  if (history.length < 2) {
    return (
      <div className="h-[60px] flex items-center justify-center text-xs text-slate-500">
        Dados históricos insuficientes
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 280 ${chartData.height}`}
        className="w-full h-[60px]"
      >
        {/* Line */}
        <polyline
          points={chartData.points}
          fill="none"
          stroke="url(#balanceGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        {/* Points */}
        {history.slice(-7).map((record, i) => {
          const stepX = 280 / (history.slice(-7).length - 1);
          const x = i * stepX;
          const max = chartData.max;
          const min = chartData.min;
          const range = max - min || 1;
          const y = chartData.height - ((record.overallBalance - min) / range) * chartData.height;
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={hoveredIndex === i ? 5 : 3}
              fill={hoveredIndex === i ? '#22c55e' : '#6366f1'}
              stroke="#0f172a"
              strokeWidth="2"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
          />
          );
        })}
      </svg>
      {/* Hover label */}
      {hoveredIndex !== null && history.slice(-7)[hoveredIndex] && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-900 rounded text-xs text-slate-200 whitespace-nowrap">
          {history.slice(-7)[hoveredIndex].overallBalance}% ({new Date(history.slice(-7)[hoveredIndex].date).toLocaleDateString('pt-BR')})
        </div>
      )}
    </div>
  );
}

 interface BalanceSkeletonProps {
   variant?: 'full' | 'compact';
}
 
 // Skeleton loader kept for future loading state support
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
function BalanceSkeleton({ variant = 'full' }: BalanceSkeletonProps) {
  return (
    <div className={cn('animate-pulse', variant === 'compact' ? 'p-4' : 'p-6')}>
      <div className="flex justify-center mb-4">
        <div className="w-32 h-32 rounded-full bg-slate-800" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-slate-800 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// fallow-ignore-next-line complexity
// ============================================================

export function SpiritualBalanceGauge({
  userData,
  currentBalance,
  className = '',
  showTrend = true,
}: SpiritualBalanceGaugeProps) {
   const [activeTab, setActiveTab] = useState<'systems' | 'recommendations' | 'history'>('systems');
   const [expandedSystems, setExpandedSystems] = useState<Set<SpiritualSystem>>(new Set());

  // Generate deterministic balance based on user data
  const computedBalance = useMemo(() => {
    if (currentBalance && Object.keys(currentBalance).length > 0) {
      return currentBalance;
    }
    const balance: Partial<Record<SpiritualSystem, number>> = {};
    const seed = userData.nome.length + (userData.numeroPessoal ?? 0);
    
    for (let i = 0; i < SPIRITUAL_SYSTEMS.length; i++) {
      const system = SPIRITUAL_SYSTEMS[i];
      const deterministicValue = ((seed * (i + 1) * 17) % 40) + 50;
      balance[system] = Math.min(100, Math.max(30, deterministicValue));
    }
    return balance;
  }, [currentBalance, userData]);

  const overallBalance = useMemo(
    () => calculateOverallBalance(computedBalance),
    [computedBalance]
  );

  const recommendations = useMemo(
    () => generateRecommendations(computedBalance),
    [computedBalance]
  );

  // Generate deterministic historical data
  const historicalData = useMemo<BalanceRecord[]>(() => {
    const days = 7;
    const records: BalanceRecord[] = [];
    const seed = overallBalance;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dailyValue = seed - Math.floor(i * 3) + Math.floor(((i * 7) % 13) / 2);
      records.push({
        date: date.toISOString().split('T')[0],
        overallBalance: Math.min(100, Math.max(30, dailyValue)),
        systemBalances: {},
      });
    }
    return records;
  }, [overallBalance]);
  const toggleSystem = useCallback((system: SpiritualSystem) => {
    setExpandedSystems(prev => {
      const next = new Set(prev);
      if (next.has(system)) {
        next.delete(system);
      } else {
        next.add(system);
      }
      return next;
    });
  }, []);

  // Error boundary simulation
  if (!userData || typeof userData !== 'object') {
    return (
      <div className={cn('p-4 rounded-lg bg-rose-500/10 border border-rose-500/20', className)}>
        <p className="text-sm text-rose-400">Dados do usuário não disponíveis</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-serif font-semibold text-slate-100">
          Equilíbrio Espiritual
        </h2>
        {showTrend && (
          <TrendIndicator
            currentBalance={overallBalance}
            previousBalance={historicalData[historicalData.length - 2]?.overallBalance}
          />
        )}
      </div>

      {/* Main Gauge */}
      <div className="flex justify-center py-4">
        <BalanceGauge value={overallBalance} />
      </div>

      {/* Balance Status */}
      <div className="text-center">
        <span className={cn(
          'text-sm font-medium px-3 py-1 rounded-full',
          getBalanceColors(overallBalance).bg,
          getBalanceColors(overallBalance).text
        )}>
          {BALANCE_LABELS[getBalanceLevel(overallBalance)]}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900/50 rounded-lg">
        {[
          { id: 'systems', label: 'Sistemas' },
          { id: 'recommendations', label: 'Recomendações' },
          { id: 'history', label: 'Histórico' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex-1 px-3 py-2 text-xs sm:text-sm rounded-md transition-colors',
              activeTab === tab.id
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'systems' && (
          <div className="flex flex-col gap-3">
            {SPIRITUAL_SYSTEMS.map(system => (
              <SystemBar
                key={system}
                system={system}
                balance={Math.round(computedBalance[system] ?? 0)}
                isExpanded={expandedSystems.has(system)}
                onToggle={() => toggleSystem(system)}
              />
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsPanel recommendations={recommendations} />
        )}

        {activeTab === 'history' && (
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h3 className="text-sm font-medium text-slate-300 mb-3">
              Últimos 7 dias
            </h3>
            <HistoricalChart history={historicalData} />
            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>Mais antigo</span>
              <span>Mais recente</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpiritualBalanceGauge;
