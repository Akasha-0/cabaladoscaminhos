// ============================================================================
// /welcome — First-value page (Wave 20)
// ============================================================================
// Renderizado após signup bem-sucedido (magic link confirmado OU password
// signup). Mostra 3 posts recomendados + 3 tradições pré-selecionadas.
// Métrica objetivo: time-to-first-value < 30s.
// ============================================================================

import { Suspense } from 'react';
import { FirstValueExperience } from '@/components/conversion/FirstValueExperience';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export const metadata = {
  title: 'Bem-vindo · Akasha Portal',
  description: 'Sua jornada multi-tradição começa agora.',
};

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <LoadingSpinner variant="gold" size="lg" />
        </div>
      }
    >
      <FirstValueExperience />
    </Suspense>
  );
}
