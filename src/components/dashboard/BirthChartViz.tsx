'use client';

import { useMemo } from 'react';
import type { PosicaoPlaneta, Aspecto, MapaNatal, Casa } from '@/lib/astrologia/tipos';
import { calcularAspectos } from '@/lib/astrologia/planetas/aspectos';
import { PLANETAS_DATA } from '@/lib/astrologia/planetas/dados';

interface BirthChartVizProps {
  mapaNatal?: MapaNatal;
  posicoes?: PosicaoPlaneta[];
  casas?: Casa[];
  aspectos?: Aspecto[];
  size?: number;
}

// Zodiac signs with their symbols and colors
const SIGNOS_DATA: Record<string, { simbolo: string; cor: string; elemento: string }> = {
  aries: { simbolo: '♈', cor: '#E74C3C', elemento: 'fogo' },
  touro: { simbolo: '♉', cor: '#27AE60', elemento: 'terra' },
  gemeos: { simbolo: '♊', cor: '#F39C12', elemento: 'ar' },
  cancer: { simbolo: '♋', cor: '#3498DB', elemento: 'agua' },
  leao: { simbolo: '♌', cor: '#E67E22', elemento: 'fogo' },
  virgem: { simbolo: '♍', cor: '#2ECC71', elemento: 'terra' },
  libra: { simbolo: '♎', cor: '#9B59B6', elemento: 'ar' },
  escorpiao: { simbolo: '♏', cor: '#C0392B', elemento: 'agua' },
  sagitario: { simbolo: '♐', cor: '#D35400', elemento: 'fogo' },
  capricornio: { simbolo: '♑', cor: '#1ABC9C', elemento: 'terra' },
  aquario: { simbolo: '♒', cor: '#2980B9', elemento: 'ar' },
  peixes: { simbolo: '♓', cor: '#8E44AD', elemento: 'agua' },
};

const CORES_ASPECTOS: Record<string, string> = {
  'conjunção': '#FFD700',
  'sextil': '#00CED1',
  'quadratura': '#FF4500',
  'trino': '#32CD32',
  'oposição': '#FF1493',
};

const LARGURA_LINHA_ASPECTO: Record<string, number> = {
  'conjunção': 3,
  'oposição': 2,
  'quadratura': 1.5,
  'trino': 1.5,
  'sextil': 1,
};

export function BirthChartViz({
  mapaNatal,
  posicoes,
  casas,
  aspectos,
  size = 600,
}: BirthChartVizProps) {
  const radius = size / 2;
  const wheelRadius = radius * 0.75;
  const innerRadius = radius * 0.45;
  const planetRadius = radius * 0.35;

  // Derive positions and aspects from props
  const planetPositions = useMemo(() => {
    if (mapaNatal) {
      return Object.values(mapaNatal.planeta);
    }
    return posicoes || [];
  }, [mapaNatal, posicoes]);

  const houseCusps = useMemo(() => {
    if (mapaNatal?.casas) {
      return mapaNatal.casas;
    }
    return casas || [];
  }, [mapaNatal, casas]);

  const chartAspects = useMemo(() => {
    if (aspectos) return aspectos;
    if (mapaNatal || posicoes) {
      return calcularAspectos(planetPositions);
    }
    return [];
  }, [aspectos, planetPositions]);

  // Convert zodiac longitude (0-360) to radians, starting from top (Aries at top)
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
      const signo = Object.keys(SIGNOS_DATA)[i] as keyof typeof SIGNOS_DATA;
      const data = SIGNOS_DATA[signo];
      const p1 = getPoint(wheelRadius, startRad);
      const p2 = getPoint(wheelRadius, endRad);
      const labelPos = getPoint(wheelRadius + 25, midRad);

      segments.push({
        signo,
        data,
        startRad,
        endRad,
        midRad,
        p1,
        p2,
        labelPos,
        largeArc: 1,
      });
    }
    return segments;
  }, [wheelRadius]);

  // Get planet symbol
  const getPlanetaSimbolo = (planeta: string): string => {
    return PLANETAS_DATA[planeta as keyof typeof PLANETAS_DATA]?.simbolo || '◉';
  };

  // Render house cusp lines
  const houseCuspLines = useMemo(() => {
    return houseCusps.map((casa, idx) => {
      const grau = casa.grauNoSigno + (idx * 30);
      const rad = zodiacToRad(grau);
      const start = getPoint(innerRadius, rad);
      const end = getPoint(wheelRadius, rad);
      return { casa, rad, start, end, numero: idx + 1 };
    });
  }, [houseCusps]);

  // Render planets
  const planetDots = useMemo(() => {
    return planetPositions.map((pos) => {
      const rad = zodiacToRad(pos.longitude);
      const point = getPoint(planetRadius, rad);
      return {
        pos,
        point,
        rad,
        simbolo: getPlanetaSimbolo(pos.planeta),
      };
    });
  }, [planetPositions, planetRadius]);

  // Render aspect lines
  const aspectLines = useMemo(() => {
    return chartAspects.map((aspecto) => {
      const p1 = planetDots.find((p) => p.pos.planeta === aspecto.planeta1);
      const p2 = planetDots.find((p) => p.pos.planeta === aspecto.planeta2);
      if (!p1 || !p2) return null;
      return {
        aspecto,
        from: p1.point,
        to: p2.point,
        cor: CORES_ASPECTOS[aspecto.tipo] || '#FFFFFF',
        largura: LARGURA_LINHA_ASPECTO[aspecto.tipo] || 1,
      };
    }).filter(Boolean);
  }, [chartAspects, planetDots]);

  // Draw arc path for zodiac segments
  const describeArc = (
    x: number,
    y: number,
    r: number,
    startAngle: number,
    endAngle: number,
    largeArc: number
  ): string => {
    const start = {
      x: x + r * Math.cos(startAngle),
      y: y + r * Math.sin(startAngle),
    };
    const end = {
      x: x + r * Math.cos(endAngle),
      y: y + r * Math.sin(endAngle),
    };
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  if (planetPositions.length === 0) {
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
          r={wheelRadius + 5}
          fill="none"
          stroke="rgba(212, 175, 55, 0.2)"
          strokeWidth={1}
        />

        {/* Zodiac wheel segments */}
        {zodiacSegments.map((seg) => {
          const path = describeArc(
            radius,
            radius,
            wheelRadius,
            seg.startRad,
            seg.endRad,
            seg.largeArc
          );
          return (
            <g key={seg.signo}>
              <path
                d={path}
                fill="none"
                stroke={seg.data.cor}
                strokeWidth={20}
                strokeOpacity={0.15}
              />
              {/* Sign symbol on wheel */}
              <text
                x={seg.labelPos.x}
                y={seg.labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={seg.data.cor}
                fontSize="16"
                fontWeight="bold"
              >
                {seg.data.simbolo}
              </text>
            </g>
          );
        })}

        {/* Inner wheel border */}
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          fill="none"
          stroke="rgba(212, 175, 55, 0.4)"
          strokeWidth={1}
        />

        {/* House cusp lines */}
        {houseCuspLines.map((line) => {
          const houseNumRad = zodiacToRad(line.rad + (line.rad < Math.PI ? 0.15 : -0.15));
          const houseNumPos = getPoint(innerRadius - 15, houseNumRad);
          return (
            <g key={line.numero}>
              <line
                x1={line.start.x}
                y1={line.start.y}
                x2={line.end.x}
                y2={line.end.y}
                stroke="rgba(212, 175, 55, 0.5)"
                strokeWidth={1}
              />
              {/* House number */}
              <text
                x={houseNumPos.x}
                y={houseNumPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(212, 175, 55, 0.7)"
                fontSize="10"
                fontFamily="sans-serif"
              >
                {line.numero}
              </text>
            </g>
          );
        })}

        {/* Aspect lines */}
        {aspectLines.map((line, idx) => {
          if (!line) return null;
          return (
            <line
              key={idx}
              x1={line.from.x}
              y1={line.from.y}
              x2={line.to.x}
              y2={line.to.y}
              stroke={line.cor}
              strokeWidth={line.largura}
              strokeOpacity={0.6}
            />
          );
        })}

        {/* Planet positions */}
        {planetDots.map((planet) => {
          // Offset text slightly away from planet dot
          const textOffset = 18;
          const textX = planet.point.x + (textOffset * Math.cos(planet.rad));
          const textY = planet.point.y + (textOffset * Math.sin(planet.rad));
          return (
            <g key={planet.pos.planeta}>
              {/* Planet dot */}
              <circle
                cx={planet.point.x}
                cy={planet.point.y}
                r={8}
                fill={PLANETAS_DATA[planet.pos.planeta as keyof typeof PLANETAS_DATA]?.cor || '#FFF'}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={1}
              />
              {/* Planet symbol */}
              <text
                x={planet.point.x}
                y={planet.point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#000"
                fontSize="10"
                fontWeight="bold"
              >
                {planet.simbolo}
              </text>
              {/* Degree label */}
              <text
                x={textX}
                y={textY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.8)"
                fontSize="9"
                fontFamily="sans-serif"
              >
                {Math.round(planet.pos.grauNoSigno)}°
              </text>
            </g>
          );
        })}

        {/* Center point */}
        <circle
          cx={radius}
          cy={radius}
          r={3}
          fill="rgba(212, 175, 55, 0.6)"
        />
      </svg>
    </div>
  );
}

export default BirthChartViz;