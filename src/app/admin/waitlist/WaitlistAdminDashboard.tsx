'use client';

/**
 * WaitlistAdminDashboard — Client island com tabela interativa, filtros e
 * ações (send invite / reject / export CSV).
 *
 * Carrega dados via fetch('/api/waitlist?admin_token=...') no mount e refetch
 * quando filtros mudam (via router.refresh / revalidate).
 */

import { useState, useTransition, useMemo, useEffect } from 'react';
import {
  Search,
  Download,
  Send,
  XCircle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  Mail,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Lead {
  position: number;
  email: string;
  displayName?: string;
  tradition: string | null;
  profile: string | null;
  status: 'pending' | 'confirmed' | 'invited' | 'accepted' | 'rejected' | 'unsubscribed';
  score: number;
  referralCount: number;
  referredBy: string | null;
  lgpdConsent: boolean;
  marketingConsent: boolean;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  capacity: number;
  remaining: number;
  confirmed: number;
  conversionRate: number;
  topTraditions: Array<{ tradition: string; count: number }>;
  waves: Array<{ wave: number; size: number; filled: number }>;
}

interface AdminPayload extends Stats {
  leads: Lead[];
}

const TRADITION_LABELS: Record<string, string> = {
  cigano: 'Cigano',
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
  'nao-declarada': '—',
};

const STATUS_LABELS: Record<Lead['status'], string> = {
  pending: 'Aguardando confirmação',
  confirmed: 'Confirmado',
  invited: 'Convidado',
  accepted: 'Aceito (no beta)',
  rejected: 'Rejeitado',
  unsubscribed: 'Saiu da fila',
};

const STATUS_BADGES: Record<Lead['status'], string> = {
  pending: 'bg-slate-700 text-slate-300',
  confirmed: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  invited: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  accepted: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-300 border border-red-500/30',
  unsubscribed: 'bg-slate-800 text-slate-500 line-through',
};

export function WaitlistAdminDashboard({
  initialFilters,
}: {
  initialFilters: {
    status: string;
    tradition: string;
    sort: string;
    q: string;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Fetch data on mount + when filters change
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Pega token de env (server-injected via window ou hardcoded em dev)
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? '';
      const res = await fetch(`/api/waitlist?admin_token=${encodeURIComponent(adminToken)}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const payload = (await res.json()) as AdminPayload;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
     
  }, [searchParams]);

  // Apply filters client-side
  const filteredLeads = useMemo(() => {
    if (!data) return [];
    let leads = [...data.leads];
    if (initialFilters.status) {
      leads = leads.filter((l) => l.status === initialFilters.status);
    }
    if (initialFilters.tradition) {
      leads = leads.filter((l) => l.tradition === initialFilters.tradition);
    }
    if (initialFilters.q) {
      const q = initialFilters.q.toLowerCase();
      leads = leads.filter(
        (l) =>
          l.email.toLowerCase().includes(q) ||
          (l.displayName ?? '').toLowerCase().includes(q),
      );
    }
    // Sort
    const sort = initialFilters.sort;
    leads.sort((a, b) => {
      switch (sort) {
        case 'score-desc':
          return b.score - a.score;
        case 'score-asc':
          return a.score - b.score;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return b.score - a.score;
      }
    });
    return leads;
  }, [data, initialFilters]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.push(`/admin/waitlist?${params.toString()}`);
    });
  };

  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? '';

  const handleSendInvite = async (email: string, waveNumber: 1 | 2 | 3) => {
    if (!confirm(`Enviar invite da Onda ${waveNumber} para ${email}?`)) return;
    setBusyEmail(email);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ action: 'send_invite', email, waveNumber }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(`Erro: ${payload?.error ?? res.statusText}`);
        return;
      }
      await fetchData();
    } catch (err) {
      alert(`Erro: ${err instanceof Error ? err.message : 'desconhecido'}`);
    } finally {
      setBusyEmail(null);
    }
  };

  const handleReject = async (email: string) => {
    if (!confirm(`Rejeitar ${email} da fila?`)) return;
    setBusyEmail(email);
    try {
      await fetch('/api/waitlist', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ action: 'reject', email }),
      });
      await fetchData();
    } finally {
      setBusyEmail(null);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const headers = [
      'position',
      'email',
      'displayName',
      'tradition',
      'profile',
      'status',
      'score',
      'referralCount',
      'referredBy',
      'lgpdConsent',
      'marketingConsent',
      'source',
      'createdAt',
      'updatedAt',
    ];
    const rows = filteredLeads.map((l) =>
      headers
        .map((h) => {
          const v = (l as unknown as Record<string, unknown>)[h];
          if (v === null || v === undefined) return '';
          const s = String(v);
          // Escape quotes for CSV
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-8 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-slate-400">Carregando waitlist…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300">
        ❌ Erro ao carregar: {error}. Verifique se ADMIN_API_TOKEN está configurado.
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Stats dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Total na fila"
          value={data.total}
          accent="slate"
        />
        <StatCard
          icon={CheckCircle2}
          label="Confirmados"
          value={data.confirmed}
          sub={`${Math.round(data.conversionRate * 100)}% conversão`}
          accent="emerald"
        />
        <StatCard
          icon={Sparkles}
          label="Vagas restantes"
          value={data.remaining}
          sub={`de ${data.capacity} totais`}
          accent="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Top tradição"
          value={data.topTraditions[0]?.count ?? 0}
          sub={data.topTraditions[0]?.tradition ?? '—'}
          accent="violet"
        />
      </div>

      {/* Wave breakdown */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Ondas do beta</h2>
        <div className="grid grid-cols-3 gap-3">
          {data.waves.map((w) => {
            const pct = w.size > 0 ? Math.round((w.filled / w.size) * 100) : 0;
            return (
              <div
                key={w.wave}
                className="rounded-lg bg-slate-950/50 border border-slate-800 p-3"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-slate-500">Onda {w.wave}</span>
                  <span className="text-xs text-slate-400">
                    {w.filled}/{w.size}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-violet-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-slate-500 text-right">{pct}% cheio</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top tradições */}
      {data.topTraditions.length > 0 && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Distribuição por tradição</h2>
          <div className="space-y-1.5">
            {data.topTraditions.slice(0, 7).map((t) => {
              const pct = data.total > 0 ? (t.count / data.total) * 100 : 0;
              return (
                <div key={t.tradition} className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 w-32 truncate">
                    {TRADITION_LABELS[t.tradition] ?? t.tradition}
                  </span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-12 text-right">{t.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtros + tabela */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Buscar por email ou nome…"
              defaultValue={initialFilters.q}
              onChange={(e) => updateFilter('q', e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <select
            value={initialFilters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm"
            aria-label="Filtrar por status"
          >
            <option value="">Todos os status</option>
            <option value="pending">Aguardando confirmação</option>
            <option value="confirmed">Confirmado</option>
            <option value="invited">Convidado</option>
            <option value="accepted">Aceito</option>
            <option value="rejected">Rejeitado</option>
            <option value="unsubscribed">Saiu da fila</option>
          </select>
          <select
            value={initialFilters.tradition}
            onChange={(e) => updateFilter('tradition', e.target.value)}
            className="h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm"
            aria-label="Filtrar por tradição"
          >
            <option value="">Todas as tradições</option>
            {Object.entries(TRADITION_LABELS).map(([slug, label]) => (
              <option key={slug} value={slug}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={initialFilters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm"
            aria-label="Ordenar"
          >
            <option value="score-desc">Score (maior)</option>
            <option value="score-asc">Score (menor)</option>
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
          </select>
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-10 px-3 rounded-lg bg-slate-800 text-slate-100 text-sm font-semibold hover:bg-slate-700 transition flex items-center gap-2"
            title="Exportar CSV"
          >
            <Download className="w-4 h-4" aria-hidden />
            CSV
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left hidden md:table-cell">Nome</th>
                <th className="px-3 py-2 text-left">Tradição</th>
                <th className="px-3 py-2 text-left hidden lg:table-cell">Perfil</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Score</th>
                <th className="px-3 py-2 text-left hidden lg:table-cell">Indicação</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-500 text-sm">
                    Nenhum lead encontrado com esses filtros.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.email}
                    className="border-b border-slate-800/50 hover:bg-slate-950/30 transition-colors"
                  >
                    <td className="px-3 py-2 text-slate-500 font-mono text-xs">
                      #{lead.position}
                    </td>
                    <td className="px-3 py-2 text-slate-100 truncate max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" aria-hidden />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-300 hidden md:table-cell truncate max-w-[120px]">
                      {lead.displayName ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {lead.tradition ? TRADITION_LABELS[lead.tradition] ?? lead.tradition : '—'}
                    </td>
                    <td className="px-3 py-2 text-slate-300 hidden lg:table-cell">
                      {lead.profile ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_BADGES[lead.status]}`}>
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-amber-300 text-xs">
                      {lead.score}
                    </td>
                    <td className="px-3 py-2 text-slate-400 hidden lg:table-cell text-xs">
                      {lead.referralCount > 0 ? `+${lead.referralCount}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {lead.status === 'confirmed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSendInvite(lead.email, 1)}
                              disabled={busyEmail === lead.email}
                              className="h-8 px-2 rounded bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition disabled:opacity-50 flex items-center gap-1"
                              title="Enviar invite (Onda 1)"
                            >
                              <Send className="w-3 h-3" aria-hidden />
                              W1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendInvite(lead.email, 2)}
                              disabled={busyEmail === lead.email}
                              className="h-8 px-2 rounded bg-violet-500/20 text-violet-300 text-xs font-semibold hover:bg-violet-500/30 transition disabled:opacity-50 flex items-center gap-1"
                              title="Enviar invite (Onda 2)"
                            >
                              <Send className="w-3 h-3" aria-hidden />
                              W2
                            </button>
                          </>
                        )}
                        {lead.status !== 'accepted' && lead.status !== 'unsubscribed' && (
                          <button
                            type="button"
                            onClick={() => handleReject(lead.email)}
                            disabled={busyEmail === lead.email}
                            className="h-8 px-2 rounded bg-red-500/10 text-red-300 text-xs hover:bg-red-500/20 transition disabled:opacity-50"
                            title="Rejeitar lead"
                          >
                            <XCircle className="w-3.5 h-3.5" aria-hidden />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
          Mostrando {filteredLeads.length} de {data.total} leads
        </div>
      </div>

      {/* Footer info */}
      <div className="text-xs text-slate-500 space-y-1">
        <p>
          <Clock className="inline w-3 h-3 mr-1" aria-hidden />
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </p>
        <p className="text-slate-600">
          💡 Tokens de confirmação expiram em 7 dias. Tokens de invite expiram em 7 dias após envio.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  sub?: string;
  accent: 'slate' | 'emerald' | 'amber' | 'violet';
}) {
  const colors = {
    slate: 'border-slate-700 text-slate-300',
    emerald: 'border-emerald-500/30 text-emerald-300',
    amber: 'border-amber-500/30 text-amber-300',
    violet: 'border-violet-500/30 text-violet-300',
  }[accent];
  return (
    <div className={`rounded-xl bg-slate-900/60 border ${colors} p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" aria-hidden />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}