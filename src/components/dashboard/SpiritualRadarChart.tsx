'use client';

// Sacred geometry corner decoration
const SacredCornerSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2 L20 2 L20 5 L5 5 L5 20 L2 20 Z" fill="currentColor" opacity="0.3" />
    <path d="M2 2 Q20 2 20 20" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
    <circle cx="2" cy="2" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="20" cy="2" r="1" fill="currentColor" opacity="0.3" />
    <circle cx="2" cy="20" r="1" fill="currentColor" opacity="0.3" />
  </svg>
);

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

export type SpiritualSystem = 'numerologia' | 'astrologia' | 'orixas' | 'tarot' | 'cabala' | 'ifa';

export interface SystemLevel {
  system: SpiritualSystem;
  nivel: number; // 0-100
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: Date;
}

export interface UserSpiritualData {
  nome: string;
  dataNascimento: string;
  numeroPessoal?: number;
  odu?: string;
  orixas?: string[];
  sefirot?: string[];
  mapaNatal?: {
    signos: string[];
    planetas: string[];
  };
}

export interface SpiritualRadarChartProps {
  userData: UserSpiritualData;
  currentLevels?: Partial<Record<SpiritualSystem, number>>;
  previousLevels?: Partial<Record<SpiritualSystem, number>>;
  className?: string;
  showTrend?: boolean;
  defaultTab?: 'current' | 'comparison' | 'trend';
}

// ============================================================
// CONSTANTS
// ============================================================

const SYSTEM_COLORS: Record<SpiritualSystem, { primary: string; glow: string; bg: string; border: string }> = {
  numerologia: { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  astrologia: { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  orixas: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  tarot: { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  cabala: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  ifa: { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const SYSTEM_LABELS: Record<SpiritualSystem, string> = {
  numerologia: 'Numerologia',
  astrologia: 'Astrologia',
  orixas: 'Orixás',
  tarot: 'Tarot',
  cabala: 'Cabala',
  ifa: 'Ifá',
};

const SYSTEM_DESCRIPTIONS: Record<SpiritualSystem, Record<string, string>> = {
  numerologia: {
    low: 'Sua energia numerológica está em desenvolvimento. Pratique cálculos e estudos dos números sagrados.',
    medium: 'Bom alinhamento com sua vibração numérica. Continue explorando os mistérios dos números.',
    high: 'Excelente conexão com a numerologia! Sua energia está em harmonia com seu número de vida.',
  },
  astrologia: {
    low: 'Conexão astrológica em crescimento. Explore mapas natais e trânsitos planetários.',
    medium: 'Bom entendimento astrológico. Acompanhe seus trânsitos e aspectos planetários.',
    high: 'Profunda conexão com os ciclos celestiais. Sua consciência astrológica está altamente desenvolvida.',
  },
  orixas: {
    low: 'Início da jornada com os Orixás. Explore as tradições e práticas devocionais.',
    medium: 'Caminho sólido com os Orixás. Mantenha suas práticas e ofertas regulares.',
    high: 'Excelente alinhamento energético com seus Orixás guardiões. Sua espiritualidade está bem equilibrada.',
  },
  tarot: {
    low: 'Explorando o tarot. Pratique com leituras simples e estude os Arcanos.',
    medium: 'Boa compreensão das cartas. Continue desenvolvendo sua intuição tarotística.',
    high: 'Mestra/mestre do tarot! Sua intuição e conhecimento das cartas estão altamente refinados.',
  },
  cabala: {
    low: 'Iniciando na Cabala. Estude os Sephirot e a Árvore da Vida.',
    medium: 'Bom progresso na prática cabalística. Continue explorando os caminhos secretos.',
    high: 'Iluminação cabalística! Sua prática está em profundo alinhamento com a tradição.',
  },
  ifa: {
    low: 'Começando a jornada em Ifá. Explore os Odús e suas lições ancestrais.',
    medium: 'Boa conexão com Ifá. Mantenha suas práticas de divinação e sagrado.',
    high: 'Profunda sabedoria Ifá. Sua conexão com a tradição é forte e bem estabelecida.',
  },
};

const ALL_SYSTEMS: SpiritualSystem[] = ['numerologia', 'astrologia', 'orixas', 'tarot', 'cabala', 'ifa'];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getLevelDescription(system: SpiritualSystem, nivel: number): string {
  if (nivel < 33) return SYSTEM_DESCRIPTIONS[system].low;
  if (nivel < 66) return SYSTEM_DESCRIPTIONS[system].medium;
  return SYSTEM_DESCRIPTIONS[system].high;
}

function getTrendIcon(trend: 'up' | 'down' | 'stable' | undefined): string {
  switch (trend) {
    case 'up': return '↑';
    case 'down': return '↓';
    default: return '→';
  }
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface RadarGridProps {
  centerX: number;
  centerY: number;
  radius: number;
  levels: number[];
  angles: number[];
}

function RadarGrid({ centerX, centerY, radius, levels, angles }: RadarGridProps) {
  const getPoint = useCallback((nivel: number, angle: number) => {
    const r = (nivel / 100) * radius;
    const rad = (angle * Math.PI) / 180;
    return { x: centerX + r * Math.cos(rad), y: centerY + r * Math.sin(rad) };
  }, [centerX, centerY, radius]);

  return (
    <g className="radar-grid">
      {/* Background circles */}
      {levels.map((level) => (
        <circle
          key={level}
          cx={centerX}
          cy={centerY}
          r={(level / 100) * radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-border"
          strokeDasharray="2,2"
          opacity="0.5"
        />
      ))}
      
      {/* Axis lines */}
      {angles.map((angle, i) => {
        const end = getPoint(100, angle);
        return (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={end.x}
            y2={end.y}
            stroke="currentColor"
            strokeWidth="0.2"
            className="text-border"
            opacity="0.5"
          />
        );
      })}
    </g>
  );
}

interface RadarFillProps {
  centerX: number;
  centerY: number;
  radius: number;
  angles: number[];
  levels: SystemLevel[];
  previousLevels?: Partial<Record<SpiritualSystem, number>>;
  showComparison: boolean;
}

function RadarFill({ centerX, centerY, radius, angles, levels, previousLevels, showComparison }: RadarFillProps) {
  const getPoint = useCallback((nivel: number, angle: number) => {
    const r = (nivel / 100) * radius;
    const rad = (angle * Math.PI) / 180;
    return { x: centerX + r * Math.cos(rad), y: centerY + r * Math.sin(rad) };
  }, [centerX, centerY, radius]);

  const currentPath = useMemo(() => {
    const points = levels.map((level, i) => getPoint(level.nivel, angles[i]));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  }, [levels, angles, getPoint]);

  const previousPath = useMemo(() => {
    if (!previousLevels || !showComparison) return null;
    const points = ALL_SYSTEMS.map((system, i) => 
      getPoint(previousLevels[system] ?? 0, angles[i])
    );
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  }, [previousLevels, showComparison, angles, getPoint]);

  return (
    <g className="radar-fill">
      <defs>
        <radialGradient id="currentRadarGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="previousRadarGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6B7280" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6B7280" stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {/* Previous levels fill (comparison mode) */}
      {previousPath && (
        <path d={previousPath} fill="url(#previousRadarGradient)" stroke="currentColor" strokeWidth="0.3" className="text-gray-400" strokeDasharray="3,2" />
      )}

      {/* Current levels fill */}
      <path d={currentPath} fill="url(#currentRadarGradient)" stroke="currentColor" strokeWidth="0.5" className="text-violet-500" />
    </g>
  );
}

interface RadarPointsProps {
  centerX: number;
  centerY: number;
  radius: number;
  angles: number[];
  levels: SystemLevel[];
  hoveredSystem: SpiritualSystem | null;
  onHover: (system: SpiritualSystem | null) => void;
  onClick: (system: SpiritualSystem) => void;
}

function RadarPoints({ centerX, centerY, radius, angles, levels, hoveredSystem, onHover, onClick }: RadarPointsProps) {
  const getPoint = useCallback((nivel: number, angle: number) => {
    const r = (nivel / 100) * radius;
    const rad = (angle * Math.PI) / 180;
    return { x: centerX + r * Math.cos(rad), y: centerY + r * Math.sin(rad) };
  }, [centerX, centerY, radius]);

  return (
    <g className="radar-points">
      {levels.map((level, i) => {
        const point = getPoint(level.nivel, angles[i]);
        const colors = SYSTEM_COLORS[level.system];
        const isHovered = hoveredSystem === level.system;

        return (
          <g
            key={level.system}
            className="cursor-pointer"
            onMouseEnter={() => onHover(level.system)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(level.system)}
          >
            {/* Glow effect for hovered */}
            {isHovered && (
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill={colors.glow}
                className="animate-pulse"
              />
            )}
            
            {/* Main point */}
            <circle
              cx={point.x}
              cy={point.y}
              r={isHovered ? 2.5 : 2}
              fill={colors.primary}
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-background"
            />

            {/* Trend indicator */}
            {level.trend && (
              <text
                x={point.x + 4}
                y={point.y - 4}
                fontSize="3"
                fill={level.trend === 'up' ? '#10b981' : level.trend === 'down' ? '#ef4444' : '#6b7280'}
                fontWeight="bold"
              >
                {getTrendIcon(level.trend)}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

interface RadarLabelsProps {
  centerX: number;
  centerY: number;
  radius: number;
  angles: number[];
  levels: SystemLevel[];
  hoveredSystem: SpiritualSystem | null;
  onHover: (system: SpiritualSystem | null) => void;
}

function RadarLabels({ centerX, centerY, radius, angles, levels, hoveredSystem, onHover }: RadarLabelsProps) {
  const getLabelPosition = useCallback((angle: number, extraRadius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + (radius + extraRadius) * Math.cos(rad),
      y: centerY + (radius + extraRadius) * Math.sin(rad),
    };
  }, [centerX, centerY, radius]);

  return (
    <g className="radar-labels">
      {levels.map((level, i) => {
        const angle = angles[i];
        const pos = getLabelPosition(angle, 10);
        const colors = SYSTEM_COLORS[level.system];
        const isHovered = hoveredSystem === level.system;

        return (
          <g
            key={level.system}
            className="cursor-pointer"
            onMouseEnter={() => onHover(level.system)}
            onMouseLeave={() => onHover(null)}
          >
            {/* Highlight background on hover */}
            {isHovered && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={8}
                fill={colors.primary}
                opacity={0.15}
                className="transition-all duration-200"
              />
            )}
            {/* Label text with glow on hover */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isHovered ? 4 : 3}
              fill={isHovered ? '#fff' : colors.primary}
              fontWeight="700"
              className="transition-all duration-200"
              style={isHovered ? { 
                filter: `drop-shadow(0 0 4px ${colors.primary})`,
                textShadow: `0 0 6px ${colors.primary}`
              } : {}}
            >
              {SYSTEM_LABELS[level.system]}
            </text>
            {/* Level value */}
            <text
              x={pos.x}
              y={pos.y + 4.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isHovered ? 3 : 2.5}
              fill={isHovered ? colors.primary : 'currentColor'}
              className="text-muted-foreground transition-all duration-200"
            >
              {level.nivel}%
            </text>
          </g>
        );
      })}
    </g>
  );
}

interface SystemTooltipProps {
  system: SpiritualSystem;
  nivel: number;
  trend?: 'up' | 'down' | 'stable';
  previousLevel?: number;
}

function SystemTooltip({ system, nivel, trend, previousLevel }: SystemTooltipProps) {
  const colors = SYSTEM_COLORS[system];
  const change = previousLevel !== undefined ? nivel - previousLevel : null;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
        <span className="font-semibold text-foreground">{SYSTEM_LABELS[system]}</span>
        {trend && (
          <Badge variant="outline" className="text-xs">
            {trend === 'up' ? '↑ Subindo' : trend === 'down' ? '↓ Descendo' : '→ Estável'}
          </Badge>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Nível Atual:</span>
          <span className="font-medium" style={{ color: colors.primary }}>{nivel}%</span>
        </div>
        
        {change !== null && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Comparação:</span>
            <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {getLevelDescription(system, nivel)}
      </p>
    </div>
  );
}

interface RadarLegendProps {
  levels: SystemLevel[];
  previousLevels?: Partial<Record<SpiritualSystem, number>>;
}

function RadarLegend({ levels, previousLevels }: RadarLegendProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {levels.map((level) => {
        const colors = SYSTEM_COLORS[level.system];
        const change = previousLevels ? (level.nivel - (previousLevels[level.system] ?? 0)) : null;
        
        return (
          <div key={level.system} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.primary }} />
            <span className="text-xs text-muted-foreground gap-1">
              {SYSTEM_LABELS[level.system]}
            </span>
            {change !== null && (
              <span className={`text-xs ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ({change >= 0 ? '+' : ''}{change}%)
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface RadarSkeletonProps {
  variant?: 'full' | 'compact';
}

function RadarSkeleton({ variant = 'full' }: RadarSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className="w-full aspect-square flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full aspect-square flex items-center justify-center">
      <div className="space-y-4 w-full max-w-xs">
        <div className="flex justify-center">
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-64 w-full rounded-full" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualRadarChart({
  userData,
  currentLevels = {},
  previousLevels,
  className = '',
  showTrend = true,
  defaultTab = 'current',
}: SpiritualRadarChartProps) {
  // State
  const [hoveredSystem, setHoveredSystem] = useState<SpiritualSystem | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<SpiritualSystem | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'comparison' | 'trend'>(defaultTab);

  // Constants for SVG
  const svgSize = 200;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const radius = 70;
  const gridLevels = [25, 50, 75, 100];
  
  // Stable default values per system
  const defaultLevels: Record<SpiritualSystem, number> = {
    numerologia: 65,
    astrologia: 72,
    orixas: 58,
    tarot: 45,
    cabala: 38,
    ifa: 25,
  };
  
  const defaultTrends: Record<SpiritualSystem, 'up' | 'down' | 'stable'> = {
    numerologia: 'up',
    astrologia: 'up',
    orixas: 'stable',
    tarot: 'up',
    cabala: 'down',
    ifa: 'stable',
  };

  // Calculate angles for 6 systems (evenly spaced starting at 90°)
  const angles = useMemo(() => {
    return ALL_SYSTEMS.map((_, i) => 90 + i * 60);
  }, []);

  // Helper to get level with default
  function getLevelWithDefault(system: SpiritualSystem): number {
    return currentLevels[system] ?? defaultLevels[system];
  }

  // Build current levels array
  const currentLevelsArray = useMemo<SystemLevel[]>(() => {
    return ALL_SYSTEMS.map((system) => ({
      system,
      nivel: getLevelWithDefault(system),
      trend: showTrend ? defaultTrends[system] : undefined,
      lastUpdated: new Date(),
    }));
  }, [showTrend, currentLevels, defaultLevels, defaultTrends]);

  // Handle system selection
  const handleSystemClick = useCallback((system: SpiritualSystem) => {
    setSelectedSystem(prev => prev === system ? null : system);
  }, []);

  // Handle hover
  const handleHover = useCallback((system: SpiritualSystem | null) => {
    setHoveredSystem(system);
  }, []);

  // Calculate trend data
  const trendData = useMemo(() => {
    return ALL_SYSTEMS.map(system => {
      const current = getLevelWithDefault(system);
      const previous = previousLevels?.[system] ?? current - 10;
      const change = current - previous;
      return {
        system,
        current,
        previous,
        change,
        percentageChange: previous > 0 ? ((change === 0 ? 0 : (change / previous) * 100)) : 0,
      };
    });
  }, [currentLevels, previousLevels, defaultLevels, getLevelWithDefault]);


  return (
    <Card className={cn('card-spiritual overflow-hidden w-full', className)}>
      {/* Sacred corner decorations */}
      <SacredCornerSVG className="sacred-corner sacred-corner-tl text-violet-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-tr text-amber-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-bl text-purple-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-br text-violet-500 hidden md:block" />
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="8.5" x2="22" y2="15.5" />
              <line x1="22" y1="8.5" x2="2" y2="15.5" />
            </svg>
            Mapa Espiritual
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {userData.nome}
          </Badge>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mt-2">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="current" className="text-xs py-1">Atual</TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs py-1">Comparar</TabsTrigger>
            <TabsTrigger value="trend" className="text-xs py-1">Tendência</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* SVG Radar Chart */}
        <div className="relative w-full max-w-md mx-auto">
          <svg 
            viewBox={`0 0 ${svgSize} ${svgSize}`} 
            className="w-full aspect-square"
          >
            {/* Grid */}
            <RadarGrid
              centerX={centerX}
              centerY={centerY}
              radius={radius}
              levels={gridLevels}
              angles={angles}
            />

            {/* Fill */}
            <RadarFill
              centerX={centerX}
              centerY={centerY}
              radius={radius}
              angles={angles}
              levels={currentLevelsArray}
              previousLevels={previousLevels}
              showComparison={activeTab === 'comparison'}
            />

            {/* Points */}
            <RadarPoints
              centerX={centerX}
              centerY={centerY}
              radius={radius}
              angles={angles}
              levels={currentLevelsArray}
              hoveredSystem={hoveredSystem}
              onHover={handleHover}
              onClick={handleSystemClick}
            />

            {/* Labels */}
            <RadarLabels
              centerX={centerX}
              centerY={centerY}
              radius={radius}
              angles={angles}
              levels={currentLevelsArray}
              hoveredSystem={hoveredSystem}
              onHover={handleHover}
            />
          </svg>

          {/* Hovered System Tooltip (floating) */}
          {hoveredSystem && !selectedSystem && (
            <div className="absolute top-2 right-2 bg-slate-900/95 backdrop-blur-sm border border-violet-500/30 rounded-lg p-3 shadow-lg shadow-violet-500/20 max-w-[200px] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/50">
                <div 
                  className="w-5 h-5 rounded-full" 
                  style={{ 
                    backgroundColor: SYSTEM_COLORS[hoveredSystem].primary,
                    boxShadow: `0 0 8px ${SYSTEM_COLORS[hoveredSystem].primary}50`
                  }} 
                />
                <span className="font-semibold text-white text-sm">{SYSTEM_LABELS[hoveredSystem]}</span>
              </div>
              <SystemTooltip
                system={hoveredSystem}
                nivel={getLevelWithDefault(hoveredSystem)}
                trend={showTrend ? defaultTrends[hoveredSystem] : undefined}
                previousLevel={previousLevels?.[hoveredSystem]}
              />
            </div>
          )}
        </div>

        {/* Selected System Details */}
        {selectedSystem && (
          <div className={cn('p-4 rounded-lg border', SYSTEM_COLORS[selectedSystem].border, SYSTEM_COLORS[selectedSystem].bg)}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: SYSTEM_COLORS[selectedSystem].primary }}
                />
                {SYSTEM_LABELS[selectedSystem]}
              </h4>
              <button
                onClick={() => setSelectedSystem(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Fechar
              </button>
            </div>
            
            <SystemTooltip
              system={selectedSystem}
              nivel={getLevelWithDefault(selectedSystem)}
              trend={showTrend ? defaultTrends[selectedSystem] : undefined}
              previousLevel={previousLevels?.[selectedSystem]}
            />
          </div>
        )}

        {/* Legend */}
        <RadarLegend levels={currentLevelsArray} previousLevels={previousLevels} />

        {/* Trend View */}
        {activeTab === 'trend' && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-medium text-foreground">Mudanças Recentes</h4>
            <div className="grid grid-cols-2 gap-2">
              {trendData.map(({ system, change, percentageChange }) => (
                <div 
                  key={system}
                  className={cn('flex items-center justify-between p-2 rounded', SYSTEM_COLORS[system].bg)}
                >
                  <span className="text-xs text-muted-foreground">
                    {SYSTEM_LABELS[system]}
                  </span>
                  <span className={cn('text-xs font-medium', change >= 0 ? 'text-green-500' : 'text-red-500')}>
                    {change >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SpiritualRadarChart;
