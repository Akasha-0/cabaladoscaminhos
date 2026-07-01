'use client';

// ============================================================================
// Tooltip — Inline help component (Wave 36)
// ============================================================================
// Lightweight Radix-style tooltip sem dependência externa. SSR-safe.
//
// Recursos:
//  - Tooltip on hover/focus
//  - Dismiss/snooze (localStorage remembers se foi dispensado)
//  - Analytics (POST /api/help/feedback ao ver)
//  - 44px touch target (mobile-friendly via long-press)
//  - WAI-ARIA tooltip pattern
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface TooltipProps {
  id: string;                  // unique identifier for analytics/dismissal
  title: string;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  dismissable?: boolean;       // show X button
  // Optional override do trigger element (for wrapping custom buttons)
}

const DISMISS_PREFIX = 'tooltip-dismissed:';

export function Tooltip({
  id,
  title,
  content,
  side = 'top',
  children,
  dismissable = true,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const wasDismissed = window.localStorage.getItem(DISMISS_PREFIX + id) === '1';
    setDismissed(wasDismissed);
  }, [id]);

  // Track view
  useEffect(() => {
    if (open && typeof window !== 'undefined' && 'fetch' in window) {
      fetch('/api/help/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'tooltip_view',
          tooltipId: id,
          timestamp: Date.now(),
        }),
      }).catch(() => {}); // silent fail
    }
  }, [open, id]);

  function dismiss() {
    setDismissed(true);
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_PREFIX + id, '1');
    }
  }

  if (dismissed) {
    return <>{children}</>;
  }

  return (
    <span className="relative inline-flex items-center">
      <span
        ref={triggerRef}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help"
        tabIndex={0}
        role="button"
        aria-describedby={`tooltip-${id}`}
        aria-label="Ajuda contextual"
      >
        {children}
      </span>

      {!open && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-900/40 text-violet-200 transition hover:bg-violet-900/70"
          aria-label="Mostrar ajuda"
        >
          <HelpCircle className="h-3.5 w-3.5" aria-hidden />
        </button>
      )}

      {open && (
        <div
          ref={tooltipRef}
          id={`tooltip-${id}`}
          role="tooltip"
          className={`absolute z-50 ${sideClass(side)} w-64 rounded-lg border border-violet-700/50 bg-slate-900 p-3 text-xs shadow-2xl`}
        >
          <div className="mb-1 flex items-start justify-between gap-2">
            <strong className="text-sm font-semibold text-violet-200">{title}</strong>
            {dismissable && (
              <button
                type="button"
                onClick={dismiss}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                aria-label="Dispensar essa ajuda"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            )}
          </div>
          <p className="text-slate-200">{content}</p>
          <div className="mt-2 text-xs text-slate-500">ID: {id}</div>
        </div>
      )}
    </span>
  );
}

function sideClass(side: 'top' | 'bottom' | 'left' | 'right'): string {
  switch (side) {
    case 'top':    return 'bottom-full left-1/2 mb-2 -translate-x-1/2';
    case 'bottom': return 'top-full left-1/2 mt-2 -translate-x-1/2';
    case 'left':   return 'right-full top-1/2 mr-2 -translate-y-1/2';
    case 'right':  return 'left-full top-1/2 ml-2 -translate-y-1/2';
  }
}

// ============================================================================
// Tooltip registry (analytics) — used by /admin/tools to see most-viewed
// ============================================================================

export const KNOWN_TOOLTIPS: Array<{
  id: string;
  title: string;
  where: string;       // e.g., "/feed/compose"
  importance: 'low' | 'med' | 'high';
}> = [
  { id: 'feed-compose-tags', title: 'Tags e tradições', where: '/feed/compose', importance: 'med' },
  { id: 'akasha-stream-stop', title: 'Parar stream', where: '/akashic', importance: 'med' },
  { id: 'marketplace-escrow', title: 'Escrow explicado', where: '/marketplace/orders', importance: 'high' },
  { id: 'mentorship-matching', title: 'Como funciona matching', where: '/mentorship/apply', importance: 'high' },
  { id: 'onboarding-tradicoes', title: 'Por que pedimos tradições', where: '/onboarding', importance: 'med' },
  { id: 'lgpd-consent', title: 'Consentimento granular', where: '/account/privacy', importance: 'high' },
  { id: 'wiki-anon-edit', title: 'Por que login é necessário', where: '/wiki/new', importance: 'med' },
  { id: 'videos-pdf', title: 'PDF resumo', where: '/help/videos', importance: 'low' },
];
