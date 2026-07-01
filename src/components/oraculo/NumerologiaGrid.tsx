'use client';

// ============================================================================
// NUMEROLOGIA GRID — Wave 29
// ============================================================================
// Grid responsivo dos números cabalísticos/numéricos principais.
// Mobile-first: 1 coluna no mobile, 2-3 colunas no tablet/desktop.
//
// Cada número:
//   - Valor grande + nome legível
//   - Palavra-chave
//   - Descrição curta
//   - Positivo / negativo (ou só factos)
// ============================================================================

import { MapaNumerológico } from '@/lib/oraculo/numerologia';

interface NumberBlock {
  label: string;
  value: number;
  keyword: string;
  description?: string;
  span?: 'wide' | 'narrow';
}

interface NumerologiaGridProps {
  mapa: MapaNumerológico;
}

export function NumerologiaGrid({ mapa }: NumerologiaGridProps) {
  // Descrições curtas (vindas do engine)
  const blank = (n: number) => `— ${n} —`;
  const blocks: NumberBlock[] = [
    {
      label: 'Caminho de vida',
      value: mapa.caminhoDeVida,
      keyword: '',
      span: 'wide',
    },
    {
      label: 'Expressão',
      value: mapa.expressão,
      keyword: '',
      span: 'narrow',
    },
    {
      label: 'Motivação (alma)',
      value: mapa.motivação,
      keyword: '',
      span: 'narrow',
    },
    {
      label: 'Personalidade',
      value: mapa.personalidade,
      keyword: '',
      span: 'narrow',
    },
    {
      label: 'Dia nascimento',
      value: mapa.diaNascimento,
      keyword: '',
      span: 'narrow',
    },
    {
      label: 'Ano pessoal',
      value: mapa.anoPessoal,
      keyword: '',
      span: 'wide',
    },
  ];

  const isMaster = (n: number) => n === 11 || n === 22 || n === 33;

  return (
    <article
      className="flex flex-col gap-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 md:p-6"
      aria-label="Mapa numerológico"
    >
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-slate-50">
            🔢 Numerologia ({mapa.sistema})
          </h2>
          <p className="text-[11px] text-slate-400">
            Calculado {new Date(mapa.calculadoEm).toLocaleString('pt-BR')}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {blocks.map((b) => (
          <div
            key={b.label}
            className={`flex flex-col items-center gap-1 rounded-xl border bg-gradient-to-br p-3 text-center ${
              isMaster(b.value)
                ? 'border-amber-500/50 from-amber-900/30 to-amber-800/10 text-amber-100'
                : 'border-slate-700 from-slate-900/40 to-slate-950/40 text-slate-200'
            } ${
              b.span === 'wide' ? 'col-span-2' : 'col-span-1'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider opacity-70">
              {b.label}
            </span>
            <span className="font-heading text-3xl font-bold leading-none">
              {b.value}
            </span>
            {isMaster(b.value) && (
              <span className="text-[9px] uppercase tracking-wide text-amber-300">
                Master ✨
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Mapa cabalístico estrutural (10 sephirot) */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-3">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          🌳 Estrutura Cabalística (Árvore da Vida)
        </h3>

        <ul className="space-y-1 text-xs">
          {mapa.mapCabalistico.sephirot.map((s) => (
            <li
              key={s.número}
              className="flex items-center gap-2 border-b border-slate-800/40 pb-1 last:border-0"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-900/30 text-[10px] font-bold text-purple-200">
                {s.número}
              </span>
              <span className="flex-1 font-medium text-slate-200">
                {s.nome}{' '}
                <span className="text-[10px] text-slate-500">
                  ({s.nomeHebraico})
                </span>
              </span>
              <span className="text-[10px] text-slate-400">{s.título}</span>
              <span className="hidden text-[10px] text-amber-300 sm:inline">
                {s.planeta}
              </span>
            </li>
          ))}
        </ul>

        <details className="mt-3">
          <summary className="cursor-pointer text-[10px] font-medium text-purple-300">
            22 Paths (letras hebraicas ↔ Tarot)
          </summary>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-slate-400 md:grid-cols-3">
            {mapa.mapCabalistico.paths.map((p) => (
              <li key={p.número} className="rounded bg-slate-900/40 px-2 py-1">
                <span className="font-bold text-slate-200">{p.número}.</span> {p.letraHebraica} ·{' '}
                <span className="italic">{p.tarot}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>

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
    </article>
  );
}
