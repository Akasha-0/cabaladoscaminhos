// ============================================================================
// /feedback — formulário público de feedback (Wave 33)
// ============================================================================
// Server component renderiza shell + client form. LGPD: avisa sobre o que é
// coletado. Universalismo: tipografia legível, contraste AA, focus rings,
// labels grandes, navegação por teclado.
// ============================================================================

import type { Metadata } from 'next';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';

export const metadata: Metadata = {
  title: 'Feedback · Cabala dos Caminhos',
  description:
    'Conte para a equipe o que está funcionando, o que falta, ou relate um problema. Sua voz molda a próxima onda da plataforma.',
  robots: { index: true, follow: true },
};

export const dynamic = 'force-dynamic';

export default function FeedbackPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus:outline-none mx-auto max-w-3xl px-4 py-10 sm:py-14"
      aria-labelledby="feedback-title"
    >
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-spiritual-gold/80">
          Sua voz importa
        </p>
        <h1
          id="feedback-title"
          className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Feedback para a equipe
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Conte para nós o que está funcionando, o que falta, ou relate um problema.
          Toda mensagem vira um item na fila da equipe — respondemos em até 3 dias úteis.
        </p>
      </header>

      <section
        aria-labelledby="feedback-privacy"
        className="mb-8 rounded-xl border border-spiritual-gold/20 bg-spiritual-gold/5 p-5 text-sm text-muted-foreground"
      >
        <h2 id="feedback-privacy" className="mb-1 font-semibold text-foreground">
          🔒 Sua privacidade (LGPD)
        </h2>
        <ul className="ml-4 list-disc space-y-1">
          <li>Você pode enviar feedback anônimo (não pedimos email).</li>
          <li>
            Coletamos tipo da mensagem, conteúdo, URL atual e user-agent para
            reproduzir o problema. Nada de senhas ou dados financeiros.
          </li>
          <li>
            Limite de 3 mensagens por dia para evitar abuso. Logs expiram em 90 dias.
          </li>
          <li>
            Você pode pedir exclusão a qualquer momento via Configurações →
            Privacidade.
          </li>
        </ul>
      </section>

      <FeedbackForm />

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        <p>
          Outras formas de contato: <a href="/help" className="underline">Central de Ajuda</a>{' '}
          · <a href="mailto:ola@cabala.dos.caminhos" className="underline">Email</a>{' '}
          · <a href="/community" className="underline">Comunidade</a>
        </p>
      </footer>
    </main>
  );
}
