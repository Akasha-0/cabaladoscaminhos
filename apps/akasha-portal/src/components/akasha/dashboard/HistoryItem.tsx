'use client';

import { motion } from 'framer-motion';
import type { RitualHistoryItem } from '@akasha/core';

interface HistoryItemProps {
  item: RitualHistoryItem;
}

const LEVEL_CONFIG = {
  shadow: {
    icon: '🌑',
    bg: 'bg-purple-100 dark:bg-purple-900/50',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-700/50',
    label: 'Sombra',
  },
  gift: {
    icon: '✨',
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-700/50',
    label: 'Dom',
  },
  siddhi: {
    icon: '⚡',
    bg: 'bg-emerald-100 dark:bg-emerald-900/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-700/50',
    label: 'Siddhi',
  },
} as const;

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 14) return '1 semana atrás';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

export function HistoryItem({ item }: HistoryItemProps) {
  const config = LEVEL_CONFIG[item.ritualLevel];

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className={`
          block p-4 rounded-lg border transition-all duration-200
          bg-white/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-800/50
          ${config.border} hover:${config.border.replace('/50', '')}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0 mt-0.5" role="img" aria-label={config.label}>
              {config.icon}
            </span>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-slate-900 dark:text-zinc-100 truncate">
                {item.ritualName}
              </h3>
              <span className={`
                inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium
                ${config.bg} ${config.text}
              `}>
                {config.label}
              </span>
            </div>
          </div>
          
          <span className="text-sm text-slate-500 dark:text-zinc-500 flex-shrink-0">
            {formatRelativeDate(item.date)}
          </span>
        </div>
      </a>
    </motion.div>
  );
}
