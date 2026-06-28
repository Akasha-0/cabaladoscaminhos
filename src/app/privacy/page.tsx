// ============================================================================
// /privacy — Política de Privacidade (LGPD)
// ============================================================================
// Página institucional obrigatória para o Akasha Portal.
//
// Por que é parte do Wave 20 GTM Readiness 1/6:
//   - Google usa páginas "Privacy / Terms / About" como trust signals de
//     YMYL (Your Money Your Life) — espiritualidade pode cair nesse bucket
//   - LGPD Art. 9º exige política de privacidade acessível
//   - App Store / Google Play / listagens em diretórios exigem URL pública
//
// Copy completa fica para revisão jurídica dedicada (não escopo da onda).
// Esta página é o esqueleto SEO + placeholders claros sobre o que será
// preenchido. Atualizar antes de qualquer campanha paga.
// ============================================================================

import type { Metadata } from 'next';
import {
  buildPageMetadata,
  SeoJsonLd,
  breadcrumbLd,
} from '@/lib/seo/og';

export const metadata: Metadata = buildPageMetadata({
  title: 'Política de Privacidade — Akasha Portal (LGPD)',
  description:
    'Como o Akasha Portal coleta, usa, armazena e protege seus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).',
  path: '/privacy',
  category: 'home',
  priority: 0.4,
  // Privacidade é institucional e raramente muda; manter indexável mas
  // com prioridade baixa para não competir com conteúdo principal.
});

const SECTIONS = [
  {
    title: '1. Dados que coletamos',
    body: 'Coletamos dados de cadastro (nome, e-mail, data de nascimento para cálculo de mapa espiritual), dados de uso (páginas visitadas, interações na comunidade) e dados técnicos (IP hasheado, user agent).',
  },
  {
    title: '2. Como usamos',
    body: 'Para operar a comunidade, personalizar conteúdo, gerar sugestões da IA curadora, melhorar o produto e enviar comunicações que você autorizou (newsletter, notificações).',
  },
  {
    title: '3. Compartilhamento',
    body: 'Não vendemos seus dados. Compartilhamos apenas com fornecedores estritamente necessários (Supabase para banco, PostHog para analytics, Resend para e-mail) sob contratos de confidencialidade.',
  },
  {
    title: '4. Seus direitos (LGPD Art. 18)',
    body: 'Você pode solicitar acesso, correção, portabilidade, anonimização ou eliminação dos seus dados a qualquer momento. Use o formulário em /me/settings ou e-mail privacidade@cabaladoscaminhos.com.',
  },
  {
    title: '5. Retenção',
    body: 'Mantemos dados enquanto sua conta estiver ativa. Após exclusão, logs de auditoria são retidos por 12-24 meses conforme exigência legal (LGPD Art. 37).',
  },
  {
    title: '6. Cookies e rastreamento',
    body: 'Usamos cookies essenciais (sessão, segurança) e opcionais (analytics, preferências). Você pode gerenciar seu consentimento a qualquer momento pelo banner de cookies.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <SeoJsonLd
        data={breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Política de Privacidade', path: '/privacy' },
        ])}
      />

      <article className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <header className="mb-12">
          <p className="text-caps text-emerald-300 mb-3">Legal</p>
          <h1 className="text-display-5xl bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent mb-4">
            Política de Privacidade
          </h1>
          <p className="text-caption text-slate-400 mb-2">
            Última atualização: 28 de junho de 2026
          </p>
          <p className="text-body text-slate-300 leading-relaxed">
            Esta política descreve como o Akasha Portal trata seus dados
            pessoais, em conformidade com a Lei Geral de Proteção de Dados
            (LGPD, Lei 13.709/2018).
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
            Dúvidas? Fale com nosso DPO em{' '}
            <a
              href="mailto:privacidade@cabaladoscaminhos.com"
              className="text-amber-300 hover:text-amber-200"
            >
              privacidade@cabaladoscaminhos.com
            </a>
            .
          </p>
        </footer>
      </article>
    </main>
  );
}