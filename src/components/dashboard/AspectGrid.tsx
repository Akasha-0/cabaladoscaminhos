'use client';

import { useState, useMemo } from 'react';
import type { PosicaoPlaneta, AspectoTipo } from '@/lib/astrologia/tipos';
import { generateAspectGrid, type AspectGrid as AspectGridType } from '@/lib/astrologia/aspect-grid';

interface AspectGridProps {
  positions: PosicaoPlaneta[];
  size?: number;
}

const CORES_ASPECTOS: Record<string, string> = {
  'conjunção': '#FFD700',
  'sextil': '#00CED1',
  'quadratura': '#FF4500',
  'trino': '#32CD32',
  'oposição': '#FF1493',
};

const SIMBOLOS_ASPECTOS: Record<string, string> = {
  'conjunção': '☌',
  'sextil': '✶',
  'quadratura': '□',
  'trino': '△',
  'oposição': '☍',
};

const PLANET_SYMBOLS: Record<string, string> = {
  sol: '☉',
  lua: '☽',
  mercurio: '☿',
  venus: '♀',
  marte: '♂',
  jupiter: '♃',
  saturno: '♄',
  urano: '♅',
  netuno: '♆',
  plutão: '♇',
};

interface CellHoverInfo {
  planeta1: string;
  planeta2: string;
  tipo: AspectoTipo;
  orb: number;
  strength: number;
  aplicativo: boolean;
}

export function AspectGrid({ positions, size = 400 }: AspectGridProps) {
  const [hoveredCell, setHoveredCell] = useState<CellHoverInfo | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const grid = useMemo(() => {
    return generateAspectGrid(positions);
  }, [positions]);

  const planetLabels = useMemo(() => {
    return grid.positions.map(p => PLANET_SYMBOLS[p.planeta] || p.planeta.charAt(0).toUpperCase());
  }, [grid.positions]);

  const handleMouseEnter = (
    e: React.MouseEvent,
    planeta1: string,
    planeta2: string,
    tipo: AspectoTipo,
    orb: number,
    strength: number,
    aplicativo: boolean
  ) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHoveredCell({ planeta1, planeta2, tipo, orb, strength, aplicativo });
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const getCellColor = (tipo: AspectoTipo | null, strength: number): string => {
    if (!tipo) return 'transparent';
    const baseColor = CORES_ASPECTOS[tipo] || '#888';
    const opacity = strength / 100;
    return `rgba(${hexToRgb(baseColor)}, ${opacity})`;
  };

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '128, 128, 128';
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  };

  const getBorderColor = (tipo: AspectoTipo | null): string => {
    if (!tipo) return 'rgba(255, 255, 255, 0.1)';
    return CORES_ASPECTOS[tipo] || '#888';
  };

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-muted-foreground text-sm">Sem posições planetárias</span>
      </div>
    );
  }

  const cellSize = Math.min(40, (size - 60) / Math.max(positions.length, 1));
  const labelWidth = 50;
  const gridSize = positions.length * cellSize;

  return (
    <div className="relative">
      <div className="flex flex-col" style={{ width: size }}>
        {/* Header row with planet labels */}
        <div className="flex" style={{ marginLeft: labelWidth }}>
          {planetLabels.map((label, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center font-bold text-sm"
              style={{
                width: cellSize,
                height: cellSize,
                color: 'hsl(var(--foreground))',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        <div className="flex flex-col">
          {grid.positions.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center">
              {/* Row planet label */}
              <div
                className="flex items-center justify-end pr-2 font-bold text-sm"
                style={{
                  width: labelWidth,
                  height: cellSize,
                  color: 'hsl(var(--foreground))',
                }}
              >
                {planetLabels[rowIdx]}
              </div>

              {/* Grid cells */}
              <div className="flex">
                {grid.positions.map((_, colIdx) => {
                  const cell = grid.grid[rowIdx][colIdx];
                  const isSelf = rowIdx === colIdx;

                  return (
                    <div
                      key={colIdx}
                      className="flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                      style={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: isSelf ? 'transparent' : getCellColor(cell.tipo, cell.strength),
                        border: isSelf ? 'none' : `1px solid ${getBorderColor(cell.tipo)}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelf && cell.exists && cell.tipo) {
                          handleMouseEnter(
                            e,
                            grid.positions[rowIdx].planeta,
                            grid.positions[colIdx].planeta,
                            cell.tipo,
                            cell.orb,
                            cell.strength,
                            cell.aplicativo
                          );
                        }
                      }}
                      onMouseLeave={handleMouseLeave}
                    >
                      {!isSelf && cell.exists && cell.tipo && (
                        <span
                          className="text-xs font-medium"
                          style={{ color: getBorderColor(cell.tipo) }}
                        >
                          {SIMBOLOS_ASPECTOS[cell.tipo]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {Object.entries(CORES_ASPECTOS).map(([tipo, cor]) => (
            <div key={tipo} className="flex items-center gap-1">
              <span style={{ color: cor }}>{SIMBOLOS_ASPECTOS[tipo]}</span>
              <span className="text-muted-foreground capitalize">{tipo}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 px-3 py-2 text-xs rounded-lg shadow-lg border pointer-events-none"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 10,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'hsl(var(--background))',
            borderColor: CORES_ASPECTOS[hoveredCell.tipo],
          }}
        >
          <div className="font-semibold mb-1" style={{ color: CORES_ASPECTOS[hoveredCell.tipo] }}>
            {SIMBOLOS_ASPECTOS[hoveredCell.tipo]} {hoveredCell.tipo}
          </div>
          <div className="text-foreground">
            {PLANET_SYMBOLS[hoveredCell.planeta1]} {hoveredCell.planeta1} × {PLANET_SYMBOLS[hoveredCell.planeta2]} {hoveredCell.planeta2}
          </div>
          <div className="text-muted-foreground mt-1">
            Orb: {hoveredCell.orb.toFixed(1)}° | Força: {hoveredCell.strength}%
          </div>
          {hoveredCell.aplicativo && (
            <div className="text-muted-foreground text-[10px]">Aplicativo</div>
          )}
        </div>
      )}
    </div>
  );
}
