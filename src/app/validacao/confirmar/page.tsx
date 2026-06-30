// ============================================================================
// /validacao/confirmar — Confirmação de email da waitlist (Wave 32, 2026-06-30)
// ============================================================================
// Page simples que chama PATCH /api/waitlist (action=confirm) com o token do
// query string. Mostra feedback inline (sucesso / erro / expirado).
//
// Tom: acolhedor — o usuário acabou de clicar no link do email, então já
// está engajado. Reforçamos o próximo passo (explorar enquanto espera).
// ============================================================================

import type { Metadata } from 'next';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ConfirmClient } from './ConfirmClient';

export const metadata: Metadata = {
  title: 'Confirmar email — Akasha Portal',
  description: 'Confirme seu email para garantir sua posição na fila do beta.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ email?: string; token?: string }>;
}

export default async function ConfirmarPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const email = sp.email ?? '';
  const token = sp.token ?? '';

  if (!email || !token) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-5 py-10">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-amber-400 mb-4" aria-hidden />
          <h1 className="text-2xl font-cinzel mb-3">Link inválido</h1>
          <p className="text-sm text-slate-400 mb-6">
            Esse link de confirmação está incompleto. Verifique se você copiou
            o endereço inteiro do email.
          </p>
          <a
            href="/validacao"
            className="inline-flex h-11 items-center justify-center px-5 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400 transition"
          >
            Voltar para a landing
          </a>
        </div>
      </main>
    );
  }

  return <ConfirmClient email={email} token={token} />;
}