'use client';

// ============================================================================
// ASPECT WHEEL — Wave 29
// ============================================================================
// Roda SVG (300px) mostrando os signos do zodíaco ao redor do círculo e
// aspectos entre planetas (quando presentes) como linhas internas.
//
// Implementação:
//   • SVG puro, sem libs externas (TS-safe, sem deps).
//   • Mobile-first (300x300 fixo, centralizado, não quebrar layout).
//   • Sem planetas → mostra só zodiac wheel com aviso.
//   • Acessível: <title>, <desc>, aria-label, role="img".
// ============================================================================

import { Aspecto, PosiçãoPlanetária, SIGNOS } from '@/lib/oraculo/astrologia';

interface AspectWheelProps {
  /** Quando vazio, mostra roda sem aspectos */
  planetas?: PosiçãoPlanetária[];
  /** Aspectos pré-calculados */
  aspectos?: Aspecto[];
  /** Signo ascendente (opcional, marca linha do horizonte) */
  ascendente?: string;
  /** Size in px (default 300) */
  size?: number;
}

const ASPECT_COLOR: Record<string, string> = {
  conjunção: '#fbbf24', // amber
  oposição: '#f87171', // red
  trígono: '#34d399', // green
  quadratura: '#fb923c', // orange
  sextil: '#a78bfa', // violet
};

function rad(angleDeg: number): number {
  return ((angleDeg - 90) * Math.PI) / 180; // -90 = topo = Áries
}

export function AspectWheel({
  planetas = [],
  aspectos = [],
  ascendente,
  size = 300,
}: AspectWheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 12;
  const rRing = rOuter - 36; // anel interno (área planetária)
  const rAspect = rRing - 50;

  // Posiciona signos no anel externo
  const signos = SIGNOS.map((s, i) => {
    const angle = (i / 12) * 360;
    const x = cx + rOuter * Math.cos(rad(angle));
    const y = cy + rOuter * Math.sin(rad(angle));
    const texto_x = cx + (rOuter - 18) * Math.cos(rad(angle));
    const texto_y = cy + (rOuter - 18) * Math.sin(rad(angle));
    return { s, x, y, texto_x, texto_y };
  });

  // Posiciona planetas (se houver)
  const planetaPos: Array<{
    planeta: PosiçãoPlanetária;
    x: number;
    y: number;
  }> = [];
  if (planetas.length > 0) {
    for (const p of planetas) {
      const signoIdx = SIGNOS.findIndex((s) => s.nome === p.signo);
      if (signoIdx < 0) continue;
      const angle = (signoIdx / 12) * 360 + (p.grau || 0);
      planetaPos.push({
        planeta: p,
        x: cx + rRing * Math.cos(rad(angle)),
        y: cy + rRing * Math.sin(rad(angle)),
      });
    }
  }

  // Ascendente line
  const ascLine =
    ascendente && !ascendente.includes('desconhecido')
      ? (() => {
          const signoIdx = SIGNOS.findIndex((s) => s.nome === ascendente);
          if (signoIdx < 0) return null;
          const angle = (signoIdx / 12) * 360;
          const x = cx + rRing * Math.cos(rad(angle));
          const y = cy + rRing * Math.sin(rad(angle));
          return { x, y };
        })()
      : null;

  return (
    <figure
      className="flex flex-col items-center gap-2"
      role="img"
      aria-label="Roda de aspectos astrológicos"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full"
      >
        <title>Roda de aspectos astrológicos</title>
        <desc>
          Visualização dos signos do zodíaco ao redor. Planetas internos e
          aspectos são mostrados quando disponíveis na engine.
        </desc>

        {/* Background */}
        <circle cx={cx} cy={cy} r={rOuter} fill="#0f172a" stroke="#334155" />

        {/* Signos (anel externo) */}
        {signos.map(({ s, texto_x, texto_y }) => (
          <g key={s.nome}>
            <text
              x={texto_x}
              y={texto_y}
              fill="#cbd5e1"
              fontSize={size * 0.04}
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ textShadow: '0 0 6px rgba(0,0,0,0.6)' }}
            >
              {s.nome.slice(0, 3)}
            </text>
          </g>
        ))}

        {/* Divisões entre signos */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * 360;
          const x1 = cx + rOuter * Math.cos(rad(angle));
          const y1 = cy + rOuter * Math.sin(rad(angle));
          const x2 = cx + (rOuter - 8) * Math.cos(rad(angle));
          const y2 = cy + (rOuter - 8) * Math.sin(rad(angle));
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#475569"
              strokeWidth={1}
            />
          );
        })}

        {/* Aspectos (linhas internas) */}
        {aspectos.map((a, i) => {
          const p1 = planetaPos.find((p) => p.planeta.planeta === a.planeta1);
          const p2 = planetaPos.find((p) => p.planeta.planeta === a.planeta2);
          if (!p1 || !p2) return null;
          return (
            <line
              key={`${a.planeta1}-${a.planeta2}-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={ASPECT_COLOR[a.tipo] ?? '#94a3b8'}
              strokeWidth={1.5}
              strokeOpacity={0.7}
              strokeDasharray={a.tipo === 'quadratura' ? '4 2' : undefined}
            />
          );
        })}

        {/* Planetas (pontos) */}
        {planetaPos.map(({ planeta, x, y }) => (
          <g key={planeta.planeta}>
            <circle cx={x} cy={cy > 0 ? y : y} r={6} fill="#fbbf24" />
            <text
              x={x}
              y={y - 10}
              fill="#fbbf24"
              fontSize={size * 0.04}
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {planeta.planeta.slice(0, 3)}
            </text>
          </g>
        ))}

        {/* Linha do ascendente */}
        {ascLine && (
          <line
            x1={cx}
            y1={cy}
            x2={ascLine.x}
            y2={ascLine.y}
            stroke="#a78bfa"
            strokeWidth={2}
            strokeDasharray="2 2"
          />
        )}

        {/* Centro / Terra */}
        <circle cx={cx} cy={cy} r={4} fill="#94a3b8" />
        <text
          x={cx}
          y={cy + size * 0.06}
          fill="#64748b"
          fontSize={size * 0.03}
          textAnchor="middle"
        >
          Terra
        </text>
      </svg>

      {/* Aviso */}
      {planetas.length === 0 && (
        <figcaption className="max-w-md rounded-lg border border-amber-800/40 bg-amber-950/20 p-2 text-center text-[10px] text-amber-200">
          ℹ️ Roda mostra apenas signos — planetas requerem integração com
          efemérides (Swiss Ephemeris / NASA JPL).
        </figcaption>
      )}

      {/* Legenda */}
      {aspectos.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2 text-[10px]">
          {Array.from(new Set(aspectos.map((a) => a.tipo))).map((tipo) => (
            <li
              key={tipo}
              className="flex items-center gap-1 rounded bg-slate-900/60 px-2 py-1"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: ASPECT_COLOR[tipo] ?? '#94a3b8' }}
                aria-hidden
              />
              <span className="text-slate-300">{tipo}</span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
