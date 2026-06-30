// ============================================================================
// /convite/[token] — Landing page do convite beta (Wave 32)
// ============================================================================// Server component que verifica o token no servidor e renderiza o estado
// adequado. Não retorna 404 se o token for inválido — mostra página com
// explicação amigável (mantém UX + LGPD Art. 9 — não vaza quais tokens
// existem).
//
// LGPD: email nunca aparece em tela; status SENT/OPENED/ACCEPTED não é
// distinguido aqui para não ajudar fingerprinting.
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { verifyInvite } from '@/lib/beta/invites';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WAVE_HEADLINE: Record<1 | 2 | 3, string> = {
  1: 'Você foi convidado(a) para a Onda Fundadores',
  2: 'Você foi convidado(a) para a Onda Comunidade',
  3: 'Você foi convidado(a) para a Onda Abertura',
};

const WAVE_BENEFITS: Record<1 | 2 | 3, string[]> = {
  1: [
    'Acesso vitalício ao espaço, mesmo após o fim da beta',
    'Reconhecimento como founding member (opt-in)',
    'Influência direta no roadmap (encontros mensais)',
  ],
  2: [
    'Acesso completo à comunidade durante toda a beta',
    'Onboarding guiado com a Akasha IA',
    'Círculos de partilha e mentorias entre pares',
  ],
  3: [
    'Acesso completo ao portal durante a beta',
    'Onboarding em 1 passo',
    'Comunidade ativa com curadoria humana + IA',
  ],
};

export const metadata: Metadata = {
  title: 'Seu convite beta · Akasha Portal',
  description: 'Aceite seu convite para entrar na beta da Cabala dos Caminhos.',
  robots: { index: false, follow: false }, // não indexar landing pages privadas
};

interface PageProps {
  params: { token: string };
}

export default async function ConvitePage({ params }: PageProps) {
  const result = await verifyInvite(params.token);

  if (!result.ok) {
    return <InvalidInvite reason={result.reason} />;
  }

  const wave = result.invite.wave as 1 | 2 | 3;
  const expiresFmt = result.invite.expiresAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus:outline-none min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950"
    >
      <article className="card-spiritual max-w-lg w-full rounded-2xl p-6 sm:p-8 text-slate-100">
        <div className="text-xs uppercase tracking-widest text-amber-300/90 mb-3">
          Onda {wave} · Convite beta
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl leading-tight text-amber-100 mb-4">
          {WAVE_HEADLINE[wave]}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
          A Cabala dos Caminhos é um espaço de partilha entre praticantes e
          curiosos das mais diversas linguagens espirituais. Seu convite é
          pessoal e intransferível — válido até{' '}
          <strong className="text-amber-200">{expiresFmt}</strong>.
        </p>

        {result.expiredSoon && (
          <div
            role="alert"
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 mb-4"
          >
            ⚠️ Este convite expira em menos de 24 horas.
          </div>
        )}

        <h2 className="font-serif text-lg text-indigo-200 mt-6 mb-2">
          O que você ganha ao aceitar
        </h2>
        <ul className="space-y-2 text-sm sm:text-base text-slate-200 mb-6 list-disc pl-5">
          {WAVE_BENEFITS[wave].map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>

        <Link
          href={`/signup?invite=${encodeURIComponent(params.token)}`}
          className="spiritual-btn-primary block text-center w-full px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Aceitar meu convite
        </Link>

        <p className="text-xs text-slate-400 mt-4 text-center">
          Ao aceitar, você concorda com os{' '}
          <Link href="/terms" className="underline hover:text-amber-300">
            termos de uso
          </Link>{' '}
          e a{' '}
          <Link href="/privacy" className="underline hover:text-amber-300">
            política de privacidade
          </Link>
          .
        </p>
      </article>
    </main>
  );
}

// ---------------------------------------------------------------------------
// InvalidInvite — caso o token não seja válido
// ---------------------------------------------------------------------------

function InvalidInvite({ reason }: { reason: string }) {
  const reasonText: Record<string, { title: string; body: string }> = {
    not_found: {
      title: 'Convite não encontrado',
      body: 'Este link de convite não existe ou já foi removido. Se você esperava um convite, verifique se copiou o link completo do email.',
    },
    invalid_token: {
      title: 'Link inválido',
      body: 'O link de convite está malformado. Tente copiar e colar novamente a partir do email.',
    },
    expired: {
      title: 'Convite expirado',
      body: 'Este convite já passou do prazo de validade. Entre em contato com quem te convidou para emitir um novo.',
    },
    revoked: {
      title: 'Convite revogado',
      body: 'Este convite foi cancelado pelo administrador. Se acredita que houve um engano, entre em contato.',
    },
    consumed: {
      title: 'Convite já utilizado',
      body: 'Este convite já foi aceito e a conta está ativa. Se você não criou uma conta com este email, entre em contato com o suporte.',
    },
  };

  const copy = reasonText[reason] ?? {
    title: 'Convite indisponível',
    body: 'Não foi possível validar seu convite. Tente novamente ou solicite um novo.',
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="focus:outline-none min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-950 to-slate-900"
    >
      <article className="card-spiritual max-w-md w-full rounded-2xl p-6 sm:p-8 text-slate-100 text-center">
        <div className="text-4xl mb-3" aria-hidden>
          🔒
        </div>
        <h1 className="font-serif text-xl sm:text-2xl text-amber-100 mb-2">
          {copy.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
          {copy.body}
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2 rounded-xl border border-slate-700 hover:border-amber-400 text-sm transition-colors"
        >
          Voltar ao início
        </Link>
      </article>
    </main>
  );
}