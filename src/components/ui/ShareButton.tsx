'use client';

// ============================================================================
// ShareButton — Compartilhamento mobile-first (Web Share API + fallback)
// ============================================================================
// Usa navigator.share() quando disponível (Chrome mobile, Safari iOS), cai
// para clipboard + toast em desktop / browsers antigos. Haptic feedback.
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { Share2, Check, Copy, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';

export interface ShareData {
  /** Título do conteúdo */
  title?: string;
  /** Texto curto a compartilhar */
  text?: string;
  /** URL absoluta */
  url: string;
}

export interface ShareButtonProps {
  /** Dados a compartilhar */
  data: ShareData;
  /** Visual variant */
  variant?: 'icon' | 'pill' | 'full';
  /** Classes extras */
  className?: string;
  /** Label customizado */
  label?: string;
  /** Se true, mostra contador (ex: shares) */
  count?: number;
  /** Callback customizado após share (ex: analytics) */
  onShared?: (method: 'native' | 'clipboard' | 'failed') => void;
  /** Desabilitado */
  disabled?: boolean;
}

type State = 'idle' | 'shared' | 'copied' | 'failed';

export function ShareButton({
  data,
  variant = 'icon',
  className = '',
  label = 'Compartilhar',
  count,
  onShared,
  disabled = false,
}: ShareButtonProps) {
  const [state, setState] = useState<State>('idle');
  const [supportsNative, setSupportsNative] = useState(false);
  const { light: lightHaptic, success: successHaptic, warning: warningHaptic } =
    useHaptic();

  useEffect(() => {
    setSupportsNative(
      typeof navigator !== 'undefined' && typeof navigator.share === 'function',
    );
  }, []);

  const handleShare = useCallback(async () => {
    if (disabled) return;
    lightHaptic();

    // Tenta Web Share API primeiro (mobile)
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({
          ...(data.title ? { title: data.title } : {}),
          ...(data.text ? { text: data.text } : {}),
          url: data.url,
        });
        setState('shared');
        successHaptic();
        onShared?.('native');
        window.setTimeout(() => setState('idle'), 2200);
        return;
      } catch (err) {
        // user cancel ou erro silencioso
        if ((err as Error).name === 'AbortError') return;
        // cai pro clipboard
      }
    }

    // Fallback: clipboard
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(data.url);
      } else {
        // Fallback legado
        const ta = document.createElement('textarea');
        ta.value = data.url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setState('copied');
      successHaptic();
      onShared?.('clipboard');
      window.setTimeout(() => setState('idle'), 2200);
    } catch {
      setState('failed');
      warningHaptic();
      onShared?.('failed');
      window.setTimeout(() => setState('idle'), 2500);
    }
  }, [data, disabled, lightHaptic, successHaptic, warningHaptic, onShared]);

  // Visual conforme estado
  const Icon =
    state === 'copied'
      ? Check
      : state === 'failed'
        ? Link2
        : supportsNative
          ? Share2
          : Copy;

  const ariaLabel =
    state === 'copied'
      ? 'Link copiado'
      : state === 'shared'
        ? 'Compartilhado'
        : state === 'failed'
          ? 'Falha ao copiar'
          : label;

  // ---- variants ----
  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          'flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl',
          'bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white',
          'active:scale-95 transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'disabled:opacity-50 disabled:pointer-events-none',
          state === 'copied' && 'from-emerald-500 to-emerald-600',
          state === 'failed' && 'from-red-500 to-red-600',
          className,
        )}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-medium">
          {state === 'copied'
            ? 'Copiado!'
            : state === 'shared'
              ? 'Compartilhado'
              : state === 'failed'
                ? 'Tente novamente'
                : label}
        </span>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg transition-all',
          'active:scale-95',
          state === 'copied'
            ? 'text-emerald-400 bg-emerald-500/10'
            : state === 'failed'
              ? 'text-red-400 bg-red-500/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'disabled:opacity-50 disabled:pointer-events-none',
          className,
        )}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
        {count !== undefined && (
          <span className="text-xs font-medium">{count}</span>
        )}
      </button>
    );
  }

  // variant === 'icon' (default) — pro PostCard
  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-live="polite"
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg transition-all',
        'active:scale-95',
        state === 'copied'
          ? 'text-emerald-400 bg-emerald-500/10'
          : state === 'failed'
            ? 'text-red-400 bg-red-500/10'
            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4',
          state === 'copied' && 'animate-in zoom-in duration-200',
        )}
        aria-hidden="true"
      />
      {count !== undefined && (
        <span className="text-xs font-medium">{count}</span>
      )}
    </button>
  );
}

export default ShareButton;