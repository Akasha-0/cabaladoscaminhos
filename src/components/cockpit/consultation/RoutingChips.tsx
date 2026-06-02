// src/components/cockpit/consultation/RoutingChips.tsx
// Chips de transparência do roteamento (Doc 05 §9 — royal, discreto).

interface RoutingChipsProps {
  themes: string[];
  houses: number[];
}

export function RoutingChips({ themes, houses }: RoutingChipsProps) {
  if (themes.length === 0 && houses.length === 0) return null;
  return (
    <div className="ml-9 flex flex-wrap items-center gap-1.5">
      {houses.map((casa) => (
        <span
          key={casa}
          className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border bg-secondary/15 border-secondary/40 text-secondary"
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
