// src/app/cockpit/settings/page.tsx
// Página de configurações do operator (Fase 20).
// Server Component: auth gate + data fetching para o panel de MFA.
// Área de MFA é Client Component (MfaSetup).
import { redirect } from 'next/navigation';
import { Settings } from 'lucide-react';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { isMfaEnabled } from '@/lib/auth/operator-mfa';
import { MfaSettingsPanel } from '@/components/operator/mfa/MfaSettingsPanel';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  // Pre-load MFA status (avoids extra fetch in client)
  let mfaEnabled = false;
  try {
    mfaEnabled = await isMfaEnabled(operator.id);
  } catch {
    // Non-fatal: client will handle
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center">
          <Settings className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h1 className="font-cinzel text-xl font-bold text-foreground">
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua conta e segurança.
          </p>
        </div>
      </div>

      {/* Operator info */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
          Informações da conta
        </h2>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nome</span>
            <span className="font-medium">{operator.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">E-mail</span>
            <span className="font-medium">{operator.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Função</span>
            <span className="font-medium">{operator.role}</span>
          </div>
        </div>
      </section>

      {/* MFA section */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
          Autenticação em dois fatores
        </h2>
        <div className="rounded-xl border border-border bg-card p-4">
          <MfaSettingsPanel
            initialMfaEnabled={mfaEnabled}
            operatorRole={operator.role}
          />
        </div>
      </section>
    </div>
  );
}
