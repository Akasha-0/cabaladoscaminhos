// ============================================================================
// /newsletter — signup público + preview do último digest (Wave 14, 2026-06-27)
// ============================================================================
// Form de assinatura (email + tradições + frequência) e preview do último
// digest enviado. Server component que pré-renderiza o preview do último
// Newsletter enviado. Form de signup é client component (sign-up-form.tsx).
// ============================================================================

import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { NewsletterSignupForm } from './signup-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Newsletter · Cabala dos Caminhos',
  description:
    'Receba semanalmente um digest com os melhores posts e artigos da comunidade Akasha.',
};

// ============================================================================
// Tradições disponíveis (alinhado com Group.tradition)
// ============================================================================

const TRADITIONS = [
  { slug: 'cabala', label: 'Cabala' },
  { slug: 'ifa', label: 'Ifá' },
  { slug: 'tantra', label: 'Tantra' },
  { slug: 'xamanismo', label: 'Xamanismo' },
  { slug: 'reiki', label: 'Reiki' },
  { slug: 'ayurveda', label: 'Ayurveda' },
  { slug: 'umbanda', label: 'Umbanda' },
  { slug: 'meditacao', label: 'Meditação' },
  { slug: 'cristianismo-mistico', label: 'Cristianismo Místico' },
  { slug: 'sufismo', label: 'Sufismo' },
];

// ============================================================================
// Page
// ============================================================================

export default async function NewsletterPage() {
  const lastDigest = await prisma.newsletter.findFirst({
    where: { sentAt: { not: null } },
    orderBy: { sentAt: 'desc' },
    select: {
      id: true,
      subject: true,
      contentMarkdown: true,
      sentAt: true,
      recipientCount: true,
    },
  });

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-spiritual-gold/80">
          Digest semanal
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Caminhos da semana
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Toda segunda-feira, um digest com os melhores posts e artigos da
          comunidade. Escolha suas tradições de interesse — você pode mudar
          quando quiser.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <NewsletterSignupForm traditions={TRADITIONS} />
      </section>

      {lastDigest && (
        <section className="mt-12">
          <header className="mb-4 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl text-foreground">
              Último digest enviado
            </h2>
            <p className="text-xs text-muted-foreground">
              {lastDigest.sentAt &&
                new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }).format(lastDigest.sentAt)}{' '}
              · {lastDigest.recipientCount} destinatários
            </p>
          </header>
          <article className="rounded-2xl border border-border bg-card/60 p-6">
            <h3 className="font-serif text-xl text-spiritual-gold">
              {lastDigest.subject}
            </h3>
            <pre className="mt-4 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90">
              {lastDigest.contentMarkdown}
            </pre>
          </article>
        </section>
      )}
    </main>
  );
}
