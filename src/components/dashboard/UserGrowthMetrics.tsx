'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Star,
  Heart,
  Flame,
  Moon,
  Sun,
  Compass,
  Eye,
  Globe,
  Zap,
  Award,
  Target,
  Activity,
} from 'lucide-react';

// Types
interface ActivityMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface LearningProgress {
  category: string;
  progress: number;
  completed: number;
  total: number;
  color: string;
}

interface EngagementData {
  day: string;
  rituals: number;
  meditations: number;
  readings: number;
}

interface GrowthSnapshot {
  month: string;
  users: number;
  retention: number;
  engagement: number;
}

// Sample data
const ACTIVITY_METRICS: ActivityMetric[] = [
  {
    name: 'Rituais Completados',
    value: 847,
    change: 12.5,
    trend: 'up',
    icon: <Flame className="size-5 text-orange-400" />,
  },
  {
    name: 'Meditações',
    value: 2341,
    change: 8.3,
    trend: 'up',
    icon: <Moon className="size-5 text-purple-400" />,
  },
  {
    name: 'Leituras Espirituais',
    value: 562,
    change: -2.1,
    trend: 'down',
    icon: <BookOpen className="size-5 text-blue-400" />,
  },
  {
    name: 'Conectados Agora',
    value: 89,
    change: 0,
    trend: 'stable',
    icon: <Users className="size-5 text-green-400" />,
  },
];

const LEARNING_PROGRESS: LearningProgress[] = [
  {
    category: 'Numerologia',
    progress: 78,
    completed: 47,
    total: 60,
    color: '#f59e0b',
  },
  {
    category: 'Astrologia',
    progress: 55,
    completed: 33,
    total: 60,
    color: '#8b5cf6',
  },
  {
    category: 'Tarô',
    progress: 92,
    completed: 55,
    total: 60,
    color: '#ec4899',
  },
  {
    category: 'Candomblé',
    progress: 35,
    completed: 21,
    total: 60,
    color: '#10b981',
  },
  {
    category: 'Cabala',
    progress: 62,
    completed: 37,
    total: 60,
    color: '#3b82f6',
  },
];

const WEEKLY_ENGAGEMENT: EngagementData[] = [
  { day: 'Seg', rituals: 45, meditations: 78, readings: 23 },
  { day: 'Ter', rituals: 52, meditations: 85, readings: 31 },
  { day: 'Qua', rituals: 48, meditations: 72, readings: 28 },
  { day: 'Qui', rituals: 61, meditations: 91, readings: 35 },
  { day: 'Sex', rituals: 55, meditations: 88, readings: 42 },
  { day: 'Sáb', rituals: 78, meditations: 102, readings: 51 },
  { day: 'Dom', rituals: 82, meditations: 115, readings: 48 },
];

const MONTHLY_GROWTH: GrowthSnapshot[] = [
  { month: 'Jan', users: 1200, retention: 68, engagement: 42 },
  { month: 'Fev', users: 1450, retention: 71, engagement: 48 },
  { month: 'Mar', users: 1680, retention: 73, engagement: 52 },
  { month: 'Abr', users: 1920, retention: 75, engagement: 58 },
  { month: 'Mai', users: 2100, retention: 77, engagement: 61 },
  { month: 'Jun', users: 2340, retention: 79, engagement: 65 },
];

// Chart components
function BarChart({ data, height = 120 }: { data: EngagementData[]; height?: number }) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.rituals, d.meditations, d.readings)));

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full items-end justify-center gap-0.5" style={{ height: height - 24 }}>
            <div
              className="w-3 rounded-t-sm bg-orange-400/80 transition-all hover:bg-orange-400"
              style={{ height: `${(item.rituals / maxValue) * 100}%` }}
              title={`Rituais: ${item.rituals}`}
            />
            <div
              className="w-3 rounded-t-sm bg-purple-400/80 transition-all hover:bg-purple-400"
              style={{ height: `${(item.meditations / maxValue) * 100}%` }}
              title={`Meditações: ${item.meditations}`}
            />
            <div
              className="w-3 rounded-t-sm bg-blue-400/80 transition-all hover:bg-blue-400"
              style={{ height: `${(item.readings / maxValue) * 100}%` }}
              title={`Leituras: ${item.readings}`}
            />
          </div>
          <span className="text-xs text-muted-foreground">{item.day}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, height = 140 }: { data: GrowthSnapshot[]; height?: number }) {
  const maxUsers = Math.max(...data.map((d) => d.users));
  const padding = 20;
  const chartWidth = 100;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - (d.users / maxUsers) * chartHeight + padding;
    return { x, y, data: d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight + padding} L ${points[0].x} ${chartHeight + padding} Z`;

  return (
    <div className="relative" style={{ height }}>
      <svg className="w-full" viewBox={`0 0 ${chartWidth} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineGradient)" />
        <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill="#8b5cf6"
            className="hover:r-3 transition-all"
          />
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
        {data.map((d, i) => (
          <span key={i} className="text-xs text-muted-foreground">{d.month}</span>
        ))}
      </div>
    </div>
  );
}

function MiniSparkline({ data, color = '#8b5cf6' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Metric card component
function MetricCard({ metric }: { metric: ActivityMetric }) {
  const trendColor = metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-muted-foreground';
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Activity;

  return (
    <div className="rounded-lg border bg-card p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {metric.icon}
            <span className="text-sm text-muted-foreground">{metric.name}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{metric.value.toLocaleString()}</span>
            {metric.change !== 0 && (
              <span className={cn('flex items-center gap-0.5 text-sm font-medium', trendColor)}>
                <TrendIcon className="size-3" />
                {Math.abs(metric.change)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress bar component
function ProgressBar({ item }: { item: LearningProgress }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{item.category}</span>
        <span className="text-sm text-muted-foreground">
          {item.completed}/{item.total} ({item.progress}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${item.progress}%`, backgroundColor: item.color }}
        />
      </div>
    </div>
  );
}

// Main component
export interface UserGrowthMetricsProps {
  className?: string;
  loading?: boolean;
}

export function UserGrowthMetrics({ className = '', loading = false }: UserGrowthMetricsProps) {
  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20">
          <TrendingUp className="size-5 text-purple-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Métricas de Crescimento</h2>
          <p className="text-sm text-muted-foreground">Acompanhe sua jornada espiritual</p>
        </div>
      </div>

      {/* Activity Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIVITY_METRICS.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Engagement Chart */}
        <div className="rounded-lg border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-purple-500" />
              <h3 className="font-medium">Engajamento Semanal</h3>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-orange-400" /> Rituais
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-purple-400" /> Meditações
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-blue-400" /> Leituras
              </span>
            </div>
          </div>
          <BarChart data={WEEKLY_ENGAGEMENT} />
        </div>

        {/* Monthly Growth Chart */}
        <div className="rounded-lg border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-green-500" />
              <h3 className="font-medium">Crescimento de Usuários</h3>
            </div>
            <span className="text-sm text-muted-foreground">
              +{((MONTHLY_GROWTH[MONTHLY_GROWTH.length - 1].users / MONTHLY_GROWTH[0].users - 1) * 100).toFixed(0)}% este ano
            </span>
          </div>
          <LineChart data={MONTHLY_GROWTH} />
        </div>
      </div>

      {/* Learning Progress */}
      <div className="rounded-lg border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="size-4 text-amber-500" />
          <h3 className="font-medium">Progresso de Aprendizado</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_PROGRESS.map((item, index) => (
            <ProgressBar key={index} item={item} />
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-4 text-center">
          <Award className="mx-auto size-6 text-amber-500" />
          <p className="mt-2 text-2xl font-bold">95%</p>
          <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 text-center">
          <Heart className="mx-auto size-6 text-green-500" />
          <p className="mt-2 text-2xl font-bold">4.8</p>
          <p className="text-sm text-muted-foreground">Satisfação Média</p>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 text-center">
          <Target className="mx-auto size-6 text-blue-500" />
          <p className="mt-2 text-2xl font-bold">78%</p>
          <p className="text-sm text-muted-foreground">Metas Atingidas</p>
        </div>
        <div className="rounded-lg border bg-gradient-to-br from-purple-500/10 to-violet-500/10 p-4 text-center">
          <Star className="mx-auto size-6 text-purple-500" />
          <p className="mt-2 text-2xl font-bold">12.4k</p>
          <p className="text-sm text-muted-foreground">Pontos deXP</p>
        </div>
      </div>

      {/* Trend Indicators */}
      <div className="rounded-lg border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="size-4 text-cyan-500" />
          <h3 className="font-medium">Tendências de Crescimento</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Atividade Espiritual', data: [30, 45, 42, 55, 58, 72, 85], color: '#f97316' },
            { label: 'Engajamento Diário', data: [20, 35, 40, 45, 52, 60, 78], color: '#8b5cf6' },
            { label: 'Consciência Interior', data: [40, 50, 55, 60, 68, 75, 82], color: '#10b981' },
          ].map((trend, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="w-36 text-sm text-muted-foreground">{trend.label}</span>
              <div className="flex-1">
                <MiniSparkline data={trend.data} color={trend.color} />
              </div>
              <span className="w-12 text-right text-sm font-medium text-green-500">
                +{((trend.data[trend.data.length - 1] - trend.data[0]) / trend.data[0] * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserGrowthMetrics;