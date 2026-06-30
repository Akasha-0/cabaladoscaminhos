// W91-B: reputation-leaderboard — page source-inspection spec
// Pure source-inspection of page.tsx + layout.tsx. NO jsdom, NO render.
// Runs with vitest OR `node --import tsx` interchangeably.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const pagePath = join(process.cwd(), "src/app/community/leaderboard/page.tsx");
const layoutPath = join(process.cwd(), "src/app/community/leaderboard/layout.tsx");

const page = readFileSync(pagePath, "utf8");
const layout = readFileSync(layoutPath, "utf8");

describe("W91-B leaderboard page · source inspection", () => {
  it("page.tsx is a Server Component (no 'use client')", () => {
    // Top of file should NOT contain 'use client'
    expect(page.slice(0, 80)).not.toMatch(/['"]use client['"]/);
  });

  it("layout.tsx exports a default React component", () => {
    expect(layout).toMatch(/export default function LeaderboardLayout/);
  });

  it("layout.tsx exports metadata + viewport", () => {
    expect(layout).toMatch(/export const metadata\s*:\s*Metadata/);
    expect(layout).toMatch(/export const viewport\s*:\s*Viewport/);
  });

  it("page.tsx renders the 3-filter section (category + window + sections)", () => {
    expect(page).toMatch(/category-filter/);
    expect(page).toMatch(/window-filter/);
    expect(page).toMatch(/podium-section/);
    expect(page).toMatch(/list-section/);
    expect(page).toMatch(/witness-section/);
  });

  it("page.tsx uses 'Posição' (not 'Rank' in code)", () => {
    // Strip JSDoc + line comments — the docstring mentions 'Rank' as a negative
    // example for sacred-cultural framing
    const code = page.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    expect(code).toMatch(/Posição|posição/);
    expect(code).not.toMatch(/\bRank\b/);
    expect(code).not.toMatch(/\bTier\b/);
    expect(code).not.toMatch(/\bLevel\b/);
  });

  it("page.tsx uses 'Reconhecimento' framing", () => {
    expect(page).toMatch(/Reconhecimento/);
  });

  it("page.tsx uses 'Testemunhas' for witness tier", () => {
    expect(page).toMatch(/Testemunhas|testemunh/);
  });

  it("page.tsx renders top-3 podium via topThree", () => {
    expect(page).toMatch(/snapshot\.topThree/);
    // data-testid is a template literal: `podium-${place}` -> renders as
    // podium-1, podium-2, podium-3 in the DOM
    expect(page).toMatch(/podium-\$\{place\}/);
  });

  it("page.tsx renders the leaderboard list with leaderboard-list test id", () => {
    expect(page).toMatch(/data-testid="leaderboard-list"/);
  });

  it("page.tsx uses all 4 tradição category icons", () => {
    expect(page).toMatch(/✦/);
    expect(page).toMatch(/🪶/);
    expect(page).toMatch(/☉/);
    expect(page).toMatch(/◈/);
  });

  it("page.tsx uses 44px touch targets for accessibility", () => {
    expect(page).toMatch(/min-h-\[44px\]/);
  });

  it("page.tsx has aria-labels for accessibility", () => {
    expect(page).toMatch(/aria-label=/);
    expect(page).toMatch(/aria-current=/);
    expect(page).toMatch(/aria-hidden=/);
  });

  it("page.tsx has LGPD footer note", () => {
    expect(page).toMatch(/LGPD/);
    expect(page).toMatch(/contato/);
  });

  it("page.tsx has no banned vocab in code", () => {
    const code = page.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    const banned = ["amarração", "amarre", "vinculação", "vincular", "prejudicar"];
    for (const w of banned) {
      expect(code.toLowerCase(), `banned '${w}' found`).not.toContain(w);
    }
  });

  it("layout.tsx uses mobile-first 360px → responsive max-w", () => {
    expect(layout).toMatch(/max-w-sm/);
    expect(layout).toMatch(/sm:max-w-md|md:max-w-2xl|lg:max-w-4xl/);
  });

  it("page.tsx imports the factory correctly", () => {
    expect(page).toMatch(/from\s+["']\.\.\/\.\.\/\.\.\/lib\/w91\/reputation-leaderboard\/factory["']/);
    expect(page).toMatch(/createLeaderboard/);
    expect(page).toMatch(/leaderboardTitle/);
    expect(page).toMatch(/leaderboardSubtitle/);
  });

  it("page.tsx formats pt-BR numbers via toLocaleString", () => {
    expect(page).toMatch(/toLocaleString\("pt-BR"\)/);
  });

  it("page.tsx includes versão do motor stamp", () => {
    expect(page).toMatch(/2026-06-30/);
  });
});