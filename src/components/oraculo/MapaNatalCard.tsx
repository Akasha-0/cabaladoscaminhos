'use client';

// ============================================================================
// MAPA NATAL CARD — Wave 29
// ============================================================================
// Card visual mobile-first que mostra:
//   • Signo solar (sempre)
//   • Signo lunar (com confidence badge)
//   • Ascendente (com aviso se ausente)
//   • Planetas (lista — vazia até efemérides)
//   • Avisos técnicos (honestos)
// Sem SVG complexo — emoji unicode e cor por elemento (fogo/terra/ar/água).
// ============================================================================

import { MapaNatal, SIGNOS } from '@/lib/oraculo/astrologia';

const ELEMENT_COLOR: Record<string, string> = {
  fogo: 'from-red-500/20 to-orange-500/10 border-red-500/40 text-red-100',
  terra: 'from-amber-700/20 to-yellow-700/10 border-amber-700/40 text-amber-100',
  ar: 'from-sky-500/20 to-blue-500/10 border-sky-500/40 text-sky-100',
  água: 'from-blue-700/20 to-cyan-700/10 border-blue-700/40 text-blue-100',
};

const PLANETA_ICON: Record<string, string> = {
  Sol: '☉',
  Lua: '☽',
  Mercúrio: '☿',
  Vênus: '♀',
  Marte: '♂',
  Júpiter: '♃',
  Saturno: '♄',
  Urano: '♅',
  Netuno: '♆',
  Plutão: '♇',
};

function getSignoColor(nome: string): string {
  const s = SIGNOS.find((x) => x.nome === nome);
  if (!s) return 'border-slate-700 text-slate-300';
  return ELEMENT_COLOR[s.elemento] ?? 'border-slate-700 text-slate-300';
}

interface MapaNatalCardProps {
  mapa: MapaNatal;
  /** Optional Akashic IA commentary (markdown-ish short text) */
  commentary?: string;
}

export function MapaNatalCard({ mapa, commentary }: MapaNatalCardProps) {
  const signosPresentes = [
    { label: 'Sol', value: mapa.signoSolar, emoji: '☉' },
    { label: 'Lua', value: mapa.signoLunar, emoji: '☽' },
    {
      label: 'Ascendente',
      value: mapa.ascendente,
      emoji: '↑',
      warning:
        mapa.ascendente.includes('desconhecido') ||
        mapa.ascendente.includes('sem'),
    },
  ];

  return (
    <article
      className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 md:p-6"
      aria-label="Mapa natal astrológico"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-slate-50">
            🌞 Mapa Natal
          </h2>
          <p className="text-[11px] text-slate-400">
            Tradição: {mapa.tradição} · Calculado {new Date(mapa.calculadoEm).toLocaleString('pt-BR')}
          </p>
        </div>
      </header>

      {/* Big 3 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {signosPresentes.map((s) => (
          <div
            key={s.label}
            className={`flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br p-4 ${getSignoColor(s.value)}`}
          >
            <span className="text-2xl" aria-hidden>
              {s.emoji}
            </span>
            <span className="text-[10px] uppercase tracking-wider opacity-80">
              {s.label}
            </span>
            <span className="font-heading text-base font-bold">{s.value}</span>
            {s.warning && (
              <span className="text-[9px] italic opacity-70 text-center">
                ⚠️ sem coordenadas
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Planetas (lista) */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Planetas
        </h3>
        {mapa.planetas.length === 0 ? (
          <p className="rounded-lg border border-amber-800/40 bg-amber-950/20 p-3 text-xs text-amber-200">
            ℹ️ Posição planetária ainda não calculada (requer integração com
            efemérides). Por padrão, esta engine devolve apenas signos. Para
            mapa completo com planetas, integre Swiss Ephemeris (offline) ou
            NASA JPL Horizons API.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {mapa.planetas.map((p) => (
              <li
                key={p.planeta}
                className={`flex items-center gap-2 rounded-lg border bg-slate-900/40 px-3 py-2 text-xs ${getSignoColor(p.signo)}`}
              >
                <span className="text-base" aria-hidden>
                  {PLANETA_ICON[p.planeta] ?? '✦'}
                </span>
                <span className="flex-1">
                  <span className="font-semibold">{p.planeta}</span> em {p.signo}
                  {p.grau !== undefined && ` (${p.grau.toFixed(1)}°)`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Aspectos */}
      {mapa.aspectos.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Aspectos
          </h3>
          <ul className="space-y-1 text-xs text-slate-300">
            {mapa.aspectos.map((a, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="rounded bg-purple-900/40 px-2 py-0.5 text-[10px] text-purple-200">
                  {a.tipo}
                </span>
                {a.planeta1} ↔ {a.planeta2} (orbe {a.orbe.toFixed(1)}°)
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Avisos */}
      {mapa.avisos.length > 0 && (
        <details className="rounded-lg border border-slate-800 bg-slate-900/30">
          <summary className="cursor-pointer p-3 text-xs font-medium text-amber-300">
            ⚠️ Avisos técnicos ({mapa.avisos.length})
          </summary>
          <ul className="space-y-1 p-3 pt-0 text-[11px] text-slate-300">
            {mapa.avisos.map((a, i) => (
              <li key={i} className="border-l-2 border-amber-700/40 pl-2">
                {a}
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Akashic commentary */}
      {commentary && (
        <section className="rounded-xl border border-purple-800/40 bg-gradient-to-br from-purple-950/40 to-slate-950/40 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
            ✨ Akashic IA
          </h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-100">
            {commentary}
          </p>
        </section>
      )}
    </article>
  );
}
