// ============================================================================
// (community) layout — Aplica a shell da comunidade em todas as rotas
// ============================================================================
//
// Wave 11 (auth integration): Agora busca o user real do Supabase Auth via
// cookie session (`createServerClient`). Mapeia para o shape esperado pelo
// CommunityNav (`CommunityUser`). Avatar/notificationsCount ficam nulos
// porque o fetch adicional de Prisma fica para uma rota /api/users/me (já
// existe) chamada client-side após hydration. Evita query extra no SSR.
//
// Se Supabase não está configurado (sandbox) ou o user não está logado,
// passa `user={null}` — o CommunityNav já trata esse caso exibindo botão
// "Entrar" que aponta para /login.
// ============================================================================

import React from 'react';
import { CommunityShell } from '@/components/community/CommunityShell';
import type { CommunityUser } from '@/components/community/CommunityNav';
import { createClient } from '@/lib/supabase/server';
import { SkipLinks } from '@/components/a11y/SkipLinks';

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await loadCurrentUser();
  return (
    <>
      {/*
        W34 a11y polish — Skip links multi-alvo (WCAG 2.4.1 Bypass Blocks).
        Renderizado fora do CommunityShell para ser o PRIMEIRO item focável
        em toda página da comunidade. Default targets: main-content /
        primary-nav / site-footer.
      */}
      <SkipLinks />
      <CommunityShell user={user}>{children}</CommunityShell>
    </>
  );
}

/**
 * Carrega o user atual via Supabase Auth (server-side cookie session).
 *
 * Returns `null` quando:
 *  - Supabase não está configurado (sandbox)
 *  - Não há sessão válida (user não logado)
 *  - Erro inesperado (não bloqueia render — UX degrada pra "Entrar")
 */
async function loadCurrentUser(): Promise<CommunityUser | null> {
  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Map Supabase User → CommunityUser (shape mínimo — sem Prisma query
    // no SSR para evitar custo em toda navegação).
    const email = user.email ?? '';
    const displayName =
      (user.user_metadata?.full_name as string | undefined) ??
      email.split('@')[0] ??
      'Membro';

    return {
      id: user.id,
      handle: email.split('@')[0] ?? user.id.slice(0, 8),
      displayName,
      // avatarUrl/notificationsCount ficam para fetch client-side
      // (useUserPreferences / useCommunityNotifications).
      avatarUrl: undefined,
      notificationsCount: undefined,
    };
  } catch {
    // Fail-open: se algo falhar no SSR, deixa o client resolver.
    return null;
  }
}
