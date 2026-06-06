// src/components/cockpit/dossier/DossierIndex.tsx
// Índice sticky das 36 casas (Doc 05 §5). Marca check/erro/pendente por casa.

'use client';

import { Check, AlertCircle, Circle } from 'lucide-react';
import { LENORMAND_CARDS } from '@/lib/constants/lenormand-cards';
import { cn } from '@/lib/utils';

interface DossierIndexProps {
  casas: number[];
  activeCasa: number | null;
  onSelect: (casa: number) => void;
  progress: { current: number; total: number };
  errors: number[];
}

/** Fonte canônica — não hardcodar nomes de casas. */
const HOUSE_NAMES: Record<number, string> = Object.fromEntries(
  LENORMAND_CARDS.map((c) => [c.id, c.name])
);

export function DossierIndex({ casas, activeCasa, onSelect, progress, errors }: DossierIndexProps) {
  const generated = new Set(casas);
  const errored = new Set(errors);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/50 bg-card/30 overflow-y-auto p-3">
      <div className="mb-3 px-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Progresso</p>
        <p className="font-mono text-sm text-primary">
          {progress.current}/{progress.total}
        </p>
      </div>
      <nav className="space-y-0.5">
        {Array.from({ length: 36 }, (_, i) => i + 1).map((casa) => {
          const isGenerated = generated.has(casa);
          const isErrored = errored.has(casa);
          const isActive = activeCasa === casa;
          return (
            <button
              key={casa}
              onClick={() => isGenerated && onSelect(casa)}
              disabled={!isGenerated}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors',
                isActive && 'bg-secondary/15 text-primary border-l-2 border-primary',
                !isActive && isGenerated && 'hover:bg-muted text-foreground/80',
                !isGenerated && !isActive && 'text-muted-foreground/40 cursor-default'
              )}
            >
              {isErrored ? (
                <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
              ) : isGenerated ? (
                <Check className="w-3 h-3 text-primary flex-shrink-0" />
              ) : (
                <Circle className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
              )}
              <span className="font-mono w-5">{String(casa).padStart(2, '0')}</span>
              <span className="truncate">{HOUSE_NAMES[casa]}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
