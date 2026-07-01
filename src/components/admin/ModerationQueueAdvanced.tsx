'use client';

/**
 * ModerationQueueAdvanced — Fila com filtros, bulk actions, SLA badges.
 *
 * W36 deltas:
 *   - Filtros: status, reason, decision, sla
 *   - Bulk actions (select + PATCH)
 *   - SLA badge (verde / âmbar / laranja / vermelho)
 *   - Reason do W36 (sacred-offense, copyright, nsfw) parsed do metadata
 */

import { useState, useTransition, useMemo } from 'react';

interface ModerationFlag {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: string;
  actionTaken: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewerId: string | null;
}

interface Props {
  initialFlags: ModerationFlag[];
  reasonDistribution: Record<string, number>;
}

const REASON_LABEL: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Assédio',
  MISINFO: 'Desinformação',
  OTHER: 'Outro',
  SACRED_OFFENSE: 'Ofensa sagrada',
  COPYRIGHT: 'Copyright',
  NSFW: 'NSFW',
};

const DECISIONS = [
  { value: 'APPROVE', label: 'Aprovar', tone: 'emerald' },
  { value: 'FLAG', label: 'Marcar', tone: 'amber' },
  { value: 'HIDE', label: 'Esconder', tone: 'orange' },
  { value: 'REMOVE', label: 'Remover', tone: 'rose' },
  { value: 'DISMISS', label: 'Arquivar', tone: 'slate' },
] as const;

function slaBucket(createdAt: Date): { label: string; tone: string } {
  const ageH = (Date.now() - createdAt.getTime()) / 3600_000;
  if (ageH < 1) return { label: '<1h', tone: 'bg-emerald-500/20 text-emerald-300' };
  if (ageH < 6) return { label: '<6h', tone: 'bg-amber-500/20 text-amber-300' };
  if (ageH < 24) return { label: '<24h', tone: 'bg-orange-500/20 text-orange-300' };
  return { label: '>24h', tone: 'bg-rose-500/20 text-rose-300' };
}

function parseW36Reason(description: string | null): string | null {
  if (!description) return null;
  const m = description.match(/\[reason_w36:\s*(\w+)\]/);
  return m ? m[1]! : null;
}

export function ModerationQueueAdvanced({ initialFlags, reasonDistribution }: Props) {
  const [flags, setFlags] = useState(initialFlags);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterReason, setFilterReason] = useState<string>('all');
  const [filterSla, setFilterSla] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return flags.filter((f) => {
      if (filterReason !== 'all') {
        const w36 = parseW36Reason(f.description);
        if (f.reason !== filterReason && w36 !== filterReason) return false;
      }
      if (filterSla === 'overdue') {
        const ageH = (Date.now() - f.createdAt.getTime()) / 3600_000;
        if (ageH < 24) return false;
      } else if (filterSla === 'urgent') {
        const ageH = (Date.now() - f.createdAt.getTime()) / 3600_000;
        if (ageH > 6 || ageH < 1) return false;
      }
      return true;
    });
  }, [flags, filterReason, filterSla]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((f) => f.id)));
  };

  const applyBulk = (decision: typeof DECISIONS[number]['value']) => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/moderation/${ids[0]}/decision`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ids, decision }),
        });
        if (res.ok) {
          // Remove flagged items from local list (assumiu transição de status)
          setFlags(flags.filter((f) => !ids.includes(f.id)));
          setSelected(new Set());
        }
      } catch {
        // best-effort
      }
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={filterReason}
          onChange={(e) => setFilterReason(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200"
        >
          <option value="all">Todos os motivos ({flags.length})</option>
          {Object.entries(reasonDistribution).map(([r, n]) => (
            <option key={r} value={r}>
              {REASON_LABEL[r] ?? r} ({n})
            </option>
          ))}
          <option value="SACRED_OFFENSE">Ofensa sagrada (W36)</option>
          <option value="COPYRIGHT">Copyright (W36)</option>
          <option value="NSFW">NSFW (W36)</option>
        </select>

        <select
          value={filterSla}
          onChange={(e) => setFilterSla(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200"
        >
          <option value="all">Todos os SLAs</option>
          <option value="urgent">Urgente (1-6h)</option>
          <option value="overdue">Atrasados (&gt;24h)</option>
        </select>

        {selected.size > 0 && (
          <span className="text-sm text-slate-400">{selected.size} selecionados</span>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 rounded-lg border border-amber-700/40 bg-amber-900/10 p-3">
          <span className="text-xs text-amber-200">Bulk:</span>
          {DECISIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => applyBulk(d.value)}
              disabled={isPending}
              className="rounded border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-50"
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/50 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-3 py-2">SLA</th>
              <th className="px-3 py-2">Motivo</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Contexto</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                  Nenhuma flag com os filtros atuais.
                </td>
              </tr>
            )}
            {filtered.map((f) => {
              const sla = slaBucket(f.createdAt);
              const w36Reason = parseW36Reason(f.description);
              const reason = w36Reason ?? f.reason;
              return (
                <tr key={f.id} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.has(f.id)}
                      onChange={() => toggle(f.id)}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs ${sla.tone}`}>
                      {sla.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-200">{REASON_LABEL[reason] ?? reason}</td>
                  <td className="px-3 py-2 text-xs text-slate-400">{f.targetType}</td>
                  <td className="max-w-xs truncate px-3 py-2 text-xs text-slate-500">
                    {f.description?.replace(/\[reason_w36:\s*\w+\]/, '').slice(0, 80) ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={`/admin/moderation/${f.id}`}
                      className="text-xs text-amber-400 hover:text-amber-300"
                    >
                      abrir →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}