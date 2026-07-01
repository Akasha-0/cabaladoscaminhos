// ============================================================================
// /admin/marketing/dashboard — Marketing dashboard (Wave 38)
// ============================================================================
// Server Component — agrega métricas de marketing pós-launch Day 7:
//   - Signup funnel (visitor → signup → activation) com conversion rates
//   - Source attribution (UTM channels) com cost per signup
//   - Conversion per channel (CTR → signup → activation)
//   - Email open/click rates por sequence
//   - Cost per signup (CAC) por canal
//
// W38 (2026-07-01) — Criado como parte do post-launch Day-7 review. Target
// audience: PM (Tomás), Marketing lead, Owner. Renderiza 1 coluna no
// mobile, 2/4 no desktop (mobile-first).
//
// LGPD: aggregate-only, sem PII (UTM source agregado, não raw).
// ============================================================================

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { BarChart, LineChart } from '@/components/admin/charts-client';

export const metadata: Metadata = {
  title: 'Marketing Dashboard — Cabala dos Caminhos',
  description: 'Funnel + attribution + email performance + CAC — Wave 38 Day 7',
};

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface FunnelStep {
  step: string;
  entryCount: number;
  exitCount: number;
  conversionPct: number;
}

interface SourceAttribution {
  source: string;
  visitors: number;
  signups: number;
  activations: number;
  costBRL: number;
  cacBRL: number;
  conversionRate: number;
}

interface EmailSequencePerf {
  sequence: string;
  sent: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
}

interface MarketingSnapshot {
  generatedAt: string;
  windowDays: number;
  funnel: FunnelStep[];
  attribution: SourceAttribution[];
  emailSequences: EmailSequencePerf[];
  totals: {
    visitors: number;
    signups: number;
    activations: number;
    cacBRL: number;
    emailRevenue: number;
  };
}

// ----------------------------------------------------------------------------
// Mock data loader (substituir por query Prisma/PostHog em produção)
// ----------------------------------------------------------------------------

async function getMarketingSnapshot(): Promise<MarketingSnapshot> {
  // Mock representativo do Day-7 review. Em produção:
  // - Funnel: PostHog funnel API
  // - Attribution: UTM parameters + spend logs
  // - Email: Resend/Beehiiv analytics
  return {
    generatedAt: new Date().toISOString(),
    windowDays: 7,
    funnel: [
      { step: 'Visitor → Landing', entryCount: 12000, exitCount: 9600, conversionPct: 80 },
      { step: 'Landing → Signup Start', entryCount: 9600, exitCount: 2880, conversionPct: 30 },
      { step: 'Signup Start → Complete', entryCount: 2880, exitCount: 2304, conversionPct: 80 },
      { step: 'Signup → Tradição', entryCount: 2304, exitCount: 1843, conversionPct: 80 },
      { step: 'Tradição → First Post (activation)', entryCount: 1843, exitCount: 553, conversionPct: 30 },
      { step: 'First Post → Akasha Chat', entryCount: 553, exitCount: 332, conversionPct: 60 },
    ],
    attribution: [
      { source: 'organic_search', visitors: 4800, signups: 384, activations: 154, costBRL: 0, cacBRL: 0, conversionRate: 8 },
      { source: 'instagram_organic', visitors: 3200, signups: 192, activations: 58, costBRL: 0, cacBRL: 0, conversionRate: 6 },
      { source: 'instagram_paid', visitors: 1800, signups: 252, activations: 76, costBRL: 4200, cacBRL: 16.67, conversionRate: 14 },
      { source: 'twitter_organic', visitors: 1100, signups: 88, activations: 35, costBRL: 0, cacBRL: 0, conversionRate: 8 },
      { source: 'facebook_groups', visitors: 600, signups: 72, activations: 22, costBRL: 0, cacBRL: 0, conversionRate: 12 },
      { source: 'referral', visitors: 300, signups: 60, activations: 30, costBRL: 0, cacBRL: 0, conversionRate: 20 },
      { source: 'direct', visitors: 200, signups: 28, activations: 14, costBRL: 0, cacBRL: 0, conversionRate: 14 },
    ],
    emailSequences: [
      { sequence: 'Welcome (Day 0)', sent: 2304, openRate: 0.62, clickRate: 0.28, unsubscribeRate: 0.005 },
      { sequence: 'Onboarding Nudge (Day 2)', sent: 1843, openRate: 0.45, clickRate: 0.18, unsubscribeRate: 0.008 },
      { sequence: 'Akasha Intro (Day 5)', sent: 1200, openRate: 0.51, clickRate: 0.22, unsubscribeRate: 0.006 },
      { sequence: 'Day-7 NPS (Day 7)', sent: 2304, openRate: 0.38, clickRate: 0.12, unsubscribeRate: 0.012 },
    ],
    totals: {
      visitors: 12000,
      signups: 1076,
      activations: 389,
      cacBRL: 8.45,
      emailRevenue: 0,
    },
  };
}

// ----------------------------------------------------------------------------
// Page component
// ----------------------------------------------------------------------------

export default async function MarketingDashboardPage() {
  const snapshot = await getMarketingSnapshot();

  return (
    <div className="min-h-screen bg-base-100">
      <AdminNav />

      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
          <p className="text-base-content/70 mt-2">
            Post-launch Day 7 review · Window: last {snapshot.windowDays} days · Generated{' '}
            {new Date(snapshot.generatedAt).toLocaleString('pt-BR')}
          </p>
        </header>

        <Suspense fallback={<div className="loading loading-spinner" />}>
          {/* Top KPIs */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <KPICard label="Visitors" value={snapshot.totals.visitors.toLocaleString('pt-BR')} delta="+12%" />
            <KPICard label="Signups" value={snapshot.totals.signups.toLocaleString('pt-BR')} delta="+18%" />
            <KPICard label="Activations" value={snapshot.totals.activations.toLocaleString('pt-BR')} delta="+22%" />
            <KPICard label="CAC (BRL)" value={`R$ ${snapshot.totals.cacBRL.toFixed(2)}`} delta="-8%" />
            <KPICard
              label="Activation Rate"
              value={`${((snapshot.totals.activations / snapshot.totals.signups) * 100).toFixed(1)}%`}
              delta="+3pp"
            />
          </section>

          {/* Funnel */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Signup Funnel</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Entry</th>
                    <th>Exit</th>
                    <th>Conversion</th>
                    <th>Visualization</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.funnel.map((step) => (
                    <tr key={step.step}>
                      <td className="font-medium">{step.step}</td>
                      <td>{step.entryCount.toLocaleString('pt-BR')}</td>
                      <td>{step.exitCount.toLocaleString('pt-BR')}</td>
                      <td>
                        <span
                          className={`badge ${
                            step.conversionPct >= 70
                              ? 'badge-success'
                              : step.conversionPct >= 40
                              ? 'badge-warning'
                              : 'badge-error'
                          }`}
                        >
                          {step.conversionPct}%
                        </span>
                      </td>
                      <td>
                        <progress
                          className="progress progress-primary w-32"
                          value={step.conversionPct}
                          max={100}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Source Attribution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Source Attribution (UTM)</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Visitors</th>
                    <th>Signups</th>
                    <th>Activations</th>
                    <th>Conv. Rate</th>
                    <th>Cost (BRL)</th>
                    <th>CAC (BRL)</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.attribution.map((attr) => (
                    <tr key={attr.source}>
                      <td className="font-medium">{attr.source}</td>
                      <td>{attr.visitors.toLocaleString('pt-BR')}</td>
                      <td>{attr.signups.toLocaleString('pt-BR')}</td>
                      <td>{attr.activations.toLocaleString('pt-BR')}</td>
                      <td>{attr.conversionRate}%</td>
                      <td>{attr.costBRL > 0 ? `R$ ${attr.costBRL.toLocaleString('pt-BR')}` : '—'}</td>
                      <td>{attr.cacBRL > 0 ? `R$ ${attr.cacBRL.toFixed(2)}` : 'free'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Email Sequences */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Email Sequence Performance</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Sequence</th>
                    <th>Sent</th>
                    <th>Open Rate</th>
                    <th>Click Rate</th>
                    <th>Unsubscribe</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.emailSequences.map((seq) => (
                    <tr key={seq.sequence}>
                      <td className="font-medium">{seq.sequence}</td>
                      <td>{seq.sent.toLocaleString('pt-BR')}</td>
                      <td>
                        <span
                          className={`badge ${
                            seq.openRate >= 0.5
                              ? 'badge-success'
                              : seq.openRate >= 0.35
                              ? 'badge-warning'
                              : 'badge-error'
                          }`}
                        >
                          {(seq.openRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            seq.clickRate >= 0.2
                              ? 'badge-success'
                              : seq.clickRate >= 0.1
                              ? 'badge-warning'
                              : 'badge-error'
                          }`}
                        >
                          {(seq.clickRate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td>{(seq.unsubscribeRate * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recommendations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Week 2 Recommendations</h2>
            <div className="alert alert-info mb-4">
              <div>
                <h3 className="font-bold">🚨 Big drop-off: Landing → Signup Start (30%)</h3>
                <p className="text-sm">
                  Conversion abaixo do threshold (50%). Hipótese: copy da landing não comunica valor
                  espiritual + form parece longo. Testar social login primeiro + reduzir campos.
                </p>
              </div>
            </div>
            <div className="alert alert-warning mb-4">
              <div>
                <h3 className="font-bold">⚠️ Tradição → First Post (30% activation)</h3>
                <p className="text-sm">
                  Onboarding não está guiando para first post. Adicionar &quot;Primeira ação&quot; tutorial
                  inline + reduzir fricção da etapa tradição.
                </p>
              </div>
            </div>
            <div className="alert alert-success">
              <div>
                <h3 className="font-bold">✅ Referral tem 20% conversion (top channel)</h3>
                <p className="text-sm">
                  Canal referral tem melhor conversion rate. Escalar programa de referral em Week 2
                  (target: 50→150 referrals/semana).
                </p>
              </div>
            </div>
          </section>
        </Suspense>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Components locais
// ----------------------------------------------------------------------------

function KPICard({ label, value, delta }: { label: string; value: string; delta: string }) {
  const deltaPositive = delta.startsWith('+');
  return (
    <div className="card bg-base-200 shadow">
      <div className="card-body p-4">
        <p className="text-sm text-base-content/70">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        <p className={`text-xs ${deltaPositive ? 'text-success' : 'text-error'}`}>{delta} vs last 7d</p>
      </div>
    </div>
  );
}