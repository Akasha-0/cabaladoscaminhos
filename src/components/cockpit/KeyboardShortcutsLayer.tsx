// fallow-ignore-file unused-file
/**
 * KeyboardShortcutsLayer — Client Component que ativa os atalhos canônicos
 * em todo o cockpit. Renderiza invisível + Help dialog on `?`.
 *
 * Refs: T7.2 (Sprint 8 UX), useKeyboardShortcuts.ts
 */

'use client';

import { useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

export function KeyboardShortcutsLayer(): JSX.Element {
  const [helpOpen, setHelpOpen] = useState(false);

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
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        // TODO: fechar dialog/modal aberto
        console.info('[shortcut] Esc — fechar');
      },
    },
    {
      key: '?',
      shift: true,
      handler: () => {
        setHelpOpen(true);
      },
    },
  ]);

  return (
    <>
      <KeyboardShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
