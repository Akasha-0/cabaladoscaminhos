// fallow-ignore-file unused-file
'use client';

import {
  Zap,
  Heart,
  Wind,
  Sparkles,
  Activity,
  Moon,
  Sun,
  TrendingUp,
  TrendingDown,
  Minus,
  Gauge,
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import SacredCornerSVG from '@/components/ui/SacredCornerSVG';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

export interface SpiritualEnergyWidgetProps {
  userData?: {
    id?: string;
    orixaRegente?: string;
    numeroPessoal?: number;
  };
  className?: string;
  showTrend?: boolean;
  onEnergyChange?: (energy: EnergyData) => void;
}

export interface EnergyData {
  total: number;
  vital: number;
  emotional: number;
  mental: number;
  spiritual: number;
  balance: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface EnergyLevel {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const ENERGY_COLORS = {
  vital: {
    base: 'from-red-500/20',
    glow: 'bg-red-500/50',
    ring: 'ring-red-500/50',
    text: 'text-red-400',
  },
  emotional: {
    base: 'from-pink-500/20',
    glow: 'bg-pink-500/50',
    ring: 'ring-pink-500/50',
    text: 'text-pink-400',
  },
  mental: {
    base: 'from-blue-500/20',
    glow: 'bg-blue-500/50',
    ring: 'ring-blue-500/50',
    text: 'text-blue-400',
  },
  spiritual: {
    base: 'from-purple-500/20',
    glow: 'bg-purple-500/50',
    ring: 'ring-purple-500/50',
    text: 'text-purple-400',
  },
};

const ORYX_ENERGY_BONUS: Record<string, Partial<EnergyData>> = {
  Oxum: { emotional: 10 },
  Oxumar: { spiritual: 15, mental: 5 },
  Oxalá: { vital: 10, spiritual: 10 },
  Iemanjá: { emotional: 15, spiritual: 5 },
  Ogum: { vital: 10, mental: 5 },
  Xangô: { mental: 10, vital: 5 },
  Ibeji: { spiritual: 10, emotional: 5 },
  Nanã: { spiritual: 15, emotional: 5 },
  Obatalá: { mental: 10, spiritual: 10 },
  Odoyá: { emotional: 5, spiritual: 10 },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getEnergyLevel(value: number): 'low' | 'medium' | 'high' {
  if (value < 33) return 'low';
  if (value < 66) return 'medium';
  return 'high';
}

function getEnergyGradient(value: number): string {
  const level = getEnergyLevel(value);
  switch (level) {
    case 'low':
      return 'from-red-500 to-orange-500';
    case 'medium':
      return 'from-yellow-500 to-amber-500';
    case 'high':
      return 'from-emerald-500 to-green-500';
  }
}

// fallow-ignore-next-line complexity
function calculateEnergyFromUserData(
  userData?: SpiritualEnergyWidgetProps['userData']
): EnergyData {
  const baseEnergy = userData?.numeroPessoal ? Math.min(50 + userData.numeroPessoal * 3, 100) : 60;
  const orixaBonus = userData?.orixaRegente ? ORYX_ENERGY_BONUS[userData.orixaRegente] || {} : {};

  return {
    total: baseEnergy,
    vital: Math.min(baseEnergy * 0.8 + (orixaBonus.vital || 0), 100),
    emotional: Math.min(baseEnergy * 0.7 + (orixaBonus.emotional || 0), 100),
    mental: Math.min(baseEnergy * 0.6 + (orixaBonus.mental || 0), 100),
    spiritual: Math.min(baseEnergy * 0.9 + (orixaBonus.spiritual || 0), 100),
    balance: Math.random() * 20 + 70,
    trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    trendValue: Math.floor(Math.random() * 10) - 3,
  };
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function EnergyArc({
  value,
  size = 80,
  strokeWidth = 6,
  label,
  color,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const gradient = getEnergyGradient(percentage);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradient.split(' ')[1] || 'currentColor'} />
              <stop offset="100%" stopColor={gradient.split(' ')[3] || 'currentColor'} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{Math.round(percentage)}</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 mt-2">{label}</span>
    </div>
  );
}

function EnergyBar({
  label,
  value,
  icon,
  colorClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}) {
  const percentage = Math.min(value, 100);
  const gradient = getEnergyGradient(percentage);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={colorClass}>{icon}</span>
          <span className="text-slate-300 text-sm">{label}</span>
        </div>
        <span className="text-white font-semibold text-sm">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-gradient-to-r rounded-full transition-all duration-500',
            gradient
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
// fallow-ignore-next-line complexity

function TrendBadge({ trend, value }: { trend: 'up' | 'down' | 'stable'; value: number }) {
  const iconClass =
    trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        trend === 'up' && 'bg-emerald-500/20 text-emerald-400',
        trend === 'down' && 'bg-red-500/20 text-red-400',
        trend === 'stable' && 'bg-slate-700/50 text-slate-400'
      )}
    >
      <Icon className="w-3 h-3" />
      <span>
        {value > 0 ? '+' : ''}
        {value}%
      </span>
    </div>
  );
}

function BalanceGauge({ value, size = 100 }: { value: number; size?: number }) {
  const rotation = ((value - 50) / 50) * 90;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
      <div
        className="absolute bottom-1/2 left-1/2 w-1 bg-gradient-to-t from-amber-400 to-orange-500 rounded-full origin-bottom transition-transform duration-500"
        style={{ height: size / 2 - 10, transform: `translateX(-50%) rotate(${rotation}deg)` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-white">{Math.round(value)}%</p>
          <p className="text-xs text-slate-400">Equilíbrio</p>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function EnergySkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-center">
        <div className="w-28 h-28 rounded-full border-8 border-slate-700 flex items-center justify-center skeleton-spiritual" />
      </div>
      <div className="space-y-3">
        <div className="h-3 rounded skeleton-spiritual w-full" />
        <div className="h-3 rounded skeleton-spiritual w-4/5" />
        <div className="h-3 rounded skeleton-spiritual w-3/5" />
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// fallow-ignore-next-line complexity
// ============================================================

export function SpiritualEnergyWidget({
  userData,
  className = '',
  showTrend = true,
  onEnergyChange,
}: SpiritualEnergyWidgetProps) {
  const [energy, setEnergy] = useState<EnergyData>({
    total: 0,
    vital: 0,
    emotional: 0,
    mental: 0,
    spiritual: 0,
    balance: 50,
    trend: 'stable',
    trendValue: 0,
  });
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const calculatedEnergy = calculateEnergyFromUserData(userData);
    const timer = setTimeout(() => {
      setEnergy(calculatedEnergy);
      setIsAnimating(false);
      onEnergyChange?.(calculatedEnergy);
    }, 1000);
    return () => clearTimeout(timer);
  }, [userData]);

  const energyLevels: EnergyLevel[] = useMemo(
    () => [
      {
        value: energy.vital,
        label: 'Vital',
        icon: <Heart className="w-4 h-4" />,
        color: 'text-red-400',
        glowColor: 'bg-red-500/50',
      },
      {
        value: energy.emotional,
        label: 'Emocional',
        icon: <Activity className="w-4 h-4" />,
        color: 'text-pink-400',
        glowColor: 'bg-pink-500/50',
      },
      {
        value: energy.mental,
        label: 'Mental',
        icon: <Sparkles className="w-4 h-4" />,
        color: 'text-blue-400',
        glowColor: 'bg-blue-500/50',
      },
      {
        value: energy.spiritual,
        label: 'Espiritual',
        icon: <Wind className="w-4 h-4" />,
        color: 'text-purple-400',
        glowColor: 'bg-purple-500/50',
      },
    ],
    [energy]
  );

  return (
    <div className={cn('card-spiritual relative overflow-hidden', className)}>
      {/* Sacred corner decorations */}
      <SacredCornerSVG className="sacred-corner sacred-corner-tl text-amber-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-tr text-violet-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-bl text-amber-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-br text-violet-500 hidden md:block" />

      {/* Loading skeleton */}
      {isAnimating && <EnergySkeleton />}

      {/* Header */}
      {!isAnimating && (
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Energia Espiritual</h3>
              <p className="text-slate-400 text-xs">
                {userData?.orixaRegente ? `Bênção de ${userData.orixaRegente}` : 'Fluxo energético'}
              </p>
            </div>
          </div>
          {showTrend && <TrendBadge trend={energy.trend} value={energy.trendValue} />}
        </div>
      )}

      {/* Main Display */}
      {!isAnimating && (
        <div className="p-6">
          {/* Total Energy Arc */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <svg width={120} height={120} className="transform -rotate-90">
                <circle
                  cx={60}
                  cy={60}
                  r={52}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-700"
                />
                <circle
                  cx={60}
                  cy={60}
                  r={52}
                  fill="none"
                  stroke="url(#totalGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={326.7}
                  strokeDashoffset={326.7 - (energy.total / 100) * 326.7}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="totalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Gauge className="w-6 h-6 text-amber-400 mb-1" />
                <span className="text-2xl font-bold text-white">{Math.round(energy.total)}</span>
                <span className="text-xs text-slate-400">Total</span>
              </div>
            </div>
          </div>

          {/* Energy Bars */}
          <div className="space-y-4">
            <EnergyBar
              label="Vital"
              value={energy.vital}
              icon={<Heart className="w-4 h-4" />}
              colorClass="text-red-400"
            />
            <EnergyBar
              label="Emocional"
              value={energy.emotional}
              icon={<Activity className="w-4 h-4" />}
              colorClass="text-pink-400"
            />
            <EnergyBar
              label="Mental"
              value={energy.mental}
              icon={<Sparkles className="w-4 h-4" />}
              colorClass="text-blue-400"
            />
            <EnergyBar
              label="Espiritual"
              value={energy.spiritual}
              icon={<Wind className="w-4 h-4" />}
              colorClass="text-purple-400"
            />
          </div>
        </div>
      )}

      {/* Balance Indicator */}
      {!isAnimating && (
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Equilíbrio dos Chakras</span>
            <BalanceGauge value={energy.balance} size={60} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SpiritualEnergyWidget;
