'use client';

import { useState } from 'react';
import { MandalaAtmosphere } from '@/components/akasha/MandalaAtmosphere';
import { Divider, InfoPanel, Insight, Row } from '@/components/akasha/MandalaChartInfoPanel';
import {
  significadoPorPilar,
  significadoGenericoDoPilar,
  type Pilar,
  type SignificadoCurado,
} from '@/lib/grimoire/significados-curados';
import { useCockpitStore } from '@/stores/cockpit-store';
import { formatDegreeToZodiac, GLYPHS_BY_PLANET, PLANET_COLORS, longitudeToSvgAngle } from '@/lib/shared/zodiac';
import { KOSHAS } from '@/lib/shared/koshas';

function resolveSig(pilar: Pilar, id: string | number | null | undefined): SignificadoCurado {
  if (id == null) return significadoGenericoDoPilar(pilar);
  return significadoPorPilar(pilar, id) ?? significadoGenericoDoPilar(pilar);
}

function SignificadoEmbed({
  significado,
  color,
}: {
  significado: SignificadoCurado;
  color: string;
}) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: '10px 12px',
        background: `${color}10`,
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        fontSize: '0.8rem',
        lineHeight: 1.45,
      }}
    >
      <p
        style={{
          color: '#F4F5FF',
          margin: 0,
          fontStyle: 'italic',
          fontFamily: 'var(--font-lora, serif)',
        }}
      >
        {significado.essencia}
      </p>
      <p style={{ color: '#A7AECF', margin: '6px 0 0', fontSize: '0.75rem' }}>
        <strong style={{ color }}>Missão:</strong> {significado.missao}
      </p>
      {significado.requer_terreiro && (
        <p style={{ color: '#FB5781', margin: '6px 0 0', fontSize: '0.7rem', fontStyle: 'italic' }}>
          ⚠ Interpretação profunda requer babalaô/yaô de confiança (R-022 §4.4).
        </p>
      )}
      <p style={{ color: '#5C6691', margin: '6px 0 0', fontSize: '0.65rem' }}>
        via {significado.fonte}
      </p>
    </div>
  );
}
interface AstrologyAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  interpretation: string;
}

interface MandalaData {
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

type Layer = 1 | 2 | 3 | 4 | 5;

const toXY = (angleDeg: number, r: number, cx = 200, cy = 200) => ({
  x: cx + r * Math.cos(((angleDeg - 90) * Math.PI) / 180),
  y: cy + r * Math.sin(((angleDeg - 90) * Math.PI) / 180),
});

const ZODIAC_SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const ZODIAC_NAMES = [
  'Áries',
  'Touro',
  'Gêmeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
];

const ELEMENT_COLORS: Record<string, string> = {
  fire: '#FB5781',
  earth: '#F0B429',
  air: '#7C5CFF',
  water: '#2DD4BF',
};

// Layer colors — keyed by VISUAL LAYER (1..5 inside-out).
// Layer 1 = Ancestralidade | Layer 2 = Número de Vida
// Layer 3 = Corpo e Energia | Layer 4 = Movimento Celeste
// Layer 5 = Mutação do Caminho
// Número de Vida usa indigo para distinguir-se de Movimento Celeste (roxo/ar).
const PILAR_COLORS: Record<Layer, string> = {
  1: '#F0B429',
  2: '#5C7CFF',
  3: '#2DD4BF',
  4: '#7C5CFF',
  5: '#A0763A',
};
const PILAR_LABEL_BY_LAYER: Record<Layer, string> = {
  1: 'Ancestralidade',
  2: 'Número de Vida',
  3: 'Corpo e Energia',
  4: 'Movimento Celeste',
  5: 'Mutação do Caminho',
};
const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fogo',
  earth: 'Terra',
  air: 'Ar',
  water: 'Água',
};
const ELEMENT_GUIDANCE: Record<string, { balance: string; ritual: string }> = {
  fire: {
    balance:
      'Elemento dominante Fogo — energia de ação, liderança e expansão. Para equilibrar: aterrar com práticas de Terra (corpo, natureza, alimentos raiz).',
    ritual:
      'Ritual: banhos de ervas de terra (alecrim, patchouli), caminhar descalço, meditação com pedras.',
  },
  earth: {
    balance:
      'Elemento dominante Terra — energia de estrutura, paciência e materialização. Para equilibrar: aquecer com Fogo (movimento, expressão, criatividade).',
    ritual:
      'Ritual: dança livre, uso de cores vibrantes, incenso de canela ou cravo para ativar a chama interna.',
  },
  air: {
    balance:
      'Elemento dominante Ar — energia mental, comunicação e movimento. Para equilibrar: ancorar com Água (emoção, intuição, descanso).',
    ritual: 'Ritual: banhos de água fria com pétalas de rosa, meditação aquática, chás calmantes.',
  },
  water: {
    balance:
      'Elemento dominante Água — energia emocional, intuição e profundidade. Para equilibrar: estruturar com Terra (rotinas, corpo, alimentação consciente).',
    ritual:
      'Ritual: caminhadas na natureza, dieta baseada em raízes e tubérculos, pedras de jaspe ou hematita.',
  },
};
const ASPECT_SYMBOLS: Record<string, string> = {
  conjunção: '☌',
  oposição: '☍',
  trino: '△',
  quadratura: '□',
  sextil: '✶',
};

const LIFE_PATH_MEANINGS: Record<number, string> = {
  1: 'Caminho do Pioneiro — sua missão é liderar e inaugurar novos caminhos. Aprenda a agir independentemente.',
  2: 'Caminho do Diplomata — cooperação, harmonia e parceria são seu veículo de crescimento.',
  3: 'Caminho do Criador — expressão, comunicação e criatividade são o seu propósito sagrado.',
  4: 'Caminho do Construtor — estrutura, disciplina e trabalho constante constroem seu legado.',
  5: 'Caminho da Liberdade — mudança, aventura e versatilidade são sua escola de vida.',
  6: 'Caminho do Guardião — responsabilidade, cuidado e serviço ao próximo definem sua essência.',
  7: 'Caminho do Buscador — introspecção, espiritualidade e sabedoria são seu norte.',
  8: 'Caminho do Realizador — poder, abundância e autoridade são os temas centrais da sua existência.',
  9: 'Caminho do Humanista — compaixão universal, conclusões e entrega ao coletivo.',
  11: 'Número Mestre 11 — Iluminador. Canal entre os planos, alta sensibilidade intuitiva e missão espiritual.',
  22: 'Número Mestre 22 — Construtor de Mundos. Capacidade de manifestar visões grandiosas na matéria.',
  33: 'Número Mestre 33 — Mestre Cósmico. Serviço incondicional, amor universal, cura e ensino.',
};

const TANTRIC_BODY_WISDOM: Record<number, { desc: string; challenge: string; activate: string }> = {
  1: {
    desc: 'Corpo da Alma',
    challenge: 'Encontrar propósito humilde',
    activate: 'Meditação Ong Namo',
  },
  2: {
    desc: 'Mente Negativa',
    challenge: 'Discernir sem paralisar',
    activate: 'Respiração de fogo',
  },
  3: { desc: 'Mente Positiva', challenge: 'Confiar no processo', activate: 'Sat Kriya — 3 min' },
  4: { desc: 'Mente Neutra', challenge: 'Observar sem reagir', activate: 'Meditação do coração' },
  5: { desc: 'Corpo Físico', challenge: 'Encarnar totalmente', activate: 'Movimento consciente' },
  6: {
    desc: 'Linha do Arco',
    challenge: 'Proteger o campo áurico',
    activate: 'Ser humano íntegro',
  },
  7: { desc: 'Aura', challenge: 'Expandir sem dissolver', activate: 'Projeção e Proteção' },
  8: { desc: 'Corpo Prânico', challenge: 'Sustentar a vitalidade', activate: 'Pranayama diário' },
  9: { desc: 'Corpo Sutil', challenge: 'Escutar o infinalível', activate: 'Escuta da intuição' },
  10: {
    desc: 'Corpo Radiante',
    challenge: 'Brilhar corajosamente',
    activate: 'Ação corajosa cotidiana',
  },
  11: {
    desc: 'Mente Divina',
    challenge: 'Manter-se aberto ao infinito',
    activate: 'Gratidão e rendição',
  },
};

// Stars data — fixed positions seeded deterministically
const STARS = Array.from({ length: 30 }, (_, i) => {
  const angle = (i * 137.508) % 360; // golden angle spacing
  const radius = 60 + ((i * 47) % 130);
  const pos = toXY(angle, radius);
  const opacity = 0.08 + (i % 5) * 0.03;
  const delay = (i * 0.37) % 3;
  return { x: pos.x, y: pos.y, opacity, delay };
});

// Particle dots on outer edge
const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const angle = i * 30;
  const pos = toXY(angle, 198);
  const delay = (i * 0.4) % 4;
  return { x: pos.x, y: pos.y, delay };
});

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = toXY(startDeg, r, cx, cy);
  const end = toXY(endDeg, r, cx, cy);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function dominantElement(balance: {
  fire: number;
  earth: number;
  air: number;
  water: number;
}): string {
  const entries = Object.entries(balance) as [string, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

export default function MandalaChart({ data }: Props) {
  const [activeLayer, setActiveLayer] = useState<null | Layer>(null);
  const atmosphereIntensity = useCockpitStore((s) => s.atmosphereIntensity);

  const opacity = (layer: Layer) => (activeLayer === null ? 1 : activeLayer === layer ? 1 : 0.3);

  // Pause ring rotation when Layer 4 is selected
  const ringPaused = activeLayer === 4;

  // Per-layer curated tooltip text (F-206) — maps visual layer → Pilar id
  // and resolves a short essence from the grimoire for native <title> hover.
  // Per-layer curated tooltip text (F-206) — maps visual layer → Pilar id
  // and resolves a short essence from the grimoire for native <title> hover.
  const tooltipByLayer: Record<Layer, string> = {
    1: (() => {
      // Layer 1 = Ancestralidade
      const sig = resolveSig('odu', data.odus.oduName);
      return `Camada 1 · Ancestralidade (${data.odus.oduName}) — ${sig.essencia}`;
    })(),
    2: (() => {
      // Layer 2 = Número de Vida
      const sig = resolveSig('cabala', data.kabala.lifePath);
      return `Camada 2 · Número de Vida (Vida ${data.kabala.lifePath ?? '?'}) — ${sig.essencia}`;
    })(),
    3: (() => {
      // Layer 3 = Corpo e Energia
      const sig = resolveSig('tantrica', data.tantra.soul);
      return `Camada 3 · Corpo e Energia (Alma ${data.tantra.soul ?? '?'}) — ${sig.essencia}`;
    })(),
    4: (() => {
      // Layer 4 = Movimento Celeste
      const sig = resolveSig('astrologia', data.astrology.ascendant);
      const formattedAsc = formatDegreeToZodiac(data.astrology.ascendant);
      return `Camada 4 · Movimento Celeste (Ascendente: ${formattedAsc || '?'}) — ${sig.essencia}`;
    })(),
    5: (() => {
      // Layer 5 = Mutação do Caminho
      const sig = resolveSig('iching', data.iching.hexagramNumber);
      const hex = data.iching.available
        ? `Hex ${data.iching.hexagramNumber} · ${data.iching.hexagramName}`
        : 'Hex do dia (requer Mutação do Caminho)';
      return `Camada 5 · Mutação do Caminho (${hex}) — ${sig.essencia}`;
    })(),
  };

  const astroSegments = ZODIAC_SIGNS.map((sym, i) => {
    const startDeg = i * 30;
    const endDeg = (i + 1) * 30;
    const midDeg = startDeg + 15;
    const labelPos = toXY(midDeg, 190);
    return { sym, name: ZODIAC_NAMES[i], startDeg, endDeg, midDeg, labelPos };
  });

  // Mandala Fase 3 (spec mandala-fase3-zodiac-tantra):
  // - Usa `absoluteLongitude` (0-360°) em vez de `degree` (0-30°) para distribuir
  //   os planetas na eclíptica corretamente.
  // - longitudeToSvgAngle aplica a convenção 0° = 9 horas do relógio.
  // - Se absoluteLongitude é null, faz fallback para degree (compat).
  const planetDots = data.astrology.planets.map((p) => {
    const lon = p.absoluteLongitude;
    const angle = lon != null && Number.isFinite(lon)
      ? longitudeToSvgAngle(lon)
      : longitudeToSvgAngle(p.degree); // fallback: degree tratado como longitude
    return {
      ...p,
      pos: toXY(angle, 178),
      glyph: GLYPHS_BY_PLANET[p.name] ?? '?',
      color: PLANET_COLORS[p.name] ?? '#FFFFFF',
    };
  });

  const tantricNodes = Array.from({ length: 11 }, (_, i) => {
    const angleDeg = i * (360 / 11);
    const pos = toXY(angleDeg, 138);
    const body = data.tantra.bodies.find((b) => b.index === i + 1);
    const wisdom = TANTRIC_BODY_WISDOM[i + 1];
    return {
      i,
      angleDeg,
      pos,
      active: body?.active ?? true,
      label: i + 1,
      name: wisdom?.desc ?? `Corpo ${i + 1}`,
    };
  });

  const kabVerts = [
    { angleDeg: 0, value: data.kabala.lifePath, master: data.kabala.lifePathMaster, label: 'VP' },
    {
      angleDeg: 120,
      value: data.kabala.expression,
      master: data.kabala.expressionMaster,
      label: 'EX',
    },
    { angleDeg: 240, value: data.kabala.motivation, master: false, label: 'MO' },
  ].map((v) => ({ ...v, pos: toXY(v.angleDeg, 80) }));

  const trianglePath = `M ${kabVerts[0].pos.x} ${kabVerts[0].pos.y} L ${kabVerts[1].pos.x} ${kabVerts[1].pos.y} L ${kabVerts[2].pos.x} ${kabVerts[2].pos.y} Z`;

  const elem = dominantElement(data.astrology.elementalBalance);
  const inactiveBodies = tantricNodes.filter((n) => !n.active);
  const lpMeaning = LIFE_PATH_MEANINGS[data.kabala.lifePath ?? 0] ?? null;
  const elemGuidance = ELEMENT_GUIDANCE[elem] ?? null;

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
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>

      {/* Layer selector — ordered by layer (1..5) */}
      <div className="flex gap-2 flex-wrap justify-center">
        {([1, 2, 3, 4, 5] as Layer[]).map((layer) => {
          const color = PILAR_COLORS[layer];
          const label = PILAR_LABEL_BY_LAYER[layer];
          return (
            <button
              key={layer}
              onClick={() => setActiveLayer(activeLayer === layer ? null : layer)}
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
            {astroSegments.map(({ startDeg, endDeg, sym, labelPos }, i) => (
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
                  fontSize="9"
                  fill="#5C6691"
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
                    fontSize="6"
                    fill="rgba(255,255,255,0.45)"
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
              fontSize="7"
              fill="rgba(124,92,255,0.5)"
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
                  fontSize="5"
                  fill="#06070F"
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
                fontSize="9"
                fill="#F4F5FF"
                fontWeight="700"
              >
                {data.iching.hexagramNumber ?? '?'}
              </text>
              <text
                x="200"
                y="86"
                textAnchor="middle"
                fontSize="5.5"
                fill="rgba(160,118,58,0.7)"
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
                  fontSize="8"
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
            <text
              x="200"
              y="216"
              textAnchor="middle"
              fontSize="6.5"
              fill="#F0B429"
              fontWeight="600"
            >
              {data.odus.oduName.length > 16
                ? data.odus.oduName.slice(0, 14) + '…'
                : data.odus.oduName}
            </text>
            {data.odus.orixaRegency[0] && (
              <text x="200" y="226" textAnchor="middle" fontSize="5.5" fill="rgba(240,180,41,0.65)">
                {data.odus.orixaRegency[0]}
              </text>
            )}
          </g>

          {/* ── F — Incomplete data badge ── */}
          {data.incomplete && (
            <text x="200" y="390" textAnchor="middle" fontSize="7" fill="#FB5781" opacity="0.7">
              * dados parciais — complete o perfil
            </text>
          )}
        </svg>
      </div>

      {/* === Info Panels === */}
      {activeLayer === 4 && (
        <InfoPanel color="#7C5CFF" title="Movimento Celeste — O Céu" subtitle="Anel Cósmico · Camada 4">
          <Row label="Ascendente" value={data.astrology.ascendant} />
          <Row label="Meio do Céu" value={data.astrology.midheaven} />
          <Row label="Planeta dominante" value={data.astrology.dominantPlanet} />
          {data.astrology.planets.slice(0, 5).map((p) => (
            <Row key={p.name} label={p.name} value={`${p.sign} — casa ${p.house}`} />
          ))}
          <Divider />
          <p
            style={{
              fontSize: '0.75rem',
              color: '#7C5CFF',
              fontWeight: 600,
              marginBottom: '0.35rem',
            }}
          >
            Aspectos Principais
          </p>
          {data.astrology.aspects.slice(0, 5).length === 0 ? (
            <Insight color="#7C5CFF">Sem aspectos principais calculados.</Insight>
          ) : (
            data.astrology.aspects.slice(0, 5).map((a, i) => {
              const symbol = ASPECT_SYMBOLS[a.aspect.toLowerCase()] ?? a.aspect;
              return (
                <div key={i} style={{ marginBottom: '0.35rem' }}>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: '#F4F5FF',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {a.planet1} {symbol} {a.planet2} —{' '}
                    <span style={{ color: '#A7AECF' }}>{a.interpretation}</span>
                  </p>
                </div>
              );
            })
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(Object.entries(data.astrology.elementalBalance) as [string, number][]).map(
              ([el, val]) => (
                <span
                  key={el}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '100px',
                    fontSize: '0.6875rem',
                    background: `${ELEMENT_COLORS[el]}18`,
                    border: `1px solid ${ELEMENT_COLORS[el]}44`,
                    color: ELEMENT_COLORS[el],
                  }}
                >
                  {ELEMENT_LABELS[el]} {val}%
                </span>
              )
            )}
          </div>
          {elemGuidance && (
            <>
              <Divider />
              <Insight color="#7C5CFF">{elemGuidance.balance}</Insight>
              <Insight color="#2DD4BF">{elemGuidance.ritual}</Insight>
            </>
          )}
          <SignificadoEmbed
            significado={resolveSig(
              'astrologia',
              data.astrology.ascendant ?? data.astrology.dominantPlanet
            )}
            color="#7C5CFF"
          />
        </InfoPanel>
      )}

      {activeLayer === 3 && (
        <InfoPanel
          color="#2DD4BF"
          title="Corpo e Energia — Os 11 Corpos"
          subtitle="Teia de Conexão · Camada 3"
        >
          <Row label="Caminho Tântrico" value={data.tantra.tantricPath} />
          <Row label="Alma" value={data.tantra.soul} />
          <Row label="Karma" value={data.tantra.karma} />
          <Row label="Dom Divino" value={data.tantra.divineGift} />
          <Divider />
          {inactiveBodies.length === 0 ? (
            <Insight color="#2DD4BF">
              Todos os 11 Corpos estão ativos — seu campo espiritual está em fluxo.
            </Insight>
          ) : (
            <>
              <p style={{ fontSize: '0.75rem', color: '#A7AECF', marginBottom: '0.5rem' }}>
                Corpos em tensão (indicados em magenta na Mandala):
              </p>
              {inactiveBodies.map((n) => {
                const w = TANTRIC_BODY_WISDOM[n.i + 1];
                return (
                  <div key={n.i} style={{ marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.8125rem', color: '#FB5781', fontWeight: 600 }}>
                      Corpo {n.i + 1} — {w?.desc}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#A7AECF' }}>
                      Desafio: {w?.challenge} · Ativar: {w?.activate}
                    </p>
                  </div>
                );
              })}
            </>
          )}
          <SignificadoEmbed
            significado={resolveSig('tantrica', data.tantra.destiny ?? data.tantra.soul ?? 1)}
            color="#2DD4BF"
          />
          {/* Mandala Fase 4 (spec mandala-fase3-zodiac-tantra): 5 Koshas védicas
              como enriquecimento textual. SVG Layer 3 permanece com 11 bodies
              de Yogi Bhajan. As 5 koshas são conceito tântrico védico paralelo. */}
          <Divider />
          <p style={{ fontSize: '0.75rem', color: '#2DD4BF', fontWeight: 600, marginBottom: '0.5rem' }}>
            5 Koshas (Tantra Védica)
          </p>
          {KOSHAS.map((k) => (
            <div
              key={k.id}
              data-testid={`kosha-${k.id}`}
              style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}
            >
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: k.color,
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#FFFFFF', fontWeight: 600, margin: 0 }}>
                  {k.name.pt} <span style={{ color: '#A7AECF', fontWeight: 400 }}>({k.name.sanskrit})</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: '#A7AECF', margin: 0 }}>
                  {k.description.pt}
                </p>
              </div>
            </div>
          ))}
        </InfoPanel>
      )}

      {activeLayer === 2 && (
        <InfoPanel
          color={PILAR_COLORS[2]}
          title="Número de Vida — Geometria Sagrada"
          subtitle="Geometria Interna · Camada 2"
        >
          <Row
            label="Caminho de Vida"
            value={data.kabala.lifePath}
            master={data.kabala.lifePathMaster}
          />
          <Row
            label="Expressão"
            value={data.kabala.expression}
            master={data.kabala.expressionMaster}
          />
          <Row label="Motivação" value={data.kabala.motivation} />
          <Row label="Impressão" value={data.kabala.impression} />
          <Row label="Missão" value={data.kabala.mission} />
          <Row label="Ano Pessoal" value={data.kabala.personalYear} />
          <Row label="Mês Pessoal" value={data.kabala.personalMonth} />
          <Row label="Dia Pessoal" value={data.kabala.personalDay} />
          <Row label="Sefira" value={data.kabala.sefira} />
          <Row label="Letra Hebraica" value={data.kabala.hebrewLetter} />
          {data.kabala.tarotCard && (
            <>
              <Row
                label="Carta de Tarot"
                value={`${data.kabala.tarotCard.name} (#${data.kabala.tarotCard.major})`}
              />
              {data.kabala.tarotCard.meaning && (
                <Insight color={PILAR_COLORS[2]}>{data.kabala.tarotCard.meaning}</Insight>
              )}
            </>
          )}
          {lpMeaning && (
            <>
              <Divider />
              <Insight color={PILAR_COLORS[2]}>{lpMeaning}</Insight>
            </>
          )}
          {data.kabala.challenges && (
            <>
              <Divider />
              <p
                style={{
                  fontSize: '0.75rem',
                  color: PILAR_COLORS[2],
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                Desafios
              </p>
              <Row label="Primeiro Desafio" value={data.kabala.challenges.first} />
              <Row label="Segundo Desafio" value={data.kabala.challenges.second} />
              <Row label="Desafio Principal" value={data.kabala.challenges.main} />
              <Row label="Último Desafio" value={data.kabala.challenges.last} />
            </>
          )}
          {data.kabala.pinnacles && (
            <>
              <Divider />
              <p
                style={{
                  fontSize: '0.75rem',
                  color: PILAR_COLORS[2],
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                Pináculos
              </p>
              {data.kabala.pinnacles.first && (
                <>
                  <Row
                    label="1º Pináculo"
                    value={`${data.kabala.pinnacles.first.number} (até ${data.kabala.pinnacles.first.ageEnd})`}
                  />
                  {data.kabala.pinnacles.first.meaning && (
                    <Insight color={PILAR_COLORS[2]}>{data.kabala.pinnacles.first.meaning}</Insight>
                  )}
                </>
              )}
              {data.kabala.pinnacles.second && (
                <>
                  <Row
                    label="2º Pináculo"
                    value={`${data.kabala.pinnacles.second.number} (${data.kabala.pinnacles.second.ageStart}–${data.kabala.pinnacles.second.ageEnd})`}
                  />
                  {data.kabala.pinnacles.second.meaning && (
                    <Insight color={PILAR_COLORS[2]}>{data.kabala.pinnacles.second.meaning}</Insight>
                  )}
                </>
              )}
              {data.kabala.pinnacles.third && (
                <>
                  <Row
                    label="3º Pináculo"
                    value={`${data.kabala.pinnacles.third.number} (${data.kabala.pinnacles.third.ageStart}–${data.kabala.pinnacles.third.ageEnd})`}
                  />
                  {data.kabala.pinnacles.third.meaning && (
                    <Insight color={PILAR_COLORS[2]}>{data.kabala.pinnacles.third.meaning}</Insight>
                  )}
                </>
              )}
              {data.kabala.pinnacles.fourth && (
                <>
                  <Row
                    label="4º Pináculo"
                    value={`${data.kabala.pinnacles.fourth.number} (depois de ${data.kabala.pinnacles.fourth.ageStart})`}
                  />
                  {data.kabala.pinnacles.fourth.meaning && (
                    <Insight color={PILAR_COLORS[2]}>{data.kabala.pinnacles.fourth.meaning}</Insight>
                  )}
                </>
              )}
            </>
          )}
          {data.kabala.lifeCycles && (
            <>
              <Divider />
              <p
                style={{
                  fontSize: '0.75rem',
                  color: PILAR_COLORS[2],
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                Ciclos de Vida
              </p>
              {data.kabala.lifeCycles.first && (
                <Row
                  label="1º Ciclo"
                  value={`${data.kabala.lifeCycles.first.number} (${data.kabala.lifeCycles.first.ageStart}–${data.kabala.lifeCycles.first.ageEnd})`}
                />
              )}
              {data.kabala.lifeCycles.second && (
                <Row
                  label="2º Ciclo"
                  value={`${data.kabala.lifeCycles.second.number} (${data.kabala.lifeCycles.second.ageStart}–${data.kabala.lifeCycles.second.ageEnd})`}
                />
              )}
              {data.kabala.lifeCycles.third && (
                <Row
                  label="3º Ciclo"
                  value={`${data.kabala.lifeCycles.third.number} (a partir de ${data.kabala.lifeCycles.third.ageStart})`}
                />
              )}
            </>
          )}
          <SignificadoEmbed
            significado={resolveSig('cabala', data.kabala.lifePath)}
            color={PILAR_COLORS[2]}
          />
        </InfoPanel>
      )}

      {activeLayer === 1 && (
        <InfoPanel
          color="#F0B429"
          title={`Odu: ${data.odus.oduName}`}
          subtitle="Núcleo — Ancestralidade · Camada 1"
        >
          <Row
            label="Odu de Nascimento"
            value={`${data.odus.oduName}${data.odus.oduNumber ? ` (${data.odus.oduNumber})` : ''}`}
          />
          <Row label="Orixá(s) regente(s)" value={data.odus.orixaRegency.join(', ')} />
          <Row label="Força Elemental" value={data.odus.elementalForce} />
          {data.odus.provisional && (
            <p style={{ fontSize: '0.6875rem', color: '#5C6691', marginTop: '0.25rem' }}>
              * Cálculo provisório — confirmar com linhagem de referência.
            </p>
          )}
          {data.odus.preceitos && data.odus.preceitos.length > 0 && (
            <>
              <Divider />
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#F0B429',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                Preceitos do Odu
              </p>
              {data.odus.preceitos.map((p, i) => (
                <p key={i} style={{ fontSize: '0.8125rem', color: '#A7AECF' }}>
                  ✦ {p}
                </p>
              ))}
            </>
          )}
          {data.odus.quizilas && data.odus.quizilas.length > 0 && (
            <>
              <Divider />
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#FB5781',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                Quizilás (evitar)
              </p>
              {data.odus.quizilas.map((q, i) => (
                <p key={i} style={{ fontSize: '0.8125rem', color: '#A7AECF' }}>
                  ⚠ {q}
                </p>
              ))}
            </>
          )}
          {(!data.odus.preceitos || data.odus.preceitos.length === 0) && (
            <Insight color="#F0B429">
              As quizilás e preceitos específicos do seu Odu serão exibidos quando o Grimório for
              sincronizado. Consulte o Oráculo para orientação ancestral personalizada.
            </Insight>
          )}
          <SignificadoEmbed significado={resolveSig('odu', data.odus.oduName)} color="#F0B429" />
        </InfoPanel>
      )}

      {activeLayer === 5 && (
        <InfoPanel
          color="#A0763A"
          title="Mutação do Caminho — Hexagrama do Ori"
          subtitle="Sabedoria Ancestral Chinesa · Camada 5"
        >
          {data.iching.available ? (
            <>
              <Row
                label="Hexagrama"
                value={
                  data.iching.hexagramChineseName
                    ? `${data.iching.hexagramNumber} — ${data.iching.hexagramName} (${data.iching.hexagramChineseName})`
                    : `${data.iching.hexagramNumber} — ${data.iching.hexagramName}`
                }
              />
              <Row
                label="Trigrama superior"
                value={
                  data.iching.upperTrigram != null && data.iching.upperTrigramName
                    ? `${data.iching.upperTrigram} — ${data.iching.upperTrigramName}`
                    : data.iching.upperTrigramName
                }
              />
              <Row
                label="Trigrama inferior"
                value={
                  data.iching.lowerTrigram != null && data.iching.lowerTrigramName
                    ? `${data.iching.lowerTrigram} — ${data.iching.lowerTrigramName}`
                    : data.iching.lowerTrigramName
                }
              />
              {Array.isArray(data.iching.lines) && data.iching.lines.length === 6 && (
                <>
                  <Divider />
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#A0763A',
                      fontWeight: 600,
                      marginBottom: '0.35rem',
                    }}
                  >
                    As 6 Linhas (de baixo para cima)
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      gap: '4px',
                      alignItems: 'center',
                    }}
                  >
                    {data.iching.lines.map((yang, i) => (
                      <span
                        key={i}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          color: yang ? '#F4F5FF' : '#A0763A',
                          letterSpacing: '0.15em',
                        }}
                      >
                        {yang ? '———' : '— — —'}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <Divider />
              <Row label="Data de nascimento" value={data.iching.birthDate} />
              {data.iching.birthTime && <Row label="Hora" value={data.iching.birthTime} />}
              {data.iching.provisional && (
                <p style={{ fontSize: '0.6875rem', color: '#5C6691', marginTop: '0.25rem' }}>
                  * Cálculo provisório — hora de nascimento não informada.
                </p>
              )}
              <SignificadoEmbed
                significado={resolveSig('iching', data.iching.hexagramNumber)}
                color="#A0763A"
              />
            </>
          ) : (
            <Insight color="#A0763A">
              O hexagrama do seu Ori será calculado quando você completar o perfil. Forneça data e
              hora de nascimento para que o algoritmo determinístico (akasha.v0.0.4.trigramas-mod8)
              revele o trigrama superior e inferior do seu nascimento.
            </Insight>
          )}
        </InfoPanel>
      )}

      {activeLayer === null && (
        <p style={{ fontSize: '0.75rem', color: '#5C6691', textAlign: 'center' }}>
          Toque em uma camada para revelar seus dados e orientações práticas.
        </p>
      )}
    </div>
  );
}
