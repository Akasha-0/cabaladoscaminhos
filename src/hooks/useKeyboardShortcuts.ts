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

function isMacPlatform(): boolean {
  return typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
}

function keyMatches(e: KeyboardEvent, expected: string): boolean {
  return e.key.toLowerCase() === expected.toLowerCase();
}
function modifierMatches(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut,
): boolean {
  const requiresCtrl = shortcut.ctrl ?? false;
  const ctrlOrCmd = isMacPlatform() ? event.metaKey : event.ctrlKey;

  if (requiresCtrl !== ctrlOrCmd) return false;

  const requiresShift = shortcut.shift ?? false;
  if (requiresShift !== event.shiftKey) return false;

  const requiresAlt = shortcut.alt ?? false;
  if (requiresAlt !== event.altKey) return false;

  return true;
}
function matchesShortcut(e: KeyboardEvent, s: KeyboardShortcut): boolean {
  return keyMatches(e, s.key) && modifierMatches(e, s);
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    function isEditableElement(target: EventTarget | null): boolean {
      if (!target || typeof target !== 'object') return false;
      const el = target as Partial<HTMLElement>;
      const tagName = el.tagName ?? '';
      // Check contentEditable (string: 'true', 'false', 'inherit') and isContentEditable (boolean-like)
      const contentEditable = el.contentEditable;
      const isEditableContent = contentEditable === 'true' || el.isContentEditable === true;
      return (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        isEditableContent
      );
    }

    function handleKeydown(e: KeyboardEvent): void {
      const target = e.target;
      const inEditable = isEditableElement(target);
      if (inEditable && e.key !== 'Escape') return;

      for (const s of shortcuts) {
        if (matchesShortcut(e, s)) {
          if (s.preventDefault !== false) e.preventDefault();
          s.handler(e);
          return;
        }
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [shortcuts]);
}

const CANONICAL_SHORTCUTS: Omit<KeyboardShortcut, 'handler'>[] = [
  { key: 'k', ctrl: true },
  { key: 'n', ctrl: true },
  { key: 's', ctrl: true },
  { key: 'Escape' },
  { key: '?', shift: true },
];
