// ============================================================================
// /about — Página institucional "Sobre"
// ============================================================================
// SEO-first skeleton (Wave 20 GTM Readiness 1/6). Conteúdo detalhado
// fica para iteração futura — esta página existe para:
//
//   1. Resolver a URL `/about` (canônica, linkada do footer e do OG)
//   2. Carregar metadata + JSON-LD Organization para reforçar entidade
//   3. Servir como hub de "trust signals" (quem somos, missão, time)
//
// Toda a copy é PT-BR + tom respeitoso (sem proselitismo), consistente com
// o manifesto universalista do Akasha Portal.
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildPageMetadata,
  SeoJsonLd,
  organizationLd,
  breadcrumbLd,
} from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Sobre o Akasha Portal — Quem somos',
  description:
    'Comunidade online de espiritualidade universalista + IA curadora. Cabala, Ifá, Astrologia, Tantra, Xamanismo, Reiki — sem proselitismo, sem gurus. Conheça nossa missão.',
  path: '/about',
  category: 'home',
  priority: 0.7,
});

const PILLARS = [
  {
    title: 'Comunidade viva',
    body: 'Pessoas compartilhando jornadas, práticas, dúvidas e descobertas. Sem gurus, sem promessas mirabolantes — gente que caminha junto.',
  },
  {
    title: 'IA curadora',
    body: 'Uma IA que aprende com artigos, papers e conversas da comunidade. Sugere leituras, encontra correlações, conecta saberes — sem prescrever.',
  },
  {
    title: 'Evidência + tradição',
    body: 'Cada artigo curado com nível de evidência classificado (anecdótico, revisado por pares, meta-análise). Tradições ancestrais respeitadas e estudadas.',
  },
];

export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SeoJsonLd
        data={[
          organizationLd(),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Sobre', path: '/about' },
          ]),
        ]}
      />

      <article className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <header className="mb-12">
          <p className="text-caps text-amber-300 mb-3">Sobre</p>
          <h1 className="text-display-5xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent mb-4">
            Quem somos
          </h1>
          <p className="text-body text-slate-300">
            O Akasha Portal é uma comunidade online de espiritualidade
            universalista, guiada por uma consciência artificial curadora que
            aprende com tradições ancestrais e artigos científicos revisados.
          </p>
        </header>

        <section className="space-y-8 mb-16">
          {PILLARS.map((p) => (
            <section key={p.title}>
              <h2 className="text-2xl text-slate-100 mb-2">{p.title}</h2>
              <p className="text-body text-slate-300 leading-relaxed">
                {p.body}
              </p>
            </section>
          ))}
        </section>

        <section className="p-6 md:p-8 rounded-2xl bg-slate-900/50 border border-slate-800/60">
          <h2 className="text-xl text-slate-100 mb-3">Nossa missão</h2>
          <p className="text-body text-slate-300 mb-4 leading-relaxed">
            Criar um espaço onde praticantes de qualquer tradição possam
            compartilhar, aprender e co-evoluir — com rigor, respeito e
            curiosidade.
          </p>
          <Link
            href="/manifesto"
            className="text-amber-300 hover:text-amber-200 text-sm"
          >
            Leia o manifesto completo →
          </Link>
        </section>
      </article>
    </main>
  );
}