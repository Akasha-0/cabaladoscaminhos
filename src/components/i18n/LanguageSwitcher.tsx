'use client';

// ============================================================================
// LanguageSwitcher — Dropdown minimalista para trocar PT-BR / EN / ES
// ============================================================================
// Mobile-first:
//   - target 44px (touch-target WCAG 2.5.5 / Apple HIG)
//   - dropdown com teclado acessível (Esc fecha, Tab navega, Enter seleciona)
//   - bandeiras inline (SVG, zero asset deps, zero requests extras)
//   - haptic feedback em seleção (useHaptic)
//   - persistência dupla: localStorage (via useI18n) + cookie (lido pelo
//     middleware em SSR)
//   - fecha ao clicar fora (click-outside listener)
//
// Inspiração de padrão: W12 hook setLocale + W18 fallback PT-BR.
//
// Reuso: importar como
//   import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
//   <LanguageSwitcher variant="icon" />      // só bandeira atual
//   <LanguageSwitcher variant="pill" />      // bandeira + nome do locale
//   <LanguageSwitcher variant="full" />      // bandeira + nome nativo + label
// ============================================================================

import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n, type Locale } from '@/lib/i18n';
import { useHaptic } from '@/hooks/useHaptic';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------------------
// Inline SVG flags (3 simple flags, no asset deps)
// ----------------------------------------------------------------------------

const FlagBR = ({ className }: { className?: string }): ReactElement => (
  <svg
    className={className}
    viewBox="0 0 24 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="24" height="16" fill="#009c3b" rx="2" />
    <polygon points="12,2 22,8 12,14 2,8" fill="#ffdf00" />
    <circle cx="12" cy="8" r="3.4" fill="#002776" />
  </svg>
);

const FlagUS = ({ className }: { className?: string }): ReactElement => (
  <svg
    className={className}
    viewBox="0 0 24 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="24" height="16" fill="#bf0a30" rx="2" />
    {[0, 2, 4, 6, 8, 10, 12].map((y) => (
      <rect key={y} y={y} width="24" height="1.2" fill="#ffffff" />
    ))}
    <rect width="10" height="8.4" fill="#002868" />
  </svg>
);

const FlagES = ({ className }: { className?: string }): ReactElement => (
  <svg
    className={className}
    viewBox="0 0 24 16"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="24" height="16" fill="#c60b1e" rx="2" />
    <rect y="4" width="24" height="8" fill="#ffc400" />
  </svg>
);

// ----------------------------------------------------------------------------
// Locale metadata — single source of truth
// ----------------------------------------------------------------------------

type FlagComponent = (props: { className?: string }) => ReactElement;

interface LocaleMeta {
  code: Locale;
  Flag: FlagComponent;
}

const LOCALES: LocaleMeta[] = [
  { code: 'pt-BR', Flag: FlagBR },
  { code: 'en', Flag: FlagUS },
  { code: 'es', Flag: FlagES },
];

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export type LanguageSwitcherVariant = 'icon' | 'pill' | 'full';

export interface LanguageSwitcherProps {
  /** Visual variant */
  variant?: LanguageSwitcherVariant;
  /** Extra classes */
  className?: string;
  /** Show label text next to flag */
  showLabel?: boolean;
}

export function LanguageSwitcher({
  variant = 'icon',
  className = '',
  showLabel,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const { light: lightHaptic } = useHaptic();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close on click-outside
  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Don't render until mounted to avoid hydration mismatch (useI18n is async)
  if (!mounted) {
    return (
      <div
        className={cn(
          'h-11 w-11 rounded-full bg-slate-800/40 border border-slate-700/40',
          className,
        )}
        aria-hidden="true"
      />
    );
  }

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]!;
  const labelFor = (code: Locale) => t(`languageSwitcher.${code === 'pt-BR' ? 'ptBR' : code}`);
  const ariaLabel = t('languageSwitcher.ariaLabel') || 'Select language';

  const handleSelect = (next: Locale) => {
    if (next !== locale) {
      lightHaptic();
      setLocale(next);
      // Mirror to cookie so middleware sees it on next request
      // (1 year, SameSite=Lax, Path=/).
      if (typeof document !== 'undefined') {
        document.cookie = `akasha-locale=${next}; path=/; max-age=31536000; samesite=lax`;
      }
    }
    setOpen(false);
  };

  const displayLabel =
    showLabel ?? (variant === 'pill' || variant === 'full') ? labelFor(locale) : null;

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'touch-target inline-flex items-center gap-2 rounded-full',
          'bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60',
          'transition-colors',
          variant === 'icon' && 'h-11 w-11 justify-center',
          variant === 'pill' && 'h-11 px-3',
          variant === 'full' && 'h-11 px-4 min-w-[7rem] justify-between',
        )}
      >
        <current.Flag className="h-4 w-6 rounded-sm shadow-sm" />
        {displayLabel && (
          <span className="text-caption text-slate-100 font-medium">
            {displayLabel}
          </span>
        )}
        {(variant === 'pill' || variant === 'full') && (
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-slate-400 transition-transform',
              open && 'rotate-180',
            )}
          />
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            'absolute right-0 mt-2 z-50 min-w-[10rem] rounded-xl',
            'bg-slate-900/95 backdrop-blur-md border border-slate-700/60',
            'shadow-xl shadow-black/40 py-1 overflow-hidden',
            'animate-in fade-in slide-in-from-top-2 duration-150',
          )}
        >
          {LOCALES.map((entry) => {
            const selected = entry.code === locale;
            return (
              <li key={entry.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handleSelect(entry.code)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left',
                    'hover:bg-slate-800/70 transition-colors',
                    'text-caption text-slate-100',
                    selected && 'bg-amber-500/10 text-amber-200',
                  )}
                >
                  <entry.Flag className="h-3.5 w-5 rounded-sm shadow-sm flex-shrink-0" />
                  <span className="flex-1">{labelFor(entry.code)}</span>
                  {selected && (
                    <Check className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Compact badge-only version for tight UIs (e.g., footer)
// ----------------------------------------------------------------------------

export function LanguageBadge({ className = '' }: { className?: string }) {
  const { locale } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]!;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-tiny text-slate-400',
        className,
      )}
      aria-hidden="true"
    >
      <Globe className="w-3 h-3" />
      <current.Flag className="h-2.5 w-4 rounded-sm" />
    </span>
  );
}