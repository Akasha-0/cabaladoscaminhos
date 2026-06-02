// src/app/cockpit/page.tsx
// Cockpit Oracular - Professional divination workspace
// Protegido por OperatorAuthGuard (B2B auth — Fase 7+8+11).

'use client';

import { CockpitOracular } from '@/components/cockpit/CockpitOracular';
import { OperatorAuthProvider } from '@/components/providers/OperatorAuthProvider';
import { OperatorAuthGuard } from '@/components/auth/OperatorAuthGuard';

export default function CockpitPage() {
  // Check for debug mode - in production, set to false
  const showDebug = process.env.NODE_ENV === 'development' ||
                    typeof window !== 'undefined' &&
                    window.location.search.includes('debug=true');

  return (
    <OperatorAuthProvider>
      <OperatorAuthGuard>
        {/* `ramiro` aplica a paleta v2 (laranja + azul royal — Doc 13) a todo o cockpit. */}
        <main className="ramiro min-h-screen bg-background text-foreground">
          <CockpitOracular showDebug={showDebug} />
        </main>
      </OperatorAuthGuard>
    </OperatorAuthProvider>
  );
}