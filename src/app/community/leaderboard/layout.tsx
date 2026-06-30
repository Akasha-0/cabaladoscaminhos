// W91-B: reputation-leaderboard — minimal layout
// Standalone layout for /community/leaderboard. The (community) route group
// shell is intentionally NOT inherited here — the leaderboard is read-only
// and renders directly so it can be SSR-cached without auth. Mobile-first
// 360px baseline.

import type { Metadata, Viewport } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Reconhecimento da Comunidade · Cabala dos Caminhos",
  description:
    "Membros reconhecidos pela comunidade por prática, axé e contribuição à tradição.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      <main
        id="leaderboard-main"
        className="mx-auto w-full max-w-sm px-4 pb-24 pt-6 sm:max-w-md md:max-w-2xl lg:max-w-4xl"
      >
        {children}
      </main>
    </div>
  );
}