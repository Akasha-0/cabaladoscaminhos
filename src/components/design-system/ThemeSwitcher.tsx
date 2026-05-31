'use client';

import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { 
  Sun, 
  Moon, 
  Sparkles,
  Monitor
} from 'lucide-react';

/**
 * ThemeSwitcher - Dashboard theme switcher with mystical styling
 * 
 * Shows current theme and allows switching between dark/light modes.
 * 
 * @example
 * // In dashboard header:
 * <ThemeSwitcher variant="icon" />
 * <ThemeSwitcher variant="dropdown" />
 */
interface ThemeSwitcherProps {
  variant?: 'icon' | 'pill' | 'dropdown';
  className?: string;
}

export function ThemeSwitcher({ variant = 'pill', className = '' }: ThemeSwitcherProps) {
  const { theme, setTheme, toggleTheme, systemTheme, isDark } = useTheme();

  const themes = [
    { mode: 'dark' as const, label: 'Escuro', icon: Moon, description: 'Cosmos Místico' },
    { mode: 'light' as const, label: 'Claro', icon: Sun, description: 'Luz Solar' },
    { mode: 'system' as const, label: 'Sistema', icon: Monitor, description: 'Automático' },
  ];

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'relative w-10 h-10 rounded-xl flex items-center justify-center',
          'bg-slate-800/50 border border-slate-700/30',
          'hover:border-amber-500/40 hover:bg-slate-800/80',
          'transition-all duration-300',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50',
          className
        )}
        title={`Tema: ${theme === 'dark' ? 'Escuro' : 'Claro'}`}
      >
        <div className="relative">
          {isDark ? (
            <Moon className="w-5 h-5 text-amber-400" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}
          {/* Glow effect */}
          <div 
            className={cn(
              'absolute inset-0 rounded-full blur-md -z-10',
              isDark ? 'bg-amber-500/30' : 'bg-orange-500/30'
            )}
          />
        </div>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {themes.map(({ mode, label, icon: Icon, description }) => (
          <button
            key={mode}
            onClick={() => setTheme(mode === 'system' ? systemTheme : mode)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300',
              'border',
              theme === mode || (mode === 'system' && !theme)
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:text-slate-300 hover:border-slate-600/50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50'
            )}
            title={description}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={cn('relative inline-block', className)}>
      <button
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl',
          'bg-slate-800/50 border border-slate-700/30',
          'hover:border-amber-500/40 hover:bg-slate-800/80',
          'transition-all duration-300',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50'
        )}
      >
        <div className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center',
          isDark ? 'bg-amber-500/20' : 'bg-orange-100'
        )}>
          {isDark ? (
            <Sparkles className="w-4 h-4 text-amber-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-600" />
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">
            {isDark ? 'Modo Escuro' : 'Modo Claro'}
          </p>
          <p className="text-xs text-slate-400">
            {isDark ? 'Cosmos Místico' : 'Luz Solar'}
          </p>
        </div>
      </button>

      {/* Dropdown content would go here - simplified for now */}
    </div>
  );
}

export default ThemeSwitcher;