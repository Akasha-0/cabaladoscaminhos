'use client';

// ============================================================================
// ThemeToggleButton — Toggle dark/light minimalista para o header
// ============================================================================
// Mobile-first: 44px target, haptic feedback, aria-pressed, troca instantânea
// de classe `dark` no <html>. Persistência via localStorage (zustand) + cookie
// (pra SSR + middleware se aplicável).
// ============================================================================

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

export interface ThemeToggleButtonProps {
  /** Variant visual */
  variant?: 'icon' | 'pill';
  /** Classes extras */
  className?: string;
  /** Se true, mostra label ao lado do ícone (apenas variant="pill") */
  showLabel?: boolean;
}

export function ThemeToggleButton({
  variant = 'icon',
  className = '',
  showLabel = false,
}: ThemeToggleButtonProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { light: lightHaptic } = useHaptic();
  // Avoid hydration mismatch — só renderiza depois do mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleClick = () => {
    lightHaptic();
    toggleTheme();
  };

  const ariaLabel = !mounted
    ? 'Alternar tema'
    : isDark
      ? 'Mudar para tema claro'
      : 'Mudar para tema escuro';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-pressed={mounted ? isDark : undefined}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 min-h-[44px]',
          'border',
          isDark
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
            : 'bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20',
          'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          className,
        )}
      >
        {mounted && isDark ? (
          <Sun className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Moon className="w-4 h-4" aria-hidden="true" />
        )}
        {showLabel && (
          <span className="text-xs font-medium">
            {mounted ? (isDark ? 'Claro' : 'Escuro') : 'Tema'}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-pressed={mounted ? isDark : undefined}
      title={mounted ? (isDark ? 'Mudar para claro' : 'Mudar para escuro') : 'Tema'}
      className={cn(
        'p-2 min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center',
        'text-slate-400 hover:text-amber-300 hover:bg-slate-800/50',
        'active:scale-95 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        className,
      )}
    >
      {/* Renderiza ícone neutro até montar, evitando flash */}
      {mounted && isDark ? (
        <Sun className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}

export default ThemeToggleButton;