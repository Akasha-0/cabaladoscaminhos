/**
 * KeyboardShortcutsHelp — Dialog que lista todos os atalhos do cockpit.
 * Acionado pelo atalho `?` no KeyboardShortcutsLayer.
 * Refs: T7.2 (Sprint 8 UX)
 */

'use client';

import { useEffect } from 'react';

export interface ShortcutEntry {
  keys: string;
  description: string;
  scope?: 'global' | 'cockpit' | 'mesa-real';
}

export const CANONICAL_ENTRIES: ShortcutEntry[] = [
  { keys: 'Ctrl + K', description: 'Focar busca de consulentes', scope: 'global' },
  { keys: 'Ctrl + N', description: 'Novo consulente', scope: 'cockpit' },
  { keys: 'Ctrl + S', description: 'Salvar formulário ativo', scope: 'cockpit' },
  { keys: 'Esc', description: 'Fechar dialog/modal aberto', scope: 'global' },
  { keys: '?', description: 'Mostrar esta ajuda', scope: 'global' },
];

export function KeyboardShortcutsHelp({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Atalhos de teclado"
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Atalhos de Teclado</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Tecla</th>
              <th className="py-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {CANONICAL_ENTRIES.map((e) => (
              <tr key={e.keys} className="border-b last:border-0">
                <td className="py-2 pr-4 font-mono">
                  <kbd className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">{e.keys}</kbd>
                </td>
                <td className="py-2">{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-zinc-500 mt-4">Pressione Esc para fechar.</p>
      </div>
    </div>
  );
}
