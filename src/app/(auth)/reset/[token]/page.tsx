// ============================================================================
// /reset/[token] — Reset de senha via token (Wave 93-B)
// ============================================================================
// Server component shell que valida o token via isValidResetToken (client-side)
// e renderiza ResetTokenForm (client island) com o token.
//
// Rota canonical W93-B. Substitui o fluxo legacy de /reset-password onde o
// token vinha via session cookie (mais complexo).
//
// Tokens inválidos → renderiza EmptyState didático + link "reenviar email"
// ============================================================================

import Link from 'next/link';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { ResetTokenForm } from './ResetTokenForm';
import { isValidResetToken } from '@/lib/w93/auth-integration';

export const metadata = {
  title: 'Redefinir senha · Akasha Portal',
  description: 'Defina uma nova senha para sua conta.',
};

interface ResetPageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetTokenPage({ params }: ResetPageProps) {
  const { token } = await params;

  // Validação server-side do token (defesa em profundidade)
  if (!isValidResetToken(token)) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div
          className="card-spiritual p-8 rounded-2xl max-w-md w-full text-center"
          role="alert"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/15 flex items-center justify-center mb-6">
            <KeyRound className="w-8 h-8 text-red-400" aria-hidden="true" />
          </div>
          <h1 className="font-cinzel text-xl font-bold tracking-wider mb-2 text-red-300">
            Token inválido
          </h1>
          <p className="text-sm text-muted-foreground font-serif leading-relaxed">
            Este link de redefinição é inválido ou expirou. Solicite um novo
            email de redefinição para continuar.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/forgot"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-lg bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light text-slate-900 font-cinzel tracking-wider font-bold hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition"
            >
              Solicitar novo link
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] text-sm text-muted-foreground hover:text-spiritual-gold transition-colors font-serif"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <ResetTokenForm token={token} />
    </main>
  );
}