'use client';

// ============================================================================
// COMMUNITY SHELL — Wrapper de layout para páginas da comunidade
// ============================================================================

import React from 'react';
import { CommunityNav, type CommunityUser } from './CommunityNav';

interface CommunityShellProps {
  user?: CommunityUser | null;
  children: React.ReactNode;
}

export function CommunityShell({ user, children }: CommunityShellProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      <CommunityNav user={user} />
      {/* Padding-bottom no mobile pra dar espaço pra bottom nav.
          tabIndex={-1} + id="main-content" permitem o skip-to-content
          (WCAG 2.4.1) focar este main quando ativado via teclado. */}
      <main
        id="main-content"
        tabIndex={-1}
        className="pb-16 md:pb-0 focus:outline-none"
      >
        {children}
      </main>
    </div>
  );
}
