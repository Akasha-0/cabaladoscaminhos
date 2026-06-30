// ============================================================================
// /forgot-password — entry point
// ----------------------------------------------------------------------------
// Client form embedded inline (small enough to not need a separate file).
// Uses the w68-backed /api/auth/forgot-password route via authClient.
// ============================================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { authClient } from '@/lib/auth-pages/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }
    setIsLoading(true);
    const result = await authClient.forgotPassword({ email });
    setIsLoading(false);
    if (!result.ok) {
      // Always show the success message (avoid email enumeration),
      // but for rate-limit we do surface it.
      if (result.error.code === 'RATE_LIMITED') {
        setError(result.error.message);
        return;
      }
      // Fall through — even on unknown error we show "sent" for security
    }
    setSent(true);
  };

  return (
    <AuthShell
      title="Recuperar Senha"
      subtitle="Vamos te enviar um link"
    >
      {sent ? (
        <div className="space-y-4 text-center" data-testid="forgot-success">
          <div
            aria-hidden="true"
            className="
              mx-auto w-14 h-14 rounded-full
              bg-gradient-to-br from-[var(--spiritual-gold,#D4AF37)]/20 to-[var(--spiritual-violet,#8B5CF6)]/20
              flex items-center justify-center
            "
          >
            <span className="text-2xl text-[var(--spiritual-gold,#D4AF37)]">✉</span>
          </div>
          <p className="text-sm text-foreground/90">
            Se o email existir em nossa base, você receberá um link para redefinir sua senha.
          </p>
          <p className="text-xs text-muted-foreground">
            Verifique também sua caixa de spam.
          </p>
          <Link
            href="/login"
            className="
              inline-block min-h-[44px] leading-[44px] px-6
              rounded-lg border border-[var(--spiritual-gold,#D4AF37)]/50
              text-sm text-[var(--spiritual-gold,#D4AF37)]
              hover:bg-[var(--spiritual-gold,#D4AF37)]/10 transition-colors
            "
          >
            Voltar para o login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block font-cinzel text-[10px] uppercase tracking-[0.2em] text-[var(--spiritual-gold,#D4AF37)]"
            >
              Email cadastrado
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="
                w-full min-h-[44px] rounded-lg
                border border-white/10 bg-white/5
                px-3 py-2 text-sm text-foreground
                placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
                disabled:opacity-50
              "
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full min-h-[48px] rounded-lg
              bg-gradient-to-r from-[var(--spiritual-gold-dark,#9A7B0A)] via-[var(--spiritual-gold,#C9A227)] to-[var(--spiritual-gold-light,#E6C35C)]
              text-black font-semibold tracking-wider font-cinzel text-sm
              shadow-[0_0_20px_rgba(212,175,55,0.3)]
              hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:brightness-110
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300
            "
          >
            {isLoading ? 'Enviando…' : 'Enviar link'}
          </button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Lembrou a senha?{' '}
            <Link href="/login" className="text-[var(--spiritual-gold,#D4AF37)] hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
