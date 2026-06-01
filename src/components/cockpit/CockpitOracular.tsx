// src/components/cockpit/CockpitOracular.tsx
// Main cockpit component with 3-zone layout

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useCockpitStore, type CartaCiganaOption } from '@/stores/cockpit-store';
import { HOUSES_36 } from '@/lib/divination/house-delegation';
import { type OduInfo } from '@/lib/ifa/odu-data';
import { CockpitSidebar } from './CockpitSidebar';
import { CockpitHeader } from './CockpitHeader';
import { HouseCell } from './HouseCell';
import { HouseInputPopover } from './HouseInputPopover';

interface CockpitOracularProps {
  showDebug?: boolean;
}

export function CockpitOracular({ showDebug = false }: CockpitOracularProps) {
  const {
    houses,
    activePopover,
    setActivePopover,
    fillHouse,
    clearHouse,
    clearAllHouses,
    resetCockpit,
  } = useCockpitStore();

  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);

  const handleClosePopover = useCallback(() => {
    setActivePopover(null);
    setPopoverPosition(null);
  }, [setActivePopover]);

  const handleSaveHouse = useCallback((carta: CartaCiganaOption, odu: OduInfo) => {
    if (activePopover) {
      fillHouse(activePopover, carta, odu);
    }
  }, [activePopover, fillHouse]);

  const handleClearHouse = useCallback((casaNumero: number) => {
    clearHouse(casaNumero);
  }, [clearHouse]);

  const handleNewAtendimento = useCallback(() => {
    resetCockpit();
  }, [resetCockpit]);

  const handleClearAll = useCallback(() => {
    clearAllHouses();
  }, [clearAllHouses]);

  const handleAutoFill = useCallback(() => {
    // Demo auto-fill - fill first 12 houses
    const CARTAS_EXAMPLE: { numero: number; nome: string; significado: string }[] = [
      { numero: 1, nome: 'O Cavaleiro', significado: 'Ação' },
      { numero: 4, nome: 'A Casa', significado: 'Família' },
      { numero: 9, nome: 'O Buquê', significado: 'Surpresas' },
      { numero: 12, nome: 'Os Pássaros', significado: 'Comunicação' },
      { numero: 16, nome: 'A Estrela', significado: 'Esperança' },
      { numero: 19, nome: 'O Cachorro', significado: 'Lealdade' },
      { numero: 25, nome: 'A Flor', significado: 'Amor' },
      { numero: 27, nome: 'A Áncora', significado: 'Estabilidade' },
      { numero: 31, nome: 'O Sol', significado: 'Sucesso' },
      { numero: 5, nome: 'A Árvore', significado: 'Crescimento' },
      { numero: 17, nome: 'O Veado', significado: 'Metas' },
      { numero: 28, nome: 'O Anjo', significado: 'Proteção' },
    ];

    const odusExample = [
      { numero: 1, nome: 'Okaran', significado: 'O começo', elementos: 'Terra / Fogo', orixas: ['Exu', 'Omolu'], quizilas: [], preceitos: '', ebo: '' },
      { numero: 4, nome: 'Irosun', significado: 'O aviso', elementos: 'Fogo / Terra', orixas: ['Iemanjá', 'Oxóssi'], quizilas: [], preceitos: '', ebo: '' },
      { numero: 7, nome: 'Odi', significado: 'O poço', elementos: 'Terra / Água', orixas: ['Omolu', 'Oxumaré'], quizilas: [], preceitos: '', ebo: '' },
      { numero: 2, nome: 'Ejiokô', significado: 'Dualidade', elementos: 'Ar / Terra', orixas: ['Ibeji', 'Ogum'], quizilas: [], preceitos: '', ebo: '' },
    ];

    for (let i = 1; i <= 12; i++) {
      const carta = CARTAS_EXAMPLE[(i - 1) % CARTAS_EXAMPLE.length];
      const odu = odusExample[(i - 1) % odusExample.length];
      fillHouse(i, carta, odu as unknown as OduInfo);
    }
  }, [fillHouse]);

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Zone A: Left Sidebar */}
      <CockpitSidebar onNewAtendimento={handleNewAtendimento} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Zone B: Header */}
        <CockpitHeader 
          showDebug={showDebug}
          onClearAll={handleClearAll}
          onAutoFill={showDebug ? handleAutoFill : undefined}
        />

        {/* Zone C: Matrix Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div 
            className={cn(
              'max-w-6xl mx-auto',
              'bg-slate-900/50 rounded-3xl',
              'border border-slate-800/50',
              'p-6 md:p-8',
              'shadow-[0_0_80px_rgba(212,175,55,0.05)]'
            )}
          >
            {/* Grid Container */}
            <div 
              className="grid gap-3"
              style={{
                gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
              }}
            >
              {HOUSES_36.map((house) => {
                const filledData = houses.get(house.number);
                const isActive = activePopover === house.number;
                
                return (
                  <div 
                    key={house.number}
                    className="group"
                    onClick={() => {
                      setActivePopover(isActive ? null : house.number);
                    }}
                  >
                    <HouseCell
                      house={house}
                      filledData={filledData}
                      isActive={isActive}
                      onClick={() => {
                        setActivePopover(isActive ? null : house.number);
                      }}
                      onClear={() => handleClearHouse(house.number)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Grid Glow Effect */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-b from-amber-500/5 to-transparent opacity-50" />
          </div>

          {/* Progress Summary */}
          <div className="max-w-6xl mx-auto mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-800 border border-dashed border-slate-600" />
                <span className="text-xs text-slate-500">Vazia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-600/50" />
                <span className="text-xs text-slate-500">Preenchida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded ring-2 ring-amber-500" />
                <span className="text-xs text-slate-500">Em edição</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-600">
              Clique em uma casa para preencher · Use Tab para navegar
            </p>
          </div>
        </div>
      </div>

      {/* Popover - Positioned absolutely */}
      {activePopover !== null && (
        <div 
          className="fixed z-50"
          style={{
            top: popoverPosition?.y ? popoverPosition.y - 10 : undefined,
            left: popoverPosition?.x ? `calc(${popoverPosition.x}px - 160px)` : undefined,
            transform: 'translateY(-100%)',
          }}
        >
          <HouseInputPopover
            casaNumero={activePopover}
            onClose={handleClosePopover}
            onSave={handleSaveHouse}
          />
        </div>
      )}
    </div>
  );
}

export default CockpitOracular;