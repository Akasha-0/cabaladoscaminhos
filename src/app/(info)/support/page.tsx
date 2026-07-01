// ============================================================================
// /support (info) — Public help center (Wave 37)
// ============================================================================
// Landing público: categorias, artigos populares, CTA para chat/ticket.
// Server component: zero JS unless user clicks "open chat".
// ============================================================================

import Link from 'next/link';

const CATEGORIES = [
  {
    title: 'Cobrança e Pagamentos',
    description: 'Reembolsos, faturas, métodos de pagamento.',
    href: '/support/faq/billing',
    icon: '💳',
  },
  {
    title: 'Conta e Acesso',
    description: 'Login, senha, 2FA, exclusão de conta (LGPD).',
    href: '/support/faq/account',
    icon: '👤',
  },
  {
    title: 'Comunidade e Moderação',
    description: 'Regras, denúncias, bloqueios, eventos.',
    href: '/support/faq/community',
    icon: '🤝',
  },
  {
    title: 'Técnico e Performance',
    description: 'Bugs, lentidão, erros de carregamento.',
    href: '/support/faq/technical',
    icon: '🛠️',
  },
  {
    title: 'Conteúdo e Curadoria',
    description: 'Artigos, traduções, denúncias de conteúdo.',
    href: '/support/faq/content',
    icon: '📜',
  },
  {
    title: 'Privacidade e LGPD',
    description: 'Seus direitos, exportação de dados, consentimento.',
    href: '/privacy',
    icon: '🔒',
  },
];

const POPULAR_ARTICLES = [
  { title: 'Como exportar seus dados (LGPD Art. 18)', href: '/support/kb/privacy/export-data' },
  { title: 'Política de reembolso em 30 dias', href: '/support/kb/billing/refund-policy' },
  { title: 'Como ativar autenticação em 2 fatores', href: '/support/kb/account/2fa' },
  { title: 'Regras de convivência na comunidade', href: '/support/kb/community/guidelines' },
  { title: 'Diferenças entre plano Free e Pro', href: '/support/kb/billing/free-vs-pro' },
];

export default function HelpCenterPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900">Como podemos ajudar?</h1>
        <p className="mt-3 text-lg text-slate-600">
          Encontre respostas rápidas ou fale com a gente.
        </p>
      </header>

      {/* Search bar (placeholder — wire to /api/help/search in W38) */}
      <div className="mx-auto mb-12 max-w-2xl">
        <label htmlFor="kb-search" className="sr-only">
          Buscar na central de ajuda
        </label>
        <input
          id="kb-search"
          type="search"
          placeholder="Buscar artigos, perguntas frequentes…"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base shadow-sm"
        />
      </div>

      {/* Categories grid */}
      <section aria-labelledby="cat-h2" className="mb-12">
        <h2 id="cat-h2" className="mb-4 text-2xl font-bold text-slate-900">
          Categorias
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-purple-300 hover:shadow-md"
              >
                <span className="text-3xl" aria-hidden>{c.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{c.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Popular articles */}
      <section aria-labelledby="pop-h2" className="mb-12">
        <h2 id="pop-h2" className="mb-4 text-2xl font-bold text-slate-900">
          Artigos populares
        </h2>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {POPULAR_ARTICLES.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="block px-4 py-3 text-slate-800 hover:bg-slate-50"
              >
                → {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Contact CTA */}
      <section
        aria-labelledby="cta-h2"
        className="rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-center text-white"
      >
        <h2 id="cta-h2" className="text-2xl font-bold">
          Não encontrou o que procurava?
        </h2>
        <p className="mt-2 text-purple-100">
          Nosso time está pronto para ajudar. Escolha o canal de sua preferência.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/support?new=1"
            className="rounded bg-white px-5 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-50"
          >
            Abrir um ticket
          </Link>
          <a
            href="mailto:suporte@cabaladoscaminhos.com.br"
            className="rounded border border-white/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Enviar email
          </a>
          <Link
            href="/status"
            className="rounded border border-white/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Status do serviço
          </Link>
        </div>
        <p className="mt-4 text-xs text-purple-200">
          Chat ao vivo disponível 9h-18h BRT · Resposta por email em até 48h
        </p>
      </section>
    </main>
  );
}