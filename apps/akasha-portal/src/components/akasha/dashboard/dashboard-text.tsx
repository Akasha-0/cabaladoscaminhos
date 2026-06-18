/**
 * @akasha/portal — Dashboard Text & Styling Helpers
 * Extracted from Dashboard.tsx (lines 46–109)
 * Provides: strategy color system, greeting, date formatting, narrative renderer
 */
import React from 'react';

// ─── Akasha Strategy Styling (Doc 26) ───────────────────────────────────────

export const ESTRATEGIA_BG: Record<string, string> = {
  act: 'rgba(45,212,191,0.06)',
  wait: 'rgba(240,180,41,0.06)',
  observe: 'rgba(124,92,255,0.06)',
  surrender: 'rgba(196,62,142,0.06)',
};

export const ESTRATEGIA_BORDER: Record<string, string> = {
  act: 'rgba(45,212,191,0.2)',
  wait: 'rgba(240,180,41,0.2)',
  observe: 'rgba(124,92,255,0.2)',
  surrender: 'rgba(196,62,142,0.2)',
};

export const ESTRATEGIA_COLOR: Record<string, string> = {
  act: '#2DD4BF',
  wait: '#F0B429',
  observe: '#7C5CFF',
  surrender: '#C43E8E',
};

export const ESTRATEGIA_LABEL: Record<string, string> = {
  act: 'Aja',
  wait: 'Espere',
  observe: 'Observe',
  surrender: 'Entregue',
};

// ─── Text Helpers ────────────────────────────────────────────────────────────

/** Returns a Portuguese greeting based on local hour */
export function getGreeting(): string {
  const hr = new Date().getHours();
  if (hr < 5) return 'Boa madrugada';
  if (hr < 12) return 'Bom despertar';
  if (hr < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function getFormattedDate(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Simple markdown renderer — splits on double-newlines for paragraphs,
 * then on `**bold**` markers for inline emphasis.
 */
export function renderNarrative(text: string, fontSize = '0.9rem'): React.ReactNode[] {
  if (!text) return [];
  const paragraphs = text.split('\n\n').filter(Boolean);
  return paragraphs.map((para, i) => {
    const parts = para.split(/\*\*(.+?)\*\*/g);
    return (
      <p key={i} style={{ fontSize }}>
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="text-[#9D86FF] font-semibold">
              {part}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    );
  });
}
