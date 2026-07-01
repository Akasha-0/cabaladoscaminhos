/**
 * /admin/moderation/queue — Fila refinada (Wave 36)
 *
 * Server Component que carrega fila PENDING com filtros estendidos:
 *   - reason (legacy + via metadata.reason_w36)
 *   - decision (auto-mod)
 *   - sla (overdue 24h+)
 *   - reviewer assignment
 *
 * Bulk actions: APPROVE / HIDE / REMOVE / DISMISS em lote.
 * PATCH /api/admin/moderation/[id]/decision
 */

import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';
import { ModerationQueueAdvanced } from '@/components/admin/ModerationQueueAdvanced';
import { getModerationQueue } from '@/lib/admin/metrics';

export const metadata: Metadata = {
  title: 'Admin · Fila de Moderação',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ModerationQueuePage() {
  const flags = await getModerationQueue({ status: 'PENDING', limit: 200 });

  // Calcular SLA histogram + reason distribution
  const now = Date.now();
  const slaBuckets = { lt_1h: 0, lt_6h: 0, lt_24h: 0, gt_24h: 0 };
  const reasonDist: Record<string, number> = {};

  for (const f of flags) {
    const ageH = (now - f.createdAt.getTime()) / 3600_000;
    if (ageH < 1) slaBuckets.lt_1h++;
    else if (ageH < 6) slaBuckets.lt_6h++;
    else if (ageH < 24) slaBuckets.lt_24h++;
    else slaBuckets.gt_24h++;

    reasonDist[f.reason] = (reasonDist[f.reason] ?? 0) + 1;
  }

  const overdue = slaBuckets.gt_24h;

  return (
    <>
      <AdminNav active="/admin/moderation" />

      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-100">Fila de Moderação</h1>
        <p className="text-sm text-slate-400">
          {flags.length} flags pendentes · {overdue} com SLA &gt; 24h
        </p>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="&lt; 1h" value={slaBuckets.lt_1h} tone="emerald" />
        <Stat label="&lt; 6h" value={slaBuckets.lt_6h} tone="amber" />
        <Stat label="&lt; 24h" value={slaBuckets.lt_24h} tone="orange" />
        <Stat label="&gt; 24h" value={slaBuckets.gt_24h} tone="rose" />
      </div>

      <ModerationQueueAdvanced
        initialFlags={flags}
        reasonDistribution={reasonDist}
      />
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'emerald' | 'amber' | 'orange' | 'rose' }) {
  const tones = {
    emerald: 'border-emerald-700/40 bg-emerald-900/10 text-emerald-300',
    amber: 'border-amber-700/40 bg-amber-900/10 text-amber-300',
    orange: 'border-orange-700/40 bg-orange-900/10 text-orange-300',
    rose: 'border-rose-700/40 bg-rose-900/10 text-rose-300',
  };
  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}