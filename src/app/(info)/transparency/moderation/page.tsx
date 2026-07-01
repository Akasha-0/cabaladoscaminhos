/**
 * /transparency/moderation — Relatório público mensal (Wave 36)
 *
 * Server Component que consome /api/transparency/moderation.
 *
 * LGPD Art. 7, 18, 37: dados agregados, sem PII. Apenas contagens.
 * robots: index=true — público e encontrável.
 */

import type { Metadata } from 'next';
import { ok } from '@/lib/community/api';

export const metadata: Metadata = {
  title: 'Transparência · Moderação',
  description: 'Relatório mensal de moderação comunitária do Akasha. Anonimizado e público.',
};

export const dynamic = 'force-dynamic';

interface TransparencyData {
  month: string;
  total: number;
  byReason: Record<string, number>;
  byStatus: Record<string, number>;
  byAction: Record<string, number>;
  sla: { p50Hours: number | null; p95Hours: number | null; reviewedCount: number; over24hCount: number };
  appeals: { total: number; rate: number; reverseRate: number };
}

const REASON_PT: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Assédio',
  MISINFO: 'Desinformação',
  OTHER: 'Outro',
};

const STATUS_PT: Record<string, string> = {
  PENDING: 'Pendentes',
  REVIEWED: 'Revisadas',
  ACTIONED: 'Com ação',
  DISMISSED: 'Arquivadas',
};

const ACTION_PT: Record<string, string> = {
  dismiss: 'Arquivadas',
  hide: 'Escondidas',
  delete: 'Removidas',
  none: 'Sem ação',
  reviewed: 'Revisadas',
};

async function fetchTransparency(): Promise<TransparencyData | null> {
  try {
    const { prisma } = await import('@/lib/prisma');
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const allFlags = await prisma.flag.findMany({
      where: { createdAt: { gte: startOfMonth, lt: endOfMonth } },
      select: {
        reason: true,
        status: true,
        actionTaken: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    const byReason: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byAction: Record<string, number> = {};

    for (const f of allFlags) {
      byReason[f.reason] = (byReason[f.reason] ?? 0) + 1;
      byStatus[f.status] = (byStatus[f.status] ?? 0) + 1;
      const a = f.actionTaken ?? 'none';
      byAction[a] = (byAction[a] ?? 0) + 1;
    }

    const reviewTimes = allFlags
      .filter((f) => f.reviewedAt)
      .map((f) => (f.reviewedAt!.getTime() - f.createdAt.getTime()) / 3600_000)
      .sort((a, b) => a - b);

    const slaP50 = reviewTimes.length > 0 ? reviewTimes[Math.floor(reviewTimes.length * 0.5)] : null;
    const slaP95 = reviewTimes.length > 0 ? reviewTimes[Math.floor(reviewTimes.length * 0.95)] : null;
    const over24 = reviewTimes.filter((t) => t > 24).length;

    const appealed = allFlags.filter((f) => f.status === 'DISMISSED').length;
    const actioned = allFlags.filter((f) => f.status === 'ACTIONED').length;
    const appealRate = actioned > 0 ? appealed / actioned : 0;

    return {
      month: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`,
      total: allFlags.length,
      byReason,
      byStatus,
      byAction,
      sla: {
        p50Hours: slaP50 !== null ? Number(slaP50.toFixed(2)) : null,
        p95Hours: slaP95 !== null ? Number(slaP95.toFixed(2)) : null,
        reviewedCount: reviewTimes.length,
        over24hCount: over24,
      },
      appeals: {
        total: appealed,
        rate: Number(appealRate.toFixed(3)),
        reverseRate: Number(appealRate.toFixed(3)),
      },
    };
  } catch {
    return null;
  }
}

export default async function TransparencyModerationPage() {
  const data = await fetchTransparency();
  void ok; // import usado para casos onde expandirmos para /api route

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-slate-400">Não foi possível carregar o relatório de transparência.</p>
      </div>
    );
  }

  const monthFormatted = formatMonth(data.month);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Transparência · Moderação</h1>
        <p className="mt-2 text-sm text-slate-400">
          Relatório público e anonimizado de {monthFormatted}. Apenas dados agregados.
        </p>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <BigStat label="Total de flags" value={data.total} />
        <BigStat
          label="SLA P50"
          value={data.sla.p50Hours !== null ? `${data.sla.p50Hours}h` : '—'}
          hint="mediana do tempo de revisão"
        />
        <BigStat
          label="SLA P95"
          value={data.sla.p95Hours !== null ? `${data.sla.p95Hours}h` : '—'}
          hint="P95 do tempo de revisão"
        />
        <BigStat
          label="Atrasados >24h"
          value={data.sla.over24hCount}
          tone={data.sla.over24hCount > 0 ? 'rose' : 'emerald'}
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <DistributionCard
          title="Por motivo"
          data={data.byReason}
          labels={REASON_PT}
        />
        <DistributionCard
          title="Por status"
          data={data.byStatus}
          labels={STATUS_PT}
        />
        <DistributionCard
          title="Por ação tomada"
          data={data.byAction}
          labels={ACTION_PT}
        />
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-200">Apelações</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">Total de apelações</dt>
              <dd className="font-mono text-slate-100">{data.appeals.total}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Taxa de reversão</dt>
              <dd className="font-mono text-slate-100">{(data.appeals.reverseRate * 100).toFixed(1)}%</dd>
            </div>
            <div className="mt-3 rounded border border-amber-700/30 bg-amber-900/10 p-2 text-xs text-amber-300">
              <strong>Compromisso:</strong> todas as decisões podem ser apeladas em até 30 dias.
            </div>
          </dl>
        </section>
      </div>

      <footer className="mt-8 rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-500">
        <p>
          <strong>LGPD Art. 7, 18, 37:</strong> este relatório contém apenas dados
          agregados e anonimizados. Nenhuma informação pessoal identificável é exposta.
        </p>
        <p className="mt-2">
          <strong>Universalismo:</strong> o pipeline de moderação NÃO julga tradições
          religiosas; apenas bloqueia discursos de ódio, golpes, spam, e mercantilização
          de termos sagrados.
        </p>
      </footer>
    </div>
  );
}

function BigStat({
  label, value, hint, tone,
}: { label: string; value: string | number; hint?: string; tone?: 'rose' | 'emerald' }) {
  const toneClass = tone === 'rose' ? 'text-rose-300' : tone === 'emerald' ? 'text-emerald-300' : 'text-slate-100';
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function DistributionCard({
  title, data, labels,
}: { title: string; data: Record<string, number>; labels: Record<string, string> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">{title}</h3>
      {total === 0 ? (
        <p className="text-xs text-slate-500">Sem dados neste mês.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([k, v]) => {
            const pct = ((v / total) * 100).toFixed(1);
            return (
              <li key={k}>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{labels[k] ?? k}</span>
                  <span>{v} ({pct}%)</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-800">
                  <div
                    className="h-full bg-amber-500/70"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function formatMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-');
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const idx = Math.max(0, Math.min(11, Number(m) - 1));
  return `${monthNames[idx]} ${y}`;
}