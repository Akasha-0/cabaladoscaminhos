// ============================================================================
// /manifesto — Página de princípios da comunidade
// ============================================================================
// SEO-first skeleton (Wave 20 GTM Readiness 1/6). Página institucional
// que articula os valores do Akasha Portal. Importante para:
//
//   - SEO long-tail ("espiritualidade sem proselitismo", "comunidade plural")
//   - Trust signals em GSC (página "sobre" + "manifesto" + "privacidade"
//     é o trio que o Google usa para YMYL credibility scoring)
//   - Onboarding indireto: visitante lê, decide se a comunidade é pra ele
//
// Tom: respeitoso, universalista, sem proselitismo. PT-BR.
// ============================================================================

import type { Metadata } from 'next';
import {
  buildPageMetadata,
  SeoJsonLd,
  breadcrumbLd,
} from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Manifesto — Princípios do Akasha Portal',
  description:
    'Universalismo, respeito às tradições, evidência científica, transparência e cuidado. Os princípios que guiam o Akasha Portal — sem proselitismo, sem gurus.',
  path: '/manifesto',
  category: 'home',
  priority: 0.7,
});

const PRINCIPLES = [
  {
    n: '01',
    title: 'Universalismo sem proselitismo',
    body: 'Cada tradição tem seu valor. Não hierarquizamos caminhos, não convertemos praticantes. Sua jornada é sua.',
  },
  {
    n: '02',
    title: 'Evidência como bússola',
    body: 'Valorizamos papers revisados por pares, meta-análises e séries de casos bem desenhadas. Tradição é respeitada, mas não blindada da ciência.',
  },
  {
    n: '03',
    title: 'Transparência por padrão',
    body: 'Quando a IA erra, dizemos. Quando um moderador age, registramos. Quando algo muda, comunicamos. Sem caixas-pretas.',
  },
  {
    n: '04',
    title: 'Cuidado > escala',
    body: 'Preferimos 50 membros conscientes a 5.000 perdidos. Crescer é consequência de fazer bem feito, não o objetivo.',
  },
  {
    n: '05',
    title: 'IA co-evolui, não substitui',
    body: 'A curadora IA é uma ferramenta da comunidade, não sua dona. Quem decide é você, com informação.',
  },
];

export default function ManifestoPage() {
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SeoJsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Manifesto', path: '/manifesto' },
        ])}
      />

      <article className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <header className="mb-12">
          <p className="text-caps text-violet-300 mb-3">Manifesto</p>
          <h1 className="text-display-5xl bg-gradient-to-r from-violet-300 via-pink-300 to-violet-400 bg-clip-text text-transparent mb-4">
            Nossos princípios
          </h1>
          <p className="text-body text-slate-300 leading-relaxed">
            Cinco compromissos inegociáveis que guiam cada decisão técnica,
            editorial e comunitária do Akasha Portal.
          </p>
        </header>

        <ol className="space-y-8 mb-16">
          {PRINCIPLES.map((p) => (
            <li
              key={p.n}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60"
            >
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-amber-300 font-mono text-sm">{p.n}</span>
                <h2 className="text-xl text-slate-100">{p.title}</h2>
              </div>
              <p className="text-body text-slate-300 leading-relaxed">
                {p.body}
              </p>
            </li>
          ))}
        </ol>

        <footer className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-amber-500/10 border border-violet-500/20 text-center">
          <p className="text-body text-slate-200">
            “Caminhos diferentes, mesma direção: o despertar consciente.”
          </p>
        </footer>
      </article>
    </main>
  );
}