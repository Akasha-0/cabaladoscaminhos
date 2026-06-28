'use client';

/**
 * MobileNavDrawer — BottomSheet wrapper para navegação mobile (Wave 24).
 * ----------------------------------------------------------------------------
 * Substitui o dropdown inline de mobile menu (CommunityNav) por um BottomSheet
 * com swipe-down-to-close, safe-area insets, haptic feedback e focus trap.
 *
 * Por que BottomSheet em vez de dropdown:
 *   - Melhor gesto mobile (swipe down pra fechar)
 *   - Mais espaço vertical para lista de items (até 8 items)
 *   - Safe area correto (iOS home indicator)
 *   - Backdrop dim focus (acessibilidade)
 *
 * Props:
 *   - open, onClose: controlled state
 *   - title: header label
 *   - children: lista de nav items (Links/Buttons)
 *
 * Refs:
 *   - Wave 17 (BottomSheet base) — Material 3 pattern
 *   - Wave 24 — migration para navegação global
 */

import React from 'react';
import { Menu } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';

export interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function MobileNavDrawer({
  open,
  onClose,
  title = 'Menu',
  description,
  children,
}: MobileNavDrawerProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      height="auto"
      sheetClassName="md:!hidden" // Esconde em desktop (md+)
    >
      <nav
        aria-label={title}
        className="flex flex-col gap-1 pb-2"
      >
        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider px-2 pb-2 mb-1 border-b border-slate-800/50">
          <Menu className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Navegação</span>
        </div>
        {children}
      </nav>
    </BottomSheet>
  );
}

export default MobileNavDrawer;
