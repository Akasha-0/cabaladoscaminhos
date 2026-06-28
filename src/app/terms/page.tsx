// ============================================================================
// /terms — Termos de Uso
// ============================================================================
// Esqueleto SEO (Wave 20 GTM Readiness 1/6). Copy completa fica para
// revisão jurídica dedicada antes da campanha de lançamento.
//
// Importante para:
//   - Trust signals do Google (página "terms" = YMYL credibility)
//   - App store / diretórios que exigem URL pública de termos
//   - Compliance com Marco Civil da Internet (Lei 12.965/2014)
// ============================================================================

import type { Metadata } from 'next';
import {
  buildPageMetadata,
  SeoJsonLd,
  breadcrumbLd,
} from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Termos de Uso — Akasha Portal',
  description:
    'Regras de uso da comunidade Akasha Portal: conduta, conteúdo, propriedade intelectual, limitação de responsabilidade e foro. Marco Civil da Internet (Lei 12.965/2014).',
  path: '/terms',
  category: 'home',
  priority: 0.4,
});

const SECTIONS = [
  {
    title: '1. Aceitação',
    body: 'Ao criar uma conta ou usar o Akasha Portal, você concorda com estes Termos e com a nossa Política de Privacidade. Se discordar, não use o serviço.',
  },
  {
    title: '2. Cadastro e segurança',
    body: 'Você é responsável por manter sua senha segura e por todas as ações realizadas na sua conta. Use autenticação em duas etapas sempre que possível.',
  },
  {
    title: '3. Conduta na comunidade',
    body: 'Respeito é inegociável. Proibido: assédio, discurso de ódio, spam, desinformação deliberada, proselitismo agressivo, conteúdo ilegal. Moderação é transparente e auditada.',
  },
  {
    title: '4. Seu conteúdo',
    body: 'Você mantém a propriedade dos posts, comentários e contribuições. Ao publicar, concede ao Akasha Portal uma licença não-exclusiva para exibir e distribuir esse conteúdo dentro da comunidade.',
  },
  {
    title: '5. Limitação de responsabilidade',
    body: 'O Akasha Portal é uma comunidade de compartilhamento, não um serviço de saúde, terapia ou orientação profissional. Não somos responsáveis por decisões tomadas com base em conteúdo da plataforma.',
  },
  {
    title: '6. Suspensão e encerramento',
    body: 'Podemos suspender contas que violem estes Termos, com notificação prévia quando cabível. Você pode encerrar sua conta a qualquer momento; dados serão tratados conforme a Política de Privacidade.',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SeoJsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Termos de Uso', path: '/terms' },
        ])}
      />

      <article className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <header className="mb-12">
          <p className="text-caps text-emerald-300 mb-3">Legal</p>
          <h1 className="text-display-5xl bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent mb-4">
            Termos de Uso
          </h1>
          <p className="text-caption text-slate-400 mb-2">
            Última atualização: 28 de junho de 2026
          </p>
          <p className="text-body text-slate-300 leading-relaxed">
            Estes Termos regem o uso do Akasha Portal. Leia com atenção.
          </p>
        </header>

        <section className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl text-slate-100 mb-2">{s.title}</h2>
              <p className="text-body text-slate-300 leading-relaxed">
                {s.body}
              </p>
            </section>
          ))}
        </section>

        <footer className="mt-12 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
          <p className="text-caption text-slate-400">
            Foro: Comarca de São Paulo / SP · Brasil. Marco Civil da Internet
            (Lei 12.965/2014) e LGPD (Lei 13.709/2018) aplicáveis.
          </p>
        </footer>
      </article>
    </main>
  );
}