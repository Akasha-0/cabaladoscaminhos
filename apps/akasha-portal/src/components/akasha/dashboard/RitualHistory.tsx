'use client';

import { motion } from 'framer-motion';
import { useDashboardData } from './hooks/useDashboardData';
import { HistoryItem } from './HistoryItem';
import { History, Sparkles } from 'lucide-react';

interface RitualHistoryProps {
  userId: string;
  maxVisible?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border border-white/[0.06] bg-[#0B0E1C]/60 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="flex-1">
          <div className="h-5 w-3/4 rounded bg-white/5 mb-2" />
          <div className="h-3 w-20 rounded bg-white/5" />
        </div>
        <div className="h-3 w-16 rounded bg-white/5" />
      </div>
    </div>
  );
}

export function RitualHistory({ userId, maxVisible = 10 }: RitualHistoryProps) {
  const { data, loading } = useDashboardData({ userId });

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/[0.06] bg-[#0B0E1C]/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-[#7C5CFF]" />
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
            Histórico de Rituais
          </h2>
        </div>
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
    <section className="rounded-2xl border border-white/[0.06] bg-[#0B0E1C]/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[#7C5CFF]" />
          <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
            Histórico de Rituais
          </h2>
        </div>
        {historyItems.length > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20">
            {historyItems.length} registros
          </span>
        )}
      </div>

      {visibleItems.length === 0 ? (
        <div className="text-center py-10">
          <Sparkles size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40 mb-1">Nenhum ritual ainda.</p>
          <p className="text-xs text-white/25">Comece seu primeiro ritual!</p>
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {visibleItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <HistoryItem item={item} />
              </motion.div>
            ))}
          </motion.div>

          {hasMore && (
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
              <button
                className="text-xs text-[#7C5CFF] hover:text-[#9D86FF] transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 border border-[#7C5CFF]/20"
              >
                Ver mais
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#7C5CFF]">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
