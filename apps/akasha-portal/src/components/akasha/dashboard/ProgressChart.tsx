'use client';

/**
 * @akasha/portal — ProgressChart Component
 * 
 * Exibe progresso semanal e mensal do usuário.
 */

import { motion } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { useDashboardData } from './hooks/useDashboardData';

interface ProgressChartProps {
  userId: string;
}

function ProgressChartSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-5 w-40 bg-[#0B0E1C]/60 rounded animate-pulse" />
        {/* Skeleton bar: matches actual h-2.5 + border */}
        <div className="h-[14px] w-full bg-[#0B0E1C]/60 rounded-full animate-pulse" />
      </div>
      <div className="space-y-3">
        <div className="h-5 w-40 bg-[#0B0E1C]/60 rounded animate-pulse" />
        <div className="h-[14px] w-full bg-[#0B0E1C]/60 rounded-full animate-pulse" />
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Progresso Semanal */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white/80">
          Progresso Semanal
        </h3>
        <ProgressBar value={weeklyValue} max={7} />
      </div>

      {/* Progresso Mensal */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white/80">
          Progresso Mensal
        </h3>
        <ProgressBar value={monthlyValue} max={30} />
      </div>
    </motion.div>
  );
}
