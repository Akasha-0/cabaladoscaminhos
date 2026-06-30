import Link from 'next/link';
import { Sparkles, Sun, Hash, Layers, Compass } from 'lucide-react';

export const metadata = {
  title: 'Oráculo · Cabala dos Caminhos',
  description:
    'Mapas oraculares de autoconhecimento profundo: astrologia, numerologia e mapa integrado.',
};

const FEATURES = [
  {
    href: '/oraculo/astrologia',
    icon: Sun,
    titulo: 'Mapa Natal Astrológico',
    descrição:
      'Signo solar, lunar e ascendente a partir da sua data, hora e local de nascimento.',
    cor: 'from-amber-500/20 to-orange-500/10 border-amber-500/40',
  },
  {
    href: '/oraculo/numerologia',
    icon: Hash,
    titulo: 'Numerologia Cabalística',
    descrição:
      'Caminho de vida, expressão, motivação e ano pessoal — Pitagórica, Caldeia ou Cabalística.',
    cor: 'from-purple-500/20 to-violet-500/10 border-purple-500/40',
  },
  {
    href: '/oraculo/mapa-completo',
    icon: Layers,
    titulo: 'Mapa Integrado',
    descrição:
      'Combina astrologia + numerologia + tradição preferida. Akashic IA interpreta em profundidade.',
    cor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40',
    destaque: true,
  },
];

export default function OraculoHubPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <header className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/30 via-purple-500/20 to-emerald-500/30 ring-2 ring-amber-400/40">
            <Sparkles className="h-7 w-7 text-amber-300" aria-hidden />
          </div>
          <h1 className="font-heading text-3xl font-bold text-amber-100 md:text-4xl">
            Oráculo
          </h1>
          <p className="max-w-md text-sm text-slate-300">
            Mapas oraculares de autoconhecimento profundo. Astrologia,
            numerologia e cruzamentos — com interpretação Akashic IA.
          </p>
        </header>

        {/* Ethics banner */}
        <div className="mb-8 rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 text-xs text-amber-100">
          <p>
            <Compass className="mr-1 inline h-4 w-4 text-amber-300" aria-hidden />
            <strong>Universalia:</strong> respeitamos múltiplas tradições. Cada mapa cita fontes.
            <strong> Nunca prescrevemos</strong> — sempre sugerimos consultar
            astrólogo profissional, terapeuta ou líder espiritual qualificado.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className={`group relative flex flex-col gap-3 rounded-2xl border bg-gradient-to-br p-5 transition hover:scale-[1.02] hover:shadow-lg ${f.cor}`}
            >
              {f.destaque && (
                <span className="absolute -top-2 right-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                  Recomendado
                </span>
              )}
              <f.icon className="h-6 w-6 text-amber-200 transition group-hover:text-amber-100" />
              <h2 className="font-heading text-base font-semibold text-slate-50">
                {f.titulo}
              </h2>
              <p className="text-xs text-slate-300">{f.descrição}</p>
              <span className="mt-auto text-[10px] text-amber-300 group-hover:text-amber-200">
                Começar →
              </span>
            </Link>
          ))}
        </div>

        {/* Citation */}
        <footer className="mt-10 border-t border-slate-800 pt-6 text-[11px] italic text-slate-500">
          Tradições: Pitágoras (~570 a.C.), Caldeia (~4000 anos), Árvore da Vida
          (Cabala hermética), Astrologia Tropical Ocidental. Wave 29 (2026-06-29).
        </footer>
      </div>
    </div>
  );
}
