'use client';

// ============================================================================
// /admin/support — Agent dashboard (Wave 37)
// ============================================================================
// Fila de tickets (assigned-to-me + unassigned), filtros, busca,
// SLA tracking, stats agregados.
//
// Acessibilidade: tabela semântica, aria-live para mudanças.
// ============================================================================

import { useEffect, useMemo, useState } from 'react';

type TicketStatus = 'NEW' | 'OPEN' | 'PENDING_CUSTOMER' | 'PENDING_AGENT' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type TicketCategory = 'BILLING' | 'TECHNICAL' | 'CONTENT' | 'COMMUNITY' | 'ACCOUNT' | 'OTHER';

interface QueueTicket {
  id: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  subject: string;
  email: string | null;
  assignedTo: string | null;
  team: string | null;
  createdAt: string;
  updatedAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  satisfactionRating: number | null;
  _count: { messages: number };
  sla: { breached: boolean; atRisk: boolean; hoursRemaining: number };
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  NEW: 'Novo',
  OPEN: 'Em atendimento',
  PENDING_CUSTOMER: 'Aguardando cliente',
  PENDING_AGENT: 'Aguardando agente',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
};

const PRIORITY_BADGES: Record<TicketPriority, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
};

export default function AgentDashboardPage() {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<{ status?: TicketStatus; team?: string; mine?: boolean; unassigned?: boolean; q?: string }>({});
  const [stats, setStats] = useState({ total: 0, open: 0, breached: 0, atRisk: 0 });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    if (filter.team) params.set('team', filter.team);
    if (filter.unassigned) params.set('unassigned', 'true');
    if (filter.q) params.set('q', filter.q);
    fetch(`/api/admin/support/tickets?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setTickets(data.tickets ?? []);
        setStats({
          total: data.pagination?.total ?? 0,
          open: (data.tickets ?? []).filter((t: QueueTicket) => t.status === 'OPEN' || t.status === 'NEW').length,
          breached: (data.tickets ?? []).filter((t: QueueTicket) => t.sla.breached).length,
          atRisk: (data.tickets ?? []).filter((t: QueueTicket) => t.sla.atRisk).length,
        });
      })
      .catch(() => {
        // ignore
      })
      .finally(() => setLoading(false));
  }, [filter]);

  async function updateTicket(id: string, patch: Partial<{ status: TicketStatus; priority: TicketPriority; assignedTo: string | null }>) {
    await fetch(`/api/admin/support/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setFilter({ ...filter }); // refresh
  }

  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      // URGENT first, then by SLA atRisk/breached, then oldest
      const prioOrder: Record<TicketPriority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      if (a.sla.breached !== b.sla.breached) return a.sla.breached ? -1 : 1;
      if (a.sla.atRisk !== b.sla.atRisk) return a.sla.atRisk ? -1 : 1;
      if (a.priority !== b.priority) return prioOrder[a.priority] - prioOrder[b.priority];
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [tickets]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel de Suporte</h1>
          <p className="text-sm text-slate-600">Fila de tickets, SLA e estatísticas</p>
        </div>
      </header>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total na fila" value={stats.total} />
        <StatCard label="Abertos" value={stats.open} />
        <StatCard label="SLA em risco" value={stats.atRisk} accent="amber" />
        <StatCard label="SLA estourado" value={stats.breached} accent="red" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Buscar assunto, email…"
          aria-label="Buscar"
          value={filter.q ?? ''}
          onChange={(e) => setFilter({ ...filter, q: e.target.value })}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          aria-label="Status"
          value={filter.status ?? ''}
          onChange={(e) => setFilter({ ...filter, status: (e.target.value || undefined) as TicketStatus | undefined })}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          aria-label="Equipe"
          value={filter.team ?? ''}
          onChange={(e) => setFilter({ ...filter, team: e.target.value || undefined })}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todas equipes</option>
          <option value="BILLING">Billing</option>
          <option value="TECHNICAL">Technical</option>
          <option value="CONTENT">Content</option>
          <option value="COMMUNITY">Community</option>
          <option value="ACCOUNT">Account</option>
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={filter.unassigned ?? false}
            onChange={(e) => setFilter({ ...filter, unassigned: e.target.checked })}
          />
          Não atribuídos
        </label>
      </div>

      {/* Queue table */}
      {loading ? (
        <p className="text-slate-500">Carregando fila…</p>
      ) : sortedTickets.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 p-12 text-center text-slate-500">
          Nenhum ticket na fila.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-700">#</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Assunto</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Status</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Prio</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Equipe</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">SLA</th>
                <th className="px-3 py-2 text-left font-medium text-slate-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedTickets.map((t) => (
                <tr key={t.id} className={t.sla.breached ? 'bg-red-50' : t.sla.atRisk ? 'bg-amber-50' : undefined}>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600">{t.id.slice(-6).toUpperCase()}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{t.subject}</p>
                    <p className="text-xs text-slate-500">{t.email ?? 'sem email'} · {t._count.messages} msgs</p>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{STATUS_LABELS[t.status]}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${PRIORITY_BADGES[t.priority]}`}>{t.priority}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{t.team ?? '—'}</td>
                  <td className="px-3 py-2">
                    {t.sla.breached ? (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">⚠️ Estourado</span>
                    ) : t.sla.atRisk ? (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">⏰ {t.sla.hoursRemaining}h</span>
                    ) : (
                      <span className="text-xs text-slate-500">{t.sla.hoursRemaining}h</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                        <button
                          onClick={() => updateTicket(t.id, { status: 'RESOLVED' })}
                          className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
                        >
                          Resolver
                        </button>
                      )}
                      {t.status !== 'CLOSED' && (
                        <button
                          onClick={() => updateTicket(t.id, { status: 'CLOSED' })}
                          className="rounded bg-slate-600 px-2 py-1 text-xs text-white hover:bg-slate-700"
                        >
                          Fechar
                        </button>
                      )}
                      {t.priority !== 'URGENT' && (
                        <button
                          onClick={() => updateTicket(t.id, { priority: 'URGENT' })}
                          className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                        >
                          ↑ Urgente
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: 'red' | 'amber' }) {
  const color = accent === 'red' ? 'text-red-700' : accent === 'amber' ? 'text-amber-700' : 'text-slate-900';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}