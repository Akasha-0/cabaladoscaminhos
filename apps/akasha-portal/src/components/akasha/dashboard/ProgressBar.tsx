'use client';

/**
 * @akasha/portal — ProgressBar Component
 *
 * Barra de progresso horizontal com animação shimmer e glow cósmico.
 */
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
  showShimmer?: boolean;
  accentColor?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showPercent = true,
  showShimmer = true,
  accentColor,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  const primaryColor = accentColor || '#7C5CFF';

  return (
    <div className="space-y-2">
      {(label || showPercent) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-white/60">{label}</span>}
          {showPercent && (
            <span className="text-white/80 font-medium">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="relative h-2.5 bg-[#0B0E1C]/80 rounded-full overflow-hidden border border-white/5">
        {/* Subtle glow behind the progress fill */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 blur-sm rounded-full"
          style={{ width: `${percent}%`, backgroundColor: `${primaryColor}33` }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor}cc 50%, ${primaryColor} 100%)`,
            boxShadow: `0 0 12px ${primaryColor}60, 0 0 4px ${primaryColor}40`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {showShimmer && percent > 0 && (
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width: `${percent}%`,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
            }}
            animate={{
              x: ['0%', '200%'],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 0.5,
            }}
          />
        )}
      </div>
    </div>
  );
}
