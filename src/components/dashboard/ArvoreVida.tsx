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

// 22 Paths of the Tree of Life (connecting Sephiroth by their IDs)
const PATHS = [
  // Vertical paths (Pillar of Mildness)
  { id: '1-6', from: 'kether', to: 'tiphereth', number: 11 },
  { id: '6-9', from: 'tiphereth', to: 'yesod', number: 26 },
  { id: '9-10', from: 'yesod', to: 'malkuth', number: 32 },

  // Right Pillar paths
  { id: '1-2', from: 'kether', to: 'chokhmah', number: 1 },
  { id: '2-4', from: 'chokhmah', to: 'chesed', number: 12 },
  { id: '4-6', from: 'chesed', to: 'tiphereth', number: 15 },
  { id: '6-7', from: 'tiphereth', to: 'netzach', number: 27 },
  { id: '7-9', from: 'netzach', to: 'yesod', number: 28 },
  { id: '7-10', from: 'netzach', to: 'malkuth', number: 29 },

  // Left Pillar paths
  { id: '1-3', from: 'kether', to: 'binah', number: 2 },
  { id: '3-5', from: 'binah', to: 'geburah', number: 13 },
  { id: '5-6', from: 'geburah', to: 'tiphereth', number: 16 },
  { id: '6-8', from: 'tiphereth', to: 'hod', number: 30 },
  { id: '8-9', from: 'hod', to: 'yesod', number: 31 },
  { id: '8-10', from: 'hod', to: 'malkuth', number: 33 },

  // Diagonal cross-pillar paths
  { id: '2-5', from: 'chokhmah', to: 'geburah', number: 14 },
  { id: '2-6', from: 'chokhmah', to: 'tiphereth', number: 3 },
  { id: '3-6', from: 'binah', to: 'tiphereth', number: 4 },
  { id: '3-4', from: 'binah', to: 'chesed', number: 5 },
  { id: '4-5', from: 'chesed', to: 'geburah', number: 6 },
  { id: '5-8', from: 'geburah', to: 'hod', number: 17 },
  { id: '4-7', from: 'chesed', to: 'netzach', number: 7 },
  { id: '5-8-alt', from: 'chesed', to: 'hod', number: 8 },
  { id: '4-8', from: 'chesed', to: 'hod', number: 9 },
] as const;

// Simplified paths - main 22 paths of traditional Tree of Life
const TRADITIONAL_PATHS = [
  // Path 1: Kether to Chokhmah (Wisdom)
  { from: 'kether', to: 'chokhmah', number: 1 },
  // Path 2: Kether to Binah (Understanding)
  { from: 'kether', to: 'binah', number: 2 },
  // Path 3: Chokhmah to Tiphereth
  { from: 'chokhmah', to: 'tiphereth', number: 3 },
  // Path 4: Binah to Tiphereth
  { from: 'binah', to: 'tiphereth', number: 4 },
  // Path 5: Binah to Chesed
  { from: 'binah', to: 'chesed', number: 5 },
  // Path 6: Chesed to Geburah
  { from: 'chesed', to: 'geburah', number: 6 },
  // Path 7: Chesed to Netzach
  { from: 'chesed', to: 'netzach', number: 7 },
  // Path 8: Chesed to Hod
  { from: 'chesed', to: 'hod', number: 8 },
  // Path 9: Geburah to Netzach
  { from: 'geburah', to: 'netzach', number: 9 },
  // Path 10: Geburah to Hod
  { from: 'geburah', to: 'hod', number: 10 },
  // Path 11: Kether to Tiphereth
  { from: 'kether', to: 'tiphereth', number: 11 },
  // Path 12: Chokhmah to Chesed
  { from: 'chokhmah', to: 'chesed', number: 12 },
  // Path 13: Binah to Geburah
  { from: 'binah', to: 'geburah', number: 13 },
  // Path 14: Chokhmah to Geburah
  { from: 'chokhmah', to: 'geburah', number: 14 },
  // Path 15: Chesed to Tiphereth
  { from: 'chesed', to: 'tiphereth', number: 15 },
  // Path 16: Geburah to Tiphereth
  { from: 'geburah', to: 'tiphereth', number: 16 },
  // Path 17: Netzach to Hod
  { from: 'netzach', to: 'hod', number: 17 },
  // Path 18: Tiphereth to Netzach
  { from: 'tiphereth', to: 'netzach', number: 18 },
  // Path 19: Tiphereth to Hod
  { from: 'tiphereth', to: 'hod', number: 19 },
  // Path 20: Tiphereth to Yesod
  { from: 'tiphereth', to: 'yesod', number: 20 },
  // Path 21: Netzach to Yesod
  { from: 'netzach', to: 'yesod', number: 21 },
  // Path 22: Hod to Yesod
  { from: 'hod', to: 'yesod', number: 22 },
  // Path 23: Yesod to Malkuth
  { from: 'yesod', to: 'malkuth', number: 23 },
  // Path 24: Netzach to Malkuth
  { from: 'netzach', to: 'malkuth', number: 24 },
  // Path 25: Hod to Malkuth
  { from: 'hod', to: 'malkuth', number: 25 },
  // Path 26: Tiphereth to Malkuth (direct)
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
          {TRADITIONAL_PATHS.map((path, index) => {
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
