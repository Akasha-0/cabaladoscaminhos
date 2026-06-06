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
    preceitos?: string[];
    quizilas?: string[];
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

type Layer = 1 | 2 | 3 | 4;

const toXY = (angleDeg: number, r: number, cx = 200, cy = 200) => ({
  x: cx + r * Math.cos((angleDeg - 90) * Math.PI / 180),
  y: cy + r * Math.sin((angleDeg - 90) * Math.PI / 180),
});

const ZODIAC_SIGNS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const ZODIAC_NAMES = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];

const ELEMENT_COLORS: Record<string, string> = {
  fire: '#FB5781', earth: '#F0B429', air: '#7C5CFF', water: '#2DD4BF',
};
const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fogo', earth: 'Terra', air: 'Ar', water: 'Água',
};
const ELEMENT_GUIDANCE: Record<string, { balance: string; ritual: string }> = {
  fire: {
    balance: 'Elemento dominante Fogo — energia de ação, liderança e expansão. Para equilibrar: aterrar com práticas de Terra (corpo, natureza, alimentos raiz).',
    ritual: 'Ritual: banhos de ervas de terra (alecrim, patchouli), caminhar descalço, meditação com pedras.',
  },
  earth: {
    balance: 'Elemento dominante Terra — energia de estrutura, paciência e materialização. Para equilibrar: aquecer com Fogo (movimento, expressão, criatividade).',
    ritual: 'Ritual: dança livre, uso de cores vibrantes, incenso de canela ou cravo para ativar a chama interna.',
  },
  air: {
    balance: 'Elemento dominante Ar — energia mental, comunicação e movimento. Para equilibrar: ancorar com Água (emoção, intuição, descanso).',
    ritual: 'Ritual: banhos de água fria com pétalas de rosa, meditação aquática, chás calmantes.',
  },
  water: {
    balance: 'Elemento dominante Água — energia emocional, intuição e profundidade. Para equilibrar: estruturar com Terra (rotinas, corpo, alimentação consciente).',
    ritual: 'Ritual: caminhadas na natureza, dieta baseada em raízes e tubérculos, pedras de jaspe ou hematita.',
  },
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
  1: { desc: 'Corpo da Alma', challenge: 'Encontrar propósito humilde', activate: 'Meditação Ong Namo' },
  2: { desc: 'Mente Negativa', challenge: 'Discernir sem paralisar', activate: 'Respiração de fogo' },
  3: { desc: 'Mente Positiva', challenge: 'Confiar no processo', activate: 'Sat Kriya — 3 min' },
  4: { desc: 'Mente Neutra', challenge: 'Observar sem reagir', activate: 'Meditação do coração' },
  5: { desc: 'Corpo Físico', challenge: 'Encarnar totalmente', activate: 'Movimento consciente' },
  6: { desc: 'Linha do Arco', challenge: 'Proteger o campo áurico', activate: 'Ser humano íntegro' },
  7: { desc: 'Aura', challenge: 'Expandir sem dissolver', activate: 'Projeção e Proteção' },
  8: { desc: 'Corpo Prânico', challenge: 'Sustentar a vitalidade', activate: 'Pranayama diário' },
  9: { desc: 'Corpo Sutil', challenge: 'Escutar o infinalível', activate: 'Escuta da intuição' },
  10: { desc: 'Corpo Radiante', challenge: 'Brilhar corajosamente', activate: 'Ação corajosa cotidiana' },
  11: { desc: 'Mente Divina', challenge: 'Manter-se aberto ao infinito', activate: 'Gratidão e rendição' },
};

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = toXY(startDeg, r, cx, cy);
  const end = toXY(endDeg, r, cx, cy);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function dominantElement(balance: { fire: number; earth: number; air: number; water: number }): string {
  const entries = Object.entries(balance) as [string, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

export default function MandalaChart({ data }: Props) {
  const [activeLayer, setActiveLayer] = useState<null | Layer>(null);

  const opacity = (layer: Layer) =>
    activeLayer === null ? 1 : activeLayer === layer ? 1 : 0.3;

  const astroSegments = ZODIAC_SIGNS.map((sym, i) => {
    const startDeg = i * 30;
    const endDeg = (i + 1) * 30;
    const midDeg = startDeg + 15;
    const labelPos = toXY(midDeg, 190);
    return { sym, name: ZODIAC_NAMES[i], startDeg, endDeg, midDeg, labelPos };
  });

  const planetDots = data.astrology.planets.map((p) => ({
    ...p,
    pos: toXY((p.degree / 360) * 360, 178),
  }));

  const tantricNodes = Array.from({ length: 11 }, (_, i) => {
    const angleDeg = i * (360 / 11);
    const pos = toXY(angleDeg, 138);
    const body = data.tantra.bodies.find((b) => b.index === i + 1);
    const wisdom = TANTRIC_BODY_WISDOM[i + 1];
    return { i, angleDeg, pos, active: body?.active ?? true, label: i + 1, name: wisdom?.desc ?? `Corpo ${i + 1}` };
  });

  const kabVerts = [
    { angleDeg: 0, value: data.kabala.lifePath, master: data.kabala.lifePathMaster, label: 'VP' },
    { angleDeg: 120, value: data.kabala.expression, master: data.kabala.expressionMaster, label: 'EX' },
    { angleDeg: 240, value: data.kabala.motivation, master: false, label: 'MO' },
  ].map((v) => ({ ...v, pos: toXY(v.angleDeg, 80) }));

  const trianglePath = `M ${kabVerts[0].pos.x} ${kabVerts[0].pos.y} L ${kabVerts[1].pos.x} ${kabVerts[1].pos.y} L ${kabVerts[2].pos.x} ${kabVerts[2].pos.y} Z`;

  const elem = dominantElement(data.astrology.elementalBalance);
  const inactiveBodies = tantricNodes.filter((n) => !n.active);
  const lpMeaning = LIFE_PATH_MEANINGS[data.kabala.lifePath ?? 0] ?? null;
  const elemGuidance = ELEMENT_GUIDANCE[elem] ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '100%', maxWidth: 460 }}>
      <style>{`
        @keyframes pulse-ori { 0%,100%{opacity:0.65;} 50%{opacity:1;} }
        @keyframes spin-ring { from{transform-origin:200px 200px;transform:rotate(0deg);} to{transform-origin:200px 200px;transform:rotate(360deg);} }
        .mandala-pulse { animation: pulse-ori 3s ease-in-out infinite; }
      `}</style>

      {/* Layer selector */}
      <div className="flex gap-2 flex-wrap justify-center">
        {([
          { layer: 4 as Layer, label: 'Astrologia', color: '#7C5CFF' },
          { layer: 3 as Layer, label: 'Tântrica', color: '#2DD4BF' },
          { layer: 2 as Layer, label: 'Cabala', color: '#7C5CFF' },
          { layer: 1 as Layer, label: 'Odus', color: '#F0B429' },
        ] as const).map(({ layer, label, color }) => (
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
            {label}
          </button>
        ))}
      </div>

      <svg
        viewBox="0 0 400 400"
        width="100%"
        style={{ maxWidth: 400 }}
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
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="200" cy="200" r="200" fill="url(#bgGrad)" />

        {/* Faint cross-layer synergy lines */}
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const outer = toXY(deg, 178);
          const inner = toXY(deg, 80);
          return (
            <line
              key={i}
              x1={outer.x} y1={outer.y}
              x2={inner.x} y2={inner.y}
              stroke="rgba(45,212,191,0.08)"
              strokeWidth="0.5"
              strokeDasharray="3 5"
            />
          );
        })}

        {/* ── Layer 4 — Astrological Ring ── */}
        <g opacity={opacity(4)} onClick={() => setActiveLayer(activeLayer === 4 ? null : 4)} style={{ cursor: 'pointer' }}>
          <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(124,92,255,0.12)" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(124,92,255,0.12)" strokeWidth="0.5" />
          {astroSegments.map(({ startDeg, endDeg, sym, labelPos }, i) => (
            <g key={i}>
              <path
                d={describeArc(200, 200, 183, startDeg, endDeg)}
                fill="none"
                stroke="rgba(38,48,79,0.7)"
                strokeWidth="1"
              />
              <text
                x={labelPos.x} y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fill="#5C6691"
              >
                {sym}
              </text>
            </g>
          ))}
          {/* Planet dots */}
          {planetDots.map((p, i) => (
            <g key={i} filter="url(#glow-akasha)">
              <circle cx={p.pos.x} cy={p.pos.y} r="3.5" fill="#7C5CFF" opacity="0.9" />
            </g>
          ))}
          {/* Ring label */}
          <text x="200" y="14" textAnchor="middle" fontSize="7" fill="rgba(124,92,255,0.5)" letterSpacing="2">ASTROLOGIA</text>
        </g>

        {/* ── Layer 3 — Tantric Web ── */}
        <g opacity={opacity(3)} onClick={() => setActiveLayer(activeLayer === 3 ? null : 3)} style={{ cursor: 'pointer' }}>
          <circle cx="200" cy="200" r="138" fill="none" stroke="rgba(45,212,191,0.15)" strokeWidth="1" strokeDasharray="3 4" />
          {/* Web lines between nodes */}
          {tantricNodes.map(({ pos }, i) => {
            const next = tantricNodes[(i + 1) % 11];
            return (
              <line
                key={i}
                x1={pos.x} y1={pos.y}
                x2={next.pos.x} y2={next.pos.y}
                stroke="rgba(45,212,191,0.1)"
                strokeWidth="0.5"
              />
            );
          })}
          {tantricNodes.map(({ pos, active, label }, i) => (
            <g key={i}>
              {!active && (
                <circle cx={pos.x} cy={pos.y} r="10" fill="rgba(251,87,129,0.12)" />
              )}
              <circle
                cx={pos.x} cy={pos.y} r={active ? 6 : 7}
                fill={active ? '#2DD4BF' : '#FB5781'}
                opacity={active ? 0.9 : 0.75}
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
          <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(124,92,255,0.2)" strokeWidth="1" strokeDasharray="2 3" />
          <path
            d={trianglePath}
            fill="rgba(124,92,255,0.05)"
            stroke="#7C5CFF"
            strokeWidth="1.5"
            opacity="0.8"
          />
          {kabVerts.map(({ pos, value, master }, i) => (
            <g key={i}>
              {master && (
                <circle cx={pos.x} cy={pos.y} r="14"
                  fill="none" stroke="#9D86FF" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />
              )}
              <circle
                cx={pos.x} cy={pos.y} r="11"
                fill="rgba(124,92,255,0.18)"
                stroke="#7C5CFF"
                strokeWidth="1.2"
              />
              <text
                x={pos.x} y={pos.y}
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

        {/* ── Layer 1 — Odus Core ── */}
        <g opacity={opacity(1)} onClick={() => setActiveLayer(activeLayer === 1 ? null : 1)} style={{ cursor: 'pointer' }}>
          {/* Ori glow */}
          <circle cx="200" cy="200" r="40" fill="url(#oriGlow)" className="mandala-pulse" />
          <circle cx="200" cy="200" r="34" fill="rgba(240,180,41,0.08)" stroke="#F0B429" strokeWidth="1.5" className="mandala-pulse" />
          <circle cx="200" cy="200" r="7" fill="#F0B429" filter="url(#glow-akasha)" />
          <text x="200" y="216" textAnchor="middle" fontSize="6.5" fill="#F0B429" fontWeight="600">
            {data.odus.oduName.length > 16 ? data.odus.oduName.slice(0, 14) + '…' : data.odus.oduName}
          </text>
          {data.odus.orixaRegency[0] && (
            <text x="200" y="226" textAnchor="middle" fontSize="5.5" fill="rgba(240,180,41,0.65)">
              {data.odus.orixaRegency[0]}
            </text>
          )}
        </g>
      </svg>

      {/* === Info Panels === */}
      {activeLayer === 4 && (
        <InfoPanel color="#7C5CFF" title="Astrologia — O Céu" subtitle="Anel Cósmico · Camada 4">
          <Row label="Ascendente" value={data.astrology.ascendant} />
          <Row label="Meio do Céu" value={data.astrology.midheaven} />
          <Row label="Planeta dominante" value={data.astrology.dominantPlanet} />
          {data.astrology.planets.slice(0, 5).map((p) => (
            <Row key={p.name} label={p.name} value={`${p.sign} — casa ${p.house}`} />
          ))}
          <Divider />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(Object.entries(data.astrology.elementalBalance) as [string, number][]).map(([el, val]) => (
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
            ))}
          </div>
          {elemGuidance && (
            <>
              <Divider />
              <Insight color="#7C5CFF">{elemGuidance.balance}</Insight>
              <Insight color="#2DD4BF">{elemGuidance.ritual}</Insight>
            </>
          )}
        </InfoPanel>
      )}

      {activeLayer === 3 && (
        <InfoPanel color="#2DD4BF" title="Numerologia Tântrica — Os 11 Corpos" subtitle="Teia de Conexão · Camada 3">
          <Row label="Caminho Tântrico" value={data.tantra.tantricPath} />
          <Row label="Alma" value={data.tantra.soul} />
          <Row label="Karma" value={data.tantra.karma} />
          <Row label="Dom Divino" value={data.tantra.divineGift} />
          <Divider />
          {inactiveBodies.length === 0 ? (
            <Insight color="#2DD4BF">Todos os 11 Corpos estão ativos — seu campo espiritual está em fluxo.</Insight>
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
        </InfoPanel>
      )}

      {activeLayer === 2 && (
        <InfoPanel color="#7C5CFF" title="Numerologia Cabalística — O Contrato de Alma" subtitle="Geometria Interna · Camada 2">
          <Row label="Caminho de Vida" value={data.kabala.lifePath} master={data.kabala.lifePathMaster} />
          <Row label="Expressão" value={data.kabala.expression} master={data.kabala.expressionMaster} />
          <Row label="Motivação" value={data.kabala.motivation} />
          <Row label="Ano Pessoal" value={data.kabala.personalYear} />
          {lpMeaning && (
            <>
              <Divider />
              <Insight color="#7C5CFF">{lpMeaning}</Insight>
            </>
          )}
        </InfoPanel>
      )}

      {activeLayer === 1 && (
        <InfoPanel color="#F0B429" title={`Odu: ${data.odus.oduName}`} subtitle="Núcleo — Ori · Camada 1">
          <Row label="Odu de Nascimento" value={`${data.odus.oduName}${data.odus.oduNumber ? ` (${data.odus.oduNumber})` : ''}`} />
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
              <p style={{ fontSize: '0.75rem', color: '#F0B429', fontWeight: 600, marginBottom: '0.35rem' }}>
                Preceitos do Odu
              </p>
              {data.odus.preceitos.map((p, i) => (
                <p key={i} style={{ fontSize: '0.8125rem', color: '#A7AECF' }}>✦ {p}</p>
              ))}
            </>
          )}
          {data.odus.quizilas && data.odus.quizilas.length > 0 && (
            <>
              <Divider />
              <p style={{ fontSize: '0.75rem', color: '#FB5781', fontWeight: 600, marginBottom: '0.35rem' }}>
                Quizilás (evitar)
              </p>
              {data.odus.quizilas.map((q, i) => (
                <p key={i} style={{ fontSize: '0.8125rem', color: '#A7AECF' }}>⚠ {q}</p>
              ))}
            </>
          )}
          {(!data.odus.preceitos || data.odus.preceitos.length === 0) && (
            <Insight color="#F0B429">
              As quizilás e preceitos específicos do seu Odu serão exibidos quando o Grimório for sincronizado.
              Consulte o Oráculo para orientação ancestral personalizada.
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

function InfoPanel({ color, title, subtitle, children }: {
  color: string; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'rgba(11,14,28,0.88)',
        border: `1px solid ${color}33`,
        backdropFilter: 'blur(12px)',
        borderRadius: '14px',
        padding: '1.25rem',
        width: '100%',
        maxWidth: 400,
      }}
    >
      <p style={{ fontSize: '0.6875rem', color, letterSpacing: '0.08em', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
        {subtitle}
      </p>
      <p style={{ fontFamily: 'var(--font-cinzel), serif', fontSize: '0.9375rem', color: '#F4F5FF', fontWeight: 600, marginBottom: '0.75rem' }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, master }: { label: string; value: string | number | null | undefined; master?: boolean }) {
  if (value === null || value === undefined) return null;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
      <span style={{ fontSize: '0.75rem', color: '#5C6691', minWidth: '120px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', color: '#F4F5FF' }}>
        {String(value)}{master && <span style={{ color: '#9D86FF', fontSize: '0.6875rem', marginLeft: 4 }}>★ Mestre</span>}
      </span>
    </div>
  );
}

function Insight({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: '0.8125rem',
        color: '#A7AECF',
        lineHeight: 1.6,
        borderLeft: `2px solid ${color}55`,
        paddingLeft: '0.75rem',
        marginTop: '0.25rem',
      }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid rgba(38,48,79,0.6)', margin: '0.5rem 0' }} />;
}
