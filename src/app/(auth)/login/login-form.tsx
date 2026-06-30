'use client';

// ============================================================================
// LoginForm — client form for /login
// ----------------------------------------------------------------------------
// Uses the w68-backed /api/auth/login route via authClient.
// Mobile-first: full-width inputs, 44px+ touch targets, inline errors.
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient, type LoginInput } from '@/lib/auth-pages/client';

interface FieldErrors {
  email?: string;
  password?: string;
  totp?: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/feed';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [showTotp, setShowTotp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});
    if (!email.includes('@')) {
      setFieldErrors({ email: 'Email inválido' });
      return;
    }
    if (password.length === 0) {
      setFieldErrors({ password: 'Senha obrigatória' });
      return;
    }
    if (showTotp && !/^\d{6}$/.test(totp)) {
      setFieldErrors({ totp: 'Código deve ter 6 dígitos' });
      return;
    }

    setIsLoading(true);
    const input: LoginInput = { email, password, totp: showTotp ? totp : undefined };
    const result = await authClient.login(input);
    setIsLoading(false);

    if (!result.ok) {
      if (result.error.code === 'RATE_LIMITED') {
        setServerError(result.error.message);
        return;
      }
      if (result.error.message.toLowerCase().includes('totp')) {
        setShowTotp(true);
        setFieldErrors({ totp: result.error.message });
        return;
      }
      setServerError(result.error.message);
      return;
    }
    router.push(redirectTo);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {serverError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        >
          {serverError}
        </div>
      ) : null}

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block font-cinzel text-[10px] uppercase tracking-[0.2em] text-[var(--spiritual-gold,#D4AF37)]"
        >
          Email
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
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          className="
            w-full min-h-[44px] rounded-lg
            border border-white/10 bg-white/5
            px-3 py-2 text-sm text-foreground
            placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
            disabled:opacity-50
            aria-[invalid=true]:border-red-500/60
          "
          placeholder="seu@email.com"
        />
        {fieldErrors.email ? (
          <p id="email-error" className="text-xs text-red-300">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block font-cinzel text-[10px] uppercase tracking-[0.2em] text-[var(--spiritual-gold,#D4AF37)]"
          >
            Senha
          </label>
          <Link
            href="/forgot-password"
            className="text-[10px] text-muted-foreground hover:text-[var(--spiritual-gold,#D4AF37)] transition-colors"
          >
            Esqueceu?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            className="
              w-full min-h-[44px] rounded-lg
              border border-white/10 bg-white/5
              px-3 py-2 pr-12 text-sm text-foreground
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
              disabled:opacity-50
              aria-[invalid=true]:border-red-500/60
            "
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            disabled={isLoading}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              min-w-[44px] min-h-[44px] flex items-center justify-center
              text-muted-foreground hover:text-foreground transition-colors
              disabled:opacity-50
            "
          >
            {showPassword ? '✕' : '◉'}
          </button>
        </div>
        {fieldErrors.password ? (
          <p id="password-error" className="text-xs text-red-300">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      {/* TOTP (conditional) */}
      {showTotp ? (
        <div className="space-y-1.5">
          <label
            htmlFor="totp"
            className="block font-cinzel text-[10px] uppercase tracking-[0.2em] text-[var(--spiritual-gold,#D4AF37)]"
          >
            Código 2FA
          </label>
          <input
            id="totp"
            name="totp"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            autoComplete="one-time-code"
            value={totp}
            onChange={(e) => setTotp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.totp)}
            aria-describedby={fieldErrors.totp ? 'totp-error' : undefined}
            className="
              w-full min-h-[44px] rounded-lg
              border border-white/10 bg-white/5
              px-3 py-2 text-sm text-foreground tracking-[0.5em] text-center
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
              disabled:opacity-50
              aria-[invalid=true]:border-red-500/60
            "
            placeholder="000000"
          />
          {fieldErrors.totp ? (
            <p id="totp-error" className="text-xs text-red-300">
              {fieldErrors.totp}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Submit */}
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
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-black/70 animate-pulse" />
            Conectando…
          </span>
        ) : (
          'Entrar'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 py-2" aria-hidden="true">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* OAuth placeholder */}
      <button
        type="button"
        disabled
        className="
          w-full min-h-[48px] rounded-lg
          border border-white/10 bg-white/5
          text-sm text-foreground
          flex items-center justify-center gap-2
          opacity-60 cursor-not-allowed
        "
        aria-label="Continuar com Google (em breve)"
      >
        <span aria-hidden="true">G</span>
        <span>Continuar com Google</span>
        <span className="text-[10px] text-muted-foreground">(em breve)</span>
      </button>

      {/* Sign-up link */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        Não tem conta?{' '}
        <Link
          href="/signup"
          className="text-[var(--spiritual-gold,#D4AF37)] hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
