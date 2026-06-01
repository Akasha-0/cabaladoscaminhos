'use client';

// ============================================================
// MESA REAL GRID - Cabala Dos Caminhos
// Uses existing mesa-real-data types
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CASAS_MESA_REAL } from '@/lib/lenormand/mesa-real-data';
import type { CasaCigana } from '@/lib/lenormand/mesa-real-types';

// ============================================================
// TYPES
// ============================================================

export interface MesaRealGridProps {
  matrixData: Record<number, { carta?: number; odu?: number }>;
  onCasaClick: (casaNumero: number) => void;
  className?: string;
}

interface C_STATUS {
  filled: boolean;
  carta?: number;
  odu?: number;
}

// ============================================================
// CELL COMPONENT
// ============================================================

interface CasaCellProps {
  casa: CasaCigana;
  status: C_STATUS;
  onClick: () => void;
}

function CasaCell({ casa, status, onClick }: CasaCellProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative aspect-square rounded-lg border-2 transition-all duration-200',
        'flex flex-col items-center justify-center p-1 min-h-[3rem]',
        'hover:scale-105 hover:z-10 focus:outline-none focus:ring-2 focus:ring-primary/50',
        status.filled
          ? 'bg-primary/20 border-primary'
          : 'bg-card/50 border-border hover:border-primary/50'
      )}
      aria-label={`Casa ${casa.houseNumber}: ${casa.name}`}
    >
      <span className={cn(
        'text-xs font-bold',
        status.filled ? 'text-primary' : 'text-muted-foreground'
      )}>
        {casa.houseNumber}
      </span>

      {status.filled && status.carta && (
        <span className="mt-0.5 px-1 py-0.5 bg-primary/30 rounded text-[10px] font-medium">
          {status.carta}
        </span>
      )}

      {status.filled && status.odu && (
        <span className="mt-0.5 px-1 py-0.5 bg-secondary/30 rounded text-[10px]">
          {status.odu}
        </span>
      )}
    </motion.button>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function MesaRealGrid({
  matrixData,
  onCasaClick,
  className,
}: MesaRealGridProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-9 gap-1 sm:gap-2">
        {CASAS_MESA_REAL.map((casa) => {
          const data = matrixData[casa.houseNumber];
          const status: C_STATUS = {
            filled: !!data?.carta,
            carta: data?.carta,
            odu: data?.odu,
          };

          return (
            <CasaCell
              key={casa.houseNumber}
              casa={casa}
              status={status}
              onClick={() => onCasaClick(casa.houseNumber)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default MesaRealGrid;
