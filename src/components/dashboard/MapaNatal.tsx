'use client';

import React, { useMemo } from 'react';

export interface MapaNatalProps {
  mapaNatal: {
    planeta?: Record<string, {
      planeta: string;
      longitude: number;
      latitude: number;
      distancia: number;
      velocidade: number;
      signo: string;
      casa: number;
      grauNoSigno: number;
    }>;
    casas?: Array<{ numero: number; signo: string; grauNoSigno: number }>;
    ascendente?: number;
    mediumCoeli?: number;
  };
  size?: number;
  className?: string;
}

// Zodiac signs in Portuguese with their degrees
const ZODIAC_SIGNS = [
  { name: 'Áries', symbol: '♈', start: 0 },
  { name: 'Touro', symbol: '♉', start: 30 },
  { name: 'Gêmeos', symbol: '♊', start: 60 },
  { name: 'Cancer', symbol: '♋', start: 90 },
  { name: 'Leão', symbol: '♌', start: 120 },
  { name: 'Virgem', symbol: '♍', start: 150 },
  { name: 'Libra', symbol: '♎', start: 180 },
  { name: 'Escorpião', symbol: '♏', start: 210 },
  { name: 'Sagitário', symbol: '♐', start: 240 },
  { name: 'Capricórnio', symbol: '♑', start: 270 },
  { name: 'Aquário', symbol: '♒', start: 300 },
  { name: 'Peixes', symbol: '♓', start: 330 },
];

// Sign colors
const SIGN_COLORS: Record<number, { stroke: string; fill: string; bg: string }> = {
  0: { stroke: '#DC2626', fill: '#EF4444', bg: 'rgba(220, 38, 38, 0.1)' },
  1: { stroke: '#16A34A', fill: '#22C55E', bg: 'rgba(22, 163, 74, 0.1)' },
  2: { stroke: '#CA8A04', fill: '#EAB308', bg: 'rgba(202, 138, 4, 0.1)' },
  3: { stroke: '#2563EB', fill: '#3B82F6', bg: 'rgba(37, 99, 235, 0.1)' },
  4: { stroke: '#F59E0B', fill: '#FBBF24', bg: 'rgba(245, 158, 11, 0.1)' },
  5: { stroke: '#65A30D', fill: '#84CC16', bg: 'rgba(101, 163, 13, 0.1)' },
  6: { stroke: '#9D174D', fill: '#EC4899', bg: 'rgba(157, 23, 77, 0.1)' },
  7: { stroke: '#1E3A8A', fill: '#1D4ED8', bg: 'rgba(30, 58, 138, 0.1)' },
  8: { stroke: '#7C2D12', fill: '#B45309', bg: 'rgba(124, 45, 18, 0.1)' },
  9: { stroke: '#374151', fill: '#4B5563', bg: 'rgba(55, 65, 81, 0.1)' },
  10: { stroke: '#0891B2', fill: '#06B6D4', bg: 'rgba(8, 145, 178, 0.1)' },
  11: { stroke: '#7C3AED', fill: '#8B5CF6', bg: 'rgba(124, 58, 237, 0.1)' },
};

// Planet symbols
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
  plutao: '♇',
  node_norte: '☊',
  node_sul: '☋',
};

// Convert degree to radians
function degToRad(deg: number): number {
  return (deg - 90) * (Math.PI / 180);
}

// Convert longitude to position on circle
function getPosition(longitude: number, radius: number, cx: number, cy: number): { x: number; y: number } {
  const rad = degToRad(longitude);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function MapaNatal({ mapaNatal, size = 400, className = '' }: MapaNatalProps) {
  const center = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.35;
  const planetRadius = size * 0.28;
  const houseRadius = size * 0.42;

  const zodiacSegments = useMemo(() => {
    return ZODIAC_SIGNS.map((sign, i) => {
      const startAngle = sign.start;
      const endAngle = (i < 11 ? ZODIAC_SIGNS[i + 1].start : 360) as number;
      const midAngle = (startAngle + endAngle) / 2;
      const colors = SIGN_COLORS[i];

      const start1 = getPosition(startAngle, outerRadius, center, center);
      const start2 = getPosition(startAngle, innerRadius, center, center);
      const end1 = getPosition(endAngle, outerRadius, center, center);
      const end2 = getPosition(endAngle, innerRadius, center, center);

      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const path = `
        M ${start1.x} ${start1.y}
        A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${end1.x} ${end1.y}
        L ${end2.x} ${end2.y}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${start2.x} ${start2.y}
        Z
      `;

      const symbolPos = getPosition(midAngle, size * 0.4, center, center);

      return { sign, colors, path, symbolPos };
    });
  }, [center, innerRadius, outerRadius, size]);

  const planets = useMemo(() => {
    const result: Array<{ name: string; symbol: string; position: { x: number; y: number }; degree: number }> = [];
    const planetEntries = Object.entries(mapaNatal.planeta ?? {});
    
    for (const [name, planet] of planetEntries) {
      const symbol = PLANET_SYMBOLS[name] || name;
      const pos = getPosition((planet as { longitude: number }).longitude ?? 0, planetRadius, center, center);
      result.push({
        name,
        symbol,
        position: pos,
        degree: planet.grauNoSigno,
      });
    }
    
    return result;
  }, [mapaNatal.planeta, planetRadius, center]);

  const ascendantPos = useMemo(() => {
    return getPosition(mapaNatal.ascendente ?? 0, outerRadius + 12, center, center);
  }, [mapaNatal.ascendente, outerRadius, center]);

  const mcPos = useMemo(() => {
    return getPosition(mapaNatal.mediumCoeli ?? 0, outerRadius + 12, center, center);
  }, [mapaNatal.mediumCoeli, outerRadius, center]);

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        <defs>
          {ZODIAC_SIGNS.map((sign, i) => {
            const colors = SIGN_COLORS[i];
            return (
              <linearGradient key={`grad-${i}`} id={`signGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.fill} stopOpacity="0.3" />
                <stop offset="100%" stopColor={colors.fill} stopOpacity="0.1" />
              </linearGradient>
            );
          })}
          <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f0a2e" />
          </radialGradient>
        </defs>

        {/* Background circle */}
        <circle cx={center} cy={center} r={outerRadius + 15} fill="none" stroke="#2d2b5e" strokeWidth="1" />
        
        {/* Zodiac segments */}
        {zodiacSegments.map((seg, i) => (
          <path
            key={i}
            d={seg.path}
            fill={`url(#signGrad-${i})`}
            stroke={seg.colors.stroke}
            strokeWidth="1"
            strokeOpacity="0.5"
          />
        ))}

        {/* Outer ring with degree markers */}
        {Array.from({ length: 360 }).map((_, i) => {
          if (i % 5 === 0) {
            const pos1 = getPosition(i, outerRadius + 5, center, center);
            const pos2 = getPosition(i, outerRadius + (i % 30 === 0 ? 10 : 7), center, center);
            return (
              <line
                key={`tick-${i}`}
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                stroke="#4a4875"
                strokeWidth={i % 30 === 0 ? 1.5 : 0.5}
              />
            );
          }
          return null;
        })}

        {/* House cusp lines from center */}
        {(mapaNatal.casas ?? []).map((casa, i) => {
          const endAngle = (i + 1) * 30;
          const end = getPosition(endAngle, outerRadius + 15, center, center);
          
          return (
            <line
              key={`house-${i}`}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#4a4875"
              strokeWidth="0.5"
              strokeDasharray="4 2"
            />
          );
        })}

        {/* Zodiac sign symbols */}
        {zodiacSegments.map((seg, i) => (
          <text
            key={`symbol-${i}`}
            x={seg.symbolPos.x}
            y={seg.symbolPos.y}
            fill={seg.colors.fill}
            fontSize={size * 0.04}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {seg.sign.symbol}
          </text>
        ))}

        {/* House numbers */}
        {(mapaNatal.casas ?? []).map((casa, i) => {
          const angle = i * 30 + 15;
          const pos = getPosition(angle, houseRadius, center, center);
          return (
            <text
              key={`houseNum-${i}`}
              x={pos.x}
              y={pos.y}
              fill="#8b83b1"
              fontSize={size * 0.025}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {casa.numero}
            </text>
          );
        })}

        {/* Ascendant marker */}
        <g>
          <line
            x1={center}
            y1={center}
            x2={ascendantPos.x}
            y2={ascendantPos.y}
            stroke="#a855f7"
            strokeWidth="2"
          />
          <circle cx={ascendantPos.x} cy={ascendantPos.y} r={size * 0.015} fill="#a855f7" />
          <text
            x={ascendantPos.x}
            y={ascendantPos.y - size * 0.025}
            fill="#a855f7"
            fontSize={size * 0.025}
            textAnchor="middle"
          >
            AC
          </text>
        </g>

        {/* Medium Coeli marker */}
        <g>
          <line
            x1={center}
            y1={center}
            x2={mcPos.x}
            y2={mcPos.y}
            stroke="#ec4899"
            strokeWidth="1.5"
          />
          <circle cx={mcPos.x} cy={mcPos.y} r={size * 0.01} fill="#ec4899" />
          <text
            x={mcPos.x}
            y={mcPos.y - size * 0.02}
            fill="#ec4899"
            fontSize={size * 0.02}
            textAnchor="middle"
          >
            MC
          </text>
        </g>

        {/* Center decoration */}
        <circle cx={center} cy={center} r={innerRadius - 10} fill="url(#centerGrad)" />
        <circle cx={center} cy={center} r={innerRadius - 5} fill="none" stroke="#2d2b5e" strokeWidth="0.5" />
        <circle cx={center} cy={center} r={size * 0.02} fill="#1e1b4b" stroke="#4a4875" strokeWidth="0.5" />

        {/* Planet symbols */}
        {planets.map((planet) => (
          <g key={planet.name} filter="url(#planetGlow)">
            <circle
              cx={planet.position.x}
              cy={planet.position.y}
              r={size * 0.025}
              fill="#1e1b4b"
              stroke="#a855f7"
              strokeWidth="1"
            />
            <text
              x={planet.position.x}
              y={planet.position.y}
              fill="#c4b5fd"
              fontSize={size * 0.022}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {planet.symbol}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default MapaNatal;
