// ============================================================================
// /reset-password — entry point
// ----------------------------------------------------------------------------
// Client form for consuming a w68 password-recovery token.
// Reads `?token=...` from URL, posts to /api/auth/reset-password.
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { authClient } from '@/lib/auth-pages/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const [token] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!tokenFromUrl) {
      setError('Token ausente. Solicite um novo link em /forgot-password.');
    }
  }, [tokenFromUrl]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError('Mínimo de 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (!token) {
      setError('Token inválido');
      return;
    }
    setIsLoading(true);
    const result = await authClient.resetPassword({ token, newPassword, confirmPassword });
    setIsLoading(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push('/login'), 2500);
  };

  return (
    <AuthShell
      title="Nova Senha"
      subtitle="Defina uma senha forte"
    >
      {success ? (
        <div className="space-y-4 text-center" data-testid="reset-success">
          <div
            aria-hidden="true"
            className="
              mx-auto w-14 h-14 rounded-full
              bg-gradient-to-br from-emerald-500/20 to-emerald-700/20
              flex items-center justify-center
            "
          >
            <span className="text-2xl text-emerald-300">✓</span>
          </div>
          <p className="text-sm text-foreground/90">Senha redefinida com sucesso!</p>
          <p className="text-xs text-muted-foreground">Redirecionando para o login…</p>
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
              htmlFor="newPassword"
              className="block font-cinzel text-[10px] uppercase tracking-[0.2em] text-[var(--spiritual-gold,#D4AF37)]"
            >
              Nova senha
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading || !token}
              className="
                w-full min-h-[44px] rounded-lg
                border border-white/10 bg-white/5
                px-3 py-2 text-sm text-foreground
                placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
                disabled:opacity-50
              "
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block font-cinzel text-[10px] uppercase tracking-[0.2em] text-[var(--spiritual-gold,#D4AF37)]"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || !token}
              className="
                w-full min-h-[44px] rounded-lg
                border border-white/10 bg-white/5
                px-3 py-2 text-sm text-foreground
                placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
                disabled:opacity-50
              "
              placeholder="Repita a nova senha"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
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
            {isLoading ? 'Salvando…' : 'Salvar nova senha'}
          </button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            <Link href="/forgot-password" className="text-[var(--spiritual-gold,#D4AF37)] hover:underline">
              Solicitar novo link
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
