'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  getInsights,
  type SessionInsight,
  type SessionSummary,
} from '@/lib/analytics/session-insights';

// ============================================================
// TYPES
// ============================================================

interface SessionInsightsPanelProps {
  userId?: string;
}

// ============================================================
// COLORS & CONFIG
// ============================================================

const TYPE_CONFIG = {
  pattern: {
    badge: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
    icon: 'text-amber-400',
    label: 'Padrão',
  },
  recommendation: {
    badge: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
    icon: 'text-emerald-400',
    label: 'Recomendação',
  },
  anomaly: {
    badge: 'bg-rose-400/10 text-rose-400 border-rose-400/30',
    icon: 'text-rose-400',
    label: 'Anomalia',
  },
  trend: {
    badge: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
    icon: 'text-blue-400',
    label: 'Tendência',
  },
} as const;

const TYPE_ICONS = {
  pattern: TrendingUp,
  recommendation: Lightbulb,
  anomaly: AlertTriangle,
  trend: Sparkles,
} as const;

// ============================================================
// HELPERS
// ============================================================

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-emerald-400';
  if (confidence >= 0.5) return 'text-amber-400';
  return 'text-muted-foreground';
}

// ============================================================
// INSIGHT ITEM
// ============================================================

interface InsightItemProps {
  insight: SessionInsight;
  index: number;
}

function InsightItem({ insight, index }: InsightItemProps) {
  const config = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.pattern;
  const Icon = TYPE_ICONS[insight.type] ?? TrendingUp;

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-3 transition-colors',
        'bg-slate-800/20 border-slate-700/50 hover:border-slate-600/50',
        'animate-in fade-in slide-in-from-bottom-2'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          'bg-slate-800/60'
        )}
      >
        <Icon className={cn('h-5 w-5', config.icon)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
              config.badge
            )}
          >
            {config.label}
          </span>
          <span
            className={cn(
              'text-xs font-mono',
              getConfidenceColor(insight.confidence)
            )}
          >
            {Math.round(insight.confidence * 100)}%
          </span>
        </div>

        <h4 className="text-sm font-medium leading-tight text-slate-100 mb-1">
          {insight.title}
        </h4>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {insight.description}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY STATS
// ============================================================

interface SummaryStatsProps {
  summary: SessionSummary;
}

function SummaryStats({ summary }: SummaryStatsProps) {
  const stats = [
    {
      icon: BarChart3,
      label: 'Sessões',
      value: summary.totalSessions.toString(),
    },
    {
      icon: Clock,
      label: 'Duração Média',
      value: formatDuration(summary.averageDuration),
    },
    {
      icon: TrendingUp,
      label: 'Top Caminho',
      value: summary.topPaths[0] || 'N/A',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            'flex flex-col items-center gap-1.5 rounded-lg p-3 text-center',
            'bg-slate-800/30 border border-slate-700/50'
          )}
        >
          <stat.icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-semibold text-slate-100">
            {stat.value}
          </span>
          <span className="text-xs text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full',
          'bg-slate-800/40'
        )}
      >
        <Sparkles className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        Continue sua prática para gerar insights
      </p>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SessionInsightsPanel({
  userId,
}: SessionInsightsPanelProps) {
  const { summary, insights } = useMemo(() => {
    try {
      return getInsights(userId);
    } catch {
      return {
        summary: {
          totalSessions: 0,
          averageDuration: 0,
          topPaths: [],
          peakHours: [],
          frequentActions: [],
          patternsDetected: [],
        } as SessionSummary,
        insights: [] as SessionInsight[],
      };
    }
  }, [userId]);

  const displayInsights = insights.slice(0, 3);

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amber-400" />
          <CardTitle>Insights de Sessão</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {summary.totalSessions > 0 ? (
          <>
            <SummaryStats summary={summary} />

            {displayInsights.length > 0 ? (
              <div className="space-y-2">
                {displayInsights.map((insight, index) => (
                  <InsightItem
                    key={insight.id}
                    insight={insight}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}

export default SessionInsightsPanel;