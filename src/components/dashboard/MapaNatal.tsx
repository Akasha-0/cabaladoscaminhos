'use client';

import React, { useMemo } from 'react';
import type { MapaNatal } from '@/lib/astrologia/tipos';

export interface MapaNatalProps {
  mapaNatal: MapaNatal;
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
  0: { stroke: '#DC2626', fill: '#EF4444', bg: 'rgba(220, 38, 38, 0.1)' }, // Áries - Red
  1: { stroke: '#16A34A', fill: '#22C55E', bg: 'rgba(22, 163, 74, 0.1)' }, // Touro - Green
  2: { stroke: '#CA8A04', fill: '#EAB308', bg: 'rgba(202, 138, 4, 0.1)' }, // Gêmeos - Yellow
  3: { stroke: '#2563EB', fill: '#3B82F6', bg: 'rgba(37, 99, 235, 0.1)' }, // Câncer - Blue
  4: { stroke: '#F59E0B', fill: '#FBBF24', bg: 'rgba(245, 158, 11, 0.1)' }, // Leão - Orange
  5: { stroke: '#65A30D', fill: '#84CC16', bg: 'rgba(101, 163, 13, 0.1)' }, // Virgem - Lime
  6: { stroke: '#9D174D', fill: '#EC4899', bg: 'rgba(157, 23, 77, 0.1)' }, // Libra - Pink
  7: { stroke: '#1E3A8A', fill: '#1D4ED8', bg: 'rgba(30, 58, 138, 0.1)' }, // Escorpião - Dark Blue
  8: { stroke: '#7C2D12', fill: '#B45309', bg: 'rgba(124, 45, 18, 0.1)' }, // Sagitário - Brown
  9: { stroke: '#374151', fill: '#4B5563', bg: 'rgba(55, 65, 81, 0.1)' }, // Capricórnio - Gray
  10: { stroke: '#0891B2', fill: '#06B6D4', bg: 'rgba(8, 145, 178, 0.1)' }, // Aquário - Cyan
  11: { stroke: '#7C3AED', fill: '#8B5CF6', bg: 'rgba(124, 58, 237, 0.1)' }, // Peixes - Purple
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

export function MapaNatal({ mapaNatal, size = 400, className = '' }: MapaNatalProps) {
  const center = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.35;
  const planetRadius = size * 0.28;
  const signRadius = size * 0.42;

  // Calculate house cusps from ascendant
  const houseCusps = useMemo(() => {
    const cusps: number[] = [];
    const asc = mapaNatal.ascendente;
    for (let i = 0; i < 12; i++) {
      // Simplified house calculation (equal houses)
      cusps.push((asc + i * 30) % 360);
    }
    return cusps;
  }, [mapaNatal.ascendente]);

  // Get planet positions
  const planetPositions = useMemo(() => {
    const positions: { planet: string; longitude: number; symbol: string }[] = [];
    const planetMap = mapaNatal.planeta;

    const planetList = [
      { key: 'sol', name: 'sol' },
      { key: 'lua', name: 'lua' },
      { key: 'mercurio', name: 'mercurio' },
      { key: 'venus', name: 'venus' },
      { key: 'marte', name: 'marte' },
      { key: 'jupiter', name: 'jupiter' },
      { key: 'saturno', name: 'saturno' },
    ];

    for (const { key, name } of planetList) {
      if (planetMap[key as keyof typeof planetMap]) {
        const pos = planetMap[key as keyof typeof planetMap];
        positions.push({
          planet: name,
          longitude: pos.longitude,
          symbol: PLANET_SYMBOLS[name] || name,
        });
      }
    }

    return positions;
  }, [mapaNatal]);

  // Generate sign segments
  const signSegments = useMemo(() => {
    return ZODIAC_SIGNS.map((sign, i) => {
      const startAngle = degToRad(sign.start);
      const endAngle = degToRad(sign.start + 30);
      const colors = SIGN_COLORS[i];

      const outerStart = {
        x: center + outerRadius * Math.cos(startAngle),
        y: center + outerRadius * Math.sin(startAngle),
      };
      const outerEnd = {
        x: center + outerRadius * Math.cos(endAngle),
        y: center + outerRadius * Math.sin(endAngle),
      };
      const innerStart = {
        x: center + innerRadius * Math.cos(startAngle),
        y: center + innerRadius * Math.sin(startAngle),
      };
      const innerEnd = {
        x: center + innerRadius * Math.cos(endAngle),
        y: center + innerRadius * Math.sin(endAngle),
      };

      // Sign label position
      const labelAngle = degToRad(sign.start + 15);
      const labelRadius = size * 0.395;
      const labelPos = {
        x: center + labelRadius * Math.cos(labelAngle),
        y: center + labelRadius * Math.sin(labelAngle),
      };

      return {
        ...sign,
        index: i,
        colors,
        outerStart,
        outerEnd,
        innerStart,
        innerEnd,
        labelPos,
        largeArc: 0,
      };
    });
  }, [center, outerRadius, innerRadius, size]);

  // Generate house division lines
  const houseLines = useMemo(() => {
    return houseCusps.map((cusp, i) => {
      const angle = degToRad(cusp);
      const start = {
        x: center + (innerRadius - 10) * Math.cos(angle),
        y: center + (innerRadius - 10) * Math.sin(angle),
      };
      const end = {
        x: center + outerRadius * Math.cos(angle),
        y: center + outerRadius * Math.sin(angle),
      };
      return { house: i + 1, cusp, start, end };
    });
  }, [houseCusps, center, innerRadius, outerRadius]);

  // Ascendant position
  const ascendantPos = useMemo(() => {
    return getPosition(mapaNatal.ascendente, planetRadius, center, center);
  }, [mapaNatal.ascendente, planetRadius, center]);

  return (
    <div className={`mapa-natal-container ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gold gradient for wheel border */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Dark gradient for background */}
          <radialGradient id="darkBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#111827" />
          </radialGradient>

          {/* Glow filter for planets */}
          <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 5}
          fill="url(#darkBg)"
          stroke="url(#goldGradient)"
          strokeWidth="3"
        />

        {/* Zodiac sign segments */}
        {signSegments.map((sign) => (
          <g key={sign.name}>
            {/* Outer ring segment */}
            <path
              d={`M ${sign.outerStart.x} ${sign.outerStart.y} A ${outerRadius} ${outerRadius} 0 ${sign.largeArc} 1 ${sign.outerEnd.x} ${sign.outerEnd.y} L ${sign.innerEnd.x} ${sign.innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${sign.largeArc} 0 ${sign.innerStart.x} ${sign.innerStart.y} Z`}
              fill={sign.colors.bg}
              stroke={sign.colors.stroke}
              strokeWidth="1"
            />

            {/* Sign symbol */}
            <text
              x={sign.labelPos.x}
              y={sign.labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={sign.colors.fill}
              fontSize="18"
              fontFamily="serif"
              fontWeight="bold"
            >
              {sign.symbol}
            </text>
          </g>
        ))}

        {/* House division lines */}
        {houseLines.map((line, i) => (
          <g key={`house-${i}`}>
            {/* House cusp line */}
            <line
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke="#F59E0B"
              strokeWidth={i === 0 ? 3 : 1}
              strokeOpacity="0.8"
            />

            {/* House number */}
            <text
              x={line.end.x}
              y={line.end.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#F59E0B"
              fontSize="10"
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              {line.house}
            </text>
          </g>
        ))}

        {/* Inner circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 10}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* Ascendant indicator */}
        <g filter="url(#planetGlow)">
          <text
            x={ascendantPos.x}
            y={ascendantPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#FFD700"
            fontSize="20"
            fontFamily="serif"
            fontWeight="bold"
          >
            AC
          </text>
        </g>

        {/* Planets */}
        {planetPositions.map((planet) => {
          const pos = getPosition(planet.longitude, planetRadius, center, center);
          const signIndex = Math.floor(planet.longitude / 30) % 12;
          const planetColor = SIGN_COLORS[signIndex].fill;

          return (
            <g key={planet.planet} filter="url(#planetGlow)">
              {/* Planet symbol */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={planetColor}
                fontSize="16"
                fontFamily="serif"
                fontWeight="bold"
              >
                {planet.symbol}
              </text>
            </g>
          );
        })}

        {/* Center decoration */}
        <circle
          cx={center}
          cy={center}
          r="15"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="2"
        />
        <circle
          cx={center}
          cy={center}
          r="5"
          fill="#F59E0B"
        />

        {/* Degree markers on outer ring */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const angle = degToRad(deg);
          const start = {
            x: center + (outerRadius - 2) * Math.cos(angle),
            y: center + (outerRadius - 2) * Math.sin(angle),
          };
          const end = {
            x: center + (outerRadius + 5) * Math.cos(angle),
            y: center + (outerRadius + 5) * Math.sin(angle),
          };
          return (
            <line
              key={`deg-${deg}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#F59E0B"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
          );
        })}
      </svg>
    </div>
  );
}

export default MapaNatal;