'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { NumerologyResults, OduResults } from '@/lib/engines/types/mapa-alma';

// 10 Sephiroth positions for 300x500 viewBox
const SEPHIROTH_POSITIONS = [
  { id: 1, name: 'Kether', pt: 'Coroa', y: 30, x: 150, planeta: 'Semlu', cor: '#FFFFFF', descricao: 'A Coroa - Punto supremo de conexión divina, el origen de toda emanación.' },
  { id: 2, name: 'Chokhmah', pt: 'Sabedoria', y: 75, x: 150, planeta: 'Oxóssi', cor: '#A855F7', descricao: 'La Sabiduría - La chispa divina, primer pensamiento del Creador.' },
  { id: 3, name: 'Binah', pt: 'Compreensão', y: 75, x: 150, planeta: 'Saturno', cor: '#6366F1', descricao: 'La Comprensión - El proceso de generar forma y limitacion.' },
  { id: 4, name: 'Chesed', pt: 'Misericordia', y: 160, x: 100, planeta: 'Júpiter', cor: '#3b82f6', descricao: 'La Misericordia - La gracia, la expansión y la generosidad divina.' },
  { id: 5, name: 'Geburah', pt: 'Severidade', y: 160, x: 200, planeta: 'Marte', cor: '#EF4444', descricao: 'La Fuerza - El rigor, la justicia y el poder transformador.' },
  { id: 6, name: 'Tiphereth', pt: 'Beleza', y: 220, x: 150, planeta: 'Sol', cor: '#C9A227', descricao: 'La Belleza - El centro del árbol, equilibrio entre actos y compresión.' },
  { id: 7, name: 'Netzach', pt: 'Vitória', y: 310, x: 80, planeta: 'Vênus', cor: '#22C55E', descricao: 'La Victoria - La perseverancia, la emoción y la energía vital.' },
  { id: 8, name: 'Hod', pt: 'Glória', y: 310, x: 220, planeta: 'Mercúrio', cor: '#F0C040', descricao: 'La Gloria - El intelecto, la comunicación y la palabra.' },
  { id: 9, name: 'Yesod', pt: 'Fundação', y: 400, x: 150, planeta: 'Lua', cor: '#38BDF8', descricao: 'La Fundación - La base de la realidad, el almacenamiento de experiencias.' },
  { id: 10, name: 'Malkuth', pt: 'Reino', y: 470, x: 150, planeta: 'Terra', cor: '#8B6914', descricao: 'El Reino - El mundo físico, la manifestación y la materialización.' },
] as const;

// 22 Paths connecting Sephiroth
const PATHS = [
  [1, 2], [2, 3], [1, 4], [2, 4], [3, 4], [4, 5], [4, 6], [5, 6],
  [6, 7], [6, 8], [7, 8], [7, 9], [8, 9], [9, 10],
  [1, 6], [2, 5], [3, 7], [4, 8], [5, 9], [6, 9],
  [1, 10], [3, 5],
] as const;

type PathTuple = [number, number];

interface ArvoreVidaVizProps {
  numerologia: NumerologyResults;
  odu: OduResults;
  className?: string;
}

// Reduce number to single digit (unless master number)
function reduceToBase(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return n;
}

// Find path between two Sephiroth
function findPath(from: number, to: number): PathTuple | null {
  const path = PATHS.find(
    ([a, b]) => (a === from && b === to) || (a === to && b === from)
  );
  return path ? path as PathTuple : null;
}

// Get highlighted Sephiroth IDs
// fallow-ignore-next-line complexity
function getHighlightedSep(vida: number, caminho: string): number[] {
  const vidaMap: Record<number, number> = {
    1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
    11: 1, 22: 6, 33: 6,
  };
  const reduced = reduceToBase(vida);
  const numerologySep = vidaMap[vida] || vidaMap[reduced] || vidaMap[reduced % 9 === 0 ? 9 : reduced % 9] || 6;
  const caminhoSep = SEPHIROTH_POSITIONS.find((s) => s.name === caminho || s.pt === caminho)?.id || 6;
  return [numerologySep, caminhoSep];
}

export function ArvoreVidaViz({ numerologia, odu, className = '' }: ArvoreVidaVizProps) {
  const [hoveredSep, setHoveredSep] = useState<number | null>(null);
  const [focusedSep, setFocusedSep] = useState<number | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [numerologySep, caminhoSep] = getHighlightedSep(numerologia.vida, odu.caminhoSephirah);
  const highlightedIds = new Set([numerologySep, caminhoSep]);

  // Find paths to highlight
  const numerologyPath = findPath(numerologySep, caminhoSep);
  const pathToNumerology = PATHS.filter(([a, b]) => a === numerologySep || b === numerologySep);
  const pathToCaminho = PATHS.filter(([a, b]) => a === caminhoSep || b === caminhoSep);
  const highlightedPaths = new Set<string>();
  
  // Add main connecting path
  if (numerologyPath) {
    highlightedPaths.add(`${numerologyPath[0]}-${numerologyPath[1]}`);
  }
  // Add paths to highlighted Sephiroth
  [...pathToNumerology, ...pathToCaminho].forEach(([a, b]) => {
    highlightedPaths.add(`${a}-${b}`);
  });

  const getPathStroke = (from: number, to: number): string => {
    const key = `${from}-${to}`;
    if (highlightedPaths.has(key)) {
      return '#C9A227';
    }
    return 'rgba(100, 100, 120, 0.5)';
  };

  const getPathStrokeWidth = (from: number, to: number): number => {
    const key = `${from}-${to}`;
    if (highlightedPaths.has(key)) {
      return 3;
    }
    return 1.5;
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent, sepId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTooltip((prev) => (prev === sepId ? null : sepId));
    }
  }, []);

  const handleFocus = useCallback((sepId: number) => {
    setFocusedSep(sepId);
    setActiveTooltip(sepId);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedSep(null);
    setActiveTooltip(null);
  }, []);

  const isTooltipVisible = (sepId: number): boolean => {
    return hoveredSep === sepId || activeTooltip === sepId;
  };

  return (
    <div className={cn('card-spiritual p-4', className)}>
      <h2 className="text-lg font-cinzel font-semibold text-amber-400 mb-4 flex items-center gap-2">
        <span className="text-amber-500">✦</span>
        ÁRVORE DA VIDA
      </h2>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox="0 0 300 500"
          className="w-full h-auto"
          role="img"
          aria-label="Árvore da Vida Cabalística - Visualização dos 10 Sephiroth com caminhos conectados. Seu caminho de Numerologia e Odu estão destacados em dourado."
          tabIndex={0}
        >
          {/* Paths (connecting lines) */}
          <g className="paths">
            {PATHS.map(([from, to]) => {
              const fromSep = SEPHIROTH_POSITIONS[from - 1];
              const toSep = SEPHIROTH_POSITIONS[to - 1];
              return (
                <line
                  key={`${from}-${to}`}
                  x1={fromSep.x}
                  y1={fromSep.y}
                  x2={toSep.x}
                  y2={toSep.y}
                  stroke={getPathStroke(from, to)}
                  strokeWidth={getPathStrokeWidth(from, to)}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Sephiroth circles */}
          <g className="sephiroth">
// fallow-ignore-next-line complexity
            {SEPHIROTH_POSITIONS.map((sep) => {
              const isHighlighted = highlightedIds.has(sep.id);
              const tooltipVisible = isTooltipVisible(sep.id);

              return (
                <g key={sep.id}>
                  {/* Main circle */}
                  <circle
                    cx={sep.x}
                    cy={sep.y}
                    r={isHighlighted ? 20 : 16}
                    fill={isHighlighted ? '#C9A227' : sep.cor}
                    stroke={isHighlighted ? '#FFD700' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isHighlighted ? 2 : 1}
                    className={cn(
                      'cursor-pointer transition-all duration-200',
                      isHighlighted && 'glow-gold'
                    )}
                    onMouseEnter={() => setHoveredSep(sep.id)}
                    onMouseLeave={() => setHoveredSep(null)}
                    onFocus={() => handleFocus(sep.id)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, sep.id)}
                    tabIndex={0}
                    role="img"
                    aria-label={`${sep.name} (${sep.pt}) - ${sep.planeta}`}
                  />
                  
                  {/* Number inside circle */}
                  <text
                    x={sep.x}
                    y={sep.y + 4}
                    textAnchor="middle"
                    fill={isHighlighted ? '#1a1a2e' : '#ffffff'}
                    fontSize="10"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {sep.id}
                  </text>

                  {/* Name below circle */}
                  <text
                    x={sep.x}
                    y={sep.y + (isHighlighted ? 34 : 30)}
                    textAnchor="middle"
                    fill={isHighlighted ? '#C9A227' : 'rgba(255,255,255,0.7)'}
                    fontSize="8"
                    fontWeight={isHighlighted ? 'bold' : 'normal'}
                    pointerEvents="none"
                  >
                    {sep.pt}
                  </text>

                  {/* Tooltip */}
                  {tooltipVisible && (
                    <g>
                      {/* Tooltip background */}
                      <rect
                        x={Math.min(sep.x - 60, 10)}
                        y={Math.max(sep.y - 90, 10)}
                        width={120}
                        height={80}
                        rx={8}
                        fill="rgba(15, 23, 42, 0.95)"
                        stroke="rgba(212, 168, 67, 0.5)"
                        strokeWidth={1}
                      />
                      {/* Tooltip title */}
                      <text
                        x={sep.x}
                        y={Math.max(sep.y - 70, 22)}
                        textAnchor="middle"
                        fill="#C9A227"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {sep.name}
                      </text>
                      {/* Tooltip subtitle */}
                      <text
                        x={sep.x}
                        y={Math.max(sep.y - 56, 36)}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.8)"
                        fontSize="8"
                      >
                        {sep.pt}
                      </text>
                      {/* Tooltip planeta */}
                      <text
                        x={sep.x}
                        y={Math.max(sep.y - 44, 48)}
                        textAnchor="middle"
                        fill={sep.cor}
                        fontSize="8"
                        fontWeight="bold"
                      >
                        {sep.planeta}
                      </text>
                      {/* Tooltip description */}
                      <text
                        x={sep.x}
                        y={Math.max(sep.y - 30, 62)}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.6)"
                        fontSize="7"
                      >
                        {isHighlighted ? '★ Seu Caminho ★' : sep.descricao}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs" aria-label="Legenda da Árvore da Vida">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#C9A227] border border-[#FFD700]" />
          <span className="text-slate-300">Seus Caminhos (Numeração & Odu)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-slate-300">Caminhos Cabalísticos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-500" />
          <span className="text-slate-300">Conexões</span>
        </div>
      </div>

      {/* Info summary */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="p-2 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Número de Vida</div>
          <div className="text-sm font-semibold text-amber-400">{numerologia.vida}</div>
          <div className="text-xs text-slate-500">
            {SEPHIROTH_POSITIONS[numerologySep - 1]?.pt}
          </div>
        </div>
        <div className="p-2 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Caminho do Odu</div>
          <div className="text-sm font-semibold text-amber-400">{odu.regente.nome}</div>
          <div className="text-xs text-slate-500">
            {SEPHIROTH_POSITIONS[caminhoSep - 1]?.pt}
          </div>
        </div>
      </div>
    </div>
  );
}
