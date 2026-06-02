'use client';

import {
  Sparkles,
  Compass,
  Zap,
  Link2,
  Brain,
  ChevronRight,
  TrendingUp,
  Eye,
  Settings,
} from 'lucide-react';
import React, { useState, useMemo, useCallback } from 'react';
import type { UserSpiritualData } from '@/lib/ai/types';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

export interface SpiritualExplorationToolsProps {
  userData: UserSpiritualData;
  userId: string;
  className?: string;
  onToolSelect?: (tool: string) => void;
}

interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

interface ToolProgress {
  toolId: string;
  progress: number;
  lastUsed: Date;
  affinityScore: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const TOOLS: Tool[] = [
  {
    id: 'symbol-decoder',
    name: 'Decodificador de Símbolos',
    icon: '🔮',
    description: 'Decode spiritual symbols and their meanings',
    color: 'purple',
  },
  {
    id: 'energy-calculator',
    name: 'Calculadora de Energia',
    icon: '⚡',
    description: 'Calculate energy levels for spiritual practices',
    color: 'yellow',
  },
  {
    id: 'system-explorer',
    name: 'Explorador de Sistemas',
    icon: '🧭',
    description: 'Explore connections between spiritual systems',
    color: 'blue',
  },
  {
    id: 'correlation-tester',
    name: 'Testador de Correlações',
    icon: '🔗',
    description: 'Test correlations between spiritual concepts',
    color: 'emerald',
  },
];

const TOOL_COLORS: Record<
  string,
  { bg: string; border: string; text: string; accent: string; icon: string }
> = {
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    accent: 'from-purple-500/30 to-purple-600/30',
    icon: 'group-hover:text-purple-400',
  },
  yellow: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    accent: 'from-yellow-500/30 to-yellow-600/30',
    icon: 'group-hover:text-yellow-400',
  },
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    accent: 'from-blue-500/30 to-blue-600/30',
    icon: 'group-hover:text-blue-400',
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    accent: 'from-emerald-500/30 to-emerald-600/30',
    icon: 'group-hover:text-emerald-400',
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateToolAffinity(userData: UserSpiritualData, toolId: string): number {
  switch (toolId) {
    case 'symbol-decoder':
      return Math.min(40 + userData.arcoMaior.length * 5 + (userData.numeroPessoal % 20), 95);
    case 'energy-calculator':
      return Math.min(35 + userData.numeroPessoal * 4 + userData.arcoPessoal * 3, 90);
    case 'system-explorer':
      return Math.min(45 + userData.sefirotDominante.length * 4 + (userData.odu ? 10 : 0), 95);
    case 'correlation-tester':
      return Math.min(30 + userData.numeroPessoal * 3 + (userData.orixaRegente ? 15 : 0), 90);
    default:
      return 50;
  }
}

function getStorageKey(userId: string): string {
  return `spiritual-exploration-progress-${userId}`;
}

function loadProgress(userId: string): Record<string, ToolProgress> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert lastUsed strings back to Date objects
      Object.values(parsed).forEach((progress: unknown) => {
        const p = progress as { lastUsed: string };
        if (typeof p.lastUsed === 'string') {
          p.lastUsed = new Date(p.lastUsed).toISOString();
        }
      });
      return parsed;
    }
  } catch {
    // Ignore localStorage errors
  }
  return {};
}

function saveProgress(userId: string, progress: Record<string, ToolProgress>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(progress));
  } catch {
    // Ignore localStorage errors
  }
}

function getToolTips(toolId: string): string[] {
  const tips: Record<string, string[]> = {
    'symbol-decoder': [
      'Try entering major arcana numbers (0-21)',
      'Combine with your personal number for insights',
      'Each symbol reveals multiple layers of meaning',
    ],
    'energy-calculator': [
      'Best used during new moon for grounding',
      'Align with your orixa for maximum effect',
      'Track changes over multiple days',
    ],
    'system-explorer': [
      'Start with Kabbalah connections',
      'Explore Ifá/ Yoruba traditions',
      'Cross-reference with your birth chart',
    ],
    'correlation-tester': [
      'Test between numerology and astrology',
      'Verify tarot-astrology links',
      'Explore element correlations',
    ],
  };
  return tips[toolId] || [];
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface ToolCardProps {
  tool: Tool;
  progress: ToolProgress | undefined;
  affinity: number;
  isSelected: boolean;
  onSelect: () => void;
}

function ToolCard({ tool, progress, affinity, isSelected, onSelect }: ToolCardProps) {
  const colors = TOOL_COLORS[tool.color] || TOOL_COLORS.purple;
  const progressPercent = progress?.progress ?? 0;
  const lastUsed = progress?.lastUsed
    ? new Date(progress.lastUsed).toLocaleDateString('pt-BR')
    : 'Nunca usado';

  return (
    <button
      onClick={onSelect}
      className={cn(
        'group relative w-full p-5 rounded-xl border transition-all duration-300 text-left',
        'bg-slate-800/40 hover:bg-slate-800/60',
        isSelected
          ? cn(
              'border-2 ring-2 ring-offset-2 ring-offset-slate-900',
              colors.border,
              'ring-opacity-50'
            )
          : 'border-slate-700/50 hover:border-slate-600/60',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
        isSelected ? colors.text.replace('text-', 'ring-') : 'focus:ring-purple-500/50'
      )}
      style={
        isSelected
          ? ({ '--tw-ring-color': `var(--${tool.color}-500)` } as React.CSSProperties)
          : undefined
      }
    >
      {/* Gradient background for selected state */}
      {isSelected && (
        <div
          className={cn('absolute inset-0 rounded-xl bg-gradient-to-br opacity-20', colors.accent)}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2.5 rounded-lg bg-gradient-to-br',
                colors.bg,
                isSelected ? colors.accent : ''
              )}
            >
              <span className="text-2xl">{tool.icon}</span>
            </div>
            <div>
              <h3
                className={cn(
                  'font-semibold text-base transition-colors',
                  isSelected ? colors.text : 'text-slate-200'
                )}
              >
                {tool.name}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">{tool.description}</p>
            </div>
          </div>
          <ChevronRight
            className={cn(
              'w-5 h-5 text-slate-500 transition-all duration-300',
              isSelected ? cn(colors.text, 'translate-x-1') : 'group-hover:translate-x-0.5'
            )}
          />
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Progresso</span>
            <span className="text-xs font-medium text-slate-300">{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', colors.bg)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
          <div className="flex items-center gap-1.5">
            <Sparkles className={cn('w-3.5 h-3.5', colors.text)} />
            <span className="text-xs text-slate-400">Afinidade</span>
            <span className={cn('text-xs font-semibold', colors.text)}>{affinity}%</span>
          </div>
          <span className="text-xs text-slate-500">{lastUsed}</span>
        </div>
      </div>
    </button>
  );
}

interface ToolDetailPanelProps {
  tool: Tool;
  progress: ToolProgress | undefined;
  affinity: number;
  onClose: () => void;
}

function ToolDetailPanel({ tool, progress, onClose }: ToolDetailPanelProps) {
  const colors = TOOL_COLORS[tool.color] || TOOL_COLORS.purple;
  const tips = getToolTips(tool.id);
  const progressPercent = progress?.progress ?? 0;

  return (
    <div
      className={cn(
        'p-5 rounded-xl border border-slate-700/50 bg-slate-800/30',
        'animate-in fade-in slide-in-from-bottom-4 duration-300'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-gradient-to-br', colors.bg)}>
            <span className="text-xl">{tool.icon}</span>
          </div>
          <div>
            <h3 className={cn('font-semibold text-lg', colors.text)}>{tool.name}</h3>
            <p className="text-slate-400 text-sm">Ferramenta Interativa</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
          aria-label="Fechar painel"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50">
            <TrendingUp className={cn('w-5 h-5', colors.text)} />
            <div className="flex-1">
              <p className="text-xs text-slate-400">Progresso Total</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', colors.bg)}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-300">{progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className={cn('w-4 h-4', colors.text)} />
            <h4 className="text-sm font-medium text-slate-200">Dicas de Uso</h4>
          </div>
          <div className="space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Eye className={cn('w-4 h-4 mt-0.5 flex-shrink-0', colors.text)} />
                <span className="text-slate-400">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProgressStatsProps {
  userData: UserSpiritualData;
  progress: Record<string, ToolProgress>;
}

function ProgressStats({ userData, progress }: ProgressStatsProps) {
  const totalProgress = useMemo(() => {
    const values = Object.values(progress);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, p) => sum + p.progress, 0) / values.length);
  }, [progress]);

  const activeTools = Object.keys(progress).length;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-400">Progresso Geral</span>
        </div>
        <p className="text-xl font-bold text-white">{totalProgress}%</p>
      </div>
      <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-slate-400">Ferramentas</span>
        </div>
        <p className="text-xl font-bold text-white">{activeTools}/4</p>
      </div>
      <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-slate-400">Número</span>
        </div>
        <p className="text-xl font-bold text-white">{userData.numeroPessoal}</p>
      </div>
    </div>
  );
}

interface SkeletonProps {
  count?: number;
}

function ToolSkeleton({ count = 4 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse p-5 rounded-xl bg-slate-800/40 border border-slate-700/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-slate-700/50" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-700/50 rounded mb-2" />
              <div className="h-3 w-48 bg-slate-700/30 rounded" />
            </div>
          </div>
          <div className="h-1.5 bg-slate-700/50 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualExplorationTools({
  userData,
  userId,
  className = '',
  onToolSelect,
}: SpiritualExplorationToolsProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, ToolProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load progress on mount
  React.useEffect(() => {
    try {
      const loadedProgress = loadProgress(userId);
      setProgress(loadedProgress);
    } catch {
      // Error loading progress, use default empty state
    }
    setIsLoading(false);
  }, [userId]);

  // Calculate affinities
  const toolAffinities = useMemo(() => {
    return TOOLS.reduce(
      (acc, tool) => {
        acc[tool.id] = calculateToolAffinity(userData, tool.id);
        return acc;
      },
      {} as Record<string, number>
    );
  }, [userData]);

  // Handle tool selection
  const handleToolSelect = useCallback(
    (toolId: string) => {
      setSelectedTool((prev) => (prev === toolId ? null : toolId));
      onToolSelect?.(toolId);

      // Update progress on selection
      const currentProgress = progress[toolId]?.progress ?? 0;
      if (currentProgress === 0) {
        const updatedProgress: Record<string, ToolProgress> = {
          ...progress,
          [toolId]: {
            toolId,
            progress: Math.min(currentProgress + 5, 100),
            lastUsed: new Date(),
            affinityScore: toolAffinities[toolId],
          },
        };
        setProgress(updatedProgress);
        saveProgress(userId, updatedProgress);
      }
    },
    [progress, toolAffinities, userId, onToolSelect]
  );

  // Handle panel close and save progress
  const handleClosePanel = useCallback(() => {
    if (selectedTool) {
      const currentProgress = progress[selectedTool]?.progress ?? 0;
      const updatedProgress: Record<string, ToolProgress> = {
        ...progress,
        [selectedTool]: {
          toolId: selectedTool,
          progress: Math.min(currentProgress + 10, 100),
          lastUsed: new Date(),
          affinityScore: toolAffinities[selectedTool],
        },
      };
      setProgress(updatedProgress);
      saveProgress(userId, updatedProgress);
    }
    setSelectedTool(null);
  }, [selectedTool, progress, toolAffinities, userId]);

  const selectedToolData = TOOLS.find((t) => t.id === selectedTool);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Ferramentas de Exploração Espiritual
            </h2>
            <p className="text-sm text-slate-400">Carregando...</p>
          </div>
        </div>
        <ToolSkeleton />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Ferramentas de Exploração Espiritual
            </h2>
            <p className="text-sm text-slate-400">Descubra e explore sistemas espirituais</p>
          </div>
        </div>
      </div>

      {/* Stats overview */}
      <ProgressStats userData={userData} progress={progress} />

      {/* Tool grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            progress={progress[tool.id]}
            affinity={toolAffinities[tool.id]}
            isSelected={selectedTool === tool.id}
            onSelect={() => handleToolSelect(tool.id)}
          />
        ))}
      </div>

      {/* Detail panel for selected tool */}
      {selectedToolData && (
        <ToolDetailPanel
          tool={selectedToolData}
          progress={progress[selectedTool!]}
          affinity={toolAffinities[selectedTool!]}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}

export default SpiritualExplorationTools;
