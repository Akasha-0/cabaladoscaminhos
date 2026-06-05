'use client';

import { useState } from 'react';

interface MandalaData {
  incomplete: boolean;
  odus: {
    oduName: string;
    oduNumber: number | null;
    orixaRegency: string[];
    elementalForce: string | null;
    provisional: boolean;
  };
  kabala: {
    lifePath: number | null;
    lifePathMaster: boolean;
    expression: number | null;
    expressionMaster: boolean;
    motivation: number | null;
    personalYear: number | null;
  };
  tantra: {
    soul: number | null;
    karma: number | null;
    divineGift: number | null;
    destiny: number | null;
    tantricPath: number | null;
    bodies: Array<{ index: number; name: string; active: boolean }>;
  };
  astrology: {
    ascendant: string | null;
    midheaven: string | null;
    dominantPlanet: string | null;
    planets: Array<{ name: string; sign: string; degree: number; house: number }>;
    elementalBalance: { fire: number; earth: number; air: number; water: number };
  };
}

interface Props {
  data: MandalaData;
}

const toXY = (angleDeg: number, r: number, cx = 200, cy = 200) => ({
  x: cx + r * Math.cos((angleDeg - 90) * Math.PI / 180),
  y: cy + r * Math.sin((angleDeg - 90) * Math.PI / 180),
});

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = toXY(startDeg, r, cx, cy);
  const end = toXY(endDeg, r, cx, cy);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function MandalaChart({ data }: Props) {
  const [activeLayer, setActiveLayer] = useState<null | 1 | 2 | 3 | 4>(null);

  const opacity = (layer: 1 | 2 | 3 | 4) =>
    activeLayer === null ? 1 : activeLayer === layer ? 1 : 0.45;

  // Layer 4 — Astrological ring segments
  const astroSegments = ZODIAC_SYMBOLS.map((sym, i) => {
    const startDeg = i * 30;
    const endDeg = (i + 1) * 30;
    const midDeg = startDeg + 15;
    const labelPos = toXY(midDeg, 193);
    return { sym, startDeg, endDeg, midDeg, labelPos };
  });

  // Planet dots on the astrological ring (degree → angle)
  const planetDots = data.astrology.planets.map((p) => ({
    ...p,
    pos: toXY(p.degree * (360 / 360), 185),
  }));

  // Layer 3 — 11 tantric body nodes
  const tantricNodes = Array.from({ length: 11 }, (_, i) => {
    const angleDeg = i * (360 / 11);
    const pos = toXY(angleDeg, 140);
    const body = data.tantra.bodies.find((b) => b.index === i + 1);
    return { i, angleDeg, pos, active: body?.active ?? true, label: i + 1 };
  });

  // Layer 2 — Kabbalistic triangle vertices
  const kabVerts = [
    { angleDeg: 0, value: data.kabala.lifePath, master: data.kabala.lifePathMaster, label: 'VP' },
    { angleDeg: 120, value: data.kabala.expression, master: data.kabala.expressionMaster, label: 'EX' },
    { angleDeg: 240, value: data.kabala.motivation, master: false, label: 'MO' },
  ].map((v) => ({ ...v, pos: toXY(v.angleDeg, 82) }));

  const trianglePath = `M ${kabVerts[0].pos.x} ${kabVerts[0].pos.y} L ${kabVerts[1].pos.x} ${kabVerts[1].pos.y} L ${kabVerts[2].pos.x} ${kabVerts[2].pos.y} Z`;

  // Synergy lines: pick 3 fixed cross-layer connections
  const synergyLines = [
    { from: toXY(0, 185), to: toXY(0, 140) },
    { from: toXY(0, 140), to: toXY(0, 82) },
    { from: toXY(120, 185), to: toXY(120, 140) },
  ];

  // Panel text
  const panelContent: Record<number, string> = {
    4: `Astrologia — Ascendente: ${data.astrology.ascendant ?? '—'}, Planeta dominante: ${data.astrology.dominantPlanet ?? '—'}`,
    3: `Numerologia Tântrica — Caminho: ${data.tantra.tantricPath ?? '—'}`,
    2: `Numerologia Cabalística — Caminho de Vida: ${data.kabala.lifePath ?? '—'}`,
    1: `Odus — Odu: ${data.odus.oduName}, Orixá: ${data.odus.orixaRegency[0] ?? '—'}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: 440 }}>
      <style>{`
        @keyframes pulse-ori {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .mandala-pulse { animation: pulse-ori 3s ease-in-out infinite; }
      `}</style>

      <svg
        viewBox="0 0 400 400"
        width="100%"
        style={{ maxWidth: 400 }}
        aria-label="Mandala Akáshica Toroidal"
      >
        {/* Background */}
        <circle cx="200" cy="200" r="200" fill="#06070F" />

        {/* Synergy lines */}
        {synergyLines.map((l, i) => (
          <line
            key={i}
            x1={l.from.x} y1={l.from.y}
            x2={l.to.x} y2={l.to.y}
            stroke="rgba(45,212,191,0.25)"
            strokeWidth="0.5"
            strokeDasharray="2 3"
          />
        ))}

        {/* ── Layer 4 — Astrological Ring ── */}
        <g opacity={opacity(4)} onClick={() => setActiveLayer(activeLayer === 4 ? null : 4)} style={{ cursor: 'pointer' }}>
          {astroSegments.map(({ startDeg, endDeg, sym, labelPos }, i) => (
            <g key={i}>
              <path
                d={describeArc(200, 200, 185, startDeg, endDeg)}
                fill="none"
                stroke="#26304F"
                strokeWidth="1"
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill="#A7AECF"
              >
                {sym}
              </text>
            </g>
          ))}
          {/* Outer ring border */}
          <circle cx="200" cy="200" r="193" fill="none" stroke="#26304F" strokeWidth="1" />
          <circle cx="200" cy="200" r="175" fill="none" stroke="#26304F" strokeWidth="0.5" opacity="0.4" />
          {/* Planet dots */}
          {planetDots.map((p, i) => (
            <circle
              key={i}
              cx={p.pos.x}
              cy={p.pos.y}
              r="3"
              fill="#7C5CFF"
              opacity="0.85"
            />
          ))}
        </g>

        {/* ── Layer 3 — Tantric Web ── */}
        <g opacity={opacity(3)} onClick={() => setActiveLayer(activeLayer === 3 ? null : 3)} style={{ cursor: 'pointer' }}>
          {/* Guide circle */}
          <circle
            cx="200" cy="200" r="140"
            fill="none"
            stroke="rgba(45,212,191,0.2)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          {/* Lines to center */}
          {tantricNodes.map(({ pos }, i) => (
            <line
              key={i}
              x1="200" y1="200"
              x2={pos.x} y2={pos.y}
              stroke="rgba(45,212,191,0.15)"
              strokeWidth="0.75"
            />
          ))}
          {/* Nodes */}
          {tantricNodes.map(({ pos, active, label }, i) => (
            <g key={i}>
              <circle
                cx={pos.x} cy={pos.y} r="6"
                fill={active ? '#2DD4BF' : '#FB5781'}
                opacity="0.9"
              />
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="5"
                fill="#06070F"
                fontWeight="bold"
              >
                {label}
              </text>
            </g>
          ))}
        </g>

        {/* ── Layer 2 — Kabbalistic Geometry ── */}
        <g opacity={opacity(2)} onClick={() => setActiveLayer(activeLayer === 2 ? null : 2)} style={{ cursor: 'pointer' }}>
          {/* Guide circle */}
          <circle
            cx="200" cy="200" r="82"
            fill="none"
            stroke="rgba(124,92,255,0.3)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          {/* Triangle */}
          <path
            d={trianglePath}
            fill="rgba(124,92,255,0.04)"
            stroke="#7C5CFF"
            strokeWidth="1.5"
          />
          {/* Vertices */}
          {kabVerts.map(({ pos, value, master }, i) => (
            <g key={i}>
              <circle
                cx={pos.x} cy={pos.y} r="10"
                fill="rgba(124,92,255,0.15)"
                stroke="#7C5CFF"
                strokeWidth="1"
              />
              {master && (
                <circle
                  cx={pos.x} cy={pos.y} r="12"
                  fill="none"
                  stroke="#7C5CFF"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                  opacity="0.7"
                />
              )}
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fill="#F4F5FF"
                fontWeight="600"
              >
                {value ?? '?'}
              </text>
            </g>
          ))}
        </g>

        {/* ── Layer 1 — Odus Core ── */}
        <g opacity={opacity(1)} onClick={() => setActiveLayer(activeLayer === 1 ? null : 1)} style={{ cursor: 'pointer' }}>
          {/* Pulsing outer glow */}
          <circle
            cx="200" cy="200" r="32"
            fill="rgba(240,180,41,0.12)"
            stroke="#F0B429"
            strokeWidth="2"
            className="mandala-pulse"
          />
          {/* Center point with glow */}
          <circle
            cx="200" cy="200" r="6"
            fill="#F0B429"
            style={{ filter: 'drop-shadow(0 0 4px #F0B429)' }}
          />
          {/* Odu name */}
          <text
            x="200" y="213"
            textAnchor="middle"
            fontSize="7"
            fill="#F0B429"
            fontWeight="500"
          >
            {data.odus.oduName.length > 18 ? data.odus.oduName.slice(0, 16) + '…' : data.odus.oduName}
          </text>
          {/* Orixá */}
          {data.odus.orixaRegency[0] && (
            <text
              x="200" y="222"
              textAnchor="middle"
              fontSize="6"
              fill="rgba(240,180,41,0.7)"
            >
              {data.odus.orixaRegency[0]}
            </text>
          )}
        </g>
      </svg>

      {/* Info panel */}
      {activeLayer !== null && (
        <div
          style={{
            background: 'rgba(11,14,28,0.85)',
            border: '1px solid rgba(124,92,255,0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: 12,
            padding: '0.75rem 1.25rem',
            color: '#F4F5FF',
            fontSize: '0.8125rem',
            width: '100%',
            maxWidth: 400,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: '#A7AECF', marginRight: 6 }}>
            {activeLayer === 4 && '◯ Camada 4'}
            {activeLayer === 3 && '◯ Camada 3'}
            {activeLayer === 2 && '◯ Camada 2'}
            {activeLayer === 1 && '◯ Camada 1'}
          </span>
          {panelContent[activeLayer]}
        </div>
      )}
    </div>
  );
}
