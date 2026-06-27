// ============================================================================
// (community) layout — Aplica a shell da comunidade em todas as rotas
// ============================================================================

import React from 'react';
import { CommunityShell } from '@/components/community/CommunityShell';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  // NOTE: User vem do SupabaseProvider client-side. Server-side fetch
  // pode ser adicionado depois via createServerClient (já existe em
  // src/lib/supabase/server.ts). Por enquanto nav lida com user={null}.
  return <CommunityShell user={null}>{children}</CommunityShell>;
}
