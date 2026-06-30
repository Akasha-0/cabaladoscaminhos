// ============================================================================
// /admin/beta — Dashboard de convites beta (Wave 32)
// ============================================================================// Server component: lista convites, mostra stats, e formulário de batch
// generation. Submete via API (client component para batch).
//
// LGPD:
//   - Email completo visível para o admin (necessário para gerenciar)
//   - Token nunca exibido — apenas tokenDisplay (hash mascarado)
// ============================================================================

import Link from 'next/link';
import { requireAdmin } from '@/lib/admin/session';
import { listInvites, getBetaStats } from '@/lib/beta/invites';
import type { InviteStatus } from '@prisma/client';
import { BatchInviteForm } from './BatchInviteForm';
import { RevokeButton } from './RevokeButton';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUS_LABEL: Record<InviteStatus, string> = {
  PENDING: 'Pendente',
  SENT: 'Enviado',
  OPENED: 'Aberto',
  ACCEPTED: 'Aceito',
  EXPIRED: 'Expirado',
  REVOKED: 'Revogado',
};

const STATUS_COLOR: Record<InviteStatus, string> = {
  PENDING: 'bg-slate-700 text-slate-200',
  SENT: 'bg-blue-900/60 text-blue-200',
  OPENED: 'bg-indigo-900/60 text-indigo-200',
  ACCEPTED: 'bg-emerald-900/60 text-emerald-200',
  EXPIRED: 'bg-amber-900/60 text-amber-200',
  REVOKED: 'bg-rose-900/60 text-rose-200',
};

const WAVE_LABEL: Record<1 | 2 | 3, string> = {
  1: 'Wave 1 · Fundadores',
  2: 'Wave 2 · Comunidade',
  3: 'Wave 3 · Abertura',
};

interface PageProps {
  searchParams: {
    wave?: string;
    status?: string;
    email?: string;
    cursor?: string;
  };
}

export default async function AdminBetaPage({ searchParams }: PageProps) {
  const session = await requireAdmin();
  if (!session.ok) {
    return (
      <div className="p-6 text-rose-300">
        Acesso negado: {session.reason}
      </div>
    );
  }

  const waveFilter =
    searchParams.wave === '1' || searchParams.wave === '2' || searchParams.wave === '3'
      ? (parseInt(searchParams.wave, 10) as 1 | 2 | 3)
      : undefined;

  const statusFilter = (
    ['PENDING', 'SENT', 'OPENED', 'ACCEPTED', 'EXPIRED', 'REVOKED'] as InviteStatus[]
  ).includes(searchParams.status as InviteStatus)
    ? (searchParams.status as InviteStatus)
    : undefined;

  const [list, stats] = await Promise.all([
    listInvites({
      wave: waveFilter,
      status: statusFilter,
      emailContains: searchParams.email,
      cursor: searchParams.cursor,
      limit: 50,
    }),
    getBetaStats(),
  ]);

  return (
    <div className="space-y-8">
      {/* ============================================================== */}
      {/* Header + Stats                                                   */}
      {/* ============================================================== */}
      <header>
        <h1 className="font-serif text-2xl text-amber-100 mb-1">
          Beta · Sistema de convites
        </h1>
        <p className="text-sm text-slate-400">
          50 vagas · 3 ondas · single-use tokens com expiração
        </p>
      </header>

      <section
        aria-label="Estatísticas gerais"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <StatCard label="Total" value={stats.total} />
        <StatCard
          label="Aceitos (total)"
          value={stats.byStatus.ACCEPTED}
          tone="emerald"
        />
        <StatCard
          label="Enviados"
          value={stats.byStatus.SENT + stats.byStatus.OPENED}
          tone="indigo"
        />
        <StatCard
          label="Conversão"
          value={`${Math.round(stats.conversionRate * 100)}%`}
          tone="amber"
        />
      </section>

      <section
        aria-label="Distribuição por onda"
        className="grid grid-cols-3 gap-3"
      >
        {[1, 2, 3].map((w) => (
          <div
            key={w}
            className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
          >
            <div className="text-xs uppercase tracking-wider text-slate-400">
              {WAVE_LABEL[w as 1 | 2 | 3]}
            </div>
            <div className="text-2xl font-semibold text-amber-200 mt-1">
              {stats.byWave[w as 1 | 2 | 3]}
            </div>
          </div>
        ))}
      </section>

      <section
        aria-label="Distribuição por status"
        className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
      >
        <h2 className="text-sm font-medium text-slate-200 mb-3">Por status</h2>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABEL) as InviteStatus[]).map((s) => (
            <span
              key={s}
              className={`px-2 py-1 rounded-md text-xs ${STATUS_COLOR[s]}`}
            >
              {STATUS_LABEL[s]}: {stats.byStatus[s]}
            </span>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* Batch generation                                                 */}
      {/* ============================================================== */}
      <section
        aria-label="Gerar novo convite"
        className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
      >
        <h2 className="text-sm font-medium text-slate-200 mb-3">
          Gerar novo convite (batch)
        </h2>
        <BatchInviteForm />
      </section>

      {/* ============================================================== */}
      {/* Filters                                                          */}
      {/* ============================================================== */}
      <section
        aria-label="Filtros"
        className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
      >
        <form className="flex flex-wrap gap-3 items-end">
          <label className="text-xs text-slate-400">
            Onda
            <select
              name="wave"
              defaultValue={searchParams.wave ?? ''}
              className="ml-2 bg-slate-800 text-slate-100 rounded-md px-2 py-1 text-sm"
            >
              <option value="">Todas</option>
              <option value="1">Wave 1</option>
              <option value="2">Wave 2</option>
              <option value="3">Wave 3</option>
            </select>
          </label>

          <label className="text-xs text-slate-400">
            Status
            <select
              name="status"
              defaultValue={searchParams.status ?? ''}
              className="ml-2 bg-slate-800 text-slate-100 rounded-md px-2 py-1 text-sm"
            >
              <option value="">Todos</option>
              {(Object.keys(STATUS_LABEL) as InviteStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-400 flex-1 min-w-[180px]">
            Email contém
            <input
              type="search"
              name="email"
              defaultValue={searchParams.email ?? ''}
              placeholder="ex: @example.com"
              className="ml-2 w-full sm:w-2/3 bg-slate-800 text-slate-100 rounded-md px-2 py-1 text-sm"
            />
          </label>

          <button
            type="submit"
            className="px-3 py-1.5 rounded-md bg-amber-500 text-slate-950 text-sm font-medium hover:bg-amber-400"
          >
            Filtrar
          </button>
        </form>
      </section>

      {/* ============================================================== */}
      {/* Table                                                            */}
      {/* ============================================================== */}
      <section
        aria-label="Convites"
        className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-200">
            Convites ({list.total})
          </h2>
          {list.nextCursor && (
            <Link
              href={{ query: { ...searchParams, cursor: list.nextCursor } }}
              className="text-xs text-amber-300 hover:text-amber-200"
            >
              Próxima página →
            </Link>
          )}
        </div>

        {list.items.length === 0 ? (
          <p className="px-4 py-8 text-sm text-slate-400 text-center">
            Nenhum convite encontrado com esses filtros.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/80 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Onda</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Token</th>
                  <th className="text-left px-4 py-2">Expira</th>
                  <th className="text-left px-4 py-2">Criado</th>
                  <th className="text-right px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {list.items.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-2 text-slate-100 font-mono text-xs">
                      {inv.email}
                    </td>
                    <td className="px-4 py-2 text-slate-300">
                      {WAVE_LABEL[inv.wave as 1 | 2 | 3]}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs ${STATUS_COLOR[inv.status]}`}
                      >
                        {STATUS_LABEL[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-400 font-mono text-xs">
                      {inv.tokenDisplay}
                    </td>
                    <td className="px-4 py-2 text-slate-400 text-xs">
                      {inv.expiresAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2 text-slate-400 text-xs">
                      {inv.createdAt.toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {(inv.status === 'PENDING' ||
                        inv.status === 'SENT' ||
                        inv.status === 'OPENED') && (
                        <RevokeButton inviteId={inv.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  tone = 'slate',
}: {
  label: string;
  value: number | string;
  tone?: 'slate' | 'emerald' | 'indigo' | 'amber';
}) {
  const toneClasses: Record<typeof tone, string> = {
    slate: 'text-slate-100',
    emerald: 'text-emerald-300',
    indigo: 'text-indigo-300',
    amber: 'text-amber-300',
  };
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className={`text-2xl font-semibold mt-1 ${toneClasses[tone]}`}>
        {value}
      </div>
    </div>
  );
}