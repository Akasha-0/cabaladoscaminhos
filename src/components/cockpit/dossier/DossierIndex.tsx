// src/components/cockpit/dossier/DossierIndex.tsx
// Índice sticky das 36 casas (Doc 05 §5). Marca check/erro/pendente por casa.

'use client';

import { Check, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DossierIndexProps {
  casas: number[];
  activeCasa: number | null;
  onSelect: (casa: number) => void;
  progress: { current: number; total: number };
  errors: number[];
}

const HOUSE_NAMES: Record<number, string> = {
  1: 'O Cavaleiro',
  2: 'O Trevo',
  3: 'O Navio',
  4: 'A Casa',
  5: 'A Árvore',
  6: 'As Nuvens',
  7: 'A Serpente',
  8: 'O Caixão',
  9: 'Os Buquês',
  10: 'A Foice',
  11: 'O Chicote',
  12: 'Os Pássaros',
  13: 'A Criança',
  14: 'A Raposa',
  15: 'O Urso',
  16: 'A Estrela',
  17: 'A Cegonha',
  18: 'O Cachorro',
  19: 'A Torre',
  20: 'O Jardim',
  21: 'A Montanha',
  22: 'Os Caminhos',
  23: 'O Rato',
  24: 'O Coração',
  25: 'O Anel',
  26: 'O Livro',
  27: 'A Carta',
  28: 'O Cigano',
  29: 'A Cigana',
  30: 'Os Lírios',
  31: 'O Sol',
  32: 'A Lua',
  33: 'A Chave',
  34: 'Os Peixes',
  35: 'A Âncora',
  36: 'A Cruz',
};

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
// fallow-ignore-next-line complexity
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
