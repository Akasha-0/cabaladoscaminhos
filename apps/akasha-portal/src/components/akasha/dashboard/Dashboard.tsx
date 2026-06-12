'use client';

/**
 * @akasha/portal — Dashboard Container
 *
 * Container principal do Dashboard que orquestra todos os componentes.
 */

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { DashboardStats } from './components/DashboardStats';
import { StreakCalendar } from './StreakCalendar';
import { ProgressChart } from './ProgressChart';
import { RitualHistory } from './RitualHistory';
import { useDashboardData } from './hooks/useDashboardData';
import { useAkashaSynthesis } from './hooks/useAkashaSynthesis';
import { AkashaLifeAreasDashboard } from './AkashaLifeAreasDashboard';

interface DashboardProps {
  userId: string;
}

// Skeleton para loading state
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-800/50" />
        ))}
      </div>

      {/* Calendar Skeleton */}
      <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
        <div className="h-5 w-32 bg-zinc-800 rounded mb-4" />
        <div className="flex justify-between gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-6 h-3 bg-zinc-800 rounded" />
              <div className="w-10 h-10 bg-zinc-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Progress Skeleton */}
      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-zinc-800 rounded" />
          <div className="h-8 w-full bg-zinc-800 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-40 bg-zinc-800 rounded" />
          <div className="h-8 w-full bg-zinc-800 rounded-full" />
        </div>
      </div>

      {/* History Skeleton */}
      <div className="bg-zinc-950/50 rounded-xl p-6 border border-zinc-800">
        <div className="h-5 w-40 bg-zinc-800 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-zinc-800" />
                <div className="flex-1">
                  <div className="h-5 w-3/4 rounded bg-zinc-800 mb-2" />
                  <div className="h-4 w-16 rounded bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error state
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] px-4"
    >
      <div className="bg-red-950/30 border border-red-900 rounded-xl p-8 text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-400 mb-2">
          Erro ao carregar dados
        </h2>
        <p className="text-red-300/70 text-sm mb-6">
          Não foi possível buscar seus dados. Tente novamente.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </button>
      </div>
    </motion.div>
  );
}

// Empty state
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] px-4"
    >
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🌟</div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Bem-vindo ao seu Dashboard
        </h2>
        <p className="text-slate-400">
          Complete seu primeiro ritual para começar a acompanhar seu progresso.
        </p>
      </div>
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
export function Dashboard({ userId }: DashboardProps) {
  const { data, loading, error, refetch } = useDashboardData({ userId });
  const { synthesis, loading: synthesisLoading, refetch: refetchSynthesis } = useAkashaSynthesis({ userId });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
        <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="px-4 py-6 max-w-3xl mx-auto">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
        <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="px-4 py-6 max-w-3xl mx-auto">
          <ErrorState onRetry={refetch} />
        </main>
      </div>
    );
  }

  // Empty state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
        <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="px-4 py-6 max-w-3xl mx-auto">
          <EmptyState />
        </main>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto md:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-6 space-y-6 max-w-3xl mx-auto md:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* §SYNTHESIS-F1: 6 Áreas de Vida — Motor de Síntese Akasha */}
          <section>
            <AkashaLifeAreasDashboard
              synthesis={synthesis ?? null}
              loading={synthesisLoading}
              onRefetch={refetchSynthesis}
            />
          </section>

          {/* Stats Grid */}
          <section>
            <DashboardStats userId={userId} />
          </section>

          {/* Streak Calendar */}
          <section>
            <StreakCalendar streak={data.streak} loading={loading} />
          </section>

          {/* Progress Chart */}
          <section className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
            <ProgressChart userId={userId} />
          </section>

          {/* Ritual History */}
          <section>
            <RitualHistory userId={userId} />
          </section>
        </motion.div>
      </main>
    </div>
  );
}
