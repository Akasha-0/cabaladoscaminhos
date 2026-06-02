/**
 * KeyboardShortcutsLayer — Client Component wrapper que ativa os atalhos
 * canônicos em todo o cockpit. Renderiza invisível (return null).
 *
 * Refs: T7.2 (Sprint 8 UX), useKeyboardShortcuts.ts
 */

'use client';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function KeyboardShortcutsLayer(): null {
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      handler: () => {
        // TODO: focar campo de busca (searchRef.current?.focus())
        console.info('[shortcut] Ctrl+K — focar busca');
      },
    },
    {
      key: 'n',
      ctrl: true,
      handler: () => {
        // TODO: navegar para /cockpit/consulentes/novo
        console.info('[shortcut] Ctrl+N — novo consulente');
      },
    },
    {
      key: 's',
      ctrl: true,
      handler: () => {
        // TODO: submit do form ativo
        console.info('[shortcut] Ctrl+S — salvar');
      },
    },
    {
      key: 'Escape',
      handler: () => {
        // TODO: fechar dialog/modal aberto
        console.info('[shortcut] Esc — fechar');
      },
    },
    {
      key: '?',
      shift: true,
      handler: () => {
        // TODO: abrir help dialog
        console.info('[shortcut] ? — help');
      },
    },
  ]);

  return null;
}
