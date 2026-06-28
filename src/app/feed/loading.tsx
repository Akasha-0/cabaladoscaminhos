/**
 * Wave 17 + Wave 18 — Feed route loading skeleton (Next.js Suspense fallback).
 *
 * Wave 18 perf: PostCardSkeleton is dynamically imported so its JS payload
 * (Lucide icons + skeleton CSS deps) stays out of the feed route's initial
 * bundle. The header skeleton uses inline `<div className="skeleton">`
 * blocks — those are CSS-only and ship no JS.
 */

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/design-system/skeleton";

const PostCardSkeleton = dynamic(
  () =>
    import("@/components/design-system/skeleton").then(
      (m) => ({ default: m.PostCardSkeleton }),
    ),
  { ssr: true },
);

export default function FeedLoading() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-2 h-3 w-24 rounded skeleton" />
          <div className="mb-3 h-9 w-72 rounded skeleton" />
          <div className="h-4 w-96 max-w-full rounded skeleton" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </main>
    </div>
  );
}

// Re-export Skeleton so other files importing `Skeleton` from this module
// don't break (Next.js looks for the default export only, but defensive).
export { Skeleton };