'use client';

import { motion } from 'framer-motion';
import { useDashboardData } from './hooks/useDashboardData';
import { HistoryItem } from './HistoryItem';

interface RitualHistoryProps {
  userId: string;
  maxVisible?: number;
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 },
  },
};

function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded bg-slate-200 dark:bg-zinc-800" />
        <div className="flex-1">
          <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-zinc-800 mb-2" />
          <div className="h-4 w-16 rounded bg-slate-200 dark:bg-zinc-800" />
        </div>
        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export function RitualHistory({ userId, maxVisible = 10 }: RitualHistoryProps) {
  const { data, loading } = useDashboardData({ userId });

  if (loading) {
    return (
      <section className="bg-white/80 dark:bg-zinc-950/50 rounded-xl p-6 border border-slate-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-4">
          Histórico de Rituais
        </h2>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  const historyItems = data?.history ?? [];
  const visibleItems = historyItems.slice(0, maxVisible);
  const hasMore = historyItems.length > maxVisible;

  return (
    <section className="bg-white/80 dark:bg-zinc-950/50 rounded-xl p-6 border border-slate-200 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-4">
        Histórico de Rituais
      </h2>

      {visibleItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-zinc-400 mb-2">Nenhum ritual ainda.</p>
          <p className="text-slate-500 dark:text-zinc-500 text-sm">Comece seu primeiro ritual!</p>
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {visibleItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <HistoryItem item={item} />
              </motion.div>
            ))}
          </motion.div>

          {hasMore && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 text-center">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-sm text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1"
              >
                Ver mais
                <span aria-hidden>→</span>
              </a>
            </div>
          )}
        </>
      )}
    </section>
  );
}
