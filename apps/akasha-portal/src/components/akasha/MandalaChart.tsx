'use client';

import { useState, useMemo, memo } from 'react';
import { AstrologyInfoPanel, type AstrologyAspect } from '@/components/akasha/AstrologyInfoPanel';
import { IchingInfoPanel } from '@/components/akasha/IchingInfoPanel';
import { MandalaAtmosphere } from '@/components/akasha/MandalaAtmosphere';
import { KabalaInfoPanel, TantricBodyInfoPanel } from '@/components/akasha/MandalaInfoPanels';
import { OduInfoPanel } from '@/components/akasha/OduInfoPanel';
import { ELEMENT_GUIDANCE, dominantElement } from '@/components/akasha/mandala-elements';
import {
  describeArc,
  PARTICLES,
  PILAR_COLORS,
  PILAR_LABEL_BY_LAYER,
  STARS,
  toXY,
  ZODIAC_NAMES,
  ZODIAC_SIGNS,
  type Layer,
} from '@/components/akasha/mandala-geometry';
import {
  buildAstroSegments,
  buildKabVerts,
  buildPlanetDots,
  buildTantricNodes,
  buildTooltipByLayer,
  buildTrianglePath,
} from '@/components/akasha/mandala-layers';
import { LIFE_PATH_MEANINGS } from '@/components/akasha/mandala-meanings';
import {
  formatDegreeToZodiac,
  GLYPHS_BY_PLANET,
  PLANET_COLORS,
  longitudeToSvgAngle,
} from '@/lib/shared/zodiac';
import { useCockpitStore } from '@/stores/cockpit-store';

// buildAstroSegments() uses only constants — compute once at module load
const ASTRO_SEGMENTS = buildAstroSegments();

export interface MandalaData {
  incomplete: boolean;
  odus: {
    oduName: string;
    oduNumber: number | null;
    orixaRegency: string[];
    elementalForce: string | null;
    provisional: boolean;
    preceitos?: string[];
    quizilas?: string[];
  };
  kabala: {
    lifePath: number | null;
    lifePathMaster: boolean;
    expression: number | null;
    expressionMaster: boolean;
    motivation: number | null;
    impression: number | null;
    mission: number | null;
    personalYear: number | null;
    personalMonth: number | null;
    personalDay: number | null;
    sefira: string | null;
    hebrewLetter: string | null;
    tarotCard: { major: number; name: string; meaning: string } | null;
    challenges: { first: number; second: number; main: number; last: number } | null;
    pinnacles: {
      first: { number: number; ageEnd: number; meaning: string } | null;
      second: { number: number; ageStart: number; ageEnd: number; meaning: string } | null;
      third: { number: number; ageStart: number; ageEnd: number; meaning: string } | null;
      fourth: { number: number; ageStart: number; meaning: string } | null;
    } | null;
    lifeCycles: {
      first: { number: number; ageStart: number; ageEnd: number } | null;
      second: { number: number; ageStart: number; ageEnd: number } | null;
      third: { number: number; ageStart: number } | null;
    } | null;
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
    // Mandala Fase 3 (spec mandala-fase3-zodiac-tantra):
    // absoluteLongitude (0-360°) é usado pelo MandalaChart para posicionar
    // os planetas na eclíptica. `degree` permanece para InfoPanel
    // (compat: grau dentro do signo, 0-30°).
    planets: Array<{
      name: string;
      sign: string;
      degree: number;
      absoluteLongitude: number | null;
      retrograde?: boolean;
      house: number;
    }>;
    aspects: AstrologyAspect[];
    elementalBalance: { fire: number; earth: number; air: number; water: number };
  };
  iching: {
    hexagramNumber: number | null;
    hexagramName: string | null;
    hexagramChineseName: string | null;
    upperTrigram: number | null;
    lowerTrigram: number | null;
    upperTrigramName: string | null;
    lowerTrigramName: string | null;
    lines: boolean[];
    algorithm: string | null;
    provisional: boolean;
    birthDate: string | null;
    birthTime: string | null;
    available: boolean;
    error: string | null;
  };
  _user?: {
    birthDate: string | null;
    birthTime: string | null;
  };
}

interface Props {
  data: MandalaData;
}

// LIFE_PATH_MEANINGS, TANTRIC_BODY_WISDOM, resolveSig and SignificadoEmbed
// are imported from @/components/akasha/mandala-meanings.

const MandalaChart = memo(function MandalaChart({ data }: Props) {
  const [activeLayer, setActiveLayer] = useState<null | Layer>(null);
  const [hoveredLayer, setHoveredLayer] = useState<null | Layer>(null);
  const atmosphereIntensity = useCockpitStore((s) => s.atmosphereIntensity);

  const opacity = (layer: Layer) => {
    if (activeLayer === null) return 1;
    if (activeLayer === layer) return 1;
    if (hoveredLayer !== null && hoveredLayer !== layer) return 0.3;
    return 1;
  };

  // Pause ring rotation when Layer 4 is selected
  const ringPaused = activeLayer === 4;

  // Per-layer derivations (extracted to @/components/akasha/mandala-layers
  // to keep this component focused on rendering). See mandala-layers.ts
  // for the implementations of tooltipByLayer, astroSegments, planetDots,
  // tantricNodes, kabVerts and trianglePath.

  // Per-layer curated tooltip text (F-206) — maps visual layer → Pilar id
  // and resolves a short essence from the grimoire for native <title> hover.
  const tooltipByLayer = useMemo(() => buildTooltipByLayer(data), [data]);

  // Mandala Fase 3 (spec mandala-fase3-zodiac-tantra):
  // - Uses `absoluteLongitude` (0-360°) to distribute planets on the
  //   ecliptic correctly; falls back to `degree` for backwards compat.
  const planetDots = useMemo(() => buildPlanetDots(data.astrology.planets), [data.astrology.planets]);

  const tantricNodes = useMemo(() => buildTantricNodes(data.tantra.bodies), [data.tantra.bodies]);

  const kabVerts = useMemo(() => buildKabVerts(data.kabala), [data.kabala]);

  const trianglePath = useMemo(() => buildTrianglePath(kabVerts), [kabVerts]);

  const elem = useMemo(() => dominantElement(data.astrology.elementalBalance), [data.astrology.elementalBalance]);
  const inactiveBodies = useMemo(() => tantricNodes.filter((n) => !n.active), [tantricNodes]);
  const lpMeaning = useMemo(() => LIFE_PATH_MEANINGS[data.kabala.lifePath ?? 0] ?? null, [data.kabala.lifePath]);
  const elemGuidance = useMemo(() => ELEMENT_GUIDANCE[elem] ?? null, [elem]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        width: '100%',
        maxWidth: 460,
      }}
    >
      <style>{`
        @keyframes pulse-ori {
          0%, 100% { opacity: 0.65; }
          50% { opacity: 1; }
        }
        @keyframes ring-rotate {
          from { transform-origin: 200px 200px; transform: rotate(0deg); }
          to { transform-origin: 200px 200px; transform: rotate(360deg); }
        }
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.25; }
        }
        @keyframes particle-blink {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.55; }
        }
        .mandala-pulse { animation: pulse-ori 3s ease-in-out infinite; }
        .mandala-pulse-2 { animation: pulse-ori 3s ease-in-out infinite; animation-delay: 0.5s; }
        .mandala-pulse-3 { animation: pulse-ori 3s ease-in-out infinite; animation-delay: 1s; }
        .ring-astrological { animation: none; }
        .ring-astrological-paused { animation: none; }
        .synergy-active { animation: dash-flow 3s linear infinite; }
        .synergy-alert { animation: dash-flow 1.5s linear infinite; }
        .star-twinkle { animation: twinkle 4s ease-in-out infinite; }
        .particle-blink { animation: particle-blink 2.5s ease-in-out infinite; }
        .layer-btn:hover {
          border-color: rgba(38,48,79,1) !important;
          color: #FFFFFF !important;
          transform: translateY(-1px);
        }
        .layer-btn:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>

      {/* Layer selector — ordered by layer (1..5) */}
      <div
        className="flex gap-2 flex-wrap justify-center"
        aria-label="Camadas da Mandala — selecione para revelar significados"
      >
        {([1, 2, 3, 4, 5] as Layer[]).map((layer) => {
          const color = PILAR_COLORS[layer];
          const label = PILAR_LABEL_BY_LAYER[layer];
          return (
            <button
              key={layer}
              className="layer-btn"
              onClick={() => setActiveLayer(activeLayer === layer ? null : layer)}
              aria-label={`Camada ${layer} — ${label}`}
              aria-pressed={activeLayer === layer}
              style={{
                fontSize: '0.75rem',
                padding: '4px 12px',
                borderRadius: '100px',
                border: `1px solid ${activeLayer === layer ? color : 'rgba(38,48,79,0.8)'}`,
                background: activeLayer === layer ? `${color}22` : 'rgba(11,14,28,0.5)',
                color: activeLayer === layer ? color : '#A7AECF',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              C{layer} · {label}
            </button>
          );
        })}
      </div>

      <div className="relative w-full" style={{ maxWidth: 400 }}>
        <MandalaAtmosphere intensity={atmosphereIntensity} />

        <svg
          viewBox="0 0 400 400"
          width="100%"
          style={{ maxWidth: 400, display: 'block', position: 'relative', zIndex: 1 }}
          aria-label="Mandala Akáshica Toroidal"
        >
          {/* Deep space background */}
          <defs>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0B0E1C" />
              <stop offset="100%" stopColor="#06070F" />
            </radialGradient>
            <radialGradient id="oriGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F0B429" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F0B429" stopOpacity="0" />
            </radialGradient>
            <filter id="glow-akasha">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="200" cy="200" r="200" fill="url(#bgGrad)" />

          {/* ── E — Stars background ── */}
          {STARS.map((s, i) => (
            <circle
              key={`star-${i}`}
              cx={s.x}
              cy={s.y}
              r="1"
              fill="white"
              opacity={s.opacity}
              className="star-twinkle"
              style={{ animationDelay: `${s.delay}s` }}
            />
          ))}

          {/* Faint cross-layer synergy lines */}
          {[0, 72, 144, 216, 288].map((deg, i) => {
            const outer = toXY(deg, 178);
            const inner = toXY(deg, 80);
            return (
              <line
                key={i}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="rgba(45,212,191,0.08)"
                strokeWidth="0.5"
                strokeDasharray="3 5"
              />
            );
          })}

          {/* ── Layer 4 — Movimento Celeste (rotating) ── */}
          <g
            opacity={opacity(4)}
            onClick={() => setActiveLayer(activeLayer === 4 ? null : 4)}
            onMouseEnter={() => setHoveredLayer(4)}
            onMouseLeave={() => setHoveredLayer(null)}
            style={{ cursor: 'pointer' }}
            className={ringPaused ? 'ring-astrological-paused' : 'ring-astrological'}
          >
            <title>{tooltipByLayer[4]}</title>
            <circle
              cx="200"
              cy="200"
              r="196"
              fill="none"
              stroke="rgba(124,92,255,0.12)"
              strokeWidth="0.5"
            />
            <circle
              cx="200"
              cy="200"
              r="170"
              fill="none"
              stroke="rgba(124,92,255,0.12)"
              strokeWidth="0.5"
            />
            {ASTRO_SEGMENTS.map(({ startDeg, endDeg, sym, labelPos }, i) => (
              <g key={i}>
                <path
                  d={describeArc(200, 200, 183, startDeg, endDeg)}
                  fill="none"
                  stroke="rgba(38,48,79,0.7)"
                  strokeWidth="1"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#8A9BC0"
                >
                  {sym}
                </text>
              </g>
            ))}
            {/* Mandala Fase 3: 12 casas astrológicas (linha tracejada + número) */}
            {Array.from({ length: 12 }, (_, h) => {
              const houseLong = h * 30; // casa 1 = 0° (ascendente), incrementa 30°
              const angle = longitudeToSvgAngle(houseLong);
              const innerPos = toXY(angle, 152);
              const outerPos = toXY(angle, 168);
              return (
                <g key={`house-${h + 1}`}>
                  <line
                    x1={innerPos.x}
                    y1={innerPos.y}
                    x2={outerPos.x}
                    y2={outerPos.y}
                    stroke="rgba(255,255,255,0.20)"
                    strokeWidth="0.5"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={toXY(angle, 145).x}
                    y={toXY(angle, 145).y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="rgba(255,255,255,1.0)"
                    fontWeight="500"
                  >
                    {h + 1}
                  </text>
                </g>
              );
            })}

            {/* Planet glifos (Fase 3) — 10 planetas com glifos unicode + cor + aria-label */}
            {planetDots.map((p, i) => (
              <g key={`planet-${p.name}-${i}`} filter="url(#glow-akasha)">
                <text
                  x={p.pos.x}
                  y={p.pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fontWeight="600"
                  fill={p.color}
                  opacity="0.95"
                  role="img"
                  aria-label={`${p.name} em ${p.sign} casa ${p.house}${p.retrograde ? ' retrógrado' : ''}`}
                >
                  {p.glyph}
                  {p.retrograde ? '℞' : ''}
                  <title>
                    {p.name}: {p.sign} casa {p.house}
                  </title>
                </text>
              </g>
            ))}
            {/* Ring label */}
            <text
              x="200"
              y="14"
              textAnchor="middle"
              fontSize="10"
              fill="rgba(124,92,255,0.7)"
              letterSpacing="2"
            >
              MOVIMENTO CELESTE
            </text>

            {/* ── D — Particle dots on outer edge ── */}
            {PARTICLES.map((pt, i) => (
              <circle
                key={`particle-${i}`}
                cx={pt.x}
                cy={pt.y}
                r="1.5"
                fill="white"
                className="particle-blink"
                style={{ animationDelay: `${pt.delay}s` }}
              />
            ))}
          </g>

          {/* ── Layer 3 — Corpo e Energia ── */}
          <g
            opacity={opacity(3)}
            onClick={() => setActiveLayer(activeLayer === 3 ? null : 3)}
            onMouseEnter={() => setHoveredLayer(3)}
            onMouseLeave={() => setHoveredLayer(null)}
            style={{ cursor: 'pointer' }}
          >
            <title>{tooltipByLayer[3]}</title>
            <circle
              cx="200"
              cy="200"
              r="138"
              fill="none"
              stroke="rgba(45,212,191,0.15)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            {/* Web lines between nodes */}
            {tantricNodes.map(({ pos }, i) => {
              const next = tantricNodes[(i + 1) % 11];
              return (
                <line
                  key={i}
                  x1={pos.x}
                  y1={pos.y}
                  x2={next.pos.x}
                  y2={next.pos.y}
                  stroke="rgba(45,212,191,0.1)"
                  strokeWidth="0.5"
                />
              );
            })}
            {tantricNodes.map(({ pos, active, label }, i) => (
              <g key={i}>
                {!active && <circle cx={pos.x} cy={pos.y} r="10" fill="rgba(251,87,129,0.12)" />}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={active ? 6 : 7}
                  fill={active ? '#2DD4BF' : '#FB5781'}
                  opacity={active ? 0.9 : 0.75}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#F4F5FF"
                  fontWeight="bold"
                >
                  {label}
                </text>
              </g>
            ))}
          </g>

          {/* ── Layer 5 — Mutação do Caminho ── */}
          <g
            opacity={opacity(5)}
            onClick={() => setActiveLayer(activeLayer === 5 ? null : 5)}
            onMouseEnter={() => setHoveredLayer(5)}
            onMouseLeave={() => setHoveredLayer(null)}
            style={{ cursor: 'pointer' }}
          >
            <title>{tooltipByLayer[5]}</title>
            <circle
              cx="200"
              cy="200"
              r="110"
              fill="none"
              stroke="rgba(160,118,58,0.2)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            {/* I-Ching node at top (200, 110) */}
            <g>
              <circle cx="200" cy="110" r="20" fill="rgba(160,118,58,0.12)" />
              <circle
                cx="200"
                cy="110"
                r="13"
                fill={data.iching.available ? '#A0763A' : 'rgba(160,118,58,0.35)'}
                opacity={data.iching.available ? 0.9 : 0.6}
                filter="url(#glow-akasha)"
              >
                <title>
                  {data.iching.available
                    ? `Hexagrama ${data.iching.hexagramNumber} — ${data.iching.hexagramName} (${data.iching.hexagramChineseName})`
                    : 'Hexagrama do Ori ainda não calculado'}
                </title>
              </circle>
              <text
                x="200"
                y="110"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#F4F5FF"
                fontWeight="700"
              >
                {data.iching.hexagramNumber ?? '?'}
              </text>
              <text
                x="200"
                y="86"
                textAnchor="middle"
                fontSize="10"
                fill="#A0763A"
                letterSpacing="1.5"
              >
                MUTAÇÃO DO CAMINHO
              </text>
            </g>
          </g>

          {/* ── B — Toroidal synergy lines (between Layer 3 and Layer 2) ── */}
          {tantricNodes.map(({ pos, active }, i) => (
            <line
              key={`synergy-${i}`}
              x1={pos.x}
              y1={pos.y}
              x2={200}
              y2={200}
              stroke={active ? '#2DD4BF' : '#FB5781'}
              strokeWidth="0.6"
              strokeDasharray="4 6"
              opacity={active ? 0.35 : 0.25}
              strokeDashoffset="0"
              className={active ? 'synergy-active' : 'synergy-alert'}
              style={{ animationDelay: `${(i * 0.27) % 2}s` }}
            />
          ))}

          {/* ── Layer 2 — Número de Vida ── */}
          <g
            opacity={opacity(2)}
            onClick={() => setActiveLayer(activeLayer === 2 ? null : 2)}
            onMouseEnter={() => setHoveredLayer(2)}
            onMouseLeave={() => setHoveredLayer(null)}
            style={{ cursor: 'pointer' }}
          >
            <title>{tooltipByLayer[2]}</title>
            <circle
              cx="200"
              cy="200"
              r="80"
              fill="none"
              stroke="rgba(92,124,255,0.2)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <path
              d={trianglePath}
              fill="rgba(92,124,255,0.05)"
              stroke={PILAR_COLORS[2]}
              strokeWidth="1.5"
              opacity="0.8"
            />
            {kabVerts.map(({ pos, value, master }, i) => (
              <g key={i}>
                {master && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="14"
                    fill="none"
                    stroke="#7D9BFF"
                    strokeWidth="0.75"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="11"
                  fill="rgba(92,124,255,0.18)"
                  stroke={PILAR_COLORS[2]}
                  strokeWidth="1.2"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#F4F5FF"
                  fontWeight="700"
                >
                  {value ?? '?'}
                </text>
              </g>
            ))}
          </g>

          {/* ── Layer 1 — Ancestralidade ── */}
          <g
            opacity={opacity(1)}
            onClick={() => setActiveLayer(activeLayer === 1 ? null : 1)}
            onMouseEnter={() => setHoveredLayer(1)}
            onMouseLeave={() => setHoveredLayer(null)}
            style={{ cursor: 'pointer' }}
          >
            <title>{tooltipByLayer[1]}</title>
            {/* ── C — Animated glow rings (3 concentric, phase-offset) ── */}
            <circle
              cx="200"
              cy="200"
              r="50"
              fill="none"
              stroke="#F0B429"
              strokeWidth="0.5"
              opacity="0.15"
              className="mandala-pulse-3"
            />
            <circle
              cx="200"
              cy="200"
              r="44"
              fill="none"
              stroke="#F0B429"
              strokeWidth="0.75"
              opacity="0.2"
              className="mandala-pulse-2"
            />
            {/* Ori glow */}
            <circle cx="200" cy="200" r="40" fill="url(#oriGlow)" className="mandala-pulse" />
            <circle
              cx="200"
              cy="200"
              r="34"
              fill="rgba(240,180,41,0.08)"
              stroke="#F0B429"
              strokeWidth="1.5"
              className="mandala-pulse"
            />
            <circle cx="200" cy="200" r="7" fill="#F0B429" filter="url(#glow-akasha)" />
            <text x="200" y="216" textAnchor="middle" fontSize="10" fill="#F0B429" fontWeight="600">
              {data.odus.oduName.length > 14
                ? data.odus.oduName.slice(0, 14) + '…'
                : data.odus.oduName}
            </text>
            {data.odus.orixaRegency[0] && (
              <text x="200" y="226" textAnchor="middle" fontSize="10" fill="#F0B429">
                {data.odus.orixaRegency[0]}
              </text>
            )}
          </g>

          {/* ── F — Incomplete data badge ── */}
          {data.incomplete && (
            <text x="200" y="390" textAnchor="middle" fontSize="10" fill="#FB5781" opacity="0.7">
              * dados parciais — complete o perfil
            </text>
          )}
        </svg>
      </div>

      {/* === Layer legend subtitle === */}
      {activeLayer !== null && (
        <div
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: PILAR_COLORS[activeLayer],
            textAlign: 'center',
            opacity: 0.75,
            marginBottom: '0.25rem',
          }}
          aria-hidden="true"
        >
          CAMADA {activeLayer} — {PILAR_LABEL_BY_LAYER[activeLayer]}
        </div>
      )}

      {/* === Info Panels === */}
      {activeLayer === 4 && (
        <AstrologyInfoPanel astrology={data.astrology} elemGuidance={elemGuidance} />
      )}

      {activeLayer === 3 && (
        <TantricBodyInfoPanel tantra={data.tantra} inactiveBodies={inactiveBodies} />
      )}

      {activeLayer === 2 && <KabalaInfoPanel kabala={data.kabala} lpMeaning={lpMeaning} />}

      {activeLayer === 1 && <OduInfoPanel odu={data.odus} />}

      {activeLayer === 5 && <IchingInfoPanel iching={data.iching} />}

      {activeLayer === null && (
        <p style={{ fontSize: '0.75rem', color: '#5C6691', textAlign: 'center' }}>
          Toque em uma camada para revelar seus dados e orientações práticas.
        </p>
      )}
    </div>
  );
});

export default MandalaChart;
