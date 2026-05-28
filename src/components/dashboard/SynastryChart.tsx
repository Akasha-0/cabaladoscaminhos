'use client';

import { useMemo } from 'react';
import type { MapaNatal, PosicaoPlaneta, Planeta } from '@/lib/astrologia/tipos';
import { SynastryAspect } from '@/lib/astrologia/synastry';
import { PLANETAS_DATA } from '@/lib/astrologia/planetas/dados';

interface SynastryChartProps {
  chart1: MapaNatal;
  chart2: MapaNatal;
  size?: number;
  name1?: string;
  name2?: string;
}

// Zodiac signs with their symbols and colors
const SIGNOS_DATA: Record<string, { simbolo: string; cor: string }> = {
  aries: { simbolo: '♈', cor: '#E74C3C' },
  touro: { simbolo: '♉', cor: '#27AE60' },
  gemeos: { simbolo: '♊', cor: '#F39C12' },
  cancer: { simbolo: '♋', cor: '#3498DB' },
  leao: { simbolo: '♌', cor: '#E67E22' },
  virgem: { simbolo: '♍', cor: '#2ECC71' },
  libra: { simbolo: '♎', cor: '#9B59B6' },
  escorpiao: { simbolo: '♏', cor: '#C0392B' },
  sagitario: { simbolo: '♐', cor: '#D35400' },
  capricornio: { simbolo: '♑', cor: '#1ABC9C' },
  aquario: { simbolo: '♒', cor: '#2980B9' },
  peixes: { simbolo: '♓', cor: '#8E44AD' },
};

const CORES_ASPECTOS: Record<string, string> = {
  'conjunção': '#FFD700',
  'sextil': '#00CED1',
  'quadratura': '#FF4500',
  'trino': '#32CD32',
  'oposição': '#FF1493',
};

const LABELS_ASPECTOS: Record<string, string> = {
  'conjunção': '☌',
  'sextil': '⚹',
  'quadratura': '□',
  'trino': '△',
  'oposição': '☍',
};

const ASPECT_PATTERNS = [
  { type: 'conjunção' as const, angle: 0, orbMax: 10, weight: 10 },
  { type: 'sextil' as const, angle: 60, orbMax: 6, weight: 6 },
  { type: 'quadratura' as const, angle: 90, orbMax: 8, weight: 8 },
  { type: 'trino' as const, angle: 120, orbMax: 8, weight: 9 },
  { type: 'oposição' as const, angle: 180, orbMax: 10, weight: 7 },
];

interface PlanetPosition {
  planeta: Planeta;
  longitude: number;
  signo: string;
  grauNoSigno: number;
  source: 1 | 2;
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function getAngleDiff(lon1: number, lon2: number): number {
  let diff = normalizeAngle(lon1) - normalizeAngle(lon2);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return Math.abs(diff);
}

function calculateOrb(diff: number, targetAngle: number): number {
  return Math.abs(diff - targetAngle);
}

function getAspectStrength(orb: number, orbMax: number): number {
  if (orb <= orbMax * 0.25) return 1.0;
  if (orb <= orbMax * 0.5) return 0.8;
  if (orb <= orbMax * 0.75) return 0.6;
  if (orb <= orbMax) return 0.4;
  return 0;
}

export function SynastryChart({
  chart1,
  chart2,
  size = 700,
  name1 = 'Pessoa 1',
  name2 = 'Pessoa 2',
}: SynastryChartProps) {
  const radius = size / 2;
  const wheelRadius = radius * 0.7;
  const innerRadius = radius * 0.4;
  const planetRadius = radius * 0.3;

  // Get all planet positions from both charts
  const allPlanets = useMemo((): PlanetPosition[] => {
    const planets1 = Object.values(chart1.planeta).map((p) => ({
      planeta: p.planeta,
      longitude: p.longitude,
      signo: p.signo,
      grauNoSigno: p.grauNoSigno,
      source: 1 as const,
    }));

    const planets2 = Object.values(chart2.planeta).map((p) => ({
      planeta: p.planeta,
      longitude: p.longitude,
      signo: p.signo,
      grauNoSigno: p.grauNoSigno,
      source: 2 as const,
    }));

    return [...planets1, ...planets2];
  }, [chart1, chart2]);

  // Calculate synastry aspects between charts
  const synastryAspects = useMemo((): (SynastryAspect & { 
    from1: PlanetPosition; 
    to2: PlanetPosition;
  })[] => {
    const aspects: (SynastryAspect & { from1: PlanetPosition; to2: PlanetPosition })[] = [];
    const planets1 = allPlanets.filter((p) => p.source === 1);
    const planets2 = allPlanets.filter((p) => p.source === 2);

    for (const p1 of planets1) {
      for (const p2 of planets2) {
        const diff = getAngleDiff(p1.longitude, p2.longitude);

        for (const pattern of ASPECT_PATTERNS) {
          const orb = calculateOrb(diff, pattern.angle);
          if (orb <= pattern.orbMax) {
            const strength = getAspectStrength(orb, pattern.orbMax);
            if (strength > 0) {
              aspects.push({
                planet1: p1.planeta,
                planet2: p2.planeta,
                planet1In: p1.signo,
                planet2In: p2.signo,
                type: pattern.type,
                orb,
                strength,
                from1: p1,
                to2: p2,
              });
            }
          }
        }
      }
    }

    // Sort by strength (strongest first)
    return aspects.sort((a, b) => b.strength - a.strength);
  }, [allPlanets]);

  // Convert zodiac longitude to radians
  const zodiacToRad = (grau: number): number => {
    return ((grau - 90) * Math.PI) / 180;
  };

  // Get point on circle
  const getPoint = (r: number, rad: number): { x: number; y: number } => ({
    x: radius + r * Math.cos(rad),
    y: radius + r * Math.sin(rad),
  });

  // Render zodiac wheel segments
  const zodiacSegments = useMemo(() => {
    const segments = [];
    for (let i = 0; i < 12; i++) {
      const startRad = zodiacToRad(i * 30);
      const endRad = zodiacToRad((i + 1) * 30);
      const midRad = (startRad + endRad) / 2;
      const signo = Object.keys(SIGNOS_DATA)[i];
      const data = SIGNOS_DATA[signo];
      const labelPos = getPoint(wheelRadius + 30, midRad);

      segments.push({
        signo,
        data,
        midRad,
        labelPos,
      });
    }
    return segments;
  }, [wheelRadius]);

  // Get planet symbol
  const getPlanetaSimbolo = (planeta: string): string => {
    return PLANETAS_DATA[planeta as keyof typeof PLANETAS_DATA]?.simbolo || '◉';
  };

  // Planet dots with positions
  const planetDots = useMemo(() => {
    return allPlanets.map((pos) => {
      const rad = zodiacToRad(pos.longitude);
      const point = getPoint(planetRadius, rad);
      return {
        ...pos,
        point,
        rad,
        simbolo: getPlanetaSimbolo(pos.planeta),
      };
    });
  }, [allPlanets, planetRadius]);

  // Aspect lines for synastry
  const aspectLines = useMemo(() => {
    return synastryAspects.map((aspect) => {
      const p1 = planetDots.find(
        (p) => p.planeta === aspect.from1.planeta && p.source === 1
      );
      const p2 = planetDots.find(
        (p) => p.planeta === aspect.to2.planeta && p.source === 2
      );
      if (!p1 || !p2) return null;
      return {
        aspect,
        from: p1.point,
        to: p2.point,
        cor: CORES_ASPECTOS[aspect.type] || '#FFFFFF',
        opacidade: Math.min(0.9, 0.3 + aspect.strength * 0.6),
        label: LABELS_ASPECTOS[aspect.type] || aspect.type[0].toUpperCase(),
      };
    }).filter(Boolean);
  }, [synastryAspects, planetDots]);

  if (allPlanets.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <p className="text-text-secondary">Sem dados astrológicos disponíveis</p>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={radius}
          cy={radius}
          r={wheelRadius + 10}
          fill="none"
          stroke="rgba(212, 175, 55, 0.2)"
          strokeWidth={1}
        />

        {/* Zodiac wheel segments */}
        {zodiacSegments.map((seg) => (
          <text
            key={seg.signo}
            x={seg.labelPos.x}
            y={seg.labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={seg.data.cor}
            fontSize="20"
            fontWeight="bold"
          >
            {seg.data.simbolo}
          </text>
        ))}

        {/* Inner wheel border - Chart 1 zone */}
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius + 30}
          fill="none"
          stroke="rgba(212, 175, 55, 0.3)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* Inner wheel border - Chart 2 zone */}
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          fill="none"
          stroke="rgba(212, 175, 55, 0.3)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {/* Center label */}
        <text
          x={radius}
          y={radius}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(212, 175, 55, 0.6)"
          fontSize="11"
          fontFamily="sans-serif"
        >
          {name1} ↔ {name2}
        </text>

        {/* Synastry aspect lines */}
        {aspectLines.map((line, idx) => {
          if (!line) return null;
          return (
            <g key={idx}>
              <line
                x1={line.from.x}
                y1={line.from.y}
                x2={line.to.x}
                y2={line.to.y}
                stroke={line.cor}
                strokeWidth={2}
                strokeOpacity={line.opacidade}
                strokeDasharray={line.aspect.type === 'quadratura' ? '5 3' : 'none'}
              />
              {/* Aspect label at midpoint */}
              <text
                x={(line.from.x + line.to.x) / 2}
                y={(line.from.y + line.to.y) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={line.cor}
                fontSize="12"
                fontWeight="bold"
                style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
              >
                {line.label}
              </text>
            </g>
          );
        })}

        {/* Planet positions - Chart 1 (outer ring) */}
        {planetDots
          .filter((p) => p.source === 1)
          .map((planet) => {
            const textOffset = 22;
            const textX = planet.point.x + textOffset * Math.cos(planet.rad);
            const textY = planet.point.y + textOffset * Math.sin(planet.rad);
            return (
              <g key={`1-${planet.planeta}`}>
                {/* Planet dot */}
                <circle
                  cx={planet.point.x}
                  cy={planet.point.y}
                  r={7}
                  fill={PLANETAS_DATA[planet.planeta as keyof typeof PLANETAS_DATA]?.cor || '#FFF'}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={1.5}
                />
                {/* Planet symbol */}
                <text
                  x={planet.point.x}
                  y={planet.point.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#000"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {planet.simbolo}
                </text>
                {/* Planet name label */}
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(212, 175, 55, 0.8)"
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  {planet.planeta}
                </text>
              </g>
            );
          })}

        {/* Planet positions - Chart 2 (inner ring) */}
        {planetDots
          .filter((p) => p.source === 2)
          .map((planet) => {
            const textOffset = -15;
            const textX = planet.point.x + textOffset * Math.cos(planet.rad);
            const textY = planet.point.y + textOffset * Math.sin(planet.rad);
            return (
              <g key={`2-${planet.planeta}`}>
                {/* Planet dot - different style for chart 2 */}
                <circle
                  cx={planet.point.x}
                  cy={planet.point.y}
                  r={6}
                  fill={PLANETAS_DATA[planet.planeta as keyof typeof PLANETAS_DATA]?.cor || '#FFF'}
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth={1}
                />
                {/* Planet symbol */}
                <text
                  x={planet.point.x}
                  y={planet.point.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#000"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {planet.simbolo}
                </text>
                {/* Planet name label - inside */}
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255, 255, 255, 0.5)"
                  fontSize="8"
                  fontFamily="sans-serif"
                >
                  {planet.planeta[0].toUpperCase()}
                </text>
              </g>
            );
          })}

        {/* Center point */}
        <circle
          cx={radius}
          cy={radius}
          r={2}
          fill="rgba(212, 175, 55, 0.4)"
        />
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {Object.entries(CORES_ASPECTOS).map(([tipo, cor]) => (
          <div key={tipo} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-0.5 rounded"
              style={{ backgroundColor: cor }}
            />
            <span className="text-xs text-text-secondary">
              {LABELS_ASPECTOS[tipo]} {tipo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SynastryChart;