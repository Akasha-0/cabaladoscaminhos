// src/components/cockpit/consultation/RoutingChips.tsx
// Chips de transparência do roteamento (Doc 05 §9 — royal, discreto).
import React from 'react';
interface RoutingChipsProps {
  themes: string[];
  houses: number[];
}

function RoutingChipsInner({ themes, houses }: RoutingChipsProps) {
  if (themes.length === 0 && houses.length === 0) return null;
  return (
    <div className="ml-9 flex flex-wrap items-center gap-1.5">
      {houses.map((casa) => (
        <span
          key={casa}
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
          style={{
            backgroundColor: 'rgba(37, 71, 208, 0.15)',
            borderColor: 'rgba(37, 71, 208, 0.40)',
            color: 'var(--color-ramiro-royal)',
          }}
        >
          Casa {casa}
        </span>
      ))}
      {themes.map((theme) => (
        <span
          key={theme}
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border bg-muted/40 border-border text-muted-foreground/80"
        >
          {theme}
        </span>
      ))}
      <span className="text-[10px] text-muted-foreground/50 ml-1">· casas consultadas</span>
    </div>
  );
}

// T7.3: memoize — prevents re-render when cockpit parent re-renders
export const RoutingChips = React.memo(RoutingChipsInner);
