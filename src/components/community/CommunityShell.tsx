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
      {/* Padding-bottom no mobile pra dar espaço pra bottom nav */}
      <main className="pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
