// ============================================================================
// (community) layout — Aplica a shell da comunidade em todas as rotas
// ============================================================================

import React from 'react';
import { CommunityShell } from '@/components/community/CommunityShell';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  // TODO: pegar usuário do Supabase (server component)
  // Por enquanto mock, mas a nav já tá preparada pra null também
  return <CommunityShell user={null}>{children}</CommunityShell>;
}
