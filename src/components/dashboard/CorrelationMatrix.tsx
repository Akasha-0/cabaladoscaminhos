'use client';

import { useMemo, useState } from 'react';

import { calculateCorrelations, type HeatmapCell } from '@/lib/analytics/correlation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TooltipInfo } from '@/components/ui/tooltip-info';

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  cell: HeatmapCell | null;
}

function getStrengthColor(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 0.8) return 'bg-violet-600';
  if (abs >= 0.6) return 'bg-indigo-500';
  if (abs >= 0.4) return 'bg-blue-500';
  if (abs >= 0.2) return 'bg-cyan-500';
  return 'bg-slate-400';
}

function getStrengthLabel(strength: HeatmapCell['strength']): string {
  switch (strength) {
    case 'very-strong': return 'Muito Forte';
    case 'strong': return 'Forte';
    case 'moderate': return 'Moderada';
    case 'weak': return 'Fraca';
  }
}

function getStrengthLabelColor(strength: HeatmapCell['strength']): string {
  switch (strength) {
    case 'very-strong': return 'text-violet-400';
    case 'strong': return 'text-indigo-400';
    case 'moderate': return 'text-blue-400';
    case 'weak': return 'text-slate-400';
  }
}

export function CorrelationMatrix() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    cell: null,
  });

  const { labels, matrix, cells } = useMemo(() => calculateCorrelations(), []);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    cell: HeatmapCell
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      cell,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, cell: null });
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <CardTitle className="font-cinzel text-primary flex items-center gap-2">
          ✦ Matriz de Correlação Espiritual
          <TooltipInfo
            titulo="Sobre a Matriz"
            descricao="Esta matriz mostra como os diferentes sistemas espirituais se correlacionam entre si. Correlações mais fortes indicam sistemas com atributos compartilhados."
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Heatmap grid */}
        <div className="relative overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex flex-col gap-0.5">
              {/* Header row with Y-axis labels */}
              <div className="flex">
                <div className="w-28 shrink-0" /> {/* Corner cell */}
                {labels.map((label) => (
                  <div
                    key={`header-${label}`}
                    className="w-16 sm:w-20 shrink-0 text-center"
                  >
                    <span
                      className="text-[10px] sm:text-xs text-muted-foreground font-medium"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Matrix rows */}
              {labels.map((rowLabel, rowIdx) => (
                <div key={`row-${rowLabel}`} className="flex items-center gap-0.5">
                  {/* Y-axis label */}
                  <div className="w-28 shrink-0 pr-2 text-right">
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate block">
                      {rowLabel}
                    </span>
                  </div>

                  {/* Cells */}
                  {labels.map((_, colIdx) => {
                    const cell = cells.find(
                      (c) => c.x === labels[colIdx] && c.y === rowLabel
                    );
                    if (!cell) return null;

                    const isDiagonal = rowIdx === colIdx;
                    const bgColor = isDiagonal
                      ? 'bg-primary/30'
                      : getStrengthColor(cell.value);

                    return (
                      <div
                        key={`cell-${rowLabel}-${labels[colIdx]}`}
                        className={`w-16 sm:w-20 h-10 sm:h-12 shrink-0 rounded cursor-pointer transition-all hover:scale-110 hover:z-10 ${bgColor} ${
                          isDiagonal ? '' : 'hover:ring-2 hover:ring-primary/50'
                        }`}
                        onMouseEnter={(e) => handleMouseEnter(e, cell)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <span className="sr-only">
                          {cell.x} × {cell.y}: {cell.value.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip.show && tooltip.cell && (
          <div
            className="fixed z-50 px-3 py-2 text-xs bg-card/95 border border-border rounded-lg shadow-lg pointer-events-none backdrop-blur-sm"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 8}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-medium text-primary mb-1">
              {tooltip.cell.y} ↔ {tooltip.cell.x}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Correlação:</span>
                <span className="font-mono">{tooltip.cell.value.toFixed(3)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Força:</span>
                <span className={getStrengthLabelColor(tooltip.cell.strength)}>
                  {getStrengthLabel(tooltip.cell.strength)}
                </span>
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 -bottom-1.5 w-3 h-1.5 bg-card/95 border-r border-b border-border rotate-45 transform -translate-x-1/2" />
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border/30">
          <h4 className="text-sm font-medium text-primary mb-3">Legenda de Força</h4>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-violet-600" />
              <span className="text-xs text-muted-foreground">≥0.8 Muito Forte</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-500" />
              <span className="text-xs text-muted-foreground">≥0.6 Forte</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-xs text-muted-foreground">≥0.4 Moderada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-500" />
              <span className="text-xs text-muted-foreground">≥0.2 Fraca</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-400" />
              <span className="text-xs text-muted-foreground"><0.2 Mínima</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CorrelationMatrix;
