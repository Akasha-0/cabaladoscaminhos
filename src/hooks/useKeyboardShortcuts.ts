// fallow-ignore-file unused-file
/**
 * useKeyboardShortcuts — Hook para registrar atalhos de teclado globais.
 *
 * Implementa T7.2 (Sprint 8 — UX). Mapeia combinações de teclas para handlers.
 *
 * Atalhos canônicos do Cabala dos Caminhos:
 *   - Ctrl/Cmd + K  → focar busca de consulentes
 *   - Ctrl/Cmd + N  → novo consulente
 *   - Ctrl/Cmd + S  → salvar dossiê
 *   - Esc           → fechar modal/dialog aberto
 *   - ?             → mostrar help de atalhos
 *
 * Uso:
 *   useKeyboardShortcuts([
 *     { key: 'k', ctrl: true, handler: () => searchRef.current?.focus() },
 *   ]);
 */

'use client';

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
}

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

// fallow-ignore-next-line complexity
function matchesShortcut(e: KeyboardEvent, s: KeyboardShortcut): boolean {
  if (e.key.toLowerCase() !== s.key.toLowerCase()) return false;
  const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
  if (s.ctrl && !ctrlOrCmd) return false;
  if (!s.ctrl && ctrlOrCmd) return false;
  if (s.shift && !e.shiftKey) return false;
  if (!s.shift && e.shiftKey) return false;
  if (s.alt && !e.altKey) return false;
  if (!s.alt && e.altKey) return false;
  return true;
}

function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  useEffect(() => {
// fallow-ignore-next-line complexity
    if (typeof window === 'undefined') return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inEditable =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (inEditable && e.key !== 'Escape') return;

      for (const s of shortcuts) {
        if (matchesShortcut(e, s)) {
          if (s.preventDefault !== false) e.preventDefault();
          s.handler(e);
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}

const CANONICAL_SHORTCUTS: Omit<KeyboardShortcut, 'handler'>[] = [
  { key: 'k', ctrl: true },
  { key: 'n', ctrl: true },
  { key: 's', ctrl: true },
  { key: 'Escape' },
  { key: '?', shift: true },
];
