// ============================================================================
// /admin/users — Tabela de gerenciamento de usuários (Wave 20)
// ============================================================================
// Server Component — fetch inicial; ações client-side via /api/admin/users.
// ============================================================================

import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';
import { UsersTable } from '@/components/admin/UsersTable';
import { getAdminUsers } from '@/lib/admin/metrics';

export const metadata: Metadata = {
  title: 'Admin · Usuários',
  robots: { index: false, follow: false },
};

// Forçar dynamic — depende de filtros na query string
export const dynamic = 'force-dynamic';

const TRADITIONS = [
  'cabala',
  'ifa',
  'tantra',
  'xamanismo',
  'reiki',
  'ayurveda',
  'astrologia',
  'umbanda',
  'espiritismo',
  'meditacao',
];

interface PageProps {
  searchParams: Promise<{
    q?: string;
    banned?: string;
    mentor?: string;
    tradition?: string;
    sort?: 'recent' | 'name' | 'engagement';
    page?: string;
    pageSize?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const pageSize = Math.min(100, Math.max(5, parseInt(sp.pageSize ?? '20', 10) || 20));

  const result = await getAdminUsers({
    q: sp.q,
    mentor: sp.mentor === 'true' ? true : sp.mentor === 'false' ? false : undefined,
    tradition: sp.tradition,
    sort: sp.sort ?? 'recent',
    page,
    pageSize,
  });

  return (
    <>
      <AdminNav active="/admin/users" />

      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Usuários</h1>
          <p className="text-sm text-slate-400">
            {result.total.toLocaleString('pt-BR')} usuários · página {result.page}
          </p>
        </div>
      </header>

      <UsersTable
        initial={result}
        initialFilters={{
          q: sp.q ?? '',
          mentor: sp.mentor ?? '',
          tradition: sp.tradition ?? '',
          sort: sp.sort ?? 'recent',
        }}
        traditions={TRADITIONS}
      />
    </>
  );
}
