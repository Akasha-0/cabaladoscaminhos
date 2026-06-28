'use client';

/**
 * ============================================================================
 * Error States — 404, 500, Offline, Form Validation, API Error (Wave 17)
 * ============================================================================
 * Composed states that go beyond the base `Error` component. Each variant
 * wraps the underlying primitives (illustration, copy, CTA) with semantic
 * intent so pages just `<NotFound />` or `<OfflineIndicator />` instead of
 * reimplementing.
 *
 * Reduced motion: animations gated via `motion-safe:` Tailwind variant.
 * ============================================================================
 */

import * as React from 'react';
import Link from 'next/link';
import { Search, RefreshCw, WifiOff, AlertOctagon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyIllustration, type EmptyVariant } from './empty-illustrations';

/* ===========================================================================
   404 — Not Found (premium, with quote + search + useful links)
   =========================================================================== */

const mysticalQuotes = [
  'O caminho que procuras já existe dentro de ti.',
  'Quando uma porta se fecha, outra se abre no cosmos.',
  'A jornada começa com um único passo consciente.',
  'O universo conspira a favor da tua transformação.',
];

export interface NotFoundProps {
  /** Custom headline. Default: "Página não encontrada". */
  title?: string;
  /** Custom copy. Default: spirit-aware description. */
  description?: string;
  /** Show mystical quote picker. Default true. */
  showQuote?: boolean;
}

export function NotFound({
  title = 'Página não encontrada',
  description = 'Esse caminho ainda não foi traçado. Talvez o que procuras esteja em outro lugar.',
  showQuote = true,
}: NotFoundProps) {
  const [quote] = React.useState(
    () => mysticalQuotes[Math.floor(Math.random() * mysticalQuotes.length)]
  );

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      {/* Big "404" mark with subtle gold tint */}
      <div className="relative mb-8">
        <span
          aria-hidden
          className="select-none text-8xl font-bold leading-none text-amber-500/20 sm:text-9xl"
          style={{ fontFamily: 'var(--font-cinzel), serif' }}
        >
          404
        </span>
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
        >
          <EmptyIllustration
            variant="search"
            size={88}
            className="text-amber-300/70 motion-safe:animate-float"
          />
        </span>
      </div>

      <h1
        className="mb-3 text-2xl font-semibold text-slate-100 sm:text-3xl"
        style={{ fontFamily: 'var(--font-cinzel), serif' }}
      >
        {title}
      </h1>
      <p className="mb-8 max-w-md text-base leading-relaxed text-slate-400">
        {description}
      </p>

      {showQuote && (
        <blockquote className="mb-8 max-w-md border-l-2 border-amber-500/40 pl-4 text-left text-sm italic text-slate-500">
          “{quote}”
        </blockquote>
      )}

      {/* Mini search */}
      <form
        action="/search"
        method="get"
        role="search"
        className="mb-8 flex w-full max-w-sm items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/30"
      >
        <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <input
          type="search"
          name="q"
          placeholder="Buscar no portal…"
          aria-label="Buscar no portal"
          className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
        />
      </form>

      {/* Useful links */}
      <nav
        aria-label="Links úteis"
        className="flex flex-wrap items-center justify-center gap-2 text-sm"
      >
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 font-medium text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Voltar ao início
        </Link>
        <Link
          href="/library"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Explorar biblioteca
        </Link>
        <Link
          href="/community"
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Comunidade
        </Link>
      </nav>
    </div>
  );
}

/* ===========================================================================
   500 — Server Error (with report button + retry + home)
   =========================================================================== */

export interface ServerErrorProps {
  error?: Error | string;
  onRetry?: () => void;
  onReport?: () => void;
  title?: string;
  description?: string;
}

export function ServerError({
  error,
  onRetry,
  onReport,
  title = 'O cosmos teve um soluço',
  description = 'Nossos servidores encontraram uma dissonância. Já estamos realinhando as energias.',
}: ServerErrorProps) {
  const errMsg =
    typeof error === 'string'
      ? error
      : error?.message ?? 'Erro interno do servidor';

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
        <AlertOctagon className="h-10 w-10" aria-hidden />
      </div>

      <span
        aria-hidden
        className="mb-2 select-none text-xs font-medium uppercase tracking-widest text-amber-400"
      >
        Erro 500
      </span>

      <h1
        className="mb-3 text-2xl font-semibold text-slate-100 sm:text-3xl"
        style={{ fontFamily: 'var(--font-cinzel), serif' }}
      >
        {title}
      </h1>
      <p className="mb-6 max-w-md text-base leading-relaxed text-slate-400">
        {description}
      </p>

      {error && (
        <details className="mb-6 max-w-md text-left">
          <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-300">
            Detalhes técnicos
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-400">
            {errMsg}
          </pre>
        </details>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        )}
        {onReport && (
          <button
            type="button"
            onClick={onReport}
            className="inline-flex items-center rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Reportar problema
          </button>
        )}
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

/* ===========================================================================
   Offline — Network Error (banner + retry)
   =========================================================================== */

export interface OfflineIndicatorProps {
  /** Compact banner (top of page). Default true. */
  compact?: boolean;
  /** Custom copy. */
  message?: string;
  onRetry?: () => void;
}

export function OfflineIndicator({
  compact = true,
  message = 'Você está sem conexão. Algumas funções podem estar limitadas.',
  onRetry,
}: OfflineIndicatorProps) {
  const [online, setOnline] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (online) return null;

  if (compact) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="sticky top-0 z-40 flex items-center justify-center gap-2 border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-sm text-amber-200 backdrop-blur"
      >
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate">{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md px-2 py-0.5 text-xs font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
        <WifiOff className="h-10 w-10" aria-hidden />
      </div>
      <h2 className="mb-3 text-xl font-semibold text-slate-100">
        Você está offline
      </h2>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-slate-400">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <RefreshCw className="h-4 w-4" />
          Reconectar
        </button>
      )}
    </div>
  );
}

/* ===========================================================================
   Form Validation — Field-level (inline) + Form-level (banner)
   =========================================================================== */

export interface FieldErrorProps {
  /** The error message. Falsy → renders nothing. */
  message?: string | null;
  /** Field id used to wire aria-describedby. */
  fieldId?: string;
  className?: string;
}

export function FieldError({ message, fieldId, className }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      id={fieldId ? `${fieldId}-error` : undefined}
      role="alert"
      className={cn(
        'mt-1.5 flex items-start gap-1.5 text-xs text-rose-400',
        className
      )}
    >
      <span
        aria-hidden
        className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400"
      />
      <span>{message}</span>
    </p>
  );
}

export interface FormErrorBannerProps {
  /** Form-level error (e.g. "Sua sessão expirou"). */
  title?: string;
  /** Long description / what to do. */
  description?: string;
  /** Optional retry/dismiss callback. */
  onDismiss?: () => void;
}

export function FormErrorBanner({
  title = 'Não conseguimos enviar o formulário',
  description = 'Revise os campos destacados e tente novamente.',
  onDismiss,
}: FormErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"
    >
      <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" aria-hidden />
      <div className="flex-1 space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-rose-300/90">{description}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md px-2 py-0.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          Fechar
        </button>
      )}
    </div>
  );
}

/* ===========================================================================
   API Error — Generic (context + retry + support)
   =========================================================================== */

export interface ApiErrorProps {
  error?: Error | string;
  onRetry?: () => void;
  onSupport?: () => void;
  /** Custom headline. */
  title?: string;
  /** What the user was trying to do. Default "Não conseguimos concluir essa ação". */
  description?: string;
}

export function ApiError({
  error,
  onRetry,
  onSupport,
  title = 'Algo deu errado',
  description = 'Não conseguimos concluir essa ação. Tente novamente em alguns instantes.',
}: ApiErrorProps) {
  const errMsg =
    typeof error === 'string' ? error : error?.message ?? 'Erro desconhecido';

  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300">
        <AlertOctagon className="h-7 w-7" aria-hidden />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mb-4 max-w-md text-sm leading-relaxed text-slate-400">
        {description}
      </p>

      {error && (
        <p className="mb-5 max-w-md font-mono text-xs text-slate-500">
          {errMsg}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        )}
        {onSupport && (
          <button
            type="button"
            onClick={onSupport}
            className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Falar com suporte
          </button>
        )}
      </div>
    </div>
  );
}

/* ===========================================================================
   Empty Results — Empty wrapper for a search with no matches (re-export helper)
   =========================================================================== */

export interface EmptyResultsProps {
  /** The query that returned nothing. */
  query?: string;
  onClear?: () => void;
  /** Variant of illustration to use. Default: 'search'. */
  variant?: EmptyVariant;
}

export function EmptyResults({
  query,
  onClear,
  variant = 'search',
}: EmptyResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <EmptyIllustration variant={variant} size={112} className="mb-5 text-violet-300/70" />
      <h3 className="mb-2 text-lg font-semibold text-slate-100">
        Nenhum resultado encontrado
      </h3>
      {query ? (
        <p className="mb-5 max-w-md text-sm leading-relaxed text-slate-400">
          Não encontramos nada para <span className="font-medium text-slate-300">"{query}"</span>.
          Tente reformular ou usar outras palavras-chave.
        </p>
      ) : (
        <p className="mb-5 max-w-md text-sm leading-relaxed text-slate-400">
          Tente outra busca ou explore as categorias sugeridas.
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <Inbox className="mr-1.5 h-4 w-4" />
            Limpar busca
          </button>
        )}
        <Link
          href="/library"
          className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 font-medium text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Explorar biblioteca
        </Link>
      </div>
    </div>
  );
}
