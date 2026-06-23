'use client';
import { memo } from 'react';

export const RitualBadge = memo(function RitualBadge({
  ritual,
}: {
  ritual: { title: string; instruction: string; duration: string; element: string; color: string };
}) {
  return (
    <div
      className="rounded-xl p-3 flex items-start gap-3"
      style={{ backgroundColor: `${ritual.color}18` }}
    >
      <div
        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
        style={{ backgroundColor: ritual.color }}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: ritual.color }}>
            {ritual.title}
          </span>
          <span className="text-xs text-white/40">{ritual.duration}</span>
        </div>
        <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{ritual.instruction}</p>
      </div>
    </div>
  );
});
