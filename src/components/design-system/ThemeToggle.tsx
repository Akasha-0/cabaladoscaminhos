'use client';

import { useTheme } from '@/lib/theme';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ThemeToggle - Mystical themed toggle for dark/light mode
 * Part of the Cabala dos Caminhos design system
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative w-14 h-7 rounded-full p-1 transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50',
        isDark 
          ? 'bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50' 
          : 'bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300/50',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Tema ${isDark ? 'Escuro' : 'Claro'} - Clique para alternar`}
    >
      {/* Background glow on hover */}
      <div className={cn(
        'absolute inset-0 rounded-full transition-opacity duration-300',
        isDark ? 'hover:bg-amber-500/10' : 'hover:bg-slate-800/10'
      )} />

      {/* Toggle knob */}
      <div
        className={cn(
          'relative w-5 h-5 rounded-full transition-all duration-300 transform flex items-center justify-center',
          isDark 
            ? 'translate-x-0 bg-gradient-to-br from-amber-500 to-yellow-400 shadow-lg shadow-amber-500/40' 
            : 'translate-x-7 bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg shadow-slate-500/30'
        )}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-slate-900" />
        ) : (
          <Sun className="w-3 h-3 text-amber-400" />
        )}
      </div>

      {/* Stars for dark mode, clouds for light mode */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="absolute top-1 left-2 w-1 h-1 bg-amber-400 rounded-full opacity-50" />
          <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-amber-300 rounded-full opacity-30" />
          <div className="absolute bottom-1 left-4 w-0.5 h-0.5 bg-amber-400 rounded-full opacity-40" />
        </div>
      )}
      {!isDark && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="absolute top-1 left-3 w-1 h-1 bg-slate-400 rounded-full opacity-30" />
          <div className="absolute bottom-2 right-2 w-0.5 h-0.5 bg-slate-500 rounded-full opacity-20" />
        </div>
      )}
    </button>
  );
}

export default ThemeToggle;