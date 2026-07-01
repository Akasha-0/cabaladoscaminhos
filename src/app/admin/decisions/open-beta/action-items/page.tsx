// ============================================================================
// /admin/decisions/open-beta/action-items — Pre-launch checklist (Wave 37)
// ============================================================================
// Server component que renderiza o pre-launch checklist canônico dos 12 itens
// agrupados em 6 categorias (marketing / legal / support / monitoring / docs /
// billing).
//
// LGPD: nada pessoal. Cada item tem owner (role) + ETA (day-offset vs D-0).
// ============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "Admin · Decisions · Action Items · Cabala dos Caminhos",
  robots: { index: false, follow: false },
  description:
    "Pre-launch checklist (12 itens em 6 categorias) para Wave 4 open beta — W37.",
};

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Checklist canonical
// ---------------------------------------------------------------------------

interface ChecklistItem {
  id: string;
  category:
    | "marketing"
    | "legal"
    | "support"
    | "monitoring"
    | "documentation"
    | "billing";
  label: string;
  detail: string;
  owner: string;
  /** Relative to D-0 (negative = pre-launch, 0 = launch day). */
  dueOffsetDays: number;
  status: "done" | "in-progress" | "blocked" | "planned";
  blockingGate: "hard" | "soft" | "none";
}

const CHECKLIST: ReadonlyArray<ChecklistItem> = [
  // ── Marketing (3) ──
  {
    id: "MKT-1",
    category: "marketing",
    label: "Press kit published",
    detail: "Press kit PT-BR + EN em /press/akasha-portal.zip, publicável.",
    owner: "PM (Tomás)",
    dueOffsetDays: -7,
    status: "done",
    blockingGate: "soft",
  },
  {
    id: "MKT-2",
    category: "marketing",
    label: "Pre-launch email scheduled (waitlist + advisor)",
    detail: "Email warmup pré-launch agendado no Resend para T-1, segment por tier.",
    owner: "PM",
    dueOffsetDays: -1,
    status: "in-progress",
    blockingGate: "soft",
  },
  {
    id: "MKT-3",
    category: "marketing",
    label: "Landing page Wave 4 public-ready",
    detail: "/validacao substituído por landing público com CTA + FAQ público.",
    owner: "Designer + PM",
    dueOffsetDays: -3,
    status: "in-progress",
    blockingGate: "hard",
  },

  // ── Legal (2) ──
  {
    id: "LG-1",
    category: "legal",
    label: "LGPD ToS + privacy policy approved",
    detail:
      "Termos de uso + política de privacidade LGPD-compliant (W27 audit base + D5 do W32-8 §10).",
    owner: "Security (Caio)",
    dueOffsetDays: -7,
    status: "done",
    blockingGate: "hard",
  },
  {
    id: "LG-2",
    category: "legal",
    label: "Sign-up consent + data flow documentation",
    detail:
      "Consent explícito (Art. 7 LGPD) + data flow doc (Art. 37) + encarregado de dados nomeado.",
    owner: "Security + Coder",
    dueOffsetDays: -7,
    status: "in-progress",
    blockingGate: "hard",
  },

  // ── Support (2) ──
  {
    id: "SUP-1",
    category: "support",
    label: "First human moderator hired + trained",
    detail: "Hire + treinamento do primeiro human moderator (W37A-4 carryover).",
    owner: "Founder + PM",
    dueOffsetDays: -3,
    status: "in-progress",
    blockingGate: "hard",
  },
  {
    id: "SUP-2",
    category: "support",
    label: "Crisis runbook /runbooks/crisis.md published",
    detail:
      "Protocolo CVV 188 (BR) + 988 (US) + resposta empática + handoff PM.",
    owner: "PM",
    dueOffsetDays: -7,
    status: "planned",
    blockingGate: "hard",
  },

  // ── Monitoring (2) ──
  {
    id: "MON-1",
    category: "monitoring",
    label: "On-call rotation live (W37A-2)",
    detail: "On-call ativo 24/7 com PagerDuty + escalation path publicado.",
    owner: "DevOps + Founder",
    dueOffsetDays: -3,
    status: "in-progress",
    blockingGate: "hard",
  },
  {
    id: "MON-2",
    category: "monitoring",
    label: "Status page configured (statuspage.io)",
    detail: "Página pública com componentes (API, Auth, Payments, Akasha) e RSS feed.",
    owner: "DevOps",
    dueOffsetDays: -3,
    status: "planned",
    blockingGate: "soft",
  },

  // ── Documentation (2) ──
  {
    id: "DOC-1",
    category: "documentation",
    label: "User-facing documentation coverage > 80%",
    detail:
      "FAQ + KB + wiki + guides — pelo menos 80% das features documentadas publicamente.",
    owner: "PM + Designer",
    dueOffsetDays: -3,
    status: "in-progress",
    blockingGate: "hard",
  },
  {
    id: "DOC-2",
    category: "documentation",
    label: "Community guidelines published (/codigo-conduta)",
    detail:
      "Universalismo, não-proselitismo, ban-sem-segunda-chance, crise → CVV/988.",
    owner: "PM + Mod",
    dueOffsetDays: -3,
    status: "planned",
    blockingGate: "hard",
  },

  // ── Billing (1) ──
  {
    id: "BIL-1",
    category: "billing",
    label: "Stripe + marketplace escrow tested end-to-end",
    detail:
      "Teste happy-path + refund + dispute em staging. Webhook signatures validadas.",
    owner: "Coder + QA",
    dueOffsetDays: -7,
    status: "in-progress",
    blockingGate: "hard",
  },
];

const CATEGORY_LABEL: Record<ChecklistItem["category"], string> = {
  marketing: "Marketing assets",
  legal: "Legal docs (LGPD)",
  support: "Support infrastructure",
  monitoring: "Monitoring + alerting",
  documentation: "Documentation",
  billing: "Billing infrastructure",
};

// ---------------------------------------------------------------------------
// Status styling
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ChecklistItem["status"] }) {
  const styles =
    status === "done"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : status === "in-progress"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
        : status === "blocked"
          ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
          : "border-slate-600 bg-slate-800 text-slate-300";
  const label =
    status === "done"
      ? "DONE"
      : status === "in-progress"
        ? "IN PROGRESS"
        : status === "blocked"
          ? "BLOCKED"
          : "PLANNED";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${styles}`}
    >
      {label}
    </span>
  );
}

function GateBadge({ gate }: { gate: ChecklistItem["blockingGate"] }) {
  if (gate === "none") return null;
  const cls =
    gate === "hard"
      ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
      : "border-amber-500/40 bg-amber-500/10 text-amber-300";
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}
    >
      {gate} gate
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default async function ActionItemsPage() {
  const session = await requireAdmin();
  if (!session.ok && process.env.NODE_ENV === "production") {
    redirect("/");
  }

  // Summary stats
  const total = CHECKLIST.length;
  const done = CHECKLIST.filter((i) => i.status === "done").length;
  const inProgress = CHECKLIST.filter((i) => i.status === "in-progress").length;
  const blocked = CHECKLIST.filter((i) => i.status === "blocked").length;
  const planned = CHECKLIST.filter((i) => i.status === "planned").length;
  const hardGatesOpen = CHECKLIST.filter(
    (i) => i.blockingGate === "hard" && i.status !== "done",
  ).length;

  // Group by category
  const grouped = (Object.entries(CATEGORY_LABEL) as Array<
    [ChecklistItem["category"], string]
  >).map(([cat, label]) => ({
    cat,
    label,
    items: CHECKLIST.filter((i) => i.category === cat),
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <nav className="rounded-md border border-slate-800 bg-slate-900/40 p-2 text-xs text-slate-300">
        <Link href="/admin/insights" className="hover:text-amber-300">
          Insights
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <Link href="/admin/decisions/open-beta" className="hover:text-amber-300">
          Open Beta Decision
        </Link>
        <span className="mx-2 text-slate-600">/</span>
        <span className="text-amber-300">Action Items</span>
      </nav>

      <header className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          Wave 37 · Open Beta · Pre-launch checklist
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-100">
          12 itens em 6 categorias
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Checklist canônico do W32-8 strategic plan §3.2 (Sprint 0 gate) +
          §10 (decisions pendentes) + W37A sub-waves. Cada item tem owner +
          due-date relativo ao D-0 + status. <strong>Hard gates</strong>{" "}
          bloqueiam GO se != DONE no D-3.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <SummaryCard label="Total" value={total.toString()} tone="default" />
        <SummaryCard label="Done" value={done.toString()} tone="emerald" />
        <SummaryCard label="In progress" value={inProgress.toString()} tone="amber" />
        <SummaryCard label="Planned" value={planned.toString()} tone="slate" />
        <SummaryCard label="Hard gates open" value={hardGatesOpen.toString()} tone="rose" />
      </section>

      {blocked > 0 && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          🚨 <strong>{blocked} item(s) bloqueado(s)</strong>. Owner review imediato
          antes do D-7 review.
        </div>
      )}

      {grouped.map(({ cat, label, items }) => (
        <section key={cat} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <header className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-slate-100">{label}</h2>
            <span className="text-xs text-slate-500">
              {items.filter((i) => i.status === "done").length}/{items.length} done
            </span>
          </header>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1 rounded-md border border-slate-800 bg-slate-900/40 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{item.id}</span>
                  <span className="text-sm font-medium text-slate-100">{item.label}</span>
                  <StatusBadge status={item.status} />
                  <GateBadge gate={item.blockingGate} />
                </div>
                <p className="text-xs text-slate-300">{item.detail}</p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                  <span>Owner: <strong className="text-slate-300">{item.owner}</strong></span>
                  <span>Due: <strong className="text-slate-300">D{item.dueOffsetDays >= 0 ? "+" : ""}{item.dueOffsetDays}</strong></span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <footer className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-[11px] text-slate-500">
        <p>
          LGPD compliance checked: ToS + privacy policy + consent flow (Art. 7,
          18, 37) — Security (Caio) reviewa em D-7.{" "}
          <Link
            href="/admin/decisions/open-beta"
            className="text-amber-300 hover:underline"
          >
            ← Voltar ao decision dashboard
          </Link>
        </p>
      </footer>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "default" | "emerald" | "amber" | "rose" | "slate";
}) {
  const cls =
    tone === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : tone === "amber"
        ? "border-amber-500/30 bg-amber-500/5"
        : tone === "rose"
          ? "border-rose-500/40 bg-rose-500/5"
          : tone === "slate"
            ? "border-slate-700 bg-slate-900/40"
            : "border-slate-800 bg-slate-900/40";
  return (
    <div className={`rounded-md border ${cls} p-3`}>
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-2xl font-bold text-slate-100">{value}</div>
    </div>
  );
}
