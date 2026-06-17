'use client';

/**
 * @akasha/portal — ProgressBar Component
 * 
 * Barra de progresso horizontal com animação.
 */

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({ value, max, label, showPercent = true }: ProgressBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="space-y-2">
      {(label || showPercent) && (
        <div className="flex justify-between text-sm text-akasha-text-secondary">
          {label && <span>{label}</span>}
          {showPercent && (
            <span>{value} de {max} dias</span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-[#0B0E1C]/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-akasha-primary to-akasha-primary/70 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
