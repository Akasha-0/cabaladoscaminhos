// W91-B: reputation-leaderboard — leaderboard UI
// Server Component. Pure data + markup; no client JS hydration. The engine
// runs at module load (frozen, deterministic). Filter controls are rendered
// as plain anchor links so the page stays Server-rendered — this honors the
// "display-only" brief and keeps the bundle small.
//
// Sacred-cultural compliance:
//   - "Posição" (not "Rank")  ·  "Reconhecimento" (not "Competition")
//   - "Testemunhas" for the bottom tier (honor, not shame)
//   - Years of Axé displayed as "Anos de Axé" (positive framing)
//   - 4 tradição symbols used: ✦ tradição · 🪶 sabedoria · ☉ axé · ◈ comunidade
//   - Banned vocab absent: amarração, amarre, vinculação, vincular, prejudicar
//
// LGPD:
//   - Only displayName + score + tradição + yearsOfAxé are rendered
//   - No e-mail, telefone, IP, or contact info
//
// Mobile-first 360px → 768px → 1024px.

import React from "react";
import Link from "next/link";

import {
  W91B_CATEGORY_LABELS,
  W91B_WINDOW_LABELS,
} from "../../../lib/w91/reputation-leaderboard/types";
import {
  W91B_AVAILABLE_WINDOWS,
} from "../../../lib/w91/reputation-leaderboard/mock";
import {
  categoryPresentation,
  createLeaderboard,
  leaderboardSubtitle,
  leaderboardTitle,
  witnessLabel,
} from "../../../lib/w91/reputation-leaderboard/factory";
import type {
  CategoryId,
  LeaderboardEntry,
  TimeWindowId,
} from "../../../lib/w91/reputation-leaderboard/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatScore(value: number): string {
  return value.toLocaleString("pt-BR");
}

function isCategoryId(value: string): value is CategoryId {
  return (
    value === "tradição" ||
    value === "sabedoria" ||
    value === "axé" ||
    value === "comunidade"
  );
}

function parseFilter(searchParams: {
  [key: string]: string | string[] | undefined;
}): { category: CategoryId | "all"; window: TimeWindowId } {
  const rawCategory = Array.isArray(searchParams?.category)
    ? searchParams.category[0]
    : searchParams?.category;
  const rawWindow = Array.isArray(searchParams?.window)
    ? searchParams.window[0]
    : searchParams?.window;

  const window: TimeWindowId =
    rawWindow === "30d" || rawWindow === "90d" || rawWindow === "1y" || rawWindow === "all"
      ? rawWindow
      : "all";
  const category: CategoryId | "all" =
    rawCategory && (rawCategory === "all" || isCategoryId(rawCategory))
      ? rawCategory
      : "all";

  return { category, window };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function CategoryFilterBar({
  active,
  windowId,
}: {
  active: CategoryId | "all";
  windowId: TimeWindowId;
}) {
  const cats: ReadonlyArray<{ id: CategoryId | "all"; label: string; icon: string }> = [
    { id: "all", label: "Toda a Comunidade", icon: "◈" },
    { id: "tradição", label: "Tradição", icon: "✦" },
    { id: "sabedoria", label: "Sabedoria", icon: "🪶" },
    { id: "axé", label: "Axé", icon: "☉" },
    { id: "comunidade", label: "Comunidade", icon: "◈" },
  ];

  return (
    <nav
      aria-label="Filtro por categoria"
      className="flex flex-wrap gap-2 pb-2"
      data-testid="category-filter"
    >
      {cats.map((c) => {
        const isActive = c.id === active;
        const href =
          c.id === "all"
            ? `/community/leaderboard?window=${windowId}`
            : `/community/leaderboard?category=${encodeURIComponent(c.id)}&window=${windowId}`;
        return (
          <Link
            key={c.id}
            href={href}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={[
              "min-h-[44px] inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm",
              "border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400",
              isActive
                ? "bg-amber-500/15 border-amber-400/60 text-amber-200"
                : "bg-slate-900/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/60",
            ].join(" ")}
            data-testid={`category-filter-${c.id}`}
          >
            <span aria-hidden="true" className="text-base">
              {c.icon}
            </span>
            <span>{c.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function WindowFilterBar({
  active,
  category,
}: {
  active: TimeWindowId;
  category: CategoryId | "all";
}) {
  return (
    <nav
      aria-label="Filtro por período"
      className="flex flex-wrap gap-2"
      data-testid="window-filter"
    >
      {W91B_AVAILABLE_WINDOWS.map((w: TimeWindowId) => {
        const isActive = w === active;
        const href =
          category === "all"
            ? `/community/leaderboard?window=${w}`
            : `/community/leaderboard?category=${encodeURIComponent(category)}&window=${w}`;
        return (
          <Link
            key={w}
            href={href}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={[
              "min-h-[44px] inline-flex items-center rounded-full px-3 py-1.5 text-xs",
              "border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400",
              isActive
                ? "bg-slate-100 border-slate-100 text-slate-900"
                : "bg-slate-900/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/60",
            ].join(" ")}
            data-testid={`window-filter-${w}`}
          >
            {W91B_WINDOW_LABELS[w]}
          </Link>
        );
      })}
    </nav>
  );
}

function PodiumCard({
  entry,
  place,
}: {
  entry: LeaderboardEntry;
  place: 1 | 2 | 3;
}) {
  const placeStyles: Record<1 | 2 | 3, { ring: string; height: string; emoji: string }> = {
    1: { ring: "ring-amber-400/70", height: "h-44", emoji: "✦" },
    2: { ring: "ring-slate-300/60", height: "h-36", emoji: "☉" },
    3: { ring: "ring-amber-700/60", height: "h-32", emoji: "◈" },
  };
  const style = placeStyles[place];

  return (
    <article
      className={[
        "card-spiritual relative flex w-full flex-col items-center justify-end rounded-xl p-4",
        "bg-gradient-to-b from-slate-900/70 to-slate-950/90 ring-1",
        style.ring,
        style.height,
      ].join(" ")}
      data-testid={`podium-${place}`}
      aria-label={`Posição ${place} — ${entry.member.displayName}`}
    >
      <span
        aria-hidden="true"
        className="absolute -top-3 right-3 rounded-full bg-slate-950 px-2 py-0.5 text-xs text-amber-300 ring-1 ring-amber-400/40"
      >
        {style.emoji} {place}º
      </span>
      <p className="text-center text-sm font-semibold leading-tight text-slate-100 line-clamp-2">
        {entry.member.displayName}
      </p>
      <p className="mt-1 text-center text-xs text-amber-200/80">
        {entry.member.yearsOfAxé} anos de Axé
      </p>
      <p
        className="mt-2 text-center text-lg font-bold text-amber-100"
        aria-label={`Pontuação: ${formatScore(entry.compositeScore)}`}
      >
        {formatScore(entry.compositeScore)}
      </p>
    </article>
  );
}

function Podium() {
  // The podium is rendered inline inside the default export below so that
  // it shares the same `snapshot` data as the rest of the page.
  return null;
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const posColor =
    entry.position <= 3
      ? "text-amber-300"
      : entry.position <= 10
      ? "text-slate-200"
      : "text-slate-400";

  return (
    <li
      className="flex items-center gap-3 rounded-lg border border-slate-800/50 bg-slate-900/40 px-3 py-3"
      data-testid={`row-${entry.member.userId}`}
      aria-label={`Posição ${entry.position} — ${entry.member.displayName}`}
    >
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          "bg-slate-800/80 ring-1 ring-slate-700/60",
          "text-base font-semibold",
          posColor,
        ].join(" ")}
        aria-hidden="true"
      >
        {entry.position}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-100">
          {entry.member.displayName}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
          <span aria-hidden="true">
            {W91B_CATEGORY_LABELS[entry.member.tradição].icon}
          </span>
          <span>{W91B_CATEGORY_LABELS[entry.member.tradição].label}</span>
          <span aria-hidden="true">·</span>
          <span>{entry.member.yearsOfAxé} anos de Axé</span>
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className="text-sm font-semibold text-amber-100"
          aria-label={`Pontuação ${formatScore(entry.compositeScore)}`}
        >
          {formatScore(entry.compositeScore)}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-slate-500">
          Percentil {entry.percentile}
        </p>
      </div>
    </li>
  );
}

function WitnessRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <li
      className="flex items-center gap-3 rounded-lg border border-slate-800/40 bg-slate-900/30 px-3 py-2"
      data-testid={`witness-${entry.member.userId}`}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800/60 text-xs text-slate-400 ring-1 ring-slate-700/40"
        aria-hidden="true"
      >
        ✦
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-slate-300">
          {entry.member.displayName}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-slate-500">
          {W91B_CATEGORY_LABELS[entry.member.tradição].label}
        </p>
      </div>
      <p className="shrink-0 text-xs text-slate-400">
        {formatScore(entry.compositeScore)}
      </p>
    </li>
  );
}

// ─── Page (Server Component) ────────────────────────────────────────────────

export default function LeaderboardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const filter = parseFilter(searchParams ?? {});
  const generatedAt = "2026-06-30T00:00:00Z";
  const snapshot = createLeaderboard(filter, generatedAt);

  const title = leaderboardTitle(filter);
  const subtitle = leaderboardSubtitle(snapshot);
  const cat = categoryPresentation(filter.category);
  const generated = new Date(generatedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="space-y-3" data-testid="leaderboard-header">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-300/80">
          {cat.icon} {cat.label}
        </p>
        <h1
          className="text-2xl font-bold leading-tight text-slate-50 sm:text-3xl"
          data-testid="leaderboard-title"
        >
          {title}
        </h1>
        <p className="text-sm text-slate-400" data-testid="leaderboard-subtitle">
          {subtitle}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-slate-600">
          Reconhecimento compilado em {generated}
        </p>
      </header>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <section
        aria-label="Filtros do reconhecimento"
        className="space-y-3"
        data-testid="filter-section"
      >
        <h2 className="sr-only">Filtros</h2>
        <CategoryFilterBar active={filter.category} windowId={filter.window} />
        <WindowFilterBar active={filter.window} category={filter.category} />
      </section>

      {/* ── Top-3 podium ────────────────────────────────────────── */}
      {snapshot.topThree.length >= 1 && (
        <section
          aria-label="Pódio de Reconhecimento"
          className="space-y-3"
          data-testid="podium-section"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Pódio de Reconhecimento
          </h2>
          <div className="grid grid-cols-3 items-end gap-2 sm:gap-3">
            {/* Order: 2nd, 1st, 3rd visually (1st is tallest in the middle) */}
            {snapshot.topThree[1] && (
              <PodiumCard entry={snapshot.topThree[1]} place={2} />
            )}
            {snapshot.topThree[0] && (
              <PodiumCard entry={snapshot.topThree[0]} place={1} />
            )}
            {snapshot.topThree[2] && (
              <PodiumCard entry={snapshot.topThree[2]} place={3} />
            )}
          </div>
        </section>
      )}

      {/* ── Full list ───────────────────────────────────────────── */}
      <section
        aria-label="Lista completa de membros reconhecidos"
        className="space-y-3"
        data-testid="list-section"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Membros reconhecidos ({snapshot.totalMembers})
        </h2>
        <ol className="space-y-2" data-testid="leaderboard-list">
          {snapshot.entries.map((entry) => (
            <LeaderboardRow key={entry.member.userId} entry={entry} />
          ))}
        </ol>
      </section>

      {/* ── Witness tier ────────────────────────────────────────── */}
      {snapshot.witnesses.length >= 1 && (
        <section
          aria-label={witnessLabel()}
          className="space-y-3 rounded-xl border border-slate-800/50 bg-slate-900/30 p-4"
          data-testid="witness-section"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            ✦ {witnessLabel()}
          </h2>
          <p className="text-xs text-slate-500">
            Membros com prática reconhecida que seguem somando à comunidade.
          </p>
          <ul className="space-y-2">
            {snapshot.witnesses.map((entry) => (
              <WitnessRow key={entry.member.userId} entry={entry} />
            ))}
          </ul>
        </section>
      )}

      {/* ── Footer (LGPD note) ──────────────────────────────────── */}
      <footer
        className="border-t border-slate-800/60 pt-4 text-center"
        data-testid="leaderboard-footer"
      >
        <p className="text-[10px] uppercase tracking-wide text-slate-600">
          Dados exibidos: nome público · tradição · anos de Axé · pontuação.
        </p>
        <p className="text-[10px] uppercase tracking-wide text-slate-600">
          Nenhuma informação de contato é exposta · LGPD compatível.
        </p>
        <p className="mt-2 text-[10px] text-slate-700">
          Versão do motor: 2026-06-30
        </p>
      </footer>
    </div>
  );
}