// ============================================================================
// /admin/newsletter — listar newsletters enviados + composer (Wave 14, 2026-06-27)
// ============================================================================
// Server component lista últimas newsletters + contagem de inscritos.
// Composer (enviar novo digest) é client component (composer.tsx).
// ============================================================================

import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { NewsletterComposer } from './composer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · Newsletter · Cabala dos Caminhos',
  robots: { index: false, follow: false },
};

const TRADITIONS = [
  { slug: 'cabala', label: 'Cabala' },
  { slug: 'ifa', label: 'Ifá' },
  { slug: 'tantra', label: 'Tantra' },
  { slug: 'xamanismo', label: 'Xamanismo' },
  { slug: 'reiki', label: 'Reiki' },
  { slug: 'ayurveda', label: 'Ayurveda' },
  { slug: 'umbanda', label: 'Umbanda' },
  { slug: 'meditacao', label: 'Meditação' },
];

export default async function AdminNewsletterPage() {
  const [newsletters, totalSubscribers, activeSubscribers, draftCount] =
    await Promise.all([
      prisma.newsletter.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          subject: true,
          contentMarkdown: true,
          traditionsFilter: true,
          sentAt: true,
          recipientCount: true,
          composedBy: true,
          createdAt: true,
        },
      }),
      prisma.newsletterSubscription.count(),
      prisma.newsletterSubscription.count({
        where: { unsubscribedAt: null, frequency: { not: 'NEVER' } },
      }),
      prisma.newsletter.count({ where: { sentAt: null } }),
    ]);

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-spiritual-gold/80">
          Admin
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground">
          Newsletter
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Compor e enviar digest semanal para a comunidade.
        </p>
      </header>

      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total de inscritos" value={totalSubscribers} />
        <Stat label="Ativos (recebem digest)" value={activeSubscribers} />
        <Stat label="Rascunhos" value={draftCount} />
      </section>

      <section className="mb-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="mb-4 font-serif text-xl text-foreground">
          Compor nova edição
        </h2>
        <NewsletterComposer traditions={TRADITIONS} />
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl text-foreground">
          Edições recentes
        </h2>
        {newsletters.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhuma edição enviada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {newsletters.map((n: any) => (
              <li key={n.id} className="p-4 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-serif text-lg text-foreground">
                    {n.subject}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {n.sentAt
                      ? `Enviado em ${new Intl.DateTimeFormat('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(n.sentAt)} · ${n.recipientCount} destinatários`
                      : 'Rascunho'}
                  </span>
                </div>
                {n.traditionsFilter.length > 0 && (
                  <p className="mt-1 text-xs text-spiritual-gold">
                    Filtro: {n.traditionsFilter.join(', ')}
                  </p>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {n.contentMarkdown.slice(0, 280)}…
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-3xl font-semibold text-spiritual-gold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
