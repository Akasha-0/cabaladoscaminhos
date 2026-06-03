// src/components/cockpit/HouseCell.tsx
// Individual cell for the 36-house matrix (Doc 05 §4.3 / Doc 13 §4.1)
// Tokens Ramiro v2: laranja (ação) + royal (estrutura).

'use client';

import { Plus, Trash2, Sparkles } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { HouseDefinition } from '@/lib/divination/house-types';
import { cn } from '@/lib/utils';
import type { FilledHouse, CartaCiganaOption } from '@/stores/cockpit-store';

interface HouseCellProps {
  house: HouseDefinition;
  filledData: FilledHouse | undefined;
  isActive: boolean;
  onClick: () => void;
  onClear: () => void;
}

function HouseCellInner({ house, filledData, isActive, onClick, onClear }: HouseCellProps) {
  const isFilled = !!filledData;

  return (
    <div
      onClick={onClick}
      className={cn(
        // Base styles
        'relative h-[140px] rounded-xl cursor-pointer transition-all duration-200',
        'flex flex-col overflow-hidden',

        // Empty state — Doc 13 §4.1 (laranja no hover)
        !isFilled &&
          [
            'bg-card/50 border border-dashed border-border',
            'hover:border-primary/50 hover:bg-card/70',
            // T7.1 a11y: gate hover-transform on motion-safe (prefers-reduced-motion: no-preference)
            'motion-safe:hover:-translate-y-1',
          ].join(' '),

        // Filled state — Doc 13 §4.1 (laranja sólido + glow)
        isFilled &&
          [
            'bg-gradient-to-b from-card/80 to-background/80',
            'border border-primary/50',
            'shadow-[0_0_15px_var(--accent-orange-glow)]',
            'hover:border-primary hover:shadow-[0_0_25px_var(--accent-orange-glow)]',
            // T7.1 a11y: gate hover-transform on motion-safe (prefers-reduced-motion: no-preference)
            'motion-safe:hover:-translate-y-1',
          ].join(' '),

        // Active state (has open popover) — Doc 13 §4.1
        isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* House Number - Top Left (JetBrains Mono) */}
      <div
        className={cn(
          'absolute top-2 left-2 text-xs font-mono',
          isFilled ? 'text-primary/70' : 'text-muted-foreground/50'
        )}
      >
        {String(house.number).padStart(2, '0')}
      </div>

      {/* Clear Button - Top Right */}
      {isFilled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className={cn(
            'absolute top-2 right-2 p-1 rounded-md',
            'opacity-0 group-hover:opacity-100',
            'hover:bg-muted/50 text-muted-foreground hover:text-destructive',
            'transition-all duration-150'
          )}
          aria-label={`Limpar casa ${house.number}`}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}

      {/* Content - Center */}
      <div className="flex-1 flex flex-col items-center justify-center p-2">
        {!isFilled ? (
          // Empty state - show plus icon
          <Plus
            className={cn(
              'w-6 h-6 transition-colors',
              'text-muted-foreground/50 group-hover:text-primary/50'
            )}
          />
        ) : (
          // Filled state
          <>
            {/* Carta Name (Cinzel, laranja Ramiro) */}
            <span className="text-sm font-bold text-primary text-center leading-tight font-cinzel">
              {String(filledData.carta?.numero ?? '?').padStart(2, '0')}.{' '}
              {filledData.carta?.nome ?? ''}
            </span>

            {/* Odu Badge (royal) */}
            {filledData.odu && (
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] px-2 py-0.5',
                    'bg-secondary/20 border-secondary/30',
                    'text-secondary'
                  )}
                >
                  Odu {filledData.odu.numero} - {filledData.odu.nome}
                </Badge>
              </div>
            )}
          </>
        )}
      </div>

      {/* House Original Name - Bottom */}
      <div
        className={cn(
          'absolute bottom-2 left-0 right-0 text-center',
          'text-[10px] uppercase tracking-wider',
          isFilled ? 'text-muted-foreground' : 'text-muted-foreground/70'
        )}
      >
        {house.cartaCigana}
      </div>

      {/* Active glow indicator */}
      {isActive && <div className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none" />}
    </div>
  );
}

// T7.3: memoize — 36 cells mounted; prevent re-render when sibling cell state changes
export const HouseCell = React.memo(HouseCellInner);
