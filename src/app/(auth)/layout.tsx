// ============================================================================
// (auth) layout — Shell mínimo para rotas de autenticação
// ============================================================================
// Não usa CommunityShell (sem nav, sem bottom-nav). Aplica background
// cósmico + centraliza o conteúdo vertical/horizontalmente.
//
// Rotas neste group:
//   - /login
//   - /signup
//   - /reset-password
//   - /verify-email
//
// O guard de auth (redirecionar para /feed quando logado) acontece no
// middleware raiz + src/lib/supabase/middleware.ts (AUTH_PREFIXES).
// ============================================================================

import type { Metadata } from 'next';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';

export const metadata: Metadata = {
  title: 'Akasha Portal · Autenticação',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <CosmicBackground variant="default">
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen flex items-center justify-center px-4 py-10 focus:outline-none"
      >
        {children}
      </main>
    </CosmicBackground>
  );
}
