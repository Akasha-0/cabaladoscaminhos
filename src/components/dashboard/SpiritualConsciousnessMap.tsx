// fallow-ignore-file unused-file
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { generateMinimaxResponse } from '@/lib/ai/minimax';
import type { ChatMessage } from '@/lib/ai/types';

// ============================================================
// TYPES
// ============================================================

export interface ConsciousnessLevel {
  id: string;
  name: string;
  color: string;
  description: string;
  progress: number; // 0-100
  recommendations?: string[];
  insights?: string[];
}

export interface UserSpiritualData {
  id: string;
  nome: string;
  dataNascimento: string;
  numeroPessoal?: number;
  odu?: string;
  orixaRegente?: string;
  sefirotDominante?: string[];
  sign?: string;
  rashi?: string;
}

export interface SpiritualConsciousnessMapProps {
  userData: UserSpiritualData;
  userId: string;
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const CONSCIOUSNESS_LEVELS = [
  { id: 'physical', name: 'Consciência Física', color: '#ef4444', description: 'Corpo e sensações físicas' },
  { id: 'emotional', name: 'Consciência Emocional', color: '#f97316', description: 'Sentimentos e emoções' },
  { id: 'mental', name: 'Consciência Mental', color: '#eab308', description: 'Pensamentos e cognição' },
  { id: 'spiritual', name: 'Consciência Espiritual', color: '#3b82f6', description: 'Intuição e conexão universal' },
  { id: 'transcendental', name: 'Consciência Transcendental', color: '#8b5cf6', description: 'União com o divino' },
] as const;

const LEVEL_CONNECTIONS: [string, string][] = [
  ['physical', 'emotional'],
  ['emotional', 'mental'],
  ['mental', 'spiritual'],
  ['spiritual', 'transcendental'],
  ['physical', 'mental'],
  ['emotional', 'spiritual'],
  ['mental', 'transcendental'],
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getLevelProgress(levelId: string, userData: UserSpiritualData): number {
  // Calculate progress based on user's spiritual data
  const baseProgress: Record<string, number> = {
    physical: 60,
    emotional: 55,
    mental: 50,
    spiritual: 40,
    transcendental: 25,
  };

  // Adjust based on available user data
  if (userData.numeroPessoal) {
    const num = userData.numeroPessoal;
    baseProgress.physical = Math.min(90, baseProgress.physical + (num % 20));
    baseProgress.mental = Math.min(85, baseProgress.mental + ((num * 7) % 25));
    baseProgress.spiritual = Math.min(80, baseProgress.spiritual + ((num * 3) % 20));
  }

  // Adjust based on orixa
  if (userData.orixaRegente) {
    baseProgress.emotional = Math.min(85, baseProgress.emotional + 10);
    baseProgress.spiritual = Math.min(75, baseProgress.spiritual + 5);
  }

  // Adjust based on sign
  if (userData.sign) {
    baseProgress.transcendental = Math.min(70, baseProgress.transcendental + 15);
  }

  return baseProgress[levelId] || 30;
}

function getRecommendations(levelId: string): string[] {
  const recommendations: Record<string, string[]> = {
    physical: [
      'Pratique meditação corporal',
      'Respire profundamente diariamente',
      'Conecte-se com a natureza',
    ],
    emotional: [
      'Explore journaling emocional',
      'Pratique gratitude diariamente',
      'Permita-se sentir sem julgamento',
    ],
    mental: [
      'Estude filosofia espiritual',
      'Pratique mindfulness',
      'Explore novos conceitos',
    ],
    spiritual: [
      'Medite com intenção',
      'Conecte-se com sua intuição',
      'Explore práticas contemplativas',
    ],
    transcendental: [
      'Busque união interior',
      'Pratique devoção consciente',
      'Explore estados expandidos',
    ],
  };
  return recommendations[levelId] || [];
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface HexagonNodeProps {
  x: number;
  y: number;
  size: number;
  level: typeof CONSCIOUSNESS_LEVELS[number];
  progress: number;
  isHovered: boolean;
  onHover: (levelId: string | null) => void;
  onClick: (levelId: string) => void;
}

function HexagonNode({ x, y, size, level, progress, isHovered, onHover, onClick }: HexagonNodeProps) {
  const sides = 6;
  const angleStep = (2 * Math.PI) / sides;
  const startAngle = -Math.PI / 2;

  const points = Array.from({ length: sides }, (_, i) => {
    const angle = startAngle + i * angleStep;
    const adjustedSize = size * (0.5 + progress / 200);
    return `${x + adjustedSize * Math.cos(angle)},${y + adjustedSize * Math.sin(angle)}`;
  }).join(' ');

  return (
    <g>
      {/* Glow effect */}
      <polygon
        points={points}
        fill={level.color}
        fillOpacity={isHovered ? 0.4 : 0.2}
        stroke={level.color}
        strokeWidth={isHovered ? 3 : 1.5}
        style={{
          filter: isHovered ? `drop-shadow(0 0 12px ${level.color})` : 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={() => onHover(level.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onClick(level.id)}
      />

      {/* Progress arc */}
      <circle
        cx={x}
        cy={y}
        r={size * 0.3}
        fill="none"
        stroke={level.color}
        strokeWidth={3}
        strokeDasharray={`${progress * 1.884} 100`}
        strokeLinecap="round"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: `${x}px ${y}px`,
          transition: 'stroke-dasharray 0.5s ease',
        }}
      />

      {/* Center circle with progress */}
      <circle
        cx={x}
        cy={y}
        r={size * 0.25}
        fill={level.color}
        fillOpacity={0.8}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill="white"
        fontSize={size * 0.2}
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {progress}%
      </text>
    </g>
  );
}

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  progress1: number;
  progress2: number;
}

function ConnectionLine({ x1, y1, x2, y2, color, progress1, progress2 }: ConnectionLineProps) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Add slight curve
  const dx = x2 - x1;
  const dy = y2 - y1;
  const curveOffset = Math.sqrt(dx * dx + dy * dy) * 0.1;

  const avgProgress = (progress1 + progress2) / 2;
  const opacity = 0.2 + (avgProgress / 100) * 0.4;

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={2}
        strokeOpacity={opacity}
        strokeDasharray="4 4"
        style={{
          transition: 'stroke-opacity 0.3s ease',
        }}
      />
      <circle
        cx={midX}
        cy={midY}
        r={4}
        fill={color}
        fillOpacity={opacity * 0.8}
      />
    </g>
  );
}

interface LevelTooltipProps {
  level: typeof CONSCIOUSNESS_LEVELS[number];
  progress: number;
  recommendations: string[];
  position: { x: number; y: number };
}

function LevelTooltip({ level, progress, recommendations, position }: LevelTooltipProps) {
  return (
    <div
      className="absolute z-50 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-xl min-w-[280px]"
      style={{
        left: position.x + 20,
        top: position.y - 10,
        transform: 'translateY(-50%)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: level.color }}
        />
        <h3 className="font-semibold text-white">{level.name}</h3>
      </div>
      <p className="text-sm text-slate-300 mb-3">{level.description}</p>
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: level.color }}
          />
        </div>
      </div>
      {recommendations.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-1">Recomendações:</p>
          <ul className="text-xs text-slate-300 space-y-1">
            {recommendations.slice(0, 2).map((rec, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-blue-400">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface InsightPanelProps {
  insight: string | null;
  isLoading: boolean;
  onGenerate: () => void;
}

function InsightPanel({ insight, isLoading, onGenerate }: InsightPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-300">Insights IA</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerate}
          disabled={isLoading}
          className="h-7 text-xs"
        >
          {isLoading ? 'Gerando...' : 'Gerar Insight'}
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : insight ? (
        <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
      ) : (
        <p className="text-xs text-slate-500 italic">
          Clique em &ldquo;Gerar Insight&rdquo; para receber orientações personalizadas sobre sua jornada de consciência.
        </p>
      )}
    </div>
  );
}

interface ProgressBarProps {
  level: typeof CONSCIOUSNESS_LEVELS[number];
  progress: number;
  onClick: () => void;
  isActive: boolean;
}

function ProgressBar({ level, progress, onClick, isActive }: ProgressBarProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-all duration-200',
        isActive ? 'bg-slate-800/80 ring-1 ring-slate-600' : 'hover:bg-slate-800/40'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: level.color }}
          />
          <span className="text-sm font-medium text-slate-200">{level.name}</span>
        </div>
        <span className="text-sm text-slate-400">{progress}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: level.color }}
        />
      </div>
    </button>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualConsciousnessMap({
  userData,
  userId,
  className = '',
}: SpiritualConsciousnessMapProps) {
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 400, height: 400 });

  // Calculate levels with progress
  const levelsWithProgress = useMemo(() => {
    return CONSCIOUSNESS_LEVELS.map((level) => ({
      ...level,
      progress: getLevelProgress(level.id, userData),
      recommendations: getRecommendations(level.id),
    }));
  }, [userData]);

  // Calculate node positions (radial layout)
  const nodePositions = useMemo(() => {
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    const baseRadius = Math.min(centerX, centerY) * 0.7;

    return CONSCIOUSNESS_LEVELS.map((level, index) => {
      const angle = (2 * Math.PI * index) / CONSCIOUSNESS_LEVELS.length - Math.PI / 2;
      return {
        level,
        x: centerX + baseRadius * Math.cos(angle),
        y: centerY + baseRadius * Math.sin(angle),
      };
    });
  }, [containerSize]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById(`consciousness-map-${userId}`);
      if (container) {
        setContainerSize({
          width: container.clientWidth,
          height: Math.min(container.clientWidth, 500),
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userId]);

  // Handle hover
  const handleHover = useCallback((levelId: string | null) => {
    setHoveredLevel(levelId);
    if (levelId) {
      const levelData = nodePositions.find((n) => n.level.id === levelId);
      if (levelData) {
        setTooltipPosition({ x: levelData.x, y: levelData.y });
      }
    }
  }, [nodePositions]);

  // Handle click
  const handleClick = useCallback((levelId: string) => {
    setSelectedLevel(levelId === selectedLevel ? null : levelId);
  }, [selectedLevel]);

  // Generate AI insight
  const generateInsight = useCallback(async () => {
    setIsLoadingInsight(true);
    try {
      const userName = userData.nome || 'Usuário';
      const orixa = userData.orixaRegente || 'Oxalá';
      const sign = userData.sign || 'Não definido';

      const prompt = `Como guia espiritual da Cabala dos Caminhos, analise a jornada de consciência de ${userName} (Regente: ${orixa}, Signo: ${sign}) e forneça um insight profundo sobre como eles podem expandir sua consciência espiritual. Considere os níveis de consciência: Física, Emocional, Mental, Espiritual e Transcendental. Forneça orientação prática e mystical em português.`;

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'Você é um guia espiritual sábio da Tradição da Cabala dos Caminhos, que integra elementos do Candomblé, Tarot, Astrologia, Numerologia e outras tradições espirituais. Forneça insights em português, de forma mystical yet practical, sempre com empatia e profundidade.',
        },
        { role: 'user', content: prompt },
      ];

      const response = await generateMinimaxResponse(messages, {
        temperature: 0.8,
        max_tokens: 800,
      });

      setInsight(response.content);
    } catch (error) {
      console.error('Error generating insight:', error);
      setInsight('Não foi possível gerar o insight neste momento. Tente novamente mais tarde.');
    } finally {
      setIsLoadingInsight(false);
    }
  }, [userData]);

  // Find hovered level data
  const hoveredLevelData = useMemo(() => {
    if (!hoveredLevel) return null;
    return levelsWithProgress.find((l) => l.id === hoveredLevel);
  }, [hoveredLevel, levelsWithProgress]);

  return (
    <Card className={cn('bg-slate-900/50 border-slate-800', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">🧘</span>
            Mapa de Consciência Espiritual
          </CardTitle>
          <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
            {userData.nome || 'Jornada Espiritual'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Radial visualization */}
        <div
          id={`consciousness-map-${userId}`}
          className="relative w-full"
          style={{ height: Math.min(containerSize.width, 500) }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
            className="overflow-visible"
          >
            {/* Connection lines */}
// fallow-ignore-next-line complexity
            {LEVEL_CONNECTIONS.map(([id1, id2], index) => {
              const node1 = nodePositions.find((n) => n.level.id === id1);
              const node2 = nodePositions.find((n) => n.level.id === id2);
              if (!node1 || !node2) return null;

              const level1 = levelsWithProgress.find((l) => l.id === id1);
              const level2 = levelsWithProgress.find((l) => l.id === id2);

              return (
                <ConnectionLine
                  key={`connection-${index}`}
                  x1={node1.x}
                  y1={node1.y}
                  x2={node2.x}
                  y2={node2.y}
                  color={level1?.color || '#666'}
                  progress1={level1?.progress || 0}
                  progress2={level2?.progress || 0}
                />
              );
            })}

            {/* Hexagon nodes */}
            {nodePositions.map((node) => {
              const levelData = levelsWithProgress.find((l) => l.id === node.level.id);
              return (
                <HexagonNode
                  key={node.level.id}
                  x={node.x}
                  y={node.y}
                  size={35}
                  level={node.level}
                  progress={levelData?.progress || 0}
                  isHovered={hoveredLevel === node.level.id}
                  onHover={handleHover}
                  onClick={handleClick}
                />
              );
            })}

            {/* Level labels */}
            {nodePositions.map((node) => {
              const levelData = levelsWithProgress.find((l) => l.id === node.level.id);
              const labelRadius = Math.min(containerSize.width, containerSize.height) * 0.85;
              const angle = Math.atan2(node.y - containerSize.height / 2, node.x - containerSize.width / 2);
              const labelX = containerSize.width / 2 + labelRadius * Math.cos(angle);
              const labelY = containerSize.height / 2 + labelRadius * Math.sin(angle);

              return (
                <text
                  key={`label-${node.level.id}`}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={node.level.color}
                  fontSize={10}
                  fontWeight="500"
                  style={{
                    opacity: hoveredLevel && hoveredLevel !== node.level.id ? 0.4 : 1,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  {node.level.name.replace('Consciência ', '')}
                </text>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredLevel && hoveredLevelData && (
            <LevelTooltip
              level={hoveredLevelData}
              progress={hoveredLevelData.progress}
              recommendations={hoveredLevelData.recommendations || []}
              position={tooltipPosition}
            />
          )}

          {/* Center info */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
            style={{ maxWidth: '120px' }}
          >
            <p className="text-xs text-slate-400">Progresso</p>
            <p className="text-lg font-bold text-white">
              {Math.round(levelsWithProgress.reduce((acc, l) => acc + l.progress, 0) / levelsWithProgress.length)}%
            </p>
          </div>
        </div>

        {/* Progress bars */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {levelsWithProgress.map((level) => (
            <ProgressBar
              key={level.id}
              level={level}
              progress={level.progress}
              onClick={() => handleClick(level.id)}
              isActive={selectedLevel === level.id}
            />
          ))}
        </div>

        {/* Selected level details */}
        {selectedLevel && (
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            {(() => {
              const selected = levelsWithProgress.find((l) => l.id === selectedLevel);
              if (!selected) return null;
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selected.color }}
                    />
                    <h4 className="font-medium text-white">{selected.name}</h4>
                  </div>
                  <p className="text-sm text-slate-300">{selected.description}</p>
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Recomendações para avanço:</p>
                    <ul className="space-y-1">
                      {selected.recommendations?.map((rec, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-blue-400 mt-1">◆</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* AI Insight Panel */}
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <InsightPanel
            insight={insight}
            isLoading={isLoadingInsight}
            onGenerate={generateInsight}
          />
        </div>

        {/* Growth opportunities */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Oportunidades de Crescimento</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {levelsWithProgress
              .filter((l) => l.progress < 50)
              .slice(0, 2)
              .map((level) => (
                <div
                  key={level.id}
                  className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: level.color }}
                    />
                    <span className="text-sm text-slate-200">{level.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    +{Math.round((50 - level.progress) / 10)} insights para explorar
                  </p>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SpiritualConsciousnessMap;