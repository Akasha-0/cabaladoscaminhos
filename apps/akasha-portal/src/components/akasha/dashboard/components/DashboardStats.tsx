'use client';

import { motion } from 'framer-motion';
import { Sparkles, Flame, Trophy, BarChart3 } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatsCard } from './StatsCard';

interface DashboardStatsProps {
  userId: string;
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const { data, loading } = useDashboardData({ userId });

  // Skeleton loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-[#0B0E1C]/60" />
        ))}
      </div>
    );
  }

  // Empty state
  if (!data?.stats) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-[#0B0E1C]/60 border border-white/5">
        <div className="text-center">
          <p className="text-lg font-medium text-white/40">Nenhum dado disponível</p>
          <p className="mt-1 text-sm text-white/50">Complete rituais para ver suas estatísticas</p>
        </div>
      </div>
    );
  }

  const { stats } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <StatsCard
        title="Total"
        value={stats.totalRituals}
        subtitle="rituais completados"
        icon={<Sparkles size={24} className="text-amber-400" />}
      />
      <StatsCard
        title="Sequência"
        value={stats.currentStreak}
        subtitle="dias consecutivos"
        icon={<Flame size={24} className="text-orange-400" />}
      />
      <StatsCard
        title="Recorde"
        value={stats.longestStreak}
        subtitle="maior sequência"
        icon={<Trophy size={24} className="text-yellow-400" />}
      />
      <StatsCard
        title="Taxa"
        value={stats.completionRate}
        suffix="%"
        subtitle="rituais cumpridos"
        icon={<BarChart3 size={24} className="text-cyan-400" />}
      />
    </motion.div>
  );
}
