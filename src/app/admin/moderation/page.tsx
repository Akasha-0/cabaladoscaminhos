// ============================================================================
// /admin/moderation — Fila de moderação (Wave 20)
// ============================================================================
// Server Component carrega flags PENDING; Queue client-side gerencia ações.
//
// W29 (2026-06-29) — Movido de src/app/(admin)/moderation/page.tsx para
// resolver a colisão de rotas e alinhar com AdminNav.
// ============================================================================

import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';
import { ModerationQueue } from '@/components/admin/ModerationQueue';
import { getModerationQueue } from '@/lib/admin/metrics';

export const metadata: Metadata = {
  title: 'Admin · Moderação',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const REASON_LABEL: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Assédio',
  MISINFO: 'Desinformação',
  OTHER: 'Outro',
};

const REASON_TONE: Record<string, string> = {
  SPAM: 'bg-amber-500/15 text-amber-300 border-amber-700/40',
  HARASSMENT: 'bg-rose-500/15 text-rose-300 border-rose-700/40',
  MISINFO: 'bg-orange-500/15 text-orange-300 border-orange-700/40',
  OTHER: 'bg-slate-500/15 text-slate-300 border-slate-700/40',
};

export default async function AdminModerationPage() {
  const flags = await getModerationQueue({ status: 'PENDING', limit: 100 });

  // Stats rápidas (PENDING por reason)
  const stats = flags.reduce<Record<string, number>>((acc, f) => {
    acc[f.reason] = (acc[f.reason] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <AdminNav active="/admin/moderation" />

      <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-100">Moderação</h1>
        <p className="text-sm text-slate-400">
          Fila de flags pendentes · ação manual ou em lote
        </p>
      </header>

      {/* Quick stats */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ReasonStat label="Total" value={flags.length} />
        {(['SPAM', 'HARASSMENT', 'MISINFO', 'OTHER'] as const).map((r) => (
          <ReasonStat
            key={r}
            label={REASON_LABEL[r] ?? r}
            value={stats[r] ?? 0}
            toneClass={REASON_TONE[r]}
          />
        ))}
      </div>

      <ModerationQueue initial={flags} />
    </>
  );
}

function ReasonStat({
  label,
  value,
  toneClass,
}: {
  label: string;
  value: number;
  toneClass?: string;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        toneClass ?? 'border-slate-800 bg-slate-900/60'
      }`}
    >
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}