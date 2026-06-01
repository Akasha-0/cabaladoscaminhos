// src/components/cockpit/HouseCell.tsx
// Individual cell for the 36-house matrix

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { FilledHouse, CartaCiganaOption } from '@/stores/cockpit-store';
import type { HouseDefinition } from '@/lib/divination/house-types';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Sparkles } from 'lucide-react';

interface HouseCellProps {
  house: HouseDefinition;
  filledData: FilledHouse | undefined;
  isActive: boolean;
  onClick: () => void;
  onClear: () => void;
}

export function HouseCell({ house, filledData, isActive, onClick, onClear }: HouseCellProps) {
  const isFilled = !!filledData;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        // Base styles
        'relative h-[140px] rounded-xl cursor-pointer transition-all duration-200',
        'flex flex-col overflow-hidden',
        
        // Empty state
        !isFilled && [
          'bg-slate-900/80 border border-dashed border-slate-700',
          'hover:border-amber-500/50 hover:bg-slate-900/90',
          'hover:-translate-y-1',
        ].join(' '),
        
        // Filled state
        isFilled && [
          'bg-gradient-to-b from-slate-800 to-slate-900',
          'border border-amber-600/50',
          'shadow-[0_0_15px_rgba(212,175,55,0.1)]',
          'hover:border-amber-500 hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]',
          'hover:-translate-y-1',
        ].join(' '),
        
        // Active state (has open popover)
        isActive && 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-950'
      )}
    >
      {/* House Number - Top Left */}
      <div className={cn(
        'absolute top-2 left-2 text-xs font-mono',
        isFilled ? 'text-amber-500/70' : 'text-slate-600'
      )}>
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
            'hover:bg-slate-700/50 text-slate-400 hover:text-rose-400',
            'transition-all duration-150'
          )}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
      
      {/* Content - Center */}
      <div className="flex-1 flex flex-col items-center justify-center p-2">
        {!isFilled ? (
          // Empty state - show plus icon
          <Plus className={cn(
            'w-6 h-6 transition-colors',
            'text-slate-600 group-hover:text-amber-500/50'
          )} />
        ) : (
          // Filled state
          <>
            {/* Carta Name */}
            <span className="text-sm font-bold text-amber-400 text-center leading-tight">
              {String(filledData.carta?.numero ?? '?').padStart(2, '0')}. {filledData.carta?.nome ?? ''}
            </span>
            
            {/* Odu Badge */}
            {filledData.odu && (
              <div className="mt-2">
                <Badge 
                  variant="outline"
                  className={cn(
                    'text-[10px] px-2 py-0.5',
                    'bg-emerald-900/30 border-emerald-500/30',
                    'text-emerald-400'
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
      <div className={cn(
        'absolute bottom-2 left-0 right-0 text-center',
        'text-[10px] uppercase tracking-wider',
        isFilled ? 'text-slate-400' : 'text-slate-500'
      )}>
        {house.cartaCigana}
      </div>
      
      {/* Active glow indicator */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-amber-500/5 pointer-events-none" />
      )}
    </div>
  );
}

export default HouseCell;