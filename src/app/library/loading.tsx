/**
 * Wave 17 + Wave 18 — Library route loading skeleton (Next.js Suspense fallback).
 *
 * Wave 18 perf: ArticleCardSkeleton is dynamically imported so its JS
 * payload stays out of the library route's initial bundle. Inline
 * `<div className="skeleton">` blocks remain CSS-only.
 */

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/design-system/skeleton";

const ArticleCardSkeleton = dynamic(
  () =>
    import("@/components/design-system/skeleton").then(
      (m) => ({ default: m.ArticleCardSkeleton }),
    ),
  { ssr: true },
);

export default function LibraryLoading() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-3 h-3 w-32 rounded skeleton" />
          <div className="mb-3 h-10 w-80 rounded skeleton" />
          <div className="h-4 w-[28rem] max-w-full rounded skeleton" />
          <div className="mt-6 flex gap-3">
            <div className="h-9 w-36 rounded skeleton" />
            <div className="h-9 w-36 rounded skeleton" />
          </div>
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-5xl space-y-12 px-4 py-10 focus:outline-none"
      >
        <section>
          <div className="mb-6 space-y-2">
            <div className="h-6 w-40 rounded skeleton" />
            <div className="h-4 w-96 max-w-full rounded skeleton" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        </section>
      </main>
    </div>
  );
}

export { Skeleton };