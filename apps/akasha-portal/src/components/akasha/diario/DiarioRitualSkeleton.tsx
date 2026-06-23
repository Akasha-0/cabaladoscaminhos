'use client';

/**
 * DiarioRitualSkeleton — minimal animated placeholder for RitualSection.
 * Mirrors the visual footprint (card + badges + button) so section 2
 * never collapses to a blank gap when /daily resolves slowly or fails.
 */
export function DiarioRitualSkeleton() {
  return (
    <section
      aria-label="Micro-ritual"
      className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4 animate-pulse"
    >
      {/* Title */}
      <div className="h-[1.15rem] w-2/3 rounded bg-white/5 mb-2" />

      {/* Instruction text */}
      <div className="space-y-2 mb-4">
        <div className="h-[0.9rem] w-full rounded bg-white/5" />
        <div className="h-[0.9rem] w-3/4 rounded bg-white/5" />
      </div>

      {/* Badges */}
      <div className="flex gap-2">
        <div className="h-5 w-24 rounded-full bg-white/5" />
        <div className="h-5 w-24 rounded-full bg-white/5" />
      </div>

      {/* Expand button placeholder */}
      <div className="h-4 w-40 rounded bg-white/5 mt-3" />

      {/* Oraculo link placeholder */}
      <div className="h-[3.5] w-full rounded-xl bg-white/5 mt-4" />
    </section>
  );
}
