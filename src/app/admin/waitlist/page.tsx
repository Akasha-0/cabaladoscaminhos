// ============================================================================
// /admin/waitlist — Dashboard admin da lista de espera do beta (Wave 32)
// ============================================================================
// Features:
//   - Stats dashboard (total, conversion, top tradições, por wave)
//   - Tabela de leads com filtros (tradição, status, score range, busca)
//   - CSV export (botão)
//   - Send invite (gera token + manda email)
//   - Ações inline: confirmar manualmente, rejeitar, ver perfil
// ============================================================================

import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';
import { WaitlistAdminDashboard } from './WaitlistAdminDashboard';

export const metadata: Metadata = {
  title: 'Admin · Waitlist Beta',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    tradition?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function AdminWaitlistPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // Passa os filtros como props para o client component
  return (
    <>
      <AdminNav active="/admin/waitlist" />

      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Waitlist Beta</h1>
          <p className="text-sm text-slate-400">
            Lista de espera do beta privado — 50 vagas em 3 ondas (10+20+20)
          </p>
        </div>
      </header>

      <WaitlistAdminDashboard
        initialFilters={{
          status: sp.status ?? '',
          tradition: sp.tradition ?? '',
          sort: sp.sort ?? 'score-desc',
          q: sp.q ?? '',
        }}
      />
    </>
  );
}