// ============================================================================
// DPO DASHBOARD — /admin/lgpd
// ============================================================================
// Painel do Data Protection Officer (Encarregado de Proteção de Dados).
// Visão executiva de:
//   1. Versão ativa da política de privacidade
//   2. Export requests (PENDING, PROCESSING, READY, EXPIRED, FAILED)
//   3. Deletion requests (soft delete ativo, scheduled hard delete)
//   4. Audit log summary (total, last 24h, hash chain status)
//   5. Compliance report (monthly metrics)
//   6. Re-consent queue size
//
// Auth: admin only (AdminLayout already enforces).
// ============================================================================

import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import {
  Shield,
  Download,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { getCurrentConsentVersion, reconsentQueueSize } from '@/lib/lgpd/consent';
import { pendingDeletionRequestsCount } from '@/lib/lgpd/data-deletion';
import { auditStats } from '@/lib/lgpd/audit-logger';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'DPO Dashboard — LGPD Compliance',
  description: 'Painel do Encarregado de Proteção de Dados',
  robots: 'noindex, nofollow',
};

export const dynamic = 'force-dynamic';

export default async function DPODashboardPage() {
  // Carrega métricas em paralelo
  const [
    currentVersion,
    queueSize,
    deletionPending,
    stats,
    recentExports,
    recentDeletions,
  ] = await Promise.all([
    getCurrentConsentVersion().catch(() => '1.0.0'),
    reconsentQueueSize().catch(() => 0),
    pendingDeletionRequestsCount().catch(() => 0),
    auditStats().catch(() => ({
      totalEntries: 0,
      last24h: 0,
      byAction: [],
      oldestEntry: null,
      hashChainStatus: 'UNVERIFIED' as const,
      generatedAt: new Date().toISOString(),
    })),
    prisma.dataExportRequest
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          userId: true,
          status: true,
          format: true,
          expiresAt: true,
          createdAt: true,
        },
      })
      .catch(() => []),
    prisma.user
      .findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          displayName: true,
          email: true,
          deletedAt: true,
        },
      })
      .catch(() => []),
  ]);

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100">
      <CosmicBackground />

      <div className="container relative z-10 mx-auto px-4 py-8">
        <AdminNav active="lgpd" />

        {/* Header */}
        <header className="mb-8 mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-200">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            DPO Dashboard
          </div>
          <Heading level={1} className="mt-3 text-3xl">
            LGPD Compliance
          </Heading>
          <p className="mt-2 text-sm text-slate-400">
            Painel do Encarregado de Proteção de Dados · Lei 13.709/2018 ·
            Atualizado em {new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
          </p>
        </header>

        {/* KPIs */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Versão da Política"
            value={currentVersion}
            icon={<FileText className="h-5 w-5" />}
            accent="purple"
            sublabel="vigente"
          />
          <KPICard
            label="Audit Log Entries"
            value={stats.totalEntries.toLocaleString('pt-BR')}
            icon={<Shield className="h-5 w-5" />}
            accent="green"
            sublabel={`+${stats.last24h} últimas 24h`}
          />
          <KPICard
            label="Pending Exports"
            value={recentExports.filter((e) => ['PENDING', 'PROCESSING', 'READY'].includes(e.status)).length.toString()}
            icon={<Download className="h-5 w-5" />}
            accent="blue"
            sublabel="últimas 10 requests"
          />
          <KPICard
            label="Pending Deletions"
            value={deletionPending.toString()}
            icon={<Trash2 className="h-5 w-5" />}
            accent="orange"
            sublabel="soft-delete ativo"
          />
        </section>

        {/* Hash chain status + Reconsent queue */}
        <section className="mb-8 grid gap-4 lg:grid-cols-2">
          {/* Hash chain */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-6">
            <div className="mb-3 flex items-center gap-2">
              {stats.hashChainStatus === 'OK' ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-400" />
              )}
              <Heading level={3} className="text-lg">
                Hash Chain Audit Log
              </Heading>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span
                  className={`font-mono ${
                    stats.hashChainStatus === 'OK' ? 'text-green-300' : 'text-orange-300'
                  }`}
                >
                  {stats.hashChainStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Oldest entry</span>
                <span className="text-slate-200">
                  {stats.oldestEntry
                    ? new Date(stats.oldestEntry).toLocaleDateString('pt-BR')
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Retention</span>
                <span className="text-slate-200">5 anos (Art. 37 + 16, IV)</span>
              </div>
            </div>
          </div>

          {/* Re-consent queue */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-6">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-300" />
              <Heading level={3} className="text-lg">
                Re-consent Queue
              </Heading>
            </div>
            <p className="mb-3 text-sm text-slate-300">
              Titulares que precisam re-aceitar a versão atual da política.
            </p>
            <div className="text-3xl font-bold text-purple-300">{queueSize}</div>
            <p className="mt-1 text-xs text-slate-400">
              {queueSize > 0
                ? 'Considere comunicar via newsletter sobre mudanças.'
                : 'Tudo em dia — sem pendências.'}
            </p>
          </div>
        </section>

        {/* Recent exports */}
        <section className="mb-8 rounded-lg border border-slate-700/50 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-300" />
              <Heading level={3} className="text-lg">
                Export Requests Recentes
              </Heading>
            </div>
            <span className="text-xs text-slate-400">últimas 10</span>
          </div>

          {recentExports.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              Nenhuma export request registrada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-xs uppercase text-slate-400">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">User</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Format</th>
                    <th className="pb-2">Expira</th>
                    <th className="pb-2">Criado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExports.map((e) => (
                    <tr key={e.id} className="border-b border-slate-800">
                      <td className="py-2 font-mono text-xs text-slate-300">
                        {e.id.slice(0, 12)}…
                      </td>
                      <td className="py-2 font-mono text-xs text-slate-400">
                        {e.userId.slice(0, 12)}…
                      </td>
                      <td className="py-2">
                        <ExportStatusBadge status={e.status} />
                      </td>
                      <td className="py-2 text-slate-300">{e.format}</td>
                      <td className="py-2 text-xs text-slate-400">
                        {e.expiresAt
                          ? new Date(e.expiresAt).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td className="py-2 text-xs text-slate-400">
                        {new Date(e.createdAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent deletions */}
        <section className="mb-8 rounded-lg border border-slate-700/50 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-orange-300" />
              <Heading level={3} className="text-lg">
                Soft Deletions Ativas
              </Heading>
            </div>
            <span className="text-xs text-slate-400">últimas 10</span>
          </div>

          {recentDeletions.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              Nenhuma exclusão ativa.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left text-xs uppercase text-slate-400">
                    <th className="pb-2">User ID</th>
                    <th className="pb-2">Display</th>
                    <th className="pb-2">Soft Delete em</th>
                    <th className="pb-2">Hard Delete em</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeletions.map((u) => {
                    const softDate = u.deletedAt!;
                    const hardDate = new Date(softDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                    return (
                      <tr key={u.id} className="border-b border-slate-800">
                        <td className="py-2 font-mono text-xs text-slate-300">
                          {u.id.slice(0, 12)}…
                        </td>
                        <td className="py-2 text-slate-300">
                          {u.displayName}
                        </td>
                        <td className="py-2 text-xs text-slate-400">
                          {softDate.toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2 text-xs">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {hardDate.toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Audit log summary */}
        <section className="mb-8 rounded-lg border border-slate-700/50 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-300" />
            <Heading level={3} className="text-lg">
              Audit Log — Top Actions
            </Heading>
          </div>

          {stats.byAction.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              Sem dados ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {stats.byAction.slice(0, 10).map((a) => (
                <div key={a.action} className="flex items-center gap-3">
                  <code className="font-mono text-xs text-slate-300">{a.action}</code>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-purple-500"
                      style={{
                        width: `${Math.min(100, (a.count / Math.max(...stats.byAction.map((x) => x.count))) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs text-slate-400">
                    {a.count}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex gap-2 text-xs">
            <a
              href="/api/admin/lgpd/audit-log?format=csv"
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-200 hover:bg-slate-700"
            >
              Export CSV (DPO)
            </a>
            <a
              href="/api/admin/lgpd/dashboard"
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-slate-200 hover:bg-slate-700"
            >
              API JSON
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500">
          <p>
            Wave 37 · LGPD Compliance 7/8 · {stats.generatedAt}
          </p>
        </footer>
      </div>
    </main>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function KPICard({
  label,
  value,
  sublabel,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
  accent: 'purple' | 'green' | 'blue' | 'orange';
}) {
  const accentMap = {
    purple: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    green: 'border-green-500/30 bg-green-500/10 text-green-300',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    orange: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  };
  return (
    <div className={`rounded-lg border p-5 ${accentMap[accent].split(' ').slice(0, 2).join(' ')}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
        <span className={accentMap[accent].split(' ')[2]}>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-100">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{sublabel}</div>
    </div>
  );
}

function ExportStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-300',
    PROCESSING: 'bg-blue-500/20 text-blue-300',
    READY: 'bg-green-500/20 text-green-300',
    EXPIRED: 'bg-slate-500/20 text-slate-400',
    FAILED: 'bg-red-500/20 text-red-300',
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs ${map[status] ?? 'bg-slate-500/20 text-slate-300'}`}>
      {status}
    </span>
  );
}