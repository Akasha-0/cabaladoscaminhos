// ============================================================================
// /admin/decisions/open-beta — Decision dashboard (Wave 37, 2026-07-01)
// ============================================================================
// Server component que renderiza o go/no-go dashboard para Wave 4 (open beta).
// Estrutura:
//   1. requireAdmin (gate).
//   2. computeGoNoGoReport() com SAMPLE_ACTUALS_W37 (placeholder; troca por
//      collector real no T-3 do decision).
//   3. Traffic-light grid por KPI (18 KPIs, 3 colunas por categoria).
//   4. Weighted score card.
//   5. Recommended-action banner (GO/CONDITIONAL/NO-GO).
//   6. Risk register summary + auto-flagged risks.
//   7. Cadência ativa do pós-launch (sub-link para /post-launch).
//   8. Botão "Action items checklist" → /admin/decisions/open-beta/action-items.
//
// LGPD:
//   - Tudo agregado (KPI counts/ratios/lights). Sem PII.
//   - Owner = role only. Sem emails.
// ============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import {
  SAMPLE_ACTUALS_W37,
  HEALTH_KPIS,
  ENGAGEMENT_KPIS,
  RETENTION_KPIS,
} from "@/lib/decisions/kpi-definitions";
import {
  computeGoNoGoReport,
  categoryScore,
  type KpiEvaluation,
  type Decision,
} from "@/lib/decisions/go-no-go-calculator";
import {
  RISK_REGISTER,
  summarizeRisks,
  evaluateRiskAutoFlags,
} from "@/lib/decisions/risk-register";

export const metadata: Metadata = {
  title: "Admin · Decisions · Open Beta · Cabala dos Caminhos",
  robots: { index: false, follow: false },
  description:
    "Wave 4 open-beta go/no-go dashboard: 18 KPIs, weighted score, risk register e decision timeline (W37).",
};

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Sub-components (server-rendered)
// ---------------------------------------------------------------------------

function TrafficLightGlyph({ light }: { light: "green" | "yellow" | "red" }) {
  const styles =
    light === "green"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : light === "yellow"
        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
        : "bg-rose-500/20 text-rose-300 border-rose-500/40";
  const dot =
    light === "green"
      ? "bg-emerald-400"
      : light === "yellow"
        ? "bg-amber-400"
        : "bg-rose-400";
  const label = light === "green" ? "GREEN" : light === "yellow" ? "YELLOW" : "RED";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles}`}
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function KpiRow({ ev }: { ev: KpiEvaluation }) {
  const { kpi, actual, ratio, light, score } = ev;
  return (
    <li className="flex items-start justify-between gap-4 rounded-md border border-slate-800 bg-slate-900/40 p-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-100">{kpi.label}</span>
          <TrafficLightGlyph light={light} />
          {kpi.p0 && (
            <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300">
              P0
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{kpi.description}</p>
        <p className="mt-1 text-[11px] text-slate-500">Source: {kpi.source}</p>
      </div>
      <div className="flex flex-col items-end text-right">
        <div className="text-xs uppercase tracking-wider text-slate-500">Actual / Target</div>
        <div className="font-mono text-sm text-slate-100">
          {actual.toFixed(2)} <span className="text-slate-500">/</span> {kpi.target}
          <span className="ml-1 text-[10px] text-slate-500">{kpi.unit}</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          ratio {ratio.toFixed(2)} · score {score.toFixed(1)}
        </div>
      </div>
    </li>
  );
}

function CategorySection({
  title,
  description,
  evaluations,
  score,
}: {
  title: string;
  description: string;
  evaluations: KpiEvaluation[];
  score: number;
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <header className="mb-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
        <div className="font-mono text-lg font-bold text-slate-100" aria-label="category score">
          {(score * 100).toFixed(0)}<span className="text-xs text-slate-500">%</span>
        </div>
      </header>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {evaluations.map((ev) => (
          <KpiRow key={ev.kpi.id} ev={ev} />
        ))}
      </ul>
    </section>
  );
}

function DecisionBanner({
  decision,
  weightedScore,
  rationale,
  action,
  greenCount,
  yellowCount,
  redCount,
  p0RedCount,
}: {
  decision: Decision;
  weightedScore: number;
  rationale: string;
  action: string;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  p0RedCount: number;
}) {
  const palette =
    decision === "GO"
      ? { bg: "from-emerald-900/40 to-emerald-700/20", text: "text-emerald-100", badge: "bg-emerald-500 text-emerald-950" }
      : decision === "CONDITIONAL"
        ? { bg: "from-amber-900/40 to-amber-700/20", text: "text-amber-100", badge: "bg-amber-400 text-amber-950" }
        : { bg: "from-rose-900/40 to-rose-700/20", text: "text-rose-100", badge: "bg-rose-500 text-rose-950" };
  return (
    <section
      className={`rounded-xl border border-slate-700 bg-gradient-to-br ${palette.bg} p-6 shadow-lg`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <span
            className={`inline-block rounded-md px-3 py-1 text-sm font-black uppercase tracking-widest ${palette.badge}`}
          >
            {decision}
          </span>
          <h1 className={`mt-3 text-2xl font-bold ${palette.text}`}>
            Weighted score {(weightedScore * 100).toFixed(1)}%
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-200">{rationale}</p>
        </div>
        <div className="flex flex-col items-end gap-1 font-mono text-xs">
          <div className="flex gap-3">
            <span className="text-emerald-300">● {greenCount} GREEN</span>
            <span className="text-amber-300">● {yellowCount} YELLOW</span>
            <span className="text-rose-300">● {redCount} RED</span>
          </div>
          <div className="text-rose-300">P0 reds: {p0RedCount}</div>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-slate-700 bg-slate-950/60 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Recommended action
        </p>
        <p className="mt-1 text-sm text-slate-100">{action}</p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default async function OpenBetaDecisionPage() {
  const session = await requireAdmin();
  if (!session.ok && process.env.NODE_ENV === "production") {
    redirect("/");
  }

  const report = computeGoNoGoReport({ actuals: SAMPLE_ACTUALS_W37 });

  // Group by category
  const retentionEvs = report.evaluations.filter((e) => e.kpi.category === "retention");
  const engagementEvs = report.evaluations.filter((e) => e.kpi.category === "engagement");
  const healthEvs = report.evaluations.filter((e) => e.kpi.category === "health");

  const retentionScore = categoryScore(report.evaluations, "retention");
  const engagementScore = categoryScore(report.evaluations, "engagement");
  const healthScore = categoryScore(report.evaluations, "health");

  const riskSummary = summarizeRisks();
  const autoFlagged = evaluateRiskAutoFlags();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <nav className="rounded-md border border-slate-800 bg-slate-900/40 p-2 text-xs text-slate-300">
        <Link href="/admin/insights" className="hover:text-amber-300">Insights</Link>
        <span className="mx-2 text-slate-600">/</span>
        <Link href="/admin/feedback" className="hover:text-amber-300">Feedback</Link>
        <span className="mx-2 text-slate-600">/</span>
        <Link href="/admin/moderation" className="hover:text-amber-300">Moderation</Link>
        <span className="mx-2 text-slate-600">/</span>
        <Link href="/admin/bugs" className="hover:text-amber-300">Bugs</Link>
        <span className="mx-2 text-slate-600">/</span>
        <span className="text-amber-300">Decisions: Open Beta</span>
      </nav>

      <header className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-500">Wave 37 — Open Beta Decision</p>
        <h1 className="mt-1 text-xl font-bold text-slate-100">Wave 4 Go / No-Go Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Avaliação consolidada dos <strong>18 KPIs</strong> +{" "}
          <strong>{RISK_REGISTER.length} riscos</strong> do register estratégico W32-8. Sample actuals
          abaixo (placeholder, troca por collector real no T-3 do decision). Documento de
          referência: <code className="text-amber-300">docs/OPEN-BETA-DECISION-W37.md</code>.
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Evaluated at {new Date(report.evaluatedAt).toUTCString()} · {HEALTH_KPIS.length + ENGAGEMENT_KPIS.length + RETENTION_KPIS.length} KPIs total
        </p>
      </header>

      <DecisionBanner
        decision={report.decision}
        weightedScore={report.weightedScore}
        rationale={report.decisionRationale}
        action={report.recommendedAction}
        greenCount={report.greenCount}
        yellowCount={report.yellowCount}
        redCount={report.redCount}
        p0RedCount={report.p0RedCount}
      />

      <nav className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/admin/decisions/open-beta/action-items"
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 hover:bg-slate-800"
        >
          ✅ Pre-launch checklist (12 itens)
        </Link>
        <Link
          href="/admin/decisions/open-beta"
          className="rounded-md border border-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-900"
        >
          📅 Decision timeline
        </Link>
        <Link
          href="/admin/decisions/open-beta"
          className="rounded-md border border-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-900"
        >
          🚨 Risk register ({riskSummary.active} active)
        </Link>
        <Link
          href="/admin/decisions/open-beta"
          className="rounded-md border border-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-900"
        >
          📊 Post-launch playbook
        </Link>
      </nav>

      <CategorySection
        title={`Cohort A — Retention (${retentionEvs.length} KPIs)`}
        description="Validates H1 (white-glove + comunidade pequena supera benchmarks de retenção)."
        evaluations={retentionEvs}
        score={retentionScore}
      />

      <CategorySection
        title={`Cohort B — Engagement (${engagementEvs.length} KPIs)`}
        description="Validates H2 (cross-tradition engagement) + H3 (Akasha usage + citation)."
        evaluations={engagementEvs}
        score={engagementScore}
      />

      <CategorySection
        title={`Cohort C — Health (${healthEvs.length} P0 KPIs)`}
        description="Risco operacional — qualquer RED aqui bloqueia GO (limite: 3+)."
        evaluations={healthEvs}
        score={healthScore}
      />

      <section className="rounded-lg border border-slate-800 bg-slate-950 p-4">
        <header className="mb-3 flex items-baseline justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Risk register snapshot ({RISK_REGISTER.length} risks)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {riskSummary.mitigated} mitigated · {riskSummary.monitoring} monitoring ·{" "}
              <span className="text-rose-300">{riskSummary.active} active</span>
            </p>
          </div>
        </header>
        {autoFlagged.length > 0 ? (
          <div className="mb-4 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">
            🚨 <strong>{autoFlagged.length} risk(s) auto-flagged for review</strong>:{" "}
            {autoFlagged.map((r) => r.id).join(", ")}. Owner deve revisar antes do D-3.
          </div>
        ) : null}
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {RISK_REGISTER.map((risk) => {
            const styles =
              risk.status === "mitigated"
                ? "border-emerald-500/30 bg-emerald-500/5"
                : risk.status === "monitoring"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-rose-500/40 bg-rose-500/5";
            return (
              <li
                key={risk.id}
                className={`flex flex-col gap-2 rounded-md border ${styles} p-3`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{risk.id}</span>
                  <span className="text-sm font-medium text-slate-100">{risk.title}</span>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                    prob: {risk.probability}
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                    impact: {risk.impact}
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
                    owner: {risk.owner}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{risk.description}</p>
                <p className="text-[10px] italic text-slate-500">Auto-flag if: {risk.autoFlagIf}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-500">
        <p>
          Algoritmo: <code className="text-amber-300">computeGoNoGoReport()</code> em{" "}
          <code>src/lib/decisions/go-no-go-calculator.ts</code>. Pure function — mesmos inputs =
          mesmos outputs. Threshold constants: 0.85 (GO), 0.70 (NO-GO), 0 P0 reds (GO requirement).
        </p>
        <p className="mt-1">
          Owner review (Gabriel) expected em D-7. Final decision em D-3. Timeline completa na{" "}
          <code className="text-amber-300">src/lib/decisions/decision-timeline.ts</code> +
          <code className="text-amber-300"> docs/OPEN-BETA-DECISION-W37.md</code>.
        </p>
      </footer>
    </div>
  );
}
