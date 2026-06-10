'use client';

/**
 * @akasha/portal — ProgressChart Component
 * 
 * Exibe progresso semanal e mensal do usuário.
 */

import { ProgressBar } from './ProgressBar';
import { useDashboardData } from './hooks/useDashboardData';

interface ProgressChartProps {
  userId: string;
}

function ProgressChartSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-5 w-40 bg-akasha-bg-tertiary rounded" />
        <div className="h-8 w-full bg-akasha-bg-tertiary rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-40 bg-akasha-bg-tertiary rounded" />
        <div className="h-8 w-full bg-akasha-bg-tertiary rounded-full" />
      </div>
    </div>
  );
}

export function ProgressChart({ userId }: ProgressChartProps) {
  const { data, loading } = useDashboardData({ userId });

  if (loading) {
    return <ProgressChartSkeleton />;
  }

  if (!data) {
    return null;
  }

  const weeklyValue = data.stats.weeklyProgress.reduce((acc, val) => acc + val, 0);
  const monthlyValue = data.stats.monthlyProgress.reduce((acc, val) => acc + val, 0);

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Progresso Semanal */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-akasha-text-primary">
          Progresso Semanal
        </h3>
        <ProgressBar value={weeklyValue} max={7} />
      </div>

      {/* Progresso Mensal */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-akasha-text-primary">
          Progresso Mensal
        </h3>
        <ProgressBar value={monthlyValue} max={30} />
      </div>
    </div>
  );
}
