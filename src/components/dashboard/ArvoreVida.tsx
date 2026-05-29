'use client';

import React, { useMemo } from 'react';

// ============================================================
// Kabbalistic Tree of Life - Arvore da Vida
// Pure SVG visualization of the 10 Sephiroth and 22 paths
// ============================================================

export interface ArvoreVidaProps {
  /** Array of Sephirah IDs to highlight (e.g., ['kether', 'chokhmah']) */
  highlightedSephiroth?: string[];
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show labels */
  showLabels?: boolean;
  /** Show path numbers */
  showPathNumbers?: boolean;
  /** Custom className */
  className?: string;
}

// Pillar colors
const PILLAR_COLORS = {
  right: '#D4AF37', // Gold - Pillar of Mercy
  left: '#9B59B6', // Purple - Pillar of Severity
  center: '#F5DEB3', // Wheat/Gold - Pillar of Mildness
};

// Sephirah data with positions (normalized 0-100 viewBox)
const SEPHIROTH = [
  { id: 'kether', number: 1, name: 'Kether', hebrew: 'כתר', pillar: 'center' as const, x: 50, y: 8 },
  { id: 'chokhmah', number: 2, name: 'Chokhmah', hebrew: 'חכמה', pillar: 'right' as const, x: 80, y: 22 },
  { id: 'binah', number: 3, name: 'Binah', hebrew: 'בינה', pillar: 'left' as const, x: 20, y: 22 },
  { id: 'chesed', number: 4, name: 'Chesed', hebrew: 'חסד', pillar: 'right' as const, x: 75, y: 40 },
  { id: 'geburah', number: 5, name: 'Geburah', hebrew: 'גבורה', pillar: 'left' as const, x: 25, y: 40 },
  { id: 'tiphereth', number: 6, name: 'Tiphereth', hebrew: 'יפה', pillar: 'center' as const, x: 50, y: 50 },
  { id: 'netzach', number: 7, name: 'Netzach', hebrew: 'נצח', pillar: 'right' as const, x: 80, y: 68 },
  { id: 'hod', number: 8, name: 'Hod', hebrew: 'הוד', pillar: 'left' as const, x: 20, y: 68 },
  { id: 'yesod', number: 9, name: 'Yesod', hebrew: 'יסוד', pillar: 'center' as const, x: 50, y: 82 },
  { id: 'malkuth', number: 10, name: 'Malkuth', hebrew: 'מלכות', pillar: 'center' as const, x: 50, y: 95 },
] as const;

// 22 Paths of the Tree of Life
const TRADITIONAL_PATHS = [
  { from: 'kether', to: 'chokhmah', number: 1 },
  { from: 'kether', to: 'binah', number: 2 },
  { from: 'chokhmah', to: 'tiphereth', number: 3 },
  { from: 'binah', to: 'tiphereth', number: 4 },
  { from: 'binah', to: 'chesed', number: 5 },
  { from: 'chesed', to: 'geburah', number: 6 },
  { from: 'chesed', to: 'netzach', number: 7 },
  { from: 'chesed', to: 'hod', number: 8 },
  { from: 'geburah', to: 'netzach', number: 9 },
  { from: 'geburah', to: 'hod', number: 10 },
  { from: 'kether', to: 'tiphereth', number: 11 },
  { from: 'chokhmah', to: 'chesed', number: 12 },
  { from: 'binah', to: 'geburah', number: 13 },
  { from: 'chokhmah', to: 'geburah', number: 14 },
  { from: 'chesed', to: 'tiphereth', number: 15 },
  { from: 'geburah', to: 'tiphereth', number: 16 },
  { from: 'netzach', to: 'hod', number: 17 },
  { from: 'tiphereth', to: 'netzach', number: 18 },
  { from: 'tiphereth', to: 'hod', number: 19 },
  { from: 'tiphereth', to: 'yesod', number: 20 },
  { from: 'netzach', to: 'yesod', number: 21 },
  { from: 'hod', to: 'yesod', number: 22 },
  { from: 'yesod', to: 'malkuth', number: 23 },
  { from: 'netzach', to: 'malkuth', number: 24 },
  { from: 'hod', to: 'malkuth', number: 25 },
  { from: 'tiphereth', to: 'malkuth', number: 26 },
] as const;

const SIZE_MAP = {
  sm: 250,
  md: 400,
  lg: 600,
  xl: 800,
};

// Get position for a sephirah by ID
function getSephirahPosition(id: string): { x: number; y: number } | null {
  const sephirah = SEPHIROTH.find((s) => s.id === id);
  return sephirah ? { x: sephirah.x, y: sephirah.y } : null;
}

// Determine path color based on which pillars it connects
function getPathColor(
  from: string,
  to: string,
  sephiroth: typeof SEPHIROTH
): string {
  const fromPillar = sephiroth.find((s) => s.id === from)?.pillar;
  const toPillar = sephiroth.find((s) => s.id === to)?.pillar;

  if (fromPillar === 'center' || toPillar === 'center') {
    return PILLAR_COLORS.center;
  }
  if (fromPillar === 'right' && toPillar === 'right') {
    return PILLAR_COLORS.right;
  }
  if (fromPillar === 'left' && toPillar === 'left') {
    return PILLAR_COLORS.left;
  }
  // Cross-pillar paths
  return '#4A4A4A';
}

export function ArvoreVida({
  highlightedSephiroth = [],
  size = 'md',
  showLabels = true,
  showPathNumbers = false,
  className = '',
}: ArvoreVidaProps) {
  const svgSize = SIZE_MAP[size];
  const highlightedSet = new Set(highlightedSephiroth.map((s) => s.toLowerCase()));

  // Calculate highlighted paths (paths that connect two highlighted sephiroth)
  const highlightedPaths = useMemo(() => {
    if (highlightedSet.size === 0) return new Set<string>();

    const paths = new Set<string>();
    TRADITIONAL_PATHS.forEach((path) => {
      if (
        highlightedSet.has(path.from) &&
        highlightedSet.has(path.to)
      ) {
        paths.add(`${path.from}-${path.to}`);
        paths.add(`${path.to}-${path.from}`);
      }
    });
    return paths;
  }, [highlightedSet]);

  return (
    <div className={`arvore-vida-container ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={svgSize}
        height={svgSize}
        style={{
          background: 'transparent',
          maxWidth: '100%',
          height: 'auto',
        }}
      >
        <defs>
          {/* Glow filter for highlighted elements */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient for Sephiroth circles */}
          <radialGradient id="sephirah-gradient-right">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </radialGradient>

          <radialGradient id="sephirah-gradient-left">
            <stop offset="0%" stopColor="#DA70D6" />
            <stop offset="100%" stopColor="#8B008B" />
          </radialGradient>

          <radialGradient id="sephirah-gradient-center">
            <stop offset="0%" stopColor="#FFFAF0" />
            <stop offset="100%" stopColor="#DEB887" />
          </radialGradient>
        </defs>

        {/* Draw Paths */}
        <g className="paths">
          {TRADITIONAL_PATHS.map((path) => {
            const fromPos = getSephirahPosition(path.from);
            const toPos = getSephirahPosition(path.to);

            if (!fromPos || !toPos) return null;

            const isHighlighted = highlightedPaths.has(`${path.from}-${path.to}`);
            const pathColor = getPathColor(path.from, path.to, SEPHIROTH);

            return (
              <g key={`path-${path.number}`}>
                {/* Path line */}
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isHighlighted ? '#FFD700' : pathColor}
                  strokeWidth={isHighlighted ? 0.6 : 0.3}
                  strokeOpacity={isHighlighted ? 1 : 0.5}
                  strokeDasharray={isHighlighted ? 'none' : '2,1'}
                  filter={isHighlighted ? 'url(#glow)' : undefined}
                />

                {/* Path number */}
                {showPathNumbers && (
                  <text
                    x={(fromPos.x + toPos.x) / 2}
                    y={(fromPos.y + toPos.y) / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="2.5"
                    fill={isHighlighted ? '#FFD700' : '#666'}
                    opacity={0.8}
                  >
                    {path.number}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Draw Pillar Guides (subtle lines) */}
        <g className="pillar-guides" opacity="0.15">
          {/* Right Pillar */}
          <line
            x1={80}
            y1={22}
            x2={80}
            y2={68}
            stroke={PILLAR_COLORS.right}
            strokeWidth="0.2"
          />
          {/* Left Pillar */}
          <line
            x1={20}
            y1={22}
            x2={20}
            y2={68}
            stroke={PILLAR_COLORS.left}
            strokeWidth="0.2"
          />
          {/* Center Pillar */}
          <line
            x1={50}
            y1={8}
            x2={50}
            y2={95}
            stroke={PILLAR_COLORS.center}
            strokeWidth="0.2"
          />
        </g>

        {/* Draw Sephiroth */}
        <g className="sephiroth">
          {SEPHIROTH.map((sephirah) => {
            const isHighlighted = highlightedSet.has(sephirah.id);
            const radius = sephirah.id === 'malkuth' ? 4.5 : 4; // Malkuth slightly larger

            let gradientId = 'sephirah-gradient-center';
            let strokeColor = PILLAR_COLORS.center;

            if (sephirah.pillar === 'right') {
              gradientId = 'sephirah-gradient-right';
              strokeColor = PILLAR_COLORS.right;
            } else if (sephirah.pillar === 'left') {
              gradientId = 'sephirah-gradient-left';
              strokeColor = PILLAR_COLORS.left;
            }

            return (
              <g
                key={sephirah.id}
                filter={isHighlighted ? 'url(#glow)' : undefined}
              >
                {/* Outer ring */}
                <circle
                  cx={sephirah.x}
                  cy={sephirah.y}
                  r={radius + 1}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="0.3"
                  opacity={0.4}
                />

                {/* Main circle */}
                <circle
                  cx={sephirah.x}
                  cy={sephirah.y}
                  r={radius}
                  fill={`url(#${gradientId})`}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 0.8 : 0.5}
                  opacity={isHighlighted ? 1 : 0.9}
                />

                {/* Number inside */}
                <text
                  x={sephirah.x}
                  y={sephirah.y + 0.8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={radius * 0.8}
                  fontWeight="bold"
                  fill={sephirah.pillar === 'center' ? '#333' : '#1a1a1a'}
                  fontFamily="Georgia, serif"
                >
                  {sephirah.number}
                </text>

                {/* Labels */}
                {showLabels && (
                  <>
                    {/* Hebrew letter */}
                    <text
                      x={sephirah.x}
                      y={sephirah.y - radius - 2.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="2.8"
                      fill={strokeColor}
                      fontFamily="Arial, sans-serif"
                      opacity={0.9}
                    >
                      {sephirah.hebrew}
                    </text>

                    {/* English name */}
                    <text
                      x={sephirah.x}
                      y={sephirah.y + radius + 3}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="2.2"
                      fill="#E0E0E0"
                      fontFamily="Georgia, serif"
                      fontStyle="italic"
                    >
                      {sephirah.name}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* Title */}
        <text
          x={50}
          y={1.5}
          textAnchor="middle"
          fontSize="3"
          fill="#D4AF37"
          fontFamily="Georgia, serif"
          fontWeight="bold"
        >
          Árvore da Vida
        </text>
      </svg>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '8px',
          fontSize: '11px',
        }}
      >
        <span style={{ color: PILLAR_COLORS.right }}>
          ♦ Misericórdia
        </span>
        <span style={{ color: PILLAR_COLORS.center }}>
          ♦ Equilíbrio
        </span>
        <span style={{ color: PILLAR_COLORS.left }}>
          ♦ Severidade
        </span>
      </div>
    </div>
  );
}

export default ArvoreVida;
