'use client';

import { Moon, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { RitualHistoryItem } from '@akasha/core';

interface HistoryItemProps {
  item: RitualHistoryItem;
}

const LEVEL_CONFIG = {
  shadow: {
    icon: Moon,
    bg: 'bg-purple-900/50',
    text: 'text-purple-300',
    border: 'border-purple-700/50',
    borderHover: 'hover:border-purple-500',
    label: 'Sombra',
  },
  gift: {
    icon: Sparkles,
    bg: 'bg-amber-900/50',
    text: 'text-amber-300',
    border: 'border-amber-700/50',
    borderHover: 'hover:border-amber-500',
    label: 'Dom',
  },
  siddhi: {
    icon: Zap,
    bg: 'bg-emerald-900/50',
    text: 'text-emerald-300',
    border: 'border-emerald-700/50',
    borderHover: 'hover:border-emerald-500',
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
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="group"
    >
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className={`
          block p-4 rounded-lg border transition-all duration-200
          bg-[#1C1C1E]/80 hover:bg-[#1C1C1E]
          ${config.border} ${config.borderHover}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
          <config.icon size={24} className="flex-shrink-0 mt-0.5 text-2xl" aria-label={config.label} />
            
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-white truncate">
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
          
          <span className="text-sm text-white/50 flex-shrink-0">
            {formatRelativeDate(item.date)}
          </span>
        </div>
      </a>
    </motion.div>
  );
}
