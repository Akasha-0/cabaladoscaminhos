'use client';
import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getChakraSephirot } from '@/lib/correlation/chakra-sephirot';
import { getSephirotOrixa } from '@/lib/correlation/sephirot-orixa';
import { getOrixaChakra } from '@/lib/correlation/orixa-chakra';
import { getChakraOdu } from '@/lib/correlation/chakra-odu';

// ============================================================
// Kabbalistic Tree of Life - Arvore da Vida
// Interactive SVG visualization with click-to-reveal details
// ============================================================

export interface SefiraDetails {
  id: string;
  name: string;
  hebrew: string;
  pillar: string;
  meaning: {
    divineName: string;
    angelicOrder: string;
    quality: string;
    essence: string;
    path: string;
    letter: string;
    element: string;
  };
}

export interface ArvoreVidaProps {
  highlightedSephiroth?: string[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabels?: boolean;
  showPathNumbers?: boolean;
  className?: string;
  interactive?: boolean;
}

// Sefira meanings from Cabala tradition
const SEFIRA_MEANINGS: Record<string, SefiraDetails['meaning']> = {
  keter: {
    divineName: 'Ein Sof',
    angelicOrder: 'Chayot HaKodesh',
    quality: 'Vontade Divina',
    essence: 'A coroa suprema, o primeiro impulso da vontade divina de se revelar.',
    path: 'Coroa – ponto de origem antes da forma.',
    letter: 'א (Alef)',
    element: 'Primordial',
  },
  chokhmah: {
    divineName: 'Yah',
    angelicOrder: 'Ofanim',
    quality: 'Impulso Criativo',
    essence: 'A centelha da criação, o primeiro pensamento que rompe o vazio.',
    path: 'Sabedoria – movimento dinâmico da primeira ideia.',
    letter: 'ב (Bet)',
    element: 'Fogo Primordial',
  },
  binah: {
    divineName: 'YHWH',
    angelicOrder: 'Aralot',
    quality: 'Formação Estruturante',
    essence: 'O recipiente que dá forma e limite ao impulso criativo.',
    path: 'Compreensão – receptividade que transforma ideia em estrutura.',
    letter: 'ג (Gimel)',
    element: 'Águas Superiores',
  },
  chesed: {
    divineName: 'El',
    angelicOrder: 'Chasmalim',
    quality: 'Expansão Generosa',
    essence: 'O fluxo ilimitado da graça divina, bondade sem medida.',
    path: 'Misericórdia – o braço que se estende para dar.',
    letter: 'ד (Dalet)',
    element: 'Água',
  },
  gevurah: {
    divineName: 'Elohim',
    angelicOrder: 'Seraphim',
    quality: 'Contenção e Limite',
    essence: 'O poder que restringe, julga e estabelece a lei.',
    path: 'Força – o braço que se fecha para proteger.',
    letter: 'ה (He)',
    element: 'Fogo',
  },
  tiferet: {
    divineName: 'Adonai',
    angelicOrder: 'Malakhim',
    quality: 'Equilíbrio e Mediação',
    essence: 'O eixo central que harmoniza misericórdia e julgamento.',
    path: 'Beleza – o ponto onde todos os opostos se encontram.',
    letter: 'ו (Vav)',
    element: 'Ar',
  },
  netzach: {
    divineName: 'Tzevaot',
    angelicOrder: 'Serafim',
    quality: 'Persistência e Ardência',
    essence: 'A chama que não se extingue, a perseverança do espírito.',
    path: 'Vitória – o impulso que vence o tempo.',
    letter: 'ז (Zayin)',
    element: 'Fogo',
  },
  hod: {
    divineName: 'Elohim Tzevaot',
    angelicOrder: 'Cherubim',
    quality: 'Splendor e Humildade',
    essence: 'A glória que reconhece a fonte de toda bondade.',
    path: 'Majestade – a splendor que reflete a luz recebida.',
    letter: 'ז (Zayin)',
    element: 'Terra',
  },
  yesod: {
    divineName: 'Shaddai',
    angelicOrder: 'Issim',
    quality: 'Fundação e Substância',
    essence: 'O receptáculo que armazena e distribui a energia divina.',
    path: 'Fundação – a base que sustenta toda a criação.',
    letter: 'י (Yod)',
    element: 'Água',
  },
  malkhut: {
    divineName: 'Adonai HaAretz',
    angelicOrder: 'Kerubim',
    quality: 'Reino e Presença',
    essence: 'O reino físico onde a vontade divina se manifesta.',
    path: 'Reino – o ponto de contato entre o divino e o material.',
    letter: 'ת (Tav)',
    element: 'Terra',
  },
};

// Pillar colors
const PILLAR_COLORS = {
  right: '#D4AF37',
  left: '#9B59B6',
  center: '#F5DEB3',
};

// Sephirah data
const SEPHIROTH = [
  { id: 'kether', number: 1, name: 'Kether', hebrew: 'כתר', pillar: 'center' as const, x: 50, y: 8 },
  { id: 'chokhmah', number: 2, name: 'Chokhmah', hebrew: 'חכמה', pillar: 'right' as const, x: 80, y: 22 },
  { id: 'binah', number: 3, name: 'Binah', hebrew: 'בינה', pillar: 'left' as const, x: 20, y: 22 },
  { id: 'chesed', number: 4, name: 'Chesed', hebrew: 'חסד', pillar: 'right' as const, x: 75, y: 40 },
  { id: 'geburah', number: 5, name: 'Geburah', hebrew: 'גבורה', pillar: 'left' as const, x: 25, y: 40 },
  { id: 'tiferet', number: 6, name: 'Tifereth', hebrew: 'יפה', pillar: 'center' as const, x: 50, y: 50 },
  { id: 'netzach', number: 7, name: 'Netzach', hebrew: 'נצח', pillar: 'right' as const, x: 80, y: 68 },
  { id: 'hod', number: 8, name: 'Hod', hebrew: 'הוד', pillar: 'left' as const, x: 20, y: 68 },
  { id: 'yesod', number: 9, name: 'Yesod', hebrew: 'יסוד', pillar: 'center' as const, x: 50, y: 82 },
  { id: 'malkhut', number: 10, name: 'Malkuth', hebrew: 'מלכות', pillar: 'center' as const, x: 50, y: 95 },
] as const;

const TRADITIONAL_PATHS = [
  { from: 'kether', to: 'chokhmah', number: 1 },
  { from: 'kether', to: 'binah', number: 2 },
  { from: 'chokhmah', to: 'tiferet', number: 3 },
  { from: 'binah', to: 'tiferet', number: 4 },
  { from: 'binah', to: 'chesed', number: 5 },
  { from: 'chesed', to: 'geburah', number: 6 },
  { from: 'chesed', to: 'netzach', number: 7 },
  { from: 'chesed', to: 'hod', number: 8 },
  { from: 'geburah', to: 'netzach', number: 9 },
  { from: 'geburah', to: 'hod', number: 10 },
  { from: 'kether', to: 'tiferet', number: 11 },
  { from: 'chokhmah', to: 'chesed', number: 12 },
  { from: 'binah', to: 'geburah', number: 13 },
  { from: 'chokhmah', to: 'geburah', number: 14 },
  { from: 'chesed', to: 'tiferet', number: 15 },
  { from: 'geburah', to: 'tiferet', number: 16 },
  { from: 'netzach', to: 'hod', number: 17 },
  { from: 'tiferet', to: 'netzach', number: 18 },
  { from: 'tiferet', to: 'hod', number: 19 },
  { from: 'tiferet', to: 'yesod', number: 20 },
  { from: 'netzach', to: 'yesod', number: 21 },
  { from: 'hod', to: 'yesod', number: 22 },
  { from: 'yesod', to: 'malkhut', number: 23 },
  { from: 'netzach', to: 'malkhut', number: 24 },
  { from: 'hod', to: 'malkhut', number: 25 },
  { from: 'tiferet', to: 'malkhut', number: 26 },
] as const;

const SIZE_MAP = { sm: 250, md: 400, lg: 600, xl: 800 };

function getSephirahPosition(id: string) {
  const sephirah = SEPHIROTH.find((s) => s.id === id);
  return sephirah ? { x: sephirah.x, y: sephirah.y } : null;
}

function getPathColor(from: string, to: string, sephiroth: typeof SEPHIROTH): string {
  const fromPillar = sephiroth.find((s) => s.id === from)?.pillar;
  const toPillar = sephiroth.find((s) => s.id === to)?.pillar;
  if (fromPillar === 'center' || toPillar === 'center') return PILLAR_COLORS.center;
  if (fromPillar === 'right' && toPillar === 'right') return PILLAR_COLORS.right;
  if (fromPillar === 'left' && toPillar === 'left') return PILLAR_COLORS.left;
  return '#4A4A4A';
}

// Tooltip Component
function SefiraTooltip({ sefira, onClose }: { sefira: typeof SEPHIROTH[0]; onClose: () => void }) {
  const meaning = SEFIRA_MEANINGS[sefira.id];
  if (!meaning) return null;

  return (
    <div className="absolute z-50 bg-slate-900/95 border border-amber-500/30 rounded-xl p-4 shadow-2xl shadow-amber-500/20 min-w-[280px] max-w-[320px] animate-in fade-in zoom-in-95 duration-200">
      <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-white">
        ✕
      </button>
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ 
            backgroundColor: `${PILLAR_COLORS[sefira.pillar as keyof typeof PILLAR_COLORS]}30`,
            border: `2px solid ${PILLAR_COLORS[sefira.pillar as keyof typeof PILLAR_COLORS]}`
          }}
        >
          {sefira.number}
        </div>
        <div>
          <p className="text-lg font-bold text-white">{sefira.name}</p>
          <p className="text-sm text-amber-400">{sefira.hebrew}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Nome Divino:</span>
          <span className="text-white">{meaning.divineName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Qualidade:</span>
          <span className="text-amber-300">{meaning.quality}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Elemento:</span>
          <span className="text-cyan-400">{meaning.element}</span>
        </div>
        <p className="text-slate-300 text-xs italic mt-2 border-t border-slate-700 pt-2">
          "{meaning.essence}"
        </p>
      </div>
    </div>
  );
}

export function ArvoreVida({
  highlightedSephiroth = [],
  size = 'md',
  showLabels = true,
  showPathNumbers = false,
  className = '',
  interactive = true,
}: ArvoreVidaProps) {
  const svgSize = SIZE_MAP[size];
  const highlightedSet = new Set(highlightedSephiroth.map((s) => s.toLowerCase()));
  const [selectedSefira, setSelectedSefira] = useState<string | null>(null);
  const [hoveredSefira, setHoveredSefira] = useState<string | null>(null);

  const highlightedPaths = useMemo(() => {
    if (highlightedSet.size === 0) return new Set<string>();
    const paths = new Set<string>();
    TRADITIONAL_PATHS.forEach((path) => {
      if (highlightedSet.has(path.from) && highlightedSet.has(path.to)) {
        paths.add(`${path.from}-${path.to}`);
        paths.add(`${path.to}-${path.from}`);
      }
    });
    return paths;
  }, [highlightedSet]);

  const selectedSefiraData = selectedSefira ? SEPHIROTH.find(s => s.id === selectedSefira) : null;

  return (
    <div className={cn('arvore-vida-container relative', className)}>
      <svg
        viewBox="0 0 100 100"
        width={svgSize}
        height={svgSize}
        style={{ background: 'transparent', maxWidth: '100%', height: 'auto' }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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
                {showPathNumbers && (
                  <text x={(fromPos.x + toPos.x) / 2} y={(fromPos.y + toPos.y) / 2} textAnchor="middle" dominantBaseline="middle" fontSize="2.5" fill={isHighlighted ? '#FFD700' : '#666'} opacity={0.8}>
                    {path.number}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Pillar Guides */}
        <g className="pillar-guides" opacity="0.15">
          <line x1={80} y1={22} x2={80} y2={68} stroke={PILLAR_COLORS.right} strokeWidth="0.2" />
          <line x1={20} y1={22} x2={20} y2={68} stroke={PILLAR_COLORS.left} strokeWidth="0.2" />
          <line x1={50} y1={8} x2={50} y2={95} stroke={PILLAR_COLORS.center} strokeWidth="0.2" />
        </g>

        {/* Draw Sephiroth */}
        <g className="sephiroth">
          {SEPHIROTH.map((sephirah) => {
            const isHighlighted = highlightedSet.has(sephirah.id);
            const isSelected = selectedSefira === sephirah.id;
            const isHovered = hoveredSefira === sephirah.id;
            const radius = sephirah.id === 'malkhut' ? 4.5 : 4;

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
                filter={(isHighlighted || isSelected) ? 'url(#glow-strong)' : isHovered ? 'url(#glow)' : undefined}
                style={{ cursor: interactive ? 'pointer' : 'default' }}
                onClick={() => interactive && setSelectedSefira(isSelected ? null : sephirah.id)}
                onMouseEnter={() => interactive && setHoveredSefira(sephirah.id)}
                onMouseLeave={() => interactive && setHoveredSefira(null)}
              >
                {/* Outer ring */}
                <circle cx={sephirah.x} cy={sephirah.y} r={radius + 1.5} fill="none" stroke={strokeColor} strokeWidth={isSelected ? 0.6 : 0.3} opacity={isSelected ? 0.8 : 0.4} />
                {/* Main circle */}
                <circle cx={sephirah.x} cy={sephirah.y} r={radius} fill={`url(#${gradientId})`} stroke={strokeColor} strokeWidth={isHighlighted || isSelected ? 1 : 0.5} opacity={isHighlighted || isSelected ? 1 : 0.9} />
                {/* Pulse ring for highlighted */}
                {isHighlighted && <circle cx={sephirah.x} cy={sephirah.y} r={radius + 3} fill="none" stroke={strokeColor} strokeWidth="0.3" opacity="0.5" className="animate-pulse" />}
                {/* Number inside */}
                <text x={sephirah.x} y={sephirah.y + 0.8} textAnchor="middle" dominantBaseline="middle" fontSize={radius * 0.8} fontWeight="bold" fill={sephirah.pillar === 'center' ? '#333' : '#1a1a1a'} fontFamily="Georgia, serif">
                  {sephirah.number}
                </text>
                {/* Labels */}
                {showLabels && (
                  <>
                    <text x={sephirah.x} y={sephirah.y - radius - 2.5} textAnchor="middle" dominantBaseline="middle" fontSize="2.8" fill={strokeColor} fontFamily="Arial, sans-serif" opacity={0.9}>
                      {sephirah.hebrew}
                    </text>
                    <text x={sephirah.x} y={sephirah.y + radius + 3} textAnchor="middle" dominantBaseline="middle" fontSize="2.2" fill="#E0E0E0" fontFamily="Georgia, serif" fontStyle="italic">
                      {sephirah.name}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* Title */}
        <text x={50} y={1.5} textAnchor="middle" fontSize="3" fill="#D4AF37" fontFamily="Georgia, serif" fontWeight="bold">
          Árvore da Vida
        </text>
      </svg>

      {/* Tooltip */}
      {selectedSefiraData && (
        <SefiraTooltip sefira={selectedSefiraData} onClose={() => setSelectedSefira(null)} />
      )}

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs" style={{ fontSize: '11px' }}>
        <span style={{ color: PILLAR_COLORS.right }}>♦ Misericórdia</span>
        <span style={{ color: PILLAR_COLORS.center }}>♦ Equilíbrio</span>
        <span style={{ color: PILLAR_COLORS.left }}>♦ Severidade</span>
      </div>

      {interactive && (
        <p className="text-center text-slate-500 text-xs mt-1">Clique em uma sefira para ver detalhes</p>
      )}
    </div>
  );
}

export default ArvoreVida;