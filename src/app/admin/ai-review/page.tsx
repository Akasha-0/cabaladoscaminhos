// ============================================================================
// /admin/ai-review — Human Review Queue para Akasha (Wave 36 — 2026-07-01)
// ============================================================================// Server Component — fetch inicial via service layer.
//
// Amostra aleatória de 1% das conversas Akasha (anonimizadas) é apresentada
// para revisão por Curadores Iyá + 3 auxiliares. Cada conversa recebe:
//
//   - GOOD                    : resposta de qualidade, vai pro fine-tune set
//   - NEEDS_IMPROVEMENT       : resposta correta mas pode melhorar
//   - UNSAFE                  : viola constituição ou guardrail (ação urgente)
//   - REFUSED_CORRECTLY       : recusa foi apropriada (feedback positivo)
//
// Decisões são registradas no AkashaReviewQueue (schema.prisma) e alimentam:
//   - Fine-tune dataset (GOOD)
//   - Pattern flag (UNSAFE → investigar)
//   - Negative examples (NEEDS_IMPROVEMENT)
//
// Restrição de acesso: requireAdmin() (curadores são admin).
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/AdminNav';
import { listReviewQueue, getReviewQueueStats, type ReviewQueueItem } from '@/lib/ai/eval/review-service';

export const metadata: Metadata = {
  title: 'Admin · Akasha AI Review',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface AdminAIReviewPageProps {
  searchParams: { tag?: string; status?: string };
}

export default async function AdminAIReviewPage({ searchParams }: AdminAIReviewPageProps) {
  const tag = searchParams.tag ?? 'all';
  const status = searchParams.status ?? 'PENDING';

  const [items, stats] = await Promise.all([
    listReviewQueue({ tag, status }),
    getReviewQueueStats(),
  ]);

  return (
    <>
      <AdminNav active="ai-review" />

      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-50">
          🛡️ Akasha AI Review Queue
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Amostra de 1% das conversas Akasha para curadoria humana. Iyá + 3 auxiliares revisam.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard label="Pendente" value={stats.PENDING} color="amber" />
        <StatCard label="GOOD" value={stats.GOOD} color="green" />
        <StatCard label="Needs Improve" value={stats.NEEDS_IMPROVEMENT} color="yellow" />
        <StatCard label="UNSAFE" value={stats.UNSAFE} color="red" />
        <StatCard label="Refused OK" value={stats.REFUSED_CORRECTLY} color="blue" />
      </section>

      {/* Filters */}
      <nav className="mb-4 flex flex-wrap gap-2 text-sm">
        {['PENDING', 'GOOD', 'NEEDS_IMPROVEMENT', 'UNSAFE', 'REFUSED_CORRECTLY'].map((s) => (
          <Link
            key={s}
            href={`/admin/ai-review?status=${s}`}
            className={`px-3 py-1 rounded-full border transition-colors ${
              status === s
                ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {s}
          </Link>
        ))}
        <span className="mx-2 self-center text-slate-600">·</span>
        {['all', 'lgpd', 'safety', 'refusal', 'tradition'].map((t) => (
          <Link
            key={t}
            href={`/admin/ai-review?tag=${t}&status=${status}`}
            className={`px-2 py-1 rounded text-xs ${
              tag === t ? 'text-sky-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            #{t}
          </Link>
        ))}
      </nav>

      {/* Queue */}
      <section className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8 text-center">
            <p className="text-slate-400">Nenhuma conversa com filtro {status}/{tag}.</p>
            <p className="text-slate-500 text-xs mt-2">
              Akasha está gerando ~X conversas/dia. Amostra de 1% = ~X itens/dia.
            </p>
          </div>
        ) : (
          items.map((item) => <ReviewCard key={item.id} item={item} />)
        )}
      </section>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    green: 'border-green-500/30 bg-green-500/10 text-green-200',
    yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-200',
    red: 'border-red-500/30 bg-red-500/10 text-red-200',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color] ?? colors.amber}`}>
      <div className="text-xs uppercase opacity-80">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function ReviewCard({ item }: { item: ReviewQueueItem }) {
  return (
    <article
      id={item.id}
      className="rounded-lg border border-slate-800 bg-slate-900/40 p-4"
    >
      {/* Meta */}
      <header className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 font-mono">
            {item.id}
          </span>
          {item.tradition && (
            <span className="rounded bg-sky-500/20 text-sky-300 px-2 py-0.5">
              {item.tradition}
            </span>
          )}
          {item.tags.map((t) => (
            <span key={t} className="rounded bg-slate-700 text-slate-300 px-2 py-0.5 text-xs">
              #{t}
            </span>
          ))}
          <span className="text-slate-500">· {new Date(item.createdAt).toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">latency: {item.latencyMs}ms</span>
          <span
            className={`rounded px-2 py-0.5 ${
              item.seal === 'GREEN'
                ? 'bg-green-500/20 text-green-300'
                : item.seal === 'YELLOW'
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'bg-red-500/20 text-red-300'
            }`}
          >
            {item.seal}
          </span>
        </div>
      </header>

      {/* User message */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-slate-400 mb-1">USER</div>
        <div className="rounded bg-slate-800/60 px-3 py-2 text-sm text-slate-200">
          {item.userMessage}
        </div>
      </div>

      {/* Akasha response */}
      <div className="mb-3">
        <div className="text-xs font-semibold text-slate-400 mb-1">AKASHA</div>
        <div className="rounded bg-slate-800/60 px-3 py-2 text-sm text-slate-200 whitespace-pre-wrap">
          {item.akashaResponse}
        </div>
      </div>

      {/* Auto-detected */}
      {item.autoNotes && (
        <div className="mb-3 text-xs text-slate-500">
          <strong>Auto:</strong> {item.autoNotes}
        </div>
      )}

      {/* Reviewer notes (if any) */}
      {item.reviewerNotes && (
        <div className="mb-3 rounded border-l-2 border-amber-500 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
          <strong>Notas do curador:</strong> {item.reviewerNotes}
        </div>
      )}

      {/* Actions */}
      <form action={`/api/admin/ai-review/${item.id}/decide`} method="POST" className="flex flex-wrap gap-2 mt-3">
        <button
          type="submit"
          name="decision"
          value="GOOD"
          className="rounded bg-green-600/80 hover:bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          ✓ GOOD (fine-tune)
        </button>
        <button
          type="submit"
          name="decision"
          value="NEEDS_IMPROVEMENT"
          className="rounded bg-yellow-600/80 hover:bg-yellow-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          ⚠️ Needs Improve
        </button>
        <button
          type="submit"
          name="decision"
          value="UNSAFE"
          className="rounded bg-red-600/80 hover:bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          🚨 UNSAFE
        </button>
        <button
          type="submit"
          name="decision"
          value="REFUSED_CORRECTLY"
          className="rounded bg-blue-600/80 hover:bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          🛡️ Refused OK
        </button>
        <input
          type="text"
          name="notes"
          placeholder="Notas (opcional)"
          className="flex-1 min-w-[200px] rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs"
        />
      </form>
    </article>
  );
}
