'use client';

import React, { useMemo } from 'react';

export interface PlanetPosition {
  planeta: string;
  signo: string;
  grau: number;
  minuto: number;
  longitude?: number;
}

export interface HouseCusps {
  casa: number;
  signo: string;
  grau: number;
}

export interface MapaNatalWheelProps {
  data: {
    sun: PlanetPosition;
    moon: PlanetPosition;
    mercury: PlanetPosition;
    venus: PlanetPosition;
    mars: PlanetPosition;
    jupiter: PlanetPosition;
    saturn: PlanetPosition;
    houses: HouseCusps[];
  };
  showAspects?: boolean;
  showOrixas?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
}

interface Aspect {
  planets: string[];
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
}

const SIZE_CONFIG = { sm: 300, md: 500, lg: 700 };

const ZODIAC_SIGNS = [
  { name: 'Áries', symbol: '♈', start: 0, element: 'fogo' },
  { name: 'Touro', symbol: '♉', start: 30, element: 'terra' },
  { name: 'Gêmeos', symbol: '♊', start: 60, element: 'ar' },
  { name: 'Câncer', symbol: '♋', start: 90, element: 'água' },
  { name: 'Leão', symbol: '♌', start: 120, element: 'fogo' },
  { name: 'Virgem', symbol: '♍', start: 150, element: 'terra' },
  { name: 'Libra', symbol: '♎', start: 180, element: 'ar' },
  { name: 'Escorpião', symbol: '♏', start: 210, element: 'água' },
  { name: 'Sagitário', symbol: '♐', start: 240, element: 'fogo' },
  { name: 'Capricórnio', symbol: '♑', start: 270, element: 'terra' },
  { name: 'Aquário', symbol: '♒', start: 300, element: 'ar' },
  { name: 'Peixes', symbol: '♓', start: 330, element: 'água' },
];

const ELEMENT_COLORS: Record<string, string> = {
  fogo: '#C45C26', terra: '#2D6A4F', ar: '#F0B429', água: '#1E3A5F',
};

const PLANET_COLORS: Record<string, string> = {
  Sol: '#D4A843', Lua: '#E8E8E8', Mercurio: '#F0B429', Venus: '#7C6EB3',
  Marte: '#C45C26', Jupiter: '#2D6A4F', Saturno: '#6B5B95',
};

const PLANET_NAMES: Record<string, string> = {
  Sol: '☉', Lua: '☽', Mercurio: '☿', Venus: '♀', Marte: '♂',
  Jupiter: '♃', Saturno: '♄',
};

const THEME_COLORS = {
  dark: { background: '#0A0A0F', text: '#E8E8E8', accent: '#D4A843', muted: '#6B7280' },
  light: { background: '#FFFFFF', text: '#1A1A2E', accent: '#2D6A4F', muted: '#9CA3AF' },
};

function degToRad(deg: number) { return ((deg - 90) * Math.PI) / 180; }

function getSignIndex(signo: string): number {
  const sign = ZODIAC_SIGNS.find((s) => s.name.toLowerCase() === signo.toLowerCase());
  return sign ? sign.start : 0;
}

function getLongitude(planet: PlanetPosition): number {
  if (planet.longitude !== undefined) return planet.longitude;
  return getSignIndex(planet.signo) + planet.grau + (planet.minuto || 0) / 60;
}

function getPosition(longitude: number, radius: number, cx: number, cy: number) {
  const rad = degToRad(longitude);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function calculateAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  const orbs: Record<string, number> = { conjunction: 8, sextile: 6, square: 8, trine: 8, opposition: 8 };
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const lon1 = getLongitude(planets[i]);
      const lon2 = getLongitude(planets[j]);
      let diff = Math.abs(lon1 - lon2);
      if (diff > 180) diff = 360 - diff;
      const checks: Array<{ type: Aspect['type']; angle: number }> = [
        { type: 'conjunction', angle: 0 }, { type: 'sextile', angle: 60 },
        { type: 'square', angle: 90 }, { type: 'trine', angle: 120 }, { type: 'opposition', angle: 180 },
      ];
      for (const { type, angle } of checks) {
        const orb = Math.abs(diff - angle);
        if (orb <= orbs[type]) {
          aspects.push({ planets: [planets[i].planeta, planets[j].planeta], type, orb: Math.round(orb * 10) / 10 });
        }
      }
    }
  }
  return aspects;
}

export function MapaNatalWheel({ data, showAspects = true, size = 'md', theme = 'dark' }: MapaNatalWheelProps) {
  const sizeValue = SIZE_CONFIG[size];
  const center = sizeValue / 2;
  const outerRadius = sizeValue * 0.45;
  const zodiacInnerRadius = sizeValue * 0.38;
  const planetRadius = sizeValue * 0.3;
  const houseRadius = sizeValue * 0.42;
  const themeColors = THEME_COLORS[theme];

  // Early return for null data
  if (!data) {
    return <div className="rounded-full animate-pulse bg-gray-700" style={{ width: sizeValue, height: sizeValue }} aria-label="Carregando mapa natal" />;
  }

  const planets: PlanetPosition[] = useMemo(() => {
    const planetList: PlanetPosition[] = [];
    const dataMap = data as unknown as Record<string, PlanetPosition>;
    for (const key of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']) {
      if (dataMap[key]) planetList.push(dataMap[key]);
    }
    return planetList;
  }, [data]);

  const aspects = useMemo(() => showAspects ? calculateAspects(planets) : [], [planets, showAspects]);
  const ascendant = useMemo(() => data.houses.length > 0 ? getSignIndex(data.houses[0].signo) + data.houses[0].grau : 0, [data.houses]);
  const mediumCoeli = useMemo(() => data.houses.length > 10 ? getSignIndex(data.houses[9].signo) + data.houses[9].grau : 180, [data.houses]);

  return (
    <div className="mapa-natal-wheel-container" style={{ width: sizeValue, height: sizeValue }} role="img" aria-label="Mapa Natal - Roda Astrológica">
      <svg viewBox={`0 0 ${sizeValue} ${sizeValue}`} style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`goldGradient-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={themeColors.accent} /><stop offset="50%" stopColor="#B45309" /><stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <radialGradient id={`wheelBg-${theme}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme === 'dark' ? '#1F2937' : '#F3F4F6'} /><stop offset="100%" stopColor={themeColors.background} />
          </radialGradient>
        </defs>
        <circle cx={center} cy={center} r={outerRadius + 5} fill={`url(#wheelBg-${theme})`} stroke={`url(#goldGradient-${theme})`} strokeWidth="3" />
        
        {/* Zodiac Ring */}
        <g className="zodiac-ring">
          {ZODIAC_SIGNS.map((sign) => {
            const startAngle = degToRad(sign.start);
            const endAngle = degToRad(sign.start + 30);
            const outerStart = { x: center + outerRadius * Math.cos(startAngle), y: center + outerRadius * Math.sin(startAngle) };
            const outerEnd = { x: center + outerRadius * Math.cos(endAngle), y: center + outerRadius * Math.sin(endAngle) };
            const innerStart = { x: center + zodiacInnerRadius * Math.cos(startAngle), y: center + zodiacInnerRadius * Math.sin(startAngle) };
            const innerEnd = { x: center + zodiacInnerRadius * Math.cos(endAngle), y: center + zodiacInnerRadius * Math.sin(endAngle) };
            const labelPos = { x: center + (outerRadius + zodiacInnerRadius) / 2 * Math.cos(degToRad(sign.start + 15)), y: center + (outerRadius + zodiacInnerRadius) / 2 * Math.sin(degToRad(sign.start + 15)) };
            return (
              <g key={sign.name}>
                <path d={`M ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A ${zodiacInnerRadius} ${zodiacInnerRadius} 0 0 0 ${innerStart.x} ${innerStart.y} Z`}
                  fill={`${ELEMENT_COLORS[sign.element]}20`} stroke={ELEMENT_COLORS[sign.element]} strokeWidth="1" strokeOpacity="0.6" />
                <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" fill={themeColors.text} fontSize="14" fontFamily="serif" fontWeight="bold">{sign.symbol}</text>
              </g>
            );
          })}
        </g>
        
        {/* House Cusp Ring */}
        <g className="house-cusp-ring">
          {data.houses.map((house, i) => {
            const pos = getPosition(getSignIndex(house.signo) + house.grau, houseRadius, center, center);
            return (
              <g key={house.casa}>
                <line x1={center} y1={center} x2={pos.x} y2={pos.y} stroke={themeColors.accent} strokeWidth={i === 0 ? 2 : 1} strokeOpacity="0.6" />
                <circle cx={pos.x} cy={pos.y} r={8} fill={themeColors.background} stroke={themeColors.accent} strokeWidth="1" />
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill={themeColors.accent} fontSize="8" fontFamily="sans-serif" fontWeight="bold">{house.casa}</text>
              </g>
            );
          })}
        </g>
        
        {/* Aspect Lines */}
        {showAspects && (
          <g className="aspect-lines">
            {aspects.map((aspect, i) => {
              const p1 = planets.find(p => p.planeta === aspect.planets[0]);
              const p2 = planets.find(p => p.planeta === aspect.planets[1]);
              if (!p1 || !p2) return null;
              const pos1 = getPosition(getLongitude(p1), planetRadius, center, center);
              const pos2 = getPosition(getLongitude(p2), planetRadius, center, center);
              return <line key={i} x1={pos1.x} y1={pos1.y} x2={pos2.x} y2={pos2.y} stroke={aspect.type === 'conjunction' || aspect.type === 'trine' ? '#DC2626' : '#16A34A'} strokeWidth={aspect.type === 'conjunction' || aspect.type === 'trine' ? 3 : 2} strokeOpacity="0.5" />;
            })}
          </g>
        )}
        
        {/* Axis Lines */}
        <g className="axis-lines">
          {['ASC', 'MC', 'DSC', 'IC'].map((label, i) => {
            const angles = [ascendant, mediumCoeli, (ascendant + 180) % 360, (mediumCoeli + 180) % 360];
            const pos = getPosition(angles[i], planetRadius * 0.6, center, center);
            return <text key={label} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill={i % 2 === 0 ? '#DC2626' : '#2563EB'} fontSize="12" fontFamily="sans-serif" fontWeight="bold">{label}</text>;
          })}
        </g>
        
        {/* Planet Ring */}
        <g className="planet-ring">
          {planets.map((planet) => {
            const pos = getPosition(getLongitude(planet), planetRadius, center, center);
            const color = PLANET_COLORS[planet.planeta] || themeColors.text;
            return (
              <g key={planet.planeta}>
                <circle cx={pos.x} cy={pos.y} r={10} fill={themeColors.background} stroke={color} strokeWidth="2" />
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="10" fontFamily="serif" fontWeight="bold">{PLANET_NAMES[planet.planeta] || planet.planeta[0]}</text>
                <text x={pos.x} y={pos.y + 16} textAnchor="middle" dominantBaseline="middle" fill={themeColors.muted} fontSize="7" fontFamily="sans-serif">{planet.grau}°</text>
              </g>
            );
          })}
        </g>
        
        <circle cx={center} cy={center} r={sizeValue * 0.05} fill="none" stroke={`url(#goldGradient-${theme})`} strokeWidth="2" />
        <circle cx={center} cy={center} r={sizeValue * 0.02} fill={themeColors.accent} />
        
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const angle = degToRad(deg);
          const start = { x: center + (outerRadius - 2) * Math.cos(angle), y: center + (outerRadius - 2) * Math.sin(angle) };
          const end = { x: center + (outerRadius + 5) * Math.cos(angle), y: center + (outerRadius + 5) * Math.sin(angle) };
          return <line key={`deg-${deg}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={themeColors.accent} strokeWidth="1" strokeOpacity="0.6" />;
        })}
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
        {['Fogo', 'Terra', 'Ar', 'Água'].map((el, i) => (
          <div key={el} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#C45C26', '#2D6A4F', '#F0B429', '#1E3A5F'][i] }} />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{el}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MapaNatalWheel;
